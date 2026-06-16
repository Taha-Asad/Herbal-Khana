// components/products/ProductSkeleton.tsx
"use client";

interface ProductSkeletonProps {
  viewMode?: "grid" | "list";
}

export default function ProductSkeleton({
  viewMode = "grid",
}: ProductSkeletonProps) {
  if (viewMode === "list") {
    return (
      <div className="bg-white rounded-2xl border-2 border-stone-200 overflow-hidden animate-pulse">
        <div className="flex flex-col md:flex-row">
          {/* Image skeleton */}
          <div className="w-full md:w-64 h-64 bg-stone-200" />

          {/* Content skeleton */}
          <div className="flex-1 p-6 space-y-4">
            <div className="h-4 bg-stone-200 rounded w-20" />
            <div className="h-6 bg-stone-200 rounded w-3/4" />
            <div className="h-4 bg-stone-200 rounded w-full" />
            <div className="h-4 bg-stone-200 rounded w-2/3" />
            <div className="flex items-center gap-1 mt-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="w-4 h-4 bg-stone-200 rounded" />
              ))}
            </div>
            <div className="flex items-center justify-between mt-auto pt-4">
              <div className="h-8 bg-stone-200 rounded w-24" />
              <div className="h-12 bg-stone-200 rounded w-32" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border-2 border-stone-200 overflow-hidden animate-pulse">
      {/* Image skeleton */}
      <div className="aspect-square bg-stone-200" />

      {/* Content skeleton */}
      <div className="p-4 space-y-3">
        <div className="h-3 bg-stone-200 rounded w-16" />
        <div className="h-5 bg-stone-200 rounded w-full" />
        <div className="h-5 bg-stone-200 rounded w-3/4" />
        <div className="flex items-center gap-1">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="w-3.5 h-3.5 bg-stone-200 rounded" />
          ))}
          <div className="h-3 bg-stone-200 rounded w-10 ml-2" />
        </div>
        <div className="flex items-center justify-between pt-2">
          <div className="h-6 bg-stone-200 rounded w-20" />
          <div className="h-4 bg-stone-200 rounded w-16" />
        </div>
      </div>
    </div>
  );
}
