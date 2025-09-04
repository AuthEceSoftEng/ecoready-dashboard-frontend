import { Grid } from "@mui/material";
import { memo, useMemo, useState, useCallback, useRef, useEffect } from "react";

import Card from "../components/Card.js";
import Plot from "../components/Plot.js";
import efsaConfigs, { organization } from "../config/EfsaConfig.js";
import useInit from "../utils/screen-init.js";
import { isValidArray, groupByKey } from "../utils/data-handling-functions.js";
import { cardFooter, LoadingIndicator, StickyBand, DataWarning } from "../utils/rendering-items.js";
import { UNIT_CONVERSION_FACTORS } from "../utils/useful-constants.js";

const countries = ["Austria", "Belgium", "Bulgaria", "Croatia", "Denmark", "France", "Germany", "Greece", "Ireland", "Italy", "Lithuania", "Netherlands", "Poland", "Portugal", "Republic of north macedonia", "Romania", "Serbia", "Slovakia", "Spain", "Ukraine", "United kingdom"];

const TARGET_UNIT = "mg/kg"; // Your standard unit

const convertToStandardUnit = (value, unit) => {
	const factor = UNIT_CONVERSION_FACTORS[unit];
	if (factor === undefined) {
		console.warn(`Unknown unit: ${unit}. Using original value.`);
		return value;
	}

	return value * factor;
};

const truncateLabel = (label, maxLength = 15) => (label.length > maxLength ? `${label.slice(0, Math.max(0, maxLength))}...` : label);

// Create a dropdown factory function
const createDropdown = (id, label, items, value, onChange) => ([{
	id,
	label,
	items,
	value,
	onChange,
}]);

const Efsa = () => {
	const [selectedCountry, setSelectedCountry] = useState(countries[0]);
	const [selectedContaminant, setSelectedContaminant] = useState(null);
	const [selectedProduct, setSelectedProduct] = useState(null);
	const [selectedContaminantTimeline, setSelectedContaminantTimeline] = useState(null);
	const [selectedProductTimeline, setSelectedProductTimeline] = useState(null);
	const [selectedProductContaminationTimeline, setSelectedProductContaminationTimeline] = useState(null);
	const [year, setYear] = useState("2023");

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
			maxDate: new Date("2023-12-31"),
			onChange: handleYearChange,
		},
	], [handleYearChange, year]);

	const fetchConfigs = useMemo(
		() => (selectedCountry ? efsaConfigs(selectedCountry.toLowerCase(), year) : null),
		[selectedCountry, year],
	);

	const { state } = useInit(organization, fetchConfigs);

	const { isLoading, dataSets, minutesAgo } = state;
	console.log("Efsa dataSets:", dataSets);
	const data = useMemo(() => {
		const rawData = dataSets?.metrics || [];
		return rawData.map((item) => ({
			...item,
			originalResval: item.resval,
			originalResunit: item.resunit,
			resval: convertToStandardUnit(item.resval, item.resunit),
			resloq: convertToStandardUnit(item.resloq, item.resunit),
			resunit: TARGET_UNIT,
		}));
	}, [dataSets]);

	const timelineData = useMemo(() => {
		const rawTimelineData = dataSets?.timeline || [];
		return rawTimelineData.map((item) => ({
			...item,
			originalResval: item.resval,
			originalResunit: item.resunit,
			resval: convertToStandardUnit(item.resval, item.resunit),
			resloq: convertToStandardUnit(item.resloq, item.resunit),
			resunit: TARGET_UNIT,
		}));
	}, [dataSets]);

	const { uniqueChartProducts, uniqueChartContaminants, uniqueTimelineProducts, uniqueTimelineContaminants } = useMemo(() => {
		// Early return if no data
		if ((!data?.length) && (!timelineData?.length)) {
			return { uniqueChartProducts: [], uniqueChartContaminants: [], uniqueTimelineProducts: [], uniqueTimelineContaminants: [] };
		}

		const chartProductsSet = new Set();
		const chartContaminantsSet = new Set();
		const timelineProductsSet = new Set();
		const timelineContaminantsSet = new Set();

		// Process data array
		if (data) {
			for (const item of data) {
				if (item.resval > 0) {
					chartProductsSet.add(item.key);
					chartContaminantsSet.add(item.param);
				}
			}
		}

		// Process timelineData array
		if (timelineData) {
			for (const item of timelineData) {
				timelineProductsSet.add(item.key);
				timelineContaminantsSet.add(item.param);
			}
		}

		// Convert to sorted arrays only once at the end
		return {
			uniqueChartProducts: [...chartProductsSet].sort(),
			uniqueChartContaminants: [...chartContaminantsSet].sort(),
			uniqueTimelineProducts: [...timelineProductsSet].sort(),
			uniqueTimelineContaminants: [...timelineContaminantsSet].sort(),
		};
	}, [data, timelineData]);

	// Combined grouped data
	const { dataGroupedByProduct, dataGroupedByContaminant, timelineGroupedByProduct, timelineGroupedByContaminant } = useMemo(() => {
		// Filter data to only include items with keys/params that exist in uniqueChartProducts/uniqueChartContaminants
		const filteredData = data.filter((item) => uniqueChartProducts.includes(item.key) && uniqueChartContaminants.includes(item.param));

		return {
			dataGroupedByProduct: groupByKey(filteredData, "key"),
			dataGroupedByContaminant: groupByKey(filteredData, "param"),
			timelineGroupedByProduct: groupByKey(timelineData, "key"),
			timelineGroupedByContaminant: groupByKey(timelineData, "param"),
		};
	}, [data, uniqueChartProducts, uniqueChartContaminants, timelineData]);
	const countryDropdown = useMemo(() => createDropdown(
		"country-dropdown",
		"Select Country",
		countries,
		selectedCountry,
		(e) => {
			const newCountry = e.target.value;
			setSelectedCountry(newCountry);
			setSelectedContaminant(uniqueChartContaminants[0]);
		},
	), [selectedCountry, uniqueChartContaminants]);

	const contaminantChartDropdown = useMemo(() => createDropdown(
		"contaminant-dropdown",
		"Select Contaminant",
		uniqueChartContaminants,
		selectedContaminant,
		(e) => setSelectedContaminant(e.target.value),
	), [uniqueChartContaminants, selectedContaminant]);

	const productChartDropdown = useMemo(() => createDropdown(
		"product-dropdown",
		"Select Product",
		uniqueChartProducts,
		selectedProduct,
		(e) => setSelectedProduct(e.target.value),
	), [uniqueChartProducts, selectedProduct]);

	const contaminantTimelineDropdown = useMemo(() => createDropdown(
		"contaminant-timeline-dropdown",
		"Select Contaminant",
		uniqueTimelineContaminants,
		selectedContaminantTimeline,
		(e) => setSelectedContaminantTimeline(e.target.value),
	), [uniqueTimelineContaminants, selectedContaminantTimeline]);

	const productTimelineDropdown = useMemo(() => createDropdown(
		"product-timeline-dropdown",
		"Select Product",
		uniqueTimelineProducts,
		selectedProductTimeline,
		(e) => setSelectedProductTimeline(e.target.value),
	), [uniqueTimelineProducts, selectedProductTimeline]);

	const productTimelineContaminantDropdown = useMemo(() => createDropdown(
		"product-timeline-contaminant-dropdown",
		"Select Product",
		uniqueTimelineProducts,
		selectedProductContaminationTimeline,
		(e) => setSelectedProductContaminationTimeline(e.target.value),
	), [uniqueTimelineProducts, selectedProductContaminationTimeline]);

	useEffect(() => {
		// Reset selected contaminant and product when country changes
		if (selectedCountry && uniqueChartContaminants.length > 0) {
			setSelectedContaminant(uniqueChartContaminants[0]);
		}

		if (selectedCountry && uniqueChartProducts.length > 0) {
			setSelectedProduct(uniqueChartProducts[0]);
		}

		if (selectedCountry && uniqueTimelineContaminants.length > 0) {
			setSelectedContaminantTimeline(uniqueTimelineContaminants[0]);
		}

		if (selectedCountry && uniqueTimelineProducts.length > 0) {
			setSelectedProductTimeline(uniqueTimelineProducts[0]);
		}
	}, [selectedCountry, uniqueChartContaminants, uniqueChartProducts, uniqueTimelineContaminants, uniqueTimelineProducts]);

	const contaminantChartData = useMemo(() => {
		if (!selectedContaminant || Object.keys(dataGroupedByContaminant).length === 0) return [];

		const contaminantData = dataGroupedByContaminant[selectedContaminant] || [];

		return [
			{
				x: contaminantData.map((item) => truncateLabel(item.key)),
				y: contaminantData.map((item) => item.resval),
				hovertemplate: "%{customdata}<extra></extra>",
				customdata: contaminantData.map((item) => `<b>Contaminant</b>: ${item.key.replaceAll(/\b\w/g, (l) => l.toUpperCase())}<br><b>Residue Value</b>: ${item.resval}`),
				type: "bar",
				color: "third",
				title: "Residue Value",
			},
		];
	}, [dataGroupedByContaminant, selectedContaminant]);

	const contaminantChartLayout = useMemo(() => {
		// Get LOQ value and unit (same for all products)
		const contaminantData = dataGroupedByContaminant[selectedContaminant] || [];
		const loqValue = contaminantData.length > 0 ? contaminantData[0].resloq : 0;

		return {
			xaxis: { automargin: true },
			yaxis: { title: `Residue Value (${TARGET_UNIT})`, automargin: true },
			margin: { l: 80, r: 50, t: 50, b: 80 },
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

	const productChartData = useMemo(() => {
		if (!selectedProduct || Object.keys(dataGroupedByProduct).length === 0) return [];

		const productData = dataGroupedByProduct[selectedProduct] || [];

		return [
			{
				x: productData.map((item) => truncateLabel(item.param)), // Use truncated labels
				y: productData.map((item) => item.resval),
				hovertemplate: "%{customdata}<extra></extra>",
				customdata: productData.map((item) => `<b>Product</b>: ${item.param.replaceAll(/\b\w/g, (l) => l.toUpperCase())}<br><b>Residue Value</b>: ${item.resval}`),
				type: "bar",
				color: "colors.third",
			},
		];
	}, [dataGroupedByProduct, selectedProduct]);

	const productChartLayout = useMemo(() => {
		if (!selectedProduct || Object.keys(dataGroupedByProduct).length === 0) {
			return {
				xaxis: { title: "Contaminants" },
				yaxis: { title: "Residue Value" },
			};
		}

		const productData = dataGroupedByProduct[selectedProduct] || [];

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
			xaxis: { automargin: true },
			yaxis: { title: `Residue Value (${TARGET_UNIT})`, automargin: true },
			margin: { l: 80, r: 50, t: 50, b: 80 },
			shapes,
		};
	}, [selectedProduct, dataGroupedByProduct]);

	// Add this new useMemo after the existing chart data calculations
	const stackedBarChartData = useMemo(() => {
		if (!isValidArray(data) || uniqueChartProducts.length === 0 || uniqueChartContaminants.length === 0) return [];

		// Sort contaminants alphabetically and reverse to fix legend order
		const sortedContaminants = [...uniqueChartContaminants].sort().reverse();

		// Use dataGroupedByProduct for O(1) lookups
		return sortedContaminants.map((contaminant) => {
			const contaminantValues = uniqueChartProducts.map((product) => {
				const productData = dataGroupedByProduct[product] || [];
				const dataPoint = productData.find((item) => item.param === contaminant);
				return dataPoint ? dataPoint.resval : 0;
			});

			const hoverText = uniqueChartProducts.map((product) => {
				const productData = dataGroupedByProduct[product] || [];
				const dataPoint = productData.find((item) => item.param === contaminant);
				return dataPoint
					? `<b>Product</b>: ${product.replaceAll(/\b\w/g, (l) => l.toUpperCase())}<br><b>Contaminant</b>: ${contaminant.replaceAll(/\b\w/g, (l) => l.toUpperCase())}<br><b>Residue Value</b>: ${dataPoint.resval.toFixed(3)} ${dataPoint.resunit}`
					: `<b>Product</b>: ${product.replaceAll(/\b\w/g, (l) => l.toUpperCase())}<br><b>Contaminant</b>: ${contaminant.replaceAll(/\b\w/g, (l) => l.toUpperCase())}<br>No data`;
			});

			return {
				x: uniqueChartProducts.map((product) => truncateLabel(product)),
				y: contaminantValues,
				hovertemplate: "%{customdata}<extra></extra>",
				customdata: hoverText,
				title: truncateLabel(contaminant),
				type: "bar",
			};
		});
	}, [data, uniqueChartProducts, uniqueChartContaminants, dataGroupedByProduct]);

	const stackedBarChartLayout = useMemo(() => ({
		xaxis: { title: "Food Products", automargin: true },
		yaxis: { title: `Total Residue Value (${TARGET_UNIT})`, automargin: true },
		margin: { l: 80, r: 50, t: 50, b: 100 },
		showlegend: true,
		legend: {
			orientation: "v", // Vertical legend to show contaminant names clearly
			y: 1,
			x: 1.02,
			xanchor: "left",
		},
	}), []);

	const contaminantTimelineData = useMemo(() => {
		if (!selectedContaminantTimeline || Object.keys(timelineGroupedByContaminant).length === 0) return [];

		const contaminantData = timelineGroupedByContaminant[selectedContaminantTimeline] || [];

		// Group the contaminant data by product (key) to create separate lines
		const productGroups = groupByKey(contaminantData, "key");
		const colors = ["#1f77b4", "#ff7f0e", "#2ca02c", "#d62728", "#9467bd", "#8c564b", "#e377c2", "#7f7f7f", "#bcbd22", "#17becf"];

		// Create a trace for each product
		return Object.keys(productGroups).map((productKey, index) => {
			const productData = productGroups[productKey];

			return {
				x: productData.map((item) => item.timestamp),
				y: productData.map((item) => item.resval),
				type: "scatter",
				mode: "lines+markers",
				hovertemplate: "%{customdata}<extra></extra>",
				customdata: productData.map((item) => `<b>Product</b>: ${item.key.replaceAll(/\b\w/g, (l) => l.toUpperCase())}<br><b>Residue Value</b>: ${item.resval}`),
				title: truncateLabel(productKey),
				line: { color: colors[index % colors.length] },
			};
		});
	}, [timelineGroupedByContaminant, selectedContaminantTimeline]);

	const contaminantTimelineLayout = useMemo(() => {
		if (!selectedContaminantTimeline || Object.keys(timelineGroupedByContaminant).length === 0) {
			return {
				yaxis: { title: "Residue Value" },
			};
		}

		const contaminantData = timelineGroupedByContaminant[selectedContaminantTimeline] || [];
		const loqValue = contaminantData.length > 0 ? contaminantData[0].resloq : 0;

		return {
			xaxis: { automargin: true },
			yaxis: {
				title: `Residue Value (${TARGET_UNIT})`,
				automargin: true,
			},
			margin: { l: 80, r: 50, t: 50, b: 80 },
			showlegend: true,
			legend: {
				orientation: "v",
				y: 1,
				x: 1.02,
				xanchor: "left",
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
	}, [selectedContaminantTimeline, timelineGroupedByContaminant]);

	const productTimelineData = useMemo(() => {
		if (!selectedProductTimeline || Object.keys(timelineGroupedByProduct).length === 0) return [];

		const productData = timelineGroupedByProduct[selectedProductTimeline] || [];

		// Group the product data by contaminant (param) to create separate lines
		const contaminantGroups = groupByKey(productData, "param");
		const colors = ["#1f77b4", "#ff7f0e", "#2ca02c", "#d62728", "#9467bd", "#8c564b", "#e377c2", "#7f7f7f", "#bcbd22", "#17becf"];

		// Create separate datasets for each chart type
		const residueValueData = [];
		const measurementCountData = [];
		const exceedingLimitData = [];

		Object.keys(contaminantGroups).forEach((contaminantKey, index) => {
			const contaminantData = contaminantGroups[contaminantKey];
			
			// Residue value scatter plot
			residueValueData.push({
				x: contaminantData.map((item) => item.timestamp),
				y: contaminantData.map((item) => item.resval),
				type: "scatter",
				mode: "lines+markers",
				name: truncateLabel(contaminantKey),
				hovertemplate: "%{customdata}<extra></extra>",
				customdata: contaminantData.map((item) => `<b>Contaminant</b>: ${contaminantKey.replace(/\b\w/g, l => l.toUpperCase())}<br><b>Residue Value</b>: ${item.resval.toFixed(3)} ${item.resunit}<br><b>Date</b>: %{x}`),
				line: { color: colors[index % colors.length] },
			});

			// Measurement count bar chart
			measurementCountData.push({
				x: contaminantData.map((item) => item.timestamp),
				y: contaminantData.map((item) => item.nr_measure || 0),
				type: "bar",
				name: `${truncateLabel(contaminantKey)} - Count`,
				hovertemplate: "%{customdata}<extra></extra>",
				customdata: contaminantData.map((item) => `<b>Contaminant</b>: ${contaminantKey.replace(/\b\w/g, l => l.toUpperCase())}<br><b>Number of Measurements</b>: ${item.nr_measure || 0}<br><b>Date</b>: %{x}`),
				marker: { color: colors[index % colors.length], opacity: 0.7 },
				yaxis: 'y',
			});

			// Exceeding limit percentage scatter plot
			exceedingLimitData.push({
				x: contaminantData.map((item) => item.timestamp),
				y: contaminantData.map((item) => {
					const exceedingLimit = item.nr_measurements_exceeding_legallimit || 0;
					const totalMeasurements = item.nr_measure || 1;
					return (exceedingLimit / totalMeasurements) * 100;
				}),
				type: "scatter",
				mode: "lines+markers",
				name: `${truncateLabel(contaminantKey)} - % Exceeding`,
				hovertemplate: "%{customdata}<extra></extra>",
				customdata: contaminantData.map((item) => {
					const exceedingLimit = item.nr_measurements_exceeding_legallimit || 0;
					const totalMeasurements = item.nr_measure || 1;
					const percentage = ((exceedingLimit / totalMeasurements) * 100).toFixed(2);
					return `<b>Contaminant</b>: ${contaminantKey.replace(/\b\w/g, l => l.toUpperCase())}<br><b>Exceeding Limit</b>: ${percentage}%<br><b>Measurements</b>: ${exceedingLimit}/${totalMeasurements}<br><b>Date</b>: %{x}`;
				}),
				line: { color: colors[index % colors.length], dash: 'dot' },
				yaxis: 'y2',
			});
		});

		return {
			residueValues: residueValueData,
			combinedMeasurements: [...measurementCountData, ...exceedingLimitData],
		};
	}, [timelineGroupedByProduct, selectedProductTimeline]);

	// Update the layouts
	const productTimelineLayouts = useMemo(() => {
		if (!selectedProductTimeline || Object.keys(timelineGroupedByProduct).length === 0) {
			return {
				residueValues: { yaxis: { title: "Residue Value" } },
				combinedMeasurements: { 
					yaxis: { title: "Number of Measurements" },
					yaxis2: { title: "Percentage Exceeding Limit (%)", side: 'right', overlaying: 'y', range: [0, 100] }
				},
			};
		}

		const productData = timelineGroupedByProduct[selectedProductTimeline] || [];
		const unit = productData.length > 0 ? productData[0].resunit : "";

		const baseLayout = {
			margin: { l: 80, r: 80, t: 50, b: 80 },
			showlegend: true,
			legend: {
				orientation: "v",
				y: 1,
				x: 1.15,
				xanchor: "left",
			},
		};

		return {
			residueValues: {
				...baseLayout,
				yaxis: { title: unit ? `Residue Value (${unit})` : "Residue Value", automargin: true },
			},
			combinedMeasurements: {
				...baseLayout,
				yaxis: { 
					title: "Number of Measurements", 
					automargin: true,
					side: 'left'
				},
				yaxis2: { 
					title: "Percentage Exceeding Limit (%)", 
					automargin: true, 
					range: [0, 100],
					side: 'right',
					overlaying: 'y'
				},
			},
		};
	}, [selectedProductTimeline, timelineGroupedByProduct]);

	return (
		<Grid container display="flex" direction="row" justifyContent="space-around" spacing={1}>
			<StickyBand dropdownContent={countryDropdown} formRef={yearPickerRef} formContent={yearPickerProps} />

			<Grid item xs={12} sm={12} md={6}>
				<Card
					title="Foods with Risky Contaminant Levels"
					footer={isLoading ? undefined : cardFooter({ minutesAgo })}
				>
					{isLoading ? (
						<LoadingIndicator minHeight="300px" />
					) : uniqueChartContaminants.length === 0 ? (
						<DataWarning message="No contaminant measurements available for the selected country and year" />
					) : isValidArray(contaminantChartData[0]?.x) && (
						<>
							<StickyBand sticky={false} dropdownContent={contaminantChartDropdown} />
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
						</>
					)}
				</Card>
			</Grid>

			<Grid item xs={12} sm={12} md={6}>
				<Card
					title="Contaminants in Selected Food Product"
					footer={isLoading ? undefined : cardFooter({ minutesAgo })}
				>

					{isLoading ? (
						<LoadingIndicator minHeight="300px" />
					) : uniqueChartProducts.length === 0 ? (
						<DataWarning message="No product measurements available for the selected country and year" />
					) : isValidArray(productChartData[0]?.x) && (
						<>
							<StickyBand sticky={false} dropdownContent={productChartDropdown} />
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
						</>
					)}
				</Card>
			</Grid>

			<Grid item xs={12} md={12}>
				<Card
					title="Total Contaminants per Food Product"
					footer={isLoading ? undefined : cardFooter({ minutesAgo })}
				>
					{isLoading ? (
						<LoadingIndicator minHeight="300px" />
					) : uniqueChartProducts.length === 0 || uniqueChartContaminants.length === 0 ? (
						<DataWarning message="No data available for the selected country and year" />
					) : isValidArray(stackedBarChartData) && stackedBarChartData.length > 0 ? (
						<Grid item xs={12}>
							<Plot
								scrollZoom
								height="499px"
								data={stackedBarChartData}
								barmode="stack"
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

			<Grid item xs={12} sm={12} md={6} mt={1}>
				<Card
					title="Contaminant Timeline"
					footer={isLoading ? undefined : cardFooter({ minutesAgo })}
				>
					{isLoading ? (
						<LoadingIndicator minHeight="300px" />
					) : uniqueTimelineContaminants.length === 0 ? (
						<DataWarning message="No contaminant measurements available for the selected country and year" />
					) : isValidArray(contaminantTimelineData[0]?.x) ? (
						<>
							<StickyBand sticky={false} dropdownContent={contaminantTimelineDropdown} />
							<Grid item xs={12} md={12}>
								<Plot
									scrollZoom
									showLegend
									data={contaminantTimelineData}
									shapes={contaminantTimelineLayout.shapes}
									xaxis={contaminantTimelineLayout.xaxis}
									yaxis={contaminantTimelineLayout.yaxis}
								/>
							</Grid>
						</>
					) : (
						<DataWarning message={`No measurements found for ${selectedContaminantTimeline}.`} />
					)}
				</Card>
			</Grid>

			<Grid item xs={12} sm={12} md={6} mt={1} mb={2}>
				<Card
					title="Product Timeline - Residue Values"
					footer={isLoading ? undefined : cardFooter({ minutesAgo })}
				>
					{isLoading ? (
						<LoadingIndicator minHeight="300px" />
					) : uniqueTimelineProducts.length === 0 ? (
						<DataWarning message="No product measurements available for the selected country and year" />
					) : isValidArray(productTimelineData.residueValues) && productTimelineData.residueValues.length > 0 ? (
						<>
							<StickyBand sticky={false} dropdownContent={productTimelineDropdown} />
							<Grid item xs={12} md={12}>
								<Plot
									scrollZoom
									data={productTimelineData.residueValues}
									yaxis={productTimelineLayouts.residueValues.yaxis}
									showlegend={productTimelineLayouts.residueValues.showlegend}
									legend={productTimelineLayouts.residueValues.legend}
									margin={productTimelineLayouts.residueValues.margin}
								/>
							</Grid>
						</>
					) : (
						<DataWarning message={`No measurements found for ${selectedProductTimeline}.`} />
					)}
				</Card>
			</Grid>
			<Grid item xs={12} sm={12} md={12} mt={1} mb={2}>
				<Card
					title="Product Timeline - Measurements & Legal Limit Violations"
					footer={isLoading ? undefined : cardFooter({ minutesAgo })}
				>
					{isLoading ? (
						<LoadingIndicator minHeight="300px" />
					) : uniqueTimelineProducts.length === 0 ? (
						<DataWarning message="No product measurements available for the selected country and year" />
					) : isValidArray(productTimelineData.combinedMeasurements) && productTimelineData.combinedMeasurements.length > 0 ? (
						<>
							<StickyBand sticky={false} dropdownContent={productTimelineDropdown} />
							<Grid item xs={12} md={12}>
								<Plot
									scrollZoom
									data={productTimelineData.combinedMeasurements}
									yaxis={productTimelineLayouts.combinedMeasurements.yaxis}
									yaxis2={productTimelineLayouts.combinedMeasurements.yaxis2}
									showlegend={productTimelineLayouts.combinedMeasurements.showlegend}
									legend={productTimelineLayouts.combinedMeasurements.legend}
									margin={productTimelineLayouts.combinedMeasurements.margin}
								/>
							</Grid>
						</>
					) : (
						<DataWarning message={`No measurements found for ${selectedProductTimeline}.`} />
					)}
				</Card>
			</Grid>
		</Grid>
	);
};

export default memo(Efsa);
