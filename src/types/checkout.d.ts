// types/checkout.ts

export type PaymentMethod = "cod" | "jazzcash" | "easypaisa" | "bank_transfer";

export interface CheckoutAddress {
  id?: string;
  name: string;
  phone: string;
  line1: string;
  line2?: string;
  city: string;
  state?: string;
  postal: string;
  country: string;
  isDefault?: boolean;
  label?: string;
}

export interface CheckoutItem {
  variantId: string;
  productId: string;
  name: string;
  variantName: string;
  sku: string;
  image?: string | null;
  price: number;
  quantity: number;
  subtotal: number;
  stock: number;
}

export interface ShippingMethodOption {
  id: string;
  name: string;
  description?: string;
  price: number;
  freeAbove?: number;
  estimatedDays: string;
}

export interface CheckoutSummary {
  subtotal: number;
  shippingCost: number;
  tax: number;
  discount: number;
  promoDiscount: number;
  total: number;
  appliedPromoCode?: string;
}

export interface CheckoutState {
  cartId: string;
  items: CheckoutItem[];
  shippingAddress: CheckoutAddress | null;
  billingAddress: CheckoutAddress | null;
  sameAsShipping: boolean;
  shippingMethod: ShippingMethodOption | null;
  paymentMethod: PaymentMethod | null;
  summary: CheckoutSummary;
  customerNote?: string;
}

export interface CreateOrderInput {
  cartId: string;
  shippingAddressId?: string;
  shippingAddress?: CheckoutAddress;
  billingAddressId?: string;
  billingAddress?: CheckoutAddress;
  sameAsShipping: boolean;
  shippingMethodId: string;
  paymentMethod: PaymentMethod;
  promoCode?: string;
  customerNote?: string;
}

export interface OrderResponse {
  success: boolean;
  orderId?: string;
  orderNumber?: string;
  message?: string;
  paymentInstructions?: PaymentInstructions;
}

export interface PaymentInstructions {
  method: PaymentMethod;
  accountTitle?: string;
  accountNumber?: string;
  amount: number;
  currency: string;
  reference: string;
  instructions: string[];
  expiresAt?: Date;
}

export interface PaymentProofUpload {
  orderId: string;
  transactionId?: string;
  senderName?: string;
  senderPhone?: string;
  proofImageUrl: string;
  notes?: string;
}

export interface OrderConfirmation {
  orderId: string;
  orderNumber: string;
  status: string;
  paymentStatus: string;
  paymentMethod: PaymentMethod;
  total: number;
  estimatedDelivery?: string;
  paymentInstructions?: PaymentInstructions;
  requiresProof: boolean;
}

// Validation result for checkout
export interface CheckoutValidationResult {
  success: boolean;
  message?: string;
  issues?: string[];
}
