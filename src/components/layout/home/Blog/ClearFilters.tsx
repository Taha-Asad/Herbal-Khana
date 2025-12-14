import { Search } from "lucide-react";

function EmptyState({ onClearFilters }: { onClearFilters: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 px-4">
      <div className="w-24 h-24 bg-[#DDA200]/10 rounded-full flex items-center justify-center mb-6">
        <Search className="w-12 h-12 text-[#DDA200]" />
      </div>
      <h3 className="text-2xl font-bold text-gray-800 mb-2">
        No articles found
      </h3>
      <p className="text-gray-500 text-center max-w-md mb-6">
        We could n&apos;t find any articles matching your criteria. Try
        adjusting your filters or search terms.
      </p>
      <button
        onClick={onClearFilters}
        className="px-6 py-3 bg-[#DDA200] text-white font-semibold rounded-xl 
          hover:bg-[#b38600] transition-all duration-300 hover:scale-105"
      >
        Clear All Filters
      </button>
    </div>
  );
}
export default EmptyState;
