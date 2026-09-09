import React, { useState } from 'react';
import {
  Calendar,
  CheckCircle2,
  Layers,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';
import type { Zone } from '../../types';
import type { ScoredZoneItem } from './RiskSummaryCards';
import type { WorkflowTab } from './WorkflowHeader';

interface PlanningViewProps {
  zones: Zone[];
  scoredZones: ScoredZoneItem[];
  selectedZoneId: string;
  onSelectZone: (zoneId: string) => void;
  onNavigateToTab?: (tab: WorkflowTab) => void;
}

interface InterventionPlanItem {
  id: string;
  wardId: string;
  wardName: string;
  intervention: string;
  targetSite: string;
  agency: string;
  quarter: string;
  budgetINR: number;
  status: 'Approved' | 'In Review' | 'Site Survey Required';
}

export const PlanningView: React.FC<PlanningViewProps> = ({
  onNavigateToTab,
}) => {
  const [checklist, setChecklist] = useState({
    siteValidation: true,
    utilityFeasibility: true,
    councillorSignoff: false,
    standingCommittee: false,
    tendering: false,
  });

  const [plans] = useState<InterventionPlanItem[]>([
    {
      id: 'plan-01',
      wardId: 'ward-045',
      wardName: 'Vyasarpadi (Zone IV)',
      intervention: 'Modular Outdoor Worker Hydration & Cooling Station',
      targetSite: 'GNT Road Bus Interchange & Market Junction',
      agency: 'GCC Works Dept & Metro Water',
      quarter: 'Q2 2026',
      budgetINR: 72000,
      status: 'Approved',
    },
    {
      id: 'plan-02',
      wardId: 'ward-051',
      wardName: 'Washermanpet (Zone V)',
      intervention: 'High-Albedo Cool Roof Coating Program',
      targetSite: 'Old Washermanpet Tenement Blocks (Cluster A)',
      agency: 'Tamil Nadu Urban Habitat Development Board',
      quarter: 'Q2 2026',
      budgetINR: 120000,
      status: 'In Review',
    },
    {
      id: 'plan-03',
      wardId: 'ward-049',
      wardName: 'Royapuram (Zone V)',
      intervention: 'Urban Canopy Green Buffer Planting',
      targetSite: 'Suriyanarayana Street Railway Border Buffer',
      agency: 'GCC Parks & Playgrounds Department',
      quarter: 'Q3 2026',
      budgetINR: 95000,
      status: 'Site Survey Required',
    },
    {
      id: 'plan-04',
      wardId: 'ward-134',
      wardName: 'T. Nagar (Zone X)',
      intervention: 'Pedestrian Misting & Shade Canopies',
      targetSite: 'Ranganathan Street Pedestrian Plaza',
      agency: 'GCC Smart City SPV & Works',
      quarter: 'Q2 2026',
      budgetINR: 85000,
      status: 'In Review',
    },
    {
      id: 'plan-05',
      wardId: 'ward-077',
      wardName: 'Choolai (Zone VI)',
      intervention: 'Cool Pavement & Shaded Rest Area',
      targetSite: 'Choolai High Road Junction',
      agency: 'GCC Bus Route Roads Dept',
      quarter: 'Q3 2026',
      budgetINR: 65000,
      status: 'Site Survey Required',
    },
  ]);

  const toggleCheck = (key: keyof typeof checklist) => {
    setChecklist((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const completedSteps = Object.values(checklist).filter(Boolean).length;
  const totalBudget = plans.reduce((acc, p) => acc + p.budgetINR, 0);

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header & Meta */}
      <section aria-labelledby="planning-header" className="space-y-3">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <div>
            <div className="flex items-center space-x-2 text-xs font-mono text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
              <span className="inline-block w-2 h-2 rounded-full bg-blue-500"></span>
              <span className="font-bold text-slate-900 dark:text-white">STAGE 06</span>
              <span className="text-slate-300 dark:text-slate-600">/</span>
              <span>INTERVENTION PLANNING & REVIEW</span>
            </div>
            <h1 id="planning-header" className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
              Municipal Intervention Planning
            </h1>
            <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5">
              Coordinate capital intervention schedules, municipal agency assignments, and administrative sign-offs.
            </p>
          </div>

          {/* Quick Metrics */}
          <div className="flex items-center gap-2.5">
            <div className="px-3.5 py-2 bg-white dark:bg-gradient-to-b dark:from-[#1b2130] dark:to-[#10131d] border border-slate-200 dark:border-[#2d364a] rounded-xl text-xs flex items-center gap-2">
              <Calendar className="w-4 h-4 text-blue-500" />
              <div>
                <span className="text-[10px] text-slate-400 uppercase block">Implementation Horizon</span>
                <span className="font-bold font-mono text-slate-800 dark:text-slate-200">FY 2026-27 (Q2-Q4)</span>
              </div>
            </div>
          </div>
        </div>

        {/* 3 Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 pt-1">
          <div className="p-4 rounded-2xl bg-white dark:bg-gradient-to-b dark:from-[#181d2a] dark:to-[#11141e] border border-slate-200 dark:border-[#2d364a] space-y-1.5 shadow-xs dark:shadow-[0_2px_8px_rgba(0,0,0,0.5),inset_0_1px_0_rgba(255,255,255,0.1)]">
            <span className="text-[10px] font-mono uppercase tracking-wider text-slate-500 dark:text-slate-400 block font-bold">
              Scheduled Interventions
            </span>
            <div className="flex items-baseline space-x-2">
              <span className="text-3xl font-extrabold font-mono text-blue-600 dark:text-blue-400">
                {plans.length}
              </span>
              <span className="text-xs text-slate-500 font-mono">
                priority sites
              </span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Assigned to 4 municipal engineering departments
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-white dark:bg-gradient-to-b dark:from-[#181d2a] dark:to-[#11141e] border border-slate-200 dark:border-[#2d364a] space-y-1.5 shadow-xs dark:shadow-[0_2px_8px_rgba(0,0,0,0.5),inset_0_1px_0_rgba(255,255,255,0.1)]">
            <span className="text-[10px] font-mono uppercase tracking-wider text-slate-500 dark:text-slate-400 block font-bold">
              Total Budget Commitment
            </span>
            <div className="text-3xl font-extrabold font-mono text-slate-900 dark:text-white">
              ₹{totalBudget.toLocaleString('en-IN')}
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Aggregated across active planning items
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-white dark:bg-gradient-to-b dark:from-[#181d2a] dark:to-[#11141e] border border-slate-200 dark:border-[#2d364a] space-y-1.5 shadow-xs dark:shadow-[0_2px_8px_rgba(0,0,0,0.5),inset_0_1px_0_rgba(255,255,255,0.1)]">
            <span className="text-[10px] font-mono uppercase tracking-wider text-slate-500 dark:text-slate-400 block font-bold">
              Checklist Progress
            </span>
            <div className="flex items-baseline space-x-2">
              <span className="text-3xl font-extrabold font-mono text-emerald-600 dark:text-emerald-400">
                {completedSteps} / 5
              </span>
              <span className="text-xs text-slate-500 font-mono">steps cleared</span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Standing committee review pending
            </p>
          </div>
        </div>
      </section>

      {/* Main Grid: Left Column (Intervention Table) & Right Column (Checklist & Sign-Off) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Column (8 cols): Action Plan Table */}
        <div className="lg:col-span-8 space-y-6">
          <section className="rounded-2xl border border-slate-200 dark:border-[#2d364a] bg-white dark:bg-gradient-to-b dark:from-[#181d2a] dark:to-[#11141e] p-5 space-y-4 shadow-xs dark:shadow-[0_2px_8px_rgba(0,0,0,0.5),inset_0_1px_0_rgba(255,255,255,0.1)]">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-[#252d3d] pb-3.5">
              <div className="flex items-center space-x-2">
                <Layers className="w-4 h-4 text-blue-500 shrink-0" />
                <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-slate-200">
                  WARD INTERVENTION PIPELINE
                </h2>
              </div>
              <span className="text-[11px] font-mono text-slate-400">
                {plans.length} Action Items
              </span>
            </div>

            <div className="space-y-3">
              {plans.map((p) => (
                <div
                  key={p.id}
                  className="p-4 rounded-xl border border-slate-200 dark:border-[#272f42] bg-slate-50/70 dark:bg-[#131724] space-y-2.5 transition-all hover:border-slate-300 dark:hover:border-slate-600"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-slate-900 dark:text-white">
                          {p.wardName}
                        </span>
                        <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-200 dark:bg-[#202738] text-slate-600 dark:text-slate-400">
                          {p.wardId}
                        </span>
                      </div>
                      <p className="text-xs font-semibold text-blue-600 dark:text-blue-400 mt-0.5">
                        {p.intervention}
                      </p>
                    </div>

                    <span
                      className={`px-2.5 py-1 text-[10px] font-bold rounded-md uppercase font-mono self-start sm:self-auto ${
                        p.status === 'Approved'
                          ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                          : p.status === 'In Review'
                          ? 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300'
                          : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                      }`}
                    >
                      {p.status}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-2 border-t border-slate-200 dark:border-slate-700/60 text-xs">
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase block">Target Site</span>
                      <span className="text-slate-700 dark:text-slate-300 font-medium">{p.targetSite}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase block">Implementing Agency</span>
                      <span className="text-slate-700 dark:text-slate-300 font-medium">{p.agency}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase block">Target Timeline & Budget</span>
                      <span className="font-mono font-bold text-slate-900 dark:text-white">
                        {p.quarter} · ₹{p.budgetINR.toLocaleString('en-IN')}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* Right Column (4 cols): Municipal Review & Approval Checklist */}
        <div className="lg:col-span-4 space-y-6">
          <section className="rounded-2xl border border-slate-200 dark:border-[#2d364a] bg-white dark:bg-gradient-to-b dark:from-[#181d2a] dark:to-[#11141e] p-5 space-y-4 shadow-xs dark:shadow-[0_2px_8px_rgba(0,0,0,0.5),inset_0_1px_0_rgba(255,255,255,0.1)]">
            <div className="border-b border-slate-100 dark:border-[#252d3d] pb-3">
              <div className="flex items-center space-x-2">
                <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
                <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-slate-200">
                  MUNICIPAL REVIEW CHECKLIST
                </h2>
              </div>
              <p className="text-[11px] text-slate-500 mt-1">
                Standard operating procedure for GCC heat resilience deployments.
              </p>
            </div>

            <div className="space-y-2.5">
              {[
                { key: 'siteValidation', label: '1. Field Site Validation', desc: 'Confirm physical coordinates, roof integrity, and water supply access.' },
                { key: 'utilityFeasibility', label: '2. Engineering Feasibility', desc: 'Verify pipeline pressure for hydration misting and electrical connections.' },
                { key: 'councillorSignoff', label: '3. Ward Councillor Sign-Off', desc: 'Present site plan at Ward Committee meeting and obtain sign-off.' },
                { key: 'standingCommittee', label: '4. Standing Committee Approval', desc: 'GCC Works & Public Health Committee administrative sanction.' },
                { key: 'tendering', label: '5. Work Order & Tendering', desc: 'Publish open tender or assign rate contract for immediate execution.' },
              ].map((step) => {
                const isChecked = checklist[step.key as keyof typeof checklist];
                return (
                  <button
                    key={step.key}
                    type="button"
                    onClick={() => toggleCheck(step.key as keyof typeof checklist)}
                    className={`w-full text-left p-3 rounded-xl border transition-all cursor-pointer flex items-start gap-3 ${
                      isChecked
                        ? 'bg-emerald-50/60 dark:bg-emerald-950/20 border-emerald-300 dark:border-emerald-800/60'
                        : 'bg-slate-50 dark:bg-[#131724] border-slate-200 dark:border-[#272f42]'
                    }`}
                  >
                    <div className="mt-0.5">
                      {isChecked ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                      ) : (
                        <div className="w-4 h-4 rounded border-2 border-slate-300 dark:border-slate-600" />
                      )}
                    </div>
                    <div>
                      <div className={`text-xs font-bold ${isChecked ? 'text-emerald-900 dark:text-emerald-200' : 'text-slate-800 dark:text-slate-200'}`}>
                        {step.label}
                      </div>
                      <p className="text-[11px] text-slate-500 mt-0.5 leading-tight">
                        {step.desc}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Quick Action to Reports */}
            {onNavigateToTab && (
              <button
                type="button"
                onClick={() => onNavigateToTab('reports')}
                className="w-full py-2.5 px-3 rounded-xl bg-[#0b1c30] hover:bg-slate-800 text-white dark:bg-gradient-to-b dark:from-[#242e44] dark:to-[#141826] dark:border dark:border-slate-300 dark:text-white text-xs font-bold transition-all flex items-center justify-between cursor-pointer group shadow-2xs mt-3"
              >
                <span>Generate Council Docket</span>
                <span className="flex items-center gap-1 text-[11px] font-mono group-hover:translate-x-0.5 transition-transform">
                  07 REPORTS <ArrowRight className="w-3.5 h-3.5" />
                </span>
              </button>
            )}
          </section>
        </div>
      </div>
    </div>
  );
};
