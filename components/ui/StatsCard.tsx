'use client'

import { motion } from 'framer-motion'
import { TrendingUp, TrendingDown, Minus } from 'lucide-react'
import { cn, formatCurrency } from '@/lib/utils'
import { staggerItem } from '@/lib/animations'
import type { LucideIcon } from 'lucide-react'

interface StatsCardProps {
  title: string
  value: string | number
  change?: number
  changeLabel?: string
  icon: LucideIcon
  iconColor?: string
  iconBg?: string
  prefix?: string
  suffix?: string
  isCurrency?: boolean
  variant?: 'blue' | 'violet' | 'green' | 'orange' | 'default'
}

export function StatsCard({
  title,
  value,
  change,
  changeLabel = 'vs last week',
  icon: Icon,
  iconColor,
  iconBg,
  prefix,
  suffix,
  isCurrency = false,
  variant = 'default',
}: StatsCardProps) {
  const isPositive = change !== undefined && change > 0
  const isNegative = change !== undefined && change < 0
  const displayValue = isCurrency && typeof value === 'number'
    ? formatCurrency(value)
    : value

  const variantStyles = {
    blue: {
      bg: 'bg-blue-50/40 dark:bg-blue-950/10 border-blue-100 dark:border-blue-900/30 border-t-[3px] border-t-blue-500',
      iconBg: 'bg-blue-100 dark:bg-blue-900/40',
      iconColor: 'text-blue-600 dark:text-blue-400',
    },
    violet: {
      bg: 'bg-violet-50/40 dark:bg-violet-950/10 border-violet-100 dark:border-violet-900/30 border-t-[3px] border-t-violet-500',
      iconBg: 'bg-violet-100 dark:bg-violet-900/40',
      iconColor: 'text-violet-600 dark:text-violet-400',
    },
    green: {
      bg: 'bg-emerald-50/40 dark:bg-emerald-950/10 border-emerald-100 dark:border-emerald-900/30 border-t-[3px] border-t-emerald-500',
      iconBg: 'bg-emerald-100 dark:bg-emerald-900/40',
      iconColor: 'text-emerald-600 dark:text-emerald-400',
    },
    orange: {
      bg: 'bg-amber-50/40 dark:bg-amber-950/10 border-amber-100 dark:border-amber-900/30 border-t-[3px] border-t-amber-500',
      iconBg: 'bg-amber-100 dark:bg-amber-900/40',
      iconColor: 'text-amber-600 dark:text-amber-400',
    },
    default: {
      bg: 'bg-card border-border border-t-[3px] border-t-slate-400 dark:border-t-slate-600',
      iconBg: 'bg-muted',
      iconColor: 'text-muted-foreground',
    }
  }

  const styles = variantStyles[variant]

  return (
    <motion.div
      variants={staggerItem}
      whileHover={{ y: -1, transition: { duration: 0.2 } }}
      className={cn(
        styles.bg,
        "border rounded-2xl p-5 shadow-sm hover:shadow-md transition-all duration-300 cursor-default"
      )}
    >
      <div className="flex items-start justify-between mb-4">
        <p className="text-sm font-medium text-muted-foreground">{title}</p>
        <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center', iconBg || styles.iconBg)}>
          <Icon className={cn('w-5 h-5', iconColor || styles.iconColor)} />
        </div>
      </div>

      <div className="space-y-1.5">
        <div className="flex items-baseline gap-1">
          {prefix && <span className="text-lg text-muted-foreground">{prefix}</span>}
          <span className="text-2xl font-bold text-foreground tracking-tight">{displayValue}</span>
          {suffix && <span className="text-sm text-muted-foreground">{suffix}</span>}
        </div>

        {change !== undefined && (
          <div className="flex items-center gap-1.5">
            <div
              className={cn(
                'flex items-center gap-0.5 text-xs font-medium',
                isPositive ? 'text-emerald-600' : isNegative ? 'text-red-500' : 'text-muted-foreground'
              )}
            >
              {isPositive ? (
                <TrendingUp className="w-3.5 h-3.5" />
              ) : isNegative ? (
                <TrendingDown className="w-3.5 h-3.5" />
              ) : (
                <Minus className="w-3.5 h-3.5" />
              )}
              <span>{Math.abs(change)}%</span>
            </div>
            <span className="text-xs text-muted-foreground">{changeLabel}</span>
          </div>
        )}
      </div>
    </motion.div>
  )
}
