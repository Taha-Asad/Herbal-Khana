"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Package,
  ChevronRight,
  Loader2,
  Clock,
  Truck,
  CheckCircle,
  XCircle,
  RefreshCw,
} from "lucide-react";
import type { OrderSummary } from "@/types/account";
import { ORDER_STATUS } from "@/generated/prisma/enums";
import { getOrders, getOrderStats } from "@/app/action/orders.action";
import { formatCurrency } from "@/utils/OrderRelated";
import { formatDate } from "@/utils/FormatDate";

const statusConfig: Record<
  ORDER_STATUS,
  { label: string; color: string; icon: React.ElementType }
> = {
  PENDING: {
    label: "Pending",
    color: "bg-amber-100 text-amber-700",
    icon: Clock,
  },
  PAID: {
    label: "Paid",
    color: "bg-blue-100 text-blue-700",
    icon: CheckCircle,
  },
  PROCESSING: {
    label: "Processing",
    color: "bg-purple-100 text-purple-700",
    icon: RefreshCw,
  },
  SHIPPED: {
    label: "Shipped",
    color: "bg-cyan-100 text-cyan-700",
    icon: Truck,
  },
  DELIVERED: {
    label: "Delivered",
    color: "bg-green-100 text-green-700",
    icon: CheckCircle,
  },
  CANCELLED: {
    label: "Cancelled",
    color: "bg-red-100 text-red-700",
    icon: XCircle,
  },
  REFUNDED: {
    label: "Refunded",
    color: "bg-gray-100 text-gray-700",
    icon: RefreshCw,
  },
};

export default function OrdersPage() {
  const [orders, setOrders] = useState<OrderSummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [statusFilter, setStatusFilter] = useState<ORDER_STATUS | "">("");
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    processing: 0,
    delivered: 0,
    cancelled: 0,
  });

  useEffect(() => {
    let isMounted = true; // prevent state updates if component unmounts

    const fetchData = async () => {
      setIsLoading(true);

      const ordersResult = await getOrders(page, 10, statusFilter || undefined);
      if (isMounted && ordersResult.success && ordersResult.data) {
        setOrders(ordersResult.data.items);
        setTotalPages(ordersResult.data.totalPages);
      }

      const statsResult = await getOrderStats();
      if (isMounted && statsResult.success && statsResult.data) {
        setStats(statsResult.data);
      }

      if (isMounted) setIsLoading(false);
    };

    fetchData();

    return () => {
      isMounted = false; // cancel any state updates if unmounted
    };
  }, [page, statusFilter]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-stone-800">My Orders</h1>
        <p className="text-stone-600 mt-1">Track and manage your orders</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border-2 border-stone-200 p-4">
          <div className="text-2xl font-bold text-stone-800">{stats.total}</div>
          <div className="text-sm text-stone-600">Total Orders</div>
        </div>
        <div className="bg-amber-50 rounded-xl border-2 border-amber-200 p-4">
          <div className="text-2xl font-bold text-amber-700">
            {stats.pending}
          </div>
          <div className="text-sm text-amber-600">Pending</div>
        </div>
        <div className="bg-blue-50 rounded-xl border-2 border-blue-200 p-4">
          <div className="text-2xl font-bold text-blue-700">
            {stats.processing}
          </div>
          <div className="text-sm text-blue-600">Processing</div>
        </div>
        <div className="bg-green-50 rounded-xl border-2 border-green-200 p-4">
          <div className="text-2xl font-bold text-green-700">
            {stats.delivered}
          </div>
          <div className="text-sm text-green-600">Delivered</div>
        </div>
      </div>

      {/* Filter */}
      <div className="flex gap-4 flex-wrap">
        <select
          value={statusFilter}
          onChange={(e) => {
            setStatusFilter(e.target.value as ORDER_STATUS | "");
            setPage(1);
          }}
          className="px-4 py-2 border-2 border-stone-200 rounded-xl 
            focus:border-[#DDA200] focus:outline-none"
        >
          <option value="">All Orders</option>
          {Object.entries(statusConfig).map(([key, { label }]) => (
            <option key={key} value={key}>
              {label}
            </option>
          ))}
        </select>
      </div>

      {/* Orders List */}
      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-[#DDA200]" />
        </div>
      ) : orders.length === 0 ? (
        <div className="bg-white rounded-2xl border-2 border-stone-200 p-12 text-center">
          <Package className="w-16 h-16 text-stone-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-stone-800">
            No orders yet
          </h3>
          <p className="text-stone-600 mt-2">
            Start shopping to see your orders here
          </p>
          <Link
            href="/home/shop/products"
            className="inline-flex items-center gap-2 mt-6 px-6 py-3 
              bg-[#DDA200] text-white font-semibold rounded-xl 
              hover:bg-[#b38600] transition-colors"
          >
            Browse Products
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => {
            const statusInfo = statusConfig[order.status as ORDER_STATUS];
            const StatusIcon = statusInfo.icon;

            return (
              <Link
                key={order.id}
                href={`/account/orders/${order.id}`}
                className="block bg-white rounded-xl border-2 border-stone-200 p-4 
                  hover:border-[#DDA200]/50 hover:shadow-md transition-all group"
              >
                <div className="flex items-center gap-4">
                  {/* Order Image */}
                  <div className="w-16 h-16 rounded-lg bg-stone-100 overflow-hidden flex-shrink-0">
                    {order.firstItemImage ? (
                      <Image
                        src={order.firstItemImage}
                        alt="Order"
                        width={64}
                        height={64}
                        className="object-cover w-full h-full"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Package className="w-6 h-6 text-stone-400" />
                      </div>
                    )}
                  </div>

                  {/* Order Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-stone-800">
                        #{order.orderNumber}
                      </h3>
                      <span
                        className={`flex items-center gap-1 text-xs px-2 py-1 rounded-full ${statusInfo.color}`}
                      >
                        <StatusIcon className="w-3 h-3" />
                        {statusInfo.label}
                      </span>
                    </div>
                    <p className="text-sm text-stone-600">
                      {order.itemCount}{" "}
                      {order.itemCount === 1 ? "item" : "items"} •{" "}
                      {formatDate(order.createdAt.toISOString())}
                    </p>
                  </div>

                  {/* Price & Arrow */}
                  <div className="text-right">
                    <p className="font-bold text-[#DDA200]">
                      {formatCurrency(order.total)}
                    </p>
                    <ChevronRight
                      className="w-5 h-5 text-stone-400 ml-auto mt-1 
                        group-hover:text-[#DDA200] group-hover:translate-x-1 transition-all"
                    />
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center gap-2">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="px-4 py-2 border-2 border-stone-200 rounded-lg 
              disabled:opacity-50 hover:border-[#DDA200] transition-colors"
          >
            Previous
          </button>
          <span className="px-4 py-2 text-stone-600">
            Page {page} of {totalPages}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="px-4 py-2 border-2 border-stone-200 rounded-lg 
              disabled:opacity-50 hover:border-[#DDA200] transition-colors"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
