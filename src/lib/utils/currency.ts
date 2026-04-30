export function formatARS(amount: number): string {
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    minimumFractionDigits: 2,
  }).format(amount)
}

export function formatUSD(amount: number): string {
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
  }).format(amount)
}

export function formatMonto(amount: number, moneda: 'ARS' | 'USD' = 'ARS'): string {
  return moneda === 'ARS' ? formatARS(amount) : formatUSD(amount)
}

export function formatNumber(n: number): string {
  return new Intl.NumberFormat('es-AR').format(n)
}

export function calcularSubtotal(cantidad: number, precioUnitario: number, descuento = 0): number {
  const base = cantidad * precioUnitario
  return base - (base * descuento / 100)
}
