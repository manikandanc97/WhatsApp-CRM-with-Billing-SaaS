import { Skeleton } from '@/components/ui/LoadingSkeleton'

export default function InventoryLoading() {
  return (
    <div className="space-y-6 page-wrapper">
      {/* Page Header Skeleton */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-4 border-b border-border">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-6 w-16 rounded-full" />
          </div>
          <Skeleton className="h-4 w-72" />
        </div>
      </div>

      {/* Summary Cards Skeleton */}
      <div className="grid grid-cols-3 gap-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="bg-card border rounded-2xl p-4 shadow-sm">
            <div className="flex items-center gap-3">
              <Skeleton className="w-9 h-9 rounded-xl flex-shrink-0" />
              <div>
                <Skeleton className="h-7 w-12 mb-1" />
                <Skeleton className="h-3 w-20" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Table Section Skeleton */}
      <div className="bg-card border border-border rounded-2xl shadow-sm overflow-hidden">
        {/* Table Header Controls */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-5 border-b border-border">
          <Skeleton className="h-5 w-24" />
          <div className="flex items-center gap-2">
            <Skeleton className="h-8 w-40 rounded-xl" />
            <Skeleton className="h-8 w-24 rounded-xl" />
            <Skeleton className="h-8 w-20 rounded-xl" />
          </div>
        </div>
        
        {/* Table Content */}
        <div className="p-5 space-y-4">
           {/* Table headers */}
           <div className="flex gap-4 mb-2 pb-2 border-b border-border">
             <Skeleton className="h-3 w-32" />
             <Skeleton className="h-3 w-24" />
             <Skeleton className="h-3 w-24" />
             <Skeleton className="h-3 w-16" />
             <Skeleton className="h-3 w-24" />
           </div>

           {/* Table rows */}
           {Array.from({ length: 6 }).map((_, i) => (
             <div key={i} className="flex items-center gap-4 py-2 border-b border-border/40">
                <div className="w-48 flex items-center gap-2">
                   <Skeleton className="w-8 h-8 rounded-lg flex-shrink-0" />
                   <Skeleton className="h-4 w-32" />
                </div>
                <Skeleton className="w-24 h-4" />
                <Skeleton className="w-24 h-4" />
                <Skeleton className="w-16 h-4" />
                <Skeleton className="w-24 h-4" />
                <Skeleton className="w-20 h-5 rounded-full" />
             </div>
           ))}
        </div>
      </div>
    </div>
  )
}
