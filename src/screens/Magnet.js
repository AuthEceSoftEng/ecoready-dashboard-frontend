import { Grid, Typography } from "@mui/material";
import { memo, useMemo, useState, useCallback, useRef } from "react";

import { HighlightBackgroundButton, HighlightBorderButton } from "../components/Buttons.js";
import Footer from "../components/Footer.js";
import useInit from "../utils/screen-init.js";
import { magnetConfigs, organization } from "../config/MagnetConfig.js";
import { findKeyByText, isOpportunityIndicator } from "../utils/data-handling-functions.js";
import StickyBand from "../components/StickyBand.js";
import { EU_COUNTRIES, MAGNET_INDICATORS } from "../utils/useful-constants.js";
import { getFile } from "../api/index.js";

import MagnetMap from "./MagnetMap.js";
import MAGNETGraphs from "./MagnetGraphs.js";

// ============================================================================
// CUSTOM HOOKS
// ============================================================================

const useSelections = () => {
	const [selections, setSelections] = useState({
		country: EU_COUNTRIES[1],
		indicator: MAGNET_INDICATORS[0].options[0],
		category: MAGNET_INDICATORS[0].label,
		compareCountries: [EU_COUNTRIES[1].text],
		asc: true,
		tab: "Metrics",
	});

	const previousCompareCountriesRef = useRef([EU_COUNTRIES[1].text]);

	const updateSelection = useCallback((key, value) => {
		setSelections((prev) => ({ ...prev, [key]: value }));
	}, []);

	const updateCountry = useCallback((countryText) => {
		const country = findKeyByText(EU_COUNTRIES, countryText, true);

		setSelections((prev) => ({
			...prev,
			country,
			compareCountries: [countryText],
		}));
	}, []);

	const updateIndicator = useCallback((selectedOption) => {
		const categoryWithOption = MAGNET_INDICATORS.find((category) => category.options.some((opt) => opt.value === selectedOption));

		if (categoryWithOption) {
			const selectedOptionObj = categoryWithOption.options.find(
				(opt) => opt.value === selectedOption,
			);
			updateSelection("indicator", selectedOptionObj);
			updateSelection("category", categoryWithOption.label);
		}
	}, [updateSelection]);

	const updateCompareCountries = useCallback((selectedCountries) => {
		updateSelection("compareCountries", selectedCountries);
	}, [updateSelection]);

	// New function to handle tab changes with compare countries logic
	const updateTab = useCallback((newTab) => {
		setSelections((prev) => {
			if (newTab === "Map" && prev.tab !== "Map") {
				// Switching to Map: save current state and set European Union
				previousCompareCountriesRef.current = prev.compareCountries;
				return {
					...prev,
					tab: newTab,
					compareCountries: [...previousCompareCountriesRef.current, "European Union"],
				};
			}

			if (newTab === "Metrics" && prev.tab === "Map") {
				// Switching from Map to Metrics: restore previous state
				return {
					...prev,
					tab: newTab,
					compareCountries: previousCompareCountriesRef.current,
				};
			}

			// No change in tab or other transitions
			return { ...prev, tab: newTab };
		});
	}, []);

	return { selections, updateSelection, updateTab, updateCountry, updateIndicator, updateCompareCountries };
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================

const LcaMag = () => {
	const { selections, updateSelection, updateTab, updateCountry, updateIndicator, updateCompareCountries } = useSelections();

	const isOpportunityState = useMemo(
		() => isOpportunityIndicator(selections.indicator.value),
		[selections.indicator.value],
	);

	const fetchConfigs = useMemo(() => {
		const compareCountries = (selections.compareCountries || []).map((countryText) => findKeyByText(EU_COUNTRIES, countryText));
		const indicatorValue = selections.indicator?.value;

		return magnetConfigs(compareCountries, indicatorValue);
	}, [selections.indicator, selections.compareCountries]);

	const { state } = useInit(organization, fetchConfigs);
	const { isLoading, dataSets } = state;

	const countryDropdown = useMemo(() => {
		const isMetrics = selections.tab === "Metrics";
		return {
			id: "country-dropdown",
			label: isMetrics ? "Select Country" : "",
			items: isMetrics ? EU_COUNTRIES : [EU_COUNTRIES[0]],
			value: isMetrics ? selections.country?.text : EU_COUNTRIES[0].text,
			onChange: (event) => updateCountry(event.target.value),
		};
	}, [selections.country?.text, selections.tab, updateCountry]);

	const indicatorDropdown = useMemo(() => ({
		id: "indicator-dropdown",
		label: "Select Indicator",
		items: MAGNET_INDICATORS,
		value: selections.indicator.value,
		subheader: true,
		onChange: (event) => updateIndicator(event.target.value),
	}), [selections.indicator, updateIndicator]);

	const handleMetricsClick = useCallback(() => updateTab("Metrics"), [updateTab]);
	const handleMapClick = useCallback(() => updateTab("Map"), [updateTab]);

	// ============================================================================
	// RENDER
	// ============================================================================

	return (
		<Grid container style={{ width: "100%", height: "100%" }} display="flex" direction="row" justifyContent="space-around" spacing={1}>
			<StickyBand
				dropdownContent={[countryDropdown, indicatorDropdown]}
				toggleContent={(
					<>
						{selections.tab === "Metrics" ? (
							<HighlightBackgroundButton
								title="Metrics"
								size="small"
								onClick={handleMetricsClick}
							/>
						) : (
							<HighlightBorderButton
								title="Metrics"
								size="small"
								onClick={handleMetricsClick}
							/>
						)}
						{selections.tab === "Map" ? (
							<HighlightBackgroundButton
								title="Map"
								size="small"
								onClick={handleMapClick}
							/>
						) : (
							<HighlightBorderButton
								title="Map"
								size="small"
								onClick={handleMapClick}
							/>
						)}
					</>
				)}
				togglePlacing="center"
				downloadContent={(
					<HighlightBackgroundButton
						title="Download Methodology"
						size="small"
						onClick={() => getFile("MAGNET", "Methodology PSILCA social 2.pdf", "Methodology PSILCA social 2.pdf")}
					/>
				)}
			/>

			{selections.tab === "Metrics" && (
				<Grid item xs={12}>
					<MAGNETGraphs
						selections={selections}
						updateSelection={updateSelection}
						updateCompareCountries={updateCompareCountries}
						dataSets={dataSets}
						isLoading={isLoading}
					/>
				</Grid>
			)}

			{/* Map Section */}
			{selections.tab === "Map" && (
				<Grid container xs={12} style={{ width: "100%", height: "calc(100vh - 220px)" }}>
					<MagnetMap
						dataEU={dataSets.metrics_EU}
						opportunity={isOpportunityState}
						isLoading={isLoading}
						selectedIndicator={selections.indicator.text}
						selectedCategory={selections.category}
					/>
				</Grid>
			)}
			<Footer
				sticky
				customMessage={(
					<>
						<Typography component="span" sx={{ fontWeight: "bold", fontSize: "0.975rem" }}>
							{"Acknowledgement of Data Source:"}
						</Typography>
						{" "}
						{"The Observatory presents aggregated results based on data from the PSILCA database (v3.1.1) by GreenDelta GmbH, extracted in 2024. All rights to the data remain with GreenDelta. No raw data is disclosed."}
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
