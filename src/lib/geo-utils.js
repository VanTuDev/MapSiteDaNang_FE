import L from "leaflet";
import { point, polygon as turfPolygon } from "@turf/helpers";
import { union } from "@turf/turf";
import circle from "@turf/circle";
import booleanPointInPolygon from "@turf/boolean-point-in-polygon";

// Cache cho các icon marker
const iconCache = new Map();

/**
 * Tạo geometry từ mảng các hình vẽ
 * @param {Array} shapes - Mảng các hình vẽ (polygon/circle)
 * @returns {Object|null} GeoJSON geometry hoặc null nếu không có hình
 */
export function makeUnionGeometryFromShapes(shapes) {
   if (!shapes.length) return null;

   const features = shapes.map((s) => {
      if (s.type === "circle") {
         return circle(s.center, s.radiusMeters / 1000, { steps: 64, units: "kilometers" });
      }
      const ring =
         s.coordinates[0][0] === s.coordinates.at(-1)[0] &&
            s.coordinates[0][1] === s.coordinates.at(-1)[1]
            ? s.coordinates
            : [...s.coordinates, s.coordinates[0]];
      return turfPolygon([ring]);
   });

   let combined = features[0];
   if (features.length > 1) {
      try {
         for (let i = 1; i < features.length; i++) {
            const unionResult = union(combined, features[i]);
            if (unionResult) combined = unionResult;
         }
      } catch (error) {
         console.warn("Lỗi khi kết hợp các hình vẽ:", error);
      }
   }

   return combined?.geometry;
}

/**
 * Tìm các POI nằm trong geometry và đếm theo category
 * @param {Array} pois - Mảng các POI
 * @param {Object} geometry - GeoJSON geometry
 * @returns {Object} Kết quả gồm các ID nằm trong vùng và số lượng theo category
 */
export function pointsInGeometry(pois, geometry) {
   const insideIds = new Set();
   const categoryCounts = {};
   if (!geometry) return { insideIds, categoryCounts };

   for (const poi of pois) {
      const pt = point([poi.lng, poi.lat]);
      if (booleanPointInPolygon(pt, geometry)) {
         insideIds.add(poi.id);
         categoryCounts[poi.category] = (categoryCounts[poi.category] ?? 0) + 1;
      }
   }
   return { insideIds, categoryCounts };
}

/**
 * Tạo bounds từ mảng POI
 * @param {Array} pois - Mảng các POI
 * @returns {L.LatLngBounds|null} Bounds hoặc null nếu không có POI
 */
export function toBounds(pois) {
   if (!pois.length) return null;
   return L.latLngBounds(pois.map((p) => L.latLng(p.lat, p.lng)));
}

// Metadata cho các loại địa điểm
export const CATEGORY_METADATA = {
   food: {
      color: "#f97316",
      icon: "🍽️",
      label: "Đồ ăn",
   },
   cafe: {
      color: "#a855f7",
      icon: "☕",
      label: "Cà phê",
   },
   restaurant: {
      color: "#f97316",
      icon: "🍴",
      label: "Nhà hàng",
   },
   park: {
      color: "#22c55e",
      icon: "🌳",
      label: "Công viên",
   },
   school: {
      color: "#3b82f6",
      icon: "🏫",
      label: "Trường học",
   },
   hospital: {
      color: "#ef4444",
      icon: "🏥",
      label: "Bệnh viện",
   },
   bank: {
      color: "#6b7280",
      icon: "🏦",
      label: "Ngân hàng",
   },
   store: {
      color: "#eab308",
      icon: "🏪",
      label: "Cửa hàng",
   },
   hotel: {
      color: "#ec4899",
      icon: "🏨",
      label: "Khách sạn",
   },
   other: {
      color: "#6b7280",
      icon: "📍",
      label: "Khác",
   },
};

/**
 * Tạo icon cho marker trên bản đồ
 * @param {string} category - Category của POI
 * @param {boolean} isInside - POI có nằm trong vùng chọn không
 * @returns {L.DivIcon} Icon cho marker
 */
export function getMarkerIcon(category, isInside) {
   const cacheKey = `${category}_${isInside ? "in" : "out"}`;
   if (iconCache.has(cacheKey)) {
      return iconCache.get(cacheKey);
   }

   const meta = CATEGORY_METADATA[category] || CATEGORY_METADATA.other;
   const color = meta.color;
   const borderColor = isInside ? "#16a34a" : "#4b5563";

   const icon = L.divIcon({
      className: "",
      html: `
      <div class="relative w-6 h-6 transition-transform duration-200 ${isInside ? 'scale-120' : ''}">
        <div class="absolute inset-0 flex items-center justify-center text-sm rounded-full shadow-md"
             style="background: ${color}; border: 2px solid ${borderColor}">
          ${meta.icon}
        </div>
      </div>
    `,
      iconSize: [24, 24],
      iconAnchor: [12, 12],
   });

   iconCache.set(cacheKey, icon);
   return icon;
}
