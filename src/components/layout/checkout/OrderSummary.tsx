// components/checkout/OrderSummary.tsx
"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Package,
  Tag,
  X,
  Loader2,
  Truck,
  CreditCard,
  ShoppingBag,
  ChevronDown,
  ChevronUp,
  Shield,
  Clock,
} from "lucide-react";
import Image from "next/image";

interface OrderSummaryItem {
  variantId: string;
  productId: string;
  name: string;
  variantName: string;
  sku: string;
  image?: string;
  price: number;
  quantity: number;
  subtotal: number;
}

interface OrderSummarySummary {
  subtotal: number;
  shippingCost: number;
  tax: number;
  discount: number;
  promoDiscount: number;
  total: number;
  appliedPromoCode?: string;
}

interface ShippingMethod {
  id: string;
  name: string;
  price: number;
  estimatedDays: string;
}

type PaymentMethod = "cod" | "jazzcash" | "easypaisa";

interface OrderSummaryProps {
  items: OrderSummaryItem[];
  summary: OrderSummarySummary;
  shippingMethod?: ShippingMethod | null;
  paymentMethod?: PaymentMethod | null;
  promoInput?: string;
  onPromoInputChange?: (value: string) => void;
  onApplyPromo?: () => void;
  onRemovePromo?: () => void;
  isApplyingPromo?: boolean;
  promoMessage?: { type: "success" | "error"; text: string } | null;
  showPromoInput?: boolean;
  showEditLink?: boolean;
  isCompact?: boolean;
}

export default function OrderSummary({
  items,
  summary,
  shippingMethod,
  paymentMethod,
  promoInput = "",
  onPromoInputChange,
  onApplyPromo,
  onRemovePromo,
  isApplyingPromo = false,
  promoMessage,
  showPromoInput = true,
  showEditLink = true,
  isCompact = false,
}: OrderSummaryProps) {
  const [isItemsExpanded, setIsItemsExpanded] = useState(!isCompact);
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

  const getPaymentMethodName = (method: PaymentMethod | null | undefined) => {
    if (!method) return null;
    const names: Record<PaymentMethod, string> = {
      cod: "Cash on Delivery",
      jazzcash: "JazzCash",
      easypaisa: "EasyPaisa",
    };
    return names[method];
  };

  return (
    <div className="bg-white rounded-2xl border-2 border-stone-200 overflow-hidden shadow-sm">
      {/* Header */}
      <div className="p-5 border-b border-stone-200 bg-gradient-to-r from-stone-50 to-white">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-stone-800 flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-[#DDA200]" />
            Order Summary
          </h2>
          {showEditLink && (
            <Link
              href="/cart"
              className="text-sm text-[#DDA200] hover:text-[#b38600] font-medium"
            >
              Edit Cart
            </Link>
          )}
        </div>
        <p className="text-sm text-stone-500 mt-1">
          {itemCount} item{itemCount !== 1 ? "s" : ""} in your order
        </p>
      </div>

      {/* Items List */}
      <div className="border-b border-stone-200">
        {/* Toggle Header for Compact Mode */}
        {isCompact && (
          <button
            onClick={() => setIsItemsExpanded(!isItemsExpanded)}
            className="w-full p-4 flex items-center justify-between hover:bg-stone-50 transition-colors"
          >
            <span className="font-medium text-stone-700">
              {isItemsExpanded ? "Hide" : "Show"} Items
            </span>
            {isItemsExpanded ? (
              <ChevronUp className="w-5 h-5 text-stone-400" />
            ) : (
              <ChevronDown className="w-5 h-5 text-stone-400" />
            )}
          </button>
        )}

        {/* Items */}
        {isItemsExpanded && (
          <div className="p-4 space-y-4 max-h-64 overflow-y-auto">
            {items.map((item) => (
              <div key={item.variantId} className="flex gap-3">
                {item.image ? (
                  <Image
                    src={item.image}
                    alt={item.name}
                    className="w-16 h-16 object-cover rounded-lg flex-shrink-0 border border-stone-200"
                  />
                ) : (
                  <div className="w-16 h-16 bg-stone-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Package className="w-6 h-6 text-stone-400" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium text-stone-800 text-sm truncate">
                    {item.name}
                  </h4>
                  <p className="text-xs text-stone-500 truncate">
                    {item.variantName}
                  </p>
                  <div className="flex items-center justify-between mt-1">
                    <span className="text-xs text-stone-500">
                      Qty: {item.quantity}
                    </span>
                    <span className="font-semibold text-stone-800 text-sm">
                      PKR {item.subtotal.toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Promo Code Section */}
      {showPromoInput && (
        <div className="p-4 border-b border-stone-200">
          {summary.appliedPromoCode ? (
            <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-xl">
              <div className="flex items-center gap-2">
                <Tag className="w-4 h-4 text-green-600" />
                <span className="font-medium text-green-700">
                  {summary.appliedPromoCode}
                </span>
                <span className="text-xs text-green-600">
                  -PKR {summary.promoDiscount.toLocaleString()}
                </span>
              </div>
              {onRemovePromo && (
                <button
                  onClick={onRemovePromo}
                  className="p-1 text-green-600 hover:text-green-800 hover:bg-green-100 rounded transition-colors"
                  aria-label="Remove promo code"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          ) : (
            <div>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={promoInput}
                  onChange={(e) =>
                    onPromoInputChange?.(e.target.value.toUpperCase())
                  }
                  placeholder="Enter promo code"
                  className="flex-1 px-4 py-2.5 border-2 border-stone-200 rounded-xl focus:border-[#DDA200] focus:outline-none text-sm transition-colors"
                  disabled={isApplyingPromo}
                />
                <button
                  onClick={onApplyPromo}
                  disabled={isApplyingPromo || !promoInput?.trim()}
                  className="px-5 py-2.5 bg-[#DDA200] text-white font-semibold rounded-xl hover:bg-[#b38600] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {isApplyingPromo ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    "Apply"
                  )}
                </button>
              </div>
              {promoMessage && (
                <p
                  className={`mt-2 text-sm ${
                    promoMessage.type === "success"
                      ? "text-green-600"
                      : "text-red-500"
                  }`}
                >
                  {promoMessage.text}
                </p>
              )}
            </div>
          )}
        </div>
      )}

      {/* Price Breakdown */}
      <div className="p-4 space-y-3">
        {/* Subtotal */}
        <div className="flex justify-between text-stone-600">
          <span>Subtotal</span>
          <span>PKR {summary.subtotal.toLocaleString()}</span>
        </div>

        {/* Shipping */}
        <div className="flex justify-between text-stone-600">
          <span className="flex items-center gap-2">
            <Truck className="w-4 h-4" />
            Shipping
            {shippingMethod && (
              <span className="text-xs text-stone-400">
                ({shippingMethod.name})
              </span>
            )}
          </span>
          <span>
            {summary.shippingCost === 0 ? (
              <span className="text-green-600 font-medium">FREE</span>
            ) : (
              `PKR ${summary.shippingCost.toLocaleString()}`
            )}
          </span>
        </div>

        {/* Estimated Delivery */}
        {shippingMethod && (
          <div className="flex justify-between text-stone-500 text-sm">
            <span className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              Est. Delivery
            </span>
            <span>{shippingMethod.estimatedDays} days</span>
          </div>
        )}

        {/* COD Fee */}
        {paymentMethod === "cod" && (
          <div className="flex justify-between text-stone-600">
            <span className="flex items-center gap-2">
              <CreditCard className="w-4 h-4" />
              COD Fee
            </span>
            <span>PKR 50</span>
          </div>
        )}

        {/* Promo Discount */}
        {summary.promoDiscount > 0 && (
          <div className="flex justify-between text-green-600">
            <span className="flex items-center gap-2">
              <Tag className="w-4 h-4" />
              Promo Discount
            </span>
            <span>-PKR {summary.promoDiscount.toLocaleString()}</span>
          </div>
        )}

        {/* Tax */}
        {summary.tax > 0 && (
          <div className="flex justify-between text-stone-600">
            <span>Tax</span>
            <span>PKR {summary.tax.toLocaleString()}</span>
          </div>
        )}

        {/* Total */}
        <div className="pt-4 border-t border-stone-200">
          <div className="flex justify-between items-center">
            <span className="text-lg font-bold text-stone-800">Total</span>
            <div className="text-right">
              <span className="text-2xl font-bold text-[#DDA200]">
                PKR {summary.total.toLocaleString()}
              </span>
              {paymentMethod && (
                <p className="text-xs text-stone-500 mt-1">
                  via {getPaymentMethodName(paymentMethod)}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Security Badge */}
      <div className="p-4 bg-stone-50 border-t border-stone-200">
        <div className="flex items-center gap-3 text-stone-600">
          <Shield className="w-5 h-5 text-green-600" />
          <div className="text-sm">
            <p className="font-medium text-stone-700">Secure Checkout</p>
            <p className="text-xs text-stone-500">
              Your information is protected
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
