import { db } from '@/lib/dexie/db'
import type { SyncOp } from '@/core/types'
import { v4 as uuid } from 'uuid'

/**
 * Write a mutation to the sync outbox.
 * Every Dexie mutation that needs to sync to Supabase calls this.
 */
export async function enqueue(table: string, op: SyncOp, rowId: string, payload: object): Promise<void> {
  await db.sync_outbox.add({
    id: uuid(),
    table,
    op,
    row_id: rowId,
    payload_json: JSON.stringify(payload),
    attempts: 0,
    last_error: null,
    created_at: new Date().toISOString(),
  })
}

/** Remove a successfully synced entry from the outbox */
export async function dequeue(id: string): Promise<void> {
  await db.sync_outbox.delete(id)
}

/** Mark an entry as failed with error message */
export async function markFailed(id: string, error: string): Promise<void> {
  const entry = await db.sync_outbox.get(id)
  if (!entry) return
  await db.sync_outbox.update(id, {
    attempts: entry.attempts + 1,
    last_error: error,
  })
}

export const MAX_ATTEMPTS = 10

/** Get entries that are eligible for retry (not dead-lettered) */
export async function getPendingEntries() {
  return db.sync_outbox
    .where('attempts')
    .below(MAX_ATTEMPTS)
    .sortBy('created_at')
}

/** Get dead-lettered entries (failed > MAX_ATTEMPTS) */
export async function getDeadLettered() {
  return db.sync_outbox
    .where('attempts')
    .aboveOrEqual(MAX_ATTEMPTS)
    .toArray()
}
