import { OrderStatus } from "@/types/order";
import {
  CheckCircle,
  Clock,
  Home,
  Package,
  RefreshCw,
  Truck,
  Warehouse,
  XCircle,
} from "lucide-react";

const formatCurrency = (amount: number): string => {
  return `PKR ${amount.toLocaleString("en-PK")}`;
};

const getStatusColor = (status: OrderStatus): string => {
  const colors: Record<OrderStatus, string> = {
    PENDING: "#6B7280",
    PAID: "#3B82F6",
    PROCESSING: "#8B5CF6",
    SHIPPED: "#DDA200",
    DELIVERED: "#10B981",
    CANCELLED: "#EF4444",
    REFUNDED: "#6366F1",
  };
  return colors[status] || "#6B7280";
};

const getStatusIcon = (status: OrderStatus): React.ElementType => {
  const icons: Record<OrderStatus, React.ElementType> = {
    PENDING: Clock,
    PAID: CheckCircle,
    PROCESSING: Warehouse,
    SHIPPED: Truck,
    DELIVERED: Home,
    CANCELLED: XCircle,
    REFUNDED: RefreshCw,
  };
  return icons[status] || Package;
};

export { formatCurrency, getStatusColor, getStatusIcon };
