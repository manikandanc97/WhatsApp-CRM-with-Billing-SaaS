'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import {
  LayoutDashboard, ShoppingBag, MessageSquare, FileText, Users,
  BarChart3, Settings, ChevronLeft, Zap, Package, ClipboardList,
  UserCheck, Bell, ChevronDown, Store, Building2, LogOut,
  HelpCircle, Sparkles, Wifi, Circle
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useAppStore } from '@/store/useAppStore'
import { useState } from 'react'

// ─── Nav structure ────────────────────────────────────────
const navSections = [
  {
    label: 'Main',
    items: [
      { href: '/dashboard',  label: 'Dashboard',    icon: LayoutDashboard, badge: null,        live: true },
      { href: '/orders',     label: 'Orders',       icon: ShoppingBag,     badge: '12',        live: false },
      { href: '/whatsapp',   label: 'WhatsApp CRM', icon: MessageSquare,   badge: '5',         live: true },
      { href: '/billing',    label: 'Billing',      icon: FileText,        badge: null,        live: false },
    ],
  },
  {
    label: 'Business',
    items: [
      { href: '/customers',  label: 'Customers',    icon: Users,           badge: null,        live: false },
      { href: '/analytics',  label: 'Analytics',    icon: BarChart3,       badge: null,        live: false },
      { href: '/inventory',  label: 'Inventory',    icon: Package,         badge: '3',         live: false },
    ],
  },
  {
    label: 'Management',
    items: [
      { href: '/reports',    label: 'Reports',      icon: ClipboardList,   badge: null,        live: false },
      { href: '/staff',      label: 'Staff',        icon: UserCheck,       badge: null,        live: false },
      { href: '/settings',   label: 'Settings',     icon: Settings,        badge: null,        live: false },
    ],
  },
]

const workspaces = [
  { id: 'sweetflow', name: 'SweetFlow Bakery', plan: 'Pro', color: 'bg-brand-600' },
  { id: 'cakehouse', name: 'CakeHouse Delhi',  plan: 'Starter', color: 'bg-violet-600' },
]

// ─── Tooltip for collapsed state ──────────────────────────
function NavTooltip({ label, children }: { label: string; children: React.ReactNode }) {
  const [show, setShow] = useState(false)
  return (
    <div
      className="relative"
      onMouseEnter={() => setShow(true)}
      onMouseLeave={() => setShow(false)}
    >
      {children}
      <AnimatePresence>
        {show && (
          <motion.div
            initial={{ opacity: 0, x: -6 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -6 }}
            transition={{ duration: 0.15 }}
            className="absolute left-full top-1/2 -translate-y-1/2 ml-3 z-50 pointer-events-none"
          >
            <div className="bg-foreground text-background text-xs font-medium px-2.5 py-1.5 rounded-lg whitespace-nowrap shadow-elevated">
              {label}
              <div className="absolute top-1/2 -translate-y-1/2 right-full w-0 h-0 border-t-[5px] border-t-transparent border-b-[5px] border-b-transparent border-r-[5px] border-r-foreground" />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// ─── Main Sidebar ──────────────────────────────────────────
export function Sidebar() {
  const pathname = usePathname()
  const { sidebarOpen, toggleSidebar } = useAppStore()
  const [wsOpen, setWsOpen] = useState(false)
  const [activeWs, setActiveWs] = useState(workspaces[0])

  return (
    <motion.aside
      initial={false}
      animate={{ width: sidebarOpen ? 260 : 72 }}
      transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
      className="hidden lg:flex flex-col h-screen sidebar-glass fixed left-0 top-0 z-30 overflow-hidden select-none"
    >
      {/* ── Workspace Switcher ─────────────────────────────── */}
      <div className="px-3 pt-4 pb-3 border-b border-border/60">
        <motion.button
          onClick={() => sidebarOpen && setWsOpen(!wsOpen)}
          whileHover={{ backgroundColor: 'hsl(var(--muted))' }}
          className={cn(
            'w-full flex items-center gap-2.5 px-2.5 py-2 rounded-xl transition-colors duration-150 group',
            !sidebarOpen && 'justify-center'
          )}
        >
          <div className={cn('w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 shadow-sm', activeWs.color)}>
            <Store className="w-4 h-4 text-white" />
          </div>
          <AnimatePresence>
            {sidebarOpen && (
              <motion.div
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -8 }}
                transition={{ duration: 0.2 }}
                className="flex-1 min-w-0 text-left"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-semibold text-foreground truncate leading-tight">{activeWs.name}</p>
                    <div className="flex items-center gap-1 mt-0.5">
                      <span className="text-[10px] text-muted-foreground font-medium">{activeWs.plan} Plan</span>
                      <span className="w-1 h-1 rounded-full bg-emerald-500 inline-block" />
                      <span className="text-[10px] text-emerald-600 font-medium">Active</span>
                    </div>
                  </div>
                  <motion.div
                    animate={{ rotate: wsOpen ? 180 : 0 }}
                    transition={{ duration: 0.2 }}
                    className="text-muted-foreground"
                  >
                    <ChevronDown className="w-3.5 h-3.5" />
                  </motion.div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.button>

        {/* Workspace Dropdown */}
        <AnimatePresence>
          {wsOpen && sidebarOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <div className="mt-1.5 space-y-1 px-1">
                {workspaces.map((ws) => (
                  <button
                    key={ws.id}
                    onClick={() => { setActiveWs(ws); setWsOpen(false) }}
                    className={cn(
                      'w-full flex items-center gap-2.5 px-2.5 py-2 rounded-xl transition-colors text-left',
                      activeWs.id === ws.id
                        ? 'bg-brand-50 dark:bg-brand-950/30'
                        : 'hover:bg-muted'
                    )}
                  >
                    <div className={cn('w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0', ws.color)}>
                      <Building2 className="w-3.5 h-3.5 text-white" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-foreground truncate">{ws.name}</p>
                      <p className="text-[10px] text-muted-foreground">{ws.plan} Plan</p>
                    </div>
                    {activeWs.id === ws.id && (
                      <div className="ml-auto w-1.5 h-1.5 rounded-full bg-brand-500" />
                    )}
                  </button>
                ))}
                <div className="h-px bg-border my-1" />
                <button className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-xl hover:bg-muted transition-colors text-left">
                  <div className="w-7 h-7 rounded-lg border-2 border-dashed border-border flex items-center justify-center flex-shrink-0">
                    <span className="text-muted-foreground text-base leading-none">+</span>
                  </div>
                  <span className="text-xs font-medium text-muted-foreground">Add workspace</span>
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ── Navigation ────────────────────────────────────── */}
      <nav className="flex-1 py-3 px-3 overflow-y-auto scrollbar-thin space-y-0.5">
        {navSections.map((section, si) => (
          <div key={section.label} className={cn(si > 0 && 'mt-4')}>
            {/* Section Label */}
            <AnimatePresence>
              {sidebarOpen && (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.15 }}
                  className="text-[10px] font-semibold text-muted-foreground/60 uppercase tracking-widest px-3 mb-1.5"
                >
                  {section.label}
                </motion.p>
              )}
            </AnimatePresence>
            {!sidebarOpen && si > 0 && (
              <div className="h-px bg-border/60 my-2 mx-2" />
            )}

            {/* Nav Items */}
            <div className="space-y-0.5">
              {section.items.map((item) => {
                const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
                const Icon = item.icon
                const navItem = (
                  <Link key={item.href} href={item.href}>
                    <motion.div
                      whileHover={{ x: sidebarOpen ? 2 : 0 }}
                      whileTap={{ scale: 0.97 }}
                      className={cn(
                        'relative flex items-center rounded-xl cursor-pointer transition-all duration-150 group',
                        sidebarOpen ? 'gap-3 px-3 py-2.5' : 'justify-center px-0 py-2.5 mx-1',
                        isActive
                          ? 'nav-active-pill text-brand-700 dark:text-brand-300'
                          : 'text-muted-foreground hover:bg-muted/70 hover:text-foreground'
                      )}
                    >
                      {/* Active left bar */}
                      {isActive && (
                        <motion.div
                          layoutId="sidebarActive"
                          className="absolute left-0 top-2 bottom-2 w-[3px] bg-gradient-to-b from-brand-500 to-violet-500 rounded-r-full"
                          transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                        />
                      )}

                      {/* Icon wrapper */}
                      <div className="relative flex-shrink-0">
                        <Icon className={cn(
                          'w-[18px] h-[18px] transition-colors',
                          isActive
                            ? 'text-brand-600 dark:text-brand-400'
                            : 'text-muted-foreground group-hover:text-foreground'
                        )} />
                        {/* Live dot */}
                        {item.live && (
                          <span className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 rounded-full bg-emerald-500 ring-1 ring-background" />
                        )}
                      </div>

                      {/* Label + badge */}
                      <AnimatePresence>
                        {sidebarOpen && (
                          <motion.div
                            initial={{ opacity: 0, x: -8 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -8 }}
                            transition={{ duration: 0.18 }}
                            className="flex items-center justify-between flex-1 min-w-0"
                          >
                            <span className={cn(
                              'text-sm font-medium whitespace-nowrap',
                              isActive ? 'text-brand-700 dark:text-brand-300 font-semibold' : ''
                            )}>
                              {item.label}
                            </span>
                            {item.badge && (
                              <motion.span
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                className="animate-badge-pop ml-auto text-[10px] font-bold min-w-[18px] h-[18px] flex items-center justify-center rounded-full bg-brand-100 dark:bg-brand-900/40 text-brand-600 dark:text-brand-400 px-1"
                              >
                                {item.badge}
                              </motion.span>
                            )}
                          </motion.div>
                        )}
                      </AnimatePresence>

                      {/* Badge in collapsed mode */}
                      {!sidebarOpen && item.badge && (
                        <span className="absolute -top-0.5 -right-0.5 w-3.5 h-3.5 flex items-center justify-center rounded-full bg-brand-500 text-white text-[8px] font-bold">
                          {item.badge}
                        </span>
                      )}
                    </motion.div>
                  </Link>
                )

                return sidebarOpen ? navItem : (
                  <NavTooltip key={item.href} label={item.label}>
                    {navItem}
                  </NavTooltip>
                )
              })}
            </div>
          </div>
        ))}

        {/* AI Badge */}
        <AnimatePresence>
          {sidebarOpen && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 8 }}
              transition={{ duration: 0.25, delay: 0.05 }}
              className="mt-4 mx-1 p-3 rounded-xl bg-gradient-to-br from-brand-50 to-violet-50 dark:from-brand-950/30 dark:to-violet-950/20 border border-brand-100/60 dark:border-brand-900/30"
            >
              <div className="flex items-start gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-brand-500 to-violet-600 flex items-center justify-center flex-shrink-0 shadow-sm">
                  <Sparkles className="w-3.5 h-3.5 text-white" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-foreground">AI Insights</p>
                  <p className="text-[10px] text-muted-foreground mt-0.5 leading-relaxed">3 recommendations ready for you</p>
                  <button className="mt-2 text-[10px] font-semibold text-brand-600 dark:text-brand-400 hover:underline">
                    View insights →
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      {/* ── Bottom Profile Card ────────────────────────────── */}
      <div className="border-t border-border/60 p-3">
        {/* Help */}
        <AnimatePresence>
          {sidebarOpen && (
            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-muted transition-colors text-left mb-1"
            >
              <HelpCircle className="w-4 h-4 text-muted-foreground" />
              <span className="text-xs font-medium text-muted-foreground">Help & Support</span>
            </motion.button>
          )}
        </AnimatePresence>

        {/* Profile */}
        <div
          className={cn(
            'flex items-center rounded-xl p-2.5 hover:bg-muted transition-colors cursor-pointer group',
            sidebarOpen ? 'gap-2.5' : 'justify-center'
          )}
        >
          <div className="relative flex-shrink-0">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-brand-400 to-violet-500 flex items-center justify-center text-white text-xs font-bold shadow-sm">
              LA
            </div>
            <span className="absolute bottom-0 right-0 w-2 h-2 rounded-full bg-emerald-500 ring-1.5 ring-background" />
          </div>
          <AnimatePresence>
            {sidebarOpen && (
              <motion.div
                initial={{ opacity: 0, x: -6 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -6 }}
                transition={{ duration: 0.18 }}
                className="flex-1 min-w-0"
              >
                <p className="text-xs font-semibold text-foreground truncate">Lakshmi A.</p>
                <p className="text-[10px] text-muted-foreground truncate">Admin · SweetFlow</p>
              </motion.div>
            )}
          </AnimatePresence>
          <AnimatePresence>
            {sidebarOpen && (
              <motion.button
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="ml-auto p-1 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/80 transition-colors opacity-0 group-hover:opacity-100"
              >
                <LogOut className="w-3.5 h-3.5" />
              </motion.button>
            )}
          </AnimatePresence>
        </div>

        {/* Collapse toggle */}
        <button
          onClick={toggleSidebar}
          className={cn(
            'mt-1 w-full flex items-center justify-center gap-1.5 py-2 rounded-xl text-muted-foreground hover:bg-muted hover:text-foreground transition-colors text-xs font-medium',
          )}
        >
          <motion.div animate={{ rotate: sidebarOpen ? 0 : 180 }} transition={{ duration: 0.3 }}>
            <ChevronLeft className="w-4 h-4" />
          </motion.div>
          <AnimatePresence>
            {sidebarOpen && (
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="text-[11px]"
              >
                Collapse
              </motion.span>
            )}
          </AnimatePresence>
        </button>
      </div>
    </motion.aside>
  )
}
