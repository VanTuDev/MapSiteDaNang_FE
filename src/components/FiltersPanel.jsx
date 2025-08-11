import { 
  CATEGORY_METADATA, 
  FOOD_TYPE_METADATA, 
  SHOP_TYPE_METADATA,
  FOOD_GROUPS,
  getTypeMetadata,
  getAllTypesByCategory 
} from "../lib/categories";

export default function FiltersPanel({
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
}) {
  return (
    <div className="rounded border p-3 shadow-sm md:col-span-2">
      <div className="mb-2 flex items-center justify-between">
        <span className="text-sm font-medium">Bộ lọc</span>
        <div className="flex gap-2">
          <button 
            className="rounded bg-blue-50 px-2 py-0.5 text-xs text-blue-600 hover:bg-blue-100" 
            onClick={() => { handlers.selectAllCategories(); handlers.selectAllProductTypes(); }}
          >
            Chọn tất cả
          </button>
          <button 
            className="rounded bg-gray-50 px-2 py-0.5 text-xs text-gray-600 hover:bg-gray-100" 
            onClick={() => { handlers.clearAllCategories(); handlers.clearAllProductTypes(); }}
          >
            Bỏ chọn tất cả
          </button>
        </div>
      </div>

      {/* Category Filter */}
      <div className="mb-4">
                    {/* Category Filter */}
            <div className="mb-4">
              <div className="mb-2 flex items-center justify-between">
                <span className="text-sm font-medium">Loại địa điểm</span>
                <div className="flex gap-2">
                  <button 
                    className="rounded bg-blue-50 px-2 py-0.5 text-xs text-blue-600 hover:bg-blue-100" 
                    onClick={handlers.selectAllCategories}
                  >
                    Chọn tất cả
                  </button>
                  <button 
                    className="rounded bg-gray-50 px-2 py-0.5 text-xs text-gray-600 hover:bg-gray-100" 
                    onClick={handlers.clearAllCategories}
                  >
                    Bỏ chọn
                  </button>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-3">
                {allCategories.map((c) => {
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
                      style={{ borderLeft: `4px solid ${meta.color}` }}
                    >
                      <input 
                        type="checkbox" 
                        className="mt-1 h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500" 
                        checked={checked} 
                        onChange={() => handlers.toggleCategory(c)} 
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

            {/* Food Types Filter */}
            {selectedCategories.has('food') && (
              <div className="mb-4">
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-sm font-medium">Loại món ăn</span>
                  <div className="flex gap-2">
                    <button 
                      className="rounded bg-blue-50 px-2 py-0.5 text-xs text-blue-600 hover:bg-blue-100" 
                      onClick={handlers.selectAllProductTypes}
                    >
                      Chọn tất cả
                    </button>
                    <button 
                      className="rounded bg-gray-50 px-2 py-0.5 text-xs text-gray-600 hover:bg-gray-100" 
                      onClick={handlers.clearAllProductTypes}
                    >
                      Bỏ chọn
                    </button>
                  </div>
                </div>

                {/* Hiển thị theo nhóm */}
                {Object.entries(FOOD_GROUPS).map(([groupKey, group]) => {
                  const groupTypes = Object.entries(FOOD_TYPE_METADATA)
                    .filter(([_, meta]) => meta.group === groupKey)
                    .map(([type]) => type);

                  if (!groupTypes.length) return null;

                  return (
                    <div key={groupKey} className="mb-4">
                      <div className="mb-2 flex items-center gap-2">
                        <span className="text-lg" role="img">{group.icon}</span>
                        <span className="text-sm font-medium">{group.label}</span>
                      </div>
                      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4">
                        {groupTypes.map((type) => {
                          const checked = selectedProductTypes.has(type);
                          const meta = FOOD_TYPE_METADATA[type];

                          return (
                            <label 
                              key={type} 
                              className={`flex cursor-pointer items-center gap-2 rounded-lg border p-2 transition-colors ${
                                checked 
                                  ? 'bg-blue-50 border-blue-200 hover:bg-blue-100' 
                                  : 'hover:bg-gray-50'
                              }`}
                              style={{ borderLeft: `4px solid ${meta.color}` }}
                            >
                              <input 
                                type="checkbox" 
                                className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500" 
                                checked={checked} 
                                onChange={() => handlers.toggleProductType(type)} 
                              />
                              <div className="flex items-center gap-1.5">
                                <span className="text-xl" role="img" aria-label={type}>
                                  {meta.icon}
                                </span>
                                <span className="text-sm">
                                  {meta.label}
                                </span>
                              </div>
                            </label>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Shop Types Filter */}
            {selectedCategories.has('shop') && (
              <div className="mb-4">
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-sm font-medium">Loại cửa hàng</span>
                  <div className="flex gap-2">
                    <button 
                      className="rounded bg-blue-50 px-2 py-0.5 text-xs text-blue-600 hover:bg-blue-100" 
                      onClick={handlers.selectAllProductTypes}
                    >
                      Chọn tất cả
                    </button>
                    <button 
                      className="rounded bg-gray-50 px-2 py-0.5 text-xs text-gray-600 hover:bg-gray-100" 
                      onClick={handlers.clearAllProductTypes}
                    >
                      Bỏ chọn
                    </button>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4">
                  {Object.entries(SHOP_TYPE_METADATA).map(([type, meta]) => {
                    const checked = selectedProductTypes.has(type);
                    const count = totalCategoryInCity[type] || 0;
                    const countInside = categoryCounts[type] || 0;

                    return (
                      <label 
                        key={type} 
                        className={`flex cursor-pointer items-start gap-2 rounded-lg border p-2 transition-colors ${
                          checked 
                            ? 'bg-blue-50 border-blue-200 hover:bg-blue-100' 
                            : 'hover:bg-gray-50'
                        }`}
                        style={{ borderLeft: `4px solid ${meta.color}` }}
                      >
                        <input 
                          type="checkbox" 
                          className="mt-1 h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500" 
                          checked={checked} 
                          onChange={() => handlers.toggleProductType(type)} 
                        />
                        <div className="flex-1">
                          <div className="flex items-center gap-1.5">
                            <span className="text-xl" role="img" aria-label={type}>
                              {meta.icon}
                            </span>
                            <span className="text-sm">
                              {meta.label}
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
            )}
      </div>


    </div>
  );
}
