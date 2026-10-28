import React, { useMemo } from 'react';
import { usePocketPilot } from '../../context/AppContext';
import {
  calculateCategoryBreakdown,
  calculateRecentMonthsHistory,
} from '../../utils/calculations';
import {
  formatCurrency,
  formatAxisCurrency,
  getMonthLabel,
} from '../../utils/formatters';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';
import {
  TrendingUp,
  Sparkles,
  ArrowUpRight,
  ArrowDownLeft,
} from 'lucide-react';
import { EmptyState } from '../ui/EmptyState';

export const ReportsView: React.FC = () => {
  const { transactions, settings, themeConfig, selectedMonth, setActiveTab } = usePocketPilot();

  // Selected month calculations
  const monthTransactions = useMemo(() => {
    return transactions.filter((tx) => tx.date && tx.date.startsWith(selectedMonth));
  }, [transactions, selectedMonth]);

  const monthIncome = useMemo(() => {
    return monthTransactions
      .filter((tx) => tx.type === 'income')
      .reduce((sum, tx) => sum + (Number(tx.amount) || 0), 0);
  }, [monthTransactions]);

  const monthExpense = useMemo(() => {
    return monthTransactions
      .filter((tx) => tx.type === 'expense')
      .reduce((sum, tx) => sum + (Number(tx.amount) || 0), 0);
  }, [monthTransactions]);

  const monthNetSavings = monthIncome - monthExpense;
  const savingsRate = monthIncome > 0 ? (monthNetSavings / monthIncome) * 100 : 0;

  // Previous month data for comparison
  const previousMonthData = useMemo(() => {
    const [yearStr, monthStr] = selectedMonth.split('-');
    const prevDate = new Date(parseInt(yearStr), parseInt(monthStr) - 2, 1);
    const prevYear = prevDate.getFullYear();
    const prevMonth = String(prevDate.getMonth() + 1).padStart(2, '0');
    const prevKey = `${prevYear}-${prevMonth}`;

    const prevTxs = transactions.filter((tx) => tx.date && tx.date.startsWith(prevKey));
    const prevIncome = prevTxs
      .filter((tx) => tx.type === 'income')
      .reduce((sum, tx) => sum + (Number(tx.amount) || 0), 0);
    const prevExpense = prevTxs
      .filter((tx) => tx.type === 'expense')
      .reduce((sum, tx) => sum + (Number(tx.amount) || 0), 0);

    const hasData = prevTxs.length > 0;
    const expenseDiff = prevExpense > 0 ? ((monthExpense - prevExpense) / prevExpense) * 100 : 0;
    const incomeDiff = prevIncome > 0 ? ((monthIncome - prevIncome) / prevIncome) * 100 : 0;

    return {
      prevKey,
      prevLabel: getMonthLabel(prevKey),
      prevIncome,
      prevExpense,
      hasData,
      expenseDiff,
      incomeDiff,
    };
  }, [transactions, selectedMonth, monthIncome, monthExpense]);

  // Category breakdown for selected month
  const categoryExpenses = useMemo(() => {
    return calculateCategoryBreakdown(transactions, selectedMonth, 'expense');
  }, [transactions, selectedMonth]);

  // 6-Month History for comparison chart
  const sixMonthsHistory = useMemo(() => {
    return calculateRecentMonthsHistory(transactions, 6);
  }, [transactions]);

  // Weekly spending summary for the selected month
  const weeklySummary = useMemo(() => {
    const expenses = monthTransactions.filter((tx) => tx.type === 'expense');
    const weeks: { name: string; amount: number; count: number }[] = [
      { name: 'Week 1 (1-7)', amount: 0, count: 0 },
      { name: 'Week 2 (8-14)', amount: 0, count: 0 },
      { name: 'Week 3 (15-21)', amount: 0, count: 0 },
      { name: 'Week 4+ (22-end)', amount: 0, count: 0 },
    ];

    for (const tx of expenses) {
      const day = parseInt(tx.date.slice(8, 10), 10);
      const amt = Number(tx.amount) || 0;
      if (day <= 7) {
        weeks[0].amount += amt;
        weeks[0].count += 1;
      } else if (day <= 14) {
        weeks[1].amount += amt;
        weeks[1].count += 1;
      } else if (day <= 21) {
        weeks[2].amount += amt;
        weeks[2].count += 1;
      } else {
        weeks[3].amount += amt;
        weeks[3].count += 1;
      }
    }

    return weeks;
  }, [monthTransactions]);

  const hasData = monthTransactions.length > 0 || transactions.length > 0;

  // Text summary insights
  const insights = useMemo(() => {
    const list: string[] = [];
    if (categoryExpenses.length > 0) {
      const top = categoryExpenses[0];
      list.push(
        `Highest expense category: ${top.category} at ${formatCurrency(top.amount, settings.currency)} (${Math.round(top.percentage)}% of monthly spending).`
      );
    }
    if (monthIncome > 0) {
      if (monthNetSavings > 0) {
        list.push(
          `Net positive savings rate of ${Math.round(savingsRate)}% (${formatCurrency(monthNetSavings, settings.currency)} retained this month).`
        );
      } else if (monthNetSavings < 0) {
        list.push(
          `Expenses exceeded income by ${formatCurrency(Math.abs(monthNetSavings), settings.currency)} in ${getMonthLabel(selectedMonth)}.`
        );
      }
    }
    if (previousMonthData.hasData) {
      const diffVal = Math.round(Math.abs(previousMonthData.expenseDiff));
      if (previousMonthData.expenseDiff > 0) {
        list.push(`Spending increased by ${diffVal}% compared to ${previousMonthData.prevLabel}.`);
      } else if (previousMonthData.expenseDiff < 0) {
        list.push(`Spending decreased by ${diffVal}% compared to ${previousMonthData.prevLabel}.`);
      }
    }
    return list;
  }, [categoryExpenses, monthIncome, monthNetSavings, savingsRate, previousMonthData, selectedMonth, settings.currency]);

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[#1F2937]">
            Financial Reports & Trends
          </h1>
          <p className="text-xs sm:text-sm font-medium text-[#475569] mt-0.5">
            Real data-driven habit analysis for {getMonthLabel(selectedMonth)}
          </p>
        </div>
      </div>

      {!hasData ? (
        <EmptyState
          icon={Sparkles}
          title="No Data Available for Reports"
          description="Reports and visual charts are automatically computed from your recorded transactions. Record income or expense transactions to unlock analysis."
          actionLabel="Go to Transactions"
          onAction={() => setActiveTab('transactions')}
        />
      ) : (
        <>
          {/* Key Findings Text Callout */}
          {insights.length > 0 && (
            <div className="p-5 rounded-2xl border border-[#047857]/30 bg-[#D1FAE5]/40 space-y-2">
              <span className="text-xs font-bold text-[#047857] uppercase tracking-wider block">
                Key Findings for {getMonthLabel(selectedMonth)}
              </span>
              <ul className="space-y-1.5 text-xs text-[#1F2937]">
                {insights.map((item, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="text-[#047857] font-bold">&bull;</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* 3 Overview Metric Strips */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-5 rounded-2xl border border-[#E2E8F0] bg-white shadow-xs">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold uppercase tracking-wider text-[#475569]">
                  Total Month Income
                </span>
                <div className="w-8 h-8 rounded-xl bg-[#D1FAE5] text-[#047857] flex items-center justify-center">
                  <ArrowDownLeft className="w-4 h-4" />
                </div>
              </div>
              <div className="text-2xl font-bold font-tabular text-[#047857]">
                +{formatCurrency(monthIncome, settings.currency)}
              </div>
              {previousMonthData.hasData && (
                <div className="text-[11px] font-medium text-[#64748B] mt-1.5">
                  vs {previousMonthData.prevLabel}:{' '}
                  <span className="font-bold text-[#1F2937]">
                    {previousMonthData.incomeDiff >= 0 ? '+' : ''}
                    {Math.round(previousMonthData.incomeDiff)}%
                  </span>
                </div>
              )}
            </div>

            <div className="p-5 rounded-2xl border border-[#E2E8F0] bg-white shadow-xs">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold uppercase tracking-wider text-[#475569]">
                  Total Month Expenses
                </span>
                <div className="w-8 h-8 rounded-xl bg-red-50 text-[#DC2626] flex items-center justify-center">
                  <ArrowUpRight className="w-4 h-4" />
                </div>
              </div>
              <div className="text-2xl font-bold font-tabular text-[#DC2626]">
                -{formatCurrency(monthExpense, settings.currency)}
              </div>
              {previousMonthData.hasData && (
                <div className="text-[11px] font-medium text-[#64748B] mt-1.5">
                  vs {previousMonthData.prevLabel}:{' '}
                  <span className="font-bold text-[#1F2937]">
                    {previousMonthData.expenseDiff >= 0 ? '+' : ''}
                    {Math.round(previousMonthData.expenseDiff)}%
                  </span>
                </div>
              )}
            </div>

            <div className="p-5 rounded-2xl border border-[#E2E8F0] bg-white shadow-xs">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold uppercase tracking-wider text-[#475569]">
                  Net Period Savings
                </span>
                <div className="w-8 h-8 rounded-xl bg-[#D1FAE5] text-[#047857] flex items-center justify-center">
                  <TrendingUp className="w-4 h-4" />
                </div>
              </div>
              <div
                className={`text-2xl font-bold font-tabular ${
                  monthNetSavings >= 0 ? 'text-[#047857]' : 'text-[#DC2626]'
                }`}
              >
                {formatCurrency(monthNetSavings, settings.currency)}
              </div>
              <div className="text-[11px] font-medium text-[#64748B] mt-1.5 font-tabular">
                Savings rate: {Math.round(savingsRate)}% of income
              </div>
            </div>
          </div>

          {/* Chart 1: Income vs Expenses 6-Month Comparison */}
          <div className="p-5 sm:p-6 rounded-2xl border border-[#E2E8F0] bg-white shadow-xs space-y-4">
            <div>
              <h2 className="text-sm font-bold text-[#1F2937]">
                Income vs. Expenses (Past 6 Months)
              </h2>
              <p className="text-xs text-[#475569]">
                Calculated from all stored transactions
              </p>
            </div>

            <div className="h-64 w-full pt-2">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={sixMonthsHistory}
                  margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                >
                  <XAxis
                    dataKey="label"
                    stroke={themeConfig.chart.axis}
                    fontSize={11}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    stroke={themeConfig.chart.axis}
                    fontSize={11}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(v) => formatAxisCurrency(Number(v))}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: themeConfig.chart.tooltipBg,
                      borderColor: themeConfig.chart.tooltipBorder,
                      borderRadius: '12px',
                      color: themeConfig.chart.tooltipText,
                      fontSize: '12px',
                      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                    }}
                    formatter={(val: any) => [
                      formatCurrency(Number(val) || 0, settings.currency),
                    ]}
                  />
                  <Legend
                    verticalAlign="top"
                    align="right"
                    iconSize={10}
                    wrapperStyle={{ fontSize: '11px', paddingBottom: '10px' }}
                  />
                  <Bar
                    dataKey="income"
                    name="Income"
                    fill={themeConfig.chart.income}
                    radius={[6, 6, 0, 0]}
                  />
                  <Bar
                    dataKey="expenses"
                    name="Expenses"
                    fill={themeConfig.chart.expense}
                    radius={[6, 6, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Charts Row 2: Category Breakdown and Weekly Summary */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Category Breakdown */}
            <div className="p-5 sm:p-6 rounded-2xl border border-[#E2E8F0] bg-white shadow-xs space-y-4">
              <div>
                <h2 className="text-sm font-bold text-[#1F2937]">
                  Category-Wise Expenses
                </h2>
                <p className="text-xs text-[#475569]">
                  Breakdown for {getMonthLabel(selectedMonth)}
                </p>
              </div>

              {categoryExpenses.length > 0 ? (
                <div className="space-y-4">
                  <div className="h-48 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={categoryExpenses}
                          dataKey="amount"
                          nameKey="category"
                          cx="50%"
                          cy="50%"
                          outerRadius={72}
                          paddingAngle={3}
                        >
                          {categoryExpenses.map((entry, index) => (
                            <Cell
                              key={`cell-${entry.category}`}
                              fill={themeConfig.chart.piePalette[index % themeConfig.chart.piePalette.length]}
                            />
                          ))}
                        </Pie>
                        <Tooltip
                          contentStyle={{
                            backgroundColor: themeConfig.chart.tooltipBg,
                            borderColor: themeConfig.chart.tooltipBorder,
                            borderRadius: '12px',
                            color: themeConfig.chart.tooltipText,
                            fontSize: '12px',
                            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                          }}
                          formatter={(val: any) => [
                            formatCurrency(Number(val) || 0, settings.currency),
                            'Spent',
                          ]}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>

                  <div className="divide-y divide-[#E2E8F0]/70 text-xs">
                    {categoryExpenses.map((cat, idx) => (
                      <div
                        key={cat.category}
                        className="py-2 flex items-center justify-between"
                      >
                        <div className="flex items-center gap-2">
                          <span
                            className="w-2.5 h-2.5 rounded-full"
                            style={{
                              backgroundColor:
                                themeConfig.chart.piePalette[idx % themeConfig.chart.piePalette.length],
                            }}
                          />
                          <span className="font-semibold text-[#1F2937]">
                            {cat.category}
                          </span>
                        </div>
                        <div className="flex items-center gap-3 font-tabular">
                          <span className="text-[#64748B]">
                            {Math.round(cat.percentage)}%
                          </span>
                          <span className="font-bold text-[#1F2937]">
                            {formatCurrency(cat.amount, settings.currency)}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="h-48 flex items-center justify-center text-xs text-[#64748B]">
                  No expense records in {getMonthLabel(selectedMonth)}.
                </div>
              )}
            </div>

            {/* Weekly Spending Summary */}
            <div className="p-5 sm:p-6 rounded-2xl border border-[#E2E8F0] bg-white shadow-xs space-y-4">
              <div>
                <h2 className="text-sm font-bold text-[#1F2937]">
                  Weekly Spending Summary
                </h2>
                <p className="text-xs text-[#475569]">
                  Spending pace across weeks of {getMonthLabel(selectedMonth)}
                </p>
              </div>

              <div className="h-48 w-full pt-2">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={weeklySummary}
                    margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                  >
                    <XAxis
                      dataKey="name"
                      stroke={themeConfig.chart.axis}
                      fontSize={10}
                      tickLine={false}
                      axisLine={false}
                    />
                    <YAxis
                      stroke={themeConfig.chart.axis}
                      fontSize={11}
                      tickLine={false}
                      axisLine={false}
                      tickFormatter={(v) => formatAxisCurrency(Number(v))}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: themeConfig.chart.tooltipBg,
                        borderColor: themeConfig.chart.tooltipBorder,
                        borderRadius: '12px',
                        color: themeConfig.chart.tooltipText,
                        fontSize: '12px',
                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                      }}
                      formatter={(val: any) => [
                        formatCurrency(Number(val) || 0, settings.currency),
                        'Outflow',
                      ]}
                    />
                    <Bar
                      dataKey="amount"
                      fill={themeConfig.chart.primary}
                      radius={[6, 6, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-center text-xs pt-2">
                {weeklySummary.map((w, idx) => (
                  <div
                    key={idx}
                    className="p-2.5 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0]"
                  >
                    <div className="text-[10px] font-medium text-[#64748B] truncate">{w.name.split(' ')[0]} {w.name.split(' ')[1]}</div>
                    <div className="font-bold font-tabular text-[#1F2937] mt-0.5">
                      {formatCurrency(w.amount, settings.currency)}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
