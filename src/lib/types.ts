// ============================================================
// SISMAC — Tipos TypeScript (generados del esquema de Supabase)
// ============================================================

export type UserRole = 'admin_sismac' | 'admin_financiero' | 'supervisor_bpm' | 'operario' | 'cliente'

export type TaskStatus = 'pendiente' | 'en_curso' | 'en_revision' | 'completada' | 'cancelada' | 'demorada'
export type TaskPriority = 'baja' | 'normal' | 'alta' | 'critica'
export type ProcessStatus = 'activo' | 'pausado' | 'completado' | 'cancelado'
export type InvoiceStatus = 'borrador' | 'emitida' | 'enviada' | 'cobrada' | 'vencida' | 'anulada'
export type BudgetStatus = 'borrador' | 'enviado' | 'aprobado' | 'rechazado' | 'vencido' | 'convertido'
export type ExpenseStatus = 'registrado' | 'aprobado' | 'rechazado'
export type DocumentStatus = 'vigente' | 'por_vencer' | 'vencido' | 'renovado' | 'pendiente_aprobacion'
export type EquipoStatus = 'operativo' | 'mantenimiento' | 'fuera_servicio' | 'baja'
export type NotificationType =
  | 'documento_por_vencer' | 'documento_vencido'
  | 'tarea_asignada' | 'tarea_demorada'
  | 'factura_por_vencer' | 'factura_vencida'
  | 'presupuesto_aprobado' | 'presupuesto_rechazado'
  | 'gasto_aprobado' | 'gasto_rechazado'
  | 'proceso_completado' | 'comentario_nuevo' | 'sistema'

// ============================================================
// ENTIDADES
// ============================================================

export interface Usuario {
  id: string
  email: string
  nombre: string
  apellido?: string | null
  rol: UserRole
  avatar_url?: string | null
  telefono?: string | null
  activo: boolean
  ultimo_acceso?: string | null
  created_at: string
  updated_at: string
}

export interface Cliente {
  id: string
  nombre: string
  razon_social?: string | null
  cuit?: string | null
  email?: string | null
  telefono?: string | null
  direccion?: string | null
  localidad?: string | null
  provincia?: string | null
  contacto_nombre?: string | null
  contacto_email?: string | null
  contacto_telefono?: string | null
  activo: boolean
  notas?: string | null
  created_at: string
  updated_at: string
}

export interface Sector {
  id: string
  cliente_id: string
  nombre: string
  descripcion?: string | null
  ubicacion?: string | null
  activo: boolean
  created_at: string
  updated_at: string
}

export interface Equipo {
  id: string
  sector_id: string
  nombre: string
  modelo?: string | null
  marca?: string | null
  numero_serie?: string | null
  estado: EquipoStatus
  proxima_revision?: string | null
  activo: boolean
  created_at: string
  updated_at: string
}

// ============================================================
// BPM
// ============================================================

export interface ProcessTemplate {
  id: string
  nombre: string
  descripcion?: string | null
  categoria?: string | null
  version: number
  activo: boolean
  creado_por: string
  created_at: string
  updated_at: string
}

export interface ProcessStage {
  id: string
  template_id: string
  nombre: string
  descripcion?: string | null
  orden: number
  duracion_estimada_horas?: number | null
  rol_responsable?: UserRole | null
  es_opcional: boolean
  created_at: string
}

export interface Process {
  id: string
  template_id?: string | null
  nombre: string
  descripcion?: string | null
  cliente_id?: string | null
  estado: ProcessStatus
  prioridad: TaskPriority
  fecha_inicio: string
  fecha_limite?: string | null
  completado_en?: string | null
  creado_por: string
  created_at: string
  updated_at: string
  // Relaciones
  cliente?: Cliente | null
  template?: ProcessTemplate | null
  tasks?: Task[]
}

export interface Task {
  id: string
  process_id?: string | null
  stage_id?: string | null
  titulo: string
  descripcion?: string | null
  estado: TaskStatus
  prioridad: TaskPriority
  asignado_a?: string | null
  creado_por: string
  cliente_id?: string | null
  fecha_limite?: string | null
  completada_en?: string | null
  estimacion_horas?: number | null
  horas_reales?: number | null
  orden: number
  parent_task_id?: string | null
  created_at: string
  updated_at: string
  // Relaciones
  asignado?: Usuario | null
  cliente?: Cliente | null
  comments?: TaskComment[]
  tags?: TaskTag[]
  subtasks?: Task[]
}

export interface TaskComment {
  id: string
  task_id: string
  autor_id: string
  contenido: string
  tipo: 'comentario' | 'cambio_estado' | 'asignacion' | 'sistema'
  metadata?: Record<string, unknown> | null
  created_at: string
  // Relaciones
  autor?: Usuario | null
}

export interface TaskTag {
  id: string
  nombre: string
  color: string
  created_at: string
}

// ============================================================
// FINANCIERO
// ============================================================

export interface Proveedor {
  id: string
  nombre: string
  razon_social?: string | null
  cuit?: string | null
  email?: string | null
  telefono?: string | null
  condicion_fiscal?: string | null
  activo: boolean
  created_at: string
  updated_at: string
}

export interface ExpenseCategory {
  id: string
  nombre: string
  descripcion?: string | null
  color: string
  icono?: string | null
  activo: boolean
  created_at: string
}

export interface CostCenter {
  id: string
  codigo: string
  nombre: string
  descripcion?: string | null
  responsable_id?: string | null
  activo: boolean
  created_at: string
}

export interface Expense {
  id: string
  descripcion: string
  monto: number
  moneda: 'ARS' | 'USD'
  tipo_cambio?: number | null
  fecha: string
  category_id: string
  proveedor_id?: string | null
  cost_center_id?: string | null
  cliente_id?: string | null
  proceso_id?: string | null
  metodo_pago?: string | null
  numero_comprobante?: string | null
  archivo_url?: string | null
  notas?: string | null
  creado_por: string
  aprobado_por?: string | null
  aprobado_en?: string | null
  estado: ExpenseStatus
  motivo_rechazo?: string | null
  created_at: string
  updated_at: string
  // Relaciones
  categoria?: ExpenseCategory | null
  proveedor?: Proveedor | null
  cost_center?: CostCenter | null
  cliente?: Cliente | null
}

export interface Invoice {
  id: string
  numero: string
  tipo: 'A' | 'B' | 'C' | 'X' | 'E'
  cliente_id: string
  descripcion: string
  subtotal: number
  iva_porcentaje: number
  iva_monto: number
  total: number
  moneda: 'ARS' | 'USD'
  fecha_emision: string
  fecha_vencimiento: string
  estado: InvoiceStatus
  fecha_cobro?: string | null
  metodo_cobro?: string | null
  notas?: string | null
  condiciones_pago?: string | null
  archivo_url?: string | null
  motivo_anulacion?: string | null
  creado_por: string
  created_at: string
  updated_at: string
  // Relaciones
  cliente?: Cliente | null
  items?: InvoiceItem[]
}

export interface InvoiceItem {
  id: string
  invoice_id: string
  descripcion: string
  unidad?: string | null
  cantidad: number
  precio_unitario: number
  subtotal: number
  proceso_id?: string | null
  orden: number
  created_at: string
}

export interface Budget {
  id: string
  numero: string
  cliente_id: string
  titulo: string
  descripcion?: string | null
  proceso_id?: string | null
  estado: BudgetStatus
  fecha_emision: string
  fecha_validez?: string | null
  moneda: 'ARS' | 'USD'
  subtotal: number
  iva_porcentaje: number
  iva_monto: number
  total: number
  version_actual: number
  notas?: string | null
  condiciones?: string | null
  creado_por: string
  aprobado_por?: string | null
  fecha_aprobacion?: string | null
  motivo_rechazo?: string | null
  invoice_id?: string | null
  created_at: string
  updated_at: string
  // Relaciones
  cliente?: Cliente | null
  items?: BudgetItem[]
  versions?: BudgetVersion[]
}

export interface BudgetVersion {
  id: string
  budget_id: string
  version_numero: number
  snapshot: Record<string, unknown>
  cambios?: string | null
  creado_por: string
  created_at: string
}

export interface BudgetItem {
  id: string
  budget_id: string
  descripcion: string
  unidad?: string | null
  cantidad: number
  precio_unitario: number
  descuento_porcentaje?: number | null
  subtotal: number
  orden: number
  created_at: string
}

// ============================================================
// COMPLIANCE
// ============================================================

export interface DocumentType {
  id: string
  nombre: string
  descripcion?: string | null
  alerta_dias_30: boolean
  alerta_dias_15: boolean
  alerta_dias_7: boolean
  alerta_dias_1: boolean
  obligatorio: boolean
  aplica_a: 'empresa' | 'persona' | 'equipo'
  activo: boolean
  created_at: string
}

export interface ClientDocument {
  id: string
  cliente_id: string
  document_type_id: string
  nombre_archivo: string
  archivo_url: string
  fecha_emision?: string | null
  fecha_vencimiento: string
  estado: DocumentStatus
  notas?: string | null
  numero_documento?: string | null
  organismo_emisor?: string | null
  cargado_por: string
  aprobado_por?: string | null
  aprobado_en?: string | null
  reemplaza_a?: string | null
  created_at: string
  updated_at: string
  // Relaciones
  cliente?: Cliente | null
  document_type?: DocumentType | null
  dias_para_vencer?: number
}

export interface ConsumanEntry {
  id: string
  cliente_id: string
  equipo_id?: string | null
  sector_id?: string | null
  tipo: string
  titulo: string
  descripcion?: string | null
  fecha: string
  proxima_revision?: string | null
  realizado_por?: string | null
  costo?: number | null
  expense_id?: string | null
  archivo_url?: string | null
  observaciones?: string | null
  created_at: string
  updated_at: string
  // Relaciones
  cliente?: Cliente | null
  equipo?: Equipo | null
}

// ============================================================
// TRANSVERSAL
// ============================================================

export interface AuditLog {
  id: string
  usuario_id?: string | null
  accion: string
  tabla: string
  registro_id?: string | null
  datos_anteriores?: Record<string, unknown> | null
  datos_nuevos?: Record<string, unknown> | null
  ip_address?: string | null
  user_agent?: string | null
  metadata?: Record<string, unknown> | null
  created_at: string
  // Relaciones
  usuario?: Usuario | null
}

export interface Notification {
  id: string
  usuario_id: string
  tipo: NotificationType
  titulo: string
  mensaje: string
  leida: boolean
  accion_url?: string | null
  metadata?: Record<string, unknown> | null
  created_at: string
  leida_en?: string | null
}

// ============================================================
// DATABASE TYPE (para Supabase client)
// ============================================================

export type Database = {
  public: {
    Tables: {
      usuarios: { Row: Usuario; Insert: Omit<Usuario, 'created_at' | 'updated_at'>; Update: Partial<Usuario> }
      clientes: { Row: Cliente; Insert: Omit<Cliente, 'id' | 'created_at' | 'updated_at'>; Update: Partial<Cliente> }
      sectores: { Row: Sector; Insert: Omit<Sector, 'id' | 'created_at' | 'updated_at'>; Update: Partial<Sector> }
      equipos: { Row: Equipo; Insert: Omit<Equipo, 'id' | 'created_at' | 'updated_at'>; Update: Partial<Equipo> }
      process_templates: { Row: ProcessTemplate; Insert: Omit<ProcessTemplate, 'id' | 'created_at' | 'updated_at'>; Update: Partial<ProcessTemplate> }
      processes: { Row: Process; Insert: Omit<Process, 'id' | 'created_at' | 'updated_at'>; Update: Partial<Process> }
      tasks: { Row: Task; Insert: Omit<Task, 'id' | 'created_at' | 'updated_at'>; Update: Partial<Task> }
      task_comments: { Row: TaskComment; Insert: Omit<TaskComment, 'id' | 'created_at'>; Update: never }
      task_tags: { Row: TaskTag; Insert: Omit<TaskTag, 'id' | 'created_at'>; Update: Partial<TaskTag> }
      proveedores: { Row: Proveedor; Insert: Omit<Proveedor, 'id' | 'created_at' | 'updated_at'>; Update: Partial<Proveedor> }
      expense_categories: { Row: ExpenseCategory; Insert: Omit<ExpenseCategory, 'id' | 'created_at'>; Update: Partial<ExpenseCategory> }
      cost_centers: { Row: CostCenter; Insert: Omit<CostCenter, 'id' | 'created_at'>; Update: Partial<CostCenter> }
      expenses: { Row: Expense; Insert: Omit<Expense, 'id' | 'created_at' | 'updated_at'>; Update: Partial<Expense> }
      invoices: { Row: Invoice; Insert: Omit<Invoice, 'id' | 'created_at' | 'updated_at'>; Update: Partial<Invoice> }
      invoice_items: { Row: InvoiceItem; Insert: Omit<InvoiceItem, 'id' | 'created_at'>; Update: Partial<InvoiceItem> }
      budgets: { Row: Budget; Insert: Omit<Budget, 'id' | 'created_at' | 'updated_at'>; Update: Partial<Budget> }
      budget_items: { Row: BudgetItem; Insert: Omit<BudgetItem, 'id' | 'created_at'>; Update: Partial<BudgetItem> }
      budget_versions: { Row: BudgetVersion; Insert: Omit<BudgetVersion, 'id' | 'created_at'>; Update: never }
      document_types: { Row: DocumentType; Insert: Omit<DocumentType, 'id' | 'created_at'>; Update: Partial<DocumentType> }
      client_documents: { Row: ClientDocument; Insert: Omit<ClientDocument, 'id' | 'created_at' | 'updated_at'>; Update: Partial<ClientDocument> }
      consuman_entries: { Row: ConsumanEntry; Insert: Omit<ConsumanEntry, 'id' | 'created_at' | 'updated_at'>; Update: Partial<ConsumanEntry> }
      audit_log: { Row: AuditLog; Insert: Omit<AuditLog, 'id' | 'created_at'>; Update: never }
      notifications: { Row: Notification; Insert: Omit<Notification, 'id' | 'created_at'>; Update: Partial<Notification> }
    }
    Functions: {
      get_user_rol: { Args: Record<never, never>; Returns: string }
      generate_invoice_number: { Args: Record<never, never>; Returns: string }
      generate_budget_number: { Args: Record<never, never>; Returns: string }
    }
  }
}

// ============================================================
// HELPERS DE UI
// ============================================================

export const TASK_STATUS_LABELS: Record<TaskStatus, string> = {
  pendiente: 'Pendiente',
  en_curso: 'En curso',
  en_revision: 'En revisión',
  completada: 'Completada',
  cancelada: 'Cancelada',
  demorada: 'Demorada',
}

export const TASK_STATUS_COLORS: Record<TaskStatus, string> = {
  pendiente: 'bg-slate-100 text-slate-700',
  en_curso: 'bg-blue-100 text-blue-700',
  en_revision: 'bg-yellow-100 text-yellow-700',
  completada: 'bg-green-100 text-green-700',
  cancelada: 'bg-gray-100 text-gray-500',
  demorada: 'bg-red-100 text-red-700',
}

export const PRIORITY_LABELS: Record<TaskPriority, string> = {
  baja: 'Baja',
  normal: 'Normal',
  alta: 'Alta',
  critica: 'Crítica',
}

export const PRIORITY_COLORS: Record<TaskPriority, string> = {
  baja: 'bg-slate-100 text-slate-600',
  normal: 'bg-blue-100 text-blue-600',
  alta: 'bg-orange-100 text-orange-600',
  critica: 'bg-red-100 text-red-600',
}

export const INVOICE_STATUS_LABELS: Record<InvoiceStatus, string> = {
  borrador: 'Borrador',
  emitida: 'Emitida',
  enviada: 'Enviada',
  cobrada: 'Cobrada',
  vencida: 'Vencida',
  anulada: 'Anulada',
}

export const INVOICE_STATUS_COLORS: Record<InvoiceStatus, string> = {
  borrador: 'bg-slate-100 text-slate-600',
  emitida: 'bg-blue-100 text-blue-600',
  enviada: 'bg-purple-100 text-purple-600',
  cobrada: 'bg-green-100 text-green-600',
  vencida: 'bg-red-100 text-red-600',
  anulada: 'bg-gray-100 text-gray-400',
}

export const BUDGET_STATUS_LABELS: Record<BudgetStatus, string> = {
  borrador: 'Borrador',
  enviado: 'Enviado',
  aprobado: 'Aprobado',
  rechazado: 'Rechazado',
  vencido: 'Vencido',
  convertido: 'Convertido a factura',
}

export const DOCUMENT_STATUS_LABELS: Record<DocumentStatus, string> = {
  vigente: 'Vigente',
  por_vencer: 'Por vencer',
  vencido: 'Vencido',
  renovado: 'Renovado',
  pendiente_aprobacion: 'Pendiente aprobación',
}

export const DOCUMENT_STATUS_COLORS: Record<DocumentStatus, string> = {
  vigente: 'bg-green-100 text-green-700',
  por_vencer: 'bg-yellow-100 text-yellow-700',
  vencido: 'bg-red-100 text-red-700',
  renovado: 'bg-blue-100 text-blue-700',
  pendiente_aprobacion: 'bg-orange-100 text-orange-700',
}

export const USER_ROLE_LABELS: Record<UserRole, string> = {
  admin_sismac: 'Administrador',
  admin_financiero: 'Admin. Financiero',
  supervisor_bpm: 'Supervisor BPM',
  operario: 'Operario',
  cliente: 'Cliente',
}
