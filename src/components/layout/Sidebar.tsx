import React from 'react';
import { usePocketPilot } from '../../context/AppContext';
import type { NavTab } from '../../types';
import {
  LayoutDashboard,
  Receipt,
  PiggyBank,
  BarChart3,
  Target,
  GraduationCap,
  Settings,
} from 'lucide-react';

interface NavItem {
  id: NavTab;
  label: string;
  icon: React.ElementType;
}

const NAV_ITEMS: NavItem[] = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'transactions', label: 'Transactions', icon: Receipt },
  { id: 'budgets', label: 'Budgets', icon: PiggyBank },
  { id: 'reports', label: 'Reports', icon: BarChart3 },
  { id: 'goals', label: 'Savings Goals', icon: Target },
  { id: 'student', label: 'Student Mode', icon: GraduationCap },
  { id: 'settings', label: 'Settings', icon: Settings },
];

export const Sidebar: React.FC = () => {
  const { activeTab, setActiveTab, settings } = usePocketPilot();

  return (
    <aside className="hidden md:flex flex-col w-60 shrink-0 bg-white border-r border-[#E2E8F0] p-4 min-h-[calc(100vh-61px)]">
      <nav className="space-y-1.5 flex-1" aria-label="Main Navigation">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          const isStudent = item.id === 'student';

          return (
            <button
              key={item.id}
              type="button"
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all focus-visible:ring-2 focus-visible:ring-[#047857] focus:outline-hidden ${
                isActive
                  ? 'nav-link-active bg-[#D1FAE5] text-[#047857] font-bold shadow-2xs'
                  : 'text-[#475569] hover:bg-[#D1FAE5]/30 hover:text-[#1F2937]'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon
                  className={`w-4 h-4 ${
                    isActive ? 'text-[#047857]' : 'text-[#64748B]'
                  }`}
                />
                <span className="whitespace-nowrap">{item.label}</span>
              </div>

              {isStudent && settings.studentModeEnabled && (
                <span className="text-[10px] font-bold tracking-wide uppercase px-2 py-0.5 rounded-full bg-[#047857] text-white">
                  ON
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Storage footnote */}
      <div className="pt-4 border-t border-[#E2E8F0] text-[11px] text-[#64748B] leading-normal">
        <p className="font-bold text-[#1F2937]">PocketPilot v1.0</p>
        <p>Private & stored locally in browser.</p>
      </div>
    </aside>
  );
};
