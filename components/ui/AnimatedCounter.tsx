'use client'

import { useEffect, useRef, useState } from 'react'

interface AnimatedCounterProps {
  value: number
  duration?: number
  decimals?: number
  prefix?: string
  suffix?: string
  className?: string
  formatFn?: (val: number) => string
}

export function AnimatedCounter({
  value,
  duration = 1200,
  decimals = 0,
  prefix = '',
  suffix = '',
  className = '',
  formatFn,
}: AnimatedCounterProps) {
  const [display, setDisplay] = useState(0)
  const startRef = useRef<number | null>(null)
  const rafRef = useRef<number | null>(null)
  const prevValue = useRef(0)

  useEffect(() => {
    const startVal = prevValue.current
    const endVal = value
    prevValue.current = value

    if (rafRef.current) cancelAnimationFrame(rafRef.current)
    startRef.current = null

    const easeOutExpo = (t: number) =>
      t === 1 ? 1 : 1 - Math.pow(2, -10 * t)

    const animate = (timestamp: number) => {
      if (!startRef.current) startRef.current = timestamp
      const elapsed = timestamp - startRef.current
      const progress = Math.min(elapsed / duration, 1)
      const eased = easeOutExpo(progress)
      const current = startVal + (endVal - startVal) * eased
      setDisplay(current)
      if (progress < 1) {
        rafRef.current = requestAnimationFrame(animate)
      } else {
        setDisplay(endVal)
      }
    }

    rafRef.current = requestAnimationFrame(animate)
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
    }
  }, [value, duration])

  const formatted = formatFn
    ? formatFn(display)
    : decimals > 0
    ? display.toFixed(decimals)
    : Math.floor(display).toLocaleString('en-IN')

  return (
    <span className={className}>
      {prefix}{formatted}{suffix}
    </span>
  )
}
