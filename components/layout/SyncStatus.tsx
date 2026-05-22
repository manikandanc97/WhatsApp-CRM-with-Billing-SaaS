'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { useOfflineStore } from '@/store/offline'
import { processSyncQueue, getPendingSyncCount } from '@/services/sync/engine'
import { RefreshCw, WifiOff, Wifi, Cloud, CloudOff, CheckCircle2 } from 'lucide-react'
import { useState, useCallback } from 'react'
import { cn } from '@/lib/utils'
import { formatDistanceToNow } from 'date-fns'
import toast from 'react-hot-toast'

export function SyncStatus() {
  const { isOnline, isSyncing, pendingSyncCount, lastSyncTime, setSyncing, setPendingCount, setLastSyncTime } = useOfflineStore()
  const [showPanel, setShowPanel] = useState(false)
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
      if (synced > 0) toast.success(`Synced ${synced} item${synced > 1 ? 's' : ''} successfully!`)
      if (failed > 0) toast.error(`${failed} item${failed > 1 ? 's' : ''} failed to sync`)
      if (synced === 0 && failed === 0) toast('Everything is already up to date!', { icon: '✅' })
    } finally {
      setSyncing(false)
      setSyncLock(false)
    }
  }, [isOnline, syncLock, setSyncing, setPendingCount, setLastSyncTime])

  
  const status = isSyncing
    ? { label: 'Syncing', color: 'text-amber-500', dot: 'bg-amber-400', ring: 'ring-amber-400/30' }
    : isOnline
    ? { label: 'Online', color: 'text-emerald-500', dot: 'bg-emerald-400', ring: 'ring-emerald-400/30' }
    : { label: 'Offline', color: 'text-rose-500', dot: 'bg-rose-400', ring: 'ring-rose-400/30' }

  return (
    <div className="relative">
      {}
      <motion.button
        whileTap={{ scale: 0.95 }}
        onClick={() => setShowPanel((v) => !v)}
        className={cn(
          'flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border transition-all duration-200',
          'bg-card/80 backdrop-blur-sm hover:bg-muted',
          isOnline ? 'border-emerald-500/20' : 'border-rose-500/20'
        )}
      >
        {}
        <span className="relative flex h-2 w-2">
          <span className={cn(
            'animate-ping absolute inline-flex h-full w-full rounded-full opacity-60',
            status.dot
          )} />
          <span className={cn('relative inline-flex rounded-full h-2 w-2', status.dot)} />
        </span>

        <span className={cn('text-xs font-semibold hidden sm:inline', status.color)}>
          {isSyncing ? 'Syncing...' : isOnline ? 'Online' : 'Offline'}
        </span>

        {pendingSyncCount > 0 && !isSyncing && (
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="flex items-center justify-center min-w-[18px] h-[18px] px-1 rounded-full bg-amber-500 text-white text-[9px] font-bold"
          >
            {pendingSyncCount}
          </motion.span>
        )}

        {isSyncing && (
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          >
            <RefreshCw className="w-3 h-3 text-amber-500" />
          </motion.div>
        )}
      </motion.button>

      {}
      <AnimatePresence>
        {showPanel && (
          <>
            <div className="fixed inset-0 z-30" onClick={() => setShowPanel(false)} />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: -8 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -8 }}
              transition={{ duration: 0.15 }}
              className="absolute right-0 top-full mt-2 w-72 bg-card border border-border rounded-2xl shadow-elevated z-40 overflow-hidden"
            >
              {}
              <div className={cn(
                'px-4 py-3 border-b border-border flex items-center gap-3',
                isOnline ? 'bg-emerald-50/50 dark:bg-emerald-950/20' : 'bg-rose-50/50 dark:bg-rose-950/20'
              )}>
                <div className={cn(
                  'w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0',
                  isOnline ? 'bg-emerald-100 dark:bg-emerald-900/30' : 'bg-rose-100 dark:bg-rose-900/30'
                )}>
                  {isOnline
                    ? <Cloud className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                    : <CloudOff className="w-4 h-4 text-rose-500" />
                  }
                </div>
                <div>
                  <p className={cn('text-xs font-bold', isOnline ? 'text-emerald-700 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400')}>
                    {isSyncing ? '🟡 Syncing to cloud…' : isOnline ? '🟢 Connected & Synced' : '🔴 Working Offline'}
                  </p>
                  <p className="text-[10px] text-muted-foreground mt-0.5">
                    {isOnline
                      ? 'All changes sync automatically'
                      : 'Changes saved locally — will sync when back online'}
                  </p>
                </div>
              </div>

              {}
              <div className="px-4 py-3 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">Pending sync items</span>
                  <span className={cn(
                    'text-xs font-bold px-2 py-0.5 rounded-full',
                    pendingSyncCount > 0
                      ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400'
                      : 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400'
                  )}>
                    {pendingSyncCount === 0 ? '✓ All synced' : `${pendingSyncCount} pending`}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">Last synced</span>
                  <span className="text-xs font-medium text-foreground">
                    {lastSyncTime
                      ? formatDistanceToNow(lastSyncTime, { addSuffix: true })
                      : 'Not synced yet'}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">Network</span>
                  <span className="flex items-center gap-1 text-xs font-medium">
                    {isOnline
                      ? <><Wifi className="w-3 h-3 text-emerald-500" /><span className="text-emerald-600 dark:text-emerald-400">Connected</span></>
                      : <><WifiOff className="w-3 h-3 text-rose-500" /><span className="text-rose-500">No connection</span></>
                    }
                  </span>
                </div>
              </div>

              {}
              <div className="px-4 pb-3">
                <button
                  onClick={handleManualSync}
                  disabled={!isOnline || syncLock || pendingSyncCount === 0}
                  className={cn(
                    'w-full flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all duration-200',
                    isOnline && pendingSyncCount > 0
                      ? 'bg-brand-600 hover:bg-brand-700 text-white shadow-sm'
                      : 'bg-muted text-muted-foreground cursor-not-allowed'
                  )}
                >
                  {isSyncing ? (
                    <>
                      <motion.div animate={{ rotate: 360 }} transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }}>
                        <RefreshCw className="w-3.5 h-3.5" />
                      </motion.div>
                      Syncing…
                    </>
                  ) : pendingSyncCount === 0 ? (
                    <><CheckCircle2 className="w-3.5 h-3.5" /> Everything is up to date</>
                  ) : (
                    <><RefreshCw className="w-3.5 h-3.5" /> Sync {pendingSyncCount} pending item{pendingSyncCount > 1 ? 's' : ''}</>
                  )}
                </button>
              </div>

              {/* Mode badge */}
              <div className={cn(
                'px-4 py-2 border-t border-border text-center text-[10px] font-medium',
                isOnline ? 'text-emerald-600/70 dark:text-emerald-500/60' : 'text-rose-500/70'
              )}>
                {isOnline ? '⚡ Online-first mode — Dexie + Cloud sync active' : '📱 Offline POS mode — Dexie IndexedDB active'}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}
