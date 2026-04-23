import { z } from 'zod'

export const partSchema = z.object({
  id: z.string().uuid(),
  tech_id: z.string().uuid(),
  name: z.string().min(1, 'Part name is required').max(200),
  sku: z.string().max(100).nullable().optional(),
  created_at: z.string().datetime().optional(),
  updated_at: z.string().datetime().optional(),
  deleted_at: z.string().datetime().nullable().optional(),
  sync_version: z.number().int().nonnegative().default(0),
})

export const techInventorySchema = z.object({
  tech_id: z.string().uuid(),
  part_id: z.string().uuid(),
  qty: z.number().int().min(0),
  updated_at: z.string().datetime().optional(),
  sync_version: z.number().int().nonnegative().default(0),
})

export const equipmentInventorySchema = z.object({
  equipment_id: z.string().uuid(),
  part_id: z.string().uuid(),
  qty: z.number().int().min(0),
  updated_at: z.string().datetime().optional(),
  sync_version: z.number().int().nonnegative().default(0),
})

export const servicePartSchema = z.object({
  service_id: z.string().uuid(),
  part_id: z.string().uuid(),
  qty: z.number().int().min(1),
})

export const partCreateSchema = partSchema.omit({
  tech_id: true,
  created_at: true,
  updated_at: true,
  deleted_at: true,
  sync_version: true,
})

export type Part = z.infer<typeof partSchema>
export type PartCreate = z.infer<typeof partCreateSchema>
export type TechInventory = z.infer<typeof techInventorySchema>
export type EquipmentInventory = z.infer<typeof equipmentInventorySchema>
export type ServicePart = z.infer<typeof servicePartSchema>
