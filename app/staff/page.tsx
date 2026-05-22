'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Plus, Search, MoreHorizontal, Clock, Mail } from 'lucide-react'
import { PageHeader } from '@/components/ui/PageHeader'
import { cn } from '@/lib/utils'
import toast from 'react-hot-toast'

const staffMembers = [
  { id: 1, name: 'Lakshmi Anand',   role: 'Admin',       email: 'lakshmi@sweetflow.in',  phone: '+91 98765 43210', status: 'active',  avatar: 'LA', color: 'from-brand-400 to-violet-500',   joined: 'Jan 2024',  orders: 312, shift: 'Morning' },
  { id: 2, name: 'Rahul Krishnan',  role: 'Baker',        email: 'rahul@sweetflow.in',    phone: '+91 87654 32109', status: 'active',  avatar: 'RK', color: 'from-emerald-400 to-teal-500',   joined: 'Mar 2024',  orders: 198, shift: 'Morning' },
  { id: 3, name: 'Meena Pillai',    role: 'Baker',        email: 'meena@sweetflow.in',    phone: '+91 76543 21098', status: 'active',  avatar: 'MP', color: 'from-rose-400 to-pink-500',      joined: 'Feb 2024',  orders: 145, shift: 'Evening' },
  { id: 4, name: 'Arjun Sharma',    role: 'Delivery',     email: 'arjun@sweetflow.in',    phone: '+91 65432 10987', status: 'active',  avatar: 'AS', color: 'from-amber-400 to-orange-500',   joined: 'Apr 2024',  orders: 87,  shift: 'Afternoon' },
  { id: 5, name: 'Divya Nair',      role: 'Customer Care',email: 'divya@sweetflow.in',    phone: '+91 54321 09876', status: 'away',    avatar: 'DN', color: 'from-sky-400 to-blue-500',       joined: 'May 2024',  orders: 0,   shift: 'Morning' },
  { id: 6, name: 'Kiran Reddy',     role: 'Baker',        email: 'kiran@sweetflow.in',    phone: '+91 43210 98765', status: 'off',     avatar: 'KR', color: 'from-violet-400 to-purple-500',  joined: 'May 2024',  orders: 62,  shift: 'Evening' },
]

const roleColors: Record<string, string> = {
  Admin:         'bg-brand-100 text-brand-700 dark:bg-brand-900/30 dark:text-brand-400',
  Baker:         'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
  Delivery:      'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  'Customer Care':'bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-400',
}
const statusConfig = {
  active: { label: 'Active', dot: 'bg-emerald-500', text: 'text-emerald-600 dark:text-emerald-400' },
  away:   { label: 'Away',   dot: 'bg-amber-500',   text: 'text-amber-600 dark:text-amber-400' },
  off:    { label: 'Off Duty',dot: 'bg-slate-400',  text: 'text-muted-foreground' },
}

export default function StaffPage() {
  const [search, setSearch] = useState('')

  const filtered = staffMembers.filter(s =>
    s.name.toLowerCase().includes(search.toLowerCase()) ||
    s.role.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="space-y-6 page-wrapper">
      <PageHeader title="Staff" description="Manage your team members and their roles" />

      {}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-3">
          {}
          {[
            { label: 'Active', count: staffMembers.filter(s => s.status === 'active').length, color: 'text-emerald-600' },
            { label: 'Away',   count: staffMembers.filter(s => s.status === 'away').length,   color: 'text-amber-600' },
            { label: 'Off',    count: staffMembers.filter(s => s.status === 'off').length,    color: 'text-muted-foreground' },
          ].map(stat => (
            <div key={stat.label} className="flex items-center gap-1.5 text-sm">
              <span className={cn('font-bold', stat.color)}>{stat.count}</span>
              <span className="text-muted-foreground">{stat.label}</span>
            </div>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search staff..." className="pl-8 pr-3 py-1.5 text-xs border border-border rounded-xl bg-muted/40 focus:bg-background focus:border-brand-400 focus:ring-1 focus:ring-brand-400/20 outline-none transition-all w-40" />
          </div>
          <button
            onClick={() => toast('Add staff feature coming soon!', { icon: '👤' })}
            className="flex items-center gap-1.5 bg-brand-600 hover:bg-brand-700 text-white text-xs font-semibold px-3 py-1.5 rounded-xl transition-colors"
          >
            <Plus className="w-3.5 h-3.5" /> Add Staff
          </button>
        </div>
      </div>

      {}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((staff, i) => {
          const sc = statusConfig[staff.status as keyof typeof statusConfig]
          return (
            <motion.div
              key={staff.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.07 }}
              className="bg-card border border-border rounded-2xl p-5 shadow-sm hover:shadow-md transition-all hover:-translate-y-0.5 group"
            >
              {}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <div className={cn('w-12 h-12 rounded-2xl flex items-center justify-center text-white font-bold text-base bg-gradient-to-br shadow-sm', staff.color)}>
                      {staff.avatar}
                    </div>
                    <div className={cn('absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full ring-2 ring-card', sc.dot)} />
                  </div>
                  <div>
                    <p className="font-semibold text-foreground text-sm">{staff.name}</p>
                    <span className={cn('text-[10px] font-semibold px-1.5 py-0.5 rounded-md', roleColors[staff.role] || 'bg-muted text-muted-foreground')}>{staff.role}</span>
                  </div>
                </div>
                <button
                  onClick={() => toast(`Options for ${staff.name}`, { icon: '⚙️' })}
                  className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg hover:bg-muted transition-all text-muted-foreground"
                >
                  <MoreHorizontal className="w-4 h-4" />
                </button>
              </div>

              {}
              <div className="space-y-2 mb-4">
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Mail className="w-3.5 h-3.5 flex-shrink-0" />
                  <span className="truncate">{staff.email}</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Clock className="w-3.5 h-3.5 flex-shrink-0" />
                  <span>{staff.shift} Shift · Joined {staff.joined}</span>
                </div>
              </div>

              {}
              <div className="flex items-center justify-between pt-3 border-t border-border/60">
                <div className="flex items-center gap-1.5">
                  <div className={cn('w-1.5 h-1.5 rounded-full', sc.dot)} />
                  <span className={cn('text-xs font-medium', sc.text)}>{sc.label}</span>
                </div>
                <div className="text-right">
                  <span className="text-xs font-bold text-foreground">{staff.orders}</span>
                  <span className="text-[11px] text-muted-foreground ml-1">orders</span>
                </div>
              </div>
            </motion.div>
          )
        })}

        {}
        <motion.button
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: filtered.length * 0.07 }}
          onClick={() => toast('Add staff feature coming soon!', { icon: '👤' })}
          className="border-2 border-dashed border-border rounded-2xl p-5 flex flex-col items-center justify-center gap-2 text-muted-foreground hover:border-brand-400 hover:text-brand-600 dark:hover:text-brand-400 hover:bg-brand-50 dark:hover:bg-brand-900/20 transition-all min-h-[200px]"
        >
          <div className="w-12 h-12 rounded-2xl border-2 border-dashed border-current flex items-center justify-center">
            <Plus className="w-5 h-5" />
          </div>
          <span className="text-sm font-medium">Add Staff Member</span>
        </motion.button>
      </div>
    </div>
  )
}
