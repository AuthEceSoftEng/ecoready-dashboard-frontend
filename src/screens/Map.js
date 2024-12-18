import { Grid } from "@mui/material";
import { memo, useMemo } from "react";
import { useNavigate } from "react-router-dom";

import MapComponent from "../components/Map.js";
import { SecondaryBackgroundButton } from "../components/Buttons.js";
import { labs } from "../utils/useful-constants.js";

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

const Map = () => {
	const navigate = useNavigate();

	// Memoize markers creation
	const markers = useMemo(() => (
		labs
			.filter((lab) => lab.coordinates)
			.flatMap((lab) => {
				if (typeof lab.coordinates === "object" && !Array.isArray(lab.coordinates)) {
					return Object.entries(lab.coordinates).map(([locationKey, coords], index) => ({
						position: coords,
						popup: <PopupContent title={`${lab.title} - ${locationKey}`} onClick={() => navigate(lab.path)} />,
						hiddable: true,
						name: `${lab.title} - ${index + 1}`,
						defaultChecked: false,
					}));
				}

				return [{
					position: lab.coordinates,
					popup: <PopupContent title={lab.title} onClick={() => navigate(lab.path)} />,
					hiddable: true,
					name: lab.title,
					defaultChecked: false,
				}];
			})
	), [navigate]);

	// Memoize groups creation
	const groups = useMemo(() => {
		const labsByRegion = labs.reduce((acc, lab) => {
			if (lab.region && lab.coordinates) {
				if (!acc[lab.region]) {
					acc[lab.region] = [];
				}

				acc[lab.region].push(lab);
			}

			return acc;
		}, {});

		return Object.entries(labsByRegion).map(([region, regionLabs]) => ({
			hiddable: true,
			name: region,
			defaultChecked: true,
			shapes: {
				markers: regionLabs.flatMap((lab) => {
					if (typeof lab.coordinates === "object" && !Array.isArray(lab.coordinates)) {
						return Object.entries(lab.coordinates).map(([locationKey, coords]) => ({
							position: coords,
							popup: <PopupContent title={`${lab.title} - ${locationKey}`} onClick={() => navigate(lab.path)} />,
						}));
					}

					return [{
						position: lab.coordinates,
						popup: <PopupContent title={lab.title} onClick={() => navigate(lab.path)} />,
					}];
				}),
				circles: [],
				rectangles: [],
				polygons: [],
			},
		}));
	}, [navigate]);

	// Memoize map configuration
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
