// components/products/ProductsContent.tsx
"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  ChevronDown,
  ChevronRight,
  LayoutGrid,
  List,
  Package,
  Search,
  SlidersHorizontal,
  X,
} from "lucide-react";

import PromotionalBanner from "@/components/ui/PromotionalBanner";
import ProductSkeleton from "./ProductSkeleton";
import Pagination from "./Pagination";
import ProductCard from "./ProductCard";
import ActiveFilters from "@/components/ui/filters/ActiveFilters";
import FilterSidebar from "@/components/ui/filters/FilterSidebar";

import type { FilterState, SortOption } from "@/types/product";
import toast from "react-hot-toast";
import { useProductActions, useProducts } from "@/hooks/product/useProducts";

export const sortOptions: SortOption[] = [
  { id: "featured", name: "Featured" },
  { id: "newest", name: "Newest" },
  { id: "price-low", name: "Price: Low to High" },
  { id: "price-high", name: "Price: High to Low" },
  { id: "rating", name: "Highest Rated" },
  { id: "bestselling", name: "Best Selling" },
  { id: "discount", name: "Biggest Discount" },
];
export default function ProductsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Parse URL params
  const categoriesParam = searchParams.get("categories");
  const sortParam = searchParams.get("sort");
  const searchParam = searchParams.get("q");

  // Initialize filters from URL
  const initialFilters: Partial<FilterState> = useMemo(
    () => ({
      categories: categoriesParam
        ? categoriesParam.split(",").filter(Boolean)
        : [],
      sortBy: sortParam || "featured",
      search: searchParam || "",
    }),
    [categoriesParam, sortParam, searchParam]
  );

  // Hooks
  const {
    products,
    pagination,
    filters,
    isLoading,
    error,
    hasActiveFilters,
    handleFilterChange,
    handleClearFilters,
    handleRemoveFilter,
    handlePageChange,
    handleSearch,
    handleSortChange,
  } = useProducts(initialFilters);

  const {
    isWishlisted,
    toggleWishlist,
    addToCart,
    isAddingToCart,
    isUpdatingWishlist,
  } = useProductActions();
  // In ProductsContent.tsx, add this after the useProducts hook:

  console.log("Products Debug:", {
    productsLength: products.length,
    isLoading,
    error,
    filters,
    pagination,
  });
  // Local state
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState(searchParam || "");

  // Sync URL with filters
  useEffect(() => {
    const params = new URLSearchParams();

    if (filters.categories.length > 0) {
      params.set("categories", filters.categories.join(","));
    }
    if (filters.sortBy && filters.sortBy !== "featured") {
      params.set("sort", filters.sortBy);
    }
    if (pagination.currentPage > 1) {
      params.set("page", String(pagination.currentPage));
    }
    if (filters.search && filters.search.trim()) {
      params.set("q", filters.search);
    }

    const queryString = params.toString();
    const newUrl = queryString
      ? `/home/shop/products?${queryString}`
      : "/home/shop/products";

    router.replace(newUrl, { scroll: false });
  }, [filters, pagination.currentPage, router]);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchQuery !== (filters.search || "")) {
        handleSearch(searchQuery);
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [searchQuery]); // eslint-disable-line react-hooks/exhaustive-deps

  // Handle add to cart
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
  // Clear search
  const handleClearSearch = () => {
    setSearchQuery("");
    handleSearch("");
  };

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-white via-[#FFF8E1]/20 to-white">
      {/* Background Decorations */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/4 -left-48 w-96 h-96 bg-[#DDA200]/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 -right-48 w-96 h-96 bg-[#DDA200]/5 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-[#DDA200]/3 rounded-full blur-3xl" />
      </div>

      <div className="relative container mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm mb-6">
          <Link
            href="/"
            className="text-stone-500 hover:text-[#DDA200] transition-colors font-medium"
          >
            Home
          </Link>
          <ChevronRight className="w-4 h-4 text-stone-400" />
          <span className="text-[#DDA200] font-semibold">Products</span>
        </nav>

        {/* Promotional Banner */}
        <div className="mb-8">
          <PromotionalBanner />
        </div>

        {/* Page Header */}
        <div className="mb-8 text-center md:text-left">
          <h1 className="text-3xl md:text-4xl font-bold text-stone-800 mb-2">
            Natural Beauty <span className="text-[#DDA200]">Products</span>
          </h1>
          <p className="text-stone-600 max-w-2xl">
            Discover our collection of pure, organic oils and herbal beauty
            essentials crafted with love and nature&apos;s finest ingredients.
          </p>
        </div>

        {/* Error State */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-600">
            {error}
          </div>
        )}

        {/* Main Content */}
        <div className="flex gap-8">
          {/* Filter Sidebar */}
          {/* Filter Sidebar */}
          <FilterSidebar
            filters={filters}
            onFilterChange={handleFilterChange}
            onClearFilters={handleClearFilters}
            isOpen={isFilterOpen}
            onClose={() => setIsFilterOpen(false)}
          />
          {/* Products Section */}
          <div className="flex-1 min-w-0">
            {/* Toolbar */}
            <div className="bg-white rounded-2xl border-2 border-stone-200 p-4 mb-6 shadow-sm">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                {/* Search */}
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-stone-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search products..."
                    className="w-full pl-12 pr-10 py-3 border-2 border-stone-200 rounded-xl
                      focus:border-[#DDA200] focus:outline-none focus:ring-2 focus:ring-[#DDA200]/20 
                      transition-all duration-200 text-stone-700"
                  />
                  {searchQuery && (
                    <button
                      onClick={handleClearSearch}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-stone-400 
                        hover:text-stone-600 transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>

                <div className="flex items-center gap-3">
                  {/* Mobile Filter Button */}
                  <button
                    onClick={() => setIsFilterOpen(true)}
                    className="lg:hidden flex items-center gap-2 px-4 py-3 border-2 border-stone-200 
                      rounded-xl text-stone-600 hover:border-[#DDA200] hover:text-[#DDA200] 
                      hover:bg-[#FFF9E6] transition-all duration-200 font-medium"
                  >
                    <SlidersHorizontal className="w-5 h-5" />
                    Filters
                    {hasActiveFilters && (
                      <span className="w-2 h-2 bg-[#DDA200] rounded-full" />
                    )}
                  </button>

                  {/* Sort */}
                  <div className="relative">
                    <select
                      value={filters.sortBy}
                      onChange={(e) => handleSortChange(e.target.value)}
                      className="appearance-none px-4 py-3 pr-12 border-2 border-stone-200 rounded-xl
                        focus:border-[#DDA200] focus:outline-none focus:ring-2 focus:ring-[#DDA200]/20 
                        bg-white text-stone-700 font-medium cursor-pointer transition-all duration-200"
                    >
                      {sortOptions.map((option) => (
                        <option key={option.id} value={option.id}>
                          {option.name}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-stone-400 pointer-events-none" />
                  </div>

                  {/* View Mode */}
                  <div className="hidden md:flex items-center gap-1 p-1.5 bg-stone-100 rounded-xl">
                    <button
                      onClick={() => setViewMode("grid")}
                      className={`p-2.5 rounded-lg transition-all duration-200 ${
                        viewMode === "grid"
                          ? "bg-white text-[#DDA200] shadow-md"
                          : "text-stone-500 hover:text-stone-700"
                      }`}
                      aria-label="Grid view"
                    >
                      <LayoutGrid className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => setViewMode("list")}
                      className={`p-2.5 rounded-lg transition-all duration-200 ${
                        viewMode === "list"
                          ? "bg-white text-[#DDA200] shadow-md"
                          : "text-stone-500 hover:text-stone-700"
                      }`}
                      aria-label="List view"
                    >
                      <List className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Results Count */}
              <div className="mt-4 flex items-center justify-between text-sm text-stone-500 pt-3 border-t border-stone-100">
                <span className="font-medium">
                  Showing{" "}
                  <span className="text-[#DDA200] font-bold">
                    {products.length}
                  </span>{" "}
                  of{" "}
                  <span className="text-stone-800 font-bold">
                    {pagination.totalItems}
                  </span>{" "}
                  products
                  {searchQuery && (
                    <span className="ml-1">
                      for &quot;
                      <span className="text-[#DDA200]">{searchQuery}</span>
                      &quot;
                    </span>
                  )}
                </span>
              </div>
            </div>
            {/* Active Filters */}
            <ActiveFilters
              filters={filters}
              onRemoveFilter={handleRemoveFilter}
              onClearAll={handleClearFilters}
            />
            {/* Products Grid/List */}
            {isLoading ? (
              <div
                className={
                  viewMode === "grid"
                    ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
                    : "space-y-6"
                }
              >
                {[...Array(6)].map((_, i) => (
                  <ProductSkeleton key={i} />
                ))}
              </div>
            ) : products.length === 0 ? (
              <div className="text-center py-20 bg-white rounded-2xl border-2 border-stone-200">
                <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-[#FFF9E6] to-[#FFF0C2] rounded-full flex items-center justify-center">
                  <Package className="w-12 h-12 text-[#DDA200]" />
                </div>
                <h3 className="text-2xl font-bold text-stone-800 mb-2">
                  No Products Found
                </h3>
                <p className="text-stone-600 mb-6 max-w-md mx-auto">
                  {searchQuery
                    ? `No products found for "${searchQuery}". Try a different search term.`
                    : error
                    ? "There was an error loading products. Please try again."
                    : "Try adjusting your filters to find what you're looking for."}
                </p>
                <div className="flex flex-wrap justify-center gap-3">
                  <button
                    onClick={handleClearFilters}
                    className="px-6 py-3 bg-gradient-to-r from-[#DDA200] to-[#b38600] text-white font-semibold 
          rounded-xl hover:shadow-lg transition-all duration-300"
                  >
                    Clear Filters
                  </button>
                </div>
              </div>
            ) : (
              <>
                <div
                  className={
                    viewMode === "grid"
                      ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
                      : "space-y-6"
                  }
                >
                  {products.map((product, index) => {
                    // Debug log for each product
                    if (process.env.NODE_ENV === "development" && index === 0) {
                      console.log("Rendering first product:", product);
                    }

                    return (
                      <ProductCard
                        key={product.id}
                        product={product}
                        viewMode={viewMode}
                        isWishlisted={isWishlisted(product.id)}
                        isAddingToCart={isAddingToCart(
                          product.defaultVariantId
                        )}
                        isUpdatingWishlist={isUpdatingWishlist(product.id)}
                        onAddToCart={handleAddToCart}
                        onToggleWishlist={handleToggleWishlist}
                      />
                    );
                  })}
                </div>
              </>
            )}
            {/* Pagination */}
            {!isLoading && products.length > 0 && pagination.totalPages > 1 && (
              <Pagination
                pagination={pagination}
                onPageChange={handlePageChange}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
