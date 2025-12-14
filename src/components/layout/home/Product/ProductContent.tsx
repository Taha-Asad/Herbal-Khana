import PromotionalBanner from "@/components/ui/PromotionalBanner";
import { mockProducts, sortOptions } from "@/lib/products";
import { FilterState, PaginationInfo, Product } from "@/types/product";
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
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import ProductSkeleton from "./ProductSkeleton";
import Pagination from "./Pagination";
import ProductCard from "./ProductCard";
import ActiveFilters from "@/components/ui/filters/ActiveFilters";
import FilterSidebar from "@/components/ui/filters/FilterSidebar";

const ProductsAPI = {
  async getProducts(
    filters: Partial<FilterState>,
    page: number = 1,
    limit: number = 12
  ): Promise<{ products: Product[]; pagination: PaginationInfo }> {
    await new Promise((resolve) => setTimeout(resolve, 500));

    let filtered = [...mockProducts];

    // Apply filters
    if (filters.categories?.length) {
      filtered = filtered.filter((p) =>
        filters.categories?.includes(p.category)
      );
    }
    if (filters.skinTypes?.length) {
      filtered = filtered.filter((p) =>
        p.skinType.some((st) => filters.skinTypes?.includes(st))
      );
    }
    if (filters.concerns?.length) {
      filtered = filtered.filter((p) =>
        p.concerns.some((c) => filters.concerns?.includes(c))
      );
    }
    if (filters.ingredients?.length) {
      filtered = filtered.filter((p) =>
        p.ingredients.some((i) => filters.ingredients?.includes(i))
      );
    }
    if (filters.priceRange) {
      filtered = filtered.filter(
        (p) =>
          p.price >= filters.priceRange![0] && p.price <= filters.priceRange![1]
      );
    }
    if (filters.ratings?.length) {
      filtered = filtered.filter((p) =>
        filters.ratings?.some((r) => p.rating >= r)
      );
    }
    if (filters.offers?.includes("on-sale")) {
      filtered = filtered.filter((p) => p.discount && p.discount > 0);
    }
    if (filters.offers?.includes("new")) {
      filtered = filtered.filter((p) => p.isNew);
    }
    if (filters.offers?.includes("bestseller")) {
      filtered = filtered.filter((p) => p.isBestseller);
    }
    if (filters.availability?.includes("in-stock")) {
      filtered = filtered.filter((p) => p.inStock);
    }

    // Apply sorting
    switch (filters.sortBy) {
      case "newest":
        filtered.sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
        break;
      case "price-low":
        filtered.sort((a, b) => a.price - b.price);
        break;
      case "price-high":
        filtered.sort((a, b) => b.price - a.price);
        break;
      case "rating":
        filtered.sort((a, b) => b.rating - a.rating);
        break;
      case "discount":
        filtered.sort((a, b) => (b.discount || 0) - (a.discount || 0));
        break;
      case "bestselling":
        filtered.sort((a, b) => b.reviewCount - a.reviewCount);
        break;
      default:
        filtered.sort((a, b) => {
          const aScore = (a.isFeatured ? 10 : 0) + a.reviewCount / 100;
          const bScore = (b.isFeatured ? 10 : 0) + b.reviewCount / 100;
          return bScore - aScore;
        });
    }

    const totalItems = filtered.length;
    const totalPages = Math.ceil(totalItems / limit);
    const startIndex = (page - 1) * limit;
    const products = filtered.slice(startIndex, startIndex + limit);

    return {
      products,
      pagination: {
        currentPage: page,
        totalPages,
        totalItems,
        itemsPerPage: limit,
      },
    };
  },
};

const defaultFilters: FilterState = {
  categories: [],
  subcategories: [],
  priceRange: [0, 10000],
  skinTypes: [],
  concerns: [],
  ingredients: [],
  ratings: [],
  availability: [],
  offers: [],
  sortBy: "featured",
};
export default function ProductsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // State
  const [products, setProducts] = useState<Product[]>([]);
  const [pagination, setPagination] = useState<PaginationInfo>({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 12,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filters, setFilters] = useState<FilterState>(defaultFilters);
  const [initialLoad, setInitialLoad] = useState(true);

  // Initialize from URL search params
  useEffect(() => {
    const categoriesParam = searchParams.get("categories");
    const sortParam = searchParams.get("sort");
    const pageParam = searchParams.get("page");

    setFilters((prev) => ({
      ...prev,
      categories: categoriesParam ? categoriesParam.split(",") : [],
      sortBy: sortParam || "featured",
    }));

    setPagination((prev) => ({
      ...prev,
      currentPage: pageParam ? Number(pageParam) : 1,
    }));

    setInitialLoad(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Load products
  const loadProducts = useCallback(
    async (page: number, currentFilters: FilterState) => {
      setIsLoading(true);
      try {
        const result = await ProductsAPI.getProducts(currentFilters, page, 12);
        setProducts(result.products);
        setPagination(result.pagination);
      } catch (error) {
        console.error("Failed to load products:", error);
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  // Load products when filters or page changes
  useEffect(() => {
    if (!initialLoad) {
      loadProducts(pagination.currentPage, filters);
    }
  }, [filters, pagination.currentPage, initialLoad, loadProducts]);

  useEffect(() => {
    if (initialLoad) return;

    const params = new URLSearchParams();

    if (filters.categories.length)
      params.set("categories", filters.categories.join(","));

    if (filters.sortBy !== "featured") params.set("sort", filters.sortBy);

    if (pagination.currentPage > 1)
      params.set("page", String(pagination.currentPage));

    router.replace(`/home/shop/products?${params.toString()}`, {
      scroll: false,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters, pagination.currentPage, router]);

  // Handle filter changes
  const handleFilterChange = (newFilters: Partial<FilterState>) => {
    setFilters((prev) => ({ ...prev, ...newFilters }));
    setPagination((prev) => ({ ...prev, currentPage: 1 }));
  };

  const handleClearFilters = () => {
    setFilters(defaultFilters);
    setPagination((prev) => ({ ...prev, currentPage: 1 }));
  };

  const handleRemoveFilter = (key: keyof FilterState, value?: string) => {
    if (key === "priceRange") {
      handleFilterChange({ priceRange: [0, 10000] });
    } else if (value) {
      const current = (filters[key] as string[]) || [];
      handleFilterChange({ [key]: current.filter((v) => v !== value) });
    }
  };

  const handlePageChange = (page: number) => {
    setPagination((prev) => ({ ...prev, currentPage: page }));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleAddToCart = (productId: string) => {
    console.log("Add to cart:", productId);
  };

  const handleAddToWishlist = (productId: string) => {
    console.log("Add to wishlist:", productId);
  };

  // Filter products based on search query
  const displayProducts = useMemo(() => {
    if (!searchQuery.trim()) return products;

    const query = searchQuery.toLowerCase();
    return products.filter(
      (product) =>
        product.name.toLowerCase().includes(query) ||
        product.shortDescription.toLowerCase().includes(query) ||
        product.description.toLowerCase().includes(query) ||
        product.tags.some((tag) => tag.toLowerCase().includes(query)) ||
        product.ingredients.some((ingredient) =>
          ingredient.toLowerCase().includes(query)
        )
    );
  }, [products, searchQuery]);

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

        {/* Main Content */}
        <div className="flex gap-8">
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
                    className="w-full pl-12 pr-4 py-3 border-2 border-stone-200 rounded-xl
                      focus:border-[#DDA200] focus:outline-none focus:ring-2 focus:ring-[#DDA200]/20 
                      transition-all duration-200 text-stone-700"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery("")}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600"
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
                  </button>

                  {/* Sort */}
                  <div className="relative">
                    <select
                      value={filters.sortBy}
                      onChange={(e) =>
                        handleFilterChange({ sortBy: e.target.value })
                      }
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
                    {displayProducts.length}
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
            ) : displayProducts.length === 0 ? (
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
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery("")}
                      className="px-6 py-3 bg-stone-200 text-stone-800 font-semibold rounded-xl 
                        hover:bg-stone-300 transition-colors"
                    >
                      Clear Search
                    </button>
                  )}
                </div>
              </div>
            ) : (
              <div
                className={
                  viewMode === "grid"
                    ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
                    : "space-y-6"
                }
              >
                {displayProducts.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    viewMode={viewMode}
                    onAddToCart={handleAddToCart}
                    onAddToWishlist={handleAddToWishlist}
                  />
                ))}
              </div>
            )}

            {/* Pagination */}
            {!isLoading &&
              displayProducts.length > 0 &&
              pagination.totalPages > 1 && (
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
