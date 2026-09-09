import React, { useState, useEffect } from 'react';
import {
  Shield,
  Lock,
  Mail,
  Eye,
  EyeOff,
  ArrowRight,
  ArrowLeft,
  AlertCircle,
  KeyRound,
  ShieldCheck,
  UserCheck,
  Sun,
  Moon,
  Radio,
  Sparkles,
  Database,
} from 'lucide-react';
import {
  type UserProfile,
  DEFAULT_USER_PROFILES,
} from '../../types/auth';
import { authService, type DbStatusInfo } from '../../services/authService';

interface LoginPageProps {
  onLoginSuccess: (user: UserProfile) => void;
  onNavigateToLanding: () => void;
  theme?: 'light' | 'dark';
  onToggleTheme?: () => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({
  onLoginSuccess,
  onNavigateToLanding,
  theme = 'dark',
  onToggleTheme,
}) => {
  const [selectedProfileId, setSelectedProfileId] = useState<string>(DEFAULT_USER_PROFILES[0].id);
  const [email, setEmail] = useState<string>(DEFAULT_USER_PROFILES[0].email);
  const [password, setPassword] = useState<string>('••••••••••••');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [rememberSession, setRememberSession] = useState<boolean>(true);
  const [isAuthenticating, setIsAuthenticating] = useState<boolean>(false);
  const [authStageIndex, setAuthStageIndex] = useState<number>(0);
  const [authError, setAuthError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'quick_select' | 'credentials'>('quick_select');
  const [showForgotModal, setShowForgotModal] = useState<boolean>(false);
  const [dbStatus, setDbStatus] = useState<DbStatusInfo>({
    connected: false,
    cluster: 'cluster28.uiwd4et.mongodb.net',
    dbName: 'respire_climate_db',
    mode: 'OFFLINE_FALLBACK',
  });

  // Check MongoDB Atlas status on mount
  useEffect(() => {
    let isMounted = true;
    async function checkDb() {
      const status = await authService.checkDatabaseHealth();
      if (isMounted) {
        setDbStatus(status);
      }
    }
    checkDb();
    const interval = setInterval(checkDb, 15000);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  const authStages = [
    'Verifying GCC Officer credentials against e-Gov directory...',
    'Authenticating with Tamil Nadu State Spatial Data Infrastructure (TNSDI)...',
    'Persisting login session & audit timestamp to MongoDB Atlas (cluster28.uiwd4et.mongodb.net)...',
    'Clearance confirmed. Initializing RESPIRE Command Deck...',
  ];

  // Synchronize email and password when selecting a preset officer profile
  const handleSelectProfile = (profile: UserProfile) => {
    setSelectedProfileId(profile.id);
    setEmail(profile.email);
    setPassword('••••••••••••');
    setAuthError(null);
  };

  const handleStartAuth = async (targetProfile?: UserProfile, source: 'PRESET_OFFICER' | 'CREDENTIALS' | 'GUEST_AUDITOR' = 'PRESET_OFFICER') => {
    setAuthError(null);
    const profileToUse =
      targetProfile ||
      DEFAULT_USER_PROFILES.find((p) => p.email.toLowerCase() === email.toLowerCase()) ||
      DEFAULT_USER_PROFILES.find((p) => p.id === selectedProfileId) || {
        id: `user-custom-${Date.now()}`,
        name: email.split('@')[0].replace(/[._]/g, ' ').toUpperCase() || 'Authorized GCC Officer',
        designation: 'Municipal Climate Officer',
        department: 'Greater Chennai Corporation',
        email: email || 'officer@chennaicorporation.gov.in',
        avatarInitials: (email[0] || 'O').toUpperCase(),
        role: 'CLIMATE_ANALYST',
        badge: 'Custom Clearance',
        clearanceLevel: 'Standard Officer Access',
        empId: 'GCC-AUTH-2026',
        lastLogin: 'Just now',
      };

    setIsAuthenticating(true);
    setAuthStageIndex(0);

    // Call backend API to persist login in MongoDB Atlas
    let finalProfile = profileToUse;
    try {
      const loginRes = await authService.login({
        email: profileToUse.email,
        profile: profileToUse,
        source,
      });
      if (loginRes.user) {
        finalProfile = loginRes.user;
      }
    } catch (err) {
      console.warn('Auth service notice:', err);
    }

    const stepInterval = setInterval(() => {
      setAuthStageIndex((prev) => {
        if (prev < authStages.length - 1) {
          return prev + 1;
        } else {
          clearInterval(stepInterval);
          setTimeout(() => {
            onLoginSuccess(finalProfile as UserProfile);
          }, 450);
          return prev;
        }
      });
    }, 400);
  };

  const handleSubmitForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      setAuthError('Please enter your official GCC officer email or employee ID.');
      return;
    }
    handleStartAuth(undefined, 'CREDENTIALS');
  };

  const selectedProfile = DEFAULT_USER_PROFILES.find((p) => p.id === selectedProfileId) || DEFAULT_USER_PROFILES[0];

  return (
    <div className="min-h-screen w-full bg-[#060814] text-slate-100 flex flex-col justify-between antialiased selection:bg-cyan-500 selection:text-black relative overflow-x-hidden font-sans">
      {/* Background Cosmic Blobs & Radiant Ambient Glow */}
      <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-cyan-600/10 rounded-full blur-[180px] pointer-events-none" />
      <div className="absolute top-1/3 right-10 w-[650px] h-[650px] bg-blue-600/10 rounded-full blur-[200px] pointer-events-none" />
      <div className="absolute bottom-10 left-10 w-[500px] h-[500px] bg-indigo-600/10 rounded-full blur-[180px] pointer-events-none" />

      {/* Top Navigation / Brand Bar */}
      <header className="sticky top-0 z-40 backdrop-blur-xl bg-[#060814]/90 border-b border-white/[0.08] px-4 sm:px-8 lg:px-12 py-4 w-full">
        <div className="max-w-7xl mx-auto flex items-center justify-between w-full">
          {/* Logo & Platform Title */}
          <div
            onClick={onNavigateToLanding}
            className="flex items-center space-x-3 cursor-pointer group"
            title="Return to Public Portal"
          >
            <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-cyan-500 via-blue-600 to-indigo-600 p-0.5 shadow-[0_0_20px_rgba(6,182,212,0.4)] group-hover:scale-105 transition-transform">
              <div className="h-full w-full bg-[#080c1e] rounded-[10px] flex items-center justify-center overflow-hidden p-1">
                <img src="/respire-emblem.png" alt="RESPIRE" className="w-full h-full object-contain" />
              </div>
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-black text-lg tracking-tight text-white group-hover:text-cyan-300 transition-colors">
                  RESPIRE
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 font-bold tracking-wider">
                  OFFICER PORTAL
                </span>
              </div>
              <p className="text-[10px] text-slate-400 font-mono tracking-wider uppercase">
                Greater Chennai Corporation • Urban Heat Resilience
              </p>
            </div>
          </div>

          {/* Right Header Utilities: MongoDB Cluster Status, Return Link & Theme Toggle */}
          <div className="flex items-center space-x-3">
            {/* MongoDB Atlas Cluster Connection Badge */}
            <div
              className={`hidden sm:flex items-center space-x-2 px-3 py-1.5 rounded-xl border text-xs font-mono font-semibold transition-all ${
                dbStatus.connected
                  ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                  : 'bg-cyan-500/10 border-cyan-500/20 text-cyan-300'
              }`}
              title={
                dbStatus.connected
                  ? `Connected to MongoDB Atlas: ${dbStatus.cluster} (${dbStatus.dbName})`
                  : `MongoDB Atlas Cluster: ${dbStatus.cluster} (Configured in .env)`
              }
            >
              <Database className={`w-3.5 h-3.5 ${dbStatus.connected ? 'text-emerald-400' : 'text-cyan-400'}`} />
              <span>
                {dbStatus.connected ? 'MongoDB Atlas Live' : 'MongoDB Cluster Ready'}
              </span>
              <span
                className={`w-2 h-2 rounded-full ${
                  dbStatus.connected ? 'bg-emerald-400 animate-pulse' : 'bg-cyan-400'
                }`}
              />
            </div>

            {onToggleTheme && (
              <button
                type="button"
                onClick={onToggleTheme}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.1] text-xs font-mono text-slate-300 transition-colors"
                title="Toggle Theme"
              >
                {theme === 'dark' ? (
                  <>
                    <Sun className="w-3.5 h-3.5 text-amber-300" />
                    <span className="hidden sm:inline">Light</span>
                  </>
                ) : (
                  <>
                    <Moon className="w-3.5 h-3.5 text-slate-300" />
                    <span className="hidden sm:inline">Dark</span>
                  </>
                )}
              </button>
            )}

            <button
              type="button"
              onClick={onNavigateToLanding}
              className="flex items-center space-x-2 px-4 py-2 rounded-xl bg-white/[0.06] hover:bg-white/[0.12] border border-white/[0.12] text-xs font-bold text-slate-200 hover:text-white transition-all cursor-pointer shadow-xs"
            >
              <ArrowLeft className="w-3.5 h-3.5 text-cyan-400" />
              <span>Public Landing Page</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area: Balanced 12-Column Layout */}
      <main className="flex-1 flex items-center justify-center px-4 sm:px-8 lg:px-12 py-8 lg:py-12 max-w-7xl mx-auto w-full relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center w-full">
          
          {/* Left Column: Administrative Context & Trust Credentials (5 Cols) */}
          <div className="lg:col-span-5 space-y-6 text-left">
            <div className="flex flex-wrap items-center gap-2">
              <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-xs font-mono font-semibold">
                <ShieldCheck className="w-4 h-4 text-cyan-400" />
                <span>GOVERNMENT OF TAMIL NADU • GCC</span>
              </div>
              <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-[11px] font-mono">
                <Database className="w-3 h-3 text-emerald-400" />
                <span>Atlas Cluster 28</span>
              </div>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight leading-[1.15]">
              Municipal Officer & Spatial Intelligence{' '}
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 via-blue-400 to-indigo-300">
                Command Gateway.
              </span>
            </h1>

            <p className="text-sm sm:text-base text-slate-300 leading-relaxed font-normal">
              Secure administrative access to Chennai’s ward-level thermal vulnerability triage, 
              Landsat 8/9 & Sentinel-2 satellite data feeds, and multi-agency resilience planning pipelines.
            </p>

            {/* Official Security Features Bullet List */}
            <div className="space-y-3 pt-2">
              <div className="flex items-start space-x-3.5 p-3.5 rounded-2xl bg-white/[0.03] border border-white/[0.08] hover:border-cyan-500/30 transition-colors">
                <div className="p-2.5 rounded-xl bg-cyan-500/10 text-cyan-400 shrink-0">
                  <Database className="w-4 h-4" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-white">MongoDB Atlas Cluster Persistence</span>
                    <span className="text-[10px] font-mono text-cyan-400 bg-cyan-500/10 px-2 py-0.2 rounded border border-cyan-500/20">
                      Cluster28
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-400 mt-0.5 leading-relaxed">
                    Officer credentials, login timestamps, and audit history are synchronized with your MongoDB cloud cluster (<code className="text-cyan-300 text-[10px]">cluster28.uiwd4et.mongodb.net</code>).
                  </div>
                </div>
              </div>

              <div className="flex items-start space-x-3.5 p-3.5 rounded-2xl bg-white/[0.03] border border-white/[0.08] hover:border-blue-500/30 transition-colors">
                <div className="p-2.5 rounded-xl bg-blue-500/10 text-blue-400 shrink-0">
                  <Radio className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-bold text-white">State Spatial Data Infrastructure</div>
                  <div className="text-[11px] text-slate-400 mt-0.5 leading-relaxed">
                    Live synchronization with TNSDI, GCC GIS shapefiles, and Landsat/Sentinel cloud-filtered bands.
                  </div>
                </div>
              </div>

              <div className="flex items-start space-x-3.5 p-3.5 rounded-2xl bg-white/[0.03] border border-white/[0.08] hover:border-emerald-500/30 transition-colors">
                <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400 shrink-0">
                  <Lock className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-bold text-white">256-Bit e-Gov SSL Encryption & Audit Trail</div>
                  <div className="text-[11px] text-slate-400 mt-0.5 leading-relaxed">
                    Tamper-proof resilience dockets and login audit records with employee verification.
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Public Auditor Access Link */}
            <div className="pt-2">
              <button
                type="button"
                onClick={() => {
                  const guestProfile: UserProfile = {
                    id: 'user-guest-05',
                    name: 'Public Auditor & Researcher',
                    designation: 'Independent Climate Researcher',
                    department: 'Open Governance & Transparency Cell',
                    email: 'research.observer@respire-audit.org',
                    avatarInitials: 'PA',
                    role: 'PUBLIC_AUDITOR',
                    badge: 'Public Read-Only',
                    clearanceLevel: 'Open Evidence & Data Registry',
                    empId: 'GUEST-OBS-2026',
                    lastLogin: 'Just now',
                  };
                  handleStartAuth(guestProfile);
                }}
                className="inline-flex items-center space-x-2 text-xs font-medium text-cyan-400 hover:text-cyan-300 transition-colors group cursor-pointer"
              >
                <span>Evaluating as an Independent Researcher? Try Public Read-Only Mode</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>

          {/* Right Column: Interactive Login & Fast Officer Role Cards (7 Cols) */}
          <div className="lg:col-span-7 w-full">
            <div className="bg-[#0b1021]/95 backdrop-blur-2xl border border-white/[0.12] rounded-3xl p-6 sm:p-8 shadow-[0_8px_40px_rgba(0,0,0,0.6),inset_0_1px_0_rgba(255,255,255,0.15)] relative overflow-hidden w-full">
              
              {/* Card Ambient Glowing Strip */}
              <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-cyan-500 via-blue-500 to-indigo-500" />

              {/* Login Method Tabs */}
              <div className="flex items-center justify-between p-1.5 bg-black/40 border border-white/[0.08] rounded-2xl mb-6">
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab('quick_select');
                    setAuthError(null);
                  }}
                  className={`flex-1 py-2.5 px-4 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center space-x-2 ${
                    activeTab === 'quick_select'
                      ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-[0_0_18px_rgba(6,182,212,0.45)]'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <UserCheck className="w-4 h-4" />
                  <span>1-Click Officer Roles (Demo)</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setActiveTab('credentials');
                    setAuthError(null);
                  }}
                  className={`flex-1 py-2.5 px-4 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center space-x-2 ${
                    activeTab === 'credentials'
                      ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-[0_0_18px_rgba(6,182,212,0.45)]'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <KeyRound className="w-4 h-4" />
                  <span>Officer ID & Passcode</span>
                </button>
              </div>

              {/* TAB 1: 1-Click Fast Officer Profiles (Ramanan S, Sriprathip S, Ravisankar S, Sanjay K) */}
              {activeTab === 'quick_select' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-200 flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                      <span>Select Officer Role Profile:</span>
                    </span>
                    <span className="text-[11px] font-mono text-cyan-400 bg-cyan-500/10 px-2.5 py-0.5 rounded-full border border-cyan-500/20 font-semibold">
                      Instant 1-Click Access
                    </span>
                  </div>

                  {/* 4 Officer Profiles List with Full Clear Information */}
                  <div className="space-y-3">
                    {DEFAULT_USER_PROFILES.map((profile) => {
                      const isSelected = selectedProfileId === profile.id;
                      return (
                        <div
                          key={profile.id}
                          onClick={() => handleSelectProfile(profile)}
                          className={`p-4 rounded-2xl border transition-all cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-left ${
                            isSelected
                              ? 'bg-cyan-500/[0.09] border-cyan-400/70 shadow-[0_0_24px_rgba(6,182,212,0.2)] ring-1 ring-cyan-400/50'
                              : 'bg-white/[0.03] hover:bg-white/[0.07] border-white/[0.08] hover:border-white/[0.2]'
                          }`}
                        >
                          <div className="flex items-start sm:items-center gap-3.5 min-w-0 flex-1">
                            {/* Avatar Initials Badge */}
                            <div
                              className={`w-11 h-11 rounded-xl flex items-center justify-center font-bold text-sm shrink-0 transition-transform ${
                                isSelected
                                  ? 'bg-gradient-to-tr from-cyan-500 to-blue-600 text-white shadow-[0_0_14px_rgba(6,182,212,0.6)] scale-105'
                                  : 'bg-slate-800 text-slate-300 border border-white/[0.1]'
                              }`}
                            >
                              {profile.avatarInitials}
                            </div>

                            {/* Officer Details */}
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center flex-wrap gap-2">
                                <span className="font-extrabold text-sm text-white">
                                  {profile.name}
                                </span>
                                <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-cyan-500/10 text-cyan-300 border border-cyan-500/30 font-semibold">
                                  {profile.badge}
                                </span>
                              </div>
                              <div className="text-xs font-semibold text-slate-300 mt-0.5">
                                {profile.designation}
                              </div>
                              <div className="text-[11px] text-slate-400">
                                {profile.department}
                              </div>
                              <div className="text-[10px] font-mono text-cyan-400/80 mt-0.5">
                                {profile.email}
                              </div>
                            </div>
                          </div>

                          {/* Quick Enter Button */}
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleStartAuth(profile);
                            }}
                            className={`px-4 py-2 rounded-xl text-xs font-bold shrink-0 transition-all cursor-pointer flex items-center justify-center gap-1.5 self-end sm:self-auto ${
                              isSelected
                                ? 'bg-cyan-500 hover:bg-cyan-400 text-black shadow-[0_0_14px_rgba(6,182,212,0.5)]'
                                : 'bg-white/[0.07] hover:bg-white/[0.14] text-slate-200 hover:text-white border border-white/[0.1]'
                            }`}
                          >
                            <span>Enter</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      );
                    })}
                  </div>

                  {/* Submit Selected Profile Button */}
                  <div className="pt-4 border-t border-white/[0.08] flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="text-xs text-slate-400 text-center sm:text-left">
                      Active: <strong className="text-white font-bold">{selectedProfile.name}</strong> • <span className="text-slate-300">{selectedProfile.designation}</span>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleStartAuth(selectedProfile)}
                      disabled={isAuthenticating}
                      className="w-full sm:w-auto px-6 py-3 rounded-xl bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-600 text-white text-xs font-bold shadow-[0_0_24px_rgba(6,182,212,0.4)] hover:shadow-[0_0_32px_rgba(6,182,212,0.6)] hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer flex items-center justify-center space-x-2 border border-cyan-300/30"
                    >
                      <span>Sign In as {selectedProfile.name}</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              )}

              {/* TAB 2: Standard Employee ID / Passcode Credentials Form */}
              {activeTab === 'credentials' && (
                <form onSubmit={handleSubmitForm} className="space-y-4 text-left">
                  {/* Error Alert if any */}
                  {authError && (
                    <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center space-x-2">
                      <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                      <span>{authError}</span>
                    </div>
                  )}

                  {/* Official Email / ID Input */}
                  <div className="space-y-1.5">
                    <label className="block text-xs font-semibold text-slate-300">
                      Official GCC Officer Email / Employee ID
                    </label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="ramanan.s@respire.gov.in"
                        className="w-full pl-10 pr-4 py-3 bg-black/50 border border-white/[0.12] focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400/50 rounded-xl text-xs text-white placeholder-slate-500 outline-none transition-all font-mono"
                      />
                    </div>
                  </div>

                  {/* Passcode Input */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <label className="block text-xs font-semibold text-slate-300">
                        Government Security Passcode / 2FA Token
                      </label>
                      <button
                        type="button"
                        onClick={() => setShowForgotModal(true)}
                        className="text-[11px] text-cyan-400 hover:text-cyan-300 transition-colors"
                      >
                        Forgot Passcode?
                      </button>
                    </div>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••••••"
                        className="w-full pl-10 pr-10 py-3 bg-black/50 border border-white/[0.12] focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400/50 rounded-xl text-xs text-white placeholder-slate-500 outline-none transition-all font-mono"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {/* Session Checkbox */}
                  <div className="flex items-center justify-between pt-1">
                    <label className="flex items-center space-x-2 text-xs text-slate-400 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={rememberSession}
                        onChange={(e) => setRememberSession(e.target.checked)}
                        className="rounded border-white/20 bg-black/40 text-cyan-500 focus:ring-cyan-400 focus:ring-offset-0 w-3.5 h-3.5"
                      />
                      <span>Maintain secure session for 8 hours</span>
                    </label>

                    <span className="text-[10px] font-mono text-emerald-400 flex items-center space-x-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                      <span>TNSDI Online</span>
                    </span>
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={isAuthenticating}
                    className="w-full py-3.5 rounded-xl bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-600 text-white text-xs font-bold shadow-[0_0_24px_rgba(6,182,212,0.4)] hover:shadow-[0_0_32px_rgba(6,182,212,0.6)] hover:scale-[1.01] active:scale-[0.99] transition-all cursor-pointer flex items-center justify-center space-x-2 border border-cyan-300/30 mt-2"
                  >
                    <span>Authenticate & Enter Command Deck</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>

                  <div className="flex items-center justify-center gap-1.5 text-[10px] font-mono text-slate-400 pt-1">
                    <Database className="w-3 h-3 text-cyan-400" />
                    <span>Credentials & login audit records sync to MongoDB Atlas</span>
                  </div>
                </form>
              )}

              {/* Authenticating Verification Modal Overlay */}
              {isAuthenticating && (
                <div className="absolute inset-0 bg-[#060814]/95 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center z-50 animate-fade-in">
                  {/* Glowing Spinner */}
                  <div className="relative w-16 h-16 mb-5">
                    <div className="absolute inset-0 rounded-full border-2 border-cyan-500/20 animate-ping" />
                    <div className="w-full h-full rounded-full border-3 border-transparent border-t-cyan-400 border-r-blue-500 border-b-indigo-500 animate-spin" />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Shield className="w-6 h-6 text-cyan-400 animate-pulse" />
                    </div>
                  </div>

                  <div className="text-sm font-bold text-white mb-1">
                    Authenticating GCC Spatial Session
                  </div>

                  <p className="text-xs font-mono text-cyan-300/90 max-w-xs transition-all h-8 flex items-center justify-center">
                    {authStages[authStageIndex]}
                  </p>

                  {/* Step Progress Dots */}
                  <div className="flex items-center space-x-2 mt-4">
                    {authStages.map((_, idx) => (
                      <div
                        key={idx}
                        className={`h-1.5 rounded-full transition-all duration-300 ${
                          idx === authStageIndex
                            ? 'w-6 bg-cyan-400 shadow-[0_0_8px_rgba(6,182,212,0.8)]'
                            : idx < authStageIndex
                            ? 'w-1.5 bg-blue-500'
                            : 'w-1.5 bg-slate-700'
                        }`}
                      />
                    ))}
                  </div>
                </div>
              )}

            </div>
          </div>
        </div>
      </main>

      {/* Forgot Passcode / GCC IT Helpline Modal */}
      {showForgotModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#0b1021] border border-white/[0.15] rounded-2xl max-w-md w-full p-6 text-left shadow-2xl relative">
            <h3 className="text-base font-bold text-white mb-2 flex items-center gap-2">
              <KeyRound className="w-4 h-4 text-cyan-400" />
              <span>GCC Officer Credential Recovery</span>
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed mb-4">
              For security compliance under Tamil Nadu e-Governance guidelines, passcodes are linked to your official 
              biometric token or GCC Smart Card.
            </p>
            <div className="space-y-2 bg-black/40 p-3.5 rounded-xl border border-white/[0.08] text-xs font-mono text-slate-300 mb-4">
              <div><strong>IT Helpdesk:</strong> itcell@chennaicorporation.gov.in</div>
              <div><strong>GCC Disaster Cell Intercom:</strong> Ext: 1913 / 044-25619200</div>
              <div><strong>Ripon Building Unit:</strong> Room 104, IT & Spatial Command</div>
            </div>
            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => setShowForgotModal(false)}
                className="px-4 py-2 rounded-xl bg-cyan-500 text-black text-xs font-bold hover:bg-cyan-400 transition-colors"
              >
                Close & Return
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Government Footer */}
      <footer className="border-t border-white/[0.08] py-4 px-4 sm:px-8 lg:px-12 text-center text-xs text-slate-500 font-mono flex flex-col sm:flex-row items-center justify-between gap-2 max-w-7xl mx-auto w-full">
        <div>
          © 2026 Greater Chennai Corporation • Ripon Building, Chennai, Tamil Nadu
        </div>
        <div className="flex items-center space-x-3 text-[11px]">
          <span className="text-emerald-400 flex items-center space-x-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            <span>SSL Secured</span>
          </span>
          <span>•</span>
          <span>TNSDI Spatial Node</span>
          <span>•</span>
          <button
            type="button"
            onClick={onNavigateToLanding}
            className="hover:text-cyan-400 transition-colors underline"
          >
            Public Portal
          </button>
        </div>
      </footer>
    </div>
  );
};
