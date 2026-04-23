/**
 * Role-gate helpers — future-proof for multi-tenant expansion.
 * MVP: single user / single role (owner). All gates return true.
 */

export type Role = 'owner'

export function can(
  _action: 'manage_clients' | 'manage_inventory' | 'view_stats' | 'export_csv',
  _role: Role = 'owner'
): boolean {
  // Single-user MVP — owner can do everything
  return true
}
