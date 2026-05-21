'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  Home,
  ShoppingBag,
  MessageCircle,
  Receipt,
  Users,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { motion } from 'framer-motion'

const navItems = [
  { href: '/dashboard', label: 'Home', icon: Home },
  { href: '/orders', label: 'Orders', icon: ShoppingBag },
  { href: '/billing', label: 'Billing', icon: Receipt },
  { href: '/whatsapp', label: 'Chats', icon: MessageCircle },
  { href: '/customers', label: 'Customers', icon: Users },
]

export function MobileBottomNav() {
  const pathname = usePathname()

  return (
    <nav className="fixed bottom-5 left-4 right-4 z-40 bg-card/85 backdrop-blur-xl border border-border/30 dark:border-white/5 shadow-[0_12px_40px_-12px_rgba(0,0,0,0.15)] dark:shadow-[0_12px_40px_-12px_rgba(0,0,0,0.4)] rounded-[24px] py-2 px-1 max-w-lg mx-auto">
      <div className="flex items-center justify-around relative">
        {navItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
          const Icon = item.icon
          return (
            <Link 
              key={item.href} 
              href={item.href} 
              className="flex-1 relative z-10 flex flex-col items-center justify-center group"
            >
              <motion.div
                whileTap={{ scale: 0.9 }}
                className="flex flex-col items-center gap-1 py-1.5 px-3 rounded-2xl relative w-full"
              >
                {isActive && (
                  <motion.div
                    layoutId="bottom-nav-indicator"
                    className="absolute inset-0 bg-brand-500/10 dark:bg-brand-500/15 rounded-2xl -z-10"
                    transition={{ type: "spring", stiffness: 380, damping: 30 }}
                  />
                )}
                <Icon
                  className={cn(
                    'w-5 h-5 transition-all duration-300',
                    isActive 
                      ? 'text-brand-600 dark:text-brand-400 drop-shadow-sm scale-110' 
                      : 'text-muted-foreground/75 group-hover:text-foreground'
                  )}
                  strokeWidth={isActive ? 2.5 : 2}
                />
                <span
                  className={cn(
                    'text-[10px] font-bold transition-all duration-300 tracking-tight',
                    isActive 
                      ? 'text-brand-700 dark:text-brand-400 opacity-100' 
                      : 'text-muted-foreground/75 opacity-90'
                  )}
                >
                  {item.label}
                </span>
              </motion.div>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}

