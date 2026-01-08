// src/hooks/product/useProducts.ts
"use client";

import { useState, useCallback, useEffect, useTransition } from "react";

import type {
  FilterState,
  ProductListItem,
  PaginationInfo,
  AvailableFilters,
} from "@/types/product";
import { getProducts } from "@/app/action/product.action";
import {
  getWishlistProductIds,
  toggleWishlist,
} from "@/app/action/wishlist.action";
import { addToCart } from "@/app/action/cart.actions";

// Default filters
const defaultFilters: FilterState = {
  categories: [],
  priceRange: [0, 100000],
  ratings: [],
  availability: [],
  offers: [],
  sortBy: "featured",
  search: "",
};

// =============================================================================
// useProducts Hook
// =============================================================================

export function useProducts(initialFilters?: Partial<FilterState>) {
  const [products, setProducts] = useState<ProductListItem[]>([]);
  const [pagination, setPagination] = useState<PaginationInfo>({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 12,
  });
  const [availableFilters, setAvailableFilters] = useState<AvailableFilters>({
    categories: [],
    priceRange: { min: 0, max: 100000 },
    ratings: [],
  });
  const [filters, setFilters] = useState<FilterState>({
    ...defaultFilters,
    ...initialFilters,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  // Load products
  const loadProducts = useCallback(
    async (page: number = 1, currentFilters: FilterState = filters) => {
      setIsLoading(true);
      setError(null);

      try {
        console.log("Loading products with filters:", currentFilters);

        const result = await getProducts(currentFilters, page, 12);

        console.log("getProducts result:", result);

        if (result.success && result.data) {
          console.log("Products loaded:", result.data.products.length);
          setProducts(result.data.products);
          setPagination(result.data.pagination);
          if (result.data.filters) {
            setAvailableFilters(result.data.filters);
          }
        } else {
          console.error("getProducts failed:", result.message);
          setError(result.message || "Failed to load products");
          setProducts([]);
        }
      } catch (err) {
        console.error("Failed to load products:", err);
        setError("Failed to load products");
        setProducts([]);
      } finally {
        setIsLoading(false);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [] // Remove filters from dependency to prevent infinite loop
  );

  // Initial load
  useEffect(() => {
    loadProducts(1, filters);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Handle filter changes
  const handleFilterChange = useCallback(
    (newFilters: Partial<FilterState>) => {
      const updatedFilters = { ...filters, ...newFilters };
      setFilters(updatedFilters);

      startTransition(() => {
        loadProducts(1, updatedFilters);
      });
    },
    [filters, loadProducts]
  );

  // Clear all filters
  const handleClearFilters = useCallback(() => {
    setFilters(defaultFilters);
    startTransition(() => {
      loadProducts(1, defaultFilters);
    });
  }, [loadProducts]);

  // Remove specific filter
  const handleRemoveFilter = useCallback(
    (key: keyof FilterState, value?: string | number) => {
      let updatedFilters: FilterState;

      if (key === "priceRange") {
        updatedFilters = { ...filters, priceRange: [0, 100000] };
      } else if (key === "search") {
        updatedFilters = { ...filters, search: "" };
      } else if (key === "sortBy") {
        updatedFilters = { ...filters, sortBy: "featured" };
      } else if (value !== undefined && Array.isArray(filters[key])) {
        const currentArray = filters[key] as (string | number)[];
        updatedFilters = {
          ...filters,
          [key]: currentArray.filter((v) => v !== value),
        };
      } else {
        return;
      }

      setFilters(updatedFilters);
      startTransition(() => {
        loadProducts(1, updatedFilters);
      });
    },
    [filters, loadProducts]
  );

  // Handle page change
  const handlePageChange = useCallback(
    (page: number) => {
      startTransition(() => {
        loadProducts(page, filters);
      });
      window.scrollTo({ top: 0, behavior: "smooth" });
    },
    [filters, loadProducts]
  );

  // Handle search
  const handleSearch = useCallback(
    (query: string) => {
      const updatedFilters = { ...filters, search: query };
      setFilters(updatedFilters);

      startTransition(() => {
        loadProducts(1, updatedFilters);
      });
    },
    [filters, loadProducts]
  );

  // Handle sort change
  const handleSortChange = useCallback(
    (sortBy: string) => {
      handleFilterChange({ sortBy });
    },
    [handleFilterChange]
  );

  // Check if any filters are active
  const hasActiveFilters =
    filters.categories.length > 0 ||
    filters.ratings.length > 0 ||
    filters.availability.length > 0 ||
    filters.offers.length > 0 ||
    filters.priceRange[0] > 0 ||
    filters.priceRange[1] < 100000 ||
    (filters.search && filters.search.trim() !== "");

  return {
    products,
    pagination,
    availableFilters,
    filters,
    isLoading: isLoading || isPending,
    error,
    hasActiveFilters,
    handleFilterChange,
    handleClearFilters,
    handleRemoveFilter,
    handlePageChange,
    handleSearch,
    handleSortChange,
    refresh: () => loadProducts(pagination.currentPage, filters),
  };
}

// =============================================================================
// useWishlist Hook
// =============================================================================

export function useWishlist() {
  const [wishlistIds, setWishlistIds] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState<string | null>(null);

  // Load wishlist IDs on mount
  useEffect(() => {
    const loadWishlist = async () => {
      try {
        const ids = await getWishlistProductIds();
        setWishlistIds(new Set(ids));
      } catch (error) {
        console.error("Failed to load wishlist:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadWishlist();
  }, []);

  const isWishlisted = useCallback(
    (productId: string) => wishlistIds.has(productId),
    [wishlistIds]
  );

  const toggle = useCallback(
    async (
      productId: string
    ): Promise<{
      success: boolean;
      isWishlisted: boolean;
      message: string;
    }> => {
      setIsUpdating(productId);

      try {
        const result = await toggleWishlist(productId);

        if (result.success) {
          setWishlistIds((prev) => {
            const next = new Set(prev);
            if (result.isWishlisted) {
              next.add(productId);
            } else {
              next.delete(productId);
            }
            return next;
          });
          return {
            success: true,
            isWishlisted: result.isWishlisted,
            message: result.message,
          };
        }

        return {
          success: false,
          isWishlisted: wishlistIds.has(productId),
          message: result.message,
        };
      } catch (error) {
        console.error("Failed to toggle wishlist:", error);
        return {
          success: false,
          isWishlisted: wishlistIds.has(productId),
          message: "Failed to update wishlist",
        };
      } finally {
        setIsUpdating(null);
      }
    },
    [wishlistIds]
  );

  const refresh = useCallback(async () => {
    try {
      const ids = await getWishlistProductIds();
      setWishlistIds(new Set(ids));
    } catch (error) {
      console.error("Failed to refresh wishlist:", error);
    }
  }, []);

  return {
    wishlistIds,
    isWishlisted,
    toggle,
    isLoading,
    isUpdating,
    isUpdatingProduct: (productId: string) => isUpdating === productId,
    count: wishlistIds.size,
    refresh,
  };
}

// =============================================================================
// useAddToCart Hook
// =============================================================================

export function useAddToCart() {
  const [isAdding, setIsAdding] = useState<string | null>(null);

  const add = useCallback(
    async (
      variantId: string,
      quantity: number = 1
    ): Promise<{ success: boolean; message?: string }> => {
      setIsAdding(variantId);

      try {
        const result = await addToCart(variantId, quantity);

        if (result.success) {
          return { success: true };
        } else {
          return { success: false, message: result.message };
        }
      } catch (error) {
        console.error("Failed to add to cart:", error);
        return { success: false, message: "Failed to add to cart" };
      } finally {
        setIsAdding(null);
      }
    },
    []
  );

  return {
    add,
    isAdding,
    isAddingVariant: (variantId: string) => isAdding === variantId,
  };
}

// =============================================================================
// useProductActions Hook (Combined)
// =============================================================================

export function useProductActions() {
  const wishlist = useWishlist();
  const cart = useAddToCart();

  return {
    // Wishlist
    wishlist,
    isWishlisted: wishlist.isWishlisted,
    toggleWishlist: wishlist.toggle,
    isUpdatingWishlist: wishlist.isUpdatingProduct,
    wishlistCount: wishlist.count,

    // Cart
    cart,
    addToCart: cart.add,
    isAddingToCart: cart.isAddingVariant,
  };
}
