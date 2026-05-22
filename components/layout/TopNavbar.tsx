'use client'

import { Bell, Search, Sun, Moon, Menu, Plus, Command, ChevronRight, X,
  CheckCircle2, AlertCircle, Info, ShoppingBag, MessageSquare, TrendingUp,
  Settings, User, LogOut, HelpCircle, Keyboard, Zap, Circle } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAppStore } from '@/store/useAppStore'
import { useEffect, useState, useRef } from 'react'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import Link from 'next/link'
import { formatDistanceToNow } from 'date-fns'
import { SyncStatus } from './SyncStatus'
import { OfflineBanner } from '@/components/ui/OfflineBanner'


const breadcrumbMap: Record<string, string> = {
  dashboard: 'Dashboard', orders: 'Orders', billing: 'Billing',
  customers: 'Customers', whatsapp: 'WhatsApp CRM', analytics: 'Analytics',
  inventory: 'Inventory', reports: 'Reports', staff: 'Staff', settings: 'Settings',
}


const fakeNotifications = [
  { id: 1, type: 'order',   title: 'New order received',       body: 'Priya Sharma placed order #SF-2024-089', time: new Date(Date.now() - 120000), read: false },
  { id: 2, type: 'payment', title: 'Payment confirmed',         body: '₹7,245 received from Meera Iyer',        time: new Date(Date.now() - 900000), read: false },
  { id: 3, type: 'alert',   title: 'Low inventory alert',       body: 'Dark Chocolate stock below 2kg',         time: new Date(Date.now() - 3600000), read: false },
  { id: 4, type: 'message', title: 'WhatsApp enquiry',          body: 'Rahul Verma: "Do you do eggless?"',      time: new Date(Date.now() - 7200000), read: true },
  { id: 5, type: 'success', title: 'Delivery completed',        body: 'Order SF-2024-087 delivered successfully', time: new Date(Date.now() - 86400000), read: true },
]


const quickCreateItems = [
  { label: 'New Order',    href: '/orders',    icon: ShoppingBag,   color: 'text-blue-500' },
  { label: 'New Customer', href: '/customers', icon: User,          color: 'text-violet-500' },
  { label: 'New Invoice',  href: '/billing',   icon: TrendingUp,    color: 'text-emerald-500' },
  { label: 'Send Message', href: '/whatsapp',  icon: MessageSquare, color: 'text-amber-500' },
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

export function TopNavbar() {
  const { toggleSidebar, theme, setTheme, chats } = useAppStore()
  const pathname = usePathname()
  const [mounted, setMounted] = useState(false)
  const [notifOpen, setNotifOpen] = useState(false)
  const [userOpen, setUserOpen] = useState(false)
  const [createOpen, setCreateOpen] = useState(false)
  const [cmdOpen, setCmdOpen] = useState(false)
  const [cmdQuery, setCmdQuery] = useState('')
  const [notifications, setNotifications] = useState(fakeNotifications)
  const cmdRef = useRef<HTMLInputElement>(null)
  const unreadCount = notifications.filter(n => !n.read).length
  const totalUnread = chats.reduce((acc, c) => acc + c.unreadCount, 0)

  // Breadcrumbs
  const segments = pathname.split('/').filter(Boolean)
  const breadcrumbs = segments.map((seg, i) => ({
    label: breadcrumbMap[seg] || seg,
    href: '/' + segments.slice(0, i + 1).join('/'),
    isLast: i === segments.length - 1,
  }))

  useEffect(() => { setMounted(true) }, [])

  // ⌘K handler
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        setCmdOpen(v => !v)
      }
      if (e.key === 'Escape') {
        setCmdOpen(false)
        setNotifOpen(false)
        setUserOpen(false)
        setCreateOpen(false)
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [])

  useEffect(() => {
    if (cmdOpen) setTimeout(() => cmdRef.current?.focus(), 50)
  }, [cmdOpen])

  function toggleTheme() {
    const next = theme === 'dark' ? 'light' : 'dark'
    setTheme(next)
    document.documentElement.classList.toggle('dark', next === 'dark')
  }

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

  return (
    <>
      <header className="h-16 topbar-glass sticky top-0 z-20 flex items-center justify-between px-4 md:px-6">
        {}
        <div className="flex items-center gap-3">
          <button
            onClick={toggleSidebar}
            className="md:hidden w-9 h-9 flex items-center justify-center rounded-xl text-muted-foreground hover:bg-muted transition-colors"
          >
            <Menu className="w-5 h-5" />
          </button>

          {}
          <div className="hidden md:flex items-center gap-1.5">
            <Link href="/dashboard" className="text-muted-foreground hover:text-foreground transition-colors text-sm">
              Home
            </Link>
            {breadcrumbs.map((crumb) => (
              <div key={crumb.href} className="flex items-center gap-1.5">
                <ChevronRight className="w-3.5 h-3.5 text-muted-foreground/50" />
                {crumb.isLast ? (
                  <span className="text-sm font-semibold text-foreground">{crumb.label}</span>
                ) : (
                  <Link href={crumb.href} className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                    {crumb.label}
                  </Link>
                )}
              </div>
            ))}
          </div>

          {}
          <div className="md:hidden flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg gradient-brand flex items-center justify-center">
              <Zap className="w-3.5 h-3.5 text-white" />
            </div>
            <span className="font-bold text-sm text-foreground">SweetFlow</span>
          </div>
        </div>

        {}
        <div className="flex items-center gap-1.5">
          {}
          <SyncStatus />
          {}
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => setCmdOpen(true)}
            className="hidden md:flex items-center gap-2.5 px-3 py-2 rounded-xl border border-border/80 bg-muted/40 hover:bg-muted text-muted-foreground hover:text-foreground transition-all duration-150 text-sm"
          >
            <Search className="w-3.5 h-3.5" />
            <span className="text-xs">Search...</span>
            <kbd className="hidden lg:flex items-center gap-0.5 ml-4 text-[10px] font-medium bg-background border border-border rounded-md px-1.5 py-0.5">
              <Command className="w-2.5 h-2.5" />K
            </kbd>
          </motion.button>

          {}
          <button
            onClick={() => setCmdOpen(true)}
            className="md:hidden w-9 h-9 flex items-center justify-center rounded-xl text-muted-foreground hover:bg-muted transition-colors"
          >
            <Search className="w-4.5 h-4.5" />
          </button>

          {}
          <div className="relative">
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => { setCreateOpen(!createOpen); setNotifOpen(false); setUserOpen(false) }}
              className={cn(
                'flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-semibold transition-all duration-150 btn-ripple',
                'bg-brand-600 hover:bg-brand-700 text-white shadow-sm hover:shadow-md',
              )}
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">Create</span>
            </motion.button>
            <AnimatePresence>
              {createOpen && (
                <>
                  <div className="fixed inset-0 z-30" onClick={() => setCreateOpen(false)} />
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: -8 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: -8 }}
                    transition={{ duration: 0.15 }}
                    className="absolute right-0 top-full mt-2 w-52 bg-card border border-border rounded-2xl shadow-elevated z-40 overflow-hidden p-1.5"
                  >
                    {quickCreateItems.map((item) => {
                      const Icon = item.icon
                      return (
                        <Link
                          key={item.label}
                          href={item.href}
                          onClick={() => setCreateOpen(false)}
                          className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl hover:bg-muted transition-colors group"
                        >
                          <Icon className={cn('w-4 h-4', item.color)} />
                          <span className="text-sm font-medium text-foreground">{item.label}</span>
                        </Link>
                      )
                    })}
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>

          {}
          {mounted && (
            <motion.button
              whileTap={{ scale: 0.92 }}
              onClick={toggleTheme}
              className="w-9 h-9 flex items-center justify-center rounded-xl text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
            >
              <AnimatePresence mode="wait">
                <motion.div
                  key={theme}
                  initial={{ opacity: 0, rotate: -90, scale: 0.7 }}
                  animate={{ opacity: 1, rotate: 0, scale: 1 }}
                  exit={{ opacity: 0, rotate: 90, scale: 0.7 }}
                  transition={{ duration: 0.2 }}
                >
                  {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                </motion.div>
              </AnimatePresence>
            </motion.button>
          )}

          {}
          <div className="relative">
            <motion.button
              whileTap={{ scale: 0.92 }}
              onClick={() => { setNotifOpen(!notifOpen); setUserOpen(false); setCreateOpen(false) }}
              className="relative w-9 h-9 flex items-center justify-center rounded-xl text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
            >
              <Bell className="w-4 h-4" />
              <AnimatePresence>
                {unreadCount > 0 && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    exit={{ scale: 0 }}
                    className="absolute top-1.5 right-1.5 min-w-[14px] h-3.5 flex items-center justify-center rounded-full bg-red-500 text-white text-[8px] font-bold px-0.5 ring-2 ring-background"
                  >
                    {unreadCount}
                  </motion.span>
                )}
              </AnimatePresence>
            </motion.button>

            <AnimatePresence>
              {notifOpen && (
                <>
                  <div className="fixed inset-0 z-30" onClick={() => setNotifOpen(false)} />
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: -8 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: -8 }}
                    transition={{ duration: 0.18 }}
                    className="absolute right-0 top-full mt-2 w-80 bg-card border border-border rounded-2xl shadow-elevated z-40 overflow-hidden"
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
                    <div className="max-h-80 overflow-y-auto scrollbar-thin divide-y divide-border/50">
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
                </>
              )}
            </AnimatePresence>
          </div>

          {}
          <div className="relative">
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => { setUserOpen(!userOpen); setNotifOpen(false); setCreateOpen(false) }}
              className="flex items-center gap-2 pl-1 pr-2 py-1 rounded-xl hover:bg-muted transition-colors"
            >
              <div className="relative">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-brand-400 to-violet-500 flex items-center justify-center text-white text-xs font-bold shadow-sm">
                  LA
                </div>
                <span className="absolute bottom-0 right-0 w-2 h-2 rounded-full bg-emerald-500 ring-1 ring-background" />
              </div>
              <div className="hidden md:block text-left">
                <p className="text-xs font-semibold text-foreground leading-tight">Lakshmi A.</p>
                <p className="text-[10px] text-muted-foreground">Admin</p>
              </div>
            </motion.button>

            <AnimatePresence>
              {userOpen && (
                <>
                  <div className="fixed inset-0 z-30" onClick={() => setUserOpen(false)} />
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: -8 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: -8 }}
                    transition={{ duration: 0.15 }}
                    className="absolute right-0 top-full mt-2 w-56 bg-card border border-border rounded-2xl shadow-elevated z-40 overflow-hidden"
                  >
                    <div className="px-4 py-3 border-b border-border">
                      <p className="text-sm font-semibold text-foreground">Lakshmi Anand</p>
                      <p className="text-xs text-muted-foreground">lakshmi@sweetflow.in</p>
                    </div>
                    <div className="p-1.5 space-y-0.5">
                      {[
                        { label: 'Profile', icon: User, href: '/settings' },
                        { label: 'Settings', icon: Settings, href: '/settings' },
                        { label: 'Keyboard shortcuts', icon: Keyboard, href: '#' },
                        { label: 'Help & Support', icon: HelpCircle, href: '#' },
                      ].map((item) => {
                        const Icon = item.icon
                        return (
                          <Link
                            key={item.label}
                            href={item.href}
                            onClick={() => setUserOpen(false)}
                            className="flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-muted transition-colors"
                          >
                            <Icon className="w-4 h-4 text-muted-foreground" />
                            <span className="text-sm font-medium text-foreground">{item.label}</span>
                          </Link>
                        )
                      })}
                      <div className="h-px bg-border my-1" />
                      <button className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-red-50 dark:hover:bg-red-950/20 hover:text-red-600 dark:hover:text-red-400 transition-colors text-left group">
                        <LogOut className="w-4 h-4 text-muted-foreground group-hover:text-red-500 transition-colors" />
                        <span className="text-sm font-medium">Sign out</span>
                      </button>
                    </div>
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>
        </div>
      </header>

      {}
      <OfflineBanner />

      {}
      <AnimatePresence>
        {cmdOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="fixed inset-0 cmd-backdrop z-50 flex items-start justify-center pt-[15vh] px-4"
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
              {}
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

              {}
              <div className="max-h-80 overflow-y-auto scrollbar-thin p-2">
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

              {}
              <div className="flex items-center gap-4 px-4 py-2.5 border-t border-border">
                <span className="text-[10px] text-muted-foreground flex items-center gap-1"><kbd className="bg-muted px-1.5 py-0.5 rounded text-[9px] font-medium">↵</kbd> Select</span>
                <span className="text-[10px] text-muted-foreground flex items-center gap-1"><kbd className="bg-muted px-1.5 py-0.5 rounded text-[9px] font-medium">↑↓</kbd> Navigate</span>
                <span className="text-[10px] text-muted-foreground flex items-center gap-1"><kbd className="bg-muted px-1.5 py-0.5 rounded text-[9px] font-medium">Esc</kbd> Close</span>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
