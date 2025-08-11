import { useEffect } from "react";
import { useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet-draw";

export default function DrawControl({ onShapesChange = () => {}, drawnItemsRef }) {
  const map = useMap();

  useEffect(() => {
    if (!map) return;

    if (!drawnItemsRef.current) drawnItemsRef.current = new L.FeatureGroup();
    const drawnItems = drawnItemsRef.current;
    map.addLayer(drawnItems);

    const control = new L.Control.Draw({
      position: "topleft",
      edit: {
        featureGroup: drawnItems,
        remove: true,
        selectedPathOptions: { maintainColor: true, color: "#0ea5e9", opacity: 0.8, fillOpacity: 0.1 },
      },
      draw: {
        marker: false,
        circlemarker: false,
        polyline: false,
        polygon: { allowIntersection: false, showArea: false, shapeOptions: { color: "#10b981", weight: 2, fillOpacity: 0.1 } },
        rectangle: { shapeOptions: { color: "#f59e0b", weight: 2, fillOpacity: 0.1 }, showArea: false },
        circle: { shapeOptions: { color: "#ef4444", weight: 2, fillOpacity: 0.08 }, showRadius: true },
      },
    });
    map.addControl(control);

    const extractShape = (layer) => {
      if (layer.getLatLng && layer.getRadius) {
        const c = layer.getLatLng();
        return { type: "circle", center: [c.lng, c.lat], radiusMeters: layer.getRadius() };
      }
      if (layer.getLatLngs) {
        const latlngs = layer.getLatLngs();
        const ring = Array.isArray(latlngs[0]) ? latlngs[0] : latlngs;
        const coords = ring.map((ll) => [ll.lng, ll.lat]);
        return { type: "polygon", coordinates: coords };
      }
      return null;
    };

    const recompute = () => {
      const shapes = drawnItems.getLayers().map(extractShape).filter(Boolean);
      onShapesChange(shapes);
    };

    map.on(L.Draw.Event.CREATED, (e) => { drawnItems.addLayer(e.layer); recompute(); });
    map.on(L.Draw.Event.EDITED, recompute);
    map.on(L.Draw.Event.DELETED, recompute);

    return () => {
      map.removeLayer(drawnItems);
      map.removeControl(control);
      map.off(L.Draw.Event.CREATED);
      map.off(L.Draw.Event.EDITED);
      map.off(L.Draw.Event.DELETED);
    };
  }, [map, onShapesChange, drawnItemsRef]);

  return null;
}
