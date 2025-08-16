import { useEffect, useState } from 'react';

export default function PopulationDensity({ bounds, apiKey }) {
  const [densityData, setDensityData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!bounds || !apiKey) return;

    const fetchDensityData = async () => {
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

    fetchDensityData();
  }, [bounds, apiKey]);

  return (
    <div className="absolute bottom-4 right-4 z-10 w-96 rounded-lg bg-white p-4 shadow-lg">
      <h3 className="mb-2 text-lg font-medium">Mật độ dân số</h3>
      {loading && <p className="text-gray-500">Đang tải dữ liệu...</p>}
      {error && <p className="text-red-500">Lỗi: {error}</p>}
      {densityData && (
        <div className="space-y-2">
          <p className="text-sm text-gray-700">{densityData.result}</p>
          <div className="h-4 w-full rounded-full bg-gradient-to-r from-green-200 via-yellow-200 to-red-200">
            <div 
              className="h-full rounded-full bg-gradient-to-r from-green-500 via-yellow-500 to-red-500 opacity-25"
              style={{ width: `${Math.min(100, densityData.density / 100)}%` }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
