import { CardSkeleton, Skeleton } from '@/components/ui/LoadingSkeleton'

export default function OrdersLoading() {
  return (
    <div className="space-y-5 page-wrapper">
      {/* Page Header Skeleton */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-4 border-b border-border">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Skeleton className="h-8 w-56" />
            <Skeleton className="h-6 w-16 rounded-full" />
          </div>
          <Skeleton className="h-4 w-96" />
        </div>
        <div className="flex gap-2">
          <Skeleton className="h-10 w-32 rounded-xl" />
          <Skeleton className="h-10 w-32 rounded-xl" />
        </div>
      </div>

      {/* Search & View Mode Skeleton */}
      <div className="bg-card border border-border rounded-2xl p-3 sm:p-4 flex flex-row items-center justify-between gap-3 sm:gap-4 shadow-sm">
        <Skeleton className="h-10 w-full max-w-sm rounded-xl" />
        <div className="flex items-center justify-end gap-2 border-l border-border pl-3 sm:pl-4">
          <Skeleton className="h-4 w-16 hidden lg:block" />
          <div className="bg-muted p-1 rounded-xl flex gap-0.5">
            <Skeleton className="h-8 w-8 rounded-lg" />
            <Skeleton className="h-8 w-8 rounded-lg" />
          </div>
        </div>
      </div>

      {/* Tabs Skeleton */}
      <div className="flex gap-1.5 overflow-x-hidden pb-1">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-8 w-24 rounded-xl" />
        ))}
      </div>

      {/* Cards Grid Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <CardSkeleton key={i} />
        ))}
      </div>
    </div>
  )
}
