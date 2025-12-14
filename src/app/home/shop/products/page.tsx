// app/products/page.tsx
"use client";

import React, { Suspense } from "react";
import { Loader2 } from "lucide-react";
import ProductsContent from "@/components/layout/home/Product/ProductContent";

// =============================================================================
// TYPES & INTERFACES
// =============================================================================

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
