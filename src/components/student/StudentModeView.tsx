import React, { useState } from 'react';
import { usePocketPilot } from '../../context/AppContext';
import { calculateStudentMetrics } from '../../utils/calculations';
import {
  formatCurrency,
  getMonthLabel,
} from '../../utils/formatters';
import {
  GraduationCap,
  AlertTriangle,
  Plus,
} from 'lucide-react';

interface StudentModeViewProps {
  onOpenAddTransaction: (category?: string) => void;
}

export const StudentModeView: React.FC<StudentModeViewProps> = ({
  onOpenAddTransaction,
}) => {
  const { transactions, settings, updateSettings, selectedMonth } = usePocketPilot();

  const [allowanceInput, setAllowanceInput] = useState(
    settings.studentMonthlyAllowance.toString()
  );
  const [isEditingAllowance, setIsEditingAllowance] = useState(false);

  const metrics = calculateStudentMetrics(
    transactions,
    settings.studentMonthlyAllowance,
    selectedMonth
  );

  const handleToggleStudentMode = async (enabled: boolean) => {
    await updateSettings({ studentModeEnabled: enabled });
  };

  const handleSaveAllowance = async (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseFloat(allowanceInput);
    if (!isNaN(val) && val >= 0) {
      await updateSettings({ studentMonthlyAllowance: val });
      setIsEditingAllowance(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Title & Enable/Disable Switch */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 sm:p-6 rounded-2xl border border-[#E2E8F0] bg-white shadow-xs">
        <div className="flex items-start sm:items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#D1FAE5] text-[#047857] flex items-center justify-center shrink-0">
            <GraduationCap className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-lg sm:text-xl font-bold text-[#1F2937] flex items-center gap-2">
              <span>Student Mode</span>
              {settings.studentModeEnabled && (
                <span className="text-[10px] uppercase font-bold tracking-wide px-2 py-0.5 rounded-full bg-[#047857] text-white">
                  Active
                </span>
              )}
            </h1>
            <p className="text-xs text-[#475569] mt-0.5">
              Budget allowance tracking with daily burn rate for students & young adults
            </p>
          </div>
        </div>

        {/* Toggle Button */}
        <div className="flex items-center gap-3 self-end sm:self-auto">
          <span className="text-xs font-semibold text-[#475569]">
            {settings.studentModeEnabled ? 'Enabled' : 'Disabled'}
          </span>
          <button
            type="button"
            onClick={() => handleToggleStudentMode(!settings.studentModeEnabled)}
            className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-hidden focus-visible:ring-2 focus-visible:ring-[#047857] ${
              settings.studentModeEnabled
                ? 'bg-[#047857]'
                : 'bg-slate-300'
            }`}
            role="switch"
            aria-checked={settings.studentModeEnabled}
            aria-label="Toggle Student Mode"
          >
            <span
              className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                settings.studentModeEnabled ? 'translate-x-5' : 'translate-x-0'
              }`}
            />
          </button>
        </div>
      </div>

      {!settings.studentModeEnabled ? (
        <div className="p-8 sm:p-12 rounded-2xl border border-dashed border-[#CBD5E1] bg-white text-center space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-[#D1FAE5]/60 text-[#047857] flex items-center justify-center mx-auto">
            <GraduationCap className="w-6 h-6" />
          </div>
          <h2 className="text-base font-bold text-[#1F2937]">
            Student Mode is currently turned off
          </h2>
          <p className="text-xs text-[#475569] max-w-md mx-auto leading-relaxed">
            Enable Student Mode if you live on a monthly allowance or college budget. It provides
            specialized student expense categories, this week's burn rate, and a recommended
            daily spending limit for the remaining days of the month.
          </p>
          <button
            type="button"
            onClick={() => handleToggleStudentMode(true)}
            className="px-4 py-2 text-xs font-semibold text-white bg-[#047857] hover:bg-[#065f46] rounded-xl transition-colors mt-2 shadow-xs active:scale-[0.98]"
          >
            Turn On Student Mode
          </button>
        </div>
      ) : (
        <>
          {/* Allowance Configuration Strip */}
          <div className="p-5 rounded-2xl border border-[#E2E8F0] bg-white shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-[#475569]">
                Configured Monthly Allowance
              </span>
              <div className="text-2xl font-bold font-tabular text-[#1F2937] mt-0.5">
                {formatCurrency(settings.studentMonthlyAllowance, settings.currency)}
              </div>
            </div>

            {isEditingAllowance ? (
              <form onSubmit={handleSaveAllowance} className="flex items-center gap-2">
                <input
                  type="number"
                  step="1"
                  min="0"
                  value={allowanceInput}
                  onChange={(e) => setAllowanceInput(e.target.value)}
                  className="w-28 px-3 py-1.5 text-xs font-tabular rounded-xl border border-[#CBD5E1] bg-white text-[#1F2937] focus:outline-hidden focus:ring-2 focus:ring-[#047857]"
                  autoFocus
                />
                <button
                  type="submit"
                  className="px-3.5 py-1.5 text-xs font-semibold text-white bg-[#047857] hover:bg-[#065f46] rounded-xl"
                >
                  Save
                </button>
                <button
                  type="button"
                  onClick={() => setIsEditingAllowance(false)}
                  className="px-2.5 py-1.5 text-xs text-[#475569] hover:text-[#1F2937]"
                >
                  Cancel
                </button>
              </form>
            ) : (
              <button
                type="button"
                onClick={() => {
                  setAllowanceInput(settings.studentMonthlyAllowance.toString());
                  setIsEditingAllowance(true);
                }}
                className="text-xs text-[#047857] font-semibold hover:underline"
              >
                Change Allowance &rarr;
              </button>
            )}
          </div>

          {/* 3 Student Metrics Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* 1. Remaining Allowance */}
            <div className="p-5 rounded-2xl border border-[#E2E8F0] bg-white shadow-xs">
              <span className="text-xs font-semibold uppercase tracking-wider text-[#475569]">
                Remaining Allowance ({getMonthLabel(selectedMonth).split(' ')[0]})
              </span>
              <div
                className={`text-2xl font-bold font-tabular mt-1.5 ${
                  metrics.isOverspent ? 'text-[#DC2626]' : 'text-[#047857]'
                }`}
              >
                {metrics.isOverspent
                  ? `-${formatCurrency(metrics.overspendAmount, settings.currency)}`
                  : formatCurrency(metrics.remainingAllowance, settings.currency)}
              </div>
              <div className="text-[11px] font-medium text-[#64748B] mt-1 font-tabular">
                Spent: {formatCurrency(metrics.spentThisMonth, settings.currency)} of{' '}
                {formatCurrency(metrics.monthlyAllowance, settings.currency)}
              </div>
            </div>

            {/* 2. Suggested Daily Spending */}
            <div className="p-5 rounded-2xl border border-[#E2E8F0] bg-white shadow-xs">
              <span className="text-xs font-semibold uppercase tracking-wider text-[#475569]">
                Suggested Daily Spend Limit
              </span>
              <div className="text-2xl font-bold font-tabular text-[#1F2937] mt-1.5">
                {metrics.isOverspent
                  ? '₹0.00 / day'
                  : `${formatCurrency(metrics.suggestedDailyBudget, settings.currency)} / day`}
              </div>
              <div className="text-[11px] font-medium text-[#64748B] mt-1">
                {metrics.daysRemainingInMonth} {metrics.daysRemainingInMonth === 1 ? 'day' : 'days'}{' '}
                left in month
              </div>
            </div>

            {/* 3. Spent This Week */}
            <div className="p-5 rounded-2xl border border-[#E2E8F0] bg-white shadow-xs">
              <span className="text-xs font-semibold uppercase tracking-wider text-[#475569]">
                Spending This Week
              </span>
              <div className="text-2xl font-bold font-tabular text-[#DC2626] mt-1.5">
                {formatCurrency(metrics.spentThisWeek, settings.currency)}
              </div>
              <div className="text-[11px] font-medium text-[#64748B] mt-1">
                Recent 7-day outlays
              </div>
            </div>
          </div>

          {/* Overspent Warning Alert */}
          {metrics.isOverspent && (
            <div className="flex items-start gap-3 p-4 rounded-2xl border border-red-200 bg-red-50 text-xs text-[#DC2626]">
              <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-sm">Monthly Allowance Exceeded!</p>
                <p className="mt-0.5">
                  You have overspent your monthly allowance by{' '}
                  <strong>{formatCurrency(metrics.overspendAmount, settings.currency)}</strong>. Consider pausing non-essential expenses until next month.
                </p>
              </div>
            </div>
          )}

          {/* Student Category Expenses Breakdown */}
          <div className="p-5 sm:p-6 rounded-2xl border border-[#E2E8F0] bg-white shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-sm font-bold text-[#1F2937]">
                  Student Category Spending
                </h2>
                <p className="text-xs text-[#475569]">
                  Categorized expenditures in {getMonthLabel(selectedMonth)}
                </p>
              </div>
              <button
                type="button"
                onClick={() => onOpenAddTransaction()}
                className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold rounded-xl bg-[#D1FAE5] hover:bg-[#a7f3d0] text-[#047857] transition-colors active:scale-[0.98]"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Log Expense</span>
              </button>
            </div>

            {metrics.topCategorySpending.length > 0 ? (
              <div className="space-y-3">
                {metrics.topCategorySpending.map((cat) => (
                  <div key={cat.category} className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-[#1F2937]">
                        {cat.category}
                      </span>
                      <span className="font-tabular font-bold text-[#1F2937]">
                        {formatCurrency(cat.amount, settings.currency)}{' '}
                        <span className="font-normal text-[#64748B]">
                          ({Math.round(cat.percentage)}%)
                        </span>
                      </span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-[#E2E8F0] overflow-hidden">
                      <div
                        className="h-full rounded-full bg-[#047857]"
                        style={{ width: `${Math.round(cat.percentage)}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-[#64748B] py-4 text-center">
                No student expenses recorded yet for {getMonthLabel(selectedMonth)}.
              </p>
            )}
          </div>
        </>
      )}
    </div>
  );
};
