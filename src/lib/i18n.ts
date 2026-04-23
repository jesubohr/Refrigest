/**
 * i18n — Spanish-first locale strings.
 * Flat key-value for simplicity. Add namespaces as app grows.
 */

export const es = {
  // Navigation
  nav_today: 'Hoy',
  nav_clients: 'Clientes',
  nav_warranties: 'Garantías',
  nav_inventory: 'Inventario',

  // Clients
  client_add: '+ Agregar Cliente',
  client_empty: 'No hay clientes aún.',
  client_whatsapp: 'WhatsApp',
  client_alias: 'Nombre / Alias',
  client_legal_name: 'Razón Social',
  client_branches: 'Sucursales',

  // Branches
  branch_add: '+ Agregar Sucursal',
  branch_name: 'Nombre de Sucursal',
  branch_address: 'Dirección',
  branch_capture_gps: 'Capturar GPS',
  branch_equipment: 'Equipos',

  // Equipment
  equipment_add: '+ Agregar Equipo',
  equipment_brand: 'Marca',
  equipment_model: 'Modelo',
  equipment_refrigerant: 'Refrigerante',
  equipment_placa: 'Foto de Placa',
  equipment_history: 'Historial de Servicios',
  equipment_tag_critical: 'Crítico',
  equipment_tag_preventive_pending: 'Preventivo Pendiente',
  equipment_tag_active_warranty: 'Garantía Activa',

  // Services
  service_new: 'Nuevo Servicio',
  service_finalize: 'Finalizar Servicio',
  service_checklist: 'Checklist',
  service_notes: 'Notas',
  service_photos: 'Fotos',
  service_voice: 'Nota de Voz',
  service_parts: 'Partes Utilizadas',
  service_readings: 'Lecturas',

  // Reports
  report_asistencia: 'Reporte de Asistencia',
  report_garantia: 'Certificado de Garantía',
  report_generate: 'Generar Reporte',
  report_share_wa: 'Compartir por WhatsApp',
  report_download: 'Descargar PDF',

  // Warranties
  warranty_active: 'Activas',
  warranty_expiring: 'Por Vencer',
  warranty_duration_30: '30 días',
  warranty_duration_90: '3 meses',
  warranty_duration_180: '6 meses',
  warranty_coverage_labor: 'Mano de Obra',
  warranty_coverage_full: 'Total',

  // Inventory
  inventory_parts: 'Stock de Partes',
  inventory_add_part: '+ Agregar Parte',
  inventory_export_csv: 'Exportar CSV',
  inventory_stock_ok: 'OK',
  inventory_stock_low: 'Bajo',
  inventory_stock_zero: 'Sin stock',

  // Sync
  sync_offline: 'Sin conexión — cambios guardados localmente',
  sync_syncing: 'Sincronizando...',
  sync_error: 'Error de sincronización',
  sync_dead_letter: 'Cambio no pudo sincronizarse tras varios intentos',

  // Common
  cancel: 'Cancelar',
  save: 'Guardar',
  delete: 'Eliminar',
  edit: 'Editar',
  confirm: 'Confirmar',
  loading: 'Cargando...',
  error_generic: 'Ocurrió un error. Intente nuevamente.',
} as const

export type I18nKey = keyof typeof es
export const t = (key: I18nKey): string => es[key]
