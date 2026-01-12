// src/components/product/ProductDetails.tsx
"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  ChevronRight,
  Heart,
  Share2,
  ShoppingCart,
  Truck,
  Shield,
  RotateCcw,
  Check,
  Loader2,
  Minus,
  Plus,
  Star,
  AlertCircle,
} from "lucide-react";
import toast from "react-hot-toast";

import type { Product, ProductListItem, ProductVariant } from "@/types/product";
import {
  isProductWishlisted,
  toggleWishlist,
} from "@/app/action/home/wishlist.action";
import { addToCart } from "@/app/action/home/cart.actions";
import ProductGallery from "./ProductGallery";
import ProductTabs from "./ProductTabs";
import RelatedProducts from "./RelatedProducts";

interface ProductDetailsProps {
  product: Product;
  relatedProducts: ProductListItem[];
}

const formatCurrency = (amount: number): string => {
  return `PKR ${amount.toLocaleString("en-PK")}`;
};

export default function ProductDetails({
  product,
  relatedProducts,
}: ProductDetailsProps) {
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant>(
    product.variants[0]
  );
  const [quantity, setQuantity] = useState(1);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [isUpdatingWishlist, setIsUpdatingWishlist] = useState(false);

  // Check wishlist status on mount
  React.useEffect(() => {
    const checkWishlist = async () => {
      const wishlisted = await isProductWishlisted(product.id);
      setIsWishlisted(wishlisted);
    };
    checkWishlist();
  }, [product.id]);

  // Get unique sizes and scents
  const sizes = [...new Set(product.variants.map((v) => v.size))];
  const scents = [
    ...new Set(product.variants.filter((v) => v.scent).map((v) => v.scent)),
  ];

  // Find variant by size and scent
  const findVariant = (size: string, scent?: string | null) => {
    return product.variants.find(
      (v) =>
        v.size === size &&
        (scent
          ? v.scent === scent
          : !v.scent || v.scent === selectedVariant.scent)
    );
  };

  // Handle size change
  const handleSizeChange = (size: string) => {
    const variant = findVariant(size, selectedVariant.scent);
    if (variant) {
      setSelectedVariant(variant);
      setQuantity(1);
    }
  };

  // Handle scent change
  const handleScentChange = (scent: string) => {
    const variant = findVariant(selectedVariant.size, scent);
    if (variant) {
      setSelectedVariant(variant);
      setQuantity(1);
    }
  };

  // Handle quantity change
  const handleQuantityChange = (delta: number) => {
    const newQuantity = quantity + delta;
    if (newQuantity >= 1 && newQuantity <= selectedVariant.stock) {
      setQuantity(newQuantity);
    }
  };

  // Handle add to cart
  const handleAddToCart = async () => {
    if (!selectedVariant || selectedVariant.stock === 0) return;

    setIsAddingToCart(true);
    try {
      const result = await addToCart(selectedVariant.id, quantity);
      if (result.success) {
        toast.success(`Added ${quantity} item(s) to cart!`);
      } else {
        toast.error(result.message || "Failed to add to cart");
      }
    } catch (error) {
      toast.error("Failed to add to cart");
      console.log(error);
    } finally {
      setIsAddingToCart(false);
    }
  };

  // Handle wishlist toggle
  const handleToggleWishlist = async () => {
    setIsUpdatingWishlist(true);
    try {
      const result = await toggleWishlist(product.id);
      if (result.success) {
        setIsWishlisted(result.isWishlisted);
        toast.success(result.message);
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      toast.error("Failed to update wishlist");
      console.log(error);
    } finally {
      setIsUpdatingWishlist(false);
    }
  };

  // Handle share
  const handleShare = async () => {
    const url = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({
          title: product.name,
          text: product.shortDescription || "",
          url,
        });
      } catch (error) {
        // User cancelled or error
        console.log(error);
      }
    } else {
      await navigator.clipboard.writeText(url);
      toast.success("Link copied to clipboard!");
    }
  };

  // Calculate discount for selected variant
  const variantDiscount =
    product.costPrice && product.costPrice > selectedVariant.price
      ? Math.round(
          ((product.costPrice - selectedVariant.price) / product.costPrice) *
            100
        )
      : null;

  return (
    <div className="min-h-screen pt-35 pb-10 bg-gradient-to-br from-white via-[#FFF8E1]/20 to-white">
      {/* Background Decorations */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/4 -left-48 w-96 h-96 bg-[#DDA200]/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 -right-48 w-96 h-96 bg-[#DDA200]/5 rounded-full blur-3xl" />
      </div>

      <div className="relative container mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm mb-8 flex-wrap">
          <Link
            href="/"
            className="text-stone-500 hover:text-[#DDA200] transition-colors font-medium"
          >
            Home
          </Link>
          <ChevronRight className="w-4 h-4 text-stone-400" />
          <Link
            href="/home/shop/products"
            className="text-stone-500 hover:text-[#DDA200] transition-colors font-medium"
          >
            Products
          </Link>
          {product.category && (
            <>
              <ChevronRight className="w-4 h-4 text-stone-400" />
              <Link
                href={`/home/shop/products?categories=${product.category.slug}`}
                className="text-stone-500 hover:text-[#DDA200] transition-colors font-medium"
              >
                {product.category.name}
              </Link>
            </>
          )}
          <ChevronRight className="w-4 h-4 text-stone-400" />
          <span className="text-[#DDA200] font-semibold truncate max-w-[200px]">
            {product.name}
          </span>
        </nav>

        {/* Main Product Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 mb-16">
          {/* Product Gallery */}
          <ProductGallery images={product.images} productName={product.name} />

          {/* Product Info */}
          <div className="space-y-6">
            {/* Category & Badges */}
            <div className="flex items-center gap-3 flex-wrap">
              {product.category && (
                <Link
                  href={`/home/shop/products?categories=${product.category.slug}`}
                  className="text-sm font-medium text-[#DDA200] hover:underline"
                >
                  {product.category.name}
                </Link>
              )}
              {product.isNew && (
                <span className="px-2.5 py-1 bg-emerald-100 text-emerald-700 text-xs font-bold rounded-full">
                  NEW
                </span>
              )}
              {product.isBestseller && (
                <span className="px-2.5 py-1 bg-[#FFF9E6] text-[#b38600] text-xs font-bold rounded-full">
                  BESTSELLER
                </span>
              )}
              {variantDiscount && (
                <span className="px-2.5 py-1 bg-red-100 text-red-700 text-xs font-bold rounded-full">
                  -{variantDiscount}% OFF
                </span>
              )}
            </div>

            {/* Product Name */}
            <h1 className="text-3xl md:text-4xl font-bold text-stone-800">
              {product.name}
            </h1>

            {/* Rating */}
            <div className="flex items-center gap-3">
              <div className="flex items-center">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`w-5 h-5 ${
                      i < Math.floor(product.rating)
                        ? "text-[#DDA200] fill-[#DDA200]"
                        : "text-stone-300"
                    }`}
                  />
                ))}
              </div>
              <span className="text-stone-600">
                {product.rating > 0 ? product.rating.toFixed(1) : "0"}(
                {product.reviewCount}{" "}
                {product.reviewCount === 1 ? "review" : "reviews"})
              </span>
            </div>

            {/* Price */}
            <div className="flex items-baseline gap-3">
              <span className="text-3xl md:text-4xl font-bold text-[#DDA200]">
                {formatCurrency(selectedVariant.price)}
              </span>
              {product.costPrice &&
                product.costPrice > selectedVariant.price && (
                  <span className="text-xl text-stone-400 line-through">
                    {formatCurrency(product.costPrice)}
                  </span>
                )}
            </div>

            {/* Short Description */}
            {product.shortDescription && (
              <p className="text-stone-600 leading-relaxed">
                {product.shortDescription}
              </p>
            )}

            {/* Size Selection */}
            {sizes.length > 1 && (
              <div className="space-y-3">
                <label className="block text-sm font-semibold text-stone-800">
                  Size
                </label>
                <div className="flex flex-wrap gap-3">
                  {sizes.map((size) => {
                    const variant = findVariant(size, selectedVariant.scent);
                    const isAvailable = variant && variant.stock > 0;
                    const isSelected = selectedVariant.size === size;

                    return (
                      <button
                        key={size}
                        onClick={() => handleSizeChange(size)}
                        disabled={!isAvailable}
                        className={`px-4 py-3 rounded-xl border-2 font-medium transition-all duration-200
                          ${
                            isSelected
                              ? "border-[#DDA200] bg-[#FFF9E6] text-[#DDA200]"
                              : isAvailable
                              ? "border-stone-200 text-stone-700 hover:border-[#DDA200]"
                              : "border-stone-100 text-stone-300 cursor-not-allowed line-through"
                          }`}
                      >
                        {size}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Scent Selection */}
            {scents.length > 0 && scents[0] && (
              <div className="space-y-3">
                <label className="block text-sm font-semibold text-stone-800">
                  Scent
                </label>
                <div className="flex flex-wrap gap-3">
                  {scents.map((scent) => {
                    if (!scent) return null;
                    const variant = findVariant(selectedVariant.size, scent);
                    const isAvailable = variant && variant.stock > 0;
                    const isSelected = selectedVariant.scent === scent;

                    return (
                      <button
                        key={scent}
                        onClick={() => handleScentChange(scent)}
                        disabled={!isAvailable}
                        className={`px-4 py-3 rounded-xl border-2 font-medium transition-all duration-200
                          ${
                            isSelected
                              ? "border-[#DDA200] bg-[#FFF9E6] text-[#DDA200]"
                              : isAvailable
                              ? "border-stone-200 text-stone-700 hover:border-[#DDA200]"
                              : "border-stone-100 text-stone-300 cursor-not-allowed"
                          }`}
                      >
                        {scent}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Stock Status */}
            <div className="flex items-center gap-2">
              {selectedVariant.stock > 0 ? (
                <>
                  <Check className="w-5 h-5 text-green-500" />
                  <span className="text-green-600 font-medium">
                    In Stock
                    {selectedVariant.stock <=
                      selectedVariant.lowStockThreshold && (
                      <span className="text-orange-500 ml-2">
                        (Only {selectedVariant.stock} left!)
                      </span>
                    )}
                  </span>
                </>
              ) : (
                <>
                  <AlertCircle className="w-5 h-5 text-red-500" />
                  <span className="text-red-500 font-medium">Out of Stock</span>
                </>
              )}
            </div>

            {/* Quantity & Add to Cart */}
            <div className="flex flex-col sm:flex-row gap-4">
              {/* Quantity Selector */}
              <div className="flex items-center border-2 border-stone-200 rounded-xl">
                <button
                  onClick={() => handleQuantityChange(-1)}
                  disabled={quantity <= 1}
                  className="p-3 text-stone-600 hover:text-[#DDA200] disabled:opacity-50 
                    disabled:cursor-not-allowed transition-colors"
                >
                  <Minus className="w-5 h-5" />
                </button>
                <span className="w-12 text-center font-semibold text-stone-800">
                  {quantity}
                </span>
                <button
                  onClick={() => handleQuantityChange(1)}
                  disabled={quantity >= selectedVariant.stock}
                  className="p-3 text-stone-600 hover:text-[#DDA200] disabled:opacity-50 
                    disabled:cursor-not-allowed transition-colors"
                >
                  <Plus className="w-5 h-5" />
                </button>
              </div>

              {/* Add to Cart Button */}
              <button
                onClick={handleAddToCart}
                disabled={isAddingToCart || selectedVariant.stock === 0}
                className="flex-1 flex items-center justify-center gap-3 px-8 py-4 
                  bg-gradient-to-r from-[#DDA200] to-[#b38600] text-white font-bold 
                  text-lg rounded-xl shadow-lg shadow-[#DDA200]/30 
                  hover:shadow-xl hover:shadow-[#DDA200]/40 
                  disabled:opacity-50 disabled:cursor-not-allowed
                  transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
              >
                {isAddingToCart ? (
                  <>
                    <Loader2 className="w-6 h-6 animate-spin" />
                    Adding...
                  </>
                ) : (
                  <>
                    <ShoppingCart className="w-6 h-6" />
                    Add to Cart
                  </>
                )}
              </button>

              {/* Wishlist Button */}
              <button
                onClick={handleToggleWishlist}
                disabled={isUpdatingWishlist}
                className={`p-4 rounded-xl border-2 transition-all duration-200
                  ${
                    isWishlisted
                      ? "border-red-500 bg-red-50 text-red-500"
                      : "border-stone-200 text-stone-600 hover:border-red-500 hover:text-red-500"
                  }`}
              >
                {isUpdatingWishlist ? (
                  <Loader2 className="w-6 h-6 animate-spin" />
                ) : (
                  <Heart
                    className={`w-6 h-6 ${isWishlisted ? "fill-current" : ""}`}
                  />
                )}
              </button>

              {/* Share Button */}
              <button
                onClick={handleShare}
                className="p-4 rounded-xl border-2 border-stone-200 text-stone-600 
                  hover:border-[#DDA200] hover:text-[#DDA200] transition-all duration-200"
              >
                <Share2 className="w-6 h-6" />
              </button>
            </div>

            {/* SKU */}
            <p className="text-sm text-stone-500">
              SKU: <span className="font-medium">{selectedVariant.sku}</span>
            </p>

            {/* Trust Badges */}
            <div className="grid grid-cols-3 gap-4 pt-6 border-t border-stone-200">
              <div className="flex flex-col items-center text-center gap-2">
                <div className="p-3 bg-[#FFF9E6] rounded-full">
                  <Truck className="w-6 h-6 text-[#DDA200]" />
                </div>
                <span className="text-xs text-stone-600 font-medium">
                  Free Shipping
                </span>
                <span className="text-xs text-stone-400">
                  On orders over PKR 5,000
                </span>
              </div>
              <div className="flex flex-col items-center text-center gap-2">
                <div className="p-3 bg-[#FFF9E6] rounded-full">
                  <Shield className="w-6 h-6 text-[#DDA200]" />
                </div>
                <span className="text-xs text-stone-600 font-medium">
                  Secure Payment
                </span>
                <span className="text-xs text-stone-400">100% Protected</span>
              </div>
              <div className="flex flex-col items-center text-center gap-2">
                <div className="p-3 bg-[#FFF9E6] rounded-full">
                  <RotateCcw className="w-6 h-6 text-[#DDA200]" />
                </div>
                <span className="text-xs text-stone-600 font-medium">
                  Easy Returns
                </span>
                <span className="text-xs text-stone-400">
                  7 Days Return Policy
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Product Tabs (Description, Reviews) */}
        <ProductTabs product={product} />

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <RelatedProducts products={relatedProducts} />
        )}
      </div>
    </div>
  );
}
