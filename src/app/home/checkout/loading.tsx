// app/checkout/loading.tsx
export default function CheckoutLoading() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-[#FFF8E1]/30 to-white">
      {/* Header Skeleton */}
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-stone-200">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="h-6 w-32 bg-stone-200 rounded animate-pulse" />
            <div className="h-6 w-24 bg-stone-200 rounded animate-pulse" />
            <div className="w-24" />
          </div>
        </div>
      </header>

      {/* Progress Steps Skeleton */}
      <div className="bg-white border-b border-stone-200">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-center gap-4 md:gap-8">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="flex items-center gap-2">
                <div className="w-10 h-10 bg-stone-200 rounded-full animate-pulse" />
                <div className="hidden md:block h-4 w-16 bg-stone-200 rounded animate-pulse" />
                {i < 4 && (
                  <div className="hidden md:block w-16 h-0.5 bg-stone-200" />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content Skeleton */}
      <main className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-2xl border-2 border-stone-200 p-6 md:p-8">
              <div className="h-8 w-48 bg-stone-200 rounded animate-pulse mb-6" />
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="h-24 bg-stone-100 rounded-xl animate-pulse"
                  />
                ))}
              </div>
            </div>

            {/* Navigation buttons skeleton */}
            <div className="flex justify-between pt-4">
              <div className="h-12 w-24 bg-stone-200 rounded-xl animate-pulse" />
              <div className="h-12 w-32 bg-stone-200 rounded-xl animate-pulse" />
            </div>
          </div>

          {/* Right Column - Order Summary Skeleton */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl border-2 border-stone-200 p-6 sticky top-32">
              <div className="h-6 w-32 bg-stone-200 rounded animate-pulse mb-6" />

              {/* Items skeleton */}
              <div className="space-y-3 mb-6">
                {[1, 2].map((i) => (
                  <div key={i} className="flex gap-3">
                    <div className="w-16 h-16 bg-stone-200 rounded-lg animate-pulse" />
                    <div className="flex-1 space-y-2">
                      <div className="h-4 w-3/4 bg-stone-200 rounded animate-pulse" />
                      <div className="h-3 w-1/2 bg-stone-200 rounded animate-pulse" />
                    </div>
                  </div>
                ))}
              </div>

              {/* Summary lines skeleton */}
              <div className="space-y-3 py-4 border-t border-stone-200">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="flex justify-between">
                    <div className="h-4 w-20 bg-stone-200 rounded animate-pulse" />
                    <div className="h-4 w-16 bg-stone-200 rounded animate-pulse" />
                  </div>
                ))}
              </div>

              {/* Total skeleton */}
              <div className="flex justify-between py-4 border-t border-stone-200">
                <div className="h-6 w-16 bg-stone-200 rounded animate-pulse" />
                <div className="h-6 w-24 bg-stone-200 rounded animate-pulse" />
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
