'use client'

import { useState, useRef, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useAppStore } from '@/store/useAppStore'
import { ArrowLeft, KeyRound, Sparkles } from 'lucide-react'
import Link from 'next/link'
import toast from 'react-hot-toast'
import { useRouter } from 'next/navigation'

export default function OTPVerifyPage() {
  const { otpSentEmail, verifyOTP, sendOTP } = useAppStore()
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [otp, setOtp] = useState<string[]>(new Array(6).fill(''))
  const [resendTimer, setResendTimer] = useState(30)
  
  const inputRefs = useRef<(HTMLInputElement | null)[]>([])

  // Decrement resend timer
  useEffect(() => {
    if (resendTimer <= 0) return
    const timer = setTimeout(() => {
      setResendTimer((prev) => prev - 1)
    }, 1000)
    return () => clearTimeout(timer)
  }, [resendTimer])

  // Focus first input on mount
  useEffect(() => {
    if (inputRefs.current[0]) {
      inputRefs.current[0].focus()
    }
  }, [])

  const handleChange = (element: HTMLInputElement, index: number) => {
    const value = element.value
    if (isNaN(Number(value))) return

    const newOtp = [...otp]
    // Get last char in case user typed multiple
    newOtp[index] = value.substring(value.length - 1)
    setOtp(newOtp)

    // Move focus to next input
    if (value && index < 5 && inputRefs.current[index + 1]) {
      inputRefs.current[index + 1]?.focus()
    }

    // Auto-submit when all 6 digits are typed
    const fullOtp = newOtp.join('')
    if (fullOtp.length === 6) {
      triggerSubmit(fullOtp)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
    if (e.key === 'Backspace') {
      const newOtp = [...otp]
      
      // If current input is empty, clear previous and focus it
      if (!otp[index] && index > 0) {
        newOtp[index - 1] = ''
        setOtp(newOtp)
        inputRefs.current[index - 1]?.focus()
      } else {
        newOtp[index] = ''
        setOtp(newOtp)
      }
    }
  }

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault()
    const text = e.clipboardData.getData('text').trim()
    if (!/^\d{6}$/.test(text)) {
      toast.error('Please paste a 6-digit number')
      return
    }

    const newOtp = text.split('')
    setOtp(newOtp)
    
    // Focus last input
    inputRefs.current[5]?.focus()
    triggerSubmit(text)
  }

  const triggerSubmit = async (code: string) => {
    setIsLoading(true)
    try {
      const success = await verifyOTP(code)
      if (success) {
        toast.success('OTP verified successfully! Please set your new password.')
        router.push('/reset-password')
      } else {
        toast.error('Invalid verification code. Use: 123456')
      }
    } catch (err) {
      toast.error('An error occurred during verification')
    } finally {
      setIsLoading(false)
    }
  }

  const handleResend = async () => {
    if (resendTimer > 0) return
    setIsLoading(true)
    try {
      const email = otpSentEmail || 'your email'
      await sendOTP(email)
      setResendTimer(30)
      toast.success('New OTP sent! Code: 123456')
    } catch (err) {
      toast.error('Failed to send OTP. Try again.')
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

        {/* Header */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-brand-500 to-violet-600 flex items-center justify-center shadow-lg shadow-brand-500/10 mb-3">
            <KeyRound className="w-6 h-6 text-white" />
          </div>
          <h2 className="text-2xl font-extrabold text-foreground tracking-tight">Verify OTP</h2>
          <p className="text-sm text-muted-foreground mt-1 text-center">
            We've sent a 6-digit code to <span className="font-semibold text-foreground">{otpSentEmail || 'your email'}</span>
          </p>
        </div>

        {/* OTP Input Grid */}
        <div className="space-y-6">
          <div className="flex justify-between gap-2.5">
            {otp.map((digit, index) => (
              <input
                key={index}
                type="text"
                maxLength={1}
                value={digit}
                ref={(el) => { inputRefs.current[index] = el }}
                onChange={(e) => handleChange(e.target, index)}
                onKeyDown={(e) => handleKeyDown(e, index)}
                onPaste={handlePaste}
                className="w-12 h-14 text-center text-xl font-bold bg-muted/40 border border-border rounded-xl text-foreground focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-400 transition-all"
              />
            ))}
          </div>

          <div className="text-center">
            {resendTimer > 0 ? (
              <p className="text-xs text-muted-foreground">
                Resend code in <span className="font-semibold text-foreground">{resendTimer}s</span>
              </p>
            ) : (
              <button
                type="button"
                onClick={handleResend}
                disabled={isLoading}
                className="text-xs font-bold text-brand-600 dark:text-brand-400 hover:underline"
              >
                Resend Verification Code
              </button>
            )}
          </div>

          <button
            type="button"
            onClick={() => triggerSubmit(otp.join(''))}
            disabled={isLoading || otp.join('').length < 6}
            className="w-full py-2.5 rounded-xl bg-brand-600 dark:bg-brand-500 hover:bg-brand-700 dark:hover:bg-brand-600 text-white font-bold text-sm shadow-md shadow-brand-500/10 transition-all duration-200 flex items-center justify-center gap-2 hover:-translate-y-[0.5px] disabled:opacity-50 disabled:pointer-events-none"
          >
            {isLoading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              'Verify Code'
            )}
          </button>
        </div>

        <div className="h-px bg-border/80 my-6" />

        <Link
          href="/forgot-password"
          className="flex items-center justify-center gap-2 text-xs font-bold text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Forgot Password
        </Link>
      </div>
    </motion.div>
  )
}
