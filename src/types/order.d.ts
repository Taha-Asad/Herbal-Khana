// types/order.ts (Updated)
export interface OrderDetails {
  orderId: string;
  orderNumber: string;
  status: string;
  paymentStatus: string;
  paymentMethod: string | null;
  orderDate: string;
  estimatedDelivery: string;
  trackingNumber: string | null;
  currentStep: number;
  totalSteps: number;
  items: OrderItem[];
  subtotal: number;
  shippingCost: number;
  tax: number;
  discount: number;
  promoDiscount: number;
  total: number;
  currency: string;
  shippingAddress: OrderAddress;
  billingAddress: OrderAddress;
  trackingHistory: TrackingEvent[];
}

export interface OrderItem {
  id: string;
  name: string;
  sku: string;
  image: string | null;
  price: number;
  quantity: number;
  subtotal: number;
}

export interface OrderAddress {
  name: string;
  phone: string;
  street: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
}

export interface TrackingEvent {
  id: string;
  status: string;
  message: string | null;
  timestamp: string;
  isCompleted: boolean;
  isCurrent: boolean;
}

export interface TrackingSearchParams {
  orderId: string;
  email?: string;
  phone?: string;
}
