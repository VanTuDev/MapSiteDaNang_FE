import { useState } from 'react';

export default function PopulationDensityModal({ bounds, apiKey }) {
  const [showModal, setShowModal] = useState(false);
  const [densityData, setDensityData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchDensityData = async () => {
    if (!bounds || !apiKey) return;

    setLoading(true);
    setError(null);
    try {
      const prompt = `Cho tôi biết mật độ dân số trong khu vực có tọa độ: 
        Bắc: ${bounds.north}
        Nam: ${bounds.south}
        Đông: ${bounds.east}
        Tây: ${bounds.west}`;

      const response = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: prompt
            }]
          }]
        })
      });

      const data = await response.json();
      setDensityData(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed bottom-4 left-36 z-[9999]">
      {/* Toggle Button */}
      <button
        onClick={() => {
          setShowModal(!showModal);
          if (!densityData && !showModal) {
            fetchDensityData();
          }
        }}
        className="flex items-center gap-2 rounded-lg bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-lg hover:bg-gray-50"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
        </svg>
        Mật độ dân số
      </button>

      {/* Modal */}
      {showModal && (
        <div className="fixed bottom-16 left-4 w-[95vw] max-w-2xl overflow-hidden rounded-xl bg-white shadow-2xl transition-all">
          <div className="flex items-center justify-between border-b p-4">
            <div>
              <h3 className="text-lg font-medium text-gray-900">Mật độ dân số</h3>
              <p className="mt-1 text-sm text-gray-500">
                Thông tin mật độ dân số trong khu vực đã chọn
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
          
          <div className="p-6">
            {loading && (
              <div className="flex items-center justify-center py-8">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-500 border-t-transparent"></div>
                <span className="ml-3 text-gray-600">Đang tải dữ liệu...</span>
              </div>
            )}
            
            {error && (
              <div className="rounded-lg bg-red-50 p-4 text-red-600">
                Lỗi: {error}
              </div>
            )}
            
            {densityData && !loading && !error && (
              <div className="space-y-6">
                <div className="prose max-w-none">
                  <p className="text-gray-700">{densityData.result}</p>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span>Thấp</span>
                    <span>Trung bình</span>
                    <span>Cao</span>
                  </div>
                  <div className="h-4 w-full rounded-full bg-gradient-to-r from-green-200 via-yellow-200 to-red-200">
                    <div 
                      className="h-full rounded-full bg-gradient-to-r from-green-500 via-yellow-500 to-red-500 opacity-25"
                      style={{ width: `${Math.min(100, densityData.density / 100)}%` }}
                    />
                  </div>
                </div>

                <div className="rounded-lg bg-blue-50 p-4">
                  <h4 className="mb-2 font-medium text-blue-900">Thông tin thêm</h4>
                  <ul className="list-inside list-disc space-y-1 text-sm text-blue-800">
                    <li>Dữ liệu được cập nhật theo thời gian thực</li>
                    <li>Nguồn: Dữ liệu dân số Việt Nam</li>
                    <li>Độ chính xác có thể thay đổi tùy khu vực</li>
                  </ul>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
