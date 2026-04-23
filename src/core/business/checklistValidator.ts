import type { Checklist } from '../schemas/service'

export interface ChecklistValidationResult {
  valid: boolean
  errors: string[]
}

/**
 * Validate that a checklist has minimum required fields filled.
 * Pure function — no framework deps.
 */
export function validateChecklist(checklist: Partial<Checklist>): ChecklistValidationResult {
  const errors: string[] = []

  const { pressures, electrical } = checklist ?? {}

  if (pressures?.high_side_psi == null && pressures?.low_side_psi == null) {
    errors.push('At least one pressure reading (high or low side) is required.')
  }

  if (electrical?.amperage_a == null) {
    errors.push('Amperage reading is required.')
  }

  return {
    valid: errors.length === 0,
    errors,
  }
}
