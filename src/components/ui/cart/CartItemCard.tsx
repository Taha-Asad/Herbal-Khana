import type { CartItemCardProps } from "@/types/cart";
import { calculateDiscount } from "@/utils/cart/UtilityFunctions";
import { formatCurrency } from "@/utils/OrderRelated";
import { AlertCircle, Bookmark, Check, Trash2, Truck } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { QuantitySelector } from "./QuantitySelector";

export function CartItemCard({
  item,
  isUpdating,
  onUpdateQuantity,
  onRemove,
  onSaveForLater,
}: CartItemCardProps) {
  const discount = item.originalPrice
    ? calculateDiscount(item.originalPrice, item.price)
    : 0;

  return (
    <div
      className={`group bg-white rounded-2xl border-2 border-stone-200 p-4 md:p-6
        hover:border-[#DDA200]/50 hover:shadow-lg transition-all duration-300
        ${isUpdating ? "opacity-70" : ""}`}
    >
      <div className="flex gap-4 md:gap-6">
        {/* Product Image */}
        <div className="relative w-24 h-24 md:w-32 md:h-32 flex-shrink-0">
          <div className="w-full h-full bg-stone-100 rounded-xl overflow-hidden">
            <Image
              src={item.image}
              alt={item.name}
              width={128}
              height={128}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
          </div>
          {discount > 0 && (
            <span className="absolute -top-2 -left-2 px-2 py-1 bg-red-500 text-white text-xs font-bold rounded-lg shadow">
              -{discount}%
            </span>
          )}
        </div>

        {/* Product Details */}
        <div className="flex-1 min-w-0">
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              <Link
                href={`/products/${item.productId}`}
                className="font-bold text-stone-800 hover:text-[#DDA200] transition-colors 
                  line-clamp-2 text-sm md:text-base"
              >
                {item.name}
              </Link>

              {/* Variant Info */}
              {item.variant && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {item.variant.color && (
                    <span className="text-xs px-2 py-1 bg-stone-100 text-stone-600 rounded-md">
                      {item.variant.color}
                    </span>
                  )}
                  {item.variant.size && (
                    <span className="text-xs px-2 py-1 bg-stone-100 text-stone-600 rounded-md">
                      {item.variant.size}
                    </span>
                  )}
                  {item.variant.scent && (
                    <span className="text-xs px-2 py-1 bg-stone-100 text-stone-600 rounded-md">
                      {item.variant.scent}
                    </span>
                  )}
                </div>
              )}

              <p className="text-xs text-stone-400 mt-1">SKU: {item.sku}</p>

              {/* Stock Status */}
              {item.inStock ? (
                <div className="flex items-center gap-1 mt-2">
                  <Check className="w-3.5 h-3.5 text-green-500" />
                  <span className="text-xs text-green-600 font-medium">
                    In Stock
                    {item.stockCount && item.stockCount <= 5 && (
                      <span className="text-orange-500 ml-1">
                        (Only {item.stockCount} left)
                      </span>
                    )}
                  </span>
                </div>
              ) : (
                <div className="flex items-center gap-1 mt-2">
                  <AlertCircle className="w-3.5 h-3.5 text-red-500" />
                  <span className="text-xs text-red-600 font-medium">
                    Out of Stock
                  </span>
                </div>
              )}

              {/* Estimated Delivery */}
              {item.estimatedDelivery && (
                <div className="flex items-center gap-1 mt-1">
                  <Truck className="w-3.5 h-3.5 text-stone-400" />
                  <span className="text-xs text-stone-500">
                    Delivery: {item.estimatedDelivery}
                  </span>
                </div>
              )}
            </div>

            {/* Price - Mobile */}
            <div className="md:hidden flex items-center gap-2">
              <span className="font-bold text-[#DDA200]">
                {formatCurrency(item.price)}
              </span>
              {item.originalPrice && (
                <span className="text-sm text-stone-400 line-through">
                  {formatCurrency(item.originalPrice)}
                </span>
              )}
            </div>
          </div>

          {/* Bottom Row */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mt-4">
            {/* Quantity & Actions */}
            <div className="flex items-center gap-4">
              <QuantitySelector
                quantity={item.quantity}
                maxQuantity={item.maxQuantity}
                isUpdating={isUpdating}
                onIncrease={() => onUpdateQuantity(item.quantity + 1)}
                onDecrease={() => onUpdateQuantity(item.quantity - 1)}
                onChange={onUpdateQuantity}
              />

              <div className="h-6 w-px bg-stone-200" />

              {/* Action Buttons */}
              <div className="flex items-center gap-2">
                <button
                  onClick={onSaveForLater}
                  disabled={isUpdating}
                  className="p-2 text-stone-500 hover:text-[#DDA200] hover:bg-[#DDA200]/10 
                    rounded-lg transition-all duration-200 disabled:opacity-50"
                  title="Save for later"
                >
                  <Bookmark className="w-5 h-5" />
                </button>
                <button
                  onClick={onRemove}
                  disabled={isUpdating}
                  className="p-2 text-stone-500 hover:text-red-500 hover:bg-red-50 
                    rounded-lg transition-all duration-200 disabled:opacity-50"
                  title="Remove item"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Price - Desktop */}
            <div className="hidden md:flex flex-col items-end">
              <span className="text-xl font-bold text-[#DDA200]">
                {formatCurrency(item.price * item.quantity)}
              </span>
              {item.originalPrice && (
                <span className="text-sm text-stone-400 line-through">
                  {formatCurrency(item.originalPrice * item.quantity)}
                </span>
              )}
              {item.quantity > 1 && (
                <span className="text-xs text-stone-500">
                  {formatCurrency(item.price)} each
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
