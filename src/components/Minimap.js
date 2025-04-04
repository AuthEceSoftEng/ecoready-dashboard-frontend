import { useMap, useMapEvent, Rectangle, MapContainer, TileLayer } from "react-leaflet";
import { useState, useCallback, useMemo, useEffect } from "react";

const BOUNDS_STYLE = { weight: 1 };

const POSITION_CLASSES = {
	bottomleft: "leaflet-bottom leaflet-left",
	bottomright: "leaflet-bottom leaflet-right",
	topleft: "leaflet-top leaflet-left",
	topright: "leaflet-top leaflet-right",
};

const MinimapBounds = ({ parentMap, zoom }) => {
	const minimap = useMap();

	// Clicking a point on the minimap sets the parent's map center
	const onClick = useCallback(
		(e) => {
			parentMap.setView(e.latlng, parentMap.getZoom());
		},
		[parentMap],
	);
	useMapEvent("click", onClick);

	// Keep track of bounds in state to trigger renders
	const [bounds, setBounds] = useState(parentMap.getBounds());
	const onChange = useCallback(() => {
		setBounds(parentMap.getBounds());
		// Update the minimap's view to match the parent map's center and zoom
		minimap.setView(parentMap.getCenter(), zoom);
	}, [minimap, parentMap, zoom]);

	useEffect(() => {
		parentMap.on("move", onChange);
		parentMap.on("zoom", onChange);

		return () => {
			parentMap.off("move", onChange);
			parentMap.off("zoom", onChange);
		};
	}, [parentMap, onChange]);

	return <Rectangle bounds={bounds} pathOptions={BOUNDS_STYLE} />;
};

const MinimapControl = ({ position = "bottomright", zoom = 4 }) => {
	const parentMap = useMap();
	const mapZoom = zoom || 0;

	// Memoize the minimap so it's not affected by position changes
	const minimap = useMemo(
		() => (
			<MapContainer
				style={{ height: 100, width: 100 }}
				center={parentMap.getCenter()}
				zoom={mapZoom}
				dragging={false}
				doubleClickZoom={false}
				scrollWheelZoom={false}
				attributionControl={false}
				zoomControl={false}
			>
				<TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
				<MinimapBounds parentMap={parentMap} zoom={mapZoom} />
			</MapContainer>
		),
		[mapZoom, parentMap],
	);

	const positionClass = (position && POSITION_CLASSES[position]) || POSITION_CLASSES.topright;
	return (
		<div className={positionClass}>
			<div className="leaflet-control leaflet-bar">{minimap}</div>
		</div>
	);
};

export default MinimapControl;
