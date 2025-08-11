import { useState, useCallback } from "react";
import { buildOverpassQLFromGeometry, fetchOverpassCounts } from "../lib/overpass";
import { makeUnionGeometryFromShapes } from "../lib/geo-utils";

export default function BuildingsCounter({ activeShapes }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [count, setCount] = useState(null); 

  const handleCount = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const geometry = makeUnionGeometryFromShapes(activeShapes);
      if (!geometry) {
        throw new Error("Vui lòng vẽ vùng trước khi đếm tòa nhà");
      }

      const ql = buildOverpassQLFromGeometry(geometry);
      if (!ql) {
        throw new Error("Không thể tạo truy vấn Overpass");
      }

      const controller = new AbortController();
      const { total } = await fetchOverpassCounts(ql, controller.signal);
      setCount(total);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [activeShapes]);

  return (
    <div className="mt-6 rounded-lg border p-4 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-medium text-gray-900">Đếm tòa nhà (OSM)</h3>
          {count !== null && !error && (
            <p className="mt-1 text-sm text-gray-500">
              Tìm thấy <span className="font-medium text-gray-900">{count}</span> tòa nhà trong vùng
            </p>
          )}
          {error && (
            <p className="mt-1 text-sm text-red-600">{error}</p>
          )}
        </div>
        <button
          onClick={handleCount}
          disabled={loading || !activeShapes.length}
          className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium ${
            loading
              ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
              : !activeShapes.length
              ? 'bg-gray-50 text-gray-400 cursor-not-allowed'
              : 'bg-blue-50 text-blue-600 hover:bg-blue-100'
          }`}
        >
          {loading ? (
            <>
              <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
              <span>Đang đếm...</span>
            </>
          ) : (
            <>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
              </svg>
              <span>Đếm tòa nhà</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}
