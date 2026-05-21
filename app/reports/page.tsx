'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import {
  BarChart2, Download, Calendar, TrendingUp, TrendingDown,
  DollarSign, ShoppingBag, Users, MessageSquare, ArrowUpRight
} from 'lucide-react'
import { PageHeader } from '@/components/ui/PageHeader'
import {
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, BarChart, Bar, PieChart, Pie, Cell
} from 'recharts'
import { cn } from '@/lib/utils'
import toast from 'react-hot-toast'

const monthlyData = [
  { month: 'Jan', revenue: 178000, orders: 45, customers: 38 },
  { month: 'Feb', revenue: 205000, orders: 52, customers: 44 },
  { month: 'Mar', revenue: 248000, orders: 64, customers: 58 },
  { month: 'Apr', revenue: 267000, orders: 71, customers: 63 },
  { month: 'May', revenue: 287500, orders: 76, customers: 71 },
]

const categoryRevenue = [
  { name: 'Birthday Cakes', value: 42, color: '#4f46e5' },
  { name: 'Wedding Cakes',  value: 28, color: '#7c3aed' },
  { name: 'Cupcakes',       value: 15, color: '#10b981' },
  { name: 'Pastries',       value: 10, color: '#f59e0b' },
  { name: 'Custom Orders',  value: 5,  color: '#f43f5e' },
]

const kpis = [
  { label: 'Total Revenue',    value: '₹12.85L',  change: 14.2,  icon: DollarSign,    color: 'text-blue-600',    bg: 'bg-blue-50 dark:bg-blue-900/20' },
  { label: 'Total Orders',     value: '308',       change: 8.7,   icon: ShoppingBag,   color: 'text-violet-600',  bg: 'bg-violet-50 dark:bg-violet-900/20' },
  { label: 'New Customers',    value: '274',       change: 22.1,  icon: Users,         color: 'text-emerald-600', bg: 'bg-emerald-50 dark:bg-emerald-900/20' },
  { label: 'Avg Order Value',  value: '₹4,172',   change: 5.3,   icon: TrendingUp,    color: 'text-amber-600',   bg: 'bg-amber-50 dark:bg-amber-900/20' },
]

function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-card border border-border rounded-xl p-3 shadow-elevated text-xs min-w-[130px]">
      <p className="font-semibold text-foreground mb-2">{label}</p>
      {payload.map((p: any, i: number) => (
        <div key={i} className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full" style={{ background: p.color }} />
            <span className="text-muted-foreground capitalize">{p.name}</span>
          </div>
          <span className="font-bold text-foreground">
            {p.name === 'revenue' ? '₹' + (p.value / 1000).toFixed(0) + 'K' : p.value}
          </span>
        </div>
      ))}
    </div>
  )
}

export default function ReportsPage() {
  const [period, setPeriod] = useState<'weekly' | 'monthly' | 'yearly'>('monthly')

  return (
    <div className="space-y-6 page-wrapper">
      <PageHeader title="Reports" description="Detailed business performance analytics" />

      {/* Period Switcher */}
      <div className="flex items-center gap-2">
        {(['weekly', 'monthly', 'yearly'] as const).map(p => (
          <button
            key={p}
            onClick={() => setPeriod(p)}
            className={cn(
              'px-4 py-2 rounded-xl text-sm font-medium transition-all',
              period === p
                ? 'bg-brand-600 text-white shadow-sm'
                : 'bg-card border border-border text-muted-foreground hover:text-foreground hover:bg-muted'
            )}
          >
            {p.charAt(0).toUpperCase() + p.slice(1)}
          </button>
        ))}
        <button
          onClick={() => toast.success('Report exported to PDF!')}
          className="ml-auto flex items-center gap-1.5 border border-border rounded-xl px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
        >
          <Download className="w-4 h-4" /> Export PDF
        </button>
      </div>

      {/* KPI row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map((kpi, i) => {
          const Icon = kpi.icon
          const pos = kpi.change > 0
          return (
            <motion.div
              key={kpi.label}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.07 }}
              className="bg-card border border-border rounded-2xl p-5 shadow-sm hover:shadow-md transition-all"
            >
              <div className="flex items-center justify-between mb-3">
                <p className="text-xs font-medium text-muted-foreground">{kpi.label}</p>
                <div className={cn('w-8 h-8 rounded-xl flex items-center justify-center', kpi.bg)}>
                  <Icon className={cn('w-4 h-4', kpi.color)} />
                </div>
              </div>
              <p className="text-2xl font-bold text-foreground">{kpi.value}</p>
              <div className={cn('flex items-center gap-1 mt-1.5 text-xs font-semibold', pos ? 'text-emerald-600' : 'text-red-500')}>
                {pos ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                {Math.abs(kpi.change)}% vs last period
              </div>
            </motion.div>
          )
        })}
      </div>

      {/* Revenue chart */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="lg:col-span-2 bg-card border border-border rounded-2xl p-5 shadow-sm"
        >
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="font-semibold text-foreground">Revenue Trend</h3>
              <p className="text-xs text-muted-foreground mt-0.5">Monthly revenue & orders</p>
            </div>
            <div className="flex items-center gap-1 text-xs font-semibold text-emerald-600 bg-emerald-50 dark:bg-emerald-900/30 px-2.5 py-1 rounded-full">
              <TrendingUp className="w-3 h-3" /> +14.2% this period
            </div>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={monthlyData} margin={{ top: 5, right: 5, left: -16, bottom: 0 }}>
              <defs>
                <linearGradient id="rptRevGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#4f46e5" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#4f46e5" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} axisLine={false} tickLine={false} tickFormatter={v => `₹${(v/1000).toFixed(0)}K`} />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="revenue" name="revenue" stroke="#4f46e5" strokeWidth={2.5} fill="url(#rptRevGrad)" dot={false} activeDot={{ r: 5, fill: '#4f46e5', stroke: '#fff', strokeWidth: 2 }} />
            </AreaChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Category breakdown */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-card border border-border rounded-2xl p-5 shadow-sm"
        >
          <h3 className="font-semibold text-foreground mb-1">Revenue by Category</h3>
          <p className="text-xs text-muted-foreground mb-4">Product category breakdown</p>
          <div className="flex justify-center mb-4">
            <ResponsiveContainer width={160} height={160}>
              <PieChart>
                <Pie data={categoryRevenue} dataKey="value" cx="50%" cy="50%" innerRadius={50} outerRadius={75} paddingAngle={3}>
                  {categoryRevenue.map((entry, index) => (
                    <Cell key={index} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(v) => `${v}%`} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="space-y-2">
            {categoryRevenue.map(cat => (
              <div key={cat.name} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full" style={{ background: cat.color }} />
                  <span className="text-xs text-muted-foreground">{cat.name}</span>
                </div>
                <span className="text-xs font-bold text-foreground">{cat.value}%</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  )
}
