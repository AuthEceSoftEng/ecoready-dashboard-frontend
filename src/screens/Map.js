import { Grid } from "@mui/material";
import { memo } from "react";
import { useNavigate } from "react-router-dom";

import MapComponent from "../components/Map.js";
import { SecondaryBackgroundButton } from "../components/Buttons.js";
import { labs } from "../utils/useful-constants.js";

const Map = () => {
	// Create initial markers from labs
	const navigate = useNavigate();

	const markers = labs
		.filter((lab) => lab.coordinates)
		.flatMap((lab) => {
			if (typeof lab.coordinates === "object" && !Array.isArray(lab.coordinates)) {
				return Object.entries(lab.coordinates).map(([locationKey, coords], index) => ({
					position: coords,
					popup: (
						<div>
							<h2>{`${lab.title} - ${locationKey}`}</h2>
							<p />
							<SecondaryBackgroundButton
								title="EXPLORE"
								size="small"
								onClick={() => navigate(lab.path)}
							/>
						</div>
					),
					hiddable: true,
					name: `${lab.title} - ${index + 1}`,
					defaultChecked: false,
				}));
			}

			return [{
				position: lab.coordinates,
				popup: (
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
								title={lab.title}
								size="small"
								onClick={() => navigate(lab.path)}
							/>
						</div>
						<p>{"A description of the Living Lab will probably go here"}</p>
					</div>
				),
				hiddable: true,
				name: lab.title,
				defaultChecked: false,
			}];
		});

	// Group labs by region
	const labsByRegion = labs.reduce((acc, lab) => {
		if (lab.region && lab.coordinates) {
			if (!acc[lab.region]) {
				acc[lab.region] = [];
			}

			acc[lab.region].push(lab);
		}

		return acc;
	}, {});

	const groups = Object.entries(labsByRegion).map(([region, regionLabs]) => ({
		hiddable: true,
		name: region,
		defaultChecked: true,
		shapes: {
			markers: regionLabs.flatMap((lab) => {
				// Handle object-style coordinates (multiple locations)
				if (typeof lab.coordinates === "object" && !Array.isArray(lab.coordinates)) {
					return Object.entries(lab.coordinates).map(([locationKey, coords]) => ({
						position: coords,
						popup: (
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
										title={`${lab.title} - ${locationKey}`}
										size="small"
										onClick={() => navigate(lab.path)}
									/>
								</div>
								<p>{"A description of the Living Lab will probably go here"}</p>
							</div>
						),
					}));
				}

				// Handle single location
				return [{
					position: lab.coordinates,
					popup: (
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
									title={lab.title}
									size="small"
									onClick={() => navigate(lab.path)}
								/>
							</div>
							<p>{"A description of the Living Lab will probably go here"}</p>
						</div>
					),
				}];
			}),
			circles: [],
			rectangles: [],
			polygons: [],
		},
	}));

	return (
		<Grid container width="100%" height="100%" display="flex" direction="row" justifyContent="space-around" spacing={2}>
			<Grid item width="90%" height="70%">
				<MapComponent
					scrollWheelZoom
					zoom={4}
					center={[55.499_383, 28.527_665]}
					layers={{
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
					}}
					groups={groups}
					markers={markers}
				/>
			</Grid>
		</Grid>
	);
};

export default memo(Map);
