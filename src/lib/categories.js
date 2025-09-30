// Metadata cho các category chính
export const CATEGORY_METADATA = {
   food: {
      color: "#f97316",
      icon: "🍽️",
      label: "Đồ ăn",
   },
   shop: {
      color: "#eab308",
      icon: "🏪",
      label: "Cửa hàng",
   },
   other: {
      color: "#6b7280",
      icon: "📍",
      label: "Khác",
   },
};

// Metadata cho các loại món ăn
export const FOOD_TYPE_METADATA = {
   // === Đồ ăn Á ===
   "noodles": {
      icon: "🍜",
      label: "Mì",
      color: "#ef4444",
      group: "asian",
   },
   "noodles-congee": {
      icon: "🍜",
      label: "Mì & Cháo",
      color: "#ef4444",
      group: "asian",
   },
   "congee": {
      icon: "🥣",
      label: "Cháo",
      color: "#f97316",
      group: "asian",
   },
   "rice": {
      icon: "🍚",
      label: "Cơm",
      color: "#eab308",
      group: "asian",
   },
   "korean": {
      icon: "🥘",
      label: "Đồ Hàn",
      color: "#dc2626",
      group: "asian",
   },
   "hotpot-grill": {
      icon: "🍲",
      label: "Lẩu & Nướng",
      color: "#dc2626",
      group: "asian",
   },

   // === Đồ ăn phương Tây ===
   "western": {
      icon: "🍝",
      label: "Đồ Tây",
      color: "#0ea5e9",
      group: "western",
   },
   "fast-food": {
      icon: "🍔",
      label: "Đồ ăn nhanh",
      color: "#f59e0b",
      group: "western",
   },
   "international": {
      icon: "🌎",
      label: "Đồ ăn quốc tế",
      color: "#6366f1",
      group: "western",
   },

   // === Bánh & Đồ ngọt ===
   "bread": {
      icon: "🥖",
      label: "Bánh mì",
      color: "#d97706",
      group: "bakery",
   },
   "traditional-cake": {
      icon: "🥮",
      label: "Bánh truyền thống",
      color: "#c2410c",
      group: "bakery",
   },
   "cake": {
      icon: "🍰",
      label: "Bánh ngọt",
      color: "#db2777",
      group: "bakery",
   },
   "dessert": {
      icon: "🍨",
      label: "Tráng miệng",
      color: "#ec4899",
      group: "bakery",
   },

   // === Đồ uống ===
   "coffee-tea-juice": {
      icon: "☕",
      label: "Cà phê - Trà - Nước ép",
      color: "#a855f7",
      group: "drinks",
   },
   "milk-tea": {
      icon: "🧋",
      label: "Trà sữa",
      color: "#f59e0b",
      group: "drinks",
   },

   // === Đồ ăn đặc biệt ===
   "healthy-food": {
      icon: "🥗",
      label: "Đồ ăn healthy",
      color: "#22c55e",
      group: "special",
   },
   "beef": {
      icon: "🥩",
      label: "Bò",
      color: "#b91c1c",
      group: "special",
   },
   "snack": {
      icon: "🍿",
      label: "Ăn vặt",
      color: "#fb923c",
      group: "special",
   },

   // === Xếp hạng ===
   "silver-apron": {
      icon: "🥈",
      label: "Tạp Dề Bạc",
      color: "#94a3b8",
      group: "ranking",
   },
   "gold-apron": {
      icon: "🥇",
      label: "Tạp Dề Vàng",
      color: "#fbbf24",
      group: "ranking",
   },

   // === Khác ===
   "other": {
      icon: "🍽️",
      label: "Khác",
      color: "#6b7280",
      group: "other",
   },
};

// Metadata cho các loại cửa hàng
export const SHOP_TYPE_METADATA = {
   "official-brand": {
      icon: "🏢",
      label: "Cửa hàng chính hãng",
      color: "#0ea5e9",
   },
   "alcohol-beer": {
      icon: "🍺",
      label: "Rượu - Bia",
      color: "#f59e0b",
   },
   "other": {
      icon: "🏪",
      label: "Khác",
      color: "#6b7280",
   },
};

// Nhóm các loại món ăn
export const FOOD_GROUPS = {
   asian: {
      label: "Đồ ăn Á",
      icon: "🍜",
   },
   western: {
      label: "Đồ ăn phương Tây",
      icon: "🍝",
   },
   bakery: {
      label: "Bánh & Đồ ngọt",
      icon: "🥖",
   },
   drinks: {
      label: "Đồ uống",
      icon: "☕",
   },
   special: {
      label: "Đồ ăn đặc biệt",
      icon: "🥗",
   },
   ranking: {
      label: "Xếp hạng",
      icon: "🏆",
   },
   other: {
      label: "Khác",
      icon: "🍽️",
   },
};

// Helper function để lấy metadata dựa trên category và type
export function getTypeMetadata(category, type) {
   if (category === "food") {
      return FOOD_TYPE_METADATA[type] || FOOD_TYPE_METADATA.other;
   }
   if (category === "shop") {
      return SHOP_TYPE_METADATA[type] || SHOP_TYPE_METADATA.other;
   }
   return CATEGORY_METADATA.other;
}

// Helper function để lấy tất cả types theo category
export function getAllTypesByCategory(category) {
   if (category === "food") {
      return Object.keys(FOOD_TYPE_METADATA);
   }
   if (category === "shop") {
      return Object.keys(SHOP_TYPE_METADATA);
   }
   return [];
}

// Helper function để lấy tất cả types theo group (chỉ cho food)
export function getFoodTypesByGroup(group) {
   return Object.entries(FOOD_TYPE_METADATA)
      .filter(([_, meta]) => meta.group === group)
      .map(([type]) => type);
}
