import type { SavedItemCardProps } from "@/types/cart";
import { calculateDiscount } from "@/utils/cart/UtilityFunctions";
import { formatCurrency } from "@/utils/OrderRelated";
import { ShoppingCart, Trash2 } from "lucide-react";
import Image from "next/image";

export function SavedItemCard({
  item,
  isUpdating,
  onMoveToCart,
  onRemove,
}: SavedItemCardProps) {
  const discount = item.originalPrice
    ? calculateDiscount(item.originalPrice, item.price)
    : 0;

  return (
    <div
      className={`bg-white rounded-xl border-2 border-stone-200 p-4 
        hover:border-[#DDA200]/50 transition-all duration-300
        ${isUpdating ? "opacity-70" : ""}`}
    >
      <div className="flex gap-4">
        {/* Image */}
        <div className="relative w-20 h-20 flex-shrink-0">
          <div className="w-full h-full bg-stone-100 rounded-lg overflow-hidden">
            <Image
              src={item.image}
              alt={item.name}
              width={80}
              height={80}
              className="w-full h-full object-cover"
            />
          </div>
          {discount > 0 && (
            <span className="absolute -top-1 -left-1 px-1.5 py-0.5 bg-red-500 text-white text-[10px] font-bold rounded">
              -{discount}%
            </span>
          )}
        </div>

        {/* Details */}
        <div className="flex-1 min-w-0">
          <h4 className="font-semibold text-stone-800 text-sm line-clamp-2">
            {item.name}
          </h4>
          <div className="flex items-center gap-2 mt-1">
            <span className="font-bold text-[#DDA200] text-sm">
              {formatCurrency(item.price)}
            </span>
            {item.originalPrice && (
              <span className="text-xs text-stone-400 line-through">
                {formatCurrency(item.originalPrice)}
              </span>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 mt-3">
            <button
              onClick={onMoveToCart}
              disabled={isUpdating || !item.inStock}
              className="flex-1 flex items-center justify-center gap-1 px-3 py-2 
                bg-[#DDA200] text-white text-xs font-semibold rounded-lg
                hover:bg-[#b38600] disabled:opacity-50 disabled:cursor-not-allowed
                transition-colors duration-200"
            >
              <ShoppingCart className="w-3.5 h-3.5" />
              Move to Cart
            </button>
            <button
              onClick={onRemove}
              disabled={isUpdating}
              className="p-2 text-stone-400 hover:text-red-500 hover:bg-red-50 
                rounded-lg transition-all duration-200"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
