import { OrderStatus, StatusBadgeProps } from "@/types/order";
import { getStatusColor } from "@/utils/OrderRelated";
import {
  CheckCircle,
  Clock,
  Home,
  RefreshCw,
  Truck,
  Warehouse,
  XCircle,
} from "lucide-react";

const STATUS_ICONS: Record<OrderStatus, React.ElementType> = {
  PENDING: Clock,
  PAID: CheckCircle,
  PROCESSING: Warehouse,
  SHIPPED: Truck,
  DELIVERED: Home,
  CANCELLED: XCircle,
  REFUNDED: RefreshCw,
};
export default function StatusBadge({ status, size = "md" }: StatusBadgeProps) {
  const statusLabels: Record<OrderStatus, string> = {
    PENDING: "Pending",
    PAID: "Paid",
    PROCESSING: "Processing",
    SHIPPED: "Shipped",
    DELIVERED: "Delivered",
    CANCELLED: "Cancelled",
    REFUNDED: "Refunded",
  };

  const sizeClasses = {
    sm: "px-2 py-1 text-xs",
    md: "px-3 py-1.5 text-sm",
    lg: "px-4 py-2 text-base",
  };

  const Icon = STATUS_ICONS[status];
  const color = getStatusColor(status);

  return (
    <span
      className={`inline-flex items-center gap-1.5 font-semibold rounded-full ${sizeClasses[size]}`}
      style={{
        backgroundColor: `${color}15`,
        color: color,
      }}
    >
      <Icon className="w-4 h-4" />
      {statusLabels[status]}
    </span>
  );
}
