import React, { useState } from 'react';
import { usePocketPilot } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import { PAYMENT_METHODS, APP_CURRENCY } from '../../types';
import { THEMES } from '../../utils/theme';
import {
  Database,
  Trash2,
  Sparkles,
  Info,
  ShieldCheck,
  Check,
  IndianRupee,
  Cloud,
  CloudUpload,
  User,
  LogOut,
  RefreshCw,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react';
import { ConfirmDialog } from '../ui/ConfirmDialog';

export const SettingsView: React.FC = () => {
  const {
    settings,
    themeConfig,
    setTheme,
    updateSettings,
    clearAllData,
    loadSampleData,
    transactions,
    budgets,
    goals,
    isCloudMode,
    isCloudSyncing,
    cloudSyncError,
    localRecordsCount,
    importLocalDataToCloud,
    refreshCloudData,
    openAuthModal,
  } = usePocketPilot();

  const { user, signOut, isConfigured } = useAuth();

  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [showSampleLoadedToast, setShowSampleLoadedToast] = useState(false);
  const [importingLocal, setImportingLocal] = useState(false);
  const [importToast, setImportToast] = useState<string | null>(null);

  const handlePaymentMethodChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    await updateSettings({ defaultPaymentMethod: e.target.value });
  };

  const handleLoadSample = async () => {
    await loadSampleData();
    setShowSampleLoadedToast(true);
    setTimeout(() => setShowSampleLoadedToast(false), 3000);
  };

  const handleImportLocal = async () => {
    setImportingLocal(true);
    const result = await importLocalDataToCloud();
    setImportingLocal(false);
    if (result.success) {
      setImportToast(`Successfully imported ${result.importedCount} local records to your cloud account!`);
      setTimeout(() => setImportToast(null), 4000);
    } else {
      setImportToast(result.error || 'Failed to import local data.');
      setTimeout(() => setImportToast(null), 4000);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Page Title */}
      <div>
        <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[#1F2937]">
          Preferences & Storage
        </h1>
        <p className="text-xs sm:text-sm font-medium text-[#475569] mt-0.5">
          Configure appearance themes, Supabase cloud sync, default payment methods, and local database storage
        </p>
      </div>

      {showSampleLoadedToast && (
        <div className="flex items-center gap-2 p-3.5 rounded-2xl bg-[#D1FAE5] border border-[#047857]/20 text-xs font-semibold text-[#047857]">
          <Check className="w-4 h-4 shrink-0" />
          <span>Realistic sample transactions, budgets, and savings goals loaded successfully!</span>
        </div>
      )}

      {importToast && (
        <div className="flex items-center gap-2 p-3.5 rounded-2xl bg-[#D1FAE5] border border-[#047857]/20 text-xs font-semibold text-[#047857]">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{importToast}</span>
        </div>
      )}

      {/* 1. Supabase Cloud Sync & Account */}
      <div className="p-5 sm:p-6 rounded-2xl border border-[#E2E8F0] bg-white shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Cloud className="w-4 h-4 text-[#047857]" />
            <h2 className="text-sm font-bold text-[#1F2937]">
              Supabase Cloud Sync & Security
            </h2>
          </div>
          {isCloudMode && (
            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-[#047857] bg-[#D1FAE5] px-2.5 py-0.5 rounded-full shadow-2xs">
              <Check className="w-3 h-3" /> Cloud Active
            </span>
          )}
        </div>

        {isCloudMode && user ? (
          <div className="space-y-3.5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0]">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-[#047857] text-white flex items-center justify-center font-bold">
                  <User className="w-4 h-4 text-[#D1FAE5]" />
                </div>
                <div>
                  <div className="text-xs font-bold text-[#1F2937]">{user.email}</div>
                  <div className="text-[11px] font-medium text-[#475569] flex items-center gap-1 mt-0.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-[#047857]" />
                    <span>Protected by PostgreSQL Row Level Security (RLS)</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => refreshCloudData()}
                  disabled={isCloudSyncing}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl border border-[#CBD5E1] bg-white text-[#1F2937] hover:border-[#047857] transition-all shadow-2xs"
                >
                  <RefreshCw className={`w-3.5 h-3.5 text-[#047857] ${isCloudSyncing ? 'animate-spin' : ''}`} />
                  <span>Sync Now</span>
                </button>
                <button
                  type="button"
                  onClick={() => signOut()}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl text-[#DC2626] border border-red-200 hover:bg-red-50 transition-colors"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Log Out</span>
                </button>
              </div>
            </div>

            {/* Optional Safe One-Time Local Import */}
            {localRecordsCount.total > 0 && !settings.hasImportedLocal && (
              <div className="p-4 rounded-xl bg-[#D1FAE5]/40 border border-[#047857]/20 space-y-2.5">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="text-xs font-bold text-[#047857] flex items-center gap-1.5">
                      <CloudUpload className="w-4 h-4" />
                      <span>Found Local Data to Migrate</span>
                    </h3>
                    <p className="text-xs text-[#1F2937] mt-1 leading-relaxed">
                      We detected <strong>{localRecordsCount.transactions} transactions</strong>,{' '}
                      <strong>{localRecordsCount.budgets} budgets</strong>, and{' '}
                      <strong>{localRecordsCount.goals} goals</strong> stored locally in this browser.
                      Would you like to import them into your cloud account?
                    </p>
                    <p className="text-[11px] text-[#475569] mt-0.5">
                      Safe deduplication: Existing records with matching IDs are safely upserted without duplication.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleImportLocal}
                    disabled={importingLocal}
                    className="shrink-0 flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-xl bg-[#047857] hover:bg-[#065f46] text-white shadow-xs transition-all disabled:opacity-50"
                  >
                    {importingLocal ? (
                      <>
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        <span>Importing...</span>
                      </>
                    ) : (
                      <>
                        <CloudUpload className="w-3.5 h-3.5" />
                        <span>Import to Cloud</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}

            {cloudSyncError && (
              <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-[#DC2626] flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{cloudSyncError}</span>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            <div className="p-4 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h3 className="text-xs font-bold text-[#1F2937]">Guest / Offline Mode Active</h3>
                  <p className="text-xs text-[#475569] mt-0.5">
                    Your records are stored locally in your browser's IndexedDB. Create an account or sign in to back up your data to Supabase and access it across devices.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => openAuthModal('signin')}
                  className="shrink-0 flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-xl bg-[#047857] hover:bg-[#065f46] text-white shadow-xs transition-all"
                >
                  <User className="w-3.5 h-3.5" />
                  <span>Sign In / Create Account</span>
                </button>
              </div>

              {!isConfigured && (
                <div className="pt-2 border-t border-[#E2E8F0] text-[11px] text-[#64748B] flex items-start gap-1.5">
                  <Info className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
                  <span>
                    Note: Add <code className="font-mono text-[10px] bg-slate-200 px-1 rounded">VITE_SUPABASE_URL</code> and <code className="font-mono text-[10px] bg-slate-200 px-1 rounded">VITE_SUPABASE_ANON_KEY</code> in your <code className="font-mono text-[10px]">.env</code> file to enable cloud authentication.
                  </span>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* 2. Appearance / Theme Selector (A. Mint Minimal, B. Midnight Luxe) */}
      <div className="p-5 sm:p-6 rounded-2xl border border-[#E2E8F0] bg-white shadow-xs space-y-4">
        <div>
          <h2 className="text-sm font-bold text-[#1F2937] flex items-center justify-between">
            <span>Appearance</span>
            <span className="text-xs font-normal text-[#475569]">
              Active: <strong className="font-semibold text-[#1F2937]">{themeConfig.name}</strong>
            </span>
          </h2>
          <p className="text-xs text-[#475569] mt-0.5">
            Select a visual theme for PocketPilot. Your choice is saved and persists automatically across sessions.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-2xl" role="radiogroup" aria-label="Appearance Themes">
          {Object.values(THEMES).map((th) => {
            const isSelected = settings.theme === th.id;

            return (
              <button
                key={th.id}
                type="button"
                role="radio"
                aria-checked={isSelected}
                onClick={() => setTheme(th.id)}
                className={`relative flex flex-col justify-between p-4 rounded-2xl border text-left transition-all cursor-pointer focus:outline-hidden focus-visible:ring-2 focus-visible:ring-[#047857] ${
                  isSelected
                    ? 'border-[#047857] ring-2 ring-[#047857] shadow-sm'
                    : 'border-[#E2E8F0] hover:border-[#CBD5E1]'
                }`}
                style={{
                  backgroundColor: th.preview.bg,
                }}
              >
                <div>
                  {/* Swatches preview */}
                  <div className="flex items-center gap-1.5 mb-3">
                    <span
                      className="w-5 h-5 rounded-full border border-black/10 shadow-2xs"
                      style={{ backgroundColor: th.preview.bg }}
                      title="Background"
                    />
                    <span
                      className="w-5 h-5 rounded-full border border-black/10 shadow-2xs"
                      style={{ backgroundColor: th.preview.primary }}
                      title="Primary Brand Action"
                    />
                    <span
                      className="w-5 h-5 rounded-full border border-black/10 shadow-2xs"
                      style={{ backgroundColor: th.preview.accent }}
                      title="Accent Highlight"
                    />
                    {th.id === 'midnight-luxe' && (
                      <span
                        className="w-5 h-5 rounded-full border border-black/10 shadow-2xs"
                        style={{ backgroundColor: th.preview.card }}
                        title="Dark Card Surface"
                      />
                    )}
                  </div>

                  {/* Name */}
                  <h3
                    className="text-sm font-bold"
                    style={{ color: th.preview.text }}
                  >
                    {th.label}
                  </h3>

                  <p
                    className="text-xs mt-1 leading-relaxed"
                    style={{
                      color: th.id === 'midnight-luxe' ? '#D4D4D8' : '#475569',
                    }}
                  >
                    &ldquo;{th.description}&rdquo;
                  </p>
                </div>

                {/* Selected Indicator Badge */}
                <div className="mt-4 pt-3 border-t border-black/10 flex items-center justify-between">
                  <span
                    className="text-[11px] font-medium"
                    style={{
                      color: th.id === 'midnight-luxe' ? '#A1A1AA' : '#64748B',
                    }}
                  >
                    {th.tagline}
                  </span>
                  {isSelected ? (
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold text-[#047857] bg-[#D1FAE5] px-2.5 py-0.5 rounded-full shadow-2xs">
                      <Check className="w-3.5 h-3.5" /> Selected
                    </span>
                  ) : (
                    <span
                      className="text-[11px] font-semibold"
                      style={{
                        color: th.id === 'midnight-luxe' ? '#A1A1AA' : '#64748B',
                      }}
                    >
                      Choose
                    </span>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. Permanent Primary Currency & Defaults */}
      <div className="p-5 sm:p-6 rounded-2xl border border-[#E2E8F0] bg-white shadow-xs space-y-4">
        <h2 className="text-sm font-bold text-[#1F2937]">
          Currency & Financial Defaults
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Permanent Primary Currency Display */}
          <div>
            <span className="block text-xs font-semibold text-[#1F2937] mb-1.5">
              Primary Currency
            </span>
            <div className="flex items-center justify-between px-3.5 py-2.5 text-sm rounded-xl border border-[#CBD5E1] bg-[#F8FAFC] text-[#1F2937]">
              <div className="flex items-center gap-2 font-semibold">
                <span className="w-6 h-6 rounded-lg bg-[#D1FAE5] text-[#047857] flex items-center justify-center shrink-0">
                  <IndianRupee className="w-3.5 h-3.5" />
                </span>
                <span>{APP_CURRENCY.name}</span>
              </div>
              <span className="text-[11px] font-bold text-[#047857] bg-[#D1FAE5] px-2.5 py-0.5 rounded-full">
                en-IN
              </span>
            </div>
            <p className="text-[11px] text-[#475569] mt-1 font-medium">
              Permanent primary currency with Indian numbering system formatting
            </p>
          </div>

          <div>
            <label
              htmlFor="settings-method"
              className="block text-xs font-semibold text-[#1F2937] mb-1.5"
            >
              Default Payment Method
            </label>
            <select
              id="settings-method"
              value={settings.defaultPaymentMethod}
              onChange={handlePaymentMethodChange}
              className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-[#CBD5E1] bg-white text-[#1F2937] focus:outline-hidden focus:ring-2 focus:ring-[#047857]"
            >
              {PAYMENT_METHODS.map((pm) => (
                <option key={pm} value={pm}>
                  {pm}
                </option>
              ))}
            </select>
            <p className="text-[11px] text-[#475569] mt-1 font-medium">
              Pre-selected payment method when adding new transactions
            </p>
          </div>
        </div>
      </div>

      {/* 4. Storage & Records Overview */}
      <div className="p-5 sm:p-6 rounded-2xl border border-[#E2E8F0] bg-white shadow-xs space-y-4">
        <div className="flex items-center gap-2">
          <Database className="w-4 h-4 text-[#047857]" />
          <h2 className="text-sm font-bold text-[#1F2937]">
            {isCloudMode ? 'Cloud Storage (Supabase PostgreSQL)' : 'Local Browser Storage (IndexedDB via Dexie)'}
          </h2>
        </div>

        <div className="p-4 rounded-2xl bg-[#F8FAFC] border border-[#E2E8F0] text-xs text-[#475569] space-y-2.5">
          <div className="flex items-start gap-2.5">
            <ShieldCheck className="w-4 h-4 text-[#047857] shrink-0 mt-0.5" />
            <p className="leading-relaxed">
              {isCloudMode
                ? 'Your transactions, monthly budgets, and savings goals are safely stored in your private Supabase PostgreSQL database protected by Row Level Security (RLS).'
                : 'PocketPilot runs in private local mode. All data is kept securely in your browser\'s local IndexedDB.'}
            </p>
          </div>
        </div>

        {/* Current Database Counts */}
        <div className="grid grid-cols-3 gap-2.5 text-center text-xs py-1">
          <div className="p-3 rounded-2xl bg-[#F8FAFC] border border-[#E2E8F0]">
            <div className="text-[11px] font-semibold text-[#64748B]">Transactions</div>
            <div className="text-xl font-bold font-tabular text-[#1F2937] mt-0.5">
              {transactions.length}
            </div>
          </div>
          <div className="p-3 rounded-2xl bg-[#F8FAFC] border border-[#E2E8F0]">
            <div className="text-[11px] font-semibold text-[#64748B]">Budgets</div>
            <div className="text-xl font-bold font-tabular text-[#1F2937] mt-0.5">
              {budgets.length}
            </div>
          </div>
          <div className="p-3 rounded-2xl bg-[#F8FAFC] border border-[#E2E8F0]">
            <div className="text-[11px] font-semibold text-[#64748B]">Savings Goals</div>
            <div className="text-xl font-bold font-tabular text-[#1F2937] mt-0.5">
              {goals.length}
            </div>
          </div>
        </div>

        {/* Database Actions */}
        <div className="pt-3 border-t border-[#E2E8F0] flex flex-wrap items-center justify-between gap-3">
          <button
            type="button"
            onClick={handleLoadSample}
            className="flex items-center gap-1.5 px-4 py-2.5 text-xs font-semibold rounded-xl bg-[#D1FAE5] hover:bg-[#a7f3d0] text-[#047857] transition-colors shadow-2xs active:scale-[0.98]"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Load Realistic Demo Data</span>
          </button>

          <button
            type="button"
            onClick={() => setShowClearConfirm(true)}
            className="flex items-center gap-1.5 px-4 py-2.5 text-xs font-semibold rounded-xl text-[#DC2626] border border-red-200 hover:bg-red-50 transition-colors active:scale-[0.98]"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>{isCloudMode ? 'Clear Cloud Data' : 'Clear All Local Data'}</span>
          </button>
        </div>
      </div>

      {/* Confirmation Dialog for Clearing All Data */}
      <ConfirmDialog
        isOpen={showClearConfirm}
        onClose={() => setShowClearConfirm(false)}
        onConfirm={async () => {
          await clearAllData();
          setShowClearConfirm(false);
        }}
        title={isCloudMode ? 'Reset & Clear Cloud Data?' : 'Reset & Wipe All Local Data?'}
        message={
          isCloudMode
            ? 'This will delete all stored transactions, monthly budgets, and savings goals from your Supabase cloud account. This action cannot be reversed.'
            : 'This will permanently delete all stored transactions, monthly budgets, savings goals, and preferences from this browser. This action cannot be reversed.'
        }
        confirmLabel={isCloudMode ? 'Yes, Clear Cloud Data' : 'Yes, Wipe All Data'}
        isDestructive={true}
      />
    </div>
  );
};
