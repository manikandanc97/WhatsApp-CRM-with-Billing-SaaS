'use client'

import { cn, statusColors, statusLabels } from '@/lib/utils'
import { OrderStatus, PaymentStatus } from '@/types'

type Status = OrderStatus | PaymentStatus | 'online' | 'offline' | 'draft' | 'sent' | 'overdue' | string

interface StatusBadgeProps {
  status: Status
  size?: 'sm' | 'md'
  dot?: boolean
}

const extraColors: Record<string, string> = {
  online: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
  offline: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400',
  draft: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400',
  sent: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  overdue: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
}

export function StatusBadge({ status, size = 'md', dot = false }: StatusBadgeProps) {
  const colorClass = statusColors[status] || extraColors[status] || 'bg-gray-100 text-gray-600'
  const label = statusLabels[status] || (status.charAt(0).toUpperCase() + status.slice(1))

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 font-medium rounded-full',
        colorClass,
        size === 'sm' ? 'text-[11px] px-2 py-0.5' : 'text-xs px-2.5 py-1'
      )}
    >
      {dot && (
        <span className="w-1.5 h-1.5 rounded-full bg-current opacity-70" />
      )}
      {label}
    </span>
  )
}
