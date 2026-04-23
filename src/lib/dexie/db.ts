import Dexie, { type EntityTable } from 'dexie'
import type {
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
  SyncOutboxEntry,
  MediaBlob,
} from './schema'

class RefrigestDB extends Dexie {
  clients!: EntityTable<Client, 'whatsapp_e164'>
  branches!: EntityTable<Branch, 'id'>
  equipment!: EntityTable<Equipment, 'id'>
  services!: EntityTable<Service, 'id'>
  service_media!: EntityTable<
    {
      id: string
      service_id: string
      kind: string
      url: string | null
      thumb_url: string | null
      pending_upload: boolean
    },
    'id'
  >
  parts!: EntityTable<Part, 'id'>
  tech_inventory!: EntityTable<TechInventory, 'part_id'>
  equipment_inventory!: EntityTable<EquipmentInventory, 'part_id'>
  service_parts!: EntityTable<ServicePart, 'service_id'>
  reports!: EntityTable<Report, 'id'>
  warranties!: EntityTable<Warranty, 'id'>
  claims!: EntityTable<Claim, 'id'>
  reminders!: EntityTable<Reminder, 'id'>
  sync_outbox!: EntityTable<SyncOutboxEntry, 'id'>
  media_blobs!: EntityTable<MediaBlob, 'id'>

  constructor() {
    super('refrigestDB')

    this.version(1).stores({
      clients: 'whatsapp_e164, tech_id, deleted_at, sync_version',
      branches: 'id, client_wa, tech_id, deleted_at, sync_version',
      equipment: 'id, branch_id, tech_id, deleted_at, sync_version',
      services: 'id, equipment_id, tech_id, finalized, deleted_at, sync_version',
      service_media: 'id, service_id, kind, pending_upload',
      parts: 'id, tech_id, deleted_at, sync_version',
      tech_inventory: 'part_id, tech_id, sync_version',
      equipment_inventory: '[equipment_id+part_id], equipment_id, part_id',
      service_parts: '[service_id+part_id], service_id, part_id',
      reports: 'id, service_id, tech_id, kind, sync_version',
      warranties: 'id, report_id, tech_id, expires_at, sync_version',
      claims: 'id, warranty_id, tech_id, sync_version',
      reminders: 'id, equipment_id, tech_id, due_at, delivered_at, sync_version',
      sync_outbox: 'id, table, op, row_id, attempts',
      media_blobs: 'id, service_id, uploaded',
    })
  }
}

export const db = new RefrigestDB()
