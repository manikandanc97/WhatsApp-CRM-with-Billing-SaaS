'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { motion } from 'framer-motion'
import { useAppStore } from '@/store/useAppStore'
import { ArrowLeft, Mail, Sparkles } from 'lucide-react'
import Link from 'next/link'
import toast from 'react-hot-toast'
import { useRouter } from 'next/navigation'

export default function ForgotPasswordPage() {
  const { sendOTP } = useAppStore()
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: {
      email: '',
    },
  })

  async function onSubmit(data: any) {
    setIsLoading(true)
    try {
      await sendOTP(data.email)
      toast.success('OTP sent! Check your email for code: 123456', { duration: 6000 })
      router.push('/otp-verify')
    } catch {
      toast.error('Failed to send OTP. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      className="w-full max-w-md"
    >
      <div className="bg-card border border-border/80 rounded-3xl p-8 shadow-elevated relative overflow-hidden">
        {}
        <div className="absolute -top-12 -right-12 w-32 h-32 rounded-full bg-brand-500/10 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-12 -left-12 w-32 h-32 rounded-full bg-violet-500/10 blur-3xl pointer-events-none" />

        {}
        <div className="flex flex-col items-center mb-8">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-brand-500 to-violet-600 flex items-center justify-center shadow-lg shadow-brand-500/10 mb-3">
            <Sparkles className="w-6 h-6 text-white" />
          </div>
          <h2 className="text-2xl font-extrabold text-foreground tracking-tight">Forgot Password?</h2>
          <p className="text-sm text-muted-foreground mt-1 text-center">
            No worries! Enter your email and we'll send you an OTP to reset it.
          </p>
        </div>

        {}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-1.5">
              Email Address
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                <Mail className="w-4 h-4" />
              </span>
              <input
                type="email"
                placeholder="e.g. hello@sweetflow.in"
                {...register('email', {
                  required: 'Email is required',
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: 'Invalid email address',
                  },
                })}
                className="w-full pl-10 pr-4 py-2.5 text-sm bg-muted/40 border border-border rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-400 transition-all"
              />
            </div>
            {errors.email && (
              <p className="text-xs text-red-500 mt-1 font-medium">{errors.email.message}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-2.5 rounded-xl bg-brand-600 dark:bg-brand-500 hover:bg-brand-700 dark:hover:bg-brand-600 text-white font-bold text-sm shadow-md shadow-brand-500/10 transition-all duration-200 flex items-center justify-center gap-2 hover:-translate-y-[0.5px]"
          >
            {isLoading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              'Send OTP'
            )}
          </button>
        </form>

        <div className="h-px bg-border/80 my-6" />

        <Link
          href="/login"
          className="flex items-center justify-center gap-2 text-xs font-bold text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Sign In
        </Link>
      </div>
    </motion.div>
  )
}
