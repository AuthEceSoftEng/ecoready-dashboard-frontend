import { Grid, Typography } from "@mui/material";
import { memo, useMemo, useRef } from "react";

import Card from "../components/Card.js";
import Plot from "../components/Plot.js";
import { groupByKey, findKeyByText } from "../utils/data-handling-functions.js";
import { LoadingIndicator, StickyBand, DataWarning } from "../utils/rendering-items.js";
import { europeanCountries, lcaIndicators, OPPORTUNITY_LEVELS, RISK_LEVELS, RISK_COLOR_MAP, OPPORTUNITY_LEVEL_ORDER, RISK_LEVEL_ORDER } from "../utils/useful-constants.js";

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================
const EU_COUNTRIES = europeanCountries.filter((country) => country.isEU === true);
const ALL_INDICATOR_OPTIONS = new Set(lcaIndicators.flatMap((category) => category.options));

// Create lookup maps for better performance
const INDICATOR_TO_CATEGORY = new Map();
for (const category of lcaIndicators) {
	for (const [index, option] of category.options.entries()) {
		INDICATOR_TO_CATEGORY.set(option, {
			label: category.label,
			description: category.desc[index] || "No description available",
		});
	}
}

// Get levels in processing order
const getAllLevels = (isOpportunity = false) => (isOpportunity ? OPPORTUNITY_LEVELS : RISK_LEVELS);

// Get levels in legend display order (reversed for risk)
const getLegendLevels = (isOpportunity = false) => {
	if (isOpportunity) {
		return [...OPPORTUNITY_LEVELS].reverse();
	}

	return [...RISK_LEVELS].reverse();
};

const getRiskColor = (level) => RISK_COLOR_MAP[level] || "#BDBDBD";

// Add this new function
const capitalizeWords = (str) => str.split(" ").map((word) => word.charAt(0).toUpperCase() + word.slice(1)).join(" ");

const isOpportunityIndicator = (indicator) => indicator === "Contribution of the sector to economic development";

const getRiskScaleAxis = () => ({
	tickmode: "array",
	tickvals: [0.05, 1, 2, 3, 4, 5],
	ticktext: ["No Data", "Very Low Risk", "Low Risk", "Medium Risk", "High Risk", "Very High Risk"],
	range: [0, 5],
});

const getOpportunityScaleAxis = () => ({
	tickmode: "array",
	tickvals: [0.05, 1, 2, 3],
	ticktext: ["No Opportunity", "Low Opportunity", "Medium Opportunity", "High Opportunity"],
	range: [0, 3],
});

const getYAxisForIndicator = (indicator) => (indicator === "Contribution of the sector to economic development"
	? getOpportunityScaleAxis()
	: getRiskScaleAxis());

const truncateText = (text, maxLength) => (text.length > maxLength ? `${text.slice(0, maxLength)}...` : text);

// Update the utility function to handle both scales
const getLevelOrder = (level, isOpportunity = false) => {
	if (isOpportunity) {
		return OPPORTUNITY_LEVEL_ORDER[level] === undefined ? 0 : OPPORTUNITY_LEVEL_ORDER[level];
	}

	return RISK_LEVEL_ORDER[level] === undefined ? 0 : RISK_LEVEL_ORDER[level];
};

// ============================================================================
// CHART CREATION FUNCTIONS
// ============================================================================

// Optimize processIndicatorData function
const processIndicatorData = (item, selectedIndicator) => {
	const { risk_level: level, score, indicator } = item;
	const isOpportunity = isOpportunityIndicator(indicator);
	const categoryInfo = INDICATOR_TO_CATEGORY.get(indicator);

	return {
		level,
		score,
		indicator,
		isOpportunity,
		isSelected: indicator === selectedIndicator,
		category: categoryInfo?.label || "Unknown Category",
		description: categoryInfo?.description || "No description available",
		levelOrder: getLevelOrder(level, isOpportunity),
		color: getRiskColor(level),
		truncatedIndicator: truncateText(indicator, isOpportunity ? 25 : 30),
	};
};

// Optimize groupDataByLevel with Map for better performance
const groupDataByLevel = (processedData, isOpportunity) => {
	const grouped = new Map();

	for (const item of processedData) {
		if (item.isOpportunity !== isOpportunity) continue;

		if (!grouped.has(item.level)) {
			grouped.set(item.level, {
				indicators: [],
				scores: [],
				colors: [],
				fullIndicators: [],
				categories: [],
				descriptions: [],
			});
		}

		const group = grouped.get(item.level);
		group.indicators.push(item.truncatedIndicator);
		group.fullIndicators.push(item.indicator);
		group.categories.push(item.category);
		group.descriptions.push(item.description);
		group.scores.push(item.levelOrder);
		group.colors.push(item.color);
	}

	return Object.fromEntries(grouped);
};

// Add a utility function to wrap text
const wrapText = (text, maxLength = 50) => {
	if (!text || text.length <= maxLength) return text;

	const words = text.split(" ");
	const lines = [];
	let currentLine = "";

	for (const word of words) {
		if ((currentLine + word).length <= maxLength) {
			currentLine += (currentLine ? " " : "") + word;
		} else {
			if (currentLine) lines.push(currentLine);
			currentLine = word;
		}
	}

	if (currentLine) lines.push(currentLine);

	return lines.join("<br>");
};

// Simplified hover template creation
const createHoverTemplate = (isOpportunity) => {
	const levelType = isOpportunity ? "Opportunity" : "Risk";
	return "<b>%{customdata[0]}</b><br>"
		+ "<b>Description:</b><br>%{customdata[2]}<br>"
		+ "<b>Category:</b> <i>%{customdata[1]}</i><br>"
		+ `<b>${levelType} Level:</b> <i>%{x}</i><br>`
		+ "<extra></extra>";
};

// Add after wrapText function:
const createStandardHoverTemplate = (levelType, includeDescription = true) => {
	let template = "<b>%{customdata[0]}</b><br>";
	template += includeDescription ? "<b>Description:</b><br>%{customdata[2]}<br>" : "(<i>%{customdata[2]}</i>)<br>";
	template += `<b>${levelType} Level:</b> <i>%{customdata[1]}</i><br><extra></extra>`;
	return template;
};

const separateSelectedData = (indicators, scores, levels, colors, descriptions, selected) => {
	const selectedData = { indicators: [], scores: [], levels: [], colors: [], descriptions: [] };
	const otherData = { indicators: [], scores: [], levels: [], colors: [], descriptions: [] };

	for (const [index, indicator] of indicators.entries()) {
		const target = selected[index] ? selectedData : otherData;
		target.indicators.push(indicator);
		target.scores.push(scores[index]);
		target.levels.push(levels[index]);
		target.colors.push(colors[index]);
		target.descriptions.push(descriptions[index]);
	}

	return { selectedData, otherData };
};

// Update the createTraces function to handle bold formatting for selected indicator
const createTraces = (groupedData, isOpportunity, selectedIndicator = null) => Object.entries(groupedData).map(([level, data]) => {
	const trace = {
		x: data.scores,
		y: data.indicators.map((indicator, index) => {
			// Make the selected indicator bold
			const fullIndicator = data.fullIndicators[index];
			if (selectedIndicator && fullIndicator === selectedIndicator) {
				return `<b>${indicator}</b>`;
			}

			return indicator;
		}),
		type: "bar",
		orientation: "h",
		xaxis: isOpportunity ? "x2" : "x1",
		name: `${level.charAt(0).toUpperCase() + level.slice(1)}`,
		color: data.colors,
		text: data.scores.map(() => level.toUpperCase()),
		hovertemplate: createHoverTemplate(isOpportunity),
		customdata: data.fullIndicators.map((indicator, index) => [
			indicator,
			data.categories[index],
			data.descriptions[index],
		]),
	};

	return trace;
});

// Updated createIndicatorRiskChart function to handle new indicatorsData structure
const createIndicatorRiskChart = (indicatorsData, selectedIndicator, selectedCountry, compareCountries, isOpportunity) => {
	if (!selectedIndicator || !indicatorsData || Object.keys(indicatorsData).length === 0) return [];

	// Get parent category and description for the selected indicator
	const parentCategory = lcaIndicators.find((category) => category.options.includes(selectedIndicator));
	const indicatorIndex = parentCategory?.options.indexOf(selectedIndicator) ?? -1;
	const description = parentCategory?.desc[indicatorIndex] || "No description available";

	// Create a Set of all countries to include (selected + compare countries)
	const allCountries = new Set();

	// Always include the selected country
	if (selectedCountry) {
		allCountries.add(selectedCountry?.value || selectedCountry);
	}

	// Add compare countries
	if (compareCountries && compareCountries.length > 0) {
		if (compareCountries.includes("European Union")) {
			// Add all countries that have data in indicatorsData
			for (const countryValue of Object.keys(indicatorsData)) {
				allCountries.add(countryValue);
			}
		} else {
			for (const countryText of compareCountries) {
				const countryValue = findKeyByText(EU_COUNTRIES, countryText);
				if (countryValue !== countryText) { // Only add if found
					allCountries.add(countryValue);
				}
			}
		}
	}

	// If no countries are selected, return empty
	if (allCountries.size === 0) return [];

	// Create data arrays for all countries
	const countryNames = [];
	const riskLevels = [];
	const customData = [];

	// Process each country
	for (const countryValue of allCountries) {
		let indicatorData = null;

		// Check if this country has data in indicatorsData
		if (indicatorsData[countryValue]) {
			const countryData = indicatorsData[countryValue];

			// Find the specific indicator in this country's data
			indicatorData = countryData.find((item) => item.indicator === selectedIndicator);
		}

		if (indicatorData) {
			const countryDetails = EU_COUNTRIES.find((c) => c.value === countryValue);
			const countryName = countryDetails?.text || countryValue;

			countryNames.push(countryName);
			riskLevels.push(getLevelOrder(indicatorData.risk_level, isOpportunity));
			customData.push([countryName, indicatorData.risk_level, description]);
		}
	}

	// Create a single trace with all countries
	if (countryNames.length > 0) {
		const trace = {
			x: countryNames,
			y: riskLevels,
			type: "bar",
			hovertemplate:
				"<b>%{customdata[0]}</b><br>"
				+ "<b>Description:</b><br>"
				+ "%{customdata[2]}<br>"
				+ `<b>${isOpportunity ? "Opportunity" : "Risk"} Level:</b> %{customdata[1]}<br>`
				+ "<extra></extra>",
			customdata: customData.map(([country, level, desc]) => [
				country,
				capitalizeWords(level),
				wrapText(desc, 60),
			]),
		};

		return [trace];
	}

	return [];
};

const createCountryIndicatorsChart = (riskAssessmentData, selectedIndicator = null, ascending = true) => {
	if (riskAssessmentData.length === 0) return [];

	const processedData = riskAssessmentData.map((item) => processIndicatorData(item, selectedIndicator));

	// Group data by type and selection status
	const groupedRisk = groupDataByLevel(processedData, false);
	const groupedOpportunity = groupDataByLevel(processedData, true);

	// Use utility functions instead of hardcoded arrays
	const allRiskLevels = getAllLevels(false);
	const allOpportunityLevels = getAllLevels(true);

	// Create traces for existing data
	const riskTraces = createTraces(groupedRisk, false, selectedIndicator);
	const opportunityTraces = createTraces(groupedOpportunity, true, selectedIndicator);

	// Create dummy traces for missing risk levels
	const existingRiskLevels = Object.keys(groupedRisk);
	const missingRiskLevels = allRiskLevels.filter((level) => !existingRiskLevels.includes(level));

	const dummyRiskTraces = missingRiskLevels.map((level) => ({
		x: [level],
		y: [null],
		type: "bar",
		orientation: "h",
		xaxis: "x1",
		name: `${level.charAt(0).toUpperCase() + level.slice(1)}`,
		color: getRiskColor(level),
		showlegend: true,
		hovertemplate: "<extra></extra>",
	}));

	// Create dummy traces for missing opportunity levels
	const existingOpportunityLevels = Object.keys(groupedOpportunity);
	const missingOpportunityLevels = allOpportunityLevels.filter((level) => !existingOpportunityLevels.includes(level));

	const dummyOpportunityTraces = missingOpportunityLevels.map((level) => ({
		x: [level],
		y: [null],
		type: "bar",
		orientation: "h",
		xaxis: "x2",
		name: `${level.charAt(0).toUpperCase() + level.slice(1)}`,
		color: getRiskColor(level),
		showlegend: true,
		opacity: 0,
		hovertemplate: "<extra></extra>",
	}));

	// Sort and combine all traces
	const sortedRiskTraces = [...riskTraces, ...dummyRiskTraces].sort((a, b) => {
		const levelA = a.name.toLowerCase();
		const levelB = b.name.toLowerCase();
		return ascending ? getLevelOrder(levelA, false) - getLevelOrder(levelB, false)
			: -(getLevelOrder(levelA, false) - getLevelOrder(levelB, false));
	});

	const sortedOpportunityTraces = [...opportunityTraces, ...dummyOpportunityTraces].sort((a, b) => {
		const levelA = a.name.toLowerCase().replace(" (opportunity)", "");
		const levelB = b.name.toLowerCase().replace(" (opportunity)", "");
		return getLevelOrder(levelA, true) - getLevelOrder(levelB, true);
	});

	return [
		...sortedRiskTraces,
		...sortedOpportunityTraces,
	];
};

// Replace the createCategoryBarChart function
const createCategoryBarChart = (riskAssessmentData, selectedIndicator, selectedCountry) => {
	if (!selectedIndicator) return [];

	const parentCategory = lcaIndicators.find((category) => category.options.includes(selectedIndicator));
	if (!parentCategory) return [];

	const countryValue = selectedCountry?.value || selectedCountry;
	const chartData = {
		riskIndicators: [],
		opportunityIndicators: [],
		riskScores: [],
		opportunityScores: [],
		riskLevels: [],
		opportunityLevels: [],
		riskColors: [],
		opportunityColors: [],
		riskDescriptions: [],
		opportunityDescriptions: [],
		riskSelected: [],
		opportunitySelected: [],
	};

	// Collect data for all indicators in this category
	for (const indicator of parentCategory.options) {
		const indicatorData = riskAssessmentData.find((item) => item.indicator === indicator && item.key === countryValue);

		if (indicatorData) {
			const { risk_level: level } = indicatorData;
			const isOpportunity = isOpportunityIndicator(indicator);
			const indicatorIndex = parentCategory.options.indexOf(indicator);
			const description = parentCategory.desc[indicatorIndex] || "No description available";
			const isSelected = indicator === selectedIndicator;

			if (isOpportunity) {
				chartData.opportunityIndicators.push(indicator);
				chartData.opportunityScores.push(getLevelOrder(level, true));
				chartData.opportunityLevels.push(level);
				chartData.opportunityColors.push(getRiskColor(level));
				chartData.opportunityDescriptions.push(description);
				chartData.opportunitySelected.push(isSelected);
			} else {
				chartData.riskIndicators.push(indicator);
				chartData.riskScores.push(getLevelOrder(level, false));
				chartData.riskLevels.push(level);
				chartData.riskColors.push(getRiskColor(level));
				chartData.riskDescriptions.push(description);
				chartData.riskSelected.push(isSelected);
			}
		}
	}

	const traces = [];

	// Create traces for risk indicators
	if (chartData.riskIndicators.length > 0) {
		const { selectedData: selectedRiskData, otherData: otherRiskData } = separateSelectedData(
			chartData.riskIndicators, chartData.riskScores, chartData.riskLevels, chartData.riskColors, chartData.riskDescriptions, chartData.riskSelected,
		);

		if (otherRiskData.indicators.length > 0) {
			traces.push({
				x: otherRiskData.indicators.map((indicator) => truncateText(indicator, 20)),
				y: otherRiskData.scores,
				type: "bar",
				color: otherRiskData.colors,
				yaxis: "y",
				showlegend: false,
				hovertemplate: createStandardHoverTemplate("Risk"),
				customdata: otherRiskData.indicators.map((indicator, index) => [
					indicator,
					capitalizeWords(otherRiskData.levels[index]),
					wrapText(otherRiskData.descriptions[index], 60),
				]),
			});
		}

		if (selectedRiskData.indicators.length > 0) {
			traces.push({
				x: selectedRiskData.indicators.map((indicator) => `<b>${truncateText(indicator, 15)}</b>`),
				y: selectedRiskData.scores,
				type: "bar",
				color: selectedRiskData.colors,
				yaxis: "y",
				showlegend: false,
				hovertemplate: createStandardHoverTemplate("Risk", false),
				customdata: selectedRiskData.indicators.map((indicator, index) => [
					indicator,
					capitalizeWords(selectedRiskData.levels[index]),
					selectedRiskData.descriptions[index],
				]),
			});
		}
	}

	// Create traces for opportunity indicators
	if (chartData.opportunityIndicators.length > 0) {
		const { selectedData: selectedOpportunityData, otherData: otherOpportunityData } = separateSelectedData(
			chartData.opportunityIndicators, chartData.opportunityScores, chartData.opportunityLevels, chartData.opportunityColors, chartData.opportunityDescriptions, chartData.opportunitySelected,
		);

		if (otherOpportunityData.indicators.length > 0) {
			traces.push({
				x: otherOpportunityData.indicators.map((indicator) => truncateText(indicator, 20)),
				y: otherOpportunityData.scores,
				type: "bar",
				color: otherOpportunityData.colors,
				yaxis: "y2",
				showlegend: false,
				hovertemplate: createStandardHoverTemplate("Opportunity", false),
				customdata: otherOpportunityData.indicators.map((indicator, index) => [
					indicator,
					capitalizeWords(otherOpportunityData.levels[index]),
					wrapText(otherOpportunityData.descriptions[index], 60),
				]),
			});
		}

		if (selectedOpportunityData.indicators.length > 0) {
			traces.push({
				x: selectedOpportunityData.indicators.map((indicator) => `<b>${truncateText(indicator, 20)}</b>`),
				y: selectedOpportunityData.scores,
				type: "bar",
				color: selectedOpportunityData.colors,
				yaxis: "y2",
				showlegend: false,
				hovertemplate: createStandardHoverTemplate("Opportunity", false),
				customdata: selectedOpportunityData.indicators.map((indicator, index) => [
					indicator,
					capitalizeWords(selectedOpportunityData.levels[index]),
					selectedOpportunityData.descriptions[index],
				]),
			});
		}
	}

	// Add legend traces for risk levels
	const riskLegendLevels = getLegendLevels(false);
	for (const level of riskLegendLevels) {
		traces.push({
			x: [null],
			y: [null],
			type: "bar",
			color: getRiskColor(level),
			name: capitalizeWords(level),
			showlegend: true,
			hoverinfo: "skip",
		});
	}

	const result = { traces };

	// Add opportunity legend and separator for Economic & Social Development category
	if (parentCategory.label === "Economic & Social Development"
		&& chartData.riskIndicators.length > 0 && chartData.opportunityIndicators.length > 0) {
		const opportunityLegendLevels = getLegendLevels(true);
		for (const level of opportunityLegendLevels) {
			traces.push({
				x: [null],
				y: [null],
				type: "bar",
				color: getRiskColor(level),
				name: capitalizeWords(level),
				showlegend: true,
				hoverinfo: "skip",
			});
		}

		const separatorPosition = chartData.riskIndicators.length - 0.5;
		result.shapes = [{
			type: "line",
			xref: "x",
			x0: separatorPosition,
			x1: separatorPosition,
			yref: "paper",
			y0: 0,
			y1: 1,
			line: { color: "#666666", width: 2, dash: "dash" },
		}];
		result.isOpportunityState = true;
	}

	return result;
};

// ============================================================================
// CUSTOM HOOKS
// ============================================================================

const useChartData = (dataSets, selectedCountry, compareCountries) => {
	const { metrics, indicatorsData, selectedCountryMetrics, countryMetrics } = useMemo(() => {
		if (!dataSets || Object.keys(dataSets).length === 0) {
			return { metrics: [], indicatorsData: [], selectedCountryMetrics: [], countryMetrics: {} };
		}

		const selectedCountryCode = selectedCountry?.value || selectedCountry;
		const countryMetrics = {};
		let allMetrics = [];
		let selectedCountryMetrics = [];

		// Get selected country data
		if (selectedCountry) {
			const metricsKey = `metrics_${selectedCountryCode}`;
			if (dataSets[metricsKey]) {
				selectedCountryMetrics = dataSets[metricsKey];
				countryMetrics[selectedCountryCode] = dataSets[metricsKey];
			}
		}

		// Get data for compare countries
		if (compareCountries && compareCountries.length > 0) {
			for (const countryText of compareCountries) {
				const countryCode = findKeyByText(EU_COUNTRIES, countryText);

				if (countryCode !== countryText) {
					const metricsKey = `metrics_${countryCode}`;
					if (dataSets[metricsKey]) {
						const countryData = dataSets[metricsKey];
						const filteredData = metricsKey === "metrics_EU"
							? countryData.filter((item) => item.key !== selectedCountryCode)
							: countryData;
						allMetrics = [...allMetrics, ...filteredData];
					}
				}
			}
		}

		if (allMetrics.length === 0) {
			allMetrics = selectedCountryMetrics;
		}

		const indicators = dataSets.indicators || [];

		return { metrics: allMetrics, indicatorsData: indicators, selectedCountryMetrics, countryMetrics };
	}, [dataSets, selectedCountry, compareCountries]);

	const { riskAssessmentData, selectedCountryRiskData } = useMemo(() => {
		if (metrics.length === 0) {
			return { riskAssessmentData: [], selectedCountryRiskData: [] };
		}

		const filteredData = metrics.filter((metric) => ALL_INDICATOR_OPTIONS.has(metric.indicator));
		const selectedCountryFiltered = selectedCountryMetrics.filter((metric) => ALL_INDICATOR_OPTIONS.has(metric.indicator));

		return {
			riskAssessmentData: filteredData,
			selectedCountryRiskData: selectedCountryFiltered,
		};
	}, [metrics, selectedCountryMetrics]);

	return { riskAssessmentData, indicatorsData, selectedCountryRiskData };
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================

const MAGNETGraphs = ({
	selections,
	updateSelection,
	updateCompareCountries,
	dataSets,
	isLoading,
	isOpportunityState,
}) => {
	const { riskAssessmentData, indicatorsData, selectedCountryRiskData } = useChartData(dataSets, selections.country, selections.compareCountries);
	const groupedByCountryRiskData = useMemo(() => groupByKey(riskAssessmentData, "key"), [riskAssessmentData]);

	const countryCompareDropdown = useMemo(() => ({
		id: "country-compare-dropdown",
		label: "Compare Countries",
		items: EU_COUNTRIES.filter((country) => country.value !== selections.country?.value),
		multiple: true,
		value: selections.compareCountries, // Use the array state
		onChange: (event) => updateCompareCountries(event.target.value), // Use the correct function
	}), [selections.country, selections.compareCountries, updateCompareCountries]);

	const radioRef = useRef();
	// Radio button for sorting order
	const sortOrderRadio = useMemo(() => ({
		customType: "radio",
		id: "sort-order-radio",
		label: "Sorting Order",
		defaultValue: selections.asc,
		items: [
			{ value: true, label: "Ascending" },
			{ value: false, label: "Descending" },
		],
		row: true,
		onChange: (event) => updateSelection("asc", event.target.value === "true"),
	}), [selections.asc, updateSelection]);

	const indicatorRiskByCountryData = useMemo(() => createIndicatorRiskChart(
		groupedByCountryRiskData,
		selections.indicator,
		selections.country,
		selections.compareCountries,
		isOpportunityState,
	), [groupedByCountryRiskData, selections.indicator, selections.country, selections.compareCountries, isOpportunityState]);

	const categoryBarChartData = useMemo(() => createCategoryBarChart(selectedCountryRiskData, selections.indicator, selections.country),
		[selectedCountryRiskData, selections.indicator, selections.country]);

	const countryIndicatorsChartData = useMemo(() => createCountryIndicatorsChart(selectedCountryRiskData, selections.indicator, selections.asc),
		[selectedCountryRiskData, selections.indicator, selections.asc]);

	const selectedCategory = useMemo(() => lcaIndicators.find((cat) => cat.options.includes(selections.indicator)),
		[selections.indicator]);

	// Add this new useMemo for the indicator description
	const indicatorDescription = useMemo(() => {
		if (!selections.indicator || !selectedCategory) return "";

		const indicatorIndex = selectedCategory.options.indexOf(selections.indicator);
		return selectedCategory.desc[indicatorIndex] || "No description available for this indicator.";
	}, [selections.indicator, selectedCategory]);

	// ============================================================================
	// RENDER
	// ============================================================================

	return (
		<Grid container style={{ width: "100%", minHeight: "calc(100vh - 280px)" }} display="flex" direction="row" justifyContent="space-around" spacing={1}>

			{/* Indicator Description Card */}
			<Grid item xs={12}>
				<Card title={`About: ${selections.indicator}`}>
					<Typography
						variant="heading2"
						sx={{
							padding: 1,
							lineHeight: 1,
							textAlign: "center",
							display: "flex",
							alignItems: "center",
							justifyContent: "center",
						}}
					>
						{indicatorDescription}
					</Typography>
				</Card>
			</Grid>

			<Grid item xs={12} md={12}>
				<Grid container spacing={1}>
					{/* Risk Scores Across EU Countries */}
					<Grid item xs={12} md={6} sx={{ display: "flex" }}>
						<Card
							title={`${selections.indicator} - ${isOpportunityState ? "Opportunity" : "Risk"} Scores Across ${selections.country.text}`}
							height="500px"
						>
							{isLoading ? (
								<LoadingIndicator minHeight="400px" />
							) : indicatorsData.length === 0 ? (
								<DataWarning
									minHeight="400px"
									message="No indicator data available"
								/>
							) : (
								<>
									<StickyBand sticky={false} dropdownContent={[countryCompareDropdown]} />
									<Plot
										data={indicatorRiskByCountryData}
										height="400px"
										showLegend={false}
										yaxis={getYAxisForIndicator(selections.indicator)}
										xaxis={{ tickangle: selections.compareCountries.includes("European Union") ? 45 : 0 }}
										layout={{
											margin: { l: 130, t: 10, b: 80 },
											dragmode: false,
										}}
									/>
								</>
							)}
						</Card>
					</Grid>

					{/* Category Indicators */}
					<Grid item xs={12} lg={6} sx={{ display: "flex" }}>
						<Card
							title={`${selections.country.text}'s ${selectedCategory?.label || "Category"} Indicators`}
							height="500px"
						>
							{isLoading ? (
								<LoadingIndicator minHeight="450px" />
							) : riskAssessmentData.length === 0 ? (
								<DataWarning
									minHeight="400px"
									message="No indicator data available for the selected category"
								/>
							) : (
								<Plot
									showLegend
									data={categoryBarChartData.traces}
									height="450px"
									yaxis={{
										primary: getRiskScaleAxis(),
										secondary: {
											...getOpportunityScaleAxis(),
											anchor: "x",
											overlaying: "y",
											side: "right",
										},
									}}
									layout={{
										margin: { l: 95, r: categoryBarChartData.isOpportunityState ? 250 : 130, t: 10, b: 100 },
										dragmode: false,
										legend: { x: categoryBarChartData.isOpportunityState ? 1.55 : 1 },
									}}
									shapes={categoryBarChartData.shapes}
								/>
							)}
						</Card>
					</Grid>
				</Grid>
			</Grid>

			{/* All Indicators for Selected Country */}
			<Grid item xs={12}>
				<Card title={`All Indicators - ${selections.country.text}`}>
					{isLoading ? (
						<LoadingIndicator minHeight="400px" />
					) : riskAssessmentData.length === 0 ? (
						<DataWarning
							minHeight="400px"
							message="No indicator data available for the selected country"
						/>
					) : (
						<>
							<StickyBand sticky={false} formRef={radioRef} formContent={[sortOrderRadio]} />

							<Plot
								height="600px"
								data={countryIndicatorsChartData}
								xaxis={{
									primary: getRiskScaleAxis(),
									secondary: {
										...getOpportunityScaleAxis(),
										anchor: "y",
										overlaying: "x1",
										side: "top",
									},
								}}
								layout={{
									margin: { l: 220, r: 40, t: 15, b: 20 },
									dragmode: false,
								}}
							/>
						</>
					)}
				</Card>
			</Grid>
		</Grid>
	);
};

export default memo(MAGNETGraphs);
