import { z } from 'zod'
import { type WarrantyCoverage, type WarrantyDuration } from '../types'

export const warrantySchema = z.object({
  id: z.string().uuid(),
  report_id: z.string().uuid(),
  tech_id: z.string().uuid(),
  duration_days: z.union([z.literal(30), z.literal(90), z.literal(180)]),
  coverage: z.enum(['labor', 'full']),
  starts_at: z.string().datetime(),
  expires_at: z.string().datetime(),
  created_at: z.string().datetime().optional(),
  updated_at: z.string().datetime().optional(),
  sync_version: z.number().int().nonnegative().default(0),
})

export const warrantyCreateSchema = warrantySchema.omit({
  tech_id: true,
  created_at: true,
  updated_at: true,
  sync_version: true,
  expires_at: true, // computed from starts_at + duration_days
})

export type Warranty = z.infer<typeof warrantySchema>
export type WarrantyCreate = z.infer<typeof warrantyCreateSchema>
export type { WarrantyCoverage, WarrantyDuration }
