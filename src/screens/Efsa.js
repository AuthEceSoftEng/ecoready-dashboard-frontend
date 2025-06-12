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

const truncateLabel = (label, maxLength = 15) => (label.length > maxLength ? `${label.slice(0, Math.max(0, maxLength))}...` : label);

const Efsa = () => {
	const [selectedCountry, setSelectedCountry] = useState(countries[0]);
	console.log("Efsa selectedCountry:", selectedCountry);
	const [selectedContaminant, setSelectedContaminant] = useState("");
	const [selectedProduct, setSelectedProduct] = useState("");
	const [selectedContaminantTimeline, setSelectedContaminantTimeline] = useState("");
	const [selectedProductTimeline, setSelectedProductTimeline] = useState("");
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
		() => (year ? efsaConfigs(selectedCountry.toLowerCase(), selectedProductTimeline, selectedContaminantTimeline, year) : null),
		[selectedContaminantTimeline, selectedCountry, selectedProductTimeline, year],
	);

	const { state } = useInit(organization, fetchConfigs);

	const { isLoading, dataSets, minutesAgo } = state;
	const data = useMemo(() => dataSets?.metrics || [], [dataSets]);
	console.log("Efsa data:", data);

	const { uniqueProducts, uniqueContaminants } = useMemo(() => {
		if (!data || data.length === 0) return { uniqueProducts: [], uniqueContaminants: [] };

		const products = [...new Set(data.map((item) => item.key))].sort();
		const contaminants = [...new Set(data.map((item) => item.param))].sort();

		return { uniqueProducts: products, uniqueContaminants: contaminants };
	}, [data]);

	// Combined grouped data
	const { dataGroupedByProduct, dataGroupedByContaminant } = useMemo(() => {
		if (!isValidArray(data)) return { dataGroupedByProduct: {}, dataGroupedByContaminant: {} };

		// Filter data to only include items with keys/params that exist in uniqueProducts/uniqueContaminants
		const filteredData = data.filter((item) => uniqueProducts.includes(item.key) && uniqueContaminants.includes(item.param));

		return {
			dataGroupedByProduct: groupByKey(filteredData, "key"),
			dataGroupedByContaminant: groupByKey(filteredData, "param"),
		};
	}, [data, uniqueProducts, uniqueContaminants]);

	console.log("Efsa dataGroupedByProduct:", dataGroupedByProduct);
	console.log("Efsa dataGroupedByContaminant:", dataGroupedByContaminant);

	const countryDropdown = useMemo(() => ([{
		id: "country-dropdown",
		label: "Select Country",
		items: countries,
		value: selectedCountry,
		onChange: (e) => {
			const newCountry = e.target.value;
			setSelectedCountry(newCountry);
			setSelectedContaminant(uniqueContaminants[0]); // Reset contaminant when country changes
		},
	}]), [selectedCountry, uniqueContaminants]);

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
		items: uniqueContaminants,
		value: selectedContaminant,
		onChange: (e) => {
			const newContaminant = e.target.value;
			setSelectedContaminant(newContaminant);
		},
	}]), [uniqueContaminants, selectedContaminant]);

	useEffect(() => {
		// Reset selected contaminant and product when country changes
		if (selectedCountry && uniqueContaminants.length > 0) {
			setSelectedContaminant(uniqueContaminants[0]);
		}

		if (selectedCountry && uniqueProducts.length > 0) {
			setSelectedProduct(uniqueProducts[0]);
		}
	}, [selectedCountry, uniqueContaminants, uniqueProducts]);

	const contaminantChartData = useMemo(() => {
		if (!selectedContaminant || Object.keys(dataGroupedByContaminant).length === 0) return [];

		const contaminantData = dataGroupedByContaminant[selectedContaminant] || [];

		return [
			{
				x: contaminantData.map((item) => truncateLabel(item.key)),
				y: contaminantData.map((item) => item.resval),
				type: "bar",
				name: "Residue Value",
			},
			{
				x: contaminantData.map((item) => truncateLabel(item.key)),
				y: contaminantData.map((item) => item.resloq),
				type: "scatter",
				mode: "lines",
				name: "LOQ",
				line: { color: "goldenrod", dash: "dash", width: 2 },
			},
		];
	}, [dataGroupedByContaminant, selectedContaminant]);

	const productChartData = useMemo(() => {
		if (!selectedProduct || Object.keys(dataGroupedByProduct).length === 0) return [];

		const productData = dataGroupedByProduct[selectedProduct] || [];

		return [
			{
				x: productData.map((item) => truncateLabel(item.param)), // Use truncated labels
				y: productData.map((item) => item.resval),
				text: productData.map((item) => item.param), // Full text for hover
				hovertemplate: "%{text}<br>Value: %{y}<extra></extra>", // Show full text on hover
				type: "bar",
				name: "Residue Value",
				marker: { color: "primary" },
			},
		];
	}, [dataGroupedByProduct, selectedProduct]);

	const contaminantChartLayout = useMemo(() => {
		// Get LOQ value and unit (same for all products)
		const contaminantData = dataGroupedByContaminant[selectedContaminant] || [];
		const loqValue = contaminantData.length > 0 ? contaminantData[0].resloq : 0;
		const unit = contaminantData.length > 0 ? contaminantData[0].resunit : "";

		return {
			xaxis: {
				title: "Food Products",
				automargin: true,
			},
			yaxis: {
				title: unit ? `Residue Value (${unit})` : "Residue Value",
				automargin: true,
			},
			margin: {
				l: 80, // Left margin for y-axis
				r: 50, // Right margin
				t: 50, // Top margin
				b: 80, // Bottom margin for x-axis
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
	}, [selectedContaminant, dataGroupedByContaminant]);

	const contaminantTimelineData = useMemo(() => dataSets?.contaminantTimeline || [], [dataSets]);
	console.log("Efsa contaminantTimelineData:", contaminantTimelineData);
	const productTimelineData = useMemo(() => dataSets?.productTimeline || [], [dataSets]);

	const productChartLayout = useMemo(() => {
		if (!selectedProduct || Object.keys(dataGroupedByProduct).length === 0) {
			return {
				xaxis: { title: "Contaminants" },
				yaxis: { title: "Residue Value" },
			};
		}

		const productData = dataGroupedByProduct[selectedProduct] || [];
		const unit = productData.length > 0 ? productData[0].resunit : "";

		// Create individual shapes for each contaminant's LOQ line
		const shapes = productData.map((item, index) => ({
			type: "line",
			xref: "x",
			x0: index - 0.45, // Start before the bar
			x1: index + 0.45, // End after the bar
			yref: "y",
			y0: item.resloq,
			y1: item.resloq,
			line: { color: "goldenrod", width: 3, dash: "dash" },
		}));

		return {
			xaxis: {
				title: "Contaminants",
				automargin: true,
			},
			yaxis: {
				title: unit ? `Residue Value (${unit})` : "Residue Value",
				automargin: true,
			},
			margin: {
				l: 80, // Left margin for y-axis
				r: 50, // Right margin
				t: 50, // Top margin
				b: 80, // Bottom margin for x-axis
			},
			shapes,
		};
	}, [selectedProduct, dataGroupedByProduct]);

	// Add this new useMemo after the existing chart data calculations
	const stackedBarChartData = useMemo(() => {
		if (!isValidArray(data) || uniqueProducts.length === 0 || uniqueContaminants.length === 0) return [];

		// Use grouped data for O(1) lookups instead of O(n) searches
		return uniqueContaminants.map((contaminant) => {
			const contaminantData = dataGroupedByContaminant[contaminant] || [];

			const contaminantValues = uniqueProducts.map((product) => {
				const dataPoint = contaminantData.find((item) => item.key === product);
				return dataPoint ? dataPoint.resval : 0;
			});

			return {
				x: uniqueProducts.map((product) => truncateLabel(product)),
				y: contaminantValues,
				title: truncateLabel(contaminant),
				type: "bar",
			};
		});
	}, [data, uniqueProducts, uniqueContaminants, dataGroupedByContaminant]);

	const stackedBarChartLayout = useMemo(() => {
		// Get unit from first data point (assuming all have same unit)
		const unit = data.length > 0 ? data[0].resunit : "";

		return {
			xaxis: {
				title: "Food Products",
				automargin: true,
			},
			yaxis: {
				title: unit ? `Total Residue Value (${unit})` : "Total Residue Value",
				automargin: true,
			},
			margin: {
				l: 80,
				r: 50,
				t: 50,
				b: 100,
			},
			showlegend: true,
			legend: {
				orientation: "v", // Vertical legend to show contaminant names clearly
				y: 1,
				x: 1.02,
				xanchor: 'left'
			},
		};
	}, [data]);

	return (
		<Grid container display="flex" direction="row" justifyContent="space-around" spacing={1}>
			<StickyBand dropdownContent={countryDropdown} formRef={yearPickerRef} formContent={yearPickerProps} />

			{/* Add this new card for the stacked bar chart */}
			<Grid item xs={12}>
				<Card
					title="All Contaminants by Food Product (Stacked)"
					footer={isLoading ? undefined : cardFooter({ minutesAgo })}
				>
					{isLoading ? (
						<LoadingIndicator minHeight="300px" />
					) : uniqueProducts.length === 0 || uniqueContaminants.length === 0 ? (
						<DataWarning message="No data available for the selected country and year" />
					) : isValidArray(stackedBarChartData) && stackedBarChartData.length > 0 ? (
						<Grid item xs={12}>
							<Plot
								scrollZoom
								data={stackedBarChartData}
								barmode="stack"  // This is what makes it stack vertically
								displayBar={false}
								xaxis={stackedBarChartLayout.xaxis}
								yaxis={stackedBarChartLayout.yaxis}
							/>
						</Grid>
					) : (
						<DataWarning message="No measurements available for stacked visualization" />
					)}
				</Card>
			</Grid>

			<Grid item xs={12} sm={12} md={6}>
				<Card
					title="Foods with Risky Contaminant Levels"
					footer={isLoading ? undefined : cardFooter({ minutesAgo })}
				>
					<StickyBand sticky={false} dropdownContent={contaminantDropdown} />
					{isLoading ? (
						<LoadingIndicator minHeight="300px" />
					) : uniqueContaminants.length === 0 ? (
						<DataWarning message="No contaminant measurements available for the selected country and year" />
					) : isValidArray(contaminantChartData[0]?.x) ? (
						<Grid item xs={12} md={12}>
							<Plot
								scrollZoom
								data={contaminantChartData}
								showLegend={false}
								shapes={contaminantChartLayout.shapes}
								xaxis={contaminantChartLayout.xaxis}
								yaxis={contaminantChartLayout.yaxis}
							/>
						</Grid>
					) : (
						<DataWarning message={`No measurements exceeding LOQ found for ${selectedContaminant}. All levels are compliant with EU health standards.`} />
					)}
				</Card>
			</Grid>

			<Grid item xs={12} sm={12} md={6}>
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
						<Grid item xs={12} md={12}>
							<Plot
								scrollZoom
								showLegend={false}
								data={productChartData}
								shapes={productChartLayout.shapes}
								xaxis={productChartLayout.xaxis}
								yaxis={productChartLayout.yaxis}
							/>
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
