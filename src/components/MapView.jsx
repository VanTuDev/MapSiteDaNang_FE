import { useEffect } from "react";
import { MapContainer, Marker, Popup, TileLayer, useMap } from "react-leaflet";
import { getMarkerIcon, toBounds } from "../lib/geo-utils";
import DrawControl from "./DrawControl";
import LayerControl from "./LayerControl";

function ViewFitBounds({ bounds, depsKey }) {
  const map = useMap();
  useEffect(() => {
    if (bounds) map.fitBounds(bounds, { padding: [24, 24], maxZoom: 15 });
  }, [bounds, depsKey, map]);
  return null;
}

export default function MapView({
  pois,
  activeShapes,
  onShapesChange,
  currentBounds,
  visiblePOIs,
  insideIds,
  drawnItemsRef,
}) {
  const mapInitCenter = [16.047, 108.206]; // Đà Nẵng center

  const basemaps = [
    {
      name: "OpenStreetMap",
      url: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
      attribution: "&copy; OpenStreetMap contributors",
    },
    {
      name: "Google Streets",
      url: "https://{s}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}",
      attribution: "Google Maps",
      subdomains: ["mt0", "mt1", "mt2", "mt3"],
    },
    {
      name: "Google Satellite",
      url: "https://{s}.google.com/vt/lyrs=s&x={x}&y={y}&z={z}",
      attribution: "Google Maps",
      subdomains: ["mt0", "mt1", "mt2", "mt3"],
    },
    {
      name: "Google Hybrid",
      url: "https://{s}.google.com/vt/lyrs=s,h&x={x}&y={y}&z={z}",
      attribution: "Google Maps",
      subdomains: ["mt0", "mt1", "mt2", "mt3"],
    },
    {
      name: "Google Terrain",
      url: "https://{s}.google.com/vt/lyrs=p&x={x}&y={y}&z={z}",
      attribution: "Google Maps",
      subdomains: ["mt0", "mt1", "mt2", "mt3"],
    },
  ];

  return (
    <div className="h-[70vh] w-full">
      <MapContainer
        center={mapInitCenter}
        zoom={12}
        style={{ height: "100%", width: "100%" }}
        zoomControl
      >
        <ViewFitBounds bounds={currentBounds} depsKey={JSON.stringify(currentBounds)} />
        <LayerControl basemaps={basemaps} drawnItemsRef={drawnItemsRef} />
        <DrawControl onShapesChange={onShapesChange} drawnItemsRef={drawnItemsRef} />

        {visiblePOIs.map((p) => {
          const inside = insideIds.has(p.id);
          const icon = getMarkerIcon(p.category, inside);
          return (
            <Marker key={p.id} position={[p.lat, p.lng]} icon={icon}>
              <Popup>
                <div className="space-y-2">
                  <div className="font-semibold">{p.name}</div>
                  <div className="text-sm text-gray-500">{p.address}</div>
                  <div className="flex flex-wrap gap-1">
                    <span className="rounded bg-blue-50 px-1.5 py-0.5 text-xs font-medium text-blue-700 capitalize">
                      {p.category}
                    </span>
                    {p.productTypes.map((type) => (
                      <span 
                        key={type}
                        className="rounded bg-green-50 px-1.5 py-0.5 text-xs font-medium text-green-700"
                      >
                        {type}
                      </span>
                    ))}
                  </div>
                  <div className="text-xs text-gray-500">
                    <span className="font-medium">{p.city}</span>
                  </div>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
}
