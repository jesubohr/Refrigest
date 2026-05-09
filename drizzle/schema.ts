import {
  pgTable,
  text,
  uuid,
  timestamp,
  integer,
  boolean,
  real,
  jsonb,
  pgEnum,
  primaryKey,
  index,
  uniqueIndex,
} from 'drizzle-orm/pg-core'
import { pgPolicy } from 'drizzle-orm/pg-core/policies'
import { relations, sql } from 'drizzle-orm'
import { authenticatedRole, authUid } from 'drizzle-orm/supabase'

// --- Enums ---

export const mediaKindEnum = pgEnum('media_kind', [
  'photo_before',
  'photo_after',
  'video',
  'audio',
])

export const reportKindEnum = pgEnum('report_kind', ['asistencia', 'garantia'])

export const warrantyCoverageEnum = pgEnum('warranty_coverage', ['labor', 'full'])

export const reminderKindEnum = pgEnum('reminder_kind', [
  'preventive_6mo',
  'warranty_expiry',
])

// --- Tables ---

/**
 * clients — WhatsApp E.164 number is the PK (no signup).
 */
export const clients = pgTable(
  'clients',
  {
    whatsapp_e164: text('whatsapp_e164').primaryKey(),
    tech_id: uuid('tech_id').notNull(),
    alias: text('alias').notNull(),
    legal_name: text('legal_name'),
    created_at: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updated_at: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
    deleted_at: timestamp('deleted_at', { withTimezone: true }),
    sync_version: integer('sync_version').default(0).notNull(),
  },
  (t) => [
    pgPolicy('clients_tech_isolation', {
      as: 'permissive',
      for: 'all',
      to: authenticatedRole,
      using: sql`${t.tech_id} = ${authUid}`,
      withCheck: sql`${t.tech_id} = ${authUid}`,
    }),
  ]
).enableRLS()

export const branches = pgTable(
  'branches',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    client_wa: text('client_wa')
      .notNull()
      .references(() => clients.whatsapp_e164, { onDelete: 'cascade' }),
    tech_id: uuid('tech_id').notNull(),
    name: text('name').notNull(),
    lat: real('lat'),
    lng: real('lng'),
    address: text('address'),
    created_at: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updated_at: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
    deleted_at: timestamp('deleted_at', { withTimezone: true }),
    sync_version: integer('sync_version').default(0).notNull(),
  },
  (t) => [
    index('branches_client_wa_idx').on(t.client_wa),
    pgPolicy('branches_tech_isolation', {
      as: 'permissive',
      for: 'all',
      to: authenticatedRole,
      using: sql`${t.tech_id} = ${authUid}`,
      withCheck: sql`${t.tech_id} = ${authUid}`,
    }),
  ]
).enableRLS()

export const equipment = pgTable(
  'equipment',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    branch_id: uuid('branch_id')
      .notNull()
      .references(() => branches.id, { onDelete: 'cascade' }),
    tech_id: uuid('tech_id').notNull(),
    brand: text('brand').notNull(),
    model: text('model'),
    refrigerant: text('refrigerant'),
    placa_photo_url: text('placa_photo_url'),
    placa_photo_pending: boolean('placa_photo_pending').default(false).notNull(),
    tags: text('tags').array().default([]).notNull(),
    created_at: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updated_at: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
    deleted_at: timestamp('deleted_at', { withTimezone: true }),
    sync_version: integer('sync_version').default(0).notNull(),
  },
  (t) => [
    index('equipment_branch_id_idx').on(t.branch_id),
    pgPolicy('equipment_tech_isolation', {
      as: 'permissive',
      for: 'all',
      to: authenticatedRole,
      using: sql`${t.tech_id} = ${authUid}`,
      withCheck: sql`${t.tech_id} = ${authUid}`,
    }),
  ]
).enableRLS()

export const services = pgTable(
  'services',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    equipment_id: uuid('equipment_id')
      .notNull()
      .references(() => equipment.id, { onDelete: 'cascade' }),
    tech_id: uuid('tech_id').notNull(),
    started_at: timestamp('started_at', { withTimezone: true }).defaultNow().notNull(),
    ended_at: timestamp('ended_at', { withTimezone: true }),
    checklist_jsonb: jsonb('checklist_jsonb'),
    notes_text: text('notes_text'),
    voice_transcript: text('voice_transcript'),
    voice_pending: boolean('voice_pending').default(false).notNull(),
    finalized: boolean('finalized').default(false).notNull(),
    created_at: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updated_at: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
    deleted_at: timestamp('deleted_at', { withTimezone: true }),
    sync_version: integer('sync_version').default(0).notNull(),
  },
  (t) => [
    index('services_equipment_id_idx').on(t.equipment_id),
    pgPolicy('services_tech_isolation', {
      as: 'permissive',
      for: 'all',
      to: authenticatedRole,
      using: sql`${t.tech_id} = ${authUid}`,
      withCheck: sql`${t.tech_id} = ${authUid}`,
    }),
  ]
).enableRLS()

export const serviceMedia = pgTable(
  'service_media',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    service_id: uuid('service_id')
      .notNull()
      .references(() => services.id, { onDelete: 'cascade' }),
    kind: mediaKindEnum('kind').notNull(),
    url: text('url'),
    thumb_url: text('thumb_url'),
    pending_upload: boolean('pending_upload').default(true).notNull(),
  },
  (t) => [
    index('service_media_service_id_idx').on(t.service_id),
    pgPolicy('service_media_tech_isolation', {
      as: 'permissive',
      for: 'all',
      to: authenticatedRole,
      using: sql`EXISTS (SELECT 1 FROM services WHERE services.id = ${t.service_id} AND services.tech_id = ${authUid})`,
      withCheck: sql`EXISTS (SELECT 1 FROM services WHERE services.id = ${t.service_id} AND services.tech_id = ${authUid})`,
    }),
  ]
).enableRLS()

export const parts = pgTable(
  'parts',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    tech_id: uuid('tech_id').notNull(),
    name: text('name').notNull(),
    sku: text('sku'),
    created_at: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updated_at: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
    deleted_at: timestamp('deleted_at', { withTimezone: true }),
    sync_version: integer('sync_version').default(0).notNull(),
  },
  (t) => [
    pgPolicy('parts_tech_isolation', {
      as: 'permissive',
      for: 'all',
      to: authenticatedRole,
      using: sql`${t.tech_id} = ${authUid}`,
      withCheck: sql`${t.tech_id} = ${authUid}`,
    }),
  ]
).enableRLS()

export const techInventory = pgTable(
  'tech_inventory',
  {
    tech_id: uuid('tech_id').notNull(),
    part_id: uuid('part_id')
      .notNull()
      .references(() => parts.id, { onDelete: 'cascade' }),
    qty: integer('qty').default(0).notNull(),
    updated_at: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
    sync_version: integer('sync_version').default(0).notNull(),
  },
  (t) => [
    primaryKey({ columns: [t.tech_id, t.part_id] }),
    pgPolicy('tech_inventory_tech_isolation', {
      as: 'permissive',
      for: 'all',
      to: authenticatedRole,
      using: sql`${t.tech_id} = ${authUid}`,
      withCheck: sql`${t.tech_id} = ${authUid}`,
    }),
  ]
).enableRLS()

export const equipmentInventory = pgTable(
  'equipment_inventory',
  {
    equipment_id: uuid('equipment_id')
      .notNull()
      .references(() => equipment.id, { onDelete: 'cascade' }),
    part_id: uuid('part_id')
      .notNull()
      .references(() => parts.id, { onDelete: 'cascade' }),
    qty: integer('qty').default(0).notNull(),
    updated_at: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
    sync_version: integer('sync_version').default(0).notNull(),
  },
  (t) => [
    primaryKey({ columns: [t.equipment_id, t.part_id] }),
    pgPolicy('equipment_inventory_tech_isolation', {
      as: 'permissive',
      for: 'all',
      to: authenticatedRole,
      using: sql`EXISTS (SELECT 1 FROM equipment WHERE equipment.id = ${t.equipment_id} AND equipment.tech_id = ${authUid})`,
      withCheck: sql`EXISTS (SELECT 1 FROM equipment WHERE equipment.id = ${t.equipment_id} AND equipment.tech_id = ${authUid})`,
    }),
  ]
).enableRLS()

export const serviceParts = pgTable(
  'service_parts',
  {
    service_id: uuid('service_id')
      .notNull()
      .references(() => services.id, { onDelete: 'cascade' }),
    part_id: uuid('part_id')
      .notNull()
      .references(() => parts.id, { onDelete: 'cascade' }),
    qty: integer('qty').notNull(),
  },
  (t) => [
    primaryKey({ columns: [t.service_id, t.part_id] }),
    pgPolicy('service_parts_tech_isolation', {
      as: 'permissive',
      for: 'all',
      to: authenticatedRole,
      using: sql`EXISTS (SELECT 1 FROM services WHERE services.id = ${t.service_id} AND services.tech_id = ${authUid})`,
      withCheck: sql`EXISTS (SELECT 1 FROM services WHERE services.id = ${t.service_id} AND services.tech_id = ${authUid})`,
    }),
  ]
).enableRLS()

export const reports = pgTable(
  'reports',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    service_id: uuid('service_id')
      .notNull()
      .references(() => services.id, { onDelete: 'cascade' }),
    tech_id: uuid('tech_id').notNull(),
    kind: reportKindEnum('kind').notNull(),
    pdf_url: text('pdf_url'),
    pdf_pending: boolean('pdf_pending').default(true).notNull(),
    unique_number: text('unique_number').notNull(),
    created_at: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updated_at: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
    sync_version: integer('sync_version').default(0).notNull(),
  },
  (t) => [
    uniqueIndex('reports_unique_number_idx').on(t.unique_number),
    pgPolicy('reports_tech_isolation', {
      as: 'permissive',
      for: 'all',
      to: authenticatedRole,
      using: sql`${t.tech_id} = ${authUid}`,
      withCheck: sql`${t.tech_id} = ${authUid}`,
    }),
  ]
).enableRLS()

export const warranties = pgTable(
  'warranties',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    report_id: uuid('report_id')
      .notNull()
      .references(() => reports.id, { onDelete: 'cascade' }),
    tech_id: uuid('tech_id').notNull(),
    duration_days: integer('duration_days').notNull(), // 30 | 90 | 180
    coverage: warrantyCoverageEnum('coverage').notNull(),
    starts_at: timestamp('starts_at', { withTimezone: true }).notNull(),
    expires_at: timestamp('expires_at', { withTimezone: true }).notNull(),
    created_at: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updated_at: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
    sync_version: integer('sync_version').default(0).notNull(),
  },
  (t) => [
    index('warranties_expires_at_idx').on(t.expires_at),
    pgPolicy('warranties_tech_isolation', {
      as: 'permissive',
      for: 'all',
      to: authenticatedRole,
      using: sql`${t.tech_id} = ${authUid}`,
      withCheck: sql`${t.tech_id} = ${authUid}`,
    }),
  ]
).enableRLS()

export const claims = pgTable(
  'claims',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    warranty_id: uuid('warranty_id')
      .notNull()
      .references(() => warranties.id, { onDelete: 'cascade' }),
    tech_id: uuid('tech_id').notNull(),
    date: timestamp('date', { withTimezone: true }).notNull(),
    notes: text('notes'),
    created_at: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updated_at: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
    sync_version: integer('sync_version').default(0).notNull(),
  },
  (t) => [
    pgPolicy('claims_tech_isolation', {
      as: 'permissive',
      for: 'all',
      to: authenticatedRole,
      using: sql`${t.tech_id} = ${authUid}`,
      withCheck: sql`${t.tech_id} = ${authUid}`,
    }),
  ]
).enableRLS()

export const reminders = pgTable(
  'reminders',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    equipment_id: uuid('equipment_id')
      .notNull()
      .references(() => equipment.id, { onDelete: 'cascade' }),
    tech_id: uuid('tech_id').notNull(),
    due_at: timestamp('due_at', { withTimezone: true }).notNull(),
    kind: reminderKindEnum('kind').notNull(),
    delivered_at: timestamp('delivered_at', { withTimezone: true }),
    created_at: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updated_at: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
    sync_version: integer('sync_version').default(0).notNull(),
  },
  (t) => [
    index('reminders_due_at_idx').on(t.due_at),
    pgPolicy('reminders_tech_isolation', {
      as: 'permissive',
      for: 'all',
      to: authenticatedRole,
      using: sql`${t.tech_id} = ${authUid}`,
      withCheck: sql`${t.tech_id} = ${authUid}`,
    }),
  ]
).enableRLS()

// --- Relations ---

export const clientsRelations = relations(clients, ({ many }) => ({
  branches: many(branches),
}))

export const branchesRelations = relations(branches, ({ one, many }) => ({
  client: one(clients, { fields: [branches.client_wa], references: [clients.whatsapp_e164] }),
  equipment: many(equipment),
}))

export const equipmentRelations = relations(equipment, ({ one, many }) => ({
  branch: one(branches, { fields: [equipment.branch_id], references: [branches.id] }),
  services: many(services),
  reminders: many(reminders),
}))

export const servicesRelations = relations(services, ({ one, many }) => ({
  equipment: one(equipment, { fields: [services.equipment_id], references: [equipment.id] }),
  media: many(serviceMedia),
  parts: many(serviceParts),
  reports: many(reports),
}))
