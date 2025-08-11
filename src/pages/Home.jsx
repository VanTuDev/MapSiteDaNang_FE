import { useEffect, useMemo, useRef, useState } from "react";
import MapView from "../components/MapView";
import FiltersPanel from "../components/FiltersPanel";
import StatsCards from "../components/StatsCards";
import BuildingsCounter from "../components/BuildingsCounter";
import ScrollableTable from "../components/ScrollableTable";
import DaNangJSON from "../data/DaNangData.json";
import { adaptDaNang, collectCategories, collectProductTypes } from "../lib/poi-adapter";
import { makeUnionGeometryFromShapes, pointsInGeometry, toBounds } from "../lib/geo-utils";

// Khởi tạo dữ liệu
const POIS = adaptDaNang(DaNangJSON);
const ALL_CATEGORIES = collectCategories(POIS);
const ALL_PRODUCT_TYPES = collectProductTypes(POIS);

// Lưu trữ local storage
const STORAGE_KEY = "mapfnb_filters";
function loadFromStorage() {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (!data) return null;
    return JSON.parse(data);
  } catch (error) {
    console.warn("Lỗi khi đọc từ localStorage:", error);
    return null;
  }
}

function saveToStorage(data) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (error) {
    console.warn("Lỗi khi lưu vào localStorage:", error);
  }
}

export default function Home() {
  // Refs
  const drawnItemsRef = useRef(null);

  // State
  const cities = useMemo(() => ["Toàn quốc", ...Array.from(new Set(POIS.map((p) => p.city)))], []);
  const [selectedCity, setSelectedCity] = useState(() => {
    const saved = loadFromStorage();
    return saved?.selectedCity || "Toàn quốc";
  });
  
  const [selectedCategories, setSelectedCategories] = useState(() => {
    const saved = loadFromStorage();
    return new Set(saved?.selectedCategories || ALL_CATEGORIES);
  });
  
  const [selectedProductTypes, setSelectedProductTypes] = useState(() => {
    const saved = loadFromStorage();
    return new Set(saved?.selectedProductTypes || ALL_PRODUCT_TYPES);
  });
  
  const [activeShapes, setActiveShapes] = useState([]);

  // Lưu filters vào localStorage
  useEffect(() => {
    saveToStorage({
      selectedCity,
      selectedCategories: Array.from(selectedCategories),
      selectedProductTypes: Array.from(selectedProductTypes),
    });
  }, [selectedCity, selectedCategories, selectedProductTypes]);

  // Derived state
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

  const { insideIds, categoryCounts } = useMemo(() => {
    const geometry = makeUnionGeometryFromShapes(activeShapes);
    return pointsInGeometry(visiblePOIs, geometry);
  }, [visiblePOIs, activeShapes]);

  const insidePOIs = useMemo(
    () => visiblePOIs.filter((p) => insideIds.has(p.id)),
    [visiblePOIs, insideIds]
  );

  const totalCategoryInCity = useMemo(() => {
    const totals = {};
    for (const c of ALL_CATEGORIES) totals[c] = 0;
    for (const p of baseByCity) totals[p.category] = (totals[p.category] ?? 0) + 1;
    return totals;
  }, [baseByCity]);

  // Handlers
  const handlers = {
    toggleCategory: (cat) => {
      setSelectedCategories((prev) => {
        const next = new Set(prev);
        next.has(cat) ? next.delete(cat) : next.add(cat);
        return next;
      });
    },
    selectAllCategories: () => setSelectedCategories(new Set(ALL_CATEGORIES)),
    clearAllCategories: () => setSelectedCategories(new Set()),
    
    toggleProductType: (type) => {
      setSelectedProductTypes((prev) => {
        const next = new Set(prev);
        next.has(type) ? next.delete(type) : next.add(type);
        return next;
      });
    },
    selectAllProductTypes: () => setSelectedProductTypes(new Set(ALL_PRODUCT_TYPES)),
    clearAllProductTypes: () => setSelectedProductTypes(new Set()),
  };

  return (
    <main className="relative min-h-screen">
      <MapView
        pois={POIS}
        activeShapes={activeShapes}
        onShapesChange={setActiveShapes}
        currentBounds={currentBounds}
        visiblePOIs={visiblePOIs}
        insideIds={insideIds}
        drawnItemsRef={drawnItemsRef}
      />

      <section className="mx-auto max-w-6xl p-4">
        <div className="mb-4 grid grid-cols-1 gap-3 md:grid-cols-3">
          {/* City Select */}
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

          {/* Filters */}
          <FiltersPanel
            cities={cities}
            selectedCity={selectedCity}
            setSelectedCity={setSelectedCity}
            allCategories={ALL_CATEGORIES}
            selectedCategories={selectedCategories}
            allProductTypes={ALL_PRODUCT_TYPES}
            selectedProductTypes={selectedProductTypes}
            handlers={handlers}
            totalCategoryInCity={totalCategoryInCity}
            categoryCounts={categoryCounts}
          />
        </div>

        <StatsCards
          totalVisible={visiblePOIs.length}
          insideCount={insideIds.size}
        />

        <BuildingsCounter activeShapes={activeShapes} />

        {/* Results Table */}
        <div className="mt-6">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h3 className="text-lg font-medium text-gray-900">Kết quả tìm kiếm</h3>
              <p className="mt-1 text-sm text-gray-500">
                Hiển thị {insidePOIs.length} địa điểm trong vùng đã chọn
              </p>
            </div>
            <button
              onClick={() => {
                if (drawnItemsRef.current) {
                  drawnItemsRef.current.clearLayers();
                  setActiveShapes([]);
                }
              }}
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