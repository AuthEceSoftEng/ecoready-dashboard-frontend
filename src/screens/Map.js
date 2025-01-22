import { Grid } from "@mui/material";
import { memo, useMemo, useState, useEffect, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";

import colors from "../_colors.scss";
import MapComponent, { getColor } from "../components/Map.js";
import { SecondaryBackgroundButton } from "../components/Buttons.js";
import useInit from "../utils/screen-init.js";
import { mapInfoConfigs, organization } from "../config/MapInfoConfig.js";
import { LoadingIndicator, StickyBand } from "../utils/rendering-items.js";
import { europeanCountries, products, labs } from "../utils/useful-constants.js";
import { findKeyByText } from "../utils/data-handling-functions.js";

// Extract popup component
const PopupContent = memo(({ title, onClick }) => (
	<div>
		<div style={{ display: "flex", justifyContent: "center", marginBottom: "8px", height: "40px", width: "100%" }}>
			<SecondaryBackgroundButton title={title} size="small" onClick={onClick} />
		</div>
		<p>{"A description of the Living Lab will probably go here"}</p>
	</div>
));

// Extract marker creation logic
const createMarker = (lab, locationKey, index, onClick) => ({
	position: locationKey ? lab.coordinates[locationKey] : lab.coordinates,
	popup: <PopupContent title={locationKey ? `${lab.title} - ${locationKey}` : lab.title} onClick={onClick} />,
	name: locationKey ? `${lab.title} - ${index + 1}` : lab.title,
	hiddable: true,
	defaultChecked: true,
});

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
		click: (e) => {
			const map = e.target._map;
			// Get the bounds of the clicked country
			const bounds = e.target.getBounds();
			// Fly to the bounds with animation
			map.flyToBounds(bounds, {
				padding: [30, 30], // Add padding around the bounds
				duration: 0.8, // Animation duration in seconds
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
	const navigate = useNavigate();
	const [geoJsonData, setGeoJsonData] = useState(null);
	const [filters, setFilters] = useState({
		year: "2024",
		product: "Rice",
		metric: "price",
	});
	const [isDataReady, setIsDataReady] = useState(false);

	const handleYearChange = useCallback((newValue) => {
		console.log("New Year:", newValue);
		setFilters((prev) => ({ ...prev, year: newValue.$y })); // Select only the year from the resulting object
	}, [setFilters]);

	const keys = useMemo(() => ({
		product: findKeyByText(products, filters.product),
	}), [filters.product]);

	const formRefDate = useRef();

	const formContentDate = useMemo(() => [
		{
			customType: "date-picker",
			id: "yearPicker",
			value: filters.year,
			sublabel: "Year Picker",
			views: ["year"],
			minDate: new Date(2000, 0, 1),
			maxDate: new Date(2024, 11, 31),
			background: "third",
			labelSize: 12,
			onChange: handleYearChange,
		},
	], [filters.year, handleYearChange]);

	const fetchConfigs = useMemo(
		() => (keys.product
			? mapInfoConfigs(keys.country, keys.product, filters.year) : null),
		[keys.product, keys.country, filters.year],
	);

	const { state, dispatch } = useInit(organization, fetchConfigs);
	const { isLoading, dataSets } = state;
	console.log(dataSets);

	const ricePrice = useMemo(() => dataSets?.periodPrices || [], [dataSets]);
	const riceProduction1 = useMemo(() => dataSets?.riceProd1 || [], [dataSets]);
	const riceProduction2 = useMemo(() => dataSets?.riceProd2 || [], [dataSets]);

	const production = useMemo(() => riceProduction1.map((milledEntry) => {
		// Find matching husk entry
		const huskEntry = riceProduction2.find((h) => h.key === milledEntry.key && h.interval_start === milledEntry.interval_start);

		return {
			key: milledEntry.key,
			timestamp: milledEntry.interval_start,
			total_production: (
				(milledEntry.sum_milled_rice_equivalent_quantity || 0)
				+ (huskEntry?.sum_rice_husk_quantity || 0)
			),
		};
	}), [riceProduction1, riceProduction2]);

	const dropdownContent = useMemo(() => ([
		{
			id: "product",
			items: products,
			label: "Select Product",
			value: filters.product,
			onChange: (event) => {
				dispatch({ type: "FETCH_START" }); // Add loading state
				setFilters((prev) => ({ ...prev, product: event.target.value }));
			},
		},
	].map((item) => ({
		...item,
		size: "small",
	}))), [dispatch, filters.product]); // Add dispatch to dependencies

	useEffect(() => {
		// Load the GeoJSON file from the public directory
		fetch("/european_countries.json")
			.then((response) => {
				if (!response.ok) {
					console.log("Response status:", response.status);
					throw new Error("Network response was not ok");
				}

				return response.json();
			})
			.then((data) => setGeoJsonData(data))
			.catch((error) => console.error("Error loading GeoJSON:", error));
	}, []);

	// In the Map component, add this logic before creating geodata
	const enhancedGeoJsonData = useMemo(() => {
		if (!geoJsonData) return null;

		return {
			productionMap: {
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
							value: production.find((p) => p.key === country?.value)?.total_production || 0,
						},
					};
				}),
			},
			priceMap: {
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
							value: ricePrice.find((p) => p.key === country?.value)?.avg_price || 0,
						},
					};
				}),
			},
		};
	}, [geoJsonData, ricePrice, production]);
	console.log("Created Geodata:", enhancedGeoJsonData);

	// Add effect to monitor data readiness
	useEffect(() => {
		if (enhancedGeoJsonData && ricePrice.length > 0 && production.length > 0) {
			console.log("Data is ready:", {
				enhancedGeoJsonData,
				ricePrice: ricePrice.length,
				production: production.length,
			});
			setIsDataReady(true);
		}
	}, [enhancedGeoJsonData, ricePrice, production]);

	// Then modify the geodata creation:
	const geodata = useMemo(() => (
		isDataReady && enhancedGeoJsonData ? [
			{
				name: "Production",
				data: {
					...enhancedGeoJsonData.productionMap,
					features: enhancedGeoJsonData.productionMap.features.map((feature) => ({
						...feature,
						properties: {
							...feature.properties,
							metric: "Production",
							unit: "t",
						},
					})),
				},
				range: [0, Math.max(...production
					.filter((p) => p.key !== "EU")
					.map((p) => p.total_production || 0))],
				unit: "t",
				style: (feature) => ({
					color: colors.dark,
					weight: 1,
					fillColor: getColor(feature.properties.value, [0, Math.max(...production
						.filter((p) => p.key !== "EU")
						.map((p) => p.total_production || 0))]),
					fillOpacity: 0.3,
				}),
				action: onEachCountry,
				hiddable: true,
				defaultChecked: true,
			},
			{
				name: "Price",
				data: {
					...enhancedGeoJsonData.priceMap,
					features: enhancedGeoJsonData.priceMap.features.map((feature) => ({
						...feature,
						properties: {
							...feature.properties,
							metric: "Price",
							unit: "€/t",
						},
					})),
				},
				range: [0, Math.max(...ricePrice
					.filter((p) => p.key !== "EU")
					.map((p) => p.avg_price || 0))],
				unit: "€/t",
				style: (feature) => ({
					color: colors.dark,
					weight: 1,
					fillColor: getColor(feature.properties.value, [0, Math.max(...ricePrice
						.filter((p) => p.key !== "EU")
						.map((p) => p.avg_price || 0))]),
					fillOpacity: 0.3,
				}),
				action: onEachCountry,
				hiddable: true,
				defaultChecked: false,
			},

		] : []), [isDataReady, enhancedGeoJsonData, production, ricePrice]);

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
		<Grid container width="100%" height="100%" display="flex" direction="row">
			<StickyBand sticky={false} dropdownContent={dropdownContent} formRef={formRefDate} formContent={formContentDate} />
			<Grid width="100%" height="100%" display="flex" direction="row">
				{isLoading || !isDataReady
					? (
						<Grid item xs={12} sm={12} md={12} lg={12} xl={12} height="100%">
							{" "}
							<LoadingIndicator />
							{" "}
						</Grid>
					)
					: (
						<Grid item xs={12} sm={12} md={12} lg={12} xl={12} height="100%">
							<MapComponent {...mapConfig} geodata={geodata} markers={markers} />
						</Grid>
					)}
			</Grid>
		</Grid>
	);
};

export default memo(Map);
