import React, { useState } from 'react';
import { Modal } from '../ui/Modal';
import { usePocketPilot } from '../../context/AppContext';
import type { SavingsGoal } from '../../types';
import { formatCurrency } from '../../utils/formatters';

interface GoalAdjustmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  goal: SavingsGoal | null;
}

export const GoalAdjustmentModal: React.FC<GoalAdjustmentModalProps> = ({
  isOpen,
  onClose,
  goal,
}) => {
  const { adjustGoalSavedAmount, settings } = usePocketPilot();
  const [actionType, setActionType] = useState<'deposit' | 'withdraw'>('deposit');
  const [amount, setAmount] = useState('');
  const [error, setError] = useState<string | null>(null);

  if (!goal) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = parseFloat(amount);
    if (!amount || isNaN(parsed) || parsed <= 0) {
      setError('Please enter an amount greater than zero.');
      return;
    }

    if (actionType === 'withdraw' && parsed > goal.currentSavedAmount) {
      setError(`Cannot withdraw more than current saved amount (${formatCurrency(goal.currentSavedAmount, settings.currency)}).`);
      return;
    }

    const delta = actionType === 'deposit' ? parsed : -parsed;
    await adjustGoalSavedAmount(goal.id, delta);
    setAmount('');
    setError(null);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Adjust Saved: ${goal.name}`}
      description={`Current: ${formatCurrency(goal.currentSavedAmount, settings.currency)} / Target: ${formatCurrency(goal.targetAmount, settings.currency)}`}
      maxWidth="sm"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-2 p-1 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl">
          <button
            type="button"
            onClick={() => {
              setActionType('deposit');
              setError(null);
            }}
            className={`py-2 text-xs font-bold rounded-lg transition-all ${
              actionType === 'deposit'
                ? 'bg-white text-[#047857] shadow-2xs'
                : 'text-[#475569] hover:text-[#047857]'
            }`}
          >
            Add Savings (+)
          </button>
          <button
            type="button"
            onClick={() => {
              setActionType('withdraw');
              setError(null);
            }}
            className={`py-2 text-xs font-bold rounded-lg transition-all ${
              actionType === 'withdraw'
                ? 'bg-white text-[#1F2937] shadow-2xs'
                : 'text-[#475569] hover:text-[#1F2937]'
            }`}
          >
            Withdraw (-)
          </button>
        </div>

        <div>
          <label
            htmlFor="adj-amount"
            className="block text-xs font-bold text-[#1F2937] mb-1.5"
          >
            Amount ({settings.currency})
          </label>
          <div className="relative">
            <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-[#64748B] font-tabular font-bold">
              {settings.currency}
            </span>
            <input
              id="adj-amount"
              type="number"
              step="0.01"
              min="0.01"
              value={amount}
              onChange={(e) => {
                setAmount(e.target.value);
                if (error) setError(null);
              }}
              placeholder="50.00"
              className="w-full pl-9 pr-3.5 py-2.5 text-sm font-tabular rounded-xl border border-[#CBD5E1] bg-white text-[#1F2937] focus:outline-hidden focus:ring-2 focus:ring-[#047857] shadow-2xs"
              autoFocus
            />
          </div>
          {error && <p className="text-xs text-[#DC2626] mt-1 font-medium">{error}</p>}
        </div>

        <div className="flex items-center justify-end gap-3 pt-3.5 border-t border-[#E2E8F0]">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-semibold text-[#1F2937] bg-white border border-[#CBD5E1] rounded-xl hover:bg-[#F8FAFC] transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 text-sm font-semibold text-white bg-[#047857] hover:bg-[#065f46] rounded-xl transition-all shadow-xs active:scale-[0.98]"
          >
            {actionType === 'deposit' ? 'Record Deposit' : 'Record Withdrawal'}
          </button>
        </div>
      </form>
    </Modal>
  );
};
