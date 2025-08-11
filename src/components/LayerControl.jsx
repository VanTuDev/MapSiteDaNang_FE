import { useEffect } from "react";
import { useMap } from "react-leaflet";
import L from "leaflet";

export default function LayerControl({ basemaps, drawnItemsRef }) {
  const map = useMap();

  useEffect(() => {
    if (!map) return;

    const baseLayers = {};
    const overlayLayers = {};

    basemaps.forEach((bm) => {
      const opts = { attribution: bm.attribution, maxZoom: 20 };
      if (bm.subdomains) opts.subdomains = bm.subdomains;
      baseLayers[bm.name] = L.tileLayer(bm.url, opts);
    });

    if (drawnItemsRef.current) {
      overlayLayers["Vùng vẽ"] = drawnItemsRef.current;
      map.addLayer(drawnItemsRef.current);
    }

    if (basemaps.length > 0) map.addLayer(baseLayers[basemaps[0].name]);

    const control = L.control.layers(baseLayers, overlayLayers, { collapsed: false });
    control.addTo(map);

    return () => {
      control.remove();
      Object.values(baseLayers).forEach((layer) => map.hasLayer(layer) && map.removeLayer(layer));
      Object.values(overlayLayers).forEach((layer) => map.hasLayer(layer) && map.removeLayer(layer));
    };
  }, [map, basemaps, drawnItemsRef]);

  return null;
}
