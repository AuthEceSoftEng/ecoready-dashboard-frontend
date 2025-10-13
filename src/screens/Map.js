import { Grid } from "@mui/material";
import { memo, useMemo, useState, useEffect, useCallback, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";

import colors from "../_colors.scss";
import MapComponent, { getColor } from "../components/Map.js";
import { SecondaryBackgroundButton } from "../components/Buttons.js";
import StickyBand from "../components/StickyBand.js";
import Switch from "../components/Switch.js";
import useInit from "../utils/screen-init.js";
import { mapInfoConfigs, organization } from "../config/ProductConfig.js";
import { LoadingIndicator } from "../utils/rendering-items.js";
import { europeanCountries, products, labs } from "../utils/useful-constants.js";

const excludedProducts = new Set(["Oilseeds", "Cereals", "Sheep/Goat Meat"]);
const mapProducts = products.filter((product) => !excludedProducts.has(product.text)).map((product) => product);

const currentYear = new Date().getFullYear();
// Extract popup component
const PopupContent = memo(({ title, onClick }) => (
	<div>
		<div style={{ display: "flex", justifyContent: "center", marginBottom: "8px", height: "40px", width: "100%" }}>
			<SecondaryBackgroundButton title={title} size="small" onClick={onClick} />
		</div>
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
		//		click: (e) => {
		//			const map = e.target._map;
		//			// Get the bounds of the clicked country
		//			const bounds = e.target.getBounds();
		//			// Fly to the bounds with animation
		//			map.flyToBounds(bounds, {
		//				padding: [30, 30], // Add padding around the bounds
		//				duration: 0.8, // Animation duration in seconds
		//			});
		//		},
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

// Map configuration
const mapConfig = {
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
};

const Map = () => {
	const location = useLocation();
	const selectedProduct = location.state?.selectedProduct;
	const navigate = useNavigate();
	const [filters, setFilters] = useState({
		year: "2024",
		product: selectedProduct || "Rice",
	});

	const [mapState, setMapState] = useState({
		geoJsonData: null,
		showLegend: false,
		isDataReady: false,
	});

	const handleToggleLegend = () => {
		setMapState((prev) => ({ ...prev, showLegend: !prev.showLegend })); // Toggle legend visibility
	};

	const updateFilter = useCallback((key, value) => {
		setFilters((prev) => ({ ...prev, [key]: value }));
	}, []);

	const handleYearChange = useCallback((newValue) => {
		updateFilter("year", newValue.$y);
	}, [updateFilter]);

	const yearPickerRef = useRef();
	const yearPickerProps = useMemo(() => [
		{
			customType: "date-picker",
			width: "150px",
			sublabel: "Select Year",
			views: ["year"],
			value: new Date(`${filters.year}-01-01`),
			minDate: new Date("2010-01-01"),
			maxDate: new Date(`${currentYear}-01-01`),
			onChange: handleYearChange,
		},
	], [filters.year, handleYearChange]);

	const fetchConfigs = useMemo(
		() => (mapInfoConfigs(filters.product, filters.year)),
		[filters.year, filters.product],
	);

	const { state, dispatch } = useInit(organization, fetchConfigs);
	const { isLoading, dataSets } = state;

	const statistics = useMemo(() => {
		if (!fetchConfigs || !dataSets) return [];

		return fetchConfigs.map((statistic) => {
			const values = dataSets[statistic.plotId] || []; // Ensure `values` is an array
			return {
				plotId: statistic.plotId,
				name: statistic.attributename,
				metric: statistic.metric,
				unit: statistic.unit,
				perRegion: statistic?.perRegion || false,
				values,
			};
		});
	}, [fetchConfigs, dataSets]);

	const dropdownContent = useMemo(() => ([
		{
			id: "product",
			items: mapProducts,
			label: "Select Product",
			value: filters.product,
			subheader: true,
			onChange: (event) => {
				dispatch({ type: "FETCH_START" });
				updateFilter("product", event.target.value);
			},
		},
	].map((item) => ({
		...item,
	}))), [dispatch, filters.product, updateFilter]);

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
			.then((data) => setMapState((prev) => ({ ...prev, geoJsonData: data })))
			.catch((error) => console.error("Error loading GeoJSON:", error));
	}, []);

	const useEnhancedGeoJsonData = (geoJsonData, stats) => useMemo(() => {
		if (!geoJsonData || stats.length === 0) return null;

		return stats.map((statistic) => ({
			...geoJsonData,
			features: geoJsonData.features.map((feature) => {
				const country = europeanCountries.find(
					(c) => c.text === feature.properties.name,
				);
				const statisticValues = Array.isArray(statistic.values) ? statistic.values : [];
				const value = statisticValues.find((p) => p.key === (statistic.perRegion ? country?.region : country?.value))?.[statistic.name] || "-";

				return {
					...feature,
					properties: {
						...feature.properties,
						flag: country?.flag || "",
						value,
						metric: statistic.metric,
						unit: statistic.unit,
					},
				};
			}),
		}));
	}, [geoJsonData, stats]);

	const enhancedGeoJsonData = useEnhancedGeoJsonData(mapState.geoJsonData, statistics);

	// Add effect to monitor data readiness
	useEffect(() => {
		if (enhancedGeoJsonData && statistics.every((statistic) => (
			Array.isArray(statistic.values) ? statistic.values : []).length > 0)
		) { setMapState((prev) => ({ ...prev, isDataReady: true })); }
	}, [enhancedGeoJsonData, statistics]);

	// Modify the geodata creation:
	const geodata = useMemo(() => {
		if (!mapState.isDataReady || !enhancedGeoJsonData || statistics.length === 0) return []; // Safeguard

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
	}, [mapState.isDataReady, enhancedGeoJsonData, statistics]);

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
								checked={mapState.showLegend}
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
				{isLoading || !mapState.isDataReady ? (<LoadingIndicator />
				) : (<MapComponent {...mapConfig} geodata={geodata} markers={markers} showLegend={mapState.showLegend} />
				)}
			</Grid>
		</Grid>
	);
};

export default memo(Map);
