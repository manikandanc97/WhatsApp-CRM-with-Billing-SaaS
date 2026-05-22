'use client'

import { motion } from 'framer-motion'
import { TrendingUp, TrendingDown, Minus } from 'lucide-react'
import { cn } from '@/lib/utils'
import { AnimatedCounter } from './AnimatedCounter'
import { AreaChart, Area } from 'recharts'
import type { LucideIcon } from 'lucide-react'

interface PremiumStatsCardProps {
  title: string
  value: number
  change?: number
  changeLabel?: string
  icon: LucideIcon
  isCurrency?: boolean
  prefix?: string
  suffix?: string
  sparkData?: { v: number }[]
  variant?: 'blue' | 'violet' | 'green' | 'amber' | 'rose'
  index?: number
  className?: string
}

const variantConfig = {
  blue: {
    card:     'border-blue-100/80 dark:border-blue-900/30',
    iconBg:   'bg-blue-100 dark:bg-blue-900/40',
    iconText: 'text-blue-600 dark:text-blue-400',
    glow:     'hover:glow-blue',
    topBar:   'from-blue-500 to-blue-400',
    spark:    '#3b82f6',
    sparkFill:'rgba(59,130,246,0.15)',
    badge:    'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400',
  },
  violet: {
    card:     'border-violet-100/80 dark:border-violet-900/30',
    iconBg:   'bg-violet-100 dark:bg-violet-900/40',
    iconText: 'text-violet-600 dark:text-violet-400',
    glow:     'hover:glow-violet',
    topBar:   'from-violet-500 to-violet-400',
    spark:    '#8b5cf6',
    sparkFill:'rgba(139,92,246,0.15)',
    badge:    'bg-violet-50 dark:bg-violet-900/30 text-violet-600 dark:text-violet-400',
  },
  green: {
    card:     'border-emerald-100/80 dark:border-emerald-900/30',
    iconBg:   'bg-emerald-100 dark:bg-emerald-900/40',
    iconText: 'text-emerald-600 dark:text-emerald-400',
    glow:     'hover:glow-green',
    topBar:   'from-emerald-500 to-emerald-400',
    spark:    '#10b981',
    sparkFill:'rgba(16,185,129,0.15)',
    badge:    'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400',
  },
  amber: {
    card:     'border-amber-100/80 dark:border-amber-900/30',
    iconBg:   'bg-amber-100 dark:bg-amber-900/40',
    iconText: 'text-amber-600 dark:text-amber-400',
    glow:     'hover:glow-amber',
    topBar:   'from-amber-500 to-amber-400',
    spark:    '#f59e0b',
    sparkFill:'rgba(245,158,11,0.15)',
    badge:    'bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400',
  },
  rose: {
    card:     'border-rose-100/80 dark:border-rose-900/30',
    iconBg:   'bg-rose-100 dark:bg-rose-900/40',
    iconText: 'text-rose-600 dark:text-rose-400',
    glow:     'hover:glow-rose',
    topBar:   'from-rose-500 to-rose-400',
    spark:    '#f43f5e',
    sparkFill:'rgba(244,63,94,0.15)',
    badge:    'bg-rose-50 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400',
  },
}

export function PremiumStatsCard({
  title, value, change, changeLabel = 'vs last week',
  icon: Icon, isCurrency = false, prefix = '', suffix = '',
  sparkData, variant = 'blue', index = 0, className,
}: PremiumStatsCardProps) {
  const cfg = variantConfig[variant]
  const isPositive = change !== undefined && change > 0
  const isNegative = change !== undefined && change < 0

  const formatFn = isCurrency
    ? (v: number) => '₹' + (v >= 100000 ? (v / 100000).toFixed(1) + 'L' : v >= 1000 ? (v / 1000).toFixed(1) + 'K' : Math.floor(v).toLocaleString('en-IN'))
    : undefined

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.07, ease: [0.16, 1, 0.3, 1] }}
      whileHover={{ y: -3, transition: { duration: 0.2 } }}
      className={cn(
        'relative bg-card border rounded-2xl overflow-hidden cursor-default',
        'transition-all duration-300 shadow-sm hover:shadow-lg',
        cfg.card, cfg.glow, className
      )}
    >
      {}
      <div className={cn('absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r', cfg.topBar)} />

      <div className="p-5">
        {}
        <div className="flex items-start justify-between mb-4">
          <div>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">{title}</p>
          </div>
          <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm', cfg.iconBg)}>
            <Icon className={cn('w-5 h-5', cfg.iconText)} />
          </div>
        </div>

        {}
        <div className="flex items-end justify-between gap-3">
          <div className="space-y-1.5">
            <div className="flex items-baseline gap-1">
              <AnimatedCounter
                value={value}
                formatFn={isCurrency ? formatFn : undefined}
                prefix={!isCurrency ? prefix : ''}
                suffix={suffix}
                duration={1000}
                className="text-2xl font-bold text-foreground tracking-tight tabular-nums"
              />
            </div>

            {change !== undefined && (
              <div className="flex items-center gap-1.5">
                <div className={cn(
                  'flex items-center gap-0.5 text-xs font-semibold px-1.5 py-0.5 rounded-md',
                  isPositive ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
                  : isNegative ? 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400'
                  : 'bg-muted text-muted-foreground'
                )}>
                  {isPositive ? <TrendingUp className="w-3 h-3" />
                  : isNegative ? <TrendingDown className="w-3 h-3" />
                  : <Minus className="w-3 h-3" />}
                  <span>{Math.abs(change)}%</span>
                </div>
                <span className="text-[11px] text-muted-foreground">{changeLabel}</span>
              </div>
            )}
          </div>

          {}
          {sparkData && sparkData.length > 0 && (
            <div className="w-20 h-12 flex-shrink-0">
              <AreaChart width={80} height={48} data={sparkData} margin={{ top: 2, right: 0, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id={`sg-${variant}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={cfg.spark} stopOpacity={0.3} />
                    <stop offset="95%" stopColor={cfg.spark} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <Area
                  type="monotone"
                  dataKey="v"
                  stroke={cfg.spark}
                  strokeWidth={2}
                  fill={`url(#sg-${variant})`}
                  dot={false}
                  isAnimationActive={true}
                  animationDuration={1200}
                  animationEasing="ease-out"
                />
              </AreaChart>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  )
}
