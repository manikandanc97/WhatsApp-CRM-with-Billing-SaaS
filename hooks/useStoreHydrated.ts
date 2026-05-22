'use client'

import { useEffect, useState } from 'react'
import { useAppStore } from '@/store/useAppStore'

export function useStoreHydrated() {
  const [hydrated, setHydrated] = useState(false)

  useEffect(() => {
    const store = useAppStore.persist

    if (store.hasHydrated()) {
      setHydrated(true)
      return
    }

    return store.onFinishHydration(() => setHydrated(true))
  }, [])

  return hydrated
}
