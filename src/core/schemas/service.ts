import { z } from 'zod'

export const checklistItemSchema = z.object({
  id: z.string(),
  label: z.string(),
  checked: z.boolean().default(false),
  value: z.string().or(z.number()).nullable().optional(), // for readings (pressure, amperage)
  unit: z.string().optional(), // e.g. "psi", "A", "°C"
})

export const checklistSchema = z.object({
  visual_inspection: z.array(checklistItemSchema).default([]),
  pressures: z.object({
    high_side_psi: z.number().nullable().optional(),
    low_side_psi: z.number().nullable().optional(),
  }),
  electrical: z.object({
    amperage_a: z.number().nullable().optional(),
    voltage_v: z.number().nullable().optional(),
  }),
  temperatures: z.object({
    supply_c: z.number().nullable().optional(),
    return_c: z.number().nullable().optional(),
  }),
  custom_items: z.array(checklistItemSchema).default([]),
})

export const serviceSchema = z.object({
  id: z.string().uuid(),
  equipment_id: z.string().uuid(),
  tech_id: z.string().uuid(),
  started_at: z.string().datetime(),
  ended_at: z.string().datetime().nullable().optional(),
  checklist_jsonb: checklistSchema.nullable().optional(),
  notes_text: z.string().max(5000).nullable().optional(),
  voice_transcript: z.string().max(10000).nullable().optional(),
  voice_pending: z.boolean().default(false), // true = audio recorded, transcript pending
  finalized: z.boolean().default(false),
  created_at: z.string().datetime().optional(),
  updated_at: z.string().datetime().optional(),
  deleted_at: z.string().datetime().nullable().optional(),
  sync_version: z.number().int().nonnegative().default(0),
})

export const serviceCreateSchema = serviceSchema.omit({
  tech_id: true,
  created_at: true,
  updated_at: true,
  deleted_at: true,
  sync_version: true,
})

export type Checklist = z.infer<typeof checklistSchema>
export type ChecklistItem = z.infer<typeof checklistItemSchema>
export type Service = z.infer<typeof serviceSchema>
export type ServiceCreate = z.infer<typeof serviceCreateSchema>
