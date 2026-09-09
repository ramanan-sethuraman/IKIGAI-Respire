import React, { useState, useRef, useEffect } from 'react';
import {
  Building2,
  HelpCircle,
  Settings,
  Sun,
  Moon,
  LogOut,
  UserCheck,
  Shield,
  ChevronDown,
} from 'lucide-react';
import type { DataSourceMode, DataProvenanceSummary } from '../../data';
import type { WorkflowTab } from '../dashboard';
import type { UserProfile } from '../../types/auth';

interface TopBarProps {
  dataSourceMode: DataSourceMode;
  onToggleMode?: (mode: DataSourceMode) => void;
  provenanceSummary?: DataProvenanceSummary;
  activeTab?: WorkflowTab;
  onSelectTab?: (tab: WorkflowTab) => void;
  onOpenKeySettings?: () => void;
  onOpenHelp?: () => void;
  onOpenZonesModal?: () => void;
  onSelectZone?: (zoneId: string) => void;
  searchQuery?: string;
  onSearchChange?: (query: string) => void;
  onNavigateToLanding?: () => void;
  onNavigateToLogin?: () => void;
  onLogout?: () => void;
  currentUser?: UserProfile;
  theme?: 'light' | 'dark';
  onToggleTheme?: () => void;
}

/**
 * Clean navigation top bar component with black & charcoal grey theme and silver-lined buttons.
 */
export const TopBar: React.FC<TopBarProps> = ({
  dataSourceMode,
  onToggleMode,
  onOpenHelp,
  onOpenZonesModal,
  onNavigateToLanding,
  onNavigateToLogin,
  onLogout,
  currentUser,
  theme = 'light',
  onToggleTheme,
}) => {
  const isDark = theme === 'dark';
  const [showUserMenu, setShowUserMenu] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setShowUserMenu(false);
      }
    };
    if (showUserMenu) {
      document.addEventListener('mousedown', handleOutsideClick);
    }
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
    };
  }, [showUserMenu]);

  const userName = currentUser?.name || 'Dr. J. Radhakrishnan, IAS';
  const userRole = currentUser?.designation || 'Municipal Commissioner';
  const userDept = currentUser?.department || 'Greater Chennai Corporation';
  const userInitials = currentUser?.avatarInitials || 'JR';
  const userBadge = currentUser?.badge || 'Executive Authority';
  const clearanceLevel = currentUser?.clearanceLevel || 'Level 1 Supreme Administrative Clearance';

  return (
    <header className="h-16 px-6 sm:px-8 border-b border-slate-200 dark:border-[#272f42] bg-white dark:bg-[#10131d] flex items-center justify-between gap-4 sticky top-0 z-40 select-none shadow-2xs transition-colors duration-200">
      {/* Left: Location & Institutional Badges */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="flex items-center gap-2">
          <Building2 className="w-5 h-5 text-slate-500 dark:text-slate-300 shrink-0" />
          <span className="text-base font-bold text-slate-900 dark:text-slate-100 tracking-tight">
            Chennai Heat Assessment
          </span>
        </div>

        {/* Mode Badge with Silver Lining in Dark Mode */}
        <button
          type="button"
          onClick={() => onToggleMode?.(dataSourceMode === 'demo' ? 'processed' : 'demo')}
          className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 dark:bg-gradient-to-b dark:from-[#222838] dark:to-[#141824] dark:border dark:border-slate-400/50 dark:text-slate-200 dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.2),0_1px_3px_rgba(0,0,0,0.4)] dark:hover:border-slate-200 text-[10px] font-bold rounded-md uppercase tracking-wider transition-all cursor-pointer"
          title="Click to toggle data source mode"
        >
          {dataSourceMode === 'processed' ? 'PROCESSED 200 WARDS' : 'ILLUSTRATIVE DEMO DATA'}
        </button>
      </div>

      {/* Right: Theme Toggle (Silver Lining), Quick Actions & Officer Profile */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Dark / Light Mode Toggle Button with Silver Lining */}
        {onToggleTheme && (
          <button
            type="button"
            onClick={onToggleTheme}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 dark:bg-gradient-to-b dark:from-[#262e42] dark:to-[#161a27] dark:border-slate-400/70 dark:text-slate-100 dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.3),0_2px_5px_rgba(0,0,0,0.5)] dark:hover:border-white dark:hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.5),0_0_12px_rgba(226,232,240,0.35)] text-xs font-semibold transition-all cursor-pointer"
            title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          >
            {isDark ? (
              <>
                <Sun className="w-4 h-4 text-amber-300 animate-spin-slow drop-shadow-[0_0_4px_rgba(251,191,36,0.6)]" />
                <span className="hidden sm:inline font-mono">Light Mode</span>
              </>
            ) : (
              <>
                <Moon className="w-4 h-4 text-slate-600" />
                <span className="hidden sm:inline font-mono">Dark Mode</span>
              </>
            )}
          </button>
        )}

        {onOpenHelp && (
          <button
            type="button"
            onClick={onOpenHelp}
            className="p-2 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-slate-100 dark:hover:bg-[#1e2436] dark:border dark:border-transparent dark:hover:border-slate-400/50 transition-all cursor-pointer hidden md:flex items-center justify-center"
            title="Help & Documentation"
          >
            <HelpCircle className="w-4 h-4" />
          </button>
        )}

        {onOpenZonesModal && (
          <button
            type="button"
            onClick={onOpenZonesModal}
            className="p-2 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-slate-100 dark:hover:bg-[#1e2436] dark:border dark:border-transparent dark:hover:border-slate-400/50 transition-all cursor-pointer hidden md:flex items-center justify-center"
            title="15 Zones / 200 Wards Hierarchy"
          >
            <Settings className="w-4 h-4" />
          </button>
        )}

        {/* Authenticated Officer Profile with Interactive Dropdown */}
        <div className="relative" ref={userMenuRef}>
          <div
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="flex items-center gap-2.5 p-1 sm:px-2.5 sm:py-1 rounded-xl hover:bg-slate-100 dark:hover:bg-[#1a2030] border border-transparent dark:hover:border-slate-400/30 transition-all cursor-pointer"
            title="Officer Profile & Session Settings"
          >
            <div className="text-right hidden sm:block">
              <div className="text-xs font-semibold text-slate-900 dark:text-slate-200 flex items-center justify-end gap-1">
                <span>{userName}</span>
                <ChevronDown className={`w-3 h-3 text-slate-400 transition-transform ${showUserMenu ? 'rotate-180' : ''}`} />
              </div>
              <div className="text-[10px] text-slate-500 dark:text-slate-400 font-mono">
                {userRole}
              </div>
            </div>
            
            <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-cyan-500 to-blue-600 text-white border border-slate-300 dark:border-slate-400/60 shadow-xs flex items-center justify-center font-bold text-xs">
              {userInitials}
            </div>
          </div>

          {/* User Profile Menu Dropdown */}
          {showUserMenu && (
            <div className="absolute right-0 mt-2 w-72 bg-white dark:bg-[#101424] border border-slate-200 dark:border-white/[0.12] rounded-2xl shadow-2xl p-4 z-50 animate-fade-in text-left">
              {/* Header Profile Badge */}
              <div className="pb-3 border-b border-slate-100 dark:border-white/[0.08]">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-900 dark:text-white truncate">
                    {userName}
                  </span>
                  <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border border-cyan-500/30 font-semibold shrink-0">
                    {userBadge}
                  </span>
                </div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                  {userRole} • {userDept}
                </div>
                {currentUser?.email && (
                  <div className="text-[10px] font-mono text-slate-400 dark:text-slate-500 mt-0.5 truncate">
                    {currentUser.email}
                  </div>
                )}
              </div>

              {/* Clearance Details */}
              <div className="py-2.5 space-y-1.5 border-b border-slate-100 dark:border-white/[0.08]">
                <div className="text-[10px] uppercase tracking-wider font-semibold text-slate-400 dark:text-slate-500">
                  Security Clearance
                </div>
                <div className="flex items-center gap-1.5 text-xs text-slate-700 dark:text-slate-300 font-mono">
                  <Shield className="w-3.5 h-3.5 text-cyan-500 shrink-0" />
                  <span className="text-[11px] truncate">{clearanceLevel}</span>
                </div>
              </div>

              {/* Actions List */}
              <div className="pt-2 space-y-1 text-xs">
                {onNavigateToLogin && (
                  <button
                    type="button"
                    onClick={() => {
                      setShowUserMenu(false);
                      onNavigateToLogin();
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-white/[0.06] transition-colors cursor-pointer"
                  >
                    <UserCheck className="w-4 h-4 text-cyan-500" />
                    <span>Switch Officer Account</span>
                  </button>
                )}

                {onNavigateToLanding && (
                  <button
                    type="button"
                    onClick={() => {
                      setShowUserMenu(false);
                      onNavigateToLanding();
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-white/[0.06] transition-colors cursor-pointer"
                  >
                    <Building2 className="w-4 h-4 text-blue-500" />
                    <span>Public Landing Page</span>
                  </button>
                )}

                {(onLogout || onNavigateToLogin) && (
                  <button
                    type="button"
                    onClick={() => {
                      setShowUserMenu(false);
                      if (onLogout) onLogout();
                      else if (onNavigateToLogin) onNavigateToLogin();
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-500/10 transition-colors cursor-pointer font-semibold"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Lock Session & Sign Out</span>
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
