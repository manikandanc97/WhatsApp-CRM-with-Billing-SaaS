'use client'

import { motion, AnimatePresence, Variants } from 'framer-motion'
import { X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'

interface BottomSheetProps {
  open: boolean
  onClose: () => void
  title?: string
  description?: string
  children: React.ReactNode
  className?: string
    size?: 'sm' | 'md' | 'lg' | 'xl' | 'full'
}

const sizeClasses = {
  sm:   'md:max-w-sm',
  md:   'md:max-w-lg',
  lg:   'md:max-w-2xl',
  xl:   'md:max-w-3xl',
  full: 'md:max-w-4xl',
}


const mobileSheet: Variants = {
  hidden:  { y: '100%' },
  visible: { y: 0, transition: { type: 'spring', damping: 28, stiffness: 300, mass: 0.8 } },
  exit:    { y: '100%', transition: { duration: 0.22, ease: 'easeIn' } },
}


const desktopModal: Variants = {
  hidden:  { opacity: 0, scale: 0.96, y: 12 },
  visible: { opacity: 1, scale: 1,    y: 0,  transition: { duration: 0.22, ease: [0.16, 1, 0.3, 1] } },
  exit:    { opacity: 0, scale: 0.95, y: 8,  transition: { duration: 0.18, ease: 'easeIn' } },
}

const overlay: Variants = {
  hidden:  { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.22 } },
  exit:    { opacity: 0, transition: { duration: 0.18 } },
}

export function BottomSheet({
  open,
  onClose,
  title,
  description,
  children,
  className,
  size = 'lg',
}: BottomSheetProps) {
  const [mounted, setMounted] = useState(false)
  const [isDesktop, setIsDesktop] = useState(false)

  useEffect(() => { setMounted(true) }, [])

  useEffect(() => {
    const check = () => setIsDesktop(window.innerWidth >= 768)
    check()
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [])

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

  /* ─── DESKTOP: Centered modal ───────────────────────────────── */
  if (isDesktop) {
    return createPortal(
      <AnimatePresence>
        {open && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            {/* Overlay */}
            <motion.div
              variants={overlay} initial="hidden" animate="visible" exit="exit"
              onClick={onClose}
              className="absolute inset-0 bg-black/50 backdrop-blur-[6px]"
            />

            {/* Modal panel */}
            <motion.div
              variants={desktopModal} initial="hidden" animate="visible" exit="exit"
              className={cn(
                'relative w-full flex flex-col rounded-2xl shadow-2xl',
                'bg-card/95 backdrop-blur-2xl border border-white/10 dark:border-white/5',
                'ring-1 ring-black/5 dark:ring-white/5',
                'max-h-[90vh] overflow-hidden',
                sizeClasses[size],
                className,
              )}
            >
              {}
              <div className="absolute inset-x-0 top-0 h-0.5 bg-gradient-to-r from-brand-500 via-violet-500 to-brand-500 opacity-70 rounded-t-2xl" />

              {}
              {(title || description) && (
                <div className="flex items-start justify-between px-6 pt-5 pb-4 border-b border-border/60 flex-shrink-0">
                  <div className="flex-1 min-w-0 pr-4">
                    {title && (
                      <h2 className="text-[17px] font-bold text-foreground leading-tight tracking-tight">{title}</h2>
                    )}
                    {description && (
                      <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{description}</p>
                    )}
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

    return createPortal(
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[100] flex flex-col justify-end">
          {}
          <motion.div
            variants={overlay} initial="hidden" animate="visible" exit="exit"
            onClick={onClose}
            className="absolute inset-0 bg-black/55 backdrop-blur-sm"
          />

          {}
          <motion.div
            variants={mobileSheet} initial="hidden" animate="visible" exit="exit"
            drag="y"
            dragConstraints={{ top: 0, bottom: 0 }}
            dragElastic={{ top: 0, bottom: 0.5 }}
            onDragEnd={(_, info) => {
              if (info.offset.y > 150 || info.velocity.y > 500) onClose()
            }}
            className={cn(
              'relative w-full max-h-[92dvh] bg-card/95 backdrop-blur-2xl',
              'rounded-t-[28px] shadow-2xl flex flex-col',
              'border-t border-white/10 dark:border-white/5',
              className,
            )}
          >
            {}
            <div className="absolute inset-x-0 top-0 h-0.5 bg-gradient-to-r from-brand-500 via-violet-500 to-brand-500 opacity-60 rounded-t-[28px]" />

            {}
            <div className="w-full flex justify-center pt-3 pb-1 flex-shrink-0">
              <div className="w-10 h-1 bg-muted-foreground/20 rounded-full" />
            </div>

            {}
            {(title || description) && (
              <div className="flex items-start justify-between px-5 pb-4 pt-2 border-b border-border/50 flex-shrink-0">
                <div className="flex-1 min-w-0 pr-3">
                  {title && <h2 className="text-base font-bold text-foreground leading-tight">{title}</h2>}
                  {description && <p className="text-[11px] text-muted-foreground mt-0.5 leading-relaxed">{description}</p>}
                </div>
                <button
                  onClick={onClose}
                  className="w-8 h-8 flex items-center justify-center rounded-full bg-muted/60 hover:bg-muted text-muted-foreground hover:text-foreground transition-colors flex-shrink-0"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            {}
            <div className="overflow-y-auto flex-1 scrollbar-thin pb-[env(safe-area-inset-bottom,16px)]">
              {children}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body,
  )
}
