import { Grid } from "@mui/material";
import { memo, useMemo, useState, useEffect } from "react";

import colors from "../_colors.scss";
import MapComponent, { getCategoricalColor } from "../components/Map.js";
import { LoadingIndicator } from "../utils/rendering-items.js";
import { europeanCountries, OPPORTUNITY_LEVELS, RISK_LEVELS, RISK_COLOR_MAP } from "../utils/useful-constants.js";

// ============================================================================
// MAIN COMPONENT
// ============================================================================

const onEachCountry = (feature, layer, levelName) => {
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
				<strong>${levelName || ""}</strong><br/>
				${formattedValue}
			</p>
		</div>
	`;

	layer.bindPopup(popupContent);
};

// Create the exportable map component
const MagnetMap = ({
	dataEU = [],
	opportunity = false,
	isLoading = false,
}) => {
	const [geoJsonData, setGeoJsonData] = useState(null);
	const [isDataReady, setIsDataReady] = useState(false);

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
		if (!geoJsonData || dataEU.length === 0) return null; // Check if indicatorData is populated

		return {
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
						value: dataEU.find((p) => p.key === (country?.value))?.score || "-",
						level: dataEU.find((p) => p.key === (country?.value))?.risk_level || "no data",
					},
				};
			}),
		};
	}, [dataEU, geoJsonData]);

	// Add effect to monitor data readiness
	useEffect(() => {
		if (enhancedGeoJsonData) {
			console.log("Data is ready:", { enhancedGeoJsonData });
			setIsDataReady(true);
		}
	}, [enhancedGeoJsonData]);

	// Then modify the geodata creation:
	const geodata = useMemo(() => {
		if (!isDataReady || !enhancedGeoJsonData || dataEU.length === 0) return []; // Safeguard

		const isOpportunity = opportunity;
		const levelName = isOpportunity ? "Opportunity Level" : "Risk Level";
		const levels = isOpportunity ? OPPORTUNITY_LEVELS : RISK_LEVELS;

		return [{
			name: levelName,
			data: {
				...enhancedGeoJsonData,
				features: enhancedGeoJsonData.features.map((feature) => ({
					...feature,
					properties: {
						...feature.properties,
						metric: "Level",
					},
				})),
			},
			range: [0, isOpportunity ? 3 : 5],
			// Add categorical legend properties
			isCategorical: true,
			levels,
			colorMap: RISK_COLOR_MAP,
			style: (feature) => ({
				color: colors.dark,
				weight: 1,
				fillColor: getCategoricalColor(feature.properties.level, RISK_COLOR_MAP),
				fillOpacity: 0.5,
			}),
			action: (feature, layer) => onEachCountry(feature, layer, levelName),
			hiddable: true,
			defaultChecked: true,
		}];
	}, [isDataReady, enhancedGeoJsonData, dataEU, opportunity]);
	console.log("Geodata:", geodata);

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
			{/* Main Content (Map) */}
			<Grid item style={{ flexGrow: 1, width: "100%", height: "calc(100% - 47px)", borderRadius: "8px", overflow: "hidden" }}>
				{isLoading || !isDataReady ? (
					<LoadingIndicator />
				) : (
					<MapComponent {...mapConfig} geodata={geodata} />
				)}
			</Grid>
		</Grid>
	);
};

export default memo(MagnetMap);
