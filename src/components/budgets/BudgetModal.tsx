import React, { useState, useEffect } from 'react';
import { Modal } from '../ui/Modal';
import { usePocketPilot } from '../../context/AppContext';
import {
  DEFAULT_EXPENSE_CATEGORIES,
  STUDENT_CATEGORIES,
  type Budget,
} from '../../types';
import { getCurrentMonthKey } from '../../utils/formatters';

interface BudgetModalProps {
  isOpen: boolean;
  onClose: () => void;
  budgetToEdit?: Budget | null;
  defaultMonth?: string;
}

export const BudgetModal: React.FC<BudgetModalProps> = ({
  isOpen,
  onClose,
  budgetToEdit,
  defaultMonth,
}) => {
  const { addBudget, updateBudget, settings, budgets } = usePocketPilot();

  const [month, setMonth] = useState<string>(defaultMonth || getCurrentMonthKey());
  const [category, setCategory] = useState<string>('All');
  const [amount, setAmount] = useState<string>('');
  const [errors, setErrors] = useState<{ amount?: string; category?: string }>({});

  useEffect(() => {
    if (budgetToEdit) {
      setMonth(budgetToEdit.month);
      setCategory(budgetToEdit.category);
      setAmount(budgetToEdit.amount.toString());
      setErrors({});
    } else {
      setMonth(defaultMonth || getCurrentMonthKey());
      setCategory('All');
      setAmount('');
      setErrors({});
    }
  }, [budgetToEdit, defaultMonth, isOpen]);

  const availableCategories = React.useMemo(() => {
    const list = ['All', ...DEFAULT_EXPENSE_CATEGORIES];
    if (settings.studentModeEnabled) {
      const studentSet = new Set(['All', ...DEFAULT_EXPENSE_CATEGORIES, ...STUDENT_CATEGORIES]);
      return Array.from(studentSet);
    }
    return list;
  }, [settings.studentModeEnabled]);

  const validate = (): boolean => {
    const newErrors: { amount?: string; category?: string } = {};
    const parsed = parseFloat(amount);

    if (!amount || isNaN(parsed) || parsed <= 0) {
      newErrors.amount = 'Please enter a valid budget amount greater than zero.';
    }

    if (!budgetToEdit) {
      const exists = budgets.some(
        (b) => b.month === month && b.category.toLowerCase() === category.toLowerCase()
      );
      if (exists) {
        newErrors.category = `A budget for ${category === 'All' ? 'Overall spending' : category} already exists for this month.`;
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    const parsedAmount = Math.round(parseFloat(amount) * 100) / 100;

    if (budgetToEdit) {
      await updateBudget({
        ...budgetToEdit,
        month,
        category,
        amount: parsedAmount,
      });
    } else {
      await addBudget({
        month,
        category,
        amount: parsedAmount,
      });
    }

    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={budgetToEdit ? 'Edit Budget' : 'Create Monthly Budget'}
      description="Plan your maximum expected spending limit."
      maxWidth="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Month selector */}
        <div>
          <label
            htmlFor="bg-month"
            className="block text-xs font-bold text-[#1F2937] mb-1.5"
          >
            Target Month *
          </label>
          <input
            id="bg-month"
            type="month"
            value={month}
            onChange={(e) => setMonth(e.target.value)}
            className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-[#CBD5E1] bg-white text-[#1F2937] focus:outline-hidden focus:ring-2 focus:ring-[#047857] shadow-2xs"
          />
        </div>

        {/* Category Scope */}
        <div>
          <label
            htmlFor="bg-cat"
            className="block text-xs font-bold text-[#1F2937] mb-1.5"
          >
            Budget Scope / Category *
          </label>
          <select
            id="bg-cat"
            value={category}
            onChange={(e) => {
              setCategory(e.target.value);
              if (errors.category) setErrors((prev) => ({ ...prev, category: undefined }));
            }}
            className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-[#CBD5E1] bg-white text-[#1F2937] focus:outline-hidden focus:ring-2 focus:ring-[#047857] shadow-2xs"
          >
            {availableCategories.map((cat) => (
              <option key={cat} value={cat}>
                {cat === 'All' ? 'Overall Monthly Budget (All Categories)' : cat}
              </option>
            ))}
          </select>
          {errors.category && (
            <p className="text-xs text-[#DC2626] mt-1 font-medium">{errors.category}</p>
          )}
          <p className="text-xs text-[#475569] mt-1">
            {category === 'All'
              ? 'This budget caps your entire monthly expenditure across all expenses.'
              : `This budget sets a spending ceiling strictly for ${category}.`}
          </p>
        </div>

        {/* Budget Limit Amount */}
        <div>
          <label
            htmlFor="bg-amount"
            className="block text-xs font-bold text-[#1F2937] mb-1.5"
          >
            Budget Limit ({settings.currency}) *
          </label>
          <div className="relative">
            <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-[#64748B] font-tabular font-bold">
              {settings.currency}
            </span>
            <input
              id="bg-amount"
              type="number"
              step="0.01"
              min="0.01"
              value={amount}
              onChange={(e) => {
                setAmount(e.target.value);
                if (errors.amount) setErrors((prev) => ({ ...prev, amount: undefined }));
              }}
              placeholder="500.00"
              className="w-full pl-9 pr-3.5 py-2.5 text-sm font-tabular rounded-xl border border-[#CBD5E1] bg-white text-[#1F2937] focus:outline-hidden focus:ring-2 focus:ring-[#047857] shadow-2xs"
              autoFocus
            />
          </div>
          {errors.amount && (
            <p className="text-xs text-[#DC2626] mt-1 font-medium">{errors.amount}</p>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 pt-3.5 border-t border-[#E2E8F0]">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-semibold text-[#1F2937] bg-white border border-[#CBD5E1] rounded-xl hover:bg-[#F8FAFC] transition-colors focus-visible:ring-2 focus:outline-hidden"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 text-sm font-semibold text-white bg-[#047857] hover:bg-[#065f46] rounded-xl transition-all shadow-xs focus-visible:ring-2 focus:outline-hidden active:scale-[0.98]"
          >
            {budgetToEdit ? 'Save Changes' : 'Create Budget'}
          </button>
        </div>
      </form>
    </Modal>
  );
};
