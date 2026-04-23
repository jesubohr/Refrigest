/** Shared primitive types — no framework imports allowed in this file */

export type ULID = string
export type UUID = string
export type WaE164 = string // e.g. +5491123456789
export type ISODateString = string

export type SyncOp = 'insert' | 'update' | 'delete'
export type MediaKind = 'photo_before' | 'photo_after' | 'video' | 'audio'
export type ReportKind = 'asistencia' | 'garantia'
export type WarrantyDuration = 30 | 90 | 180
export type WarrantyCoverage = 'labor' | 'full'
export type ReminderKind = 'preventive_6mo' | 'warranty_expiry'
export type EquipmentTag = 'critical' | 'preventive_pending' | 'active_warranty'
