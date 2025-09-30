import React from 'react';

export default function Navbar({ 
  onClearShapes, 
  hasActiveShapes, 
  insideCount,
  drawnItemsRef,
  activeTab,
  setActiveModal
}) {
  const handleTabClick = (tab) => {
    if (activeTab === tab) {
      setActiveModal(null);
    } else {
      setActiveModal(tab);
    }
  };

  return (
    <div className="bg-white shadow-lg">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-2">
        <div className="flex items-center gap-4">
          {/* Kết quả tìm kiếm */}
          <button
            onClick={() => handleTabClick('search')}
            className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
              activeTab === 'search' 
                ? 'bg-blue-50 text-blue-600' 
                : 'text-gray-700 hover:bg-gray-50'
            }`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
            </svg>
            Kết quả tìm kiếm
            <span className="rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-600">
              {insideCount}
            </span>
          </button>

          {/* Đếm tòa nhà */}
          <button
            onClick={() => handleTabClick('buildings')}
            className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
              activeTab === 'buildings' 
                ? 'bg-green-50 text-green-600' 
                : 'text-gray-700 hover:bg-gray-50'
            }`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M4 4a2 2 0 012-2h8a2 2 0 012 2v12a1 1 0 110 2h-3a1 1 0 01-1-1v-2a1 1 0 00-1-1H9a1 1 0 00-1 1v2a1 1 0 01-1 1H4a1 1 0 110-2V4zm3 1h2v2H7V5zm2 4H7v2h2V9zm2-4h2v2h-2V5zm2 4h-2v2h2V9z" clipRule="evenodd" />
            </svg>
            Đếm tòa nhà
          </button>

          {/* Bộ lọc */}
          <button
            onClick={() => handleTabClick('filters')}
            className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
              activeTab === 'filters' 
                ? 'bg-purple-50 text-purple-600' 
                : 'text-gray-700 hover:bg-gray-50'
            }`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M3 3a1 1 0 011-1h12a1 1 0 011 1v3a1 1 0 01-.293.707L12 11.414V15a1 1 0 01-.293.707l-2 2A1 1 0 018 17v-5.586L3.293 6.707A1 1 0 013 6V3z" clipRule="evenodd" />
            </svg>
            Bộ lọc
          </button>
        </div>

        {/* Xóa vùng vẽ */}
        <button
          onClick={() => {
            if (drawnItemsRef.current) {
              drawnItemsRef.current.clearLayers();
              onClearShapes();
            }
          }}
          className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
            hasActiveShapes 
              ? 'bg-red-50 text-red-600 hover:bg-red-100' 
              : 'cursor-not-allowed bg-gray-50 text-gray-400'
          }`}
          disabled={!hasActiveShapes}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          Xóa vùng vẽ
        </button>
      </div>

      {/* Tab indicator */}
      <div className="h-1 w-full bg-gray-100">
        <div
          className={`h-full transition-all duration-300 ${
            activeTab === 'search' 
              ? 'w-1/4 bg-blue-500' 
              : activeTab === 'density'
              ? 'ml-1/4 w-1/4 bg-green-500'
              : activeTab === 'filters'
              ? 'ml-2/4 w-1/4 bg-purple-500'
              : 'w-0'
          }`}
        />
      </div>
    </div>
  );
}