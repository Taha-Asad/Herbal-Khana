export function CartLoadingSkeleton() {
  return (
    <div className="space-y-4 animate-pulse">
      {[1, 2, 3].map((i) => (
        <div
          key={i}
          className="bg-white rounded-2xl border-2 border-stone-200 p-6"
        >
          <div className="flex gap-6">
            <div className="w-32 h-32 bg-stone-200 rounded-xl" />
            <div className="flex-1 space-y-3">
              <div className="h-5 bg-stone-200 rounded w-3/4" />
              <div className="h-4 bg-stone-200 rounded w-1/2" />
              <div className="h-4 bg-stone-200 rounded w-1/4" />
              <div className="flex gap-4 pt-4">
                <div className="h-10 bg-stone-200 rounded w-32" />
                <div className="h-10 bg-stone-200 rounded w-20" />
              </div>
            </div>
            <div className="h-8 bg-stone-200 rounded w-24" />
          </div>
        </div>
      ))}
    </div>
  );
}
