import { useLocation } from "react-router-dom";
import { Grid, Typography } from "@mui/material";
import { memo, useMemo, useState, useCallback, useEffect } from "react";

import { HighlightBackgroundButton } from "../components/Buttons.js";
import Footer from "../components/Footer.js";
import useInit from "../utils/screen-init.js";
import { magnetConfigs, organization } from "../config/MagnetConfig.js";
import { findKeyByText } from "../utils/data-handling-functions.js";
import { StickyBand } from "../utils/rendering-items.js";
import { europeanCountries, lcaIndicators } from "../utils/useful-constants.js";

import MagnetMap from "./MAGNET Map.js";
import MAGNETGraphs from "./MAGNET Graphs.js";

// ============================================================================
// CONSTANTS AND STATIC DATA
// ============================================================================

const EU_COUNTRIES = europeanCountries.filter((country) => country.isEU === true);
const isOpportunityIndicator = (indicator) => indicator === "Contribution of the sector to economic development";

// ============================================================================
// CUSTOM HOOKS
// ============================================================================

const useSelections = () => {
	const [selections, setSelections] = useState({
		country: EU_COUNTRIES[1],
		indicator: lcaIndicators[0].options[0],
		compareCountries: [EU_COUNTRIES[1].text],
		asc: true,
		tab: "Metrics",
	});

	// Add state to store previous compare countries when switching to Map
	const [previousCompareCountries, setPreviousCompareCountries] = useState([EU_COUNTRIES[1].text]);

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
		const selectedCategory = lcaIndicators.find((cat) => cat.options.includes(selectedOption));
		updateSelection("indicator", selectedCategory ? selectedOption : "");
	}, [updateSelection]);

	const updateCompareCountries = useCallback((selectedCountries) => {
		updateSelection("compareCountries", selectedCountries);
	}, [updateSelection]);

	// New function to handle tab changes with compare countries logic
	const updateTab = useCallback((newTab) => {
		setSelections((prev) => {
			if (newTab === "Map" && prev.tab !== "Map") {
				// Switching to Map: save current state and set European Union
				setPreviousCompareCountries(prev.compareCountries);
				return {
					...prev,
					tab: newTab,
					compareCountries: [...previousCompareCountries, "European Union"],
				};
			}

			if (newTab === "Metrics" && prev.tab === "Map") {
				// Switching from Map to Metrics: restore previous state
				return {
					...prev,
					tab: newTab,
					compareCountries: previousCompareCountries,
				};
			}

			// No change in tab or other transitions
			return { ...prev, tab: newTab };
		});
	}, [previousCompareCountries]); // Remove updateCompareCountries from dependencies

	return { selections, updateSelection, updateTab, updateCountry, updateIndicator, updateCompareCountries };
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================

const LcaMag = () => {
	const { selections, updateSelection, updateTab, updateCountry, updateIndicator, updateCompareCountries } = useSelections();
	console.log("MAGNET component rendered with selections!!!!!!!!!!!!!!!!!!!!:", selections);

	const [isOpportunityState, setIsOpportunityState] = useState(false);

	// Update state when indicator changes
	useEffect(() => {
		setIsOpportunityState(isOpportunityIndicator(selections.indicator));
	}, [selections.indicator]);

	const fetchConfigs = useMemo(() => {
		const compareCountries = (selections.compareCountries || []).map((countryText) => findKeyByText(EU_COUNTRIES, countryText));

		return magnetConfigs(compareCountries, selections.indicator || null);
	}, [selections.indicator, selections.compareCountries]);

	const { state } = useInit(organization, fetchConfigs);
	const { isLoading, dataSets } = state;

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

	// const selectedCategory = useMemo(() => lcaIndicators.find((cat) => cat.options.includes(selections.indicator)),
	// 	[selections.indicator]);

	// // Add this new useMemo for the indicator description
	// const indicatorDescription = useMemo(() => {
	// 	if (!selections.indicator || !selectedCategory) return "";

	// 	const indicatorIndex = selectedCategory.options.indexOf(selections.indicator);
	// 	return selectedCategory.desc[indicatorIndex] || "No description available for this indicator.";
	// }, [selections.indicator, selectedCategory]);
	// ============================================================================
	// RENDER
	// ============================================================================

	return (
		<Grid container style={{ width: "100%", height: "100%" }} display="flex" direction="row" justifyContent="space-around" spacing={1}>
			<StickyBand
				dropdownContent={selections.tab === "Metrics" ? [countryDropdown, indicatorDropdown] : [indicatorDropdown]}
				toggleContent={(
					<>
						<HighlightBackgroundButton
							title="Metrics"
							onClick={() => updateTab("Metrics")}
						/>
						<HighlightBackgroundButton
							title="Map"
							onClick={() => updateTab("Map")}
						/>
					</>
				)}
				togglePlacing="center"
			/>

			{selections.tab === "Metrics" && selections.country && selections.indicator && (
				<MAGNETGraphs
					selections={selections}
					updateSelection={updateSelection}
					updateCompareCountries={updateCompareCountries}
					dataSets={dataSets}
					isLoading={isLoading}
					isOpportunityState={isOpportunityState}
				/>
			)}

			{/* Map Section */}
			{selections.tab === "Map" && (
				<Grid container xs={12} style={{ width: "100%", height: "calc(100vh - 220px)" }}>
					<MagnetMap dataEU={dataSets.metrics_EU} opportunity={isOpportunityState} isLoading={isLoading} />
				</Grid>
			)}

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
