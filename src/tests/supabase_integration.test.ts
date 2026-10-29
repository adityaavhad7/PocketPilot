import assert from 'node:assert/strict';
import { test, describe } from 'node:test';
import {
  toSupabaseTransaction,
  fromSupabaseTransaction,
  toSupabaseBudget,
  fromSupabaseBudget,
  toSupabaseGoal,
  fromSupabaseGoal,
  toSupabaseSettings,
  fromSupabaseSettings,
} from '../lib/mappers';
import { cleanEnvString, cleanUrl } from '../lib/supabase';
import type { Transaction, Budget, SavingsGoal, UserSettings } from '../types';
import { calculateDashboardMetrics, calculateStudentMetrics } from '../utils/calculations';
import { formatCurrency } from '../utils/formatters';

describe('PocketPilot Supabase Integration & Schema Mappings', () => {
  const mockUserId = 'usr_12345678-abcd-ef01-2345-6789abcdef01';

  test('Transactions mapping roundtrip preserves all fields', () => {
    const original: Transaction = {
      id: 'tx-1001',
      type: 'expense',
      amount: 1450.75,
      category: 'Food',
      date: '2026-10-28',
      description: 'Campus cafeteria lunch',
      paymentMethod: 'UPI / Digital Wallet',
      createdAt: '2026-10-28T10:00:00.000Z',
      updatedAt: '2026-10-28T10:00:00.000Z',
    };

    const row = toSupabaseTransaction(original, mockUserId);
    assert.equal(row.id, original.id);
    assert.equal(row.user_id, mockUserId);
    assert.equal(row.amount, 1450.75);
    assert.equal(row.payment_method, 'UPI / Digital Wallet');

    const mappedBack = fromSupabaseTransaction(row);
    assert.deepEqual(mappedBack, original);
  });

  test('Budgets mapping roundtrip preserves user_id and amounts', () => {
    const budget: Budget = {
      id: 'bg-2001',
      month: '2026-10',
      category: 'All',
      amount: 25000,
      createdAt: '2026-10-01T00:00:00.000Z',
      updatedAt: '2026-10-01T00:00:00.000Z',
    };

    const row = toSupabaseBudget(budget, mockUserId);
    assert.equal(row.id, budget.id);
    assert.equal(row.user_id, mockUserId);
    assert.equal(row.amount, 25000);

    const mappedBack = fromSupabaseBudget(row);
    assert.deepEqual(mappedBack, budget);
  });

  test('Savings goals mapping roundtrip preserves progress and target', () => {
    const goal: SavingsGoal = {
      id: 'sg-3001',
      name: 'Semester Laptop Fund',
      targetAmount: 60000,
      currentSavedAmount: 18500,
      targetDate: '2026-12-31',
      description: 'MacBook Air M3 for coding projects',
      createdAt: '2026-09-01T00:00:00.000Z',
      updatedAt: '2026-10-28T00:00:00.000Z',
    };

    const row = toSupabaseGoal(goal, mockUserId);
    assert.equal(row.id, goal.id);
    assert.equal(row.user_id, mockUserId);
    assert.equal(row.target_amount, 60000);
    assert.equal(row.current_saved_amount, 18500);

    const mappedBack = fromSupabaseGoal(row);
    assert.deepEqual(mappedBack, goal);
  });

  test('Settings mapping strictly enforces Indian Rupees (₹) and validates theme', () => {
    const settings: UserSettings = {
      currency: '$', // Attempting to set dollar
      theme: 'midnight-luxe',
      defaultPaymentMethod: 'Debit Card',
      studentModeEnabled: true,
      studentMonthlyAllowance: 8000,
      hasImportedLocal: true,
    };

    const row = toSupabaseSettings(settings, mockUserId);
    // Currency must always remain locked to ₹
    assert.equal(row.currency, '₹');
    assert.equal(row.theme, 'midnight-luxe');
    assert.equal(row.has_imported_local, true);

    const mappedBack = fromSupabaseSettings(row);
    assert.equal(mappedBack.currency, '₹');
    assert.equal(mappedBack.theme, 'midnight-luxe');
    assert.equal(mappedBack.studentModeEnabled, true);
    assert.equal(mappedBack.studentMonthlyAllowance, 8000);
    assert.equal(mappedBack.hasImportedLocal, true);
  });

  test('Deduplication logic prevents duplicates when re-importing identical IDs', () => {
    const existingCloudTxs: Transaction[] = [
      {
        id: 'tx-1',
        type: 'expense',
        amount: 200,
        category: 'Food',
        date: '2026-10-20',
        createdAt: '2026-10-20T00:00:00Z',
        updatedAt: '2026-10-20T00:00:00Z',
      },
    ];

    const localTxsToImport: Transaction[] = [
      {
        id: 'tx-1', // Duplicate ID
        type: 'expense',
        amount: 200,
        category: 'Food',
        date: '2026-10-20',
        createdAt: '2026-10-20T00:00:00Z',
        updatedAt: '2026-10-20T00:00:00Z',
      },
      {
        id: 'tx-2', // New record
        type: 'income',
        amount: 5000,
        category: 'Pocket Money',
        date: '2026-10-21',
        createdAt: '2026-10-21T00:00:00Z',
        updatedAt: '2026-10-21T00:00:00Z',
      },
    ];

    // Simulate upsert onConflict: 'id'
    const mergedMap = new Map<string, Transaction>();
    for (const tx of existingCloudTxs) {
      mergedMap.set(tx.id, tx);
    }
    for (const tx of localTxsToImport) {
      mergedMap.set(tx.id, tx);
    }

    const mergedList = Array.from(mergedMap.values());
    assert.equal(mergedList.length, 2, 'Should contain exactly 2 unique records');
    assert.equal(mergedList.find((t) => t.id === 'tx-1')?.amount, 200);
    assert.equal(mergedList.find((t) => t.id === 'tx-2')?.amount, 5000);
  });

  test('Calculations and Indian Rupee formatting work seamlessly with mapped data', () => {
    const transactions: Transaction[] = [
      {
        id: 'tx-1',
        type: 'income',
        amount: 50000,
        category: 'Salary',
        date: '2026-10-01',
        createdAt: '2026-10-01T00:00:00Z',
        updatedAt: '2026-10-01T00:00:00Z',
      },
      {
        id: 'tx-2',
        type: 'expense',
        amount: 12500,
        category: 'Rent',
        date: '2026-10-02',
        createdAt: '2026-10-02T00:00:00Z',
        updatedAt: '2026-10-02T00:00:00Z',
      },
    ];

    const budgets: Budget[] = [
      {
        id: 'bg-1',
        month: '2026-10',
        category: 'All',
        amount: 30000,
        createdAt: '2026-10-01T00:00:00Z',
        updatedAt: '2026-10-01T00:00:00Z',
      },
    ];

    const metrics = calculateDashboardMetrics(transactions, budgets, '2026-10');
    assert.equal(metrics.totalBalance, 37500);
    assert.equal(metrics.currentMonthIncome, 50000);
    assert.equal(metrics.currentMonthExpenses, 12500);
    assert.equal(metrics.overallBudgetRemaining, 17500);

    // Format verification in INR
    const formattedBalance = formatCurrency(metrics.totalBalance);
    assert.match(formattedBalance, /₹.*37,500/);

    const studentMetrics = calculateStudentMetrics(transactions, 15000, '2026-10');
    assert.equal(studentMetrics.monthlyAllowance, 15000);
    assert.equal(studentMetrics.spentThisMonth, 12500);
    assert.equal(studentMetrics.remainingAllowance, 2500);
    assert.equal(studentMetrics.isOverspent, false);
  });

  test('Supabase environment variable sanitizer cleans quotes, whitespace, and trailing slashes', () => {
    // Quoted strings commonly passed in Netlify dashboard
    assert.equal(
      cleanEnvString('"sb_publishable_S3YAKCEqPr6rpfAIJCpF0Q_4tHZeOLl"'),
      'sb_publishable_S3YAKCEqPr6rpfAIJCpF0Q_4tHZeOLl'
    );
    assert.equal(
      cleanEnvString("'sb_publishable_S3YAKCEqPr6rpfAIJCpF0Q_4tHZeOLl'"),
      'sb_publishable_S3YAKCEqPr6rpfAIJCpF0Q_4tHZeOLl'
    );
    // Trailing whitespace and newlines
    assert.equal(
      cleanEnvString('  sb_publishable_S3YAKCEqPr6rpfAIJCpF0Q_4tHZeOLl \r\n '),
      'sb_publishable_S3YAKCEqPr6rpfAIJCpF0Q_4tHZeOLl'
    );
    // Trailing slashes and quotes in URLs
    assert.equal(
      cleanUrl('"https://ymxcrjwoxuqsjohptmcb.supabase.co/"'),
      'https://ymxcrjwoxuqsjohptmcb.supabase.co'
    );
    assert.equal(
      cleanUrl('https://ymxcrjwoxuqsjohptmcb.supabase.co///'),
      'https://ymxcrjwoxuqsjohptmcb.supabase.co'
    );
  });
});
