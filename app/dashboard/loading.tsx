import { Skeleton } from '@/components/ui/LoadingSkeleton'

export default function DashboardLoading() {
  return (
    <div className="space-y-6 page-wrapper">
      {/* Header Skeleton */}
      <div className="flex items-start justify-between">
        <div>
          <Skeleton className="h-8 w-64 mb-2" />
          <Skeleton className="h-4 w-96" />
        </div>
        <div className="hidden md:flex items-center gap-2">
          <Skeleton className="h-8 w-40 rounded-full" />
          <Skeleton className="h-8 w-8 rounded-xl" />
        </div>
      </div>

      {/* Stats Cards Row Skeleton */}
      <div className="flex overflow-x-auto lg:grid lg:grid-cols-4 gap-4 pb-2 lg:pb-0">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="min-w-[260px] lg:min-w-0 bg-card border border-border rounded-2xl p-5 shrink-0 lg:shrink">
            <Skeleton className="h-3.5 w-24 mb-4 rounded-md" />
            <div className="flex items-end justify-between">
              <div>
                <Skeleton className="h-8 w-28 mb-2 rounded-md" />
                <Skeleton className="h-3 w-20 rounded-md" />
              </div>
              <Skeleton className="h-10 w-10 rounded-xl" />
            </div>
          </div>
        ))}
      </div>

      {/* Target Progress Skeleton */}
      <div className="bg-card border border-border rounded-2xl shadow-sm p-5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2.5">
            <Skeleton className="w-8 h-8 rounded-xl" />
            <div>
              <Skeleton className="h-4 w-32 mb-1" />
              <Skeleton className="h-3 w-48" />
            </div>
          </div>
          <Skeleton className="h-8 w-16" />
        </div>
        <Skeleton className="h-3.5 w-full rounded-full" />
      </div>

      {/* Charts Row Skeleton */}
      <div className="flex flex-col gap-4 lg:grid lg:grid-cols-3">
        <div className="lg:col-span-2 bg-card border border-border rounded-2xl p-5 space-y-4">
          <div className="flex justify-between">
            <div>
              <Skeleton className="h-5 w-40 mb-2" />
              <Skeleton className="h-3 w-32" />
            </div>
            <Skeleton className="h-6 w-24 rounded-full" />
          </div>
          <Skeleton className="h-56 w-full rounded-xl" />
        </div>
        <div className="bg-card border border-border rounded-2xl p-5 space-y-4">
          <div>
            <Skeleton className="h-5 w-32 mb-2" />
            <Skeleton className="h-3 w-40" />
          </div>
          <Skeleton className="h-48 w-full rounded-xl" />
        </div>
      </div>

      {/* 2nd Charts Row Skeleton */}
      <div className="flex flex-col gap-4 lg:grid lg:grid-cols-2">
         <div className="bg-card border border-border rounded-2xl p-5 space-y-4">
          <div className="flex justify-between">
            <div className="flex gap-2">
              <Skeleton className="w-8 h-8 rounded-xl" />
              <div>
                <Skeleton className="h-4 w-32 mb-1" />
                <Skeleton className="h-3 w-24" />
              </div>
            </div>
            <Skeleton className="h-6 w-24 rounded-full" />
          </div>
          <Skeleton className="h-44 w-full rounded-xl" />
        </div>
        <div className="bg-card border border-border rounded-2xl p-5 space-y-4">
          <div className="flex justify-between">
            <div className="flex gap-2">
              <Skeleton className="w-8 h-8 rounded-xl" />
              <div>
                <Skeleton className="h-4 w-32 mb-1" />
                <Skeleton className="h-3 w-24" />
              </div>
            </div>
            <Skeleton className="h-6 w-24 rounded-full" />
          </div>
          <Skeleton className="h-44 w-full rounded-xl" />
        </div>
      </div>

      {/* Orders & Activity Row Skeleton */}
      <div className="flex flex-col gap-4 lg:grid lg:grid-cols-3">
        <div className="lg:col-span-2 bg-card border border-border rounded-2xl p-5 space-y-4">
          <div className="flex justify-between items-center mb-2">
            <div>
              <Skeleton className="h-5 w-32 mb-2" />
              <Skeleton className="h-3 w-24" />
            </div>
            <div className="flex gap-2">
              <Skeleton className="h-8 w-32 rounded-xl" />
              <Skeleton className="h-8 w-24 rounded-xl" />
            </div>
          </div>
          <div className="space-y-4">
             {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex items-center gap-3">
                  <Skeleton className="w-9 h-9 rounded-xl flex-shrink-0" />
                  <div className="flex-1 space-y-1.5"><Skeleton className="h-3.5 w-36" /><Skeleton className="h-3 w-48" /></div>
                  <Skeleton className="h-6 w-20 rounded-full hidden sm:block" />
                  <Skeleton className="h-6 w-16 rounded-full hidden sm:block" />
                  <Skeleton className="h-4 w-16" />
                </div>
              ))}
          </div>
        </div>
        <div className="bg-card border border-border rounded-2xl p-5 space-y-4">
          <div className="flex items-center gap-2 mb-4">
            <Skeleton className="h-5 w-24" />
            <Skeleton className="h-4 w-12 rounded-full" />
          </div>
          <div className="space-y-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="flex gap-3">
                 <Skeleton className="w-8 h-8 rounded-xl flex-shrink-0" />
                 <div className="flex-1 space-y-1.5">
                   <Skeleton className="h-3.5 w-full" />
                   <Skeleton className="h-3 w-3/4" />
                   <Skeleton className="h-2 w-16" />
                 </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
