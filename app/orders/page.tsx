'use client'

import { useEffect, useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import { 
  Plus, Package, MapPin, Calendar, CreditCard, Truck, 
  LayoutGrid, Kanban, Download, Trash2, Edit3, ChevronLeft, ChevronRight, Check, ArrowRight, UserPlus, Info, Cake, Phone
} from 'lucide-react'
import { PageHeader } from '@/components/ui/PageHeader'
import { SearchInput } from '@/components/ui/SearchInput'
import { StatusBadge } from '@/components/ui/StatusBadge'
import { BottomSheet } from '@/components/ui/BottomSheet'
import { EmptyState } from '@/components/ui/EmptyState'
import { CardSkeleton } from '@/components/ui/LoadingSkeleton'
import { staggerContainer, staggerItem } from '@/lib/animations'
import { useAppStore } from '@/store/useAppStore'
import { useMounted } from '@/hooks/useMounted'
import { formatCurrency, formatDate, generateId, generateOrderNumber } from '@/lib/utils'
import productsData from '@/data/products.json'
import type { Order, OrderStatus, PaymentStatus, DeliveryType, Customer, OrderItem } from '@/types'
import toast from 'react-hot-toast'
import { cn } from '@/lib/utils'

const STATUS_TABS: { label: string; value: string }[] = [
  { label: 'All', value: 'all' },
  { label: 'Pending', value: 'pending' },
  { label: 'Confirmed', value: 'confirmed' },
  { label: 'Baking', value: 'baking' },
  { label: 'Ready', value: 'ready' },
  { label: 'Delivered', value: 'delivered' },
  { label: 'Cancelled', value: 'cancelled' },
]

const KANBAN_COLUMNS: { label: string; value: OrderStatus; color: string; border: string; bg: string }[] = [
  { label: 'Pending', value: 'pending', color: 'text-amber-600 dark:text-amber-400', border: 'border-amber-200 dark:border-amber-900/40', bg: 'bg-amber-500/10' },
  { label: 'Confirmed', value: 'confirmed', color: 'text-blue-600 dark:text-blue-400', border: 'border-blue-200 dark:border-blue-900/40', bg: 'bg-blue-500/10' },
  { label: 'Baking', value: 'baking', color: 'text-orange-600 dark:text-orange-400', border: 'border-orange-200 dark:border-orange-900/40', bg: 'bg-orange-500/10' },
  { label: 'Ready', value: 'ready', color: 'text-violet-600 dark:text-violet-400', border: 'border-violet-200 dark:border-violet-900/40', bg: 'bg-violet-500/10' },
  { label: 'Delivered', value: 'delivered', color: 'text-emerald-600 dark:text-emerald-400', border: 'border-emerald-200 dark:border-emerald-900/40', bg: 'bg-emerald-500/10' },
]

export default function OrdersPage() {
  const mounted = useMounted()
  const loading = !mounted
  const [search, setSearch] = useState('')
  const [activeTab, setActiveTab] = useState('all')
  const [viewMode, setViewMode] = useState<'grid' | 'kanban'>('grid')
  
  
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 6

  
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  
  const [orderToEdit, setOrderToEdit] = useState<Order | null>(null)
  const [orderToDelete, setOrderToDelete] = useState<Order | null>(null)

  
  const [dragOverColumn, setDragOverColumn] = useState<string | null>(null)

  const { 
    orders, setOrders, addOrder, updateOrder, deleteOrder, 
    customers, addCustomer, updateCustomer 
  } = useAppStore()

  
  const filtered = useMemo(() => {
    return orders.filter((o) => {
      const matchTab = activeTab === 'all' || o.status === activeTab
      const matchSearch =
        !search ||
        o.customerName.toLowerCase().includes(search.toLowerCase()) ||
        o.orderNumber.toLowerCase().includes(search.toLowerCase()) ||
        o.items.some(i => i.productName.toLowerCase().includes(search.toLowerCase()))
      return matchTab && matchSearch
    })
  }, [orders, search, activeTab])

  
  const paginatedOrders = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage
    return filtered.slice(startIndex, startIndex + itemsPerPage)
  }, [filtered, currentPage])

  const totalPages = Math.ceil(filtered.length / itemsPerPage)

  
  useEffect(() => {
    setCurrentPage(1)
  }, [search, activeTab])

  
  const [isNewCustomer, setIsNewCustomer] = useState(false)
  
  
  const [formCustomerId, setFormCustomerId] = useState('')
  const [formCustName, setFormCustName] = useState('')
  const [formCustPhone, setFormCustPhone] = useState('')
  const [formProductId, setFormProductId] = useState(productsData[0]?.id || '')
  const [formWeight, setFormWeight] = useState('1.0') 
  const [formQty, setFormQty] = useState(1)
  const [formCustomText, setFormCustomText] = useState('')
  const [formDeliveryType, setFormDeliveryType] = useState<DeliveryType>('delivery')
  const [formDeliveryAddress, setFormDeliveryAddress] = useState('')
  const [formDeliveryDate, setFormDeliveryDate] = useState('')
  const [formNotes, setFormNotes] = useState('')
  const [formPaymentStatus, setFormPaymentStatus] = useState<PaymentStatus>('unpaid')

  
  useEffect(() => {
    if (formCustomerId && formCustomerId !== 'new') {
      const cust = customers.find(c => c.id === formCustomerId)
      if (cust) {
        setFormCustName(cust.name)
        setFormCustPhone(cust.phone)
        if (cust.address && !formDeliveryAddress) {
          setFormDeliveryAddress(cust.address)
        }
      }
    }
  }, [formCustomerId, customers])

  
  const selectedProduct = useMemo(() => {
    return productsData.find(p => p.id === formProductId)
  }, [formProductId])

  
  const totals = useMemo(() => {
    if (!selectedProduct) return { subtotal: 0, tax: 0, total: 0, unitPrice: 0 }
    
    
    const weightNum = parseFloat(formWeight) || 1.0
    const basePrice = selectedProduct.price
    const itemPrice = Math.round(basePrice * weightNum)
    
    const subtotal = itemPrice * formQty
    const tax = Math.round(subtotal * 0.05) 
    const total = subtotal + tax

    return { subtotal, tax, total, unitPrice: itemPrice }
  }, [selectedProduct, formWeight, formQty])

  
  function handleCreateOrder() {
    
    if (formCustomerId === 'new' || isNewCustomer) {
      if (!formCustName.trim() || !formCustPhone.trim()) {
        toast.error('Customer name and phone are required')
        return
      }
    } else if (!formCustomerId) {
      toast.error('Please select a customer')
      return
    }

    if (!formDeliveryDate) {
      toast.error('Please select a delivery date')
      return
    }

    if (!selectedProduct) {
      toast.error('Invalid product selected')
      return
    }

    let finalCustomerId = formCustomerId

    
    if (isNewCustomer || formCustomerId === 'new') {
      const newCustId = generateId()
      const newCust: Customer = {
        id: newCustId,
        name: formCustName,
        phone: formCustPhone,
        avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${formCustName}`,
        joinedAt: new Date().toISOString().split('T')[0],
        loyaltyPoints: 100, 
        totalSpent: totals.total,
        orderCount: 1,
        tags: ['New'],
        address: formDeliveryAddress || undefined
      }
      addCustomer(newCust)
      finalCustomerId = newCustId
      toast.success(`Created customer account for ${formCustName}!`)
    } else {
      
      const existing = customers.find(c => c.id === formCustomerId)
      if (existing) {
        const addedPoints = Math.round(totals.total * 0.05) 
        updateCustomer(formCustomerId, {
          orderCount: (existing.orderCount || 0) + 1,
          totalSpent: (existing.totalSpent || 0) + totals.total,
          loyaltyPoints: (existing.loyaltyPoints || 0) + addedPoints
        })
      }
    }

    const orderItem: OrderItem = {
      productId: selectedProduct.id,
      productName: selectedProduct.name,
      quantity: formQty,
      price: totals.unitPrice,
      customization: `${formWeight}kg` + (formCustomText ? ` · Msg: "${formCustomText}"` : '')
    }

    const newOrder: Order = {
      id: generateId(),
      orderNumber: generateOrderNumber(),
      customerId: finalCustomerId,
      customerName: formCustName,
      customerPhone: formCustPhone,
      items: [orderItem],
      status: 'pending',
      paymentStatus: formPaymentStatus,
      deliveryType: formDeliveryType,
      deliveryAddress: formDeliveryType === 'delivery' ? formDeliveryAddress : undefined,
      deliveryDate: formDeliveryDate,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      subtotal: totals.subtotal,
      tax: totals.tax,
      total: totals.total,
      notes: formNotes || undefined
    }

    addOrder(newOrder)
    toast.success(`Created Order ${newOrder.orderNumber}! 🎂`)
    resetCreateForm()
    setShowCreateModal(false)
  }

  function resetCreateForm() {
    setFormCustomerId('')
    setFormCustName('')
    setFormCustPhone('')
    setFormProductId(productsData[0]?.id || '')
    setFormWeight('1.0')
    setFormQty(1)
    setFormCustomText('')
    setFormDeliveryType('delivery')
    setFormDeliveryAddress('')
    setFormDeliveryDate('')
    setFormNotes('')
    setFormPaymentStatus('unpaid')
    setIsNewCustomer(false)
  }

  
  function openEditModal(order: Order) {
    setOrderToEdit(order)
    
    setEditStatus(order.status)
    setEditPaymentStatus(order.paymentStatus)
    setEditDeliveryType(order.deliveryType)
    setEditDeliveryAddress(order.deliveryAddress || '')
    setEditDeliveryDate(order.deliveryDate)
    setEditNotes(order.notes || '')
    
    // Item modifications helper
    const primaryItem = order.items[0]
    if (primaryItem) {
      setEditCustomText(primaryItem.customization || '')
    } else {
      setEditCustomText('')
    }
    
    setShowEditModal(true)
  }

  const [editStatus, setEditStatus] = useState<OrderStatus>('pending')
  const [editPaymentStatus, setEditPaymentStatus] = useState<PaymentStatus>('unpaid')
  const [editDeliveryType, setEditDeliveryType] = useState<DeliveryType>('delivery')
  const [editDeliveryAddress, setEditDeliveryAddress] = useState('')
  const [editDeliveryDate, setEditDeliveryDate] = useState('')
  const [editNotes, setEditNotes] = useState('')
  const [editCustomText, setEditCustomText] = useState('')

  function handleSaveEdit() {
    if (!orderToEdit) return

    const updatedItems = [...orderToEdit.items]
    if (updatedItems[0]) {
      updatedItems[0] = {
        ...updatedItems[0],
        customization: editCustomText
      }
    }

    updateOrder(orderToEdit.id, {
      status: editStatus,
      paymentStatus: editPaymentStatus,
      deliveryType: editDeliveryType,
      deliveryAddress: editDeliveryType === 'delivery' ? editDeliveryAddress : undefined,
      deliveryDate: editDeliveryDate,
      notes: editNotes || undefined,
      items: updatedItems,
      updatedAt: new Date().toISOString()
    })

    toast.success('Order details updated!')
    setShowEditModal(false)
    setOrderToEdit(null)
  }

  
  function triggerDelete(order: Order) {
    setOrderToDelete(order)
    setShowDeleteModal(true)
  }

  function confirmDelete() {
    if (orderToDelete) {
      deleteOrder(orderToDelete.id)
      toast.success(`Deleted order ${orderToDelete.orderNumber}`)
      setShowDeleteModal(false)
      setOrderToDelete(null)
      if (selectedOrder?.id === orderToDelete.id) {
        setSelectedOrder(null)
      }
    }
  }

  
  const handleDragStart = (e: React.DragEvent, id: string) => {
    e.dataTransfer.setData('text/plain', id)
  }

  const handleDragOver = (e: React.DragEvent, column: string) => {
    e.preventDefault()
    setDragOverColumn(column)
  }

  const handleDrop = (e: React.DragEvent, newStatus: OrderStatus) => {
    e.preventDefault()
    setDragOverColumn(null)
    const id = e.dataTransfer.getData('text/plain')
    if (id) {
      const order = orders.find(o => o.id === id)
      if (order) {
        if (order.status === newStatus) return
        updateOrder(id, { status: newStatus, updatedAt: new Date().toISOString() })
        toast.success(`Moved order ${order.orderNumber} to ${newStatus} 🚀`)
      }
    }
  }

  
  function handleStatusUpdate(orderId: string, status: OrderStatus) {
    updateOrder(orderId, { status, updatedAt: new Date().toISOString() })
    toast.success(`Order marked as ${status}`)
    
    if (selectedOrder && selectedOrder.id === orderId) {
      setSelectedOrder({ ...selectedOrder, status })
    }
  }

  
  function exportCSV() {
    if (filtered.length === 0) {
      toast.error('No orders to export!')
      return
    }

    const headers = ['Order Number', 'Customer Name', 'Phone', 'Items', 'Status', 'Payment', 'Type', 'Delivery Date', 'Total (INR)']
    const rows = filtered.map(o => {
      const itemsString = o.items.map(i => `${i.quantity}x ${i.productName} (${i.customization || ''})`).join('; ')
      return [
        o.orderNumber,
        o.customerName,
        o.customerPhone,
        `"${itemsString.replace(/"/g, '""')}"`,
        o.status,
        o.paymentStatus,
        o.deliveryType,
        o.deliveryDate,
        o.total
      ]
    })

    const csvContent = "data:text/csv;charset=utf-8," 
      + [headers.join(','), ...rows.map(e => e.join(','))].join('\n')

    const encodedUri = encodeURI(csvContent)
    const link = document.createElement('a')
    link.setAttribute('href', encodedUri)
    link.setAttribute('download', `SweetFlow_Orders_${new Date().toISOString().split('T')[0]}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    toast.success('CSV Downloaded!')
  }

  return (
    <div className="space-y-5 page-wrapper">
      <PageHeader
        title="Orders & Baking Tracker"
        description="Fulfill cake orders, assign workflow status, and simulate live updates."
        badge={`${orders.length} total`}
        action={
          <div className="flex gap-2">
            <button
              onClick={exportCSV}
              className="flex items-center gap-2 px-3 py-2.5 rounded-xl border border-border bg-card hover:bg-muted text-foreground text-sm font-semibold transition-all duration-200"
              title="Export to CSV"
            >
              <Download className="w-4 h-4" />
              <span className="hidden sm:inline">Export CSV</span>
            </button>
            <button
              onClick={() => setShowCreateModal(true)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-brand-600 dark:bg-brand-500 hover:bg-brand-700 dark:hover:bg-brand-600 text-white text-sm font-semibold shadow-sm transition-all duration-200 hover:-translate-y-[0.5px]"
            >
              <Plus className="w-4 h-4" />
              New Order
            </button>
          </div>
        }
      />

      {}
      <div className="bg-card border border-border rounded-2xl p-3 sm:p-4 flex flex-row items-center justify-between gap-3 sm:gap-4 shadow-sm">
        <div className="flex-1 min-w-0">
          <SearchInput
            placeholder="Search orders..."
            value={search}
            onChange={setSearch}
          />
        </div>

        <div className="flex items-center justify-end gap-2 border-l border-border pl-3 sm:pl-4 shrink-0">
          <span className="text-xs font-medium text-muted-foreground hidden lg:inline">View Mode:</span>
          <div className="bg-muted p-1 rounded-xl flex gap-0.5">
            <button
              onClick={() => setViewMode('grid')}
              className={cn(
                'p-2 rounded-lg transition-all duration-200',
                viewMode === 'grid' ? 'bg-card text-brand-600 dark:text-brand-400 shadow-sm' : 'text-muted-foreground hover:text-foreground'
              )}
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('kanban')}
              className={cn(
                'p-2 rounded-lg transition-all duration-200',
                viewMode === 'kanban' ? 'bg-card text-brand-600 dark:text-brand-400 shadow-sm' : 'text-muted-foreground hover:text-foreground'
              )}
            >
              <Kanban className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {}
      {viewMode === 'grid' && (
        <div className="flex gap-1.5 overflow-x-auto scrollbar-thin pb-1">
          {STATUS_TABS.map((tab) => {
            const count = tab.value === 'all' ? orders.length : orders.filter(o => o.status === tab.value).length
            return (
              <button
                key={tab.value}
                onClick={() => setActiveTab(tab.value)}
                className={cn(
                  'flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all duration-200',
                  activeTab === tab.value
                    ? 'bg-brand-600 dark:bg-brand-500 text-white shadow-sm'
                    : 'bg-card border border-border text-muted-foreground hover:bg-muted hover:text-foreground'
                )}
              >
                {tab.label}
                <span className={cn(
                  'text-[10px] px-1.5 py-0.5 rounded-full font-bold ml-1',
                  activeTab === tab.value ? 'bg-white/20 text-white' : 'bg-muted text-muted-foreground'
                )}>
                  {count}
                </span>
              </button>
            )
          })}
        </div>
      )}

      {}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => <CardSkeleton key={i} />)}
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState
          emoji="🍰"
          title="No cake orders found"
          description="Try adjusting your filter, search keywords, or create a brand new custom order."
        />
      ) : (
        <>
          {}
          <div className="lg:hidden space-y-4">
            <motion.div
              variants={staggerContainer}
              initial="hidden"
              animate="visible"
              className="flex flex-col gap-3"
            >
              {paginatedOrders.map((order) => {
                let nextActionText = ''
                let nextActionStatus: OrderStatus | null = null
                let actionColor = ''
                let ActionIcon = null
                
                if (order.status === 'pending') { nextActionText = 'Confirm'; nextActionStatus = 'confirmed'; actionColor = 'bg-blue-500/10 text-blue-600 dark:text-blue-400'; ActionIcon = Check }
                else if (order.status === 'confirmed') { nextActionText = 'Bake'; nextActionStatus = 'baking'; actionColor = 'bg-orange-500/10 text-orange-600 dark:text-orange-400'; ActionIcon = Cake }
                else if (order.status === 'baking') { nextActionText = 'Ready'; nextActionStatus = 'ready'; actionColor = 'bg-violet-500/10 text-violet-600 dark:text-violet-400'; ActionIcon = Check }
                else if (order.status === 'ready') { nextActionText = 'Deliver'; nextActionStatus = 'delivered'; actionColor = 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'; ActionIcon = Truck }

                return (
                  <motion.div
                    key={order.id}
                    variants={staggerItem}
                    className="relative touch-pan-y"
                  >
                    {}
                    <div className="absolute inset-y-0 right-0 w-1/2 bg-emerald-500/10 rounded-3xl flex items-center justify-end px-6 z-0">
                      <span className="text-emerald-600 dark:text-emerald-400 font-bold text-sm flex items-center gap-1.5">
                        Advance <ArrowRight className="w-4 h-4" />
                      </span>
                    </div>

                    <motion.div
                      drag="x"
                      dragConstraints={{ left: -100, right: 0 }}
                      dragElastic={0.2}
                      onDragEnd={(e, info) => {
                        if (info.offset.x < -60 && nextActionStatus) {
                          handleStatusUpdate(order.id, nextActionStatus)
                        }
                      }}
                      whileTap={{ scale: 0.98 }}
                      onClick={(e) => {
                        
                        const isDragging = (e.target as HTMLElement).closest('.dragging')
                        if (!isDragging) {
                          setSelectedOrder(order)
                        }
                      }}
                      className="bg-card/80 backdrop-blur-xl border border-white/20 dark:border-white/5 rounded-3xl p-5 relative z-10 shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.1)] transition-shadow flex flex-col gap-3"
                    >
                      {}
                      <div className="flex justify-between items-start">
                        <div className="flex gap-3 items-center">
                          <div className={cn(
                            "w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm border",
                            order.paymentStatus === 'paid' 
                              ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20' 
                              : 'bg-amber-500/10 text-amber-600 border-amber-500/20'
                          )}>
                            {order.customerName.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-bold text-[15px] leading-tight text-foreground">{order.customerName}</p>
                            <p className="text-[11px] font-medium text-muted-foreground mt-0.5 tracking-wide uppercase">#{order.orderNumber}</p>
                          </div>
                        </div>
                        <StatusBadge status={order.status} dot />
                      </div>

                      {}
                      <div className="bg-muted/40 rounded-2xl p-3.5 space-y-2 mt-1">
                        {order.items.map((item, i) => (
                          <div key={i} className="flex justify-between items-start text-sm">
                            <div className="flex-1">
                              <span className="font-semibold text-foreground/90">{item.quantity}x {item.productName}</span>
                              {item.customization && (
                                <span className="block text-[11px] text-muted-foreground mt-0.5 pr-2">
                                  🎨 {item.customization}
                                </span>
                              )}
                            </div>
                            <span className="font-bold text-foreground">{formatCurrency(item.price * item.quantity)}</span>
                          </div>
                        ))}
                      </div>

                      {}
                      <div className="flex items-center justify-between mt-2">
                        <div className="flex items-center gap-2.5 text-[12px] font-semibold text-muted-foreground">
                          <div className="flex items-center gap-1.5">
                            <Calendar className="w-3.5 h-3.5" />
                            {formatDate(order.deliveryDate).split(',')[0]}
                          </div>
                          <span className="text-border">•</span>
                          <div className="flex items-center gap-1.5">
                            {order.deliveryType === 'delivery' ? <Truck className="w-3.5 h-3.5" /> : <Package className="w-3.5 h-3.5" />}
                            <span className="capitalize">{order.deliveryType}</span>
                          </div>
                        </div>
                        
                        {}
                        {nextActionStatus && ActionIcon && (
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              handleStatusUpdate(order.id, nextActionStatus!);
                            }}
                            className={cn(
                              "flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-[11px] font-bold transition-transform active:scale-95",
                              actionColor
                            )}
                          >
                            <ActionIcon className="w-3.5 h-3.5" />
                            {nextActionText}
                          </button>
                        )}
                      </div>
                    </motion.div>
                  </motion.div>
                )
              })}
            </motion.div>

            {}
            {totalPages > 1 && (
              <div className="flex items-center justify-between bg-card border border-border/60 rounded-xl px-4 py-3">
                <p className="text-[10px] text-muted-foreground">
                  <span className="font-bold text-foreground">{(currentPage - 1) * itemsPerPage + 1}</span>-
                  <span className="font-bold text-foreground">
                    {Math.min(currentPage * itemsPerPage, filtered.length)}
                  </span>{' '}
                  of {filtered.length}
                </p>
                <div className="flex gap-1">
                  <button
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    className="p-1.5 rounded-lg border border-border hover:bg-muted disabled:opacity-40"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    disabled={currentPage === totalPages}
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    className="p-1.5 rounded-lg border border-border hover:bg-muted disabled:opacity-40"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </div>

          {}
          <div className="hidden lg:block space-y-4">
            {viewMode === 'grid' ? (
              <>
                <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-muted/50 border-b border-border">
                        <th className="p-4 font-bold text-muted-foreground">Order #</th>
                        <th className="p-4 font-bold text-muted-foreground">Customer</th>
                        <th className="p-4 font-bold text-muted-foreground">Product Details</th>
                        <th className="p-4 font-bold text-muted-foreground">Logistics</th>
                        <th className="p-4 font-bold text-muted-foreground">Status</th>
                        <th className="p-4 font-bold text-muted-foreground">Payment</th>
                        <th className="p-4 font-bold text-muted-foreground">Total</th>
                        <th className="p-4 font-bold text-muted-foreground text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {paginatedOrders.map((order) => (
                        <tr key={order.id} className="border-b border-border/60 last:border-0 hover:bg-muted/20 transition-colors">
                          <td className="p-4 font-bold text-brand-600 dark:text-brand-400">
                            {order.orderNumber}
                          </td>
                          <td className="p-4">
                            <p className="font-bold text-foreground">{order.customerName}</p>
                            <p className="text-[10px] text-muted-foreground mt-0.5">{order.customerPhone}</p>
                          </td>
                          <td className="p-4">
                            {order.items.map((item, idx) => (
                              <div key={idx} className="space-y-0.5">
                                <p className="font-semibold text-foreground">{item.quantity}x {item.productName}</p>
                                {item.customization && (
                                  <p className="text-[10px] text-brand-500 font-medium">🎨 {item.customization}</p>
                                )}
                              </div>
                            ))}
                          </td>
                          <td className="p-4">
                            <div className="flex items-center gap-1.5 text-foreground font-medium">
                              <span className="capitalize">{order.deliveryType}</span>
                            </div>
                            <p className="text-[10px] text-muted-foreground mt-0.5">{formatDate(order.deliveryDate).split(',')[0]}</p>
                          </td>
                          <td className="p-4">
                            <StatusBadge status={order.status} dot />
                          </td>
                          <td className="p-4">
                            <StatusBadge status={order.paymentStatus} size="sm" />
                          </td>
                          <td className="p-4 font-bold text-foreground">
                            {formatCurrency(order.total)}
                          </td>
                          <td className="p-4 text-right">
                            <div className="flex justify-end gap-1.5">
                              <button
                                onClick={() => setSelectedOrder(order)}
                                className="p-1.5 rounded-lg bg-muted hover:bg-muted/80 text-muted-foreground hover:text-foreground transition-colors"
                                title="View details"
                              >
                                <Info className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => openEditModal(order)}
                                className="p-1.5 rounded-lg bg-muted hover:bg-muted/80 text-muted-foreground hover:text-foreground transition-colors"
                                title="Edit Order"
                              >
                                <Edit3 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => triggerDelete(order)}
                                className="p-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-600 dark:text-red-400 transition-colors"
                                title="Delete Order"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {}
                {totalPages > 1 && (
                  <div className="flex items-center justify-between bg-card border border-border/60 rounded-xl px-4 py-3 shadow-sm">
                    <p className="text-xs text-muted-foreground">
                      Showing <span className="font-bold text-foreground">{(currentPage - 1) * itemsPerPage + 1}</span> to{' '}
                      <span className="font-bold text-foreground">
                        {Math.min(currentPage * itemsPerPage, filtered.length)}
                      </span>{' '}
                      of <span className="font-bold text-foreground">{filtered.length}</span> orders
                    </p>
                    <div className="flex gap-1">
                      <button
                        disabled={currentPage === 1}
                        onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                        className="p-2 rounded-lg border border-border hover:bg-muted disabled:opacity-40 text-xs font-semibold flex items-center gap-1 transition-all"
                      >
                        <ChevronLeft className="w-4 h-4" /> Previous
                      </button>
                      <button
                        disabled={currentPage === totalPages}
                        onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                        className="p-2 rounded-lg border border-border hover:bg-muted disabled:opacity-40 text-xs font-semibold flex items-center gap-1 transition-all"
                      >
                        Next <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                )}
              </>
            ) : (
                            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4 min-h-[500px]">
                {KANBAN_COLUMNS.map((col) => {
                  const colOrders = filtered.filter(o => o.status === col.value)
                  const isOver = dragOverColumn === col.value
                  
                  return (
                    <div
                      key={col.value}
                      onDragOver={(e) => handleDragOver(e, col.value)}
                      onDragLeave={() => setDragOverColumn(null)}
                      onDrop={(e) => handleDrop(e, col.value)}
                      className={cn(
                        "flex flex-col bg-muted/30 border border-border/80 rounded-2xl p-3 transition-all duration-200 min-h-[450px]",
                        isOver && "border-brand-500/50 bg-brand-50/5 dark:bg-brand-950/5 ring-2 ring-brand-500/20"
                      )}
                    >
                      {}
                      <div className="flex items-center justify-between mb-3 pb-2 border-b border-border/60">
                        <div className="flex items-center gap-1.5">
                          <span className={cn("text-xs font-bold capitalize", col.color)}>{col.label}</span>
                          <span className="text-[10px] font-bold bg-muted px-1.5 py-0.5 rounded-full text-muted-foreground">
                            {colOrders.length}
                          </span>
                        </div>
                      </div>

                      {}
                      <div className="flex-1 space-y-2.5 overflow-y-auto scrollbar-none max-h-[600px] pb-4">
                        {colOrders.length === 0 ? (
                          <div className="flex flex-col items-center justify-center h-32 border-2 border-dashed border-border/60 rounded-xl text-muted-foreground/60 text-xs font-medium">
                            <span>Drop cards here</span>
                          </div>
                        ) : (
                          colOrders.map((order) => (
                            <div
                              key={order.id}
                              draggable
                              onDragStart={(e) => handleDragStart(e, order.id)}
                              onClick={() => setSelectedOrder(order)}
                              className="bg-card border border-border/80 rounded-xl p-3 hover:shadow-md transition-all duration-150 cursor-grab active:cursor-grabbing group relative overflow-hidden"
                            >
                              {}
                              <div className={cn(
                                "absolute left-0 top-0 bottom-0 w-1",
                                order.paymentStatus === 'paid' ? 'bg-emerald-500' : 'bg-amber-500'
                              )} />

                              <div className="flex items-start justify-between mb-2 pl-1.5">
                                <span className="text-[9px] font-bold text-brand-600 dark:text-brand-400 uppercase tracking-wider">
                                  {order.orderNumber}
                                </span>
                                <StatusBadge status={order.paymentStatus} size="sm" />
                              </div>

                              <p className="text-xs font-bold text-foreground pl-1.5 line-clamp-1">{order.customerName}</p>

                              <div className="space-y-0.5 my-2.5 pl-1.5">
                                {order.items.map((item, i) => (
                                  <div key={i} className="text-[10px] text-muted-foreground font-medium flex items-center justify-between">
                                    <span className="truncate max-w-[100px]">{item.productName}</span>
                                    <span className="font-semibold">{item.quantity}x</span>
                                  </div>
                                ))}
                              </div>

                              <div className="pt-2 border-t border-border/40 flex items-center justify-between pl-1.5">
                                <span className="text-[9px] text-muted-foreground font-medium">
                                  {formatDate(order.deliveryDate).split(',')[0]}
                                </span>
                                <span className="text-xs font-bold text-brand-600 dark:text-brand-400">
                                  {formatCurrency(order.total)}
                                </span>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </>
      )}

      {}
      <BottomSheet
        open={!!selectedOrder}
        onClose={() => setSelectedOrder(null)}
        title={`Order ${selectedOrder?.orderNumber}`}
        description={`Placed ${selectedOrder ? formatDate(selectedOrder.createdAt) : ''}`}
        size="xl"
      >
        {selectedOrder && (
          <div className="p-6 space-y-6">
            <div className="flex items-center justify-between border-b border-border pb-4">
              <div className="flex gap-2">
                <StatusBadge status={selectedOrder.status} dot />
                <StatusBadge status={selectedOrder.paymentStatus} dot />
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => openEditModal(selectedOrder)}
                  className="flex items-center gap-1 text-xs px-2.5 py-1 rounded bg-muted hover:bg-muted/80 text-foreground transition-colors"
                >
                  <Edit3 className="w-3.5 h-3.5" /> Edit
                </button>
                <button
                  onClick={() => triggerDelete(selectedOrder)}
                  className="flex items-center gap-1 text-xs px-2.5 py-1 rounded bg-red-500/10 hover:bg-red-500/20 text-red-600 dark:text-red-400 transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" /> Delete
                </button>
              </div>
            </div>

            {}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-muted/30 border border-border/80 rounded-xl p-4">
              <div>
                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Client details</span>
                <p className="text-sm font-bold text-foreground mt-1">{selectedOrder.customerName}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{selectedOrder.customerPhone}</p>
              </div>
              <div>
                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Delivery Logistics</span>
                <div className="flex items-center gap-1.5 text-xs text-foreground mt-1.5">
                  <Truck className="w-3.5 h-3.5 text-brand-500" />
                  <span className="capitalize">{selectedOrder.deliveryType}</span>
                </div>
                {selectedOrder.deliveryAddress && (
                  <p className="text-xs text-muted-foreground mt-1 pl-5">{selectedOrder.deliveryAddress}</p>
                )}
              </div>
            </div>

            {}
            <div>
              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block mb-3">Cake Products & custom modifications</span>
              <div className="border border-border rounded-xl overflow-hidden bg-card">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-muted/50 border-b border-border">
                      <th className="p-3 font-bold text-muted-foreground">Product</th>
                      <th className="p-3 font-bold text-muted-foreground text-center">Qty</th>
                      <th className="p-3 font-bold text-muted-foreground text-right">Price</th>
                      <th className="p-3 font-bold text-muted-foreground text-right">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedOrder.items.map((item, i) => (
                      <tr key={i} className="border-b border-border last:border-0 hover:bg-muted/20">
                        <td className="p-3">
                          <p className="font-semibold text-foreground">{item.productName}</p>
                          {item.customization && (
                            <p className="text-[10px] text-brand-600 dark:text-brand-400 mt-0.5">🎨 {item.customization}</p>
                          )}
                        </td>
                        <td className="p-3 text-center font-medium text-foreground">{item.quantity}</td>
                        <td className="p-3 text-right font-medium text-muted-foreground">{formatCurrency(item.price)}</td>
                        <td className="p-3 text-right font-bold text-foreground">{formatCurrency(item.price * item.quantity)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {}
            <div className="bg-muted/30 border border-border/80 rounded-xl p-4 ml-auto max-w-sm space-y-2.5">
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Subtotal</span>
                <span className="font-semibold text-foreground">{formatCurrency(selectedOrder.subtotal)}</span>
              </div>
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>GST / Taxes (5%)</span>
                <span className="font-semibold text-foreground">{formatCurrency(selectedOrder.tax)}</span>
              </div>
              <div className="flex justify-between text-sm font-bold border-t border-border/80 pt-2 text-foreground">
                <span>Total Amount</span>
                <span className="text-brand-600 dark:text-brand-400">{formatCurrency(selectedOrder.total)}</span>
              </div>
            </div>

            {selectedOrder.notes && (
              <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/40 rounded-xl p-4">
                <span className="text-[10px] font-bold text-amber-700 dark:text-amber-400 uppercase tracking-wider block mb-1">📝 Baking & chef notes</span>
                <p className="text-xs text-foreground font-medium">{selectedOrder.notes}</p>
              </div>
            )}

            {}
            <div className="flex items-center gap-2 border-t border-border pt-4 justify-between">
              <span className="text-xs text-muted-foreground font-semibold">Advance status stage:</span>
              <div className="flex gap-1.5 flex-wrap">
                {selectedOrder.status !== 'delivered' && selectedOrder.status !== 'cancelled' && (
                  <>
                    {selectedOrder.status === 'pending' && (
                      <button
                        onClick={() => handleStatusUpdate(selectedOrder.id, 'confirmed')}
                        className="px-3 py-1.5 text-xs font-bold rounded-xl bg-blue-600 hover:bg-blue-700 text-white transition-colors"
                      >
                        Confirm Order
                      </button>
                    )}
                    {selectedOrder.status === 'confirmed' && (
                      <button
                        onClick={() => handleStatusUpdate(selectedOrder.id, 'baking')}
                        className="px-3 py-1.5 text-xs font-bold rounded-xl bg-orange-600 hover:bg-orange-700 text-white transition-colors"
                      >
                        Start Baking 👨‍🍳
                      </button>
                    )}
                    {selectedOrder.status === 'baking' && (
                      <button
                        onClick={() => handleStatusUpdate(selectedOrder.id, 'ready')}
                        className="px-3 py-1.5 text-xs font-bold rounded-xl bg-violet-600 hover:bg-violet-700 text-white transition-colors"
                      >
                        Mark Ready 🎂
                      </button>
                    )}
                    {selectedOrder.status === 'ready' && (
                      <button
                        onClick={() => handleStatusUpdate(selectedOrder.id, 'delivered')}
                        className="px-3 py-1.5 text-xs font-bold rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white transition-colors"
                      >
                        Mark Delivered 🚚
                      </button>
                    )}
                  </>
                )}
                {selectedOrder.status !== 'cancelled' && selectedOrder.status !== 'delivered' && (
                  <button
                    onClick={() => handleStatusUpdate(selectedOrder.id, 'cancelled')}
                    className="px-3 py-1.5 text-xs font-bold rounded-xl bg-muted border border-red-200 dark:border-red-900/40 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors"
                  >
                    Cancel Order
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </BottomSheet>

      {}
      <BottomSheet
        open={showCreateModal}
        onClose={() => {
          setShowCreateModal(false)
          resetCreateForm()
        }}
        title="Create New Order"
        description="Fill in the details below to add a new cake order."
        size="lg"
      >
        <div className="p-6 space-y-8">
          {}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                <UserPlus className="w-4 h-4 text-brand-500" />
                Customer Information
              </h3>
              
              {}
              <div className="bg-muted p-1 rounded-xl flex items-center">
                <button
                  type="button"
                  onClick={() => {
                    setIsNewCustomer(false)
                    setFormCustomerId('')
                  }}
                  className={cn(
                    "px-3 py-1.5 text-xs font-bold rounded-lg transition-all",
                    !isNewCustomer ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  Existing
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsNewCustomer(true)
                    setFormCustomerId('new')
                  }}
                  className={cn(
                    "px-3 py-1.5 text-xs font-bold rounded-lg transition-all",
                    isNewCustomer ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  New Client
                </button>
              </div>
            </div>

            <div className="bg-muted/30 border border-border/80 rounded-2xl p-4">
              {isNewCustomer ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Full Name *</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <UserPlus className="h-4 w-4 text-muted-foreground" />
                      </div>
                      <input
                        type="text"
                        placeholder="e.g. Priyanth Sen"
                        value={formCustName}
                        onChange={(e) => setFormCustName(e.target.value)}
                        className="w-full pl-9 pr-4 py-2.5 text-sm bg-card border border-border rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all"
                      />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Phone Number *</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Phone className="h-4 w-4 text-muted-foreground" />
                      </div>
                      <input
                        type="tel"
                        placeholder="e.g. +91 98865 44321"
                        value={formCustPhone}
                        onChange={(e) => setFormCustPhone(e.target.value)}
                        className="w-full pl-9 pr-4 py-2.5 text-sm bg-card border border-border rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all"
                      />
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-1.5 animate-in fade-in slide-in-from-bottom-2 duration-300">
                  <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Select Customer *</label>
                  <select
                    value={formCustomerId}
                    onChange={(e) => {
                      const val = e.target.value
                      setFormCustomerId(val)
                      if (val === 'new') {
                        setIsNewCustomer(true)
                        setFormCustName('')
                        setFormCustPhone('')
                      }
                    }}
                    className="w-full px-4 py-2.5 text-sm bg-card border border-border rounded-xl text-foreground focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all appearance-none"
                  >
                    <option value="">-- Choose Client Profile --</option>
                    {customers.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name} ({c.phone})
                      </option>
                    ))}
                    <option value="new">+ Create Custom Client</option>
                  </select>
                </div>
              )}
            </div>
          </div>

          {/* Section 2: Order Details */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
              <Cake className="w-4 h-4 text-brand-500" />
              Product Details
            </h3>
            
            <div className="bg-muted/30 border border-border/80 rounded-2xl p-4 space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Base Product *</label>
                  <select
                    value={formProductId}
                    onChange={(e) => setFormProductId(e.target.value)}
                    className="w-full px-4 py-2.5 text-sm bg-card border border-border rounded-xl text-foreground focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all appearance-none"
                  >
                    {productsData.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name} - ({formatCurrency(p.price)})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Quantity</label>
                  <div className="flex items-center gap-3">
                    <button type="button" onClick={() => setFormQty(Math.max(1, formQty - 1))} className="w-10 h-10 rounded-xl bg-card border border-border flex items-center justify-center text-foreground hover:bg-muted transition-colors">-</button>
                    <span className="w-8 text-center font-bold text-lg text-foreground">{formQty}</span>
                    <button type="button" onClick={() => setFormQty(formQty + 1)} className="w-10 h-10 rounded-xl bg-card border border-border flex items-center justify-center text-foreground hover:bg-muted transition-colors">+</button>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Weight (Kg) *</label>
                <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                  {['0.5', '1.0', '1.5', '2.0', '3.0', '5.0'].map(w => (
                    <button
                      key={w}
                      type="button"
                      onClick={() => setFormWeight(w)}
                      className={cn(
                        "py-2 rounded-xl text-xs font-bold border transition-all duration-200",
                        formWeight === w 
                          ? "bg-brand-600 border-brand-600 text-white shadow-md shadow-brand-500/20 scale-105" 
                          : "bg-card border-border text-muted-foreground hover:bg-muted hover:text-foreground"
                      )}
                    >
                      {w}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Custom Writing on Cake</label>
                <input
                  type="text"
                  placeholder='e.g. "Happy Birthday Sneha!"'
                  value={formCustomText}
                  onChange={(e) => setFormCustomText(e.target.value)}
                  className="w-full px-4 py-2.5 text-sm bg-card border border-border rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all"
                />
              </div>
            </div>
          </div>

          {}
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
              <Truck className="w-4 h-4 text-brand-500" />
              Delivery & Schedule
            </h3>
            
            <div className="bg-muted/30 border border-border/80 rounded-2xl p-4 space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Delivery Type *</label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setFormDeliveryType('delivery')}
                      className={cn(
                        'flex flex-col items-center justify-center p-3 rounded-xl border-2 transition-all duration-200',
                        formDeliveryType === 'delivery'
                          ? 'bg-brand-50/50 dark:bg-brand-500/10 border-brand-600 text-brand-700 dark:text-brand-400 shadow-sm'
                          : 'bg-card border-border hover:bg-muted text-muted-foreground'
                      )}
                    >
                      <Truck className="w-5 h-5 mb-1" />
                      <span className="text-[11px] font-bold">Delivery</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setFormDeliveryType('pickup')}
                      className={cn(
                        'flex flex-col items-center justify-center p-3 rounded-xl border-2 transition-all duration-200',
                        formDeliveryType === 'pickup'
                          ? 'bg-brand-50/50 dark:bg-brand-500/10 border-brand-600 text-brand-700 dark:text-brand-400 shadow-sm'
                          : 'bg-card border-border hover:bg-muted text-muted-foreground'
                      )}
                    >
                      <Package className="w-5 h-5 mb-1" />
                      <span className="text-[11px] font-bold">Pickup</span>
                    </button>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Delivery Date *</label>
                  <input
                    type="date"
                    value={formDeliveryDate}
                    onChange={(e) => setFormDeliveryDate(e.target.value)}
                    className="w-full px-4 py-[18px] text-sm bg-card border border-border rounded-xl text-foreground focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all"
                  />
                </div>
              </div>

              {formDeliveryType === 'delivery' && (
                <div className="space-y-1.5 animate-in fade-in slide-in-from-top-2 duration-300">
                  <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Delivery Address *</label>
                  <div className="relative">
                    <div className="absolute top-3 left-3 flex items-start pointer-events-none">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <textarea
                      rows={2}
                      placeholder="Street details, building and PIN code"
                      value={formDeliveryAddress}
                      onChange={(e) => setFormDeliveryAddress(e.target.value)}
                      className="w-full pl-9 pr-4 py-2.5 text-sm bg-card border border-border rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all resize-none"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>

          {}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                <Info className="w-3.5 h-3.5" /> Chef Notes
              </label>
              <textarea
                rows={3}
                placeholder="Allergies, packaging preferences..."
                value={formNotes}
                onChange={(e) => setFormNotes(e.target.value)}
                className="w-full px-4 py-2.5 text-sm bg-muted/40 border border-border rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all resize-none"
              />
            </div>
            
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                <CreditCard className="w-3.5 h-3.5" /> Initial Payment
              </label>
              <div className="flex flex-col gap-2">
                {(['unpaid', 'partial', 'paid'] as PaymentStatus[]).map((state) => (
                  <button
                    key={state}
                    type="button"
                    onClick={() => setFormPaymentStatus(state)}
                    className={cn(
                      'py-2.5 px-4 rounded-xl border text-xs font-bold capitalize transition-all duration-200 flex items-center justify-between',
                      formPaymentStatus === state
                        ? state === 'paid' ? 'bg-emerald-600 border-emerald-600 text-white shadow-md shadow-emerald-500/20' 
                          : state === 'partial' ? 'bg-orange-500 border-orange-500 text-white shadow-md shadow-orange-500/20' 
                          : 'bg-red-500 border-red-500 text-white shadow-md shadow-red-500/20'
                        : 'bg-card border-border text-muted-foreground hover:bg-muted'
                    )}
                  >
                    {state}
                    {formPaymentStatus === state && <Check className="w-4 h-4" />}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {}
          <div className="relative overflow-hidden bg-gradient-to-br from-brand-600 to-brand-800 dark:from-brand-500 dark:to-brand-700 rounded-2xl p-5 sm:p-6 text-white shadow-xl shadow-brand-500/20">
            {}
            <div className="absolute -top-10 -right-10 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
            <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
            
            <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center">
                  <Cake className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="text-sm font-medium text-white/80">Estimated Total</p>
                  <p className="text-xs text-white/60 mt-0.5">Unit: {formatCurrency(totals.unitPrice)} × {formQty} (Inc. 5% GST)</p>
                </div>
              </div>
              <p className="text-3xl font-black tracking-tight">{formatCurrency(totals.total)}</p>
            </div>
          </div>

          {}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={() => {
                setShowCreateModal(false)
                resetCreateForm()
              }}
              className="flex-1 py-3.5 rounded-xl bg-muted hover:bg-muted/80 text-foreground font-bold transition-all duration-200"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleCreateOrder}
              className="flex-[2] py-3.5 rounded-xl bg-brand-600 dark:bg-brand-500 hover:bg-brand-700 dark:hover:bg-brand-600 text-white font-bold shadow-lg shadow-brand-500/25 hover:shadow-brand-500/40 hover:-translate-y-0.5 transition-all duration-200"
            >
              Confirm & Create Order
            </button>
          </div>
        </div>
      </BottomSheet>

      {}
      <BottomSheet
        open={showEditModal}
        onClose={() => {
          setShowEditModal(false)
          setOrderToEdit(null)
        }}
        title={`Edit Order ${orderToEdit?.orderNumber}`}
        description="Modify status, logistics, and customization details."
        size="md"
      >
        <div className="p-6 space-y-5">

          {}
          <div className="modal-section space-y-4">
            <p className="modal-section-title">
              <span className="w-2 h-2 rounded-full bg-brand-500 inline-block" />
              Workflow Status
            </p>
            <div className="grid grid-cols-2 gap-4">
              <div className="modal-field">
                <label className="modal-label">Order Status</label>
                <select
                  value={editStatus}
                  onChange={(e) => setEditStatus(e.target.value as OrderStatus)}
                  className="modal-select"
                >
                  <option value="pending">⏳ Pending</option>
                  <option value="confirmed">✅ Confirmed</option>
                  <option value="baking">🔥 Baking</option>
                  <option value="ready">🎂 Ready</option>
                  <option value="delivered">🚚 Delivered</option>
                  <option value="cancelled">❌ Cancelled</option>
                </select>
              </div>
              <div className="modal-field">
                <label className="modal-label">Payment Status</label>
                <select
                  value={editPaymentStatus}
                  onChange={(e) => setEditPaymentStatus(e.target.value as PaymentStatus)}
                  className="modal-select"
                >
                  <option value="unpaid">🔴 Unpaid</option>
                  <option value="partial">🟡 Partial</option>
                  <option value="paid">🟢 Paid</option>
                </select>
              </div>
            </div>
          </div>

          {}
          <div className="modal-section space-y-4">
            <p className="modal-section-title">
              <span className="w-2 h-2 rounded-full bg-violet-500 inline-block" />
              Delivery & Logistics
            </p>
            <div className="grid grid-cols-2 gap-4">
              <div className="modal-field">
                <label className="modal-label">Delivery Mode</label>
                <select
                  value={editDeliveryType}
                  onChange={(e) => setEditDeliveryType(e.target.value as DeliveryType)}
                  className="modal-select"
                >
                  <option value="delivery">🚚 Home Delivery</option>
                  <option value="pickup">📦 Self Pickup</option>
                </select>
              </div>
              <div className="modal-field">
                <label className="modal-label">Delivery Date</label>
                <input
                  type="date"
                  value={editDeliveryDate}
                  onChange={(e) => setEditDeliveryDate(e.target.value)}
                  className="modal-input"
                />
              </div>
            </div>
            {editDeliveryType === 'delivery' && (
              <div className="modal-field animate-fade-in">
                <label className="modal-label">Delivery Address</label>
                <input
                  type="text"
                  value={editDeliveryAddress}
                  onChange={(e) => setEditDeliveryAddress(e.target.value)}
                  className="modal-input"
                  placeholder="Street, building, PIN code..."
                />
              </div>
            )}
          </div>

          {}
          <div className="modal-section space-y-4">
            <p className="modal-section-title">
              <span className="w-2 h-2 rounded-full bg-amber-500 inline-block" />
              Cake Details
            </p>
            <div className="modal-field">
              <label className="modal-label">Cake Specifications & Writing</label>
              <input
                type="text"
                value={editCustomText}
                onChange={(e) => setEditCustomText(e.target.value)}
                className="modal-input"
                placeholder="e.g. 1kg · Msg: Happy Birthday Sneha!"
              />
            </div>
            <div className="modal-field">
              <label className="modal-label">Baking & Kitchen Instructions</label>
              <textarea
                rows={3}
                value={editNotes}
                onChange={(e) => setEditNotes(e.target.value)}
                className="modal-input resize-none"
                placeholder="Allergies, dietary requirements..."
              />
            </div>
          </div>

          {}
          <div className="flex gap-3 pt-1">
            <button
              onClick={() => {
                setShowEditModal(false)
                setOrderToEdit(null)
              }}
              className="flex-1 py-3 rounded-xl border border-border text-sm font-semibold text-muted-foreground hover:bg-muted hover:text-foreground transition-all duration-150"
            >
              Cancel
            </button>
            <button
              onClick={handleSaveEdit}
              className="flex-[2] py-3 rounded-xl bg-brand-600 dark:bg-brand-500 hover:bg-brand-700 dark:hover:bg-brand-600 text-white text-sm font-bold shadow-lg shadow-brand-500/20 hover:-translate-y-0.5 transition-all duration-200"
            >
              Save Changes
            </button>
          </div>
        </div>
      </BottomSheet>

      {}
      <BottomSheet
        open={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false)
          setOrderToDelete(null)
        }}
        title="Delete Order"
        size="sm"
      >
        <div className="p-6 space-y-5">
          {}
          <div className="flex flex-col items-center text-center gap-3 py-2">
            <div className="w-16 h-16 rounded-2xl bg-red-100 dark:bg-red-950/40 flex items-center justify-center shadow-sm ring-4 ring-red-100/50 dark:ring-red-950/30">
              <Trash2 className="w-7 h-7 text-red-600 dark:text-red-400" />
            </div>
            <div>
              <p className="text-base font-bold text-foreground">Permanently Delete?</p>
              <p className="text-sm text-muted-foreground mt-1">
                Order{' '}
                <span className="font-bold text-foreground">{orderToDelete?.orderNumber}</span>{' '}
                will be removed from the system.
              </p>
            </div>
          </div>

          {}
          <div className="flex items-start gap-2.5 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/40 rounded-xl p-3.5">
            <Info className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
            <p className="text-xs text-red-700 dark:text-red-400 leading-relaxed">
              This action cannot be undone. The order record and all associated data will be permanently removed.
            </p>
          </div>

          {}
          <div className="flex gap-3">
            <button
              onClick={() => {
                setShowDeleteModal(false)
                setOrderToDelete(null)
              }}
              className="flex-1 py-3 rounded-xl border border-border text-sm font-semibold text-muted-foreground hover:bg-muted hover:text-foreground transition-all duration-150"
            >
              Keep Order
            </button>
            <button
              onClick={confirmDelete}
              className="flex-1 py-3 rounded-xl bg-red-600 hover:bg-red-700 active:scale-95 text-white text-sm font-bold shadow-lg shadow-red-500/20 transition-all duration-150"
            >
              Delete Order
            </button>
          </div>
        </div>
      </BottomSheet>
    </div>
  )
}
