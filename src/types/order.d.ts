export type OrderStatus =
  | "pending"
  | "confirmed"
  | "processing"
  | "shipped"
  | "out_for_delivery"
  | "delivered"
  | "cancelled"
  | "returned";

export interface TrackingEvent {
  id: string;
  status: OrderStatus;
  title: string;
  description: string;
  location?: string;
  timestamp: string;
  isCompleted: boolean;
  isCurrent: boolean;
}

export interface OrderItem {
  id: string;
  name: string;
  image: string;
  quantity: number;
  price: number;
  variant?: string;
  sku: string;
}

export interface ShippingAddress {
  name: string;
  phone: string;
  email: string;
  street: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
}

export interface OrderDetails {
  orderId: string;
  orderDate: string;
  estimatedDelivery: string;
  actualDelivery?: string;
  status: OrderStatus;
  trackingNumber?: string;
  carrier?: string;
  carrierUrl?: string;
  items: OrderItem[];
  shippingAddress: ShippingAddress;
  billingAddress: ShippingAddress;
  subtotal: number;
  shippingCost: number;
  tax: number;
  discount: number;
  total: number;
  paymentMethod: string;
  trackingHistory: TrackingEvent[];
}

export interface TrackingSearchParams {
  orderId: string;
  email?: string;
  phone?: string;
}

interface OrderSearchFormProps {
  onSearch: (params: TrackingSearchParams) => void;
  isLoading: boolean;
}

interface StatusBadgeProps {
  status: OrderStatus;
  size?: "sm" | "md" | "lg";
}

interface TrackingTimelineProps {
  events: TrackingEvent[];
  isRefreshing: boolean;
  onRefresh: () => void;
}

interface ExpandableSectionProps {
  title: string;
  icon: React.ElementType;
  children: React.ReactNode;
  defaultOpen?: boolean;
}

interface PaymentSummaryProps {
  order: OrderDetails;
}

interface AddressCardProps {
  title: string;
  icon: React.ElementType;
  address: ShippingAddress;
}

interface OrderItemsListProps {
  items: OrderItem[];
}

interface OrderSummaryProps {
  order: OrderDetails;
}
