import { useEffect, useMemo, useRef, useState } from "react";
import "leaflet/dist/leaflet.css";
import "leaflet-draw/dist/leaflet.draw.css";
import L from "leaflet";
import { MapContainer, Marker, Popup, useMap } from "react-leaflet";

import DrawControl from "../components/DrawControl";
import LayerControl from "../components/LayerControl";
import ScrollableTable from "../components/ScrollableTable";

import DaNangJSON from "../data/DaNangData.json";

import booleanPointInPolygon from "@turf/boolean-point-in-polygon";
import circle from "@turf/circle";
import { point, polygon as turfPolygon } from "@turf/helpers";
import { union } from "@turf/turf";

// ===== Adapter: đổi schema JSON -> POI chung =====
// Xử lý và làm sạch dữ liệu
const RAW = Array.isArray(DaNangJSON?.DaNangData) ? DaNangJSON.DaNangData : [];
// Hàm xử lý productType
function normalizeProductTypes(productType) {
  if (!productType) return ["other"];
  return productType.split(",").map(type => type.trim());
}

const POIS = RAW.reduce((acc, r, i) => {
  try {
    // Kiểm tra dữ liệu bắt buộc
    if (!r.storeName?.trim()) {
      console.warn(`Bỏ qua POI #${i}: Thiếu tên địa điểm`);
      return acc;
    }
    
    // Parse tọa độ
    const lat = Number(r.latitude);
    const lng = Number(r.longitude);
    if (isNaN(lat) || isNaN(lng) || !isFinite(lat) || !isFinite(lng)) {
      console.warn(`Bỏ qua POI #${i}: Tọa độ không hợp lệ`, { lat, lng });
      return acc;
    }
    
    // Kiểm tra phạm vi tọa độ
    if (lat < -90 || lat > 90 || lng < -180 || lng > 180) {
      console.warn(`Bỏ qua POI #${i}: Tọa độ nằm ngoài phạm vi`, { lat, lng });
      return acc;
    }

    // Chuẩn hóa category
    const rawCategory = String(r.category || "other").toLowerCase().trim();
    const category = rawCategory === "" ? "other" : rawCategory;
    
    // Chuẩn hóa productTypes
    const productTypes = normalizeProductTypes(r.productType);
    
    // Tạo POI hợp lệ
    acc.push({
      id: r.storeId?.trim() || `dn-${i}`,
      name: r.storeName.trim(),
      address: r.address?.trim() || "Chưa có địa chỉ",
      category,
      productTypes,
      lat,
      lng,
      city: r.city?.trim() || "Da Nang",
    });
    
    return acc;
  } catch (error) {
    console.error(`Lỗi xử lý POI #${i}:`, error);
    return acc;
  }
}, []);

// Lấy danh sách tất cả các category và productType
const ALL_CATEGORIES = Array.from(new Set(POIS.map((p) => p.category))).sort();
const ALL_PRODUCT_TYPES = Array.from(
  new Set(POIS.flatMap((p) => p.productTypes))
).sort();

// Metadata cho các loại địa điểm và sản phẩm
const PRODUCT_TYPE_METADATA = {
  "Coffee - Tea - Juice": {
    icon: "☕",
    label: "Cà phê - Trà - Nước ép",
    color: "#a855f7"
  },
  "Milk Tea": {
    icon: "🧋",
    label: "Trà sữa",
    color: "#f59e0b"
  },
  "Noodles & Congee": {
    icon: "🍜",
    label: "Mì & Cháo",
    color: "#ef4444"
  },
  "Healthy - Salad": {
    icon: "🥗",
    label: "Đồ ăn healthy - Salad",
    color: "#22c55e"
  },
  "Hotpot & Grill": {
    icon: "🍲",
    label: "Lẩu & Nướng",
    color: "#dc2626"
  },
  "Bread": {
    icon: "🥖",
    label: "Bánh mì",
    color: "#d97706"
  },
  "Rice": {
    icon: "🍚",
    label: "Cơm",
    color: "#eab308"
  },
  "other": {
    icon: "🍽️",
    label: "Khác",
    color: "#6b7280"
  }
};

const CATEGORY_METADATA = {
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

const CATEGORY_COLORS = new Proxy(
  Object.fromEntries(Object.entries(CATEGORY_METADATA).map(([k, v]) => [k, v.color])),
  {
    get: (obj, prop) => obj[prop] || "#6b7280",
  }
);

// ===== Helpers =====
function makeCategoryIcon(category, isInside) {
  const meta = CATEGORY_METADATA[category] || CATEGORY_METADATA.other;
  const color = meta.color;
  const borderColor = isInside ? "#16a34a" : "#4b5563";
  
  return L.divIcon({
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
}

function computeStats(pois, shapes) {
  const insideIds = new Set();
  const categoryCounts = {};
  if (!shapes.length) return { insideIds, categoryCounts };

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

  // Xử lý trường hợp chỉ có 1 hình vẽ
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
  const geom = combined?.geometry;
  if (!geom) return { insideIds, categoryCounts };

  for (const poi of pois) {
    const pt = point([poi.lng, poi.lat]);
    if (booleanPointInPolygon(pt, geom)) {
      insideIds.add(poi.id);
      categoryCounts[poi.category] = (categoryCounts[poi.category] ?? 0) + 1;
    }
  }
  return { insideIds, categoryCounts };
}

function toBounds(pois) {
  if (!pois.length) return null;
  return L.latLngBounds(pois.map((p) => L.latLng(p.lat, p.lng)));
}

function ViewFitBounds({ bounds, depsKey }) {
  const map = useMap();
  useEffect(() => {
    if (bounds) map.fitBounds(bounds, { padding: [24, 24], maxZoom: 15 });
  }, [bounds, depsKey, map]);
  return null;
}

// ===== Page =====
export default function Home() {
  const cities = useMemo(() => ["Toàn quốc", ...Array.from(new Set(POIS.map((p) => p.city)))], []);
  const [selectedCity, setSelectedCity] = useState("Toàn quốc");
  const [selectedCategories, setSelectedCategories] = useState(new Set(ALL_CATEGORIES));
  const [selectedProductTypes, setSelectedProductTypes] = useState(new Set(ALL_PRODUCT_TYPES));
  const [activeShapes, setActiveShapes] = useState([]);
  const drawnItemsRef = useRef(null);

  const baseByCity = useMemo(
    () => (selectedCity === "Toàn quốc" ? POIS : POIS.filter((p) => p.city === selectedCity)),
    [selectedCity]
  );
  const visiblePOIs = useMemo(
    () => baseByCity.filter((p) => 
      selectedCategories.has(p.category) && 
      p.productTypes.some(type => selectedProductTypes.has(type))
    ),
    [baseByCity, selectedCategories, selectedProductTypes]
  );
  const currentBounds = useMemo(() => toBounds(baseByCity), [baseByCity]);

  const { insideIds, categoryCounts } = useMemo(
    () => computeStats(visiblePOIs, activeShapes),
    [visiblePOIs, activeShapes]
  );

  const totalCategoryInCity = useMemo(() => {
    const totals = {};
    for (const c of ALL_CATEGORIES) totals[c] = 0;
    for (const p of baseByCity) totals[p.category] = (totals[p.category] ?? 0) + 1;
    return totals;
  }, [baseByCity]);

  const insidePOIs = useMemo(() => visiblePOIs.filter((p) => insideIds.has(p.id)), [visiblePOIs, insideIds]);

  const mapInitCenter = useMemo(() => {
    const b = toBounds(POIS);
    if (b) {
      const c = b.getCenter();
      return [c.lat, c.lng];
    }
    return [16.047, 108.206]; // Đà Nẵng fallback
  }, []);

  function toggleCategory(cat) {
    setSelectedCategories((prev) => {
      const next = new Set(prev);
      next.has(cat) ? next.delete(cat) : next.add(cat);
      return next;
    });
  }
  function selectAllCategories() { setSelectedCategories(new Set(ALL_CATEGORIES)); }
  function clearAllCategories() { setSelectedCategories(new Set()); }
  
  function toggleProductType(type) {
    setSelectedProductTypes((prev) => {
      const next = new Set(prev);
      next.has(type) ? next.delete(type) : next.add(type);
      return next;
    });
  }
  
  function selectAllProductTypes() { setSelectedProductTypes(new Set(ALL_PRODUCT_TYPES)); }
  function clearAllProductTypes() { setSelectedProductTypes(new Set()); }

  function clearAllDrawnShapes() {
    if (drawnItemsRef.current) {
      drawnItemsRef.current.clearLayers();
      setActiveShapes([]);
    }
  }

  const basemaps = useMemo(
    () => [
      {
        name: "OpenStreetMap",
        url: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
        attribution: "&copy; OpenStreetMap contributors",
      },
      {
        name: "Google Satellite",
        url: "https://{s}.google.com/vt/lyrs=s&x={x}&y={y}&z={z}",
        attribution: "Google",
        subdomains: ["mt0", "mt1", "mt2", "mt3"],
      },
    ],
    []
  );

  return (
    <main className="relative min-h-screen">
      {/* MAP */}
      <div className="h-[70vh] w-full">
        <MapContainer center={mapInitCenter} zoom={12} style={{ height: "100%", width: "100%" }} zoomControl>
          <ViewFitBounds bounds={currentBounds} depsKey={selectedCity} />
          <LayerControl basemaps={basemaps} drawnItemsRef={drawnItemsRef} />
          <DrawControl onShapesChange={setActiveShapes} drawnItemsRef={drawnItemsRef} />

          {visiblePOIs.map((p) => {
            const inside = insideIds.has(p.id);
            const icon = makeCategoryIcon(p.category, inside);
            return (
              <Marker key={p.id} position={[p.lat, p.lng]} icon={icon}>
                <Popup>
                  <div className="space-y-1">
                    <div className="font-semibold">{p.name}</div>
                    <div className="text-sm text-gray-500">{p.address}</div>
                    <div className="text-xs">
                      <span className="rounded bg-gray-100 px-1.5 py-0.5 text-gray-700">{p.category}</span>
                      <span className="ml-2 text-gray-500">{p.city}</span>
                    </div>
                  </div>
                </Popup>
              </Marker>
            );
          })}
        </MapContainer>
      </div>

      {/* PANEL */}
      <section className="mx-auto max-w-6xl p-4">
        <div className="mb-4 grid grid-cols-1 gap-3 md:grid-cols-3">
          <div className="rounded border p-3 shadow-sm">
            <label className="text-xs font-medium text-gray-500">Thành phố</label>
            <select
              className="mt-1 w-full rounded border px-2 py-1.5 text-sm focus:border-blue-500 focus:outline-none"
              value={selectedCity}
              onChange={(e) => setSelectedCity(e.target.value)}
            >
              {cities.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          <div className="rounded border p-3 shadow-sm md:col-span-2">
            <div className="mb-2 flex items-center justify-between">
              <span className="text-sm font-medium">Bộ lọc</span>
              <div className="flex gap-2">
                <button 
                  className="rounded bg-blue-50 px-2 py-0.5 text-xs text-blue-600 hover:bg-blue-100" 
                  onClick={() => { selectAllCategories(); selectAllProductTypes(); }}
                >
                  Chọn tất cả
                </button>
                <button 
                  className="rounded bg-gray-50 px-2 py-0.5 text-xs text-gray-600 hover:bg-gray-100" 
                  onClick={() => { clearAllCategories(); clearAllProductTypes(); }}
                >
                  Bỏ chọn tất cả
                </button>
              </div>
            </div>

            {/* Category Filter */}
            <div className="mb-4">
              <div className="mb-2 flex items-center justify-between">
                <span className="text-sm font-medium">Loại địa điểm</span>
                <div className="flex gap-2">
                  <button 
                    className="rounded bg-blue-50 px-2 py-0.5 text-xs text-blue-600 hover:bg-blue-100" 
                    onClick={selectAllCategories}
                  >
                    Chọn tất cả
                  </button>
                  <button 
                    className="rounded bg-gray-50 px-2 py-0.5 text-xs text-gray-600 hover:bg-gray-100" 
                    onClick={clearAllCategories}
                  >
                    Bỏ chọn
                  </button>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
                {ALL_CATEGORIES.map((c) => {
                  const checked = selectedCategories.has(c);
                  const meta = CATEGORY_METADATA[c] || CATEGORY_METADATA.other;
                  const count = totalCategoryInCity[c] || 0;
                  const countInside = categoryCounts[c] || 0;
                  
                  return (
                    <label 
                      key={c} 
                      className={`flex cursor-pointer items-start gap-3 rounded-lg border p-3 transition-colors ${
                        checked 
                          ? 'bg-blue-50 border-blue-200 hover:bg-blue-100' 
                          : 'hover:bg-gray-50'
                      }`}
                    >
                      <input 
                        type="checkbox" 
                        className="mt-1 h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500" 
                        checked={checked} 
                        onChange={() => toggleCategory(c)} 
                      />
                      <div className="flex-1">
                        <div className="flex items-center gap-1.5">
                          <span className="text-xl" role="img" aria-label={c}>
                            {meta.icon}
                          </span>
                          <span className="text-sm font-medium capitalize">
                            {meta.label || c}
                          </span>
                        </div>
                        <div className="mt-1 text-xs text-gray-500">
                          <span className="font-medium">{count}</span> địa điểm
                          {countInside > 0 && (
                            <span className="ml-1 text-green-600">
                              ({countInside} trong vùng)
                            </span>
                          )}
                        </div>
                      </div>
                    </label>
                  );
                })}
              </div>
            </div>

            {/* Product Type Filter */}
            <div>
              <div className="mb-2 flex items-center justify-between">
                <span className="text-sm font-medium">Loại món</span>
                <div className="flex gap-2">
                  <button 
                    className="rounded bg-blue-50 px-2 py-0.5 text-xs text-blue-600 hover:bg-blue-100" 
                    onClick={selectAllProductTypes}
                  >
                    Chọn tất cả
                  </button>
                  <button 
                    className="rounded bg-gray-50 px-2 py-0.5 text-xs text-gray-600 hover:bg-gray-100" 
                    onClick={clearAllProductTypes}
                  >
                    Bỏ chọn
                  </button>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
                {ALL_PRODUCT_TYPES.map((type) => {
                  const checked = selectedProductTypes.has(type);
                  const meta = PRODUCT_TYPE_METADATA[type] || PRODUCT_TYPE_METADATA.other;
                  const count = POIS.filter(p => p.productTypes.includes(type)).length;
                  const countInside = POIS.filter(p => 
                    p.productTypes.includes(type) && insideIds.has(p.id)
                  ).length;
                  
                  return (
                    <label 
                      key={type} 
                      className={`flex cursor-pointer items-start gap-3 rounded-lg border p-3 transition-colors ${
                        checked 
                          ? 'bg-blue-50 border-blue-200 hover:bg-blue-100' 
                          : 'hover:bg-gray-50'
                      }`}
                    >
                      <input 
                        type="checkbox" 
                        className="mt-1 h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500" 
                        checked={checked} 
                        onChange={() => toggleProductType(type)} 
                      />
                      <div className="flex-1">
                        <div className="flex items-center gap-1.5">
                          <span className="text-xl" role="img" aria-label={type}>
                            {meta.icon}
                          </span>
                          <span className="text-sm font-medium">
                            {meta.label || type}
                          </span>
                        </div>
                        <div className="mt-1 text-xs text-gray-500">
                          <span className="font-medium">{count}</span> địa điểm
                          {countInside > 0 && (
                            <span className="ml-1 text-green-600">
                              ({countInside} trong vùng)
                            </span>
                          )}
                        </div>
                      </div>
                    </label>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-lg border p-4 shadow-sm">
            <div className="flex items-center gap-2">
              <div className="rounded-full bg-blue-100 p-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-600" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                </svg>
              </div>
              <div>
                <div className="text-xs font-medium text-gray-500">Tổng số địa điểm</div>
                <div className="text-2xl font-bold text-gray-900">{visiblePOIs.length}</div>
              </div>
            </div>
          </div>
          <div className="rounded-lg border p-4 shadow-sm">
            <div className="flex items-center gap-2">
              <div className="rounded-full bg-green-100 p-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-600" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
                  <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd" />
                </svg>
              </div>
              <div>
                <div className="text-xs font-medium text-gray-500">Trong vùng đã chọn</div>
                <div className="text-2xl font-bold text-gray-900">{insideIds.size}</div>
              </div>
            </div>
          </div>
        </div>

        {/* BẢNG KẾT QUẢ */}
        <div className="mt-6">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h3 className="text-lg font-medium text-gray-900">Kết quả tìm kiếm</h3>
              <p className="mt-1 text-sm text-gray-500">
                Hiển thị {insidePOIs.length} địa điểm trong vùng đã chọn
              </p>
            </div>
            <button
              onClick={clearAllDrawnShapes}
              className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium ${
                activeShapes.length 
                  ? 'bg-red-50 text-red-600 hover:bg-red-100' 
                  : 'bg-gray-50 text-gray-400 cursor-not-allowed'
              }`}
              disabled={!activeShapes.length}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              Xóa tất cả vùng vẽ
            </button>
          </div>
          
          <div className="rounded-lg border shadow-sm">
            <ScrollableTable data={insidePOIs} />
          </div>
          
          {insidePOIs.length === 0 && activeShapes.length > 0 && (
            <div className="mt-4 rounded-lg bg-yellow-50 p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-yellow-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-yellow-800">Không tìm thấy kết quả</h3>
                  <div className="mt-2 text-sm text-yellow-700">
                    Không có địa điểm nào trong vùng bạn đã chọn. Hãy thử:
                    <ul className="mt-1 list-disc pl-5">
                      <li>Mở rộng vùng tìm kiếm</li>
                      <li>Chọn thêm các loại địa điểm khác</li>
                      <li>Kiểm tra lại bộ lọc thành phố</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
