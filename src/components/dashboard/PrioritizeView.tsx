import React from 'react';
import {
  FileQuestion,
  ChevronDown,
  ArrowUpDown,
} from 'lucide-react';
import type { Zone } from '../../types';
import { respirePrioritizationEngine } from '../../core/services/prioritization/prioritizationEngine';
import type { ScoredZoneItem } from './RiskSummaryCards';

interface PrioritizeViewProps {
  zones: Zone[];
  scoredZones?: ScoredZoneItem[];
  selectedZoneId: string;
  onSelectZone: (zoneId: string) => void;
}

/**
 * RESPIRE Stage 05 — PRIORITIZE & FUND
 * 
 * Answers: "If funding is limited, what should we consider first?"
 */
export const PrioritizeView: React.FC<PrioritizeViewProps> = ({
  zones,
  scoredZones: _scoredZones,
  selectedZoneId,
  onSelectZone,
}) => {
  // 1. Run domain prioritization engine across zones (deterministic)
  const prioritizationResult = respirePrioritizationEngine.prioritizeZones(zones, {
    documentedDate: '2026-03-01T00:00:00Z',
  });

  const { rankedPriorities, unrankedPriorities } = prioritizationResult;

  // 2. Resolve selected priority item
  const selectedPriority =
    rankedPriorities.find((p) => p.zoneId === selectedZoneId) ||
    unrankedPriorities.find((p) => p.zoneId === selectedZoneId) ||
    rankedPriorities[0];

  // 3. Indicative Budget Summary Calculation
  const totalRankedCost = rankedPriorities.reduce(
    (acc, p) => acc + (p.indicativeCost ?? 0),
    0
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Page Title & Context Header */}
      <section aria-labelledby="prioritize-header" className="space-y-3">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <div>
            <div className="flex items-center space-x-2 text-xs font-mono text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
              <span className="inline-block w-2 h-2 rounded-full bg-blue-500"></span>
              <span className="font-bold text-slate-900 dark:text-white">STAGE 05</span>
              <span className="text-slate-300 dark:text-slate-600">/</span>
              <span>PRIORITIZE & FUND</span>
            </div>
            <h1 id="prioritize-header" className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
              Municipal Capital Allocation & Prioritization
            </h1>
            <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5">
              If funding is limited, which cooling intervention should be funded first, and why?
            </p>
          </div>

          {/* Accessible Zone Switcher Dropdown */}
          <div className="flex items-center space-x-2.5">
            <label htmlFor="zone-select-prio" className="text-xs text-slate-600 dark:text-slate-400 font-medium whitespace-nowrap">
              Focus Ward:
            </label>
            <div className="relative inline-block w-64">
              <select
                id="zone-select-prio"
                aria-label="Select Ward to Inspect Prioritization"
                value={selectedPriority?.zoneId || ''}
                onChange={(e) => onSelectZone(e.target.value)}
                className="w-full appearance-none bg-white dark:bg-[#151926] border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 pr-8 text-xs font-medium text-slate-800 dark:text-slate-200 focus:outline-hidden focus:border-blue-500 cursor-pointer shadow-2xs"
              >
                {rankedPriorities.map((p) => (
                  <option key={p.zoneId} value={p.zoneId} className="bg-white dark:bg-[#151926] text-slate-800 dark:text-slate-200">
                    #{p.rank} {p.zoneName} (Prio: {p.priorityScore}/100)
                  </option>
                ))}
                {unrankedPriorities.map((p) => (
                  <option key={p.zoneId} value={p.zoneId} className="bg-white dark:bg-[#151926] text-slate-500 dark:text-slate-400">
                    [Unranked] {p.zoneName}
                  </option>
                ))}
              </select>
              <ChevronDown className="w-4 h-4 text-slate-400 absolute right-2.5 top-2.5 pointer-events-none" />
            </div>
          </div>
        </div>

        {/* Indicative Budget & Decision Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 pt-1">
          <div className="p-4 rounded-2xl bg-white dark:bg-gradient-to-b dark:from-[#181d2a] dark:to-[#11141e] border border-slate-200 dark:border-[#2d364a] space-y-1.5 shadow-xs dark:shadow-[0_2px_8px_rgba(0,0,0,0.5),inset_0_1px_0_rgba(255,255,255,0.1)]">
            <span className="text-[10px] font-mono uppercase tracking-wider text-slate-500 dark:text-slate-400 block font-bold">
              Ranked Funding Candidates
            </span>
            <div className="flex items-baseline space-x-2">
              <span className="text-3xl font-extrabold font-mono text-blue-600 dark:text-blue-400">
                {rankedPriorities.length}
              </span>
              <span className="text-xs text-slate-500 font-mono">
                / {prioritizationResult.totalZonesEvaluated} wards evaluated
              </span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              {unrankedPriorities.length} wards isolated (insufficient telemetry)
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-white dark:bg-gradient-to-b dark:from-[#181d2a] dark:to-[#11141e] border border-slate-200 dark:border-[#2d364a] space-y-1.5 shadow-xs dark:shadow-[0_2px_8px_rgba(0,0,0,0.5),inset_0_1px_0_rgba(255,255,255,0.1)]">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono uppercase tracking-wider text-slate-500 dark:text-slate-400 block font-bold">
                Total Indicative Requirement
              </span>
              <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300 font-bold">
                PLANNING ESTIMATE
              </span>
            </div>
            <div className="text-3xl font-extrabold font-mono text-slate-900 dark:text-white">
              ₹{totalRankedCost.toLocaleString('en-IN')}
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Sum for top {rankedPriorities.length} candidate interventions
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-white dark:bg-gradient-to-b dark:from-[#181d2a] dark:to-[#11141e] border border-slate-200 dark:border-[#2d364a] space-y-1.5 shadow-xs dark:shadow-[0_2px_8px_rgba(0,0,0,0.5),inset_0_1px_0_rgba(255,255,255,0.1)]">
            <span className="text-[10px] font-mono uppercase tracking-wider text-slate-500 dark:text-slate-400 block font-bold">
              Prioritization Formula
            </span>
            <div className="text-xs font-mono font-bold text-slate-800 dark:text-slate-200 pt-1">
              (Need × 50%) + (Impact × 30%) + (Cost Eff. × 20%)
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Deterministic, explainable municipal decision weighting
            </p>
          </div>
        </div>
      </section>

      {/* Main Grid: Left Column (Ranked Table & Unranked) & Right Column (Selected Ward Breakdown) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Column (7 cols): Priority Ranking Table */}
        <div className="lg:col-span-7 space-y-6">

          {/* 1. Priority Ranking List */}
          <section
            aria-labelledby="ranking-table-heading"
            className="rounded-2xl border border-slate-200 dark:border-[#2d364a] bg-white dark:bg-gradient-to-b dark:from-[#181d2a] dark:to-[#11141e] p-5 space-y-4 shadow-xs dark:shadow-[0_2px_8px_rgba(0,0,0,0.5),inset_0_1px_0_rgba(255,255,255,0.1)]"
          >
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-slate-100 dark:border-[#252d3d] pb-3.5">
              <div className="flex items-center space-x-2">
                <ArrowUpDown className="w-4 h-4 text-blue-500 shrink-0" />
                <h2 id="ranking-table-heading" className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-slate-200">
                  MUNICIPAL FUNDING DECISION RANKING ({rankedPriorities.length} Ranked)
                </h2>
              </div>
              <span className="text-[10px] font-mono text-slate-500 dark:text-slate-400 whitespace-nowrap">
                Sorted by Planning Priority Score
              </span>
            </div>

            <div className="space-y-2.5">
              {rankedPriorities.map((item) => {
                const isSelected = item.zoneId === selectedPriority?.zoneId;
                const isTop1 = item.rank === 1;

                return (
                  <button
                    key={item.zoneId}
                    type="button"
                    onClick={() => onSelectZone(item.zoneId)}
                    className={`w-full text-left p-4 rounded-xl border transition-all cursor-pointer flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3.5 ${
                      isSelected
                        ? 'bg-blue-50/80 dark:bg-[#202738] border-blue-500 dark:border-slate-300 dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.2)] ring-1 ring-blue-500/30'
                        : 'bg-slate-50 dark:bg-[#131724] border-slate-200 dark:border-[#272f42] hover:border-slate-300 dark:hover:border-slate-600'
                    }`}
                  >
                    <div className="flex items-start space-x-3.5">
                      {/* Rank Badge */}
                      <div
                        className={`h-9 w-9 rounded-xl flex items-center justify-center font-mono font-extrabold text-sm shrink-0 border ${
                          isTop1
                            ? 'bg-rose-100 text-rose-800 dark:bg-rose-950/80 dark:border-rose-400/40 dark:text-rose-200'
                            : 'bg-slate-100 dark:bg-[#202738] text-slate-800 dark:text-slate-200 border-slate-200 dark:border-slate-700'
                        }`}
                      >
                        #{item.rank}
                      </div>

                      <div className="space-y-1.5 min-w-0">
                        <div className="flex items-center space-x-2 flex-wrap gap-y-1">
                          <span className="font-extrabold text-slate-900 dark:text-white text-sm tracking-tight">
                            {item.zoneName}
                          </span>
                          <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-100 dark:bg-[#202738] text-slate-600 dark:text-slate-400">
                            {item.wardId || item.zoneId}
                          </span>
                        </div>

                        <p className="text-xs text-slate-700 dark:text-slate-300 font-medium truncate">
                          {item.interventionName}
                        </p>

                        <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1 text-[11px] text-slate-600 dark:text-slate-400 font-mono">
                          <span className="inline-flex items-center gap-1">
                            <span className="text-slate-400">Risk:</span>
                            <span className="font-semibold text-slate-700 dark:text-slate-300">{item.riskScore?.toFixed(0)} ({item.riskBand})</span>
                          </span>
                          <span className="text-slate-300 dark:text-slate-700">•</span>
                          <span className="inline-flex items-center gap-1">
                            <span className="text-slate-400">Cost:</span>
                            <span className="font-semibold text-slate-700 dark:text-slate-300">₹{item.indicativeCost?.toLocaleString('en-IN')}</span>
                          </span>
                          <span className="text-slate-300 dark:text-slate-700">•</span>
                          <span className="inline-flex items-center gap-1">
                            <span className="text-slate-400">Impact:</span>
                            <span className="font-semibold text-slate-700 dark:text-slate-300">-{item.indicativeImpact?.toFixed(1)}°C</span>
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Planning Priority Score Pill */}
                    <div className="sm:text-right shrink-0">
                      <span className="text-[9px] font-mono uppercase text-slate-500 dark:text-slate-400 font-bold block">
                        Planning Priority
                      </span>
                      <span className="text-2xl font-extrabold font-mono text-blue-600 dark:text-blue-400">
                        {item.priorityScore}
                        <span className="text-xs text-slate-400 font-normal"> / 100</span>
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </section>

          {/* 2. Insufficient Evidence / Unranked Section */}
          {unrankedPriorities.length > 0 && (
            <section className="rounded-2xl border border-amber-300 dark:border-amber-700/60 bg-amber-50/50 dark:bg-amber-950/20 p-5 space-y-3">
              <div className="flex items-center space-x-2 border-b border-amber-200 dark:border-amber-800 pb-2.5">
                <FileQuestion className="w-4 h-4 text-amber-600 shrink-0" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-amber-900 dark:text-amber-200">
                  UNRANKED WARDS ({unrankedPriorities.length}) — INSUFFICIENT EVIDENCE
                </h3>
              </div>
              <p className="text-xs text-amber-800 dark:text-amber-300">
                These wards are excluded from capital allocation ranking due to cloud obscuration or missing telemetry.
              </p>
              <div className="space-y-1.5 pt-1">
                {unrankedPriorities.map((u) => (
                  <div
                    key={u.zoneId}
                    className="p-3 bg-white dark:bg-[#151926] rounded-xl border border-amber-200 dark:border-amber-800/60 flex items-center justify-between text-xs"
                  >
                    <div>
                      <span className="font-bold text-slate-900 dark:text-white">{u.zoneName}</span>
                      <span className="ml-2 text-slate-400 font-mono text-[10px]">{u.wardId || u.zoneId}</span>
                    </div>
                    <span className="text-amber-700 dark:text-amber-300 font-mono text-[11px] font-bold">
                      INSUFFICIENT_EVIDENCE
                    </span>
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>

        {/* Right Column (5 cols): Selected Priority Detailed Score Card */}
        <div className="lg:col-span-5 space-y-6">
          {selectedPriority ? (
            <section className="rounded-2xl border border-slate-200 dark:border-[#2d364a] bg-white dark:bg-gradient-to-b dark:from-[#181d2a] dark:to-[#11141e] p-5 space-y-4 shadow-xs dark:shadow-[0_2px_8px_rgba(0,0,0,0.5),inset_0_1px_0_rgba(255,255,255,0.1)]">
              <div className="border-b border-slate-100 dark:border-[#252d3d] pb-3">
                <span className="text-[10px] font-mono uppercase tracking-wider text-slate-500 block">
                  Priority Analysis
                </span>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mt-0.5">
                  {selectedPriority.zoneName}
                </h3>
                <p className="text-xs text-slate-500 font-mono">
                  Rank #{selectedPriority.rank ?? 'Unranked'} · Priority Score {selectedPriority.priorityScore ?? '—'}/100
                </p>
              </div>

              {/* Component breakdown bars */}
              {selectedPriority.breakdown && (
                <div className="space-y-3 text-xs">
                  <div className="space-y-1">
                    <div className="flex justify-between text-slate-700 dark:text-slate-300">
                      <span>Heat Need ({selectedPriority.breakdown.effectiveNeedWeight}% weight)</span>
                      <span className="font-mono font-bold">
                        {selectedPriority.breakdown.needScore !== null ? `${(selectedPriority.breakdown.needScore * selectedPriority.breakdown.effectiveNeedWeight).toFixed(1)} / ${selectedPriority.breakdown.effectiveNeedWeight} pts` : 'Unavailable'}
                      </span>
                    </div>
                    <div className="w-full h-1.5 rounded-full bg-slate-200 dark:bg-[#202738] overflow-hidden">
                      <div
                        className="h-full bg-rose-500 rounded-full"
                        style={{ width: `${Math.min(100, Math.max(0, (selectedPriority.breakdown.needScore ?? 0) * 100))}%` }}
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <div className="flex justify-between text-slate-700 dark:text-slate-300">
                      <span>Intervention Impact ({selectedPriority.breakdown.effectiveImpactWeight}% weight)</span>
                      <span className="font-mono font-bold">
                        {selectedPriority.breakdown.impactScore !== null ? `${(selectedPriority.breakdown.impactScore * selectedPriority.breakdown.effectiveImpactWeight).toFixed(1)} / ${selectedPriority.breakdown.effectiveImpactWeight} pts` : 'Unavailable'}
                      </span>
                    </div>
                    <div className="w-full h-1.5 rounded-full bg-slate-200 dark:bg-[#202738] overflow-hidden">
                      <div
                        className="h-full bg-emerald-500 rounded-full"
                        style={{ width: `${Math.min(100, Math.max(0, (selectedPriority.breakdown.impactScore ?? 0) * 100))}%` }}
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <div className="flex justify-between text-slate-700 dark:text-slate-300">
                      <span>Cost Efficiency ({selectedPriority.breakdown.effectiveCostEfficiencyWeight}% weight)</span>
                      <span className="font-mono font-bold">
                        {selectedPriority.breakdown.costEfficiencyScore !== null ? `${(selectedPriority.breakdown.costEfficiencyScore * selectedPriority.breakdown.effectiveCostEfficiencyWeight).toFixed(1)} / ${selectedPriority.breakdown.effectiveCostEfficiencyWeight} pts` : 'Unavailable'}
                      </span>
                    </div>
                    <div className="w-full h-1.5 rounded-full bg-slate-200 dark:bg-[#202738] overflow-hidden">
                      <div
                        className="h-full bg-blue-500 rounded-full"
                        style={{ width: `${Math.min(100, Math.max(0, (selectedPriority.breakdown.costEfficiencyScore ?? 0) * 100))}%` }}
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Rationale & Action details */}
              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-[#131724] border border-slate-200 dark:border-[#272f42] text-xs space-y-2">
                <div className="font-semibold text-slate-900 dark:text-white">
                  Intervention Summary:
                </div>
                <p className="text-slate-600 dark:text-slate-400">
                  {selectedPriority.interventionName || 'No intervention assigned'}
                </p>
                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-200 dark:border-slate-700 font-mono text-[11px]">
                  <div>
                    <span className="text-slate-400 block text-[9px] uppercase">Indicative Cost</span>
                    <span className="font-bold text-slate-800 dark:text-slate-200">
                      {selectedPriority.indicativeCost ? `₹${selectedPriority.indicativeCost.toLocaleString('en-IN')}` : '—'}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[9px] uppercase">Indicative Impact</span>
                    <span className="font-bold text-emerald-600 dark:text-emerald-400">
                      {selectedPriority.indicativeImpact ? `-${selectedPriority.indicativeImpact}°C` : '—'}
                    </span>
                  </div>
                </div>
              </div>
            </section>
          ) : (
            <div className="p-6 rounded-2xl bg-slate-50 dark:bg-[#181d2a] border border-slate-200 dark:border-slate-700 text-center text-slate-500 text-xs">
              Select a ward to view priority contribution details.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
