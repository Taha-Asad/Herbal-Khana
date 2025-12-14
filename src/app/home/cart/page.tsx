// app/cart/page.tsx
"use client";

import React, {
  useState,
  useEffect,
  useCallback,
  useMemo,
  useRef,
} from "react";
import Link from "next/link";
import Image from "next/image";
import {
  ShoppingCart,
  Trash2,
  Plus,
  Minus,
  Heart,
  Tag,
  Truck,
  Shield,
  Clock,
  ChevronRight,
  ArrowRight,
  Gift,
  X,
  Check,
  AlertCircle,
  Info,
  RefreshCw,
  Loader2,
  ShoppingBag,
  CreditCard,
  Lock,
  Bookmark,
  BookmarkCheck,
  ChevronDown,
  MapPin,
  Sparkles,
  BadgePercent,
  RotateCcw,
} from "lucide-react";
import {
  CartItem,
  CartSummary,
  PromoCode,
  RecommendedProduct,
  ShippingOption,
} from "@/types/cart";
import {
  mockCartItems,
  mockRecommendedProducts,
  mockSavedItems,
  shippingOptions,
  validPromoCodes,
} from "@/lib/cart";

export const CartAPI = {
  async getCart(): Promise<{ items: CartItem[]; savedItems: CartItem[] }> {
    await new Promise((resolve) => setTimeout(resolve, 500));
    return { items: mockCartItems, savedItems: mockSavedItems };
  },

  async updateQuantity(itemId: string, quantity: number): Promise<CartItem> {
    await new Promise((resolve) => setTimeout(resolve, 300));
    const item = mockCartItems.find((i) => i.id === itemId);
    if (!item) throw new Error("Item not found");
    return { ...item, quantity };
  },

  async removeItem(itemId: string): Promise<void> {
    await new Promise((resolve) => setTimeout(resolve, 300));
  },

  async saveForLater(itemId: string): Promise<void> {
    await new Promise((resolve) => setTimeout(resolve, 300));
  },

  async moveToCart(itemId: string): Promise<void> {
    await new Promise((resolve) => setTimeout(resolve, 300));
  },

  async applyPromoCode(
    code: string,
    subtotal: number
  ): Promise<PromoCode | null> {
    await new Promise((resolve) => setTimeout(resolve, 500));
    const promo = validPromoCodes.find(
      (p) => p.code.toLowerCase() === code.toLowerCase()
    );
    if (!promo) return null;
    if (promo.minOrderAmount && subtotal < promo.minOrderAmount) return null;
    return promo;
  },

  async getRecommendations(): Promise<RecommendedProduct[]> {
    await new Promise((resolve) => setTimeout(resolve, 400));
    return mockRecommendedProducts;
  },
};

// =============================================================================
// UTILITY FUNCTIONS
// =============================================================================
const formatCurrency = (amount: number): string => {
  return `PKR ${amount.toLocaleString("en-PK")}`;
};

const calculateDiscount = (original: number, current: number): number => {
  return Math.round(((original - current) / original) * 100);
};

// =============================================================================
// CUSTOM HOOKS
// =============================================================================
function useCart() {
  const [items, setItems] = useState<CartItem[]>([]);
  const [savedItems, setSavedItems] = useState<CartItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [updatingItems, setUpdatingItems] = useState<Set<string>>(new Set());

  useEffect(() => {
    loadCart();
  }, []);

  const loadCart = async () => {
    setIsLoading(true);
    try {
      const { items, savedItems } = await CartAPI.getCart();
      setItems(items);
      setSavedItems(savedItems);
    } catch (error) {
      console.error("Failed to load cart:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const updateQuantity = useCallback(
    async (itemId: string, quantity: number) => {
      if (quantity < 1) return;

      setUpdatingItems((prev) => new Set(prev).add(itemId));
      try {
        await CartAPI.updateQuantity(itemId, quantity);
        setItems((prev) =>
          prev.map((item) =>
            item.id === itemId ? { ...item, quantity } : item
          )
        );
      } catch (error) {
        console.error("Failed to update quantity:", error);
      } finally {
        setUpdatingItems((prev) => {
          const next = new Set(prev);
          next.delete(itemId);
          return next;
        });
      }
    },
    []
  );

  const removeItem = useCallback(async (itemId: string) => {
    setUpdatingItems((prev) => new Set(prev).add(itemId));
    try {
      await CartAPI.removeItem(itemId);
      setItems((prev) => prev.filter((item) => item.id !== itemId));
    } catch (error) {
      console.error("Failed to remove item:", error);
    } finally {
      setUpdatingItems((prev) => {
        const next = new Set(prev);
        next.delete(itemId);
        return next;
      });
    }
  }, []);

  const saveForLater = useCallback(
    async (itemId: string) => {
      setUpdatingItems((prev) => new Set(prev).add(itemId));
      try {
        await CartAPI.saveForLater(itemId);
        const item = items.find((i) => i.id === itemId);
        if (item) {
          setItems((prev) => prev.filter((i) => i.id !== itemId));
          setSavedItems((prev) => [
            ...prev,
            { ...item, isSavedForLater: true },
          ]);
        }
      } catch (error) {
        console.error("Failed to save for later:", error);
      } finally {
        setUpdatingItems((prev) => {
          const next = new Set(prev);
          next.delete(itemId);
          return next;
        });
      }
    },
    [items]
  );

  const moveToCart = useCallback(
    async (itemId: string) => {
      setUpdatingItems((prev) => new Set(prev).add(itemId));
      try {
        await CartAPI.moveToCart(itemId);
        const item = savedItems.find((i) => i.id === itemId);
        if (item) {
          setSavedItems((prev) => prev.filter((i) => i.id !== itemId));
          setItems((prev) => [...prev, { ...item, isSavedForLater: false }]);
        }
      } catch (error) {
        console.error("Failed to move to cart:", error);
      } finally {
        setUpdatingItems((prev) => {
          const next = new Set(prev);
          next.delete(itemId);
          return next;
        });
      }
    },
    [savedItems]
  );

  const clearCart = useCallback(() => {
    setItems([]);
  }, []);

  return {
    items,
    savedItems,
    isLoading,
    updatingItems,
    updateQuantity,
    removeItem,
    saveForLater,
    moveToCart,
    clearCart,
    refresh: loadCart,
  };
}

function usePromoCode(subtotal: number) {
  const [promoCode, setPromoCode] = useState("");
  const [appliedPromo, setAppliedPromo] = useState<PromoCode | null>(null);
  const [isApplying, setIsApplying] = useState(false);
  const [error, setError] = useState("");

  const applyCode = async () => {
    if (!promoCode.trim()) return;

    setIsApplying(true);
    setError("");

    try {
      const promo = await CartAPI.applyPromoCode(promoCode, subtotal);
      if (promo) {
        setAppliedPromo(promo);
        setPromoCode("");
      } else {
        setError("Invalid promo code or minimum order amount not met");
      }
    } catch {
      setError("Failed to apply promo code");
    } finally {
      setIsApplying(false);
    }
  };

  const removeCode = () => {
    setAppliedPromo(null);
    setError("");
  };

  const calculatePromoDiscount = useCallback(
    (subtotal: number, shippingCost: number): number => {
      if (!appliedPromo) return 0;

      switch (appliedPromo.type) {
        case "percentage":
          const percentageDiscount = (subtotal * appliedPromo.value) / 100;
          return appliedPromo.maxDiscount
            ? Math.min(percentageDiscount, appliedPromo.maxDiscount)
            : percentageDiscount;
        case "fixed":
          return appliedPromo.value;
        case "free_shipping":
          return shippingCost;
        default:
          return 0;
      }
    },
    [appliedPromo]
  );

  return {
    promoCode,
    setPromoCode,
    appliedPromo,
    isApplying,
    error,
    applyCode,
    removeCode,
    calculatePromoDiscount,
  };
}

// =============================================================================
// COMPONENTS
// =============================================================================

// Quantity Selector Component
interface QuantitySelectorProps {
  quantity: number;
  maxQuantity: number;
  isUpdating: boolean;
  onIncrease: () => void;
  onDecrease: () => void;
  onChange: (value: number) => void;
}

function QuantitySelector({
  quantity,
  maxQuantity,
  isUpdating,
  onIncrease,
  onDecrease,
  onChange,
}: QuantitySelectorProps) {
  return (
    <div className="flex items-center gap-1">
      <button
        onClick={onDecrease}
        disabled={quantity <= 1 || isUpdating}
        className="w-9 h-9 flex items-center justify-center rounded-lg border-2 
          border-stone-200 text-stone-600 hover:border-[#DDA200] hover:text-[#DDA200]
          disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
        aria-label="Decrease quantity"
      >
        <Minus className="w-4 h-4" />
      </button>

      <div className="relative">
        <input
          type="number"
          value={quantity}
          onChange={(e) => {
            const val = parseInt(e.target.value);
            if (!isNaN(val) && val >= 1 && val <= maxQuantity) {
              onChange(val);
            }
          }}
          min={1}
          max={maxQuantity}
          disabled={isUpdating}
          className="w-14 h-9 text-center border-2 border-stone-200 rounded-lg 
            font-semibold text-stone-800 focus:border-[#DDA200] focus:outline-none
            disabled:opacity-50 transition-colors duration-200
            [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none 
            [&::-webkit-inner-spin-button]:appearance-none"
        />
        {isUpdating && (
          <div className="absolute inset-0 flex items-center justify-center bg-white/80 rounded-lg">
            <Loader2 className="w-4 h-4 animate-spin text-[#DDA200]" />
          </div>
        )}
      </div>

      <button
        onClick={onIncrease}
        disabled={quantity >= maxQuantity || isUpdating}
        className="w-9 h-9 flex items-center justify-center rounded-lg border-2 
          border-stone-200 text-stone-600 hover:border-[#DDA200] hover:text-[#DDA200]
          disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
        aria-label="Increase quantity"
      >
        <Plus className="w-4 h-4" />
      </button>
    </div>
  );
}

// Cart Item Card Component
interface CartItemCardProps {
  item: CartItem;
  isUpdating: boolean;
  onUpdateQuantity: (quantity: number) => void;
  onRemove: () => void;
  onSaveForLater: () => void;
}

function CartItemCard({
  item,
  isUpdating,
  onUpdateQuantity,
  onRemove,
  onSaveForLater,
}: CartItemCardProps) {
  const discount = item.originalPrice
    ? calculateDiscount(item.originalPrice, item.price)
    : 0;

  return (
    <div
      className={`group bg-white rounded-2xl border-2 border-stone-200 p-4 md:p-6
        hover:border-[#DDA200]/50 hover:shadow-lg transition-all duration-300
        ${isUpdating ? "opacity-70" : ""}`}
    >
      <div className="flex gap-4 md:gap-6">
        {/* Product Image */}
        <div className="relative w-24 h-24 md:w-32 md:h-32 flex-shrink-0">
          <div className="w-full h-full bg-stone-100 rounded-xl overflow-hidden">
            <Image
              src={item.image}
              alt={item.name}
              width={128}
              height={128}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
          </div>
          {discount > 0 && (
            <span className="absolute -top-2 -left-2 px-2 py-1 bg-red-500 text-white text-xs font-bold rounded-lg shadow">
              -{discount}%
            </span>
          )}
        </div>

        {/* Product Details */}
        <div className="flex-1 min-w-0">
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              <Link
                href={`/products/${item.productId}`}
                className="font-bold text-stone-800 hover:text-[#DDA200] transition-colors 
                  line-clamp-2 text-sm md:text-base"
              >
                {item.name}
              </Link>

              {/* Variant Info */}
              {item.variant && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {item.variant.color && (
                    <span className="text-xs px-2 py-1 bg-stone-100 text-stone-600 rounded-md">
                      {item.variant.color}
                    </span>
                  )}
                  {item.variant.size && (
                    <span className="text-xs px-2 py-1 bg-stone-100 text-stone-600 rounded-md">
                      {item.variant.size}
                    </span>
                  )}
                </div>
              )}

              <p className="text-xs text-stone-400 mt-1">SKU: {item.sku}</p>

              {/* Stock Status */}
              {item.inStock ? (
                <div className="flex items-center gap-1 mt-2">
                  <Check className="w-3.5 h-3.5 text-green-500" />
                  <span className="text-xs text-green-600 font-medium">
                    In Stock
                    {item.stockCount && item.stockCount <= 5 && (
                      <span className="text-orange-500 ml-1">
                        (Only {item.stockCount} left)
                      </span>
                    )}
                  </span>
                </div>
              ) : (
                <div className="flex items-center gap-1 mt-2">
                  <AlertCircle className="w-3.5 h-3.5 text-red-500" />
                  <span className="text-xs text-red-600 font-medium">
                    Out of Stock
                  </span>
                </div>
              )}

              {/* Estimated Delivery */}
              {item.estimatedDelivery && (
                <div className="flex items-center gap-1 mt-1">
                  <Truck className="w-3.5 h-3.5 text-stone-400" />
                  <span className="text-xs text-stone-500">
                    Delivery: {item.estimatedDelivery}
                  </span>
                </div>
              )}
            </div>

            {/* Price - Mobile */}
            <div className="md:hidden flex items-center gap-2">
              <span className="font-bold text-[#DDA200]">
                {formatCurrency(item.price)}
              </span>
              {item.originalPrice && (
                <span className="text-sm text-stone-400 line-through">
                  {formatCurrency(item.originalPrice)}
                </span>
              )}
            </div>
          </div>

          {/* Bottom Row */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mt-4">
            {/* Quantity & Actions */}
            <div className="flex items-center gap-4">
              <QuantitySelector
                quantity={item.quantity}
                maxQuantity={item.maxQuantity}
                isUpdating={isUpdating}
                onIncrease={() => onUpdateQuantity(item.quantity + 1)}
                onDecrease={() => onUpdateQuantity(item.quantity - 1)}
                onChange={onUpdateQuantity}
              />

              <div className="h-6 w-px bg-stone-200" />

              {/* Action Buttons */}
              <div className="flex items-center gap-2">
                <button
                  onClick={onSaveForLater}
                  disabled={isUpdating}
                  className="p-2 text-stone-500 hover:text-[#DDA200] hover:bg-[#DDA200]/10 
                    rounded-lg transition-all duration-200 disabled:opacity-50"
                  title="Save for later"
                >
                  <Bookmark className="w-5 h-5" />
                </button>
                <button
                  onClick={onRemove}
                  disabled={isUpdating}
                  className="p-2 text-stone-500 hover:text-red-500 hover:bg-red-50 
                    rounded-lg transition-all duration-200 disabled:opacity-50"
                  title="Remove item"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Price - Desktop */}
            <div className="hidden md:flex flex-col items-end">
              <span className="text-xl font-bold text-[#DDA200]">
                {formatCurrency(item.price * item.quantity)}
              </span>
              {item.originalPrice && (
                <span className="text-sm text-stone-400 line-through">
                  {formatCurrency(item.originalPrice * item.quantity)}
                </span>
              )}
              {item.quantity > 1 && (
                <span className="text-xs text-stone-500">
                  {formatCurrency(item.price)} each
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Saved Item Card Component
interface SavedItemCardProps {
  item: CartItem;
  isUpdating: boolean;
  onMoveToCart: () => void;
  onRemove: () => void;
}

function SavedItemCard({
  item,
  isUpdating,
  onMoveToCart,
  onRemove,
}: SavedItemCardProps) {
  const discount = item.originalPrice
    ? calculateDiscount(item.originalPrice, item.price)
    : 0;

  return (
    <div
      className={`bg-white rounded-xl border-2 border-stone-200 p-4 
        hover:border-[#DDA200]/50 transition-all duration-300
        ${isUpdating ? "opacity-70" : ""}`}
    >
      <div className="flex gap-4">
        {/* Image */}
        <div className="relative w-20 h-20 flex-shrink-0">
          <div className="w-full h-full bg-stone-100 rounded-lg overflow-hidden">
            <Image
              src={item.image}
              alt={item.name}
              width={80}
              height={80}
              className="w-full h-full object-cover"
            />
          </div>
          {discount > 0 && (
            <span className="absolute -top-1 -left-1 px-1.5 py-0.5 bg-red-500 text-white text-[10px] font-bold rounded">
              -{discount}%
            </span>
          )}
        </div>

        {/* Details */}
        <div className="flex-1 min-w-0">
          <h4 className="font-semibold text-stone-800 text-sm line-clamp-2">
            {item.name}
          </h4>
          <div className="flex items-center gap-2 mt-1">
            <span className="font-bold text-[#DDA200] text-sm">
              {formatCurrency(item.price)}
            </span>
            {item.originalPrice && (
              <span className="text-xs text-stone-400 line-through">
                {formatCurrency(item.originalPrice)}
              </span>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 mt-3">
            <button
              onClick={onMoveToCart}
              disabled={isUpdating || !item.inStock}
              className="flex-1 flex items-center justify-center gap-1 px-3 py-2 
                bg-[#DDA200] text-white text-xs font-semibold rounded-lg
                hover:bg-[#b38600] disabled:opacity-50 disabled:cursor-not-allowed
                transition-colors duration-200"
            >
              <ShoppingCart className="w-3.5 h-3.5" />
              Move to Cart
            </button>
            <button
              onClick={onRemove}
              disabled={isUpdating}
              className="p-2 text-stone-400 hover:text-red-500 hover:bg-red-50 
                rounded-lg transition-all duration-200"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Promo Code Input Component
interface PromoCodeInputProps {
  promoCode: string;
  setPromoCode: (code: string) => void;
  appliedPromo: PromoCode | null;
  isApplying: boolean;
  error: string;
  onApply: () => void;
  onRemove: () => void;
}

function PromoCodeInput({
  promoCode,
  setPromoCode,
  appliedPromo,
  isApplying,
  error,
  onApply,
  onRemove,
}: PromoCodeInputProps) {
  const [isOpen, setIsOpen] = useState(!!appliedPromo);

  return (
    <div className="bg-white rounded-2xl border-2 border-stone-200 overflow-hidden">
      {/* Header */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-4 hover:bg-stone-50 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="p-2 bg-[#DDA200]/10 rounded-lg">
            <Tag className="w-5 h-5 text-[#DDA200]" />
          </div>
          <span className="font-semibold text-stone-800">
            {appliedPromo ? "Promo Code Applied" : "Have a Promo Code?"}
          </span>
        </div>
        <ChevronDown
          className={`w-5 h-5 text-stone-400 transition-transform duration-300 ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      {/* Content */}
      {isOpen && (
        <div className="px-4 pb-4 border-t border-stone-100">
          <div className="pt-4">
            {appliedPromo ? (
              <div className="flex items-center justify-between p-3 bg-green-50 rounded-xl border border-green-200">
                <div className="flex items-center gap-2">
                  <Check className="w-5 h-5 text-green-500" />
                  <div>
                    <p className="font-semibold text-green-700">
                      {appliedPromo.code}
                    </p>
                    <p className="text-xs text-green-600">
                      {appliedPromo.description}
                    </p>
                  </div>
                </div>
                <button
                  onClick={onRemove}
                  className="p-1 text-green-600 hover:text-red-500 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={promoCode}
                    onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                    placeholder="Enter promo code"
                    className="flex-1 px-4 py-3 border-2 border-stone-200 rounded-xl
                      focus:border-[#DDA200] focus:outline-none transition-colors
                      placeholder:text-stone-400 text-stone-800 font-medium uppercase"
                  />
                  <button
                    onClick={onApply}
                    disabled={!promoCode.trim() || isApplying}
                    className="px-6 py-3 bg-[#DDA200] text-white font-semibold rounded-xl
                      hover:bg-[#b38600] disabled:opacity-50 disabled:cursor-not-allowed
                      transition-all duration-200 flex items-center gap-2"
                  >
                    {isApplying ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      "Apply"
                    )}
                  </button>
                </div>
                {error && (
                  <p className="text-sm text-red-500 flex items-center gap-1">
                    <AlertCircle className="w-4 h-4" />
                    {error}
                  </p>
                )}

                {/* Available Promo Codes */}
                <div className="pt-2">
                  <p className="text-xs text-stone-500 mb-2">
                    Available codes:
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {validPromoCodes.map((promo) => (
                      <button
                        key={promo.code}
                        onClick={() => setPromoCode(promo.code)}
                        className="px-2 py-1 bg-[#FFF9E6] border border-[#DDA200]/30 
                          text-[#b38600] text-xs font-medium rounded-lg
                          hover:bg-[#DDA200]/20 transition-colors"
                      >
                        {promo.code}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// Shipping Options Component
interface ShippingOptionsProps {
  selectedOption: string;
  onSelect: (optionId: string) => void;
  freeShippingThreshold: number;
  currentSubtotal: number;
}

function ShippingOptions({
  selectedOption,
  onSelect,
  freeShippingThreshold,
  currentSubtotal,
}: ShippingOptionsProps) {
  const amountToFreeShipping = freeShippingThreshold - currentSubtotal;
  const hasFreeShipping = amountToFreeShipping <= 0;

  return (
    <div className="bg-white rounded-2xl border-2 border-stone-200 p-4 md:p-6">
      <h3 className="font-bold text-stone-800 mb-4 flex items-center gap-2">
        <Truck className="w-5 h-5 text-[#DDA200]" />
        Shipping Method
      </h3>

      {/* Free Shipping Progress */}
      {!hasFreeShipping && (
        <div className="mb-4 p-3 bg-[#FFF9E6] rounded-xl border border-[#f3e4b7]">
          <div className="flex items-center gap-2 mb-2">
            <Gift className="w-4 h-4 text-[#DDA200]" />
            <span className="text-sm text-stone-700">
              Add{" "}
              <span className="font-bold text-[#DDA200]">
                {formatCurrency(amountToFreeShipping)}
              </span>{" "}
              more for free standard shipping!
            </span>
          </div>
          <div className="h-2 bg-stone-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-[#DDA200] to-[#b38600] rounded-full transition-all duration-500"
              style={{
                width: `${Math.min(
                  (currentSubtotal / freeShippingThreshold) * 100,
                  100
                )}%`,
              }}
            />
          </div>
        </div>
      )}

      {/* Shipping Options */}
      <div className="space-y-3">
        {shippingOptions.map((option) => {
          const Icon = option.icon;
          const isFreeStandard = hasFreeShipping && option.id === "standard";
          const displayPrice = isFreeStandard ? 0 : option.price;

          return (
            <label
              key={option.id}
              className={`flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer
                transition-all duration-200 ${
                  selectedOption === option.id
                    ? "border-[#DDA200] bg-[#FFF9E6]"
                    : "border-stone-200 hover:border-stone-300"
                }`}
            >
              <input
                type="radio"
                name="shipping"
                value={option.id}
                checked={selectedOption === option.id}
                onChange={() => onSelect(option.id)}
                className="sr-only"
              />
              <div
                className={`w-5 h-5 rounded-full border-2 flex items-center justify-center
                  transition-colors ${
                    selectedOption === option.id
                      ? "border-[#DDA200] bg-[#DDA200]"
                      : "border-stone-300"
                  }`}
              >
                {selectedOption === option.id && (
                  <Check className="w-3 h-3 text-white" />
                )}
              </div>

              <div
                className={`p-2 rounded-lg ${
                  selectedOption === option.id
                    ? "bg-[#DDA200]/20"
                    : "bg-stone-100"
                }`}
              >
                <Icon
                  className={`w-5 h-5 ${
                    selectedOption === option.id
                      ? "text-[#DDA200]"
                      : "text-stone-500"
                  }`}
                />
              </div>

              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-stone-800">
                    {option.name}
                  </span>
                  {isFreeStandard && (
                    <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs font-medium rounded-full">
                      FREE
                    </span>
                  )}
                </div>
                <p className="text-sm text-stone-500">
                  {option.description} • {option.estimatedDays}
                </p>
              </div>

              <span
                className={`font-bold ${
                  isFreeStandard ? "text-green-600" : "text-stone-800"
                }`}
              >
                {isFreeStandard ? (
                  <span className="flex items-center gap-1">
                    <span className="line-through text-stone-400 text-sm">
                      {formatCurrency(option.price)}
                    </span>
                    <span>FREE</span>
                  </span>
                ) : (
                  formatCurrency(displayPrice)
                )}
              </span>
            </label>
          );
        })}
      </div>
    </div>
  );
}

// Order Summary Component
interface OrderSummaryProps {
  summary: CartSummary;
  selectedShipping: ShippingOption | undefined;
  isCheckingOut: boolean;
  onCheckout: () => void;
}

function OrderSummary({
  summary,
  selectedShipping,
  isCheckingOut,
  onCheckout,
}: OrderSummaryProps) {
  return (
    <div className="bg-white rounded-2xl border-2 border-stone-200 overflow-hidden top-4">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#DDA200] to-[#b38600] p-4 text-white">
        <h3 className="font-bold text-lg flex items-center gap-2">
          <CreditCard className="w-5 h-5" />
          Order Summary
        </h3>
      </div>

      {/* Summary Details */}
      <div className="p-4 md:p-6 space-y-4">
        {/* Item Count */}
        <div className="flex justify-between text-sm">
          <span className="text-stone-600">Items ({summary.itemCount})</span>
          <span className="font-medium text-stone-800">
            {formatCurrency(summary.subtotal)}
          </span>
        </div>

        {/* Savings */}
        {summary.savingsTotal > 0 && (
          <div className="flex justify-between text-sm">
            <span className="text-green-600 flex items-center gap-1">
              <BadgePercent className="w-4 h-4" />
              You Save
            </span>
            <span className="font-medium text-green-600">
              -{formatCurrency(summary.savingsTotal)}
            </span>
          </div>
        )}

        {/* Shipping */}
        <div className="flex justify-between text-sm">
          <span className="text-stone-600 flex items-center gap-1">
            <Truck className="w-4 h-4" />
            Shipping
            {selectedShipping && (
              <span className="text-xs text-stone-400">
                ({selectedShipping.name})
              </span>
            )}
          </span>
          <span
            className={`font-medium ${
              summary.shipping === 0 ? "text-green-600" : "text-stone-800"
            }`}
          >
            {summary.shipping === 0 ? "FREE" : formatCurrency(summary.shipping)}
          </span>
        </div>

        {/* Promo Discount */}
        {summary.promoDiscount > 0 && (
          <div className="flex justify-between text-sm">
            <span className="text-green-600 flex items-center gap-1">
              <Tag className="w-4 h-4" />
              Promo Discount
            </span>
            <span className="font-medium text-green-600">
              -{formatCurrency(summary.promoDiscount)}
            </span>
          </div>
        )}

        {/* Tax */}
        <div className="flex justify-between text-sm">
          <span className="text-stone-600">Estimated Tax</span>
          <span className="font-medium text-stone-800">
            {formatCurrency(summary.tax)}
          </span>
        </div>

        {/* Divider */}
        <div className="border-t-2 border-dashed border-stone-200 pt-4">
          <div className="flex justify-between">
            <span className="font-bold text-stone-800 text-lg">Total</span>
            <span className="font-bold text-[#DDA200] text-2xl">
              {formatCurrency(summary.total)}
            </span>
          </div>
        </div>

        {/* Checkout Button */}
        <button
          onClick={onCheckout}
          disabled={isCheckingOut || summary.itemCount === 0}
          className="w-full flex items-center justify-center gap-3 px-6 py-4 
            bg-gradient-to-r from-[#DDA200] to-[#b38600] text-white font-bold text-lg
            rounded-xl shadow-lg shadow-[#DDA200]/30 hover:shadow-xl 
            hover:shadow-[#DDA200]/40 disabled:opacity-60 disabled:cursor-not-allowed
            transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
        >
          {isCheckingOut ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Processing...
            </>
          ) : (
            <>
              <Lock className="w-5 h-5" />
              Proceed to Checkout
            </>
          )}
        </button>

        {/* Trust Badges */}
        <div className="flex items-center justify-center gap-4 pt-4 border-t border-stone-100">
          <div className="flex items-center gap-1 text-xs text-stone-500">
            <Shield className="w-4 h-4 text-green-500" />
            Secure
          </div>
          <div className="flex items-center gap-1 text-xs text-stone-500">
            <Lock className="w-4 h-4 text-green-500" />
            Encrypted
          </div>
          <div className="flex items-center gap-1 text-xs text-stone-500">
            <RotateCcw className="w-4 h-4 text-green-500" />
            Easy Returns
          </div>
        </div>

        {/* Payment Methods */}
        <div className="text-center pt-2">
          <p className="text-xs text-stone-400 mb-2">We Accept</p>
          <div className="flex items-center justify-center gap-3">
            <div className="w-10 h-6 bg-stone-100 rounded flex items-center justify-center text-xs font-bold text-stone-600">
              VISA
            </div>
            <div className="w-10 h-6 bg-stone-100 rounded flex items-center justify-center text-xs font-bold text-stone-600">
              MC
            </div>
            <div className="w-10 h-6 bg-stone-100 rounded flex items-center justify-center text-xs font-bold text-stone-600">
              JCB
            </div>
            <div className="w-10 h-6 bg-stone-100 rounded flex items-center justify-center text-xs font-bold text-stone-600">
              COD
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Recommended Products Component
interface RecommendedProductsProps {
  products: RecommendedProduct[];
  onAddToCart: (productId: string) => void;
}

function RecommendedProducts({
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
                onClick={() => onAddToCart(product.id)}
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

// Empty Cart Component
function EmptyCart() {
  return (
    <div className="bg-white rounded-2xl border-2 border-stone-200 p-8 md:p-16 text-center">
      <div className="w-24 h-24 mx-auto mb-6 bg-[#FFF9E6] rounded-full flex items-center justify-center">
        <ShoppingBag className="w-12 h-12 text-[#DDA200]" />
      </div>
      <h2 className="text-2xl font-bold text-stone-800 mb-2">
        Your Cart is Empty
      </h2>
      <p className="text-stone-600 mb-8 max-w-md mx-auto">
        Looks like you haven&apos;t added anything to your cart yet. Start
        exploring our collection to find something you&apos;ll love!
      </p>
      <Link
        href="/home/shop/products"
        className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r 
          from-[#DDA200] to-[#b38600] text-white font-bold rounded-xl
          shadow-lg shadow-[#DDA200]/30 hover:shadow-xl hover:scale-105
          transition-all duration-300"
      >
        <ShoppingBag className="w-5 h-5" />
        Start Shopping
        <ArrowRight className="w-5 h-5" />
      </Link>
    </div>
  );
}

// Loading Skeleton Component
function CartLoadingSkeleton() {
  return (
    <div className="space-y-4 animate-pulse">
      {[1, 2, 3].map((i) => (
        <div
          key={i}
          className="bg-white rounded-2xl border-2 border-stone-200 p-6"
        >
          <div className="flex gap-6">
            <div className="w-32 h-32 bg-stone-200 rounded-xl" />
            <div className="flex-1 space-y-3">
              <div className="h-5 bg-stone-200 rounded w-3/4" />
              <div className="h-4 bg-stone-200 rounded w-1/2" />
              <div className="h-4 bg-stone-200 rounded w-1/4" />
              <div className="flex gap-4 pt-4">
                <div className="h-10 bg-stone-200 rounded w-32" />
                <div className="h-10 bg-stone-200 rounded w-20" />
              </div>
            </div>
            <div className="h-8 bg-stone-200 rounded w-24" />
          </div>
        </div>
      ))}
    </div>
  );
}

// Cart Header Component
interface CartHeaderProps {
  itemCount: number;
  onClearCart: () => void;
}

function CartHeader({ itemCount, onClearCart }: CartHeaderProps) {
  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-stone-800 flex items-center gap-3">
          <ShoppingCart className="w-8 h-8 text-[#DDA200]" />
          Shopping Cart
        </h1>
        <p className="text-stone-600 mt-1">
          {itemCount} {itemCount === 1 ? "item" : "items"} in your cart
        </p>
      </div>
      {itemCount > 0 && (
        <button
          onClick={onClearCart}
          className="flex items-center gap-2 px-4 py-2 text-red-500 hover:bg-red-50 
            rounded-lg transition-colors font-medium text-sm"
        >
          <Trash2 className="w-4 h-4" />
          Clear Cart
        </button>
      )}
    </div>
  );
}

// =============================================================================
// MAIN PAGE COMPONENT
// =============================================================================
export default function CartPage() {
  const {
    items,
    savedItems,
    isLoading,
    updatingItems,
    updateQuantity,
    removeItem,
    saveForLater,
    moveToCart,
    clearCart,
  } = useCart();

  const [selectedShippingId, setSelectedShippingId] = useState("standard");
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [recommendations, setRecommendations] = useState<RecommendedProduct[]>(
    []
  );

  // Calculate subtotal
  const subtotal = useMemo(() => {
    return items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  }, [items]);

  // Promo code hook
  const {
    promoCode,
    setPromoCode,
    appliedPromo,
    isApplying,
    error: promoError,
    applyCode,
    removeCode,
    calculatePromoDiscount,
  } = usePromoCode(subtotal);

  // Get selected shipping option
  const selectedShipping = useMemo(() => {
    return shippingOptions.find((opt) => opt.id === selectedShippingId);
  }, [selectedShippingId]);

  // Calculate shipping cost (free if over threshold)
  const FREE_SHIPPING_THRESHOLD = 5000;
  const shippingCost = useMemo(() => {
    if (
      subtotal >= FREE_SHIPPING_THRESHOLD &&
      selectedShippingId === "standard"
    ) {
      return 0;
    }
    return selectedShipping?.price || 0;
  }, [subtotal, selectedShipping, selectedShippingId]);

  // Calculate promo discount
  const promoDiscount = useMemo(() => {
    return calculatePromoDiscount(subtotal, shippingCost);
  }, [calculatePromoDiscount, subtotal, shippingCost]);

  // Calculate total savings
  const savingsTotal = useMemo(() => {
    return items.reduce((sum, item) => {
      if (item.originalPrice) {
        return sum + (item.originalPrice - item.price) * item.quantity;
      }
      return sum;
    }, 0);
  }, [items]);

  // Calculate tax (5% of subtotal)
  const TAX_RATE = 0.05;
  const tax = useMemo(() => {
    return Math.round((subtotal - promoDiscount) * TAX_RATE);
  }, [subtotal, promoDiscount]);

  // Calculate total
  const total = useMemo(() => {
    return subtotal + shippingCost + tax - promoDiscount;
  }, [subtotal, shippingCost, tax, promoDiscount]);

  // Order summary
  const summary: CartSummary = {
    subtotal,
    shipping: shippingCost,
    tax,
    discount: 0,
    promoDiscount,
    total,
    itemCount: items.reduce((sum, item) => sum + item.quantity, 0),
    savingsTotal,
  };

  // Load recommendations
  useEffect(() => {
    const loadRecommendations = async () => {
      try {
        const recs = await CartAPI.getRecommendations();
        setRecommendations(recs);
      } catch (error) {
        console.error("Failed to load recommendations:", error);
      }
    };
    loadRecommendations();
  }, []);

  // Handle checkout
  const handleCheckout = async () => {
    setIsCheckingOut(true);
    try {
      // Simulate checkout process
      await new Promise((resolve) => setTimeout(resolve, 1500));
      // Redirect to checkout page
      window.location.href = "/checkout";
    } catch (error) {
      console.error("Checkout failed:", error);
    } finally {
      setIsCheckingOut(false);
    }
  };

  // Handle add to cart from recommendations
  const handleAddToCart = async (productId: string) => {
    // TODO: Implement add to cart functionality
    console.log("Add to cart:", productId);
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
            <CartHeader itemCount={summary.itemCount} onClearCart={clearCart} />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Left Column - Cart Items */}
              <div className="lg:col-span-2 space-y-6">
                {/* Free Shipping Banner */}
                {subtotal < FREE_SHIPPING_THRESHOLD && (
                  <div className="bg-gradient-to-r from-[#FFF9E6] to-[#F7E4B2] rounded-xl p-4 border border-[#f3e4b7]">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-[#DDA200]/20 rounded-lg">
                        <Truck className="w-5 h-5 text-[#DDA200]" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm text-stone-700">
                          Add{" "}
                          <span className="font-bold text-[#DDA200]">
                            {formatCurrency(FREE_SHIPPING_THRESHOLD - subtotal)}
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
                                (subtotal / FREE_SHIPPING_THRESHOLD) * 100
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
                  onApply={applyCode}
                  onRemove={removeCode}
                />

                {/* Shipping Options */}
                <ShippingOptions
                  selectedOption={selectedShippingId}
                  onSelect={setSelectedShippingId}
                  freeShippingThreshold={FREE_SHIPPING_THRESHOLD}
                  currentSubtotal={subtotal}
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
                    onClick={() =>
                      window.scrollTo({ top: 0, behavior: "smooth" })
                    }
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
                  summary={summary}
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
