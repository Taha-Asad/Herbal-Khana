import { applyPromoCode, removePromoCode } from "@/app/action/cart.actions";
import type { PromoCode } from "@/types/cart";
import { transformPromoCode } from "@/utils/cart/UtilityFunctions";
import { useCallback, useState } from "react";

export function usePromoCode() {
  const [promoCode, setPromoCode] = useState("");
  const [isApplying, setIsApplying] = useState(false);
  const [error, setError] = useState("");

  const applyCode = useCallback(async (): Promise<{
    success: boolean;
    promo?: PromoCode;
  }> => {
    if (!promoCode.trim()) return { success: false };

    setIsApplying(true);
    setError("");

    try {
      const result = await applyPromoCode(promoCode);
      if (result.success && result.data?.appliedPromoCode) {
        const promo = transformPromoCode(result.data.appliedPromoCode);
        setPromoCode("");
        return { success: true, promo };
      } else {
        setError("Invalid promo code");
        return { success: false };
      }
    } catch {
      setError("Failed to apply promo code");
      return { success: false };
    } finally {
      setIsApplying(false);
    }
  }, [promoCode]);

  const removeCode = useCallback(async (): Promise<boolean> => {
    try {
      const result = await removePromoCode();
      if (result.success) {
        setError("");
        return true;
      }
      return false;
    } catch {
      return false;
    }
  }, []);

  return {
    promoCode,
    setPromoCode,
    isApplying,
    error,
    applyCode,
    removeCode,
  };
}
