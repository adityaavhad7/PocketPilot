import type { Transaction, Budget, SavingsGoal, UserSettings, ThemeId } from '../types';
import { DEFAULT_SETTINGS } from '../storage/db';

export function toSupabaseTransaction(tx: Transaction, userId: string) {
  return {
    id: tx.id,
    user_id: userId,
    type: tx.type,
    amount: tx.amount,
    category: tx.category,
    date: tx.date,
    description: tx.description || null,
    payment_method: tx.paymentMethod || null,
    created_at: tx.createdAt || new Date().toISOString(),
    updated_at: tx.updatedAt || new Date().toISOString(),
  };
}

export function fromSupabaseTransaction(row: any): Transaction {
  return {
    id: row.id,
    type: row.type,
    amount: Number(row.amount) || 0,
    category: row.category,
    date: row.date,
    description: row.description || '',
    paymentMethod: row.payment_method || undefined,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function toSupabaseBudget(b: Budget, userId: string) {
  return {
    id: b.id,
    user_id: userId,
    month: b.month,
    category: b.category,
    amount: b.amount,
    created_at: b.createdAt || new Date().toISOString(),
    updated_at: b.updatedAt || new Date().toISOString(),
  };
}

export function fromSupabaseBudget(row: any): Budget {
  return {
    id: row.id,
    month: row.month,
    category: row.category,
    amount: Number(row.amount) || 0,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function toSupabaseGoal(g: SavingsGoal, userId: string) {
  return {
    id: g.id,
    user_id: userId,
    name: g.name,
    target_amount: g.targetAmount,
    current_saved_amount: g.currentSavedAmount || 0,
    target_date: g.targetDate || null,
    description: g.description || null,
    created_at: g.createdAt || new Date().toISOString(),
    updated_at: g.updatedAt || new Date().toISOString(),
  };
}

export function fromSupabaseGoal(row: any): SavingsGoal {
  return {
    id: row.id,
    name: row.name,
    targetAmount: Number(row.target_amount) || 0,
    currentSavedAmount: Number(row.current_saved_amount) || 0,
    targetDate: row.target_date || undefined,
    description: row.description || '',
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function toSupabaseSettings(s: UserSettings, userId: string) {
  return {
    user_id: userId,
    theme: s.theme === 'midnight-luxe' ? 'midnight-luxe' : 'mint-minimal',
    currency: '₹',
    default_payment_method: s.defaultPaymentMethod || 'UPI / Digital Wallet',
    student_mode_enabled: Boolean(s.studentModeEnabled),
    student_monthly_allowance: Number(s.studentMonthlyAllowance) || 500,
    has_imported_local: Boolean(s.hasImportedLocal),
    updated_at: new Date().toISOString(),
  };
}

export function fromSupabaseSettings(row: any): UserSettings {
  const validTheme: ThemeId = row.theme === 'midnight-luxe' ? 'midnight-luxe' : 'mint-minimal';
  return {
    currency: '₹',
    theme: validTheme,
    defaultPaymentMethod: row.default_payment_method || DEFAULT_SETTINGS.defaultPaymentMethod,
    studentModeEnabled: Boolean(row.student_mode_enabled),
    studentMonthlyAllowance: Number(row.student_monthly_allowance) ?? DEFAULT_SETTINGS.studentMonthlyAllowance,
    hasImportedLocal: Boolean(row.has_imported_local),
  };
}
