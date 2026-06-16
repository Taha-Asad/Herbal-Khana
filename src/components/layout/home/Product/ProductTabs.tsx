// src/components/product/ProductTabs.tsx
"use client";

import React, { useState } from "react";
import { FileText, Star, MessageSquare } from "lucide-react";
import type { Product } from "@/types/product";
import type { ReviewData, ReviewStats } from "@/app/action/home/review.action";
import type { CommentData } from "@/app/action/home/comments.action";
import ReviewSection from "./reviews/ReviewSection";
import CommentSection from "./comments/CommentSection";

interface ProductTabsProps {
  product: Product;
  reviews: ReviewData[];
  reviewStats: ReviewStats;
  comments: CommentData[];
  commentCount: number;
}

type TabType = "description" | "reviews" | "comments";

export default function ProductTabs({
  product,
  reviews,
  reviewStats,
  comments,
  commentCount,
}: ProductTabsProps) {
  const [activeTab, setActiveTab] = useState<TabType>("description");

  const tabs = [
    {
      id: "description" as TabType,
      label: "Description",
      icon: FileText,
      count: null,
    },
    {
      id: "reviews" as TabType,
      label: "Reviews",
      icon: Star,
      count: reviewStats.totalReviews,
    },
    {
      id: "comments" as TabType,
      label: "Discussion",
      icon: MessageSquare,
      count: commentCount,
    },
  ];

  return (
    <div id="reviews-section" className="mb-16">
      {/* Tab Headers */}
      <div className="flex border-b-2 border-stone-200 mb-8 overflow-x-auto">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-6 py-4 font-semibold transition-all duration-200 
                whitespace-nowrap border-b-2 -mb-[2px]
                ${
                  isActive
                    ? "text-[#DDA200] border-[#DDA200]"
                    : "text-stone-500 border-transparent hover:text-stone-700 hover:border-stone-300"
                }`}
            >
              <Icon className="w-5 h-5" />
              {tab.label}
              {tab.count !== null && tab.count > 0 && (
                <span
                  className={`text-xs px-2 py-0.5 rounded-full ${
                    isActive
                      ? "bg-[#FFF9E6] text-[#DDA200]"
                      : "bg-stone-100 text-stone-500"
                  }`}
                >
                  {tab.count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Tab Content */}
      <div className="min-h-[400px]">
        {/* Description Tab */}
        {activeTab === "description" && (
          <div className="bg-white rounded-2xl border-2 border-stone-200 p-6 md:p-8">
            {product.description ? (
              <div className="prose prose-stone max-w-none">
                <div
                  dangerouslySetInnerHTML={{ __html: product.description }}
                  className="text-stone-600 leading-relaxed"
                />
              </div>
            ) : (
              <div className="text-center py-12">
                <FileText className="w-12 h-12 text-stone-300 mx-auto mb-4" />
                <p className="text-stone-500">
                  No description available for this product.
                </p>
              </div>
            )}

            {/* Additional Product Info */}
            <div className="mt-8 pt-8 border-t border-stone-200">
              <h3 className="text-lg font-semibold text-stone-800 mb-4">
                Product Details
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex justify-between py-3 border-b border-stone-100">
                  <span className="text-stone-500">SKU</span>
                  <span className="font-medium text-stone-800">
                    {product.sku}
                  </span>
                </div>
                {product.category && (
                  <div className="flex justify-between py-3 border-b border-stone-100">
                    <span className="text-stone-500">Category</span>
                    <span className="font-medium text-stone-800">
                      {product.category.name}
                    </span>
                  </div>
                )}
                {product.weight && (
                  <div className="flex justify-between py-3 border-b border-stone-100">
                    <span className="text-stone-500">Weight</span>
                    <span className="font-medium text-stone-800">
                      {product.weight}g
                    </span>
                  </div>
                )}
                <div className="flex justify-between py-3 border-b border-stone-100">
                  <span className="text-stone-500">Availability</span>
                  <span
                    className={`font-medium ${
                      product.inStock ? "text-green-600" : "text-red-500"
                    }`}
                  >
                    {product.inStock ? "In Stock" : "Out of Stock"}
                  </span>
                </div>
                <div className="flex justify-between py-3 border-b border-stone-100">
                  <span className="text-stone-500">Variants</span>
                  <span className="font-medium text-stone-800">
                    {product.variants.length} options
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Reviews Tab */}
        {activeTab === "reviews" && (
          <ReviewSection
            productId={product.id}
            initialReviews={reviews}
            reviewStats={reviewStats}
            totalReviews={reviewStats.totalReviews}
          />
        )}

        {/* Comments Tab */}
        {activeTab === "comments" && (
          <CommentSection
            productId={product.id}
            initialComments={comments}
            totalComments={commentCount}
          />
        )}
      </div>
    </div>
  );
}
