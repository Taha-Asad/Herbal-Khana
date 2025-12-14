export default function ProductSkeleton() {
  return (
    <div className="bg-white rounded-2xl border-2 border-stone-200 overflow-hidden animate-pulse">
      <div className="aspect-square bg-gradient-to-br from-stone-200 to-stone-100" />
      <div className="p-4 space-y-3">
        <div className="h-3 bg-stone-200 rounded w-1/3" />
        <div className="h-5 bg-stone-200 rounded w-full" />
        <div className="h-5 bg-stone-200 rounded w-2/3" />
        <div className="h-4 bg-stone-200 rounded w-1/2" />
        <div className="pt-2 border-t border-stone-100">
          <div className="h-6 bg-stone-200 rounded w-1/3" />
        </div>
      </div>
    </div>
  );
}
