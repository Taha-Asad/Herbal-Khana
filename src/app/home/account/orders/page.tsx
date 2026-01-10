// app/account/orders/page.tsx
"use client";

import React, { useState, useEffect, useCallback } from "react";
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
  CreditCard,
  Search,
  Filter,
  Calendar,
  ShoppingBag,
  ArrowRight,
  Eye,
} from "lucide-react";
import { ORDER_STATUS } from "@prisma/client";
import { formatCurrency } from "@/utils/OrderRelated";
import {
  getUserOrders,
  getOrderStats,
} from "@/app/action/order-tracking.actions";
import { OrderListItem, OrderStats } from "@/types/order";

// Status configuration
const statusConfig: Record<
  ORDER_STATUS,
  { label: string; color: string; bgColor: string; icon: React.ElementType }
> = {
  PENDING: {
    label: "Pending",
    color: "text-amber-700",
    bgColor: "bg-amber-100",
    icon: Clock,
  },
  PAID: {
    label: "Paid",
    color: "text-blue-700",
    bgColor: "bg-blue-100",
    icon: CreditCard,
  },
  PROCESSING: {
    label: "Processing",
    color: "text-purple-700",
    bgColor: "bg-purple-100",
    icon: RefreshCw,
  },
  SHIPPED: {
    label: "Shipped",
    color: "text-cyan-700",
    bgColor: "bg-cyan-100",
    icon: Truck,
  },
  DELIVERED: {
    label: "Delivered",
    color: "text-green-700",
    bgColor: "bg-green-100",
    icon: CheckCircle,
  },
  CANCELLED: {
    label: "Cancelled",
    color: "text-red-700",
    bgColor: "bg-red-100",
    icon: XCircle,
  },
  REFUNDED: {
    label: "Refunded",
    color: "text-gray-700",
    bgColor: "bg-gray-100",
    icon: RefreshCw,
  },
};

// Format date helper
function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-PK", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

// Format relative time
function formatRelativeTime(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffInDays = Math.floor(
    (now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24)
  );

  if (diffInDays === 0) return "Today";
  if (diffInDays === 1) return "Yesterday";
  if (diffInDays < 7) return `${diffInDays} days ago`;
  if (diffInDays < 30) return `${Math.floor(diffInDays / 7)} weeks ago`;
  return formatDate(dateString);
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<OrderListItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [statusFilter, setStatusFilter] = useState<ORDER_STATUS | "">("");
  const [stats, setStats] = useState<OrderStats>({
    total: 0,
    pending: 0,
    processing: 0,
    shipped: 0,
    delivered: 0,
    cancelled: 0,
  });

  const fetchData = useCallback(async () => {
    setIsLoading(true);

    try {
      const [ordersResult, statsResult] = await Promise.all([
        getUserOrders(page, 10, statusFilter || undefined),
        getOrderStats(),
      ]);

      if (ordersResult.success && ordersResult.data) {
        setOrders(ordersResult.data.items);
        setTotalPages(ordersResult.data.totalPages);
        setTotalCount(ordersResult.data.totalCount);
      }

      if (statsResult.success && statsResult.data) {
        setStats(statsResult.data);
      }
    } catch (error) {
      console.error("Error fetching orders:", error);
    } finally {
      setIsLoading(false);
    }
  }, [page, statusFilter]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Stats cards data
  const statsCards = [
    {
      label: "Total Orders",
      value: stats.total,
      icon: ShoppingBag,
      color: "text-stone-700",
      bgColor: "bg-white",
      borderColor: "border-stone-200",
    },
    {
      label: "Pending",
      value: stats.pending,
      icon: Clock,
      color: "text-amber-700",
      bgColor: "bg-amber-50",
      borderColor: "border-amber-200",
    },
    {
      label: "Processing",
      value: stats.processing,
      icon: RefreshCw,
      color: "text-blue-700",
      bgColor: "bg-blue-50",
      borderColor: "border-blue-200",
    },
    {
      label: "Delivered",
      value: stats.delivered,
      icon: CheckCircle,
      color: "text-green-700",
      bgColor: "bg-green-50",
      borderColor: "border-green-200",
    },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-stone-800">
            My Orders
          </h1>
          <p className="text-stone-600 mt-1">
            Track and manage your order history
          </p>
        </div>
        <Link
          href="/home/order-tracking"
          className="inline-flex items-center gap-2 px-4 py-2 text-[#DDA200] 
            border-2 border-[#DDA200] rounded-xl hover:bg-[#DDA200] hover:text-white 
            transition-colors font-medium"
        >
          <Search className="w-4 h-4" />
          Track Order
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statsCards.map((stat) => (
          <div
            key={stat.label}
            className={`${stat.bgColor} rounded-xl border-2 ${stat.borderColor} p-4 
              transition-all hover:shadow-md`}
          >
            <div className="flex items-center gap-3">
              <div
                className={`p-2 rounded-lg ${
                  stat.bgColor === "bg-white" ? "bg-stone-100" : "bg-white/50"
                }`}
              >
                <stat.icon className={`w-5 h-5 ${stat.color}`} />
              </div>
              <div>
                <div className={`text-2xl font-bold ${stat.color}`}>
                  {stat.value}
                </div>
                <div className="text-sm text-stone-600">{stat.label}</div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Filter Bar */}
      <div className="flex flex-wrap items-center gap-4">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-stone-500" />
          <span className="text-sm text-stone-600">Filter by:</span>
        </div>
        <select
          value={statusFilter}
          onChange={(e) => {
            setStatusFilter(e.target.value as ORDER_STATUS | "");
            setPage(1);
          }}
          className="px-4 py-2 border-2 border-stone-200 rounded-xl bg-white
            focus:border-[#DDA200] focus:outline-none text-stone-700 font-medium
            cursor-pointer hover:border-stone-300 transition-colors"
        >
          <option value="">All Orders ({stats.total})</option>
          <option value="PENDING">Pending ({stats.pending})</option>
          <option value="PAID">Paid</option>
          <option value="PROCESSING">Processing ({stats.processing})</option>
          <option value="SHIPPED">Shipped ({stats.shipped})</option>
          <option value="DELIVERED">Delivered ({stats.delivered})</option>
          <option value="CANCELLED">Cancelled ({stats.cancelled})</option>
        </select>

        {statusFilter && (
          <button
            onClick={() => {
              setStatusFilter("");
              setPage(1);
            }}
            className="text-sm text-[#DDA200] hover:text-[#b38600] font-medium"
          >
            Clear filter
          </button>
        )}

        <div className="ml-auto text-sm text-stone-500">
          {totalCount} {totalCount === 1 ? "order" : "orders"} found
        </div>
      </div>

      {/* Orders List */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-16">
          <Loader2 className="w-10 h-10 animate-spin text-[#DDA200] mb-4" />
          <p className="text-stone-600">Loading your orders...</p>
        </div>
      ) : orders.length === 0 ? (
        <div className="bg-white rounded-2xl border-2 border-stone-200 p-12 text-center">
          <div className="w-20 h-20 mx-auto mb-6 bg-stone-100 rounded-full flex items-center justify-center">
            <Package className="w-10 h-10 text-stone-400" />
          </div>
          <h3 className="text-xl font-bold text-stone-800 mb-2">
            {statusFilter ? "No orders found" : "No orders yet"}
          </h3>
          <p className="text-stone-600 mb-6 max-w-md mx-auto">
            {statusFilter
              ? `You don't have any ${statusConfig[
                  statusFilter as ORDER_STATUS
                ]?.label.toLowerCase()} orders.`
              : "When you place your first order, it will appear here."}
          </p>
          {!statusFilter && (
            <Link
              href="/home/shop/products"
              className="inline-flex items-center gap-2 px-6 py-3 
                bg-gradient-to-r from-[#DDA200] to-[#b38600] text-white 
                font-semibold rounded-xl hover:opacity-90 transition-opacity
                shadow-lg shadow-[#DDA200]/30"
            >
              Start Shopping
              <ArrowRight className="w-4 h-4" />
            </Link>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => {
            const statusInfo = statusConfig[order.status as ORDER_STATUS];
            const StatusIcon = statusInfo.icon;

            return (
              <Link
                key={order.id}
                href={`/home/account/orders/${order.id}`}
                className="block bg-white rounded-xl border-2 border-stone-200 
                  hover:border-[#DDA200]/50 hover:shadow-lg transition-all 
                  group overflow-hidden"
              >
                <div className="p-4 md:p-6">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                    {/* Order Image */}
                    <div className="flex-shrink-0">
                      <div className="w-16 h-16 md:w-20 md:h-20 rounded-xl bg-stone-100 overflow-hidden">
                        {order.firstItemImage ? (
                          <Image
                            src={order.firstItemImage}
                            alt={order.firstItemName || "Order item"}
                            width={80}
                            height={80}
                            className="object-cover w-full h-full"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Package className="w-8 h-8 text-stone-400" />
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Order Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-2">
                        <h3 className="font-bold text-stone-800 text-lg">
                          #{order.orderNumber}
                        </h3>
                        <span
                          className={`inline-flex items-center gap-1.5 text-xs 
                            px-2.5 py-1 rounded-full font-medium ${statusInfo.bgColor} ${statusInfo.color}`}
                        >
                          <StatusIcon className="w-3.5 h-3.5" />
                          {statusInfo.label}
                        </span>
                      </div>

                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-stone-600">
                        <span className="flex items-center gap-1">
                          <ShoppingBag className="w-4 h-4" />
                          {order.itemCount}{" "}
                          {order.itemCount === 1 ? "item" : "items"}
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          {formatRelativeTime(order.createdAt)}
                        </span>
                      </div>

                      {order.firstItemName && (
                        <p className="text-sm text-stone-500 mt-1 truncate">
                          {order.firstItemName}
                          {order.itemCount > 1 &&
                            ` and ${order.itemCount - 1} more`}
                        </p>
                      )}
                    </div>

                    {/* Price & Action */}
                    <div className="flex items-center justify-between sm:flex-col sm:items-end gap-2">
                      <div className="text-right">
                        <p className="text-xl font-bold text-[#DDA200]">
                          {formatCurrency(order.total)}
                        </p>
                        <p className="text-xs text-stone-500">
                          {formatDate(order.createdAt)}
                        </p>
                      </div>
                      <div
                        className="flex items-center gap-1 text-sm text-stone-400 
                        group-hover:text-[#DDA200] transition-colors"
                      >
                        <Eye className="w-4 h-4" />
                        <span className="hidden sm:inline">View Details</span>
                        <ChevronRight
                          className="w-4 h-4 group-hover:translate-x-1 
                          transition-transform"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Progress bar for active orders */}
                {["PENDING", "PAID", "PROCESSING", "SHIPPED"].includes(
                  order.status
                ) && (
                  <div className="h-1 bg-stone-100">
                    <div
                      className="h-full bg-gradient-to-r from-[#DDA200] to-[#b38600] transition-all duration-500"
                      style={{
                        width:
                          order.status === "PENDING"
                            ? "20%"
                            : order.status === "PAID"
                            ? "40%"
                            : order.status === "PROCESSING"
                            ? "60%"
                            : "80%",
                      }}
                    />
                  </div>
                )}
              </Link>
            );
          })}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 pt-4">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="px-4 py-2 border-2 border-stone-200 rounded-xl font-medium
              disabled:opacity-50 disabled:cursor-not-allowed
              hover:border-[#DDA200] hover:text-[#DDA200] transition-colors"
          >
            Previous
          </button>

          <div className="flex items-center gap-1">
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              let pageNum;
              if (totalPages <= 5) {
                pageNum = i + 1;
              } else if (page <= 3) {
                pageNum = i + 1;
              } else if (page >= totalPages - 2) {
                pageNum = totalPages - 4 + i;
              } else {
                pageNum = page - 2 + i;
              }

              return (
                <button
                  key={pageNum}
                  onClick={() => setPage(pageNum)}
                  className={`w-10 h-10 rounded-xl font-medium transition-colors ${
                    page === pageNum
                      ? "bg-[#DDA200] text-white"
                      : "border-2 border-stone-200 hover:border-[#DDA200] text-stone-600"
                  }`}
                >
                  {pageNum}
                </button>
              );
            })}
          </div>

          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="px-4 py-2 border-2 border-stone-200 rounded-xl font-medium
              disabled:opacity-50 disabled:cursor-not-allowed
              hover:border-[#DDA200] hover:text-[#DDA200] transition-colors"
          >
            Next
          </button>
        </div>
      )}

      {/* Quick Actions */}
      <div className="bg-gradient-to-r from-[#FFF9E6] to-[#F7E4B2] rounded-2xl p-6 border border-[#f3e4b7]">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h3 className="font-bold text-stone-800 mb-1">Need Help?</h3>
            <p className="text-stone-600 text-sm">
              Track your order or contact our support team
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/home/order-tracking"
              className="inline-flex items-center gap-2 px-4 py-2 bg-white 
                text-stone-700 rounded-xl hover:bg-stone-50 transition-colors 
                font-medium border border-stone-200"
            >
              <Search className="w-4 h-4" />
              Track Order
            </Link>
            <Link
              href="/home/contact"
              className="inline-flex items-center gap-2 px-4 py-2 bg-[#DDA200] 
                text-white rounded-xl hover:bg-[#b38600] transition-colors font-medium"
            >
              Contact Support
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
