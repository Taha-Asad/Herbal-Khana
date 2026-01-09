// types/checkout.ts

import { Decimal } from "@prisma/client/runtime/client";

export type PaymentMethod = "COD" | "JAZZCASH" | "EASYPAISA";

export interface CartItemWithDetails {
  id: string;
  quantity: number;
  variant: {
    id: string;
    name: string;
    size: string;
    sku: string;
    price: Decimal;
    stock: number;
    product: {
      id: string;
      name: string;
      slug: string;
      images: {
        url: string;
        alt: string | null;
        isPrimary: boolean;
      }[];
    };
  };
}

export interface ShippingMethodOption {
  id: string;
  name: string;
  description: string | null;
  price: Decimal;
  freeAbove: Decimal | null;
  estimatedDays: string;
}

export interface AddressOption {
  id: string;
  label: string | null;
  name: string;
  phone: string;
  line1: string;
  line2: string | null;
  city: string;
  state: string | null;
  postal: string;
  country: string;
  isDefault: boolean;
}

export interface CheckoutFormData {
  shippingAddressId: string;
  billingAddressId: string;
  sameAsShipping: boolean;
  shippingMethodId: string;
  paymentMethod: PaymentMethod;
  promoCode?: string;
  customerNote?: string;
}

export interface CheckoutSummary {
  subtotal: number;
  shippingCost: number;
  tax: number;
  discount: number;
  promoDiscount: number;
  total: number;
  currency: string;
}

export interface PaymentProofData {
  orderId: string;
  paymentMethod: PaymentMethod;
  transactionId?: string;
  senderNumber?: string;
  proofImageUrl: string;
}

export interface OrderConfirmation {
  orderId: string;
  orderNumber: string;
  status: string;
  paymentStatus: string;
  paymentMethod: string;
  total: number;
  estimatedDelivery: string;
  requiresProof: boolean;
}
