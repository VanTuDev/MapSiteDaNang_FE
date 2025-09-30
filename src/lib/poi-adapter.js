/**
 * Chuyển đổi dữ liệu thô từ DaNangData.json thành mảng POI chuẩn
 * @param {Object} data - Dữ liệu thô dạng { DaNangData: [...] }
 * @returns {Array} Mảng các POI đã được chuẩn hóa
 */
export function adaptDaNang(data) {
   const RAW = Array.isArray(data?.DaNangData) ? data.DaNangData : [];

   return RAW.reduce((acc, r, i) => {
      try {
         // Kiểm tra dữ liệu bắt buộc
         if (!r.storeName?.trim()) {
            console.warn(`Bỏ qua POI #${i}: Thiếu tên địa điểm`);
            return acc;
         }

         // Parse tọa độ
         const lat = Number(r.latitude);
         const lng = Number(r.longitude);
         if (isNaN(lat) || isNaN(lng) || !isFinite(lat) || !isFinite(lng)) {
            console.warn(`Bỏ qua POI #${i}: Tọa độ không hợp lệ`, { lat, lng });
            return acc;
         }

         // Kiểm tra phạm vi tọa độ
         if (lat < -90 || lat > 90 || lng < -180 || lng > 180) {
            console.warn(`Bỏ qua POI #${i}: Tọa độ nằm ngoài phạm vi`, { lat, lng });
            return acc;
         }

         // Chuẩn hóa category và productType
         const rawCategory = String(r.category || "other").toLowerCase().trim();
         const category = rawCategory === "" ? "other" : rawCategory;
         const productTypes = normalizeProductTypes(r.productType);

         // Tạo POI hợp lệ
         acc.push({
            id: r.storeId?.trim() || `dn-${i}`,
            name: r.storeName.trim(),
            address: r.address?.trim() || "Chưa có địa chỉ",
            category,
            productTypes,
            lat,
            lng,
            city: r.city?.trim() || "Da Nang",
         });

         return acc;
      } catch (error) {
         console.error(`Lỗi xử lý POI #${i}:`, error);
         return acc;
      }
   }, []);
}

/**
 * Chuẩn hóa chuỗi productType thành mảng
 * @param {string} productType - Chuỗi productType, có thể chứa nhiều loại phân cách bởi dấu phẩy
 * @returns {Array} Mảng các productType đã được chuẩn hóa
 */
import { FOOD_TYPE_METADATA, SHOP_TYPE_METADATA } from './categories';

function normalizeProductType(type) {
   if (!type) return "other";

   // Chuẩn hóa type
   const normalized = type.toLowerCase().trim();

   // Map các type tương đương
   const typeMap = {
      // Noodles
      'noodles & congee': 'noodles-congee',
      'mì & cháo': 'noodles-congee',
      'noodle': 'noodles',
      'mì': 'noodles',

      // Drinks
      'coffee - tea - juice': 'coffee-tea-juice',
      'milk tea': 'milk-tea',
      'trà sữa': 'milk-tea',

      // Bakery
      'traditional cake': 'traditional-cake',
      'bánh truyền thống': 'traditional-cake',

      // Special
      'healthy food': 'healthy-food',
      'healthy - salad': 'healthy-food',
      'hotpot & grill': 'hotpot-grill',
      'lẩu & nướng': 'hotpot-grill',

      // Ranking
      'tạp dề bạc': 'silver-apron',
      'tạp dề vàng': 'gold-apron',

      // Shop
      'official brand store': 'official-brand',
      'alcohol-beer': 'alcohol-beer',
      'rượu bia': 'alcohol-beer',
   };

   return typeMap[normalized] || normalized;
}

function normalizeProductTypes(productType) {
   if (!productType) return ["other"];

   // Split và chuẩn hóa từng type
   const types = productType.split(",")
      .map(t => normalizeProductType(t.trim()))
      .filter(Boolean); // Loại bỏ empty strings

   return types.length ? types : ["other"];
}

/**
 * Lấy danh sách tất cả các category từ mảng POI
 * @param {Array} pois - Mảng các POI
 * @returns {Array} Mảng các category duy nhất, đã sắp xếp
 */
export function collectCategories(pois) {
   return Array.from(new Set(pois.map(p => p.category))).sort();
}

/**
 * Lấy danh sách tất cả các productType từ mảng POI
 * @param {Array} pois - Mảng các POI
 * @returns {Array} Mảng các productType duy nhất, đã sắp xếp
 */
export function collectProductTypes(pois) {
   return Array.from(
      new Set(pois.flatMap(p => p.productTypes))
   ).sort();
}
