import { OrderStatus, StatusBadgeProps } from "@/types/order";
import { getStatusColor } from "@/utils/OrderRelated";
import {
  CheckCircle,
  Clock,
  Home,
  Navigation,
  RefreshCw,
  Truck,
  Warehouse,
  XCircle,
} from "lucide-react";

const STATUS_ICONS: Record<OrderStatus, React.ElementType> = {
  pending: Clock,
  confirmed: CheckCircle,
  processing: Warehouse,
  shipped: Truck,
  out_for_delivery: Navigation,
  delivered: Home,
  cancelled: XCircle,
  returned: RefreshCw,
};
export default function StatusBadge({ status, size = "md" }: StatusBadgeProps) {
  const statusLabels: Record<OrderStatus, string> = {
    pending: "Pending",
    confirmed: "Confirmed",
    processing: "Processing",
    shipped: "Shipped",
    out_for_delivery: "Out for Delivery",
    delivered: "Delivered",
    cancelled: "Cancelled",
    returned: "Returned",
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
