'use client'

import { motion } from 'framer-motion'
import { Delete } from 'lucide-react'
import { cn } from '@/lib/utils'

interface NumericKeypadProps {
  onPress: (val: string) => void
  onDelete: () => void
  onClear?: () => void
  onDone?: () => void
  className?: string
}

export function NumericKeypad({ onPress, onDelete, onClear, onDone, className }: NumericKeypadProps) {
  const keys = [
    '1', '2', '3',
    '4', '5', '6',
    '7', '8', '9',
    '.', '0'
  ]

  return (
    <div className={cn("grid grid-cols-3 gap-2", className)}>
      {keys.map(k => (
        <motion.button
          key={k}
          whileTap={{ scale: 0.9 }}
          onClick={() => onPress(k)}
          className="h-14 bg-card border border-border rounded-xl text-xl font-medium text-foreground shadow-sm flex items-center justify-center hover:bg-muted transition-colors"
        >
          {k}
        </motion.button>
      ))}
      <motion.button
        whileTap={{ scale: 0.9 }}
        onClick={onDelete}
        className="h-14 bg-muted/50 border border-border rounded-xl text-muted-foreground flex items-center justify-center hover:bg-muted transition-colors"
      >
        <Delete className="w-6 h-6" />
      </motion.button>
      {onDone && (
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={onDone}
          className="col-span-3 h-12 bg-brand-600 dark:bg-brand-500 hover:bg-brand-700 text-white rounded-xl text-sm font-bold shadow-sm transition-colors mt-2"
        >
          Done
        </motion.button>
      )}
    </div>
  )
}
