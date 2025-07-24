import { useLocation } from "react-router-dom";
import { Grid, Button, Typography } from "@mui/material";
import { memo, useMemo, useState, useCallback, useRef, useEffect } from "react";

import Tooltip from "../components/Tooltip.js";
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
	"high risk": "#F44336",
	"very high risk": "#C62828",

	// Opportunity levels - Blue/Teal tones
	"no opportunity": "#9E9E9E",
	"low opportunity": "#00ACC1",
	"medium opportunity": "#26C6DA",
	"high opportunity": "#00838F",

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

const getOpportunityScaleYAxis = () => ({
	tickmode: "array",
	tickvals: [0, 1, 2, 3],
	ticktext: ["No Opportunity", "Low Opportunity", "Medium Opportunity", "High Opportunity"],
	range: [0, 3],
});

const getYAxisForIndicator = (indicator) => (indicator === "Contribution of the sector to economic development"
	? getOpportunityScaleYAxis()
	: getRiskScaleAxis());

const truncateText = (text, maxLength) => (text.length > maxLength ? `${text.slice(0, maxLength)}...` : text);

// ============================================================================
// CHART CREATION FUNCTIONS
// ============================================================================

const createCountryIndicatorsChart = (riskAssessmentData) => {
	if (riskAssessmentData.length === 0) return [];

	const dataByLevel = {};

	// Group data by risk level
	for (const item of riskAssessmentData) {
		const { risk_level: level, score, indicator } = item;

		const parentCategory = lcaIndicators.find((category) => category.options.includes(indicator));
		const indicatorIndex = parentCategory?.options.indexOf(indicator) ?? -1;
		const description = parentCategory?.desc[indicatorIndex] || "No description available";

		if (!dataByLevel[level]) {
			dataByLevel[level] = {
				indicators: [],
				scores: [],
				color: getRiskColor(level),
				fullIndicators: [],
				categories: [],
				descriptions: [],
			};
		}

		dataByLevel[level].indicators.push(indicator);
		dataByLevel[level].fullIndicators.push(indicator);
		dataByLevel[level].categories.push(parentCategory?.label || "Unknown Category");
		dataByLevel[level].descriptions.push(description);
		dataByLevel[level].scores.push(score === "N/A" ? 0 : score);
	}

	// Create traces
	const traces = Object.entries(dataByLevel).map(([level, data]) => ({
		x: data.scores,
		y: data.indicators.map((indicator) => truncateText(indicator, 25)),
		type: "bar",
		orientation: "h",
		title: level.charAt(0).toUpperCase() + level.slice(1),
		color: data.color,
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

	// Sort traces by risk level (highest to lowest)
	return traces.sort((a, b) => {
		const aLevel = a.title.toLowerCase();
		const bLevel = b.title.toLowerCase();
		const aRiskValue = RISK_LEVEL_ORDER[aLevel] || 0;
		const bRiskValue = RISK_LEVEL_ORDER[bLevel] || 0;
		return bRiskValue - aRiskValue;
	});
};

const createIndicatorRiskChart = (indicatorsData, selectedIndicator) => {
	if (!selectedIndicator || indicatorsData.length === 0) return [];

	const indicatorRiskData = indicatorsData.filter((item) => item.indicator === selectedIndicator);

	if (indicatorRiskData.length === 0) return [];

	// Process and sort data
	const processedData = indicatorRiskData.map((item) => {
		const country = europeanCountries.find((c) => c.value === item.key);
		return {
			country: country?.text || item.key,
			score: item.score === "N/A" ? 0 : item.score,
			level: item.risk_level,
			color: getRiskColor(item.risk_level),
		};
	}).sort((a, b) => b.score - a.score);

	return [{
		x: processedData.map((item) => item.country),
		y: processedData.map((item) => item.score),
		type: "bar",
		color: processedData.map((item) => item.color),
	}];
};

const createCategoryBarChart = (riskAssessmentData, selectedIndicator, selectedCountry) => {
	if (!selectedIndicator) return [];

	const parentCategory = lcaIndicators.find((category) => category.options.includes(selectedIndicator));

	if (!parentCategory) return [];

	const countryValue = selectedCountry?.value || selectedCountry;
	const chartData = {
		indicators: [],
		scores: [],
		levels: [],
		colors: [],
		descriptions: [],
	};

	// Collect data for all indicators in this category
	for (const indicator of parentCategory.options) {
		const indicatorData = riskAssessmentData.find((item) => item.indicator === indicator && item.key === countryValue);

		if (indicatorData) {
			const { risk_level: level, score } = indicatorData;
			const indicatorIndex = parentCategory.options.indexOf(indicator);
			const description = parentCategory.desc[indicatorIndex] || "No description available";

			chartData.indicators.push(indicator);
			chartData.scores.push(score === "N/A" ? 0 : score);
			chartData.levels.push(level);
			chartData.colors.push(getRiskColor(level));
			chartData.descriptions.push(description);
		}
	}

	if (chartData.indicators.length === 0) return [];

	const hasOpportunityIndicator = parentCategory.options.includes(
		"Contribution of the sector to economic development",
	);

	return [{
		x: chartData.indicators.map((indicator) => truncateText(indicator, 20)),
		y: chartData.scores,
		type: "bar",
		color: chartData.colors,
		yaxis: chartData.indicators.map((indicator) => (indicator === "Contribution of the sector to economic development" ? "y2" : "y"))[0] || "y",
		hovertemplate:
			"<b>%{customdata[0]}</b><br>"
			+ "(<i>%{customdata[1]}</i>)<br>"
			+ `<b>${hasOpportunityIndicator ? "Risk/Opportunity" : "Risk"} Level:</b> <i>%{y}</i><br>`
			+ "<extra></extra>",
		customdata: chartData.indicators.map((indicator, index) => [
			indicator,
			chartData.descriptions[index],
		]),
	}];
};

// ============================================================================
// CUSTOM HOOKS
// ============================================================================

const useSelections = () => {
	const [selections, setSelections] = useState({
		country: EU_COUNTRIES[0],
		indicator: "",
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
	const countryIndicatorsChartData = useMemo(() => createCountryIndicatorsChart(riskAssessmentData),
		[riskAssessmentData]);

	const indicatorRiskChartData = useMemo(() => createIndicatorRiskChart(indicatorsData, selections.indicator),
		[indicatorsData, selections.indicator]);

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
							showLegend
							height="600px"
							data={countryIndicatorsChartData}
							xaxis={getRiskScaleAxis()}
							layout={{
								margin: { l: 200, r: 40, t: 10, b: 20 },
							}}
						/>
					)}
				</Card>
			</Grid>

			{/* Conditional Charts */}
			{selections.indicator && (
				<Grid item xs={12} md={12}>
					<Grid container spacing={1}>
						{/* Risk Scores Across EU Countries */}
						<Grid item xs={12} md={6}>
							<Card title={`${selections.indicator} - Risk Scores Across EU Countries`}>
								{isLoading ? (
									<LoadingIndicator minHeight="400px" />
								) : indicatorsData.length === 0 ? (
									<DataWarning
										minHeight="400px"
										message="No indicator data available"
									/>
								) : (
									<Plot
										data={indicatorRiskChartData}
										height="400px"
										showLegend={false}
										yaxis={getYAxisForIndicator(selections.indicator)}
										xaxis={{ tickangle: -45 }}
										layout={{
											margin: { l: 110, t: 10 },
										}}
									/>
								)}
							</Card>
						</Grid>

						{/* Category Indicators */}
						<Grid item xs={12} lg={6}>
							<Card
								title={`${selections.country.text}'s ${selectedCategory?.label || "Category"} Indicators`}
								sx={{ display: "flex", flexDirection: "column" }}
							>
								{isLoading ? (
									<LoadingIndicator minHeight="400px" />
								) : riskAssessmentData.length === 0 ? (
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
											...getRiskScaleAxis(),
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
		</Grid>
	);
};

export default memo(LcaMag);
