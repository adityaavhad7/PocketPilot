import type { Transaction, Budget, SavingsGoal } from '../types';

export function getSampleData(): {
  transactions: Transaction[];
  budgets: Budget[];
  goals: SavingsGoal[];
} {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const currentMonthKey = `${year}-${month}`;

  // Prior month
  const prevDate = new Date(year, now.getMonth() - 1, 1);
  const prevYear = prevDate.getFullYear();
  const prevMonth = String(prevDate.getMonth() + 1).padStart(2, '0');
  const prevMonthKey = `${prevYear}-${prevMonth}`;

  const transactions: Transaction[] = [
    // Current month income
    {
      id: 'tx-1',
      type: 'income',
      amount: 1200,
      category: 'Salary',
      date: `${year}-${month}-01`,
      description: 'Monthly Part-time Salary',
      paymentMethod: 'Bank Transfer',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'tx-2',
      type: 'income',
      amount: 250,
      category: 'Freelance',
      date: `${year}-${month}-08`,
      description: 'Web design client project',
      paymentMethod: 'UPI / Digital Wallet',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'tx-3',
      type: 'income',
      amount: 150,
      category: 'Pocket Money',
      date: `${year}-${month}-12`,
      description: 'Allowance from family',
      paymentMethod: 'Cash',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },

    // Current month expenses
    {
      id: 'tx-4',
      type: 'expense',
      amount: 450,
      category: 'Rent',
      date: `${year}-${month}-02`,
      description: 'Apartment shared room rent',
      paymentMethod: 'Bank Transfer',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'tx-5',
      type: 'expense',
      amount: 65,
      category: 'Bills',
      date: `${year}-${month}-03`,
      description: 'High-speed internet bill',
      paymentMethod: 'Credit Card',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'tx-6',
      type: 'expense',
      amount: 85,
      category: 'Food',
      date: `${year}-${month}-05`,
      description: 'Weekly campus grocery run',
      paymentMethod: 'Debit Card',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'tx-7',
      type: 'expense',
      amount: 32,
      category: 'Food',
      date: `${year}-${month}-09`,
      description: 'Dinner with project team',
      paymentMethod: 'Cash',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'tx-8',
      type: 'expense',
      amount: 45,
      category: 'Travel',
      date: `${year}-${month}-11`,
      description: 'Monthly subway metro card pass',
      paymentMethod: 'Debit Card',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'tx-9',
      type: 'expense',
      amount: 78,
      category: 'Education',
      date: `${year}-${month}-14`,
      description: 'Algorithms textbook and lab notes',
      paymentMethod: 'Credit Card',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'tx-10',
      type: 'expense',
      amount: 42,
      category: 'Entertainment',
      date: `${year}-${month}-16`,
      description: 'Movie weekend & streaming renewal',
      paymentMethod: 'Debit Card',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'tx-11',
      type: 'expense',
      amount: 54,
      category: 'Food',
      date: `${year}-${month}-19`,
      description: 'Fresh fruits and coffee beans',
      paymentMethod: 'UPI / Digital Wallet',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },

    // Previous month sample for comparison
    {
      id: 'tx-p1',
      type: 'income',
      amount: 1400,
      category: 'Salary',
      date: `${prevYear}-${prevMonth}-01`,
      description: 'Previous month salary',
      paymentMethod: 'Bank Transfer',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'tx-p2',
      type: 'expense',
      amount: 450,
      category: 'Rent',
      date: `${prevYear}-${prevMonth}-02`,
      description: 'Room rent',
      paymentMethod: 'Bank Transfer',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'tx-p3',
      type: 'expense',
      amount: 220,
      category: 'Food',
      date: `${prevYear}-${prevMonth}-10`,
      description: 'Month groceries & food',
      paymentMethod: 'Debit Card',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'tx-p4',
      type: 'expense',
      amount: 110,
      category: 'Shopping',
      date: `${prevYear}-${prevMonth}-18`,
      description: 'Winter hoodie and stationery',
      paymentMethod: 'Credit Card',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ];

  const budgets: Budget[] = [
    {
      id: 'bg-overall',
      month: currentMonthKey,
      category: 'All',
      amount: 1200,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'bg-food',
      month: currentMonthKey,
      category: 'Food',
      amount: 250,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'bg-travel',
      month: currentMonthKey,
      category: 'Travel',
      amount: 70,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'bg-entertainment',
      month: currentMonthKey,
      category: 'Entertainment',
      amount: 60,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'bg-education',
      month: currentMonthKey,
      category: 'Education',
      amount: 100,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ];

  const goals: SavingsGoal[] = [
    {
      id: 'sg-1',
      name: 'Emergency Fund',
      targetAmount: 1000,
      currentSavedAmount: 650,
      targetDate: `${year}-12-31`,
      description: '3 months buffer for unexpected expenses and health',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'sg-2',
      name: 'Laptop Upgrade',
      targetAmount: 800,
      currentSavedAmount: 320,
      targetDate: `${year + 1}-03-15`,
      description: 'Refurbished M-series laptop for programming and studies',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'sg-3',
      name: 'Semester Break Trip',
      targetAmount: 350,
      currentSavedAmount: 350,
      targetDate: `${year}-11-20`,
      description: 'Weekend camping retreat with classmates (Goal achieved!)',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ];

  return { transactions, budgets, goals };
}
