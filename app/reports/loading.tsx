import { Skeleton } from '@/components/ui/LoadingSkeleton'

export default function ReportsLoading() {
  return (
    <div className="space-y-6 page-wrapper">
      {/* Page Header Skeleton */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-4 border-b border-border">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Skeleton className="h-8 w-32" />
          </div>
          <Skeleton className="h-4 w-64" />
        </div>
      </div>

      {/* Tabs & Export Skeleton */}
      <div className="flex items-center gap-2">
        <Skeleton className="h-9 w-20 rounded-xl" />
        <Skeleton className="h-9 w-20 rounded-xl" />
        <Skeleton className="h-9 w-20 rounded-xl" />
        <div className="ml-auto">
          <Skeleton className="h-9 w-28 rounded-xl" />
        </div>
      </div>

      {/* KPI Cards Skeleton */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="bg-card border border-border rounded-2xl p-5 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <Skeleton className="h-3 w-20" />
              <Skeleton className="w-8 h-8 rounded-xl flex-shrink-0" />
            </div>
            <Skeleton className="h-8 w-24 mb-2" />
            <Skeleton className="h-3 w-32" />
          </div>
        ))}
      </div>

      {/* Charts Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Area Chart Skeleton */}
        <div className="lg:col-span-2 bg-card border border-border rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-5">
            <div>
              <Skeleton className="h-5 w-32 mb-1" />
              <Skeleton className="h-3 w-40" />
            </div>
            <Skeleton className="h-6 w-32 rounded-full" />
          </div>
          <Skeleton className="w-full h-[220px] rounded-xl" />
        </div>

        {/* Pie Chart Skeleton */}
        <div className="bg-card border border-border rounded-2xl p-5 shadow-sm">
          <Skeleton className="h-5 w-40 mb-1" />
          <Skeleton className="h-3 w-36 mb-4" />
          <div className="flex justify-center mb-4">
            <Skeleton className="w-[160px] h-[160px] rounded-full" />
          </div>
          <div className="space-y-3 mt-6">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Skeleton className="w-2 h-2 rounded-full" />
                  <Skeleton className="h-3 w-24" />
                </div>
                <Skeleton className="h-3 w-8" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
