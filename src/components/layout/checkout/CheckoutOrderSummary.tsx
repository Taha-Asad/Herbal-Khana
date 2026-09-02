// components/layout/checkout/CheckoutOrderSummary.tsx
"use client";

import React from "react";
import Image from "next/image";
import { Tag, X, Loader2, Package, Shield, Lock } from "lucide-react";
import {
  CheckoutItem,
  CheckoutSummary,
  ShippingMethodOption,
  PaymentMethod,
} from "@/types/checkout";

interface CheckoutOrderSummaryProps {
  items: CheckoutItem[];
  summary: CheckoutSummary;
  promoInput: string;
  onPromoInputChange: (value: string) => void;
  onApplyPromo: () => void;
  onRemovePromo: () => void;
  isApplyingPromo: boolean;
  promoMessage: { type: "success" | "error"; text: string } | null;
  shippingMethod: ShippingMethodOption | null;
  paymentMethod: PaymentMethod | null;
}

export default function CheckoutOrderSummary({
  items,
  summary,
  promoInput,
  onPromoInputChange,
  onApplyPromo,
  onRemovePromo,
  isApplyingPromo,
  promoMessage,
  shippingMethod,
  paymentMethod,
}: CheckoutOrderSummaryProps) {
  const formatCurrency = (amount: number) => {
    return `PKR ${amount.toLocaleString()}`;
  };

  const COD_FEE = 50;
  const shippingCostWithoutCOD =
    paymentMethod === "cod"
      ? summary.shippingCost - COD_FEE
      : summary.shippingCost;

  return (
    <div className="bg-white rounded-2xl border-2 border-stone-200 overflow-hidden shadow-sm">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#DDA200] to-[#b38600] p-4">
        <h3 className="text-lg font-bold text-white flex items-center gap-2">
          <Package className="w-5 h-5" />
          Order Summary
        </h3>
      </div>

      <div className="p-6 space-y-6">
        {/* Items */}
        <div className="space-y-3 max-h-64 overflow-y-auto">
          {items.map((item) => (
            <div key={item.variantId} className="flex gap-3">
              {item.image ? (
                <Image
                  src={item.image}
                  alt={item.name}
                  width={56}
                  height={56}
                  className="w-14 h-14 object-cover rounded-lg"
                />
              ) : (
                <div className="w-14 h-14 bg-stone-200 rounded-lg flex items-center justify-center">
                  <Package className="w-6 h-6 text-stone-400" />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-stone-800 truncate">
                  {item.name}
                </p>
                <p className="text-xs text-stone-500">{item.variantName}</p>
                <p className="text-xs text-stone-500">Qty: {item.quantity}</p>
              </div>
              <p className="text-sm font-semibold text-stone-800">
                {formatCurrency(item.subtotal)}
              </p>
            </div>
          ))}
        </div>

        {/* Promo Code */}
        <div className="border-t border-stone-200 pt-4">
          {summary.appliedPromoCode ? (
            <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-xl">
              <div className="flex items-center gap-2">
                <Tag className="w-4 h-4 text-green-600" />
                <span className="text-sm font-medium text-green-700">
                  {summary.appliedPromoCode}
                </span>
              </div>
              <button
                onClick={onRemovePromo}
                className="text-green-600 hover:text-green-800 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="space-y-2">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={promoInput}
                  onChange={(e) =>
                    onPromoInputChange(e.target.value.toUpperCase())
                  }
                  placeholder="Promo code"
                  className="flex-1 px-3 py-2 border-2 border-stone-200 rounded-lg text-sm focus:border-[#DDA200] focus:outline-none uppercase"
                />
                <button
                  onClick={onApplyPromo}
                  disabled={isApplyingPromo || !promoInput.trim()}
                  className="px-4 py-2 bg-[#DDA200] text-white text-sm font-medium rounded-lg hover:bg-[#b38600] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
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
                  className={`text-xs ${
                    promoMessage.type === "success"
                      ? "text-green-600"
                      : "text-red-600"
                  }`}
                >
                  {promoMessage.text}
                </p>
              )}
            </div>
          )}
        </div>

        {/* Summary Lines */}
        <div className="border-t border-stone-200 pt-4 space-y-3">
          <div className="flex justify-between text-sm">
            <span className="text-stone-600">Subtotal</span>
            <span className="font-medium text-stone-800">
              {formatCurrency(summary.subtotal)}
            </span>
          </div>

          {shippingMethod && (
            <div className="flex justify-between text-sm">
              <span className="text-stone-600">
                Shipping ({shippingMethod.name})
              </span>
              <span className="font-medium text-stone-800">
                {shippingCostWithoutCOD === 0 ? (
                  <span className="text-green-600">FREE</span>
                ) : (
                  formatCurrency(shippingCostWithoutCOD)
                )}
              </span>
            </div>
          )}

          {paymentMethod === "cod" && (
            <div className="flex justify-between text-sm">
              <span className="text-stone-600">COD Fee</span>
              <span className="font-medium text-stone-800">
                {formatCurrency(COD_FEE)}
              </span>
            </div>
          )}

          {summary.promoDiscount > 0 && (
            <div className="flex justify-between text-sm">
              <span className="text-green-600">Promo Discount</span>
              <span className="font-medium text-green-600">
                -{formatCurrency(summary.promoDiscount)}
              </span>
            </div>
          )}

          {summary.tax > 0 && (
            <div className="flex justify-between text-sm">
              <span className="text-stone-600">Tax</span>
              <span className="font-medium text-stone-800">
                {formatCurrency(summary.tax)}
              </span>
            </div>
          )}
        </div>

        {/* Total */}
        <div className="border-t-2 border-stone-200 pt-4">
          <div className="flex justify-between">
            <span className="text-lg font-bold text-stone-800">Total</span>
            <span className="text-lg font-bold text-[#DDA200]">
              {formatCurrency(summary.total)}
            </span>
          </div>
        </div>

        {/* Security Badge */}
        <div className="flex items-center justify-center gap-2 p-3 bg-stone-50 rounded-xl">
          <Lock className="w-4 h-4 text-green-600" />
          <span className="text-xs text-stone-600">
            Secure checkout with SSL encryption
          </span>
        </div>

        {/* Trust Badges */}
        <div className="flex items-center justify-center gap-4">
          <div className="flex items-center gap-1 text-xs text-stone-500">
            <Shield className="w-4 h-4" />
            <span>Secure Payment</span>
          </div>
          <div className="flex items-center gap-1 text-xs text-stone-500">
            <Package className="w-4 h-4" />
            <span>Fast Delivery</span>
          </div>
        </div>
      </div>
    </div>
  );
}
