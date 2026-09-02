// src/app/products/[slug]/loading.tsx
export default function ProductLoading() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-[#FFF8E1]/20 to-white">
      <div className="container mx-auto px-4 py-8">
        {/* Breadcrumb Skeleton */}
        <div className="flex gap-2 mb-8">
          <div className="h-4 w-12 bg-stone-200 rounded animate-pulse" />
          <div className="h-4 w-4 bg-stone-200 rounded animate-pulse" />
          <div className="h-4 w-20 bg-stone-200 rounded animate-pulse" />
          <div className="h-4 w-4 bg-stone-200 rounded animate-pulse" />
          <div className="h-4 w-32 bg-stone-200 rounded animate-pulse" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Image Gallery Skeleton */}
          <div className="space-y-4">
            <div className="aspect-square bg-stone-200 rounded-2xl animate-pulse" />
            <div className="flex gap-3">
              {[...Array(4)].map((_, i) => (
                <div
                  key={i}
                  className="w-20 h-20 bg-stone-200 rounded-lg animate-pulse"
                />
              ))}
            </div>
          </div>

          {/* Product Info Skeleton */}
          <div className="space-y-6">
            <div className="h-4 w-24 bg-stone-200 rounded animate-pulse" />
            <div className="h-10 w-3/4 bg-stone-200 rounded animate-pulse" />
            <div className="flex gap-2">
              <div className="h-5 w-32 bg-stone-200 rounded animate-pulse" />
            </div>
            <div className="flex gap-4">
              <div className="h-10 w-32 bg-stone-200 rounded animate-pulse" />
              <div className="h-6 w-24 bg-stone-200 rounded animate-pulse" />
            </div>
            <div className="space-y-2">
              <div className="h-4 w-full bg-stone-200 rounded animate-pulse" />
              <div className="h-4 w-5/6 bg-stone-200 rounded animate-pulse" />
              <div className="h-4 w-4/6 bg-stone-200 rounded animate-pulse" />
            </div>
            <div className="space-y-3">
              <div className="h-5 w-20 bg-stone-200 rounded animate-pulse" />
              <div className="flex gap-3">
                {[...Array(3)].map((_, i) => (
                  <div
                    key={i}
                    className="h-12 w-24 bg-stone-200 rounded-lg animate-pulse"
                  />
                ))}
              </div>
            </div>
            <div className="flex gap-4 pt-4">
              <div className="h-14 flex-1 bg-stone-200 rounded-xl animate-pulse" />
              <div className="h-14 w-14 bg-stone-200 rounded-xl animate-pulse" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
