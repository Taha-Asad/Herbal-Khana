import {
  ChevronDown,
  Filter,
  Search,
  SlidersHorizontal,
  X,
} from "lucide-react";
import { useState } from "react";
const categories = [
  "All",
  "Announcements",
  "Facilities",
  "Services",
  "Events",
  "Technology",
];

const sortMenu = ["Latest", "Featured", "Most Viewed", "Alphabetical"];

// =============================================================================
// TYPES - Can be moved to a types file
// =============================================================================
interface FilterState {
  searchTerm: string;
  selectedCategory: string;
  sortBy: string;
}
interface BlogFilterProps {
  filters: FilterState;
  onSearchChange: (value: string) => void;
  onCategoryChange: (value: string) => void;
  onSortChange: (value: string) => void;
  onClearFilters: () => void;
  resultCount: number;
  hasActiveFilters: boolean;
}

function BlogFilter({
  filters,
  onSearchChange,
  onCategoryChange,
  onSortChange,
  onClearFilters,
  resultCount,
  hasActiveFilters,
}: BlogFilterProps) {
  const [isFilterExpanded, setIsFilterExpanded] = useState(true);
  const [focusedInput, setFocusedInput] = useState<string | null>(null);

  return (
    <div className="container mx-auto mb-10 px-4">
      {/* Filter Header - Collapsible on mobile */}
      <div className="flex items-center justify-between mb-4 md:hidden">
        <button
          onClick={() => setIsFilterExpanded(!isFilterExpanded)}
          className="flex items-center gap-2 text-gray-700 font-medium"
        >
          <SlidersHorizontal className="w-5 h-5 text-[#DDA200]" />
          <span>Filters</span>
          <ChevronDown
            className={`w-4 h-4 transition-transform duration-300 ${
              isFilterExpanded ? "rotate-180" : ""
            }`}
          />
        </button>
        {hasActiveFilters && (
          <span className="px-2 py-1 text-xs font-semibold bg-[#DDA200] text-white rounded-full">
            Active
          </span>
        )}
      </div>

      {/* Main Filter Container */}
      <div
        className={`
          relative overflow-hidden transition-all duration-500 ease-in-out
          ${
            isFilterExpanded
              ? "max-h-[500px] opacity-100"
              : "max-h-0 opacity-0 md:max-h-[500px] md:opacity-100"
          }
        `}
      >
        <div
          className="
            flex flex-col lg:flex-row gap-4 lg:gap-6 items-stretch lg:items-center justify-between 
            bg-gradient-to-br from-[#FFF9E6] via-[#FFFDF5] to-[#F7E4B2]
            shadow-[0_8px_30px_rgba(221,162,0,0.15)]
            hover:shadow-[0_12px_40px_rgba(221,162,0,0.25)]
            p-6 rounded-2xl border border-[#f3e4b7]
            transition-all duration-500
          "
        >
          {/* Decorative Filter Icon */}
          <div className="hidden lg:flex items-center justify-center w-12 h-12 bg-[#DDA200]/10 rounded-xl">
            <Filter className="w-6 h-6 text-[#DDA200]" />
          </div>

          {/* Search Input */}
          <div className="relative w-full lg:w-1/3 group">
            <div
              className={`
                absolute left-4 top-1/2 -translate-y-1/2 transition-all duration-300
                ${
                  focusedInput === "search"
                    ? "text-[#DDA200] scale-110"
                    : "text-gray-400"
                }
              `}
            >
              <Search className="w-5 h-5" />
            </div>
            <input
              type="text"
              placeholder="Search articles, authors..."
              value={filters.searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              onFocus={() => setFocusedInput("search")}
              onBlur={() => setFocusedInput(null)}
              className={`
                w-full pl-12 pr-10 py-3.5 rounded-xl border-2 
                bg-white/90 backdrop-blur-sm
                text-gray-700 placeholder-gray-400
                transition-all duration-300 ease-out
                ${
                  focusedInput === "search"
                    ? "border-[#DDA200] ring-4 ring-[#DDA200]/20 shadow-lg"
                    : "border-[#e5d9b6] hover:border-[#DDA200]/50 hover:shadow-md"
                }
              `}
            />
            {/* Clear search button */}
            {filters.searchTerm && (
              <button
                onClick={() => onSearchChange("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 
                  text-gray-400 hover:text-[#DDA200] hover:bg-[#DDA200]/10 
                  rounded-full transition-all duration-200"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Category Select */}
          <div className="relative w-full lg:w-1/4 group">
            <label className="absolute -top-2 left-3 px-1 text-xs font-medium text-[#b38600] bg-[#FFF9E6] z-10">
              Category
            </label>
            <select
              className={`
                w-full px-4 py-3.5 rounded-xl border-2 appearance-none cursor-pointer
                bg-white/90 backdrop-blur-sm text-gray-700
                transition-all duration-300 ease-out
                ${
                  focusedInput === "category"
                    ? "border-[#DDA200] ring-4 ring-[#DDA200]/20 shadow-lg"
                    : "border-[#e5d9b6] hover:border-[#DDA200]/50 hover:shadow-md"
                }
                ${
                  filters.selectedCategory !== "All"
                    ? "font-semibold text-[#b38600]"
                    : ""
                }
              `}
              value={filters.selectedCategory}
              onChange={(e) => onCategoryChange(e.target.value)}
              onFocus={() => setFocusedInput("category")}
              onBlur={() => setFocusedInput(null)}
            >
              {categories.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
            {/* Active indicator */}
            {filters.selectedCategory !== "All" && (
              <span className="absolute -top-1 -right-1 w-3 h-3 bg-[#DDA200] rounded-full animate-pulse" />
            )}
          </div>

          {/* Sort Select */}
          <div className="relative w-full lg:w-1/4 group">
            <label className="absolute -top-2 left-3 px-1 text-xs font-medium text-[#b38600] bg-[#FFF9E6] z-10">
              Sort By
            </label>
            <select
              className={`
                w-full px-4 py-3.5 rounded-xl border-2 appearance-none cursor-pointer
                bg-white/90 backdrop-blur-sm text-gray-700
                transition-all duration-300 ease-out
                ${
                  focusedInput === "sort"
                    ? "border-[#DDA200] ring-4 ring-[#DDA200]/20 shadow-lg"
                    : "border-[#e5d9b6] hover:border-[#DDA200]/50 hover:shadow-md"
                }
                ${
                  filters.sortBy !== "Latest"
                    ? "font-semibold text-[#b38600]"
                    : ""
                }
              `}
              value={filters.sortBy}
              onChange={(e) => onSortChange(e.target.value)}
              onFocus={() => setFocusedInput("sort")}
              onBlur={() => setFocusedInput(null)}
            >
              {sortMenu.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
            {/* Active indicator */}
            {filters.sortBy !== "Latest" && (
              <span className="absolute -top-1 -right-1 w-3 h-3 bg-[#DDA200] rounded-full animate-pulse" />
            )}
          </div>

          {/* Clear Filters Button */}
          <button
            onClick={onClearFilters}
            disabled={!hasActiveFilters}
            className={`
              relative px-6 py-3.5 font-semibold rounded-xl
              transition-all duration-300 ease-out
              flex items-center justify-center gap-2 min-w-[140px]
              ${
                hasActiveFilters
                  ? `bg-gradient-to-r from-[#DDA200] to-[#b38600] text-white 
                   shadow-lg hover:shadow-xl hover:scale-105 active:scale-95
                   hover:from-[#b38600] hover:to-[#9a7500]`
                  : "bg-gray-200 text-gray-400 cursor-not-allowed"
              }
            `}
          >
            <X className="w-4 h-4" />
            Clear All
            {hasActiveFilters && (
              <span className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-bold">
                {(filters.searchTerm ? 1 : 0) +
                  (filters.selectedCategory !== "All" ? 1 : 0) +
                  (filters.sortBy !== "Latest" ? 1 : 0)}
              </span>
            )}
          </button>
        </div>

        {/* Results Count & Active Filters Tags */}
        <div className="flex flex-wrap items-center gap-3 mt-4 px-2">
          <span className="text-sm text-gray-600">
            Showing{" "}
            <span className="font-bold text-[#b38600]">{resultCount}</span>{" "}
            results
          </span>

          {/* Active filter tags */}
          {hasActiveFilters && (
            <div className="flex flex-wrap gap-2">
              {filters.searchTerm && (
                <span className="inline-flex items-center gap-1 px-3 py-1 bg-[#DDA200]/10 text-[#b38600] text-sm rounded-full border border-[#DDA200]/30">
                  Search: &quot;{filters.searchTerm}&quot;
                  <button
                    onClick={() => onSearchChange("")}
                    className="hover:text-red-500 transition-colors"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}
              {filters.selectedCategory !== "All" && (
                <span className="inline-flex items-center gap-1 px-3 py-1 bg-[#DDA200]/10 text-[#b38600] text-sm rounded-full border border-[#DDA200]/30">
                  Category: {filters.selectedCategory}
                  <button
                    onClick={() => onCategoryChange("All")}
                    className="hover:text-red-500 transition-colors"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}
              {filters.sortBy !== "Latest" && (
                <span className="inline-flex items-center gap-1 px-3 py-1 bg-[#DDA200]/10 text-[#b38600] text-sm rounded-full border border-[#DDA200]/30">
                  Sort: {filters.sortBy}
                  <button
                    onClick={() => onSortChange("Latest")}
                    className="hover:text-red-500 transition-colors"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
export default BlogFilter;
