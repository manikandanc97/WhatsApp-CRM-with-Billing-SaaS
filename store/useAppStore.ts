'use client'

import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { Order, Customer, Chat, Message, ShopSettings, Invoice } from '@/types'
import { sleep } from '@/lib/utils'

import ordersData from '@/data/orders.json'
import customersData from '@/data/customers.json'
import messagesData from '@/data/messages.json'

// ─── Orders Slice ─────────────────────────────────────────────────────────────
interface OrdersSlice {
  orders: Order[]
  setOrders: (orders: Order[]) => void
  addOrder: (order: Order) => void
  updateOrder: (id: string, updates: Partial<Order>) => void
  deleteOrder: (id: string) => void
}

// ─── Customers Slice ──────────────────────────────────────────────────────────
interface CustomersSlice {
  customers: Customer[]
  setCustomers: (customers: Customer[]) => void
  addCustomer: (customer: Customer) => void
  updateCustomer: (id: string, updates: Partial<Customer>) => void
  deleteCustomer: (id: string) => void
}

// ─── Chat Slice ───────────────────────────────────────────────────────────────
interface ChatSlice {
  chats: Chat[]
  activeChatId: string | null
  isTyping: boolean
  setChats: (chats: Chat[]) => void
  setActiveChat: (id: string | null) => void
  sendMessage: (chatId: string, message: Message) => void
  markAsRead: (chatId: string) => void
  setTyping: (typing: boolean) => void
}

// ─── Invoice Slice ────────────────────────────────────────────────────────────
interface InvoiceSlice {
  invoices: Invoice[]
  addInvoice: (invoice: Invoice) => void
  updateInvoice: (id: string, updates: Partial<Invoice>) => void
  deleteInvoice: (id: string) => void
}

// ─── Settings Slice ───────────────────────────────────────────────────────────
interface SettingsSlice {
  settings: ShopSettings
  updateSettings: (updates: Partial<ShopSettings>) => void
}

// ─── UI Slice ─────────────────────────────────────────────────────────────────
interface UISlice {
  sidebarOpen: boolean
  activeModal: string | null
  theme: 'light' | 'dark' | 'system'
  setSidebarOpen: (open: boolean) => void
  toggleSidebar: () => void
  setActiveModal: (modal: string | null) => void
  setTheme: (theme: 'light' | 'dark' | 'system') => void
}

// ─── Auth Slice ───────────────────────────────────────────────────────────────
interface AuthSlice {
  user: { name: string; email: string; role: string; avatar?: string } | null
  token: string | null
  otpSentEmail: string | null
  otpCode: string | null
  otpVerified: boolean
  login: (email: string, name?: string) => Promise<void>
  signup: (name: string, email: string) => Promise<void>
  logout: () => void
  sendOTP: (email: string) => Promise<void>
  verifyOTP: (code: string) => Promise<boolean>
  resetPassword: (password: string) => Promise<void>
}

// ─── Combined Store ───────────────────────────────────────────────────────────
type AppStore = OrdersSlice & CustomersSlice & ChatSlice & InvoiceSlice & SettingsSlice & UISlice & AuthSlice

const defaultSettings: ShopSettings = {
  shopName: 'SweetFlow Bakery',
  ownerName: 'Lakshmi Anand',
  phone: '+91 98765 00000',
  email: 'hello@sweetflowbakery.com',
  address: '12, Baker Street, Anna Nagar, Chennai - 600040',
  gstin: '33AABCU9603R1ZX',
  currency: 'INR',
  timezone: 'Asia/Kolkata',
  whatsappConnected: true,
  taxRate: 5,
  theme: 'light',
  accentColor: 'brand',
  notificationsEnabled: true,
  orderNotifications: true,
  paymentNotifications: true,
  birthdayReminders: true,
}

export const useAppStore = create<AppStore>()(
  persist(
    (set, get) => ({
      // Orders
      orders: ordersData as any,
      setOrders: (orders) => set({ orders }),
      addOrder: (order) => set((s) => ({ orders: [order, ...s.orders] })),
      updateOrder: (id, updates) =>
        set((s) => ({
          orders: s.orders.map((o) => (o.id === id ? { ...o, ...updates } : o)),
        })),
      deleteOrder: (id) =>
        set((s) => ({ orders: s.orders.filter((o) => o.id !== id) })),

      // Customers
      customers: customersData as any,
      setCustomers: (customers) => set({ customers }),
      addCustomer: (customer) =>
        set((s) => ({ customers: [customer, ...s.customers] })),
      updateCustomer: (id, updates) =>
        set((s) => ({
          customers: s.customers.map((c) => (c.id === id ? { ...c, ...updates } : c)),
        })),
      deleteCustomer: (id) =>
        set((s) => ({ customers: s.customers.filter((c) => c.id !== id) })),

      // Chats
      chats: messagesData as any,
      activeChatId: null,
      isTyping: false,
      setChats: (chats) => set({ chats }),
      setActiveChat: (id) => set({ activeChatId: id }),
      sendMessage: (chatId, message) =>
        set((s) => ({
          chats: s.chats.map((c) =>
            c.id === chatId
              ? {
                  ...c,
                  messages: [...c.messages, message],
                  lastMessage: message.content,
                  lastMessageTime: message.timestamp,
                }
              : c
          ),
        })),
      markAsRead: (chatId) =>
        set((s) => ({
          chats: s.chats.map((c) =>
            c.id === chatId
              ? {
                  ...c,
                  unreadCount: 0,
                  messages: c.messages.map((m) => ({ ...m, read: true })),
                }
              : c
          ),
        })),
      setTyping: (typing) => set({ isTyping: typing }),

      // Invoices
      invoices: [],
      addInvoice: (invoice) =>
        set((s) => ({ invoices: [invoice, ...s.invoices] })),
      updateInvoice: (id, updates) =>
        set((s) => ({
          invoices: s.invoices.map((i) => (i.id === id ? { ...i, ...updates } : i)),
        })),
      deleteInvoice: (id) =>
        set((s) => ({ invoices: s.invoices.filter((i) => i.id !== id) })),

      // Settings
      settings: defaultSettings,
      updateSettings: (updates) =>
        set((s) => ({ settings: { ...s.settings, ...updates } })),

      // UI
      sidebarOpen: true,
      activeModal: null,
      theme: 'light',
      setSidebarOpen: (open) => set({ sidebarOpen: open }),
      toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),
      setActiveModal: (modal) => set({ activeModal: modal }),
      setTheme: (theme) => set({ theme }),

      // Auth
      user: null,
      token: null,
      otpSentEmail: null,
      otpCode: null,
      otpVerified: false,
      login: async (email, name) => {
        await sleep(800)
        const fakeUser = {
          email,
          name: name || 'Lakshmi Anand',
          role: 'Admin',
        }
        set({ user: fakeUser, token: 'fake-jwt-token-xyz123' })
      },
      signup: async (name, email) => {
        await sleep(800)
        const fakeUser = {
          email,
          name,
          role: 'Admin',
        }
        set({ user: fakeUser, token: 'fake-jwt-token-xyz123' })
      },
      logout: () => {
        set({ user: null, token: null, otpSentEmail: null, otpCode: null, otpVerified: false })
      },
      sendOTP: async (email) => {
        await sleep(600)
        set({ otpSentEmail: email, otpCode: '123456', otpVerified: false })
      },
      verifyOTP: async (code) => {
        await sleep(600)
        if (code === '123456' || code === get().otpCode) {
          set({ otpVerified: true })
          return true
        }
        return false
      },
      resetPassword: async (password) => {
        await sleep(800)
        set({ otpVerified: false, otpCode: null, otpSentEmail: null })
      },
    }),
    {
      name: 'sweetflow-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        orders: state.orders,
        customers: state.customers,
        chats: state.chats,
        invoices: state.invoices,
        settings: state.settings,
        theme: state.theme,
        user: state.user,
        token: state.token,
        otpSentEmail: state.otpSentEmail,
        otpCode: state.otpCode,
        otpVerified: state.otpVerified,
      }),
    }
  )
)
