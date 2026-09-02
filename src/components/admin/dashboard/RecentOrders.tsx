// components/admin/dashboard/RecentOrders.tsx
"use client";

import React from "react";
import Link from "next/link";
import { ShoppingCart, ArrowRight } from "lucide-react";
import { RecentOrderSummary } from "@/types/admin";
import { OrderStatusBadge } from "@/components/admin/ui/StatusBadge";
import Image from "next/image";

interface RecentOrdersProps {
  orders: RecentOrderSummary[];
  loading?: boolean;
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-PK", {
    style: "currency",
    currency: "PKR",
    minimumFractionDigits: 0,
  }).format(amount);
}

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString("en-PK", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function RecentOrders({
  orders,
  loading = false,
}: RecentOrdersProps) {
  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="flex items-center gap-4 p-4 animate-pulse">
            <div className="w-10 h-10 bg-gray-200 rounded-full" />
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-gray-200 rounded w-1/3" />
              <div className="h-3 bg-gray-200 rounded w-1/2" />
            </div>
            <div className="h-4 bg-gray-200 rounded w-20" />
          </div>
        ))}
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <ShoppingCart className="w-12 h-12 text-gray-300 mb-3" />
        <p className="text-gray-500">No orders yet</p>
      </div>
    );
  }

  return (
    <div className="divide-y divide-gray-100">
      {orders.map((order) => (
        <Link
          key={order.id}
          href={`/admin/orders/${order.id}`}
          className="flex items-center gap-4 p-4 hover:bg-gray-50 transition-colors"
        >
          {/* Avatar */}
          <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center overflow-hidden flex-shrink-0">
            {order.customer.avatar ? (
              <Image
                src={order.customer.avatar}
                alt={order.customer.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <span className="text-sm font-medium text-gray-600">
                {order.customer.name.charAt(0).toUpperCase()}
              </span>
            )}
          </div>

          {/* Order Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-gray-900">
                #{order.orderNumber}
              </span>
              <OrderStatusBadge status={order.status} />
            </div>
            <p className="text-sm text-gray-500 truncate">
              {order.customer.name} • {order.itemCount} items
            </p>
          </div>

          {/* Amount & Date */}
          <div className="text-right flex-shrink-0">
            <p className="font-semibold text-gray-900">
              {formatCurrency(order.total)}
            </p>
            <p className="text-xs text-gray-500">
              {formatDate(order.createdAt)}
            </p>
          </div>
        </Link>
      ))}

      {/* View All Link */}
      <div className="p-4">
        <Link
          href="/admin/orders"
          className="flex items-center justify-center gap-2 text-sm font-medium text-amber-600 
            hover:text-amber-700 transition-colors"
        >
          View All Orders
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
}
