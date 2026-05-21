'use client'

import { Sidebar } from './Sidebar'
import { TopNavbar } from './TopNavbar'
import { MobileHeader } from './MobileHeader'
import { MobileBottomNav } from './MobileBottomNav'
import { useAppStore } from '@/store/useAppStore'
import { motion, AnimatePresence } from 'framer-motion'
import toast, { Toaster } from 'react-hot-toast'
import { usePathname, useRouter } from 'next/navigation'
import { useEffect } from 'react'

export function AppLayout({ children }: { children: React.ReactNode }) {
  const { token, sidebarOpen, addOrder, chats, sendMessage } = useAppStore()
  const pathname = usePathname()
  const router = useRouter()

  const isAuthRoute =
    pathname === '/login' ||
    pathname === '/signup' ||
    pathname === '/forgot-password' ||
    pathname === '/reset-password' ||
    pathname === '/otp-verify'

  // Route protection
  useEffect(() => {
    if (!token && !isAuthRoute) {
      router.push('/login')
    } else if (token && isAuthRoute) {
      router.push('/dashboard')
    }
  }, [token, isAuthRoute, pathname, router])

  // Live Simulator Engine
  useEffect(() => {
    if (!token) return

    const interval = setInterval(() => {
      const chance = Math.random()
      if (chance < 0.3) {
        const names = ['Amit Patel', 'Sneha Reddy', 'Vijay Kumar', 'Karan Johar', 'Neha Gupta']
        const itemsList = [
          { name: 'Red Velvet Cake', price: 900 },
          { name: 'Chocolate Truffle Cake', price: 850 },
          { name: 'Mango Delight Cake', price: 750 },
          { name: 'Pineapple Cake', price: 650 }
        ]
        const randomName = names[Math.floor(Math.random() * names.length)]
        const randomItem = itemsList[Math.floor(Math.random() * itemsList.length)]
        const orderNum = `SF-${new Date().getFullYear()}-${Math.floor(Math.random() * 900 + 100)}`
        const newOrd = {
          id: Math.random().toString(36).substring(2, 9),
          orderNumber: orderNum,
          customerId: 'cust-dummy',
          customerName: randomName,
          customerPhone: '+91 98765 ' + Math.floor(Math.random() * 90000 + 10000),
          items: [{
            productId: 'prod-dummy',
            productName: randomItem.name,
            quantity: 1,
            price: randomItem.price
          }],
          status: 'pending' as const,
          paymentStatus: 'unpaid' as const,
          deliveryType: 'delivery' as const,
          deliveryDate: new Date(Date.now() + 86400000).toISOString().split('T')[0],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          subtotal: randomItem.price,
          tax: Math.round(randomItem.price * 0.05),
          total: Math.round(randomItem.price * 1.05),
          notes: 'Simulated live order'
        }
        addOrder(newOrd)
        toast.success(`New order received: ${orderNum} from ${randomName}! 🎂`, {
          icon: '🎁',
          duration: 5000
        })
      } else if (chance < 0.6) {
        if (chats.length === 0) return
        const randomChat = chats[Math.floor(Math.random() * chats.length)]
        const questions = [
          'Do you have eggless options for Chocolate Truffle?',
          'What is the price for 2kg Red Velvet cake?',
          'Can I change my delivery time to 5 PM tomorrow?',
          'Do you deliver to Anna Nagar?',
          'Can we add a personalized message on the cake?'
        ]
        const randomQuestion = questions[Math.floor(Math.random() * questions.length)]

        const incomingMsg = {
          id: Math.random().toString(36).substring(2, 9),
          chatId: randomChat.id,
          content: randomQuestion,
          sender: 'customer' as const,
          timestamp: new Date().toISOString(),
          read: false,
          type: 'text' as const
        }

        sendMessage(randomChat.id, incomingMsg)

        toast(`WhatsApp from ${randomChat.customerName}: "${randomQuestion.substring(0, 30)}..."`, {
          icon: '💬',
          duration: 5000
        })
      } else {
        const randomPaid = Math.floor(Math.random() * 2000 + 500)
        toast.success(`Payment confirmed: received ₹${randomPaid} via UPI! ✅`, {
          duration: 4000
        })
      }
    }, 45000)

    return () => clearInterval(interval)
  }, [token, chats, addOrder, sendMessage])

  const toasterConfig = {
    duration: 3000,
    style: {
      background: 'hsl(var(--card))',
      color: 'hsl(var(--foreground))',
      border: '1px solid hsl(var(--border))',
      borderRadius: '999px',
      fontSize: '13px',
      fontWeight: '600',
      boxShadow: '0 8px 32px 0 rgb(0 0 0 / 0.12)',
    },
  }

  if (isAuthRoute) {
    return (
      <div className="h-dvh w-dvw bg-background overflow-hidden relative">
        <Toaster position="top-center" toastOptions={toasterConfig} />
        <main className="h-full w-full flex items-center justify-center p-4">
          {children}
        </main>
      </div>
    )
  }

  return (
    <div className="h-dvh w-dvw bg-background overflow-hidden flex">
      <Toaster
        position="top-right"
        toastOptions={{
          ...toasterConfig,
          style: { ...toasterConfig.style, marginTop: '0px' },
        }}
      />

      {/* ════════════════════════════════════════════
          DESKTOP SIDEBAR  (lg+ only)
          The Sidebar is fixed-position internally.
          This spacer div animates to push the main 
          content area rightward in sync.
      ════════════════════════════════════════════ */}
      <motion.div
        className="hidden lg:block flex-shrink-0"
        animate={{ width: sidebarOpen ? 260 : 72 }}
        transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
      />
      <Sidebar />

      {/* ════════════════════════════════════════════
          MAIN CONTENT COLUMN
      ════════════════════════════════════════════ */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">

        {/* Desktop TopNavbar — hidden on mobile */}
        <div className="hidden lg:block">
          <TopNavbar />
        </div>

        {/* Mobile Header — hidden on desktop */}
        <div className="lg:hidden">
          <MobileHeader />
        </div>

        {/* ── Page content ── */}
        <main className={[
          'flex-1 overflow-hidden flex flex-col',
          // Mobile: offset for fixed MobileHeader top
          'pt-[72px]',
          // Desktop: no offsets (TopNavbar is in flow)
          'lg:pt-0',
          // Desktop content background
          'bg-background lg:bg-muted/20',
        ].join(' ')}>
          <AnimatePresence mode="wait">
            <motion.div
              key={pathname}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.18 }}
              className={
                pathname.startsWith('/whatsapp')
                  // WhatsApp manages its own scrolling internally — must be overflow-hidden
                  ? 'flex-1 min-h-0 overflow-hidden'
                  // All other pages: scrollable, with mobile bottom nav clearance
                  : 'flex-1 min-h-0 overflow-y-auto overflow-x-hidden pb-[88px] lg:pb-0'
              }
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </main>

        {/* Mobile Bottom Nav — hidden on desktop */}
        <div className="lg:hidden">
          <MobileBottomNav />
        </div>
      </div>
    </div>
  )
}
