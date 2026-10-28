import React, { useState } from 'react';
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
  MoreHorizontal,
  X,
} from 'lucide-react';

export const MobileNav: React.FC = () => {
  const { activeTab, setActiveTab, settings } = usePocketPilot();
  const [showMoreMenu, setShowMoreMenu] = useState(false);

  const mainItems: { id: NavTab; label: string; icon: React.ElementType }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'transactions', label: 'Ledger', icon: Receipt },
    { id: 'budgets', label: 'Budgets', icon: PiggyBank },
    { id: 'reports', label: 'Reports', icon: BarChart3 },
    { id: 'goals', label: 'Goals', icon: Target },
  ];

  const handleSelectTab = (tab: NavTab) => {
    setActiveTab(tab);
    setShowMoreMenu(false);
  };

  const isMoreActive = activeTab === 'student' || activeTab === 'settings';

  return (
    <>
      {/* More Sheet for Student Mode & Settings */}
      {showMoreMenu && (
        <div className="md:hidden fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-xs flex items-end">
          <div
            className="fixed inset-0"
            onClick={() => setShowMoreMenu(false)}
            aria-hidden="true"
          />
          <div className="relative w-full bg-white rounded-t-3xl p-5 border-t border-[#E2E8F0] shadow-2xl z-50 animate-in slide-in-from-bottom duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-[#E2E8F0]">
              <span className="text-sm font-bold text-[#1F2937]">
                More Features
              </span>
              <button
                type="button"
                onClick={() => setShowMoreMenu(false)}
                className="p-1 text-[#64748B] hover:text-[#1F2937] rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="py-2.5 space-y-1.5">
              <button
                type="button"
                onClick={() => handleSelectTab('student')}
                className={`w-full flex items-center justify-between p-3.5 rounded-2xl text-sm font-medium transition-colors ${
                  activeTab === 'student'
                    ? 'bg-[#D1FAE5] text-[#047857] font-bold'
                    : 'text-[#1F2937] hover:bg-[#F8FAFC]'
                }`}
              >
                <div className="flex items-center gap-3">
                  <GraduationCap className="w-5 h-5 text-[#047857]" />
                  <span>Student Mode</span>
                </div>
                {settings.studentModeEnabled && (
                  <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-[#047857] text-white">
                    ACTIVE
                  </span>
                )}
              </button>

              <button
                type="button"
                onClick={() => handleSelectTab('settings')}
                className={`w-full flex items-center gap-3 p-3.5 rounded-2xl text-sm font-medium transition-colors ${
                  activeTab === 'settings'
                    ? 'bg-[#D1FAE5] text-[#047857] font-bold'
                    : 'text-[#1F2937] hover:bg-[#F8FAFC]'
                }`}
              >
                <Settings className="w-5 h-5 text-[#475569]" />
                <span>Settings & Storage</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Fixed bottom navigation */}
      <nav
        className="md:hidden fixed bottom-0 left-0 right-0 z-30 bg-white border-t border-[#E2E8F0] flex items-center justify-around px-2 py-1.5 h-16 safe-area-pb shadow-md"
        aria-label="Mobile Navigation"
      >
        {mainItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => handleSelectTab(item.id)}
              className={`flex flex-col items-center justify-center flex-1 min-h-[44px] py-1 transition-colors ${
                isActive
                  ? 'nav-link-active text-[#047857] font-bold'
                  : 'text-[#64748B] hover:text-[#1F2937]'
              }`}
            >
              <Icon className="w-5 h-5 mb-0.5" />
              <span className="text-[10px] leading-tight whitespace-nowrap">{item.label}</span>
            </button>
          );
        })}

        {/* More Button */}
        <button
          type="button"
          onClick={() => setShowMoreMenu(true)}
          className={`flex flex-col items-center justify-center flex-1 min-h-[44px] py-1 transition-colors ${
            isMoreActive
              ? 'nav-link-active text-[#047857] font-bold'
              : 'text-[#64748B] hover:text-[#1F2937]'
          }`}
        >
          <MoreHorizontal className="w-5 h-5 mb-0.5" />
          <span className="text-[10px] leading-tight whitespace-nowrap">More</span>
        </button>
      </nav>
    </>
  );
};
