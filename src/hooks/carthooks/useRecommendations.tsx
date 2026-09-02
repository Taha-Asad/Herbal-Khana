import {
  addToCart,
  getRecommendedProducts,
} from "@/app/action/home/cart.actions";
import type { RecommendedProduct } from "@/types/cart";
import { useCallback, useEffect, useState } from "react";

export default function useRecommendations() {
  const [recommendations, setRecommendations] = useState<RecommendedProduct[]>(
    []
  );
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadRecommendations = async () => {
      setIsLoading(true);
      try {
        const result = await getRecommendedProducts();
        if (result?.data) {
          setRecommendations(result.data);
        }
      } catch (error) {
        console.error("Failed to load recommendations:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadRecommendations();
  }, []);

  const handleAddToCart = useCallback(async (variantId: string) => {
    try {
      const result = await addToCart(variantId, 1);
      if (!result.success) {
        console.error("Failed to add to cart:", result.message);
      }
    } catch (error) {
      console.error("Failed to add to cart:", error);
    }
  }, []);

  return {
    recommendations,
    isLoading,
    addToCart: handleAddToCart,
  };
}
