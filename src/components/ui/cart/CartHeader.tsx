import type { CartHeaderProps } from "@/types/cart";
import { ShoppingCart, Trash2 } from "lucide-react";

export function CartHeader({ itemCount, onClearCart }: CartHeaderProps) {
  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-stone-800 flex items-center gap-3">
          <ShoppingCart className="w-8 h-8 text-[#DDA200]" />
          Shopping Cart
        </h1>
        <p className="text-stone-600 mt-1">
          {itemCount} {itemCount === 1 ? "item" : "items"} in your cart
        </p>
      </div>
      {itemCount > 0 && (
        <button
          onClick={onClearCart}
          className="flex items-center gap-2 px-4 py-2 text-red-500 hover:bg-red-50 
            rounded-lg transition-colors font-medium text-sm"
        >
          <Trash2 className="w-4 h-4" />
          Clear Cart
        </button>
      )}
    </div>
  );
}
