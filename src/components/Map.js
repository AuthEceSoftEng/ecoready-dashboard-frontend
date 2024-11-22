
import { Grid } from "@mui/material";
import { Circle, LayerGroup, LayersControl, MapContainer, Marker, Polygon, Popup, Rectangle, TileLayer } from "react-leaflet";

import colors from "../_colors.scss";

const urls = {
	normal: "https://tile.openstreetmap.org/{z}/{x}/{y}.png",
	topographical: "https://a.tile.opentopomap.org/{z}/{x}/{y}.png",
	humanitarian: "https://a.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png",
	cycling: "https://{s}.tile-cyclosm.openstreetmap.fr/cyclosm/{z}/{x}/{y}.png",
};

const Plot = ({
	width = "100%",
	height = "100%",
	scrollWheelZoom = true,
	zoom = 12,
	center = [40.627, 22.96],
	layers = {
		normal: { show: false },
		simple: { show: false },
		dark: { show: false },
		terrain: { show: false },
		satellite: { show: false },
	},
	markers = [],
	circles = [],
	rectangles = [],
	polygons = [],
	groups = [],
}) => (
	<Grid
		item
		sx={{ width, height }}
	>
		<MapContainer
			center={center}
			zoom={zoom}
			scrollWheelZoom={scrollWheelZoom}
			minZoom={2.37}
			boundsOptions={{
				padding: [50, 50],
				animate: true,
			}}
		>
			{Object.keys(layers).filter((layer) => layers[layer].show && !layers[layer].hiddable).map((layer, index) => (
				<TileLayer
					key={index}
					url={urls[layer]}
					attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
				/>
			))}
			{markers.filter((marker) => !marker.hiddable).map((marker, index) => (
				<Marker
					key={index}
					position={marker.position}
					{...(marker.icon && { icon: marker.icon })}
				>
					{marker.popup && (
						<Popup>
							{marker.popup}
						</Popup>
					)}
				</Marker>
			))}
			{circles.filter((circle) => !circle.hiddable).map((circle, index) => (
				<Circle
					key={index}
					center={circle.center}
					pathOptions={{
						fillColor: colors?.[circle?.fillColor] || circle?.fillColor,
						color: colors?.[circle?.color] || circle?.color,
					}}
					radius={circle.radius}
				/>
			))}
			{rectangles.filter((rectangle) => !rectangle.hiddable).map((rectangle, index) => (
				<Rectangle
					key={index}
					bounds={rectangle.bounds}
					pathOptions={{
						fillColor: colors?.[rectangle?.fillColor] || rectangle?.fillColor,
						color: colors?.[rectangle?.color] || rectangle?.color,
					}}
				/>
			))}
			{polygons.filter((polygon) => !polygon.hiddable).map((polygon, index) => (
				<Polygon
					key={index}
					positions={polygon.positions}
					pathOptions={{
						fillColor: colors?.[polygon?.fillColor] || polygon?.fillColor,
						color: colors?.[polygon?.color] || polygon?.color,
					}}
				/>
			))}
			{groups.filter((group) => !group.hiddable).map((group, index) => (
				<LayerGroup key={index}>
					{group.shapes.markers.filter((marker) => !marker.hiddable).map((marker, index2) => (
						<Marker
							key={index2}
							position={marker.position}
							{...(marker.icon && { icon: marker.icon })}
						>
							{marker.popup && (
								<Popup>
									{marker.popup}
								</Popup>
							)}
						</Marker>
					))}
					{group.shapes.circles.filter((circle) => !circle.hiddable).map((circle, index2) => (
						<Circle
							key={index2}
							center={circle.center}
							pathOptions={{
								fillColor: colors?.[circle?.fillColor] || circle?.fillColor,
								color: colors?.[circle?.color] || circle?.color,
							}}
							radius={circle.radius}
						/>
					))}
					{group.shapes.rectangles.filter((rectangle) => !rectangle.hiddable).map((rectangle, index2) => (
						<Rectangle
							key={index2}
							bounds={rectangle.bounds}
							pathOptions={{
								fillColor: colors?.[rectangle?.fillColor] || rectangle?.fillColor,
								color: colors?.[rectangle?.color] || rectangle?.color,
							}}
						/>
					))}
					{group.shapes.polygons.filter((polygon) => !polygon.hiddable).map((polygon, index2) => (
						<Polygon
							key={index2}
							positions={polygon.positions}
							pathOptions={{
								fillColor: colors?.[polygon?.fillColor] || polygon?.fillColor,
								color: colors?.[polygon?.color] || polygon?.color,
							}}
						/>
					))}
				</LayerGroup>
			))}
			<LayersControl position="topright">
				{Object.keys(layers).filter((layer) => layers[layer].show && layers[layer].hiddable).map((layer, index) => (
					<LayersControl.BaseLayer key={index} name={layers[layer].name} checked={layers[layer].defaultChecked}>
						<TileLayer
							key={index}
							url={urls[layer]}
							attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
						/>
					</LayersControl.BaseLayer>
				))}
				{circles.filter((circle) => circle.hiddable).map((circle, index) => (
					<LayersControl.Overlay key={index} name={circle.name} checked={circle.defaultChecked}>
						<Circle
							key={index}
							center={circle.center}
							pathOptions={{
								fillColor: colors?.[circle?.fillColor] || circle?.fillColor,
								color: colors?.[circle?.color] || circle?.color,
							}}
							radius={circle.radius}
						/>
					</LayersControl.Overlay>
				))}
				{rectangles.filter((rectangle) => rectangle.hiddable).map((rectangle, index) => (
					<LayersControl.Overlay key={index} name={rectangle.name} checked={rectangle.defaultChecked}>
						<Rectangle
							key={index}
							bounds={rectangle.bounds}
							pathOptions={{
								fillColor: colors?.[rectangle?.fillColor] || rectangle?.fillColor,
								color: colors?.[rectangle?.color] || rectangle?.color,
							}}
						/>
					</LayersControl.Overlay>
				))}
				{polygons.filter((polygon) => polygon.hiddable).map((polygon, index) => (
					<LayersControl.Overlay key={index} name={polygon.name} checked={polygon.defaultChecked}>
						<Polygon
							key={index}
							positions={polygon.positions}
							pathOptions={{
								fillColor: colors?.[polygon?.fillColor] || polygon?.fillColor,
								color: colors?.[polygon?.color] || polygon?.color,
							}}
						/>
					</LayersControl.Overlay>
				))}
				{groups.filter((group) => group.hiddable).map((group, index) => (
					<LayersControl.Overlay key={index} name={group.name} checked={group.defaultChecked}>
						<LayerGroup key={index}>
							{group.shapes.markers.filter((marker) => !marker.hiddable).map((marker, index2) => (
								<Marker
									key={index2}
									position={marker.position}
									{...(marker.icon && { icon: marker.icon })}
								>
									{marker.popup && (
										<Popup>
											{marker.popup}
										</Popup>
									)}
								</Marker>
							))}
							{group.shapes.circles.filter((circle) => !circle.hiddable).map((circle, index2) => (
								<Circle
									key={index2}
									center={circle.center}
									pathOptions={{
										fillColor: colors?.[circle?.fillColor] || circle?.fillColor,
										color: colors?.[circle?.color] || circle?.color,
									}}
									radius={circle.radius}
								/>
							))}
							{group.shapes.rectangles.filter((rectangle) => !rectangle.hiddable).map((rectangle, index2) => (
								<Rectangle
									key={index2}
									bounds={rectangle.bounds}
									pathOptions={{
										fillColor: colors?.[rectangle?.fillColor] || rectangle?.fillColor,
										color: colors?.[rectangle?.color] || rectangle?.color,
									}}
								/>
							))}
							{group.shapes.polygons.filter((polygon) => !polygon.hiddable).map((polygon, index2) => (
								<Polygon
									key={index2}
									positions={polygon.positions}
									pathOptions={{
										fillColor: colors?.[polygon?.fillColor] || polygon?.fillColor,
										color: colors?.[polygon?.color] || polygon?.color,
									}}
								/>
							))}
						</LayerGroup>
					</LayersControl.Overlay>
				))}
			</LayersControl>
			<LayersControl position="topright">
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
		</MapContainer>
	</Grid>
);

export default Plot;
