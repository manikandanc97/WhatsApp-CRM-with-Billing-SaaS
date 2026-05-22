'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Store, MessageSquare, Palette, Bell, Users, CreditCard,
  Save, Check, Wifi, WifiOff, QrCode,
  Shield, Sun, Moon, Monitor, Plus
} from 'lucide-react'
import { PageHeader } from '@/components/ui/PageHeader'
import { useAppStore } from '@/store/useAppStore'
import toast from 'react-hot-toast'
import { cn } from '@/lib/utils'

const TABS = [
  { id: 'shop', label: 'Shop Details', icon: Store },
  { id: 'whatsapp', label: 'WhatsApp', icon: MessageSquare },
  { id: 'appearance', label: 'Appearance', icon: Palette },
  { id: 'notifications', label: 'Notifications', icon: Bell },
  { id: 'staff', label: 'Staff & Roles', icon: Users },
  { id: 'billing', label: 'Billing Prefs', icon: CreditCard },
]

const MOCK_STAFF = [
  { id: 's1', name: 'Lakshmi Anand', email: 'lakshmi@sweetflow.com', role: 'owner', active: true },
  { id: 's2', name: 'Preethi Kumar', email: 'preethi@sweetflow.com', role: 'manager', active: true },
  { id: 's3', name: 'Arun Raj', email: 'arun@sweetflow.com', role: 'staff', active: false },
]

const THEMES = [
  { id: 'light', label: 'Light', icon: Sun },
  { id: 'dark', label: 'Dark', icon: Moon },
  { id: 'system', label: 'System', icon: Monitor },
]

const ACCENT_COLORS = [
  { id: 'brand', label: 'Indigo', class: 'bg-brand-500' },
  { id: 'violet', label: 'Violet', class: 'bg-violet-500' },
  { id: 'rose', label: 'Rose', class: 'bg-rose-500' },
  { id: 'amber', label: 'Amber', class: 'bg-amber-500' },
  { id: 'emerald', label: 'Emerald', class: 'bg-emerald-500' },
]

function Toggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      onClick={() => onChange(!checked)}
      className={cn(
        'relative w-11 h-6 rounded-full transition-colors duration-200 flex-shrink-0',
        checked ? 'bg-brand-500' : 'bg-muted'
      )}
    >
      <motion.div
        animate={{ x: checked ? 20 : 2 }}
        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
        className="absolute top-1 w-4 h-4 bg-white rounded-full shadow-sm"
      />
    </button>
  )
}

function SectionCard({ title, description, children }: { title: string; description?: string; children: React.ReactNode }) {
  return (
    <div className="bg-card border border-border rounded-2xl overflow-hidden">
      <div className="px-5 py-4 border-b border-border">
        <h3 className="font-semibold text-foreground">{title}</h3>
        {description && <p className="text-xs text-muted-foreground mt-0.5">{description}</p>}
      </div>
      <div className="p-5">{children}</div>
    </div>
  )
}

function Field({ label, value, onChange, type = 'text', placeholder }: {
  label: string; value: string; onChange: (v: string) => void; type?: string; placeholder?: string
}) {
  return (
    <div>
      <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-1.5">{label}</label>
      <input
        type={type}
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full px-3 py-2.5 text-sm bg-muted/50 border border-border rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-400 transition-all"
      />
    </div>
  )
}

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState('shop')
  const [saved, setSaved] = useState(false)
  const { settings, updateSettings, theme, setTheme } = useAppStore()
  const [s, setS] = useState({ ...settings })

  function handleSave() {
    updateSettings(s)
    setSaved(true)
    toast.success('Settings saved!')
    setTimeout(() => setSaved(false), 2000)
  }

  function applyTheme(t: string) {
    setTheme(t as any)
    updateSettings({ theme: t as any })
    if (t === 'dark') document.documentElement.classList.add('dark')
    else document.documentElement.classList.remove('dark')
  }

  return (
    <div className="space-y-6 page-wrapper max-w-5xl">
      <PageHeader
        title="Settings"
        description="Configure your SweetFlow AI workspace"
        action={
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={handleSave}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-brand-600 dark:bg-brand-500 hover:bg-brand-700 dark:hover:bg-brand-600 text-white text-sm font-semibold shadow-sm transition-all duration-200 hover:-translate-y-[0.5px]"
          >
            {saved ? <Check className="w-4 h-4" /> : <Save className="w-4 h-4" />}
            {saved ? 'Saved!' : 'Save Changes'}
          </motion.button>
        }
      />

      <div className="flex gap-6">
        {}
        <div className="hidden md:flex flex-col gap-1 w-52 flex-shrink-0">
          {TABS.map(tab => {
            const Icon = tab.icon
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  'flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium text-left transition-all duration-200',
                  activeTab === tab.id
                    ? 'bg-brand-50 dark:bg-brand-950/30 text-brand-600 dark:text-brand-400'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                )}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            )
          })}
        </div>

        {}
        <div className="flex md:hidden gap-1 overflow-x-auto scrollbar-thin pb-1 w-full">
          {TABS.map(tab => {
            const Icon = tab.icon
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  'flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all flex-shrink-0',
                  activeTab === tab.id ? 'bg-brand-600 dark:bg-brand-500 text-white' : 'bg-muted text-muted-foreground'
                )}
              >
                <Icon className="w-3.5 h-3.5" />
                {tab.label}
              </button>
            )
          })}
        </div>

        {}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, x: 12 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -12 }}
            transition={{ duration: 0.2 }}
            className="flex-1 space-y-4 min-w-0"
          >
            {activeTab === 'shop' && (
              <>
                <SectionCard title="Shop Information" description="Basic details about your bakery">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Field label="Shop Name" value={s.shopName} onChange={v => setS(p => ({ ...p, shopName: v }))} placeholder="SweetFlow Bakery" />
                    <Field label="Owner Name" value={s.ownerName} onChange={v => setS(p => ({ ...p, ownerName: v }))} placeholder="Your name" />
                    <Field label="Phone" value={s.phone} onChange={v => setS(p => ({ ...p, phone: v }))} type="tel" placeholder="+91 98765 43210" />
                    <Field label="Email" value={s.email} onChange={v => setS(p => ({ ...p, email: v }))} type="email" placeholder="hello@bakery.com" />
                    <div className="sm:col-span-2">
                      <Field label="Shop Address" value={s.address} onChange={v => setS(p => ({ ...p, address: v }))} placeholder="Full address" />
                    </div>
                    <Field label="GSTIN" value={s.gstin} onChange={v => setS(p => ({ ...p, gstin: v }))} placeholder="33AABCU9603R1ZX" />
                    <div>
                      <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-1.5">Currency</label>
                      <select value={s.currency} onChange={e => setS(p => ({ ...p, currency: e.target.value }))} className="w-full px-3 py-2.5 text-sm bg-muted/50 border border-border rounded-xl text-foreground focus:outline-none focus:ring-2 focus:ring-brand-500/30">
                        <option value="INR">₹ INR - Indian Rupee</option>
                        <option value="USD">$ USD - US Dollar</option>
                        <option value="EUR">€ EUR - Euro</option>
                      </select>
                    </div>
                  </div>
                </SectionCard>
                <SectionCard title="Tax Settings" description="GST and billing preferences">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-1.5">Default GST Rate (%)</label>
                      <input type="number" value={s.taxRate} onChange={e => setS(p => ({ ...p, taxRate: Number(e.target.value) }))} className="w-full px-3 py-2.5 text-sm bg-muted/50 border border-border rounded-xl text-foreground focus:outline-none focus:ring-2 focus:ring-brand-500/30" />
                    </div>
                  </div>
                </SectionCard>
              </>
            )}

            {activeTab === 'whatsapp' && (
              <SectionCard title="WhatsApp Integration" description="Connect your WhatsApp Business account">
                <div className="space-y-5">
                  {}
                  <div className={cn(
                    'flex items-center gap-4 p-4 rounded-xl border',
                    s.whatsappConnected
                      ? 'bg-emerald-50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800'
                      : 'bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-800'
                  )}>
                    {s.whatsappConnected ? (
                      <Wifi className="w-5 h-5 text-emerald-600 flex-shrink-0" />
                    ) : (
                      <WifiOff className="w-5 h-5 text-red-500 flex-shrink-0" />
                    )}
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-foreground">
                        {s.whatsappConnected ? 'Connected to WhatsApp Business' : 'Not Connected'}
                      </p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {s.whatsappConnected ? 'AI auto-replies are active on +91 98765 00000' : 'Scan QR code to connect'}
                      </p>
                    </div>
                    <button
                      onClick={() => { setS(p => ({ ...p, whatsappConnected: !p.whatsappConnected })); toast.success(s.whatsappConnected ? 'Disconnected!' : 'Connected!') }}
                      className={cn(
                        'px-3 py-1.5 text-xs font-semibold rounded-xl transition-colors',
                        s.whatsappConnected ? 'bg-red-100 text-red-600 dark:bg-red-950/40 dark:text-red-400 hover:bg-red-200' : 'bg-brand-600 dark:bg-brand-500 hover:bg-brand-700 dark:hover:bg-brand-600 text-white'
                      )}
                    >
                      {s.whatsappConnected ? 'Disconnect' : 'Connect'}
                    </button>
                  </div>

                  {}
                  {!s.whatsappConnected && (
                    <div className="flex flex-col items-center gap-3 p-6 bg-muted/50 rounded-xl border border-dashed border-border">
                      <QrCode className="w-24 h-24 text-muted-foreground/40" />
                      <p className="text-sm text-muted-foreground">Scan this QR code in WhatsApp Business app</p>
                    </div>
                  )}

                  {}
                  <div className="space-y-3">
                    {[
                      { label: 'AI Auto-Reply', desc: 'Automatically respond to customer messages using AI' },
                      { label: 'Order Status Updates', desc: 'Send automatic order status notifications' },
                      { label: 'Invoice via WhatsApp', desc: 'Send invoices directly through WhatsApp' },
                      { label: 'Birthday Greetings', desc: 'Auto-send birthday wishes with special offer' },
                    ].map(item => (
                      <div key={item.label} className="flex items-center justify-between gap-4 py-2">
                        <div>
                          <p className="text-sm font-medium text-foreground">{item.label}</p>
                          <p className="text-xs text-muted-foreground">{item.desc}</p>
                        </div>
                        <Toggle checked={s.whatsappConnected} onChange={() => {}} />
                      </div>
                    ))}
                  </div>
                </div>
              </SectionCard>
            )}

            {activeTab === 'appearance' && (
              <SectionCard title="Theme & Appearance" description="Customize your workspace look">
                <div className="space-y-6">
                  <div>
                    <p className="text-sm font-semibold text-foreground mb-3">Color Theme</p>
                    <div className="flex gap-3">
                      {THEMES.map(t => {
                        const Icon = t.icon
                        return (
                          <button
                            key={t.id}
                            onClick={() => applyTheme(t.id)}
                            className={cn(
                              'flex flex-col items-center gap-2 p-4 rounded-xl border-2 flex-1 transition-all duration-200',
                              theme === t.id
                                ? 'border-brand-600 dark:border-brand-500 bg-brand-50/40 dark:bg-brand-950/10'
                                : 'border-border hover:border-brand-300 dark:hover:border-brand-800 bg-muted/50'
                            )}
                          >
                            <Icon className={cn('w-5 h-5', theme === t.id ? 'text-brand-600' : 'text-muted-foreground')} />
                            <span className={cn('text-xs font-semibold', theme === t.id ? 'text-brand-600' : 'text-muted-foreground')}>{t.label}</span>
                          </button>
                        )
                      })}
                    </div>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-foreground mb-3">Accent Color</p>
                    <div className="flex gap-3">
                      {ACCENT_COLORS.map(c => (
                        <button
                          key={c.id}
                          onClick={() => { updateSettings({ accentColor: c.id }); toast.success(`Accent: ${c.label}`) }}
                          className={cn(
                            'flex flex-col items-center gap-1.5 group',
                          )}
                        >
                          <div className={cn('w-8 h-8 rounded-full transition-all', c.class, settings.accentColor === c.id ? 'ring-2 ring-offset-2 ring-current scale-110' : 'group-hover:scale-105')} />
                          <span className="text-[10px] text-muted-foreground">{c.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </SectionCard>
            )}

            {activeTab === 'notifications' && (
              <SectionCard title="Notification Preferences" description="Choose what alerts you want to receive">
                <div className="space-y-4">
                  {[
                    { key: 'notificationsEnabled', label: 'All Notifications', desc: 'Master toggle for all notifications' },
                    { key: 'orderNotifications', label: 'New Order Alerts', desc: 'Get notified when a new order arrives' },
                    { key: 'paymentNotifications', label: 'Payment Received', desc: 'Alert when customer makes a payment' },
                    { key: 'birthdayReminders', label: 'Birthday Reminders', desc: 'Reminder 2 days before customer birthday' },
                  ].map(item => (
                    <div key={item.key} className="flex items-center justify-between gap-4 py-2.5 border-b border-border last:border-0">
                      <div>
                        <p className="text-sm font-medium text-foreground">{item.label}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">{item.desc}</p>
                      </div>
                      <Toggle
                        checked={(s as any)[item.key]}
                        onChange={v => setS(p => ({ ...p, [item.key]: v }))}
                      />
                    </div>
                  ))}
                </div>
              </SectionCard>
            )}

            {activeTab === 'staff' && (
              <SectionCard title="Staff & Roles" description="Manage team members and permissions">
                <div className="space-y-3">
                  {MOCK_STAFF.map(staff => (
                    <div key={staff.id} className="flex items-center gap-3 p-3 rounded-xl bg-muted/50 hover:bg-muted/80 transition-colors">
                      <div className="w-9 h-9 rounded-xl bg-brand-100 text-brand-700 dark:bg-brand-950/60 dark:text-brand-300 border border-brand-200/30 flex items-center justify-center text-xs font-bold flex-shrink-0">
                        {staff.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-foreground">{staff.name}</p>
                        <p className="text-xs text-muted-foreground">{staff.email}</p>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <span className={cn(
                          'text-[10px] font-semibold px-2 py-0.5 rounded-full',
                          staff.role === 'owner' ? 'bg-violet-100 text-violet-700 dark:bg-violet-950/30 dark:text-violet-400' :
                          staff.role === 'manager' ? 'bg-brand-100 text-brand-700 dark:bg-brand-950/30 dark:text-brand-400' :
                          'bg-muted text-muted-foreground'
                        )}>
                          {staff.role}
                        </span>
                        <div className={cn('w-2 h-2 rounded-full', staff.active ? 'bg-emerald-500' : 'bg-gray-400')} />
                      </div>
                    </div>
                  ))}
                  <button
                    onClick={() => toast('Staff invitation coming soon!', { icon: '👥' })}
                    className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border-2 border-dashed border-border text-sm font-medium text-muted-foreground hover:border-brand-300 hover:text-brand-600 transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    Invite Team Member
                  </button>
                </div>
              </SectionCard>
            )}

            {activeTab === 'billing' && (
              <SectionCard title="Billing Preferences" description="Configure default billing and invoice settings">
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-1.5">Default Tax Rate (%)</label>
                      <input type="number" value={s.taxRate} onChange={e => setS(p => ({ ...p, taxRate: Number(e.target.value) }))} className="w-full px-3 py-2.5 text-sm bg-muted/50 border border-border rounded-xl text-foreground focus:outline-none focus:ring-2 focus:ring-brand-500/30" />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-1.5">Currency</label>
                      <select value={s.currency} onChange={e => setS(p => ({ ...p, currency: e.target.value }))} className="w-full px-3 py-2.5 text-sm bg-muted/50 border border-border rounded-xl text-foreground focus:outline-none focus:ring-2 focus:ring-brand-500/30">
                        <option value="INR">₹ INR</option>
                        <option value="USD">$ USD</option>
                      </select>
                    </div>
                  </div>
                  <div className="p-4 bg-brand-50/40 dark:bg-brand-950/10 border border-brand-100 dark:border-brand-900/30 rounded-xl">
                    <div className="flex items-center gap-3 mb-2">
                      <Shield className="w-5 h-5 text-brand-600" />
                      <p className="text-sm font-semibold text-foreground">SweetFlow AI Pro</p>
                    </div>
                    <p className="text-xs text-muted-foreground">You're on the <strong>Business Plan</strong> · ₹999/month</p>
                    <p className="text-xs text-muted-foreground mt-1">Next billing: Jan 1, 2025 · Auto-renews</p>
                    <button onClick={() => toast('Upgrade plan coming soon!', { icon: '⚡' })} className="mt-3 text-xs font-semibold text-brand-600 hover:underline">
                      Manage Subscription →
                    </button>
                  </div>
                </div>
              </SectionCard>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  )
}
