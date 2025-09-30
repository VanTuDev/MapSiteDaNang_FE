import { useEffect, useMemo, useRef, useState } from "react";
import MapView from "../components/MapView";
import StatsCards from "../components/StatsCards";
import ScrollableTable from "../components/ScrollableTable";
import BuildingsCounter from "../components/BuildingsCounter";
import FiltersPanel from "../components/FiltersPanel";
import DensityAnalysis from "../components/DensityAnalysis";
import Navbar from "../components/Navbar";
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

  const [activeModal, setActiveModal] = useState(null);
  const [buildingCount, setBuildingCount] = useState(null);

  const [selectedCategories, setSelectedCategories] = useState(() => {
    const saved = loadFromStorage();
    return new Set(saved?.selectedCategories || []);
  });

  const [selectedProductTypes, setSelectedProductTypes] = useState(() => {
    const saved = loadFromStorage();
    return new Set(saved?.selectedProductTypes || []);
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
        <StatsCards
          totalVisible={visiblePOIs.length}
          insideCount={insideIds.size}
        />





        {/* Navbar */}
        <div className="fixed bottom-0 left-0 right-0 z-[9999]">
          {/* Modals */}
          <div className={`fixed inset-x-0 bottom-16 z-[9998] transition-all duration-300 ${activeModal ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
            <div className="mx-auto max-w-7xl px-4">
              <div className="rounded-xl bg-white p-6 shadow-2xl max-h-[calc(100vh-200px)] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-100">
                {activeModal === 'search' && (
                  <div>
                    <div className="mb-6 flex items-center justify-between">
                      <h3 className="text-lg font-medium">Kết quả tìm kiếm ({insideIds.size})</h3>
                      <button
                        onClick={() => setActiveModal(null)}
                        className="rounded-full p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-500"
                      >
                        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                    <div className="max-h-[60vh] overflow-y-auto">
                      <ScrollableTable data={insidePOIs} />
                    </div>
                  </div>
                )}

                {activeModal === 'buildings' && (
                  <div>
                    <div className="mb-6 flex items-center justify-between">
                      <h3 className="text-lg font-medium">Đếm tòa nhà</h3>
                      <button
                        onClick={() => setActiveModal(null)}
                        className="rounded-full p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-500"
                      >
                        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                    <div className="space-y-6">
                      <BuildingsCounter
                        activeShapes={activeShapes}
                        onCountChange={setBuildingCount}
                      />
                      {activeShapes.length > 0 && (
                        <>
                          <div className="border-t border-gray-200"></div>
                          <DensityAnalysis
                            activeShapes={activeShapes}
                            buildingCount={buildingCount}
                          />
                        </>
                      )}
                    </div>
                  </div>
                )}

                {activeModal === 'filters' && (
                  <div>
                    <div className="mb-6 flex items-center justify-between">
                      <h3 className="text-lg font-medium">Bộ lọc</h3>
                      <button
                        onClick={() => setActiveModal(null)}
                        className="rounded-full p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-500"
                      >
                        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                    <div className="mb-4">
                      <label className="text-sm font-medium text-gray-700">Thành phố</label>
                      <select
                        className="mt-1 w-full rounded-lg border px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
                        value={selectedCity}
                        onChange={(e) => setSelectedCity(e.target.value)}
                      >
                        {cities.map((c) => (
                          <option key={c} value={c}>{c}</option>
                        ))}
                      </select>
                    </div>
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
                )}
              </div>
            </div>
          </div>

          {/* Navbar */}
          <Navbar
            onClearShapes={() => setActiveShapes([])}
            hasActiveShapes={activeShapes.length > 0}
            insideCount={insideIds.size}
            drawnItemsRef={drawnItemsRef}
            activeTab={activeModal}
            setActiveModal={setActiveModal}
          />
        </div>
      </section>
    </main>
  );
}