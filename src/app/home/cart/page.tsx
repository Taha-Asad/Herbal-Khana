"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import {
  Truck,
  Clock,
  ChevronRight,
  Info,
  RefreshCw,
  BookmarkCheck,
  MapPin,
} from "lucide-react";
import type { CartSummary, PromoCode } from "@/types/cart";
import { usePromoCode } from "@/hooks/carthooks/usePromoCode";
import useRecommendations from "@/hooks/carthooks/useRecommendations";
import { shippingOptions } from "@/lib/cart";
import { transformPromoCode } from "@/utils/cart/UtilityFunctions";
import { useCart } from "@/hooks/carthooks/useCart";
import { CartLoadingSkeleton } from "@/components/ui/cart/CartLoadingSkeleton";
import { EmptyCart } from "@/components/ui/cart/EmptyCart";
import { RecommendedProducts } from "@/components/ui/cart/RecommendedProducts";
import { SavedItemCard } from "@/components/ui/cart/SavedItemCard";
import { CartHeader } from "@/components/ui/cart/CartHeader";
import { formatCurrency } from "@/utils/OrderRelated";
import { CartItemCard } from "@/components/ui/cart/CartItemCard";
import { PromoCodeInput } from "@/components/ui/cart/PromoCodeInput";
import { ShippingOptions } from "@/components/ui/cart/ShippingOptions";
import { OrderSummary } from "@/components/ui/cart/OrderSummary";

const FREE_SHIPPING_THRESHOLD = 5000;

export default function CartPage() {
  const {
    items,
    savedItems,
    summary,
    appliedPromoCode,
    selectedShippingId,
    isLoading,
    updatingItems,
    updateQuantity,
    removeItem,
    saveForLater,
    moveToCart,
    clearCart,
    updateShipping,
    refresh,
  } = useCart();

  const {
    promoCode,
    setPromoCode,
    isApplying,
    error: promoError,
    applyCode,
    removeCode,
  } = usePromoCode();

  const { recommendations, addToCart: addRecommendationToCart } =
    useRecommendations();

  const [isCheckingOut, setIsCheckingOut] = useState(false);

  // Transform applied promo code for UI
  const appliedPromo: PromoCode | null = useMemo(() => {
    if (!appliedPromoCode) return null;
    return transformPromoCode(appliedPromoCode);
  }, [appliedPromoCode]);

  // Get selected shipping option
  const selectedShipping = useMemo(() => {
    return shippingOptions.find(
      (opt) => opt.id === (selectedShippingId || "standard")
    );
  }, [selectedShippingId]);

  // Default summary if not loaded
  const displaySummary: CartSummary = summary || {
    subtotal: 0,
    shipping: 0,
    tax: 0,
    discount: 0,
    promoDiscount: 0,
    total: 0,
    itemCount: 0,
    savingsTotal: 0,
  };

  // Handle promo code apply
  const handleApplyPromo = async () => {
    const result = await applyCode();
    if (result.success) {
      await refresh();
    }
  };

  // Handle promo code remove
  const handleRemovePromo = async () => {
    const success = await removeCode();
    if (success) {
      await refresh();
    }
  };

  // Handle shipping change
  const handleShippingChange = async (shippingId: string) => {
    await updateShipping(shippingId);
  };

  // Handle checkout
  const handleCheckout = async () => {
    setIsCheckingOut(true);
    try {
      // TODO: Implement actual checkout logic
      await new Promise((resolve) => setTimeout(resolve, 1500));
      window.location.href = "/checkout";
    } catch (error) {
      console.error("Checkout failed:", error);
    } finally {
      setIsCheckingOut(false);
    }
  };

  // Handle add to cart from recommendations
  const handleAddToCart = async (variantId: string) => {
    await addRecommendationToCart(variantId);
    await refresh();
  };

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-white via-[#FFF8E1]/30 to-white">
      {/* CSS Styles */}
      <style jsx global>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }

        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-fade-in-up {
          animation: fadeInUp 0.5s ease-out forwards;
        }
      `}</style>

      {/* Background Decorations */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/4 -left-48 w-96 h-96 bg-[#DDA200]/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 -right-48 w-96 h-96 bg-[#DDA200]/10 rounded-full blur-3xl" />
      </div>

      {/* Main Content */}
      <div className="relative container mx-auto px-4 py-8 md:py-12">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm mb-6">
          <Link
            href="/"
            className="text-stone-500 hover:text-[#DDA200] transition-colors"
          >
            Home
          </Link>
          <ChevronRight className="w-4 h-4 text-stone-400" />
          <span className="text-stone-800 font-medium">Shopping Cart</span>
        </nav>

        {isLoading ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <CartLoadingSkeleton />
            </div>
            <div>
              <div className="h-96 bg-stone-200 rounded-2xl animate-pulse" />
            </div>
          </div>
        ) : items.length === 0 ? (
          <div className="max-w-2xl mx-auto">
            <EmptyCart />

            {/* Recommendations when cart is empty */}
            {recommendations.length > 0 && (
              <div className="mt-12">
                <RecommendedProducts
                  products={recommendations}
                  onAddToCart={handleAddToCart}
                />
              </div>
            )}

            {/* Saved Items when cart is empty */}
            {savedItems.length > 0 && (
              <div className="mt-8">
                <h3 className="text-lg font-bold text-stone-800 mb-4 flex items-center gap-2">
                  <BookmarkCheck className="w-5 h-5 text-[#DDA200]" />
                  Saved for Later ({savedItems.length})
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {savedItems.map((item) => (
                    <SavedItemCard
                      key={item.id}
                      item={item}
                      isUpdating={updatingItems.has(item.id)}
                      onMoveToCart={() => moveToCart(item.id)}
                      onRemove={() => removeItem(item.id)}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          <>
            <CartHeader
              itemCount={displaySummary.itemCount}
              onClearCart={clearCart}
            />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Left Column - Cart Items */}
              <div className="lg:col-span-2 space-y-6">
                {/* Free Shipping Banner */}
                {displaySummary.subtotal < FREE_SHIPPING_THRESHOLD && (
                  <div className="bg-gradient-to-r from-[#FFF9E6] to-[#F7E4B2] rounded-xl p-4 border border-[#f3e4b7]">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-[#DDA200]/20 rounded-lg">
                        <Truck className="w-5 h-5 text-[#DDA200]" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm text-stone-700">
                          Add{" "}
                          <span className="font-bold text-[#DDA200]">
                            {formatCurrency(
                              FREE_SHIPPING_THRESHOLD - displaySummary.subtotal
                            )}
                          </span>{" "}
                          more to get{" "}
                          <span className="font-bold text-green-600">
                            FREE Standard Shipping!
                          </span>
                        </p>
                        <div className="mt-2 h-2 bg-white rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-[#DDA200] to-[#b38600] rounded-full transition-all duration-500"
                            style={{
                              width: `${
                                (displaySummary.subtotal /
                                  FREE_SHIPPING_THRESHOLD) *
                                100
                              }%`,
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Cart Items */}
                <div className="space-y-4">
                  {items.map((item, index) => (
                    <div
                      key={item.id}
                      className="animate-fade-in-up"
                      style={{ animationDelay: `${index * 100}ms` }}
                    >
                      <CartItemCard
                        item={item}
                        isUpdating={updatingItems.has(item.id)}
                        onUpdateQuantity={(qty) => updateQuantity(item.id, qty)}
                        onRemove={() => removeItem(item.id)}
                        onSaveForLater={() => saveForLater(item.id)}
                      />
                    </div>
                  ))}
                </div>

                {/* Promo Code */}
                <PromoCodeInput
                  promoCode={promoCode}
                  setPromoCode={setPromoCode}
                  appliedPromo={appliedPromo}
                  isApplying={isApplying}
                  error={promoError}
                  onApply={handleApplyPromo}
                  onRemove={handleRemovePromo}
                />

                {/* Shipping Options */}
                <ShippingOptions
                  selectedOption={selectedShippingId || "standard"}
                  onSelect={handleShippingChange}
                  freeShippingThreshold={FREE_SHIPPING_THRESHOLD}
                  currentSubtotal={displaySummary.subtotal}
                />

                {/* Saved Items */}
                {savedItems.length > 0 && (
                  <div className="bg-white rounded-2xl border-2 border-stone-200 p-4 md:p-6">
                    <h3 className="text-lg font-bold text-stone-800 mb-4 flex items-center gap-2">
                      <BookmarkCheck className="w-5 h-5 text-[#DDA200]" />
                      Saved for Later ({savedItems.length})
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {savedItems.map((item) => (
                        <SavedItemCard
                          key={item.id}
                          item={item}
                          isUpdating={updatingItems.has(item.id)}
                          onMoveToCart={() => moveToCart(item.id)}
                          onRemove={() => removeItem(item.id)}
                        />
                      ))}
                    </div>
                  </div>
                )}

                {/* Continue Shopping */}
                <div className="flex items-center justify-between py-4">
                  <Link
                    href="/home/shop/products"
                    className="flex items-center gap-2 text-[#DDA200] hover:text-[#b38600] 
                      font-medium transition-colors"
                  >
                    <ChevronRight className="w-5 h-5 rotate-180" />
                    Continue Shopping
                  </Link>
                  <button
                    onClick={refresh}
                    className="flex items-center gap-2 text-stone-500 hover:text-stone-700 font-medium transition-colors"
                  >
                    <RefreshCw className="w-4 h-4" />
                    Update Cart
                  </button>
                </div>
              </div>

              {/* Right Column - Order Summary */}
              <div className="space-y-6">
                <OrderSummary
                  summary={displaySummary}
                  selectedShipping={selectedShipping}
                  isCheckingOut={isCheckingOut}
                  onCheckout={handleCheckout}
                />

                {/* Delivery Info */}
                <div className="bg-[#FFF9E6] rounded-xl p-4 border border-[#f3e4b7]">
                  <div className="flex items-start gap-3">
                    <MapPin className="w-5 h-5 text-[#DDA200] mt-0.5" />
                    <div>
                      <p className="font-semibold text-stone-800 text-sm">
                        Delivering to Islamabad
                      </p>
                      <p className="text-xs text-stone-600 mt-0.5">
                        Estimated delivery: {selectedShipping?.estimatedDays}
                      </p>
                      <button className="text-xs text-[#DDA200] font-medium mt-1 hover:underline">
                        Change location
                      </button>
                    </div>
                  </div>
                </div>

                {/* Help Section */}
                <div className="bg-white rounded-xl border border-stone-200 p-4">
                  <h4 className="font-semibold text-stone-800 text-sm mb-3">
                    Need Help?
                  </h4>
                  <div className="space-y-2">
                    <Link
                      href="/shipping-returns"
                      className="flex items-center gap-2 text-sm text-stone-600 hover:text-[#DDA200] transition-colors"
                    >
                      <Truck className="w-4 h-4" />
                      Shipping & Returns
                    </Link>
                    <Link
                      href="/faqs"
                      className="flex items-center gap-2 text-sm text-stone-600 hover:text-[#DDA200] transition-colors"
                    >
                      <Info className="w-4 h-4" />
                      FAQs
                    </Link>
                    <Link
                      href="/contact"
                      className="flex items-center gap-2 text-sm text-stone-600 hover:text-[#DDA200] transition-colors"
                    >
                      <Clock className="w-4 h-4" />
                      Contact Support
                    </Link>
                  </div>
                </div>
              </div>
            </div>

            {/* Recommendations */}
            {recommendations.length > 0 && (
              <div className="mt-12">
                <RecommendedProducts
                  products={recommendations}
                  onAddToCart={handleAddToCart}
                />
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
