import React, { useState } from 'react';
import { AuthProvider } from './context/AuthContext';
import { AppProvider, usePocketPilot } from './context/AppContext';
import { Navbar } from './components/layout/Navbar';
import { Sidebar } from './components/layout/Sidebar';
import { MobileNav } from './components/layout/MobileNav';

import { DashboardView } from './components/dashboard/DashboardView';
import { TransactionsView } from './components/transactions/TransactionsView';
import { BudgetsView } from './components/budgets/BudgetsView';
import { ReportsView } from './components/reports/ReportsView';
import { SavingsGoalsView } from './components/goals/SavingsGoalsView';
import { StudentModeView } from './components/student/StudentModeView';
import { SettingsView } from './components/settings/SettingsView';

import { TransactionModal } from './components/transactions/TransactionModal';
import { BudgetModal } from './components/budgets/BudgetModal';
import { GoalModal } from './components/goals/GoalModal';
import { GoalAdjustmentModal } from './components/goals/GoalAdjustmentModal';
import { AuthModal } from './components/auth/AuthModal';

import type { Transaction, Budget, SavingsGoal, TransactionType } from './types';

const MainAppContent: React.FC = () => {
  const {
    activeTab,
    selectedMonth,
    isInitialized,
    isAuthModalOpen,
    closeAuthModal,
    authModalMode,
  } = usePocketPilot();

  // Modals state
  const [isTxModalOpen, setIsTxModalOpen] = useState(false);
  const [txToEdit, setTxToEdit] = useState<Transaction | null>(null);
  const [defaultTxType, setDefaultTxType] = useState<TransactionType>('expense');

  const [isBudgetModalOpen, setIsBudgetModalOpen] = useState(false);
  const [budgetToEdit, setBudgetToEdit] = useState<Budget | null>(null);

  const [isGoalModalOpen, setIsGoalModalOpen] = useState(false);
  const [goalToEdit, setGoalToEdit] = useState<SavingsGoal | null>(null);

  const [isGoalAdjModalOpen, setIsGoalAdjModalOpen] = useState(false);
  const [goalToAdjust, setGoalToAdjust] = useState<SavingsGoal | null>(null);

  // Handlers
  const handleOpenAddTx = (type: TransactionType = 'expense') => {
    setTxToEdit(null);
    setDefaultTxType(type);
    setIsTxModalOpen(true);
  };

  const handleEditTx = (tx: Transaction) => {
    setTxToEdit(tx);
    setDefaultTxType(tx.type);
    setIsTxModalOpen(true);
  };

  const handleOpenAddBudget = () => {
    setBudgetToEdit(null);
    setIsBudgetModalOpen(true);
  };

  const handleEditBudget = (b: Budget) => {
    setBudgetToEdit(b);
    setIsBudgetModalOpen(true);
  };

  const handleOpenAddGoal = () => {
    setGoalToEdit(null);
    setIsGoalModalOpen(true);
  };

  const handleEditGoal = (g: SavingsGoal) => {
    setGoalToEdit(g);
    setIsGoalModalOpen(true);
  };

  const handleAdjustGoal = (g: SavingsGoal) => {
    setGoalToAdjust(g);
    setIsGoalAdjModalOpen(true);
  };

  if (!isInitialized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white text-[#1F2937]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-[#D1FAE5] text-[#047857] flex items-center justify-center animate-pulse">
            <span className="font-bold text-lg">P</span>
          </div>
          <p className="text-xs font-semibold text-[#475569]">Loading PocketPilot...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col app-viewport-bg text-[#1F2937] selection:bg-[#D1FAE5] selection:text-[#047857]">
      {/* Top Navbar */}
      <Navbar onOpenNewTransaction={() => handleOpenAddTx('expense')} />

      {/* Main Workspace: Sidebar + Viewport */}
      <div className="flex-1 flex max-w-7xl w-full mx-auto">
        <Sidebar />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 pb-24 md:pb-12 min-w-0 overflow-y-auto app-viewport-bg">
          {activeTab === 'dashboard' && (
            <DashboardView
              onOpenAddTransaction={handleOpenAddTx}
              onOpenAddBudget={handleOpenAddBudget}
              onOpenAddGoal={handleOpenAddGoal}
            />
          )}

          {activeTab === 'transactions' && (
            <TransactionsView
              onOpenAddTransaction={() => handleOpenAddTx('expense')}
              onEditTransaction={handleEditTx}
            />
          )}

          {activeTab === 'budgets' && (
            <BudgetsView
              onOpenAddBudget={handleOpenAddBudget}
              onEditBudget={handleEditBudget}
            />
          )}

          {activeTab === 'reports' && <ReportsView />}

          {activeTab === 'goals' && (
            <SavingsGoalsView
              onOpenAddGoal={handleOpenAddGoal}
              onEditGoal={handleEditGoal}
              onAdjustGoal={handleAdjustGoal}
            />
          )}

          {activeTab === 'student' && (
            <StudentModeView
              onOpenAddTransaction={() => handleOpenAddTx('expense')}
            />
          )}

          {activeTab === 'settings' && <SettingsView />}
        </main>
      </div>

      {/* Mobile Bottom Navigation */}
      <MobileNav />

      {/* Modals */}
      <TransactionModal
        isOpen={isTxModalOpen}
        onClose={() => setIsTxModalOpen(false)}
        transactionToEdit={txToEdit}
        defaultType={defaultTxType}
      />

      <BudgetModal
        isOpen={isBudgetModalOpen}
        onClose={() => setIsBudgetModalOpen(false)}
        budgetToEdit={budgetToEdit}
        defaultMonth={selectedMonth}
      />

      <GoalModal
        isOpen={isGoalModalOpen}
        onClose={() => setIsGoalModalOpen(false)}
        goalToEdit={goalToEdit}
      />

      <GoalAdjustmentModal
        isOpen={isGoalAdjModalOpen}
        onClose={() => setIsGoalAdjModalOpen(false)}
        goal={goalToAdjust}
      />

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={closeAuthModal}
        defaultMode={authModalMode}
      />
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <AppProvider>
        <MainAppContent />
      </AppProvider>
    </AuthProvider>
  );
}
