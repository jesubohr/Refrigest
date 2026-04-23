'use client'

import { useEffect, useCallback, useState } from 'react'
import { flushOutbox } from '@/lib/sync/push'
import { pullAll } from '@/lib/sync/pull'
import { defaultSyncState, type SyncState } from '@/lib/sync/status'
import { useOnline } from './useOnline'

export function useSync(): SyncState & { flush(): void } {
  const [state, setState] = useState<SyncState>(defaultSyncState)
  const isOnline = useOnline()

  const flush = useCallback(async () => {
    await flushOutbox((partial) =>
      setState((prev) => ({ ...prev, ...partial }))
    )
  }, [])

  // Flush on coming back online
  useEffect(() => {
    if (isOnline) {
      void flush()
      void pullAll()
    } else {
      setState((prev) => ({ ...prev, status: 'offline' }))
    }
  }, [isOnline, flush])

  // Pull + flush on visibility change back to visible
  useEffect(() => {
    const handleVisibility = () => {
      if (document.visibilityState === 'visible' && navigator.onLine) {
        void flush()
        void pullAll()
      }
    }

    document.addEventListener('visibilitychange', handleVisibility)
    return () => document.removeEventListener('visibilitychange', handleVisibility)
  }, [flush])

  // Register Background Sync if supported
  useEffect(() => {
    if ('serviceWorker' in navigator && 'SyncManager' in window) {
      navigator.serviceWorker.ready
        .then((reg) => (reg as any).sync?.register('flush-outbox'))
        .catch(console.warn)
    }
  }, [])

  return { ...state, flush }
}
