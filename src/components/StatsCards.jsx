export default function StatsCards({ totalVisible, insideCount }) {
  return (
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
            <div className="text-2xl font-bold text-gray-900">{totalVisible}</div>
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
            <div className="text-2xl font-bold text-gray-900">{insideCount}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
