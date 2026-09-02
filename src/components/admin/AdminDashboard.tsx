// app/admin/AdminDashboard.tsx
"use client";

import React, { useState, useTransition } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  DollarSign,
  ShoppingCart,
  Package,
  Users,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  Clock,
  ArrowRight,
  RefreshCw,
  BarChart3,
  Calendar,
} from "lucide-react";

import type {
  DashboardStats,
  RecentOrderSummary,
  TopProductSummary,
} from "@/types/admin";
import { ORDER_STATUS } from "@prisma/client";
import {
  getDashboardStats,
  getRecentOrders,
  getTopProducts,
} from "@/app/action/admin/dashboard.actions";

// ============================================================================
// TYPES
// ============================================================================

interface AdminDashboardProps {
  initialStats: DashboardStats | null | undefined;
  initialOrders: RecentOrderSummary[];
  initialProducts: TopProductSummary[];
}

// ============================================================================
// CONSTANTS
// ============================================================================

// Status badge colors
const statusStyles: Record<ORDER_STATUS, string> = {
  PENDING: "bg-amber-100 text-amber-700",
  PAID: "bg-blue-100 text-blue-700",
  PROCESSING: "bg-purple-100 text-purple-700",
  SHIPPED: "bg-cyan-100 text-cyan-700",
  DELIVERED: "bg-green-100 text-green-700",
  CANCELLED: "bg-red-100 text-red-700",
  REFUNDED: "bg-gray-100 text-gray-700",
};

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

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

function formatRelativeTime(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return formatDate(dateString);
}

// ============================================================================
// SUB-COMPONENTS
// ============================================================================

// Stat Card Component - Clean approach with conditional rendering
interface StatCardProps {
  title: string;
  value: string;
  change?: number;
  subtitle: string;
  icon: React.ElementType;
  gradient: string;
  shadowColor: string;
  alert?: boolean;
  href?: string;
}

function StatCard({
  title,
  value,
  change,
  subtitle,
  icon: Icon,
  gradient,
  shadowColor,
  alert,
  href,
}: StatCardProps) {
  const cardContent = (
    <>
      <div className="flex items-start justify-between mb-4">
        <div
          className={`p-3 rounded-xl bg-gradient-to-br ${gradient} 
            shadow-lg ${shadowColor}`}
        >
          <Icon className="w-6 h-6 text-white" />
        </div>
        {change !== undefined && (
          <div
            className={`flex items-center gap-1 text-sm font-medium px-2.5 py-1 rounded-lg
              ${
                change >= 0
                  ? "text-green-700 bg-green-50"
                  : "text-red-700 bg-red-50"
              }`}
          >
            {change >= 0 ? (
              <TrendingUp className="w-3.5 h-3.5" />
            ) : (
              <TrendingDown className="w-3.5 h-3.5" />
            )}
            {Math.abs(change).toFixed(1)}%
          </div>
        )}
        {alert && (
          <div className="p-1.5 bg-amber-50 rounded-lg">
            <AlertTriangle className="w-4 h-4 text-amber-500" />
          </div>
        )}
      </div>
      <h3 className="text-2xl font-bold text-gray-900">{value}</h3>
      <div className="flex items-center justify-between mt-1">
        <p className="text-sm text-gray-500">{title}</p>
        <p className="text-xs text-gray-400">{subtitle}</p>
      </div>
    </>
  );

  const className = `bg-white rounded-2xl p-6 border border-gray-100 shadow-sm 
    hover:shadow-md transition-all duration-200 block ${
      href ? "cursor-pointer hover:border-gray-200" : ""
    }`;

  if (href) {
    return (
      <Link href={href} className={className}>
        {cardContent}
      </Link>
    );
  }

  return <div className={className}>{cardContent}</div>;
}
// Alert Card Component
interface AlertCardProps {
  href: string;
  icon: React.ElementType;
  title: string;
  subtitle: string;
  variant: "warning" | "danger";
}

function AlertCard({
  href,
  icon: Icon,
  title,
  subtitle,
  variant,
}: AlertCardProps) {
  const colors = {
    warning: {
      bg: "bg-amber-50",
      border: "border-amber-200",
      hover: "hover:bg-amber-100",
      iconBg: "bg-amber-100",
      iconColor: "text-amber-600",
      titleColor: "text-amber-800",
      subtitleColor: "text-amber-600",
    },
    danger: {
      bg: "bg-red-50",
      border: "border-red-200",
      hover: "hover:bg-red-100",
      iconBg: "bg-red-100",
      iconColor: "text-red-600",
      titleColor: "text-red-800",
      subtitleColor: "text-red-600",
    },
  };

  const c = colors[variant];

  return (
    <Link
      href={href}
      className={`flex items-center gap-4 p-4 ${c.bg} border ${c.border} 
        rounded-xl ${c.hover} transition-colors group`}
    >
      <div className={`p-3 ${c.iconBg} rounded-xl`}>
        <Icon className={`w-5 h-5 ${c.iconColor}`} />
      </div>
      <div className="flex-1">
        <p className={`font-semibold ${c.titleColor}`}>{title}</p>
        <p className={`text-sm ${c.subtitleColor}`}>{subtitle}</p>
      </div>
      <ArrowRight
        className={`w-5 h-5 ${c.iconColor} group-hover:translate-x-1 transition-transform`}
      />
    </Link>
  );
}

// Empty State Component
interface EmptyStateProps {
  icon: React.ElementType;
  message: string;
}

function EmptyState({ icon: Icon, message }: EmptyStateProps) {
  return (
    <div className="p-8 text-center text-gray-500">
      <Icon className="w-12 h-12 mx-auto mb-3 text-gray-300" />
      <p>{message}</p>
    </div>
  );
}

// Order Row Component
function OrderRow({ order }: { order: RecentOrderSummary }) {
  return (
    <Link
      href={`/admin/orders/${order.id}`}
      className="flex items-center gap-4 p-4 hover:bg-gray-50 transition-colors"
    >
      {/* Customer Avatar */}
      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-100 to-orange-100 flex items-center justify-center overflow-hidden flex-shrink-0">
        {order.customer.avatar ? (
          <Image
            src={order.customer.avatar}
            alt={order.customer.name}
            width={40}
            height={40}
            className="w-full h-full object-cover"
          />
        ) : (
          <span className="text-sm font-semibold text-amber-700">
            {order.customer.name.charAt(0).toUpperCase()}
          </span>
        )}
      </div>

      {/* Order Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-semibold text-gray-900">
            #{order.orderNumber}
          </span>
          <span
            className={`text-xs px-2 py-0.5 rounded-full font-medium ${
              statusStyles[order.status]
            }`}
          >
            {order.status}
          </span>
        </div>
        <p className="text-sm text-gray-500 truncate">
          {order.customer.name} • {order.itemCount}{" "}
          {order.itemCount === 1 ? "item" : "items"}
        </p>
      </div>

      {/* Amount & Time */}
      <div className="text-right flex-shrink-0">
        <p className="font-semibold text-gray-900">
          {formatCurrency(order.total)}
        </p>
        <p className="text-xs text-gray-500">
          {formatRelativeTime(order.createdAt)}
        </p>
      </div>
    </Link>
  );
}

// Product Row Component
function ProductRow({
  product,
  rank,
}: {
  product: TopProductSummary;
  rank: number;
}) {
  const isLowStock = product.stock < 10;

  return (
    <Link
      href={`/admin/products/${product.id}`}
      className="flex items-center gap-3 p-4 hover:bg-gray-50 transition-colors"
    >
      {/* Rank */}
      <span
        className={`w-6 h-6 flex items-center justify-center text-sm font-bold rounded-full
          ${rank <= 3 ? "bg-amber-100 text-amber-700" : "text-gray-400"}`}
      >
        {rank}
      </span>

      {/* Product Image */}
      <div className="w-12 h-12 rounded-lg bg-gray-100 overflow-hidden flex-shrink-0">
        {product.image ? (
          <Image
            src={product.image}
            alt={product.name}
            width={48}
            height={48}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Package className="w-5 h-5 text-gray-400" />
          </div>
        )}
      </div>

      {/* Product Info */}
      <div className="flex-1 min-w-0">
        <p className="font-medium text-gray-900 truncate">{product.name}</p>
        <div className="flex items-center gap-2 text-sm">
          <span className="text-gray-500">{product.sold} sold</span>
          <span className="text-gray-300">•</span>
          <span
            className={
              isLowStock ? "text-red-500 font-medium" : "text-gray-500"
            }
          >
            Stock: {product.stock}
          </span>
        </div>
      </div>

      {/* Price */}
      <div className="text-right flex-shrink-0">
        <p className="font-semibold text-amber-600">
          {formatCurrency(product.price)}
        </p>
      </div>
    </Link>
  );
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function AdminDashboard({
  initialStats,
  initialOrders,
  initialProducts,
}: AdminDashboardProps) {
  const [stats, setStats] = useState<DashboardStats | null | undefined>(
    initialStats
  );
  const [recentOrders, setRecentOrders] =
    useState<RecentOrderSummary[]>(initialOrders);
  const [topProducts, setTopProducts] =
    useState<TopProductSummary[]>(initialProducts);
  const [isPending, startTransition] = useTransition();

  // Refresh data handler
  const handleRefresh = () => {
    startTransition(async () => {
      try {
        const [statsRes, ordersRes, productsRes] = await Promise.all([
          getDashboardStats(),
          getRecentOrders(5),
          getTopProducts(5),
        ]);

        if (statsRes.success && statsRes.data) {
          setStats(statsRes.data);
        }
        if (ordersRes.success && ordersRes.data) {
          setRecentOrders(ordersRes.data);
        }
        if (productsRes.success && productsRes.data) {
          setTopProducts(productsRes.data);
        }
      } catch (error) {
        console.error("Failed to refresh dashboard:", error);
      }
    });
  };

  // Stat cards configuration
  const statCards: StatCardProps[] = [
    {
      title: "Revenue",
      value: formatCurrency(stats?.revenue.total || 0),
      change: stats?.revenue.change,
      subtitle: stats?.revenue.period || "This month",
      icon: DollarSign,
      gradient: "from-emerald-500 to-teal-600",
      shadowColor: "shadow-emerald-500/20",
    },
    {
      title: "Orders",
      value: stats?.orders.total.toString() || "0",
      change: stats?.orders.change,
      subtitle: `${stats?.orders.pending || 0} pending`,
      icon: ShoppingCart,
      gradient: "from-blue-500 to-indigo-600",
      shadowColor: "shadow-blue-500/20",
      href: "/admin/orders",
    },
    {
      title: "Products",
      value: stats?.products.total.toString() || "0",
      subtitle: `${stats?.products.lowStock || 0} low stock`,
      icon: Package,
      gradient: "from-purple-500 to-violet-600",
      shadowColor: "shadow-purple-500/20",
      alert: (stats?.products.lowStock || 0) > 0,
      href: "/admin/products",
    },
    {
      title: "Customers",
      value: stats?.customers.total.toString() || "0",
      subtitle: `+${stats?.customers.newThisMonth || 0} this month`,
      icon: Users,
      gradient: "from-orange-500 to-amber-600",
      shadowColor: "shadow-orange-500/20",
      href: "/admin/customers",
    },
  ];

  const pendingOrders = stats?.orders.pending || 0;
  const lowStockProducts = stats?.products.lowStock || 0;
  const hasAlerts = pendingOrders > 0 || lowStockProducts > 0;

  return (
    <div className="space-y-6">
      {/* ================================================================== */}
      {/* HEADER */}
      {/* ================================================================== */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-500 mt-0.5">
            Welcome back! Here&apos;s your store overview.
          </p>
        </div>
        <div className="flex items-center gap-3">
          {/* Date indicator */}
          <div className="hidden sm:flex items-center gap-2 text-sm text-gray-500 bg-gray-100 px-3 py-2 rounded-lg">
            <Calendar className="w-4 h-4" />
            {new Date().toLocaleDateString("en-PK", {
              weekday: "long",
              month: "short",
              day: "numeric",
            })}
          </div>

          {/* Refresh Button */}
          <button
            onClick={handleRefresh}
            disabled={isPending}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 
              bg-white border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors
              disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <RefreshCw
              className={`w-4 h-4 ${isPending ? "animate-spin" : ""}`}
            />
            <span className="hidden sm:inline">Refresh</span>
          </button>
        </div>
      </div>

      {/* ================================================================== */}
      {/* STATS GRID */}
      {/* ================================================================== */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
        {statCards.map((stat) => (
          <StatCard key={stat.title} {...stat} />
        ))}
      </div>

      {/* ================================================================== */}
      {/* ALERTS SECTION */}
      {/* ================================================================== */}
      {hasAlerts && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {pendingOrders > 0 && (
            <AlertCard
              href="/admin/orders?status=PENDING"
              icon={Clock}
              title={`${pendingOrders} Pending Order${
                pendingOrders > 1 ? "s" : ""
              }`}
              subtitle="Need your attention"
              variant="warning"
            />
          )}
          {lowStockProducts > 0 && (
            <AlertCard
              href="/admin/products?filter=lowstock"
              icon={AlertTriangle}
              title={`${lowStockProducts} Low Stock Item${
                lowStockProducts > 1 ? "s" : ""
              }`}
              subtitle="Restock recommended"
              variant="danger"
            />
          )}
        </div>
      )}

      {/* ================================================================== */}
      {/* MAIN CONTENT GRID */}
      {/* ================================================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Orders */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="flex items-center justify-between p-5 border-b border-gray-100">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-50 rounded-lg">
                <ShoppingCart className="w-5 h-5 text-blue-600" />
              </div>
              <h2 className="text-lg font-semibold text-gray-900">
                Recent Orders
              </h2>
            </div>
            <Link
              href="/admin/orders"
              className="text-sm font-medium text-amber-600 hover:text-amber-700 
                flex items-center gap-1 transition-colors"
            >
              View All
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {recentOrders.length === 0 ? (
            <EmptyState icon={ShoppingCart} message="No orders yet" />
          ) : (
            <div className="divide-y divide-gray-100">
              {recentOrders.map((order) => (
                <OrderRow key={order.id} order={order} />
              ))}
            </div>
          )}

          {/* Quick Stats Footer */}
          {recentOrders.length > 0 && (
            <div className="p-4 bg-gray-50 border-t border-gray-100">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500">
                  Showing {recentOrders.length} most recent orders
                </span>
                <Link
                  href="/admin/orders"
                  className="text-amber-600 hover:text-amber-700 font-medium"
                >
                  Manage orders →
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* Top Products */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="flex items-center justify-between p-5 border-b border-gray-100">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-50 rounded-lg">
                <BarChart3 className="w-5 h-5 text-purple-600" />
              </div>
              <h2 className="text-lg font-semibold text-gray-900">
                Top Products
              </h2>
            </div>
            <Link
              href="/admin/products"
              className="text-sm font-medium text-amber-600 hover:text-amber-700 transition-colors"
            >
              View All
            </Link>
          </div>

          {topProducts.length === 0 ? (
            <EmptyState icon={Package} message="No products yet" />
          ) : (
            <div className="divide-y divide-gray-100">
              {topProducts.map((product, idx) => (
                <ProductRow key={product.id} product={product} rank={idx + 1} />
              ))}
            </div>
          )}

          {/* Quick Actions Footer */}
          {topProducts.length > 0 && (
            <div className="p-4 bg-gray-50 border-t border-gray-100">
              <Link
                href="/admin/products/new"
                className="flex items-center justify-center gap-2 w-full py-2 text-sm font-medium
                  text-amber-600 hover:text-amber-700 hover:bg-amber-50 rounded-lg transition-colors"
              >
                <Package className="w-4 h-4" />
                Add New Product
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* ================================================================== */}
      {/* QUICK ACTIONS */}
      {/* ================================================================== */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Link
          href="/admin/orders"
          className="flex flex-col items-center gap-2 p-4 bg-white border border-gray-200 
            rounded-xl hover:border-amber-300 hover:shadow-md transition-all group"
        >
          <div className="p-3 bg-blue-50 rounded-xl group-hover:bg-blue-100 transition-colors">
            <ShoppingCart className="w-6 h-6 text-blue-600" />
          </div>
          <span className="text-sm font-medium text-gray-700">Orders</span>
        </Link>

        <Link
          href="/admin/products"
          className="flex flex-col items-center gap-2 p-4 bg-white border border-gray-200 
            rounded-xl hover:border-amber-300 hover:shadow-md transition-all group"
        >
          <div className="p-3 bg-purple-50 rounded-xl group-hover:bg-purple-100 transition-colors">
            <Package className="w-6 h-6 text-purple-600" />
          </div>
          <span className="text-sm font-medium text-gray-700">Products</span>
        </Link>

        <Link
          href="/admin/customers"
          className="flex flex-col items-center gap-2 p-4 bg-white border border-gray-200 
            rounded-xl hover:border-amber-300 hover:shadow-md transition-all group"
        >
          <div className="p-3 bg-orange-50 rounded-xl group-hover:bg-orange-100 transition-colors">
            <Users className="w-6 h-6 text-orange-600" />
          </div>
          <span className="text-sm font-medium text-gray-700">Customers</span>
        </Link>

        <Link
          href="/admin/analytics"
          className="flex flex-col items-center gap-2 p-4 bg-white border border-gray-200 
            rounded-xl hover:border-amber-300 hover:shadow-md transition-all group"
        >
          <div className="p-3 bg-emerald-50 rounded-xl group-hover:bg-emerald-100 transition-colors">
            <BarChart3 className="w-6 h-6 text-emerald-600" />
          </div>
          <span className="text-sm font-medium text-gray-700">Analytics</span>
        </Link>
      </div>
    </div>
  );
}
