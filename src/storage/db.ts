import Dexie, { type Table } from 'dexie';
import type { Transaction, Budget, SavingsGoal, ThemeId } from '../types';

export interface SettingItem {
  key: string;
  value: any;
}

export class PocketPilotDatabase extends Dexie {
  transactions!: Table<Transaction, string>;
  budgets!: Table<Budget, string>;
  goals!: Table<SavingsGoal, string>;
  settings!: Table<SettingItem, string>;

  constructor() {
    super('PocketPilotDB');
    this.version(1).stores({
      transactions: 'id, type, amount, category, date, createdAt',
      budgets: 'id, month, category, [month+category]',
      goals: 'id, name, targetAmount, currentSavedAmount',
      settings: 'key',
    });
  }
}

export const db = new PocketPilotDatabase();

// Default initial settings with permanent INR currency and default Theme A (Mint Minimal)
export const DEFAULT_SETTINGS = {
  currency: '₹',
  studentModeEnabled: false,
  studentMonthlyAllowance: 500,
  defaultPaymentMethod: 'UPI / Digital Wallet',
  theme: 'mint-minimal' as ThemeId,
};

// Storage helper functions
export async function getSetting<T>(key: string, defaultValue: T): Promise<T> {
  try {
    const item = await db.settings.get(key);
    return item ? (item.value as T) : defaultValue;
  } catch (err) {
    console.error(`Error reading setting ${key}:`, err);
    return defaultValue;
  }
}

export async function setSetting<T>(key: string, value: T): Promise<void> {
  try {
    await db.settings.put({ key, value });
  } catch (err) {
    console.error(`Error saving setting ${key}:`, err);
  }
}

export async function clearAllLocalData(): Promise<void> {
  await db.transaction('rw', db.transactions, db.budgets, db.goals, db.settings, async () => {
    await db.transactions.clear();
    await db.budgets.clear();
    await db.goals.clear();
    await db.settings.clear();
  });
}
