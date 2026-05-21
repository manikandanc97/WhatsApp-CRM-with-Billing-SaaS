'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts'
import { TrendingUp, Users, ShoppingBag, DollarSign, RefreshCw } from 'lucide-react'
import { PageHeader } from '@/components/ui/PageHeader'
import { StatsCard } from '@/components/ui/StatsCard'
import { staggerContainer } from '@/lib/animations'
import { formatCurrency } from '@/lib/utils'
import analyticsData from '@/data/analytics.json'
import { cn } from '@/lib/utils'

const COLORS = ['#6366f1', '#8b5cf6', '#06b6d4', '#10b981', '#f59e0b']

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload?.length) {
    return (
      <div className="bg-card border border-border rounded-xl p-3 shadow-elevated text-sm">
        <p className="font-semibold text-foreground mb-1">{label}</p>
        {payload.map((p: any, i: number) => (
          <p key={i} style={{ color: p.color }} className="font-medium text-xs">
            {p.name}: {p.name === 'revenue' ? formatCurrency(p.value) : p.value}
          </p>
        ))}
      </div>
    )
  }
  return null
}

const RANGES = ['Weekly', 'Monthly', 'Yearly'] as const

export default function AnalyticsPage() {
  const [range, setRange] = useState<typeof RANGES[number]>('Monthly')
  const data = range === 'Weekly' ? analyticsData.salesByDay : analyticsData.monthlyRevenue

  return (
    <div className="space-y-6 page-wrapper">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <PageHeader title="Analytics" description="Business insights and performance metrics" badge="Live Data" />
        <div className="flex gap-1 bg-muted p-1 rounded-xl self-start sm:self-auto">
          {RANGES.map(r => (
            <button
              key={r}
              onClick={() => setRange(r)}
              className={cn(
                'px-3 py-1.5 text-xs font-semibold rounded-lg transition-all duration-200',
                range === r ? 'bg-card shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'
              )}
            >
              {r}
            </button>
          ))}
        </div>
      </div>

      <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard title="Total Revenue" value={analyticsData.totalRevenue} isCurrency change={18.4} icon={DollarSign} variant="blue" />
        <StatsCard title="Total Orders" value={analyticsData.totalOrders} change={12.1} icon={ShoppingBag} variant="violet" />
        <StatsCard title="Customers" value={analyticsData.totalCustomers} change={8.3} icon={Users} variant="green" />
        <StatsCard title="Repeat Rate" value={analyticsData.repeatCustomerRate} suffix="%" change={4.2} icon={RefreshCw} variant="orange" />
      </motion.div>

      {/* Revenue Chart */}
      <motion.div
        initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
        className="bg-card border border-border rounded-2xl p-5"
      >
        <div className="flex items-center justify-between mb-5">
          <div>
            <h3 className="font-semibold text-foreground">Revenue Growth</h3>
            <p className="text-xs text-muted-foreground mt-0.5">{range} revenue and order trends</p>
          </div>
          <div className="flex items-center gap-1.5 text-xs font-medium text-emerald-600 bg-emerald-50 dark:bg-emerald-950/30 px-2.5 py-1 rounded-full">
            <TrendingUp className="w-3.5 h-3.5" />
            +18.4% growth
          </div>
        </div>
        <ResponsiveContainer width="100%" height={260}>
          <AreaChart data={data} margin={{ top: 5, right: 5, left: -10, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
            <XAxis dataKey="date" tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} axisLine={false} tickLine={false} />
            <YAxis yAxisId="revenue" tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} axisLine={false} tickLine={false} tickFormatter={v => `₹${(v/1000).toFixed(0)}k`} />
            <YAxis yAxisId="orders" orientation="right" tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} axisLine={false} tickLine={false} />
            <Tooltip content={<CustomTooltip />} />
            <Legend wrapperStyle={{ fontSize: 12 }} />
            <Area yAxisId="revenue" type="monotone" dataKey="revenue" name="revenue" stroke="#6366f1" strokeWidth={2} fill="rgba(99, 102, 241, 0.02)" dot={false} activeDot={{ r: 4 }} />
            <Area yAxisId="orders" type="monotone" dataKey="orders" name="orders" stroke="#8b5cf6" strokeWidth={2} fill="rgba(139, 92, 246, 0.01)" dot={false} activeDot={{ r: 4 }} />
          </AreaChart>
        </ResponsiveContainer>
      </motion.div>

      {/* Bottom Row: Products + Hourly */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Best Sellers Pie */}
        <motion.div
          initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
          className="bg-card border border-border rounded-2xl p-5"
        >
          <h3 className="font-semibold text-foreground mb-1">Best Selling Products</h3>
          <p className="text-xs text-muted-foreground mb-5">By revenue contribution</p>
          <div className="flex items-center gap-4">
            <ResponsiveContainer width="50%" height={180}>
              <PieChart>
                <Pie data={analyticsData.topProducts} dataKey="revenue" cx="50%" cy="50%" innerRadius={45} outerRadius={75} paddingAngle={3}>
                  {analyticsData.topProducts.map((_, idx) => (
                    <Cell key={idx} fill={COLORS[idx % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(val: any) => formatCurrency(val)} />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex-1 space-y-2.5">
              {analyticsData.topProducts.map((p, i) => (
                <div key={p.name} className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: COLORS[i % COLORS.length] }} />
                  <span className="text-xs text-muted-foreground flex-1 truncate">{p.name}</span>
                  <span className="text-xs font-bold text-foreground">{p.percentage}%</span>
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Peak Order Times */}
        <motion.div
          initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}
          className="bg-card border border-border rounded-2xl p-5"
        >
          <h3 className="font-semibold text-foreground mb-1">Peak Order Times</h3>
          <p className="text-xs text-muted-foreground mb-5">Hourly order distribution</p>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={analyticsData.hourlyOrders} margin={{ top: 0, right: 0, left: -25, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
              <XAxis dataKey="hour" tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} axisLine={false} tickLine={false} />
              <Tooltip cursor={{ fill: 'hsl(var(--muted) / 0.4)' }} contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: 12, fontSize: 12 }} />
              <Bar dataKey="orders" name="Orders" radius={[4, 4, 0, 0]}>
                {analyticsData.hourlyOrders.map((entry, idx) => (
                  <Cell key={idx} fill={entry.orders > 20 ? '#6366f1' : entry.orders > 12 ? '#8b5cf6' : '#c4b5fd'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </motion.div>
      </div>

      {/* Repeat Customer Rate */}
      <motion.div
        initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
        className="bg-card border border-border rounded-2xl p-6"
      >
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h3 className="font-bold text-lg text-foreground">Repeat Customer Rate</h3>
            <p className="text-muted-foreground text-sm mt-0.5">Customers who ordered more than once</p>
          </div>
          <div className="text-right">
            <p className="text-5xl font-black text-brand-600 dark:text-brand-400">{analyticsData.repeatCustomerRate}%</p>
            <p className="text-emerald-600 text-sm font-semibold mt-1">↑ 4.2% from last month</p>
          </div>
        </div>
        <div className="mt-4 h-3 bg-muted rounded-full overflow-hidden border border-border/50">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${analyticsData.repeatCustomerRate}%` }}
            transition={{ duration: 1.2, ease: 'easeOut', delay: 0.4 }}
            className="h-full bg-brand-600 dark:bg-brand-500 rounded-full"
          />
        </div>
        <p className="text-muted-foreground text-xs mt-2">Industry average: 45% · You're ahead by {analyticsData.repeatCustomerRate - 45}%!</p>
      </motion.div>
    </div>
  )
}
