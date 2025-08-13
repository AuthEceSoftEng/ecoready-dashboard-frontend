import { Grid } from "@mui/material";
import { memo, useMemo, useState, useCallback, useRef, useEffect } from "react";

import Card from "../components/Card.js";
import Plot from "../components/Plot.js";
import efsaConfigs, { organization } from "../config/EfsaConfig.js";
import useInit from "../utils/screen-init.js";
import { isValidArray, groupByKey } from "../utils/data-handling-functions.js";
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
		() => (selectedCountry ? efsaConfigs(selectedCountry.toLowerCase(), selectedContaminant, selectedProduct, year) : null),
		[selectedCountry, selectedContaminant, selectedProduct, year],
	);

	const { state } = useInit(organization, fetchConfigs);

	const { isLoading, dataSets, minutesAgo } = state;
	console.log("Efsa dataSets:", dataSets);
	const contaminantData = useMemo(() => dataSets?.metrics_contaminant || [], [dataSets]);
	const productData = useMemo(() => dataSets?.metrics_product || [], [dataSets]);
	const timelineData = useMemo(() => dataSets?.timeline || [], [dataSets]);
	console.log("Timeline data:", timelineData);

	const { uniqueChartProducts, uniqueChartContaminants, uniqueTimelineProducts, uniqueTimelineContaminants } = useMemo(() => {
		// Early return if no data
		if ((!contaminantData?.length) && (!productData?.length) && (!timelineData?.length)) {
			return { uniqueChartProducts: [], uniqueChartContaminants: [], uniqueTimelineProducts: [], uniqueTimelineContaminants: [] };
		}

		const chartProductsSet = new Set();
		const chartContaminantsSet = new Set();
		const timelineProductsSet = new Set();
		const timelineContaminantsSet = new Set();

		// Process data array
		if (contaminantData) {
			for (const item of contaminantData) {
				if (item.resval > 0) {
					chartProductsSet.add(item.key);
				}
			}
		}

		if (productData) {
			for (const item of productData) {
				if (item.resval > 0) {
					chartProductsSet.add(item.param);
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
	}, [contaminantData, productData, timelineData]);

	console.log("Efsa uniqueChartProducts:", uniqueChartProducts);
	console.log("Efsa uniqueTimelineProducts:", uniqueTimelineProducts);

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
	console.log("Efsa dataGroupedByProduct:", dataGroupedByProduct);
	console.log("Efsa dataGroupedByContaminant:", dataGroupedByContaminant);
	console.log("Efsa timelineGroupedByProduct:", timelineGroupedByProduct);
	console.log("Efsa timelineGroupedByContaminant:", timelineGroupedByContaminant);

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
		(e) => setSelectedProductTimeline(e.target.value),
	), [uniqueTimelineProducts, selectedProductTimeline]);

	const contaminantTimelineDropdown = useMemo(() => createDropdown(
		"contaminant-timeline-dropdown",
		"Select Contaminant",
		uniqueTimelineContaminants,
		selectedContaminantTimeline,
		(e) => setSelectedContaminantTimeline(e.target.value),
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
				title: "Residue Value",
			},
		];
	}, [dataGroupedByContaminant, selectedContaminant]);

	const contaminantChartLayout = useMemo(() => {
		// Get LOQ value and unit (same for all products)
		const contaminantData = dataGroupedByContaminant[selectedContaminant] || [];
		const loqValue = contaminantData.length > 0 ? contaminantData[0].resloq : 0;
		const unit = contaminantData.length > 0 ? contaminantData[0].resunit : "";

		return {
			xaxis: { automargin: true },
			yaxis: { title: unit ? `Residue Value (${unit})` : "Residue Value", automargin: true },
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
				text: productData.map((item) => item.param), // Full text for hover
				type: "bar",
				title: "Residue Value",
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
			xaxis: { automargin: true },
			yaxis: { title: unit ? `Residue Value (${unit})` : "Residue Value", automargin: true },
			margin: { l: 80, r: 50, t: 50, b: 80 },
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
	}, [uniqueChartProducts, uniqueChartContaminants, dataGroupedByContaminant]);

	const stackedBarChartLayout = useMemo(() => {
		// Get unit from first data point (assuming all have same unit)
		const unit = data.length > 0 ? data[0].resunit : "";

		return {
			xaxis: { title: "Food Products", automargin: true },
			yaxis: { title: unit ? `Total Residue Value (${unit})` : "Total Residue Value", automargin: true },
			margin: { l: 80, r: 50, t: 50, b: 100 },
			showlegend: true,
			legend: {
				orientation: "v", // Vertical legend to show contaminant names clearly
				y: 1,
				x: 1.02,
				xanchor: "left",
			},
		};
	}, [data]);

	const contaminantTimelineData = useMemo(() => {
		if (!selectedContaminantTimeline || Object.keys(timelineGroupedByContaminant).length === 0) return [];

		const contaminantData = timelineGroupedByContaminant[selectedContaminantTimeline] || [];
		console.log("Efsa contaminantTimelineData:", contaminantData);

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
				title: truncateLabel(productKey),
				line: { color: colors[index % colors.length] },
			};
		});
	}, [timelineGroupedByContaminant, selectedContaminantTimeline]);

	const contaminantTimelineLayout = useMemo(() => {
		if (!selectedContaminantTimeline || Object.keys(timelineGroupedByContaminant).length === 0) {
			return {
				xaxis: { title: "Date" },
				yaxis: { title: "Residue Value" },
			};
		}

		const contaminantData = timelineGroupedByContaminant[selectedContaminantTimeline] || [];
		const unit = contaminantData.length > 0 ? contaminantData[0].resunit : "";
		const loqValue = contaminantData.length > 0 ? contaminantData[0].resloq : 0;

		return {
			xaxis: {
				title: "Date",
				automargin: true,
			},
			yaxis: {
				title: unit ? `Residue Value (${unit})` : "Residue Value",
				automargin: true,
			},
			margin: {
				l: 80,
				r: 50,
				t: 50,
				b: 80,
			},
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
		console.log("Efsa productTimelineData:", productData);

		// Group the product data by contaminant (param) to create separate lines
		const contaminantGroups = groupByKey(productData, "param");
		const colors = ["#1f77b4", "#ff7f0e", "#2ca02c", "#d62728", "#9467bd", "#8c564b", "#e377c2", "#7f7f7f", "#bcbd22", "#17becf"];

		// Create a trace for each contaminant
		return Object.keys(contaminantGroups).map((contaminantKey, index) => {
			const contaminantData = contaminantGroups[contaminantKey];

			return {
				x: contaminantData.map((item) => item.timestamp),
				y: contaminantData.map((item) => item.resval),
				type: "scatter",
				mode: "lines+markers",
				title: truncateLabel(contaminantKey),
				line: { color: colors[index % colors.length] },
			};
		});
	}, [timelineGroupedByProduct, selectedProductTimeline]);

	const productTimelineLayout = useMemo(() => {
		if (!selectedProductTimeline || Object.keys(timelineGroupedByProduct).length === 0) {
			return {
				xaxis: { title: "Date" },
				yaxis: { title: "Residue Value" },
			};
		}

		const productData = timelineGroupedByProduct[selectedProductTimeline] || [];
		const unit = productData.length > 0 ? productData[0].resunit : "";

		return {
			xaxis: { title: "Date", automargin: true },
			yaxis: { title: unit ? `Residue Value (${unit})` : "Residue Value", automargin: true },
			margin: { l: 80, r: 50, t: 50, b: 80 },
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
					) : isValidArray(contaminantChartData[0]?.x) ? (
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

					{isLoading ? (
						<LoadingIndicator minHeight="300px" />
					) : uniqueChartProducts.length === 0 ? (
						<DataWarning message="No product measurements available for the selected country and year" />
					) : isValidArray(productChartData[0]?.x) ? (
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
					) : (
						<DataWarning message={`No measurements exceeding LOQ found for ${selectedProduct}. All levels are compliant with EU health standards.`} />
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
					title="Product Timeline"
					footer={isLoading ? undefined : cardFooter({ minutesAgo })}
				>
					{isLoading ? (
						<LoadingIndicator minHeight="300px" />
					) : uniqueTimelineProducts.length === 0 ? (
						<DataWarning message="No product measurements available for the selected country and year" />
					) : isValidArray(productTimelineData[0]?.x) ? (
						<>
							<StickyBand sticky={false} dropdownContent={productTimelineDropdown} />
							<Grid item xs={12} md={12}>
								<Plot
									scrollZoom
									data={productTimelineData}
									xaxis={productTimelineLayout.xaxis}
									yaxis={productTimelineLayout.yaxis}
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
