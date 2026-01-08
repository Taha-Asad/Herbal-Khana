import {
  clearCart,
  getCartForUI,
  removeCartItem,
  toggleSaveForLater,
  updateCartItem,
  updateShippingMethod,
} from "@/app/action/cart.actions";
import type { CartSummary, PromoCodeData, UICartItem } from "@/types/cart";
import { transformCartItem } from "@/utils/cart/UtilityFunctions";
import { useCallback, useEffect, useState, useTransition } from "react";

export function useCart() {
  const [items, setItems] = useState<UICartItem[]>([]);
  const [savedItems, setSavedItems] = useState<UICartItem[]>([]);
  const [summary, setSummary] = useState<CartSummary | null>(null);
  const [appliedPromoCode, setAppliedPromoCode] =
    useState<PromoCodeData | null>(null);
  const [selectedShippingId, setSelectedShippingId] = useState<string | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(true);
  const [updatingItems, setUpdatingItems] = useState<Set<string>>(new Set());
  const [isPending] = useTransition();

  const loadCart = useCallback(async () => {
    setIsLoading(true);
    try {
      const result = await getCartForUI();
      if (result.success && result.data) {
        const cartData = result.data;
        setItems(cartData.items.map((item) => transformCartItem(item, false)));
        setSavedItems(
          cartData.savedItems.map((item) => transformCartItem(item, true))
        );
        setSummary(cartData.summary);
        setAppliedPromoCode(cartData.appliedPromoCode);
        setSelectedShippingId(cartData.selectedShippingId);
      }
    } catch (error) {
      console.error("Failed to load cart:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadCart();
  }, [loadCart]);

  const updateQuantity = useCallback(
    async (itemId: string, quantity: number) => {
      if (quantity < 1) return;

      setUpdatingItems((prev) => new Set(prev).add(itemId));

      // Optimistic update
      setItems((prev) =>
        prev.map((item) => (item.id === itemId ? { ...item, quantity } : item))
      );

      try {
        const result = await updateCartItem(itemId, quantity);
        if (result.success && result.data) {
          const cartData = result.data;
          setItems(
            cartData.items.map((item) => transformCartItem(item, false))
          );
          setSavedItems(
            cartData.savedItems.map((item) => transformCartItem(item, true))
          );
          setSummary(cartData.summary);
        } else {
          // Revert on failure
          await loadCart();
        }
      } catch (error) {
        console.error("Failed to update quantity:", error);
        await loadCart();
      } finally {
        setUpdatingItems((prev) => {
          const next = new Set(prev);
          next.delete(itemId);
          return next;
        });
      }
    },
    [loadCart]
  );

  const removeItem = useCallback(
    async (itemId: string) => {
      setUpdatingItems((prev) => new Set(prev).add(itemId));

      // Optimistic update
      setItems((prev) => prev.filter((item) => item.id !== itemId));
      setSavedItems((prev) => prev.filter((item) => item.id !== itemId));

      try {
        const result = await removeCartItem(itemId);
        if (result.success && result.data) {
          const cartData = result.data;
          setItems(
            cartData.items.map((item) => transformCartItem(item, false))
          );
          setSavedItems(
            cartData.savedItems.map((item) => transformCartItem(item, true))
          );
          setSummary(cartData.summary);
        }
      } catch (error) {
        console.error("Failed to remove item:", error);
        await loadCart();
      } finally {
        setUpdatingItems((prev) => {
          const next = new Set(prev);
          next.delete(itemId);
          return next;
        });
      }
    },
    [loadCart]
  );

  const saveForLater = useCallback(
    async (itemId: string) => {
      setUpdatingItems((prev) => new Set(prev).add(itemId));

      try {
        const result = await toggleSaveForLater(itemId);
        if (result.success && result.data) {
          const cartData = result.data;
          setItems(
            cartData.items.map((item) => transformCartItem(item, false))
          );
          setSavedItems(
            cartData.savedItems.map((item) => transformCartItem(item, true))
          );
          setSummary(cartData.summary);
        }
      } catch (error) {
        console.error("Failed to save for later:", error);
        await loadCart();
      } finally {
        setUpdatingItems((prev) => {
          const next = new Set(prev);
          next.delete(itemId);
          return next;
        });
      }
    },
    [loadCart]
  );

  const moveToCart = useCallback(
    async (itemId: string) => {
      setUpdatingItems((prev) => new Set(prev).add(itemId));

      try {
        const result = await toggleSaveForLater(itemId);
        if (result.success && result.data) {
          const cartData = result.data;
          setItems(
            cartData.items.map((item) => transformCartItem(item, false))
          );
          setSavedItems(
            cartData.savedItems.map((item) => transformCartItem(item, true))
          );
          setSummary(cartData.summary);
        }
      } catch (error) {
        console.error("Failed to move to cart:", error);
        await loadCart();
      } finally {
        setUpdatingItems((prev) => {
          const next = new Set(prev);
          next.delete(itemId);
          return next;
        });
      }
    },
    [loadCart]
  );

  const handleClearCart = useCallback(async () => {
    try {
      const result = await clearCart();

      if (result.success && "data" in result) {
        // TypeScript now knows result has `data`
        const cartData = result.data;
        setItems(cartData.items.map((item) => transformCartItem(item, false)));
        setSavedItems(
          cartData.savedItems.map((item) => transformCartItem(item, true))
        );
        setSummary(cartData.summary);
      } else {
        // Optional: handle failure case
        console.error("Failed to clear cart:", result.message);
      }
    } catch (error) {
      console.error("Failed to clear cart:", error);
    }
  }, []);

  const handleUpdateShipping = useCallback(async (shippingId: string) => {
    setSelectedShippingId(shippingId);

    try {
      const result = await updateShippingMethod(shippingId);
      if (result.success && result.data) {
        const cartData = result.data;
        setSummary(cartData.summary);
        setSelectedShippingId(cartData.selectedShippingId);
      }
    } catch (error) {
      console.error("Failed to update shipping:", error);
    }
  }, []);

  return {
    items,
    savedItems,
    summary,
    appliedPromoCode,
    selectedShippingId,
    isLoading,
    updatingItems,
    isPending,
    updateQuantity,
    removeItem,
    saveForLater,
    moveToCart,
    clearCart: handleClearCart,
    updateShipping: handleUpdateShipping,
    refresh: loadCart,
  };
}
