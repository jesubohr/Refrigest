import { createClient } from '@/lib/supabase/client'
import { db } from '@/lib/dexie/db'
import { resolveConflict } from './conflict'

const PULL_TABLES = [
  'clients',
  'branches',
  'equipment',
  'services',
  'parts',
  'tech_inventory',
  'equipment_inventory',
  'reports',
  'warranties',
  'claims',
  'reminders',
] as const

type PullTable = (typeof PULL_TABLES)[number]

const PULL_LIMIT = 500

/** Cursor stored in localStorage — last successfully pulled updated_at per table */
function getCursor(table: string): string {
  if (typeof window === 'undefined') return new Date(0).toISOString()
  return localStorage.getItem(`sync_cursor_${table}`) ?? new Date(0).toISOString()
}

function setCursor(table: string, value: string): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem(`sync_cursor_${table}`, value)
  }
}

/** Pull rows updated after cursor from Supabase, merge into Dexie */
export async function pullTable(table: PullTable): Promise<void> {
  const supabase = createClient()
  const cursor = getCursor(table)

  const { data, error } = await supabase
    .from(table)
    .select('*')
    .gt('updated_at', cursor)
    .order('updated_at', { ascending: true })
    .limit(PULL_LIMIT)

  if (error) throw error
  if (!data || data.length === 0) return

  const dexieTable = db.table(table)

  for (const row of data) {
    const local = await dexieTable.get(row.id ?? row.whatsapp_e164 ?? row.part_id)

    if (local) {
      const resolution = resolveConflict({
        local: { updated_at: local.updated_at ?? '', finalized: local.finalized },
        remote: { updated_at: row.updated_at ?? '', finalized: row.finalized },
      })
      if (resolution === 'use_remote') {
        await dexieTable.put(row)
      }
    } else {
      await dexieTable.put(row)
    }
  }

  // Advance cursor to the latest updated_at
  const latestUpdatedAt = data[data.length - 1]?.updated_at
  if (latestUpdatedAt) {
    setCursor(table, latestUpdatedAt)
  }
}

/** Pull all tables (called on boot + online event) */
export async function pullAll(): Promise<void> {
  if (typeof navigator !== 'undefined' && !navigator.onLine) return

  for (const table of PULL_TABLES) {
    try {
      await pullTable(table)
    } catch (err) {
      console.error(`[sync/pull] Failed to pull ${table}:`, err)
    }
  }
}
