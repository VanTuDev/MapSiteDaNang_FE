import { useState } from 'react';
import ScrollableTable from './ScrollableTable';

export default function SearchResultsModal({ data, insideCount }) {
  const [showModal, setShowModal] = useState(false);

  return (
    <div className="fixed bottom-4 left-4 z-[9999]">
      {/* Toggle Button */}
      <button
        onClick={() => setShowModal(!showModal)}
        className="flex items-center gap-2 rounded-lg bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-lg hover:bg-gray-50"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
          <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
          <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd" />
        </svg>
        Kết quả tìm kiếm
        <span className="ml-1 rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-600">
          {insideCount}
        </span>
      </button>

      {/* Modal */}
      {showModal && (
        <div className="fixed bottom-16 left-4 max-h-[85vh] w-[95vw] max-w-4xl overflow-hidden rounded-xl bg-white shadow-2xl transition-all">
          <div className="flex items-center justify-between border-b p-4">
            <div>
              <h3 className="text-lg font-medium text-gray-900">Kết quả tìm kiếm</h3>
              <p className="mt-1 text-sm text-gray-500">
                Hiển thị {insideCount} địa điểm trong vùng đã chọn
              </p>
            </div>
            <button
              onClick={() => setShowModal(false)}
              className="rounded-full p-2 text-gray-500 hover:bg-gray-100"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
          
          <div className="max-h-[calc(85vh-8rem)] overflow-y-auto p-4">
            <ScrollableTable data={data} />
            
            {data.length === 0 && (
              <div className="rounded-lg bg-yellow-50 p-4">
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
        </div>
      )}
    </div>
  );
}
