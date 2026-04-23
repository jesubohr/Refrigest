import { z } from 'zod'
import { type EquipmentTag } from '../types'

export const equipmentTagSchema = z.enum(['critical', 'preventive_pending', 'active_warranty'])

export const equipmentSchema = z.object({
  id: z.string().uuid(),
  branch_id: z.string().uuid(),
  tech_id: z.string().uuid(),
  brand: z.string().min(1, 'Brand is required').max(100),
  model: z.string().max(100).nullable().optional(),
  refrigerant: z.string().max(20).nullable().optional(), // e.g. R-410A
  placa_photo_url: z.string().url().nullable().optional(),
  placa_photo_pending: z.boolean().default(false), // true = waiting for upload
  tags: z.array(equipmentTagSchema).default([]),
  created_at: z.string().datetime().optional(),
  updated_at: z.string().datetime().optional(),
  deleted_at: z.string().datetime().nullable().optional(),
  sync_version: z.number().int().nonnegative().default(0),
})

export const equipmentCreateSchema = equipmentSchema.omit({
  tech_id: true,
  created_at: true,
  updated_at: true,
  deleted_at: true,
  sync_version: true,
})

export type Equipment = z.infer<typeof equipmentSchema>
export type EquipmentCreate = z.infer<typeof equipmentCreateSchema>
export type { EquipmentTag }
