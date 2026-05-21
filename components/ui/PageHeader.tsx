'use client'

import { cn } from '@/lib/utils'
import { motion } from 'framer-motion'

interface PageHeaderProps {
  title: string
  description?: string
  action?: React.ReactNode
  badge?: string
  className?: string
}

export function PageHeader({ title, description, action, badge, className }: PageHeaderProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={cn('flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6', className)}
    >
      <div>
        <div className="flex items-center gap-2.5">
          <h1 className="text-xl font-bold text-foreground">{title}</h1>
          {badge && (
            <span className="text-xs font-medium px-2 py-0.5 bg-brand-50 dark:bg-brand-950/30 text-brand-600 dark:text-brand-400 rounded-full border border-brand-200 dark:border-brand-800">
              {badge}
            </span>
          )}
        </div>
        {description && (
          <p className="text-sm text-muted-foreground mt-0.5">{description}</p>
        )}
      </div>
      {action && <div className="flex-shrink-0">{action}</div>}
    </motion.div>
  )
}
