import { categories } from "@/lib/products";
import { FilterState } from "@/types/product";
import { formatCurrency } from "@/utils/OrderRelated";
import { X } from "lucide-react";

interface ActiveFiltersProps {
  filters: FilterState;
  onRemoveFilter: (key: keyof FilterState, value?: string) => void;
  onClearAll: () => void;
}

export default function ActiveFilters({
  filters,
  onRemoveFilter,
  onClearAll,
}: ActiveFiltersProps) {
  const activeFilters: {
    key: keyof FilterState;
    value: string;
    label: string;
  }[] = [];

  filters.categories.forEach((c) => {
    const cat = categories.find((cat) => cat.id === c);
    if (cat)
      activeFilters.push({ key: "categories", value: c, label: cat.name });
  });

  filters.offers.forEach((o) => {
    const labels: Record<string, string> = {
      "on-sale": "On Sale",
      new: "New Arrivals",
      bestseller: "Bestsellers",
    };
    activeFilters.push({ key: "offers", value: o, label: labels[o] || o });
  });

  if (filters.priceRange[0] > 0 || filters.priceRange[1] < 10000) {
    activeFilters.push({
      key: "priceRange",
      value: "price",
      label: `${formatCurrency(filters.priceRange[0])} - ${formatCurrency(
        filters.priceRange[1]
      )}`,
    });
  }

  if (activeFilters.length === 0) return null;

  return (
    <div className="bg-[#FFF9E6]/50 rounded-xl p-4 mb-6 border border-[#DDA200]/20">
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-sm text-stone-600 font-medium">
          Active Filters:
        </span>
        {activeFilters.map((filter, index) => (
          <button
            key={`${filter.key}-${filter.value}-${index}`}
            onClick={() => onRemoveFilter(filter.key, filter.value)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-white text-[#b38600] 
              text-sm font-medium rounded-full border-2 border-[#DDA200]/30
              hover:bg-[#DDA200] hover:text-white hover:border-[#DDA200] transition-all duration-200 shadow-sm"
          >
            {filter.label}
            <X className="w-3.5 h-3.5" />
          </button>
        ))}
        <button
          onClick={onClearAll}
          className="text-sm text-red-500 hover:text-red-600 font-semibold ml-2 hover:underline transition-colors"
        >
          Clear All
        </button>
      </div>
    </div>
  );
}
