// components/ui/filters/ActiveFilters.tsx
"use client";

import { X } from "lucide-react";
import type { FilterState } from "@/types/product";

interface ActiveFiltersProps {
  filters: FilterState;
  onRemoveFilter: (key: keyof FilterState, value?: string | number) => void;
  onClearAll: () => void;
}

export default function ActiveFilters({
  filters,
  onRemoveFilter,
  onClearAll,
}: ActiveFiltersProps) {
  const activeFilters: {
    key: keyof FilterState;
    value: string | number;
    label: string;
  }[] = [];

  // Categories
  filters.categories.forEach((cat) => {
    activeFilters.push({
      key: "categories",
      value: cat,
      label: `Category: ${cat}`,
    });
  });

  // Price Range
  if (filters.priceRange[0] > 0 || filters.priceRange[1] < 100000) {
    activeFilters.push({
      key: "priceRange",
      value: "custom",
      label: `Price: PKR ${filters.priceRange[0].toLocaleString()} - ${filters.priceRange[1].toLocaleString()}`,
    });
  }

  // Ratings
  filters.ratings.forEach((rating) => {
    activeFilters.push({
      key: "ratings",
      value: rating,
      label: `${rating}+ Stars`,
    });
  });

  // Availability
  filters.availability.forEach((avail) => {
    activeFilters.push({
      key: "availability",
      value: avail,
      label: avail === "in-stock" ? "In Stock" : avail,
    });
  });

  // Offers
  filters.offers.forEach((offer) => {
    const labels: Record<string, string> = {
      "on-sale": "On Sale",
      new: "New Arrivals",
      featured: "Featured",
    };
    activeFilters.push({
      key: "offers",
      value: offer,
      label: labels[offer] || offer,
    });
  });

  // Search
  if (filters.search && filters.search.trim()) {
    activeFilters.push({
      key: "search",
      value: filters.search,
      label: `Search: "${filters.search}"`,
    });
  }

  if (activeFilters.length === 0) {
    return null;
  }

  return (
    <div className="mb-6 flex flex-wrap items-center gap-2">
      <span className="text-sm font-medium text-stone-600">
        Active Filters:
      </span>

      {activeFilters.map((filter, index) => (
        <button
          key={`${filter.key}-${filter.value}-${index}`}
          onClick={() => onRemoveFilter(filter.key, filter.value)}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#FFF9E6] text-[#DDA200] 
            text-sm font-medium rounded-lg border border-[#DDA200]/30 
            hover:bg-[#DDA200] hover:text-white transition-colors group"
        >
          {filter.label}
          <X className="w-3.5 h-3.5 group-hover:rotate-90 transition-transform" />
        </button>
      ))}

      {activeFilters.length > 1 && (
        <button
          onClick={onClearAll}
          className="text-sm text-stone-500 hover:text-red-500 font-medium underline underline-offset-2 ml-2"
        >
          Clear All
        </button>
      )}
    </div>
  );
}
