import { format, formatDistanceToNow, differenceInDays, isAfter, isBefore, addDays } from 'date-fns'
import { es } from 'date-fns/locale'

export const TZ = 'America/Argentina/Buenos_Aires'

export function formatDate(date: string | Date, pattern = 'dd/MM/yyyy'): string {
  return format(new Date(date), pattern, { locale: es })
}

export function formatDateTime(date: string | Date): string {
  return format(new Date(date), "dd/MM/yyyy HH:mm", { locale: es })
}

export function formatRelative(date: string | Date): string {
  return formatDistanceToNow(new Date(date), { addSuffix: true, locale: es })
}

export function diasParaVencer(fechaVencimiento: string | Date): number {
  return differenceInDays(new Date(fechaVencimiento), new Date())
}

export function getVencimientoColor(dias: number): string {
  if (dias < 0) return 'text-red-600 bg-red-50'
  if (dias <= 7) return 'text-orange-600 bg-orange-50'
  if (dias <= 15) return 'text-yellow-600 bg-yellow-50'
  if (dias <= 30) return 'text-amber-600 bg-amber-50'
  return 'text-green-600 bg-green-50'
}

export function getVencimientoLabel(dias: number): string {
  if (dias < 0) return `Vencido hace ${Math.abs(dias)} días`
  if (dias === 0) return 'Vence hoy'
  if (dias === 1) return 'Vence mañana'
  if (dias <= 7) return `Vence en ${dias} días`
  if (dias <= 30) return `Vence en ${dias} días`
  return `${formatDate(addDays(new Date(), dias))}`
}

export function isVencido(fecha: string | Date): boolean {
  return isBefore(new Date(fecha), new Date())
}

export function isPorVencer(fecha: string | Date, dias = 30): boolean {
  const d = new Date(fecha)
  return isAfter(d, new Date()) && isBefore(d, addDays(new Date(), dias))
}

export function fechaActual(): string {
  return format(new Date(), 'yyyy-MM-dd')
}

export function mes(fecha: string | Date): string {
  return format(new Date(fecha), 'MMMM yyyy', { locale: es })
}

export function nombreMes(numero: number): string {
  const meses = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre']
  return meses[numero - 1] ?? ''
}
