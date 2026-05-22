import { Skeleton } from '@/components/ui/LoadingSkeleton'

export default function StaffLoading() {
  return (
    <div className="space-y-6 page-wrapper">
      {/* Page Header Skeleton */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-4 border-b border-border">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Skeleton className="h-8 w-48" />
          </div>
          <Skeleton className="h-4 w-72" />
        </div>
      </div>

      {/* Summary & Search Skeleton */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-3">
           <Skeleton className="h-5 w-16" />
           <Skeleton className="h-5 w-16" />
           <Skeleton className="h-5 w-16" />
        </div>
        <div className="flex items-center gap-2">
           <Skeleton className="h-8 w-40 rounded-xl" />
           <Skeleton className="h-8 w-24 rounded-xl" />
        </div>
      </div>

      {/* Staff Cards Grid Skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="bg-card border border-border rounded-2xl p-5 shadow-sm">
            <div className="flex items-start justify-between mb-4">
               <div className="flex items-center gap-3">
                 <Skeleton className="w-12 h-12 rounded-2xl flex-shrink-0" />
                 <div>
                   <Skeleton className="h-4 w-32 mb-1" />
                   <Skeleton className="h-4 w-16 rounded-md" />
                 </div>
               </div>
               <Skeleton className="w-8 h-8 rounded-lg" />
            </div>

            <div className="space-y-2 mb-4">
               <Skeleton className="h-4 w-48" />
               <Skeleton className="h-4 w-56" />
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-border/60">
               <Skeleton className="h-4 w-20" />
               <Skeleton className="h-4 w-16" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
