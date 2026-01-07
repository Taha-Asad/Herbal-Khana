import { ArrowRight, ShoppingBag } from "lucide-react";
import Link from "next/link";

export function EmptyCart() {
  return (
    <div className="bg-white rounded-2xl border-2 border-stone-200 p-8 md:p-16 text-center">
      <div className="w-24 h-24 mx-auto mb-6 bg-[#FFF9E6] rounded-full flex items-center justify-center">
        <ShoppingBag className="w-12 h-12 text-[#DDA200]" />
      </div>
      <h2 className="text-2xl font-bold text-stone-800 mb-2">
        Your Cart is Empty
      </h2>
      <p className="text-stone-600 mb-8 max-w-md mx-auto">
        Looks like you haven&apos;t added anything to your cart yet. Start
        exploring our collection to find something you&apos;ll love!
      </p>
      <Link
        href="/home/shop/products"
        className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r 
          from-[#DDA200] to-[#b38600] text-white font-bold rounded-xl
          shadow-lg shadow-[#DDA200]/30 hover:shadow-xl hover:scale-105
          transition-all duration-300"
      >
        <ShoppingBag className="w-5 h-5" />
        Start Shopping
        <ArrowRight className="w-5 h-5" />
      </Link>
    </div>
  );
}
