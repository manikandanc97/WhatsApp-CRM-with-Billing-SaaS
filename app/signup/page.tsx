'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { motion } from 'framer-motion'
import { useAppStore } from '@/store/useAppStore'
import { Eye, EyeOff, Lock, Mail, User, Sparkles } from 'lucide-react'
import Link from 'next/link'
import toast from 'react-hot-toast'
import { useRouter } from 'next/navigation'

export default function SignupPage() {
  const { signup } = useAppStore()
  const router = useRouter()
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: {
      name: '',
      email: '',
      password: '',
      terms: false,
    },
  })

  async function onSubmit(data: any) {
    if (!data.terms) {
      toast.error('You must accept the terms & conditions')
      return
    }
    setIsLoading(true)
    try {
      await signup(data.name, data.email)
      toast.success('Account created successfully!')
      router.push('/dashboard')
    } catch (err) {
      toast.error('Failed to create account. Please try again.')
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
        {/* Decorative ambient glow */}
        <div className="absolute -top-12 -right-12 w-32 h-32 rounded-full bg-brand-500/10 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-12 -left-12 w-32 h-32 rounded-full bg-violet-500/10 blur-3xl pointer-events-none" />

        {/* Brand */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-brand-500 to-violet-600 flex items-center justify-center shadow-lg shadow-brand-500/10 mb-3">
            <Sparkles className="w-6 h-6 text-white" />
          </div>
          <h2 className="text-2xl font-extrabold text-foreground tracking-tight">Create your account</h2>
          <p className="text-sm text-muted-foreground mt-1">Get started with SweetFlow CRM & Billing</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-1.5">
              Full Name
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                <User className="w-4 h-4" />
              </span>
              <input
                type="text"
                placeholder="e.g. Lakshmi Anand"
                {...register('name', { required: 'Name is required' })}
                className="w-full pl-10 pr-4 py-2.5 text-sm bg-muted/40 border border-border rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-400 transition-all"
              />
            </div>
            {errors.name && (
              <p className="text-xs text-red-500 mt-1 font-medium">{errors.name.message}</p>
            )}
          </div>

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

          <div>
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-1.5">
              Password
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                <Lock className="w-4 h-4" />
              </span>
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                {...register('password', {
                  required: 'Password is required',
                  minLength: {
                    value: 6,
                    message: 'Password must be at least 6 characters',
                  },
                })}
                className="w-full pl-10 pr-10 py-2.5 text-sm bg-muted/40 border border-border rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-400 transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {errors.password && (
              <p className="text-xs text-red-500 mt-1 font-medium">{errors.password.message}</p>
            )}
          </div>

          <div className="pt-1">
            <label className="flex items-start gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                {...register('terms', { required: 'You must accept the terms' })}
                className="w-4 h-4 rounded border-border text-brand-600 focus:ring-brand-500/30 bg-muted/40 mt-0.5"
              />
              <span className="text-xs text-muted-foreground font-medium leading-tight">
                I agree to the{' '}
                <a href="#" className="font-semibold text-brand-600 dark:text-brand-400 hover:underline">
                  Terms of Service
                </a>{' '}
                and{' '}
                <a href="#" className="font-semibold text-brand-600 dark:text-brand-400 hover:underline">
                  Privacy Policy
                </a>
              </span>
            </label>
            {errors.terms && (
              <p className="text-xs text-red-500 mt-1 font-medium">{errors.terms.message}</p>
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
              'Sign Up'
            )}
          </button>
        </form>

        <div className="h-px bg-border/80 my-6" />

        <p className="text-xs text-center text-muted-foreground font-medium">
          Already have an account?{' '}
          <Link
            href="/login"
            className="font-bold text-brand-600 dark:text-brand-400 hover:underline"
          >
            Sign In
          </Link>
        </p>
      </div>
    </motion.div>
  )
}
