import type { QuantitySelectorProps } from "@/types/cart";
import { Loader2, Minus, Plus } from "lucide-react";

export function QuantitySelector({
  quantity,
  maxQuantity,
  isUpdating,
  onIncrease,
  onDecrease,
  onChange,
}: QuantitySelectorProps) {
  return (
    <div className="flex items-center gap-1">
      <button
        onClick={onDecrease}
        disabled={quantity <= 1 || isUpdating}
        className="w-9 h-9 flex items-center justify-center rounded-lg border-2 
          border-stone-200 text-stone-600 hover:border-[#DDA200] hover:text-[#DDA200]
          disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
        aria-label="Decrease quantity"
      >
        <Minus className="w-4 h-4" />
      </button>

      <div className="relative">
        <input
          type="number"
          value={quantity}
          onChange={(e) => {
            const val = parseInt(e.target.value);
            if (!isNaN(val) && val >= 1 && val <= maxQuantity) {
              onChange(val);
            }
          }}
          min={1}
          max={maxQuantity}
          disabled={isUpdating}
          className="w-14 h-9 text-center border-2 border-stone-200 rounded-lg 
            font-semibold text-stone-800 focus:border-[#DDA200] focus:outline-none
            disabled:opacity-50 transition-colors duration-200
            [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none 
            [&::-webkit-inner-spin-button]:appearance-none"
        />
        {isUpdating && (
          <div className="absolute inset-0 flex items-center justify-center bg-white/80 rounded-lg">
            <Loader2 className="w-4 h-4 animate-spin text-[#DDA200]" />
          </div>
        )}
      </div>

      <button
        onClick={onIncrease}
        disabled={quantity >= maxQuantity || isUpdating}
        className="w-9 h-9 flex items-center justify-center rounded-lg border-2 
          border-stone-200 text-stone-600 hover:border-[#DDA200] hover:text-[#DDA200]
          disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
        aria-label="Increase quantity"
      >
        <Plus className="w-4 h-4" />
      </button>
    </div>
  );
}
