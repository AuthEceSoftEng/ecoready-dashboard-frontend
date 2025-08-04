import { useLocation } from "react-router-dom";
import { Grid, Button, Typography } from "@mui/material";
import { memo, useMemo, useState, useCallback, useEffect } from "react";

import colors from "../_colors.scss";
import Card from "../components/Card.js";
import Plot from "../components/Plot.js";
import Footer from "../components/Footer.js";
import useInit from "../utils/screen-init.js";
import { magnetConfigs, organization } from "../config/MagnetConfig.js";
import { extractFields, isValidArray, groupByKey, findKeyByText } from "../utils/data-handling-functions.js";
import { LoadingIndicator, StickyBand, DataWarning } from "../utils/rendering-items.js";
import { europeanCountries, lcaIndicators } from "../utils/useful-constants.js";

// ============================================================================
// CONSTANTS AND STATIC DATA
// ============================================================================

const EU_COUNTRIES = europeanCountries.filter((country) => country.isEU === true);

const RISK_COLOR_MAP = {
	// Risk levels - Green to Red gradient
	"very low risk": "#4CAF50",
	"low risk": "#8BC34A",
	"medium risk": "#FF9800",
	"high risk": "#f45c36ff",
	"very high risk": "#e10202ff",

	// Opportunity levels - Blue/Teal tones
	"no opportunity": "#9E9E9E",
	"low opportunity": "#f45c36ff",
	"medium opportunity": "#FF9800",
	"high opportunity": "#4CAF50",

	// Data availability
	"no data": "#757575",
};

const RISK_LEVEL_ORDER = {
	"very high risk": 5,
	"high risk": 4,
	"medium risk": 3,
	"low risk": 2,
	"very low risk": 1,
	"no data": 0.05,
};

const OPPORTUNITY_LEVEL_ORDER = {
	"high opportunity": 3,
	"medium opportunity": 2,
	"low opportunity": 1,
	"no opportunity": 0.05,
};

// Selected item colors
const SELECTION_COLOR = colors.third; // Gold color for selected indicator

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

const getRiskColor = (level) => RISK_COLOR_MAP[level] || "#BDBDBD";

const isOpportunityIndicator = (indicator) => indicator === "Contribution of the sector to economic development";

const getRiskScaleAxis = () => ({
	tickmode: "array",
	tickvals: [0.05, 1, 2, 3, 4, 5],
	ticktext: ["No Data", "Very Low Risk", "Low Risk", "Medium Risk", "High Risk", "Very High Risk"],
	range: [0, 5],
});

const getOpportunityScaleAxis = () => ({
	tickmode: "array",
	tickvals: [0, 1, 2, 3],
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
// Create a unified data processing function
const processIndicatorData = (item, selectedIndicator) => {
	const { risk_level: level, score, indicator } = item;
	const isOpportunity = isOpportunityIndicator(indicator);
	const isSelected = indicator === selectedIndicator;

	const parentCategory = lcaIndicators.find((category) => category.options.includes(indicator));
	const indicatorIndex = parentCategory?.options.indexOf(indicator) ?? -1;
	const description = parentCategory?.desc[indicatorIndex] || "No description available";

	return {
		level,
		score,
		indicator,
		isOpportunity,
		isSelected,
		category: parentCategory?.label || "Unknown Category",
		description,
		levelOrder: getLevelOrder(level, isOpportunity),
		color: isSelected ? SELECTION_COLOR : getRiskColor(level),
		truncatedIndicator: truncateText(indicator, isOpportunity ? 25 : 30),
	};
};

// Simplified data grouping function
const groupDataByLevel = (processedData, isOpportunity) => {
	const grouped = {};

	for (const item of processedData
		.filter((item) => item.isOpportunity === isOpportunity)) {
		if (!grouped[item.level]) {
			grouped[item.level] = {
				indicators: [],
				scores: [],
				colors: [],
				fullIndicators: [],
				categories: [],
				descriptions: [],
			};
		}

		const group = grouped[item.level];
		group.indicators.push(item.truncatedIndicator);
		group.fullIndicators.push(item.indicator);
		group.categories.push(item.category);
		group.descriptions.push(item.description);
		group.scores.push(item.levelOrder);
		group.colors.push(item.color);
	}

	return grouped;
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

// Simplified trace creation
const createTraces = (groupedData, isOpportunity, isSelected = false) => Object.entries(groupedData).map(([level, data]) => ({
	x: data.scores,
	y: data.indicators,
	type: "bar",
	orientation: "h",
	name: isSelected ? "Current Selection"
		: `${level.charAt(0).toUpperCase() + level.slice(1)}${isOpportunity ? " (Opportunity)" : ""}`,
	color: isSelected ? SELECTION_COLOR : data.colors,
	text: data.scores.map(() => level.toUpperCase()),
	...(isOpportunity && { xaxis: "x2" }),
	hovertemplate: createHoverTemplate(isOpportunity),
	customdata: data.fullIndicators.map((indicator, index) => [
		indicator,
		data.categories[index],
		data.descriptions[index],
	]),
}));

// Updated createIndicatorRiskChart function to handle new indicatorsData structure
const createIndicatorRiskChart = (indicatorsData, selectedIndicator, selectedCountry, compareCountries = []) => {
	if (!selectedIndicator || !indicatorsData || Object.keys(indicatorsData).length === 0) return [];

	const isOpportunity = isOpportunityIndicator(selectedIndicator);

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
				+ `<b>${isOpportunity ? "Opportunity" : "Risk"} Level:</b> %{customdata[1]}<br>`
				+ "<b>Description:</b><br>"
				+ "%{customdata[2]}<br>"
				+ "<extra></extra>",
			customdata: customData.map(([country, level, desc]) => [
				country,
				level,
				wrapText(desc, 60), // Wrap description text
			]),
		};

		return [trace];
	}

	return [];
};

const createCountryIndicatorsChart = (riskAssessmentData, selectedIndicator = null) => {
	if (riskAssessmentData.length === 0) return [];

	const processedData = riskAssessmentData.map((item) => processIndicatorData(item, selectedIndicator));

	// Separate selected and non-selected data
	const selectedData = processedData.filter((item) => item.isSelected);
	const nonSelectedData = processedData.filter((item) => !item.isSelected);

	// Group data by type and selection status
	const groupedRisk = groupDataByLevel(nonSelectedData, false);
	const groupedOpportunity = groupDataByLevel(nonSelectedData, true);
	const selectedRisk = groupDataByLevel(selectedData, false);
	const selectedOpportunity = groupDataByLevel(selectedData, true);

	// Create traces
	const riskTraces = createTraces(groupedRisk, false);
	const opportunityTraces = createTraces(groupedOpportunity, true);
	const selectedRiskTraces = createTraces(selectedRisk, false, true);
	const selectedOpportunityTraces = createTraces(selectedOpportunity, true, true);

	// Sort and combine
	const sortedRiskTraces = riskTraces.sort((a, b) => getLevelOrder(a.name.toLowerCase(), false) - getLevelOrder(b.name.toLowerCase(), false));

	const sortedOpportunityTraces = opportunityTraces.sort((a, b) => getLevelOrder(a.name.toLowerCase().replace(" (opportunity)", ""), true)
		- getLevelOrder(b.name.toLowerCase().replace(" (opportunity)", ""), true));

	return [
		...sortedOpportunityTraces,
		...sortedRiskTraces,
		...selectedOpportunityTraces,
		...selectedRiskTraces,
	];
};

// Replace the createCategoryBarChart function around line 350
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

	// Collect data for all indicators in this category, separating by type
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
				chartData.opportunityColors.push(isSelected ? SELECTION_COLOR : getRiskColor(level));
				chartData.opportunityDescriptions.push(description);
				chartData.opportunitySelected.push(isSelected);
			} else {
				chartData.riskIndicators.push(indicator);
				chartData.riskScores.push(getLevelOrder(level, false));
				chartData.riskLevels.push(level);
				chartData.riskColors.push(isSelected ? SELECTION_COLOR : getRiskColor(level));
				chartData.riskDescriptions.push(description);
				chartData.riskSelected.push(isSelected);
			}
		}
	}

	const traces = [];

	// Create traces for risk indicators
	if (chartData.riskIndicators.length > 0) {
		const selectedRiskData = {
			indicators: [],
			scores: [],
			levels: [],
			descriptions: [],
		};
		const otherRiskData = {
			indicators: [],
			scores: [],
			levels: [],
			colors: [],
			descriptions: [],
		};

		for (const [index, indicator] of chartData.riskIndicators.entries()) {
			if (chartData.riskSelected[index]) {
				selectedRiskData.indicators.push(indicator);
				selectedRiskData.scores.push(chartData.riskScores[index]);
				selectedRiskData.levels.push(chartData.riskLevels[index]);
				selectedRiskData.descriptions.push(chartData.riskDescriptions[index]);
			} else {
				otherRiskData.indicators.push(indicator);
				otherRiskData.scores.push(chartData.riskScores[index]);
				otherRiskData.levels.push(chartData.riskLevels[index]);
				otherRiskData.colors.push(chartData.riskColors[index]);
				otherRiskData.descriptions.push(chartData.riskDescriptions[index]);
			}
		}

		// Add trace for non-selected risk indicators
		if (otherRiskData.indicators.length > 0) {
			traces.push({
				x: otherRiskData.indicators.map((indicator) => truncateText(indicator, 20)),
				y: otherRiskData.scores,
				type: "bar",
				color: otherRiskData.colors,
				yaxis: "y",
				hovertemplate:
					"<b>%{customdata[0]}</b><br>"
					+ "<b>Description:</b><br>%{customdata[2]}<br>"
					+ "<b>Risk Level:</b> <i>%{customdata[1]}</i><br>"
					+ "<extra></extra>",
				customdata: otherRiskData.indicators.map((indicator, index) => [
					indicator,
					otherRiskData.levels[index],
					wrapText(otherRiskData.descriptions[index], 60),
				]),
			});
		}

		// Add trace for selected risk indicator
		if (selectedRiskData.indicators.length > 0) {
			traces.push({
				x: selectedRiskData.indicators.map((indicator) => truncateText(indicator, 20)),
				y: selectedRiskData.scores,
				type: "bar",
				name: "Current Selection",
				color: SELECTION_COLOR,
				yaxis: "y",
				hovertemplate:
					"<b>%{customdata[0]}</b><br>"
					+ "(<i>%{customdata[2]}</i>)<br>"
					+ "<b>Risk Level:</b> <i>%{customdata[1]}</i><br>"
					+ "<extra></extra>",
				customdata: selectedRiskData.indicators.map((indicator, index) => [
					indicator,
					selectedRiskData.levels[index],
					selectedRiskData.descriptions[index],
				]),
			});
		}
	}

	// Create traces for opportunity indicators
	if (chartData.opportunityIndicators.length > 0) {
		const selectedOpportunityData = {
			indicators: [],
			scores: [],
			levels: [],
			descriptions: [],
		};
		const otherOpportunityData = {
			indicators: [],
			scores: [],
			levels: [],
			colors: [],
			descriptions: [],
		};

		for (const [index, indicator] of chartData.opportunityIndicators.entries()) {
			if (chartData.opportunitySelected[index]) {
				selectedOpportunityData.indicators.push(indicator);
				selectedOpportunityData.scores.push(chartData.opportunityScores[index]);
				selectedOpportunityData.levels.push(chartData.opportunityLevels[index]);
				selectedOpportunityData.descriptions.push(chartData.opportunityDescriptions[index]);
			} else {
				otherOpportunityData.indicators.push(indicator);
				otherOpportunityData.scores.push(chartData.opportunityScores[index]);
				otherOpportunityData.levels.push(chartData.opportunityLevels[index]);
				otherOpportunityData.colors.push(chartData.opportunityColors[index]);
				otherOpportunityData.descriptions.push(chartData.opportunityDescriptions[index]);
			}
		}

		// Add trace for non-selected opportunity indicators
		if (otherOpportunityData.indicators.length > 0) {
			traces.push({
				x: otherOpportunityData.indicators.map((indicator) => truncateText(indicator, 20)),
				y: otherOpportunityData.scores,
				type: "bar",
				color: otherOpportunityData.colors,
				yaxis: "y2",
				hovertemplate:
					"<b>%{customdata[0]}</b><br>"
					+ "(<i>%{customdata[2]}</i>)<br>"
					+ "<b>Opportunity Level:</b> <i>%{customdata[1]}</i><br>"
					+ "<extra></extra>",
				customdata: otherOpportunityData.indicators.map((indicator, index) => [
					indicator,
					otherOpportunityData.levels[index],
					wrapText(otherOpportunityData.descriptions[index], 60),
				]),
			});
		}

		// Add trace for selected opportunity indicator
		if (selectedOpportunityData.indicators.length > 0) {
			traces.push({
				x: selectedOpportunityData.indicators.map((indicator) => truncateText(indicator, 20)),
				y: selectedOpportunityData.scores,
				type: "bar",
				name: "Current Selection",
				color: SELECTION_COLOR,
				yaxis: "y2",
				hovertemplate:
					"<b>%{customdata[0]}</b><br>"
					+ "(<i>%{customdata[2]}</i>)<br>"
					+ "<b>Opportunity Level:</b> <i>%{customdata[1]}</i><br>"
					+ "<extra></extra>",
				customdata: selectedOpportunityData.indicators.map((indicator, index) => [
					indicator,
					selectedOpportunityData.levels[index],
					selectedOpportunityData.descriptions[index],
				]),
			});
		}
	}

	// Create result object with traces and optional shape
	const result = { traces };

	// Add shape for separator line in "Economic & Social Development" category
	if (parentCategory.label === "Economic & Social Development"
		&& chartData.riskIndicators.length > 0 && chartData.opportunityIndicators.length > 0) {
		// Calculate the position for the separator line (between risk and opportunity indicators)
		const separatorPosition = chartData.riskIndicators.length - 0.5;

		result.shapes = [{
			type: "line",
			xref: "x",
			x0: separatorPosition,
			x1: separatorPosition,
			yref: "paper",
			y0: 0,
			y1: 1,
			line: {
				color: "#666666",
				width: 2,
				dash: "dash",
			},
		}];
	}

	return result;
};

// ============================================================================
// CUSTOM HOOKS
// ============================================================================

const useSelections = () => {
	const [selections, setSelections] = useState({
		country: EU_COUNTRIES[1],
		indicator: lcaIndicators[0].options[0],
		compareCountries: [EU_COUNTRIES[1].text],
	});

	const updateSelection = useCallback((key, value) => {
		setSelections((prev) => ({ ...prev, [key]: value }));
	}, []);

	const updateCountry = useCallback((countryText) => {
		// Replace this:
		// const country = EU_COUNTRIES.find((c) => c.text === countryText);

		// With this:
		const country = findKeyByText(EU_COUNTRIES, countryText, true);

		setSelections((prev) => ({
			...prev,
			country,
			compareCountries: [countryText],
		}));
	}, []);

	const updateIndicator = useCallback((selectedOption) => {
		const selectedCategory = lcaIndicators.find((cat) => cat.options.includes(selectedOption));
		updateSelection("indicator", selectedCategory ? selectedOption : "");
	}, [updateSelection]);

	const updateCompareCountries = useCallback((selectedCountries) => {
		updateSelection("compareCountries", selectedCountries);
	}, [updateSelection]);

	return { selections, updateCountry, updateIndicator, updateCompareCountries };
};

const useChartData = (dataSets, selectedCountry, compareCountries) => {
	const { metrics, indicatorsData, selectedCountryMetrics, countryMetrics } = useMemo(() => {
		if (!dataSets || Object.keys(dataSets).length === 0) {
			return { metrics: [], indicatorsData: [], selectedCountryMetrics: [], countryMetrics: {} };
		}

		let allMetrics = [];
		let indicators = [];
		let selectedCountryMetrics = [];
		const countryMetrics = {}; // Store metrics for each country individually
		const selectedCountryCode = selectedCountry?.value || selectedCountry;

		// Get the selected country's data specifically
		if (selectedCountry) {
			const metricsKey = `metrics_${selectedCountryCode}`;
			if (dataSets[metricsKey]) {
				selectedCountryMetrics = dataSets[metricsKey];
				countryMetrics[selectedCountryCode] = dataSets[metricsKey];
			}
		}

		// Get data for compare countries (includes selected country) - for first chart only
		if (compareCountries && compareCountries.length > 0) {
			for (const countryText of compareCountries) {
				const countryCode = findKeyByText(EU_COUNTRIES, countryText);

				if (countryCode !== countryText) { // Only proceed if country was found
					const metricsKey = `metrics_${countryCode}`;
					if (dataSets[metricsKey]) {
						const countryData = dataSets[metricsKey];
						// Filter out elements where key matches selectedCountry when dealing with EU data
						const filteredData = metricsKey === "metrics_EU"
							? countryData.filter((item) => item.key !== selectedCountryCode)
							: countryData;
						allMetrics = [...allMetrics, ...filteredData];
					}
				}
			}
		}

		// If no metrics from compare countries, use selected country data
		if (allMetrics.length === 0) {
			allMetrics = selectedCountryMetrics;
		}

		// Get indicators data - try "indicators" first, then fallback to country-specific
		if (dataSets.indicators) {
			indicators = dataSets.indicators;
		}

		return { metrics: allMetrics, indicatorsData: indicators, selectedCountryMetrics, countryMetrics };
	}, [dataSets, selectedCountry, compareCountries]);

	const { allIndicatorOptions, riskAssessmentData, selectedCountryRiskData, countryRiskData } = useMemo(() => {
		if (metrics.length === 0) {
			return {
				allIndicatorOptions: new Set(),
				riskAssessmentData: [],
				selectedCountryRiskData: [],
				countryRiskData: {},
			};
		}

		const options = new Set(lcaIndicators.flatMap((category) => category.options));
		console.log("Available Metrics:", metrics);
		const filteredData = metrics.filter((metric) => options.has(metric.indicator));
		const selectedCountryFiltered = selectedCountryMetrics.filter((metric) => options.has(metric.indicator));

		// Create filtered data for each country
		const countryRiskData = {};
		for (const [countryCode, countryData] of Object.entries(countryMetrics)) {
			countryRiskData[countryCode] = countryData.filter((metric) => options.has(metric.indicator));
		}

		return {
			allIndicatorOptions: options,
			riskAssessmentData: filteredData,
			selectedCountryRiskData: selectedCountryFiltered,
			countryRiskData,
		};
	}, [metrics, selectedCountryMetrics, countryMetrics]);

	return { riskAssessmentData, indicatorsData, selectedCountryRiskData, countryRiskData };
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================

const LcaMag = () => {
	const { selections, updateCountry, updateIndicator, updateCompareCountries } = useSelections();

	const [isOpportunityState, setIsOpportunityState] = useState(false);

	// Update state when indicator changes
	useEffect(() => {
		setIsOpportunityState(isOpportunityIndicator(selections.indicator));
	}, [selections.indicator]);

	// const isOpportunity = (indicator) => indicator === "Contribution of the sector to economic development";

	const fetchConfigs = useMemo(() => {
		const compareCountries = (selections.compareCountries || []).map((countryText) => findKeyByText(EU_COUNTRIES, countryText));

		return magnetConfigs(compareCountries, selections.indicator || null);
	}, [selections.indicator, selections.compareCountries]);

	const { state } = useInit(organization, fetchConfigs);
	const { isLoading, dataSets } = state;

	const { riskAssessmentData, indicatorsData, selectedCountryRiskData, countryRiskData } = useChartData(dataSets, selections.country, selections.compareCountries);
	console.log("Risk Assessment Data:", riskAssessmentData);
	console.log("Indicators Data:", indicatorsData);

	const groupedByCountryRiskData = useMemo(() => groupByKey(riskAssessmentData, "key"), [riskAssessmentData]);
	console.log("Grouped by Country Risk Data:", groupedByCountryRiskData);

	// Dropdown configurations with proper null checks
	const countryDropdown = useMemo(() => ({
		id: "country-dropdown",
		label: "Select Country",
		items: EU_COUNTRIES,
		value: selections.country?.text || "",
		onChange: (event) => updateCountry(event.target.value),
	}), [selections.country, updateCountry]);

	const indicatorDropdown = useMemo(() => ({
		id: "indicator-dropdown",
		label: "Select Indicator",
		items: lcaIndicators,
		value: selections.indicator,
		subheader: true,
		onChange: (event) => updateIndicator(event.target.value),
	}), [selections.indicator, updateIndicator]);

	const countryCompareDropdown = useMemo(() => ({
		id: "country-compare-dropdown",
		label: "Compare Countries",
		items: EU_COUNTRIES.filter((country) => country.value !== selections.country?.value),
		multiple: true,
		value: selections.compareCountries, // Use the array state
		onChange: (event) => updateCompareCountries(event.target.value), // Use the correct function
	}), [selections.country, selections.compareCountries, updateCompareCountries]);

	const indicatorRiskByCountryData = useMemo(() => createIndicatorRiskChart(
		groupedByCountryRiskData,
		selections.indicator,
		selections.country,
		selections.compareCountries,
	), [groupedByCountryRiskData, selections.indicator, selections.country, selections.compareCountries]);

	const categoryBarChartData = useMemo(() => createCategoryBarChart(selectedCountryRiskData, selections.indicator, selections.country),
		[selectedCountryRiskData, selections.indicator, selections.country]);

	// Chart data memoization
	const countryIndicatorsChartData = useMemo(() => {
		const selectedCountryCode = selections.country?.value || selections.country;

		// Use the grouped data directly instead of filtering
		const countryRiskData = groupedByCountryRiskData[selectedCountryCode] || [];

		return createCountryIndicatorsChart(countryRiskData, selections.indicator);
	}, [groupedByCountryRiskData, selections.indicator, selections.country]);

	const selectedCategory = useMemo(() => lcaIndicators.find((cat) => cat.options.includes(selections.indicator)),
		[selections.indicator]);

	// ============================================================================
	// RENDER
	// ============================================================================

	return (
		<Grid container display="flex" direction="row" justifyContent="space-around" spacing={1}>
			<StickyBand dropdownContent={[countryDropdown, indicatorDropdown]} />

			{selections.indicator && (
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
												margin: { l: 110, t: 10, b: 80 },
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
								{riskAssessmentData.length === 0 ? (
									<DataWarning
										minHeight="400px"
										message="No indicator data available for the selected category"
									/>
								) : (
									<Plot
										data={categoryBarChartData.traces}
										height="450px"
										showLegend={false}
										yaxis={{
											primary: getRiskScaleAxis(),
											secondary: isOpportunityIndicator ? {
												...getOpportunityScaleAxis(),
												anchor: "x",
												overlaying: "y",
												side: "right",
											} : {},
										}}
										layout={{
											margin: { l: 110, r: 110, t: 10, b: 100 },
										}}
										shapes={categoryBarChartData.shapes}
									/>
								)}
							</Card>
						</Grid>
					</Grid>
				</Grid>
			)}

			{/* All Indicators for Selected Country */}
			<Grid item xs={12} mb={2}>
				<Card title={`All Indicators - ${selections.country.text}`}>
					{isLoading ? (
						<LoadingIndicator minHeight="400px" />
					) : riskAssessmentData.length === 0 ? (
						<DataWarning
							minHeight="400px"
							message="No indicator data available for the selected country"
						/>
					) : (
						<Plot
							height="600px"
							data={countryIndicatorsChartData}
							xaxis={{ primary: { ...getRiskScaleAxis() }, secondary: { ...getOpportunityScaleAxis(), anchor: "y", overlaying: "x", side: "top" } }}
							layout={{
								margin: { l: 220, r: 40, t: 10, b: 20 },
							}}
						/>
					)}
				</Card>
			</Grid>
			{/* Footer */}

			<Footer
				sticky
				customMessage={(
					<>
						<Typography component="span" sx={{ fontWeight: "bold", fontSize: "0.875rem" }}>
							{"Acknowledgement of Data Source:"}
						</Typography>
						{" "}
						{"The Observatory presents aggregated results based on data from the PSILCA database by GreenDelta GmbH, used under a Business Starter license. All rights to the data remain with GreenDelta. No raw data is disclosed."}
						<br />
					</>
				)}
				customLink={{
					url: "https://www.greendelta.com",
					text: "Learn more at: https://www.greendelta.com",
				}}
				showDefaultCopyright={false}
			/>

		</Grid>
	);
};

export default memo(LcaMag);
