import { Grid } from "@mui/material";
import { memo, useMemo, useState, useEffect, useCallback, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";

import colors from "../_colors.scss";
import MapComponent, { getColor } from "../components/Map.js";
import { magnetConfigs, organization } from "../config/MagnetConfig.js";
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

	const indicatorDropdown = useMemo(() => ({
		id: "indicator-dropdown",
		label: "Select Indicator",
		items: lcaIndicators,
		value: selections.indicator,
		subheader: true,
		onChange: (event) => updateIndicator(event.target.value),
	}), [selections.indicator, updateIndicator]);

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

	const [isDataReady, setIsDataReady] = useState(false);

	const fetchConfigs = useMemo(() => (magnetConfigs(filters.product, filters.year)), [filters.year, filters.product]);

	const { state, dispatch } = useInit(organization, fetchConfigs);
	const { isLoading, dataSets } = state;

	const indicatorData = useMemo(() => {
		if (!fetchConfigs || !dataSets) return [];

		return fetchConfigs.map((statistic) => {
			const values = dataSets[metrics_EU] || []; // Ensure `values` is an array
			return {
				plotId: "metrics_EU",
				riskLevel: statistic.risk_level,
				score: statistic.score,
				unit: statistic.unit,				
			};
		});
	}, [fetchConfigs, dataSets]);

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
		if (!geoJsonData || indicatorData.length === 0) return null; // Check if indicatorData is populated

		return indicatorData.map((statistic) => ({
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
		},
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