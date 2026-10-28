import React from 'react';
import { usePocketPilot } from '../../context/AppContext';
import {
  calculateDashboardMetrics,
  calculateBudgetStatuses,
  calculateCategoryBreakdown,
  calculateGoalMetrics,
} from '../../utils/calculations';
import {
  formatCurrency,
  formatAxisCurrency,
  formatDate,
  getMonthLabel,
} from '../../utils/formatters';
import {
  TrendingUp,
  TrendingDown,
  Wallet,
  PiggyBank,
  ArrowUpRight,
  ArrowDownLeft,
  ChevronRight,
  AlertTriangle,
  Sparkles,
  PieChart as PieChartIcon,
  CloudUpload,
  RefreshCw,
  CheckCircle2,
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { EmptyState } from '../ui/EmptyState';

interface DashboardViewProps {
  onOpenAddTransaction: (type?: 'income' | 'expense') => void;
  onOpenAddBudget: () => void;
  onOpenAddGoal: () => void;
}

const CATEGORY_COLORS = [
  '#047857', // Mint primary
  '#10B981', // Green
  '#0284C7', // Sky
  '#6366F1', // Indigo
  '#F59E0B', // Amber
  '#8B5CF6', // Purple
  '#14B8A6', // Teal
  '#EC4899', // Pink
  '#64748B', // Slate
];

export const DashboardView: React.FC<DashboardViewProps> = ({
  onOpenAddTransaction,
  onOpenAddBudget,
  onOpenAddGoal,
}) => {
  const {
    transactions,
    budgets,
    goals,
    settings,
    themeConfig,
    selectedMonth,
    setActiveTab,
    loadSampleData,
    isCloudMode,
    localRecordsCount,
    importLocalDataToCloud,
    updateSettings,
  } = usePocketPilot();

  const [isImporting, setIsImporting] = React.useState(false);
  const [importSuccessMsg, setImportSuccessMsg] = React.useState<string | null>(null);

  const handleImportLocal = async () => {
    setIsImporting(true);
    const result = await importLocalDataToCloud();
    setIsImporting(false);
    if (result.success) {
      setImportSuccessMsg(`Successfully imported ${result.importedCount} local records to your cloud account!`);
      setTimeout(() => setImportSuccessMsg(null), 4000);
    }
  };

  const metrics = calculateDashboardMetrics(transactions, budgets, selectedMonth);
  const budgetStatuses = calculateBudgetStatuses(budgets, transactions, selectedMonth);
  const categoryExpenses = calculateCategoryBreakdown(transactions, selectedMonth, 'expense');

  // Daily trend data for the selected month
  const dailyTrendData = React.useMemo(() => {
    const monthExpenses = transactions.filter(
      (tx) => tx.type === 'expense' && tx.date && tx.date.startsWith(selectedMonth)
    );

    const map: Record<string, number> = {};
    for (const tx of monthExpenses) {
      const day = tx.date.slice(8, 10);
      map[day] = (map[day] || 0) + (Number(tx.amount) || 0);
    }

    const [yearStr, monthStr] = selectedMonth.split('-');
    const daysInMonth = new Date(parseInt(yearStr), parseInt(monthStr), 0).getDate();
    const data: { day: string; amount: number }[] = [];

    for (let d = 1; d <= daysInMonth; d++) {
      const dayKey = String(d).padStart(2, '0');
      data.push({
        day: `${d}`,
        amount: map[dayKey] || 0,
      });
    }

    return data;
  }, [transactions, selectedMonth]);

  // Recent transactions (last 5)
  const recentTransactions = React.useMemo(() => {
    return [...transactions]
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 5);
  }, [transactions]);

  const hasAnyTransactions = transactions.length > 0;

  return (
    <div className="space-y-6">
      {/* Page Title & Context Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[#1F2937]">
            Financial Dashboard
          </h1>
          <p className="text-xs sm:text-sm font-medium text-[#475569] mt-0.5">
            Overview for {getMonthLabel(selectedMonth)}
          </p>
        </div>

        {/* Quick Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => onOpenAddTransaction('income')}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-xl bg-[#D1FAE5] hover:bg-[#a7f3d0] text-[#047857] transition-colors shadow-2xs"
          >
            <ArrowDownLeft className="w-3.5 h-3.5" />
            <span>Add Income</span>
          </button>

          <button
            type="button"
            onClick={() => onOpenAddTransaction('expense')}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-xl bg-red-50 hover:bg-red-100 text-[#DC2626] transition-colors shadow-2xs"
          >
            <ArrowUpRight className="w-3.5 h-3.5" />
            <span>Add Expense</span>
          </button>
        </div>
      </div>

      {/* Safe One-Time Local Data Import Banner */}
      {isCloudMode && localRecordsCount.total > 0 && !settings.hasImportedLocal && (
        <div className="p-4 sm:p-5 rounded-2xl bg-[#D1FAE5]/60 border border-[#047857]/20 flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-in fade-in duration-200">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#047857] text-white flex items-center justify-center shrink-0 shadow-2xs">
              <CloudUpload className="w-5 h-5 text-[#D1FAE5]" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-[#1F2937]">
                Import Offline Data ({localRecordsCount.total} records found)
              </h3>
              <p className="text-xs text-[#475569] mt-0.5 leading-relaxed">
                Found {localRecordsCount.transactions} transactions, {localRecordsCount.budgets} budgets, and {localRecordsCount.goals} goals saved locally on this device. Would you like to import them into your cloud account?
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
            <button
              type="button"
              onClick={handleImportLocal}
              disabled={isImporting}
              className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-xl bg-[#047857] hover:bg-[#065f46] text-white shadow-xs transition-all disabled:opacity-50 active:scale-[0.98]"
            >
              {isImporting ? (
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <CloudUpload className="w-3.5 h-3.5" />
              )}
              <span>{isImporting ? 'Importing...' : 'Import to Cloud'}</span>
            </button>
            <button
              type="button"
              onClick={() => updateSettings({ hasImportedLocal: true })}
              className="px-3 py-2 text-xs font-medium text-[#64748B] hover:text-[#1F2937] transition-colors"
            >
              Dismiss
            </button>
          </div>
        </div>
      )}

      {/* Import Success Feedback Toast */}
      {importSuccessMsg && (
        <div className="flex items-center gap-2 p-3.5 rounded-2xl bg-[#D1FAE5] border border-[#047857]/20 text-xs font-semibold text-[#047857] animate-in fade-in duration-200">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{importSuccessMsg}</span>
        </div>
      )}

      {/* Empty State Banner if completely empty */}
      {!hasAnyTransactions && (
        <EmptyState
          icon={Sparkles}
          title="Welcome to PocketPilot!"
          description="You haven't recorded any transactions yet. Start tracking your income and expenses to see automated charts, budgets, and savings analytics."
          actionLabel="Record First Transaction"
          onAction={() => onOpenAddTransaction('expense')}
          secondaryActionLabel="Load Realistic Demo Data"
          onSecondaryAction={loadSampleData}
        />
      )}

      {/* KPI 4-Card Summary Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* 1. Total Balance (All-Time) */}
        <div className="p-5 rounded-2xl border border-[#E2E8F0] bg-white shadow-xs hover:shadow-sm transition-all duration-200">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#475569]">
              Total Balance
            </span>
            <div className="w-8 h-8 rounded-xl bg-[#D1FAE5] text-[#047857] flex items-center justify-center">
              <Wallet className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-bold font-tabular tracking-tight text-[#1F2937]">
            {formatCurrency(metrics.totalBalance, settings.currency)}
          </div>
          <div className="text-[11px] font-medium text-[#64748B] mt-1.5">
            All-time cumulative cash
          </div>
        </div>

        {/* 2. Monthly Income */}
        <div className="p-5 rounded-2xl border border-[#E2E8F0] bg-white shadow-xs hover:shadow-sm transition-all duration-200">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#475569]">
              Monthly Income
            </span>
            <div className="w-8 h-8 rounded-xl bg-[#D1FAE5] text-[#047857] flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-bold font-tabular tracking-tight text-[#047857]">
            +{formatCurrency(metrics.currentMonthIncome, settings.currency)}
          </div>
          <div className="text-[11px] font-medium text-[#64748B] mt-1.5">
            Incoming in {getMonthLabel(selectedMonth).split(' ')[0]}
          </div>
        </div>

        {/* 3. Monthly Expenses */}
        <div className="p-5 rounded-2xl border border-[#E2E8F0] bg-white shadow-xs hover:shadow-sm transition-all duration-200">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#475569]">
              Monthly Expenses
            </span>
            <div className="w-8 h-8 rounded-xl bg-red-50 text-[#DC2626] flex items-center justify-center">
              <TrendingDown className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-bold font-tabular tracking-tight text-[#DC2626]">
            -{formatCurrency(metrics.currentMonthExpenses, settings.currency)}
          </div>
          <div className="text-[11px] font-medium text-[#64748B] mt-1.5">
            Outflow in {getMonthLabel(selectedMonth).split(' ')[0]}
          </div>
        </div>

        {/* 4. Remaining Budget */}
        <div className="p-5 rounded-2xl border border-[#E2E8F0] bg-white shadow-xs hover:shadow-sm transition-all duration-200">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#475569]">
              Remaining Budget
            </span>
            <div className="w-8 h-8 rounded-xl bg-amber-50 text-[#B45309] flex items-center justify-center">
              <PiggyBank className="w-4 h-4" />
            </div>
          </div>
          {metrics.hasBudgetConfigured ? (
            <>
              <div
                className={`text-2xl sm:text-3xl font-bold font-tabular tracking-tight ${
                  metrics.overallBudgetRemaining < 0
                    ? 'text-[#DC2626]'
                    : metrics.overallBudgetPercent >= 80
                    ? 'text-[#B45309]'
                    : 'text-[#1F2937]'
                }`}
              >
                {formatCurrency(metrics.overallBudgetRemaining, settings.currency)}
              </div>
              <div className="text-[11px] font-medium text-[#64748B] mt-1.5 font-tabular">
                {Math.round(metrics.overallBudgetPercent)}% of{' '}
                {formatCurrency(metrics.overallBudgetAmount, settings.currency)} used
              </div>
            </>
          ) : (
            <>
              <div className="text-sm font-semibold text-[#64748B] mt-1">
                No budget set
              </div>
              <button
                type="button"
                onClick={onOpenAddBudget}
                className="text-xs text-[#047857] font-semibold hover:underline mt-1.5 block"
              >
                Set month budget &rarr;
              </button>
            </>
          )}
        </div>
      </div>

      {/* Charts Section: Daily Spending Trend & Category Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Trend Area Chart (2 cols) */}
        <div className="lg:col-span-2 p-5 sm:p-6 rounded-2xl border border-[#E2E8F0] bg-white shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-bold text-[#1F2937]">
                Monthly Expense Trend
              </h2>
              <p className="text-xs text-[#475569]">
                Daily spending distribution for {getMonthLabel(selectedMonth)}
              </p>
            </div>
            <span className="text-xs font-bold font-tabular bg-[#D1FAE5]/60 text-[#047857] px-2.5 py-1 rounded-lg">
              Total: {formatCurrency(metrics.currentMonthExpenses, settings.currency)}
            </span>
          </div>

          {metrics.currentMonthExpenses > 0 ? (
            <div className="h-60 w-full pt-2">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={dailyTrendData}
                  margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                >
                  <defs>
                    <linearGradient id="mintExpenseGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={themeConfig.chart.primary} stopOpacity={0.25} />
                      <stop offset="95%" stopColor={themeConfig.chart.primary} stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <XAxis
                    dataKey="day"
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
                      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.08)',
                    }}
                    formatter={(val: any) => [
                      formatCurrency(Number(val) || 0, settings.currency),
                      'Spent',
                    ]}
                    labelFormatter={(label) => `Day ${label}`}
                  />
                  <Area
                    type="monotone"
                    dataKey="amount"
                    stroke={themeConfig.chart.primary}
                    strokeWidth={2.5}
                    fillOpacity={1}
                    fill="url(#mintExpenseGradient)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-60 flex flex-col items-center justify-center text-center p-4">
              <p className="text-xs text-[#64748B]">
                No expense transactions recorded in {getMonthLabel(selectedMonth)}.
              </p>
              <button
                type="button"
                onClick={() => onOpenAddTransaction('expense')}
                className="mt-2 text-xs font-semibold text-[#047857] hover:underline"
              >
                + Add an expense
              </button>
            </div>
          )}
        </div>

        {/* Category Breakdown (1 col) */}
        <div className="p-5 sm:p-6 rounded-2xl border border-[#E2E8F0] bg-white shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-bold text-[#1F2937]">
              Spending by Category
            </h2>
            <div className="w-7 h-7 rounded-lg bg-[#D1FAE5]/60 text-[#047857] flex items-center justify-center">
              <PieChartIcon className="w-3.5 h-3.5" />
            </div>
          </div>

          {categoryExpenses.length > 0 ? (
            <div className="space-y-4">
              <div className="h-40 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={categoryExpenses}
                      dataKey="amount"
                      nameKey="category"
                      cx="50%"
                      cy="50%"
                      innerRadius={38}
                      outerRadius={62}
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
                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.08)',
                      }}
                      formatter={(val: any) => [
                        formatCurrency(Number(val) || 0, settings.currency),
                        'Spent',
                      ]}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              {/* Category Legend list */}
              <div className="space-y-2 max-h-44 overflow-y-auto pr-1">
                {categoryExpenses.slice(0, 5).map((item, idx) => (
                  <div
                    key={item.category}
                    className="flex items-center justify-between text-xs py-1 px-1.5 rounded-lg hover:bg-[#F8FAFC] transition-colors"
                  >
                    <div className="flex items-center gap-2 truncate pr-2">
                      <span
                        className="w-2.5 h-2.5 rounded-full shrink-0"
                        style={{
                          backgroundColor: themeConfig.chart.piePalette[idx % themeConfig.chart.piePalette.length],
                        }}
                      />
                      <span className="text-[#1F2937] font-medium truncate">
                        {item.category}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 font-tabular shrink-0">
                      <span className="text-[#64748B] text-[11px]">
                        {Math.round(item.percentage)}%
                      </span>
                      <span className="font-bold text-[#1F2937]">
                        {formatCurrency(item.amount, settings.currency)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="h-60 flex flex-col items-center justify-center text-center p-4">
              <p className="text-xs text-[#64748B]">
                No categorized expenses for this period.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Mid-Row: Budget Statuses & Active Savings Goals */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Budget Progress Indicators */}
        <div className="p-5 sm:p-6 rounded-2xl border border-[#E2E8F0] bg-white shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-bold text-[#1F2937]">
                Monthly Budgets
              </h2>
              <p className="text-xs text-[#475569]">
                Spending limits for {getMonthLabel(selectedMonth)}
              </p>
            </div>
            <button
              type="button"
              onClick={() => setActiveTab('budgets')}
              className="text-xs text-[#047857] font-semibold hover:underline flex items-center gap-1"
            >
              <span>Manage</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {budgetStatuses.length > 0 ? (
            <div className="space-y-4">
              {budgetStatuses.slice(0, 4).map((bs) => {
                const isOverall = bs.budget.category === 'All' || bs.budget.category === '';
                const progressWidth = Math.min(100, Math.round(bs.percentUsed));

                let barColor = 'bg-[#047857]';
                let textColor = 'text-[#475569]';
                if (bs.status === 'exceeded') {
                  barColor = 'bg-[#DC2626]';
                  textColor = 'text-[#DC2626]';
                } else if (bs.status === 'warning') {
                  barColor = 'bg-[#B45309]';
                  textColor = 'text-[#B45309]';
                }

                return (
                  <div key={bs.budget.id} className="space-y-1.5 p-2 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0]/60">
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-1.5">
                        <span className="font-semibold text-[#1F2937]">
                          {isOverall ? 'Overall Budget' : bs.budget.category}
                        </span>
                        {bs.status === 'warning' && (
                          <span className="text-[10px] text-[#B45309] font-bold flex items-center gap-0.5 bg-amber-50 px-1.5 py-0.5 rounded">
                            <AlertTriangle className="w-3 h-3" /> 80% Used
                          </span>
                        )}
                        {bs.status === 'exceeded' && (
                          <span className="text-[10px] text-[#DC2626] font-bold flex items-center gap-0.5 bg-red-50 px-1.5 py-0.5 rounded">
                            <AlertTriangle className="w-3 h-3" /> Over Budget
                          </span>
                        )}
                      </div>
                      <span className={`font-tabular font-medium ${textColor}`}>
                        {formatCurrency(bs.spent, settings.currency)} /{' '}
                        {formatCurrency(bs.budget.amount, settings.currency)}
                      </span>
                    </div>

                    {/* Progress Bar */}
                    <div className="w-full h-2.5 rounded-full bg-[#E2E8F0] overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-300 ${barColor}`}
                        style={{ width: `${progressWidth}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="py-6 text-center">
              <p className="text-xs text-[#64748B] mb-3">
                No budget configured for {getMonthLabel(selectedMonth)}.
              </p>
              <button
                type="button"
                onClick={onOpenAddBudget}
                className="px-3.5 py-2 text-xs font-semibold rounded-xl bg-[#D1FAE5] hover:bg-[#a7f3d0] text-[#047857] transition-colors"
              >
                + Create Budget
              </button>
            </div>
          )}
        </div>

        {/* Savings Goals Highlights */}
        <div className="p-5 sm:p-6 rounded-2xl border border-[#E2E8F0] bg-white shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-bold text-[#1F2937]">
                Savings Goals
              </h2>
              <p className="text-xs text-[#475569]">
                Track personal savings targets
              </p>
            </div>
            <button
              type="button"
              onClick={() => setActiveTab('goals')}
              className="text-xs text-[#047857] font-semibold hover:underline flex items-center gap-1"
            >
              <span>View all</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {goals.length > 0 ? (
            <div className="space-y-3.5">
              {goals.slice(0, 3).map((goal) => {
                const gm = calculateGoalMetrics(goal);
                return (
                  <div
                    key={goal.id}
                    className="p-3.5 rounded-xl border border-[#E2E8F0]/80 bg-[#F8FAFC] space-y-2"
                  >
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-[#1F2937]">
                        {goal.name}
                      </span>
                      <span className="font-tabular font-semibold text-[#475569]">
                        {formatCurrency(goal.currentSavedAmount, settings.currency)} of{' '}
                        {formatCurrency(goal.targetAmount, settings.currency)}
                      </span>
                    </div>

                    <div className="w-full h-2.5 rounded-full bg-[#E2E8F0] overflow-hidden">
                      <div
                        className="h-full rounded-full bg-[#047857] transition-all duration-300"
                        style={{ width: `${gm.displayPercent}%` }}
                      />
                    </div>

                    <div className="flex items-center justify-between text-[11px] font-medium text-[#64748B]">
                      <span>{gm.displayPercent}% saved</span>
                      <span>
                        {gm.isComplete
                          ? 'Goal reached!'
                          : `${formatCurrency(gm.remainingAmount, settings.currency)} to go`}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="py-6 text-center">
              <p className="text-xs text-[#64748B] mb-3">
                No savings goals created yet.
              </p>
              <button
                type="button"
                onClick={onOpenAddGoal}
                className="px-3.5 py-2 text-xs font-semibold rounded-xl bg-[#D1FAE5] hover:bg-[#a7f3d0] text-[#047857] transition-colors"
              >
                + Create Savings Goal
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Recent Transactions Table */}
      <div className="p-5 sm:p-6 rounded-2xl border border-[#E2E8F0] bg-white shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-sm font-bold text-[#1F2937]">
              Recent Transactions
            </h2>
            <p className="text-xs text-[#475569]">
              Latest financial activity
            </p>
          </div>
          <button
            type="button"
            onClick={() => setActiveTab('transactions')}
            className="text-xs text-[#047857] font-semibold hover:underline flex items-center gap-1"
          >
            <span>View All ({transactions.length})</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {recentTransactions.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-[#E2E8F0] text-[#64748B] font-semibold">
                  <th className="pb-2.5">Date</th>
                  <th className="pb-2.5">Category</th>
                  <th className="pb-2.5 hidden sm:table-cell">Description</th>
                  <th className="pb-2.5 hidden md:table-cell">Method</th>
                  <th className="pb-2.5 text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E2E8F0]/70">
                {recentTransactions.map((tx) => {
                  const isIncome = tx.type === 'income';
                  return (
                    <tr
                      key={tx.id}
                      className="hover:bg-[#F8FAFC] transition-colors"
                    >
                      <td className="py-3 text-[#475569] whitespace-nowrap font-medium">
                        {formatDate(tx.date)}
                      </td>
                      <td className="py-3 font-semibold text-[#1F2937]">
                        {tx.category}
                      </td>
                      <td className="py-3 text-[#64748B] hidden sm:table-cell max-w-xs truncate">
                        {tx.description || '—'}
                      </td>
                      <td className="py-3 text-[#64748B] hidden md:table-cell whitespace-nowrap">
                        {tx.paymentMethod || 'Cash'}
                      </td>
                      <td
                        className={`py-3 text-right font-tabular font-bold whitespace-nowrap ${
                          isIncome ? 'text-[#047857]' : 'text-[#DC2626]'
                        }`}
                      >
                        {isIncome ? '+' : '-'}
                        {formatCurrency(tx.amount, settings.currency)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-xs text-[#64748B] py-4 text-center">
            No transactions found.
          </p>
        )}
      </div>
    </div>
  );
};
