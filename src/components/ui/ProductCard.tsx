// components/layout/home/Product/ProductCard.tsx
"use client";

import React, { useState, useEffect } from "react";
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
  return `PKR ${amount?.toLocaleString("en-PK") || 0}`;
};

// Use a data URL for placeholder to avoid 404 errors
const PLACEHOLDER_IMAGE =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='400' viewBox='0 0 400 400'%3E%3Crect fill='%23f5f5f4' width='400' height='400'/%3E%3Crect fill='%23e7e5e4' x='100' y='100' width='200' height='200' rx='20'/%3E%3Cpath fill='%23a8a29e' d='M200 150c-27.6 0-50 22.4-50 50s22.4 50 50 50 50-22.4 50-50-22.4-50-50-50zm0 80c-16.5 0-30-13.5-30-30s13.5-30 30-30 30 13.5 30 30-13.5 30-30 30z'/%3E%3Ccircle fill='%23a8a29e' cx='230' cy='170' r='10'/%3E%3C/svg%3E";

export default function ProductCard({
  product,
  viewMode = "grid",
  isWishlisted = false,
  isAddingToCart = false,
  isUpdatingWishlist = false,
  onAddToCart,
  onToggleWishlist,
}: ProductCardProps) {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  // Debug log on mount
  useEffect(() => {
    console.log("ProductCard mounted:", {
      id: product?.id,
      name: product?.name,
      image: product?.image,
      defaultVariantId: product?.defaultVariantId,
    });
  }, [product]);

  // Validate product
  if (!product) {
    console.error("ProductCard: product is null or undefined");
    return null;
  }

  if (!product.id) {
    console.error("ProductCard: product.id is missing", product);
    return null;
  }

  // Get image URL with fallback
  const imageUrl =
    imageError || !product.image ? PLACEHOLDER_IMAGE : product.image;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    console.log("Add to cart clicked:", product.defaultVariantId);
    if (!isAddingToCart && product.inStock && product.defaultVariantId) {
      onAddToCart(product.defaultVariantId);
    }
  };

  const handleToggleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    console.log("Toggle wishlist clicked:", product.id);
    if (!isUpdatingWishlist && product.id) {
      onToggleWishlist(product.id);
    }
  };

  const handleImageError = () => {
    console.log(
      "Image error for product:",
      product.name,
      "URL:",
      product.image
    );
    setImageError(true);
  };

  const handleImageLoad = () => {
    console.log("Image loaded for product:", product.name);
    setImageLoaded(true);
  };

  // List View
  if (viewMode === "list") {
    return (
      <div
        className="group bg-white rounded-2xl border-2 border-stone-200 overflow-hidden 
          hover:border-[#DDA200]/50 hover:shadow-xl transition-all duration-300"
        data-product-id={product.id}
      >
        <div className="flex flex-col md:flex-row">
          {/* Image */}
          <div className="relative w-full md:w-64 h-64 md:h-auto flex-shrink-0 bg-stone-100">
            <Link href={`/home/shop/products/${product.slug || product.id}`}>
              <div className="relative w-full h-full min-h-[200px]">
                {!imageLoaded && !imageError && (
                  <div className="absolute inset-0 bg-gradient-to-br from-stone-100 to-stone-200 animate-pulse" />
                )}
                <Image
                  src={imageUrl}
                  alt={product.name || "Product"}
                  fill
                  sizes="(max-width: 768px) 100vw, 256px"
                  className={`object-cover transition-all duration-500 ${
                    imageLoaded ? "opacity-100" : "opacity-0"
                  } group-hover:scale-105`}
                  onLoad={handleImageLoad}
                  onError={handleImageError}
                  unoptimized={imageUrl.startsWith("data:")}
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
            <Link href={`/home/shop/products/${product.slug || product.id}`}>
              <p className="text-sm text-[#DDA200] font-medium mb-1">
                {product.category || "Uncategorized"}
              </p>
              <h3 className="text-xl font-bold text-stone-800 mb-2 hover:text-[#DDA200] transition-colors line-clamp-2">
                {product.name || "Unnamed Product"}
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
                      i < Math.floor(product.rating || 0)
                        ? "text-[#DDA200] fill-[#DDA200]"
                        : "text-stone-300"
                    }`}
                  />
                ))}
              </div>
              <span className="text-sm text-stone-600">
                {(product.rating || 0) > 0
                  ? (product.rating || 0).toFixed(1)
                  : "No reviews"}
                {(product.reviewCount || 0) > 0 && ` (${product.reviewCount})`}
              </span>
            </div>

            {/* Stock Status */}
            <div className="flex items-center gap-2 mb-4">
              {product.inStock ? (
                <span className="flex items-center gap-1 text-sm text-green-600">
                  <Check className="w-4 h-4" />
                  In Stock
                  {(product.stockCount || 0) <= 5 &&
                    (product.stockCount || 0) > 0 && (
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
                  href={`/home/shop/products/${product.slug || product.id}`}
                  className="p-3 border-2 border-stone-200 rounded-xl text-stone-600 
                    hover:border-[#DDA200] hover:text-[#DDA200] transition-colors"
                >
                  <Eye className="w-5 h-5" />
                </Link>
                <button
                  onClick={handleAddToCart}
                  disabled={
                    !product.inStock ||
                    isAddingToCart ||
                    !product.defaultVariantId
                  }
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
      data-product-id={product.id}
    >
      {/* Image Container */}
      <div className="relative aspect-square overflow-hidden bg-gradient-to-br from-[#FFF9E6] to-stone-100">
        <Link href={`/home/shop/products/${product.slug || product.id}`}>
          {!imageLoaded && !imageError && (
            <div className="absolute inset-0 bg-gradient-to-br from-stone-100 to-stone-200 animate-pulse" />
          )}
          <Image
            src={imageUrl}
            alt={product.name || "Product"}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className={`object-cover transition-all duration-500 ${
              imageLoaded ? "opacity-100" : "opacity-0"
            } group-hover:scale-110`}
            onLoad={handleImageLoad}
            onError={handleImageError}
            unoptimized={imageUrl.startsWith("data:")}
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
                ? "bg-red-500 text-white scale-100 opacity-100"
                : `bg-white text-stone-600 hover:text-red-500 hover:bg-red-50 ${
                    isHovered ? "scale-100 opacity-100" : "scale-90 opacity-100"
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
              disabled={
                !product.inStock || isAddingToCart || !product.defaultVariantId
              }
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
              href={`/home/shop/products/${product.slug || product.id}`}
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
        <Link href={`/home/shop/products/${product.slug || product.id}`}>
          <p className="text-xs text-[#DDA200] font-medium uppercase tracking-wide mb-1">
            {product.category || "Uncategorized"}
          </p>
          <h3 className="font-bold text-stone-800 mb-2 line-clamp-2 hover:text-[#DDA200] transition-colors">
            {product.name || "Unnamed Product"}
          </h3>
        </Link>

        {/* Rating */}
        <div className="flex items-center gap-1 mb-3">
          <div className="flex">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className={`w-3.5 h-3.5 ${
                  i < Math.floor(product.rating || 0)
                    ? "text-[#DDA200] fill-[#DDA200]"
                    : "text-stone-300"
                }`}
              />
            ))}
          </div>
          <span className="text-xs text-stone-500 ml-1">
            {(product.reviewCount || 0) > 0
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
