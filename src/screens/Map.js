import { Grid } from "@mui/material";
import { memo, useMemo, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { scaleQuantize } from "d3-scale";

import colors from "../_colors.scss";
import MapComponent from "../components/Map.js";
import { SecondaryBackgroundButton } from "../components/Buttons.js";
import { labs, regions } from "../utils/useful-constants.js";

// Extract popup component
const PopupContent = memo(({ title, onClick }) => (
	<div>
		<div style={{
			display: "flex",
			justifyContent: "center",
			marginBottom: "8px",
			height: "40px",
			width: "100%",
		}}
		>
			<SecondaryBackgroundButton
				title={title}
				size="small"
				onClick={onClick}
			/>
		</div>
		<p>{"A description of the Living Lab will probably go here"}</p>
	</div>
));

// Extract marker creation logic
const createMarker = (lab, locationKey, index, onClick) => ({
	position: locationKey ? lab.coordinates[locationKey] : lab.coordinates,
	popup: <PopupContent
		title={locationKey ? `${lab.title} - ${locationKey}` : lab.title}
		onClick={onClick}
	/>,
	name: locationKey ? `${lab.title} - ${index + 1}` : lab.title,
	hiddable: true,
	defaultChecked: false,
});

const getColor = (value) => scaleQuantize()
	.domain([0, 100])
	.range([
		colors.light,
		colors.info,
		colors.primary,
	])(value);

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
				fillOpacity: 0.3,
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

	layer.bindPopup(`
    <strong>${feature.properties.name}</strong><br>
    Value: ${feature.properties.value || "N/A"}
  `);
};

const Map = () => {
	const navigate = useNavigate();
	const [geoJsonData, setGeoJsonData] = useState(null);

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

	// Create geodata for countries
	const geodata = useMemo(() => (geoJsonData ? [{
		data: geoJsonData,
		style: (feature) => ({
			color: colors.dark,
			weight: 1,
			fillColor: getColor(feature.properties.value || 0),
			fillOpacity: 0.3,
		}),
		action: onEachCountry,
	}] : []), [geoJsonData]);

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

	// // Group labs by region
	// const groups = useMemo(() => {
	// 	const labsByRegion = labs.reduce((acc, lab) => {
	// 		if (lab.region && lab.coordinates) {
	// 			if (!acc[lab.region]) acc[lab.region] = [];
	// 			acc[lab.region].push(lab);
	// 		}

	// 		return acc;
	// 	}, {});

	// 	const createGroup = (name, labsList, defaultChecked = false) => ({
	// 		hiddable: true,
	// 		name,
	// 		defaultChecked,
	// 		shapes: {
	// 			markers: labsList.flatMap((lab) => {
	// 				const onClick = () => navigate(lab.path);

	// 				if (typeof lab.coordinates === "object" && !Array.isArray(lab.coordinates)) {
	// 					return Object.entries(lab.coordinates)
	// 						.map(([key, index]) => createMarker(lab, key, index, onClick));
	// 				}

	// 				return [createMarker(lab, null, null, onClick)];
	// 			}),
	// 			circles: labsList.flatMap((lab) => regions
	// 				.filter((r) => r.region === lab.region && r.center)
	// 				.map((region) => ({
	// 					center: region.center,
	// 					radius: region.radius,
	// 					fillColor: "#00426E",
	// 					color: "transparent",
	// 				}))),
	// 			rectangles: [],
	// 			polygons: labsList.flatMap((lab) => regions
	// 				.filter((r) => r.region === lab.region && r.positions)
	// 				.map((region) => ({
	// 					positions: region.positions,
	// 					fillColor: "#00426E",
	// 					color: "transparent",
	// 				}))),
	// 		},
	// 	});

	// 	return [
	// 		createGroup("All Labs", labs.filter((lab) => lab.coordinates), true),
	// 		...Object.entries(labsByRegion)
	// 			.map(([region, regionLabs]) => createGroup(region, regionLabs)),
	// 	];
	// }, [navigate]);

	// Map configuration
	const mapConfig = useMemo(() => ({
		scrollWheelZoom: true,
		zoom: 4,
		center: [55.499_383, 28.527_665],
		layers: {
			normal: {
				show: true,
				hiddable: true,
				defaultChecked: false,
				name: "Physical Map",
			},
			topographical: {
				show: true,
				hiddable: true,
				defaultChecked: true,
				name: "Topographical Map",
			},
		},
	}), []);

	return (
		<Grid container width="100%" height="100%" display="flex" direction="row" justifyContent="space-around" spacing={2}>
			<Grid item width="100%" height="100%">
				<MapComponent {...mapConfig} geodata={geodata} markers={markers} />
			</Grid>
		</Grid>
	);
};

export default memo(Map);
