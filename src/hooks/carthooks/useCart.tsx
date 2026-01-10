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
  const [cartId, setCartId] = useState<string | null>(null); // ✅ FIX
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
        if (!cartData.cartId) {
          console.error("getCartForUI returned no cartId", cartData);
        }

        setCartId(cartData.cartId); // ✅ cartId comes from cart, not items

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

      setItems((prev) =>
        prev.map((item) => (item.id === itemId ? { ...item, quantity } : item))
      );

      try {
        const result = await updateCartItem(itemId, quantity);
        if (result.success && result.data) {
          const cartData = result.data;

          setCartId(cartData.cartId); // ✅ keep cartId in sync

          setItems(
            cartData.items.map((item) => transformCartItem(item, false))
          );
          setSavedItems(
            cartData.savedItems.map((item) => transformCartItem(item, true))
          );
          setSummary(cartData.summary);
        } else {
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

      setItems((prev) => prev.filter((item) => item.id !== itemId));
      setSavedItems((prev) => prev.filter((item) => item.id !== itemId));

      try {
        const result = await removeCartItem(itemId);
        if (result.success && result.data) {
          const cartData = result.data;

          setCartId(cartData.cartId); // ✅

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

          setCartId(cartData.cartId); // ✅

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

  const moveToCart = saveForLater; // same action, no need to duplicate logic

  const handleClearCart = useCallback(async () => {
    try {
      const result = await clearCart();

      if (result.success && result.data) {
        const cartData = result.data;

        setCartId(cartData.cartId); // ✅ still exists, just empty

        setItems(cartData.items.map((item) => transformCartItem(item, false)));
        setSavedItems(
          cartData.savedItems.map((item) => transformCartItem(item, true))
        );
        setSummary(cartData.summary);
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

        setCartId(cartData.cartId); // ✅
        setSummary(cartData.summary);
        setSelectedShippingId(cartData.selectedShippingId);
      }
    } catch (error) {
      console.error("Failed to update shipping:", error);
    }
  }, []);

  return {
    cartId, // ✅ THIS is what you wanted
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
