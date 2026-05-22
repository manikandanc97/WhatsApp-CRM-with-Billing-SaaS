import { ChatSkeleton, Skeleton } from '@/components/ui/LoadingSkeleton'
import { cn } from '@/lib/utils'

export default function WhatsAppLoading() {
  return (
    <div className="wa-root">
      {/* Sidebar List Skeleton */}
      <div className="wa-list wa-list--visible border-r border-border bg-background flex flex-col h-full">
        <div className="flex items-center gap-3 px-4 py-3 border-b border-border bg-card/95 flex-shrink-0">
          <div className="flex-1 min-w-0">
            <Skeleton className="h-5 w-32 mb-1" />
            <Skeleton className="h-3 w-20" />
          </div>
          <div className="flex items-center gap-1.5">
            <Skeleton className="h-7 w-16 rounded-full" />
            <Skeleton className="w-8 h-8 rounded-full" />
          </div>
        </div>
        
        <div className="px-3 py-2 border-b border-border/50 bg-background/50 flex-shrink-0">
          <Skeleton className="h-10 w-full rounded-xl" />
        </div>

        <div className="flex-1 overflow-y-auto">
          <ChatSkeleton />
          <ChatSkeleton />
        </div>
      </div>

      {/* Main Chat Area Skeleton */}
      <div className="wa-chat hidden lg:flex flex-col bg-muted/10 h-full">
        <div className="flex items-center gap-2.5 px-3 py-2.5 border-b border-border bg-card/92 shadow-sm flex-shrink-0">
          <Skeleton className="w-9 h-9 rounded-full flex-shrink-0" />
          <div className="flex-1">
             <Skeleton className="h-4 w-32 mb-1" />
             <Skeleton className="h-3 w-24" />
          </div>
          <div className="flex items-center gap-1.5">
             <Skeleton className="w-16 h-8 rounded-lg" />
             <Skeleton className="w-8 h-8 rounded-full" />
             <Skeleton className="w-8 h-8 rounded-full" />
          </div>
        </div>

        <div className="flex-1 p-4 space-y-6 overflow-y-hidden">
          <div className="flex items-end gap-2 px-4 flex-row-reverse">
             <div className="bg-muted px-4 py-3 rounded-2xl rounded-tr-sm w-48 h-12 shadow-sm" />
          </div>
          <div className="flex items-end gap-2 px-4">
             <Skeleton className="w-7 h-7 rounded-full flex-shrink-0" />
             <div className="bg-muted/80 px-4 py-3 rounded-2xl rounded-tl-sm w-64 h-16 shadow-sm" />
          </div>
           <div className="flex items-end gap-2 px-4 flex-row-reverse">
             <div className="bg-muted px-4 py-3 rounded-2xl rounded-tr-sm w-32 h-10 shadow-sm" />
          </div>
        </div>

        <div className="flex-shrink-0 bg-card border-t border-border/60 px-3 py-2">
          <div className="flex items-center gap-2">
            <Skeleton className="w-9 h-9 rounded-full flex-shrink-0" />
            <Skeleton className="flex-1 h-10 rounded-2xl" />
            <Skeleton className="w-10 h-10 rounded-full flex-shrink-0" />
          </div>
        </div>
      </div>
    </div>
  )
}
