import { Skeleton } from '@/components/ui/LoadingSkeleton'

export default function AnalyticsLoading() {
  return (
    <div className="space-y-6 page-wrapper">
      {/* Page Header Skeleton */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Skeleton className="h-8 w-40" />
            <Skeleton className="h-6 w-20 rounded-full" />
          </div>
          <Skeleton className="h-4 w-72" />
        </div>
        <div className="flex gap-1 bg-muted p-1 rounded-xl self-start sm:self-auto">
          <Skeleton className="h-8 w-16 rounded-lg" />
          <Skeleton className="h-8 w-16 rounded-lg" />
          <Skeleton className="h-8 w-16 rounded-lg" />
        </div>
      </div>

      {/* Stats Cards Skeleton */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="bg-card border border-border rounded-2xl p-5 shadow-sm">
            <Skeleton className="h-4 w-24 mb-4" />
            <Skeleton className="h-8 w-32 mb-2" />
            <Skeleton className="h-3 w-20" />
          </div>
        ))}
      </div>

      {/* Area Chart Skeleton */}
      <div className="bg-card border border-border rounded-2xl p-5">
        <div className="flex items-center justify-between mb-5">
          <div>
            <Skeleton className="h-5 w-36 mb-2" />
            <Skeleton className="h-3 w-48" />
          </div>
          <Skeleton className="h-6 w-28 rounded-full" />
        </div>
        <Skeleton className="w-full h-[260px] rounded-xl" />
      </div>

      {/* 2 Cols Charts Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Pie Chart */}
        <div className="bg-card border border-border rounded-2xl p-5">
          <Skeleton className="h-5 w-40 mb-2" />
          <Skeleton className="h-3 w-32 mb-5" />
          <div className="flex items-center gap-4">
            <Skeleton className="w-1/2 h-[180px] rounded-full" />
            <div className="flex-1 space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-4 w-full" />
              ))}
            </div>
          </div>
        </div>

        {/* Bar Chart */}
        <div className="bg-card border border-border rounded-2xl p-5">
          <Skeleton className="h-5 w-36 mb-2" />
          <Skeleton className="h-3 w-40 mb-5" />
          <Skeleton className="w-full h-[180px] rounded-xl" />
        </div>
      </div>

      {/* Progress Bar Skeleton */}
      <div className="bg-card border border-border rounded-2xl p-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <Skeleton className="h-6 w-48 mb-2" />
            <Skeleton className="h-4 w-64" />
          </div>
          <div className="flex flex-col items-end">
            <Skeleton className="h-12 w-24 mb-2" />
            <Skeleton className="h-4 w-36" />
          </div>
        </div>
        <Skeleton className="h-3 w-full rounded-full mt-4" />
        <Skeleton className="h-3 w-64 mt-3" />
      </div>
    </div>
  )
}
