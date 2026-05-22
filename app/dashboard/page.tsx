'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  DollarSign, ShoppingBag, MessageSquare, Clock, TrendingUp,
  Package, ArrowUpRight, Sparkles, Target,
  Users, AlertTriangle, Bell, Filter,
  Download, Search, RefreshCw, Circle,
  MessageCircle, Star
} from 'lucide-react'
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, BarChart, Bar, LineChart, Line
} from 'recharts'
import { PremiumStatsCard } from '@/components/ui/PremiumStatsCard'
import { Skeleton } from '@/components/ui/LoadingSkeleton'
import { useAppStore } from '@/store/useAppStore'
import { useMounted } from '@/hooks/useMounted'
import { formatCurrency, getInitials, cn } from '@/lib/utils'
import analyticsData from '@/data/analytics.json'
import ordersData from '@/data/orders.json'
import type { Order } from '@/types'
import Link from 'next/link'
import { format } from 'date-fns'
import toast from 'react-hot-toast'


const sparkRevenue = [
  { v: 14200 }, { v: 18900 }, { v: 12400 }, { v: 22100 },
  { v: 19800 }, { v: 25300 }, { v: 28750 },
]
const sparkOrders = [
  { v: 4 }, { v: 7 }, { v: 5 }, { v: 9 }, { v: 6 }, { v: 11 }, { v: 8 },
]
const sparkLeads = [
  { v: 12 }, { v: 18 }, { v: 14 }, { v: 22 }, { v: 19 }, { v: 28 }, { v: 31 },
]
const sparkPending = [
  { v: 8 }, { v: 5 }, { v: 9 }, { v: 4 }, { v: 7 }, { v: 6 }, { v: 5 },
]

const revenueData = [
  { month: 'Oct', revenue: 145000, orders: 38, target: 150000 },
  { month: 'Nov', revenue: 182000, orders: 47, target: 160000 },
  { month: 'Dec', revenue: 231000, orders: 68, target: 200000 },
  { month: 'Jan', revenue: 178000, orders: 45, target: 180000 },
  { month: 'Feb', revenue: 205000, orders: 52, target: 190000 },
  { month: 'Mar', revenue: 248000, orders: 64, target: 220000 },
  { month: 'Apr', revenue: 267000, orders: 71, target: 240000 },
  { month: 'May', revenue: 287500, orders: 76, target: 260000 },
]

const whatsappData = [
  { day: 'Mon', sent: 42, received: 38, converted: 12 },
  { day: 'Tue', sent: 55, received: 49, converted: 18 },
  { day: 'Wed', sent: 38, received: 31, converted: 9 },
  { day: 'Thu', sent: 61, received: 57, converted: 22 },
  { day: 'Fri', sent: 73, received: 68, converted: 31 },
  { day: 'Sat', sent: 89, received: 84, converted: 44 },
  { day: 'Sun', sent: 52, received: 48, converted: 19 },
]

const retentionData = [
  { month: 'Oct', new: 28, returning: 42 },
  { month: 'Nov', new: 35, returning: 48 },
  { month: 'Dec', new: 52, returning: 55 },
  { month: 'Jan', new: 31, returning: 62 },
  { month: 'Feb', new: 38, returning: 68 },
  { month: 'Mar', new: 44, returning: 75 },
  { month: 'Apr', new: 48, returning: 82 },
  { month: 'May', new: 41, returning: 91 },
]

const activityFeed = [
  { id: 1, type: 'order',   text: 'New order from Priya Sharma',    sub: 'Chocolate Truffle Cake · ₹2,153', time: '2m ago',  color: 'bg-blue-100 dark:bg-blue-900/30',    iconColor: 'text-blue-600 dark:text-blue-400',    icon: ShoppingBag, live: true },
  { id: 2, type: 'payment', text: 'Payment received',                sub: 'Meera Iyer · ₹7,245',            time: '18m ago', color: 'bg-emerald-100 dark:bg-emerald-900/30', iconColor: 'text-emerald-600 dark:text-emerald-400', icon: DollarSign, live: false },
  { id: 3, type: 'message', text: 'New WhatsApp enquiry',            sub: 'Rahul Verma — eggless cakes?',   time: '32m ago', color: 'bg-violet-100 dark:bg-violet-900/30', iconColor: 'text-violet-600 dark:text-violet-400', icon: MessageSquare, live: true },
  { id: 4, type: 'delivery','text': 'Order delivered',               sub: 'SF-2024-001 · Ananya Krishnan',  time: '1h ago',  color: 'bg-amber-100 dark:bg-amber-900/30',  iconColor: 'text-amber-600 dark:text-amber-400',  icon: Package, live: false },
  { id: 5, type: 'customer', text: 'New customer registered',         sub: 'Arjun Singh from Noida',         time: '2h ago',  color: 'bg-sky-100 dark:bg-sky-900/30',      iconColor: 'text-sky-600 dark:text-sky-400',      icon: Users, live: false },
  { id: 6, type: 'review',  text: '5★ review received',              sub: '"Best custom cake in Delhi!"',   time: '3h ago',  color: 'bg-rose-100 dark:bg-rose-900/30',    iconColor: 'text-rose-600 dark:text-rose-400',    icon: Star, live: false },
]

const inventoryAlerts = [
  { item: 'Dark Chocolate', stock: '1.2 kg', threshold: '2 kg', critical: true },
  { item: 'Cream Cheese',   stock: '0.8 kg', threshold: '1 kg', critical: true },
  { item: 'Strawberries',   stock: '1.5 kg', threshold: '2 kg', critical: false },
]

const aiInsights = [
  { id: 1, text: 'Chocolate Truffle orders are up 34% this week — consider a flash discount on similar items', icon: '📈', tag: 'Opportunity' },
  { id: 2, text: 'Priya Sharma hasn\'t ordered in 18 days — great time for a personalized WhatsApp nudge',   icon: '💬', tag: 'CRM Action' },
  { id: 3, text: 'Saturday afternoons drive 41% of weekly revenue — ensure inventory is stocked by Friday',   icon: '⚡', tag: 'Inventory' },
]

const smartReminders = [
  { id: 1, text: 'Follow up with 3 pending quotes',   due: 'Today 3 PM',  urgent: true },
  { id: 2, text: 'Restock Dark Chocolate supply',     due: 'Today 5 PM',  urgent: true },
  { id: 3, text: 'Send birthday promo to 8 customers', due: 'Tomorrow',   urgent: false },
  { id: 4, text: 'Review monthly analytics report',   due: 'Friday',      urgent: false },
]


function PremiumTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-card border border-border rounded-xl p-3 shadow-elevated text-sm min-w-[140px]">
      <p className="font-semibold text-foreground mb-2 text-xs">{label}</p>
      {payload.map((p: any, i: number) => (
        <div key={i} className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full" style={{ background: p.color }} />
            <span className="text-xs text-muted-foreground capitalize">{p.name}</span>
          </div>
          <span className="text-xs font-bold text-foreground">
            {p.name === 'revenue' || p.name === 'target'
              ? '₹' + (p.value / 1000).toFixed(0) + 'K'
              : p.value}
          </span>
        </div>
      ))}
    </div>
  )
}


function OrderStatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    paid:      'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
    pending:   'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
    cancelled: 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400',
    delivered: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
    baking:    'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
    confirmed: 'bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-400',
  }
  return (
    <span className={cn('text-[10px] font-semibold px-2 py-0.5 rounded-full capitalize', map[status] || 'bg-muted text-muted-foreground')}>
      {status}
    </span>
  )
}


function SectionCard({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={cn('bg-card border border-border rounded-2xl shadow-sm', className)}>
      {children}
    </div>
  )
}


export default function DashboardPage() {
  const mounted = useMounted()
  const loading = !mounted
  const [orderSearch, setOrderSearch] = useState('')
  const [orderFilter, setOrderFilter] = useState<string | null>(null)
  const { orders, chats } = useAppStore()
  
  const [isMobile, setIsMobile] = useState(false)
  const [activeBottomTab, setActiveBottomTab] = useState<'insights' | 'alerts' | 'reminders'>('insights')

  useEffect(() => {
    setIsMobile(window.innerWidth < 1024)
    const handleResize = () => setIsMobile(window.innerWidth < 1024)
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  const displayOrders = (orders.length ? orders : ordersData as any) as Order[]
  const todayRevenue  = displayOrders.filter(o => o.paymentStatus === 'paid').reduce((s, o) => s + o.total, 0) || 287500
  const totalOrders   = displayOrders.length || 76
  const pendingCount  = displayOrders.filter(o => ['pending','confirmed','baking'].includes(o.status)).length || 5
  const waMsgs        = chats.reduce((s, c) => s + c.unreadCount, 0) + 31
  const targetRevenue = 350000
  const targetPct     = Math.min(100, Math.round((todayRevenue / targetRevenue) * 100))

  const filteredOrders = displayOrders
    .filter(o => !orderSearch || o.customerName.toLowerCase().includes(orderSearch.toLowerCase()) || o.orderNumber.toLowerCase().includes(orderSearch.toLowerCase()))
    .filter(o => !orderFilter || o.status === orderFilter || o.paymentStatus === orderFilter)
    .slice(0, 8)

  return (
    <div className="space-y-6 page-wrapper">

      {}
      <div className="flex items-start justify-between">
        <div>
          <motion.h1
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35 }}
            className="text-2xl font-bold text-foreground tracking-tight"
          >
            Good morning, Lakshmi 👋
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: 0.05 }}
            className="text-sm text-muted-foreground mt-1"
          >
            Here's your SweetFlow summary for {format(new Date(), 'EEEE, MMMM do')}
          </motion.p>
        </div>
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3, delay: 0.1 }}
          className="hidden md:flex items-center gap-2"
        >
          <div className="flex items-center gap-1.5 text-xs font-medium text-emerald-700 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-900/30 px-3 py-1.5 rounded-full">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            Live · All systems operational
          </div>
          <button
            onClick={() => toast.success('Dashboard refreshed!')}
            className="p-2 rounded-xl border border-border text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        </motion.div>
      </div>

      {}
      {}
      <div className="lg:hidden flex overflow-x-auto snap-x snap-mandatory gap-4 pb-2 scrollbar-none -mx-4 px-4 scroll-pl-4">
        {loading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="snap-start min-w-[260px] bg-card border border-border rounded-2xl p-5 shrink-0">
              <Skeleton className="h-3.5 w-24 mb-4 rounded-md" />
              <div className="flex items-end justify-between">
                <div><Skeleton className="h-8 w-28 mb-2 rounded-md" /><Skeleton className="h-3 w-20 rounded-md" /></div>
                <Skeleton className="h-10 w-10 rounded-xl" />
              </div>
            </div>
          ))
        ) : (
          <>
            <PremiumStatsCard className="snap-start min-w-[260px] shrink-0" title="Total Revenue"    value={todayRevenue} isCurrency change={12.4} variant="blue"   sparkData={sparkRevenue} index={0} icon={DollarSign} />
            <PremiumStatsCard className="snap-start min-w-[260px] shrink-0" title="Total Orders"     value={totalOrders}  change={5.2}             variant="violet" sparkData={sparkOrders}  index={1} icon={ShoppingBag} />
            <PremiumStatsCard className="snap-start min-w-[260px] shrink-0" title="WhatsApp Leads"   value={waMsgs}       change={18.7}            variant="green"  sparkData={sparkLeads}   index={2} icon={MessageSquare} />
            <PremiumStatsCard className="snap-start min-w-[260px] shrink-0" title="Pending Orders"   value={pendingCount} change={-8.3}            variant="amber"  sparkData={sparkPending}  index={3} icon={Clock} />
          </>
        )}
      </div>

      {}
      <div className="hidden lg:grid grid-cols-2 xl:grid-cols-4 gap-4">
        {loading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="bg-card border border-border rounded-2xl p-5">
              <Skeleton className="h-3.5 w-24 mb-4 rounded-md" />
              <div className="flex items-end justify-between">
                <div><Skeleton className="h-8 w-28 mb-2 rounded-md" /><Skeleton className="h-3 w-20 rounded-md" /></div>
                <Skeleton className="h-10 w-10 rounded-xl" />
              </div>
            </div>
          ))
        ) : (
          <>
            <PremiumStatsCard title="Total Revenue"    value={todayRevenue} isCurrency change={12.4} variant="blue"   sparkData={sparkRevenue} index={0} icon={DollarSign} />
            <PremiumStatsCard title="Total Orders"     value={totalOrders}  change={5.2}             variant="violet" sparkData={sparkOrders}  index={1} icon={ShoppingBag} />
            <PremiumStatsCard title="WhatsApp Leads"   value={waMsgs}       change={18.7}            variant="green"  sparkData={sparkLeads}   index={2} icon={MessageSquare} />
            <PremiumStatsCard title="Pending Orders"   value={pendingCount} change={-8.3}            variant="amber"  sparkData={sparkPending}  index={3} icon={Clock} />
          </>
        )}
      </div>

      {}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, delay: 0.2 }}
      >
        <SectionCard className="p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-brand-500 to-violet-600 flex items-center justify-center shadow-sm">
                <Target className="w-4 h-4 text-white" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-foreground">Today's Revenue Target</h3>
                <p className="text-xs text-muted-foreground">₹{(todayRevenue / 1000).toFixed(0)}K of ₹{(targetRevenue / 1000).toFixed(0)}K goal</p>
              </div>
            </div>
            <div className="text-right">
              <span className="text-2xl font-bold text-foreground">{targetPct}%</span>
              <p className="text-[10px] text-muted-foreground">{targetPct >= 80 ? '🔥 On track!' : '💪 Keep pushing'}</p>
            </div>
          </div>
          <div className="h-3.5 bg-muted/60 dark:bg-muted/15 rounded-full overflow-hidden relative border border-border/10">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${targetPct}%` }}
              transition={{ duration: 1.2, ease: 'easeOut', delay: 0.3 }}
              className="h-full rounded-full bg-gradient-to-r from-brand-500 via-violet-500 to-purple-500 relative shadow-[0_0_12px_rgba(99,102,241,0.3)]"
            >
              {}
              <div className="absolute inset-0 bg-[linear-gradient(90deg,transparent_0%,rgba(255,255,255,0.25)_50%,transparent_100%)] animate-[pulse_2s_infinite]" />
              <div className="absolute right-0.5 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-white dark:bg-zinc-900 shadow-[0_2px_8px_rgba(0,0,0,0.15)] ring-2 ring-brand-500 flex items-center justify-center">
                <div className="w-1.5 h-1.5 rounded-full bg-brand-500 animate-pulse" />
              </div>
            </motion.div>
          </div>
          <div className="flex items-center justify-between mt-2">
            {[0, 25, 50, 75, 100].map(milestone => (
              <div key={milestone} className="flex flex-col items-center gap-0.5">
                <span className="text-[9px] text-muted-foreground/60">{milestone}%</span>
              </div>
            ))}
          </div>
        </SectionCard>
      </motion.div>

      {}
      <div className="flex flex-col gap-4 lg:grid lg:grid-cols-3">
        {}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.25 }}
          className="lg:col-span-2"
        >
          <SectionCard>
            <div className="flex items-center justify-between p-5 pb-0">
              <div>
                <h3 className="font-semibold text-foreground">Revenue Analytics</h3>
                <p className="text-xs text-muted-foreground mt-0.5">Monthly performance vs target</p>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1.5 text-xs text-emerald-600 font-semibold bg-emerald-50 dark:bg-emerald-900/30 px-2.5 py-1 rounded-full">
                  <TrendingUp className="w-3 h-3" />
                  +12.4% this month
                </div>
              </div>
            </div>
            {}
            <div className="flex items-center gap-4 px-5 pt-3 pb-1">
              {[{ color: '#4f46e5', label: 'Revenue' }, { color: '#e2e8f0', label: 'Target' }].map(l => (
                <div key={l.label} className="flex items-center gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-sm" style={{ background: l.color }} />
                  <span className="text-xs text-muted-foreground">{l.label}</span>
                </div>
              ))}
            </div>
            <div className="px-2 pb-4">
              {loading ? <Skeleton className="h-56 w-full" /> : (
                <ResponsiveContainer width="100%" height={isMobile ? 180 : 230}>
                  <AreaChart 
                    data={revenueData} 
                    margin={isMobile ? { top: 8, right: 4, left: -22, bottom: 0 } : { top: 8, right: 8, left: -16, bottom: 0 }}
                  >
                    <defs>
                      <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%"  stopColor="#4f46e5" stopOpacity={0.2} />
                        <stop offset="95%" stopColor="#4f46e5" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="tgtGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%"  stopColor="#94a3b8" stopOpacity={0.12} />
                        <stop offset="95%" stopColor="#94a3b8" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                    <XAxis dataKey="month" tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} axisLine={false} tickLine={false} tickFormatter={v => `₹${(v/1000).toFixed(0)}K`} />
                    <Tooltip content={<PremiumTooltip />} trigger={isMobile ? "click" : "hover"} />
                    <Area type="monotone" dataKey="target"  name="target"  stroke="#cbd5e1" strokeWidth={1.5} strokeDasharray="4 4" fill="url(#tgtGrad)" dot={false} />
                    <Area type="monotone" dataKey="revenue" name="revenue" stroke="#4f46e5" strokeWidth={2.5} fill="url(#revGrad)" dot={false} activeDot={{ r: 5, fill: '#4f46e5', strokeWidth: 2, stroke: '#fff' }} />
                  </AreaChart>
                </ResponsiveContainer>
              )}
            </div>
          </SectionCard>
        </motion.div>

        {}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.3 }}
        >
          <SectionCard className="h-full">
            <div className="p-5 pb-3">
              <h3 className="font-semibold text-foreground">Top Products</h3>
              <p className="text-xs text-muted-foreground mt-0.5">By revenue this month</p>
            </div>
            {loading ? (
              <div className="p-5 space-y-4"><Skeleton className="h-48 w-full" /></div>
            ) : (
              <div className="px-5 pb-5 space-y-3.5">
                {analyticsData.topProducts.slice(0, 5).map((p, i) => {
                  const colors = ['bg-brand-600', 'bg-violet-500', 'bg-blue-500', 'bg-emerald-500', 'bg-amber-500']
                  const pcts   = [88, 72, 61, 48, 35]
                  return (
                    <div key={p.name}>
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center gap-2.5">
                          <span className="text-xs font-bold text-muted-foreground w-4">{i + 1}</span>
                          <span className="text-sm font-medium text-foreground truncate max-w-[120px]">{p.name}</span>
                        </div>
                        <span className="text-xs font-semibold text-foreground">{p.sales} sold</span>
                      </div>
                      <div className="h-1.5 bg-muted rounded-full overflow-hidden ml-6">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${pcts[i]}%` }}
                          transition={{ duration: 0.8, delay: 0.4 + i * 0.1, ease: 'easeOut' }}
                          className={cn('h-full rounded-full', colors[i])}
                        />
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </SectionCard>
        </motion.div>
      </div>

      {}
      <div className="flex flex-col gap-4">
        {}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.3 }}
        >
          <SectionCard>
            <div className="flex items-center justify-between p-5 pb-0">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
                  <MessageCircle className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground text-sm">WhatsApp Campaign</h3>
                  <p className="text-[11px] text-muted-foreground">Weekly message activity</p>
                </div>
              </div>
              <div className="text-xs font-semibold text-emerald-600 bg-emerald-50 dark:bg-emerald-900/30 px-2 py-1 rounded-full">
                44 converted
              </div>
            </div>
            <div className="px-2 py-4">
              {loading ? <Skeleton className="h-44 w-full" /> : (
                <ResponsiveContainer width="100%" height={175}>
                  <BarChart data={whatsappData} margin={{ top: 0, right: 8, left: -24, bottom: 0 }} barGap={2}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                    <XAxis dataKey="day" tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} axisLine={false} tickLine={false} />
                    <Tooltip content={<PremiumTooltip />} />
                    <Bar dataKey="sent"      name="sent"      fill="#e2e8f0" radius={[4, 4, 0, 0]} maxBarSize={18} />
                    <Bar dataKey="received"  name="received"  fill="#a5b4fc" radius={[4, 4, 0, 0]} maxBarSize={18} />
                    <Bar dataKey="converted" name="converted" fill="#4f46e5" radius={[4, 4, 0, 0]} maxBarSize={18} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
            <div className="flex items-center gap-4 px-5 pb-4">
              {[{ color: '#e2e8f0', label: 'Sent' }, { color: '#a5b4fc', label: 'Received' }, { color: '#4f46e5', label: 'Converted' }].map(l => (
                <div key={l.label} className="flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-sm" style={{ background: l.color }} />
                  <span className="text-[11px] text-muted-foreground">{l.label}</span>
                </div>
              ))}
            </div>
          </SectionCard>
        </motion.div>

        {}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.35 }}
        >
          <SectionCard>
            <div className="flex items-center justify-between p-5 pb-0">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-violet-100 dark:bg-violet-900/30 flex items-center justify-center">
                  <Users className="w-4 h-4 text-violet-600 dark:text-violet-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground text-sm">Customer Retention</h3>
                  <p className="text-[11px] text-muted-foreground">New vs returning customers</p>
                </div>
              </div>
              <div className="text-xs font-semibold text-violet-600 bg-violet-50 dark:bg-violet-900/30 px-2 py-1 rounded-full">
                68% retained
              </div>
            </div>
            <div className="px-2 py-4">
              {loading ? <Skeleton className="h-44 w-full" /> : (
                <ResponsiveContainer width="100%" height={175}>
                  <LineChart data={retentionData} margin={{ top: 0, right: 8, left: -24, bottom: 0 }}>
                    <defs>
                      <linearGradient id="newGrad" x1="0" y1="0" x2="1" y2="0">
                        <stop offset="0%" stopColor="#8b5cf6" />
                        <stop offset="100%" stopColor="#a78bfa" />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                    <XAxis dataKey="month" tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} axisLine={false} tickLine={false} />
                    <Tooltip content={<PremiumTooltip />} />
                    <Line type="monotone" dataKey="new"       name="new"       stroke="#8b5cf6" strokeWidth={2.5} dot={false} activeDot={{ r: 4, fill: '#8b5cf6' }} />
                    <Line type="monotone" dataKey="returning" name="returning" stroke="#10b981" strokeWidth={2.5} dot={false} activeDot={{ r: 4, fill: '#10b981' }} strokeDasharray="0" />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </div>
            <div className="flex items-center gap-4 px-5 pb-4">
              {[{ color: '#8b5cf6', label: 'New' }, { color: '#10b981', label: 'Returning' }].map(l => (
                <div key={l.label} className="flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-sm" style={{ background: l.color }} />
                  <span className="text-[11px] text-muted-foreground">{l.label}</span>
                </div>
              ))}
            </div>
          </SectionCard>
        </motion.div>
      </div>

      {}
      <div className="flex flex-col gap-4">
        {}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.35 }}
          className="lg:col-span-2"
        >
          <SectionCard>
            {}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-5 pb-4 border-b border-border">
              <div>
                <h3 className="font-semibold text-foreground">Recent Orders</h3>
                <p className="text-xs text-muted-foreground mt-0.5">{filteredOrders.length} orders shown</p>
              </div>
              <div className="flex items-center gap-2">
                {}
                <div className="relative">
                  <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                  <input
                    value={orderSearch}
                    onChange={e => setOrderSearch(e.target.value)}
                    placeholder="Search orders..."
                    className="pl-8 pr-3 py-1.5 text-xs border border-border rounded-xl bg-muted/40 focus:bg-background focus:border-brand-400 focus:ring-1 focus:ring-brand-400/20 outline-none transition-all w-36"
                  />
                </div>
                {}
                <div className="relative">
                  <select
                    onChange={e => setOrderFilter(e.target.value || null)}
                    className="text-xs border border-border rounded-xl bg-muted/40 px-2.5 py-1.5 pr-7 appearance-none outline-none focus:border-brand-400 transition-colors cursor-pointer"
                  >
                    <option value="">All status</option>
                    <option value="pending">Pending</option>
                    <option value="confirmed">Confirmed</option>
                    <option value="delivered">Delivered</option>
                    <option value="paid">Paid</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                  <Filter className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 text-muted-foreground pointer-events-none" />
                </div>
                {}
                <button
                  onClick={() => toast.success('Exporting orders to CSV...')}
                  className="flex items-center gap-1.5 text-xs font-medium border border-border rounded-xl px-2.5 py-1.5 hover:bg-muted transition-colors text-muted-foreground"
                >
                  <Download className="w-3.5 h-3.5" />
                  Export
                </button>
              </div>
            </div>

            {}
            <div>
              {loading ? (
                <div className="p-4 space-y-3">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <Skeleton className="w-9 h-9 rounded-xl flex-shrink-0" />
                      <div className="flex-1 space-y-1.5"><Skeleton className="h-3.5 w-36" /><Skeleton className="h-3 w-48" /></div>
                      <Skeleton className="h-6 w-20 rounded-full" />
                      <Skeleton className="h-6 w-16 rounded-full" />
                      <Skeleton className="h-4 w-16" />
                    </div>
                  ))}
                </div>
              ) : (
                <>
                  {}
                  <div className="lg:hidden divide-y divide-border/30 px-4">
                    {filteredOrders.map((order, i) => (
                      <motion.div
                        key={order.id}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.2, delay: i * 0.03 }}
                        className="py-3.5 flex items-center justify-between gap-3 active:bg-muted/30 transition-colors"
                        onClick={() => toast(`Order ${order.orderNumber} details`, { icon: '📦' })}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-brand-500/10 to-violet-500/10 dark:from-brand-500/20 dark:to-violet-500/20 flex items-center justify-center text-xs font-bold text-brand-600 dark:text-brand-400 flex-shrink-0 border border-brand-500/10">
                            {getInitials(order.customerName)}
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5">
                              <p className="text-xs font-bold text-foreground truncate">{order.customerName}</p>
                              <span className="text-[9px] font-mono text-muted-foreground tracking-tighter">({order.orderNumber.split('-').pop()})</span>
                            </div>
                            <p className="text-[10px] text-muted-foreground truncate mt-0.5">{order.items[0]?.productName} · {order.items.length} item{order.items.length > 1 ? 's' : ''}</p>
                            <div className="flex items-center gap-1.5 mt-1.5">
                              <OrderStatusBadge status={order.status} />
                              <OrderStatusBadge status={order.paymentStatus === 'paid' ? 'paid' : 'pending'} />
                            </div>
                          </div>
                        </div>
                        <div className="text-right flex-shrink-0">
                          <span className="text-xs font-bold text-foreground block">{formatCurrency(order.total)}</span>
                          <span className="text-[9px] text-muted-foreground/60 block mt-0.5">{format(new Date(order.createdAt), 'h:mm a')}</span>
                        </div>
                      </motion.div>
                    ))}
                  </div>

                  {}
                  <div className="hidden lg:block overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-border">
                          {['Customer', 'Order', 'Status', 'Payment', 'Amount'].map(h => (
                            <th key={h} className="text-left text-[10px] font-semibold text-muted-foreground/70 uppercase tracking-wider px-5 py-2.5">{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border/50">
                        {filteredOrders.map((order, i) => (
                          <motion.tr
                            key={order.id}
                            initial={{ opacity: 0, x: -8 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.2, delay: i * 0.04 }}
                            className="group hover:bg-muted/40 transition-colors cursor-pointer"
                            onClick={() => toast(`Order ${order.orderNumber} details`, { icon: '📦' })}
                          >
                            <td className="px-5 py-3">
                              <div className="flex items-center gap-2.5">
                                <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-brand-100 to-violet-100 dark:from-brand-900/40 dark:to-violet-900/40 flex items-center justify-center text-xs font-bold text-brand-700 dark:text-brand-300 flex-shrink-0">
                                  {getInitials(order.customerName)}
                                </div>
                                <div>
                                  <p className="text-xs font-semibold text-foreground">{order.customerName}</p>
                                  <p className="text-[10px] text-muted-foreground truncate max-w-[100px]">{order.items[0]?.productName}</p>
                                </div>
                              </div>
                            </td>
                            <td className="px-5 py-3">
                              <span className="text-xs font-mono text-muted-foreground">{order.orderNumber}</span>
                            </td>
                            <td className="px-5 py-3">
                              <OrderStatusBadge status={order.status} />
                            </td>
                            <td className="px-5 py-3">
                              <OrderStatusBadge status={order.paymentStatus === 'paid' ? 'paid' : 'pending'} />
                            </td>
                            <td className="px-5 py-3">
                              <span className="text-sm font-bold text-foreground">{formatCurrency(order.total)}</span>
                            </td>
                          </motion.tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </>
              )}
            </div>

            {}
            <div className="flex items-center justify-between px-5 py-3 border-t border-border">
              <span className="text-xs text-muted-foreground">Showing {filteredOrders.length} of {displayOrders.length} orders</span>
              <Link href="/orders" className="flex items-center gap-1 text-xs font-semibold text-brand-600 dark:text-brand-400 hover:underline">
                View all orders <ArrowUpRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </SectionCard>
        </motion.div>

        {}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.4 }}
        >
          <SectionCard className="h-full">
            <div className="flex items-center justify-between p-5 pb-4 border-b border-border">
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-foreground text-sm">Live Activity</h3>
                <div className="flex items-center gap-1 bg-emerald-100 dark:bg-emerald-900/30 px-1.5 py-0.5 rounded-full">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-[9px] font-semibold text-emerald-700 dark:text-emerald-400">LIVE</span>
                </div>
              </div>
            </div>
            <div className="p-4 space-y-0">
              {activityFeed.map((item, i) => {
                const Icon = item.icon
                return (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, x: 8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.25, delay: 0.5 + i * 0.06 }}
                    className="flex gap-3 group py-2.5"
                  >
                    {}
                    <div className="flex flex-col items-center">
                      <div className={cn('w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 relative', item.color)}>
                        <Icon className={cn('w-3.5 h-3.5', item.iconColor)} />
                        {item.live && (
                          <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-emerald-500 ring-1 ring-background" />
                        )}
                      </div>
                      {i < activityFeed.length - 1 && (
                        <div className="w-px flex-1 mt-1.5 bg-border/60" />
                      )}
                    </div>
                    {}
                    <div className="pb-3 flex-1 min-w-0">
                      <p className="text-xs font-semibold text-foreground leading-tight">{item.text}</p>
                      <p className="text-[11px] text-muted-foreground mt-0.5 truncate">{item.sub}</p>
                      <p className="text-[10px] text-muted-foreground/60 mt-0.5">{item.time}</p>
                    </div>
                  </motion.div>
                )
              })}
            </div>
          </SectionCard>
        </motion.div>
      </div>

      {}
      
      {}
      <div className="hidden lg:grid grid-cols-3 gap-6">
        {}
        <SectionCard className="h-full">
          <div className="p-5 pb-4 border-b border-border">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-brand-500 to-violet-600 flex items-center justify-center shadow-sm">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground text-sm">AI Sales Insights</h3>
                <p className="text-[11px] text-muted-foreground">Powered by SweetFlow AI</p>
              </div>
            </div>
          </div>
          <div className="p-4 space-y-3">
            {aiInsights.map((insight) => (
              <div
                key={insight.id}
                className="p-3 rounded-xl bg-muted/40 hover:bg-muted transition-colors cursor-pointer group border border-transparent hover:border-brand-100 dark:hover:border-brand-900/30"
              >
                <div className="flex items-start gap-2.5">
                  <span className="text-lg leading-none flex-shrink-0">{insight.icon}</span>
                  <div className="flex-1 min-w-0">
                    <span className="text-[9px] font-bold uppercase tracking-wider text-brand-600 dark:text-brand-400 bg-brand-50 dark:bg-brand-900/30 px-1.5 py-0.5 rounded-md">{insight.tag}</span>
                    <p className="text-xs text-foreground mt-1.5 leading-relaxed">{insight.text}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </SectionCard>

        {}
        <SectionCard className="h-full">
          <div className="flex items-center justify-between p-5 pb-4 border-b border-border">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
                <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground text-sm">Inventory Alerts</h3>
                <p className="text-[11px] text-muted-foreground">Low stock warnings</p>
              </div>
            </div>
            <span className="text-[10px] font-bold text-amber-600 bg-amber-100 dark:bg-amber-900/30 px-1.5 py-0.5 rounded-full">
              {inventoryAlerts.length} alerts
            </span>
          </div>
          <div className="p-4 space-y-3">
            {inventoryAlerts.map((alert) => (
              <div
                key={alert.item}
                className="flex items-center justify-between p-3 rounded-xl bg-muted/40 hover:bg-muted transition-colors"
              >
                <div className="flex items-center gap-2.5">
                  <div className={cn('w-2 h-2 rounded-full', alert.critical ? 'bg-red-500' : 'bg-amber-500')} />
                  <div>
                    <p className="text-xs font-semibold text-foreground">{alert.item}</p>
                    <p className="text-[10px] text-muted-foreground">Min: {alert.threshold}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className={cn('text-xs font-bold', alert.critical ? 'text-red-600 dark:text-red-400' : 'text-amber-600 dark:text-amber-400')}>{alert.stock}</p>
                  <p className="text-[9px] text-muted-foreground">{alert.critical ? 'Critical' : 'Low'}</p>
                </div>
              </div>
            ))}
            <Link href="/inventory" className="block w-full text-center text-xs font-semibold text-brand-600 dark:text-brand-400 hover:underline pt-1">
              Manage Inventory →
            </Link>
          </div>
        </SectionCard>

        {}
        <SectionCard className="h-full">
          <div className="flex items-center justify-between p-5 pb-4 border-b border-border">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                <Bell className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground text-sm">Smart Reminders</h3>
                <p className="text-[11px] text-muted-foreground">Today's action items</p>
              </div>
            </div>
            <span className="text-[10px] font-bold text-blue-600 bg-blue-50 dark:bg-blue-900/30 px-1.5 py-0.5 rounded-full">
              {smartReminders.filter(r => r.urgent).length} urgent
            </span>
          </div>
          <div className="p-4 space-y-2.5">
            {smartReminders.map((reminder) => (
              <div
                key={reminder.id}
                className="flex items-start gap-2.5 p-2.5 rounded-xl hover:bg-muted/40 transition-colors cursor-pointer group"
                onClick={() => toast.success(`Reminder: ${reminder.text}`, { icon: '🔔' })}
              >
                <button className="mt-0.5 flex-shrink-0 text-muted-foreground hover:text-emerald-500 transition-colors">
                  <Circle className="w-4 h-4" />
                </button>
                <div className="flex-1 min-w-0">
                  <p className={cn('text-xs font-medium text-foreground', reminder.urgent && 'font-semibold')}>{reminder.text}</p>
                  <div className="flex items-center gap-1 mt-0.5">
                    <Clock className="w-2.5 h-2.5 text-muted-foreground/60" />
                    <span className={cn('text-[10px]', reminder.urgent ? 'text-red-500 font-medium' : 'text-muted-foreground')}>{reminder.due}</span>
                  </div>
                </div>
                {reminder.urgent && (
                  <span className="text-[9px] font-bold text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 px-1.5 py-0.5 rounded-md flex-shrink-0">
                    Urgent
                  </span>
                )}
              </div>
            ))}
            <button
              onClick={() => toast('Add reminder feature coming soon!', { icon: '🔔' })}
              className="w-full mt-1 text-xs font-medium text-brand-600 dark:text-brand-400 border border-dashed border-brand-200 dark:border-brand-800 rounded-xl py-2 hover:bg-brand-50 dark:hover:bg-brand-900/20 transition-colors"
            >
              + Add reminder
            </button>
          </div>
        </SectionCard>
      </div>

      {}
      <div className="lg:hidden flex flex-col gap-4">
        {}
        <div className="bg-muted/50 dark:bg-muted/10 p-1 rounded-2xl flex items-center border border-border/30">
          {(['insights', 'alerts', 'reminders'] as const).map((tab) => {
            const label = tab === 'insights' ? 'Insights' : tab === 'alerts' ? 'Alerts' : 'Reminders';
            const isActive = activeBottomTab === tab;
            return (
              <button
                key={tab}
                onClick={() => setActiveBottomTab(tab)}
                className="flex-1 py-2 text-xs font-bold text-center rounded-xl relative transition-colors duration-200"
              >
                {isActive && (
                  <motion.div
                    layoutId="active-dashboard-bottom-tab"
                    className="absolute inset-0 bg-card border border-border/30 dark:border-white/5 shadow-sm rounded-xl"
                    transition={{ type: "spring", stiffness: 380, damping: 30 }}
                  />
                )}
                <span className={cn("relative z-10", isActive ? "text-foreground font-extrabold" : "text-muted-foreground/80")}>
                  {label}
                </span>
              </button>
            )
          })}
        </div>

        {}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeBottomTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.18 }}
          >
            {activeBottomTab === 'insights' && (
              <SectionCard className="border border-border/40 shadow-md">
                <div className="p-4 pb-3 border-b border-border/20 flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-brand-500 to-violet-600 flex items-center justify-center shadow-sm">
                    <Sparkles className="w-3.5 h-3.5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-bold text-foreground text-xs">AI Sales Insights</h3>
                    <p className="text-[10px] text-muted-foreground">Real-time automation suggestions</p>
                  </div>
                </div>
                <div className="p-3.5 space-y-3">
                  {aiInsights.map((insight) => (
                    <div
                      key={insight.id}
                      className="p-3 rounded-xl bg-muted/30 border border-border/10 flex items-start gap-2.5"
                    >
                      <span className="text-base leading-none flex-shrink-0 mt-0.5">{insight.icon}</span>
                      <div className="flex-1 min-w-0">
                        <span className="text-[8px] font-bold uppercase tracking-wider text-brand-600 dark:text-brand-400 bg-brand-50 dark:bg-brand-900/30 px-1.5 py-0.5 rounded-md">{insight.tag}</span>
                        <p className="text-xs text-foreground mt-1.5 leading-relaxed">{insight.text}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </SectionCard>
            )}

            {activeBottomTab === 'alerts' && (
              <SectionCard className="border border-border/40 shadow-md">
                <div className="p-4 pb-3 border-b border-border/20 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
                      <AlertTriangle className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                    </div>
                    <div>
                      <h3 className="font-bold text-foreground text-xs">Inventory Alerts</h3>
                      <p className="text-[10px] text-muted-foreground">Running low today</p>
                    </div>
                  </div>
                  <span className="text-[9px] font-bold text-amber-600 bg-amber-100 dark:bg-amber-900/30 px-2 py-0.5 rounded-full">
                    {inventoryAlerts.length} items
                  </span>
                </div>
                <div className="p-3.5 space-y-2.5">
                  {inventoryAlerts.map((alert) => (
                    <div
                      key={alert.item}
                      className="flex items-center justify-between p-3 rounded-xl bg-muted/30 border border-border/10"
                    >
                      <div className="flex items-center gap-2">
                        <div className={cn('w-2 h-2 rounded-full', alert.critical ? 'bg-rose-500' : 'bg-amber-500')} />
                        <div>
                          <p className="text-xs font-semibold text-foreground">{alert.item}</p>
                          <p className="text-[9px] text-muted-foreground">Required: {alert.threshold}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className={cn('text-xs font-bold', alert.critical ? 'text-rose-600 dark:text-rose-400' : 'text-amber-600 dark:text-amber-400')}>{alert.stock}</p>
                        <p className="text-[8px] text-muted-foreground uppercase font-bold tracking-wider">{alert.critical ? 'Critical' : 'Low'}</p>
                      </div>
                    </div>
                  ))}
                  <Link href="/inventory" className="block w-full text-center text-xs font-bold text-brand-600 dark:text-brand-400 hover:underline pt-1.5">
                    Open Inventory Manager →
                  </Link>
                </div>
              </SectionCard>
            )}

            {activeBottomTab === 'reminders' && (
              <SectionCard className="border border-border/40 shadow-md">
                <div className="p-4 pb-3 border-b border-border/20 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                      <Bell className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                      <h3 className="font-bold text-foreground text-xs">Smart Reminders</h3>
                      <p className="text-[10px] text-muted-foreground">Action checklist</p>
                    </div>
                  </div>
                  <span className="text-[9px] font-bold text-blue-600 bg-blue-50 dark:bg-blue-900/30 px-2 py-0.5 rounded-full">
                    {smartReminders.filter(r => r.urgent).length} priority
                  </span>
                </div>
                <div className="p-3.5 space-y-2.5">
                  {smartReminders.map((reminder) => (
                    <div
                      key={reminder.id}
                      className="flex items-start gap-2.5 p-3 rounded-xl bg-muted/30 border border-border/10 group"
                      onClick={() => toast.success(`Reminder: ${reminder.text}`, { icon: '🔔' })}
                    >
                      <button className="mt-0.5 flex-shrink-0 text-muted-foreground/70 hover:text-emerald-500 transition-colors">
                        <Circle className="w-3.5 h-3.5" />
                      </button>
                      <div className="flex-1 min-w-0">
                        <p className={cn('text-xs font-bold text-foreground', reminder.urgent && 'font-brand-600 dark:font-brand-400')}>{reminder.text}</p>
                        <div className="flex items-center gap-1 mt-1">
                          <Clock className="w-2.5 h-2.5 text-muted-foreground/50" />
                          <span className={cn('text-[9px]', reminder.urgent ? 'text-rose-500 font-bold' : 'text-muted-foreground/70')}>{reminder.due}</span>
                        </div>
                      </div>
                      {reminder.urgent && (
                        <span className="text-[8px] font-bold text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/20 px-1.5 py-0.5 rounded-md flex-shrink-0">
                          Urgent
                        </span>
                      )}
                    </div>
                  ))}
                  <button
                    onClick={() => toast('Add reminder feature coming soon!', { icon: '🔔' })}
                    className="w-full mt-1.5 text-xs font-bold text-brand-600 dark:text-brand-400 border border-dashed border-brand-200 dark:border-brand-800 rounded-xl py-2.5 hover:bg-brand-50 dark:hover:bg-brand-900/10 transition-colors"
                  >
                    + Add New Reminder
                  </button>
                </div>
              </SectionCard>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  )
}
