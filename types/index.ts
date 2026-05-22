

export type OrderStatus = 'pending' | 'confirmed' | 'baking' | 'ready' | 'delivered' | 'cancelled'
export type PaymentStatus = 'paid' | 'unpaid' | 'partial'
export type DeliveryType = 'pickup' | 'delivery'


export interface OrderItem {
  productId: string
  productName: string
  quantity: number
  price: number
  customization?: string
}

export interface Customer {
  id: string
  name: string
  phone: string
  email?: string
  address?: string
  avatar?: string
  joinedAt: string
  birthday?: string
  loyaltyPoints: number
  totalSpent: number
  orderCount: number
  notes?: string
  tags: string[]
}

export interface Order {
  id: string
  orderNumber: string
  customerId: string
  customerName: string
  customerPhone: string
  items: OrderItem[]
  status: OrderStatus
  paymentStatus: PaymentStatus
  deliveryType: DeliveryType
  deliveryAddress?: string
  deliveryDate: string
  createdAt: string
  updatedAt: string
  subtotal: number
  tax: number
  total: number
  notes?: string
  specialInstructions?: string
}

export interface Message {
  id: string
  chatId: string
  content: string
  sender: 'customer' | 'ai' | 'agent'
  timestamp: string
  read: boolean
  type: 'text' | 'invoice' | 'image' | 'order-update'
}

export interface Chat {
  id: string
  customerId: string
  customerName: string
  customerPhone: string
  customerAvatar?: string
  lastMessage: string
  lastMessageTime: string
  unreadCount: number
  online: boolean
  messages: Message[]
}

export interface Invoice {
  id: string
  invoiceNumber: string
  customerId: string
  customerName: string
  customerPhone: string
  customerEmail?: string
  customerAddress?: string
  items: InvoiceItem[]
  subtotal: number
  taxRate: number
  taxAmount: number
  total: number
  status: 'draft' | 'sent' | 'paid' | 'overdue'
  createdAt: string
  dueDate: string
  notes?: string
}

export interface InvoiceItem {
  description: string
  quantity: number
  unitPrice: number
  total: number
}


export interface ShopSettings {
  shopName: string
  ownerName: string
  phone: string
  email: string
  address: string
  gstin: string
  currency: string
  timezone: string
  whatsappConnected: boolean
  taxRate: number
  theme: 'light' | 'dark' | 'system'
  accentColor: string
  notificationsEnabled: boolean
  orderNotifications: boolean
  paymentNotifications: boolean
  birthdayReminders: boolean
}

