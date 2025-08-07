import { Grid } from "@mui/material";
import { memo, useMemo, useState, useEffect, useCallback, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";

import colors from "../_colors.scss";
import MapComponent, { getColor } from "../components/Map.js";
import { SecondaryBackgroundButton } from "../components/Buttons.js";
import Switch from "../components/Switch.js";
import useInit from "../utils/screen-init.js";
import { LoadingIndicator, StickyBand } from "../utils/rendering-items.js";
import { findKeyByText } from "../utils/data-handling-functions.js";
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

	// Opportunity levels
	"no opportunity": "#9E9E9E",
	"low opportunity": "#4DB6AC",
	"medium opportunity": "#26A69A",
	"high opportunity": "#00695C",

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

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

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
		color: getRiskColor(level),
		truncatedIndicator: truncateText(indicator, isOpportunity ? 25 : 30),
	};
};

// Simplified data grouping function
const groupDataByLevel = (processedData, isOpportunity) => {
	const grouped = {};

	for (const item of processedData
		.filter((row) => row.isOpportunity === isOpportunity)) {
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

	// Define all possible levels from RISK_COLOR_MAP
	const allRiskLevels = ["very low risk", "low risk", "medium risk", "high risk", "very high risk", "no data"];
	const allOpportunityLevels = ["no opportunity", "low opportunity", "medium opportunity", "high opportunity"];

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
		const selectedRiskData = {
			indicators: [],
			scores: [],
			levels: [],
			colors: [],
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
				selectedRiskData.colors.push(chartData.riskColors[index]);
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
				showlegend: false,
				hovertemplate:
					"<b>%{customdata[0]}</b><br>"
					+ "<b>Description:</b><br>%{customdata[2]}<br>"
					+ "<b>Risk Level:</b> <i>%{customdata[1]}</i><br>"
					+ "<extra></extra>",
				customdata: otherRiskData.indicators.map((indicator, index) => [
					indicator,
					capitalizeWords(otherRiskData.levels[index]),
					wrapText(otherRiskData.descriptions[index], 60),
				]),
			});
		}

		// Add trace for selected risk indicator
		if (selectedRiskData.indicators.length > 0) {
			traces.push({
				x: selectedRiskData.indicators.map((indicator) => `<b>${truncateText(indicator, 15)}</b>`),
				y: selectedRiskData.scores,
				type: "bar",
				color: selectedRiskData.colors,
				yaxis: "y",
				showlegend: false,
				hovertemplate:
					"<b>%{customdata[0]}</b><br>"
					+ "(<i>%{customdata[2]}</i>)<br>"
					+ "<b>Risk Level:</b> <i>%{customdata[1]}</i><br>"
					+ "<extra></extra>",
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
		const selectedOpportunityData = {
			indicators: [],
			scores: [],
			levels: [],
			colors: [],
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
				selectedOpportunityData.colors.push(chartData.opportunityColors[index]);
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
				showlegend: false,
				hovertemplate:
					"<b>%{customdata[0]}</b><br>"
					+ "(<i>%{customdata[2]}</i>)<br>"
					+ "<b>Opportunity Level:</b> <i>%{customdata[1]}</i><br>"
					+ "<extra></extra>",
				customdata: otherOpportunityData.indicators.map((indicator, index) => [
					indicator,
					capitalizeWords(otherOpportunityData.levels[index]),
					wrapText(otherOpportunityData.descriptions[index], 60),
				]),
			});
		}

		// Add trace for selected opportunity indicator
		if (selectedOpportunityData.indicators.length > 0) {
			traces.push({
				x: selectedOpportunityData.indicators.map((indicator) => `<b>${truncateText(indicator, 20)}</b>`),
				y: selectedOpportunityData.scores,
				type: "bar",
				color: selectedOpportunityData.colors,
				yaxis: "y2",
				showlegend: false,
				hovertemplate:
					"<b>%{customdata[0]}</b><br>"
					+ "(<i>%{customdata[2]}</i>)<br>"
					+ "<b>Opportunity Level:</b> <i>%{customdata[1]}</i><br>"
					+ "<extra></extra>",
				customdata: selectedOpportunityData.indicators.map((indicator, index) => [
					indicator,
					capitalizeWords(selectedOpportunityData.levels[index]),
					selectedOpportunityData.descriptions[index],
				]),
			});
		}
	}

	// Add legend traces for all possible risk levels
	const riskLegendLevels = ["very high risk", "high risk", "medium risk", "low risk", "very low risk", "no data"];
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

	// Create result object with traces and optional shape
	const result = { traces };

	// Add shape for separator line in "Economic & Social Development" category
	if (parentCategory.label === "Economic & Social Development"
		&& chartData.riskIndicators.length > 0 && chartData.opportunityIndicators.length > 0) {
		const opportunityLegendLevels = ["high opportunity", "medium opportunity", "low opportunity", "no opportunity"];
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

		result.isOpportunityState = true; // Pass the state to the result
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
		asc: true, // Default sorting order
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

	return { selections, updateSelection, updateCountry, updateIndicator, updateCompareCountries };
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

	const { allIndicatorOptions, riskAssessmentData, selectedCountryRiskData } = useMemo(() => {
		if (metrics.length === 0) {
			return {
				allIndicatorOptions: new Set(),
				riskAssessmentData: [],
				selectedCountryRiskData: [],
				countryRiskData: {},
			};
		}

		const options = new Set(lcaIndicators.flatMap((category) => category.options));
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
		};
	}, [metrics, selectedCountryMetrics, countryMetrics]);

	return { riskAssessmentData, indicatorsData, selectedCountryRiskData };
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================

const MagMap = () => {
	const { selections, updateSelection, updateCountry, updateIndicator, updateCompareCountries } = useSelections();

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

	const { riskAssessmentData, indicatorsData, selectedCountryRiskData } = useChartData(dataSets, selections.country, selections.compareCountries);
	const groupedByCountryRiskData = useMemo(() => groupByKey(riskAssessmentData, "key"), [riskAssessmentData]);

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

const onEachCountry = (feature, layer) => {
	layer.on({
		mouseover: (e) => {
			const area = e.target;
			area.setStyle({
				weight: 2,
				fillOpacity: 0.7,
			});
		},
		mouseout: (e) => {
			const area = e.target;
			area.setStyle({
				weight: 1,
				fillOpacity: 0.5,
			});
		},
		//		click: (e) => {
		//			const map = e.target._map;
		//			// Get the bounds of the clicked country
		//			const bounds = e.target.getBounds();
		//			// Fly to the bounds with animation
		//			map.flyToBounds(bounds, {
		//				padding: [30, 30], // Add padding around the bounds
		//				duration: 0.8, // Animation duration in seconds
		//			});
		//		},
	});

	// Get the layer's name and unit from the GeoJSON properties
	const value = feature.properties.value;
	const formattedValue = value === "N/A" ? "N/A" : value.toLocaleString();

	// Create popup content with proper formatting
	const popupContent = `
		<div style="text-align: center;">
			<h4 style="margin: 0;">${feature.properties.name} ${feature.properties.flag}</h4>
			<p style="margin: 5px 0;">
				<strong>${feature.properties.metric || ""}</strong><br/>
				${formattedValue} ${feature.properties.unit || ""}
			</p>
		</div>
	`;

	layer.bindPopup(popupContent);
};

const Map = () => {
	const location = useLocation();
	const selectedProduct = location.state?.selectedProduct;
	const navigate = useNavigate();
	const [geoJsonData, setGeoJsonData] = useState(null);
	const [showLegend, setShowLegend] = useState(false); // State for controlling legend visibility
	// Update your state initialization
	const [filters, setFilters] = useState({
		year: "2024",
		product: selectedProduct || "Rice",
	});

	const [isDataReady, setIsDataReady] = useState(false);

	const handleToggleLegend = () => {
		setShowLegend((prev) => !prev); // Toggle legend visibility
	};

	const handleYearChange = useCallback((newValue) => {
		setFilters((prev) => ({ ...prev, year: newValue.$y })); // Select only the year from the resulting object
	}, []);

	// const keys = useMemo(() => ({
	// 	product: findKeyByText(products, filters.product),
	// }), [filters.product]);
	// console.log("Keys", keys);

	const yearPickerRef = useRef();
	const yearPickerProps = useMemo(() => [
		{
			customType: "date-picker",
			width: "150px",
			sublabel: "Select Year",
			views: ["year"],
			value: new Date(`${filters.year}-01-01`),
			minDate: new Date("2010-01-01"),
			maxDate: new Date(`${currentYear}-01-01`),
			onChange: handleYearChange,
		},
	], [filters.year, handleYearChange]);

	const fetchConfigs = useMemo(() => (mapInfoConfigs(filters.product, filters.year)), [filters.year, filters.product]);

	const { state, dispatch } = useInit(organization, fetchConfigs);
	const { isLoading, dataSets } = state;

	const statistics = useMemo(() => {
		if (!fetchConfigs || !dataSets) return [];

		return fetchConfigs.map((statistic) => {
			const values = dataSets[statistic.plotId] || []; // Ensure `values` is an array
			return {
				plotId: statistic.plotId,
				name: statistic.attributename,
				metric: statistic.metric,
				unit: statistic.unit,
				perRegion: statistic?.perRegion || false,
				values,
			};
		});
	}, [fetchConfigs, dataSets]);

	const dropdownContent = useMemo(() => ([
		{
			id: "product",
			items: mapProducts,
			label: "Select Product",
			value: filters.product,
			subheader: true,
			onChange: (event) => {
				dispatch({ type: "FETCH_START" }); // Add loading state
				setFilters((prev) => ({ ...prev, product: event.target.value }));
			},
		},
	].map((item) => ({
		...item,
	}))), [dispatch, filters.product]); // Add dispatch to dependencies

	useEffect(() => {
		// Load the GeoJSON file from the public directory
		fetch("/european_countries.json")
			.then((response) => {
				if (!response.ok) {
					// console.log("Response status:", response.status);
					throw new Error("Network response was not ok");
				}

				return response.json();
			})
			.then((data) => setGeoJsonData(data))
			.catch((error) => console.error("Error loading GeoJSON:", error));
	}, []);

	// In the Map component, add this logic before creating geodata
	const enhancedGeoJsonData = useMemo(() => {
		if (!geoJsonData || statistics.length === 0) return null; // Check if statistics is populated

		return statistics.map((statistic) => ({
			...geoJsonData,
			features: geoJsonData.features.map((feature) => {
				const country = europeanCountries.find(
					(c) => c.text === feature.properties.name,
				);
				return {
					...feature,
					properties: {
						...feature.properties,
						flag: country?.flag || "", // Add flag emoji
						value: (Array.isArray(statistic.values) ? statistic.values : []).find((p) => p.key === (statistic.perRegion ? country?.region : country?.value))?.[statistic.name] || "-",
					},
				};
			}),
		}));
	}, [geoJsonData, statistics]);

	// Add effect to monitor data readiness
	useEffect(() => {
		if (
			enhancedGeoJsonData
			&& statistics.every((statistic) => (Array.isArray(statistic.values) ? statistic.values : []).length > 0)
		) {
			console.log("Data is ready:", { enhancedGeoJsonData });
			setIsDataReady(true);
		}
	}, [enhancedGeoJsonData, statistics]);

	// Then modify the geodata creation:
	const geodata = useMemo(() => {
		if (!isDataReady || !enhancedGeoJsonData || statistics.length === 0) return []; // Safeguard

		return statistics.map((statistic, index) => {
			// Ensure values is always an array and contains valid numbers
			const validValues = (Array.isArray(statistic.values) ? statistic.values : [])
				.filter((p) => p && p.key !== "EU" && typeof p[statistic.name] === "number")
				.map((p) => p[statistic.name] || 0);

			// Calculate min and max only if we have valid values
			const minValue = validValues.length > 0 ? Math.min(...validValues) : 0;
			const maxValue = validValues.length > 0 ? Math.max(...validValues) : 0;

			return {
				name: statistic.metric,
				type: statistic.metric.includes("Price") ? "price" : "production",
				data: {
					...enhancedGeoJsonData[index],
					features: enhancedGeoJsonData[index]?.features?.map((feature) => ({
						...feature,
						properties: {
							...feature.properties,
							metric: statistic.metric,
							unit: statistic.unit,
						},
					})),
				},
				range: [minValue, maxValue],
				unit: statistic.unit,
				style: (feature) => ({
					color: colors.dark,
					weight: 1,
					fillColor: getColor(
						feature.properties.value,
						[minValue, maxValue],
					),
					fillOpacity: 0.3,
				}),
				action: onEachCountry,
				hiddable: true,
				defaultChecked: index === 0,
			};
		});
	}, [isDataReady, enhancedGeoJsonData, statistics]);
	// console.log("Geodata", geodata); // Debugging output

	// Create markers for labs with coordinates
	const markers = useMemo(() => (
		labs
			.filter((lab) => lab.coordinates)
			.flatMap((lab) => {
				const onClick = () => navigate(lab.path);

				if (typeof lab.coordinates === "object" && !Array.isArray(lab.coordinates)) {
					return Object.entries(lab.coordinates)
						.map(([key, index]) => createMarker(lab, key, index, onClick));
				}

				return [createMarker(lab, null, null, onClick)];
			})
	), [navigate]);

	// Map configuration
	const mapConfig = useMemo(() => ({
		scrollWheelZoom: true,
		zoom: 4,
		center: [55.499_383, 28.527_665],
		layers: {
			physical: {
				show: true,
				hiddable: false,
				defaultChecked: true,
				name: "Physical Map",
			},
			// topographical: {
			// show: true,
			// hiddable: true,
			// defaultChecked: false,
			// name: "Topographical Map",
		},
		// },
	}), []);

	return (
		<Grid container style={{ width: "100%", height: "100%" }} direction="column">
			{/* Top Menu Bar */}
			<Grid item style={{ width: "100%", height: "47px" }}>
				<StickyBand
					sticky={false}
					dropdownContent={dropdownContent}
					formRef={yearPickerRef}
					formContent={yearPickerProps}
					toggleContent={(
						<div style={{ display: "flex", alignItems: "center" }}>
							<label htmlFor="legend-switch" style={{ marginRight: "8px", fontWeight: "bold" }}>{"Show Living Labs:"}</label>
							<Switch
								id="legend-switch"
								checked={showLegend}
								size="medium"
								color="primary"
								onChange={handleToggleLegend}
							/>
						</div>
					)}
				/>
			</Grid>

			{/* Main Content (Map) */}
			<Grid item style={{ flexGrow: 1, width: "100%", height: "calc(100% - 47px)", borderRadius: "8px", overflow: "hidden" }}>
				{isLoading || !isDataReady ? (<LoadingIndicator />
				) : (<MapComponent {...mapConfig} geodata={geodata} markers={markers} showLegend={showLegend} />
				)}
			</Grid>
		</Grid>
	);
};