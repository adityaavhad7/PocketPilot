/**
 * Formatting helpers for PocketPilot
 * Permanently uses Indian Rupees (INR, ₹) and the Indian numbering system (en-IN)
 */

const inrCurrencyFormatter = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

const inrAxisFormatter = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  maximumFractionDigits: 0,
});

/**
 * Formats a numeric amount using the Indian numbering system and ₹ symbol.
 * Example outputs:
 *  1000 => ₹1,000.00
 *  10000 => ₹10,000.00
 *  100000 => ₹1,00,000.00
 *  1000000 => ₹10,00,000.00
 *  -450 => -₹450.00
 */
export function formatCurrency(amount: number | string, _symbol?: string): string {
  const numericAmount = typeof amount === 'number' ? amount : parseFloat(amount) || 0;
  if (isNaN(numericAmount)) return '₹0.00';
  return inrCurrencyFormatter.format(numericAmount);
}

/**
 * Formats chart axis values compactly without decimals while adhering to Indian numbering and ₹.
 * Example outputs:
 *  1000 => ₹1,000
 *  100000 => ₹1,00,000
 */
export function formatAxisCurrency(amount: number | string): string {
  const numericAmount = typeof amount === 'number' ? amount : parseFloat(amount) || 0;
  if (isNaN(numericAmount)) return '₹0';
  return inrAxisFormatter.format(numericAmount);
}

export function formatPercentage(ratio: number): string {
  const percent = Math.round(ratio * 100);
  return `${percent}%`;
}

export function formatDate(dateStr: string): string {
  if (!dateStr) return '';
  try {
    const parts = dateStr.split('-');
    if (parts.length === 3) {
      const year = parseInt(parts[0], 10);
      const month = parseInt(parts[1], 10) - 1;
      const day = parseInt(parts[2], 10);
      const date = new Date(year, month, day);
      return date.toLocaleDateString('en-IN', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });
    }
    return new Date(dateStr).toLocaleDateString('en-IN', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  } catch {
    return dateStr;
  }
}

export function getCurrentMonthKey(d: Date = new Date()): string {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  return `${year}-${month}`;
}

export function getMonthLabel(monthKey: string): string {
  if (!monthKey) return '';
  const [yearStr, monthStr] = monthKey.split('-');
  const year = parseInt(yearStr, 10);
  const month = parseInt(monthStr, 10) - 1;
  const d = new Date(year, month, 1);
  return d.toLocaleDateString('en-IN', { month: 'long', year: 'numeric' });
}

export function getDaysRemainingInMonth(d: Date = new Date()): number {
  const year = d.getFullYear();
  const month = d.getMonth();
  const totalDays = new Date(year, month + 1, 0).getDate();
  const currentDay = d.getDate();
  const remaining = totalDays - currentDay + 1;
  return Math.max(0, remaining);
}
