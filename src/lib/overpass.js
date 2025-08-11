/**
 * Trích xuất các vòng ngoài từ geometry
 * @param {Object} geometry - GeoJSON geometry
 * @returns {Array} Mảng các vòng tọa độ
 */
export function extractOuterRings(geometry) {
   if (!geometry) return [];

   const rings = [];
   if (geometry.type === "Polygon") {
      rings.push(geometry.coordinates[0]);
   } else if (geometry.type === "MultiPolygon") {
      geometry.coordinates.forEach(poly => rings.push(poly[0]));
   }
   return rings;
}

/**
 * Chuyển đổi vòng tọa độ thành chuỗi Overpass
 * @param {Array} ring - Mảng các tọa độ [lng, lat]
 * @returns {string} Chuỗi tọa độ cho Overpass
 */
export function ringToOverpassPoly(ring) {
   // Đảm bảo vòng tọa độ đóng (điểm đầu = điểm cuối)
   const closedRing = ring[0][0] === ring[ring.length - 1][0] && ring[0][1] === ring[ring.length - 1][1]
      ? ring
      : [...ring, ring[0]];

   // Tạo chuỗi tọa độ cho Overpass
   // Format: lat1 lon1 lat2 lon2 lat3 lon3 ...
   return closedRing
      .map(coord => {
         const lat = Math.round(coord[1] * 1e6) / 1e6; // Làm tròn 6 chữ số thập phân
         const lon = Math.round(coord[0] * 1e6) / 1e6;
         return `${lat} ${lon}`;
      })
      .join(" ");
}

/**
 * Tạo truy vấn Overpass từ geometry
 * @param {Object} geometry - GeoJSON geometry
 * @returns {string|null} Truy vấn Overpass hoặc null nếu không hợp lệ
 */
export function buildOverpassQLFromGeometry(geometry) {
   if (!geometry) return null;

   const rings = extractOuterRings(geometry);
   if (!rings.length) return null;

   // Tạo truy vấn cho mỗi vòng polygon
   const polygonQueries = rings.map(ring => {
      const coords = ringToOverpassPoly(ring);
      return `way["building"](poly:"${coords}");`;
   }).join("\n    ");

   return `[out:json][timeout:25];
(
    ${polygonQueries}
);
out body;`.trim();
}

/**
 * Gọi API Overpass để đếm số tòa nhà
 * @param {string} ql - Truy vấn Overpass
 * @param {AbortSignal} signal - Signal để hủy request
 * @returns {Promise} Promise chứa kết quả đếm
 */
export async function fetchOverpassCounts(ql, signal) {
   const endpoints = [
      "https://overpass-api.de/api/interpreter",
      "https://overpass.kumi.systems/api/interpreter",
      "https://maps.mail.ru/osm/tools/overpass/api/interpreter"
   ];

   let lastError;
   for (const endpoint of endpoints) {
      try {
         console.log("Sending query to Overpass:", ql);

         const response = await fetch(endpoint, {
            method: "POST",
            body: ql,
            signal,
            headers: {
               "Content-Type": "text/plain",
            },
         });

         if (!response.ok) {
            const errorText = await response.text();
            console.error(`Overpass API error (${endpoint}):`, errorText);
            throw new Error(`Lỗi từ Overpass API: ${response.status} - ${errorText}`);
         }

         const data = await response.json();

         // Kiểm tra xem có phải lỗi từ Overpass không
         if (data.remark && data.remark.includes("error")) {
            throw new Error(`Lỗi Overpass: ${data.remark}`);
         }

         // Đếm số tòa nhà
         const total = data.elements.length;

         return {
            counts: [total],
            total,
         };
      } catch (error) {
         lastError = error;
         console.warn(`Lỗi khi gọi ${endpoint}:`, error);

         // Nếu là lỗi CORS, thử endpoint khác
         if (error.name === "TypeError" && error.message.includes("CORS")) {
            continue;
         }

         // Nếu là lỗi từ API, throw luôn không cần thử endpoint khác
         if (error.message.includes("Overpass API")) {
            throw error;
         }

         continue;
      }
   }

   throw lastError || new Error("Không thể kết nối với Overpass API");
}
