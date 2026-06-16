// components/ui/filters/FilterSidebar.tsx
"use client";

import React, { useState, useEffect } from "react";
import {
  X,
  ChevronDown,
  SlidersHorizontal,
  RotateCcw,
  Star,
} from "lucide-react";
import type { FilterState, AvailableFilters } from "@/types/product";
import { getAvailableFilters } from "@/app/action/home/product.action";

interface FilterSidebarProps {
  filters: FilterState;
  onFilterChange: (filters: Partial<FilterState>) => void;
  onClearFilters: () => void;
  isOpen: boolean;
  onClose: () => void;
}

export default function FilterSidebar({
  filters,
  onFilterChange,
  onClearFilters,
  isOpen,
  onClose,
}: FilterSidebarProps) {
  const [expandedSections, setExpandedSections] = useState<Set<string>>(
    new Set(["categories", "price", "availability"])
  );
  const [availableFilters, setAvailableFilters] = useState<AvailableFilters>({
    categories: [],
    priceRange: { min: 0, max: 100000 },
    ratings: [],
  });
  const [isLoadingFilters, setIsLoadingFilters] = useState(true);

  // Load available filters on mount
  useEffect(() => {
    const loadFilters = async () => {
      try {
        const result = await getAvailableFilters();
        if (result.success && result.data) {
          setAvailableFilters(result.data);
        }
      } catch (error) {
        console.error("Failed to load filters:", error);
      } finally {
        setIsLoadingFilters(false);
      }
    };

    loadFilters();
  }, []);

  const toggleSection = (section: string) => {
    setExpandedSections((prev) => {
      const next = new Set(prev);
      if (next.has(section)) {
        next.delete(section);
      } else {
        next.add(section);
      }
      return next;
    });
  };

  const handleCategoryChange = (slug: string) => {
    const current = filters.categories || [];
    const updated = current.includes(slug)
      ? current.filter((c) => c !== slug)
      : [...current, slug];
    onFilterChange({ categories: updated });
  };

  const handlePriceChange = (min: number, max: number) => {
    onFilterChange({ priceRange: [min, max] });
  };

  const handleAvailabilityChange = (value: string) => {
    const current = filters.availability || [];
    const updated = current.includes(value)
      ? current.filter((a) => a !== value)
      : [...current, value];
    onFilterChange({ availability: updated });
  };

  const handleOfferChange = (value: string) => {
    const current = filters.offers || [];
    const updated = current.includes(value)
      ? current.filter((o) => o !== value)
      : [...current, value];
    onFilterChange({ offers: updated });
  };

  const handleRatingChange = (rating: number) => {
    const current = filters.ratings || [];
    const updated = current.includes(rating)
      ? current.filter((r) => r !== rating)
      : [...current, rating];
    onFilterChange({ ratings: updated });
  };

  const hasActiveFilters =
    filters.categories.length > 0 ||
    filters.availability.length > 0 ||
    filters.offers.length > 0 ||
    filters.ratings.length > 0 ||
    filters.priceRange[0] > 0 ||
    filters.priceRange[1] < 100000;

  const formatCurrency = (amount: number) => {
    return `PKR ${amount.toLocaleString("en-PK")}`;
  };

  const FilterSection = ({
    id,
    title,
    children,
  }: {
    id: string;
    title: string;
    children: React.ReactNode;
  }) => (
    <div className="border-b border-stone-200 last:border-b-0">
      <button
        onClick={() => toggleSection(id)}
        className="w-full flex items-center justify-between py-4 text-left font-semibold text-stone-800 hover:text-[#DDA200] transition-colors"
      >
        {title}
        <ChevronDown
          className={`w-5 h-5 transition-transform ${
            expandedSections.has(id) ? "rotate-180" : ""
          }`}
        />
      </button>
      {expandedSections.has(id) && <div className="pb-4">{children}</div>}
    </div>
  );

  const sidebarContent = (
    <>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-stone-200 bg-gradient-to-r from-[#FFF9E6] to-white">
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="w-5 h-5 text-[#DDA200]" />
          <h2 className="text-lg font-bold text-stone-800">Filters</h2>
        </div>
        {hasActiveFilters && (
          <button
            onClick={onClearFilters}
            className="flex items-center gap-1 text-sm text-[#DDA200] hover:text-[#b38600] font-medium"
          >
            <RotateCcw className="w-4 h-4" />
            Clear All
          </button>
        )}
      </div>

      {/* Filter Sections */}
      <div className="p-4 space-y-0">
        {/* Categories */}
        <FilterSection id="categories" title="Categories">
          {isLoadingFilters ? (
            <div className="space-y-2">
              {[...Array(4)].map((_, i) => (
                <div
                  key={i}
                  className="h-6 bg-stone-200 rounded animate-pulse"
                />
              ))}
            </div>
          ) : (
            <div className="space-y-2">
              {availableFilters.categories.map((category) => (
                <label
                  key={category.slug}
                  className="flex items-center gap-3 cursor-pointer group"
                >
                  <input
                    type="checkbox"
                    checked={filters.categories.includes(category.slug)}
                    onChange={() => handleCategoryChange(category.slug)}
                    className="w-5 h-5 rounded border-2 border-stone-300 text-[#DDA200] 
                      focus:ring-[#DDA200] focus:ring-offset-0 cursor-pointer"
                  />
                  <span className="flex-1 text-stone-700 group-hover:text-[#DDA200] transition-colors">
                    {category.name}
                  </span>
                  <span className="text-xs text-stone-400 bg-stone-100 px-2 py-0.5 rounded-full">
                    {category.count}
                  </span>
                </label>
              ))}
              {availableFilters.categories.length === 0 && (
                <p className="text-sm text-stone-500">
                  No categories available
                </p>
              )}
            </div>
          )}
        </FilterSection>

        {/* Price Range */}
        <FilterSection id="price" title="Price Range">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <input
                type="number"
                value={filters.priceRange[0]}
                onChange={(e) =>
                  handlePriceChange(
                    Number(e.target.value),
                    filters.priceRange[1]
                  )
                }
                placeholder="Min"
                min={0}
                className="w-full px-3 py-2 border-2 border-stone-200 rounded-lg text-sm
                  focus:border-[#DDA200] focus:outline-none"
              />
              <span className="text-stone-400">-</span>
              <input
                type="number"
                value={filters.priceRange[1]}
                onChange={(e) =>
                  handlePriceChange(
                    filters.priceRange[0],
                    Number(e.target.value)
                  )
                }
                placeholder="Max"
                min={0}
                className="w-full px-3 py-2 border-2 border-stone-200 rounded-lg text-sm
                  focus:border-[#DDA200] focus:outline-none"
              />
            </div>
            <div className="text-xs text-stone-500 text-center">
              {formatCurrency(filters.priceRange[0])} -{" "}
              {formatCurrency(filters.priceRange[1])}
            </div>
            {/* Quick Price Buttons */}
            <div className="flex flex-wrap gap-2">
              {[
                { label: "Under 3K", min: 0, max: 3000 },
                { label: "3K - 5K", min: 3000, max: 5000 },
                { label: "5K - 10K", min: 5000, max: 10000 },
                { label: "10K+", min: 10000, max: 100000 },
              ].map((range) => (
                <button
                  key={range.label}
                  onClick={() => handlePriceChange(range.min, range.max)}
                  className={`px-3 py-1.5 text-xs font-medium rounded-lg border-2 transition-colors ${
                    filters.priceRange[0] === range.min &&
                    filters.priceRange[1] === range.max
                      ? "border-[#DDA200] bg-[#FFF9E6] text-[#DDA200]"
                      : "border-stone-200 text-stone-600 hover:border-[#DDA200]"
                  }`}
                >
                  {range.label}
                </button>
              ))}
            </div>
          </div>
        </FilterSection>

        {/* Availability */}
        <FilterSection id="availability" title="Availability">
          <div className="space-y-2">
            <label className="flex items-center gap-3 cursor-pointer group">
              <input
                type="checkbox"
                checked={filters.availability.includes("in-stock")}
                onChange={() => handleAvailabilityChange("in-stock")}
                className="w-5 h-5 rounded border-2 border-stone-300 text-[#DDA200] 
                  focus:ring-[#DDA200] focus:ring-offset-0 cursor-pointer"
              />
              <span className="text-stone-700 group-hover:text-[#DDA200] transition-colors">
                In Stock Only
              </span>
            </label>
          </div>
        </FilterSection>

        {/* Offers */}
        <FilterSection id="offers" title="Offers & Promotions">
          <div className="space-y-2">
            {[
              { id: "on-sale", label: "On Sale" },
              { id: "new", label: "New Arrivals" },
              { id: "featured", label: "Featured" },
            ].map((offer) => (
              <label
                key={offer.id}
                className="flex items-center gap-3 cursor-pointer group"
              >
                <input
                  type="checkbox"
                  checked={filters.offers.includes(offer.id)}
                  onChange={() => handleOfferChange(offer.id)}
                  className="w-5 h-5 rounded border-2 border-stone-300 text-[#DDA200] 
                    focus:ring-[#DDA200] focus:ring-offset-0 cursor-pointer"
                />
                <span className="text-stone-700 group-hover:text-[#DDA200] transition-colors">
                  {offer.label}
                </span>
              </label>
            ))}
          </div>
        </FilterSection>

        {/* Rating */}
        <FilterSection id="rating" title="Customer Rating">
          <div className="space-y-2">
            {[4, 3, 2, 1].map((rating) => (
              <label
                key={rating}
                className="flex items-center gap-3 cursor-pointer group"
              >
                <input
                  type="checkbox"
                  checked={filters.ratings.includes(rating)}
                  onChange={() => handleRatingChange(rating)}
                  className="w-5 h-5 rounded border-2 border-stone-300 text-[#DDA200] 
                    focus:ring-[#DDA200] focus:ring-offset-0 cursor-pointer"
                />
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-4 h-4 ${
                        i < rating
                          ? "text-[#DDA200] fill-[#DDA200]"
                          : "text-stone-300"
                      }`}
                    />
                  ))}
                  <span className="text-sm text-stone-500 ml-1">& up</span>
                </div>
              </label>
            ))}
          </div>
        </FilterSection>
      </div>
    </>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden lg:block w-72 flex-shrink-0">
        <div className="sticky top-4 bg-white rounded-2xl border-2 border-stone-200 overflow-hidden">
          {sidebarContent}
        </div>
      </aside>

      {/* Mobile Sidebar Overlay */}
      {isOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/50" onClick={onClose} />

          {/* Sidebar */}
          <div className="absolute left-0 top-0 bottom-0 w-80 max-w-[85vw] bg-white overflow-y-auto">
            {/* Close Button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-2 text-stone-500 hover:text-stone-700 z-10"
            >
              <X className="w-6 h-6" />
            </button>
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
}
