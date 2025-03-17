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
	const { roundUpToNextProductMax, formattedNumberMax } = formatNumber(max, "Max");
	const { roundUpToNextProductMean, formattedNumberMean } = formatNumber(mean, "Mean");

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
						{min}
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
			<Grid item xs={12} style={{ width: "100%", height: "100%" }}>
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
							.filter((metric) => metric.hiddable && metric.type === "production")
							.map((metric) => (
								<LayersControl.BaseLayer key={`${metric.name}-${metric.range[0]}-${metric.range[1]}`} name={metric.name} checked={isInitialRender ? metric.defaultChecked : activeLayer === metric.name}>
									<GeoJSON data={metric.data} style={metric.style} onEachFeature={metric.action} />
									<style>
										{`
										.leaflet-control-layers-toggle {
											background-image: url("data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 enable-background=%22new 0 0 24 24%22 height=%2224%22 viewBox=%220 0 24 24%22 width=%2224%22%3E%3Cg%3E%3Crect fill=%22none%22 height=%2224%22 width=%2224%22/%3E%3Crect fill=%22none%22 height=%2224%22 width=%2224%22/%3E%3C/g%3E%3Cg%3E%3Cg%3E%3Cpath d=%22M19.5,11.97c0.93,0,1.78,0.28,2.5,0.76V7.97c0-1.1-0.9-2-2-2h-6.29l-1.06-1.06l1.06-1.06c0.2-0.2,0.2-0.51,0-0.71 s-0.51-0.2-0.71,0l-2.83,2.83c-0.2,0.2-0.2,0.51,0,0.71l0,0c0.2,0.2,0.51,0.2,0.71,0l1.06-1.06L13,6.68v2.29c0,1.1-0.9,2-2,2 h-0.54c0.95,1.06,1.54,2.46,1.54,4c0,0.34-0.04,0.67-0.09,1h3.14C15.3,13.73,17.19,11.97,19.5,11.97z%22/%3E%3Cpath d=%22M19.5,12.97c-1.93,0-3.5,1.57-3.5,3.5s1.57,3.5,3.5,3.5s3.5-1.57,3.5-3.5S21.43,12.97,19.5,12.97z M19.5,17.97 c-0.83,0-1.5-0.67-1.5-1.5s0.67-1.5,1.5-1.5s1.5,0.67,1.5,1.5S20.33,17.97,19.5,17.97z%22/%3E%3Cpath d=%22M4,8.97h5c0-1.1-0.9-2-2-2H4c-0.55,0-1,0.45-1,1C3,8.53,3.45,8.97,4,8.97z%22/%3E%3Cpath d=%22M9.83,13.79l-0.18-0.47l0.93-0.35c-0.46-1.06-1.28-1.91-2.31-2.43l-0.4,0.89l-0.46-0.21l0.4-0.9 C7.26,10.11,6.64,9.97,6,9.97c-0.53,0-1.04,0.11-1.52,0.26l0.34,0.91l-0.47,0.18L4,10.4c-1.06,0.46-1.91,1.28-2.43,2.31l0.89,0.4 l-0.21,0.46l-0.9-0.4C1.13,13.72,1,14.33,1,14.97c0,0.53,0.11,1.04,0.26,1.52l0.91-0.34l0.18,0.47l-0.93,0.35 c0.46,1.06,1.28,1.91,2.31,2.43l0.4-0.89l0.46,0.21l-0.4,0.9c0.57,0.22,1.18,0.35,1.82,0.35c0.53,0,1.04-0.11,1.52-0.26L7.18,18.8 l0.47-0.18L8,19.55c1.06-0.46,1.91-1.28,2.43-2.31l-0.89-0.4l0.21-0.46l0.9,0.4c0.22-0.57,0.35-1.18,0.35-1.82 c0-0.53-0.11-1.04-0.26-1.52L9.83,13.79z M7.15,17.75c-1.53,0.63-3.29-0.09-3.92-1.62c-0.63-1.53,0.09-3.29,1.62-3.92 c1.53-0.63,3.29,0.09,3.92,1.62C9.41,15.36,8.68,17.11,7.15,17.75z%22/%3E%3C/g%3E%3C/g%3E%3C/svg%3E") !important;
											background-size: 30px 30px !important;
											background-position: center !important;
											background-repeat: no-repeat !important;
											width: 40px !important;
											height: 40px !important;
										}
										`}
									</style>
								</LayersControl.BaseLayer>
							))}
					</LayersControl>

					<LayersControl position="topright" collapsed={false}>
						{geodata
							.filter((metric) => metric.hiddable && metric.type === "price")
							.map((metric) => (
								<LayersControl.BaseLayer key={`${metric.name}-${metric.range[0]}-${metric.range[1]}`} name={metric.name} checked={isInitialRender ? metric.defaultChecked : activeLayer === metric.name}>
									<GeoJSON data={metric.data} style={metric.style} onEachFeature={metric.action} />
								</LayersControl.BaseLayer>
							))}
					</LayersControl>

					{showLegend && markers.length > 0 && (
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
