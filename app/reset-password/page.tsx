'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { motion } from 'framer-motion'
import { useAppStore } from '@/store/useAppStore'
import { ArrowLeft, Lock, Eye, EyeOff, CheckCircle2 } from 'lucide-react'
import Link from 'next/link'
import toast from 'react-hot-toast'
import { useRouter } from 'next/navigation'

export default function ResetPasswordPage() {
  const { resetPassword } = useAppStore()
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm({
    defaultValues: {
      password: '',
      confirmPassword: '',
    },
  })

  const passwordVal = watch('password')

  
  const hasMinLength = passwordVal.length >= 8
  const hasNumber = /\d/.test(passwordVal)
  const hasSpecial = /[^A-Za-z0-9]/.test(passwordVal)

  async function onSubmit(data: any) {
    setIsLoading(true)
    try {
      await resetPassword(data.password)
      toast.success('Password reset successfully! Redirecting to login...', { duration: 3000 })
      setTimeout(() => {
        router.push('/login')
      }, 1500)
    } catch {
      toast.error('Failed to reset password. Please try again.')
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
            <Lock className="w-6 h-6 text-white" />
          </div>
          <h2 className="text-2xl font-extrabold text-foreground tracking-tight">Set New Password</h2>
          <p className="text-sm text-muted-foreground mt-1 text-center">
            Choose a strong, unique password to secure your SweetFlow account.
          </p>
        </div>

        {}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-1.5">
              New Password
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
                    value: 8,
                    message: 'Password must be at least 8 characters',
                  },
                })}
                className="w-full pl-10 pr-10 py-2.5 text-sm bg-muted/40 border border-border rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-400 transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {errors.password && (
              <p className="text-xs text-red-500 mt-1 font-medium">{errors.password.message}</p>
            )}
          </div>

          <div>
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-1.5">
              Confirm New Password
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                <Lock className="w-4 h-4" />
              </span>
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                placeholder="••••••••"
                {...register('confirmPassword', {
                  required: 'Please confirm your password',
                  validate: (val) => val === passwordVal || 'Passwords do not match',
                })}
                className="w-full pl-10 pr-10 py-2.5 text-sm bg-muted/40 border border-border rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-400 transition-all"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {errors.confirmPassword && (
              <p className="text-xs text-red-500 mt-1 font-medium">{errors.confirmPassword.message}</p>
            )}
          </div>

          {}
          <div className="bg-muted/30 rounded-xl p-3 border border-border/60 space-y-1.5">
            <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-1">Password Strength Checklist</p>
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <CheckCircle2 className={`w-3.5 h-3.5 ${hasMinLength ? 'text-green-500' : 'text-muted-foreground/40'}`} />
              <span className={hasMinLength ? 'text-foreground' : ''}>At least 8 characters</span>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <CheckCircle2 className={`w-3.5 h-3.5 ${hasNumber ? 'text-green-500' : 'text-muted-foreground/40'}`} />
              <span className={hasNumber ? 'text-foreground' : ''}>Contains at least one number</span>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <CheckCircle2 className={`w-3.5 h-3.5 ${hasSpecial ? 'text-green-500' : 'text-muted-foreground/40'}`} />
              <span className={hasSpecial ? 'text-foreground' : ''}>Contains a special character</span>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-2.5 rounded-xl bg-brand-600 dark:bg-brand-500 hover:bg-brand-700 dark:hover:bg-brand-600 text-white font-bold text-sm shadow-md shadow-brand-500/10 transition-all duration-200 flex items-center justify-center gap-2 hover:-translate-y-[0.5px]"
          >
            {isLoading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              'Reset Password'
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
