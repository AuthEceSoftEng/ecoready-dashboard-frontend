import { useLocation } from "react-router-dom";
import { Grid, Button, Typography } from "@mui/material";
import { memo, useMemo, useState, useCallback, useRef, useEffect } from "react";

import colors from "../_colors.scss";
import Card from "../components/Card.js";
import Plot from "../components/Plot.js";
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
	"no data": 0,
};

const OPPORTUNITY_LEVEL_ORDER = {
	"high opportunity": 3,
	"medium opportunity": 2,
	"low opportunity": 1,
	"no opportunity": 0,
};

// Selected item colors
const SELECTION_COLOR = colors.third; // Gold color for selected indicator

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

const getRiskColor = (level) => RISK_COLOR_MAP[level] || "#BDBDBD";

const getRiskScaleAxis = () => ({
	tickmode: "array",
	tickvals: [0, 1, 2, 3, 4, 5],
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

const isOpportunityIndicator = (indicator) => indicator === "Contribution of the sector to economic development";

// ============================================================================
// CHART CREATION FUNCTIONS
// ============================================================================

const createCountryIndicatorsChart = (riskAssessmentData, selectedIndicator = null) => {
	if (riskAssessmentData.length === 0) return [];

	const dataByLevel = {};
	const opportunityDataByLevel = {};
	const selectedRiskData = {};
	const selectedOpportunityData = {};

	// Group data by risk level, separating risk and opportunity indicators
	for (const item of riskAssessmentData) {
		const { risk_level: level, score, indicator } = item;
		const isOpportunity = isOpportunityIndicator(indicator);
		const isSelected = indicator === selectedIndicator;

		const parentCategory = lcaIndicators.find((category) => category.options.includes(indicator));
		const indicatorIndex = parentCategory?.options.indexOf(indicator) ?? -1;
		const description = parentCategory?.desc[indicatorIndex] || "No description available";

		if (isOpportunity) {
			// Process opportunity indicators
			const targetData = isSelected ? selectedOpportunityData : opportunityDataByLevel;

			if (!targetData[level]) {
				targetData[level] = {
					indicators: [],
					scores: [],
					colors: [],
					fullIndicators: [],
					categories: [],
					descriptions: [],
				};
			}

			targetData[level].indicators.push(indicator);
			targetData[level].fullIndicators.push(indicator);
			targetData[level].categories.push(parentCategory?.label || "Unknown Category");
			targetData[level].descriptions.push(description);
			targetData[level].scores.push(getLevelOrder(level, true));
			targetData[level].colors.push(isSelected ? SELECTION_COLOR : getRiskColor(level));
		} else {
			// Process risk indicators
			const targetData = isSelected ? selectedRiskData : dataByLevel;

			if (!targetData[level]) {
				targetData[level] = {
					indicators: [],
					scores: [],
					colors: [],
					fullIndicators: [],
					categories: [],
					descriptions: [],
				};
			}

			targetData[level].indicators.push(indicator);
			targetData[level].fullIndicators.push(indicator);
			targetData[level].categories.push(parentCategory?.label || "Unknown Category");
			targetData[level].descriptions.push(description);
			targetData[level].scores.push(getLevelOrder(level, false));
			targetData[level].colors.push(isSelected ? SELECTION_COLOR : getRiskColor(level));
		}
	}

	console.log("Risk data by level:", dataByLevel);
	console.log("Opportunity data by level:", opportunityDataByLevel);
	console.log("Selected risk data:", selectedRiskData);
	console.log("Selected opportunity data:", selectedOpportunityData);

	// Create traces for non-selected risk indicators
	const riskTraces = Object.entries(dataByLevel).map(([level, data]) => ({
		x: data.scores,
		y: data.indicators.map((indicator) => truncateText(indicator, 30)),
		type: "bar",
		orientation: "h",
		name: level.charAt(0).toUpperCase() + level.slice(1),
		color: data.colors,
		text: data.scores.map(() => level.toUpperCase()),
		hovertemplate:
			"<b>%{customdata[0]}</b><br>"
			+ "<b>Description:</b> %{customdata[2]}<br>"
			+ "<b>Category:</b> <i>%{customdata[1]}</i><br>"
			+ "<b>Risk Level:</b> <i>%{x}</i><br>"
			+ "<extra></extra>",
		customdata: data.fullIndicators.map((indicator, index) => [
			indicator,
			data.categories[index],
			data.descriptions[index],
		]),
	}));

	// Create traces for non-selected opportunity indicators
	const opportunityTraces = Object.entries(opportunityDataByLevel).map(([level, data]) => ({
		x: data.scores,
		y: data.indicators.map((indicator) => truncateText(indicator, 25)),
		type: "bar",
		orientation: "h",
		name: `${level.charAt(0).toUpperCase() + level.slice(1)} (Opportunity)`,
		color: data.colors,
		text: data.scores.map(() => level.toUpperCase()),
		xaxis: "x2",
		hovertemplate:
			"<b>%{customdata[0]}</b><br>"
			+ "<b>Description:</b> %{customdata[2]}<br>"
			+ "<b>Category:</b> <i>%{customdata[1]}</i><br>"
			+ "<b>Opportunity Level:</b> <i>%{x}</i><br>"
			+ "<extra></extra>",
		customdata: data.fullIndicators.map((indicator, index) => [
			indicator,
			data.categories[index],
			data.descriptions[index],
		]),
	}));

	// Create traces for selected risk indicators
	const selectedRiskTraces = Object.entries(selectedRiskData).map(([level, data]) => ({
		x: data.scores,
		y: data.indicators.map((indicator) => truncateText(indicator, 30)),
		type: "bar",
		orientation: "h",
		name: "Current Selection",
		color: SELECTION_COLOR,
		text: data.scores.map(() => level.toUpperCase()),
		hovertemplate:
			"<b>%{customdata[0]}</b><br>"
			+ "<b>Description:</b> %{customdata[2]}<br>"
			+ "<b>Category:</b> <i>%{customdata[1]}</i><br>"
			+ "<b>Risk Level:</b> <i>%{x}</i><br>"
			+ "<extra></extra>",
		customdata: data.fullIndicators.map((indicator, index) => [
			indicator,
			data.categories[index],
			data.descriptions[index],
		]),
	}));

	// Create traces for selected opportunity indicators
	const selectedOpportunityTraces = Object.entries(selectedOpportunityData).map(([level, data]) => ({
		x: data.scores,
		y: data.indicators.map((indicator) => truncateText(indicator, 25)),
		type: "bar",
		orientation: "h",
		name: "Current Selection",
		color: SELECTION_COLOR,
		text: data.scores.map(() => level.toUpperCase()),
		xaxis: "x2",
		hovertemplate:
			"<b>%{customdata[0]}</b><br>"
			+ "<b>Description:</b> %{customdata[2]}<br>"
			+ "<b>Category:</b> <i>%{customdata[1]}</i><br>"
			+ "<b>Opportunity Level:</b> <i>%{x}</i><br>"
			+ "<extra></extra>",
		customdata: data.fullIndicators.map((indicator, index) => [
			indicator,
			data.categories[index],
			data.descriptions[index],
		]),
	}));

	// Sort risk traces by level (lowest to highest)
	const sortedRiskTraces = riskTraces.sort((a, b) => {
		const aLevel = a.name.toLowerCase();
		const bLevel = b.name.toLowerCase();
		const aLevelValue = getLevelOrder(aLevel, false);
		const bLevelValue = getLevelOrder(bLevel, false);
		return aLevelValue - bLevelValue;
	});

	// Sort opportunity traces by level (lowest to highest)
	const sortedOpportunityTraces = opportunityTraces.sort((a, b) => {
		const aLevel = a.name.toLowerCase().replace(" (opportunity)", "");
		const bLevel = b.name.toLowerCase().replace(" (opportunity)", "");
		const aLevelValue = getLevelOrder(aLevel, true);
		const bLevelValue = getLevelOrder(bLevel, true);
		return aLevelValue - bLevelValue;
	});

	// Combine all trace arrays
	return [
		...sortedOpportunityTraces,
		...sortedRiskTraces,
		...selectedOpportunityTraces,
		...selectedRiskTraces,
	];
};

// Update the createIndicatorRiskChart function for selected country highlighting
const createIndicatorRiskChart = (indicatorsData, selectedIndicator, selectedCountry) => {
	if (!selectedIndicator || indicatorsData.length === 0) return [];

	const indicatorRiskData = indicatorsData.filter((item) => item.indicator === selectedIndicator);
	if (indicatorRiskData.length === 0) return [];

	const isOpportunity = isOpportunityIndicator(selectedIndicator);
	const selectedCountryValue = selectedCountry?.value || selectedCountry;

	// Process and sort data
	const processedData = indicatorRiskData.map((item) => {
		const country = europeanCountries.find((c) => c.value === item.key);
		const isSelectedCountry = item.key === selectedCountryValue;
		return {
			country: country?.text || item.key,
			score: getLevelOrder(item.risk_level, isOpportunity),
			level: item.risk_level,
			color: isSelectedCountry ? SELECTION_COLOR : getRiskColor(item.risk_level),
			isSelected: isSelectedCountry,
		};
	}).sort((a, b) => b.score - a.score);

	// Separate selected and non-selected countries
	const selectedCountryData = processedData.filter((item) => item.isSelected);
	const otherCountriesData = processedData.filter((item) => !item.isSelected);

	// Group non-selected countries by risk level
	const dataByLevel = {};
	for (const item of otherCountriesData) {
		if (!dataByLevel[item.level]) {
			dataByLevel[item.level] = {
				countries: [],
				scores: [],
				colors: [],
			};
		}

		dataByLevel[item.level].countries.push(item.country);
		dataByLevel[item.level].scores.push(item.score);
		dataByLevel[item.level].colors.push(item.color);
	}

	// Create traces for non-selected countries
	const traces = Object.entries(dataByLevel).map(([level, data]) => ({
		x: data.countries,
		y: data.scores,
		type: "bar",
		name: level.charAt(0).toUpperCase() + level.slice(1),
		color: data.colors,
		hovertemplate:
			"<b>%{x}</b><br>"
			+ `<b>${isOpportunity ? "Opportunity" : "Risk"} Level:</b> ${level}<br>`
			+ "<b>Score:</b> %{y}<br>"
			+ "<extra></extra>",
	}));

	// Add trace for selected country if it exists
	if (selectedCountryData.length > 0) {
		const selectedItem = selectedCountryData[0];
		traces.push({
			x: [selectedItem.country],
			y: [selectedItem.score],
			type: "bar",
			name: "Current Selection",
			color: SELECTION_COLOR,
			hovertemplate:
				"<b>%{x}</b><br>"
				+ `<b>${isOpportunity ? "Opportunity" : "Risk"} Level:</b> ${selectedItem.level}<br>`
				+ "<b>Score:</b> %{y}<br>"
				+ "<extra></extra>",
		});
	}

	return traces;
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
					+ "(<i>%{customdata[2]}</i>)<br>"
					+ "<b>Risk Level:</b> <i>%{customdata[1]}</i><br>"
					+ "<extra></extra>",
				customdata: otherRiskData.indicators.map((indicator, index) => [
					indicator,
					otherRiskData.levels[index],
					otherRiskData.descriptions[index],
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
					otherOpportunityData.descriptions[index],
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

	return traces;
};

// ============================================================================
// CUSTOM HOOKS
// ============================================================================

const useSelections = () => {
	const [selections, setSelections] = useState({
		country: EU_COUNTRIES[0],
		indicator: lcaIndicators[0].options[0],
	});

	const updateCountry = useCallback((countryText) => {
		const country = EU_COUNTRIES.find((c) => c.text === countryText);
		setSelections((prev) => ({ ...prev, country }));
	}, []);

	const updateIndicator = useCallback((selectedOption) => {
		const selectedCategory = lcaIndicators.find((cat) => cat.options.includes(selectedOption));
		setSelections((prev) => ({
			...prev,
			indicator: selectedCategory ? selectedOption : "",
		}));
	}, []);

	return { selections, updateCountry, updateIndicator };
};

const useChartData = (selections, dataSets) => {
	const metrics = useMemo(() => dataSets?.metrics || [], [dataSets]);
	const indicatorsData = useMemo(() => dataSets?.indicators || [], [dataSets]);

	const { allIndicatorOptions, riskAssessmentData } = useMemo(() => {
		if (metrics.length === 0) {
			return { allIndicatorOptions: new Set(), riskAssessmentData: [] };
		}

		const options = new Set(lcaIndicators.flatMap((category) => category.options));
		const filteredData = metrics.filter((metric) => options.has(metric.indicator));

		return {
			allIndicatorOptions: options,
			riskAssessmentData: filteredData,
		};
	}, [metrics]);

	return { riskAssessmentData, indicatorsData };
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================

const LcaMag = () => {
	const { selections, updateCountry, updateIndicator } = useSelections();

	console.log("Selected Country:", selections.country);
	console.log("Selected Indicator:", selections.indicator);

	const fetchConfigs = useMemo(() => {
		const countryValue = selections.country?.value || selections.country;
		console.log("Selected Country Value:", countryValue);
		return magnetConfigs(countryValue, selections.indicator || null);
	}, [selections.country, selections.indicator]);

	const { state } = useInit(organization, fetchConfigs);
	const { isLoading, dataSets } = state;

	const { riskAssessmentData, indicatorsData } = useChartData(selections, dataSets);

	console.log("Filtered Metrics:", riskAssessmentData);

	// Form configurations
	const yearPickerRef = useRef();
	const yearPickerProps = useMemo(() => [{
		key: "year-picker",
		customType: "date-picker",
		width: "150px",
		sublabel: "Select Year",
		views: ["year"],
		value: new Date("2024-01-01"),
		minDate: new Date("2024-01-01"),
		maxDate: new Date("2024-12-31"),
		onChange: (newValue) => {
			if (newValue) {
				console.log("Selected year:", newValue);
			}
		},
	}], []);

	// Dropdown configurations
	const countryDropdown = useMemo(() => ({
		id: "country-dropdown",
		label: "Select Country",
		items: EU_COUNTRIES,
		value: selections.country.text,
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

	// Chart data memoization
	const countryIndicatorsChartData = useMemo(() => createCountryIndicatorsChart(riskAssessmentData, selections.indicator),
		[riskAssessmentData, selections.indicator]);

	const indicatorRiskByCountryData = useMemo(() => createIndicatorRiskChart(indicatorsData, selections.indicator, selections.country),
		[indicatorsData, selections.indicator, selections.country]);

	const categoryBarChartData = useMemo(() => createCategoryBarChart(riskAssessmentData, selections.indicator, selections.country),
		[riskAssessmentData, selections.indicator, selections.country]);

	const selectedCategory = useMemo(() => lcaIndicators.find((cat) => cat.options.includes(selections.indicator)),
		[selections.indicator]);

	// ============================================================================
	// RENDER
	// ============================================================================

	return (
		<Grid container display="flex" direction="row" justifyContent="space-around" spacing={1}>
			<StickyBand
				dropdownContent={[countryDropdown, indicatorDropdown]}
				formRef={yearPickerRef}
				formContent={yearPickerProps}
			/>

			{/* Conditional Charts */}
			{selections.indicator && (
				<Grid item xs={12} md={12}>
					<Grid container spacing={1}>
						{/* Risk Scores Across EU Countries */}
						<Grid item xs={12} md={6}>
							<Card title={`${selections.indicator} - ${isOpportunityIndicator ? "Opportunity" : "Risk"} Scores Across EU Countries`}>
								{indicatorsData.length === 0 ? (
									<DataWarning
										minHeight="400px"
										message="No indicator data available"
									/>
								) : (
									<Plot
										data={indicatorRiskByCountryData}
										height="400px"
										yaxis={getYAxisForIndicator(selections.indicator)}
										xaxis={{ tickangle: 45 }}
										layout={{
											margin: { l: 110, t: 10 },
										}}
									/>
								)}
							</Card>
						</Grid>

						{/* Category Indicators */}
						<Grid item xs={12} lg={6}>
							<Card title={`${selections.country.text}'s ${selectedCategory?.label || "Category"} Indicators`}>
								{riskAssessmentData.length === 0 ? (
									<DataWarning
										minHeight="400px"
										message="No indicator data available for the selected category"
									/>
								) : (
									<Plot
										data={categoryBarChartData}
										height="400px"
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
									/>
								)}
							</Card>
						</Grid>
					</Grid>
				</Grid>
			)}

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

		</Grid>
	);
};

export default memo(LcaMag);
