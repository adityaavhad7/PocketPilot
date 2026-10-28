import React, { useState, useEffect } from 'react';
import { Modal } from '../ui/Modal';
import { usePocketPilot } from '../../context/AppContext';
import {
  DEFAULT_EXPENSE_CATEGORIES,
  DEFAULT_INCOME_CATEGORIES,
  STUDENT_CATEGORIES,
  PAYMENT_METHODS,
  type Transaction,
  type TransactionType,
} from '../../types';

interface TransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  transactionToEdit?: Transaction | null;
  defaultType?: TransactionType;
}

export const TransactionModal: React.FC<TransactionModalProps> = ({
  isOpen,
  onClose,
  transactionToEdit,
  defaultType = 'expense',
}) => {
  const { addTransaction, updateTransaction, settings } = usePocketPilot();

  const [type, setType] = useState<TransactionType>(defaultType);
  const [amount, setAmount] = useState<string>('');
  const [category, setCategory] = useState<string>('');
  const [date, setDate] = useState<string>(new Date().toISOString().slice(0, 10));
  const [description, setDescription] = useState<string>('');
  const [paymentMethod, setPaymentMethod] = useState<string>(settings.defaultPaymentMethod || 'Cash');

  const [errors, setErrors] = useState<{ amount?: string; category?: string; date?: string }>({});

  useEffect(() => {
    if (transactionToEdit) {
      setType(transactionToEdit.type);
      setAmount(transactionToEdit.amount.toString());
      setCategory(transactionToEdit.category);
      setDate(transactionToEdit.date);
      setDescription(transactionToEdit.description || '');
      setPaymentMethod(transactionToEdit.paymentMethod || 'Cash');
      setErrors({});
    } else {
      setType(defaultType);
      setAmount('');
      const defaultCategories = defaultType === 'income' ? DEFAULT_INCOME_CATEGORIES : DEFAULT_EXPENSE_CATEGORIES;
      setCategory(defaultCategories[0]);
      setDate(new Date().toISOString().slice(0, 10));
      setDescription('');
      setPaymentMethod(settings.defaultPaymentMethod || 'Cash');
      setErrors({});
    }
  }, [transactionToEdit, defaultType, isOpen, settings.defaultPaymentMethod]);

  const handleTypeChange = (newType: TransactionType) => {
    setType(newType);
    const newCategories = newType === 'income' ? DEFAULT_INCOME_CATEGORIES : DEFAULT_EXPENSE_CATEGORIES;
    setCategory(newCategories[0]);
    if (errors.category) {
      setErrors((prev) => ({ ...prev, category: undefined }));
    }
  };

  const validate = (): boolean => {
    const newErrors: { amount?: string; category?: string; date?: string } = {};
    const parsedAmount = parseFloat(amount);

    if (!amount || isNaN(parsedAmount) || parsedAmount <= 0) {
      newErrors.amount = 'Amount must be a positive number greater than zero.';
    }
    if (!category.trim()) {
      newErrors.category = 'Please select or enter a category.';
    }
    if (!date) {
      newErrors.date = 'Date is required.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    const parsedAmount = Math.round(parseFloat(amount) * 100) / 100;

    if (transactionToEdit) {
      await updateTransaction({
        ...transactionToEdit,
        type,
        amount: parsedAmount,
        category: category.trim(),
        date,
        description: description.trim() || undefined,
        paymentMethod: paymentMethod || undefined,
      });
    } else {
      await addTransaction({
        type,
        amount: parsedAmount,
        category: category.trim(),
        date,
        description: description.trim() || undefined,
        paymentMethod: paymentMethod || undefined,
      });
    }

    onClose();
  };

  const categoriesToOffer = React.useMemo(() => {
    if (type === 'income') {
      return [...DEFAULT_INCOME_CATEGORIES];
    }
    if (settings.studentModeEnabled) {
      const set = new Set([...STUDENT_CATEGORIES, ...DEFAULT_EXPENSE_CATEGORIES]);
      return Array.from(set);
    }
    return [...DEFAULT_EXPENSE_CATEGORIES];
  }, [type, settings.studentModeEnabled]);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={transactionToEdit ? 'Edit Transaction' : 'Record Transaction'}
      description="Keep your personal finances up to date."
      maxWidth="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Type Selector (Segmented control) */}
        <div>
          <label className="block text-xs font-bold text-[#1F2937] mb-1.5">
            Transaction Type
          </label>
          <div className="grid grid-cols-2 gap-2 p-1 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl">
            <button
              type="button"
              onClick={() => handleTypeChange('expense')}
              className={`py-2 text-xs font-bold rounded-lg transition-all ${
                type === 'expense'
                  ? 'bg-white text-[#DC2626] shadow-2xs'
                  : 'text-[#475569] hover:text-[#DC2626]'
              }`}
            >
              Expense (-)
            </button>
            <button
              type="button"
              onClick={() => handleTypeChange('income')}
              className={`py-2 text-xs font-bold rounded-lg transition-all ${
                type === 'income'
                  ? 'bg-white text-[#047857] shadow-2xs'
                  : 'text-[#475569] hover:text-[#047857]'
              }`}
            >
              Income (+)
            </button>
          </div>
        </div>

        {/* Amount Input */}
        <div>
          <label
            htmlFor="tx-amount"
            className="block text-xs font-bold text-[#1F2937] mb-1"
          >
            Amount ({settings.currency}) *
          </label>
          <div className="relative">
            <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-[#64748B] font-tabular font-bold">
              {settings.currency}
            </span>
            <input
              id="tx-amount"
              type="number"
              step="0.01"
              min="0.01"
              value={amount}
              onChange={(e) => {
                setAmount(e.target.value);
                if (errors.amount) setErrors((prev) => ({ ...prev, amount: undefined }));
              }}
              placeholder="0.00"
              className="w-full pl-9 pr-3.5 py-2.5 text-sm font-tabular rounded-xl border border-[#CBD5E1] bg-white text-[#1F2937] focus:outline-hidden focus:ring-2 focus:ring-[#047857] shadow-2xs"
              autoFocus
            />
          </div>
          {errors.amount && (
            <p className="text-xs text-[#DC2626] mt-1 font-medium">{errors.amount}</p>
          )}
        </div>

        {/* Category & Date Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          <div>
            <label
              htmlFor="tx-category"
              className="block text-xs font-bold text-[#1F2937] mb-1"
            >
              Category *
            </label>
            <select
              id="tx-category"
              value={category}
              onChange={(e) => {
                setCategory(e.target.value);
                if (errors.category) setErrors((prev) => ({ ...prev, category: undefined }));
              }}
              className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-[#CBD5E1] bg-white text-[#1F2937] focus:outline-hidden focus:ring-2 focus:ring-[#047857] shadow-2xs"
            >
              {categoriesToOffer.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
            {errors.category && (
              <p className="text-xs text-[#DC2626] mt-1 font-medium">{errors.category}</p>
            )}
          </div>

          <div>
            <label
              htmlFor="tx-date"
              className="block text-xs font-bold text-[#1F2937] mb-1"
            >
              Date *
            </label>
            <input
              id="tx-date"
              type="date"
              value={date}
              onChange={(e) => {
                setDate(e.target.value);
                if (errors.date) setErrors((prev) => ({ ...prev, date: undefined }));
              }}
              className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-[#CBD5E1] bg-white text-[#1F2937] focus:outline-hidden focus:ring-2 focus:ring-[#047857] shadow-2xs"
            />
            {errors.date && (
              <p className="text-xs text-[#DC2626] mt-1 font-medium">{errors.date}</p>
            )}
          </div>
        </div>

        {/* Payment Method */}
        <div>
          <label
            htmlFor="tx-payment"
            className="block text-xs font-bold text-[#1F2937] mb-1"
          >
            Payment Method
          </label>
          <select
            id="tx-payment"
            value={paymentMethod}
            onChange={(e) => setPaymentMethod(e.target.value)}
            className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-[#CBD5E1] bg-white text-[#1F2937] focus:outline-hidden focus:ring-2 focus:ring-[#047857] shadow-2xs"
          >
            {PAYMENT_METHODS.map((pm) => (
              <option key={pm} value={pm}>
                {pm}
              </option>
            ))}
          </select>
        </div>

        {/* Note / Description */}
        <div>
          <label
            htmlFor="tx-note"
            className="block text-xs font-bold text-[#1F2937] mb-1"
          >
            Description / Note (Optional)
          </label>
          <input
            id="tx-note"
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="e.g. Grocery store, course textbook, bus pass"
            maxLength={100}
            className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-[#CBD5E1] bg-white text-[#1F2937] focus:outline-hidden focus:ring-2 focus:ring-[#047857] shadow-2xs"
          />
        </div>

        {/* Modal Actions */}
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
            {transactionToEdit ? 'Save Changes' : 'Add Transaction'}
          </button>
        </div>
      </form>
    </Modal>
  );
};
