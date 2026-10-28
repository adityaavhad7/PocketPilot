import React, { useState } from 'react';
import { usePocketPilot } from '../../context/AppContext';
import type { SavingsGoal } from '../../types';
import { calculateGoalMetrics } from '../../utils/calculations';
import { formatCurrency, formatDate } from '../../utils/formatters';
import {
  Target,
  Plus,
  Edit2,
  Trash2,
  CheckCircle2,
  Calendar,
  ArrowDownCircle,
  Info,
} from 'lucide-react';
import { ConfirmDialog } from '../ui/ConfirmDialog';
import { EmptyState } from '../ui/EmptyState';

interface SavingsGoalsViewProps {
  onOpenAddGoal: () => void;
  onEditGoal: (goal: SavingsGoal) => void;
  onAdjustGoal: (goal: SavingsGoal) => void;
}

export const SavingsGoalsView: React.FC<SavingsGoalsViewProps> = ({
  onOpenAddGoal,
  onEditGoal,
  onAdjustGoal,
}) => {
  const { goals, deleteGoal, settings } = usePocketPilot();

  const [goalToDelete, setGoalToDelete] = useState<SavingsGoal | null>(null);

  // Overall totals
  const overallTotals = React.useMemo(() => {
    let targetTotal = 0;
    let savedTotal = 0;
    let completedCount = 0;

    for (const g of goals) {
      targetTotal += Number(g.targetAmount) || 0;
      savedTotal += Number(g.currentSavedAmount) || 0;
      if (g.currentSavedAmount >= g.targetAmount && g.targetAmount > 0) {
        completedCount += 1;
      }
    }

    const overallPercent = targetTotal > 0 ? (savedTotal / targetTotal) * 100 : 0;
    return {
      targetTotal,
      savedTotal,
      remainingTotal: Math.max(0, targetTotal - savedTotal),
      overallPercent: Math.min(100, Math.round(overallPercent)),
      completedCount,
    };
  }, [goals]);

  return (
    <div className="space-y-6">
      {/* Title & Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[#1F2937]">
            Savings Goals
          </h1>
          <p className="text-xs sm:text-sm font-medium text-[#475569] mt-0.5">
            Set targets and track milestones for emergency funds, study gadgets, or trips
          </p>
        </div>

        <button
          type="button"
          onClick={onOpenAddGoal}
          className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-[#047857] hover:bg-[#065f46] rounded-xl transition-all shadow-xs hover:shadow-sm focus-visible:ring-2 focus-visible:ring-[#047857] focus:outline-hidden whitespace-nowrap self-start sm:self-auto active:scale-[0.98]"
        >
          <Plus className="w-4 h-4" />
          <span>New Goal</span>
        </button>
      </div>

      {/* Tracking-Only Notice Card */}
      <div className="flex items-start gap-3 p-4 rounded-2xl border border-[#047857]/20 bg-[#D1FAE5]/40 text-xs text-[#1F2937]">
        <Info className="w-4 h-4 text-[#047857] shrink-0 mt-0.5" />
        <p className="leading-relaxed">
          <strong className="text-[#047857]">Tracking records only:</strong>{' '}
          Savings goals help you monitor planned savings. Adjusting goal balances does not alter your
          actual transaction records or total cash balance.
        </p>
      </div>

      {/* Summary Row */}
      {goals.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-5 rounded-2xl border border-[#E2E8F0] bg-white shadow-xs">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#475569]">
              Total Saved Across Goals
            </span>
            <div className="text-2xl font-bold font-tabular text-[#047857] mt-1.5">
              {formatCurrency(overallTotals.savedTotal, settings.currency)}
            </div>
            <div className="text-[11px] font-medium text-[#64748B] mt-1 font-tabular">
              Target: {formatCurrency(overallTotals.targetTotal, settings.currency)}
            </div>
          </div>

          <div className="p-5 rounded-2xl border border-[#E2E8F0] bg-white shadow-xs">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#475569]">
              Total Remaining to Save
            </span>
            <div className="text-2xl font-bold font-tabular text-[#1F2937] mt-1.5">
              {formatCurrency(overallTotals.remainingTotal, settings.currency)}
            </div>
            <div className="text-[11px] font-medium text-[#64748B] mt-1">
              Across {goals.length} active {goals.length === 1 ? 'goal' : 'goals'}
            </div>
          </div>

          <div className="p-5 rounded-2xl border border-[#E2E8F0] bg-white shadow-xs">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#475569]">
              Goals Completed
            </span>
            <div className="text-2xl font-bold font-tabular text-[#1F2937] mt-1.5">
              {overallTotals.completedCount} / {goals.length}
            </div>
            <div className="text-[11px] font-medium text-[#64748B] mt-1 font-tabular">
              {overallTotals.overallPercent}% of total target funded
            </div>
          </div>
        </div>
      )}

      {/* Goal Cards Grid */}
      {goals.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {goals.map((goal) => {
            const gm = calculateGoalMetrics(goal);

            return (
              <div
                key={goal.id}
                className="p-5 sm:p-6 rounded-2xl border border-[#E2E8F0] bg-white shadow-xs flex flex-col justify-between space-y-4 hover:shadow-sm transition-all"
              >
                <div>
                  {/* Goal Header */}
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-1.5">
                        <h3 className="text-base font-bold text-[#1F2937]">
                          {goal.name}
                        </h3>
                        {gm.isComplete && (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-[#047857] bg-[#D1FAE5] px-2 py-0.5 rounded-full">
                            <CheckCircle2 className="w-3 h-3" /> Achieved
                          </span>
                        )}
                      </div>
                      {goal.description && (
                        <p className="text-xs text-[#475569] mt-1 line-clamp-2">
                          {goal.description}
                        </p>
                      )}
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        type="button"
                        onClick={() => onEditGoal(goal)}
                        className="p-1.5 text-[#64748B] hover:text-[#047857] rounded-lg hover:bg-[#D1FAE5]/40 transition-colors"
                        aria-label={`Edit goal ${goal.name}`}
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setGoalToDelete(goal)}
                        className="p-1.5 text-[#64748B] hover:text-[#DC2626] rounded-lg hover:bg-red-50 transition-colors"
                        aria-label={`Delete goal ${goal.name}`}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Financial Values */}
                  <div className="mt-4 flex items-baseline justify-between text-xs">
                    <span className="text-[#475569] font-medium">Saved so far</span>
                    <span className="font-tabular text-sm font-bold text-[#1F2937]">
                      {formatCurrency(goal.currentSavedAmount, settings.currency)}{' '}
                      <span className="text-xs font-normal text-[#64748B]">
                        / {formatCurrency(goal.targetAmount, settings.currency)}
                      </span>
                    </span>
                  </div>

                  {/* Progress Bar */}
                  <div className="mt-2 space-y-1.5">
                    <div className="w-full h-2.5 rounded-full bg-[#E2E8F0] overflow-hidden">
                      <div
                        className="h-full rounded-full bg-[#047857] transition-all duration-300"
                        style={{ width: `${gm.displayPercent}%` }}
                      />
                    </div>
                    <div className="flex items-center justify-between text-[11px] text-[#475569] font-tabular">
                      <span className="font-semibold text-[#047857]">{gm.displayPercent}% achieved</span>
                      <span>
                        {gm.isComplete
                          ? '100% complete'
                          : `${formatCurrency(gm.remainingAmount, settings.currency)} remaining`}
                      </span>
                    </div>
                  </div>

                  {/* Target Date if set */}
                  {goal.targetDate && (
                    <div className="mt-3 flex items-center gap-1.5 text-xs text-[#475569]">
                      <Calendar className="w-3.5 h-3.5 text-[#047857]" />
                      <span>Target: {formatDate(goal.targetDate)}</span>
                    </div>
                  )}
                </div>

                {/* Adjust Button */}
                <div className="pt-3 border-t border-[#E2E8F0] flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => onAdjustGoal(goal)}
                    className="w-full flex items-center justify-center gap-1.5 py-2 text-xs font-semibold rounded-xl bg-[#D1FAE5]/60 hover:bg-[#D1FAE5] text-[#047857] transition-colors"
                  >
                    <ArrowDownCircle className="w-3.5 h-3.5" />
                    <span>Quick Deposit / Withdraw</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <EmptyState
          icon={Target}
          title="No Savings Goals Yet"
          description="Create your first savings goal to track progress towards an emergency buffer, tech gadget, tuition, or trip."
          actionLabel="Create Savings Goal"
          onAction={onOpenAddGoal}
        />
      )}

      {/* Confirmation Dialog for Goal Deletion */}
      <ConfirmDialog
        isOpen={!!goalToDelete}
        onClose={() => setGoalToDelete(null)}
        onConfirm={async () => {
          if (goalToDelete) {
            await deleteGoal(goalToDelete.id);
            setGoalToDelete(null);
          }
        }}
        title="Delete Savings Goal"
        message={
          goalToDelete
            ? `Are you sure you want to delete the goal "${goalToDelete.name}"? This removes the tracking record but does not change any recorded transactions.`
            : ''
        }
        confirmLabel="Delete Goal"
        isDestructive={true}
      />
    </div>
  );
};
