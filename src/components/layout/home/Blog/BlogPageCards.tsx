"use client";

import React, { useState, useMemo } from "react";
import BlogsCard from "@/components/ui/BlogsCard";
import { blogPosts } from "@/lib/blog";
import BlogFilter from "./BlogFilter";
import Pagination from "@/components/ui/Pagination";
import EmptyState from "./ClearFilters";

export default function BlogPageCards() {
  // Filter state
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [sortBy, setSortBy] = useState("Latest");
  const [page, setPage] = useState(1);
  const itemsPerPage = 6;

  // Check if any filters are active
  const hasActiveFilters = useMemo(() => {
    return (
      searchTerm !== "" || selectedCategory !== "All" || sortBy !== "Latest"
    );
  }, [searchTerm, selectedCategory, sortBy]);

  // Filter + Sort logic
  const filtered = useMemo(() => {
    let data = [...blogPosts];

    // Filter by category
    if (selectedCategory !== "All") {
      data = data.filter((x) => x.category === selectedCategory);
    }

    // Filter by search term
    if (searchTerm) {
      const q = searchTerm.toLowerCase().trim();
      data = data.filter(
        (x) =>
          x.title.toLowerCase().includes(q) ||
          x.excerpt.toLowerCase().includes(q) ||
          x.author.toLowerCase().includes(q) ||
          x.category.toLowerCase().includes(q)
      );
    }

    // Sort data
    switch (sortBy) {
      case "Latest":
        data.sort(
          (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
        );
        break;
      case "Featured":
        data.sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0));
        break;
      case "Most Viewed":
        data.sort((a, b) => (b.views || 0) - (a.views || 0));
        break;
      case "Alphabetical":
        data.sort((a, b) => a.title.localeCompare(b.title));
        break;
    }

    return data;
  }, [searchTerm, selectedCategory, sortBy]);

  // Pagination calculations
  const totalPages = Math.ceil(filtered.length / itemsPerPage);
  const paginated = filtered.slice(
    (page - 1) * itemsPerPage,
    page * itemsPerPage
  );

  // Clear all filters
  const clearFilters = () => {
    setSearchTerm("");
    setSelectedCategory("All");
    setSortBy("Latest");
    setPage(1);
  };

  // Handler functions for the filter component
  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    setPage(1);
  };

  const handleCategoryChange = (value: string) => {
    setSelectedCategory(value);
    setPage(1);
  };

  const handleSortChange = (value: string) => {
    setSortBy(value);
    setPage(1);
  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    // Smooth scroll to top of cards
    window.scrollTo({ top: 400, behavior: "smooth" });
  };

  return (
    <div className="relative bg-gradient-to-br from-white via-[#FFF8E1] to-white py-20 overflow-hidden">
      {/* Animated Background Effects */}
      <div className="absolute inset-0 opacity-20 pointer-events-none">
        <div className="absolute top-1/4 left-0 w-96 h-96 bg-[#DDA200]/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-0 w-96 h-96 bg-[#DDA200]/20 rounded-full blur-3xl animate-pulse delay-1000" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#DDA200]/5 rounded-full blur-3xl" />
      </div>

      <BlogFilter
        filters={{ searchTerm, selectedCategory, sortBy }}
        onSearchChange={handleSearchChange}
        onCategoryChange={handleCategoryChange}
        onSortChange={handleSortChange}
        onClearFilters={clearFilters}
        resultCount={filtered.length}
        hasActiveFilters={hasActiveFilters}
      />

      <div className="container mx-auto px-4">
        {paginated.length > 0 ? (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 place-items-center">
              {paginated.map((item, index) => (
                <div
                  key={item.Id}
                  className="w-full animate-fadeIn"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <BlogsCard
                    Id={item.Id}
                    imageSrc={item.image}
                    subtitle={item.category}
                    title={item.title}
                    content={item.excerpt}
                    author={item.author}
                    date={item.date}
                    featured={item.featured}
                  />
                </div>
              ))}
            </div>

            {/* Pagination */}
            <Pagination
              currentPage={page}
              totalPages={totalPages}
              onPageChange={handlePageChange}
            />
          </>
        ) : (
          <EmptyState onClearFilters={clearFilters} />
        )}
      </div>
    </div>
  );
}
