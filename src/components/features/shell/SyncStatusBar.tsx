'use client'

import { useSync } from '@/hooks/useSync'
import { WifiOff, RefreshCw, AlertTriangle } from 'lucide-react'
import { cn } from '@/lib/utils'
import { motion, AnimatePresence } from 'motion/react'

export function SyncStatusBar() {
  const { status, deadLetterCount } = useSync()

  const visible = status !== 'idle' || deadLetterCount > 0

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.15, ease: 'easeOut' }}
          className={cn(
            'flex items-center gap-2 px-4 py-1.5 text-xs font-medium',
            status === 'offline' && 'bg-muted text-muted-foreground',
            status === 'syncing' && 'bg-primary/10 text-primary',
            (status === 'error' || deadLetterCount > 0) && 'bg-destructive/10 text-destructive'
          )}
          role="status"
          aria-live="polite"
        >
          {status === 'offline' && (
            <>
              <WifiOff className="size-3.5" aria-hidden />
              <span>Sin conexión — cambios guardados localmente</span>
            </>
          )}
          {status === 'syncing' && (
            <>
              <RefreshCw className="size-3.5 animate-spin" aria-hidden />
              <span>Sincronizando...</span>
            </>
          )}
          {deadLetterCount > 0 && (
            <>
              <AlertTriangle className="size-3.5" aria-hidden />
              <span>{deadLetterCount} cambio(s) no pudieron sincronizarse</span>
            </>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  )
}
