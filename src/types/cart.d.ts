export interface CartItem {
  id: string;
  variantId: string;
  quantity: number;
  price: number;
  originalPrice?: number;
  name: string;
  variantName: string;
  size: string;
  scent?: string | null;
  image?: string;
  stock: number;
  sku: string;
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

export interface PromoCodeData {
  code: string;
  type: PROMO_TYPE;
  value: number;
  maxDiscount: number | null;
  minOrderAmount: number | null;
}

export interface CartData {
  items: CartItem[];
  savedItems: CartItem[];
  summary: CartSummary;
  appliedPromoCode: PromoCodeData | null;
  selectedShippingId: string | null;
}

type CartResult =
  | { success: true; data: CartData }
  | { success: false; message: string };

export type PROMO_TYPE = "PERCENTAGE" | "FIXED" | "FREE_SHIPPING";
export type ServerCartItem = {
  id: string;
  variantId: string;
  quantity: number;
  price: number;
  originalPrice?: number;
  name: string;
  image?: string;
  sku: string;
  stock: number;
  size: string;
  scent?: string | null | undefined;
};

interface UICartItem {
  id: string;
  variantId: string;
  productId: string;
  name: string;
  image: string;
  price: number;
  originalPrice?: number;
  quantity: number;
  maxQuantity: number;
  sku: string;
  inStock: boolean;
  stockCount?: number;
  estimatedDelivery?: string;
  isSavedForLater: boolean;
  variant?: {
    size?: string;
    color?: string;
    scent?: string | null;
  };
}

interface RecommendedProduct {
  id: string;
  name: string;
  image: string;
  price: number;
  originalPrice?: number;
  rating: number;
  reviewCount: number;
  variantId: string;
}

interface ShippingOption {
  id: string;
  name: string;
  description: string;
  price: number;
  estimatedDays: string;
  icon: React.ComponentType<{ className?: string }>;
}

interface PromoCode {
  code: string;
  type: "percentage" | "fixed" | "free_shipping";
  value: number;
  description: string;
  maxDiscount?: number;
  minOrderAmount?: number;
}

interface QuantitySelectorProps {
  quantity: number;
  maxQuantity: number;
  isUpdating: boolean;
  onIncrease: () => void;
  onDecrease: () => void;
  onChange: (value: number) => void;
}

interface CartItemCardProps {
  item: UICartItem;
  isUpdating: boolean;
  onUpdateQuantity: (quantity: number) => void;
  onRemove: () => void;
  onSaveForLater: () => void;
}

interface SavedItemCardProps {
  item: UICartItem;
  isUpdating: boolean;
  onMoveToCart: () => void;
  onRemove: () => void;
}

interface PromoCodeInputProps {
  promoCode: string;
  setPromoCode: (code: string) => void;
  appliedPromo: PromoCode | null;
  isApplying: boolean;
  error: string;
  onApply: () => void;
  onRemove: () => void;
}

interface ShippingOptionsProps {
  selectedOption: string;
  onSelect: (optionId: string) => void;
  freeShippingThreshold: number;
  currentSubtotal: number;
}

interface OrderSummaryProps {
  summary: CartSummary;
  selectedShipping: ShippingOption | undefined;
  isCheckingOut: boolean;
  onCheckout: () => void;
}

interface RecommendedProductsProps {
  products: RecommendedProduct[];
  onAddToCart: (variantId: string) => void;
}

interface CartHeaderProps {
  itemCount: number;
  onClearCart: () => void;
}
