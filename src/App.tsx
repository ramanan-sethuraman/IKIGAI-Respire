import { useState, useEffect, useMemo } from 'react';
import type { Zone } from './types';
import type { DataSourceMode, DataProvenanceSummary } from './data';
import { type UserProfile, DEFAULT_USER_PROFILES } from './types/auth';
import { respireApi } from './services';
import { respireScoringEngine } from './core/scoring/scoringEngine';
import {
  type WorkflowTab,
  OverviewView,
  DataView,
  RiskMap,
  SelectedZonePanel,
  ExplainView,
  RecommendView,
  PrioritizeView,
  PlanningView,
  ReportsView,
} from './components/dashboard';
import { LandingPage } from './components/landing';
import { LoginPage } from './components/auth';
import { Sidebar } from './components/layout/Sidebar';
import { TopBar } from './components/layout/TopBar';
import { Footer } from './components/layout/Footer';
import { HelpGuideModal } from './components/modal/HelpGuideModal';
import { HeatPlanModal } from './components/modal/HeatPlanModal';
import { ChennaiZonesModal } from './components/modal/ChennaiZonesModal';

/**
 * Main application container for the RESPIRE Climate Resilience Decision Support Platform.
 */
export function App() {
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    const saved = localStorage.getItem('respire_theme');
    if (saved === 'dark' || saved === 'light') return saved;
    return window.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  });
  const [viewMode, setViewMode] = useState<'landing' | 'login' | 'console'>('landing');
  const [currentUser, setCurrentUser] = useState<UserProfile>(() => {
    const saved = localStorage.getItem('respire_user_profile');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        // Fallback to default commissioner profile
      }
    }
    return DEFAULT_USER_PROFILES[0];
  });
  const [dataSourceMode, setDataSourceMode] = useState<DataSourceMode>('processed');
  const [zones, setZones] = useState<Zone[]>([]);
  const [selectedZoneId, setSelectedZoneId] = useState<string>('ward-045');
  const [activeWorkflowTab, setActiveWorkflowTab] = useState<WorkflowTab>('overview');
  const [provenanceSummary, setProvenanceSummary] = useState<DataProvenanceSummary>(
    respireApi.getProvenanceMetadata()
  );
  const [searchQuery, setSearchQuery] = useState('');
  const [showHelpModal, setShowHelpModal] = useState(false);
  const [showHeatPlanModal, setShowHeatPlanModal] = useState(false);
  const [showChennaiZonesModal, setShowChennaiZonesModal] = useState(false);

  // Sync theme with document.documentElement
  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('respire_theme', theme);
  }, [theme]);

  // Persist logged-in user profile
  useEffect(() => {
    localStorage.setItem('respire_user_profile', JSON.stringify(currentUser));
  }, [currentUser]);

  const handleToggleTheme = () => {
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
  };

  // Fetch zones on initial mount or when data mode toggles
  useEffect(() => {
    respireApi.setDataSourceMode(dataSourceMode);
    /**
     * Loads spatial zone datasets and synchronizes active telemetry.
     */
    async function loadZones() {
      const data = await respireApi.fetchZones();
      setZones(data);
      if (data.length > 0) {
        setSelectedZoneId((prev) => {
          const stillValid = data.some(
            (z) => (z.zoneId || z.id || z.wardId) === prev
          );
          if (stillValid && prev) return prev;
          return data[0].zoneId || data[0].id || data[0].wardId || '';
        });
      }
      setProvenanceSummary(respireApi.getProvenanceMetadata());
    }
    loadZones();
  }, [dataSourceMode]);

  // Compute domain risk scores dynamically via respireScoringEngine
  const scoredZones = useMemo(() => {
    return zones.map((zone) => {
      const zId = zone.zoneId || zone.id || '';
      const score = respireScoringEngine.calculateScore(zId, zone.metrics);
      return { zone, score };
    });
  }, [zones]);

  const handleModeToggle = (mode: DataSourceMode) => {
    respireApi.setDataSourceMode(mode);
    setDataSourceMode(mode);
  };

  // Filter zones by search query if present
  const filteredScoredZones = useMemo(() => {
    if (!searchQuery.trim()) return scoredZones;
    const q = searchQuery.toLowerCase().trim();
    const cleanNum = q.replace(/^ward\s*/i, '').replace(/^w-?/i, '');
    return scoredZones.filter(({ zone }) => {
      const name = (zone.zoneName || zone.name || '').toLowerCase();
      const wardId = (zone.wardId || '').toLowerCase();
      const wardName = (zone.wardName || '').toLowerCase();
      const zoneId = (zone.zoneId || '').toLowerCase();
      const numMatch =
        cleanNum &&
        /^\d+$/.test(cleanNum) &&
        (wardId === `ward-${cleanNum.padStart(3, '0')}` ||
          wardName.includes(`ward ${cleanNum.padStart(3, '0')}`) ||
          wardName.includes(`ward ${cleanNum}`));

      return (
        name.includes(q) ||
        wardId.includes(q) ||
        wardName.includes(q) ||
        zoneId.includes(q) ||
        numMatch
      );
    });
  }, [scoredZones, searchQuery]);

  // Resolve currently selected zone and its computed score
  const selectedScoredItem = scoredZones.find(
    (item) =>
      (item.zone.zoneId || item.zone.id) === selectedZoneId ||
      item.zone.wardId === selectedZoneId
  );
  const selectedZone = selectedScoredItem?.zone;
  const selectedScore = selectedScoredItem?.score ?? null;

  const handleLaunchConsole = (targetTab?: WorkflowTab, zoneId?: string) => {
    if (targetTab) setActiveWorkflowTab(targetTab);
    if (zoneId) setSelectedZoneId(zoneId);
    setViewMode('console');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleLoginSuccess = (user: UserProfile) => {
    setCurrentUser(user);
    setViewMode('console');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleLogout = () => {
    setViewMode('login');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className={`min-h-screen w-full ${viewMode === 'console' ? 'flex bg-[#f8f9ff] dark:bg-[#0a0c13]' : 'flex flex-col bg-[#060814]'} text-slate-900 dark:text-slate-100 antialiased selection:bg-slate-800 selection:text-white relative transition-colors duration-200`}>
      {viewMode === 'landing' ? (
        <LandingPage
          onLaunchConsole={handleLaunchConsole}
          onNavigateToLogin={() => {
            setViewMode('login');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          onOpenHeatPlan={() => setShowHeatPlanModal(true)}
          onOpenZonesModal={() => setShowChennaiZonesModal(true)}
          onOpenHelp={() => setShowHelpModal(true)}
          zones={zones}
        />
      ) : viewMode === 'login' ? (
        <LoginPage
          onLoginSuccess={handleLoginSuccess}
          onNavigateToLanding={() => {
            setViewMode('landing');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          theme={theme}
          onToggleTheme={handleToggleTheme}
        />
      ) : (
        <>
          {/* Left Fixed Sidebar (72 width) */}
          <Sidebar
            activeTab={activeWorkflowTab}
            onSelectTab={setActiveWorkflowTab}
            alertCount={5}
            onSelectZone={setSelectedZoneId}
            onOpenHeatPlan={() => setShowHeatPlanModal(true)}
            onOpenHelp={() => setShowHelpModal(true)}
            onOpenZonesModal={() => setShowChennaiZonesModal(true)}
            onNavigateToLanding={() => {
              setViewMode('landing');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            onNavigateToLogin={() => {
              setViewMode('login');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            currentUser={currentUser}
          />

          {/* Main Command Viewport */}
          <div className="pl-72 flex-1 flex flex-col min-w-0 min-h-screen bg-[#f8f9ff] dark:bg-[#0a0c13] transition-colors duration-200">
            {/* Top Bar Header + Workflow Stepper Ribbon */}
            <TopBar
              dataSourceMode={dataSourceMode}
              onToggleMode={handleModeToggle}
              provenanceSummary={provenanceSummary}
              activeTab={activeWorkflowTab}
              onSelectTab={setActiveWorkflowTab}
              onOpenHelp={() => setShowHelpModal(true)}
              onOpenZonesModal={() => setShowChennaiZonesModal(true)}
              onSelectZone={setSelectedZoneId}
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              onNavigateToLanding={() => {
                setViewMode('landing');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              onNavigateToLogin={() => {
                setViewMode('login');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              onLogout={handleLogout}
              currentUser={currentUser}
              theme={theme}
              onToggleTheme={handleToggleTheme}
            />

            {/* Dynamic Content Workspace */}
            <main className="flex-1 p-6 lg:p-8 max-w-[1600px] w-full mx-auto">
              {activeWorkflowTab === 'overview' ? (
                /* STAGE 00: MUNICIPAL HEAT RISK OVERVIEW */
                <OverviewView
                  scoredZones={scoredZones}
                  onSelectZone={setSelectedZoneId}
                  onNavigateToTab={setActiveWorkflowTab}
                />
              ) : activeWorkflowTab === 'data' ? (
                /* STAGE 01: HEAT & VULNERABILITY DATASET */
                <DataView
                  scoredZones={scoredZones}
                  onSelectZone={setSelectedZoneId}
                  onNavigateToIdentify={(zId) => {
                    if (zId) setSelectedZoneId(zId);
                    setActiveWorkflowTab('identify');
                  }}
                />
              ) : activeWorkflowTab === 'identify' ? (
                /* STAGE 02: IDENTIFY HEAT RISK (URBAN HEAT RISK MAP) */
                <div className="flex flex-col w-full space-y-5">
                  {/* Page Header & Strategic Meta */}
                  <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2 text-xs font-mono text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
                        <span className="w-2 h-2 rounded-full bg-blue-500" />
                        <span className="font-bold text-slate-900 dark:text-white">STAGE 02</span>
                        <span className="text-slate-300 dark:text-slate-600">/</span>
                        <span>URBAN HEAT RISK MAP</span>
                      </div>
                      <h1 className="text-2xl lg:text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
                        Where is the Heat Risk?
                      </h1>
                      <p className="text-sm text-slate-600 dark:text-slate-300 mt-1 max-w-3xl leading-relaxed">
                        Spatial triage across Greater Chennai Corporation wards derived from satellite thermal observations, canopy deficit indices, and vulnerability weighting.
                      </p>
                    </div>

                    {/* Observational Provenance Indicator */}
                    <div className="flex items-center gap-2.5 bg-white dark:bg-gradient-to-b dark:from-[#1b2130] dark:to-[#10131d] border border-slate-200 dark:border-slate-400/50 dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.18),0_2px_6px_rgba(0,0,0,0.5)] px-3.5 py-2 rounded-xl shadow-2xs self-start lg:self-auto">
                      <span className="w-2 h-2 rounded-full bg-blue-500" />
                      <div className="text-left">
                        <div className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">
                          Satellite Observations
                        </div>
                        <div className="text-xs font-mono font-semibold text-slate-800 dark:text-slate-200">
                          Landsat 8/9 & Sentinel-2 · Cloud/QA Filtered
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Primary Workspace: 68% GIS Viewport + 32% Decision Panel */}
                  <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
                    {/* LEFT: GIS MAP VIEWPORT (68% / 8 Cols) */}
                    <div className="xl:col-span-8">
                      <RiskMap
                        scoredZones={filteredScoredZones}
                        selectedZoneId={selectedZoneId}
                        onSelectZone={setSelectedZoneId}
                        onOpenHelp={() => setShowHelpModal(true)}
                        searchQuery={searchQuery}
                        onSearchChange={setSearchQuery}
                      />
                    </div>

                    {/* RIGHT: SELECTED WARD DECISION PANEL (32% / 4 Cols) */}
                    <div className="xl:col-span-4">
                      <SelectedZonePanel
                        selectedZone={selectedZone}
                        score={selectedScore}
                        onNavigateToExplain={() => setActiveWorkflowTab('explain')}
                        onSelectZone={setSelectedZoneId}
                        allZones={scoredZones}
                      />
                    </div>
                  </div>
                </div>
              ) : activeWorkflowTab === 'explain' ? (
                /* STAGE 03: EXPLAIN WHY */
                <ExplainView
                  scoredZones={scoredZones}
                  selectedZoneId={selectedZoneId}
                  onSelectZone={setSelectedZoneId}
                  onNavigateToRecommend={() => setActiveWorkflowTab('recommend')}
                />
              ) : activeWorkflowTab === 'recommend' ? (
                /* STAGE 04: RECOMMEND ACTIONS */
                <RecommendView
                  scoredZones={scoredZones}
                  selectedZoneId={selectedZoneId}
                  onSelectZone={setSelectedZoneId}
                  onNavigateToPrioritize={() => setActiveWorkflowTab('prioritize')}
                />
              ) : activeWorkflowTab === 'prioritize' ? (
                /* STAGE 05: PRIORITIZE & FUND */
                <PrioritizeView
                  zones={zones}
                  scoredZones={scoredZones}
                  selectedZoneId={selectedZoneId}
                  onSelectZone={setSelectedZoneId}
                />
              ) : activeWorkflowTab === 'planning' ? (
                /* STAGE 06: INTERVENTION PLANNING & REVIEW */
                <PlanningView
                  zones={zones}
                  scoredZones={scoredZones}
                  selectedZoneId={selectedZoneId}
                  onSelectZone={setSelectedZoneId}
                  onNavigateToTab={setActiveWorkflowTab}
                />
              ) : (
                /* STAGE 07: REPORTS & DOCKETS */
                <ReportsView scoredZones={scoredZones} />
              )}
            </main>

            {/* Global Footer */}
            <Footer />
          </div>
        </>
      )}

      {/* Operational Help Guide Modal */}
      <HelpGuideModal
        isOpen={showHelpModal}
        onClose={() => setShowHelpModal(false)}
      />

      {/* GCC Heat Action Plan Modal */}
      <HeatPlanModal
        isOpen={showHeatPlanModal}
        onClose={() => setShowHeatPlanModal(false)}
      />

      {/* Chennai Administrative Hierarchy (15 Zones / 200 Wards) Modal */}
      <ChennaiZonesModal
        isOpen={showChennaiZonesModal}
        onClose={() => setShowChennaiZonesModal(false)}
        selectedZoneId={selectedZoneId}
        onSelectZone={setSelectedZoneId}
        dataSourceMode={dataSourceMode}
        onToggleMode={handleModeToggle}
      />
    </div>
  );
}

export default App;
