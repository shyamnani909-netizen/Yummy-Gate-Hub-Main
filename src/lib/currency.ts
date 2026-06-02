const DISCOUNT_RATE = 0.3;
const LEGACY_USD_TO_INR_RATE = 83;

export const formatINR = (price: number, convertLegacyUsd = false) => {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(convertLegacyUsd ? price * LEGACY_USD_TO_INR_RATE : price);
};

export const getDiscountedPrice = (price: number) => {
  return price * (1 - DISCOUNT_RATE);
};

export const formatDiscountedINR = (price: number, convertLegacyUsd = false) => {
  return formatINR(getDiscountedPrice(price), convertLegacyUsd);
};

// Item-specific discount helpers
export const getItemDiscountRate = (price: number, category?: string) => {
  // Tiered discount logic by price (can be adjusted)
  if (price >= 500) return 0.25; // 25% for premium items
  if (price >= 300) return 0.2; // 20%
  if (price >= 200) return 0.15; // 15%
  if (price >= 100) return 0.1; // 10%
  return 0.05; // 5% for low-cost items
};

export const getItemDiscountedPrice = (price: number, category?: string) => {
  const rate = getItemDiscountRate(price, category);
  return Math.round(price * (1 - rate));
};

export const formatItemDiscountedINR = (price: number, category?: string, convertLegacyUsd = false) => {
  return formatINR(getItemDiscountedPrice(price, category), convertLegacyUsd);
};

export const getItemDiscountPercent = (price: number, category?: string) => {
  return Math.round(getItemDiscountRate(price, category) * 100);
};
