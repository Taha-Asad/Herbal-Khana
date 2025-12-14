import { categories } from "@/lib/products";
import { Product } from "@/types/product";
import { formatCurrency } from "@/utils/OrderRelated";
import {
  AlertCircle,
  Eye,
  Heart,
  Loader2,
  Package,
  ShoppingCart,
  Star,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

interface ProductCardProps {
  product: Product;
  viewMode: "grid" | "list";
  onAddToCart: (productId: string) => void;
  onAddToWishlist: (productId: string) => void;
}

export default function ProductCard({
  product,
  viewMode,
  onAddToCart,
  onAddToWishlist,
}: ProductCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [imageError, setImageError] = useState(false);

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsAddingToCart(true);
    await new Promise((resolve) => setTimeout(resolve, 500));
    onAddToCart(product.id);
    setIsAddingToCart(false);
  };

  const handleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsWishlisted(!isWishlisted);
    onAddToWishlist(product.id);
  };

  const categoryName =
    categories.find((c) => c.id === product.category)?.name || product.category;

  const fallbackImage = `https://via.placeholder.com/400x400/FFF9E6/DDA200?text=${encodeURIComponent(
    product.name.slice(0, 10)
  )}`;

  // List View
  if (viewMode === "list") {
    return (
      <Link
        href={`/products/${product.slug}`}
        className="group bg-white rounded-2xl border-2 border-stone-200 p-4 md:p-6
          hover:border-[#DDA200]/50 hover:shadow-xl transition-all duration-300 flex flex-col md:flex-row gap-6"
      >
        {/* Image */}
        <div className="relative w-full md:w-48 h-48 md:h-48 flex-shrink-0 rounded-xl overflow-hidden bg-gradient-to-br from-[#FFF9E6] to-stone-100">
          <Image
            src={imageError ? fallbackImage : product.images[0]}
            alt={product.name}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-500"
            sizes="(max-width: 768px) 100vw, 192px"
            onError={() => setImageError(true)}
          />
        </div>

        {/* Content */}
        <div className="flex-1 flex flex-col min-w-0">
          <div className="flex-1">
            <p className="text-xs text-[#DDA200] font-semibold uppercase tracking-wider mb-1.5">
              {categoryName}
            </p>

            <h3 className="font-bold text-stone-800 text-lg mb-2 group-hover:text-[#DDA200] transition-colors line-clamp-2">
              {product.name}
            </h3>

            <p className="text-stone-600 text-sm mb-3 line-clamp-2">
              {product.shortDescription}
            </p>

            <div className="flex items-center gap-2 mb-3">
              <div className="flex items-center gap-0.5">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`w-4 h-4 ${
                      i < Math.floor(product.rating)
                        ? "text-[#DDA200] fill-[#DDA200]"
                        : "text-stone-300"
                    }`}
                  />
                ))}
              </div>
              <span className="text-sm text-stone-600">
                {product.rating} ({product.reviewCount} reviews)
              </span>
            </div>

            <div className="flex flex-wrap gap-2 mb-3">
              {product.benefits.slice(0, 3).map((benefit, i) => (
                <span
                  key={i}
                  className="px-2.5 py-1 bg-[#FFF9E6] text-[#b38600] text-xs rounded-full font-medium border border-[#DDA200]/20"
                >
                  {benefit}
                </span>
              ))}
            </div>
          </div>

          {/* Bottom */}
          <div className="flex items-center justify-between pt-3 border-t border-stone-100">
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-[#DDA200]">
                {formatCurrency(product.price)}
              </span>
              {product.originalPrice && (
                <span className="text-sm text-stone-400 line-through">
                  {formatCurrency(product.originalPrice)}
                </span>
              )}
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleWishlist}
                className={`p-3 rounded-xl border-2 transition-all duration-200 ${
                  isWishlisted
                    ? "bg-red-50 border-red-200 text-red-500"
                    : "border-stone-200 text-stone-400 hover:border-red-200 hover:text-red-500 hover:bg-red-50"
                }`}
              >
                <Heart
                  className={`w-5 h-5 ${isWishlisted ? "fill-current" : ""}`}
                />
              </button>
              <button
                onClick={handleAddToCart}
                disabled={isAddingToCart || !product.inStock}
                className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#DDA200] to-[#b38600] text-white font-semibold 
                  rounded-xl hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
              >
                {isAddingToCart ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    <ShoppingCart className="w-5 h-5" />
                    <span className="hidden sm:inline">Add to Cart</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </Link>
    );
  }

  // Grid View
  return (
    <Link
      href={`/products/${product.slug}`}
      className="group bg-white rounded-2xl border-2 border-stone-200 overflow-hidden
        hover:border-[#DDA200]/50 hover:shadow-xl transition-all duration-300"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Image Container */}
      <div className="relative aspect-square overflow-hidden bg-gradient-to-br from-[#FFF9E6] to-stone-100">
        <Image
          src={imageError ? fallbackImage : product.images[0]}
          alt={product.name}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-500"
          sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, 33vw"
          onError={() => setImageError(true)}
        />

        {/* Wishlist Button */}
        <button
          onClick={handleWishlist}
          className={`absolute top-3 right-3 p-2.5 rounded-full shadow-lg transition-all duration-200 z-10 ${
            isWishlisted
              ? "bg-red-500 text-white"
              : "bg-white/90 backdrop-blur-sm text-stone-600 hover:text-red-500 hover:bg-white"
          }`}
        >
          <Heart className={`w-5 h-5 ${isWishlisted ? "fill-current" : ""}`} />
        </button>

        {/* Quick Actions Overlay */}
        <div
          className={`absolute inset-x-0 bottom-0 p-4 bg-gradient-to-t from-black/70 via-black/40 to-transparent
            transition-all duration-300 ${
              isHovered
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-4"
            }`}
        >
          <div className="flex gap-2">
            <button
              onClick={handleAddToCart}
              disabled={isAddingToCart || !product.inStock}
              className="flex-1 flex items-center justify-center gap-2 py-3 bg-white text-stone-800 
                font-semibold rounded-xl hover:bg-[#DDA200] hover:text-white 
                disabled:opacity-50 transition-all duration-200 shadow-lg"
            >
              {isAddingToCart ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  <ShoppingCart className="w-5 h-5" />
                  Add to Cart
                </>
              )}
            </button>
            <button className="p-3 bg-white text-stone-800 rounded-xl hover:bg-[#DDA200] hover:text-white transition-all duration-200 shadow-lg">
              <Eye className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Out of Stock Overlay */}
        {!product.inStock && (
          <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center z-20">
            <span className="px-4 py-2 bg-stone-800 text-white font-bold rounded-xl">
              Out of Stock
            </span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4 border-t-2 border-stone-100">
        <p className="text-xs text-[#DDA200] font-semibold uppercase tracking-wider mb-1.5">
          {categoryName}
        </p>

        <h3 className="font-bold text-stone-800 mb-2 line-clamp-2 min-h-[2.75rem] group-hover:text-[#DDA200] transition-colors">
          {product.name}
        </h3>

        {product.volume && (
          <p className="text-xs text-stone-500 mb-2 flex items-center gap-1">
            <Package className="w-3 h-3" />
            {product.volume}
          </p>
        )}

        {/* Rating */}
        <div className="flex items-center gap-1.5 mb-3">
          <div className="flex items-center gap-0.5">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className={`w-3.5 h-3.5 ${
                  i < Math.floor(product.rating)
                    ? "text-[#DDA200] fill-[#DDA200]"
                    : "text-stone-300"
                }`}
              />
            ))}
          </div>
          <span className="text-xs text-stone-500 font-medium">
            {product.rating} ({product.reviewCount})
          </span>
        </div>

        {/* Price */}
        <div className="flex items-baseline gap-2 pt-2 border-t border-stone-100">
          <span className="text-xl font-bold text-[#DDA200]">
            {formatCurrency(product.price)}
          </span>
          {product.originalPrice && (
            <span className="text-sm text-stone-400 line-through">
              {formatCurrency(product.originalPrice)}
            </span>
          )}
        </div>

        {/* Stock Status */}
        {product.inStock && product.stockCount && product.stockCount <= 10 && (
          <p className="mt-2 text-xs text-orange-600 font-medium flex items-center gap-1 bg-orange-50 px-2 py-1 rounded-lg">
            <AlertCircle className="w-3 h-3" />
            Only {product.stockCount} left in stock
          </p>
        )}
      </div>
    </Link>
  );
}
