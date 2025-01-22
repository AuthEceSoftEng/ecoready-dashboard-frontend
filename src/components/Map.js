import { Grid } from "@mui/material";
import { Circle, LayerGroup, LayersControl, MapContainer, Marker, Polygon, Popup, Rectangle, TileLayer, GeoJSON } from "react-leaflet";
import { scaleQuantize } from "d3-scale";

import colors from "../_colors.scss";
import { formatNumber } from "../utils/data-handling-functions.js";

import MinimapControl from "./Minimap.js";


import { useEffect } from "react";
import L from "leaflet";


const urls = {
	physical: "https://tile.openstreetmap.org/{z}/{x}/{y}.png"
};

export const getColor = (value, range = [0, 100]) => scaleQuantize().domain(range)
	.range([colors.choropleth1, colors.choropleth2, colors.choropleth3, colors.choropleth4, colors.choropleth5])(value);


function TheLegend({ }) {
	  useEffect(() => {
    const legend = L.control({ position: "bottomleft" });

    legend.onAdd = () => {
      const div = L.DomUtil.create("div", "info legend");
      div.innerHTML =
        "<h4>This is the legend</h4>" +
        "<b>Lorem ipsum dolor sit amet consectetur adipiscing</b>";
      return div;
    };
	  }, []);
	  return null;
}

const positionClass = 'leaflet-bottom leaflet-left';

const TheLegendControl = ({ gdata }) => {
	console.log("AAAAAAAAAAAAAAAAAA")
	console.log(gdata)
//	geodata.map((metric, index) => (
	//		<Grid key={index} item xs={1}>
			//	<Legend title={metric.name} min={metric.range[0]} max={metric.range[1]} unit={metric.unit} colorscale={metric.style.fillColor}/>
		//	</Grid>
//		))
    return(
    	 <div style={{position: "absolute", top: "70px", right: "10px", zIndex: 1000}}>
    	 	<div style={{backgroundColor: "white", border: "2px solid rgba(0,0,0,0.2)", borderRadius: "5px", minWidth: "150px"}}>
    	       <Legend title="rice1" min={gdata[0].range[0]} max={gdata[0].range[1]} unit={gdata[0].unit} colorscale={gdata[0].style.fillColor}/>
    	 	</div>
    	 </div>
      
//      <div>
//        <div className="leaflet-control leaflet-bar">
//          <div className="bg-red-500 w-[80px] h-[80px]">Block 1</div>
//        </div>
//        <div className="leaflet-control leaflet-bar">
//          <div className="bg-yellow-500 w-[80px] h-[80px]">Block 2</div>
//        </div>
//        <div className="leaflet-control leaflet-bar">
//          <div className="bg-green-500 w-[80px] h-[80px]">Block 3</div>
//        </div>
//        <div className="leaflet-control leaflet-bar">
//          <div className="bg-blue-500 w-[80px] h-[80px]">Block 4</div>
//        </div>
//      </div>
    )
  }


const Legend = ({ title, min, max, unit, colorscale = [ colors.choropleth1, colors.choropleth2, colors.choropleth3, colors.choropleth4, colors.choropleth5,], }) => {
	const mean = (min + max) / 2;
	  const { roundUpToNextProductMax, formattedNumberMax } = formatNumber(max, "Max");
	  const { roundUpToNextProductMean, formattedNumberMean } = formatNumber(mean, "Mean");

	  /*<h4 style={{ margin: "0 10px 0 0" }}>{title}</h4>*/
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
		          <span>{min} {unit}</span>
		          <span>{formattedNumberMean} {unit}</span>
		          <span>{formattedNumberMax} {unit}</span>
		        </div>
		      </div>
		    </div>
	);
};


const Plot = ({
	width = "100%",
	height = "100%",
	scrollWheelZoom = true,
	zoom = 12,
	center = [40.627, 22.96],
	layers = {normal: { show: false }, simple: { show: false }, dark: { show: false }, terrain: { show: false }, satellite: { show: false }},
	markers = [],
	circles = [],
	rectangles = [],
	polygons = [],
	groups = [],
	geodata = [],
	showMinimap = false, // Add this prop
}) => (
	<Grid container width="100%" height="100%" display="flex" direction="row" spacing={1}>
		<Grid item xs={10} style={{ padding: 1 }}>
			<MapContainer style={{ width, height }} center={center} zoom={zoom} scrollWheelZoom={scrollWheelZoom} minZoom={2.37}
				maxBounds={[[-90, -180], [90, 180]]} // Latitude/longitude bounds for whole world
				maxBoundsViscosity={1} // Makes bounds completely rigid
				boundsOptions={{ padding: [50, 50], animate: true, }} >
				{showMinimap && <MinimapControl position="bottomleft" zoom={3} center={center} />}
				{Object.keys(layers).filter((layer) => layers[layer].show && !layers[layer].hiddable).map((layer, index) => (
					<TileLayer key={index} url={urls[layer]} attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'/>
				))}
				{geodata.filter((metric) => !metric.hiddable).map((metric, index) => (
					<GeoJSON key={index} data={metric.data} style={metric.style} onEachFeature={metric.action} />
				))}
				{markers.filter((marker) => !marker.hiddable).map((marker, index) => (
					<Marker key={index} position={marker.position} {...(marker.icon && { icon: marker.icon })}>
						{marker.popup && (<Popup> {marker.popup} </Popup>)}
					</Marker>
				))}
				{circles.filter((circle) => !circle.hiddable).map((circle, index) => (
					<Circle key={index} center={circle.center}
						pathOptions={{
							fillColor: colors?.[circle?.fillColor] || circle?.fillColor,
							color: colors?.[circle?.color] || circle?.color,
						}}
						radius={circle.radius}
					/>
				))}
				{rectangles.filter((rectangle) => !rectangle.hiddable).map((rectangle, index) => (
					<Rectangle key={index} bounds={rectangle.bounds}
						pathOptions={{
							fillColor: colors?.[rectangle?.fillColor] || rectangle?.fillColor,
							color: colors?.[rectangle?.color] || rectangle?.color,
						}}
					/>
				))}
				{polygons.filter((polygon) => !polygon.hiddable).map((polygon, index) => (
					<Polygon key={index} positions={polygon.positions}
						pathOptions={{
							fillColor: colors?.[polygon?.fillColor] || polygon?.fillColor,
							color: colors?.[polygon?.color] || polygon?.color,
						}}
					/>
				))}
				{groups.filter((group) => !group.hiddable).map((group, index) => (
					<LayerGroup key={index}>
						{group.shapes.markers.filter((marker) => !marker.hiddable).map((marker, index2) => (
							<Marker key={index2} position={marker.position} {...(marker.icon && { icon: marker.icon })} >
								{marker.popup && ( <Popup> {marker.popup} </Popup> )}
							</Marker>
						))}
						{group.shapes.circles.filter((circle) => !circle.hiddable).map((circle, index2) => (
							<Circle key={index2} center={circle.center}
								pathOptions={{
									fillColor: colors?.[circle?.fillColor] || circle?.fillColor,
									color: colors?.[circle?.color] || circle?.color,
								}}
								radius={circle.radius}
							/>
						))}
						{group.shapes.rectangles.filter((rectangle) => !rectangle.hiddable).map((rectangle, index2) => (
							<Rectangle key={index2} bounds={rectangle.bounds}
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
				{geodata.length > 0 && (
					<LayersControl position="topright" collapsed={false}>
						{geodata.filter((metric) => metric.hiddable).map((metric, index) => (
							<LayersControl.BaseLayer key={index} name={metric.name} checked={metric.defaultChecked}>
								<GeoJSON key={index} data={metric.data} style={metric.style} onEachFeature={metric.action}/>
							</LayersControl.BaseLayer>
						))}
					</LayersControl>
				)}
				{groups.length > 0 && (
					<LayersControl position="bottomright">
						{groups.filter((group) => group.hiddable).map((group, index) => (
							<LayersControl.Overlay
								key={index}
								name={group.name}
								checked={group.defaultChecked}
							>
								<LayerGroup key={index}>
									{group.shapes.markers.map((marker, index2) => (
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
				)}
				{markers.length > 0 && (
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
				{console.log(geodata)}
				<TheLegendControl gdata={geodata} collapsed={false} />
			</MapContainer>
		</Grid>

		
		{/*geodata.length > 0
			&& geodata.map((metric, index) => (
				<Grid key={index} item xs={1}>
					<Legend title={metric.name} min={metric.range[0]} max={metric.range[1]} unit={metric.unit} colorscale={metric.style.fillColor}/>
				</Grid>
			))*/}

		</Grid>
);

export default Plot;
