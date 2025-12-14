// app/products/page.tsx
"use client";

import React, { Suspense } from "react";
import { Loader2 } from "lucide-react";
import ProductsContent from "@/components/layout/home/Product/ProductContent";

// =============================================================================
// TYPES & INTERFACES
// =============================================================================
export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  shortDescription: string;
  images: string[];
  price: number;
  originalPrice?: number;
  discount?: number;
  category: string;
  subcategory?: string;
  tags: string[];
  ingredients: string[];
  skinType: string[];
  concerns: string[];
  rating: number;
  reviewCount: number;
  inStock: boolean;
  stockCount?: number;
  isNew?: boolean;
  isBestseller?: boolean;
  isFeatured?: boolean;
  isOrganic?: boolean;
  size?: string;
  volume?: string;
  sku: string;
  benefits: string[];
  createdAt: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  icon: React.ElementType;
  count: number;
  subcategories?: { id: string; name: string; slug: string; count: number }[];
}

export interface FilterState {
  categories: string[];
  subcategories: string[];
  priceRange: [number, number];
  skinTypes: string[];
  concerns: string[];
  ingredients: string[];
  ratings: number[];
  availability: string[];
  offers: string[];
  sortBy: string;
}

export interface PaginationInfo {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
}

export default function ProductsPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gradient-to-br from-white via-[#FFF8E1]/20 to-white flex items-center justify-center">
          <div className="text-center">
            <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-[#FFF9E6] to-[#FFF0C2] rounded-full flex items-center justify-center animate-pulse">
              <Loader2 className="w-8 h-8 text-[#DDA200] animate-spin" />
            </div>
            <p className="text-stone-600 font-medium">Loading products...</p>
          </div>
        </div>
      }
    >
      <ProductsContent />
    </Suspense>
  );
}
