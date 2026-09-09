import React from 'react';
import {
  LayoutDashboard,
  Database,
  AlertTriangle,
  BarChart3,
  Lightbulb,
  Coins,
  Map,
  FileText,
  HelpCircle,
  Settings,
  LogOut,
} from 'lucide-react';
import type { WorkflowTab } from '../dashboard';
import type { UserProfile } from '../../types/auth';

interface SidebarProps {
  activeTab: WorkflowTab;
  onSelectTab: (tab: WorkflowTab) => void;
  collapsed?: boolean;
  onToggleCollapse?: () => void;
  alertCount?: number;
  onOpenKeySettings?: () => void;
  onSelectZone?: (zoneId: string) => void;
  onOpenHeatPlan?: () => void;
  onOpenHelp?: () => void;
  onOpenZonesModal?: () => void;
  onNavigateToLanding?: () => void;
  onNavigateToLogin?: () => void;
  currentUser?: UserProfile;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onSelectTab,
  onOpenHelp,
  onOpenZonesModal,
  onNavigateToLanding,
  onNavigateToLogin,
  currentUser,
}) => {
  const navItems: { id: WorkflowTab; label: string; num: string; icon: React.ElementType }[] = [
    { id: 'overview', label: 'Overview', num: '00', icon: LayoutDashboard },
    { id: 'data', label: 'Data', num: '01', icon: Database },
    { id: 'identify', label: 'Identify Risk', num: '02', icon: AlertTriangle },
    { id: 'explain', label: 'Explain Risk', num: '03', icon: BarChart3 },
    { id: 'recommend', label: 'Recommend Action', num: '04', icon: Lightbulb },
    { id: 'prioritize', label: 'Prioritize & Fund', num: '05', icon: Coins },
    { id: 'planning', label: 'Planning', num: '06', icon: Map },
    { id: 'reports', label: 'Reports', num: '07', icon: FileText },
  ];

  const userName = currentUser?.name || 'Dr. J. Radhakrishnan, IAS';
  const userRole = currentUser?.designation || 'Municipal Commissioner';
  const userInitials = currentUser?.avatarInitials || 'JR';
  const userBadge = currentUser?.badge || 'Executive Authority';

  return (
    <aside className="fixed left-0 top-0 h-full w-72 bg-white dark:bg-[#10131d] border-r border-slate-200 dark:border-[#272f42] z-50 flex flex-col justify-between shadow-xs select-none transition-colors duration-200">
      {/* Brand Header */}
      <div className="flex flex-col">
        <div
          onClick={onNavigateToLanding}
          className="px-6 py-5 flex items-center gap-3 cursor-pointer border-b border-slate-100 dark:border-[#272f42] hover:bg-slate-50 dark:hover:bg-[#171c2b] transition-colors"
          title="RESPIRE - Urban Heat & Climate Resilience (Click to view Landing Page)"
        >
          <div className="h-9 w-9 rounded-lg bg-[#0b1c30] dark:bg-gradient-to-b dark:from-[#2a3248] dark:to-[#141824] p-1 flex items-center justify-center shrink-0 shadow-xs border border-transparent dark:border-slate-400/50 dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.25)]">
            <img src="/respire-emblem.png" alt="RESPIRE" className="h-7 w-7 object-contain" />
          </div>
          <div>
            <div className="font-bold text-slate-900 dark:text-white uppercase tracking-wide text-sm flex items-center gap-1.5">
              RESPIRE
              <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-slate-100 dark:bg-[#20273a] dark:border dark:border-slate-400/40 text-slate-600 dark:text-slate-200 font-bold">
                GCC
              </span>
            </div>
            <div className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
              Urban Heat & Climate Resilience
            </div>
          </div>
        </div>

        {/* Navigation Section */}
        <nav className="px-3 py-4 space-y-1">
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            const Icon = item.icon;

            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onSelectTab(item.id)}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-lg text-xs transition-all cursor-pointer text-left ${
                  isActive
                    ? 'bg-[#0b1c30] dark:bg-gradient-to-b dark:from-[#262f44] dark:to-[#151926] text-white font-semibold dark:border dark:border-slate-300/80 dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.35),0_2px_6px_rgba(0,0,0,0.5)]'
                    : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-[#1a2030] hover:text-slate-900 dark:hover:text-white font-medium dark:border dark:border-transparent dark:hover:border-slate-500/30'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-slate-500 dark:text-slate-400'}`} />
                  <span className="text-[13px]">{item.label}</span>
                </div>
                <span
                  className={`font-mono text-xs ${
                    isActive ? 'text-slate-300 dark:text-slate-100 font-bold' : 'text-slate-400 dark:text-slate-500'
                  }`}
                >
                  {item.num}
                </span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Bottom Utility Links with Silver Borders on Hover & Officer Profile */}
      <div className="px-3 py-3 space-y-1 border-t border-slate-100 dark:border-[#272f42]">
        <button
          type="button"
          onClick={onOpenHelp}
          className="w-full flex items-center gap-2.5 px-3.5 py-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-[#1a2030] hover:text-slate-900 dark:hover:text-white rounded-lg text-xs font-medium transition-all cursor-pointer dark:border dark:border-transparent dark:hover:border-slate-400/40"
        >
          <HelpCircle className="w-4 h-4 text-slate-400 dark:text-slate-400" />
          <span className="text-[13px]">Help & Docs</span>
        </button>

        <button
          type="button"
          onClick={onOpenZonesModal}
          className="w-full flex items-center gap-2.5 px-3.5 py-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-[#1a2030] hover:text-slate-900 dark:hover:text-white rounded-lg text-xs font-medium transition-all cursor-pointer dark:border dark:border-transparent dark:hover:border-slate-400/40"
        >
          <Settings className="w-4 h-4 text-slate-400 dark:text-slate-400" />
          <span className="text-[13px]">Settings & Wards</span>
        </button>

        {/* Logged in Officer Profile Card with Quick Sign Out Action */}
        <div
          onClick={onNavigateToLogin}
          className="mt-2 p-2.5 rounded-xl bg-slate-50 dark:bg-[#181d2c] border border-slate-200/80 dark:border-[#2b3348] hover:border-cyan-400/50 transition-all cursor-pointer flex items-center justify-between group"
          title="Click to switch officer profile or sign in"
        >
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-cyan-500 to-blue-600 text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-2xs">
              {userInitials}
            </div>
            <div className="min-w-0 text-left leading-tight">
              <div className="text-[12px] font-bold text-slate-900 dark:text-white truncate group-hover:text-cyan-400 transition-colors">
                {userName}
              </div>
              <div className="text-[10px] text-slate-500 dark:text-slate-400 truncate flex items-center gap-1">
                <span>{userRole}</span>
                <span className="text-[8px] font-mono px-1 py-0.2 rounded bg-cyan-500/10 text-cyan-600 dark:text-cyan-400">
                  {userBadge}
                </span>
              </div>
            </div>
          </div>

          <LogOut className="w-3.5 h-3.5 text-slate-400 group-hover:text-rose-400 transition-colors shrink-0 ml-1" />
        </div>
      </div>
    </aside>
  );
};
