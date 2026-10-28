/**
 * PocketPilot — Core Type Definitions
 */

export type ThemeId = 'mint-minimal' | 'midnight-luxe';

export type TransactionType = 'income' | 'expense';

export type PaymentMethod =
  | 'Cash'
  | 'Debit Card'
  | 'Credit Card'
  | 'Bank Transfer'
  | 'UPI / Digital Wallet'
  | 'Other';

export interface Transaction {
  id: string;
  type: TransactionType;
  amount: number;
  category: string;
  date: string; // ISO date string YYYY-MM-DD
  description?: string;
  paymentMethod?: PaymentMethod | string;
  createdAt: string;
  updatedAt: string;
}

export interface Budget {
  id: string;
  month: string; // YYYY-MM
  category: string; // 'All' for overall monthly budget or specific category
  amount: number;
  createdAt: string;
  updatedAt: string;
}

export interface SavingsGoal {
  id: string;
  name: string;
  targetAmount: number;
  currentSavedAmount: number;
  targetDate?: string; // YYYY-MM-DD
  description?: string;
  createdAt: string;
  updatedAt: string;
}

export interface UserSettings {
  currency: string;
  studentModeEnabled: boolean;
  studentMonthlyAllowance: number;
  defaultPaymentMethod: string;
  theme: ThemeId;
  hasImportedLocal?: boolean;
}

export type NavTab =
  | 'dashboard'
  | 'transactions'
  | 'budgets'
  | 'reports'
  | 'goals'
  | 'student'
  | 'settings';

export const DEFAULT_EXPENSE_CATEGORIES = [
  'Food',
  'Travel',
  'Shopping',
  'Bills',
  'Education',
  'Health',
  'Entertainment',
  'Rent',
  'Other',
] as const;

export const DEFAULT_INCOME_CATEGORIES = [
  'Pocket Money',
  'Salary',
  'Freelance',
  'Scholarship',
  'Gift',
  'Other',
] as const;

export const STUDENT_CATEGORIES = [
  'College Fees',
  'Books and Supplies',
  'Hostel/Rent',
  'Food',
  'Travel',
  'Entertainment',
  'Other',
] as const;

export const PAYMENT_METHODS: PaymentMethod[] = [
  'Cash',
  'Debit Card',
  'Credit Card',
  'Bank Transfer',
  'UPI / Digital Wallet',
  'Other',
];

export const APP_CURRENCY = {
  code: 'INR',
  symbol: '₹',
  name: 'Indian Rupee (₹)',
  locale: 'en-IN',
} as const;
