// src/components/product/ProductTabs.tsx
"use client";

import React, { useState } from "react";
import { Star, User, ThumbsUp, MessageSquare } from "lucide-react";
import type { Product } from "@/types/product";

interface ProductTabsProps {
  product: Product;
}

type TabId = "description" | "reviews" | "shipping";

export default function ProductTabs({ product }: ProductTabsProps) {
  const [activeTab, setActiveTab] = useState<TabId>("description");

  const tabs = [
    { id: "description" as TabId, label: "Description", icon: MessageSquare },
    {
      id: "reviews" as TabId,
      label: `Reviews (${product.reviewCount})`,
      icon: Star,
    },
    { id: "shipping" as TabId, label: "Shipping & Returns", icon: ThumbsUp },
  ];

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <div className="bg-white rounded-2xl border-2 border-stone-200 overflow-hidden mb-16">
      {/* Tab Headers */}
      <div className="flex border-b border-stone-200 overflow-x-auto">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-6 py-4 font-medium whitespace-nowrap transition-colors
                ${
                  activeTab === tab.id
                    ? "text-[#DDA200] border-b-2 border-[#DDA200] bg-[#FFF9E6]/50"
                    : "text-stone-600 hover:text-[#DDA200]"
                }`}
            >
              <Icon className="w-5 h-5" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Tab Content */}
      <div className="p-6 md:p-8">
        {/* Description Tab */}
        {activeTab === "description" && (
          <div className="prose prose-stone max-w-none">
            {product.description ? (
              <div
                dangerouslySetInnerHTML={{
                  __html: product.description.replace(/\n/g, "<br/>"),
                }}
              />
            ) : (
              <p className="text-stone-500">No description available.</p>
            )}

            {/* Product Details */}
            <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-stone-50 rounded-xl p-4">
                <h4 className="font-semibold text-stone-800 mb-3">
                  Product Details
                </h4>
                <dl className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <dt className="text-stone-500">SKU</dt>
                    <dd className="font-medium text-stone-800">
                      {product.sku}
                    </dd>
                  </div>
                  {product.weight && (
                    <div className="flex justify-between">
                      <dt className="text-stone-500">Weight</dt>
                      <dd className="font-medium text-stone-800">
                        {product.weight}g
                      </dd>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <dt className="text-stone-500">Category</dt>
                    <dd className="font-medium text-stone-800">
                      {product.category?.name || "N/A"}
                    </dd>
                  </div>
                </dl>
              </div>

              <div className="bg-stone-50 rounded-xl p-4">
                <h4 className="font-semibold text-stone-800 mb-3">
                  Available Variants
                </h4>
                <div className="space-y-2 text-sm">
                  {product.variants.map((variant) => (
                    <div key={variant.id} className="flex justify-between">
                      <span className="text-stone-500">{variant.name}</span>
                      <span className="font-medium text-stone-800">
                        PKR {variant.price.toLocaleString()}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Reviews Tab */}
        {activeTab === "reviews" && (
          <div>
            {/* Rating Summary */}
            <div className="flex flex-col md:flex-row gap-8 mb-8 pb-8 border-b border-stone-200">
              <div className="text-center">
                <div className="text-5xl font-bold text-[#DDA200]">
                  {product.rating > 0 ? product.rating.toFixed(1) : "0"}
                </div>
                <div className="flex justify-center mt-2">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-5 h-5 ${
                        i < Math.floor(product.rating)
                          ? "text-[#DDA200] fill-[#DDA200]"
                          : "text-stone-300"
                      }`}
                    />
                  ))}
                </div>
                <p className="text-stone-500 mt-1">
                  Based on {product.reviewCount} reviews
                </p>
              </div>
            </div>

            {/* Reviews List */}
            {product.reviews && product.reviews.length > 0 ? (
              <div className="space-y-6">
                {product.reviews.map((review) => (
                  <div key={review.id} className="p-6 bg-stone-50 rounded-xl">
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 bg-[#DDA200] rounded-full flex items-center justify-center text-white font-bold">
                        {review.user.name?.charAt(0) || (
                          <User className="w-5 h-5" />
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                          <div>
                            <span className="font-semibold text-stone-800">
                              {review.user.name || "Anonymous"}
                            </span>
                            <div className="flex items-center gap-2 mt-1">
                              {[...Array(5)].map((_, i) => (
                                <Star
                                  key={i}
                                  className={`w-4 h-4 ${
                                    i < review.rating
                                      ? "text-[#DDA200] fill-[#DDA200]"
                                      : "text-stone-300"
                                  }`}
                                />
                              ))}
                            </div>
                          </div>
                          <span className="text-sm text-stone-400">
                            {formatDate(review.createdAt)}
                          </span>
                        </div>
                        {review.title && (
                          <h4 className="font-semibold text-stone-800 mb-1">
                            {review.title}
                          </h4>
                        )}
                        {review.content && (
                          <p className="text-stone-600">{review.content}</p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Star className="w-12 h-12 text-stone-300 mx-auto mb-4" />
                <h4 className="text-lg font-semibold text-stone-800 mb-2">
                  No Reviews Yet
                </h4>
                <p className="text-stone-500">
                  Be the first to review this product!
                </p>
              </div>
            )}
          </div>
        )}

        {/* Shipping Tab */}
        {activeTab === "shipping" && (
          <div className="space-y-6">
            <div>
              <h4 className="font-semibold text-stone-800 mb-3">
                Shipping Information
              </h4>
              <ul className="space-y-2 text-stone-600">
                <li className="flex items-start gap-2">
                  <span className="text-[#DDA200]">•</span>
                  Free standard shipping on orders over PKR 5,000
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#DDA200]">•</span>
                  Standard shipping: 5-7 business days (PKR 200)
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#DDA200]">•</span>
                  Express shipping: 2-3 business days (PKR 400)
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#DDA200]">•</span>
                  Overnight shipping: Next business day (PKR 700)
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold text-stone-800 mb-3">
                Return Policy
              </h4>
              <ul className="space-y-2 text-stone-600">
                <li className="flex items-start gap-2">
                  <span className="text-[#DDA200]">•</span>
                  7-day return policy for unused items
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#DDA200]">•</span>
                  Items must be in original packaging
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#DDA200]">•</span>
                  Refunds processed within 5-7 business days
                </li>
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
