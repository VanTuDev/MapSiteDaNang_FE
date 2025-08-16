import { useState } from 'react';
import FiltersPanel from './FiltersPanel';
import BuildingsCounter from './BuildingsCounter';

export default function ControlModals({
  cities,
  selectedCity,
  setSelectedCity,
  allCategories,
  selectedCategories,
  allProductTypes,
  selectedProductTypes,
  handlers,
  totalCategoryInCity,
  categoryCounts,
  activeShapes,
}) {
  const [showFilters, setShowFilters] = useState(false);
  const [showBuildingsCounter, setShowBuildingsCounter] = useState(false);

  return (
    <div className="fixed bottom-4 right-4 z-[9999] flex flex-col gap-2">
      {/* Control Buttons */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="rounded-lg bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-lg hover:bg-gray-50"
        >
          {showFilters ? 'Ẩn bộ lọc' : 'Hiện bộ lọc'}
        </button>
        <button
          onClick={() => setShowBuildingsCounter(!showBuildingsCounter)}
          className="rounded-lg bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-lg hover:bg-gray-50"
        >
          {showBuildingsCounter ? 'Ẩn đếm tòa nhà' : 'Hiện đếm tòa nhà'}
        </button>
      </div>

      {/* Modals */}
      {showFilters && (
        <div className="fixed bottom-16 right-4 max-h-[85vh] w-[95vw] max-w-2xl overflow-y-auto rounded-xl bg-white p-6 shadow-2xl md:bottom-auto md:right-16 md:top-4">
          <div className="mb-4 flex items-center justify-between">
            <div>
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
            <button
              onClick={() => setShowFilters(false)}
              className="rounded-full p-2 text-gray-500 hover:bg-gray-100"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
          <FiltersPanel
            cities={cities}
            selectedCity={selectedCity}
            setSelectedCity={setSelectedCity}
            allCategories={allCategories}
            selectedCategories={selectedCategories}
            allProductTypes={allProductTypes}
            selectedProductTypes={selectedProductTypes}
            handlers={handlers}
            totalCategoryInCity={totalCategoryInCity}
            categoryCounts={categoryCounts}
          />
        </div>
      )}

      {showBuildingsCounter && (
        <div className="fixed bottom-16 right-4 w-full max-w-md rounded-lg bg-white p-4 shadow-lg md:bottom-auto md:right-16 md:top-4">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-lg font-medium">Đếm tòa nhà</h3>
            <button
              onClick={() => setShowBuildingsCounter(false)}
              className="rounded-full p-2 text-gray-500 hover:bg-gray-100"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
          <BuildingsCounter activeShapes={activeShapes} />
        </div>
      )}
    </div>
  );
}
