// app/account/orders/[orderId]/page.tsx
"use client";

import React, { useState, useEffect, useCallback } from "react";
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
  Calendar,
  Receipt,
  ExternalLink,
  Mail,
  ChevronRight,
} from "lucide-react";
import { ORDER_STATUS, PAYMENT_STATUS } from "@prisma/client";
import toast from "react-hot-toast";
import {
  cancelOrder,
  getOrderById,
  reorder,
} from "@/app/action/order-tracking.actions";
import useCopyToClipboard from "@/hooks/useCopyToClipboard";
import { OrderDetails } from "@/types/order";

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

const paymentStatusConfig: Record<
  PAYMENT_STATUS,
  { label: string; color: string; bgColor: string }
> = {
  PENDING: {
    label: "Pending",
    color: "text-amber-700",
    bgColor: "bg-amber-100",
  },
  SUCCESS: {
    label: "Paid",
    color: "text-green-700",
    bgColor: "bg-green-100",
  },
  FAILED: {
    label: "Failed",
    color: "text-red-700",
    bgColor: "bg-red-100",
  },
  REFUNDED: {
    label: "Refunded",
    color: "text-gray-700",
    bgColor: "bg-gray-100",
  },
};

const statusSteps: ORDER_STATUS[] = [
  "PENDING",
  "PAID",
  "PROCESSING",
  "SHIPPED",
  "DELIVERED",
];

// Format helpers
function formatCurrency(amount: number): string {
  return `PKR ${amount.toLocaleString("en-PK")}`;
}

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-PK", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function formatDateTime(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-PK", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function getPaymentMethodLabel(method: string): string {
  const methods: Record<string, string> = {
    cod: "Cash on Delivery",
    jazzcash: "JazzCash",
    easypaisa: "EasyPaisa",
    bank_transfer: "Bank Transfer",
  };
  return methods[method] || method;
}

export default function OrderDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const orderId = params.orderId as string;
  const { copy } = useCopyToClipboard();

  const [order, setOrder] = useState<OrderDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelReason, setCancelReason] = useState("");
  const [isCancelling, setIsCancelling] = useState(false);
  const [isReordering, setIsReordering] = useState(false);

  const fetchOrder = useCallback(async () => {
    if (!orderId) return;

    setIsLoading(true);
    const result = await getOrderById(orderId);

    if (result.success && result.data) {
      setOrder(result.data);
    } else {
      toast.error(result.error || "Failed to load order");
    }

    setIsLoading(false);
  }, [orderId]);

  useEffect(() => {
    fetchOrder();
  }, [fetchOrder]);

  const handleCancelOrder = async () => {
    if (!order) return;

    setIsCancelling(true);
    const result = await cancelOrder(order.orderId);

    if (result.success) {
      toast.success("Order cancelled successfully");
      setShowCancelModal(false);
      fetchOrder(); // Refresh order data
    } else {
      toast.error(result.error || "Failed to cancel order");
    }

    setIsCancelling(false);
  };

  const handleReorder = async () => {
    if (!order) return;

    setIsReordering(true);
    const result = await reorder(order.orderId);

    if (result.success) {
      toast.success("Items added to cart");
      router.push("/cart");
    } else {
      toast.error(result.error || "Failed to add items to cart");
    }

    setIsReordering(false);
  };

  const copyOrderNumber = () => {
    if (order) {
      copy(order.orderNumber);
    }
  };

  const copyTrackingNumber = () => {
    if (order?.trackingNumber) {
      copy(order.trackingNumber);
    }
  };

  const getStatusStep = (status: ORDER_STATUS): number => {
    const index = statusSteps.indexOf(status);
    return index === -1 ? 0 : index;
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <Loader2 className="w-10 h-10 animate-spin text-[#DDA200] mb-4" />
        <p className="text-stone-600">Loading order details...</p>
      </div>
    );
  }

  // Not found state
  if (!order) {
    return (
      <div className="text-center py-16">
        <div className="w-20 h-20 mx-auto mb-6 bg-stone-100 rounded-full flex items-center justify-center">
          <AlertCircle className="w-10 h-10 text-stone-400" />
        </div>
        <h3 className="text-xl font-bold text-stone-800 mb-2">
          Order not found
        </h3>
        <p className="text-stone-600 mb-6">
          We could not find the order you&apos;re looking for.
        </p>
        <Link
          href="/account/orders"
          className="inline-flex items-center gap-2 px-6 py-3 bg-[#DDA200] 
            text-white font-semibold rounded-xl hover:bg-[#b38600] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Orders
        </Link>
      </div>
    );
  }

  const statusInfo = statusConfig[order.status];
  const paymentInfo = paymentStatusConfig[order.paymentStatus];
  const StatusIcon = statusInfo.icon;
  const currentStep = getStatusStep(order.status);
  const canCancel = ["PENDING", "PAID"].includes(order.status);
  const isActiveOrder = !["CANCELLED", "REFUNDED", "DELIVERED"].includes(
    order.status
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link
            href="/home/account/orders"
            className="p-2 rounded-xl hover:bg-stone-100 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-stone-600" />
          </Link>
          <div>
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-xl md:text-2xl font-bold text-stone-800">
                Order #{order.orderNumber}
              </h1>
              <button
                onClick={copyOrderNumber}
                className="p-1.5 hover:bg-stone-100 rounded-lg transition-colors"
                title="Copy order number"
              >
                <Copy className="w-4 h-4 text-stone-400 hover:text-stone-600" />
              </button>
            </div>
            <p className="text-stone-600 mt-1 flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              Placed on {formatDateTime(order.orderDate)}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <span
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-full 
              ${statusInfo.bgColor} ${statusInfo.color} font-semibold`}
          >
            <StatusIcon className="w-4 h-4" />
            {statusInfo.label}
          </span>
        </div>
      </div>

      {/* Progress Tracker (for active orders) */}
      {isActiveOrder && (
        <div className="bg-white rounded-2xl border-2 border-stone-200 p-6 overflow-x-auto">
          <div className="min-w-[500px]">
            <div className="relative">
              {/* Progress Line */}
              <div className="absolute top-5 left-0 right-0 h-1 bg-stone-200 rounded-full">
                <div
                  className="h-full bg-gradient-to-r from-[#DDA200] to-[#b38600] 
                    rounded-full transition-all duration-500"
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
                  const stepConfig = statusConfig[step];
                  const StepIcon = stepConfig.icon;

                  return (
                    <div key={step} className="flex flex-col items-center">
                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center z-10
                          transition-all duration-300
                          ${
                            isCompleted
                              ? "bg-gradient-to-r from-[#DDA200] to-[#b38600] text-white shadow-lg shadow-[#DDA200]/30"
                              : "bg-stone-200 text-stone-400"
                          }
                          ${
                            isCurrent
                              ? "ring-4 ring-[#DDA200]/30 scale-110"
                              : ""
                          }`}
                      >
                        {isCompleted ? (
                          <StepIcon className="w-5 h-5" />
                        ) : (
                          <span className="text-sm font-bold">{index + 1}</span>
                        )}
                      </div>
                      <span
                        className={`mt-3 text-xs font-medium text-center
                          ${isCompleted ? "text-[#DDA200]" : "text-stone-400"}`}
                      >
                        {stepConfig.label}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Cancelled/Refunded Banner */}
      {["CANCELLED", "REFUNDED"].includes(order.status) && (
        <div
          className={`rounded-2xl p-4 flex items-center gap-3
            ${
              order.status === "CANCELLED"
                ? "bg-red-50 border-2 border-red-200"
                : "bg-gray-50 border-2 border-gray-200"
            }`}
        >
          <XCircle
            className={`w-6 h-6 ${
              order.status === "CANCELLED" ? "text-red-500" : "text-gray-500"
            }`}
          />
          <div>
            <p
              className={`font-semibold ${
                order.status === "CANCELLED" ? "text-red-700" : "text-gray-700"
              }`}
            >
              This order has been {order.status.toLowerCase()}
            </p>
            <p className="text-sm text-stone-600">
              If you have any questions, please contact our support team.
            </p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Order Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Order Items */}
          <div className="bg-white rounded-2xl border-2 border-stone-200 overflow-hidden">
            <div className="p-4 border-b border-stone-200 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Package className="w-5 h-5 text-[#DDA200]" />
                <h2 className="font-bold text-stone-800">
                  Order Items ({order.items.length})
                </h2>
              </div>
            </div>
            <div className="divide-y divide-stone-100">
              {order.items.map((item) => (
                <div
                  key={item.id}
                  className="p-4 flex gap-4 hover:bg-stone-50 transition-colors"
                >
                  <div className="w-20 h-20 rounded-xl bg-stone-100 overflow-hidden flex-shrink-0">
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
                    <h3 className="font-semibold text-stone-800 mb-1">
                      {item.name}
                    </h3>
                    <p className="text-sm text-stone-500 mb-2">
                      SKU: {item.sku}
                    </p>
                    <div className="flex items-center gap-2 text-sm">
                      <span className="text-stone-600">
                        {formatCurrency(item.price)}
                      </span>
                      <span className="text-stone-400">×</span>
                      <span className="text-stone-600">{item.quantity}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-[#DDA200] text-lg">
                      {formatCurrency(
                        item.subtotal || item.price * item.quantity
                      )}
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
              {order.trackingHistory.length > 0 ? (
                <div className="space-y-1">
                  {order.trackingHistory
                    .slice()
                    .reverse()
                    .map((event, index, arr) => {
                      const eventConfig = statusConfig[event.status];
                      const EventIcon = eventConfig.icon;
                      const isLast = index === arr.length - 1;

                      return (
                        <div key={event.id} className="flex gap-4">
                          <div className="relative flex flex-col items-center">
                            <div
                              className={`w-10 h-10 rounded-full flex items-center justify-center 
                                ${eventConfig.bgColor} z-10`}
                            >
                              <EventIcon
                                className={`w-5 h-5 ${eventConfig.color}`}
                              />
                            </div>
                            {!isLast && (
                              <div className="w-0.5 h-full bg-stone-200 absolute top-10" />
                            )}
                          </div>
                          <div className="flex-1 pb-6">
                            <p className="font-semibold text-stone-800">
                              {eventConfig.label}
                            </p>
                            {event.message && (
                              <p className="text-sm text-stone-600 mt-0.5">
                                {event.message}
                              </p>
                            )}
                            <p className="text-xs text-stone-400 mt-1">
                              {formatDateTime(event.timestamp)}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                </div>
              ) : (
                <p className="text-stone-500 text-center py-4">
                  No timeline events yet
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Right Column - Summary & Info */}
        <div className="space-y-6">
          {/* Order Summary */}
          <div className="bg-white rounded-2xl border-2 border-stone-200 overflow-hidden">
            <div className="p-4 border-b border-stone-200 flex items-center gap-2">
              <Receipt className="w-5 h-5 text-[#DDA200]" />
              <h2 className="font-bold text-stone-800">Order Summary</h2>
            </div>
            <div className="p-4 space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-stone-600">Subtotal</span>
                <span className="font-medium text-stone-800">
                  {formatCurrency(order.subtotal)}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-stone-600">Shipping</span>
                <span className="font-medium text-stone-800">
                  {order.shippingCost === 0 ? (
                    <span className="text-green-600">FREE</span>
                  ) : (
                    formatCurrency(order.shippingCost)
                  )}
                </span>
              </div>
              {order.tax > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-stone-600">Tax</span>
                  <span className="font-medium text-stone-800">
                    {formatCurrency(order.tax)}
                  </span>
                </div>
              )}
              {order.discount > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-green-600">Discount</span>
                  <span className="font-medium text-green-600">
                    -{formatCurrency(order.discount)}
                  </span>
                </div>
              )}
              {order.promoDiscount > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-green-600">Promo Discount</span>
                  <span className="font-medium text-green-600">
                    -{formatCurrency(order.promoDiscount)}
                  </span>
                </div>
              )}
              <div className="border-t-2 border-stone-200 pt-3 flex justify-between">
                <span className="font-bold text-stone-800">Total</span>
                <span className="font-bold text-[#DDA200] text-xl">
                  {formatCurrency(order.total)}
                </span>
              </div>
            </div>
          </div>

          {/* Shipping Address */}
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
                {order.shippingAddress.street}
              </p>
              <p className="text-stone-600 text-sm">
                {order.shippingAddress.city}
                {order.shippingAddress.state &&
                  `, ${order.shippingAddress.state}`}{" "}
                {order.shippingAddress.postalCode}
              </p>
              <p className="text-stone-600 text-sm">
                {order.shippingAddress.country}
              </p>
              <div className="flex items-center gap-2 mt-3 text-stone-600 text-sm">
                <Phone className="w-4 h-4" />
                {order.shippingAddress.phone}
              </div>
            </div>
          </div>

          {/* Payment Info */}
          <div className="bg-white rounded-2xl border-2 border-stone-200 overflow-hidden">
            <div className="p-4 border-b border-stone-200 flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-[#DDA200]" />
              <h2 className="font-bold text-stone-800">Payment</h2>
            </div>
            <div className="p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-stone-600">Method</span>
                <span className="font-medium text-stone-800">
                  {getPaymentMethodLabel(order.paymentMethod)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-stone-600">Status</span>
                <span
                  className={`px-2 py-1 rounded-full text-xs font-medium 
                    ${paymentInfo.bgColor} ${paymentInfo.color}`}
                >
                  {paymentInfo.label}
                </span>
              </div>
            </div>
          </div>

          {/* Tracking Info */}
          {order.trackingNumber && (
            <div className="bg-white rounded-2xl border-2 border-stone-200 overflow-hidden">
              <div className="p-4 border-b border-stone-200 flex items-center gap-2">
                <Truck className="w-5 h-5 text-[#DDA200]" />
                <h2 className="font-bold text-stone-800">Tracking</h2>
              </div>
              <div className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <span className="font-mono text-stone-800">
                    {order.trackingNumber}
                  </span>
                  <button
                    onClick={copyTrackingNumber}
                    className="p-1.5 hover:bg-stone-100 rounded-lg transition-colors"
                  >
                    <Copy className="w-4 h-4 text-stone-400" />
                  </button>
                </div>
                {order.estimatedDelivery && (
                  <p className="text-sm text-stone-600 flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    Est. delivery: {formatDate(order.estimatedDelivery)}
                  </p>
                )}
                {order.shippingMethod && (
                  <p className="text-sm text-stone-500 mt-1">
                    via {order.shippingMethod.name}
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
                bg-gradient-to-r from-[#DDA200] to-[#b38600] text-white 
                font-semibold rounded-xl hover:opacity-90 transition-all 
                disabled:opacity-50 shadow-lg shadow-[#DDA200]/30"
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
              href="/home/contact"
              className="w-full flex items-center justify-center gap-2 px-4 py-3 
                border-2 border-stone-200 text-stone-600 font-semibold rounded-xl 
                hover:bg-stone-50 transition-colors"
            >
              <HelpCircle className="w-5 h-5" />
              Need Help?
            </Link>
          </div>

          {/* Quick Links */}
          <div className="bg-gradient-to-r from-[#FFF9E6] to-[#F7E4B2] rounded-2xl p-4 border border-[#f3e4b7]">
            <h3 className="font-semibold text-stone-800 mb-3">Quick Links</h3>
            <div className="space-y-2">
              <Link
                href="/home/order-tracking"
                className="flex items-center justify-between text-sm text-stone-600 
                  hover:text-[#DDA200] transition-colors"
              >
                <span className="flex items-center gap-2">
                  <Truck className="w-4 h-4" />
                  Track Another Order
                </span>
                <ChevronRight className="w-4 h-4" />
              </Link>
              <Link
                href="/home/shipping-and-returns"
                className="flex items-center justify-between text-sm text-stone-600 
                  hover:text-[#DDA200] transition-colors"
              >
                <span className="flex items-center gap-2">
                  <FileText className="w-4 h-4" />
                  Shipping & Returns Policy
                </span>
                <ChevronRight className="w-4 h-4" />
              </Link>
              <Link
                href="/home/faqs"
                className="flex items-center justify-between text-sm text-stone-600 
                  hover:text-[#DDA200] transition-colors"
              >
                <span className="flex items-center gap-2">
                  <HelpCircle className="w-4 h-4" />
                  FAQs
                </span>
                <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Cancel Modal */}
      {showCancelModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div
            className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-red-100 rounded-full">
                <XCircle className="w-6 h-6 text-red-600" />
              </div>
              <h3 className="text-xl font-bold text-stone-800">Cancel Order</h3>
            </div>

            <p className="text-stone-600 mb-4">
              Are you sure you want to cancel order{" "}
              <strong>#{order.orderNumber}</strong>? This action cannot be
              undone.
            </p>

            <div className="mb-6">
              <label className="block text-sm font-medium text-stone-700 mb-2">
                Reason for cancellation (optional)
              </label>
              <textarea
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                rows={3}
                className="w-full px-4 py-3 border-2 border-stone-200 rounded-xl 
                  focus:border-[#DDA200] focus:outline-none resize-none 
                  transition-colors"
                placeholder="Tell us why you're cancelling..."
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowCancelModal(false)}
                disabled={isCancelling}
                className="flex-1 px-4 py-3 border-2 border-stone-200 text-stone-600 
                  font-semibold rounded-xl hover:bg-stone-50 transition-colors
                  disabled:opacity-50"
              >
                Keep Order
              </button>
              <button
                onClick={handleCancelOrder}
                disabled={isCancelling}
                className="flex-1 px-4 py-3 bg-red-600 text-white font-semibold 
                  rounded-xl hover:bg-red-700 transition-colors disabled:opacity-50
                  flex items-center justify-center gap-2"
              >
                {isCancelling ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Cancelling...
                  </>
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
