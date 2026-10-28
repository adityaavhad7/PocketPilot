import React, { useState } from 'react';
import { usePocketPilot } from '../../context/AppContext';
import type { Budget } from '../../types';
import {
  calculateBudgetStatuses,
} from '../../utils/calculations';
import {
  formatCurrency,
  getMonthLabel,
} from '../../utils/formatters';
import {
  PiggyBank,
  Plus,
  Edit2,
  Trash2,
  AlertTriangle,
  CheckCircle2,
} from 'lucide-react';
import { ConfirmDialog } from '../ui/ConfirmDialog';
import { EmptyState } from '../ui/EmptyState';

interface BudgetsViewProps {
  onOpenAddBudget: () => void;
  onEditBudget: (budget: Budget) => void;
}

export const BudgetsView: React.FC<BudgetsViewProps> = ({
  onOpenAddBudget,
  onEditBudget,
}) => {
  const { budgets, transactions, deleteBudget, settings, selectedMonth } = usePocketPilot();

  const [budgetToDelete, setBudgetToDelete] = useState<Budget | null>(null);

  const budgetStatuses = calculateBudgetStatuses(budgets, transactions, selectedMonth);

  const overallBudgetStatus = budgetStatuses.find(
    (b) => b.budget.category === 'All' || b.budget.category === ''
  );
  const categoryBudgetStatuses = budgetStatuses.filter(
    (b) => b.budget.category !== 'All' && b.budget.category !== ''
  );

  return (
    <div className="space-y-6">
      {/* Title & Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[#1F2937]">
            Monthly Budgets & Limits
          </h1>
          <p className="text-xs sm:text-sm font-medium text-[#475569] mt-0.5">
            Spending targets and limits for {getMonthLabel(selectedMonth)}
          </p>
        </div>

        <button
          type="button"
          onClick={onOpenAddBudget}
          className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-[#047857] hover:bg-[#065f46] rounded-xl transition-all shadow-xs hover:shadow-sm focus-visible:ring-2 focus-visible:ring-[#047857] focus:outline-hidden whitespace-nowrap self-start sm:self-auto active:scale-[0.98]"
        >
          <Plus className="w-4 h-4" />
          <span>New Budget</span>
        </button>
      </div>

      {/* Overall Budget Hero Card */}
      {overallBudgetStatus ? (
        <div className="p-6 rounded-2xl border border-[#E2E8F0] bg-white shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-[#64748B]">
                  Overall Monthly Cap
                </span>
                {overallBudgetStatus.status === 'warning' && (
                  <span className="inline-flex items-center gap-1 text-[11px] font-bold text-[#B45309] bg-amber-50 px-2 py-0.5 rounded-lg">
                    <AlertTriangle className="w-3.5 h-3.5" /> 80% Limit Warning
                  </span>
                )}
                {overallBudgetStatus.status === 'exceeded' && (
                  <span className="inline-flex items-center gap-1 text-[11px] font-bold text-[#DC2626] bg-red-50 px-2 py-0.5 rounded-lg">
                    <AlertTriangle className="w-3.5 h-3.5" /> Over Budget!
                  </span>
                )}
                {overallBudgetStatus.status === 'normal' && (
                  <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#047857] bg-[#D1FAE5] px-2 py-0.5 rounded-lg">
                    <CheckCircle2 className="w-3.5 h-3.5" /> On Track
                  </span>
                )}
              </div>
              <h2 className="text-xl font-bold text-[#1F2937] mt-1.5 font-tabular">
                Total Expenses Cap: {formatCurrency(overallBudgetStatus.budget.amount, settings.currency)}
              </h2>
            </div>

            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => onEditBudget(overallBudgetStatus.budget)}
                className="p-2 text-[#64748B] hover:text-[#047857] rounded-xl hover:bg-[#D1FAE5]/40 transition-colors"
                aria-label="Edit overall budget"
              >
                <Edit2 className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => setBudgetToDelete(overallBudgetStatus.budget)}
                className="p-2 text-[#64748B] hover:text-[#DC2626] rounded-xl hover:bg-red-50 transition-colors"
                aria-label="Delete overall budget"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="space-y-2">
            <div className="w-full h-3 rounded-full bg-[#E2E8F0] overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-300 ${
                  overallBudgetStatus.status === 'exceeded'
                    ? 'bg-[#DC2626]'
                    : overallBudgetStatus.status === 'warning'
                    ? 'bg-[#B45309]'
                    : 'bg-[#047857]'
                }`}
                style={{ width: `${Math.min(100, Math.round(overallBudgetStatus.percentUsed))}%` }}
              />
            </div>

            <div className="flex items-center justify-between text-xs text-[#475569] font-tabular">
              <span>
                Spent: <strong className="text-[#1F2937]">{formatCurrency(overallBudgetStatus.spent, settings.currency)}</strong> ({Math.round(overallBudgetStatus.percentUsed)}%)
              </span>
              <span>
                Remaining: <strong className={overallBudgetStatus.remaining < 0 ? 'text-[#DC2626]' : 'text-[#1F2937]'}>
                  {formatCurrency(overallBudgetStatus.remaining, settings.currency)}
                </strong>
              </span>
            </div>
          </div>

          <p className="text-xs text-[#64748B]">
            This figure covers all expenses recorded within {getMonthLabel(selectedMonth)}.
          </p>
        </div>
      ) : (
        <div className="p-6 rounded-2xl border border-dashed border-[#CBD5E1] bg-white flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <h3 className="text-sm font-bold text-[#1F2937]">
              No Overall Budget Configured for {getMonthLabel(selectedMonth)}
            </h3>
            <p className="text-xs text-[#475569] mt-0.5">
              Set a monthly overall ceiling to monitor total expenditures at a glance.
            </p>
          </div>
          <button
            type="button"
            onClick={onOpenAddBudget}
            className="px-4 py-2 text-xs font-semibold rounded-xl bg-[#D1FAE5] hover:bg-[#a7f3d0] text-[#047857] transition-colors whitespace-nowrap"
          >
            + Set Overall Budget
          </button>
        </div>
      )}

      {/* Category-Specific Budgets Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-[#1F2937]">
              Category Budgets
            </h2>
            <p className="text-xs text-[#475569]">
              Granular spending limits assigned per category
            </p>
          </div>
        </div>

        {categoryBudgetStatuses.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {categoryBudgetStatuses.map((item) => {
              const progressWidth = Math.min(100, Math.round(item.percentUsed));

              let badge = null;
              if (item.status === 'exceeded') {
                badge = (
                  <span className="text-[10px] font-bold text-[#DC2626] flex items-center gap-1 bg-red-50 px-1.5 py-0.5 rounded">
                    <AlertTriangle className="w-3 h-3" /> Over Budget
                  </span>
                );
              } else if (item.status === 'warning') {
                badge = (
                  <span className="text-[10px] font-bold text-[#B45309] flex items-center gap-1 bg-amber-50 px-1.5 py-0.5 rounded">
                    <AlertTriangle className="w-3 h-3" /> 80% Warning
                  </span>
                );
              }

              return (
                <div
                  key={item.budget.id}
                  className="p-5 rounded-2xl border border-[#E2E8F0] bg-white shadow-xs space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-sm font-bold text-[#1F2937]">
                          {item.budget.category}
                        </h3>
                        {badge}
                      </div>
                      <p className="text-[11px] text-[#64748B]">
                        Category spending limit
                      </p>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => onEditBudget(item.budget)}
                        className="p-1.5 text-[#64748B] hover:text-[#047857] rounded-lg hover:bg-[#D1FAE5]/40 transition-colors"
                        aria-label={`Edit ${item.budget.category} budget`}
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setBudgetToDelete(item.budget)}
                        className="p-1.5 text-[#64748B] hover:text-[#DC2626] rounded-lg hover:bg-red-50 transition-colors"
                        aria-label={`Delete ${item.budget.category} budget`}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="space-y-1.5">
                    <div className="w-full h-2.5 rounded-full bg-[#E2E8F0] overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-300 ${
                          item.status === 'exceeded'
                            ? 'bg-[#DC2626]'
                            : item.status === 'warning'
                            ? 'bg-[#B45309]'
                            : 'bg-[#047857]'
                        }`}
                        style={{ width: `${progressWidth}%` }}
                      />
                    </div>
                    <div className="flex items-center justify-between text-xs text-[#475569] font-tabular pt-1">
                      <span>
                        Spent: <strong className="text-[#1F2937]">{formatCurrency(item.spent, settings.currency)}</strong> of {formatCurrency(item.budget.amount, settings.currency)}
                      </span>
                      <span className="font-bold text-[#1F2937]">
                        {Math.round(item.percentUsed)}%
                      </span>
                    </div>
                  </div>

                  <div className="text-[11px] text-[#475569] font-tabular pt-2 border-t border-[#E2E8F0]/80 flex items-center justify-between">
                    <span>Remaining for {item.budget.category}:</span>
                    <strong className={item.remaining < 0 ? 'text-[#DC2626]' : 'text-[#047857]'}>
                      {formatCurrency(item.remaining, settings.currency)}
                    </strong>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="p-8 rounded-2xl border border-dashed border-[#CBD5E1] bg-white text-center">
            <EmptyState
              icon={PiggyBank}
              title="No Category Budgets Yet"
              description="Add category-specific limits like Food, Travel, or Entertainment to stay disciplined across specific spending areas."
              actionLabel="Add Category Budget"
              onAction={onOpenAddBudget}
            />
          </div>
        )}
      </div>

      {/* Confirmation Dialog for Deletion */}
      <ConfirmDialog
        isOpen={!!budgetToDelete}
        onClose={() => setBudgetToDelete(null)}
        onConfirm={async () => {
          if (budgetToDelete) {
            await deleteBudget(budgetToDelete.id);
            setBudgetToDelete(null);
          }
        }}
        title="Delete Budget"
        message={
          budgetToDelete
            ? `Are you sure you want to delete the budget for ${
                budgetToDelete.category === 'All' ? 'Overall spending' : budgetToDelete.category
              } (${formatCurrency(budgetToDelete.amount, settings.currency)})?`
            : ''
        }
        confirmLabel="Delete Budget"
        isDestructive={true}
      />
    </div>
  );
};
