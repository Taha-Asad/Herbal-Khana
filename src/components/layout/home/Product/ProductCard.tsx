// components/layout/home/Product/ProductCard.tsx
"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Heart,
  ShoppingCart,
  Star,
  Eye,
  Loader2,
  Check,
  Sparkles,
  TrendingUp,
} from "lucide-react";
import type { ProductListItem } from "@/types/product";

interface ProductCardProps {
  product: ProductListItem;
  viewMode?: "grid" | "list";
  isWishlisted?: boolean;
  isAddingToCart?: boolean;
  isUpdatingWishlist?: boolean;
  onAddToCart: (variantId: string) => void;
  onToggleWishlist: (productId: string) => void;
}

const formatCurrency = (amount: number): string => {
  return `PKR ${amount.toLocaleString("en-PK")}`;
};

const fallbackImage = "/placeholder.svg";

export default function ProductCard({
  product,
  viewMode = "grid",
  isWishlisted = false,
  isAddingToCart = false,
  isUpdatingWishlist = false,
  onAddToCart,
  onToggleWishlist,
}: ProductCardProps) {
  const [imageError, setImageError] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  // Get image URL - product.image is already a string URL from ProductListItem
  const imageUrl = imageError ? fallbackImage : product.image || fallbackImage;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isAddingToCart && product.inStock) {
      onAddToCart(product.defaultVariantId);
    }
  };

  const handleToggleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isUpdatingWishlist) {
      onToggleWishlist(product.id);
    }
  };

  const handleImageError = () => {
    setImageError(true);
  };

  const handleImageLoad = () => {
    setImageLoaded(true);
  };

  // List View
  if (viewMode === "list") {
    return (
      <div
        className="group bg-white rounded-2xl border-2 border-stone-200 overflow-hidden 
          hover:border-[#DDA200]/50 hover:shadow-xl transition-all duration-300"
      >
        <div className="flex flex-col md:flex-row">
          {/* Image */}
          <div className="relative w-full md:w-64 h-64 md:h-auto flex-shrink-0">
            <Link href={`/products/${product.slug}`}>
              <div className="relative w-full h-full min-h-[200px]">
                {!imageLoaded && (
                  <div className="absolute inset-0 bg-gradient-to-br from-stone-100 to-stone-200 animate-pulse" />
                )}
                <Image
                  src={imageUrl}
                  alt={product.name}
                  fill
                  sizes="(max-width: 768px) 100vw, 256px"
                  className={`object-cover transition-all duration-500 ${
                    imageLoaded ? "opacity-100" : "opacity-0"
                  } group-hover:scale-105`}
                  onLoad={handleImageLoad}
                  onError={handleImageError}
                />
              </div>
            </Link>

            {/* Badges */}
            <div className="absolute top-3 left-3 flex flex-col gap-2 z-10">
              {product.discount && product.discount > 0 && (
                <span className="px-2.5 py-1 bg-red-500 text-white text-xs font-bold rounded-lg shadow">
                  -{product.discount}%
                </span>
              )}
              {product.isNew && (
                <span className="px-2.5 py-1 bg-emerald-500 text-white text-xs font-bold rounded-lg shadow flex items-center gap-1">
                  <Sparkles className="w-3 h-3" /> NEW
                </span>
              )}
              {product.isBestseller && (
                <span className="px-2.5 py-1 bg-[#DDA200] text-white text-xs font-bold rounded-lg shadow flex items-center gap-1">
                  <TrendingUp className="w-3 h-3" /> BEST
                </span>
              )}
            </div>

            {/* Wishlist Button */}
            <button
              onClick={handleToggleWishlist}
              disabled={isUpdatingWishlist}
              className={`absolute top-3 right-3 p-2.5 rounded-full shadow-lg z-10 transition-all duration-200 
                disabled:opacity-50 ${
                  isWishlisted
                    ? "bg-red-500 text-white"
                    : "bg-white text-stone-600 hover:text-red-500 hover:bg-red-50"
                }`}
            >
              {isUpdatingWishlist ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Heart
                  className={`w-5 h-5 ${isWishlisted ? "fill-current" : ""}`}
                />
              )}
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 p-6 flex flex-col">
            <Link href={`/products/${product.slug}`}>
              <p className="text-sm text-[#DDA200] font-medium mb-1">
                {product.category}
              </p>
              <h3 className="text-xl font-bold text-stone-800 mb-2 hover:text-[#DDA200] transition-colors line-clamp-2">
                {product.name}
              </h3>
            </Link>

            {product.shortDescription && (
              <p className="text-stone-600 text-sm mb-4 line-clamp-2">
                {product.shortDescription}
              </p>
            )}

            {/* Rating */}
            <div className="flex items-center gap-2 mb-4">
              <div className="flex items-center">
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
                {product.rating > 0 ? product.rating.toFixed(1) : "No reviews"}
                {product.reviewCount > 0 && ` (${product.reviewCount})`}
              </span>
            </div>

            {/* Stock Status */}
            <div className="flex items-center gap-2 mb-4">
              {product.inStock ? (
                <span className="flex items-center gap-1 text-sm text-green-600">
                  <Check className="w-4 h-4" />
                  In Stock
                  {product.stockCount <= 5 && product.stockCount > 0 && (
                    <span className="text-orange-500 ml-1">
                      (Only {product.stockCount} left)
                    </span>
                  )}
                </span>
              ) : (
                <span className="text-sm text-red-500 font-medium">
                  Out of Stock
                </span>
              )}
            </div>

            <div className="mt-auto flex items-center justify-between">
              {/* Price */}
              <div className="flex items-center gap-2">
                <span className="text-2xl font-bold text-[#DDA200]">
                  {formatCurrency(product.price)}
                </span>
                {product.originalPrice && (
                  <span className="text-lg text-stone-400 line-through">
                    {formatCurrency(product.originalPrice)}
                  </span>
                )}
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2">
                <Link
                  href={`/products/${product.slug}`}
                  className="p-3 border-2 border-stone-200 rounded-xl text-stone-600 
                    hover:border-[#DDA200] hover:text-[#DDA200] transition-colors"
                >
                  <Eye className="w-5 h-5" />
                </Link>
                <button
                  onClick={handleAddToCart}
                  disabled={!product.inStock || isAddingToCart}
                  className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#DDA200] to-[#b38600]
                    text-white font-semibold rounded-xl shadow-lg shadow-[#DDA200]/30 
                    hover:shadow-xl hover:shadow-[#DDA200]/40 disabled:opacity-50 
                    disabled:cursor-not-allowed transition-all duration-300"
                >
                  {isAddingToCart ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <ShoppingCart className="w-5 h-5" />
                  )}
                  {isAddingToCart ? "Adding..." : "Add to Cart"}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Grid View
  return (
    <div
      className="group bg-white rounded-2xl border-2 border-stone-200 overflow-hidden 
        hover:border-[#DDA200]/50 hover:shadow-xl transition-all duration-300"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Image Container */}
      <div className="relative aspect-square overflow-hidden bg-gradient-to-br from-[#FFF9E6] to-stone-100">
        <Link href={`/home/shop/products/${product.slug}`}>
          {!imageLoaded && (
            <div className="absolute inset-0 bg-gradient-to-br from-stone-100 to-stone-200 animate-pulse" />
          )}
          <Image
            src={imageUrl}
            alt={product.name}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className={`object-cover transition-all duration-500 ${
              imageLoaded ? "opacity-100" : "opacity-0"
            } group-hover:scale-110`}
            onLoad={handleImageLoad}
            onError={handleImageError}
          />
        </Link>

        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-2 z-10">
          {product.discount && product.discount > 0 && (
            <span className="px-2.5 py-1 bg-red-500 text-white text-xs font-bold rounded-lg shadow">
              -{product.discount}%
            </span>
          )}
          {product.isNew && (
            <span className="px-2.5 py-1 bg-emerald-500 text-white text-xs font-bold rounded-lg shadow flex items-center gap-1">
              <Sparkles className="w-3 h-3" /> NEW
            </span>
          )}
          {product.isBestseller && (
            <span className="px-2.5 py-1 bg-[#DDA200] text-white text-xs font-bold rounded-lg shadow flex items-center gap-1">
              <TrendingUp className="w-3 h-3" /> BEST
            </span>
          )}
        </div>

        {/* Wishlist Button */}
        <button
          onClick={handleToggleWishlist}
          disabled={isUpdatingWishlist}
          className={`absolute top-3 right-3 p-2.5 rounded-full shadow-lg z-10
            transition-all duration-200 disabled:opacity-50 ${
              isWishlisted
                ? "bg-red-500 text-white scale-100"
                : `bg-white text-stone-600 hover:text-red-500 hover:bg-red-50 ${
                    isHovered
                      ? "scale-100 opacity-100"
                      : "scale-90 opacity-0 md:opacity-0"
                  }`
            }`}
        >
          {isUpdatingWishlist ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <Heart
              className={`w-5 h-5 ${isWishlisted ? "fill-current" : ""}`}
            />
          )}
        </button>

        {/* Quick Actions Overlay */}
        <div
          className={`absolute inset-x-0 bottom-0 p-4 bg-gradient-to-t from-black/60 to-transparent
            transition-all duration-300 ${
              isHovered
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-4"
            }`}
        >
          <div className="flex items-center gap-2">
            <button
              onClick={handleAddToCart}
              disabled={!product.inStock || isAddingToCart}
              className="flex-1 flex items-center justify-center gap-2 py-3 bg-white text-[#DDA200] 
                font-semibold rounded-xl hover:bg-[#DDA200] hover:text-white 
                disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
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
            <Link
              href={`/home/shop/products/${product.slug}`}
              className="p-3 bg-white/90 rounded-xl text-stone-700 hover:bg-white 
                hover:text-[#DDA200] transition-colors"
            >
              <Eye className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        <Link href={`/home/shop/products/${product.slug}`}>
          <p className="text-xs text-[#DDA200] font-medium uppercase tracking-wide mb-1">
            {product.category}
          </p>
          <h3 className="font-bold text-stone-800 mb-2 line-clamp-2 hover:text-[#DDA200] transition-colors">
            {product.name}
          </h3>
        </Link>

        {/* Rating */}
        <div className="flex items-center gap-1 mb-3">
          <div className="flex">
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
          <span className="text-xs text-stone-500 ml-1">
            {product.reviewCount > 0
              ? `(${product.reviewCount})`
              : "No reviews"}
          </span>
        </div>

        {/* Price & Stock */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-lg font-bold text-[#DDA200]">
              {formatCurrency(product.price)}
            </span>
            {product.originalPrice && (
              <span className="text-sm text-stone-400 line-through">
                {formatCurrency(product.originalPrice)}
              </span>
            )}
          </div>
          {!product.inStock && (
            <span className="text-xs text-red-500 font-medium">
              Out of Stock
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
