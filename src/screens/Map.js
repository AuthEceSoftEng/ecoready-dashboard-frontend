import { Grid } from "@mui/material";
import { memo, useMemo } from "react";
import { useNavigate } from "react-router-dom";

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

const Map = () => {
	const navigate = useNavigate();

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

	// Group labs by region
	const groups = useMemo(() => {
		const labsByRegion = labs.reduce((acc, lab) => {
			if (lab.region && lab.coordinates) {
				if (!acc[lab.region]) acc[lab.region] = [];
				acc[lab.region].push(lab);
			}

			return acc;
		}, {});

		const createGroup = (name, labsList, defaultChecked = false) => ({
			hiddable: true,
			name,
			defaultChecked,
			shapes: {
				markers: labsList.flatMap((lab) => {
					const onClick = () => navigate(lab.path);

					if (typeof lab.coordinates === "object" && !Array.isArray(lab.coordinates)) {
						return Object.entries(lab.coordinates)
							.map(([key, index]) => createMarker(lab, key, index, onClick));
					}

					return [createMarker(lab, null, null, onClick)];
				}),
				circles: labsList.flatMap((lab) => regions
					.filter((r) => r.region === lab.region && r.center)
					.map((region) => ({
						center: region.center,
						radius: region.radius,
						fillColor: "#00426E",
						color: "transparent",
					}))),
				rectangles: [],
				polygons: labsList.flatMap((lab) => regions
					.filter((r) => r.region === lab.region && r.positions)
					.map((region) => ({
						positions: region.positions,
						fillColor: "#00426E",
						color: "transparent",
					}))),
			},
		});

		return [
			createGroup("All Labs", labs.filter((lab) => lab.coordinates), true),
			...Object.entries(labsByRegion)
				.map(([region, regionLabs]) => createGroup(region, regionLabs)),
		];
	}, [navigate]);

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
				name: "Default Map",
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
			<Grid item width="90%" height="70%">
				<MapComponent {...mapConfig} groups={groups} markers={markers} />
			</Grid>
		</Grid>
	);
};

export default memo(Map);
