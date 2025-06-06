import { useLocation } from "react-router-dom";
import { Grid } from "@mui/material";
import { memo, useMemo, useState, useCallback, useRef, useEffect } from "react";

import Card from "../components/Card.js";
import Plot from "../components/Plot.js";
import Dropdown from "../components/Dropdown.js";
import efsaConfigs, { organization } from "../config/EfsaConfig.js";
import useInit from "../utils/screen-init.js";
import { isValidArray, generateYearsArray, groupByKey } from "../utils/data-handling-functions.js";
import { cardFooter, LoadingIndicator, StickyBand, DataWarning } from "../utils/rendering-items.js";

const countries = ["Austria", "Belgium", "Bulgaria", "Croatia", "Denmark", "France", "Germany", "Greece", "Ireland", "Italy", "Lithuania", "Netherlands", "Poland", "Portugal", "Republic of north macedonia", "Romania", "Serbia", "Slovakia", "Spain", "Ukraine", "United kingdom"];

const Efsa = () => {
	const [selectedCountry, setSelectedCountry] = useState(countries[0]);
	console.log("Efsa selectedCountry:", selectedCountry);
	const [selectedContaminant, setSelectedContaminant] = useState("");
	const [selectedProduct, setSelectedProduct] = useState("");
	const [year, setYear] = useState("2021");

	const handleYearChange = useCallback((newValue) => {
		setYear(newValue.$y);
	}, []);
	const yearPickerRef = useRef();
	const yearPickerProps = useMemo(() => [
		{
			key: "year-picker",
			customType: "date-picker",
			width: "150px",
			sublabel: "Select Year",
			views: ["year"],
			value: new Date(`${year}-01-01`),
			minDate: new Date("2011-01-01"),
			maxDate: new Date("2021-12-31"),
			onChange: handleYearChange,
		},
	], [handleYearChange, year]);

	const fetchConfigs = useMemo(
		() => (year ? efsaConfigs(selectedCountry.toLowerCase(), year) : null),
		[selectedCountry, year],
	);

	const { state } = useInit(organization, fetchConfigs);

	const { isLoading, dataSets, minutesAgo } = state;
	console.log("Efsa dataSets:", dataSets);
	const data = useMemo(() => dataSets?.metrics || [], [dataSets]);

	const { uniqueProducts, uniqueParams } = useMemo(() => {
		if (!data || data.length === 0) return { uniqueProducts: [], uniqueParams: [] };

		const products = [...new Set(data.map((item) => item.key))].sort();
		const params = [...new Set(data.map((item) => item.param))].sort();

		return { uniqueProducts: products, uniqueParams: params };
	}, [data]);

	// Combined grouped data
	const { dataGroupedByKey, dataGroupedByParam } = useMemo(() => {
		if (!isValidArray(data)) return { dataGroupedByKey: {}, dataGroupedByParam: {} };

		return {
			dataGroupedByKey: groupByKey(data, "key"),
			dataGroupedByParam: groupByKey(data, "param"),
		};
	}, [data]);

	const countryDropdown = useMemo(() => ([{
		id: "country-dropdown",
		label: "Select Country",
		items: countries,
		value: selectedCountry,
		onChange: (e) => {
			const newCountry = e.target.value;
			setSelectedCountry(newCountry);
			setSelectedContaminant(uniqueParams[0]); // Reset contaminant when country changes
		},
	}]), [selectedCountry, uniqueParams]);

	const productDropdown = useMemo(() => ([{
		id: "product-dropdown",
		label: "Select Product",
		items: uniqueProducts,
		value: selectedProduct,
		onChange: (e) => {
			const newProduct = e.target.value;
			setSelectedProduct(newProduct);
		},
	}]), [uniqueProducts, selectedProduct]);

	const contaminantDropdown = useMemo(() => ([{
		id: "contaminant-dropdown",
		label: "Select Contaminant",
		items: uniqueParams,
		value: selectedContaminant,
		onChange: (e) => {
			const newContaminant = e.target.value;
			setSelectedContaminant(newContaminant);
		},
	}]), [uniqueParams, selectedContaminant]);

	useEffect(() => {
		// Reset selected contaminant and product when country changes
		if (selectedCountry && uniqueParams.length > 0) {
			setSelectedContaminant(uniqueParams[0]);
		}

		if (selectedCountry && uniqueProducts.length > 0) {
			setSelectedProduct(uniqueProducts[0]);
		}
	}, [selectedCountry, uniqueParams, uniqueProducts]);

	const contaminantChartData = useMemo(() => {
		if (!selectedContaminant || data.length === 0) return [];

		const contaminantData = dataGroupedByParam[selectedContaminant] || [];
		const filteredData = contaminantData.filter((item) => item.resval > item.resloq);

		return [
			{
				x: filteredData.map((item) => item.key),
				y: filteredData.map((item) => item.resval),
				type: "bar",
				name: "Residue Value",
			},
			{
				x: filteredData.map((item) => item.key),
				y: filteredData.map((item) => item.resloq),
				type: "scatter",
				mode: "lines",
				name: "LOQ",
				line: { color: "goldenrod", dash: "dash", width: 2 },
			},
		];
	}, [data.length, dataGroupedByParam, selectedContaminant]);

	const productChartData = useMemo(() => {
		if (!selectedProduct || data.length === 0) return [];

		const productData = dataGroupedByKey[selectedProduct] || [];
		const filteredData = productData.filter((item) => item.resval > item.resloq);

		return [
			{
				x: filteredData.map((item) => item.param),
				y: filteredData.map((item) => item.resval),
				type: "bar",
				name: "Residue Value",
				marker: { color: "primary" },
			},
		];
	}, [data.length, dataGroupedByKey, selectedProduct]);

	const contaminantChartLayout = useMemo(() => {
		// Get LOQ value (same for all products)
		const contaminantData = dataGroupedByParam[selectedContaminant] || [];
		const filteredData = contaminantData.filter((item) => item.resval > item.resloq);
		const loqValue = filteredData.length > 0 ? filteredData[0].resloq : 0;

		return {
			xaxis: {
				title: "Food Products",
				tickangle: 5,
			},
			yaxis: {
				title: "Residue Value",
			},
			shapes: loqValue > 0 ? [{
				type: "line",
				xref: "paper",
				x0: 0,
				x1: 1,
				yref: "y",
				y0: loqValue,
				y1: loqValue,
				line: {
					color: "goldenrod",
					width: 2,
					dash: "dash",
				},
			}] : [],
		};
	}, [selectedContaminant, dataGroupedByParam]);

	const contaminantPieChartData = useMemo(() => {
		if (!selectedContaminant || data.length === 0) return [];

		// Filter data for selected contaminant
		const contaminantData = data.filter((item) => item.param === selectedContaminant);

		if (contaminantData.length === 0) return [];

		// Count exceedances and non-exceedances
		const exceedances = contaminantData.filter((item) => item.resval > item.resloq).length;
		const nonExceedances = contaminantData.length - exceedances;

		// Calculate percentages
		const exceedancePercentage = ((exceedances / contaminantData.length) * 100).toFixed(1);
		const nonExceedancePercentage = ((nonExceedances / contaminantData.length) * 100).toFixed(1);

		return [{
			values: [exceedances, nonExceedances],
			labels: [
				`Exceeding LOQ (${exceedancePercentage}%)`,
				`Below LOQ (${nonExceedancePercentage}%)`,
			],
			type: "pie",
		}];
	}, [data, selectedContaminant]);

	const productChartLayout = useMemo(() => {
		if (!selectedProduct || data.length === 0) {
			return {
				xaxis: {
					title: "Contaminants",
					tickangle: 5,
				},
				yaxis: {
					title: "Residue Value",
				},
			};
		}

		const productData = dataGroupedByKey[selectedProduct] || [];
		const filteredData = productData.filter((item) => item.resval > item.resloq);

		// Create individual shapes for each contaminant's LOQ line
		const shapes = filteredData.map((item, index) => ({
			type: "line",
			xref: "x",
			x0: index - 0.4, // Start before the bar
			x1: index + 0.4, // End after the bar
			yref: "y",
			y0: item.resloq,
			y1: item.resloq,
			line: {
				color: "goldenrod",
				width: 3,
				dash: "dash",
			},
		}));

		return {
			xaxis: {
				title: "Contaminants",
				tickangle: 5,
			},
			yaxis: {
				title: "Residue Value",
			},
			shapes,
		};
	}, [selectedProduct, dataGroupedByKey, data.length]);

	const productPieChartData = useMemo(() => {
		if (!selectedProduct || data.length === 0) return [];

		// Filter data for selected product
		const productData = data.filter((item) => item.key === selectedProduct);

		if (productData.length === 0) return [];

		// Count exceedances and non-exceedances
		const exceedances = productData.filter((item) => item.resval > item.resloq).length;
		const nonExceedances = productData.length - exceedances;

		// Calculate percentages
		const exceedancePercentage = ((exceedances / productData.length) * 100).toFixed(1);
		const nonExceedancePercentage = ((nonExceedances / productData.length) * 100).toFixed(1);

		return [{
			values: [exceedances, nonExceedances],
			labels: [
				`Exceeding LOQ (${exceedancePercentage}%)`,
				`Below LOQ (${nonExceedancePercentage}%)`,
			],
			type: "pie",
		}];
	}, [data, selectedProduct]);

	return (
		<Grid container display="flex" direction="row" justifyContent="space-around" spacing={1}>
			<StickyBand dropdownContent={countryDropdown} formRef={yearPickerRef} formContent={yearPickerProps} />

			<Grid item xs={12} sm={12} md={12} lg={12}>
				<Card
					title="Foods with Risky Contaminant Levels"
					footer={isLoading ? undefined : cardFooter({ minutesAgo })}
				>
					<StickyBand sticky={false} dropdownContent={contaminantDropdown} />
					{isLoading ? (
						<LoadingIndicator minHeight="300px" />
					) : uniqueParams.length === 0 ? (
						<DataWarning message="No contaminant measurements available for the selected country and year" />
					) : isValidArray(contaminantChartData[0]?.x) ? (
						<Grid container spacing={1}>
							<Grid item xs={12} md={6}>
								<Plot
									scrollZoom
									data={contaminantChartData}
									showLegend={false}
									shapes={contaminantChartLayout.shapes}
									xaxis={contaminantChartLayout.xaxis}
									yaxis={contaminantChartLayout.yaxis}
								/>
							</Grid>
							<Grid item xs={12} md={6}>
								<Plot
									data={contaminantPieChartData}
								/>
							</Grid>
						</Grid>
					) : (
						<DataWarning message={`No measurements exceeding LOQ found for ${selectedContaminant}. All levels are compliant with EU health standards.`} />
					)}
				</Card>
			</Grid>

			<Grid item xs={12} sm={12} md={12} lg={12}>
				<Card
					title="Contaminants in Selected Food Product"
					footer={isLoading ? undefined : cardFooter({ minutesAgo })}
				>
					<StickyBand sticky={false} dropdownContent={productDropdown} />
					{isLoading ? (
						<LoadingIndicator minHeight="300px" />
					) : uniqueProducts.length === 0 ? (
						<DataWarning message="No product measurements available for the selected country and year" />
					) : isValidArray(productChartData[0]?.x) ? (
						<Grid container spacing={1}>
							<Grid item xs={12} md={6}>
								<Plot
									scrollZoom
									showLegend
									data={productChartData}
									shapes={productChartLayout.shapes}
									xaxis={productChartLayout.xaxis}
									yaxis={productChartLayout.yaxis}
								/>
							</Grid>
							<Grid item xs={12} md={6}>
								<Plot
									data={productPieChartData}
								/>
							</Grid>
						</Grid>
					) : (
						<DataWarning message={`No measurements exceeding LOQ found for ${selectedProduct}. All levels are compliant with EU health standards.`} />
					)}
				</Card>
			</Grid>

		</Grid>
	);
};

export default memo(Efsa);
