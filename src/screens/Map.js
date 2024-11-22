import { Grid } from "@mui/material";
import { memo } from "react";
import { useNavigate } from "react-router-dom";
// import { Icon } from "leaflet";

import MapComponent from "../components/Map.js";
import { SecondaryBackgroundButton } from "../components/Buttons.js";
import { labs } from "../utils/useful-constants.js";

const Map = () => {
	const navigate = useNavigate();
	return (

		<Grid container width="100%" height="100%" display="flex" direction="row" justifyContent="space-around" spacing={2}>
			<MapComponent
				// eslint-disable-next-line react/jsx-boolean-value
				scrollWheelZoom={true} // Whether the map can be zoomed using the mouse wheel
				zoom={4} // Initial zoom level of the map
				center={[55.499_383, 28.527_665]} // Initial center of the map (set so that the whole of Europe is visible)
				layers={{ // Layers to display on the map
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
				markers={
					labs.filter((lab) => lab.coordinates)
						.flatMap((lab) => {
							// Handle object-style coordinates (multiple locations)
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
												onClick={() => {
													navigate(lab.path);
												}}
											/>
										</div>
									),
									hiddable: true,
									name: `${lab.title} - ${index + 1}`,
									defaultChecked: true,
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
												onClick={() => {
													navigate(lab.path);
												}}
											/>
										</div>
										<p>{"A description of the Living Lab will probably go here"}</p>
									</div>
								),
								hiddable: true,
								name: lab.title,
								defaultChecked: true,
							}];
						})
				}
			/>
		</Grid>
	);
};

export default memo(Map);
