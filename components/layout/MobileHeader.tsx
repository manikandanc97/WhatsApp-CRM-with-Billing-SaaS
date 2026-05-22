'use client'

import { Bell, Search, Wifi, WifiOff, RefreshCw, Cloud, CloudOff, CheckCircle2, ChevronDown, Database } from 'lucide-react'
import { useAppStore } from '@/store/useAppStore'
import { useOfflineStore } from '@/store/offline'
import { processSyncQueue, getPendingSyncCount } from '@/services/sync/engine'
import { motion, AnimatePresence } from 'framer-motion'
import { useState, useCallback } from 'react'
import { formatDistanceToNow } from 'date-fns'
import toast from 'react-hot-toast'
import { cn } from '@/lib/utils'

export function MobileHeader() {
  const { user } = useAppStore()
  const { isOnline, isSyncing, pendingSyncCount, lastSyncTime, setSyncing, setPendingCount, setLastSyncTime } = useOfflineStore()
  const [showStatusPanel, setShowStatusPanel] = useState(false)
  const [syncLock, setSyncLock] = useState(false)

  const handleManualSync = useCallback(async () => {
    if (!isOnline || syncLock) return
    setSyncLock(true)
    setSyncing(true)
    try {
      const { synced, failed } = await processSyncQueue()
      const remaining = await getPendingSyncCount()
      setPendingCount(remaining)
      setLastSyncTime(new Date())
      if (synced > 0) toast.success(`Synced ${synced} item${synced > 1 ? 's' : ''} successfully! ⚡`)
      if (failed > 0) toast.error(`${failed} item${failed > 1 ? 's' : ''} failed to sync`)
      if (synced === 0 && failed === 0) toast('Everything is already up to date!', { icon: '✅' })
    } catch (err) {
      toast.error('Sync failed. Please try again.')
    } finally {
      setSyncing(false)
      setSyncLock(false)
    }
  }, [isOnline, syncLock, setSyncing, setPendingCount, setLastSyncTime])

  
  const statusColorClass = isSyncing
    ? 'bg-amber-500'
    : isOnline
    ? 'bg-emerald-500'
    : 'bg-rose-500'

  const statusText = isSyncing
    ? 'Syncing'
    : isOnline
    ? 'Online'
    : 'Offline'

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border/30 dark:border-white/5 px-4 h-[72px] flex items-center justify-between shadow-sm">
        <div 
          onClick={() => setShowStatusPanel(!showStatusPanel)}
          className="flex items-center gap-3 cursor-pointer group"
        >
          <div className="relative">
            <div className="w-10 h-10 rounded-full border border-brand-500/20 overflow-hidden bg-brand-100 flex items-center justify-center flex-shrink-0 transition-transform group-hover:scale-95 duration-200">
              <img 
                src={user?.avatar || "https://api.dicebear.com/7.x/avataaars/svg?seed=Admin"} 
                alt="Profile" 
                className="w-full h-full object-cover" 
              />
            </div>
            {}
            <span className="absolute bottom-0 right-0 flex h-3 w-3">
              {isSyncing && (
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
              )}
              <span className={cn("relative inline-flex rounded-full h-3 w-3 border-2 border-background shadow-sm", statusColorClass)} />
            </span>
          </div>
          
          <div className="flex flex-col">
            <div className="flex items-center gap-1">
              <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider leading-none">
                {user?.role || 'Administrator'}
              </span>
              <ChevronDown className={cn("w-3 h-3 text-muted-foreground transition-transform duration-300", showStatusPanel && "rotate-180")} />
            </div>
            <span className="text-sm font-bold text-foreground leading-tight tracking-tight mt-0.5">
              {user?.name || 'Admin'}
            </span>
          </div>
        </div>

        {}
        <div className="flex items-center gap-2">
          {}
          {pendingSyncCount > 0 && (
            <motion.button 
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              whileTap={{ scale: 0.9 }}
              onClick={handleManualSync}
              className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-500/10 dark:bg-amber-500/20 border border-amber-500/20 text-amber-600 dark:text-amber-400 text-xs font-bold shadow-sm"
            >
              {isSyncing ? (
                <RefreshCw className="w-3 h-3 animate-spin" />
              ) : (
                <Cloud className="w-3 h-3" />
              )}
              <span>{pendingSyncCount}</span>
            </motion.button>
          )}

          <motion.button 
            whileTap={{ scale: 0.9 }} 
            className="p-2.5 text-muted-foreground hover:text-foreground rounded-full bg-muted/30 dark:bg-muted/10 border border-border/10"
          >
            <Search className="w-[18px] h-[18px]" />
          </motion.button>
          
          <motion.button 
            whileTap={{ scale: 0.9 }} 
            className="relative p-2.5 text-muted-foreground hover:text-foreground rounded-full bg-muted/30 dark:bg-muted/10 border border-border/10"
          >
            <Bell className="w-[18px] h-[18px]" />
            <span className="absolute top-2.5 right-2.5 w-1.5 h-1.5 bg-brand-500 rounded-full border border-background animate-pulse" />
          </motion.button>
        </div>
      </header>

      {}
      <AnimatePresence>
        {showStatusPanel && (
          <>
            {}
            <div 
              className="fixed inset-0 z-40 bg-black/5 dark:bg-black/20 backdrop-blur-[2px]" 
              onClick={() => setShowStatusPanel(false)} 
            />
            
            <motion.div
              initial={{ opacity: 0, y: -20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.95 }}
              transition={{ type: "spring", damping: 25, stiffness: 350 }}
              className="fixed top-[80px] left-4 right-4 z-50 bg-card/95 backdrop-blur-xl border border-border/40 dark:border-white/5 rounded-3xl shadow-xl overflow-hidden max-w-sm mx-auto"
            >
              {}
              <div className="h-1.5 w-full bg-gradient-to-r from-brand-500 via-violet-500 to-amber-500" />
              
              {}
              <div className={cn(
                'p-4 border-b border-border/30 flex items-center gap-3',
                isOnline ? 'bg-emerald-50/50 dark:bg-emerald-950/10' : 'bg-rose-50/50 dark:bg-rose-950/10'
              )}>
                <div className={cn(
                  'w-9 h-9 rounded-2xl flex items-center justify-center flex-shrink-0',
                  isOnline ? 'bg-emerald-100 dark:bg-emerald-900/30' : 'bg-rose-100 dark:bg-rose-900/30'
                )}>
                  {isOnline ? (
                    <Cloud className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                  ) : (
                    <CloudOff className="w-5 h-5 text-rose-500" />
                  )}
                </div>
                <div>
                  <h4 className={cn('text-xs font-bold tracking-tight', isOnline ? 'text-emerald-700 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400')}>
                    {isSyncing ? '🔴 Syncing updates...' : isOnline ? '🟢 Connected & Synced' : '⚠️ Offline Mode'}
                  </h4>
                  <p className="text-[10px] text-muted-foreground mt-0.5 leading-normal">
                    {isOnline
                      ? 'Local changes sync automatically with cloud Database'
                      : 'Changes saved locally. Will sync when network is restored.'}
                  </p>
                </div>
              </div>

              {}
              <div className="p-4 space-y-3.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground flex items-center gap-2">
                    <Database className="w-3.5 h-3.5 text-muted-foreground/70" />
                    <span>Pending Items</span>
                  </span>
                  <span className={cn(
                    'font-bold px-2.5 py-0.5 rounded-full text-[10px]',
                    pendingSyncCount > 0
                      ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400'
                      : 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400'
                  )}>
                    {pendingSyncCount === 0 ? '✓ All Sync Complete' : `${pendingSyncCount} to sync`}
                  </span>
                </div>

                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground flex items-center gap-2">
                    <RefreshCw className="w-3.5 h-3.5 text-muted-foreground/70" />
                    <span>Last Synced</span>
                  </span>
                  <span className="font-semibold text-foreground">
                    {lastSyncTime
                      ? formatDistanceToNow(lastSyncTime, { addSuffix: true })
                      : 'Not synced yet'}
                  </span>
                </div>

                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground flex items-center gap-2">
                    {isOnline ? (
                      <Wifi className="w-3.5 h-3.5 text-emerald-500" />
                    ) : (
                      <WifiOff className="w-3.5 h-3.5 text-rose-500" />
                    )}
                    <span>Network status</span>
                  </span>
                  <span className={cn("font-bold text-[11px]", isOnline ? "text-emerald-600 dark:text-emerald-400" : "text-rose-500")}>
                    {isOnline ? "Connected" : "Disconnected"}
                  </span>
                </div>
              </div>

              {}
              <div className="px-4 pb-4">
                <button
                  onClick={handleManualSync}
                  disabled={!isOnline || syncLock || pendingSyncCount === 0}
                  className={cn(
                    'w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold transition-all duration-200 border shadow-sm',
                    isOnline && pendingSyncCount > 0
                      ? 'bg-brand-600 hover:bg-brand-700 text-white border-brand-500'
                      : 'bg-muted/50 text-muted-foreground border-border/10 cursor-not-allowed'
                  )}
                >
                  {isSyncing ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Syncing in background...</span>
                    </>
                  ) : pendingSyncCount === 0 ? (
                    <>
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                      <span>Local db is fully synced</span>
                    </>
                  ) : (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-pulse" />
                      <span>Force Sync {pendingSyncCount} Item{pendingSyncCount > 1 ? 's' : ''}</span>
                    </>
                  )}
                </button>
              </div>

              {/* Bottom tag */}
              <div className="bg-muted/30 px-4 py-2 border-t border-border/20 text-center text-[9px] font-bold text-muted-foreground tracking-wide uppercase">
                {isOnline ? '⚡ Real-time Online Dexie Sync Active' : '📦 Offline-first Mode (Dexie IndexedDB)'}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}

