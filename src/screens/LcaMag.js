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

const euCountries = europeanCountries.filter((country) => country.isEU === true);

// Function to get risk color based on level - Alternative vibrant scheme
const getRiskColor = (level) => {
	const colorMap = {
		// No risk/opportunity levels - Green tones
		// "no risk": "#2E7D32", // Dark green
		"very low risk": "#4CAF50", // Standard green
		"low risk": "#8BC34A", // Light green

		// Medium risk - Yellow/Orange transition
		"medium risk": "#FF9800", // Orange

		// High risk levels - Red tones
		"high risk": "#F44336", // Standard red
		"very high risk": "#C62828", // Dark red

		// Opportunity levels - Blue/Teal tones
		"no opportunity": "#9E9E9E", // Gray
		"low opportunity": "#00ACC1", // Cyan

		// Data availability
		"no data": "#757575", // Medium gray
	};
	return colorMap[level] || "#BDBDBD"; // Light gray fallback
};

// Define x-axis configuration for risk scale
const getRiskScaleXAxis = () => ({
	tickmode: "array",
	tickvals: [0, 1, 2, 3, 4, 5],
	ticktext: [
		"No Data",
		"Very Low Risk",
		"Low Risk",
		"Medium Risk",
		"High Risk",
		"Very High Risk",
	],
	range: [0, 5],
	// tickangle: -45, // Rotate labels for better readability
	// title: "Risk Level",
});

// Define y-axis configuration for risk scale
const getRiskScaleYAxis = () => ({
	tickmode: "array",
	tickvals: [0, 1, 2, 3, 4, 5],
	ticktext: [
		"No Data",
		"Very Low Risk",
		"Low Risk",
		"Medium Risk",
		"High Risk",
		"Very High Risk",
	],
	range: [0, 5],
});

const LcaMag = () => {
	const [selections, setSelections] = useState({
		country: euCountries[0],
		indicator: "",
	});
	console.log("Selected Country:", selections.country);
	console.log("Selected Indicator:", selections.indicator);

	const fetchConfigs = useMemo(
		() => {
			const countryValue = selections.country?.value || selections.country;
			console.log("Selected Country Value:", countryValue);
			return magnetConfigs(countryValue);
		},
		[selections.country],
	);

	const { state } = useInit(organization, fetchConfigs);
	const { isLoading, dataSets } = state;
	const metrics = useMemo(() => dataSets?.metrics || [], [dataSets]);
	console.log("Metrics Data:", metrics);

	// Replace the existing useMemo for riskAssessmentData
	const { allIndicatorOptions, riskAssessmentData } = useMemo(() => {
		if (metrics.length === 0) return { allIndicatorOptions: new Set(), riskAssessmentData: [] };

		const options = new Set(lcaIndicators.flatMap((category) => category.options));
		const filteredData = metrics.filter((metric) => options.has(metric.indicator));

		return {
			allIndicatorOptions: options,
			riskAssessmentData: filteredData,
		};
	}, [metrics]);
	console.log("Filtered Metrics:", riskAssessmentData);

	// Create chart data based on selected indicator
	const getChartData = () => {
		if (!selections.indicator) return null;

		// const indicatorName = selectedIndicator.option;
		const indicatorData = riskAssessmentData.indicators[selections.indicator];
		console.log("Indicator Data:", indicatorData);

		if (!indicatorData) return null;

		// Extract data for all countries
		const countryCodes = Object.keys(indicatorData);
		const countries = countryCodes.map((code) => europeanCountries.find((c) => c.value === code)?.text || code);
		const levels = countryCodes.map((countryCode) => indicatorData[countryCode].level);
		const scores = countryCodes.map((countryCode) => indicatorData[countryCode].score);
		const colors = countryCodes.map((countryCode) => getRiskColor(indicatorData[countryCode].level));

		return { countries, levels, scores, colors };
	};

	const chartData = getChartData();

	// Bar chart showing scores by country
	const createBarChart = () => {
		if (!chartData) return []; // Return empty array instead of null

		return [{
			x: chartData.countries,
			y: chartData.scores.map((score) => (score === "N/A" ? 0 : score)),
			type: "bar",
			title: "Risk Scores by Country",
			color: chartData.colors,
			text: chartData.levels,
		}];
	};

	const createCountryIndicatorsChart = () => {
		if (!selections.country || riskAssessmentData.length === 0) return [];

		// Group data by risk level
		const dataByLevel = {};

		for (const item of riskAssessmentData) {
			const level = item.risk_level;
			const score = item.score;

			// Find the parent category and description for this indicator
			const parentCategory = lcaIndicators.find((category) => category.options.includes(item.indicator));
			const indicatorIndex = parentCategory?.options.indexOf(item.indicator) ?? -1;
			const description = parentCategory?.desc[indicatorIndex] || "No description available";

			if (!dataByLevel[level]) {
				dataByLevel[level] = {
					indicators: [],
					scores: [],
					color: getRiskColor(level),
					fullIndicators: [], // Store full indicator names
					categories: [], // Store parent category labels
					descriptions: [], // Store indicator descriptions
				};
			}

			dataByLevel[level].indicators.push(item.indicator);
			dataByLevel[level].fullIndicators.push(item.indicator); // Store full names
			dataByLevel[level].categories.push(parentCategory?.label || "Unknown Category");
			dataByLevel[level].descriptions.push(description);
			dataByLevel[level].scores.push(score === "N/A" ? 0 : score);
		}

		// Create traces with word-wrapped indicators
		const traces = Object.entries(dataByLevel).map(([level, data]) => ({
			x: data.scores,
			y: data.indicators.map((indicator) => (indicator.length > 25
				? `${indicator.slice(0, 25)}...`
				: indicator)),
			type: "bar",
			orientation: "h", // Horizontal bars
			title: level.charAt(0).toUpperCase() + level.slice(1),
			color: data.color,
			text: data.scores.map(() => level.toUpperCase()),
			// Enhanced hover template with category and description
			hovertemplate:
				"<b>%{customdata[0]}</b><br>"
				+ "<b>Description:</b>%{customdata[2]}<br>"
				+ "<b>Category:</b> <i>%{customdata[1]}</i><br>"
				+ "<b>Risk Level:</b> <i>%{x}</i><br>"
				+ "<extra></extra>",
			customdata: data.fullIndicators.map((indicator, index) => [
				indicator, // Full indicator name
				data.categories[index], // Parent category label
				data.descriptions[index], // Indicator description
			]), // Pass full indicator names, categories, and descriptions for hover
		}));
		console.log("Country Indicators Chart Data:", traces);

		// Define risk level order (highest to lowest)
		const riskOrder = {
			"very high risk": 5,
			"high risk": 4,
			"medium risk": 3,
			"low risk": 2,
			"very low risk": 1,
			"no data": 0,
		};

		return traces.sort((a, b) => {
			const aLevel = a.title.toLowerCase();
			const bLevel = b.title.toLowerCase();
			const aRiskValue = riskOrder[aLevel] || 0;
			const bRiskValue = riskOrder[bLevel] || 0;
			return bRiskValue - aRiskValue;
		});
	};

	// Bar chart showing all indicators in the same category as the selected indicator
	const createCategoryBarChart = () => {
		if (!selections.indicator) return []; // Return empty array instead of null

		// Find the parent category of the selected indicator
		const parentCategory = lcaIndicators.find((category) => category.options.includes(selections.indicator.option));

		if (!parentCategory) return []; // Return empty array instead of null

		// Get all indicators in the same category and their data for selected country
		const countryCode = europeanCountries.find((c) => c.text === selections.country)?.value;
		if (!countryCode) return []; // Return empty array instead of null

		const indicators = [];
		const scores = [];
		const levels = [];
		const colors = [];

		// Collect data for all indicators in this category
		for (const indicator of parentCategory.options) {
			const indicatorData = riskAssessmentData.indicators[indicator];
			if (indicatorData && indicatorData[countryCode]) {
				const level = indicatorData[countryCode].level;
				const score = indicatorData[countryCode].score;

				// Include all data, even "no data" entries
				indicators.push(indicator);
				scores.push(score === "N/A" ? 0 : score);
				levels.push(level);
				colors.push(getRiskColor(level));
			}
		}

		// If no data available
		if (indicators.length === 0) {
			return []; // Return empty array instead of null
		}

		return [{
			x: indicators,
			y: scores,
			type: "bar",
			title: `${parentCategory.label} Indicators - ${selections.country.text}`,
			color: colors,
			text: levels.map((level) => level.toUpperCase()),
		}];
	};

	const yearPickerRef = useRef();
	const yearPickerProps = useMemo(() => [
		{
			key: "year-picker",
			customType: "date-picker",
			width: "150px",
			sublabel: "Select Year",
			views: ["year"],
			value: new Date("2024-01-01"),
			minDate: new Date("2024-01-01"),
			maxDate: new Date("2024-12-31"),
			onChange: (newValue) => { if (newValue) { console.log("Selected year:", newValue); } },
		},
	], []);

	const countryDropdown = useMemo(() => ({
		id: "country-dropdown",
		label: "Select Country",
		items: euCountries,
		value: selections.country.text,
		onChange: (event) => {
			const countryText = event.target.value;
			const country = euCountries.find((c) => c.text === countryText);
			setSelections((prev) => ({ ...prev, country }));
		},
	}), [selections.country]);

	const indicatorDropdown = useMemo(() => ({
		id: "indicator-dropdown",
		label: "Select Indicator",
		items: lcaIndicators,
		value: selections.indicator,
		subheader: true,
		onChange: (event) => {
			const selectedOption = event.target.value;
			const selectedCategory = lcaIndicators.find((cat) => cat.options.includes(selectedOption));
			setSelections((prev) => ({
				...prev,
				indicator: selectedCategory ? selectedOption : "",
			}));
		},
	}), [selections.indicator]);

	return (
		<Grid container display="flex" direction="row" justifyContent="space-around" spacing={1}>
			<StickyBand dropdownContent={[countryDropdown, indicatorDropdown]} formRef={yearPickerRef} formContent={yearPickerProps} />

			{/* Main content area */}
			{/* All Indicators for Selected Country - New Chart */}
			<Grid item xs={12}>
				<Card title={`All Indicators - ${selections.country.text}`}>
					{isLoading ? (
						<LoadingIndicator minHeight="400px" />
					) : riskAssessmentData.length === 0 ? (
						<DataWarning minHeight="400px" message="No indicator data available for the selected country" />
					) : (
						<Plot
							showLegend
							data={createCountryIndicatorsChart()}
							xaxis={getRiskScaleXAxis()}
							layout={{
								margin: { l: 200, r: 40, t: 10, b: 20 }, // Adjusted left margin for long indicator names
							}}
						/>
					)}
				</Card>
			</Grid>
			<Grid item xs={12} md={12}>
				{/* Charts */}
				{selections.indicator && (
					<Grid container spacing={2}>
						{/* Bar Chart - Risk Scores by Country */}
						<Grid item xs={12} lg={6}>
							<Card title="Risk Score by Country">
								<Plot
									data={createBarChart()}
									title=""
									height="400px"
									showLegend={false}
									yaxis={getRiskScaleYAxis()}
									xaxis={{ title: "Country" }}
								/>
							</Card>
						</Grid>

						{/* Category Indicators Bar Chart - Replaces Pie Chart */}
						<Grid item xs={12} lg={6}>
							<Card
								title={`${selections.country}'s ${lcaIndicators.find((cat) => cat.options.includes(selections.indicator.option))?.label || "Category"} Indicators`}
								sx={{ display: "flex", flexDirection: "column" }}
							>
								<Plot
									data={createCategoryBarChart()}
									title=""
									height="400px"
									showLegend={false}
									yaxis={getRiskScaleYAxis()}
									xaxis={{ tickangle: 20 }}

								/>
							</Card>
						</Grid>

					</Grid>
				)}
			</Grid>
		</Grid>
	);
};

export default memo(LcaMag);
