'use client'

import { useEffect, useState, useRef, useMemo, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Send, FileText, ChevronLeft, Phone, MoreVertical,
  Sparkles, CheckCheck, X, BarChart3, MessageSquare
} from 'lucide-react'
import { SearchInput } from '@/components/ui/SearchInput'
import { ChatSkeleton } from '@/components/ui/LoadingSkeleton'
import { BottomSheet } from '@/components/ui/BottomSheet'
import { useAppStore } from '@/store/useAppStore'
import { useMounted } from '@/hooks/useMounted'
import { formatTime, formatRelativeTime, generateId, getInitials, cn } from '@/lib/utils'
import type { Message } from '@/types'
import toast from 'react-hot-toast'

/* ─── Constants ─────────────────────────────── */
const AI_REPLIES: Record<string, string> = {
  default: 'Thanks for reaching out! 😊 How can I help you today?',
  cake: 'Yes, we have a wide variety of cakes! 🎂 Chocolate Truffle, Red Velvet, Mango Delight and more. Which flavour would you like?',
  price: 'Our cakes start from ₹650/kg. Custom cakes are priced based on design. Would you like a quote?',
  order: "I'd be happy to take your order! 🛍️ Please let me know the cake type, weight, and preferred delivery date.",
  delivery: 'We deliver within 10 km radius. Delivery charges: ₹50-100 based on distance. Same-day delivery available!',
  eggless: 'Yes! 🌱 All our cakes can be made eggless. Our Eggless Chocolate is the most popular. Same great taste, guaranteed!',
  thanks: "You're welcome! 😊 We look forward to making your celebration special. Visit us again! 🎂",
  birthday: '🎉 Happy to help with birthday celebrations! We offer custom photo cakes, character cakes, and more. What\'s the occasion?',
  hello: 'Hello! 👋 Welcome to SweetFlow Bakery. How can I assist you today?',
  hi: 'Hi there! 😊 Welcome to SweetFlow Bakery. What can we bake for you today?',
}

const TEMPLATES = [
  { id: 't1', label: 'Festive Greeting', message: '🎉 Happy Holidays from SweetFlow! Enjoy 15% off all custom cakes this week. Reply YES to book your slot.', emoji: '🎉' },
  { id: 't2', label: 'Payment Reminder', message: 'Hi there, this is a gentle reminder that your invoice is pending payment. Pay via UPI: sweetflow@upi. Thank you! 🎂', emoji: '💳' },
  { id: 't3', label: 'Review Request', message: 'Hi! Hope you enjoyed your cake 🎂. Could you take a moment to leave us a quick review on Google? It helps us a lot! ⭐', emoji: '⭐' },
  { id: 't4', label: 'New Menu Alert', message: '🍰 We just launched our new Mango Season special menu! Check out our catalog to place an order today.', emoji: '🥭' },
]

function getAIReply(msg: string): string {
  const l = msg.toLowerCase()
  for (const [k, v] of Object.entries(AI_REPLIES)) {
    if (l.includes(k)) return v
  }
  return AI_REPLIES.default
}

/* ─── Sub-components ────────────────────────── */
function TypingIndicator() {
  return (
    <div className="flex items-end gap-2 px-4 py-1.5">
      <div className="w-7 h-7 rounded-full bg-brand-100 dark:bg-brand-900/60 flex items-center justify-center text-brand-600 dark:text-brand-400 flex-shrink-0">
        <Sparkles className="w-3.5 h-3.5" />
      </div>
      <div className="bubble-received px-4 py-3 flex items-center gap-1.5">
        {[0, 1, 2].map(i => (
          <motion.span
            key={i}
            className="block w-2 h-2 bg-muted-foreground/50 rounded-full"
            animate={{ y: [0, -5, 0] }}
            transition={{ duration: 0.7, repeat: Infinity, delay: i * 0.18, ease: 'easeInOut' }}
          />
        ))}
      </div>
    </div>
  )
}

function DateLabel({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-2 px-4 py-2 my-1">
      <div className="flex-1 h-px bg-border/50" />
      <span className="text-[10px] font-semibold text-muted-foreground bg-muted/60 px-2.5 py-0.5 rounded-full border border-border/40 select-none">
        {label}
      </span>
      <div className="flex-1 h-px bg-border/50" />
    </div>
  )
}

function Wallpaper() {
  return (
    <div className="absolute inset-0 pointer-events-none z-0" aria-hidden>
      <svg width="100%" height="100%" className="opacity-[0.035] dark:opacity-[0.05]">
        <defs>
          <pattern id="wa-dots" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
            <circle cx="2" cy="2" r="1.5" fill="currentColor" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#wa-dots)" />
      </svg>
    </div>
  )
}

function Bubble({ msg, customerName }: { msg: Message; customerName: string }) {
  const isOut = msg.sender !== 'customer'
  const isAI = msg.sender === 'ai'
  const isInv = msg.type === 'invoice'

  return (
    <motion.div
      initial={{ opacity: 0, y: 6, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.18, ease: 'easeOut' }}
      className={cn('flex items-end gap-2 px-4', isOut ? 'flex-row-reverse' : '')}
    >
      {/* Avatar */}
      {!isOut && (
        <div className="w-7 h-7 rounded-full bg-gradient-to-br from-slate-400 to-slate-500 flex items-center justify-center text-white text-[9px] font-bold flex-shrink-0 mb-1 shadow-sm">
          {getInitials(customerName)}
        </div>
      )}
      {isAI && (
        <div className="w-7 h-7 rounded-full bg-brand-100 dark:bg-brand-900/60 flex items-center justify-center text-brand-600 dark:text-brand-400 flex-shrink-0 mb-1 border border-brand-200/50 shadow-sm">
          <Sparkles className="w-3.5 h-3.5" />
        </div>
      )}

      {/* Content */}
      <div className={cn('max-w-[78%]', isInv && 'w-[260px] max-w-[260px]')}>
        {isInv ? (
          <div className="bg-gradient-to-br from-emerald-500 to-emerald-700 rounded-2xl rounded-tr-sm p-4 text-white shadow-md">
            <div className="flex items-center gap-2 mb-2 bg-black/15 w-fit px-2.5 py-1 rounded-lg">
              <FileText className="w-3.5 h-3.5" />
              <span className="text-[10px] font-bold uppercase tracking-wider">Invoice</span>
            </div>
            <p className="text-xs font-medium leading-relaxed">{msg.content}</p>
          </div>
        ) : (
          <div className={cn(
            'px-4 py-2.5 text-sm leading-relaxed font-medium shadow-sm',
            isOut ? 'bubble-sent' : 'bubble-received',
          )}>
            {msg.content}
          </div>
        )}
        <div className={cn('flex items-center gap-1 mt-1 px-1', isOut ? 'flex-row-reverse' : '')}>
          <span className="text-[9px] text-muted-foreground/60 font-semibold">{formatTime(msg.timestamp)}</span>
          {isOut && (
            <CheckCheck className={cn('w-3 h-3', msg.read ? 'text-blue-400' : 'text-muted-foreground/40')} />
          )}
          {isAI && <span className="text-[8px] text-brand-400 font-bold ml-0.5">AI</span>}
        </div>
      </div>
    </motion.div>
  )
}

/* ─── Page ─────────────────────────────────── */
export default function WhatsAppPage() {
  const mounted = useMounted()
  const [search, setSearch] = useState('')
  const [input, setInput] = useState('')
  const [showTemplates, setShowTemplates] = useState(false)
  const [showAnalytics, setShowAnalytics] = useState(false)
  const [aiOn, setAiOn] = useState(true)

  const endRef = useRef<HTMLDivElement>(null)
  const taRef = useRef<HTMLTextAreaElement>(null)
  const msgsRef = useRef<HTMLDivElement>(null)

  const {
    chats, activeChatId, isTyping,
    setActiveChat, sendMessage, markAsRead, setTyping, customers,
  } = useAppStore()

  /* scroll to latest msg */
  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [chats, activeChatId, isTyping])

  /* textarea auto-resize */
  useEffect(() => {
    const el = taRef.current
    if (!el) return
    el.style.height = 'auto'
    el.style.height = Math.min(el.scrollHeight, 120) + 'px'
  }, [input])

  /* enrich chats */
  const enriched = useMemo(() =>
    chats.map(c => ({
      ...c,
      tags: customers.find(cu => cu.id === c.customerId)?.tags ?? [],
    })),
    [chats, customers]
  )

  const activeChat = enriched.find(c => c.id === activeChatId)

  const filtered = useMemo(() =>
    enriched
      .filter(c => !search || c.customerName.toLowerCase().includes(search.toLowerCase()) || c.lastMessage.toLowerCase().includes(search.toLowerCase()))
      .sort((a, b) => new Date(b.lastMessageTime).getTime() - new Date(a.lastMessageTime).getTime()),
    [enriched, search]
  )

  const stats = useMemo(() => {
    const total = chats.reduce((n, c) => n + c.messages.length, 0)
    const agent = chats.reduce((n, c) => n + c.messages.filter(m => m.sender === 'agent').length, 0)
    const ai = chats.reduce((n, c) => n + c.messages.filter(m => m.sender === 'ai').length, 0)
    const unread = chats.reduce((n, c) => n + c.unreadCount, 0)
    return { total, agent, ai, unread, chats: chats.length }
  }, [chats])

  function selectChat(id: string) {
    setActiveChat(id)
    markAsRead(id)
    setShowTemplates(false)
    setTimeout(() => taRef.current?.focus(), 250)
  }

  const send = useCallback((text: string) => {
    if (!activeChatId || !text.trim()) return
    sendMessage(activeChatId, {
      id: generateId(), chatId: activeChatId,
      content: text.trim(), sender: 'agent',
      timestamp: new Date().toISOString(), read: true, type: 'text',
    })
    setInput('')
    setShowTemplates(false)
    if (aiOn) {
      setTyping(true)
      setTimeout(() => {
        setTyping(false)
        sendMessage(activeChatId, {
          id: generateId(), chatId: activeChatId,
          content: getAIReply(text), sender: 'ai',
          timestamp: new Date().toISOString(), read: true, type: 'text',
        })
      }, 1200 + Math.random() * 800)
    }
  }, [activeChatId, aiOn, sendMessage, setTyping])

  function sendInvoice() {
    if (!activeChatId) return
    sendMessage(activeChatId, {
      id: generateId(), chatId: activeChatId,
      content: `📄 Invoice #SF-2024-${Math.floor(Math.random() * 900 + 100)} sent! Total: ₹2,153 | Pay via UPI: sweetflow@upi`,
      sender: 'agent', timestamp: new Date().toISOString(), read: true, type: 'invoice',
    })
    toast.success('Invoice sent via WhatsApp! ✅')
  }

  /* ── Render ─────────────────────────────────── */
  return (
    <div className="wa-root">

      {/* ════════════ CHAT LIST ════════════ */}
      <div className={cn('wa-list', activeChatId ? 'wa-list--hidden' : 'wa-list--visible')}>

        {/* List Header */}
        <div className="flex items-center gap-3 px-4 py-3 border-b border-border bg-card/95 backdrop-blur-sm flex-shrink-0">
          <div className="flex-1 min-w-0">
            <h1 className="text-[15px] font-black text-foreground tracking-tight">WhatsApp CRM</h1>
            <p className="text-[10px] text-muted-foreground font-medium">
              {mounted ? `${filtered.length} conversation${filtered.length !== 1 ? 's' : ''}` : '…'}
            </p>
          </div>
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => {
                setAiOn(v => !v)
                toast.success(aiOn ? 'Auto-reply paused' : 'AI auto-reply activated ✨')
              }}
              className={cn(
                'flex items-center gap-1 px-2.5 py-1.5 rounded-full text-[10px] font-bold border transition-all select-none',
                aiOn
                  ? 'bg-brand-50 text-brand-700 border-brand-200 dark:bg-brand-950/40 dark:text-brand-300 dark:border-brand-800'
                  : 'bg-muted text-muted-foreground border-border'
              )}
            >
              <Sparkles className={cn('w-3 h-3', aiOn && 'text-brand-500')} />
              {aiOn ? 'AI On' : 'AI Off'}
            </button>
            <button
              onClick={() => setShowAnalytics(true)}
              className="w-8 h-8 flex items-center justify-center rounded-full border border-border bg-card hover:bg-muted text-muted-foreground transition-colors"
            >
              <BarChart3 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Search */}
        <div className="px-3 py-2 border-b border-border/50 bg-background/50 flex-shrink-0">
          <SearchInput placeholder="Search chats..." value={search} onChange={setSearch} />
        </div>

        {/* Chat rows */}
        <div className="flex-1 overflow-y-auto overscroll-contain">
          {!mounted ? (
            <ChatSkeleton />
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 gap-3 text-center px-6">
              <div className="w-16 h-16 rounded-2xl bg-muted border border-border flex items-center justify-center">
                <MessageSquare className="w-7 h-7 text-muted-foreground/40" />
              </div>
              <p className="text-sm text-muted-foreground">No chats found</p>
            </div>
          ) : (
            filtered.map(chat => (
              <button
                key={chat.id}
                onClick={() => selectChat(chat.id)}
                className={cn(
                  'w-full flex items-center gap-3 px-4 py-3 border-b border-border/40 text-left',
                  'border-l-[3px] transition-colors active:bg-muted/60',
                  activeChatId === chat.id
                    ? 'bg-brand-50/80 dark:bg-brand-950/30 border-l-brand-500'
                    : 'border-l-transparent hover:bg-muted/30'
                )}
              >
                {/* Avatar */}
                <div className="relative flex-shrink-0">
                  <div className="w-11 h-11 rounded-full bg-gradient-to-br from-brand-500 to-violet-600 flex items-center justify-center text-white text-xs font-bold shadow-sm">
                    {getInitials(chat.customerName)}
                  </div>
                  {chat.online && (
                    <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 rounded-full ring-2 ring-background" />
                  )}
                </div>
                {/* Text */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-0.5">
                    <p className="text-sm font-bold text-foreground truncate pr-2">{chat.customerName}</p>
                    <p className="text-[10px] text-muted-foreground/60 font-medium flex-shrink-0">
                      {formatRelativeTime(chat.lastMessageTime)}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <p className="text-xs text-muted-foreground truncate font-medium flex-1 min-w-0">
                      {chat.lastMessage}
                    </p>
                    {chat.unreadCount > 0 && (
                      <span className="flex-shrink-0 min-w-[18px] h-[18px] px-1 bg-brand-600 dark:bg-brand-500 rounded-full text-[10px] text-white font-bold flex items-center justify-center">
                        {chat.unreadCount > 9 ? '9+' : chat.unreadCount}
                      </span>
                    )}
                  </div>
                  {chat.tags && chat.tags.length > 0 && (
                    <div className="flex gap-1 mt-1">
                      {chat.tags.slice(0, 2).map(t => (
                        <span key={t} className="text-[8px] bg-muted px-1.5 py-0.5 rounded font-bold uppercase tracking-wide text-muted-foreground">
                          {t}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </button>
            ))
          )}
        </div>
      </div>

      {/* ════════════ CHAT PANEL ════════════ */}
      <AnimatePresence>
        {activeChatId && (
          <motion.div
            key={activeChatId}
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 320, mass: 0.9 }}
            className="wa-chat"
          >
            <Wallpaper />

            {/* Chat header */}
            <div className="relative z-20 flex items-center gap-2.5 px-3 py-2.5 border-b border-border bg-card/92 backdrop-blur-xl shadow-sm flex-shrink-0">
              <button
                onClick={() => setActiveChat(null)}
                className="lg:hidden -ml-1 w-9 h-9 flex items-center justify-center rounded-full text-muted-foreground hover:bg-muted active:bg-muted/80 transition-colors"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <div className="relative flex-shrink-0">
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-brand-500 to-violet-600 flex items-center justify-center text-white text-xs font-bold shadow-sm">
                  {activeChat && getInitials(activeChat.customerName)}
                </div>
                {activeChat?.online && (
                  <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 rounded-full ring-2 ring-background" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <p className="text-sm font-bold text-foreground truncate">{activeChat?.customerName}</p>
                  {activeChat?.tags?.includes('VIP') && (
                    <span className="flex-shrink-0 bg-amber-400 text-white text-[8px] px-1.5 py-0.5 rounded uppercase tracking-wider font-black">VIP</span>
                  )}
                </div>
                <p className="text-[11px] font-medium leading-none mt-0.5">
                  {activeChat?.online
                    ? <span className="text-emerald-500">Active now</span>
                    : <span className="text-muted-foreground">{activeChat?.customerPhone}</span>}
                </p>
              </div>
              <div className="flex items-center gap-1.5 flex-shrink-0">
                <button
                  onClick={sendInvoice}
                  className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 text-[11px] font-bold rounded-lg bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/50 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-100 dark:hover:bg-emerald-950/50 transition-colors"
                >
                  <FileText className="w-3.5 h-3.5" /> Bill
                </button>
                <button className="w-8 h-8 flex items-center justify-center rounded-full border border-border/60 bg-card/80 text-muted-foreground hover:bg-muted transition-colors">
                  <Phone className="w-3.5 h-3.5" />
                </button>
                <button className="w-8 h-8 flex items-center justify-center rounded-full border border-border/60 bg-card/80 text-muted-foreground hover:bg-muted transition-colors">
                  <MoreVertical className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Messages */}
            <div
              ref={msgsRef}
              className="flex-1 overflow-y-auto overscroll-contain relative z-10 py-3 space-y-1"
              style={{ WebkitOverflowScrolling: 'touch' } as React.CSSProperties}
            >
              {!activeChat?.messages.length ? (
                <div className="flex flex-col items-center justify-center h-full gap-3 text-center px-6">
                  <div className="w-14 h-14 rounded-2xl bg-muted/60 border border-border flex items-center justify-center">
                    <MessageSquare className="w-6 h-6 text-muted-foreground/40" />
                  </div>
                  <p className="text-sm text-muted-foreground">No messages yet. Say hello! 👋</p>
                </div>
              ) : (
                activeChat?.messages.map((msg, idx) => {
                  const prev = activeChat.messages[idx - 1]
                  const showDate = !prev || new Date(msg.timestamp).toDateString() !== new Date(prev.timestamp).toDateString()
                  const label = new Date(msg.timestamp).toDateString() === new Date().toDateString()
                    ? 'Today'
                    : new Date(msg.timestamp).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
                  return (
                    <div key={msg.id}>
                      {showDate && <DateLabel label={label} />}
                      <Bubble msg={msg} customerName={activeChat.customerName} />
                    </div>
                  )
                })
              )}
              {isTyping && <TypingIndicator />}
              <div ref={endRef} className="h-3" />
            </div>

            {/* Templates tray */}
            <AnimatePresence>
              {showTemplates && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="relative z-20 bg-card/95 backdrop-blur-sm border-t border-border overflow-hidden flex-shrink-0"
                >
                  <div className="flex items-center justify-between px-4 pt-2.5 pb-1">
                    <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Quick Campaigns</span>
                    <button onClick={() => setShowTemplates(false)} className="text-muted-foreground hover:text-foreground p-1 transition-colors">
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <div className="flex gap-2 overflow-x-auto scrollbar-none px-4 pb-3">
                    {TEMPLATES.map(t => (
                      <button
                        key={t.id}
                        onClick={() => send(t.message)}
                        className="flex-shrink-0 flex items-center gap-1.5 px-3 py-2 bg-muted/50 border border-border rounded-xl text-xs font-semibold text-foreground hover:border-brand-400 hover:bg-brand-50/60 dark:hover:bg-brand-950/30 transition-all whitespace-nowrap active:scale-95"
                      >
                        <span className="text-sm">{t.emoji}</span>{t.label}
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Input bar */}
            <div className="relative z-20 flex-shrink-0 bg-card/90 backdrop-blur-xl border-t border-border/60 px-3 pt-2 pb-[max(10px,env(safe-area-inset-bottom,10px))]">
              <div className="flex items-end gap-2">
                {/* Left actions */}
                <div className="flex gap-1.5 items-center pb-0.5 flex-shrink-0">
                  <button
                    onClick={() => setShowTemplates(v => !v)}
                    className={cn(
                      'w-9 h-9 flex items-center justify-center rounded-full border transition-all active:scale-90',
                      showTemplates
                        ? 'bg-brand-500 text-white border-brand-500 shadow-sm shadow-brand-500/30'
                        : 'bg-muted/60 text-muted-foreground border-border/60 hover:bg-muted hover:text-foreground'
                    )}
                  >
                    <Sparkles className="w-4 h-4" />
                  </button>
                  {/* Invoice shortcut on mobile only */}
                  <button
                    onClick={sendInvoice}
                    className="sm:hidden w-9 h-9 flex items-center justify-center rounded-full border border-border/60 bg-muted/60 text-muted-foreground hover:bg-muted hover:text-foreground transition-all active:scale-90"
                  >
                    <FileText className="w-4 h-4" />
                  </button>
                </div>

                {/* Textarea */}
                <textarea
                  ref={taRef}
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={e => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault()
                      send(input)
                    }
                  }}
                  placeholder="Type a message..."
                  rows={1}
                  className="flex-1 min-h-[40px] max-h-[120px] px-4 py-2.5 text-sm leading-snug bg-muted/60 dark:bg-muted/40 border border-border/60 rounded-2xl text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-400/60 resize-none scrollbar-none shadow-sm transition-all"
                  style={{ WebkitAppearance: 'none' } as React.CSSProperties}
                />

                {/* Send */}
                <motion.button
                  whileTap={{ scale: 0.88 }}
                  onClick={() => send(input)}
                  disabled={!input.trim()}
                  className="flex-shrink-0 w-10 h-10 flex items-center justify-center rounded-full bg-brand-600 hover:bg-brand-700 active:bg-brand-800 disabled:bg-muted disabled:text-muted-foreground text-white shadow-md shadow-brand-600/25 disabled:shadow-none transition-all mb-0.5"
                >
                  <Send className="w-4 h-4 ml-0.5" />
                </motion.button>
              </div>

              {aiOn && (
                <p className="text-[10px] text-muted-foreground/50 text-center mt-1.5 flex items-center justify-center gap-1 font-semibold select-none">
                  <Sparkles className="w-2.5 h-2.5 text-brand-400" />
                  AI auto-reply is active
                </p>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Desktop empty state (no chat selected) */}
      {!activeChatId && (
        <div className="hidden lg:flex flex-1 flex-col items-center justify-center bg-muted/10 relative overflow-hidden">
          <Wallpaper />
          <div className="relative z-10 flex flex-col items-center gap-4 text-center px-6">
            <div className="w-20 h-20 rounded-3xl bg-brand-50 dark:bg-brand-950/40 border border-brand-100 dark:border-brand-800/40 flex items-center justify-center shadow-lg">
              <MessageSquare className="w-9 h-9 text-brand-500" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-foreground mb-1">Select a conversation</h2>
              <p className="text-sm text-muted-foreground max-w-xs leading-relaxed">
                Choose a client chat to view messages, send invoices, or run campaigns.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Analytics bottom sheet */}
      <BottomSheet open={showAnalytics} onClose={() => setShowAnalytics(false)} title="Chat Analytics">
        <div className="px-5 pb-6 pt-2 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: 'Active Chats', value: stats.chats, cls: 'brand' },
              { label: 'Unread', value: stats.unread, cls: 'emerald' },
            ].map(({ label, value, cls }) => (
              <div key={label} className={cn(
                'p-4 rounded-2xl border',
                cls === 'brand'
                  ? 'bg-brand-50 dark:bg-brand-950/20 border-brand-100 dark:border-brand-900/30'
                  : 'bg-emerald-50 dark:bg-emerald-950/20 border-emerald-100 dark:border-emerald-900/30'
              )}>
                <p className={cn('text-[10px] font-bold uppercase tracking-wider mb-1',
                  cls === 'brand' ? 'text-brand-600 dark:text-brand-400' : 'text-emerald-600 dark:text-emerald-400'
                )}>{label}</p>
                <p className="text-3xl font-black text-foreground">{value}</p>
              </div>
            ))}
          </div>
          <div className="bg-muted/40 border border-border/70 rounded-2xl p-4 space-y-3">
            <h4 className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Message Distribution</h4>
            {[
              { label: 'Human Agent', count: stats.agent, color: 'bg-blue-500' },
              { label: 'AI Replies', count: stats.ai, color: 'bg-brand-500', icon: true },
            ].map(({ label, count, color, icon }) => {
              const pct = stats.total ? Math.round((count / stats.total) * 100) : 0
              return (
                <div key={label}>
                  <div className="flex justify-between text-xs font-semibold mb-1.5">
                    <span className="flex items-center gap-1">
                      {icon && <Sparkles className="w-3 h-3 text-brand-500" />}
                      {label}
                    </span>
                    <span className="text-muted-foreground">{pct}% ({count})</span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${pct}%` }}
                      transition={{ duration: 0.8, ease: 'easeOut' }}
                      className={cn('h-full rounded-full', color)}
                    />
                  </div>
                </div>
              )
            })}
          </div>
          <div className="bg-muted/40 border border-border/70 rounded-2xl p-4">
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1">Total Messages</p>
            <p className="text-2xl font-black text-foreground">{stats.total}</p>
          </div>
          <button
            onClick={() => setShowAnalytics(false)}
            className="w-full py-3 rounded-xl border border-border bg-card hover:bg-muted text-sm font-bold transition-colors"
          >
            Close
          </button>
        </div>
      </BottomSheet>
    </div>
  )
}
