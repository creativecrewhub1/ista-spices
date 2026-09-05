export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(value)
}

/**
 * A per-unit cost, which is derived by dividing and so rarely lands on a
 * whole rupee. formatCurrency drops the decimals, and on a rate the decimals
 * are the point: 100 paid for 3 kg is 33.33, not 33.
 */
export function formatRate(value: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value)
}

export function formatCompactNumber(value: number): string {
  return new Intl.NumberFormat('en-IN', { notation: 'compact' }).format(value)
}

export function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString('en-IN', {
    hour: 'numeric',
    minute: '2-digit',
  })
}

export function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
  })
}

export function formatDateLong(iso: string): string {
  return new Date(iso).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

/** Short weekday label for a YYYY-MM-DD date string, e.g. "Mon". */
export function formatWeekday(isoDate: string): string {
  return new Date(`${isoDate}T00:00:00`).toLocaleDateString('en-IN', { weekday: 'short' })
}

/**
 * A month, named. The stored value is the first of the month, so it is read
 * back as a plain date rather than through the timezone-shifting Date parse
 * that an ISO date string gets.
 */
export function formatMonth(isoDate: string): string {
  const [year, month] = isoDate.split('-').map(Number)
  return new Date(year, month - 1, 1).toLocaleDateString('en-IN', {
    month: 'long',
    year: 'numeric',
  })
}
