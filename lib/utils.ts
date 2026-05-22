import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { format, formatDistanceToNow, isToday, isYesterday } from 'date-fns'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(amount: number, currency = 'INR'): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

export function formatDate(date: string | Date | undefined | null): string {
  if (!date) return ''
  const d = typeof date === 'string' ? new Date(date) : date
  if (isNaN(d.getTime())) return ''
  if (isToday(d)) return `Today, ${format(d, 'h:mm a')}`
  if (isYesterday(d)) return `Yesterday, ${format(d, 'h:mm a')}`
  return format(d, 'dd MMM yyyy')
}

export function formatTime(date: string | Date | undefined | null): string {
  if (!date) return ''
  const d = typeof date === 'string' ? new Date(date) : date
  if (isNaN(d.getTime())) return ''
  return format(d, 'h:mm a')
}

export function formatRelativeTime(date: string | Date | undefined | null): string {
  if (!date) return ''
  const d = typeof date === 'string' ? new Date(date) : date
  if (isNaN(d.getTime())) return ''
  return formatDistanceToNow(d, { addSuffix: true })
}

export function generateId(): string {
  return Math.random().toString(36).substring(2, 9)
}

export function generateOrderNumber(): string {
  const num = Math.floor(Math.random() * 900) + 100
  const year = new Date().getFullYear()
  return `SF-${year}-${num}`
}

export function generateInvoiceNumber(): string {
  const num = Math.floor(Math.random() * 9000) + 1000
  return `INV-${num}`
}

export function getInitials(name: string): string {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .substring(0, 2)
}

export function calculateGST(subtotal: number, rate = 5): number {
  return Math.round(subtotal * (rate / 100))
}

export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

export const statusColors: Record<string, string> = {
  pending: 'status-pending',
  confirmed: 'status-confirmed',
  baking: 'status-baking',
  ready: 'status-ready',
  delivered: 'status-delivered',
  cancelled: 'status-cancelled',
  paid: 'status-paid',
  unpaid: 'status-unpaid',
  partial: 'status-baking',
}

export const statusLabels: Record<string, string> = {
  pending: 'Pending',
  confirmed: 'Confirmed',
  baking: 'Baking',
  ready: 'Ready',
  delivered: 'Delivered',
  cancelled: 'Cancelled',
  paid: 'Paid',
  unpaid: 'Unpaid',
  partial: 'Partial',
}
