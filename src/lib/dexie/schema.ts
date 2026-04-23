/**
 * Dexie IndexedDB schema — mirrors Supabase Postgres tables.
 * Extra tables: sync_outbox, media_blobs.
 */

import type { Client } from '@/core/schemas/client'
import type { Branch } from '@/core/schemas/branch'
import type { Equipment } from '@/core/schemas/equipment'
import type { Service } from '@/core/schemas/service'
import type { Part, TechInventory, EquipmentInventory, ServicePart } from '@/core/schemas/part'
import type { Report } from '@/core/schemas/report'
import type { Warranty } from '@/core/schemas/warranty'
import type { Claim } from '@/core/schemas/claim'
import type { Reminder } from '@/core/schemas/reminder'
import type { SyncOp, MediaKind } from '@/core/types'

export interface SyncOutboxEntry {
  id: string // client-generated uuid
  table: string
  op: SyncOp
  row_id: string
  payload_json: string // JSON.stringify of the row
  attempts: number
  last_error: string | null
  created_at: string
}

export interface MediaBlob {
  id: string // temp UUID used as local ref
  service_id: string
  kind: MediaKind
  blob: Blob
  mime_type: string
  size_bytes: number
  uploaded: boolean
  remote_url: string | null
  created_at: string
}

// Re-export Supabase-mirrored types for Dexie usage
export type {
  Client,
  Branch,
  Equipment,
  Service,
  Part,
  TechInventory,
  EquipmentInventory,
  ServicePart,
  Report,
  Warranty,
  Claim,
  Reminder,
}
