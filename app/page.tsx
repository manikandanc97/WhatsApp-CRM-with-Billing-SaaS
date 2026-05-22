'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAppStore } from '@/store/useAppStore'
import { useStoreHydrated } from '@/hooks/useStoreHydrated'

export default function HomePage() {
  const router = useRouter()
  const token = useAppStore((s) => s.token)
  const hydrated = useStoreHydrated()

  useEffect(() => {
    if (!hydrated) return
    router.replace(token ? '/dashboard' : '/login')
  }, [hydrated, token, router])

  return (
    <div className="h-dvh w-dvw bg-background flex items-center justify-center">
      <div className="w-8 h-8 border-4 border-brand-500 border-t-transparent rounded-full animate-spin" />
    </div>
  )
}
