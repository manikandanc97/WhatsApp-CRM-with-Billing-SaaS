'use client'

import { motion, AnimatePresence, Variants } from 'framer-motion'
import { X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'

interface AnimatedModalProps {
  open: boolean
  onClose: () => void
  title?: string
  description?: string
  children: React.ReactNode
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full'
  className?: string
    icon?: React.ReactNode
    accent?: boolean
}

const sizeClasses = {
  sm:   'max-w-sm',
  md:   'max-w-md',
  lg:   'max-w-lg',
  xl:   'max-w-2xl',
  full: 'max-w-4xl',
}

const overlayVariants: Variants = {
  hidden:  { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.2 } },
  exit:    { opacity: 0, transition: { duration: 0.18 } },
}

const panelVariants: Variants = {
  hidden:  { opacity: 0, scale: 0.95, y: 14 },
  visible: {
    opacity: 1, scale: 1, y: 0,
    transition: { duration: 0.24, ease: [0.16, 1, 0.3, 1] },
  },
  exit: {
    opacity: 0, scale: 0.96, y: 8,
    transition: { duration: 0.18, ease: 'easeIn' },
  },
}

export function AnimatedModal({
  open,
  onClose,
  title,
  description,
  children,
  size = 'md',
  className,
  icon,
  accent = true,
}: AnimatedModalProps) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => { setMounted(true) }, [])

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    if (open) document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [open, onClose])

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [open])

  if (!mounted) return null

  return createPortal(
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            variants={overlayVariants}
            initial="hidden" animate="visible" exit="exit"
            onClick={onClose}
            className="absolute inset-0 bg-black/50 backdrop-blur-[6px]"
          />

          {/* Modal panel */}
          <motion.div
            variants={panelVariants}
            initial="hidden" animate="visible" exit="exit"
            className={cn(
              'relative w-full flex flex-col rounded-2xl shadow-2xl max-h-[90vh] overflow-hidden',
              'bg-card/95 backdrop-blur-2xl',
              'border border-white/10 dark:border-white/5',
              'ring-1 ring-black/5 dark:ring-white/5',
              sizeClasses[size],
              className,
            )}
          >
            {}
            {accent && (
              <div className="absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-brand-500 via-violet-500 to-brand-500 opacity-80 rounded-t-2xl pointer-events-none" />
            )}

            {}
            {(title || description) && (
              <div className="flex items-start justify-between px-6 pt-5 pb-4 border-b border-border/60 flex-shrink-0 bg-gradient-to-b from-muted/30 to-transparent">
                <div className="flex items-start gap-3 flex-1 min-w-0 pr-4">
                  {icon && (
                    <div className="mt-0.5 flex-shrink-0 w-8 h-8 rounded-xl bg-gradient-to-br from-brand-500 to-violet-600 flex items-center justify-center shadow-sm">
                      {icon}
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    {title && (
                      <h2 className="text-[17px] font-bold text-foreground leading-tight tracking-tight">{title}</h2>
                    )}
                    {description && (
                      <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{description}</p>
                    )}
                  </div>
                </div>

                <button
                  onClick={onClose}
                  className="w-8 h-8 flex items-center justify-center rounded-xl bg-muted/60 hover:bg-muted text-muted-foreground hover:text-foreground transition-all duration-150 flex-shrink-0 ring-1 ring-transparent hover:ring-border/50"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}

            {}
            <div className="overflow-y-auto flex-1 scrollbar-thin">
              {children}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body,
  )
}
