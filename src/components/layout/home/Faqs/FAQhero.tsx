import { HelpCircle, Search, X } from "lucide-react";
import React from "react";

interface FAQHeroProps {
  searchTerm: string;
  setSearchTerm: (value: string) => void;
  resultsCount: number;
}

function FAQhero({ searchTerm, setSearchTerm, resultsCount }: FAQHeroProps) {
  return (
    <section className="relative pt-20 pb-16 px-4">
      <div className="container mx-auto text-center max-w-4xl">
        <div className="inline-flex items-center justify-center w-20 h-20 bg-[#DDA200]/10 rounded-full mb-6">
          <HelpCircle className="w-10 h-10 text-[#DDA200]" />
        </div>

        <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-4">
          Frequently Asked Questions
        </h1>

        <p className="text-lg text-gray-600 mb-8">
          Find answers to common questions about orders, shipping, returns, and
          more.
        </p>

        {/* Search */}
        <div className="relative max-w-2xl mx-auto">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />

          <input
            type="text"
            placeholder="Search for answers..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-12 py-4 rounded-2xl border-2 border-[#e5d9b6]
              bg-white shadow-lg text-gray-700
              focus:border-[#DDA200] focus:ring-4 focus:ring-[#DDA200]/20
              transition-all duration-300"
          />

          {searchTerm && (
            <button
              onClick={() => setSearchTerm("")}
              className="absolute right-4 top-1/2 -translate-y-1/2 p-1 text-gray-400 
                hover:text-[#DDA200] transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {searchTerm && (
          <p className="mt-4 text-gray-600">
            Found{" "}
            <span className="font-bold text-[#DDA200]">{resultsCount}</span>{" "}
            results for &quot;{searchTerm}&quot;
          </p>
        )}
      </div>
    </section>
  );
}

export default FAQhero;
