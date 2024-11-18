import { Grid } from "@mui/material";
import { memo } from "react";
import { Icon } from "leaflet";

import MapComponent from "../components/Map.js";
import { PrimaryBackgroundButton } from "../components/Buttons.js";
import ServicesIcon from "../assets/icons/services.png";

const Map = () => (
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
					defaultChecked: true,
					name: "Default Map",
				},
				topographical: {
					show: true,
					hiddable: true,
					defaultChecked: true,
					name: "Topographical Map",
				},
				humanitarian: {
					show: true,
					hiddable: true,
					defaultChecked: true,
					name: "Humanitarian Map",
				},
				cycling: {
					show: true,
					hiddable: true,
					defaultChecked: true,
					name: "Cycling Map",
				},
			}}
			markers={[
				{
					position: [40.627, 22.96], // Latitude and longitude of the marker
					popup: "A pretty CSS3 popup. \n Easily customizable.", // Text to display in the popup
				},
				{
					position: [40.627, 23.06], // Latitude and longitude of the marker
					popup: ( // Custom popup
						<div>
							<h2>{"Popup with HTML"}</h2>
							<p>
								{"You can put any HTML here."}
							</p>
							<PrimaryBackgroundButton
								title="Button"
								height="30px"
								onClick={() => {
									console.log("Button clicked!");
								}}
							/>
						</div>
					),
				},
				{
					position: [40.627, 22.86], // Latitude and longitude of the marker
					popup: "This marker can be hidden from the layers menu.", // Text to display in the popup
					hiddable: true, // Whether the marker can be hidden from the layers menu
					name: "Marker", // Name of the marker in the layers menu
					defaultChecked: true, // Whether the marker is checked by default in the layers menu
				},
				{
					position: [40.647, 22.86], // Latitude and longitude of the marker
					popup: "Custom marker icon", // Text to display in the popup
					icon: new Icon({ // Custom icon
						iconUrl: ServicesIcon,
						iconSize: [35, 35], // size of the icon
						// iconAnchor: [22, 94], // point of the icon which will correspond to marker's location
						// popupAnchor: [-3, -76], // point from which the popup should open relative to the iconAnchor
					}),
				},
			]}
			circles={[ // Circles to display on the map
				{
					center: [40.627, 22.96], // Latitude and longitude of the circle center
					radius: 1000, // Radius of the circle in meters
					fillColor: "blue", // Fill color of the circle
					color: "blue", // Border color of the circle
				},
				{
					center: [40.627, 23.06], // Latitude and longitude of the circle center
					radius: 2000, // Radius of the circle in meters
					fillColor: "primary", // Fill color of the circle
					color: "transparent", // Border color of the circle
					hiddable: true, // Whether the circle can be hidden from the layers menu
					name: "Circle", // Name of the circle in the layers menu
					defaultChecked: true, // Whether the circle is checked by default in the layers menu
				},
			]}
			rectangles={[ // Rectangles to display on the map
				{
					bounds: [ // Latitude and longitude of the rectangle points
						[40.627, 22.96],
						[40.617, 23.06],
					],
					fillColor: "blue", // Fill color of the rectangle
					color: "blue", // Border color of the rectangle
				},
				{
					bounds: [ // Latitude and longitude of the rectangle points
						[40.647, 22.96],
						[40.667, 23.06],
					],
					fillColor: "red", // Fill color of the rectangle
					color: "red", // Border color of the rectangle
					hiddable: true, // Whether the rectangle can be hidden from the layers menu
					name: "Rectangle", // Name of the rectangle in the layers menu
					defaultChecked: true, // Whether the rectangle is checked by default in the layers menu
				},
			]}
			polygons={[ // Polygons to display on the map
				{
					positions: [ // Latitude and longitude of the polygon points
						[40.627, 22.96],
						[40.627, 23.06],
						[40.647, 22.86],
					],
					fillColor: "green", // Fill color of the rectangle
					color: "green", // Border color of the rectangle
				},
				{
					positions: [ // Latitude and longitude of the polygon points
						[40.647, 22.96],
						[40.647, 23.06],
						[40.667, 22.86],
					],
					fillColor: "yellow", // Fill color of the rectangle
					color: "yellow", // Border color of the rectangle
					hiddable: true, // Whether the polygon can be hidden from the layers menu
					name: "Polygon", // Name of the polygon in the layers menu
					defaultChecked: true, // Whether the polygon is checked by default in the layers menu
				},
			]}
			groups={[ // Groups of shapes to display on the map
				{
					hiddable: true, // Whether the group can be hidden from the layers menu
					name: "Group 1", // Name of the group in the layers menu
					defaultChecked: true, // Whether the group is checked by default in the layers menu
					shapes: { // Shapes in the group
						markers: [], // Markers in the group
						circles: [ // Circles in the group
							{
								center: [40.707, 22.96], // Latitude and longitude of the circle center
								radius: 1000, // Radius of the circle in meters
								fillColor: "#00426E", // Fill color of the circle
								color: "transparent", // Border color of the circle
							},
						],
						rectangles: [ // Rectangles in the group
							{
								bounds: [ // Latitude and longitude of the rectangle points
									[40.707, 22.96],
									[40.697, 23.06],
								],
								fillColor: "#00426E", // Fill color of the rectangle
								color: "transparent", // Border color of the rectangle
							},
						],
						polygons: [ // Polygons in the group
							{
								positions: [ // Latitude and longitude of the polygon points
									[40.707, 22.96],
									[40.707, 23.06],
									[40.727, 22.86],
								],
								fillColor: "#00426E", // Fill color of the rectangle
								color: "transparent", // Border color of the rectangle
							},
						],
					},
				},
			]}
		/>
	</Grid>
);

export default memo(Map);
