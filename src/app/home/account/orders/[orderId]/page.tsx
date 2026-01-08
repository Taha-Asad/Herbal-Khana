// app/account/orders/[orderId]/page.tsx
"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
  ArrowLeft,
  Package,
  Truck,
  MapPin,
  CreditCard,
  Clock,
  CheckCircle,
  XCircle,
  RefreshCw,
  Copy,
  Loader2,
  AlertCircle,
  ShoppingCart,
  FileText,
  Phone,
  HelpCircle,
} from "lucide-react";
import type { Order } from "@/types/account";
import toast from "react-hot-toast";
import { cancelOrder, getOrder, reorder } from "@/app/action/orders.action";
import { ORDER_STATUS } from "@/generated/prisma/enums";

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
    icon: CheckCircle,
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

const statusSteps = ["PENDING", "PAID", "PROCESSING", "SHIPPED", "DELIVERED"];

export default function OrderDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const orderId = params.orderId as string;

  const [order, setOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelReason, setCancelReason] = useState("");
  const [isCancelling, setIsCancelling] = useState(false);
  const [isReordering, setIsReordering] = useState(false);

  useEffect(() => {
    if (!orderId) return;

    let cancelled = false;

    const load = async () => {
      setIsLoading(true);

      const result = await getOrder(orderId);

      if (cancelled) return;

      if (result.success && result.data) {
        setOrder(result.data);
      } else {
        toast.error(result.error || "Failed to load order");
      }

      setIsLoading(false);
    };

    load();

    return () => {
      cancelled = true;
    };
  }, [orderId]);

  const handleCancelOrder = async () => {
    setIsCancelling(true);
    const result = await cancelOrder(orderId, cancelReason);
    if (result.success) {
      toast.success("Order cancelled successfully");
      setShowCancelModal(false);
    } else {
      toast.error(result.error || "Failed to cancel order");
    }
    setIsCancelling(false);
  };

  const handleReorder = async () => {
    setIsReordering(true);
    const result = await reorder(orderId);
    if (result.success) {
      toast.success("Items added to cart");
      router.push("/cart");
    } else {
      toast.error(result.error || "Failed to add items to cart");
    }
    setIsReordering(false);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard");
  };

  const formatDate = (date: Date | null) => {
    if (!date) return "—";
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatCurrency = (amount: number) => {
    return `PKR ${amount.toLocaleString()}`;
  };

  const getStatusStep = (status: ORDER_STATUS) => {
    const index = statusSteps.indexOf(status);
    return index === -1 ? 0 : index;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-[#DDA200]" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="text-center py-12">
        <AlertCircle className="w-16 h-16 text-stone-300 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-stone-800">
          Order not found
        </h3>
        <Link
          href="/account/orders"
          className="inline-flex items-center gap-2 mt-4 text-[#DDA200] hover:underline"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Orders
        </Link>
      </div>
    );
  }

  const statusInfo = statusConfig[order.status as ORDER_STATUS] || {
    label: "Unknown",
    color: "text-gray-700",
    bgColor: "bg-gray-100",
    icon: HelpCircle,
  };

  const StatusIcon = statusInfo.icon;
  const currentStep = getStatusStep(order.status);
  const canCancel = ["PENDING", "PAID"].includes(order.status);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            href="/account/orders"
            className="p-2 rounded-lg hover:bg-stone-100 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-stone-600" />
          </Link>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-stone-800">
                Order #{order.orderNumber}
              </h1>
              <button
                onClick={() => copyToClipboard(order.orderNumber)}
                className="p-1 hover:bg-stone-100 rounded transition-colors"
                title="Copy order number"
              >
                <Copy className="w-4 h-4 text-stone-400" />
              </button>
            </div>
            <p className="text-stone-600 mt-1">
              Placed on {formatDate(order.createdAt)}
            </p>
          </div>
        </div>
        <span
          className={`flex items-center gap-2 px-4 py-2 rounded-full ${statusInfo.bgColor} ${statusInfo.color}`}
        >
          <StatusIcon className="w-4 h-4" />
          <span className="font-semibold">{statusInfo.label}</span>
        </span>
      </div>

      {/* Progress Tracker (for non-cancelled orders) */}
      {!["CANCELLED", "REFUNDED"].includes(order.status) && (
        <div className="bg-white rounded-2xl border-2 border-stone-200 p-6">
          <div className="relative">
            {/* Progress Line */}
            <div className="absolute top-5 left-0 right-0 h-1 bg-stone-200">
              <div
                className="h-full bg-[#DDA200] transition-all duration-500"
                style={{
                  width: `${(currentStep / (statusSteps.length - 1)) * 100}%`,
                }}
              />
            </div>

            {/* Steps */}
            <div className="relative flex justify-between">
              {statusSteps.map((step, index) => {
                const isCompleted = index <= currentStep;
                const isCurrent = index === currentStep;
                const stepConfig = statusConfig[step as ORDER_STATUS];

                return (
                  <div key={step} className="flex flex-col items-center">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center z-10
                        ${
                          isCompleted
                            ? "bg-[#DDA200] text-white"
                            : "bg-stone-200 text-stone-400"
                        }
                        ${isCurrent ? "ring-4 ring-[#DDA200]/30" : ""}`}
                    >
                      {isCompleted ? (
                        <CheckCircle className="w-5 h-5" />
                      ) : (
                        <span className="text-sm font-semibold">
                          {index + 1}
                        </span>
                      )}
                    </div>
                    <span
                      className={`mt-2 text-xs font-medium ${
                        isCompleted ? "text-[#DDA200]" : "text-stone-400"
                      }`}
                    >
                      {stepConfig.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Order Items */}
          <div className="bg-white rounded-2xl border-2 border-stone-200 overflow-hidden">
            <div className="p-4 border-b border-stone-200 flex items-center gap-2">
              <Package className="w-5 h-5 text-[#DDA200]" />
              <h2 className="font-bold text-stone-800">
                Order Items ({order.items.length})
              </h2>
            </div>
            <div className="divide-y divide-stone-100">
              {order.items.map((item) => (
                <div key={item.id} className="p-4 flex gap-4">
                  <div className="w-20 h-20 rounded-lg bg-stone-100 overflow-hidden flex-shrink-0">
                    {item.image ? (
                      <Image
                        src={item.image}
                        alt={item.name}
                        width={80}
                        height={80}
                        className="object-cover w-full h-full"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Package className="w-8 h-8 text-stone-300" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-stone-800 truncate">
                      {item.name}
                    </h3>
                    <p className="text-sm text-stone-500">SKU: {item.sku}</p>
                    <p className="text-sm text-stone-600 mt-1">
                      {formatCurrency(item.price)} × {item.quantity}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-[#DDA200]">
                      {formatCurrency(item.subtotal)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Order Timeline */}
          <div className="bg-white rounded-2xl border-2 border-stone-200 overflow-hidden">
            <div className="p-4 border-b border-stone-200 flex items-center gap-2">
              <Clock className="w-5 h-5 text-[#DDA200]" />
              <h2 className="font-bold text-stone-800">Order Timeline</h2>
            </div>
            <div className="p-4">
              <div className="space-y-4">
                {order.timeline.map((event, index) => {
                  const eventConfig = statusConfig[event.status as ORDER_STATUS];
                  const EventIcon = eventConfig.icon;

                  return (
                    <div key={event.id} className="flex gap-4">
                      <div className="relative">
                        <div
                          className={`w-8 h-8 rounded-full flex items-center justify-center ${eventConfig.bgColor}`}
                        >
                          <EventIcon
                            className={`w-4 h-4 ${eventConfig.color}`}
                          />
                        </div>
                        {index < order.timeline.length - 1 && (
                          <div className="absolute top-8 left-1/2 -translate-x-1/2 w-0.5 h-8 bg-stone-200" />
                        )}
                      </div>
                      <div className="flex-1 pb-4">
                        <p className="font-semibold text-stone-800">
                          {eventConfig.label}
                        </p>
                        {event.message && (
                          <p className="text-sm text-stone-600">
                            {event.message}
                          </p>
                        )}
                        <p className="text-xs text-stone-400 mt-1">
                          {formatDate(event.createdAt)}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Order Summary */}
          <div className="bg-white rounded-2xl border-2 border-stone-200 overflow-hidden">
            <div className="p-4 border-b border-stone-200">
              <h2 className="font-bold text-stone-800">Order Summary</h2>
            </div>
            <div className="p-4 space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-stone-600">Subtotal</span>
                <span className="font-medium">
                  {formatCurrency(order.subtotal)}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-stone-600">Shipping</span>
                <span className="font-medium">
                  {order.shippingCost === 0
                    ? "FREE"
                    : formatCurrency(order.shippingCost)}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-stone-600">Tax</span>
                <span className="font-medium">{formatCurrency(order.tax)}</span>
              </div>
              {order.discount > 0 && (
                <div className="flex justify-between text-sm text-green-600">
                  <span>Discount</span>
                  <span>-{formatCurrency(order.discount)}</span>
                </div>
              )}
              {order.promoDiscount > 0 && (
                <div className="flex justify-between text-sm text-green-600">
                  <span>Promo Discount</span>
                  <span>-{formatCurrency(order.promoDiscount)}</span>
                </div>
              )}
              <div className="border-t border-stone-200 pt-3 flex justify-between">
                <span className="font-bold text-stone-800">Total</span>
                <span className="font-bold text-[#DDA200] text-xl">
                  {formatCurrency(order.total)}
                </span>
              </div>
            </div>
          </div>

          {/* Shipping Address */}
          {order.shippingAddress && (
            <div className="bg-white rounded-2xl border-2 border-stone-200 overflow-hidden">
              <div className="p-4 border-b border-stone-200 flex items-center gap-2">
                <MapPin className="w-5 h-5 text-[#DDA200]" />
                <h2 className="font-bold text-stone-800">Shipping Address</h2>
              </div>
              <div className="p-4">
                <p className="font-semibold text-stone-800">
                  {order.shippingAddress.name}
                </p>
                <p className="text-stone-600 text-sm mt-1">
                  {order.shippingAddress.line1}
                  {order.shippingAddress.line2 && (
                    <>, {order.shippingAddress.line2}</>
                  )}
                </p>
                <p className="text-stone-600 text-sm">
                  {order.shippingAddress.city}
                  {order.shippingAddress.state &&
                    `, ${order.shippingAddress.state}`}{" "}
                  {order.shippingAddress.postal}
                </p>
                <p className="text-stone-600 text-sm">
                  {order.shippingAddress.country}
                </p>
                <p className="text-stone-600 text-sm mt-2 flex items-center gap-1">
                  <Phone className="w-4 h-4" />
                  {order.shippingAddress.phone}
                </p>
              </div>
            </div>
          )}

          {/* Payment Info */}
          <div className="bg-white rounded-2xl border-2 border-stone-200 overflow-hidden">
            <div className="p-4 border-b border-stone-200 flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-[#DDA200]" />
              <h2 className="font-bold text-stone-800">Payment</h2>
            </div>
            <div className="p-4">
              <p className="text-stone-800">{order.paymentMethod || "—"}</p>
              {order.paidAt && (
                <p className="text-sm text-stone-600 mt-1">
                  Paid on {formatDate(order.paidAt)}
                </p>
              )}
            </div>
          </div>

          {/* Tracking */}
          {order.trackingNumber && (
            <div className="bg-white rounded-2xl border-2 border-stone-200 overflow-hidden">
              <div className="p-4 border-b border-stone-200 flex items-center gap-2">
                <Truck className="w-5 h-5 text-[#DDA200]" />
                <h2 className="font-bold text-stone-800">Tracking</h2>
              </div>
              <div className="p-4">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-stone-800">
                    {order.trackingNumber}
                  </span>
                  <button
                    onClick={() => copyToClipboard(order.trackingNumber!)}
                    className="p-1 hover:bg-stone-100 rounded transition-colors"
                  >
                    <Copy className="w-4 h-4 text-stone-400" />
                  </button>
                </div>
                {order.estimatedDelivery && (
                  <p className="text-sm text-stone-600 mt-2">
                    Estimated delivery: {formatDate(order.estimatedDelivery)}
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="space-y-3">
            <button
              onClick={handleReorder}
              disabled={isReordering}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 
                bg-[#DDA200] text-white font-semibold rounded-xl 
                hover:bg-[#b38600] transition-colors disabled:opacity-50"
            >
              {isReordering ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  <ShoppingCart className="w-5 h-5" />
                  Order Again
                </>
              )}
            </button>

            {canCancel && (
              <button
                onClick={() => setShowCancelModal(true)}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 
                  border-2 border-red-200 text-red-600 font-semibold rounded-xl 
                  hover:bg-red-50 transition-colors"
              >
                <XCircle className="w-5 h-5" />
                Cancel Order
              </button>
            )}

            <Link
              href="/support"
              className="w-full flex items-center justify-center gap-2 px-4 py-3 
                border-2 border-stone-200 text-stone-600 font-semibold rounded-xl 
                hover:bg-stone-50 transition-colors"
            >
              <FileText className="w-5 h-5" />
              Need Help?
            </Link>
          </div>
        </div>
      </div>

      {/* Cancel Modal */}
      {showCancelModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md">
            <h3 className="text-xl font-bold text-stone-800 mb-2">
              Cancel Order
            </h3>
            <p className="text-stone-600 mb-4">
              Are you sure you want to cancel this order? This action cannot be
              undone.
            </p>
            <div className="mb-4">
              <label className="block text-sm font-medium text-stone-700 mb-2">
                Reason for cancellation (optional)
              </label>
              <textarea
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                rows={3}
                className="w-full px-4 py-3 border-2 border-stone-200 rounded-xl 
                  focus:border-[#DDA200] focus:outline-none resize-none"
                placeholder="Tell us why you're cancelling..."
              />
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setShowCancelModal(false)}
                className="flex-1 px-4 py-3 border-2 border-stone-200 text-stone-600 
                  font-semibold rounded-xl hover:bg-stone-50 transition-colors"
              >
                Keep Order
              </button>
              <button
                onClick={handleCancelOrder}
                disabled={isCancelling}
                className="flex-1 px-4 py-3 bg-red-600 text-white font-semibold 
                  rounded-xl hover:bg-red-700 transition-colors disabled:opacity-50"
              >
                {isCancelling ? (
                  <Loader2 className="w-5 h-5 animate-spin mx-auto" />
                ) : (
                  "Cancel Order"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
