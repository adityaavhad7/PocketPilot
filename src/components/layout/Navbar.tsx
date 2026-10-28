import React from 'react';
import { usePocketPilot } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import { Plus, Wallet, Calendar, User, LogOut, Cloud, RefreshCw } from 'lucide-react';
import { getCurrentMonthKey, getMonthLabel } from '../../utils/formatters';

interface NavbarProps {
  onOpenNewTransaction: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenNewTransaction }) => {
  const { selectedMonth, setSelectedMonth, openAuthModal, isCloudMode, isCloudSyncing } = usePocketPilot();
  const { user, signOut } = useAuth();

  // Create list of recent months for the header selector
  const monthOptions = React.useMemo(() => {
    const options: { key: string; label: string }[] = [];
    const now = new Date();
    for (let i = 0; i < 6; i++) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const key = `${year}-${month}`;
      options.push({ key, label: getMonthLabel(key) });
    }
    const nextD = new Date(now.getFullYear(), now.getMonth() + 1, 1);
    const nextKey = `${nextD.getFullYear()}-${String(nextD.getMonth() + 1).padStart(2, '0')}`;
    options.unshift({ key: nextKey, label: getMonthLabel(nextKey) });
    return options;
  }, []);

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between gap-3 sm:gap-4 px-4 sm:px-6 py-3 bg-white border-b border-[#E2E8F0] shadow-2xs">
      {/* Brand Zone */}
      <div className="flex items-center gap-2.5 sm:gap-3 shrink-0">
        <div className="w-9 h-9 rounded-xl bg-[#047857] text-white flex items-center justify-center font-bold shadow-xs">
          <Wallet className="w-5 h-5 text-[#D1FAE5]" />
        </div>
        <div>
          <span className="text-base sm:text-lg font-bold tracking-tight text-[#1F2937] whitespace-nowrap block leading-tight">
            PocketPilot
          </span>
          <span className="text-[11px] font-medium text-[#475569] hidden sm:block leading-none">
            Take control of your money.
          </span>
        </div>
      </div>

      {/* Month Selector in Header */}
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 text-xs font-medium rounded-xl border border-[#CBD5E1] bg-white text-[#1F2937] shadow-2xs hover:border-[#047857] transition-colors">
          <Calendar className="w-3.5 h-3.5 text-[#047857]" />
          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="bg-transparent border-none text-xs font-semibold focus:outline-hidden cursor-pointer text-[#1F2937]"
            aria-label="Select month"
          >
            {monthOptions.map((opt) => (
              <option key={opt.key} value={opt.key} className="bg-white text-[#1F2937]">
                {opt.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Account & Primary Actions */}
      <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
        {/* Auth / Cloud Sync Status Button */}
        {user ? (
          <div className="flex items-center gap-1.5">
            <div
              className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs rounded-xl bg-[#D1FAE5] text-[#047857] font-semibold border border-[#047857]/20"
              title={`Logged in as ${user.email} (Cloud Sync Active)`}
            >
              {isCloudSyncing ? (
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Cloud className="w-3.5 h-3.5" />
              )}
              <span className="max-w-[100px] md:max-w-[130px] truncate hidden xs:inline">
                {user.email?.split('@')[0]}
              </span>
            </div>
            <button
              type="button"
              onClick={() => signOut()}
              className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold rounded-xl text-[#DC2626] border border-red-200 hover:bg-red-50 transition-colors"
              title="Sign Out"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => openAuthModal('signin')}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl border border-[#CBD5E1] hover:border-[#047857] text-[#1F2937] hover:text-[#047857] transition-all shadow-2xs"
          >
            <User className="w-3.5 h-3.5 text-[#047857]" />
            <span className="hidden xs:inline">Sign In</span>
          </button>
        )}

        {/* Primary Action Button */}
        <button
          type="button"
          onClick={onOpenNewTransaction}
          className="flex items-center gap-1.5 px-3.5 sm:px-4 py-2 text-xs font-semibold text-white bg-[#047857] hover:bg-[#065f46] rounded-xl shadow-xs hover:shadow-sm transition-all focus-visible:ring-2 focus-visible:ring-[#047857] focus:outline-hidden whitespace-nowrap active:scale-[0.98]"
        >
          <Plus className="w-4 h-4" />
          <span className="hidden xs:inline">Add Record</span>
          <span className="xs:hidden">Add</span>
        </button>
      </div>
    </header>
  );
};
