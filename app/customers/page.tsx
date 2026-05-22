'use client'

import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Plus, Star, Gift, Phone, Mail, MapPin,
  ShoppingBag, Calendar, Tag, X, Edit3, Trash2,
  Clock, History, FileText, UserCheck
} from 'lucide-react'
import { PageHeader } from '@/components/ui/PageHeader'
import { SearchInput } from '@/components/ui/SearchInput'
import { StatusBadge } from '@/components/ui/StatusBadge'
import { AnimatedModal } from '@/components/ui/AnimatedModal'
import { EmptyState } from '@/components/ui/EmptyState'
import { CardSkeleton } from '@/components/ui/LoadingSkeleton'
import { staggerContainer, staggerItem } from '@/lib/animations'
import { useAppStore } from '@/store/useAppStore'
import { useMounted } from '@/hooks/useMounted'
import { formatCurrency, formatDate, getInitials, generateId } from '@/lib/utils'
import type { Customer } from '@/types'
import toast from 'react-hot-toast'
import { cn } from '@/lib/utils'

const TAG_COLORS: Record<string, string> = {
  'VIP': 'bg-violet-100 text-violet-700 dark:bg-violet-950/30 dark:text-violet-400 border border-violet-200/50 dark:border-violet-800/40',
  'Regular': 'bg-brand-100 text-brand-700 dark:bg-brand-950/30 dark:text-brand-400 border border-brand-200/50 dark:border-brand-800/40',
  'Corporate': 'bg-sky-100 text-sky-700 dark:bg-sky-950/30 dark:text-sky-400 border border-sky-200/50 dark:border-sky-800/40',
  'New': 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400 border border-emerald-200/50 dark:border-emerald-800/40',
  'Birthday Club': 'bg-amber-100 text-amber-700 dark:bg-amber-950/30 dark:text-amber-400 border border-amber-200/50 dark:border-amber-800/40',
  'Wedding': 'bg-pink-100 text-pink-700 dark:bg-pink-950/30 dark:text-pink-400 border border-pink-200/50 dark:border-pink-800/40',
  'Eggless': 'bg-lime-100 text-lime-700 dark:bg-lime-950/30 dark:text-lime-400 border border-lime-200/50 dark:border-lime-800/40 border-lime-500/20',
  'Bulk': 'bg-orange-100 text-orange-700 dark:bg-orange-950/30 dark:text-orange-400 border border-orange-200/50 dark:border-orange-800/40',
  'Top Customer': 'bg-red-100 text-red-700 dark:bg-red-950/30 dark:text-red-400 border border-red-200/50 dark:border-red-800/40',
  'Event': 'bg-teal-100 text-teal-700 dark:bg-teal-950/30 dark:text-teal-400 border border-teal-200/50 dark:border-teal-800/40',
}

const PRESET_TAGS = ['VIP', 'Regular', 'Corporate', 'New', 'Birthday Club', 'Eggless', 'Bulk', 'Top Customer']

export default function CustomersPage() {
  const mounted = useMounted()
  const loading = !mounted
  const [search, setSearch] = useState('')
  
  // Drawer & Profile active states
  const [selected, setSelected] = useState<Customer | null>(null)
  const [profileTab, setProfileTab] = useState<'overview' | 'history' | 'timeline'>('overview')

  
  const [showAdd, setShowAdd] = useState(false)
  const [showEdit, setShowEdit] = useState(false)
  const [showDelete, setShowDelete] = useState(false)

  
  const [form, setForm] = useState({ name: '', phone: '', email: '', address: '', birthday: '', notes: '' })
  const [editForm, setEditForm] = useState({ name: '', phone: '', email: '', address: '', birthday: '', notes: '' })
  
  // Inline Tag Input
  const [tagInput, setTagInput] = useState('')

  const { 
    customers, setCustomers, addCustomer, updateCustomer, deleteCustomer,
    orders 
  } = useAppStore()

  // Filtered List
  const filtered = useMemo(() =>
    customers.filter(c =>
      !search ||
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.phone.includes(search) ||
      c.tags.some(t => t.toLowerCase().includes(search.toLowerCase()))
    ), [customers, search])

  // Get orders associated with selected customer
  const customerOrders = useMemo(() => {
    if (!selected) return []
    return orders.filter(o => o.customerId === selected.id)
  }, [selected, orders])

  // Dynamic Timeline Activities
  const timelineActivities = useMemo(() => {
    if (!selected) return []
    
    const activities: { id: string; date: string; title: string; desc: string; icon: any; color: string }[] = []
    
    // 1. Account creation event
    activities.push({
      id: 'join',
      date: selected.joinedAt,
      title: 'Joined SweetFlow AI',
      desc: 'Customer profile registered in CRM database.',
      icon: UserCheck,
      color: 'bg-emerald-500 text-white'
    })

    
    customerOrders.forEach(o => {
      activities.push({
        id: `order-${o.id}`,
        date: o.createdAt,
        title: `Order Placed: ${o.orderNumber}`,
        desc: `Logged cake order for ${formatCurrency(o.total)} with status "${o.status}".`,
        icon: ShoppingBag,
        color: 'bg-brand-500 text-white'
      })
    })

    
    if (selected.notes) {
      activities.push({
        id: 'notes-update',
        date: selected.joinedAt, 
        title: 'Preferences Configured',
        desc: `Baking instructions logged: "${selected.notes}"`,
        icon: FileText,
        color: 'bg-amber-500 text-white'
      })
    }

    
    return activities.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
  }, [selected, customerOrders])

  
  function handleAdd() {
    if (!form.name || !form.phone) { 
      toast.error('Name and phone are required')
      return 
    }
    const customer: Customer = {
      id: generateId(),
      name: form.name,
      phone: form.phone,
      email: form.email || undefined,
      address: form.address || undefined,
      birthday: form.birthday || undefined,
      notes: form.notes || undefined,
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${form.name}`,
      joinedAt: new Date().toISOString().split('T')[0],
      loyaltyPoints: 50, 
      totalSpent: 0,
      orderCount: 0,
      tags: ['New'],
    }
    addCustomer(customer)
    toast.success('New customer profile logged! 👥')
    setShowAdd(false)
    setForm({ name: '', phone: '', email: '', address: '', birthday: '', notes: '' })
  }

  // Edit Customer Modal Trigger
  function openEdit() {
    if (!selected) return
    setEditForm({
      name: selected.name,
      phone: selected.phone,
      email: selected.email || '',
      address: selected.address || '',
      birthday: selected.birthday || '',
      notes: selected.notes || ''
    })
    setShowEdit(false)
    setShowEdit(true)
  }

  // Save Edit Customer Action
  function handleSaveEdit() {
    if (!selected) return
    if (!editForm.name || !editForm.phone) {
      toast.error('Name and phone are required')
      return
    }

    updateCustomer(selected.id, {
      name: editForm.name,
      phone: editForm.phone,
      email: editForm.email || undefined,
      address: editForm.address || undefined,
      birthday: editForm.birthday || undefined,
      notes: editForm.notes || undefined
    })

    
    setSelected({
      ...selected,
      name: editForm.name,
      phone: editForm.phone,
      email: editForm.email || undefined,
      address: editForm.address || undefined,
      birthday: editForm.birthday || undefined,
      notes: editForm.notes || undefined
    })

    toast.success('Customer details updated!')
    setShowEdit(false)
  }

  
  function handleAddTag(tag: string) {
    if (!selected) return
    const cleanTag = tag.trim()
    if (!cleanTag) return
    if (selected.tags.includes(cleanTag)) {
      toast.error('Tag already exists')
      return
    }

    const updatedTags = [...selected.tags, cleanTag]
    updateCustomer(selected.id, { tags: updatedTags })
    setSelected({ ...selected, tags: updatedTags })
    setTagInput('')
    toast.success(`Tag "${cleanTag}" added!`)
  }

  function handleRemoveTag(tagToRemove: string) {
    if (!selected) return
    const updatedTags = selected.tags.filter(t => t !== tagToRemove)
    updateCustomer(selected.id, { tags: updatedTags })
    setSelected({ ...selected, tags: updatedTags })
    toast.success(`Tag removed`)
  }

  // Notes inline updates
  function handleSaveNotes(notesValue: string) {
    if (!selected) return
    updateCustomer(selected.id, { notes: notesValue || undefined })
    setSelected({ ...selected, notes: notesValue || undefined })
  }

  // Delete Action
  function handleConfirmDelete() {
    if (selected) {
      deleteCustomer(selected.id)
      toast.success('Customer profile permanently deleted')
      setSelected(null)
      setShowDelete(false)
    }
  }

  return (
    <div className="space-y-5 page-wrapper">
      <PageHeader
        title="CRM Customer Directory"
        description="Monitor customer loyalty rewards, cake ordering patterns, and WhatsApp metrics."
        badge={`${customers.length} total`}
        action={
          <button
            onClick={() => setShowAdd(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-brand-600 dark:bg-brand-500 hover:bg-brand-700 dark:hover:bg-brand-600 text-white text-sm font-semibold shadow-sm transition-all duration-200 hover:-translate-y-[0.5px]"
          >
            <Plus className="w-4 h-4" />
            Add Customer
          </button>
        }
      />

      <div className="flex flex-col sm:flex-row gap-3">
        <SearchInput 
          placeholder="Search clients by name, phone or tag tags..." 
          value={search} 
          onChange={setSearch} 
          className="max-w-md" 
        />
      </div>

      {}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => <CardSkeleton key={i} />)}
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState 
          emoji="👥" 
          title="No customers match criteria" 
          description="Adjust your search criteria or register a new customer in the system." 
        />
      ) : (
        <motion.div 
          variants={staggerContainer} 
          initial="hidden" 
          animate="visible" 
          className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4"
        >
          {filtered.map((customer) => (
            <motion.div
              key={customer.id}
              variants={staggerItem}
              whileHover={{ scale: 0.99 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => {
                setSelected(customer)
                setProfileTab('overview')
              }}
              className="bg-card/60 backdrop-blur-xl border border-white/20 dark:border-white/5 hover:border-brand-300/50 dark:hover:border-brand-700/50 rounded-[24px] p-5 cursor-pointer transition-all duration-300 shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.1)] relative overflow-hidden group"
            >
              {customer.tags.includes('VIP') && (
                <div className="absolute right-0 top-0 w-20 h-20 pointer-events-none overflow-hidden">
                  <div className="bg-gradient-to-r from-amber-400 to-amber-500 text-[9px] font-black text-white text-center py-1 absolute transform rotate-45 w-28 -right-8 top-4 uppercase tracking-widest shadow-sm">
                    VIP
                  </div>
                </div>
              )}

              {}
              <div className="flex items-start gap-4 mb-5">
                <div className="relative flex-shrink-0">
                  <div className="w-12 h-12 rounded-[18px] bg-gradient-to-br from-brand-100 to-brand-50 dark:from-brand-900/60 dark:to-brand-800/40 text-brand-700 dark:text-brand-300 border border-brand-200/50 dark:border-brand-700/30 flex items-center justify-center font-bold text-lg shadow-sm">
                    {getInitials(customer.name)}
                  </div>
                </div>
                <div className="flex-1 min-w-0 pt-0.5">
                  <p className="text-[15px] font-bold text-foreground truncate">{customer.name}</p>
                  <p className="text-xs font-medium text-muted-foreground mt-0.5">{customer.phone}</p>
                </div>
                <div className="text-right flex-shrink-0 pr-2 pt-0.5">
                  <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-0.5">Lifetime</p>
                  <p className="text-sm font-bold text-brand-600 dark:text-brand-400">{formatCurrency(customer.totalSpent)}</p>
                </div>
              </div>

              {}
              <div className="flex flex-wrap gap-1.5 mb-5 pl-1">
                {customer.tags.slice(0, 3).map(tag => (
                  <span key={tag} className={cn('text-[9px] font-bold px-2 py-1 rounded-full uppercase tracking-wider border transition-colors', TAG_COLORS[tag] || 'bg-muted/50 text-muted-foreground border-transparent')}>
                    {tag}
                  </span>
                ))}
                {customer.tags.length > 3 && (
                  <span className="text-[9px] font-bold px-2 py-1 rounded-full bg-muted/50 text-muted-foreground border border-transparent">
                    +{customer.tags.length - 3} MORE
                  </span>
                )}
              </div>

              {}
              <div className="grid grid-cols-3 gap-2 pt-4 border-t border-border/40 bg-muted/10 -mx-5 -mb-5 px-5 pb-5 rounded-b-[24px]">
                <div className="text-center">
                  <p className="text-[15px] font-extrabold text-foreground">{customer.orderCount}</p>
                  <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mt-0.5">Orders</p>
                </div>
                <div className="text-center border-x border-border/40">
                  <p className="text-[15px] font-extrabold text-amber-500 flex items-center justify-center gap-1">
                    {customer.loyaltyPoints} <Star className="w-3 h-3 fill-amber-500" />
                  </p>
                  <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mt-0.5">Rewards</p>
                </div>
                <div className="text-center">
                  <p className="text-[13px] font-bold text-foreground mt-0.5">{formatDate(customer.joinedAt).split(',')[0]}</p>
                  <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mt-1">Joined</p>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      )}

      {}
      <AnimatePresence>
        {selected && (
          <div className="fixed inset-0 z-50 flex justify-end">
            <motion.div
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }}
              onClick={() => setSelected(null)}
              className="absolute inset-0 bg-black/40 backdrop-blur-xs"
            />
            <motion.div
              initial={{ x: '100%' }} 
              animate={{ x: 0 }} 
              exit={{ x: '100%' }}
              transition={{ type: 'spring', stiffness: 320, damping: 30 }}
              className="relative w-full max-w-lg bg-card border-l border-border flex flex-col h-full shadow-2xl z-10"
            >
              {}
              <div className="p-5 border-b border-border flex items-start justify-between bg-muted/20">
                <div className="flex items-center gap-3.5">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-brand-500 to-violet-600 text-white flex items-center justify-center font-bold text-base shadow-sm">
                    {getInitials(selected.name)}
                  </div>
                  <div>
                    <h2 className="font-extrabold text-foreground flex items-center gap-1.5">
                      {selected.name}
                    </h2>
                    <p className="text-xs text-muted-foreground">{selected.phone}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-1">
                  <button 
                    onClick={openEdit}
                    className="p-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-xl transition-colors"
                    title="Edit Customer Profile"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                  <button 
                    onClick={() => setSelected(null)} 
                    className="p-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-xl transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {}
              <div className="flex border-b border-border text-xs font-bold text-muted-foreground">
                <button
                  onClick={() => setProfileTab('overview')}
                  className={cn(
                    'flex-1 py-3 text-center border-b-2 transition-all flex items-center justify-center gap-1.5',
                    profileTab === 'overview' ? 'border-brand-500 text-brand-600 dark:text-brand-400' : 'border-transparent hover:text-foreground'
                  )}
                >
                  <FileText className="w-3.5 h-3.5" /> Overview
                </button>
                <button
                  onClick={() => setProfileTab('history')}
                  className={cn(
                    'flex-1 py-3 text-center border-b-2 transition-all flex items-center justify-center gap-1.5',
                    profileTab === 'history' ? 'border-brand-500 text-brand-600 dark:text-brand-400' : 'border-transparent hover:text-foreground'
                  )}
                >
                  <History className="w-3.5 h-3.5" /> Order History ({customerOrders.length})
                </button>
                <button
                  onClick={() => setProfileTab('timeline')}
                  className={cn(
                    'flex-1 py-3 text-center border-b-2 transition-all flex items-center justify-center gap-1.5',
                    profileTab === 'timeline' ? 'border-brand-500 text-brand-600 dark:text-brand-400' : 'border-transparent hover:text-foreground'
                  )}
                >
                  <Clock className="w-3.5 h-3.5" /> Timeline
                </button>
              </div>

              {}
              <div className="flex-1 overflow-y-auto scrollbar-thin p-5 space-y-6">
                
                {profileTab === 'overview' && (
                  <div className="space-y-6 animate-fadeIn">
                    
                    {}
                    <div className="bg-muted/30 border border-border/80 rounded-2xl p-4 space-y-3">
                      <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">Contact Information</span>
                      {selected.email && (
                        <div className="flex items-center gap-3 text-xs text-foreground">
                          <Mail className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                          <span>{selected.email}</span>
                        </div>
                      )}
                      {selected.address && (
                        <div className="flex items-start gap-3 text-xs text-foreground">
                          <MapPin className="w-4 h-4 text-muted-foreground flex-shrink-0 mt-0.5" />
                          <span>{selected.address}</span>
                        </div>
                      )}
                      {selected.birthday && (
                        <div className="flex items-center gap-3 text-xs text-foreground">
                          <Gift className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                          <span>Birthday: {new Date(selected.birthday).toLocaleDateString('en-IN', { day: 'numeric', month: 'long' })}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-3 text-xs text-foreground">
                        <Calendar className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                        <span>Registered Customer since {formatDate(selected.joinedAt)}</span>
                      </div>
                    </div>

                    {}
                    <div className="bg-muted/30 border border-border/80 rounded-2xl p-4 space-y-3">
                      <div className="flex items-center gap-1.5">
                        <Tag className="w-4 h-4 text-brand-600 dark:text-brand-400" />
                        <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Client Tag Classification</span>
                      </div>
                      
                      {}
                      <div className="flex flex-wrap gap-1.5">
                        {selected.tags.map(tag => (
                          <span 
                            key={tag} 
                            className={cn(
                              'text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1.5 uppercase tracking-wider', 
                              TAG_COLORS[tag] || 'bg-muted text-muted-foreground'
                            )}
                          >
                            {tag}
                            <button 
                              onClick={() => handleRemoveTag(tag)}
                              className="text-muted-foreground hover:text-foreground"
                            >
                              <X className="w-2.5 h-2.5" />
                            </button>
                          </span>
                        ))}
                      </div>

                      {}
                      <div className="space-y-2.5 pt-2 border-t border-border/50">
                        <div className="flex gap-2">
                          <input
                            type="text"
                            placeholder="Add new custom tag..."
                            value={tagInput}
                            onChange={(e) => setTagInput(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleAddTag(tagInput)}
                            className="flex-1 px-3 py-1.5 text-xs bg-card border border-border rounded-xl focus:outline-none"
                          />
                          <button
                            onClick={() => handleAddTag(tagInput)}
                            className="px-3 py-1.5 rounded-xl bg-brand-600 dark:bg-brand-500 text-white font-bold text-xs"
                          >
                            Add
                          </button>
                        </div>
                        <div className="flex flex-wrap gap-1">
                          {PRESET_TAGS.filter(t => !selected.tags.includes(t)).map(t => (
                            <button
                              key={t}
                              type="button"
                              onClick={() => handleAddTag(t)}
                              className="text-[9px] font-semibold px-2 py-1 rounded bg-card border border-border text-muted-foreground hover:text-foreground hover:bg-muted"
                            >
                              + {t}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>

                    {}
                    <div className="bg-muted/30 border border-border/80 rounded-2xl p-4 space-y-3">
                      <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">Baking & Chef Preferences</span>
                      <textarea
                        rows={3}
                        defaultValue={selected.notes || ''}
                        onBlur={(e) => {
                          handleSaveNotes(e.target.value)
                          toast.success('Customer notes auto-saved!')
                        }}
                        placeholder="E.g. Prefers eggless cake bases only. Less sugar frosting. Prefers WhatsApp notifications over SMS."
                        className="w-full p-3 text-xs bg-card border border-border rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 resize-none"
                      />
                      <span className="text-[9px] text-muted-foreground italic block">* Click outside notes box to trigger automatic background save.</span>
                    </div>

                    {/* Loyalty rewards status */}
                    <div className="bg-gradient-to-br from-brand-50 to-amber-50 dark:from-brand-950/20 dark:to-amber-950/10 border border-brand-100 dark:border-brand-900/30 rounded-3xl p-5 shadow-sm relative overflow-hidden">
                      {/* Decorative background glow */}
                      <div className="absolute -top-10 -right-10 w-32 h-32 bg-amber-400/10 dark:bg-amber-400/5 rounded-full blur-2xl" />
                      
                      <div className="flex items-center justify-between mb-4 relative z-10">
                        <span className="text-[11px] font-bold text-amber-600 dark:text-amber-500 uppercase tracking-wider flex items-center gap-1.5">
                          <Star className="w-4 h-4 fill-amber-500" />
                          Reward Points
                        </span>
                        <span className="text-sm font-extrabold text-foreground bg-white/50 dark:bg-black/20 px-2.5 py-1 rounded-full border border-white/20 dark:border-white/5 shadow-sm">
                          {selected.loyaltyPoints} <span className="text-muted-foreground font-semibold">Pts</span>
                        </span>
                      </div>
                      
                      <div className="h-3 bg-muted/60 dark:bg-muted/30 rounded-full overflow-hidden border border-white/10 relative z-10">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${Math.min((selected.loyaltyPoints / 2000) * 100, 100)}%` }}
                          transition={{ duration: 1.5, type: 'spring', bounce: 0.2 }}
                          className="h-full bg-gradient-to-r from-amber-400 to-amber-500 rounded-full shadow-[0_0_10px_rgba(251,191,36,0.5)]"
                        />
                      </div>
                      
                      <p className="text-[11px] font-medium text-muted-foreground mt-3 relative z-10">
                        {selected.loyaltyPoints >= 2000 
                          ? <span className="text-emerald-600 dark:text-emerald-400 font-bold">🎉 VIP Tier achieved! Enjoy 15% custom cake discount.</span> 
                          : <span><span className="font-bold text-foreground">{2000 - selected.loyaltyPoints}</span> points to VIP Status</span>}
                      </p>
                    </div>

                  </div>
                )}

                {profileTab === 'history' && (
                  <div className="space-y-3.5 animate-fadeIn">
                    <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">Historic cake orders ({customerOrders.length})</span>
                    
                    {customerOrders.length === 0 ? (
                      <div className="border border-dashed border-border rounded-xl p-6 text-center text-muted-foreground/60">
                        <ShoppingBag className="w-8 h-8 stroke-1 mx-auto mb-2" />
                        <p className="text-xs font-semibold">No orders logged for this client yet</p>
                      </div>
                    ) : (
                      customerOrders.map(o => (
                        <div key={o.id} className="border border-border rounded-xl p-3.5 bg-card flex flex-col justify-between hover:shadow-xs transition-shadow">
                          <div className="flex justify-between items-start">
                            <div>
                              <span className="text-[9px] font-black text-brand-600 dark:text-brand-400 bg-brand-50 dark:bg-brand-950/30 px-1.5 py-0.5 rounded tracking-wider uppercase">{o.orderNumber}</span>
                              <p className="text-xs font-bold text-foreground mt-1.5">{o.items.map(i => `${i.quantity}x ${i.productName}`).join(', ')}</p>
                            </div>
                            <StatusBadge status={o.status} dot />
                          </div>
                          
                          <div className="flex items-center justify-between mt-3 pt-2.5 border-t border-border/50 text-[10px] text-muted-foreground">
                            <span>Delivery: {formatDate(o.deliveryDate)}</span>
                            <span className="font-extrabold text-foreground">{formatCurrency(o.total)}</span>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                )}

                {profileTab === 'timeline' && (
                  <div className="space-y-6 animate-fadeIn pt-2">
                    <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block mb-4">Customer Activity Timeline</span>
                    
                    <div className="relative border-l border-border/80 ml-[11px] space-y-6">
                      {timelineActivities.map((act, index) => {
                        const Icon = act.icon
                        return (
                          <motion.div 
                            key={act.id} 
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className="relative pl-8"
                          >
                            {}
                            <span className={cn(
                              'absolute -left-[13px] top-0.5 w-6 h-6 rounded-full flex items-center justify-center border-2 border-card shadow-sm',
                              act.color
                            )}>
                              <Icon className="w-3 h-3" />
                            </span>
                            
                            <div className="bg-muted/20 border border-border/50 rounded-2xl p-4 shadow-sm hover:shadow-md transition-shadow">
                              <span className="text-[10px] font-bold text-muted-foreground block mb-1 uppercase tracking-wide">{formatDate(act.date)}</span>
                              <h4 className="text-[13px] font-bold text-foreground">{act.title}</h4>
                              <p className="text-[12px] font-medium text-muted-foreground mt-1 leading-snug">{act.desc}</p>
                            </div>
                          </motion.div>
                        )
                      })}
                    </div>
                  </div>
                )}

              </div>

              {}
              <div className="p-5 border-t border-border flex gap-3 bg-muted/20">
                <button
                  onClick={() => { 
                    toast.success('Loading WhatsApp conversation...') 
                    
                  }}
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold transition-colors duration-200"
                >
                  <Phone className="w-4 h-4" /> Message client
                </button>
                <button
                  onClick={() => setShowDelete(true)}
                  className="w-10 h-10 flex items-center justify-center rounded-xl border border-red-200 dark:border-red-900/40 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {}
      <AnimatedModal open={showAdd} onClose={() => setShowAdd(false)} title="Register Customer Profile" description="Add a new client to the CRM system." size="md">
        <div className="p-6 space-y-4">
          {[
            { label: 'Full Client Name *', key: 'name', type: 'text', placeholder: 'e.g. Priya Sharma' },
            { label: 'Phone Number *', key: 'phone', type: 'tel', placeholder: '+91 98765 43210' },
            { label: 'Email Address', key: 'email', type: 'email', placeholder: 'priya@email.com' },
            { label: 'Primary Delivery Address', key: 'address', type: 'text', placeholder: 'Street address' },
            { label: 'Birthday Date', key: 'birthday', type: 'date', placeholder: '' },
          ].map(f => (
            <div key={f.key} className="modal-field">
              <label className="modal-label">{f.label}</label>
              <input
                type={f.type}
                placeholder={f.placeholder}
                value={(form as any)[f.key]}
                onChange={e => setForm(prev => ({ ...prev, [f.key]: e.target.value }))}
                className="modal-input"
              />
            </div>
          ))}
          <div className="modal-field">
            <label className="modal-label">Chef Instruction Notes</label>
            <textarea
              rows={2}
              placeholder="Allergies, preferences..."
              value={form.notes}
              onChange={e => setForm(prev => ({ ...prev, notes: e.target.value }))}
              className="modal-input resize-none"
            />
          </div>
          <div className="flex gap-3 pt-2">
            <button onClick={() => setShowAdd(false)} className="flex-1 py-3 rounded-xl border border-border text-sm font-semibold text-muted-foreground hover:bg-muted hover:text-foreground transition-all duration-150">Discard</button>
            <button onClick={handleAdd} className="flex-[2] py-3 rounded-xl bg-brand-600 dark:bg-brand-500 hover:bg-brand-700 dark:hover:bg-brand-600 text-white text-sm font-bold shadow-lg shadow-brand-500/20 hover:-translate-y-0.5 transition-all duration-200">Register Profile</button>
          </div>
        </div>
      </AnimatedModal>

      {/* --- Edit Customer Modal --- */}
      <AnimatedModal open={showEdit} onClose={() => setShowEdit(false)} title="Edit Customer Details" description="Update this client's profile information." size="md">
        <div className="p-6 space-y-4">
          {[
            { label: 'Full Client Name *', key: 'name', type: 'text' },
            { label: 'Phone Number *', key: 'phone', type: 'tel' },
            { label: 'Email Address', key: 'email', type: 'email' },
            { label: 'Primary Delivery Address', key: 'address', type: 'text' },
            { label: 'Birthday Date', key: 'birthday', type: 'date' },
          ].map(f => (
            <div key={f.key} className="modal-field">
              <label className="modal-label">{f.label}</label>
              <input
                type={f.type}
                value={(editForm as any)[f.key]}
                onChange={e => setEditForm(prev => ({ ...prev, [f.key]: e.target.value }))}
                className="modal-input"
              />
            </div>
          ))}
          <div className="modal-field">
            <label className="modal-label">Chef Instruction Notes</label>
            <textarea
              rows={2}
              value={editForm.notes}
              onChange={e => setEditForm(prev => ({ ...prev, notes: e.target.value }))}
              className="modal-input resize-none"
            />
          </div>
          <div className="flex gap-3 pt-2">
            <button onClick={() => setShowEdit(false)} className="flex-1 py-3 rounded-xl border border-border text-sm font-semibold text-muted-foreground hover:bg-muted hover:text-foreground transition-all duration-150">Cancel</button>
            <button onClick={handleSaveEdit} className="flex-[2] py-3 rounded-xl bg-brand-600 dark:bg-brand-500 hover:bg-brand-700 dark:hover:bg-brand-600 text-white text-sm font-bold shadow-lg shadow-brand-500/20 hover:-translate-y-0.5 transition-all duration-200">Save Changes</button>
          </div>
        </div>
      </AnimatedModal>

      {}
      <AnimatedModal open={showDelete} onClose={() => setShowDelete(false)} title="Delete Customer" size="sm">
        <div className="p-6 space-y-5">
          <div className="flex flex-col items-center text-center gap-3 py-2">
            <div className="w-16 h-16 rounded-2xl bg-red-100 dark:bg-red-950/40 flex items-center justify-center shadow-sm ring-4 ring-red-100/50 dark:ring-red-950/30">
              <Trash2 className="w-7 h-7 text-red-600 dark:text-red-400" />
            </div>
            <div>
              <p className="text-base font-bold text-foreground">Permanently Delete?</p>
              <p className="text-sm text-muted-foreground mt-1">
                <span className="font-semibold text-foreground">{selected?.name}</span>'s profile and all loyalty points will be removed.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-2.5 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/40 rounded-xl p-3.5">
            <span className="text-red-500 text-base flex-shrink-0">⚠️</span>
            <p className="text-xs text-red-700 dark:text-red-400 leading-relaxed">
              This is irreversible. All order history associations and reward points will also be affected.
            </p>
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => setShowDelete(false)}
              className="flex-1 py-3 rounded-xl border border-border text-sm font-semibold text-muted-foreground hover:bg-muted hover:text-foreground transition-all duration-150"
            >
              Keep Profile
            </button>
            <button
              onClick={handleConfirmDelete}
              className="flex-1 py-3 rounded-xl bg-red-600 hover:bg-red-700 active:scale-95 text-white text-sm font-bold shadow-lg shadow-red-500/20 transition-all duration-150"
            >
              Delete Profile
            </button>
          </div>
        </div>
      </AnimatedModal>
    </div>
  )
}
