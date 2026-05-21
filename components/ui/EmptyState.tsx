'use client'

import { motion } from 'framer-motion'
import { LucideIcon, PackageSearch } from 'lucide-react'
import { fadeInUp } from '@/lib/animations'

interface EmptyStateProps {
  icon?: LucideIcon
  title: string
  description?: string
  action?: React.ReactNode
  emoji?: string
}

export function EmptyState({
  icon: Icon = PackageSearch,
  title,
  description,
  action,
  emoji,
}: EmptyStateProps) {
  return (
    <motion.div
      variants={fadeInUp}
      initial="hidden"
      animate="visible"
      className="flex flex-col items-center justify-center py-16 px-4 text-center"
    >
      <div className="relative mb-4">
        <div className="w-20 h-20 rounded-2xl bg-muted border border-border/80 flex items-center justify-center">
          {emoji ? (
            <span className="text-4xl">{emoji}</span>
          ) : (
            <Icon className="w-9 h-9 text-muted-foreground" />
          )}
        </div>
      </div>
      <h3 className="text-base font-semibold text-foreground mb-1">{title}</h3>
      {description && (
        <p className="text-sm text-muted-foreground max-w-xs mb-4">{description}</p>
      )}
      {action && <div>{action}</div>}
    </motion.div>
  )
}
