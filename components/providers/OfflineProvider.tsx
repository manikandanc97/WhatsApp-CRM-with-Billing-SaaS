'use client'

import { useEffect, useCallback, useRef } from 'react'
import { useOfflineStore } from '@/store/offline'
import { processSyncQueue, getPendingSyncCount } from '@/services/sync/engine'
import toast from 'react-hot-toast'

export function OfflineProvider({ children }: { children: React.ReactNode }) {
  const { setOnline, setSyncing, setPendingCount, setLastSyncTime, isOnline } = useOfflineStore()
  const syncLockRef = useRef(false)

  const syncNow = useCallback(async () => {
    if (syncLockRef.current) return
    syncLockRef.current = true
    setSyncing(true)

    try {
      const { synced, failed } = await processSyncQueue()
      const remaining = await getPendingSyncCount()
      setPendingCount(remaining)
      setLastSyncTime(new Date())

      if (synced > 0) {
        toast.success(`✅ ${synced} item${synced > 1 ? 's' : ''} synced to cloud!`, { duration: 3000 })
      }
      if (failed > 0) {
        toast.error(`⚠️ ${failed} item${failed > 1 ? 's' : ''} failed to sync. Will retry.`, { duration: 4000 })
      }
    } catch {
      // silent fail — will retry on next reconnect
    } finally {
      setSyncing(false)
      syncLockRef.current = false
    }
  }, [setSyncing, setPendingCount, setLastSyncTime])

  // Refresh pending count periodically
  const refreshPendingCount = useCallback(async () => {
    const count = await getPendingSyncCount()
    setPendingCount(count)
  }, [setPendingCount])

  useEffect(() => {
    // Initialize online state
    const initialOnline = navigator.onLine
    setOnline(initialOnline)
    refreshPendingCount()

    const handleOnline = () => {
      setOnline(true)
      toast('🟢 Back online! Syncing data...', {
        icon: '🌐',
        duration: 3000,
        style: { background: '#052e16', color: '#86efac', border: '1px solid #166534' },
      })
      // Trigger sync after a short delay to let the connection stabilize
      setTimeout(() => syncNow(), 1500)
    }

    const handleOffline = () => {
      setOnline(false)
      toast('🔴 You are offline. Changes saved locally.', {
        icon: '📴',
        duration: 4000,
        style: { background: '#1c0a00', color: '#fb923c', border: '1px solid #9a3412' },
      })
    }

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    // Poll pending count every 30s
    const pollInterval = setInterval(refreshPendingCount, 30000)

    // Auto-sync if online on mount and has pending items
    if (initialOnline) {
      getPendingSyncCount().then((count) => {
        if (count > 0) syncNow()
      })
    }

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
      clearInterval(pollInterval)
    }
  }, [setOnline, syncNow, refreshPendingCount])

  return <>{children}</>
}
