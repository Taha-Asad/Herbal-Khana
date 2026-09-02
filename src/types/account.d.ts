// types/account.ts

import { ORDER_STATUS, PAYMENT_STATUS } from "@prisma/client";

// =============================================================================
// USER & PROFILE
// =============================================================================

export interface UserProfile {
  id: string;
  name: string | null;
  email: string;
  phone: string | null;
  image: string | null;
  emailVerified: boolean;
  phoneVerified: boolean;
  createdAt: Date;
  lastLoginAt: Date | null;
}

export interface UpdateProfileInput {
  name?: string;
  phone?: string;
  image?: string;
}

export interface ChangePasswordInput {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

// =============================================================================
// ORDERS
// =============================================================================

export interface OrderItem {
  id: string;
  name: string;
  sku: string;
  image: string | null;
  price: number;
  quantity: number;
  subtotal: number;
}

export interface OrderTimeline {
  id: string;
  status: ORDER_STATUS;
  message: string | null;
  createdAt: Date;
}

export interface Order {
  id: string;
  orderNumber: string;
  status: ORDER_STATUS;
  paymentStatus: PAYMENT_STATUS;
  subtotal: number;
  shippingCost: number;
  tax: number;
  discount: number;
  promoDiscount: number;
  total: number;
  currency: string;
  shippingAddress: ShippingAddressSnapshot | null;
  trackingNumber: string | null;
  estimatedDelivery: Date | null;
  paymentMethod: string | null;
  customerNote: string | null;
  items: OrderItem[];
  timeline: OrderTimeline[];
  createdAt: Date;
  paidAt: Date | null;
  shippedAt: Date | null;
  deliveredAt: Date | null;
}

export interface OrderSummary {
  id: string;
  orderNumber: string;
  status: ORDER_STATUS;
  paymentStatus: PAYMENT_STATUS;
  total: number;
  itemCount: number;
  createdAt: Date;
  firstItemImage: string | null;
}

export interface ShippingAddressSnapshot {
  name: string;
  phone: string;
  line1: string;
  line2?: string;
  city: string;
  state?: string;
  postal: string;
  country: string;
}

// =============================================================================
// WISHLIST
// =============================================================================

export interface WishlistItem {
  id: string;
  productId: string;
  name: string;
  slug: string;
  image: string;
  price: number;
  originalPrice?: number;
  inStock: boolean;
  stockCount: number;
  addedAt: Date;
}

// =============================================================================
// ADDRESSES
// =============================================================================

export interface Address {
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
  createdAt: Date;
  updatedAt: Date;
}

export interface AddressInput {
  label?: string;
  name: string;
  phone: string;
  line1: string;
  line2?: string;
  city: string;
  state?: string;
  postal: string;
  country?: string;
  isDefault?: boolean;
}

// =============================================================================
// SETTINGS
// =============================================================================

export interface UserSettings {
  emailNotifications: boolean;
  smsNotifications: boolean;
  orderUpdates: boolean;
  promotionalEmails: boolean;
  newsletter: boolean;
}

export interface NotificationPreferences {
  emailNotifications: boolean;
  smsNotifications: boolean;
  orderUpdates: boolean;
  promotionalEmails: boolean;
  newsletter: boolean;
}

// =============================================================================
// COMMON
// =============================================================================

export interface ActionResponse<T = void> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}
