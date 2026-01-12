// app/account/wishlist/page.tsx
"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Heart,
  ShoppingCart,
  Trash2,
  Loader2,
  AlertCircle,
  ExternalLink,
} from "lucide-react";

import type { WishlistItem } from "@/types/account";
import toast from "react-hot-toast";
import {
  clearWishlist,
  getWishlist,
  moveWishlistToCart,
  removeFromWishlist,
} from "@/app/action/home/wishlist.action";

export default function WishlistPage() {
  const [items, setItems] = useState<WishlistItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadingItems, setLoadingItems] = useState<Set<string>>(new Set());
  const [isClearing, setIsClearing] = useState(false);

  useEffect(() => {
    const loadWishlist = async () => {
      setIsLoading(true);
      const result = await getWishlist();
      if (result.success && result.data) {
        setItems(result.data);
      } else {
        toast.error(result.message || "Failed to load wishlist");
      }
      setIsLoading(false);
    };

    loadWishlist();
  }, []); // run once on mount

  const handleRemove = async (productId: string) => {
    setLoadingItems((prev) => new Set(prev).add(productId));
    const result = await removeFromWishlist(productId);
    if (result.success) {
      setItems((prev) => prev.filter((item) => item.productId !== productId));
      toast.success("Removed from wishlist");
    } else {
      toast.error(result.message || "Failed to remove item");
    }
    setLoadingItems((prev) => {
      const next = new Set(prev);
      next.delete(productId);
      return next;
    });
  };

  const handleMoveToCart = async (productId: string) => {
    setLoadingItems((prev) => new Set(prev).add(productId));
    const result = await moveWishlistToCart(productId);
    if (result.success) {
      setItems((prev) => prev.filter((item) => item.productId !== productId));
      toast.success("Moved to cart");
    } else {
      toast.error(result.message || "Failed to move to cart");
    }
    setLoadingItems((prev) => {
      const next = new Set(prev);
      next.delete(productId);
      return next;
    });
  };

  const handleClearAll = async () => {
    if (!confirm("Are you sure you want to clear your wishlist?")) return;

    setIsClearing(true);
    const result = await clearWishlist();
    if (result.success) {
      setItems([]);
      toast.success("Wishlist cleared");
    } else {
      toast.error(result.message || "Failed to clear wishlist");
    }
    setIsClearing(false);
  };

  const formatCurrency = (amount: number) => {
    return `PKR ${amount.toLocaleString()}`;
  };

  const calculateDiscount = (original: number, current: number) => {
    return Math.round(((original - current) / original) * 100);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-[#DDA200]" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-stone-800">My Wishlist</h1>
          <p className="text-stone-600 mt-1">
            {items.length} {items.length === 1 ? "item" : "items"} saved
          </p>
        </div>
        {items.length > 0 && (
          <button
            onClick={handleClearAll}
            disabled={isClearing}
            className="flex items-center gap-2 px-4 py-2 text-red-600 
              hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
          >
            {isClearing ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Trash2 className="w-4 h-4" />
            )}
            Clear All
          </button>
        )}
      </div>

      {/* Wishlist Items */}
      {items.length === 0 ? (
        <div className="bg-white rounded-2xl border-2 border-stone-200 p-12 text-center">
          <div className="w-20 h-20 mx-auto mb-4 bg-[#FFF9E6] rounded-full flex items-center justify-center">
            <Heart className="w-10 h-10 text-[#DDA200]" />
          </div>
          <h3 className="text-lg font-semibold text-stone-800">
            Your wishlist is empty
          </h3>
          <p className="text-stone-600 mt-2 max-w-sm mx-auto">
            Save items you love by clicking the heart icon on any product
          </p>
          <Link
            href="/home/shop/products"
            className="inline-flex items-center gap-2 mt-6 px-6 py-3 
              bg-[#DDA200] text-white font-semibold rounded-xl 
              hover:bg-[#b38600] transition-colors"
          >
            Browse Products
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {items.map((item) => {
            const isItemLoading = loadingItems.has(item.productId);
            const discount = item.originalPrice
              ? calculateDiscount(item.originalPrice, item.price)
              : 0;

            return (
              <div
                key={item.id}
                className={`bg-white rounded-2xl border-2 border-stone-200 overflow-hidden
                  hover:border-[#DDA200]/50 hover:shadow-lg transition-all group
                  ${isItemLoading ? "opacity-70 pointer-events-none" : ""}`}
              >
                {/* Image */}
                <div className="relative aspect-square bg-stone-100">
                  <Link href={`/home/shop/products/${item.slug}`}>
                    <Image
                      src={item.image}
                      alt={item.name}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  </Link>
                  {discount > 0 && (
                    <span className="absolute top-3 left-3 px-2 py-1 bg-red-500 text-white text-xs font-bold rounded-lg">
                      -{discount}%
                    </span>
                  )}
                  {!item.inStock && (
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                      <span className="bg-white px-4 py-2 rounded-lg font-semibold text-stone-800">
                        Out of Stock
                      </span>
                    </div>
                  )}
                  {/* Remove button */}
                  <button
                    onClick={() => handleRemove(item.productId)}
                    className="absolute top-3 right-3 p-2 bg-white rounded-full shadow-md
                      opacity-0 group-hover:opacity-100 transition-opacity
                      hover:bg-red-50 hover:text-red-600"
                  >
                    {isItemLoading ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Trash2 className="w-4 h-4" />
                    )}
                  </button>
                </div>

                {/* Content */}
                <div className="p-4">
                  <Link href={`/home/shop/products/${item.slug}`}>
                    <h3 className="font-semibold text-stone-800 hover:text-[#DDA200] transition-colors line-clamp-2">
                      {item.name}
                    </h3>
                  </Link>

                  {/* Price */}
                  <div className="flex items-center gap-2 mt-2">
                    <span className="font-bold text-[#DDA200]">
                      {formatCurrency(item.price)}
                    </span>
                    {item.originalPrice && (
                      <span className="text-sm text-stone-400 line-through">
                        {formatCurrency(item.originalPrice)}
                      </span>
                    )}
                  </div>

                  {/* Stock indicator */}
                  {item.inStock && item.stockCount && item.stockCount <= 5 && (
                    <p className="text-xs text-orange-600 mt-2 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />
                      Only {item.stockCount} left
                    </p>
                  )}

                  {/* Actions */}
                  <div className="flex gap-2 mt-4">
                    <button
                      onClick={() => handleMoveToCart(item.productId)}
                      disabled={!item.inStock || isItemLoading}
                      className="flex-1 flex items-center justify-center gap-2 px-3 py-2.5
                        bg-[#DDA200] text-white font-semibold rounded-xl
                        hover:bg-[#b38600] transition-colors
                        disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isItemLoading ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <>
                          <ShoppingCart className="w-4 h-4" />
                          Add to Cart
                        </>
                      )}
                    </button>
                    <Link
                      href={`/home/shop/products/${item.slug}`}
                      className="p-2.5 border-2 border-stone-200 rounded-xl
                        hover:border-[#DDA200] hover:text-[#DDA200] transition-colors"
                    >
                      <ExternalLink className="w-5 h-5" />
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
