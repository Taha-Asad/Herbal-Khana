import {
  PromoCode,
  PromoCodeData,
  ServerCartItem,
  UICartItem,
} from "@/types/cart";

export const calculateDiscount = (
  original: number,
  current: number
): number => {
  return Math.round(((original - current) / original) * 100);
};

// Transform server cart item to UI cart item
export function transformCartItem(
  item: ServerCartItem,
  isSavedForLater: boolean = false
): UICartItem {
  return {
    id: item.id,
    variantId: item.variantId,
    productId: item.variantId, // Using variantId as productId for now
    name: item.name,
    image: item.image || "/placeholder.svg",
    price: item.price,
    originalPrice: item.originalPrice,
    quantity: item.quantity,
    maxQuantity: item.stock,
    sku: item.sku,
    inStock: item.stock > 0,
    stockCount: item.stock,
    estimatedDelivery: "3-5 business days",
    isSavedForLater,
    unavailable: item.unavailable,
    variant: {
      size: item.size,
      scent: item.scent,
    },
  };
}

// Transform promo code data to UI format
export function transformPromoCode(promo: PromoCodeData): PromoCode {
  const typeMap: Record<string, "percentage" | "fixed" | "free_shipping"> = {
    PERCENTAGE: "percentage",
    FIXED: "fixed",
    FREE_SHIPPING: "free_shipping",
  };

  return {
    code: promo.code,
    type: typeMap[promo.type] || "PERCENTAGE",
    value: promo.value,
    description: getPromoDescription(promo),
    maxDiscount: promo.maxDiscount || undefined,
    minOrderAmount: promo.minOrderAmount || undefined,
  };
}

export function getPromoDescription(promo: PromoCodeData): string {
  switch (promo.type) {
    case "PERCENTAGE":
      return `${promo.value}% off your order`;
    case "FIXED":
      return `PKR ${promo.value} off your order`;
    case "FREE_SHIPPING":
      return "Free shipping on your order";
    default:
      return "Discount applied";
  }
}
