// components/home/FeaturedProducts.tsx
"use client";

import React, { useEffect, useMemo, useRef, useCallback } from "react";
import Link from "next/link";
import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import ProductCard from "@/components/ui/ProductCard";
import { useProductActions, useProducts } from "@/hooks/product/useProducts";
import toast from "react-hot-toast";

const CARD_WIDTH = 340;
const DRAG_THRESHOLD = 6;

export default function FeaturedProducts() {
  const { products, isLoading } = useProducts();
  const {
    isWishlisted,
    toggleWishlist,
    addToCart,
    isAddingToCart,
    isUpdatingWishlist,
  } = useProductActions();

  const trackRef = useRef<HTMLDivElement>(null);
  const rafRef = useRef<number | null>(null);

  const posRef = useRef(0);
  const startXRef = useRef(0);
  const startPosRef = useRef(0);

  const draggingRef = useRef(false);
  const movedRef = useRef(false);
  const pausedRef = useRef(false);

  const featured = useMemo(
    () => products.filter((p) => p.isFeatured),
    [products]
  );

  const items = useMemo(
    () => [...featured, ...featured, ...featured],
    [featured]
  );

  const setWidth = useCallback(() => {
    if (!trackRef.current) return 0;
    return trackRef.current.scrollWidth / 3;
  }, []);

  // ------------------------
  // AUTO SCROLL
  // ------------------------
  useEffect(() => {
    if (featured.length === 0) return;

    const loop = () => {
      if (!pausedRef.current && !draggingRef.current && trackRef.current) {
        posRef.current += 0.5;
        const width = setWidth();

        if (posRef.current >= width) {
          posRef.current -= width;
        }

        trackRef.current.style.transform = `translateX(-${posRef.current}px)`;
      }

      rafRef.current = requestAnimationFrame(loop);
    };

    rafRef.current = requestAnimationFrame(loop);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [featured.length, setWidth]);

  // ------------------------
  // ARROWS
  // ------------------------
  const scrollBy = (dir: "left" | "right") => {
    pausedRef.current = true;
    const width = setWidth();

    posRef.current += dir === "right" ? CARD_WIDTH : -CARD_WIDTH;

    if (posRef.current < 0) posRef.current += width;
    if (posRef.current >= width) posRef.current -= width;

    if (trackRef.current) {
      trackRef.current.style.transition = "transform 0.3s ease";
      trackRef.current.style.transform = `translateX(-${posRef.current}px)`;

      setTimeout(() => {
        if (trackRef.current) trackRef.current.style.transition = "none";
        pausedRef.current = false;
      }, 300);
    }
  };

  // ------------------------
  // DRAG (MOUSE)
  // ------------------------
  const onMouseDown = (e: React.MouseEvent) => {
    draggingRef.current = true;
    movedRef.current = false;
    pausedRef.current = true;
    startXRef.current = e.clientX;
    startPosRef.current = posRef.current;
  };

  const onMouseMove = (e: React.MouseEvent) => {
    if (!draggingRef.current || !trackRef.current) return;

    const dx = startXRef.current - e.clientX;
    if (!movedRef.current && Math.abs(dx) < DRAG_THRESHOLD) return;

    movedRef.current = true;

    const width = setWidth();
    let next = startPosRef.current + dx;

    if (next < 0) next += width;
    if (next >= width) next -= width;

    posRef.current = next;
    trackRef.current.style.transform = `translateX(-${next}px)`;
  };

  const endDrag = () => {
    draggingRef.current = false;
    pausedRef.current = false;
  };

  // ------------------------
  // ACTIONS
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
      if (result.isWishlisted) {
        toast.success("Added to wishlist");
      } else {
        toast.success("Removed from wishlist");
      }
    } else {
      toast.error(result.message || "Failed to update wishlist");
    }
  };

  if (isLoading || featured.length === 0) return null;

  return (
    <section className="relative my-10 py-20 overflow-hidden">
      <div className="container mx-auto px-4">
        <div className="text-center mb-10">
          <h2 className="text-4xl font-semibold">Featured Products</h2>
          <p className="text-black/60 mt-3">
            Products that disappear faster than your patience
          </p>
        </div>

        <div className="relative group">
          <button
            onClick={() => scrollBy("left")}
            className="hidden md:flex absolute left-0 top-1/2 -translate-y-1/2 z-10
              p-3 bg-white rounded-full shadow opacity-0 group-hover:opacity-100"
          >
            <ChevronLeft />
          </button>

          <button
            onClick={() => scrollBy("right")}
            className="hidden md:flex absolute right-0 top-1/2 -translate-y-1/2 z-10
              p-3 bg-white rounded-full shadow opacity-0 group-hover:opacity-100"
          >
            <ChevronRight />
          </button>

          <div
            className="overflow-hidden cursor-grab active:cursor-grabbing"
            onMouseDown={onMouseDown}
            onMouseMove={onMouseMove}
            onMouseUp={endDrag}
            onMouseLeave={endDrag}
          >
            <div
              ref={trackRef}
              className="flex gap-6 select-none"
              style={{ willChange: "transform" }}
            >
              {items.map((product, i) => (
                <div
                  key={`${product.id}-${i}`}
                  className="flex-shrink-0 w-[300px]"
                  onClickCapture={(e) => {
                    if (movedRef.current) {
                      e.preventDefault();
                      e.stopPropagation();
                    }
                  }}
                >
                  <ProductCard
                    product={product}
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
        </div>

        <div className="flex justify-center mt-10">
          <Link
            href="/home/shop/products"
            className="flex items-center gap-2 px-10 py-3 bg-[#DDA200] text-white rounded-xl"
          >
            View All Products <ArrowRight />
          </Link>
        </div>
      </div>
    </section>
  );
}
