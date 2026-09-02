// components/admin/ui/StatusBadge.tsx
"use client";

import React from "react";
import {
  Clock,
  CreditCard,
  RefreshCw,
  Truck,
  CheckCircle,
  XCircle,
} from "lucide-react";
import { ORDER_STATUS, PAYMENT_STATUS } from "@prisma/client";

type BadgeVariant =
  | "default"
  | "success"
  | "warning"
  | "error"
  | "info"
  | "purple"
  | "cyan";

interface StatusConfig {
  label: string;
  variant: BadgeVariant;
  icon: React.ElementType;
}

const orderStatusConfig: Record<ORDER_STATUS, StatusConfig> = {
  PENDING: { label: "Pending", variant: "warning", icon: Clock },
  PAID: { label: "Paid", variant: "info", icon: CreditCard },
  PROCESSING: { label: "Processing", variant: "purple", icon: RefreshCw },
  SHIPPED: { label: "Shipped", variant: "cyan", icon: Truck },
  DELIVERED: { label: "Delivered", variant: "success", icon: CheckCircle },
  CANCELLED: { label: "Cancelled", variant: "error", icon: XCircle },
  REFUNDED: { label: "Refunded", variant: "default", icon: RefreshCw },
};

const paymentStatusConfig: Record<PAYMENT_STATUS, StatusConfig> = {
  PENDING: { label: "Pending", variant: "warning", icon: Clock },
  SUCCESS: { label: "Paid", variant: "success", icon: CheckCircle },
  FAILED: { label: "Failed", variant: "error", icon: XCircle },
  REFUNDED: { label: "Refunded", variant: "default", icon: RefreshCw },
};

const variantStyles: Record<BadgeVariant, string> = {
  default: "bg-gray-100 text-gray-700",
  success: "bg-green-100 text-green-700",
  warning: "bg-amber-100 text-amber-700",
  error: "bg-red-100 text-red-700",
  info: "bg-blue-100 text-blue-700",
  purple: "bg-purple-100 text-purple-700",
  cyan: "bg-cyan-100 text-cyan-700",
};

interface OrderStatusBadgeProps {
  status: ORDER_STATUS;
  showIcon?: boolean;
  size?: "sm" | "md";
}

export function OrderStatusBadge({
  status,
  showIcon = true,
  size = "sm",
}: OrderStatusBadgeProps) {
  const config = orderStatusConfig[status];
  const Icon = config.icon;

  return (
    <span
      className={`inline-flex items-center gap-1 font-medium rounded-full
        ${variantStyles[config.variant]}
        ${size === "sm" ? "px-2 py-0.5 text-xs" : "px-3 py-1 text-sm"}`}
    >
      {showIcon && <Icon className={size === "sm" ? "w-3 h-3" : "w-4 h-4"} />}
      {config.label}
    </span>
  );
}

interface PaymentStatusBadgeProps {
  status: PAYMENT_STATUS;
  showIcon?: boolean;
  size?: "sm" | "md";
}

export function PaymentStatusBadge({
  status,
  showIcon = true,
  size = "sm",
}: PaymentStatusBadgeProps) {
  const config = paymentStatusConfig[status];
  const Icon = config.icon;

  return (
    <span
      className={`inline-flex items-center gap-1 font-medium rounded-full
        ${variantStyles[config.variant]}
        ${size === "sm" ? "px-2 py-0.5 text-xs" : "px-3 py-1 text-sm"}`}
    >
      {showIcon && <Icon className={size === "sm" ? "w-3 h-3" : "w-4 h-4"} />}
      {config.label}
    </span>
  );
}

interface GenericBadgeProps {
  label: string;
  variant?: BadgeVariant;
  size?: "sm" | "md";
}

export function Badge({
  label,
  variant = "default",
  size = "sm",
}: GenericBadgeProps) {
  return (
    <span
      className={`inline-flex items-center font-medium rounded-full
        ${variantStyles[variant]}
        ${size === "sm" ? "px-2 py-0.5 text-xs" : "px-3 py-1 text-sm"}`}
    >
      {label}
    </span>
  );
}
