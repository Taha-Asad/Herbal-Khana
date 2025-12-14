export interface CartItem {
  id: string;
  productId: string;
  name: string;
  image: string;
  price: number;
  originalPrice?: number;
  quantity: number;
  maxQuantity: number;
  variant?: {
    color?: string;
    size?: string;
    material?: string;
  };
  sku: string;
  inStock: boolean;
  stockCount?: number;
  isSavedForLater?: boolean;
  isGift?: boolean;
  estimatedDelivery?: string;
}

export interface PromoCode {
  code: string;
  type: "percentage" | "fixed" | "free_shipping";
  value: number;
  minOrderAmount?: number;
  maxDiscount?: number;
  description: string;
  expiresAt?: string;
}

export interface ShippingOption {
  id: string;
  name: string;
  description: string;
  price: number;
  estimatedDays: string;
  icon: React.ElementType;
}

export interface CartSummary {
  subtotal: number;
  shipping: number;
  tax: number;
  discount: number;
  promoDiscount: number;
  total: number;
  itemCount: number;
  savingsTotal: number;
}

export interface RecommendedProduct {
  id: string;
  name: string;
  image: string;
  price: number;
  originalPrice?: number;
  rating: number;
  reviewCount: number;
}
