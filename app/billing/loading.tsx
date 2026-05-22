import { Skeleton } from '@/components/ui/LoadingSkeleton'

export default function BillingLoading() {
  return (
    <div className="space-y-5 page-wrapper">
      {/* Page Header Skeleton */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-4 border-b border-border">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-6 w-16 rounded-full" />
          </div>
          <Skeleton className="h-4 w-96" />
        </div>
        <Skeleton className="h-10 w-36 rounded-xl" />
      </div>

      {/* Stats Cards Skeleton */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="border border-border/80 rounded-2xl p-4 shadow-sm border-t-[3px]">
            <Skeleton className="h-3 w-24 mb-2" />
            <Skeleton className="h-7 w-32" />
          </div>
        ))}
      </div>

      {/* Search & Tabs Skeleton */}
      <div className="bg-card border border-border rounded-2xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm">
        <Skeleton className="h-10 w-full max-w-sm rounded-xl" />
        <div className="flex gap-1 overflow-x-hidden">
          {Array.from({ length: 5 }).map((_, i) => (
             <Skeleton key={i} className="h-8 w-24 rounded-xl" />
          ))}
        </div>
      </div>

      {/* Invoice List Skeleton */}
      <div className="space-y-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="bg-card border border-border rounded-2xl p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="flex items-center gap-3.5 flex-1 min-w-0">
              <Skeleton className="w-10 h-10 rounded-xl flex-shrink-0" />
              <div className="min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <Skeleton className="h-5 w-24" />
                  <Skeleton className="h-5 w-16 rounded-full" />
                </div>
                <Skeleton className="h-3 w-40" />
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-4 sm:gap-6">
              <div>
                <Skeleton className="h-3 w-16 mb-1" />
                <Skeleton className="h-4 w-20" />
              </div>
              <div>
                <Skeleton className="h-3 w-16 mb-1" />
                <Skeleton className="h-4 w-20" />
              </div>
              <div>
                <Skeleton className="h-3 w-20 mb-1" />
                <Skeleton className="h-5 w-24" />
              </div>
            </div>

            <div className="flex items-center gap-2 border-t lg:border-t-0 pt-3 lg:pt-0 border-border justify-between">
              <div className="flex items-center gap-2">
                 <Skeleton className="w-8 h-8 rounded-xl" />
                 <Skeleton className="w-8 h-8 rounded-xl" />
                 <Skeleton className="w-8 h-8 rounded-xl" />
                 <Skeleton className="w-8 h-8 rounded-xl" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
