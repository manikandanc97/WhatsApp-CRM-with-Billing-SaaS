'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import {
  Package, AlertTriangle, TrendingDown, Search, Truck
} from 'lucide-react'
import { PageHeader } from '@/components/ui/PageHeader'
import { cn } from '@/lib/utils'
import toast from 'react-hot-toast'

const inventoryItems = [
  { id: 1, name: 'Dark Chocolate',       category: 'Ingredient', stock: 1.2,  unit: 'kg',  threshold: 2,   cost: 850,  status: 'critical',  lastOrdered: '2 days ago' },
  { id: 2, name: 'Cream Cheese',         category: 'Ingredient', stock: 0.8,  unit: 'kg',  threshold: 1,   cost: 420,  status: 'critical',  lastOrdered: '3 days ago' },
  { id: 3, name: 'Strawberries',         category: 'Ingredient', stock: 1.5,  unit: 'kg',  threshold: 2,   cost: 180,  status: 'low',       lastOrdered: '1 day ago' },
  { id: 4, name: 'All-Purpose Flour',    category: 'Ingredient', stock: 8.5,  unit: 'kg',  threshold: 5,   cost: 45,   status: 'ok',        lastOrdered: '5 days ago' },
  { id: 5, name: 'Unsalted Butter',      category: 'Ingredient', stock: 4.2,  unit: 'kg',  threshold: 3,   cost: 650,  status: 'ok',        lastOrdered: '4 days ago' },
  { id: 6, name: 'White Sugar',          category: 'Ingredient', stock: 12,   unit: 'kg',  threshold: 5,   cost: 55,   status: 'ok',        lastOrdered: '7 days ago' },
  { id: 7, name: '8" Cake Boxes',        category: 'Packaging',  stock: 18,   unit: 'pcs', threshold: 20,  cost: 35,   status: 'low',       lastOrdered: '2 days ago' },
  { id: 8, name: '6" Cake Boxes',        category: 'Packaging',  stock: 42,   unit: 'pcs', threshold: 20,  cost: 25,   status: 'ok',        lastOrdered: '5 days ago' },
  { id: 9, name: 'Ribbon & Decor',       category: 'Packaging',  stock: 55,   unit: 'pcs', threshold: 30,  cost: 12,   status: 'ok',        lastOrdered: '1 week ago' },
  { id: 10, name: 'Vanilla Extract',     category: 'Ingredient', stock: 0.3,  unit: 'L',   threshold: 0.5, cost: 1200, status: 'critical',  lastOrdered: '4 days ago' },
]

const statusConfig = {
  critical: { label: 'Critical', cls: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400', dot: 'bg-red-500' },
  low:      { label: 'Low Stock', cls: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400', dot: 'bg-amber-500' },
  ok:       { label: 'In Stock', cls: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400', dot: 'bg-emerald-500' },
}

export default function InventoryPage() {
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState<string>('all')

  const filtered = inventoryItems.filter(item => {
    const matchSearch = item.name.toLowerCase().includes(search.toLowerCase()) || item.category.toLowerCase().includes(search.toLowerCase())
    const matchFilter = filter === 'all' || item.status === filter
    return matchSearch && matchFilter
  })

  const criticalCount = inventoryItems.filter(i => i.status === 'critical').length
  const lowCount      = inventoryItems.filter(i => i.status === 'low').length
  const okCount       = inventoryItems.filter(i => i.status === 'ok').length

  return (
    <div className="space-y-6 page-wrapper">
      <PageHeader
        title="Inventory"
        description="Monitor stock levels and manage reorders"
        badge={criticalCount > 0 ? `${criticalCount} Critical` : undefined}
      />

      {}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Critical',  count: criticalCount, icon: AlertTriangle, color: 'text-red-600',    bg: 'bg-red-50 dark:bg-red-900/20',    border: 'border-red-100 dark:border-red-900/30' },
          { label: 'Low Stock', count: lowCount,      icon: TrendingDown,  color: 'text-amber-600',  bg: 'bg-amber-50 dark:bg-amber-900/20',  border: 'border-amber-100 dark:border-amber-900/30' },
          { label: 'In Stock',  count: okCount,       icon: Package,       color: 'text-emerald-600',bg: 'bg-emerald-50 dark:bg-emerald-900/20', border: 'border-emerald-100 dark:border-emerald-900/30' },
        ].map((card, i) => {
          const Icon = card.icon
          return (
            <motion.div
              key={card.label}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
              className={cn('bg-card border rounded-2xl p-4 shadow-sm', card.border)}
            >
              <div className="flex items-center gap-3">
                <div className={cn('w-9 h-9 rounded-xl flex items-center justify-center', card.bg)}>
                  <Icon className={cn('w-4.5 h-4.5', card.color)} />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{card.count}</p>
                  <p className="text-xs text-muted-foreground">{card.label}</p>
                </div>
              </div>
            </motion.div>
          )
        })}
      </div>

      {}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-card border border-border rounded-2xl shadow-sm overflow-hidden"
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-5 border-b border-border">
          <h3 className="font-semibold text-foreground">Stock Items</h3>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search items..." className="pl-8 pr-3 py-1.5 text-xs border border-border rounded-xl bg-muted/40 focus:bg-background focus:border-brand-400 focus:ring-1 focus:ring-brand-400/20 outline-none transition-all w-40" />
            </div>
            <select onChange={e => setFilter(e.target.value)} className="text-xs border border-border rounded-xl bg-muted/40 px-2.5 py-1.5 outline-none focus:border-brand-400 transition-colors">
              <option value="all">All status</option>
              <option value="critical">Critical</option>
              <option value="low">Low</option>
              <option value="ok">In Stock</option>
            </select>
            <button onClick={() => toast.success('Reorder request sent!')} className="flex items-center gap-1.5 bg-brand-600 hover:bg-brand-700 text-white text-xs font-semibold px-3 py-1.5 rounded-xl transition-colors">
              <Truck className="w-3.5 h-3.5" />Reorder
            </button>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                {['Item', 'Category', 'Stock', 'Threshold', 'Cost/Unit', 'Last Ordered', 'Status', ''].map(h => (
                  <th key={h} className="text-left text-[10px] font-semibold text-muted-foreground/70 uppercase tracking-wider px-5 py-3">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50">
              {filtered.map((item, i) => {
                const s = statusConfig[item.status as keyof typeof statusConfig]
                const pct = Math.min(100, (item.stock / (item.threshold * 2)) * 100)
                return (
                  <motion.tr
                    key={item.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3 + i * 0.03 }}
                    className="hover:bg-muted/30 transition-colors group"
                  >
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center flex-shrink-0">
                          <Package className="w-3.5 h-3.5 text-muted-foreground" />
                        </div>
                        <span className="text-sm font-semibold text-foreground">{item.name}</span>
                      </div>
                    </td>
                    <td className="px-5 py-3"><span className="text-xs text-muted-foreground">{item.category}</span></td>
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-16 h-1.5 bg-muted rounded-full overflow-hidden">
                          <div className={cn('h-full rounded-full', item.status === 'critical' ? 'bg-red-500' : item.status === 'low' ? 'bg-amber-500' : 'bg-emerald-500')} style={{ width: `${pct}%` }} />
                        </div>
                        <span className="text-sm font-bold text-foreground">{item.stock} {item.unit}</span>
                      </div>
                    </td>
                    <td className="px-5 py-3"><span className="text-xs text-muted-foreground">{item.threshold} {item.unit}</span></td>
                    <td className="px-5 py-3"><span className="text-sm font-medium text-foreground">₹{item.cost}</span></td>
                    <td className="px-5 py-3"><span className="text-xs text-muted-foreground">{item.lastOrdered}</span></td>
                    <td className="px-5 py-3">
                      <span className={cn('text-[10px] font-semibold px-2 py-0.5 rounded-full', s.cls)}>{s.label}</span>
                    </td>
                    <td className="px-5 py-3">
                      <button onClick={() => toast.success(`Reorder ${item.name} placed!`)} className="opacity-0 group-hover:opacity-100 text-xs font-medium text-brand-600 dark:text-brand-400 hover:underline transition-opacity">
                        Reorder
                      </button>
                    </td>
                  </motion.tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  )
}
