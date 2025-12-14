import { FilterState } from "@/types/product";
import { Check, Filter, Star, X } from "lucide-react";
import { FilterSection } from "./FilterSection";
import { categories } from "@/lib/products";
import CheckboxItem from "./CheckboxItem";
import { useMemo } from "react";

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
  const toggleArrayFilter = (key: keyof FilterState, value: string) => {
    const current = (filters[key] as string[]) || [];
    const updated = current.includes(value)
      ? current.filter((v) => v !== value)
      : [...current, value];
    onFilterChange({ [key]: updated });
  };

  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (filters.categories.length) count += filters.categories.length;
    if (filters.skinTypes.length) count += filters.skinTypes.length;
    if (filters.concerns.length) count += filters.concerns.length;
    if (filters.ingredients.length) count += filters.ingredients.length;
    if (filters.offers.length) count += filters.offers.length;
    if (filters.priceRange[0] > 0 || filters.priceRange[1] < 10000) count += 1;
    if (filters.ratings.length) count += filters.ratings.length;
    if (filters.availability.length) count += filters.availability.length;
    return count;
  }, [filters]);

  const content = (
    <div className="h-[100vh] overflow-auto mb-5 pb-10 flex flex-col bg-white">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b-2 border-stone-200 bg-gradient-to-r from-[#FFF9E6] to-white">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-[#DDA200]/10 rounded-lg">
            <Filter className="w-5 h-5 text-[#DDA200]" />
          </div>
          <span className="font-bold text-stone-800 text-lg">Filters</span>
          {activeFilterCount > 0 && (
            <span className="px-2.5 py-0.5 bg-[#DDA200] text-white text-xs font-bold rounded-full">
              {activeFilterCount}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {activeFilterCount > 0 && (
            <button
              onClick={onClearFilters}
              className="text-sm text-[#DDA200] hover:text-[#b38600] font-medium transition-colors"
            >
              Clear All
            </button>
          )}
          <button
            onClick={onClose}
            className="lg:hidden p-2 hover:bg-stone-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-stone-500" />
          </button>
        </div>
      </div>

      {/* Filters Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-1">
        {/* Categories */}
        <FilterSection id="categories" title="Categories" defaultOpen>
          <div className="space-y-0.5">
            {categories.map((cat) => (
              <CheckboxItem
                key={cat.id}
                id={cat.id}
                name={cat.name}
                count={cat.count}
                checked={filters.categories.includes(cat.id)}
                onChange={() => toggleArrayFilter("categories", cat.id)}
              />
            ))}
          </div>
        </FilterSection>

        {/* Price Range */}
        <FilterSection id="price" title="Price Range" defaultOpen>
          <div className="space-y-4 px-2">
            <div className="flex items-center gap-3">
              <div className="flex-1">
                <label className="text-xs text-stone-500 mb-1 block">Min</label>
                <input
                  type="number"
                  value={filters.priceRange[0]}
                  onChange={(e) =>
                    onFilterChange({
                      priceRange: [
                        parseInt(e.target.value) || 0,
                        filters.priceRange[1],
                      ],
                    })
                  }
                  placeholder="0"
                  className="w-full px-3 py-2 border-2 border-stone-200 rounded-lg text-sm
                    focus:border-[#DDA200] focus:outline-none focus:ring-2 focus:ring-[#DDA200]/20 transition-all"
                />
              </div>
              <span className="text-stone-400 mt-5">—</span>
              <div className="flex-1">
                <label className="text-xs text-stone-500 mb-1 block">Max</label>
                <input
                  type="number"
                  value={filters.priceRange[1]}
                  onChange={(e) =>
                    onFilterChange({
                      priceRange: [
                        filters.priceRange[0],
                        parseInt(e.target.value) || 10000,
                      ],
                    })
                  }
                  placeholder="10000"
                  className="w-full px-3 py-2 border-2 border-stone-200 rounded-lg text-sm
                    focus:border-[#DDA200] focus:outline-none focus:ring-2 focus:ring-[#DDA200]/20 transition-all"
                />
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              {[
                [0, 1000],
                [1000, 2500],
                [2500, 5000],
                [5000, 10000],
              ].map(([min, max]) => (
                <button
                  key={`${min}-${max}`}
                  onClick={() =>
                    onFilterChange({
                      priceRange: [min, max] as [number, number],
                    })
                  }
                  className={`px-3 py-1.5 text-xs rounded-full border-2 transition-all duration-200 ${
                    filters.priceRange[0] === min &&
                    filters.priceRange[1] === max
                      ? "bg-[#DDA200] text-white border-[#DDA200]"
                      : "border-stone-200 text-stone-600 hover:border-[#DDA200] hover:text-[#DDA200]"
                  }`}
                >
                  Rs {min.toLocaleString()} - Rs {max.toLocaleString()}
                </button>
              ))}
            </div>
          </div>
        </FilterSection>

        {/* Offers */}
        <FilterSection id="offers" title="Offers & Promotions">
          <div className="space-y-0.5">
            <CheckboxItem
              id="on-sale"
              name="On Sale"
              checked={filters.offers.includes("on-sale")}
              onChange={() => toggleArrayFilter("offers", "on-sale")}
            />
            <CheckboxItem
              id="new"
              name="New Arrivals"
              checked={filters.offers.includes("new")}
              onChange={() => toggleArrayFilter("offers", "new")}
            />
            <CheckboxItem
              id="bestseller"
              name="Bestsellers"
              checked={filters.offers.includes("bestseller")}
              onChange={() => toggleArrayFilter("offers", "bestseller")}
            />
          </div>
        </FilterSection>

        {/* Rating */}
        <FilterSection id="rating" title="Customer Rating">
          <div className="space-y-2 px-2">
            {[4, 3, 2, 1].map((rating) => (
              <label
                key={rating}
                className="flex items-center gap-3 py-2 cursor-pointer group hover:bg-stone-50 px-2 rounded-lg transition-colors"
              >
                <div
                  className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all duration-200 ${
                    filters.ratings.includes(rating)
                      ? "bg-[#DDA200] border-[#DDA200]"
                      : "border-stone-300 group-hover:border-[#DDA200]/60"
                  }`}
                >
                  {filters.ratings.includes(rating) && (
                    <Check className="w-3 h-3 text-white" strokeWidth={3} />
                  )}
                </div>
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
                </div>
                <span className="text-sm text-stone-600">& Up</span>
              </label>
            ))}
          </div>
        </FilterSection>

        {/* Availability */}
        <FilterSection id="availability" title="Availability">
          <CheckboxItem
            id="in-stock"
            name="In Stock Only"
            checked={filters.availability.includes("in-stock")}
            onChange={() => toggleArrayFilter("availability", "in-stock")}
          />
        </FilterSection>
      </div>

      {/* Mobile Apply Button */}
      <div className="lg:hidden p-4 border-t-2 border-stone-200 bg-white">
        <button
          onClick={onClose}
          className="w-full py-3.5 bg-gradient-to-r from-[#DDA200] to-[#b38600] text-white font-bold rounded-xl 
            hover:shadow-lg transition-all duration-300"
        >
          Apply Filters ({activeFilterCount})
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden lg:block w-80 flex-shrink-0">
        <div className="bg-white rounded-2xl border-2 border-stone-200 sticky top-4 max-h-[calc(100vh-2rem)] overflow-hidden shadow-sm">
          {content}
        </div>
      </aside>

      {/* Mobile Drawer */}
      <div
        className={`lg:hidden fixed inset-0 z-50 transition-all duration-300 ${
          isOpen
            ? "opacity-100 pointer-events-auto"
            : "opacity-0 pointer-events-none"
        }`}
      >
        <div
          className="absolute inset-0 bg-black/50 backdrop-blur-sm"
          onClick={onClose}
        />
        <div
          className={`absolute left-0 top-0 h-full w-80 max-w-[85vw] shadow-2xl
            transform transition-transform duration-300 ease-out ${
              isOpen ? "translate-x-0" : "-translate-x-full"
            }`}
        >
          {content}
        </div>
      </div>
    </>
  );
}
