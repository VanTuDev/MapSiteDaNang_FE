import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import L from "leaflet";
import App from "./App.jsx";
import { registerSW } from 'virtual:pwa-register';

// Import CSS
import "leaflet/dist/leaflet.css";
import "leaflet-draw/dist/leaflet.draw.css";
import "./index.css";

// Fix Leaflet icons
import marker2x from "leaflet/dist/images/marker-icon-2x.png";
import marker1x from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: marker2x,
  iconUrl: marker1x,
  shadowUrl: markerShadow,
});

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <App />
  </StrictMode>
);

// Đăng ký Service Worker cho PWA
if (typeof window !== 'undefined') {
  registerSW({ immediate: true });
}
