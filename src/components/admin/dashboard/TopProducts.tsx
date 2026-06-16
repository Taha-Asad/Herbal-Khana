// components/admin/dashboard/TopProducts.tsx
"use client";

import React from "react";
import Link from "next/link";
import { Package, ArrowRight, TrendingUp } from "lucide-react";
import { TopProductSummary } from "@/types/admin";
import Image from "next/image";

interface TopProductsProps {
  products: TopProductSummary[];
  loading?: boolean;
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-PK", {
    style: "currency",
    currency: "PKR",
    minimumFractionDigits: 0,
  }).format(amount);
}

export default function TopProducts({
  products,
  loading = false,
}: TopProductsProps) {
  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="flex items-center gap-3 p-4 animate-pulse">
            <div className="w-6 h-6 bg-gray-200 rounded" />
            <div className="w-12 h-12 bg-gray-200 rounded-lg" />
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-gray-200 rounded w-2/3" />
              <div className="h-3 bg-gray-200 rounded w-1/3" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <Package className="w-12 h-12 text-gray-300 mb-3" />
        <p className="text-gray-500">No products yet</p>
      </div>
    );
  }

  return (
    <div className="divide-y divide-gray-100">
      {products.map((product, index) => (
        <Link
          key={product.id}
          href={`/admin/products/${product.id}`}
          className="flex items-center gap-3 p-4 hover:bg-gray-50 transition-colors"
        >
          {/* Rank */}
          <span
            className={`w-6 h-6 flex items-center justify-center text-sm font-bold rounded
              ${
                index === 0
                  ? "bg-amber-100 text-amber-700"
                  : index === 1
                  ? "bg-gray-100 text-gray-700"
                  : index === 2
                  ? "bg-orange-100 text-orange-700"
                  : "text-gray-400"
              }`}
          >
            {index + 1}
          </span>

          {/* Image */}
          <div className="w-12 h-12 rounded-lg bg-gray-100 overflow-hidden flex-shrink-0">
            {product.image ? (
              <Image
                src={product.image}
                alt={product.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <Package className="w-5 h-5 text-gray-400" />
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="flex-1 min-w-0">
            <p className="font-medium text-gray-900 truncate">{product.name}</p>
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <TrendingUp className="w-3 h-3 text-green-500" />
              <span>{product.sold} sold</span>
              <span>•</span>
              <span>Stock: {product.stock}</span>
            </div>
          </div>

          {/* Price */}
          <div className="text-right flex-shrink-0">
            <p className="font-semibold text-amber-600">
              {formatCurrency(product.price)}
            </p>
          </div>
        </Link>
      ))}

      {/* View All Link */}
      <div className="p-4">
        <Link
          href="/admin/products"
          className="flex items-center justify-center gap-2 text-sm font-medium text-amber-600 
            hover:text-amber-700 transition-colors"
        >
          View All Products
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
}
