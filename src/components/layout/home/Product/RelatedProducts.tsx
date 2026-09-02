// src/components/product/RelatedProducts.tsx
"use client";

import React, { useRef } from "react";
import { ChevronLeft, ChevronRight, Sparkles } from "lucide-react";
import type { ProductListItem } from "@/types/product";
import ProductCard from "@/components/layout/home/Product/ProductCard";
import { useProductActions } from "@/hooks/product/useProducts";
import toast from "react-hot-toast";

interface RelatedProductsProps {
  products: ProductListItem[];
}

export default function RelatedProducts({ products }: RelatedProductsProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const {
    isWishlisted,
    toggleWishlist,
    addToCart,
    isAddingToCart,
    isUpdatingWishlist,
  } = useProductActions();

  const scroll = (direction: "left" | "right") => {
    if (scrollContainerRef.current) {
      const scrollAmount = 320;
      scrollContainerRef.current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      });
    }
  };

  const handleAddToCart = async (variantId: string) => {
    const result = await addToCart(variantId, 1);
    if (result.success) {
      toast.success("Added to cart!");
    } else {
      toast.error(result.message || "Failed to add to cart");
    }
  };

  const handleToggleWishlist = async (productId: string) => {
    const result = await toggleWishlist(productId);
    if (result.success) {
      toast.success(
        result.isWishlisted ? "Added to wishlist" : "Removed from wishlist"
      );
    } else {
      toast.error(result.message);
    }
  };

  if (products.length === 0) return null;

  return (
    <div className="mb-16">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-stone-800 flex items-center gap-2">
          <Sparkles className="w-6 h-6 text-[#DDA200]" />
          You May Also Like
        </h2>
        <div className="flex gap-2">
          <button
            onClick={() => scroll("left")}
            className="p-2 rounded-lg border-2 border-stone-200 hover:border-[#DDA200] 
              hover:text-[#DDA200] transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            onClick={() => scroll("right")}
            className="p-2 rounded-lg border-2 border-stone-200 hover:border-[#DDA200] 
              hover:text-[#DDA200] transition-colors"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Products Carousel */}
      <div
        ref={scrollContainerRef}
        className="flex gap-6 overflow-x-auto pb-4 scroll-smooth"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        <style jsx>{`
          div::-webkit-scrollbar {
            display: none;
          }
        `}</style>
        {products.map((product) => (
          <div key={product.id} className="flex-shrink-0 w-72">
            <ProductCard
              product={product}
              viewMode="grid"
              isWishlisted={isWishlisted(product.id)}
              isAddingToCart={isAddingToCart(product.defaultVariantId)}
              isUpdatingWishlist={isUpdatingWishlist(product.id)}
              onAddToCart={handleAddToCart}
              onToggleWishlist={handleToggleWishlist}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
