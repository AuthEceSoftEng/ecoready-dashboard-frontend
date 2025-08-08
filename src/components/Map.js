import { Grid } from "@mui/material";
import { LayersControl, MapContainer, Marker, Popup, TileLayer, GeoJSON } from "react-leaflet";
import { scaleQuantize } from "d3-scale";
import { useState, useEffect } from "react";

import colors from "../_colors.scss";
import { formatNumber } from "../utils/data-handling-functions.js";

import MinimapControl from "./Minimap.js";

const urls = {
	physical: "https://tile.openstreetmap.org/{z}/{x}/{y}.png",
};

const choroplethColors = [colors.choropleth1, colors.choropleth2, colors.choropleth3, colors.choropleth4, colors.choropleth5];
export const getColor = (value, range = [0, 100]) => {
	if (value === null || value === undefined || value === "N/A" || value === "-") {
		return colors.greyDark;
	}

	return scaleQuantize().domain(range).range(choroplethColors)(value);
};

const TheLegendControl = ({ gdata, selectedLayerIndex }) => {
	if (!gdata || gdata.length === 0 || selectedLayerIndex >= gdata.length) return null;
	// console.log("Legend control updated with:", gdata[selectedLayerIndex]);

	const selectedLayer = gdata[selectedLayerIndex];
	return (
		<div
			style={{
				position: "absolute",
				top: "10px", // Distance from the top of the map
				left: "50%", // Center horizontally
				transform: "translateX(-50%)", // Adjust for centering
				zIndex: 1000,
			}}
		>
			<div
				style={{
					backgroundColor: "white",
					border: "2px solid rgba(0,0,0,0.2)",
					borderRadius: "5px",
					padding: "10px",
					boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)", // Optional for better appearance
				}}
			>
				<Legend
					title={selectedLayer.name}
					min={selectedLayer.range[0]}
					max={selectedLayer.range[1]}
					unit={selectedLayer.unit}
					colorscale={selectedLayer.style.fillColor}
				/>
			</div>
		</div>
	);
};

const Legend = ({ min, max, unit, colorscale = choroplethColors }) => {
	const mean = (min + max) / 2;

	const { formattedNumberMax } = formatNumber(max, "Max");
	const { formattedNumberMean } = formatNumber(mean, "Mean");
	const { formattedNumberMin } = formatNumber(min, "Min");

	/* <h4 style={{ margin: "0 10px 0 0" }}>{title}</h4> */
	return (
		<div style={{ height: "100%", padding: "3px", borderRadius: "2px", display: "flex", flexDirection: "row", alignItems: "center" }}>

			<div style={{ display: "flex", flexDirection: "column", alignItems: "center", height: "100%" }}>
				{/* Gradient bar */}
				<div
					style={{
						width: "200px", // Set a fixed width for the gradient bar
						height: "20px", // Adjust height for the bar
						background: `linear-gradient(to right, ${colorscale.join(", ")})`,
						borderRadius: "2px",
					}}
				/>

				{/* Value labels below the gradient bar */}
				<div style={{ display: "flex", flexDirection: "row", justifyContent: "space-between", fontSize: "12px", width: "200px", marginTop: "5px" }}>
					<span>
						{formattedNumberMin}
						{" "}
						{unit}
					</span>
					<span>
						{formattedNumberMean}
						{" "}
						{unit}
					</span>
					<span>
						{formattedNumberMax}
						{" "}
						{unit}
					</span>
				</div>
			</div>
		</div>
	);
};

const MapComponent = ({
	scrollWheelZoom = true,
	zoom = 12,
	center = [40.627, 22.96],
	layers = { normal: { show: false }, simple: { show: false }, dark: { show: false }, terrain: { show: false }, satellite: { show: false } },
	markers = [],
	geodata = [],
	showLegend = true, // New prop to control legend visibility
	showMinimap = false,
}) => {
	const [selectedLayerIndex, setSelectedLayerIndex] = useState(0);
	const [activeLayer, setActiveLayer] = useState(null);
	const [isInitialRender, setIsInitialRender] = useState(true);

	useEffect(() => {
		const defaultLayer = geodata.find((metric) => metric.hiddable && metric.defaultChecked);
		if (defaultLayer) {
			setActiveLayer(defaultLayer.name);
			const newIndex = geodata.findIndex((metric) => metric.name === defaultLayer.name);
			if (newIndex !== -1) {
				setSelectedLayerIndex(newIndex);
			}
		}

		setIsInitialRender(false);
	}, [geodata]);

	const handleLayerChange = (layerName) => {
		setActiveLayer(layerName);
		const newIndex = geodata.findIndex((metric) => metric.name === layerName);
		if (newIndex !== -1) {
			setSelectedLayerIndex(newIndex);
		}
	};

	return (
		<Grid container style={{ width: "100%", height: "100%" }}>
			<Grid item xs={12} style={{ width: "100%", height: "100%</Grid>" }}>
				<MapContainer
					style={{ width: "100%", height: "100%" }}
					center={center}
					zoom={zoom}
					whenReady={(map) => {
						map.target.on("baselayerchange", (event) => {
							handleLayerChange(event.name);
						});
					}}
					scrollWheelZoom={scrollWheelZoom}
					minZoom={2.37}
					maxBounds={[[-90, -180], [90, 180]]}
					maxBoundsViscosity={1}
					boundsOptions={{ padding: [50, 50], animate: true }}
				>
					{showMinimap && <MinimapControl position="bottomleft" zoom={3} center={center} />}
					{Object.keys(layers)
						.filter((layer) => layers[layer].show && !layers[layer].hiddable)
						.map((layer, index) => (
							<TileLayer
								key={index}
								url={urls[layer]}
								attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
							/>
						))}
					{geodata.filter((metric) => !metric.hiddable).map((metric) => (
						<GeoJSON key={`${metric.name}-${metric.range[0]}-${metric.range[1]}`} data={metric.data} style={metric.style} onEachFeature={metric.action} />
					))}
					<LayersControl position="topright" collapsed={false}>
						{geodata
							.filter((metric) => metric.hiddable)
							.map((metric) => (
								<LayersControl.BaseLayer key={`${metric.name}-${metric.range[0]}-${metric.range[1]}`} name={metric.name} checked={isInitialRender ? metric.defaultChecked : activeLayer === metric.name}>
									<GeoJSON data={metric.data} style={metric.style} onEachFeature={metric.action} />
								</LayersControl.BaseLayer>
							))}
					</LayersControl>

					{showLegend && markers.some((marker) => marker.hiddable) && (
						<LayersControl position="bottomright" collapsed={false}>
							{markers.filter((marker) => marker.hiddable).map((marker, index) => (
								<LayersControl.Overlay key={index} name={marker.name} checked={marker.defaultChecked}>
									<Marker
										position={marker.position}
										{...(marker.icon && { icon: marker.icon })}
									>
										{marker.popup && (
											<Popup>
												{marker.popup}
											</Popup>
										)}
									</Marker>
								</LayersControl.Overlay>
							))}
						</LayersControl>
					)}

					<TheLegendControl gdata={geodata} selectedLayerIndex={selectedLayerIndex} />
				</MapContainer>
			</Grid>
		</Grid>
	);
};

export default MapComponent;
