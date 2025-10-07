import { Grid, Typography } from "@mui/material";
import { memo, useMemo, useRef } from "react";

import Card from "../components/Card.js";
import Plot from "../components/Plot.js";
import { groupByKey, findKeyByText, isOpportunityIndicator } from "../utils/data-handling-functions.js";
import { wrapText, truncateText, capitalizeWords, LoadingIndicator, StickyBand, DataWarning } from "../utils/rendering-items.js";
import { EU_COUNTRIES, MAGNET_INDICATORS, OPPORTUNITY_LEVELS, RISK_LEVELS, RISK_COLOR_MAP, OPPORTUNITY_LEVEL_ORDER, RISK_LEVEL_ORDER } from "../utils/useful-constants.js";

const AXIS_CONFIGS = {
	risk: {
		tickmode: "array",
		tickvals: [0.05, 1, 2, 3, 4, 5],
		ticktext: ["No Data", "Very Low Risk", "Low Risk", "Medium Risk", "High Risk", "Very High Risk"],
		range: [0, 5.5],
	},
	opportunity: {
		tickmode: "array",
		tickvals: [0.05, 1, 2, 3],
		ticktext: ["No Opportunity", "Low Opportunity", "Medium Opportunity", "High Opportunity"],
		range: [0, 3.5],
	},
};

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================
const ALL_INDICATOR_OPTIONS = new Set(MAGNET_INDICATORS.flatMap((category) => category.options.map((option) => option.value)));

const INDICATOR_TO_CATEGORY = new Map();
for (const category of MAGNET_INDICATORS) {
	for (const [index, option] of category.options.entries()) {
		INDICATOR_TO_CATEGORY.set(option.value, {
			label: category.label,
			description: category.desc[index] || "No description available",
		});
	}
}

const findParentCategory = (indicator) => MAGNET_INDICATORS.find(
	(category) => category.options.some((option) => option.value === indicator),
);

const getLevels = (isOpportunity = false, legend = false) => {
	const levels = isOpportunity ? OPPORTUNITY_LEVELS : RISK_LEVELS;
	return legend ? [...levels].reverse() : levels;
};

const getRiskColor = (level) => RISK_COLOR_MAP[level] || "#BDBDBD";

const CAPITALIZED_CACHE = new Map();
const getCachedCapitalized = (str) => {
	if (!CAPITALIZED_CACHE.has(str)) {
		CAPITALIZED_CACHE.set(str, capitalizeWords(str));
	}

	return CAPITALIZED_CACHE.get(str);
};

const createLegendTraces = (levels) => levels.map((level) => ({
	x: [null],
	y: [null],
	type: "bar",
	color: getRiskColor(level),
	name: wrapText(getCachedCapitalized(level), 10),
	showlegend: true,
	hoverinfo: "skip",
}));

const createSeparatorShape = (position, orientation = "vertical") => ({
	type: "line",
	xref: orientation === "vertical" ? "x" : "paper",
	x0: orientation === "vertical" ? position : 0,
	x1: orientation === "vertical" ? position : 1,
	yref: orientation === "vertical" ? "paper" : "y",
	y0: orientation === "vertical" ? 0 : position,
	y1: orientation === "vertical" ? 1 : position,
	line: { color: "#666666", width: 2, dash: "dash" },
});

const getAxisConfig = (type) => AXIS_CONFIGS[type];

const getYAxisForIndicator = (indicator) => getAxisConfig(isOpportunityIndicator(indicator) ? "opportunity" : "risk");

const getLevelOrder = (level, isOpportunity = false) => {
	const orderMap = isOpportunity ? OPPORTUNITY_LEVEL_ORDER : RISK_LEVEL_ORDER;
	return orderMap[level] ?? 0;
};

const createDummyTraces = (existingLevels, allLevels, xaxis, opacity = 1) => allLevels
	.filter((level) => !existingLevels.includes(level))
	.map((level) => ({
		x: [level],
		y: [null],
		type: "bar",
		xaxis,
		name: getCachedCapitalized(level),
		color: getRiskColor(level),
		showlegend: true,
		opacity,
		hovertemplate: "<extra></extra>",
	}));

// ============================================================================
// CHART CREATION FUNCTIONS
// ============================================================================

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
		truncatedIndicator: truncateText(indicator, isOpportunity ? 30 : 40),
	};
};

const groupDataByLevel = (processedData, isOpportunity) => {
	const grouped = new Map();

	for (const item of processedData) {
		if (item.isOpportunity === isOpportunity) {
			let group = grouped.get(item.level);
			if (!group) {
				group = {
					indicators: [],
					scores: [],
					colors: [],
					fullIndicators: [],
					categories: [],
					descriptions: [],
				};
				grouped.set(item.level, group);
			}

			group.indicators.push(item.truncatedIndicator);
			group.fullIndicators.push(item.indicator);
			group.categories.push(item.category);
			group.descriptions.push(item.description);
			group.scores.push(item.levelOrder);
			group.colors.push(item.color);
		}
	}

	return Object.fromEntries(grouped);
};

const createHoverTemplate = (isOpportunity, showDescription = true, showCategory = false) => {
	const levelType = isOpportunity ? "Opportunity" : "Risk";
	const parts = ["<b>%{customdata[0]}</b><br>"];

	if (showDescription) {
		parts.push("<b>Description:</b><br>%{customdata[2]}<br>");
	}

	if (showCategory) {
		parts.push("<b>Category:</b> <i>%{customdata[1]}</i><br>", `<b>${levelType} Level:</b> <i>%{x}</i><br>`);
	} else {
		parts.push(`<b>${levelType} Level:</b> <i>%{customdata[1]}</i><br>`);
	}

	parts.push("<extra></extra>");

	return parts.join("");
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

const createIndicatorTraces = (indicators, scores, levels, colors, descriptions, selected, yaxis, isOpportunity) => {
	const { selectedData, otherData } = separateSelectedData(
		indicators, scores, levels, colors, descriptions, selected,
	);

	const wrapLength = isOpportunity ? 5 : 10;
	const hovertemplate = createHoverTemplate(isOpportunity);

	const createTrace = (data, makeBold = false) => ({
		x: data.indicators.map((ind) => (makeBold ? `<b>${wrapText(ind, wrapLength)}</b>` : wrapText(ind, wrapLength))),
		y: data.scores,
		type: "bar",
		color: data.colors,
		yaxis,
		showlegend: false,
		hovertemplate,
		customdata: data.indicators.map((ind, idx) => [
			ind,
			getCachedCapitalized(data.levels[idx]),
			wrapText(data.descriptions[idx], isOpportunity ? 60 : 105),
		]),
	});

	return [
		otherData.indicators.length > 0 && createTrace(otherData, false),
		selectedData.indicators.length > 0 && createTrace(selectedData, true),
	].filter(Boolean);
};

const createCategoryTraces = (groupedData, isOpportunity, selectedIndicator = null) => {
	const traces = [];
	const hovertemplate = createHoverTemplate(isOpportunity, true, true);

	for (const [level, data] of Object.entries(groupedData)) {
		traces.push({
			x: data.scores,
			y: data.indicators.map((indicator, index) => {
				const fullIndicator = data.fullIndicators[index];
				return selectedIndicator && fullIndicator === selectedIndicator
					? `<b>${indicator}</b>`
					: indicator;
			}),
			type: "bar",
			orientation: "h",
			xaxis: isOpportunity ? "x2" : "x1",
			name: getCachedCapitalized(level),
			color: data.colors,
			hovertemplate,
			customdata: data.fullIndicators.map((indicator, index) => [
				indicator,
				data.categories[index],
				data.descriptions[index],
			]),
		});
	}

	return traces;
};

const createIndicatorRiskChart = (indicatorsData, selectedIndicator, selectedCountry, compareCountries, isOpportunity) => {
	if (!selectedIndicator || !indicatorsData || Object.keys(indicatorsData).length === 0) return [];

	// Get parent category and description for the selected indicator
	const parentCategory = findParentCategory(selectedIndicator);
	const indicatorIndex = parentCategory?.options.findIndex((option) => option.value === selectedIndicator) ?? -1;
	const description = parentCategory?.desc[indicatorIndex] || "No description available";

	const allCountries = new Set();
	const compareCountriesSet = new Set(compareCountries || []);
	const selectedCountryValue = selectedCountry?.value || selectedCountry;

	if (selectedCountry) {
		allCountries.add(selectedCountryValue);
	}

	if (compareCountries && compareCountries.length > 0) {
		if (compareCountriesSet.has("European Union")) {
			for (const countryValue of Object.keys(indicatorsData)) {
				allCountries.add(countryValue);
			}
		} else {
			for (const countryText of compareCountries) {
				const countryValue = findKeyByText(EU_COUNTRIES, countryText);
				if (countryValue !== countryText) allCountries.add(countryValue);
			}
		}
	}

	// If no countries are selected, return empty
	if (allCountries.size === 0) return [];

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

			// Make selected country bold
			const displayName = countryValue === selectedCountryValue
				? `<b>${countryName}</b>`
				: countryName;

			countryNames.push(displayName);
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
				+ `<b>${isOpportunity ? "Opportunity" : "Risk"} Level:</b> <i>%{customdata[1]}</i><br>`
				+ "<extra></extra>",
			customdata: customData.map(([country, level, desc]) => [
				country,
				getCachedCapitalized(level),
				wrapText(desc, 60),
			]),
		};

		return [trace];
	}

	return [];
};

const createAllIndicatorsChart = (riskAssessmentData, selectedIndicator = null, ascending = true) => {
	if (riskAssessmentData.length === 0) return [];

	const processedData = riskAssessmentData.map((item) => processIndicatorData(item, selectedIndicator));

	// Group data by type and selection status
	const groupedRisk = groupDataByLevel(processedData, false);
	const groupedOpportunity = groupDataByLevel(processedData, true);

	// Use utility functions instead of hardcoded arrays
	const allRiskLevels = getLevels(false);
	const allOpportunityLevels = getLevels(true);

	// Create traces for existing data
	const riskTraces = createCategoryTraces(groupedRisk, false, selectedIndicator);
	const opportunityTraces = createCategoryTraces(groupedOpportunity, true, selectedIndicator);

	// Create dummy traces for missing levels
	const dummyRiskTraces = createDummyTraces(Object.keys(groupedRisk), allRiskLevels, "x1");
	const dummyOpportunityTraces = createDummyTraces(Object.keys(groupedOpportunity), allOpportunityLevels, "x2", 0);

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

	const allTraces = [...sortedRiskTraces, ...sortedOpportunityTraces];

	// Calculate separator position if both risk and opportunity indicators exist
	let separatorPosition = null;
	if (sortedRiskTraces.length > 0 && sortedOpportunityTraces.length > 0) {
		// Count total indicators from risk traces (excluding dummy traces with null y values)
		const riskIndicatorCount = sortedRiskTraces
			.reduce((count, trace) => count + (trace.y && trace.y.filter((y) => y !== null).length), 0);

		// Position the line between the last risk indicator and first opportunity indicator
		separatorPosition = riskIndicatorCount - 0.5;
	}

	// Return both traces and separator information
	return { traces: allTraces, separatorPosition };
};

// Replace the createCategoryBarChart function
const createCategoryBarChart = (riskAssessmentData, selectedIndicator, selectedCountry) => {
	if (!selectedIndicator) return [];

	const parentCategory = findParentCategory(selectedIndicator);

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
		const indicatorData = riskAssessmentData.find((item) => item.indicator === indicator.value && item.key === countryValue);

		if (indicatorData) {
			const { risk_level: level } = indicatorData;
			const isOpportunity = isOpportunityIndicator(indicator.value);
			const indicatorIndex = parentCategory.options.indexOf(indicator);
			const description = parentCategory.desc[indicatorIndex] || "No description available";
			const isSelected = indicator.value === selectedIndicator;

			const prefix = isOpportunity ? "opportunity" : "risk";
			chartData[`${prefix}Indicators`].push(indicator.value);
			chartData[`${prefix}Scores`].push(getLevelOrder(level, isOpportunity));
			chartData[`${prefix}Levels`].push(level);
			chartData[`${prefix}Colors`].push(getRiskColor(level));
			chartData[`${prefix}Descriptions`].push(description);
			chartData[`${prefix}Selected`].push(isSelected);
		}
	}

	const traces = [];

	// Create traces for risk indicators
	if (chartData.riskIndicators.length > 0) {
		traces.push(...createIndicatorTraces(
			chartData.riskIndicators,
			chartData.riskScores,
			chartData.riskLevels,
			chartData.riskColors,
			chartData.riskDescriptions,
			chartData.riskSelected,
			"y",
			false,
		));
	}

	if (chartData.opportunityIndicators.length > 0) {
		traces.push(...createIndicatorTraces(
			chartData.opportunityIndicators,
			chartData.opportunityScores,
			chartData.opportunityLevels,
			chartData.opportunityColors,
			chartData.opportunityDescriptions,
			chartData.opportunitySelected,
			"y2",
			true,
		));
	}

	traces.push(...createLegendTraces(getLevels(false, true)));

	const result = { traces };

	result.yaxis = {
		primary: {
			...getAxisConfig("risk"),
			ticktext: getAxisConfig("risk").ticktext.map((text) => wrapText(text, 10)),
		},
		secondary: null,
	};

	// Add opportunity legend and separator for Economic & Social Development category
	const isEconomicSocialDevelopment = parentCategory.label === "Economic & Social Development";
	const hasBothIndicatorTypes = chartData.riskIndicators.length > 0 && chartData.opportunityIndicators.length > 0;

	if (isEconomicSocialDevelopment && hasBothIndicatorTypes) {
		traces.push(...createLegendTraces(getLevels(true, true)));

		const separatorPosition = chartData.riskIndicators.length - 0.5;
		result.shapes = [createSeparatorShape(separatorPosition, "vertical")];
		result.isOpportunityState = true;
		result.yaxis.secondary = {
			...getAxisConfig("opportunity"),
			anchor: "x",
			overlaying: "y",
			side: "right",
			showgrid: false,
			ticktext: getAxisConfig("opportunity").ticktext.map((text) => wrapText(text, 5)),
		};
	}

	return result;
};

// ============================================================================
// CUSTOM HOOKS
// ============================================================================

const useChartData = (dataSets, selectedCountry, compareCountries) => {
	const { metrics, indicatorsData, selectedCountryMetrics } = useMemo(() => {
		if (!dataSets || Object.keys(dataSets).length === 0) {
			return { metrics: [], indicatorsData: [], selectedCountryMetrics: [] };
		}

		const selectedCountryCode = selectedCountry?.value || selectedCountry;
		const allMetrics = [];
		const selectedCountryData = [];

		// Get selected country data
		if (selectedCountry) {
			const metricsKey = `metrics_${selectedCountryCode}`;
			if (dataSets[metricsKey]) {
				selectedCountryData.push(...dataSets[metricsKey]);
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
						allMetrics.push(...filteredData);
					}
				}
			}
		}

		const finalMetrics = allMetrics.length === 0 ? selectedCountryData : allMetrics;
		const indicators = dataSets.indicators || [];

		return { metrics: finalMetrics, indicatorsData: indicators, selectedCountryMetrics: selectedCountryData };
	}, [dataSets, selectedCountry, compareCountries]);

	const { riskAssessmentData, selectedCountryRiskData } = useMemo(() => {
		if (metrics.length === 0) {
			return { riskAssessmentData: [], selectedCountryRiskData: [] };
		}

		const filterIndicators = (data) => data.filter((metric) => ALL_INDICATOR_OPTIONS.has(metric.indicator));

		return {
			riskAssessmentData: filterIndicators(metrics),
			selectedCountryRiskData: filterIndicators(selectedCountryMetrics),
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
}) => {
	const isOpportunityState = useMemo(() => isOpportunityIndicator(selections.indicator.value), [selections.indicator.value]);
	const { riskAssessmentData, indicatorsData, selectedCountryRiskData } = useChartData(
		dataSets, selections.country, selections.compareCountries,
	);
	const groupedByCountryRiskData = useMemo(() => groupByKey(riskAssessmentData, "key"), [riskAssessmentData]);

	const countryCompareDropdown = useMemo(() => ({
		id: "country-compare-dropdown",
		label: "Compare Countries",
		items: EU_COUNTRIES.filter((country) => country.value !== selections.country?.value),
		multiple: true,
		value: selections.compareCountries, // Use the array state
		onChange: (event) => updateCompareCountries(event.target.value),
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
		selections.indicator.value,
		selections.country,
		selections.compareCountries,
		isOpportunityState,
	), [groupedByCountryRiskData, selections.indicator, selections.country, selections.compareCountries, isOpportunityState]);

	const categoryBarChartData = useMemo(
		() => createCategoryBarChart(selectedCountryRiskData, selections.indicator.value, selections.country),
		[selectedCountryRiskData, selections.indicator, selections.country],
	);

	const allIndicatorsChartData = useMemo(
		() => createAllIndicatorsChart(selectedCountryRiskData, selections.indicator.value, selections.asc),
		[selectedCountryRiskData, selections.indicator, selections.asc],
	);

	const selectedCategory = useMemo(
		() => MAGNET_INDICATORS.find((cat) => cat.options.some((option) => option.value === selections.indicator.value)),
		[selections.indicator],
	);

	const indicatorDescription = useMemo(() => {
		if (!selections.indicator.value || !selectedCategory) return "";

		const indicatorIndex = selectedCategory.options.findIndex((option) => option.value === selections.indicator.value);
		return selectedCategory.desc[indicatorIndex] || "No description available for this indicator.";
	}, [selections.indicator, selectedCategory]);

	// ============================================================================
	// RENDER
	// ============================================================================

	return (
		<Grid container display="flex" direction="row" justifyContent="space-around" spacing={1}>

			{/* Indicator Description Card */}
			<Grid item xs={12}>
				<Card title={`About: ${selections.indicator.text}`}>
					<Typography
						variant="heading2"
						sx={{
							padding: 1,
							lineHeight: 1,
							textAlign: "center",
							display: "flex",
							alignItems: "center",
							justifyContent: "center",
							fontSize: "21px",
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
							title={`${selections.indicator.text} - ${isOpportunityState ? "Opportunity" : "Risk"} Scores Across ${selections.country.text}`}
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
											hoverlabel: { align: "left" },
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
									xaxis={{ tickangle: 0 }}
									yaxis={categoryBarChartData.yaxis}
									layout={{
										margin: { l: 65, r: 120, t: 10, b: categoryBarChartData.isOpportunityState ? 155 : 120 },
										dragmode: false,
										legend: { x: categoryBarChartData.isOpportunityState ? 1.19 : 1 },
										hoverlabel: { align: "left" },
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
								data={allIndicatorsChartData.traces}
								xaxis={{
									primary: getAxisConfig("risk"),
									secondary: {
										...getAxisConfig("opportunity"),
										anchor: "y",
										overlaying: "x1",
										side: "top",
									},
								}}
								layout={{
									margin: { l: 250, r: 40, t: 15, b: 20 },
									dragmode: false,
									hoverlabel: { align: "left" },
								}}
								shapes={allIndicatorsChartData.separatorPosition === null
									? [] : [createSeparatorShape(allIndicatorsChartData.separatorPosition, "horizontal")]}
							/>
						</>
					)}
				</Card>
			</Grid>
		</Grid>
	);
};

export default memo(MAGNETGraphs);
