// app/admin/orders/[id]/page.tsx
"use client";

import React, { useState, useEffect, useCallback, useTransition } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
  ArrowLeft,
  Loader2,
  AlertCircle,
  Package,
  Truck,
  MapPin,
  CreditCard,
  Clock,
  User,
  Phone,
  Mail,
  Copy,
  MessageSquare,
  Save,
} from "lucide-react";
import { getOrder, updateOrder } from "@/app/action/admin/orders.actions";
import { Order, UpdateOrderData } from "@/types/admin";
import { ORDER_STATUS } from "@prisma/client";
import {
  OrderStatusBadge,
  PaymentStatusBadge,
} from "@/components/admin/ui/StatusBadge";
import ConfirmModal from "@/components/admin/ui/ConfirmModal";
import toast from "react-hot-toast";

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-PK", {
    style: "currency",
    currency: "PKR",
    minimumFractionDigits: 0,
  }).format(amount);
}

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString("en-PK", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

const statusActions: { value: ORDER_STATUS; label: string; color: string }[] = [
  { value: "PENDING", label: "Pending", color: "bg-amber-500" },
  { value: "PAID", label: "Mark as Paid", color: "bg-blue-500" },
  { value: "PROCESSING", label: "Processing", color: "bg-purple-500" },
  { value: "SHIPPED", label: "Shipped", color: "bg-cyan-500" },
  { value: "DELIVERED", label: "Delivered", color: "bg-green-500" },
  { value: "CANCELLED", label: "Cancel", color: "bg-red-500" },
];

export default function OrderDetailPage() {
  const params = useParams();
  const orderId = params.id as string;

  const [order, setOrder] = useState<Order | null>(null);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [trackingNumber, setTrackingNumber] = useState("");
  const [adminNote, setAdminNote] = useState("");
  const [statusMessage, setStatusMessage] = useState("");

  const [showStatusModal, setShowStatusModal] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<ORDER_STATUS | null>(
    null
  );

  // Use useTransition for loading state
  const [isPending, startTransition] = useTransition();
  const [isInitialLoading, setIsInitialLoading] = useState(true);

  // ✅ Define loadOrder with useCallback BEFORE useEffect
  const loadOrder = useCallback(async () => {
    const result = await getOrder(orderId);
    if (result.success && result.data) {
      setOrder(result.data);
      setTrackingNumber(result.data.trackingNumber || "");
      setAdminNote(result.data.adminNote || "");
      setError(null);
    } else {
      setError(result.error || "Order not found");
    }
    setIsInitialLoading(false);
  }, [orderId]);

  // ✅ Now useEffect comes AFTER loadOrder is defined
  useEffect(() => {
    startTransition(() => {
      loadOrder();
    });
  }, [loadOrder]);

  // Combined loading state
  const loading = isInitialLoading || isPending;

  const handleStatusChange = async () => {
    if (!selectedStatus || !order) return;

    setUpdating(true);
    const updateData: UpdateOrderData = {
      status: selectedStatus,
      statusMessage: statusMessage || undefined,
    };

    const result = await updateOrder(orderId, updateData);
    if (result.success) {
      toast.success("Order status updated");
      startTransition(() => {
        loadOrder();
      });
    } else {
      toast.error(result.error || "Failed to update status");
    }
    setUpdating(false);
    setShowStatusModal(false);
    setSelectedStatus(null);
    setStatusMessage("");
  };

  const handleUpdateTracking = async () => {
    if (!order) return;

    setUpdating(true);
    const result = await updateOrder(orderId, { trackingNumber });
    if (result.success) {
      toast.success("Tracking number updated");
      startTransition(() => {
        loadOrder();
      });
    } else {
      toast.error(result.error || "Failed to update tracking");
    }
    setUpdating(false);
  };

  const handleUpdateNote = async () => {
    if (!order) return;

    setUpdating(true);
    const result = await updateOrder(orderId, { adminNote });
    if (result.success) {
      toast.success("Note saved");
      startTransition(() => {
        loadOrder();
      });
    } else {
      toast.error(result.error || "Failed to save note");
    }
    setUpdating(false);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard");
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-amber-500" />
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <AlertCircle className="w-12 h-12 text-red-500 mb-4" />
        <h2 className="text-xl font-semibold text-gray-900 mb-2">
          Order Not Found
        </h2>
        <p className="text-gray-500 mb-4">{error}</p>
        <Link
          href="/admin/orders"
          className="text-amber-600 hover:text-amber-700 font-medium"
        >
          Back to Orders
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* ... rest of the component remains the same ... */}
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link
            href="/admin/orders"
            className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </Link>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-gray-900">
                Order #{order.orderNumber}
              </h1>
              <button
                onClick={() => copyToClipboard(order.orderNumber)}
                className="p-1 hover:bg-gray-100 rounded transition-colors"
              >
                <Copy className="w-4 h-4 text-gray-400" />
              </button>
            </div>
            <p className="text-gray-500">
              Placed on {formatDate(order.createdAt)}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <OrderStatusBadge status={order.status} size="md" />
          <PaymentStatusBadge status={order.paymentStatus} size="md" />
        </div>
      </div>

      {/* Status Actions */}
      <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
        <h3 className="font-semibold text-gray-900 mb-3">Update Status</h3>
        <div className="flex flex-wrap gap-2">
          {statusActions.map((action) => (
            <button
              key={action.value}
              onClick={() => {
                setSelectedStatus(action.value);
                setShowStatusModal(true);
              }}
              disabled={order.status === action.value || updating}
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors
                ${
                  order.status === action.value
                    ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
            >
              {action.label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Order Items */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 flex items-center gap-2">
              <Package className="w-5 h-5 text-amber-500" />
              <h2 className="font-semibold text-gray-900">
                Order Items ({order.items.length})
              </h2>
            </div>
            <div className="divide-y divide-gray-100">
              {order.items.map((item) => (
                <div key={item.id} className="p-4 flex gap-4">
                  <div className="w-16 h-16 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                    {item.image ? (
                      <Image
                        src={item.image}
                        alt={item.name}
                        width={64}
                        height={64}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Package className="w-6 h-6 text-gray-400" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-gray-900">{item.name}</h4>
                    <p className="text-sm text-gray-500">SKU: {item.sku}</p>
                    <p className="text-sm text-gray-600 mt-1">
                      {formatCurrency(item.price)} × {item.quantity}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-gray-900">
                      {formatCurrency(item.subtotal)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Timeline */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 flex items-center gap-2">
              <Clock className="w-5 h-5 text-amber-500" />
              <h2 className="font-semibold text-gray-900">Order Timeline</h2>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {order.timeline.map((event, index) => (
                  <div key={event.id} className="flex gap-4">
                    <div className="relative">
                      <div className="w-3 h-3 bg-amber-500 rounded-full mt-1.5" />
                      {index < order.timeline.length - 1 && (
                        <div className="absolute top-4 left-1.5 w-0.5 h-full -ml-px bg-gray-200" />
                      )}
                    </div>
                    <div className="flex-1 pb-4">
                      <div className="flex items-center gap-2">
                        <OrderStatusBadge status={event.status} size="sm" />
                        <span className="text-xs text-gray-400">
                          {formatDate(event.createdAt)}
                        </span>
                      </div>
                      {event.message && (
                        <p className="text-sm text-gray-600 mt-1">
                          {event.message}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Admin Notes */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-amber-500" />
              <h2 className="font-semibold text-gray-900">Admin Notes</h2>
            </div>
            <div className="p-6">
              <textarea
                value={adminNote}
                onChange={(e) => setAdminNote(e.target.value)}
                rows={4}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl resize-none
                  focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                placeholder="Add internal notes about this order..."
              />
              <button
                onClick={handleUpdateNote}
                disabled={updating}
                className="mt-3 flex items-center gap-2 px-4 py-2 bg-amber-500 text-white 
                  font-medium rounded-lg hover:bg-amber-600 transition-colors disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                Save Note
              </button>
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Order Summary */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="font-semibold text-gray-900">Order Summary</h2>
            </div>
            <div className="p-6 space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Subtotal</span>
                <span className="font-medium">
                  {formatCurrency(order.subtotal)}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Shipping</span>
                <span className="font-medium">
                  {order.shippingCost === 0
                    ? "FREE"
                    : formatCurrency(order.shippingCost)}
                </span>
              </div>
              {order.discount > 0 && (
                <div className="flex justify-between text-sm text-green-600">
                  <span>Discount</span>
                  <span>-{formatCurrency(order.discount)}</span>
                </div>
              )}
              {order.promoDiscount > 0 && (
                <div className="flex justify-between text-sm text-green-600">
                  <span>Promo</span>
                  <span>-{formatCurrency(order.promoDiscount)}</span>
                </div>
              )}
              <div className="pt-3 border-t border-gray-200 flex justify-between">
                <span className="font-semibold text-gray-900">Total</span>
                <span className="font-bold text-amber-600 text-xl">
                  {formatCurrency(order.total)}
                </span>
              </div>
            </div>
          </div>

          {/* Customer Info */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 flex items-center gap-2">
              <User className="w-5 h-5 text-amber-500" />
              <h2 className="font-semibold text-gray-900">Customer</h2>
            </div>
            <div className="p-6">
              <p className="font-medium text-gray-900">{order.customer.name}</p>
              <div className="mt-2 space-y-1">
                <p className="text-sm text-gray-600 flex items-center gap-2">
                  <Mail className="w-4 h-4 text-gray-400" />
                  {order.customer.email}
                </p>
                {order.customer.phone && (
                  <p className="text-sm text-gray-600 flex items-center gap-2">
                    <Phone className="w-4 h-4 text-gray-400" />
                    {order.customer.phone}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Shipping Address */}
          {order.shippingAddress && (
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200 flex items-center gap-2">
                <MapPin className="w-5 h-5 text-amber-500" />
                <h2 className="font-semibold text-gray-900">
                  Shipping Address
                </h2>
              </div>
              <div className="p-6 text-sm text-gray-600">
                <p className="font-medium text-gray-900">
                  {order.shippingAddress.name}
                </p>
                <p className="mt-1">{order.shippingAddress.line1}</p>
                {order.shippingAddress.line2 && (
                  <p>{order.shippingAddress.line2}</p>
                )}
                <p>
                  {order.shippingAddress.city}
                  {order.shippingAddress.state &&
                    `, ${order.shippingAddress.state}`}{" "}
                  {order.shippingAddress.postal}
                </p>
                <p>{order.shippingAddress.country}</p>
                <p className="mt-2 flex items-center gap-2">
                  <Phone className="w-4 h-4 text-gray-400" />
                  {order.shippingAddress.phone}
                </p>
              </div>
            </div>
          )}

          {/* Tracking */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 flex items-center gap-2">
              <Truck className="w-5 h-5 text-amber-500" />
              <h2 className="font-semibold text-gray-900">Tracking</h2>
            </div>
            <div className="p-6">
              <input
                type="text"
                value={trackingNumber}
                onChange={(e) => setTrackingNumber(e.target.value)}
                placeholder="Enter tracking number"
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl
                  focus:ring-2 focus:ring-amber-500 focus:border-transparent"
              />
              <button
                onClick={handleUpdateTracking}
                disabled={updating}
                className="mt-3 w-full flex items-center justify-center gap-2 px-4 py-2 
                  bg-gray-100 text-gray-700 font-medium rounded-lg 
                  hover:bg-gray-200 transition-colors disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                Update Tracking
              </button>
            </div>
          </div>

          {/* Payment */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-amber-500" />
              <h2 className="font-semibold text-gray-900">Payment</h2>
            </div>
            <div className="p-6">
              <p className="text-gray-900 capitalize">
                {order.paymentMethod?.replace("_", " ") || "Not specified"}
              </p>
              {order.paidAt && (
                <p className="text-sm text-gray-500 mt-1">
                  Paid on {formatDate(order.paidAt)}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Status Change Modal */}
      <ConfirmModal
        isOpen={showStatusModal}
        onClose={() => {
          setShowStatusModal(false);
          setSelectedStatus(null);
          setStatusMessage("");
        }}
        onConfirm={handleStatusChange}
        title={`Update Status to ${selectedStatus}`}
        message="Add an optional message for this status change."
        confirmLabel="Update Status"
        variant={selectedStatus === "CANCELLED" ? "danger" : "info"}
        isLoading={updating}
      />
    </div>
  );
}
