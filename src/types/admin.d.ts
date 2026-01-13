// types/admin.ts
import { ORDER_STATUS, PAYMENT_STATUS, ROLE, PROMO_TYPE } from "@prisma/client";
import { StoredAddress } from "./order";

// ============================================================================
// Common Types
// ============================================================================

export interface ActionResponse<T = undefined> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedData<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface QueryFilters {
  search?: string;
  status?: string;
  category?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  page?: number;
  pageSize?: number;
  dateFrom?: string;
  dateTo?: string;
}

// ============================================================================
// Dashboard Types
// ============================================================================

export interface DashboardStats {
  revenue: {
    total: number;
    change: number;
    period: string;
  };
  orders: {
    total: number;
    change: number;
    pending: number;
  };
  products: {
    total: number;
    lowStock: number;
    outOfStock: number;
  };
  customers: {
    total: number;
    newThisMonth: number;
  };
}

export interface ChartDataPoint {
  date: string;
  revenue: number;
  orders: number;
}

export interface RecentOrderSummary {
  id: string;
  orderNumber: string;
  customer: {
    name: string;
    email: string;
    avatar?: string;
  };
  total: number;
  status: ORDER_STATUS;
  itemCount: number;
  createdAt: string;
}

export interface TopProductSummary {
  id: string;
  name: string;
  slug: string;
  image?: string;
  price: number;
  sold: number;
  revenue: number;
  stock: number;
}

// ============================================================================
// Product Types
// ============================================================================

export interface ProductImage {
  id?: string;
  url?: string;
  file?: File;
  alt?: string;
  sortOrder?: number;
  isPrimary?: boolean;
}

export interface ProductVariant {
  id?: string;
  name: string;
  size: string;
  scent?: string;
  concentration?: string;
  sku: string;
  price: number;
  costPrice?: number;
  stock: number;
  lowStockThreshold: number;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  sku: string;
  description?: string;
  shortDescription?: string;
  isActive: boolean;
  isFeatured: boolean;
  isNew: boolean;
  metaTitle?: string;
  metaDescription?: string;
  categoryId?: string;
  categoryName?: string;
  images: ProductImage[];
  variants: ProductVariant[];
  viewCount: number;
  salesCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface ProductListItem {
  id: string;
  name: string;
  slug: string;
  sku: string;
  image?: string;
  categoryName?: string;
  price: number;
  stock: number;
  isActive: boolean;
  isFeatured: boolean;
  salesCount: number;
  variantCount: number;
  isLowStock: boolean;
}

export interface ProductFormData {
  name: string;
  slug: string;
  sku: string;
  description?: string;
  shortDescription?: string;
  isActive: boolean;
  isFeatured: boolean;
  isNew: boolean;
  metaTitle?: string;
  metaDescription?: string;
  categoryId?: string;
  images: ProductImage[];
  variants: ProductVariant[];
}

// ============================================================================
// Category Types
// ============================================================================

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  image: string | null; // ✅ URL from DB
  isActive: boolean;
  sortOrder: number;
  productCount: number;
  createdAt: string;
}

export interface CategoryFormData {
  name: string;
  slug: string;
  description?: string;
  image?: File | null;
  isActive: boolean;
  sortOrder: number;
}

// ============================================================================
// Order Types
// ============================================================================
type OrderStatus =
  | "PENDING"
  | "PAID"
  | "PROCESSING"
  | "SHIPPED"
  | "DELIVERED"
  | "CANCELLED"
  | "REFUNDED";

type PaymentStatus = "PENDING" | "SUCCESS" | "FAILED" | "REFUNDED";
export interface OrderItem {
  id: string;
  productId?: string;
  name: string;
  sku: string;
  image?: string;
  price: number;
  quantity: number;
  subtotal: number;
}

export interface OrderTimelineEvent {
  id: string;
  status: ORDER_STATUS;
  message?: string;
  createdBy?: string;
  createdAt: string;
}
export interface PaymentProofData {
  transactionId?: string;
  senderName: string;
  senderPhone: string;
  proofImageUrl: string;
  notes?: string;
  uploadedAt: string;
  status: "pending_verification" | "verified" | "rejected";
  isResubmission?: boolean;
  verifiedAt?: string;
  verifiedBy?: string;
  rejectedAt?: string;
  rejectedBy?: string;
  rejectionReason?: string;
}

export interface Order {
  id: string;
  orderNumber: string;
  status: ORDER_STATUS;
  paymentStatus: PAYMENT_STATUS;
  paymentMethod?: string;
  paymentProof?: PaymentProofData | null; // Add this
  customer: {
    id: string;
    name: string;
    email: string;
    phone?: string;
  };
  items: OrderItem[];
  timeline: OrderTimelineEvent[];
  subtotal: number;
  shippingCost: number;
  tax: number;
  discount: number;
  promoDiscount: number;
  total: number;
  currency: string;
  shippingAddress?: StoredAddress;
  billingAddress?: StoredAddress;
  trackingNumber?: string;
  estimatedDelivery?: string;
  customerNote?: string;
  adminNote?: string;
  createdAt: string;
  paidAt?: string;
  shippedAt?: string;
  deliveredAt?: string;
}

export interface OrderListItem {
  id: string;
  orderNumber: string;
  customer: {
    name: string;
    email: string;
  };
  total: number;
  status: ORDER_STATUS;
  paymentStatus: PAYMENT_STATUS;
  itemCount: number;
  createdAt: string;
}

export interface UpdateOrderData {
  status?: ORDER_STATUS;
  paymentStatus?: PAYMENT_STATUS;
  trackingNumber?: string;
  adminNote?: string;
  statusMessage?: string;
}

// ============================================================================
// User Types
// ============================================================================

export interface User {
  id: string;
  email: string;
  name?: string;
  phone?: string;
  image?: string;
  role: ROLE;
  isActive: boolean;
  isBanned: boolean;
  banReason?: string;
  emailVerified: boolean;
  phoneVerified: boolean;
  lastLoginAt?: string;
  createdAt: string;
  stats: {
    orderCount: number;
    totalSpent: number;
  };
}

export interface UserListItem {
  id: string;
  email: string;
  name?: string;
  image?: string;
  role: ROLE;
  isActive: boolean;
  isBanned: boolean;
  orderCount: number;
  totalSpent: number;
  lastLoginAt?: string;
  createdAt: string;
}

// ============================================================================
// Promo Code Types
// ============================================================================

export interface PromoCode {
  id: string;
  code: string;
  description?: string;
  type: PROMO_TYPE;
  value: number;
  minOrderAmount?: number;
  maxDiscount?: number;
  maxUses?: number;
  maxUsesPerUser: number;
  usedCount: number;
  isActive: boolean;
  isFirstOrderOnly: boolean;
  startsAt?: string;
  expiresAt?: string;
  createdAt: string;
}

export interface PromoCodeFormData {
  code: string;
  description?: string;
  type: PROMO_TYPE;
  value: number;
  minOrderAmount?: number;
  maxDiscount?: number;
  maxUses?: number;
  maxUsesPerUser: number;
  isActive: boolean;
  isFirstOrderOnly: boolean;
  startsAt?: string;
  expiresAt?: string;
}

// ============================================================================
// Review Types
// ============================================================================

export interface Review {
  id: string;
  rating: number;
  title?: string;
  content?: string;
  isApproved: boolean;
  user: {
    id: string;
    name?: string;
    email: string;
  };
  product: {
    id: string;
    name: string;
    image?: string;
  };
  createdAt: string;
}

// ============================================================================
// Shipping Types
// ============================================================================

export interface ShippingMethod {
  id: string;
  name: string;
  description?: string;
  price: number;
  freeAbove?: number;
  estimatedDays: string;
  isActive: boolean;
  sortOrder: number;
}

export interface ShippingMethodFormData {
  name: string;
  description?: string;
  price: number;
  freeAbove?: number;
  estimatedDays: string;
  isActive: boolean;
  sortOrder: number;
}
