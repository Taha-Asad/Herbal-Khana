import { shippingOptions } from "@/lib/dummyData/cart";
import type { ShippingOptionsProps } from "@/types/cart";
import { formatCurrency } from "@/utils/OrderRelated";
import { Check, Gift, Truck } from "lucide-react";

export function ShippingOptions({
  selectedOption,
  onSelect,
  freeShippingThreshold,
  currentSubtotal,
}: ShippingOptionsProps) {
  const amountToFreeShipping = freeShippingThreshold - currentSubtotal;
  const hasFreeShipping = amountToFreeShipping <= 0;

  return (
    <div className="bg-white rounded-2xl border-2 border-stone-200 p-4 md:p-6">
      <h3 className="font-bold text-stone-800 mb-4 flex items-center gap-2">
        <Truck className="w-5 h-5 text-[#DDA200]" />
        Shipping Method
      </h3>

      {/* Free Shipping Progress */}
      {!hasFreeShipping && (
        <div className="mb-4 p-3 bg-[#FFF9E6] rounded-xl border border-[#f3e4b7]">
          <div className="flex items-center gap-2 mb-2">
            <Gift className="w-4 h-4 text-[#DDA200]" />
            <span className="text-sm text-stone-700">
              Add{" "}
              <span className="font-bold text-[#DDA200]">
                {formatCurrency(amountToFreeShipping)}
              </span>{" "}
              more for free standard shipping!
            </span>
          </div>
          <div className="h-2 bg-stone-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-[#DDA200] to-[#b38600] rounded-full transition-all duration-500"
              style={{
                width: `${Math.min(
                  (currentSubtotal / freeShippingThreshold) * 100,
                  100
                )}%`,
              }}
            />
          </div>
        </div>
      )}

      {/* Shipping Options */}
      <div className="space-y-3">
        {shippingOptions.map((option) => {
          const Icon = option.icon;
          const isFreeStandard = hasFreeShipping && option.id === "standard";
          const displayPrice = isFreeStandard ? 0 : option.price;

          return (
            <label
              key={option.id}
              className={`flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer
                transition-all duration-200 ${
                  selectedOption === option.id
                    ? "border-[#DDA200] bg-[#FFF9E6]"
                    : "border-stone-200 hover:border-stone-300"
                }`}
            >
              <input
                type="radio"
                name="shipping"
                value={option.id}
                checked={selectedOption === option.id}
                onChange={() => onSelect(option.id)}
                className="sr-only"
              />
              <div
                className={`w-5 h-5 rounded-full border-2 flex items-center justify-center
                  transition-colors ${
                    selectedOption === option.id
                      ? "border-[#DDA200] bg-[#DDA200]"
                      : "border-stone-300"
                  }`}
              >
                {selectedOption === option.id && (
                  <Check className="w-3 h-3 text-white" />
                )}
              </div>

              <div
                className={`p-2 rounded-lg ${
                  selectedOption === option.id
                    ? "bg-[#DDA200]/20"
                    : "bg-stone-100"
                }`}
              >
                <Icon
                  className={`w-5 h-5 ${
                    selectedOption === option.id
                      ? "text-[#DDA200]"
                      : "text-stone-500"
                  }`}
                />
              </div>

              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-stone-800">
                    {option.name}
                  </span>
                  {isFreeStandard && (
                    <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs font-medium rounded-full">
                      FREE
                    </span>
                  )}
                </div>
                <p className="text-sm text-stone-500">
                  {option.description} • {option.estimatedDays}
                </p>
              </div>

              <span
                className={`font-bold ${
                  isFreeStandard ? "text-green-600" : "text-stone-800"
                }`}
              >
                {isFreeStandard ? (
                  <span className="flex items-center gap-1">
                    <span className="line-through text-stone-400 text-sm">
                      {formatCurrency(option.price)}
                    </span>
                    <span>FREE</span>
                  </span>
                ) : (
                  formatCurrency(displayPrice)
                )}
              </span>
            </label>
          );
        })}
      </div>
    </div>
  );
}
