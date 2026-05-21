'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { useOfflineStore } from '@/store/offline'
import { WifiOff, CloudOff, Zap } from 'lucide-react'

export function OfflineBanner() {
  const { isOnline, pendingSyncCount } = useOfflineStore()

  return (
    <AnimatePresence>
      {!isOnline && (
        <motion.div
          initial={{ opacity: 0, y: -40, scaleY: 0.8 }}
          animate={{ opacity: 1, y: 0, scaleY: 1 }}
          exit={{ opacity: 0, y: -40, scaleY: 0.8 }}
          transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
          className="w-full bg-gradient-to-r from-rose-950/90 via-orange-950/90 to-rose-950/90 backdrop-blur-sm border-b border-rose-800/50 px-4 py-2.5"
        >
          <div className="max-w-5xl mx-auto flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-rose-900/60 border border-rose-700/50 flex items-center justify-center flex-shrink-0">
                <WifiOff className="w-3.5 h-3.5 text-rose-400" />
              </div>
              <div>
                <p className="text-xs font-bold text-rose-200">
                  Working Offline — POS Mode Active
                </p>
                <p className="text-[10px] text-rose-400/80 mt-0.5">
                  All changes are saved locally. Will sync automatically when internet returns.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 flex-shrink-0">
              {pendingSyncCount > 0 && (
                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-900/50 border border-amber-700/40">
                  <CloudOff className="w-3 h-3 text-amber-400" />
                  <span className="text-[10px] font-bold text-amber-300">
                    {pendingSyncCount} pending
                  </span>
                </div>
              )}
              <div className="flex items-center gap-1 px-2 py-1 rounded-lg bg-emerald-900/30 border border-emerald-700/30">
                <Zap className="w-3 h-3 text-emerald-400" />
                <span className="text-[10px] font-bold text-emerald-300">Local DB Active</span>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
