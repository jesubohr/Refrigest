export type SyncStatus = 'idle' | 'syncing' | 'error' | 'offline'

export interface SyncState {
  status: SyncStatus
  lastSyncedAt: Date | null
  pendingCount: number
  deadLetterCount: number
  error: string | null
}

export const defaultSyncState: SyncState = {
  status: 'idle',
  lastSyncedAt: null,
  pendingCount: 0,
  deadLetterCount: 0,
  error: null,
}
