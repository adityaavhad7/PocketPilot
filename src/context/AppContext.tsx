import React, { createContext, useContext, useEffect, useState, useCallback, useMemo } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db, getSetting, setSetting, DEFAULT_SETTINGS, clearAllLocalData } from '../storage/db';
import { getSampleData } from '../storage/sampleData';
import type { Transaction, Budget, SavingsGoal, UserSettings, NavTab, ThemeId } from '../types';
import { getCurrentMonthKey } from '../utils/formatters';
import { THEMES, getThemeConfig, type ThemeDefinition } from '../utils/theme';
import { useAuth } from './AuthContext';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import {
  toSupabaseTransaction,
  fromSupabaseTransaction,
  toSupabaseBudget,
  fromSupabaseBudget,
  toSupabaseGoal,
  fromSupabaseGoal,
  toSupabaseSettings,
  fromSupabaseSettings,
} from '../lib/mappers';

export interface LocalDataCounts {
  transactions: number;
  budgets: number;
  goals: number;
  total: number;
}

interface AppContextValue {
  transactions: Transaction[];
  budgets: Budget[];
  goals: SavingsGoal[];
  settings: UserSettings;
  themeConfig: ThemeDefinition;
  activeTab: NavTab;
  selectedMonth: string;
  isInitialized: boolean;
  isCloudMode: boolean;
  isCloudSyncing: boolean;
  cloudSyncError: string | null;
  localRecordsCount: LocalDataCounts;
  isAuthModalOpen: boolean;
  authModalMode: 'signin' | 'signup';
  openAuthModal: (mode?: 'signin' | 'signup') => void;
  closeAuthModal: () => void;
  refreshCloudData: () => Promise<void>;
  importLocalDataToCloud: () => Promise<{ success: boolean; importedCount: number; error?: string }>;
  setActiveTab: (tab: NavTab) => void;
  setSelectedMonth: (month: string) => void;
  setTheme: (themeId: ThemeId) => Promise<void>;
  updateSettings: (newSettings: Partial<UserSettings>) => Promise<void>;
  addTransaction: (tx: Omit<Transaction, 'id' | 'createdAt' | 'updatedAt'>) => Promise<string>;
  updateTransaction: (tx: Transaction) => Promise<void>;
  deleteTransaction: (id: string) => Promise<void>;
  addBudget: (budget: Omit<Budget, 'id' | 'createdAt' | 'updatedAt'>) => Promise<string>;
  updateBudget: (budget: Budget) => Promise<void>;
  deleteBudget: (id: string) => Promise<void>;
  addGoal: (goal: Omit<SavingsGoal, 'id' | 'createdAt' | 'updatedAt'>) => Promise<string>;
  updateGoal: (goal: SavingsGoal) => Promise<void>;
  adjustGoalSavedAmount: (id: string, delta: number) => Promise<void>;
  deleteGoal: (id: string) => Promise<void>;
  clearAllData: () => Promise<void>;
  loadSampleData: () => Promise<void>;
}

const AppContext = createContext<AppContextValue | null>(null);

function applyThemeToDom(themeId: ThemeId) {
  if (typeof document !== 'undefined') {
    document.documentElement.setAttribute('data-theme', themeId);
    document.body.setAttribute('data-theme', themeId);
    document.documentElement.classList.remove('dark');
  }
}

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isLoading: isAuthLoading } = useAuth();

  const [activeTab, setActiveTab] = useState<NavTab>('dashboard');
  const [selectedMonth, setSelectedMonth] = useState<string>(getCurrentMonthKey());
  const [settings, setSettings] = useState<UserSettings>(DEFAULT_SETTINGS);
  const [isInitialized, setIsInitialized] = useState(false);

  // Cloud state
  const [cloudTransactions, setCloudTransactions] = useState<Transaction[]>([]);
  const [cloudBudgets, setCloudBudgets] = useState<Budget[]>([]);
  const [cloudGoals, setCloudGoals] = useState<SavingsGoal[]>([]);
  const [isCloudSyncing, setIsCloudSyncing] = useState<boolean>(false);
  const [cloudSyncError, setCloudSyncError] = useState<string | null>(null);
  const [localRecordsCount, setLocalRecordsCount] = useState<LocalDataCounts>({
    transactions: 0,
    budgets: 0,
    goals: 0,
    total: 0,
  });

  // Auth modal state
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<'signin' | 'signup'>('signin');

  const openAuthModal = useCallback((mode: 'signin' | 'signup' = 'signin') => {
    setAuthModalMode(mode);
    setIsAuthModalOpen(true);
  }, []);

  const closeAuthModal = useCallback(() => {
    setIsAuthModalOpen(false);
  }, []);

  const isCloudMode = Boolean(user && isSupabaseConfigured);

  // Live query from IndexedDB tables (active when in guest/offline mode or for import auditing)
  const localTransactions = useLiveQuery(() => db.transactions.toArray(), []) || [];
  const localBudgets = useLiveQuery(() => db.budgets.toArray(), []) || [];
  const localGoals = useLiveQuery(() => db.goals.toArray(), []) || [];

  // Count local records to check for eligible migration
  useEffect(() => {
    const txCount = localTransactions.length;
    const bgCount = localBudgets.length;
    const gCount = localGoals.length;
    setLocalRecordsCount({
      transactions: txCount,
      budgets: bgCount,
      goals: gCount,
      total: txCount + bgCount + gCount,
    });
  }, [localTransactions.length, localBudgets.length, localGoals.length]);

  // Determine active dataset based on mode
  const transactions = isCloudMode ? cloudTransactions : localTransactions;
  const budgets = isCloudMode ? cloudBudgets : localBudgets;
  const goals = isCloudMode ? cloudGoals : localGoals;

  // Theme configuration object
  const themeConfig = useMemo(() => {
    return getThemeConfig(settings.theme);
  }, [settings.theme]);

  // Fetch all cloud data for current user
  const refreshCloudData = useCallback(async () => {
    if (!user || !isSupabaseConfigured) return;

    setIsCloudSyncing(true);
    setCloudSyncError(null);

    try {
      // 1. Fetch user settings
      const { data: settingsData, error: settingsError } = await supabase
        .from('user_settings')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (settingsError) {
        console.warn('PocketPilot: Error loading user_settings from cloud:', settingsError.message);
      }

      if (settingsData) {
        const loadedSettings = fromSupabaseSettings(settingsData);
        applyThemeToDom(loadedSettings.theme);
        setSettings(loadedSettings);
      } else {
        // First login: initialize default settings row in Supabase
        const initial = toSupabaseSettings(DEFAULT_SETTINGS, user.id);
        const { error: insertError } = await supabase.from('user_settings').insert(initial);
        if (insertError) {
          console.warn('PocketPilot: Could not insert initial cloud settings:', insertError.message);
        }
        applyThemeToDom(DEFAULT_SETTINGS.theme);
        setSettings(DEFAULT_SETTINGS);
      }

      // 2. Fetch transactions
      const { data: txData, error: txError } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', user.id)
        .order('date', { ascending: false });

      if (txError) throw txError;
      setCloudTransactions((txData || []).map(fromSupabaseTransaction));

      // 3. Fetch budgets
      const { data: bgData, error: bgError } = await supabase
        .from('budgets')
        .select('*')
        .eq('user_id', user.id);

      if (bgError) throw bgError;
      setCloudBudgets((bgData || []).map(fromSupabaseBudget));

      // 4. Fetch savings goals
      const { data: gData, error: gError } = await supabase
        .from('savings_goals')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (gError) throw gError;
      setCloudGoals((gData || []).map(fromSupabaseGoal));
    } catch (err: any) {
      console.error('PocketPilot: Cloud data sync failure:', err);
      setCloudSyncError(err?.message || 'Failed to sync data with cloud database.');
    } finally {
      setIsCloudSyncing(false);
    }
  }, [user]);

  // Load initial settings (local or cloud)
  useEffect(() => {
    let isMounted = true;

    async function initialize() {
      if (isAuthLoading) return;

      if (isCloudMode && user) {
        await refreshCloudData();
        if (isMounted) setIsInitialized(true);
      } else {
        // Guest mode / offline: load from Dexie IndexedDB
        try {
          let currency = await getSetting<string>('currency', DEFAULT_SETTINGS.currency);
          if (currency !== '₹') {
            currency = '₹';
            await setSetting('currency', '₹');
          }

          const storedTheme = await getSetting<string>('theme', DEFAULT_SETTINGS.theme);
          const validTheme: ThemeId = storedTheme === 'midnight-luxe' ? 'midnight-luxe' : 'mint-minimal';

          applyThemeToDom(validTheme);

          const studentModeEnabled = await getSetting<boolean>(
            'studentModeEnabled',
            DEFAULT_SETTINGS.studentModeEnabled
          );
          const studentMonthlyAllowance = await getSetting<number>(
            'studentMonthlyAllowance',
            DEFAULT_SETTINGS.studentMonthlyAllowance
          );
          const defaultPaymentMethod = await getSetting<string>(
            'defaultPaymentMethod',
            DEFAULT_SETTINGS.defaultPaymentMethod
          );

          if (isMounted) {
            setSettings({
              currency: '₹',
              studentModeEnabled,
              studentMonthlyAllowance,
              defaultPaymentMethod,
              theme: validTheme,
            });
            setIsInitialized(true);
          }
        } catch (err) {
          console.error('Failed to initialize local settings:', err);
          applyThemeToDom('mint-minimal');
          if (isMounted) setIsInitialized(true);
        }
      }
    }

    initialize();

    return () => {
      isMounted = false;
    };
  }, [isAuthLoading, isCloudMode, user, refreshCloudData]);

  // Safe one-time import of local IndexedDB data into Supabase
  const importLocalDataToCloud = useCallback(async () => {
    if (!user || !isSupabaseConfigured) {
      return { success: false, importedCount: 0, error: 'User is not authenticated with Supabase.' };
    }

    try {
      setIsCloudSyncing(true);

      const localTxs = await db.transactions.toArray();
      const localBgs = await db.budgets.toArray();
      const localGls = await db.goals.toArray();

      let imported = 0;

      // 1. Bulk upsert transactions
      if (localTxs.length > 0) {
        const rows = localTxs.map((tx) => toSupabaseTransaction(tx, user.id));
        const { error } = await supabase.from('transactions').upsert(rows, { onConflict: 'id' });
        if (error) throw error;
        imported += localTxs.length;
      }

      // 2. Bulk upsert budgets
      if (localBgs.length > 0) {
        const rows = localBgs.map((b) => toSupabaseBudget(b, user.id));
        const { error } = await supabase.from('budgets').upsert(rows, { onConflict: 'id' });
        if (error) throw error;
        imported += localBgs.length;
      }

      // 3. Bulk upsert savings goals
      if (localGls.length > 0) {
        const rows = localGls.map((g) => toSupabaseGoal(g, user.id));
        const { error } = await supabase.from('savings_goals').upsert(rows, { onConflict: 'id' });
        if (error) throw error;
        imported += localGls.length;
      }

      // 4. Mark local imported in cloud settings
      await supabase.from('user_settings').upsert(
        {
          user_id: user.id,
          has_imported_local: true,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'user_id' }
      );

      setSettings((prev) => ({ ...prev, hasImportedLocal: true }));

      // Reload fresh cloud data
      await refreshCloudData();

      return { success: true, importedCount: imported };
    } catch (err: any) {
      console.error('Failed to import local data into cloud:', err);
      return { success: false, importedCount: 0, error: err?.message || 'Import failed.' };
    } finally {
      setIsCloudSyncing(false);
    }
  }, [user, refreshCloudData]);

  // Update Settings
  const updateSettings = useCallback(
    async (newSettings: Partial<UserSettings>) => {
      if (newSettings.theme) {
        applyThemeToDom(newSettings.theme);
      }

      // Ensure currency remains locked to INR (₹)
      const sanitized: Partial<UserSettings> = {
        ...newSettings,
        currency: '₹',
      };

      setSettings((prev) => ({ ...prev, ...sanitized }));

      if (isCloudMode && user) {
        const payload = toSupabaseSettings(
          {
            ...settings,
            ...sanitized,
          },
          user.id
        );
        const { error } = await supabase
          .from('user_settings')
          .upsert(payload, { onConflict: 'user_id' });
        if (error) {
          console.error('Error updating cloud settings:', error);
        }
      } else {
        for (const [key, val] of Object.entries(sanitized)) {
          await setSetting(key, val);
        }
      }
    },
    [isCloudMode, user, settings]
  );

  const setTheme = useCallback(
    async (themeId: ThemeId) => {
      applyThemeToDom(themeId);
      await updateSettings({ theme: themeId });
    },
    [updateSettings]
  );

  // Transactions management
  const addTransaction = useCallback(
    async (txData: Omit<Transaction, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> => {
      const id = 'tx-' + Date.now() + '-' + Math.random().toString(36).substring(2, 7);
      const nowIso = new Date().toISOString();
      const newTx: Transaction = {
        ...txData,
        id,
        createdAt: nowIso,
        updatedAt: nowIso,
      };

      if (isCloudMode && user) {
        const row = toSupabaseTransaction(newTx, user.id);
        const { error } = await supabase.from('transactions').insert(row);
        if (error) throw error;
        setCloudTransactions((prev) => [newTx, ...prev]);
      } else {
        await db.transactions.add(newTx);
      }

      return id;
    },
    [isCloudMode, user]
  );

  const updateTransaction = useCallback(
    async (tx: Transaction) => {
      const updatedTx: Transaction = {
        ...tx,
        updatedAt: new Date().toISOString(),
      };

      if (isCloudMode && user) {
        const row = toSupabaseTransaction(updatedTx, user.id);
        const { error } = await supabase.from('transactions').update(row).eq('id', tx.id);
        if (error) throw error;
        setCloudTransactions((prev) => prev.map((t) => (t.id === tx.id ? updatedTx : t)));
      } else {
        await db.transactions.put(updatedTx);
      }
    },
    [isCloudMode, user]
  );

  const deleteTransaction = useCallback(
    async (id: string) => {
      if (isCloudMode && user) {
        const { error } = await supabase.from('transactions').delete().eq('id', id);
        if (error) throw error;
        setCloudTransactions((prev) => prev.filter((t) => t.id !== id));
      } else {
        await db.transactions.delete(id);
      }
    },
    [isCloudMode, user]
  );

  // Budgets management
  const addBudget = useCallback(
    async (bData: Omit<Budget, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> => {
      const id = 'bg-' + Date.now() + '-' + Math.random().toString(36).substring(2, 7);
      const nowIso = new Date().toISOString();
      const newBudget: Budget = {
        ...bData,
        id,
        createdAt: nowIso,
        updatedAt: nowIso,
      };

      if (isCloudMode && user) {
        const row = toSupabaseBudget(newBudget, user.id);
        const { error } = await supabase.from('budgets').insert(row);
        if (error) throw error;
        setCloudBudgets((prev) => [...prev, newBudget]);
      } else {
        await db.budgets.add(newBudget);
      }

      return id;
    },
    [isCloudMode, user]
  );

  const updateBudget = useCallback(
    async (budget: Budget) => {
      const updated: Budget = {
        ...budget,
        updatedAt: new Date().toISOString(),
      };

      if (isCloudMode && user) {
        const row = toSupabaseBudget(updated, user.id);
        const { error } = await supabase.from('budgets').update(row).eq('id', budget.id);
        if (error) throw error;
        setCloudBudgets((prev) => prev.map((b) => (b.id === budget.id ? updated : b)));
      } else {
        await db.budgets.put(updated);
      }
    },
    [isCloudMode, user]
  );

  const deleteBudget = useCallback(
    async (id: string) => {
      if (isCloudMode && user) {
        const { error } = await supabase.from('budgets').delete().eq('id', id);
        if (error) throw error;
        setCloudBudgets((prev) => prev.filter((b) => b.id !== id));
      } else {
        await db.budgets.delete(id);
      }
    },
    [isCloudMode, user]
  );

  // Savings Goals management
  const addGoal = useCallback(
    async (gData: Omit<SavingsGoal, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> => {
      const id = 'sg-' + Date.now() + '-' + Math.random().toString(36).substring(2, 7);
      const nowIso = new Date().toISOString();
      const newGoal: SavingsGoal = {
        ...gData,
        id,
        createdAt: nowIso,
        updatedAt: nowIso,
      };

      if (isCloudMode && user) {
        const row = toSupabaseGoal(newGoal, user.id);
        const { error } = await supabase.from('savings_goals').insert(row);
        if (error) throw error;
        setCloudGoals((prev) => [newGoal, ...prev]);
      } else {
        await db.goals.add(newGoal);
      }

      return id;
    },
    [isCloudMode, user]
  );

  const updateGoal = useCallback(
    async (goal: SavingsGoal) => {
      const updated: SavingsGoal = {
        ...goal,
        updatedAt: new Date().toISOString(),
      };

      if (isCloudMode && user) {
        const row = toSupabaseGoal(updated, user.id);
        const { error } = await supabase.from('savings_goals').update(row).eq('id', goal.id);
        if (error) throw error;
        setCloudGoals((prev) => prev.map((g) => (g.id === goal.id ? updated : g)));
      } else {
        await db.goals.put(updated);
      }
    },
    [isCloudMode, user]
  );

  const adjustGoalSavedAmount = useCallback(
    async (id: string, delta: number) => {
      if (isCloudMode && user) {
        const existing = cloudGoals.find((g) => g.id === id);
        if (!existing) return;
        const current = Number(existing.currentSavedAmount) || 0;
        const nextSaved = Math.max(0, current + delta);
        const nowIso = new Date().toISOString();

        const { error } = await supabase
          .from('savings_goals')
          .update({
            current_saved_amount: nextSaved,
            updated_at: nowIso,
          })
          .eq('id', id);

        if (error) throw error;
        setCloudGoals((prev) =>
          prev.map((g) =>
            g.id === id ? { ...g, currentSavedAmount: nextSaved, updatedAt: nowIso } : g
          )
        );
      } else {
        const existing = await db.goals.get(id);
        if (!existing) return;
        const current = Number(existing.currentSavedAmount) || 0;
        const nextSaved = Math.max(0, current + delta);
        await db.goals.update(id, {
          currentSavedAmount: nextSaved,
          updatedAt: new Date().toISOString(),
        });
      }
    },
    [isCloudMode, user, cloudGoals]
  );

  const deleteGoal = useCallback(
    async (id: string) => {
      if (isCloudMode && user) {
        const { error } = await supabase.from('savings_goals').delete().eq('id', id);
        if (error) throw error;
        setCloudGoals((prev) => prev.filter((g) => g.id !== id));
      } else {
        await db.goals.delete(id);
      }
    },
    [isCloudMode, user]
  );

  // Data reset & sample load
  const clearAllData = useCallback(async () => {
    if (isCloudMode && user) {
      await supabase.from('transactions').delete().eq('user_id', user.id);
      await supabase.from('budgets').delete().eq('user_id', user.id);
      await supabase.from('savings_goals').delete().eq('user_id', user.id);
      setCloudTransactions([]);
      setCloudBudgets([]);
      setCloudGoals([]);
      await updateSettings(DEFAULT_SETTINGS);
    } else {
      await clearAllLocalData();
      applyThemeToDom(DEFAULT_SETTINGS.theme);
      setSettings(DEFAULT_SETTINGS);
    }
  }, [isCloudMode, user, updateSettings]);

  const loadSampleData = useCallback(async () => {
    const sample = getSampleData();

    if (isCloudMode && user) {
      setIsCloudSyncing(true);
      try {
        // Clear existing cloud records for this user
        await supabase.from('transactions').delete().eq('user_id', user.id);
        await supabase.from('budgets').delete().eq('user_id', user.id);
        await supabase.from('savings_goals').delete().eq('user_id', user.id);

        // Bulk insert sample records
        const txRows = sample.transactions.map((tx) => toSupabaseTransaction(tx, user.id));
        const bgRows = sample.budgets.map((b) => toSupabaseBudget(b, user.id));
        const gRows = sample.goals.map((g) => toSupabaseGoal(g, user.id));

        await supabase.from('transactions').insert(txRows);
        await supabase.from('budgets').insert(bgRows);
        await supabase.from('savings_goals').insert(gRows);

        await refreshCloudData();
      } finally {
        setIsCloudSyncing(false);
      }
    } else {
      await db.transaction('rw', db.transactions, db.budgets, db.goals, async () => {
        await db.transactions.clear();
        await db.budgets.clear();
        await db.goals.clear();
        await db.transactions.bulkAdd(sample.transactions);
        await db.budgets.bulkAdd(sample.budgets);
        await db.goals.bulkAdd(sample.goals);
      });
    }
  }, [isCloudMode, user, refreshCloudData]);

  return (
    <AppContext.Provider
      value={{
        transactions,
        budgets,
        goals,
        settings,
        themeConfig,
        activeTab,
        selectedMonth,
        isInitialized,
        isCloudMode,
        isCloudSyncing,
        cloudSyncError,
        localRecordsCount,
        isAuthModalOpen,
        authModalMode,
        openAuthModal,
        closeAuthModal,
        refreshCloudData,
        importLocalDataToCloud,
        setActiveTab,
        setSelectedMonth,
        setTheme,
        updateSettings,
        addTransaction,
        updateTransaction,
        deleteTransaction,
        addBudget,
        updateBudget,
        deleteBudget,
        addGoal,
        updateGoal,
        adjustGoalSavedAmount,
        deleteGoal,
        clearAllData,
        loadSampleData,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export function usePocketPilot(): AppContextValue {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('usePocketPilot must be used within an AppProvider');
  }
  return context;
}
