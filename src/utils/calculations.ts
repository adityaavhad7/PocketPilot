import type { Transaction, Budget, SavingsGoal } from '../types';
import { getCurrentMonthKey, getDaysRemainingInMonth } from './formatters';

export interface DashboardMetrics {
  totalBalance: number;
  totalIncomeAllTime: number;
  totalExpensesAllTime: number;
  currentMonthIncome: number;
  currentMonthExpenses: number;
  currentMonthNet: number;
  overallBudgetAmount: number;
  overallBudgetSpent: number;
  overallBudgetRemaining: number;
  overallBudgetPercent: number;
  hasBudgetConfigured: boolean;
}

export interface BudgetStatus {
  budget: Budget;
  spent: number;
  remaining: number;
  percentUsed: number;
  status: 'normal' | 'warning' | 'exceeded';
}

export function calculateDashboardMetrics(
  transactions: Transaction[],
  budgets: Budget[],
  monthKey: string = getCurrentMonthKey()
): DashboardMetrics {
  let totalIncomeAllTime = 0;
  let totalExpensesAllTime = 0;
  let currentMonthIncome = 0;
  let currentMonthExpenses = 0;

  for (const tx of transactions) {
    const isIncome = tx.type === 'income';
    const amount = Number(tx.amount) || 0;

    if (isIncome) {
      totalIncomeAllTime += amount;
    } else {
      totalExpensesAllTime += amount;
    }

    if (tx.date && tx.date.startsWith(monthKey)) {
      if (isIncome) {
        currentMonthIncome += amount;
      } else {
        currentMonthExpenses += amount;
      }
    }
  }

  const totalBalance = totalIncomeAllTime - totalExpensesAllTime;
  const currentMonthNet = currentMonthIncome - currentMonthExpenses;

  // Find overall budget for this month
  const overallBudget = budgets.find(
    (b) => b.month === monthKey && (b.category === 'All' || b.category === '')
  );

  let overallBudgetAmount = 0;
  let overallBudgetSpent = 0;
  let hasBudgetConfigured = false;

  if (overallBudget) {
    hasBudgetConfigured = true;
    overallBudgetAmount = overallBudget.amount;
    overallBudgetSpent = currentMonthExpenses;
  } else {
    // Check if there are category budgets for this month
    const categoryBudgets = budgets.filter((b) => b.month === monthKey && b.category !== 'All');
    if (categoryBudgets.length > 0) {
      hasBudgetConfigured = true;
      overallBudgetAmount = categoryBudgets.reduce((sum, b) => sum + (Number(b.amount) || 0), 0);
      overallBudgetSpent = transactions
        .filter(
          (tx) =>
            tx.type === 'expense' &&
            tx.date.startsWith(monthKey) &&
            categoryBudgets.some((b) => b.category.toLowerCase() === tx.category.toLowerCase())
        )
        .reduce((sum, tx) => sum + (Number(tx.amount) || 0), 0);
    }
  }

  const overallBudgetRemaining = overallBudgetAmount - overallBudgetSpent;
  const overallBudgetPercent =
    overallBudgetAmount > 0 ? (overallBudgetSpent / overallBudgetAmount) * 100 : 0;

  return {
    totalBalance,
    totalIncomeAllTime,
    totalExpensesAllTime,
    currentMonthIncome,
    currentMonthExpenses,
    currentMonthNet,
    overallBudgetAmount,
    overallBudgetSpent,
    overallBudgetRemaining,
    overallBudgetPercent,
    hasBudgetConfigured,
  };
}

export function calculateBudgetStatuses(
  budgets: Budget[],
  transactions: Transaction[],
  monthKey: string = getCurrentMonthKey()
): BudgetStatus[] {
  const monthBudgets = budgets.filter((b) => b.month === monthKey);
  const monthExpenses = transactions.filter(
    (tx) => tx.type === 'expense' && tx.date && tx.date.startsWith(monthKey)
  );

  return monthBudgets.map((budget) => {
    let spent = 0;
    if (budget.category === 'All' || budget.category === '') {
      spent = monthExpenses.reduce((sum, tx) => sum + (Number(tx.amount) || 0), 0);
    } else {
      spent = monthExpenses
        .filter((tx) => tx.category.toLowerCase() === budget.category.toLowerCase())
        .reduce((sum, tx) => sum + (Number(tx.amount) || 0), 0);
    }

    const budgetAmount = Number(budget.amount) || 0;
    const remaining = budgetAmount - spent;
    const percentUsed = budgetAmount > 0 ? (spent / budgetAmount) * 100 : 0;

    let status: 'normal' | 'warning' | 'exceeded' = 'normal';
    if (spent > budgetAmount) {
      status = 'exceeded';
    } else if (percentUsed >= 80) {
      status = 'warning';
    }

    return {
      budget,
      spent,
      remaining,
      percentUsed,
      status,
    };
  });
}

export interface GoalMetrics {
  remainingAmount: number;
  percentComplete: number;
  displayPercent: number;
  isComplete: boolean;
}

export function calculateGoalMetrics(goal: SavingsGoal): GoalMetrics {
  const target = Math.max(0, Number(goal.targetAmount) || 0);
  const saved = Math.max(0, Number(goal.currentSavedAmount) || 0);
  const remainingAmount = Math.max(0, target - saved);
  const percentComplete = target > 0 ? (saved / target) * 100 : 0;
  const displayPercent = Math.min(100, Math.round(percentComplete));
  const isComplete = saved >= target && target > 0;

  return {
    remainingAmount,
    percentComplete,
    displayPercent,
    isComplete,
  };
}

export interface StudentModeMetrics {
  monthlyAllowance: number;
  spentThisMonth: number;
  remainingAllowance: number;
  isOverspent: boolean;
  overspendAmount: number;
  spentThisWeek: number;
  daysRemainingInMonth: number;
  suggestedDailyBudget: number;
  topCategorySpending: { category: string; amount: number; percentage: number }[];
}

export function calculateStudentMetrics(
  transactions: Transaction[],
  allowance: number,
  monthKey: string = getCurrentMonthKey()
): StudentModeMetrics {
  const monthExpenses = transactions.filter(
    (tx) => tx.type === 'expense' && tx.date && tx.date.startsWith(monthKey)
  );

  const spentThisMonth = monthExpenses.reduce((sum, tx) => sum + (Number(tx.amount) || 0), 0);
  const remainingAllowance = allowance - spentThisMonth;
  const isOverspent = remainingAllowance < 0;
  const overspendAmount = isOverspent ? Math.abs(remainingAllowance) : 0;

  // Calculate current week spending
  const now = new Date();
  const currentDayOfWeek = now.getDay(); // 0 is Sunday
  const startOfWeek = new Date(now);
  startOfWeek.setDate(now.getDate() - currentDayOfWeek);
  startOfWeek.setHours(0, 0, 0, 0);
  const startOfWeekStr = startOfWeek.toISOString().slice(0, 10);

  const spentThisWeek = transactions
    .filter((tx) => tx.type === 'expense' && tx.date >= startOfWeekStr)
    .reduce((sum, tx) => sum + (Number(tx.amount) || 0), 0);

  const daysRemaining = getDaysRemainingInMonth(now);
  let suggestedDailyBudget = 0;
  if (!isOverspent && daysRemaining > 0 && remainingAllowance > 0) {
    suggestedDailyBudget = remainingAllowance / daysRemaining;
  }

  // Category breakdown for student expenses
  const categoryMap: Record<string, number> = {};
  for (const tx of monthExpenses) {
    categoryMap[tx.category] = (categoryMap[tx.category] || 0) + (Number(tx.amount) || 0);
  }

  const topCategorySpending = Object.entries(categoryMap)
    .map(([category, amount]) => ({
      category,
      amount,
      percentage: spentThisMonth > 0 ? (amount / spentThisMonth) * 100 : 0,
    }))
    .sort((a, b) => b.amount - a.amount);

  return {
    monthlyAllowance: allowance,
    spentThisMonth,
    remainingAllowance,
    isOverspent,
    overspendAmount,
    spentThisWeek,
    daysRemainingInMonth: daysRemaining,
    suggestedDailyBudget,
    topCategorySpending,
  };
}

export interface CategoryBreakdown {
  category: string;
  amount: number;
  percentage: number;
  count: number;
}

export function calculateCategoryBreakdown(
  transactions: Transaction[],
  monthKey?: string,
  type: 'expense' | 'income' = 'expense'
): CategoryBreakdown[] {
  const filtered = transactions.filter((tx) => {
    if (tx.type !== type) return false;
    if (monthKey && (!tx.date || !tx.date.startsWith(monthKey))) return false;
    return true;
  });

  const total = filtered.reduce((sum, tx) => sum + (Number(tx.amount) || 0), 0);
  const catMap: Record<string, { amount: number; count: number }> = {};

  for (const tx of filtered) {
    if (!catMap[tx.category]) {
      catMap[tx.category] = { amount: 0, count: 0 };
    }
    catMap[tx.category].amount += Number(tx.amount) || 0;
    catMap[tx.category].count += 1;
  }

  return Object.entries(catMap)
    .map(([category, data]) => ({
      category,
      amount: data.amount,
      count: data.count,
      percentage: total > 0 ? (data.amount / total) * 100 : 0,
    }))
    .sort((a, b) => b.amount - a.amount);
}

export interface MonthlyHistoryItem {
  monthKey: string;
  label: string;
  income: number;
  expenses: number;
  net: number;
}

export function calculateRecentMonthsHistory(
  transactions: Transaction[],
  numMonths: number = 6
): MonthlyHistoryItem[] {
  const history: MonthlyHistoryItem[] = [];
  const now = new Date();

  for (let i = numMonths - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const key = `${year}-${month}`;
    const label = d.toLocaleDateString('en-US', { month: 'short' });

    let income = 0;
    let expenses = 0;

    for (const tx of transactions) {
      if (tx.date && tx.date.startsWith(key)) {
        if (tx.type === 'income') {
          income += Number(tx.amount) || 0;
        } else {
          expenses += Number(tx.amount) || 0;
        }
      }
    }

    history.push({
      monthKey: key,
      label,
      income,
      expenses,
      net: income - expenses,
    });
  }

  return history;
}
