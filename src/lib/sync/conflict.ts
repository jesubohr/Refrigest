/**
 * Conflict resolution — Last Write Wins (LWW) by updated_at.
 * Single user mostly avoids conflicts, but multi-device case is covered.
 * Finalized services are immutable (never overwritten).
 */

export interface ConflictCandidate {
  local: { updated_at: string; finalized?: boolean }
  remote: { updated_at: string; finalized?: boolean }
}

export type ConflictResolution = 'keep_local' | 'use_remote'

export function resolveConflict(candidate: ConflictCandidate): ConflictResolution {
  const { local, remote } = candidate

  // Finalized services are immutable — always keep local finalized state
  if (local.finalized) return 'keep_local'

  const localDate = new Date(local.updated_at).getTime()
  const remoteDate = new Date(remote.updated_at).getTime()

  return remoteDate > localDate ? 'use_remote' : 'keep_local'
}
