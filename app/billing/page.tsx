'use client'

import { useState, useMemo, useCallback } from 'react'
import { motion } from 'framer-motion'
import { Plus, Download, Trash2, Eye, FileText, BellRing } from 'lucide-react'
import { PageHeader } from '@/components/ui/PageHeader'
import { StatusBadge } from '@/components/ui/StatusBadge'
import { BottomSheet } from '@/components/ui/BottomSheet'
import { NumericKeypad } from '@/components/ui/NumericKeypad'
import { EmptyState } from '@/components/ui/EmptyState'
import { SearchInput } from '@/components/ui/SearchInput'
import { staggerContainer, staggerItem } from '@/lib/animations'
import { useAppStore } from '@/store/useAppStore'
import { useMounted } from '@/hooks/useMounted'
import { useOfflineStore } from '@/store/offline'
import { db } from '@/db'
import { queueSyncAction, getPendingSyncCount } from '@/services/sync/engine'
import { formatCurrency, formatDate, generateId, generateInvoiceNumber, calculateGST } from '@/lib/utils'
import type { Invoice, InvoiceItem, Chat, Message } from '@/types'
import toast from 'react-hot-toast'
import { cn } from '@/lib/utils'

const EMPTY_ITEM: InvoiceItem = { description: '', quantity: 1, unitPrice: 0, total: 0 }

const BILLING_STATUS_TABS = [
  { label: 'All Invoices', value: 'all' },
  { label: 'Draft', value: 'draft' },
  { label: 'Sent / Unpaid', value: 'sent' },
  { label: 'Paid', value: 'paid' },
  { label: 'Overdue', value: 'overdue' },
]

export default function BillingPage() {
  const mounted = useMounted()
  const loading = !mounted
  const [search, setSearch] = useState('')
  const { isOnline, setPendingCount } = useOfflineStore()
  const [statusFilter, setStatusFilter] = useState('all')
  const [showCreate, setShowCreate] = useState(false)
  const [previewInvoice, setPreviewInvoice] = useState<Invoice | null>(null)
  const [activeKeypad, setActiveKeypad] = useState<{ index: number, field: 'quantity' | 'unitPrice', val: string } | null>(null)
  
  const { 
    invoices, addInvoice, deleteInvoice, updateInvoice,
    customers, setCustomers, chats, setChats, sendMessage 
  } = useAppStore()

  
  const [form, setForm] = useState({
    customerId: '',
    dueDate: '',
    notes: '',
    taxRate: 5,
    status: 'sent' as 'draft' | 'sent' | 'paid' | 'overdue'
  })
  const [items, setItems] = useState<InvoiceItem[]>([{ ...EMPTY_ITEM }])

  const selectedCustomer = customers.find(c => c.id === form.customerId)

  
  const subtotal = items.reduce((s, i) => s + i.quantity * (i.unitPrice || 0), 0)
  const taxAmount = calculateGST(subtotal, form.taxRate)
  const total = subtotal + taxAmount

  function updateItem(idx: number, field: keyof InvoiceItem, val: string | number) {
    setItems(prev => prev.map((item, i) => {
      if (i !== idx) return item
      const updated = { ...item, [field]: val }
      updated.total = (updated.quantity || 1) * (updated.unitPrice || 0)
      return updated
    }))
  }

  
  const handleCreate = useCallback(async () => {
    if (!form.customerId || items.some(i => !i.description)) {
      toast.error('Please associate a customer and fill out items list')
      return
    }
    const customer = customers.find(c => c.id === form.customerId)!
    const invoiceId = generateId()
    const now = new Date().toISOString()
    
    const invoice: Invoice = {
      id: invoiceId,
      invoiceNumber: generateInvoiceNumber(),
      customerId: form.customerId,
      customerName: customer.name,
      customerPhone: customer.phone,
      customerEmail: customer.email,
      customerAddress: customer.address,
      items: items.map(i => ({ ...i, total: i.quantity * i.unitPrice })),
      subtotal,
      taxRate: form.taxRate,
      taxAmount,
      total,
      status: form.status,
      createdAt: now,
      dueDate: form.dueDate || new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0],
      notes: form.notes || undefined,
    }
    
    
    addInvoice(invoice)

    
    try {
      await db.bills.add({
        id: invoiceId,
        customerId: form.customerId,
        customerName: customer.name,
        customerPhone: customer.phone,
        items: items.map(i => ({
          productId: i.description.toLowerCase().replace(/\s+/g, '-'),
          name: i.description,
          quantity: i.quantity,
          price: i.unitPrice,
          total: i.quantity * i.unitPrice,
        })),
        subtotal,
        discount: 0,
        total,
        status: form.status === 'sent' ? 'PENDING' : form.status === 'paid' ? 'PAID' : form.status === 'overdue' ? 'OVERDUE' : 'PENDING',
        paymentMethod: 'CASH',
        createdAt: now,
        updatedAt: now,
        isSynced: isOnline,
      })

      
      await queueSyncAction('CREATE', 'BILL', invoiceId, invoice)
      const count = await getPendingSyncCount()
      setPendingCount(count)
    } catch (err) {
      
      console.warn('[Offline] Dexie save failed:', err)
    }

    
    if (isOnline) {
      toast.success(`✅ Invoice ${invoice.invoiceNumber} saved & syncing!`)
    } else {
      toast(`📱 Invoice ${invoice.invoiceNumber} saved locally!`, {
        icon: '💾',
        duration: 4000,
        style: { background: '#052e16', color: '#86efac', border: '1px solid #166534' },
      })
    }

    setShowCreate(false)
    setForm({ customerId: '', dueDate: '', notes: '', taxRate: 5, status: 'sent' })
    setItems([{ ...EMPTY_ITEM }])
  }, [form, items, customers, subtotal, taxAmount, total, addInvoice, isOnline, setPendingCount])

  
  function handleSendReminder(inv: Invoice) {
    const textMsg = `Hi ${inv.customerName}, here is a quick invoice payment update. The invoice *${inv.invoiceNumber}* for *${formatCurrency(inv.total)}* is marked as ${inv.status}. Please make payment using UPI: sweetflow@upi. Thank you! - SweetFlow AI`
    
    
    let targetChat = chats.find(c => c.customerId === inv.customerId)
    if (!targetChat) {
      const newChatId = generateId()
      const newChat: Chat = {
        id: newChatId,
        customerId: inv.customerId,
        customerName: inv.customerName,
        customerPhone: inv.customerPhone,
        lastMessage: textMsg,
        lastMessageTime: new Date().toISOString(),
        unreadCount: 0,
        online: Math.random() > 0.5,
        messages: []
      }
      const updatedChats = [...chats, newChat]
      setChats(updatedChats)
      targetChat = newChat
    }

    
    const reminderMsg: Message = {
      id: generateId(),
      chatId: targetChat.id,
      content: textMsg,
      sender: 'agent',
      timestamp: new Date().toISOString(),
      read: true,
      type: 'invoice'
    }

    sendMessage(targetChat.id, reminderMsg)

    
    const cleanPhone = inv.customerPhone.replace(/[^0-9]/g, '')
    const finalPhone = cleanPhone.length === 10 ? '91' + cleanPhone : cleanPhone
    const waUrl = `https://wa.me/${finalPhone}?text=${encodeURIComponent(textMsg)}`
    window.open(waUrl, '_blank')
    
    toast.success(`Reminder message appended to customer chat log and WhatsApp link opened!`)
  }

  
  const handleStatusUpdate = useCallback(async (id: string, newStatus: 'draft' | 'sent' | 'paid' | 'overdue') => {
    updateInvoice(id, { status: newStatus })
    if (previewInvoice?.id === id) {
      setPreviewInvoice({ ...previewInvoice, status: newStatus })
    }
    
    const dbStatus = newStatus === 'paid' ? 'PAID' : newStatus === 'overdue' ? 'OVERDUE' : newStatus === 'sent' ? 'PENDING' : 'PENDING'
    try {
      await db.bills.update(id, { status: dbStatus, updatedAt: new Date().toISOString(), isSynced: false })
      await queueSyncAction('UPDATE', 'BILL', id, { status: dbStatus })
      const count = await getPendingSyncCount()
      setPendingCount(count)
    } catch {  }
    toast.success(`Invoice marked as ${newStatus}`)
  }, [updateInvoice, previewInvoice, setPendingCount])

  
  function downloadHTMLInvoice(inv: Invoice) {
    const htmlInvoice = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Invoice ${inv.invoiceNumber}</title>
  <style>
    body { font-family: system-ui, sans-serif; margin: 40px; color: #1e293b; background-color: #ffffff; line-height: 1.5; }
    .header { display: flex; justify-content: space-between; border-bottom: 2px solid #f1f5f9; padding-bottom: 24px; }
    .title { font-size: 26px; font-weight: 800; color: #ec4899; }
    .details { margin-top: 30px; display: flex; justify-content: space-between; gap: 40px; }
    .col { flex: 1; }
    table { width: 100%; border-collapse: collapse; margin-top: 40px; }
    th { border-bottom: 2px solid #e2e8f0; padding: 12px; text-align: left; font-size: 11px; text-transform: uppercase; color: #64748b; letter-spacing: 0.05em; }
    td { padding: 16px 12px; border-bottom: 1px solid #f1f5f9; font-size: 14px; }
    .totals { margin-top: 35px; float: right; width: 280px; }
    .total-row { display: flex; justify-content: space-between; padding: 6px 0; font-size: 13px; color: #475569; }
    .grand-total { font-weight: 800; font-size: 18px; border-top: 2px solid #f1f5f9; padding-top: 12px; color: #ec4899; }
    .footer { text-align: center; margin-top: 120px; font-size: 12px; color: #94a3b8; border-top: 1px solid #f1f5f9; padding-top: 24px; }
  </style>
</head>
<body>
  <div class="header">
    <div>
      <div class="title">SweetFlow Bakery</div>
      <p style="margin: 4px 0; font-size: 14px; color: #475569;">12, Baker Street, Anna Nagar, Chennai</p>
      <p style="margin: 0; font-size: 13px; color: #64748b;">GSTIN: 33AABCU9603R1ZX</p>
    </div>
    <div style="text-align: right;">
      <div style="font-size: 12px; font-weight: 700; color: #64748b; tracking-wider: 0.1em;">INVOICE BILL</div>
      <p style="font-size: 22px; font-weight: 800; margin: 4px 0; color: #0f172a;">${inv.invoiceNumber}</p>
      <p style="margin: 2px 0; font-size: 13px; color: #475569;">Date: ${new Date(inv.createdAt).toLocaleDateString('en-IN')}</p>
      <p style="margin: 2px 0; font-size: 13px; color: #475569;">Due Date: ${new Date(inv.dueDate).toLocaleDateString('en-IN')}</p>
    </div>
  </div>
  
  <div class="details">
    <div class="col">
      <h3 style="font-size: 11px; color: #64748b; text-transform: uppercase; margin-bottom: 6px; letter-spacing: 0.05em;">Client Billing Address</h3>
      <p style="font-weight: 700; margin: 0; color: #0f172a;">${inv.customerName}</p>
      <p style="margin: 3px 0; font-size: 13px; color: #475569;">${inv.customerPhone}</p>
      ${inv.customerEmail ? `<p style="margin: 3px 0; font-size: 13px; color: #475569;">${inv.customerEmail}</p>` : ''}
      ${inv.customerAddress ? `<p style="margin: 0; font-size: 13px; color: #475569;">${inv.customerAddress}</p>` : ''}
    </div>
  </div>
  
  <table>
    <thead>
      <tr>
        <th>Product / Item Description</th>
        <th style="text-align: center;">Quantity</th>
        <th style="text-align: right;">Rate (INR)</th>
        <th style="text-align: right;">Amount</th>
      </tr>
    </thead>
    <tbody>
      ${inv.items.map(item => `
        <tr>
          <td style="font-weight: 600; color: #0f172a;">${item.description}</td>
          <td style="text-align: center; color: #475569;">${item.quantity}</td>
          <td style="text-align: right; color: #475569;">₹${item.unitPrice}</td>
          <td style="text-align: right; font-weight: 700; color: #0f172a;">₹${item.total}</td>
        </tr>
      `).join('')}
    </tbody>
  </table>
  
  <div class="totals">
    <div class="total-row">
      <span>Subtotal</span>
      <span>₹${inv.subtotal}</span>
    </div>
    <div class="total-row">
      <span>GST (${inv.taxRate}%)</span>
      <span>₹${inv.taxAmount}</span>
    </div>
    <div class="total-row grand-total">
      <span>Grand Total</span>
      <span>₹${inv.total}</span>
    </div>
  </div>
  
  <div style="clear: both;"></div>
  
  <div class="footer">
    Thank you for choosing SweetFlow! 🎂 Pay securely via UPI ID: sweetflow@upi
  </div>
</body>
</html>`

    const blob = new Blob([htmlInvoice], { type: 'text/html' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `Invoice_${inv.invoiceNumber}.html`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    toast.success('Invoice HTML copy generated! Open it to print/save as PDF.')
  }

  
  const filtered = useMemo(() => {
    return invoices.filter((inv) => {
      const matchStatus = statusFilter === 'all' || inv.status === statusFilter
      const matchSearch =
        !search ||
        inv.customerName.toLowerCase().includes(search.toLowerCase()) ||
        inv.invoiceNumber.toLowerCase().includes(search.toLowerCase())
      return matchStatus && matchSearch
    })
  }, [invoices, search, statusFilter])

  const totalRevenue = invoices.filter(i => i.status === 'paid').reduce((s, i) => s + i.total, 0)

  return (
    <div className="space-y-5 page-wrapper">
      <PageHeader
        title="Invoices & CRM Billing"
        description="Issue professional GST-compliant client invoices and dispatch automated WhatsApp reminders."
        badge={`${invoices.length} invoices`}
        action={
          <button
            onClick={() => setShowCreate(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-brand-600 dark:bg-brand-500 hover:bg-brand-700 dark:hover:bg-brand-600 text-white text-sm font-semibold shadow-sm transition-all duration-200 hover:-translate-y-[0.5px]"
          >
            <Plus className="w-4 h-4" />
            New Invoice
          </button>
        }
      />

      {}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: 'Total Invoiced value', value: formatCurrency(invoices.reduce((s, i) => s + i.total, 0)), color: 'text-brand-600', borderTop: 'border-t-brand-500', bg: 'bg-brand-50/20 dark:bg-brand-950/10' },
          { label: 'Revenue Collected', value: formatCurrency(totalRevenue), color: 'text-emerald-600', borderTop: 'border-t-emerald-500', bg: 'bg-emerald-50/20 dark:bg-emerald-950/10' },
          { label: 'Pending Collections', value: String(invoices.filter(i => i.status === 'sent').length), color: 'text-amber-600', borderTop: 'border-t-amber-500', bg: 'bg-amber-50/20 dark:bg-amber-950/10' },
          { label: 'Overdue accounts', value: String(invoices.filter(i => i.status === 'overdue').length), color: 'text-red-500', borderTop: 'border-t-red-500', bg: 'bg-red-50/20 dark:bg-red-950/10' },
        ].map((s) => (
          <div key={s.label} className={cn("border border-border/80 rounded-2xl p-4 shadow-sm border-t-[3px]", s.borderTop, s.bg)}>
            <p className="text-xs text-muted-foreground font-medium">{s.label}</p>
            <p className={cn('text-xl font-bold mt-1.5', s.color)}>{s.value}</p>
          </div>
        ))}
      </div>

      {}
      <div className="bg-card border border-border rounded-2xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm">
        <div className="flex-1 max-w-sm">
          <SearchInput placeholder="Search invoice number, client..." value={search} onChange={setSearch} />
        </div>

        {}
        <div className="flex gap-1 overflow-x-auto scrollbar-thin">
          {BILLING_STATUS_TABS.map((tab) => {
            const count = tab.value === 'all' ? invoices.length : invoices.filter(i => i.status === tab.value).length
            return (
              <button
                key={tab.value}
                onClick={() => setStatusFilter(tab.value)}
                className={cn(
                  'px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-colors',
                  statusFilter === tab.value 
                    ? 'bg-brand-600 dark:bg-brand-500 text-white shadow-sm'
                    : 'bg-muted/40 hover:bg-muted text-muted-foreground'
                )}
              >
                {tab.label} ({count})
              </button>
            )
          })}
        </div>
      </div>

      {}
      {filtered.length === 0 ? (
        <EmptyState
          emoji="📄"
          title="No Invoices logged"
          description="Create a client profile association invoice to log invoice details."
          action={
            <button onClick={() => setShowCreate(true)} className="px-4 py-2 rounded-xl bg-brand-600 dark:bg-brand-500 hover:bg-brand-700 dark:hover:bg-brand-600 text-white text-sm font-semibold transition-colors duration-200">
              Create Invoice
            </button>
          }
        />
      ) : (
        <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="space-y-3">
          {filtered.map((inv) => (
            <motion.div
              key={inv.id}
              variants={staggerItem}
              className="bg-card border border-border rounded-2xl p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-4 hover:border-brand-300 dark:hover:border-brand-800 hover:shadow-md transition-all duration-200"
            >
              <div className="flex items-center gap-3.5 flex-1 min-w-0">
                <div className="w-10 h-10 rounded-xl bg-brand-50 dark:bg-brand-950/30 flex items-center justify-center flex-shrink-0">
                  <FileText className="w-5 h-5 text-brand-600 dark:text-brand-400" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="text-sm font-bold text-foreground">{inv.invoiceNumber}</p>
                    <StatusBadge status={inv.status} size="sm" dot />
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">{inv.customerName} · {inv.customerPhone}</p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-4 sm:gap-6 text-xs text-muted-foreground">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider">Date Issued</p>
                  <p className="font-semibold text-foreground mt-0.5">{formatDate(inv.createdAt).split(',')[0]}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider">Due Date</p>
                  <p className="font-semibold text-foreground mt-0.5">{formatDate(inv.dueDate).split(',')[0]}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider">Invoice Total</p>
                  <p className="font-extrabold text-brand-600 dark:text-brand-400 text-sm mt-0.5">{formatCurrency(inv.total)}</p>
                </div>
              </div>

              <div className="flex items-center gap-2 border-t lg:border-t-0 pt-3 lg:pt-0 border-border justify-between">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setPreviewInvoice(inv)}
                    className="w-8 h-8 flex items-center justify-center rounded-xl bg-brand-50 dark:bg-brand-950/30 text-brand-600 dark:text-brand-400 hover:bg-brand-100 transition-colors"
                    title="View Invoice Preview"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => downloadHTMLInvoice(inv)}
                    className="w-8 h-8 flex items-center justify-center rounded-xl bg-muted hover:bg-muted/80 text-muted-foreground hover:text-foreground transition-colors"
                    title="Download HTML print copy"
                  >
                    <Download className="w-4 h-4" />
                  </button>
                  {inv.status !== 'paid' && (
                    <button
                      onClick={() => handleSendReminder(inv)}
                      className="w-8 h-8 flex items-center justify-center rounded-xl bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-100 transition-colors"
                      title="Send WhatsApp payment reminder"
                    >
                      <BellRing className="w-4 h-4" />
                    </button>
                  )}
                  <button
                    onClick={() => { deleteInvoice(inv.id); toast.success('Invoice record deleted') }}
                    className="w-8 h-8 flex items-center justify-center rounded-xl bg-red-50 dark:bg-red-950/20 text-red-500 hover:bg-red-100 transition-colors"
                    title="Delete record"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      )}

      {}
      <BottomSheet open={showCreate} onClose={() => setShowCreate(false)} title="Generate Bill Invoice">
        <div className="p-6 space-y-6">
          
          {}
          <div className="bg-card border border-border/80 rounded-[20px] overflow-hidden divide-y divide-border/60 shadow-sm">
            {}
            <div className="flex items-center justify-between p-4 bg-muted/10">
              <label className="text-[14px] font-semibold text-foreground whitespace-nowrap mr-4">Client Profile</label>
              <select
                value={form.customerId}
                onChange={e => setForm(f => ({ ...f, customerId: e.target.value }))}
                className="flex-1 text-right bg-transparent text-[15px] font-medium text-brand-600 dark:text-brand-400 focus:outline-none appearance-none cursor-pointer"
                dir="rtl"
              >
                <option value="">Choose client...</option>
                {customers.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
            
            {/* Due Date */}
            <div className="flex items-center justify-between p-4 bg-muted/10">
              <label className="text-[14px] font-semibold text-foreground whitespace-nowrap mr-4">Due Date</label>
              <input
                type="date"
                value={form.dueDate}
                onChange={e => setForm(f => ({ ...f, dueDate: e.target.value }))}
                className="flex-1 text-right bg-transparent text-[15px] font-medium text-muted-foreground focus:outline-none appearance-none cursor-pointer"
              />
            </div>
            
            {}
            <div className="flex items-center justify-between p-4 bg-muted/10">
              <label className="text-[14px] font-semibold text-foreground whitespace-nowrap mr-4">GST Rate (%)</label>
              <input
                type="number"
                value={form.taxRate}
                onChange={e => setForm(f => ({ ...f, taxRate: Math.max(0, Number(e.target.value) || 0) }))}
                className="flex-1 text-right bg-transparent text-[15px] font-medium text-muted-foreground focus:outline-none appearance-none"
              />
            </div>
            
            {}
            <div className="flex items-center justify-between p-4 bg-muted/10">
              <label className="text-[14px] font-semibold text-foreground whitespace-nowrap mr-4">Status</label>
              <select
                value={form.status}
                onChange={e => setForm(f => ({ ...f, status: e.target.value as any }))}
                className="flex-1 text-right bg-transparent text-[15px] font-medium text-muted-foreground focus:outline-none appearance-none cursor-pointer"
                dir="rtl"
              >
                <option value="draft">Draft</option>
                <option value="sent">Sent</option>
                <option value="paid">Paid</option>
                <option value="overdue">Overdue</option>
              </select>
            </div>
          </div>

          {}
          <div className="space-y-3">
            <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider block ml-1">Billing Line Items</label>
            
            <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1 overflow-x-hidden pb-4">
              {items.map((item, idx) => (
                <div key={idx} className="relative bg-red-500 rounded-2xl overflow-hidden shadow-sm">
                  {}
                  <div className="absolute right-0 top-0 bottom-0 w-24 flex items-center justify-center text-white font-bold text-xs gap-1.5 bg-red-500">
                    <Trash2 className="w-4 h-4" /> Delete
                  </div>
                  
                  {}
                  <motion.div
                    drag="x"
                    dragConstraints={{ left: -80, right: 0 }}
                    onDragEnd={(e, info) => {
                      if (info.offset.x < -50 && items.length > 1) {
                        setItems(prev => prev.filter((_, i) => i !== idx))
                      }
                    }}
                    className="relative bg-card border border-border/80 rounded-2xl p-4 flex flex-col gap-3 z-10"
                  >
                    <input
                      className="w-full text-[16px] bg-transparent border-none text-foreground placeholder:text-muted-foreground/60 focus:outline-none font-bold"
                      placeholder="Product or service description"
                      value={item.description}
                      onChange={e => updateItem(idx, 'description', e.target.value)}
                    />
                    
                    <div className="flex items-center justify-between border-t border-border/40 pt-3 mt-1">
                      <div className="flex items-center gap-2">
                        <div 
                          onClick={() => setActiveKeypad({ index: idx, field: 'quantity', val: String(item.quantity || '') })}
                          className="flex items-center gap-1.5 px-3.5 py-2 bg-muted/60 hover:bg-muted rounded-xl cursor-pointer transition-colors"
                        >
                          <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider">Qty</span>
                          <span className="text-sm font-extrabold text-foreground">{item.quantity}</span>
                        </div>
                        <div className="text-muted-foreground/50 text-xs font-black">×</div>
                        <div 
                          onClick={() => setActiveKeypad({ index: idx, field: 'unitPrice', val: String(item.unitPrice || '') })}
                          className="flex items-center gap-1.5 px-3.5 py-2 bg-muted/60 hover:bg-muted rounded-xl cursor-pointer transition-colors"
                        >
                          <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider">Price</span>
                          <span className="text-sm font-extrabold text-foreground">₹{item.unitPrice || '0'}</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-black text-brand-600 dark:text-brand-400">{formatCurrency(item.quantity * (item.unitPrice || 0))}</p>
                      </div>
                    </div>
                  </motion.div>
                </div>
              ))}
            </div>
            
            <button
              onClick={() => setItems(prev => [...prev, { ...EMPTY_ITEM }])}
              className="w-full py-3 rounded-[16px] border-2 border-dashed border-brand-200 dark:border-brand-900/40 text-brand-600 dark:text-brand-400 font-bold text-[13px] hover:bg-brand-50 dark:hover:bg-brand-950/20 transition-colors flex items-center justify-center gap-2"
            >
              <Plus className="w-4 h-4" /> Add Line Item
            </button>
          </div>

          {}
          <div className="bg-muted/40 border border-border/60 rounded-2xl p-4 space-y-2">
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Subtotal</span>
              <span className="font-semibold text-foreground">{formatCurrency(subtotal)}</span>
            </div>
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>GST ({form.taxRate}%)</span>
              <span className="font-semibold text-foreground">{formatCurrency(taxAmount)}</span>
            </div>
            <div className="flex justify-between text-sm font-bold border-t border-border pt-2 text-foreground">
              <span>Grand Total</span>
              <span className="text-brand-600 dark:text-brand-400 font-bold">{formatCurrency(total)}</span>
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              onClick={() => setShowCreate(false)}
              className="flex-1 px-4 py-2.5 text-sm font-semibold rounded-xl border border-border text-foreground hover:bg-muted transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleCreate}
              className="flex-1 px-4 py-2.5 text-sm font-semibold rounded-xl bg-brand-600 dark:bg-brand-500 hover:bg-brand-700 dark:hover:bg-brand-600 text-white shadow-sm transition-colors duration-200"
            >
              Create & Dispatch
            </button>
          </div>
        </div>
      </BottomSheet>

      {}
      <BottomSheet
        open={!!activeKeypad}
        onClose={() => setActiveKeypad(null)}
        title={activeKeypad?.field === 'quantity' ? 'Enter Quantity' : 'Enter Unit Price'}
      >
        {activeKeypad && (
          <div className="px-4 pb-4">
            <div className="mb-6 text-center">
              <p className="text-4xl font-black text-foreground tracking-tight">
                {activeKeypad.field === 'unitPrice' && '₹'}
                {activeKeypad.val || '0'}
              </p>
            </div>
            <NumericKeypad
              onPress={(k) => {
                const newVal = activeKeypad.val === '0' ? k : activeKeypad.val + k
                setActiveKeypad(prev => prev ? { ...prev, val: newVal } : null)
                updateItem(activeKeypad.index, activeKeypad.field, Number(newVal))
              }}
              onDelete={() => {
                const newVal = activeKeypad.val.slice(0, -1) || '0'
                setActiveKeypad(prev => prev ? { ...prev, val: newVal } : null)
                updateItem(activeKeypad.index, activeKeypad.field, Number(newVal))
              }}
              onDone={() => setActiveKeypad(null)}
            />
          </div>
        )}
      </BottomSheet>
      
      {}
      <BottomSheet open={!!previewInvoice} onClose={() => setPreviewInvoice(null)} title="Invoice Details">
        {previewInvoice && (
          <div className="p-6 space-y-5">
            {}
            <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
              {}
              <div className="bg-slate-900 p-6 text-white">
                <div className="flex justify-between items-start">
                  <div>
                    <h2 className="text-xl font-bold tracking-tight text-white">SweetFlow Bakery</h2>
                    <p className="text-slate-300 text-xs mt-1">12, Baker Street, Anna Nagar, Chennai</p>
                    <p className="text-slate-300 text-xs">GSTIN: 33AABCU9603R1ZX</p>
                  </div>
                  <div className="text-right">
                    <p className="text-slate-400 text-[10px] font-bold uppercase tracking-wider">Tax Invoice</p>
                    <p className="text-lg font-black text-white">{previewInvoice.invoiceNumber}</p>
                    <p className="text-slate-300 text-xs mt-0.5">{formatDate(previewInvoice.createdAt).split(',')[0]}</p>
                  </div>
                </div>
              </div>
              
              <div className="p-6 space-y-5 text-slate-800">
                {}
                <div className="grid grid-cols-2 gap-4 border-b border-slate-100 pb-4">
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Bill To</p>
                    <p className="font-bold text-slate-900 mt-1">{previewInvoice.customerName}</p>
                    <p className="text-xs text-slate-500 mt-0.5">{previewInvoice.customerPhone}</p>
                    {previewInvoice.customerAddress && <p className="text-xs text-slate-500">{previewInvoice.customerAddress}</p>}
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Payment Details</p>
                    <p className="text-xs text-slate-600 mt-1.5"><span className="font-semibold text-slate-900">Due Date:</span> {formatDate(previewInvoice.dueDate).split(',')[0]}</p>
                    <p className="text-xs text-slate-600"><span className="font-semibold text-slate-900">State:</span> {previewInvoice.status.toUpperCase()}</p>
                  </div>
                </div>

                {}
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-slate-200">
                      <th className="py-2 font-bold text-slate-400 uppercase">Item / Description</th>
                      <th className="py-2 font-bold text-slate-400 uppercase text-center">Qty</th>
                      <th className="py-2 font-bold text-slate-400 uppercase text-right">Unit Price</th>
                      <th className="py-2 font-bold text-slate-400 uppercase text-right">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {previewInvoice.items.map((item, i) => (
                      <tr key={i} className="border-b border-slate-100 last:border-0">
                        <td className="py-3 text-slate-900 font-semibold">{item.description}</td>
                        <td className="py-3 text-center text-slate-600 font-medium">{item.quantity}</td>
                        <td className="py-3 text-right text-slate-600 font-medium">{formatCurrency(item.unitPrice)}</td>
                        <td className="py-3 text-right font-bold text-slate-900">{formatCurrency(item.total)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {}
                <div className="flex justify-end pt-4 border-t border-slate-100">
                  <div className="w-64 space-y-2.5 text-xs text-slate-600">
                    <div className="flex justify-between">
                      <span>Subtotal</span>
                      <span className="font-semibold text-slate-900">{formatCurrency(previewInvoice.subtotal)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>GST ({previewInvoice.taxRate}%)</span>
                      <span className="font-semibold text-slate-900">{formatCurrency(previewInvoice.taxAmount)}</span>
                    </div>
                    <div className="flex justify-between font-black text-sm border-t border-slate-200 pt-2 text-slate-900">
                      <span>Total Invoice Due</span>
                      <span className="text-pink-600 font-black">{formatCurrency(previewInvoice.total)}</span>
                    </div>
                  </div>
                </div>

                <div className="text-center text-[10px] text-slate-400 border-t border-slate-100 pt-4">
                  Thank you for your business! 🎂 Pay secure via UPI ID: <span className="font-bold text-slate-600">sweetflow@upi</span>
                </div>
              </div>
            </div>

            {}
            <div className="flex items-center gap-2 border-t border-border pt-4 justify-between">
              <span className="text-xs text-muted-foreground font-semibold">Change status state:</span>
              <div className="flex gap-1 flex-wrap">
                {(['draft', 'sent', 'paid', 'overdue'] as const).map(st => (
                  <button
                    key={st}
                    onClick={() => handleStatusUpdate(previewInvoice.id, st)}
                    className={cn(
                      'px-2.5 py-1 text-xs font-bold rounded-lg border transition-colors capitalize',
                      previewInvoice.status === st 
                        ? 'bg-brand-600 border-brand-600 text-white shadow-xs'
                        : 'bg-muted border-border text-muted-foreground hover:bg-muted/80'
                    )}
                  >
                    {st}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => downloadHTMLInvoice(previewInvoice)}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-brand-600 dark:bg-brand-500 hover:bg-brand-700 dark:hover:bg-brand-600 text-white text-sm font-semibold transition-colors duration-200"
              >
                <Download className="w-4 h-4" /> Download PDF/HTML copy
              </button>
              {previewInvoice.status !== 'paid' && (
                <button
                  onClick={() => handleSendReminder(previewInvoice)}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold transition-colors duration-200"
                >
                  <BellRing className="w-4 h-4" /> Send Payment Reminder
                </button>
              )}
              <button
                onClick={() => setPreviewInvoice(null)}
                className="px-4 py-2.5 rounded-xl border border-border text-sm font-semibold hover:bg-muted transition-colors"
              >
                Close Preview
              </button>
            </div>
          </div>
        )}
      </BottomSheet>
    </div>
  )
}
