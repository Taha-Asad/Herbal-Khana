import type { PromoCodeInputProps } from "@/types/cart";
import { AlertCircle, Check, ChevronDown, Loader2, Tag, X } from "lucide-react";
import { useState } from "react";

export function PromoCodeInput({
  promoCode,
  setPromoCode,
  appliedPromo,
  isApplying,
  error,
  onApply,
  onRemove,
}: PromoCodeInputProps) {
  const [isOpen, setIsOpen] = useState(!!appliedPromo);

  return (
    <div className="bg-white rounded-2xl border-2 border-stone-200 overflow-hidden">
      {/* Header */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-4 hover:bg-stone-50 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="p-2 bg-[#DDA200]/10 rounded-lg">
            <Tag className="w-5 h-5 text-[#DDA200]" />
          </div>
          <span className="font-semibold text-stone-800">
            {appliedPromo ? "Promo Code Applied" : "Have a Promo Code?"}
          </span>
        </div>
        <ChevronDown
          className={`w-5 h-5 text-stone-400 transition-transform duration-300 ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      {/* Content */}
      {isOpen && (
        <div className="px-4 pb-4 border-t border-stone-100">
          <div className="pt-4">
            {appliedPromo ? (
              <div className="flex items-center justify-between p-3 bg-green-50 rounded-xl border border-green-200">
                <div className="flex items-center gap-2">
                  <Check className="w-5 h-5 text-green-500" />
                  <div>
                    <p className="font-semibold text-green-700">
                      {appliedPromo.code}
                    </p>
                    <p className="text-xs text-green-600">
                      {appliedPromo.description}
                    </p>
                  </div>
                </div>
                <button
                  onClick={onRemove}
                  className="p-1 text-green-600 hover:text-red-500 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={promoCode}
                    onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                    placeholder="Enter promo code"
                    className="flex-1 px-4 py-3 border-2 border-stone-200 rounded-xl
                      focus:border-[#DDA200] focus:outline-none transition-colors
                      placeholder:text-stone-400 text-stone-800 font-medium uppercase"
                  />
                  <button
                    onClick={onApply}
                    disabled={!promoCode.trim() || isApplying}
                    className="px-6 py-3 bg-[#DDA200] text-white font-semibold rounded-xl
                      hover:bg-[#b38600] disabled:opacity-50 disabled:cursor-not-allowed
                      transition-all duration-200 flex items-center gap-2"
                  >
                    {isApplying ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      "Apply"
                    )}
                  </button>
                </div>
                {error && (
                  <p className="text-sm text-red-500 flex items-center gap-1">
                    <AlertCircle className="w-4 h-4" />
                    {error}
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
