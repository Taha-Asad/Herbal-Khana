import type { RecommendedProductsProps } from "@/types/cart";
import { calculateDiscount } from "@/utils/cart/UtilityFunctions";
import { formatCurrency } from "@/utils/OrderRelated";
import { ChevronRight, Heart, Plus, Sparkles } from "lucide-react";
import Image from "next/image";
import { useRef } from "react";

export function RecommendedProducts({
  products,
  onAddToCart,
}: RecommendedProductsProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: "left" | "right") => {
    if (scrollContainerRef.current) {
      const scrollAmount = 280;
      scrollContainerRef.current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      });
    }
  };

  if (products.length === 0) return null;

  return (
    <div className="bg-white rounded-2xl border-2 border-stone-200 p-4 md:p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="font-bold text-stone-800 text-lg flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-[#DDA200]" />
          You Might Also Like
        </h3>
        <div className="flex gap-2">
          <button
            onClick={() => scroll("left")}
            className="p-2 rounded-lg border border-stone-200 hover:border-[#DDA200] 
              hover:text-[#DDA200] transition-colors"
          >
            <ChevronRight className="w-4 h-4 rotate-180" />
          </button>
          <button
            onClick={() => scroll("right")}
            className="p-2 rounded-lg border border-stone-200 hover:border-[#DDA200] 
              hover:text-[#DDA200] transition-colors"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Products Carousel */}
      <div
        ref={scrollContainerRef}
        className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide scroll-smooth"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        {products.map((product) => {
          const discount = product.originalPrice
            ? calculateDiscount(product.originalPrice, product.price)
            : 0;

          return (
            <div
              key={product.id}
              className="flex-shrink-0 w-56 bg-stone-50 rounded-xl p-3 
                hover:shadow-lg transition-all duration-300 group"
            >
              {/* Image */}
              <div className="relative w-full aspect-square bg-white rounded-lg overflow-hidden mb-3">
                <Image
                  src={product.image}
                  alt={product.name}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                />
                {discount > 0 && (
                  <span className="absolute top-2 left-2 px-2 py-1 bg-red-500 text-white text-xs font-bold rounded">
                    -{discount}%
                  </span>
                )}
                <button
                  className="absolute top-2 right-2 p-2 bg-white rounded-full shadow 
                    opacity-0 group-hover:opacity-100 transition-opacity duration-200
                    hover:text-red-500"
                >
                  <Heart className="w-4 h-4" />
                </button>
              </div>

              {/* Details */}
              <h4 className="font-semibold text-stone-800 text-sm line-clamp-2 mb-1">
                {product.name}
              </h4>

              {/* Rating */}
              <div className="flex items-center gap-1 mb-2">
                <div className="flex">
                  {[...Array(5)].map((_, i) => (
                    <svg
                      key={i}
                      className={`w-3.5 h-3.5 ${
                        i < Math.floor(product.rating)
                          ? "text-[#DDA200]"
                          : "text-stone-300"
                      }`}
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
                <span className="text-xs text-stone-500">
                  ({product.reviewCount})
                </span>
              </div>

              {/* Price */}
              <div className="flex items-center gap-2 mb-3">
                <span className="font-bold text-[#DDA200]">
                  {formatCurrency(product.price)}
                </span>
                {product.originalPrice && (
                  <span className="text-xs text-stone-400 line-through">
                    {formatCurrency(product.originalPrice)}
                  </span>
                )}
              </div>

              {/* Add to Cart Button */}
              <button
                onClick={() => onAddToCart(product.variantId)}
                className="w-full py-2 px-3 border-2 border-[#DDA200] text-[#DDA200] 
                  font-semibold text-sm rounded-lg hover:bg-[#DDA200] hover:text-white
                  transition-all duration-200 flex items-center justify-center gap-1"
              >
                <Plus className="w-4 h-4" />
                Add to Cart
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
