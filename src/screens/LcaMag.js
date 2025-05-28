import { useLocation } from "react-router-dom";
import { Grid, Button, Typography, Tooltip } from "@mui/material";
import { memo, useMemo, useState, useCallback, useRef, useEffect } from "react";

import Card from "../components/Card.js";
import Plot from "../components/Plot.js";
import Accordion from "../components/Accordion.js";
import Dropdown from "../components/Dropdown.js";
import useInit from "../utils/screen-init.js";
import {
	extractFields, getCustomDateTime, calculateDates, calculateDifferenceBetweenDates,
	debounce, isValidArray, generateYearsArray, groupByKey,
	findKeyByText,
} from "../utils/data-handling-functions.js";
import { LoadingIndicator, StickyBand, DataWarning } from "../utils/rendering-items.js";
import { europeanCountries, lcaIndicators, riskAssessmentData } from "../utils/useful-constants.js";

const countriesForNow = europeanCountries
	.filter((country) => country.text === "Greece"
		|| country.text === "Czech Republic"
		|| country.text === "Belgium");

// Function to get risk color based on level - Alternative vibrant scheme
const getRiskColor = (level) => {
	const colorMap = {
		// No risk/opportunity levels - Green tones
		"no risk": "#2E7D32", // Dark green
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

const SocialIndicatorsAccordion = ({ onIndicatorSelect }) => {
	const [selectedIndicator, setSelectedIndicator] = useState(null);
	const [openAccordion, setOpenAccordion] = useState(null); // Track which accordion is open

	const handleIndicatorClick = (label, option) => {
		setSelectedIndicator({ label, option });
		onIndicatorSelect && onIndicatorSelect({ label, option });
	};

	const handleAccordionToggle = (categoryLabel) => {
		// If the clicked accordion is already open, close it; otherwise, open it and close others
		setOpenAccordion(openAccordion === categoryLabel ? null : categoryLabel);
	};

	return (
		<div style={{ width: "100%" }}>
			{lcaIndicators.map((category) => (
				<Accordion
					key={category.label}
					title={(
						<Typography
							variant="h6"
							sx={{
								fontWeight: "bold",
								color: "primary.main",
								textTransform: "capitalize",
							}}
						>
							{category.label}
						</Typography>
					)}
					content={(
						<Grid container flexDirection="column" spacing={1}>
							{category.options.map((option, optionIndex) => (
								<Grid key={option} item>
									<Tooltip arrow title={category.desc[optionIndex]} placement="top">
										<Button
											variant={selectedIndicator?.option === option ? "contained" : "outlined"}
											sx={{
												width: "100%",
												justifyContent: "flex-start",
												textAlign: "left",
												padding: "12px 16px",
												textTransform: "none",
												fontSize: "0.9rem",
												...(selectedIndicator?.option === option && {
													backgroundColor: "#a2ca37 !important", // Your custom green color
													color: "white !important",
													borderColor: "#a2ca37 !important",
													"&:hover": {
														backgroundColor: "#8db330 !important", // Darker green on hover
													},
												}),
												// Non-selected state
												...(!selectedIndicator?.option === option && {
													"&:hover": {
														backgroundColor: "rgba(162, 202, 55, 0.1)",
														borderColor: "#a2ca37",
													},
												}),
											}}
											onClick={() => handleIndicatorClick(
												category.label,
												option,
												category.desc[optionIndex],
											)}
										>
											{option}
										</Button>
									</Tooltip>
								</Grid>
							))}
						</Grid>
					)}
					alwaysExpanded={openAccordion === category.label} // Control expansion state
					titleBackground="rgba(162, 202, 55, 0.05)"
					expandIconColor="#a2ca37"
					onToggle={() => handleAccordionToggle(category.label)} // Handle toggle
				/>
			))}
		</div>
	);
};

// Define y-axis configuration for risk scale
const getRiskScaleYAxis = () => ({
	tickmode: "array",
	tickvals: [0, 1, 2, 3, 4, 5, 6],
	ticktext: [
		"No Data",
		"No Risk",
		"Very Low Risk",
		"Low Risk",
		"Medium Risk",
		"High Risk",
		"Very High Risk",
	],
	tickangle: -60,
	range: [0, 6],
});

const customDate = getCustomDateTime(2024, 12);
const { year } = calculateDates(customDate);

const currentYear = new Date().getFullYear();

const LcaMag = () => {
	const [selectedCountry, setSelectedCountry] = useState(countriesForNow[0].text);
	const [selectedIndicator, setSelectedIndicator] = useState(null);
	const [riskData, setRiskData] = useState(null);

	// Update risk data when indicator or country changes
	useEffect(() => {
		if (selectedIndicator && selectedCountry) {
			const indicatorName = selectedIndicator.option;
			const countryCode = countriesForNow.find((c) => c.text === selectedCountry)?.value;

			if (riskAssessmentData.indicators[indicatorName]
				&& riskAssessmentData.indicators[indicatorName][countryCode]) {
				const risk = riskAssessmentData.indicators[indicatorName][countryCode];

				setRiskData({
					indicator: indicatorName,
					country: selectedCountry, // Use the text directly
					countryCode,
					level: risk.level,
					score: risk.score,
				});
			} else {
				setRiskData(null);
			}
		}
	}, [selectedIndicator, selectedCountry]);
	console.log("Risk Data:", riskData);

	// Create chart data based on selected indicator
	const getChartData = () => {
		if (!selectedIndicator) return null;

		const indicatorName = selectedIndicator.option;
		const indicatorData = riskAssessmentData.indicators[indicatorName];

		if (!indicatorData) return null;

		// Extract data for all countries
		const countryCodes = Object.keys(indicatorData);
		const countries = countryCodes.map((code) => countriesForNow.find((c) => c.value === code)?.text || code);
		const levels = countryCodes.map((countryCode) => indicatorData[countryCode].level);
		const scores = countryCodes.map((countryCode) => indicatorData[countryCode].score);
		const colors = countryCodes.map((countryCode) => getRiskColor(indicatorData[countryCode].level));

		return {
			countries,
			levels,
			scores,
			colors,
		};
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
		if (!selectedCountry) return [];

		const countryCode = countriesForNow.find((c) => c.text === selectedCountry)?.value;
		if (!countryCode) return [];

		const indicators = [];
		const scores = [];
		const levels = [];
		const colors = [];

		// Collect data for all indicators for the selected country
		for (const [indicatorName, indicatorData] of Object.entries(riskAssessmentData.indicators)) {
			if (indicatorData && indicatorData[countryCode]) {
				const level = indicatorData[countryCode].level;
				const score = indicatorData[countryCode].score;

				// Filter out "no data" entries if desired, or include them
				if (level !== "no data") {
					indicators.push(indicatorName);
					scores.push(score === "N/A" ? 0 : score);
					levels.push(level);
					colors.push(getRiskColor(level));
				}
			}
		}

		// If no data available
		if (indicators.length === 0) {
			return [];
		}

		return [{
			x: indicators.map((indicator) => (indicator.length > 30 ? `${indicator.slice(0, 30)}...` : indicator)), // Truncate very long indicator names
			y: scores,
			type: "bar",
			title: `All Indicators - ${selectedCountry}`,
			color: colors,
			text: levels.map((level) => level.toUpperCase()),
		}];
	};

	// Bar chart showing all indicators in the same category as the selected indicator
	const createCategoryBarChart = () => {
		if (!selectedIndicator) return []; // Return empty array instead of null

		// Find the parent category of the selected indicator
		const parentCategory = lcaIndicators.find((category) => category.options.includes(selectedIndicator.option));

		if (!parentCategory) return []; // Return empty array instead of null

		// Get all indicators in the same category and their data for selected country
		const countryCode = countriesForNow.find((c) => c.text === selectedCountry)?.value;
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
			x: indicators.map((indicator) => (indicator.length > 25 ? `${indicator.slice(0, 25)}...` : indicator)), // Truncate long indicator names
			y: scores,
			type: "bar",
			title: `${parentCategory.label} Indicators - ${selectedCountry}`,
			color: colors,
			text: levels.map((level) => level.toUpperCase()),
		}];
	};

	const handleIndicatorSelection = (selectedData) => { setSelectedIndicator(selectedData); };

	const yearPickerRef = useRef();
	const yearPickerProps = useMemo(() => [
		{
			key: "year-picker",
			customType: "date-picker",
			width: "150px",
			sublabel: "Select Year",
			views: ["year"],
			value: new Date(`${year}-01-01`),
			minDate: new Date("2010-01-01"),
			maxDate: new Date(`${currentYear}-01-01`),
			onChange: (newValue) => { if (newValue) { console.log("Selected year:", newValue); } },
		},
	], []);

	const countryDropdown = useMemo(() => ([{
		id: "country-dropdown",
		label: "Select Country",
		items: countriesForNow,
		value: selectedCountry,
		onChange: (event) => {
			const countryText = event.target.value;
			setSelectedCountry(countryText);
		},
	}]), [selectedCountry]);

	return (
		<Grid container display="flex" direction="row" justifyContent="space-around" spacing={1}>
			<StickyBand dropdownContent={countryDropdown} formRef={yearPickerRef} formContent={yearPickerProps} />

			{/* Main content area */}
			{/* All Indicators for Selected Country - New Chart */}
			<Grid item xs={12}>
				<Card title={`All Indicators - ${selectedCountry}`} sx={{ display: "flex", flexDirection: "column" }}>
					{/* <StickyBand sticky={false} dropdownContent={countryDropdown} /> */}
					<Plot
						data={createCountryIndicatorsChart()}
						title=""
						height="400px"
						showLegend={false}
						yaxis={getRiskScaleYAxis()}
						xaxis={{ tickangle: 20 }}
					/>
				</Card>
			</Grid>
			<Grid item xs={12} md={9}>
				{/* Charts */}
				{selectedIndicator && (
					<Grid container spacing={2}>
						{/* Bar Chart - Risk Scores by Country */}
						<Grid item xs={12} lg={6}>
							<Card title="Risk Score by Country" sx={{ display: "flex", flexDirection: "column" }}>
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
								title={`${selectedCountry}'s ${lcaIndicators.find((cat) => cat.options.includes(selectedIndicator.option))?.label || "Category"} Indicators`}
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

			{/* Social Indicators Accordion - Right Side */}
			<Grid item xs={6} md={3}>
				<div style={{ position: "sticky", top: "20px" }}>
					<SocialIndicatorsAccordion onIndicatorSelect={handleIndicatorSelection} />
				</div>
			</Grid>
		</Grid>
	);
};

export default memo(LcaMag);
