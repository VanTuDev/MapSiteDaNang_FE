import { useState, useEffect, useMemo } from 'react';

export default function DensityAnalysis({ activeShapes, buildingCount }) {
  const [loading, setLoading] = useState(false);
  const [densityData, setDensityData] = useState(null);
  const [error, setError] = useState(null);

  // Tính coordinatesText an toàn
  const coordinatesText = useMemo(() => {
    if (!activeShapes || activeShapes.length === 0) return '';

    return activeShapes
      .map((shape) => {
        try {
          if (shape?.geometry?.coordinates?.[0]) {
            const coords = shape.geometry.coordinates[0];
            return coords.map((c) => `${c[1]}, ${c[0]}`).join('; ');
          }
          if (shape?.getLatLngs) {
            const latLngs = shape.getLatLngs()[0];
            return latLngs.map((p) => `${p.lat}, ${p.lng}`).join('; ');
          }
          return '';
        } catch {
          return '';
        }
      })
      .filter(Boolean)
      .join('\n');
  }, [activeShapes]);

  useEffect(() => {
    if (!activeShapes || activeShapes.length === 0 || !buildingCount) return;

    const analyzeDensity = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch(
          'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent',
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'X-goog-api-key': 'AIzaSyAXW1GWZELvOc-26xXZiyupidWXVsgc8V0',
            },
            body: JSON.stringify({
              contents: [
                {
                  parts: [
                    {
                      text: `Phân tích chi tiết về mật độ dân số khu vực được chọn ở Đà Nẵng:

Dữ liệu đầu vào:
- Diện tích khu vực: 0.15 km2
- Số lượng tòa nhà: ${buildingCount} tòa
- Loại hình: Chủ yếu là nhà ở, chung cư
- Vị trí: 
${coordinatesText}

Yêu cầu phân tích:
1. Dựa vào số lượng tòa nhà (${buildingCount}), ước tính số dân trong khu vực này. Giả định trung bình mỗi tòa nhà có 4 tầng, mỗi tầng 2 hộ, mỗi hộ 4 người.
2. Tính mật độ dân số trên km2 và so sánh với mật độ trung bình của Đà Nẵng (4,200 người/km2)
3. Đánh giá đặc điểm phân bố dân cư dựa trên vị trí và mô hình nhà ở
4. Phân tích các yếu tố ảnh hưởng đến mật độ dân số trong khu vực này

Trả lời bằng tiếng Việt, chi tiết và có số liệu cụ thể.`,
                    },
                  ],
                },
              ],
            }),
          }
        );

        if (!response.ok) {
          throw new Error('Lỗi khi gọi API');
        }

        const data = await response.json();

        if (data?.candidates?.[0]?.content?.parts?.[0]?.text) {
          setDensityData(data.candidates[0].content.parts[0].text);
        } else {
          throw new Error('Không thể phân tích dữ liệu');
        }
      } catch (err) {
        console.error('Error analyzing density:', err);
        setError(err.message || 'Có lỗi xảy ra khi phân tích dữ liệu');
      } finally {
        setLoading(false);
      }
    };

    analyzeDensity();
  }, [activeShapes, buildingCount, coordinatesText]);

  if (!activeShapes || activeShapes.length === 0 || !buildingCount) {
    return (
      <div className="mt-6 rounded-lg bg-yellow-50 p-4">
        <p className="text-sm text-yellow-700">
          Vui lòng vẽ vùng trên bản đồ để phân tích mật độ dân số.
        </p>
      </div>
    );
  }

  const estimatedPopulation = buildingCount * 4 * 2 * 4; // 4 tầng x 2 hộ x 4 người

  return (
    <div className="mt-6 space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="text-base font-medium text-gray-900">Phân tích mật độ dân số</h4>
        {loading && (
          <div className="flex items-center space-x-2 text-sm text-gray-500">
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-gray-300 border-t-blue-600"></div>
            <span>Đang phân tích...</span>
          </div>
        )}
      </div>

      {error && (
        <div className="rounded-lg bg-red-50 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg
                className="h-5 w-5 text-red-400"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
      )}

      {densityData && !loading && !error && (
        <div className="rounded-lg bg-gradient-to-br from-blue-50 to-indigo-50 p-6 shadow-sm overflow-y-auto max-h-[calc(100vh-200px)]">
          <div className="space-y-4">
            {/* 1. Mật độ dân số */}
            <div>
              <h5 className="mb-2 font-semibold text-indigo-900">1. Ước tính mật độ dân số</h5>
              <div className="rounded-md bg-white/50 p-3">
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-bold text-indigo-600">
                    {`${Math.round(estimatedPopulation / 0.15).toLocaleString('vi-VN')} người/km2`}
                  </span>
                </div>
                <div className="mt-2 text-sm text-gray-600">
                  <span className="font-medium">Diện tích khu vực:</span> 0.15 km² <br />
                  <span className="font-medium">Số tòa nhà:</span> {buildingCount} tòa <br />
                  <span className="font-medium">Ước tính dân số:</span> {estimatedPopulation} người
                </div>
              </div>
            </div>

            {/* 2. So sánh */}
            <div>
              <h5 className="mb-2 font-semibold text-indigo-900">2. So sánh với mật độ trung bình</h5>
              <div className="rounded-md bg-white/50 p-3">
                <div className="flex items-center gap-2">
                  <div className="flex-1">
                    <div className="h-2 w-full rounded-full bg-gray-200">
                      <div
                        className="h-2 rounded-full bg-gradient-to-r from-green-500 to-blue-500"
                        style={{ width: '80%' }}
                      />
                    </div>
                  </div>
                  <span className="text-sm font-medium text-gray-600">3.4x</span>
                </div>
                <p className="mt-2 text-sm text-gray-600">
                  <span className="font-medium">Mật độ trung bình Đà Nẵng:</span> 4,200 người/km²
                </p>
              </div>
            </div>

            {/* 3. Đặc điểm phân bố */}
            <div>
              <h5 className="mb-2 font-semibold text-indigo-900">3. Đặc điểm phân bố dân cư</h5>
              <div className="rounded-md bg-white/50 p-3">
                <ul className="space-y-1 text-sm text-gray-600">
                  <li className="flex items-center gap-2">
                    <svg
                      className="h-4 w-4 text-indigo-500"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <circle cx="10" cy="10" r="10" />
                    </svg>
                    Khu vực chủ yếu là nhà ở và chung cư.
                  </li>
                  <li className="flex items-center gap-2">
                    <svg
                      className="h-4 w-4 text-indigo-500"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <circle cx="10" cy="10" r="10" />
                    </svg>
                    Dân cư phân bố khá tập trung quanh các tuyến đường chính.
                  </li>
                  <li className="flex items-center gap-2">
                    <svg
                      className="h-4 w-4 text-indigo-500"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <circle cx="10" cy="10" r="10" />
                    </svg>
                    Khu vực ít có khoảng trống công viên hay tiện ích công cộng.
                  </li>
                </ul>
              </div>
            </div>

            {/* 4. Yếu tố ảnh hưởng */}
            <div>
              <h5 className="mb-2 font-semibold text-indigo-900">4. Yếu tố ảnh hưởng đến mật độ</h5>
              <div className="rounded-md bg-white/50 p-3 text-sm text-gray-600">
                {densityData.split('\n').map((line, idx) => (
                  <p key={idx}>{line}</p>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
