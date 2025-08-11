export default function ScrollableTable({ data }) {
  return (
    <div className="overflow-auto max-h-[45vh]">
      <table className="min-w-[900px] w-full text-sm">
        <thead className="bg-gray-50 sticky top-0 z-10">
          <tr className="text-left text-gray-700 border-b">
            <th className="px-4 py-3 font-medium">#</th>
            <th className="px-4 py-3 font-medium">Tên địa điểm</th>
            <th className="px-4 py-3 font-medium">Loại</th>
            <th className="px-4 py-3 font-medium">Địa chỉ</th>
            <th className="px-4 py-3 font-medium">Thành phố</th>
            <th className="px-4 py-3 font-medium text-right">Tọa độ</th>
            <th className="px-4 py-3 font-medium w-24">Thao tác</th>
          </tr>
        </thead>
        <tbody className="divide-y">
          {data.map((row, idx) => (
            <tr key={row.id || idx} className="hover:bg-gray-50">
              <td className="px-4 py-3 text-gray-500">{idx + 1}</td>
              <td className="px-4 py-3">
                <div className="font-medium text-gray-900">{row.name}</div>
                <div className="text-xs text-gray-500 font-mono">{row.id}</div>
              </td>
              <td className="px-4 py-3">
                <span className="inline-flex items-center rounded-full bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700 capitalize">
                  {row.category}
                </span>
              </td>
              <td className="px-4 py-3">
                <div className="max-w-[280px] truncate" title={row.address}>
                  {row.address}
                </div>
              </td>
              <td className="px-4 py-3">{row.city}</td>
              <td className="px-4 py-3 text-right font-mono text-sm">
                <div>{row.lat.toFixed(6)}</div>
                <div>{row.lng.toFixed(6)}</div>
              </td>
              <td className="px-4 py-3">
                <button 
                  className="rounded-lg border border-gray-200 px-3 py-1 text-xs font-medium text-gray-600 hover:bg-gray-50"
                  onClick={() => {
                    const url = `https://www.google.com/maps?q=${row.lat},${row.lng}`;
                    window.open(url, '_blank');
                  }}
                >
                  Xem bản đồ
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
