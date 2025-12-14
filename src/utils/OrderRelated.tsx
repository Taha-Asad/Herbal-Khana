import { OrderStatus } from "@/types/order";
import {
  CheckCircle,
  Clock,
  Home,
  Navigation,
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
    pending: "#6B7280",
    confirmed: "#3B82F6",
    processing: "#8B5CF6",
    shipped: "#DDA200",
    out_for_delivery: "#F59E0B",
    delivered: "#10B981",
    cancelled: "#EF4444",
    returned: "#6366F1",
  };
  return colors[status] || "#6B7280";
};

const getStatusIcon = (status: OrderStatus): React.ElementType => {
  const icons: Record<OrderStatus, React.ElementType> = {
    pending: Clock,
    confirmed: CheckCircle,
    processing: Warehouse,
    shipped: Truck,
    out_for_delivery: Navigation,
    delivered: Home,
    cancelled: XCircle,
    returned: RefreshCw,
  };
  return icons[status] || Package;
};

export { formatCurrency, getStatusColor, getStatusIcon };
