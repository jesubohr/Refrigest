/**
 * Inventory delta helpers — pure functions, no side effects.
 * Called after service finalization to compute new stock levels.
 */

export interface InventoryEntry {
  part_id: string
  qty: number
}

export interface ServicePart {
  part_id: string
  qty: number
}

export interface InventoryDeltaResult {
  techInventory: InventoryEntry[]
  equipmentInventory: InventoryEntry[]
  /** Parts that would go below zero — validation error */
  insufficient: Array<{ part_id: string; needed: number; available: number }>
}

/**
 * Compute the resulting inventory after applying service parts.
 * Decrements tech inventory, increments equipment inventory.
 * Returns insufficient[] if any part would go below zero.
 */
export function computeInventoryDelta(
  currentTechInventory: InventoryEntry[],
  currentEquipmentInventory: InventoryEntry[],
  serviceParts: ServicePart[]
): InventoryDeltaResult {
  const techMap = new Map(currentTechInventory.map((e) => [e.part_id, e.qty]))
  const eqMap = new Map(currentEquipmentInventory.map((e) => [e.part_id, e.qty]))
  const insufficient: InventoryDeltaResult['insufficient'] = []

  for (const sp of serviceParts) {
    const available = techMap.get(sp.part_id) ?? 0
    if (available < sp.qty) {
      insufficient.push({ part_id: sp.part_id, needed: sp.qty, available })
    }
  }

  if (insufficient.length > 0) {
    return {
      techInventory: currentTechInventory,
      equipmentInventory: currentEquipmentInventory,
      insufficient,
    }
  }

  for (const sp of serviceParts) {
    techMap.set(sp.part_id, (techMap.get(sp.part_id) ?? 0) - sp.qty)
    eqMap.set(sp.part_id, (eqMap.get(sp.part_id) ?? 0) + sp.qty)
  }

  return {
    techInventory: Array.from(techMap.entries()).map(([part_id, qty]) => ({ part_id, qty })),
    equipmentInventory: Array.from(eqMap.entries()).map(([part_id, qty]) => ({ part_id, qty })),
    insufficient: [],
  }
}
