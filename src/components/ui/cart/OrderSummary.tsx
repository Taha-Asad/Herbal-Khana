import type { OrderSummaryProps } from "@/types/cart";
import { formatCurrency } from "@/utils/OrderRelated";
import {
  BadgePercent,
  CreditCard,
  Loader2,
  Lock,
  RotateCcw,
  Shield,
  Tag,
  Truck,
} from "lucide-react";

export function OrderSummary({
  summary,
  selectedShipping,
  isCheckingOut,
  onCheckout,
}: OrderSummaryProps) {
  return (
    <div className="bg-white rounded-2xl border-2 border-stone-200 overflow-hidden top-4">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#DDA200] to-[#b38600] p-4 text-white">
        <h3 className="font-bold text-lg flex items-center gap-2">
          <CreditCard className="w-5 h-5" />
          Order Summary
        </h3>
      </div>

      {/* Summary Details */}
      <div className="p-4 md:p-6 space-y-4">
        {/* Item Count */}
        <div className="flex justify-between text-sm">
          <span className="text-stone-600">Items ({summary.itemCount})</span>
          <span className="font-medium text-stone-800">
            {formatCurrency(summary.subtotal)}
          </span>
        </div>

        {/* Savings */}
        {summary.savingsTotal > 0 && (
          <div className="flex justify-between text-sm">
            <span className="text-green-600 flex items-center gap-1">
              <BadgePercent className="w-4 h-4" />
              You Save
            </span>
            <span className="font-medium text-green-600">
              -{formatCurrency(summary.savingsTotal)}
            </span>
          </div>
        )}

        {/* Shipping */}
        <div className="flex justify-between text-sm">
          <span className="text-stone-600 flex items-center gap-1">
            <Truck className="w-4 h-4" />
            Shipping
            {selectedShipping && (
              <span className="text-xs text-stone-400">
                ({selectedShipping.name})
              </span>
            )}
          </span>
          <span
            className={`font-medium ${
              summary.shipping === 0 ? "text-green-600" : "text-stone-800"
            }`}
          >
            {summary.shipping === 0 ? "FREE" : formatCurrency(summary.shipping)}
          </span>
        </div>

        {/* Promo Discount */}
        {summary.promoDiscount > 0 && (
          <div className="flex justify-between text-sm">
            <span className="text-green-600 flex items-center gap-1">
              <Tag className="w-4 h-4" />
              Promo Discount
            </span>
            <span className="font-medium text-green-600">
              -{formatCurrency(summary.promoDiscount)}
            </span>
          </div>
        )}

        {/* Tax */}
        <div className="flex justify-between text-sm">
          <span className="text-stone-600">Estimated Tax</span>
          <span className="font-medium text-stone-800">
            {formatCurrency(summary.tax)}
          </span>
        </div>

        {/* Divider */}
        <div className="border-t-2 border-dashed border-stone-200 pt-4">
          <div className="flex justify-between">
            <span className="font-bold text-stone-800 text-lg">Total</span>
            <span className="font-bold text-[#DDA200] text-2xl">
              {formatCurrency(summary.total)}
            </span>
          </div>
        </div>

        {/* Checkout Button */}
        <button
          onClick={onCheckout}
          disabled={isCheckingOut || summary.itemCount === 0}
          className="w-full flex items-center justify-center gap-3 px-6 py-4 
            bg-gradient-to-r from-[#DDA200] to-[#b38600] text-white font-bold text-lg
            rounded-xl shadow-lg shadow-[#DDA200]/30 hover:shadow-xl 
            hover:shadow-[#DDA200]/40 disabled:opacity-60 disabled:cursor-not-allowed
            transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
        >
          {isCheckingOut ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Processing...
            </>
          ) : (
            <>
              <Lock className="w-5 h-5" />
              Proceed to Checkout
            </>
          )}
        </button>

        {/* Trust Badges */}
        <div className="flex items-center justify-center gap-4 pt-4 border-t border-stone-100">
          <div className="flex items-center gap-1 text-xs text-stone-500">
            <Shield className="w-4 h-4 text-green-500" />
            Secure
          </div>
          <div className="flex items-center gap-1 text-xs text-stone-500">
            <Lock className="w-4 h-4 text-green-500" />
            Encrypted
          </div>
          <div className="flex items-center gap-1 text-xs text-stone-500">
            <RotateCcw className="w-4 h-4 text-green-500" />
            Easy Returns
          </div>
        </div>

        {/* Payment Methods */}
        <div className="text-center pt-2">
          <p className="text-xs text-stone-400 mb-2">We Accept</p>
          <div className="flex items-center justify-center gap-3">
            <div className="w-10 h-6 bg-stone-100 rounded flex items-center justify-center text-xs font-bold text-stone-600">
              COD
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
