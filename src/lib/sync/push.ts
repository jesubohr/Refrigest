import { createClient } from '@/lib/supabase/client'
import {
  getPendingEntries,
  dequeue,
  markFailed,
  getDeadLettered,
  MAX_ATTEMPTS,
} from './outbox'
import type { SyncState } from './status'

const BASE_DELAY_MS = 500
const MAX_DELAY_MS = 30_000

function backoffDelay(attempt: number): number {
  return Math.min(BASE_DELAY_MS * 2 ** attempt, MAX_DELAY_MS)
}

/** Flush the sync outbox — push pending mutations to Supabase */
export async function flushOutbox(
  onStateChange?: (state: Partial<SyncState>) => void
): Promise<void> {
  if (typeof navigator !== 'undefined' && !navigator.onLine) {
    onStateChange?.({ status: 'offline' })
    return
  }

  const entries = await getPendingEntries()
  if (entries.length === 0) {
    onStateChange?.({ status: 'idle', pendingCount: 0 })
    return
  }

  onStateChange?.({ status: 'syncing', pendingCount: entries.length })
  const supabase = createClient()

  for (const entry of entries) {
    const payload = JSON.parse(entry.payload_json)

    try {
      if (entry.op === 'delete') {
        const { error } = await supabase
          .from(entry.table)
          .delete()
          .eq('id', entry.row_id)

        if (error) throw error
      } else {
        const { error } = await supabase
          .from(entry.table)
          .upsert(payload, { onConflict: 'id' })

        if (error) throw error
      }

      await dequeue(entry.id)
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err)
      await markFailed(entry.id, message)

      if (entry.attempts + 1 >= MAX_ATTEMPTS) {
        onStateChange?.({
          error: `Dead-letter: ${entry.table}/${entry.row_id} after ${MAX_ATTEMPTS} attempts.`,
        })
      }

      // Exponential backoff before next entry
      await new Promise((r) => setTimeout(r, backoffDelay(entry.attempts)))
    }
  }

  const dead = await getDeadLettered()
  onStateChange?.({
    status: 'idle',
    lastSyncedAt: new Date(),
    pendingCount: 0,
    deadLetterCount: dead.length,
  })
}
