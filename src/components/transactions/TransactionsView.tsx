import React, { useState, useMemo } from 'react';
import { usePocketPilot } from '../../context/AppContext';
import type { Transaction, TransactionType } from '../../types';
import {
  formatCurrency,
  formatDate,
  getCurrentMonthKey,
  getMonthLabel,
} from '../../utils/formatters';
import {
  Search,
  Plus,
  Filter,
  ArrowUpDown,
  Edit2,
  Trash2,
  ArrowUpRight,
  ArrowDownLeft,
  Calendar,
  X,
  Sparkles,
} from 'lucide-react';
import { ConfirmDialog } from '../ui/ConfirmDialog';
import { EmptyState } from '../ui/EmptyState';

interface TransactionsViewProps {
  onOpenAddTransaction: () => void;
  onEditTransaction: (tx: Transaction) => void;
}

export const TransactionsView: React.FC<TransactionsViewProps> = ({
  onOpenAddTransaction,
  onEditTransaction,
}) => {
  const { transactions, deleteTransaction, settings, selectedMonth } = usePocketPilot();

  // Search, filter, and sorting states
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | TransactionType>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [monthFilter, setMonthFilter] = useState<string>(selectedMonth);
  const [sortBy, setSortBy] = useState<'date-desc' | 'date-asc' | 'amount-desc' | 'amount-asc'>('date-desc');

  // Deletion confirmation
  const [txToDelete, setTxToDelete] = useState<Transaction | null>(null);

  // Collect distinct categories from transactions
  const uniqueCategories = useMemo(() => {
    const set = new Set<string>();
    transactions.forEach((tx) => {
      if (tx.category) set.add(tx.category);
    });
    return Array.from(set).sort();
  }, [transactions]);

  // Distinct months available
  const availableMonths = useMemo(() => {
    const set = new Set<string>();
    transactions.forEach((tx) => {
      if (tx.date && tx.date.length >= 7) {
        set.add(tx.date.substring(0, 7));
      }
    });
    set.add(getCurrentMonthKey());
    return Array.from(set).sort().reverse();
  }, [transactions]);

  // Filtered and sorted transactions
  const filteredTransactions = useMemo(() => {
    return transactions
      .filter((tx) => {
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchesDesc = tx.description?.toLowerCase().includes(q);
          const matchesCat = tx.category.toLowerCase().includes(q);
          const matchesMethod = tx.paymentMethod?.toLowerCase().includes(q);
          const matchesAmount = tx.amount.toString().includes(q);
          if (!matchesDesc && !matchesCat && !matchesMethod && !matchesAmount) {
            return false;
          }
        }

        if (typeFilter !== 'all' && tx.type !== typeFilter) {
          return false;
        }

        if (categoryFilter !== 'all' && tx.category.toLowerCase() !== categoryFilter.toLowerCase()) {
          return false;
        }

        if (monthFilter !== 'all' && (!tx.date || !tx.date.startsWith(monthFilter))) {
          return false;
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'date-desc') {
          return new Date(b.date).getTime() - new Date(a.date).getTime();
        }
        if (sortBy === 'date-asc') {
          return new Date(a.date).getTime() - new Date(b.date).getTime();
        }
        if (sortBy === 'amount-desc') {
          return b.amount - a.amount;
        }
        if (sortBy === 'amount-asc') {
          return a.amount - b.amount;
        }
        return 0;
      });
  }, [transactions, searchQuery, typeFilter, categoryFilter, monthFilter, sortBy]);

  // Summary statistics for the filtered list
  const filteredTotals = useMemo(() => {
    let income = 0;
    let expense = 0;
    for (const tx of filteredTransactions) {
      if (tx.type === 'income') {
        income += Number(tx.amount) || 0;
      } else {
        expense += Number(tx.amount) || 0;
      }
    }
    return {
      income,
      expense,
      net: income - expense,
      count: filteredTransactions.length,
    };
  }, [filteredTransactions]);

  const resetFilters = () => {
    setSearchQuery('');
    setTypeFilter('all');
    setCategoryFilter('all');
    setMonthFilter('all');
    setSortBy('date-desc');
  };

  const hasActiveFilters =
    searchQuery !== '' || typeFilter !== 'all' || categoryFilter !== 'all' || monthFilter !== 'all';

  return (
    <div className="space-y-6">
      {/* Title & Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[#1F2937]">
            Transaction Ledger
          </h1>
          <p className="text-xs sm:text-sm font-medium text-[#475569] mt-0.5">
            View, search, edit, and organize all income and expenses
          </p>
        </div>

        <button
          type="button"
          onClick={onOpenAddTransaction}
          className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-[#047857] hover:bg-[#065f46] rounded-xl transition-all shadow-xs hover:shadow-sm focus-visible:ring-2 focus-visible:ring-[#047857] focus:outline-hidden whitespace-nowrap self-start sm:self-auto active:scale-[0.98]"
        >
          <Plus className="w-4 h-4" />
          <span>New Transaction</span>
        </button>
      </div>

      {/* Filter and Control Bar */}
      <div className="p-4 sm:p-5 rounded-2xl border border-[#E2E8F0] bg-white shadow-xs space-y-3.5">
        {/* Row 1: Search & Type Tabs */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          {/* Search box */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-[#64748B] absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search description, category, payment method..."
              className="w-full pl-10 pr-9 py-2 text-xs rounded-xl border border-[#CBD5E1] bg-white text-[#1F2937] focus:outline-hidden focus:ring-2 focus:ring-[#047857] transition-colors"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#64748B] hover:text-[#1F2937]"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Type Segmented Control */}
          <div className="flex items-center p-1 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl shrink-0">
            <button
              type="button"
              onClick={() => setTypeFilter('all')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                typeFilter === 'all'
                  ? 'bg-white text-[#1F2937] shadow-2xs'
                  : 'text-[#475569] hover:text-[#1F2937]'
              }`}
            >
              All Types
            </button>
            <button
              type="button"
              onClick={() => setTypeFilter('expense')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                typeFilter === 'expense'
                  ? 'bg-white text-[#DC2626] shadow-2xs font-bold'
                  : 'text-[#475569] hover:text-[#DC2626]'
              }`}
            >
              Expenses
            </button>
            <button
              type="button"
              onClick={() => setTypeFilter('income')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                typeFilter === 'income'
                  ? 'bg-white text-[#047857] shadow-2xs font-bold'
                  : 'text-[#475569] hover:text-[#047857]'
              }`}
            >
              Income
            </button>
          </div>
        </div>

        {/* Row 2: Secondary Dropdowns (Category, Month, Sort) */}
        <div className="flex flex-wrap items-center gap-2.5 pt-2 border-t border-[#E2E8F0] text-xs">
          {/* Category Dropdown */}
          <div className="flex items-center gap-1.5 bg-[#F8FAFC] border border-[#CBD5E1] rounded-xl px-3 py-1.5 shadow-2xs">
            <Filter className="w-3.5 h-3.5 text-[#64748B]" />
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="bg-transparent border-none text-xs text-[#1F2937] font-medium focus:outline-hidden cursor-pointer"
              aria-label="Filter by category"
            >
              <option value="all" className="bg-white">All Categories</option>
              {uniqueCategories.map((c) => (
                <option key={c} value={c} className="bg-white">
                  {c}
                </option>
              ))}
            </select>
          </div>

          {/* Month Dropdown */}
          <div className="flex items-center gap-1.5 bg-[#F8FAFC] border border-[#CBD5E1] rounded-xl px-3 py-1.5 shadow-2xs">
            <Calendar className="w-3.5 h-3.5 text-[#64748B]" />
            <select
              value={monthFilter}
              onChange={(e) => setMonthFilter(e.target.value)}
              className="bg-transparent border-none text-xs text-[#1F2937] font-medium focus:outline-hidden cursor-pointer"
              aria-label="Filter by month"
            >
              <option value="all" className="bg-white">All Months</option>
              {availableMonths.map((m) => (
                <option key={m} value={m} className="bg-white">
                  {getMonthLabel(m)}
                </option>
              ))}
            </select>
          </div>

          {/* Sort By Dropdown */}
          <div className="flex items-center gap-1.5 bg-[#F8FAFC] border border-[#CBD5E1] rounded-xl px-3 py-1.5 ml-auto shadow-2xs">
            <ArrowUpDown className="w-3.5 h-3.5 text-[#64748B]" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="bg-transparent border-none text-xs text-[#1F2937] font-medium focus:outline-hidden cursor-pointer"
              aria-label="Sort transactions"
            >
              <option value="date-desc" className="bg-white">Date (Newest First)</option>
              <option value="date-asc" className="bg-white">Date (Oldest First)</option>
              <option value="amount-desc" className="bg-white">Amount (Highest First)</option>
              <option value="amount-asc" className="bg-white">Amount (Lowest First)</option>
            </select>
          </div>

          {/* Reset Filters button if any active */}
          {hasActiveFilters && (
            <button
              type="button"
              onClick={resetFilters}
              className="text-xs text-[#047857] hover:underline font-semibold px-1 py-1"
            >
              Reset Filters
            </button>
          )}
        </div>
      </div>

      {/* Summary strip of matching transactions */}
      {filteredTransactions.length > 0 && (
        <div className="flex flex-wrap items-center justify-between text-xs px-2 text-[#475569]">
          <span>
            Showing <strong className="text-[#1F2937] font-tabular">{filteredTransactions.length}</strong> transactions
          </span>
          <div className="flex items-center gap-4 font-tabular">
            <span>
              Income: <strong className="text-[#047857]">+{formatCurrency(filteredTotals.income, settings.currency)}</strong>
            </span>
            <span>
              Expenses: <strong className="text-[#DC2626]">-{formatCurrency(filteredTotals.expense, settings.currency)}</strong>
            </span>
            <span>
              Net: <strong className="text-[#1F2937]">{formatCurrency(filteredTotals.net, settings.currency)}</strong>
            </span>
          </div>
        </div>
      )}

      {/* Transactions Table / List */}
      <div className="rounded-2xl border border-[#E2E8F0] bg-white shadow-xs overflow-hidden">
        {filteredTransactions.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#F8FAFC] border-b border-[#E2E8F0] text-[#475569] font-semibold">
                <tr>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Type</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Description</th>
                  <th className="py-3 px-4 hidden md:table-cell">Payment Method</th>
                  <th className="py-3 px-4 text-right">Amount</th>
                  <th className="py-3 px-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E2E8F0]/70">
                {filteredTransactions.map((tx) => {
                  const isIncome = tx.type === 'income';

                  return (
                    <tr
                      key={tx.id}
                      className="hover:bg-[#F8FAFC] transition-colors"
                    >
                      <td className="py-3 px-4 whitespace-nowrap text-[#475569] font-medium">
                        {formatDate(tx.date)}
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center gap-1 font-bold ${
                            isIncome ? 'text-[#047857]' : 'text-[#DC2626]'
                          }`}
                        >
                          {isIncome ? (
                            <ArrowDownLeft className="w-3.5 h-3.5" />
                          ) : (
                            <ArrowUpRight className="w-3.5 h-3.5" />
                          )}
                          <span>{isIncome ? 'Income' : 'Expense'}</span>
                        </span>
                      </td>
                      <td className="py-3 px-4 font-semibold text-[#1F2937] whitespace-nowrap">
                        {tx.category}
                      </td>
                      <td className="py-3 px-4 text-[#475569] max-w-xs truncate">
                        {tx.description || <span className="text-[#94A3B8]">—</span>}
                      </td>
                      <td className="py-3 px-4 text-[#64748B] hidden md:table-cell whitespace-nowrap">
                        {tx.paymentMethod || 'Cash'}
                      </td>
                      <td
                        className={`py-3 px-4 text-right font-tabular font-bold whitespace-nowrap ${
                          isIncome ? 'text-[#047857]' : 'text-[#DC2626]'
                        }`}
                      >
                        {isIncome ? '+' : '-'}
                        {formatCurrency(tx.amount, settings.currency)}
                      </td>
                      <td className="py-3 px-4 text-center whitespace-nowrap">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => onEditTransaction(tx)}
                            className="p-1.5 text-[#64748B] hover:text-[#047857] rounded-lg hover:bg-[#D1FAE5]/40 transition-colors"
                            aria-label={`Edit transaction ${tx.category} ${formatCurrency(tx.amount, settings.currency)}`}
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => setTxToDelete(tx)}
                            className="p-1.5 text-[#64748B] hover:text-[#DC2626] rounded-lg hover:bg-red-50 transition-colors"
                            aria-label={`Delete transaction ${tx.category} ${formatCurrency(tx.amount, settings.currency)}`}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-8">
            <EmptyState
              icon={transactions.length === 0 ? Sparkles : Search}
              title={
                transactions.length === 0
                  ? 'No Transactions Yet'
                  : 'No Matching Transactions'
              }
              description={
                transactions.length === 0
                  ? 'Add your first transaction to start keeping track of your income and spending.'
                  : 'No transactions found matching your current search and filter criteria.'
              }
              actionLabel={
                transactions.length === 0 ? 'Add Transaction' : 'Clear Filters'
              }
              onAction={
                transactions.length === 0 ? onOpenAddTransaction : resetFilters
              }
            />
          </div>
        )}
      </div>

      {/* Confirmation Dialog for Transaction Deletion */}
      <ConfirmDialog
        isOpen={!!txToDelete}
        onClose={() => setTxToDelete(null)}
        onConfirm={async () => {
          if (txToDelete) {
            await deleteTransaction(txToDelete.id);
            setTxToDelete(null);
          }
        }}
        title="Delete Transaction"
        message={
          txToDelete
            ? `Are you sure you want to delete this ${txToDelete.type} record for ${txToDelete.category} (${formatCurrency(txToDelete.amount, settings.currency)})? This action cannot be undone.`
            : ''
        }
        confirmLabel="Delete"
        isDestructive={true}
      />
    </div>
  );
};
