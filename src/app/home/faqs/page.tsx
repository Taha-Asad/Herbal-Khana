"use client";

import React, { useState, useMemo } from "react";
import { Search } from "lucide-react";
import { categories, faqs } from "@/lib/dummyData/faq";
import FAQItem from "@/components/layout/home/Faqs/FAQItem";
import FAQhero from "@/components/layout/home/Faqs/FAQhero";
import QuickLinks from "@/components/layout/home/Faqs/QuickLinks";
import FAQContacts from "@/components/layout/home/Faqs/FAQContacts";

export default function FAQsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [openFAQs, setOpenFAQs] = useState<number[]>([]);

  // Filter FAQs
  const filteredFAQs = useMemo(() => {
    let data = [...faqs];

    if (selectedCategory !== "all") {
      data = data.filter((faq) => faq.category === selectedCategory);
    }

    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      data = data.filter(
        (faq) =>
          faq.question.toLowerCase().includes(q) ||
          faq.answer.toLowerCase().includes(q)
      );
    }

    return data;
  }, [searchTerm, selectedCategory]);

  const toggleFAQ = (id: number) => {
    setOpenFAQs((prev) =>
      prev.includes(id) ? prev.filter((faqId) => faqId !== id) : [...prev, id]
    );
  };

  const expandAll = () => {
    setOpenFAQs(filteredFAQs.map((faq) => faq.id));
  };

  const collapseAll = () => {
    setOpenFAQs([]);
  };

  return (
    <div className="relative min-h-screen py-20 bg-gradient-to-br from-white via-[#FFF8E1] to-white">
      {/* Background Effects */}
      <div className="absolute inset-0 opacity-20 pointer-events-none overflow-hidden">
        <div className="absolute top-1/4 left-0 w-96 h-96 bg-[#DDA200]/20 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-0 w-96 h-96 bg-[#DDA200]/20 rounded-full blur-3xl" />
      </div>

      {/* Hero */}
      <FAQhero
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        resultsCount={filteredFAQs.length}
      />

      {/* ================================================================= */}
      {/* CATEGORY CARDS */}
      {/* ================================================================= */}
      <section className="py-8 px-4">
        <div className="container mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 max-w-6xl mx-auto">
            {categories.map((category) => {
              const Icon = category.icon;
              const count =
                category.id === "all"
                  ? faqs.length
                  : faqs.filter((f) => f.category === category.id).length;

              return (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  className={`
                    relative p-4 rounded-xl border-2 transition-all duration-300
                    flex flex-col items-center text-center gap-2
                    ${
                      selectedCategory === category.id
                        ? "border-[#DDA200] bg-gradient-to-br from-[#FFF9E6] to-[#F7E4B2] shadow-lg shadow-[#DDA200]/20"
                        : "border-[#e5d9b6] bg-white hover:border-[#DDA200]/50 hover:shadow-md"
                    }
                  `}
                >
                  <div
                    className={`p-3 rounded-xl transition-colors ${
                      selectedCategory === category.id
                        ? "bg-[#DDA200] text-white"
                        : "bg-[#DDA200]/10 text-[#DDA200]"
                    }`}
                  >
                    <Icon className="w-6 h-6" />
                  </div>
                  <span
                    className={`font-semibold text-sm ${
                      selectedCategory === category.id
                        ? "text-[#DDA200]"
                        : "text-gray-800"
                    }`}
                  >
                    {category.name}
                  </span>
                  <span className="text-xs text-gray-500">
                    {count} questions
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* ================================================================= */}
      {/* FAQ LIST */}
      {/* ================================================================= */}
      <section className="py-12 px-4">
        <div className="container mx-auto max-w-4xl">
          {/* Controls */}
          <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
            <h2 className="text-2xl font-bold text-gray-800">
              {categories.find((c) => c.id === selectedCategory)?.name}
            </h2>
            <div className="flex gap-2">
              <button
                onClick={expandAll}
                className="px-4 py-2 text-sm font-medium text-[#DDA200] bg-[#DDA200]/10 
                  rounded-lg hover:bg-[#DDA200]/20 transition-colors"
              >
                Expand All
              </button>
              <button
                onClick={collapseAll}
                className="px-4 py-2 text-sm font-medium text-gray-600 bg-gray-100 
                  rounded-lg hover:bg-gray-200 transition-colors"
              >
                Collapse All
              </button>
            </div>
          </div>

          {/* FAQ Items */}
          {filteredFAQs.length > 0 ? (
            <div className="space-y-4">
              {filteredFAQs.map((faq) => (
                <FAQItem
                  key={faq.id}
                  faq={faq}
                  isOpen={openFAQs.includes(faq.id)}
                  onToggle={() => toggleFAQ(faq.id)}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <div className="w-20 h-20 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                <Search className="w-10 h-10 text-gray-400" />
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">
                No results found
              </h3>
              <p className="text-gray-600 mb-4">
                Try adjusting your search or browse a different category
              </p>
              <button
                onClick={() => {
                  setSearchTerm("");
                  setSelectedCategory("all");
                }}
                className="px-6 py-2 bg-[#DDA200] text-white font-medium rounded-lg 
                  hover:bg-[#b38600] transition-colors"
              >
                Clear Filters
              </button>
            </div>
          )}
        </div>
      </section>

      <FAQContacts />

      <QuickLinks />
    </div>
  );
}
