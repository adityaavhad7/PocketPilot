import React, { useState, useEffect } from 'react';
import { Modal } from '../ui/Modal';
import { usePocketPilot } from '../../context/AppContext';
import type { SavingsGoal } from '../../types';

interface GoalModalProps {
  isOpen: boolean;
  onClose: () => void;
  goalToEdit?: SavingsGoal | null;
}

export const GoalModal: React.FC<GoalModalProps> = ({
  isOpen,
  onClose,
  goalToEdit,
}) => {
  const { addGoal, updateGoal, settings } = usePocketPilot();

  const [name, setName] = useState('');
  const [targetAmount, setTargetAmount] = useState('');
  const [currentSavedAmount, setCurrentSavedAmount] = useState('0');
  const [targetDate, setTargetDate] = useState('');
  const [description, setDescription] = useState('');
  const [errors, setErrors] = useState<{ name?: string; targetAmount?: string; currentSavedAmount?: string }>({});

  useEffect(() => {
    if (goalToEdit) {
      setName(goalToEdit.name);
      setTargetAmount(goalToEdit.targetAmount.toString());
      setCurrentSavedAmount(goalToEdit.currentSavedAmount.toString());
      setTargetDate(goalToEdit.targetDate || '');
      setDescription(goalToEdit.description || '');
      setErrors({});
    } else {
      setName('');
      setTargetAmount('');
      setCurrentSavedAmount('0');
      setTargetDate('');
      setDescription('');
      setErrors({});
    }
  }, [goalToEdit, isOpen]);

  const validate = (): boolean => {
    const newErrors: { name?: string; targetAmount?: string; currentSavedAmount?: string } = {};
    const parsedTarget = parseFloat(targetAmount);
    const parsedSaved = parseFloat(currentSavedAmount);

    if (!name.trim()) {
      newErrors.name = 'Goal name is required.';
    }
    if (!targetAmount || isNaN(parsedTarget) || parsedTarget <= 0) {
      newErrors.targetAmount = 'Target amount must be greater than zero.';
    }
    if (isNaN(parsedSaved) || parsedSaved < 0) {
      newErrors.currentSavedAmount = 'Current saved amount cannot be negative.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    const parsedTarget = Math.round(parseFloat(targetAmount) * 100) / 100;
    const parsedSaved = Math.round(parseFloat(currentSavedAmount) * 100) / 100;

    if (goalToEdit) {
      await updateGoal({
        ...goalToEdit,
        name: name.trim(),
        targetAmount: parsedTarget,
        currentSavedAmount: parsedSaved,
        targetDate: targetDate || undefined,
        description: description.trim() || undefined,
      });
    } else {
      await addGoal({
        name: name.trim(),
        targetAmount: parsedTarget,
        currentSavedAmount: parsedSaved,
        targetDate: targetDate || undefined,
        description: description.trim() || undefined,
      });
    }

    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={goalToEdit ? 'Edit Savings Goal' : 'New Savings Goal'}
      description="Plan toward an objective and track your progress."
      maxWidth="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Goal Name */}
        <div>
          <label
            htmlFor="goal-name"
            className="block text-xs font-bold text-[#1F2937] mb-1.5"
          >
            Goal Name *
          </label>
          <input
            id="goal-name"
            type="text"
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              if (errors.name) setErrors((prev) => ({ ...prev, name: undefined }));
            }}
            placeholder="e.g. Emergency Fund, New Laptop, Vacation"
            className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-[#CBD5E1] bg-white text-[#1F2937] focus:outline-hidden focus:ring-2 focus:ring-[#047857] shadow-2xs"
            autoFocus
          />
          {errors.name && (
            <p className="text-xs text-[#DC2626] mt-1 font-medium">{errors.name}</p>
          )}
        </div>

        {/* Amounts */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          <div>
            <label
              htmlFor="goal-target"
              className="block text-xs font-bold text-[#1F2937] mb-1.5"
            >
              Target Amount ({settings.currency}) *
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-[#64748B] font-tabular font-bold">
                {settings.currency}
              </span>
              <input
                id="goal-target"
                type="number"
                step="0.01"
                min="0.01"
                value={targetAmount}
                onChange={(e) => {
                  setTargetAmount(e.target.value);
                  if (errors.targetAmount) setErrors((prev) => ({ ...prev, targetAmount: undefined }));
                }}
                placeholder="1000.00"
                className="w-full pl-9 pr-3.5 py-2.5 text-sm font-tabular rounded-xl border border-[#CBD5E1] bg-white text-[#1F2937] focus:outline-hidden focus:ring-2 focus:ring-[#047857] shadow-2xs"
              />
            </div>
            {errors.targetAmount && (
              <p className="text-xs text-[#DC2626] mt-1 font-medium">{errors.targetAmount}</p>
            )}
          </div>

          <div>
            <label
              htmlFor="goal-saved"
              className="block text-xs font-bold text-[#1F2937] mb-1.5"
            >
              Current Saved ({settings.currency}) *
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-[#64748B] font-tabular font-bold">
                {settings.currency}
              </span>
              <input
                id="goal-saved"
                type="number"
                step="0.01"
                min="0"
                value={currentSavedAmount}
                onChange={(e) => {
                  setCurrentSavedAmount(e.target.value);
                  if (errors.currentSavedAmount) setErrors((prev) => ({ ...prev, currentSavedAmount: undefined }));
                }}
                placeholder="0.00"
                className="w-full pl-9 pr-3.5 py-2.5 text-sm font-tabular rounded-xl border border-[#CBD5E1] bg-white text-[#1F2937] focus:outline-hidden focus:ring-2 focus:ring-[#047857] shadow-2xs"
              />
            </div>
            {errors.currentSavedAmount && (
              <p className="text-xs text-[#DC2626] mt-1 font-medium">{errors.currentSavedAmount}</p>
            )}
          </div>
        </div>

        {/* Target Date */}
        <div>
          <label
            htmlFor="goal-date"
            className="block text-xs font-bold text-[#1F2937] mb-1.5"
          >
            Target Date (Optional)
          </label>
          <input
            id="goal-date"
            type="date"
            value={targetDate}
            onChange={(e) => setTargetDate(e.target.value)}
            className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-[#CBD5E1] bg-white text-[#1F2937] focus:outline-hidden focus:ring-2 focus:ring-[#047857] shadow-2xs"
          />
        </div>

        {/* Description */}
        <div>
          <label
            htmlFor="goal-desc"
            className="block text-xs font-bold text-[#1F2937] mb-1.5"
          >
            Description / Reason (Optional)
          </label>
          <input
            id="goal-desc"
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="e.g. Set aside for safety buffer or college supplies"
            className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-[#CBD5E1] bg-white text-[#1F2937] focus:outline-hidden focus:ring-2 focus:ring-[#047857] shadow-2xs"
          />
        </div>

        <div className="p-3.5 rounded-xl bg-[#D1FAE5]/40 border border-[#047857]/20 text-xs text-[#1F2937]">
          <span className="font-bold text-[#047857]">Note:</span> Savings goals are tracking milestones only. Creating or updating a goal does not alter your transaction ledger or account balance.
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
            {goalToEdit ? 'Save Changes' : 'Create Goal'}
          </button>
        </div>
      </form>
    </Modal>
  );
};
