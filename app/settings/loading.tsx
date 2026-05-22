import { Skeleton } from '@/components/ui/LoadingSkeleton'

export default function SettingsLoading() {
  return (
    <div className="space-y-6 page-wrapper max-w-5xl">
      {/* Page Header Skeleton */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-4 border-b border-border">
        <div>
          <Skeleton className="h-8 w-48 mb-2" />
          <Skeleton className="h-4 w-72" />
        </div>
        <Skeleton className="h-10 w-36 rounded-xl" />
      </div>

      <div className="flex gap-6">
        {/* Sidebar Tabs Skeleton - Desktop */}
        <div className="hidden md:flex flex-col gap-1 w-52 flex-shrink-0">
          {Array.from({ length: 6 }).map((_, i) => (
             <Skeleton key={i} className="h-10 w-full rounded-xl" />
          ))}
        </div>

        {/* Horizontal Tabs Skeleton - Mobile */}
        <div className="flex md:hidden gap-1 overflow-hidden pb-1 w-full">
           {Array.from({ length: 4 }).map((_, i) => (
             <Skeleton key={i} className="h-9 w-24 rounded-xl flex-shrink-0" />
          ))}
        </div>

        {/* Main Content Area Skeleton */}
        <div className="flex-1 space-y-4 min-w-0">
          {/* Section Card 1 */}
          <div className="bg-card border border-border rounded-2xl overflow-hidden">
             <div className="px-5 py-4 border-b border-border">
                <Skeleton className="h-5 w-40 mb-1" />
                <Skeleton className="h-3 w-64" />
             </div>
             <div className="p-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {Array.from({ length: 4 }).map((_, i) => (
                     <div key={i}>
                       <Skeleton className="h-3 w-24 mb-2" />
                       <Skeleton className="h-10 w-full rounded-xl" />
                     </div>
                  ))}
                  <div className="sm:col-span-2">
                     <Skeleton className="h-3 w-24 mb-2" />
                     <Skeleton className="h-10 w-full rounded-xl" />
                  </div>
                </div>
             </div>
          </div>

          {/* Section Card 2 */}
          <div className="bg-card border border-border rounded-2xl overflow-hidden hidden sm:block">
             <div className="px-5 py-4 border-b border-border">
                <Skeleton className="h-5 w-32 mb-1" />
                <Skeleton className="h-3 w-48" />
             </div>
             <div className="p-5">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Skeleton className="h-3 w-32 mb-2" />
                     <Skeleton className="h-10 w-full rounded-xl" />
                  </div>
                </div>
             </div>
          </div>
        </div>
      </div>
    </div>
  )
}
