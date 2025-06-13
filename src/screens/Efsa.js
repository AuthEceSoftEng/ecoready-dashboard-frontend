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
		() => (selectedCountry ? efsaConfigs(selectedCountry.toLowerCase(), year) : null),
		[selectedCountry, year],
	);

	const { state } = useInit(organization, fetchConfigs);

	const { isLoading, dataSets, minutesAgo } = state;
	const data = useMemo(() => dataSets?.metrics || [], [dataSets]);
	const timelineData = useMemo(() => dataSets?.timeline || [], [dataSets]);
	console.log("Efsa data:", data);

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
	const { dataGroupedByProduct, dataGroupedByContaminant } = useMemo(() => {
		if (!isValidArray(data)) return { dataGroupedByProduct: {}, dataGroupedByContaminant: {} };

		// Filter data to only include items with keys/params that exist in uniqueChartProducts/uniqueChartContaminants
		const filteredData = data.filter((item) => uniqueChartProducts.includes(item.key) && uniqueChartContaminants.includes(item.param));

		return {
			dataGroupedByProduct: groupByKey(filteredData, "key"),
			dataGroupedByContaminant: groupByKey(filteredData, "param"),
		};
	}, [data, uniqueChartProducts, uniqueChartContaminants]);

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

	const productChartDropdown = useMemo(() => createDropdown(
		"product-dropdown",
		"Select Product",
		uniqueChartProducts,
		selectedProduct,
		(e) => setSelectedProduct(e.target.value),
	), [uniqueChartProducts, selectedProduct]);

	const contaminantChartDropdown = useMemo(() => createDropdown(
		"contaminant-dropdown",
		"Select Contaminant",
		uniqueChartContaminants,
		selectedContaminant,
		(e) => setSelectedContaminant(e.target.value),
	), [uniqueChartContaminants, selectedContaminant]);

	const productTimelineDropdown = useMemo(() => createDropdown(
		"product-timeline-dropdown",
		"Select Product",
		uniqueTimelineProducts,
		selectedProductTimeline,
		(e) => setSelectedProduct(e.target.value),
	), [uniqueTimelineProducts, selectedProductTimeline]);

	const contaminantTimelineDropdown = useMemo(() => createDropdown(
		"contaminant-timeline-dropdown",
		"Select Contaminant",
		uniqueTimelineContaminants,
		selectedContaminantTimeline,
		(e) => setSelectedContaminant(e.target.value),
	), [uniqueTimelineContaminants, selectedContaminantTimeline]);

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
				type: "bar",
				color: "third",
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
		console.log("Efsa productData:", productData);

		return [
			{
				x: productData.map((item) => truncateLabel(item.param)), // Use truncated labels
				y: productData.map((item) => item.resval),
				text: productData.map((item) => item.param), // Full text for hover
				type: "bar",
				name: "Residue Value",
				color: "colors.third",
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
		if (!isValidArray(data) || uniqueChartProducts.length === 0 || uniqueChartContaminants.length === 0) return [];

		// Use grouped data for O(1) lookups instead of O(n) searches
		return uniqueChartContaminants.map((contaminant) => {
			const contaminantData = dataGroupedByContaminant[contaminant] || [];

			const contaminantValues = uniqueChartProducts.map((product) => {
				const dataPoint = contaminantData.find((item) => item.key === product);
				return dataPoint ? dataPoint.resval : 0;
			});

			return {
				x: uniqueChartProducts.map((product) => truncateLabel(product)),
				y: contaminantValues,
				title: truncateLabel(contaminant),
				type: "bar",
			};
		});
	}, [data, uniqueChartProducts, uniqueChartContaminants, dataGroupedByContaminant]);

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
				xanchor: "left",
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
					) : uniqueChartProducts.length === 0 || uniqueChartContaminants.length === 0 ? (
						<DataWarning message="No data available for the selected country and year" />
					) : isValidArray(stackedBarChartData) && stackedBarChartData.length > 0 ? (
						<Grid item xs={12}>
							<Plot
								scrollZoom
								data={stackedBarChartData}
								barmode="stack" // This is what makes it stack vertically
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
					<StickyBand sticky={false} dropdownContent={contaminantChartDropdown} />
					{isLoading ? (
						<LoadingIndicator minHeight="300px" />
					) : uniqueChartContaminants.length === 0 ? (
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
					<StickyBand sticky={false} dropdownContent={productChartDropdown} />
					{isLoading ? (
						<LoadingIndicator minHeight="300px" />
					) : uniqueChartProducts.length === 0 ? (
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
