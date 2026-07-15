import type { ShippingOptionsProps } from "@/types/cart";
import { formatCurrency } from "@/utils/OrderRelated";
import { Check, Truck } from "lucide-react";

export function ShippingOptions({
  deliveryPrice,
  deliveryEstimate,
  enableFreeDelivery,
  freeDeliveryMinAmount,
  currentSubtotal,
}: ShippingOptionsProps) {
  const isFreeDelivery =
    enableFreeDelivery && currentSubtotal >= freeDeliveryMinAmount;

  return (
    <div className="bg-white rounded-2xl border-2 border-stone-200 p-4 md:p-6">
      <h3 className="font-bold text-stone-800 mb-4 flex items-center gap-2">
        <Truck className="w-5 h-5 text-[#DDA200]" />
        Delivery
      </h3>

      {/* Free Delivery Notice */}
      {enableFreeDelivery && !isFreeDelivery && (
        <div className="mb-4 p-3 bg-[#FFF9E6] rounded-xl border border-[#f3e4b7]">
          <p className="text-sm text-stone-700">
            Add{" "}
            <span className="font-bold text-[#DDA200]">
              {formatCurrency(freeDeliveryMinAmount - currentSubtotal)}
            </span>{" "}
            more for{" "}
            <span className="font-bold text-green-600">FREE delivery!</span>
          </p>
          <div className="mt-2 h-2 bg-stone-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-[#DDA200] to-[#b38600] rounded-full transition-all duration-500"
              style={{
                width: `${Math.min(
                  (currentSubtotal / freeDeliveryMinAmount) * 100,
                  100
                )}%`,
              }}
            />
          </div>
        </div>
      )}

      {/* Single Delivery Option */}
      <div
        className="flex items-center gap-4 p-4 rounded-xl border-2 border-[#DDA200] bg-[#FFF9E6]"
      >
        <div className="w-5 h-5 rounded-full border-2 border-[#DDA200] bg-[#DDA200] flex items-center justify-center flex-shrink-0">
          <Check className="w-3 h-3 text-white" />
        </div>

        <div className="p-2 rounded-lg bg-[#DDA200]/20">
          <Truck className="w-5 h-5 text-[#DDA200]" />
        </div>

        <div className="flex-1">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-stone-800">
              Standard Delivery
            </span>
            {isFreeDelivery && (
              <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs font-medium rounded-full">
                FREE
              </span>
            )}
          </div>
          <p className="text-sm text-stone-500">
            {deliveryEstimate}
          </p>
        </div>

        <span
          className={`font-bold ${isFreeDelivery ? "text-green-600" : "text-stone-800"}`}
        >
          {isFreeDelivery ? (
            <span className="flex items-center gap-1">
              <span className="line-through text-stone-400 text-sm">
                {formatCurrency(deliveryPrice)}
              </span>
              <span>FREE</span>
            </span>
          ) : (
            formatCurrency(deliveryPrice)
          )}
        </span>
      </div>
    </div>
  );
}
