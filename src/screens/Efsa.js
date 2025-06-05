import { useLocation } from "react-router-dom";
import { Grid, Tooltip } from "@mui/material";
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
	const [selectedContaminant, setSelectedContaminant] = useState(null);
	const [selectedProduct, setSelectedProduct] = useState(null);
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

	const uniqueProducts = useMemo(() => {
		// Wait until dataSets is available and has metrics
		if (!data || data.length === 0) return [];

		// Direct extraction without extractFields
		const keys = data.map((item) => item.key);
		return [...new Set(keys)].sort();
	}, [data]);

	const uniqueParams = useMemo(() => {
		// Wait until dataSets is available and has metrics
		if (!data || data.length === 0) return [];

		// Direct extraction without extractFields
		const params = data.map((item) => item.param);
		return [...new Set(params)].sort();
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

	// Group data by key and param
	const dataGroupedByKey = useMemo(() => (data.length > 0 ? groupByKey(data, "key") : {}),
		[data]);
	// console.log("Efsa dataGroupedByKey:", dataGroupedByKey);

	const dataGroupedByParam = useMemo(() => (data.length > 0 ? groupByKey(data, "param") : {}),
		[data]);
	// console.log("Efsa dataGroupedByParam:", dataGroupedByParam);

	const contaminantChartData = useMemo(() => {
		if (!selectedContaminant || data.length === 0) return [];

		// Use pre-grouped data instead of filtering entire dataset
		const contaminantData = dataGroupedByParam[selectedContaminant] || [];
		const filteredData = contaminantData.filter((item) => item.resval > item.resloq);
		console.log("Contaminant filteredData:", filteredData);
		return [{
			x: filteredData.map((item) => item.key),
			y: filteredData.map((item) => item.resval),
			type: "bar",
			name: "Residue Value",
			color: "red",
		}];
	}, [data.length, dataGroupedByParam, selectedContaminant]);

	const productChartData = useMemo(() => {
		if (!selectedProduct || data.length === 0) return [];

		// Use pre-grouped data
		const productData = dataGroupedByKey[selectedProduct] || [];
		const filteredData = productData.filter((item) => item.resval > item.resloq);
		console.log("Product filteredData:", filteredData);
		return [{
			x: filteredData.map((item) => item.param),
			y: filteredData.map((item) => item.resval),
			type: "bar",
			name: "Residue Value",
			color: "primary",
		}];
	}, [data.length, dataGroupedByKey, selectedProduct]);

	const contaminantChartLayout = useMemo(() => ({
		xaxis: {
			title: "Food Products",
			tickangle: -5,
		},
		yaxis: {
			title: "Residue Value",
		},
	}), []);

	const productChartLayout = useMemo(() => ({
		xaxis: {
			title: "Contaminants",
			tickangle: 5,
		},
		yaxis: {
			title: "Residue Value",
		},
	}), []);

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
			name: "Contamination Status",
		}];
	}, [data, selectedProduct]);

	return (
		<Grid container display="flex" direction="row" justifyContent="space-around" spacing={1}>
			<StickyBand dropdownContent={countryDropdown} formRef={yearPickerRef} formContent={yearPickerProps} />
			<Grid item xs={12} sm={12} md={6} lg={6}>
				<Card
					title="Foods with Risky Contaminant Levels"
					footer={isLoading ? undefined : cardFooter({ minutesAgo })}
				>
					<StickyBand sticky={false} dropdownContent={contaminantDropdown} />
					{isLoading ? (
						<LoadingIndicator minHeight="300px" />
					) : selectedContaminant ? (
						contaminantChartData.length > 0 ? (
							<Plot
								scrollZoom
								data={contaminantChartData}
								showLegend={false}
								xaxis={contaminantChartLayout.xaxis}
								yaxis={contaminantChartLayout.yaxis}
							/>
						) : (
							<DataWarning message={`No exceedances found for ${selectedContaminant}`} />
						)
					) : (
						<DataWarning message="Please select a contaminant to view the chart" />
					)}
				</Card>
			</Grid>

			<Grid item xs={12} sm={12} md={6} lg={6}>
				<Card
					title="Contaminants in Selected Food Product"
					footer={isLoading ? undefined : cardFooter({ minutesAgo })}
				>
					<StickyBand sticky={false} dropdownContent={productDropdown} />
					{isLoading ? (
						<LoadingIndicator minHeight="300px" />
					) : selectedProduct ? (
						productChartData.length > 0 ? (
							<Plot
								scrollZoom
								data={productChartData}
								showLegend={false}
								xaxis={productChartLayout.xaxis}
								yaxis={productChartLayout.yaxis}
							/>
						) : (
							<DataWarning message={`No exceedances found for ${selectedProduct}`} />
						)
					) : (
						<DataWarning message="Please select a product to view the chart" />
					)}
				</Card>
			</Grid>

			<Grid item xs={12} sm={12} md={4} lg={4}>
				<Card
					title="Contamination Analysis"
					footer={isLoading ? undefined : cardFooter({ minutesAgo })}
				>
					<StickyBand sticky={false} dropdownContent={productDropdown} />
					{isLoading ? (
						<LoadingIndicator minHeight="300px" />
					) : selectedProduct ? (
						productPieChartData.length > 0 ? (
							<Plot
								data={productPieChartData}
								height="300px"
							/>
						) : (
							<DataWarning message={`No data found for ${selectedProduct}`} />
						)
					) : (
						<DataWarning message="Please select a product to view the analysis" />
					)}
				</Card>
			</Grid>

		</Grid>
	);
};

export default memo(Efsa);
