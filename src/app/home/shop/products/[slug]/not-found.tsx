// src/app/products/[slug]/not-found.tsx
import Link from "next/link";
import { Package, ArrowLeft, Search } from "lucide-react";

export default function ProductNotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-[#FFF8E1]/20 to-white flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-[#FFF9E6] to-[#FFF0C2] rounded-full flex items-center justify-center">
          <Package className="w-12 h-12 text-[#DDA200]" />
        </div>

        <h1 className="text-3xl font-bold text-stone-800 mb-3">
          Product Not Found
        </h1>

        <p className="text-stone-600 mb-8">
          Sorry, we couldn&apos;t find the product you&apos;re looking for. It
          may have been removed or the link might be incorrect.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/home/shop/products"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 
              bg-gradient-to-r from-[#DDA200] to-[#b38600] text-white font-semibold 
              rounded-xl shadow-lg shadow-[#DDA200]/30 hover:shadow-xl 
              transition-all duration-300"
          >
            <Search className="w-5 h-5" />
            Browse Products
          </Link>

          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 
              border-2 border-stone-300 text-stone-700 font-semibold rounded-xl 
              hover:border-[#DDA200] hover:text-[#DDA200] transition-all duration-300"
          >
            <ArrowLeft className="w-5 h-5" />
            Go Home
          </Link>
        </div>
      </div>
    </div>
  );
}
