'use client'

import { Bell, Search, Wifi, WifiOff, RefreshCw, Cloud, CloudOff, CheckCircle2, ChevronDown, Database, Command, X, ShoppingBag, TrendingUp, AlertCircle, MessageSquare, Info, User, Settings, Plus, Circle, ChevronRight } from 'lucide-react'
import { useAppStore } from '@/store/useAppStore'
import { useOfflineStore } from '@/store/offline'
import { processSyncQueue, getPendingSyncCount } from '@/services/sync/engine'
import { motion, AnimatePresence } from 'framer-motion'
import { useState, useCallback, useRef, useEffect } from 'react'
import { formatDistanceToNow } from 'date-fns'
import toast from 'react-hot-toast'
import { cn } from '@/lib/utils'
import Link from 'next/link'

const fakeNotifications = [
  { id: 1, type: 'order',   title: 'New order received',       body: 'Priya Sharma placed order #SF-2024-089', time: new Date(Date.now() - 120000), read: false },
  { id: 2, type: 'payment', title: 'Payment confirmed',         body: '₹7,245 received from Meera Iyer',        time: new Date(Date.now() - 900000), read: false },
  { id: 3, type: 'alert',   title: 'Low inventory alert',       body: 'Dark Chocolate stock below 2kg',         time: new Date(Date.now() - 3600000), read: false },
  { id: 4, type: 'message', title: 'WhatsApp enquiry',          body: 'Rahul Verma: "Do you do eggless?"',      time: new Date(Date.now() - 7200000), read: true },
  { id: 5, type: 'success', title: 'Delivery completed',        body: 'Order SF-2024-087 delivered successfully', time: new Date(Date.now() - 86400000), read: true },
]

const cmdItems = [
  { label: 'Go to Dashboard',    href: '/dashboard',  icon: Circle,        group: 'Navigate' },
  { label: 'Go to Orders',       href: '/orders',     icon: ShoppingBag,   group: 'Navigate' },
  { label: 'Go to Customers',    href: '/customers',  icon: User,          group: 'Navigate' },
  { label: 'Go to Analytics',    href: '/analytics',  icon: TrendingUp,    group: 'Navigate' },
  { label: 'Go to WhatsApp CRM', href: '/whatsapp',   icon: MessageSquare, group: 'Navigate' },
  { label: 'Go to Billing',      href: '/billing',    icon: ShoppingBag,   group: 'Navigate' },
  { label: 'Go to Settings',     href: '/settings',   icon: Settings,      group: 'Navigate' },
  { label: 'New Order',          href: '/orders',     icon: Plus,          group: 'Create' },
  { label: 'New Customer',       href: '/customers',  icon: Plus,          group: 'Create' },
  { label: 'New Invoice',        href: '/billing',    icon: Plus,          group: 'Create' },
]

function NotifIcon({ type }: { type: string }) {
  const map: Record<string, { icon: any; cls: string }> = {
    order:   { icon: ShoppingBag,   cls: 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400' },
    payment: { icon: TrendingUp,    cls: 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400' },
    alert:   { icon: AlertCircle,   cls: 'bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400' },
    message: { icon: MessageSquare, cls: 'bg-violet-100 text-violet-600 dark:bg-violet-900/30 dark:text-violet-400' },
    success: { icon: CheckCircle2,  cls: 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400' },
  }
  const { icon: Icon, cls } = map[type] || { icon: Info, cls: 'bg-muted text-muted-foreground' }
  return (
    <div className={cn('w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0', cls)}>
      <Icon className="w-4 h-4" />
    </div>
  )
}

export function MobileHeader() {
  const { user } = useAppStore()
  const { isOnline, isSyncing, pendingSyncCount, lastSyncTime, setSyncing, setPendingCount, setLastSyncTime } = useOfflineStore()
  const [showStatusPanel, setShowStatusPanel] = useState(false)
  const [syncLock, setSyncLock] = useState(false)
  
  const [notifOpen, setNotifOpen] = useState(false)
  const [cmdOpen, setCmdOpen] = useState(false)
  const [cmdQuery, setCmdQuery] = useState('')
  const [notifications, setNotifications] = useState(fakeNotifications)
  const cmdRef = useRef<HTMLInputElement>(null)
  const notifRef = useRef<HTMLDivElement>(null)
  const unreadCount = notifications.filter(n => !n.read).length

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (notifOpen && notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setNotifOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [notifOpen])

  function markAllRead() {
    setNotifications(n => n.map(x => ({ ...x, read: true })))
  }

  const filteredCmds = cmdQuery
    ? cmdItems.filter(i => i.label.toLowerCase().includes(cmdQuery.toLowerCase()))
    : cmdItems

  const cmdGroups = filteredCmds.reduce((acc, item) => {
    if (!acc[item.group]) acc[item.group] = []
    acc[item.group].push(item)
    return acc
  }, {} as Record<string, typeof cmdItems>)

  useEffect(() => {
    if (cmdOpen) setTimeout(() => cmdRef.current?.focus(), 50)
  }, [cmdOpen])

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
    } catch {
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
            onClick={() => { setCmdOpen(true); setShowStatusPanel(false); setNotifOpen(false); }}
            className="p-2.5 text-muted-foreground hover:text-foreground rounded-full bg-muted/30 dark:bg-muted/10 border border-border/10"
          >
            <Search className="w-[18px] h-[18px]" />
          </motion.button>
          
          <div className="relative" ref={notifRef}>
            <motion.button 
              whileTap={{ scale: 0.9 }} 
              onClick={() => { setNotifOpen(!notifOpen); setShowStatusPanel(false); setCmdOpen(false); }}
              className="relative p-2.5 text-muted-foreground hover:text-foreground rounded-full bg-muted/30 dark:bg-muted/10 border border-border/10"
            >
              <Bell className="w-[18px] h-[18px]" />
              {unreadCount > 0 && (
                <span className="absolute top-2.5 right-2.5 w-1.5 h-1.5 bg-brand-500 rounded-full border border-background animate-pulse" />
              )}
            </motion.button>
            <AnimatePresence>
              {notifOpen && (
                <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: -8 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: -8 }}
                    transition={{ duration: 0.18 }}
                    className="absolute right-0 top-[120%] mt-2 w-[calc(100vw-32px)] max-w-sm bg-card border border-border rounded-2xl shadow-elevated z-40 overflow-hidden"
                  >
                    <div className="flex items-center justify-between px-4 py-3 border-b border-border">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-sm text-foreground">Notifications</h3>
                        {unreadCount > 0 && (
                          <span className="text-[10px] font-bold bg-brand-100 dark:bg-brand-900/30 text-brand-600 dark:text-brand-400 px-1.5 py-0.5 rounded-full">
                            {unreadCount} new
                          </span>
                        )}
                      </div>
                      <button
                        onClick={markAllRead}
                        className="text-[11px] font-medium text-brand-600 dark:text-brand-400 hover:underline"
                      >
                        Mark all read
                      </button>
                    </div>
                    <div className="max-h-[60vh] overflow-y-auto scrollbar-thin divide-y divide-border/50">
                      {notifications.map((n) => (
                        <motion.div
                          key={n.id}
                          className={cn('flex items-start gap-3 px-4 py-3 cursor-pointer transition-colors hover:bg-muted/50', !n.read && 'bg-brand-50/50 dark:bg-brand-950/20')}
                          onClick={() => setNotifications(prev => prev.map(x => x.id === n.id ? { ...x, read: true } : x))}
                        >
                          <NotifIcon type={n.type} />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-2">
                              <p className={cn('text-xs font-semibold text-foreground', !n.read && 'text-brand-700 dark:text-brand-300')}>{n.title}</p>
                              {!n.read && <span className="w-1.5 h-1.5 rounded-full bg-brand-500 flex-shrink-0" />}
                            </div>
                            <p className="text-[11px] text-muted-foreground mt-0.5 truncate">{n.body}</p>
                            <p className="text-[10px] text-muted-foreground/60 mt-1">{formatDistanceToNow(n.time, { addSuffix: true })}</p>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                    <div className="px-4 py-2.5 border-t border-border">
                      <button className="text-xs font-medium text-brand-600 dark:text-brand-400 hover:underline w-full text-center">
                        View all notifications
                      </button>
                    </div>
                  </motion.div>
              )}
            </AnimatePresence>
          </div>
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

      <AnimatePresence>
        {cmdOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-start justify-center pt-16 px-4"
            onClick={() => setCmdOpen(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: -12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: -12 }}
              transition={{ duration: 0.18 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-lg bg-card border border-border rounded-2xl shadow-[0_24px_80px_rgba(0,0,0,0.25)] overflow-hidden"
            >
              <div className="flex items-center gap-3 px-4 py-3.5 border-b border-border">
                <Search className="w-4.5 h-4.5 text-muted-foreground flex-shrink-0" />
                <input
                  ref={cmdRef}
                  value={cmdQuery}
                  onChange={(e) => setCmdQuery(e.target.value)}
                  placeholder="Search pages, actions..."
                  className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none"
                />
                <button onClick={() => setCmdOpen(false)} className="p-1 rounded-lg hover:bg-muted transition-colors">
                  <X className="w-3.5 h-3.5 text-muted-foreground" />
                </button>
              </div>

              <div className="max-h-[60vh] overflow-y-auto scrollbar-thin p-2">
                {Object.entries(cmdGroups).map(([group, items]) => (
                  <div key={group} className="mb-2">
                    <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/60 px-3 py-1.5">{group}</p>
                    {items.map((item) => {
                      const Icon = item.icon
                      return (
                        <Link
                          key={item.label}
                          href={item.href}
                          onClick={() => setCmdOpen(false)}
                          className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-muted transition-colors group"
                        >
                          <div className="w-7 h-7 rounded-lg bg-muted flex items-center justify-center flex-shrink-0 group-hover:bg-background transition-colors">
                            <Icon className="w-3.5 h-3.5 text-muted-foreground" />
                          </div>
                          <span className="text-sm font-medium text-foreground">{item.label}</span>
                          <ChevronRight className="w-3.5 h-3.5 text-muted-foreground/50 ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
                        </Link>
                      )
                    })}
                  </div>
                ))}
                {filteredCmds.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground text-sm">
                    No results for &quot;{cmdQuery}&quot;
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}

