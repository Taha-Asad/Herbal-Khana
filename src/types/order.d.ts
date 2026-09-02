// types/order.ts
import React from "react";
import { ORDER_STATUS, PAYMENT_STATUS } from "@prisma/client";
import { StaticImageData } from "next/image";

/* ===========================
   RE-EXPORT PRISMA ENUMS
=========================== */

export { ORDER_STATUS, PAYMENT_STATUS };

// Friendly type alias
export type OrderStatus = ORDER_STATUS;
export type PaymentStatus = PAYMENT_STATUS;

/* ===========================
   ADDRESS MODELS (UNIFIED)
=========================== */

// Raw address as stored in DB (JSON)
export interface StoredAddress {
  name: string;
  phone: string;
  line1: string;
  line2?: string | null;
  city: string;
  state?: string | null;
  postal: string;
  country: string;
}

// Display-friendly address (for components)
export interface DisplayAddress {
  name: string;
  phone: string;
  street: string;
  city: string;
  state?: string;
  postalCode: string;
  country: string;
  email?: string;
}

// Empty address for fallback

/* ===========================
   ADDRESS CARD PROPS
=========================== */

export interface AddressCardProps {
  title: string;
  icon: React.ElementType;
  address?: DisplayAddress;
}

/* ===========================
   ORDER ITEM
=========================== */

export interface OrderItem {
  id: string;
  name: string;
  sku: string;
  image?: string | StaticImageData;
  variant?: string;
  price: number;
  quantity: number;
  subtotal?: number;
}

/* ===========================
   TRACKING EVENT
=========================== */

export interface TrackingEvent {
  id: string;
  status: ORDER_STATUS;
  message: string | null;
  timestamp: string;
  isCompleted: boolean;
  isCurrent: boolean;
}

/* ===========================
   TRACKING DATA (API Response)
=========================== */

export interface TrackingData {
  orderId: string;
  orderNumber: string;
  status: ORDER_STATUS;
  paymentStatus: PAYMENT_STATUS;
  paymentMethod: string;
  orderDate: string;
  estimatedDelivery?: string;
  trackingNumber?: string;

  // Use DisplayAddress for frontend
  shippingAddress: DisplayAddress;
  billingAddress?: DisplayAddress;

  items: OrderItem[];

  subtotal: number;
  shippingCost: number;
  tax: number;
  discount: number;
  promoDiscount: number;
  total: number;
  currency: string;

  trackingHistory: TrackingEvent[];

  shippingMethod?: {
    name: string;
    estimatedDays: string;
  };

  currentStep: number;
  totalSteps: number;
}

// Alias for backward compatibility
export type OrderDetails = TrackingData;

/* ===========================
   SEARCH / UI PROPS
=========================== */

export interface TrackingSearchParams {
  orderId: string;
  email?: string;
  phone?: string;
}

export interface OrderSearchFormProps {
  onSearch: (params: TrackingSearchParams) => void;
  isLoading: boolean;
  initialOrderId?: string;
}

export interface StatusBadgeProps {
  status: ORDER_STATUS;
  size?: "sm" | "md" | "lg";
}

export interface TrackingTimelineProps {
  events: TrackingEvent[];
  isRefreshing: boolean;
  onRefresh: () => void;
}

export interface ExpandableSectionProps {
  title: string;
  icon: React.ElementType;
  children: React.ReactNode;
  defaultOpen?: boolean;
}

export interface PaymentSummaryProps {
  order: TrackingData;
}

export interface OrderItemsListProps {
  items: OrderItem[];
}

export interface OrderSummaryProps {
  order: TrackingData;
}

export interface OrderListItem {
  id: string;
  orderNumber: string;
  status: ORDER_STATUS;
  paymentStatus: PAYMENT_STATUS;
  total: number;
  itemCount: number;
  createdAt: string;
  firstItemImage: string | null;
  firstItemName: string | null;
}

/* ===========================
   ORDER STATS
=========================== */

export interface OrderStats {
  total: number;
  pending: number;
  processing: number;
  shipped: number;
  delivered: number;
  cancelled: number;
}
