import { z } from 'zod'
import { type ReminderKind } from '../types'

export const reminderSchema = z.object({
  id: z.string().uuid(),
  equipment_id: z.string().uuid(),
  tech_id: z.string().uuid(),
  due_at: z.string().datetime(),
  kind: z.enum(['preventive_6mo', 'warranty_expiry']),
  delivered_at: z.string().datetime().nullable().optional(),
  created_at: z.string().datetime().optional(),
  updated_at: z.string().datetime().optional(),
  sync_version: z.number().int().nonnegative().default(0),
})

export const reminderCreateSchema = reminderSchema.omit({
  tech_id: true,
  created_at: true,
  updated_at: true,
  sync_version: true,
  delivered_at: true,
})

export type Reminder = z.infer<typeof reminderSchema>
export type ReminderCreate = z.infer<typeof reminderCreateSchema>
export type { ReminderKind }
