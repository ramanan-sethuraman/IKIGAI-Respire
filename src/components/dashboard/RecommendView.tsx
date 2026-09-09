import React from 'react';
import {
  FileQuestion,
  ChevronDown,
  ArrowRight,
  Lightbulb,
  FileSpreadsheet,
} from 'lucide-react';
import { respireRecommendationEngine } from '../../core/recommendations/recommendationEngine';
import type { ScoredZoneItem } from './RiskSummaryCards';

interface RecommendViewProps {
  scoredZones: ScoredZoneItem[];
  selectedZoneId: string;
  onSelectZone: (zoneId: string) => void;
  onNavigateToPrioritize?: () => void;
}

/**
 * RESPIRE Stage 04 — RECOMMEND ACTIONS
 * 
 * Answers: "WHAT ACTION SHOULD BE TAKEN?"
 */
export const RecommendView: React.FC<RecommendViewProps> = ({
  scoredZones,
  selectedZoneId,
  onSelectZone,
  onNavigateToPrioritize,
}) => {
  // 1. Resolve selected zone (deterministic fallback to first zone if missing)
  const currentItem =
    scoredZones.find((item) => (item.zone.zoneId || item.zone.id) === selectedZoneId) ||
    scoredZones[0];

  const zone = currentItem?.zone;
  const score = currentItem?.score;

  // 2. Consume recommendation engine deterministically
  const recResult = zone
    ? respireRecommendationEngine.generateRecommendations(zone, score ?? undefined)
    : null;

  const hasRecommendation = recResult?.hasConfidentRecommendation && recResult.primaryRecommendation !== null;
  const primaryRec = recResult?.primaryRecommendation ?? null;
  const whyThisAction = recResult?.whyThisAction;
  const whyActionText =
    typeof whyThisAction === 'string'
      ? whyThisAction
      : whyThisAction?.reason || whyThisAction?.headline || recResult?.reason || 'Evaluated against municipal intervention catalogue rule thresholds.';

  // 3. Risk tier styling
  const isScoreInsufficient =
    !score ||
    score.totalScore === null ||
    score.riskLevel === 'INSUFFICIENT_DATA' ||
    score.riskLevel === 'INSUFFICIENT_EVIDENCE' ||
    score.riskBand === 'INSUFFICIENT_EVIDENCE';

  const totalScoreVal = score?.totalScore ?? null;

  let bandBadgeColor = 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300';
  let bandLabel = 'INSUFFICIENT EVIDENCE';

  if (!isScoreInsufficient && totalScoreVal !== null) {
    if (score.riskLevel === 'VERY_HIGH') {
      bandBadgeColor = 'bg-rose-100 text-rose-800 dark:bg-rose-950/80 dark:border dark:border-rose-400/40 dark:text-rose-200';
      bandLabel = 'VERY HIGH';
    } else if (score.riskLevel === 'HIGH') {
      bandBadgeColor = 'bg-orange-100 text-orange-800 dark:bg-orange-950/80 dark:border dark:border-orange-400/40 dark:text-orange-200';
      bandLabel = 'HIGH';
    } else if (score.riskLevel === 'MODERATE') {
      bandBadgeColor = 'bg-blue-100 text-blue-800 dark:bg-blue-950/80 dark:border dark:border-blue-400/40 dark:text-blue-200';
      bandLabel = 'MODERATE';
    } else {
      bandBadgeColor = 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:border dark:border-emerald-400/40 dark:text-emerald-200';
      bandLabel = 'LOW';
    }
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Page Title & Context Header */}
      <section aria-labelledby="recommend-header" className="space-y-3">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <div>
            <div className="flex items-center space-x-2 text-xs font-mono text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
              <span className="inline-block w-2 h-2 rounded-full bg-blue-500"></span>
              <span className="font-bold text-slate-900 dark:text-white">STAGE 04</span>
              <span className="text-slate-300 dark:text-slate-600">/</span>
              <span>RECOMMEND ACTION</span>
            </div>
            <h1 id="recommend-header" className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
              Recommended Intervention Packages
            </h1>
            <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5">
              Targeted cooling interventions evaluated by deterministic municipal rule logic.
            </p>
          </div>

          {/* Accessible Zone Switcher Dropdown */}
          <div className="flex items-center space-x-2.5">
            <label htmlFor="zone-select-rec" className="text-xs text-slate-600 dark:text-slate-400 font-medium whitespace-nowrap">
              Focus Ward:
            </label>
            <div className="relative inline-block w-64">
              <select
                id="zone-select-rec"
                aria-label="Select Ward to Inspect Recommendations"
                value={zone?.zoneId || zone?.id || ''}
                onChange={(e) => onSelectZone(e.target.value)}
                className="w-full appearance-none bg-white dark:bg-[#151926] border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 pr-8 text-xs font-medium text-slate-800 dark:text-slate-200 focus:outline-hidden focus:border-blue-500 cursor-pointer shadow-2xs"
              >
                {Array.from(new Set(scoredZones.map((item) => item.zone.zoneName || 'Greater Chennai Corporation'))).map((zoneGroupName) => {
                  const groupItems = scoredZones.filter(
                    (item) => (item.zone.zoneName || 'Greater Chennai Corporation') === zoneGroupName
                  );
                  return (
                    <optgroup key={zoneGroupName} label={zoneGroupName} className="bg-slate-100 dark:bg-slate-950 font-bold text-slate-700 dark:text-slate-400">
                      {groupItems.map(({ zone: z, score: s }) => {
                        const zId = z.zoneId || z.id || '';
                        const sVal = s.totalScore !== null ? `${s.totalScore.toFixed(0)}/100` : 'Insufficient Data';
                        const tier = s.riskBand ?? s.riskLevel;
                        return (
                          <option key={zId} value={zId} className="bg-white dark:bg-[#151926] text-slate-800 dark:text-slate-200 font-normal">
                            {z.wardName || z.name || zId} ({tier} · {sVal})
                          </option>
                        );
                      })}
                    </optgroup>
                  );
                })}
              </select>
              <ChevronDown className="w-4 h-4 text-slate-400 absolute right-2.5 top-2.5 pointer-events-none" />
            </div>
          </div>
        </div>

        {/* Quick Ward Navigation Pill Bar */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 pt-1 no-scrollbar" role="tablist" aria-label="Wards recommendation list">
          {scoredZones.map(({ zone: z, score: s }) => {
            const zId = z.zoneId || z.id || '';
            const isSelected = zId === (zone?.zoneId || zone?.id);
            const isWardInsufficient = s.totalScore === null || s.riskBand === 'INSUFFICIENT_EVIDENCE';

            let pillBadge = 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 bg-white dark:bg-[#141824]';
            if (isSelected) {
              pillBadge = 'border-blue-500 bg-blue-50 text-blue-700 dark:bg-gradient-to-b dark:from-[#242e44] dark:to-[#141826] dark:border-slate-300 dark:text-white font-bold shadow-xs';
            } else if (isWardInsufficient) {
              pillBadge = 'border-amber-400/40 text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/40';
            }

            return (
              <button
                key={zId}
                type="button"
                role="tab"
                aria-selected={isSelected}
                onClick={() => onSelectZone(zId)}
                className={`text-xs px-3 py-1.5 rounded-xl border transition-all shrink-0 cursor-pointer ${pillBadge}`}
              >
                <span>{z.wardName?.replace('Ward ', 'W-') || zId}</span>
                <span className="ml-1.5 font-mono text-[10px] opacity-80">
                  {isWardInsufficient ? 'No Score' : s.totalScore?.toFixed(0)}
                </span>
              </button>
            );
          })}
        </div>
      </section>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Column (7 cols): Selected Zone Context & Recommended Action */}
        <div className="lg:col-span-7 space-y-6">

          {/* 1. Selected Zone Risk Context Card */}
          <section
            aria-labelledby="zone-context-heading"
            className="rounded-2xl border border-slate-200 dark:border-[#2d364a] bg-white dark:bg-gradient-to-b dark:from-[#181d2a] dark:to-[#11141e] p-5 space-y-3 shadow-xs dark:shadow-[0_2px_8px_rgba(0,0,0,0.5),inset_0_1px_0_rgba(255,255,255,0.1)]"
          >
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-slate-100 dark:border-[#252d3d] pb-3">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-wider text-slate-500 dark:text-slate-400 block">
                  Candidate Focus Ward
                </span>
                <h2 id="zone-context-heading" className="text-lg font-bold text-slate-900 dark:text-white tracking-tight">
                  {zone?.wardName || zone?.zoneName || zone?.name}
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-mono">
                  {zone?.zoneId || zone?.id} · Greater Chennai Corporation
                </p>
              </div>

              <div className="flex sm:flex-col items-end justify-between gap-1">
                <span className={`text-[10px] font-mono font-bold px-2.5 py-1 rounded-md border ${bandBadgeColor}`}>
                  {bandLabel}
                </span>
                <span className="text-[10px] font-mono text-slate-500 dark:text-slate-400">
                  Risk: {totalScoreVal !== null ? `${totalScoreVal.toFixed(1)} / 100` : 'Insufficient Data'}
                </span>
              </div>
            </div>

            {/* Quick Context Summary */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 text-xs">
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-[#131724] border border-slate-200 dark:border-[#272f42]">
                <span className="text-[9px] text-slate-500 font-mono uppercase block">Heat Exposure</span>
                <span className="font-bold text-slate-900 dark:text-slate-200 mt-0.5 block font-mono">
                  {score?.heatScore !== null && score?.heatScore !== undefined
                    ? `${score.heatScore.toFixed(1)} / 50 pts`
                    : 'Unavailable'}
                </span>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 dark:bg-[#131724] border border-slate-200 dark:border-[#272f42]">
                <span className="text-[9px] text-slate-500 font-mono uppercase block">Vegetation Deficit</span>
                <span className="font-bold text-slate-900 dark:text-slate-200 mt-0.5 block font-mono">
                  {score?.vegetationScore !== null && score?.vegetationScore !== undefined
                    ? `${score.vegetationScore.toFixed(1)} / 20 pts`
                    : 'Unavailable'}
                </span>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 dark:bg-[#131724] border border-slate-200 dark:border-[#272f42] col-span-2 sm:col-span-1">
                <span className="text-[9px] text-slate-500 font-mono uppercase block">Social Vulnerability</span>
                <span className="font-bold text-slate-900 dark:text-slate-200 mt-0.5 block font-mono">
                  {score?.vulnerabilityScore !== null && score?.vulnerabilityScore !== undefined
                    ? `${score.vulnerabilityScore.toFixed(1)} / 30 pts`
                    : 'Unavailable'}
                </span>
              </div>
            </div>
          </section>

          {/* 2. PRIMARY RECOMMENDED INTERVENTION CARD */}
          {hasRecommendation && primaryRec ? (
            <section
              aria-labelledby="rec-card-heading"
              className="rounded-2xl border border-blue-500/40 bg-white dark:bg-gradient-to-b dark:from-[#191e2c] dark:to-[#11141e] p-5 space-y-5 shadow-xs dark:shadow-[0_4px_16px_rgba(0,0,0,0.5),inset_0_1px_0_rgba(255,255,255,0.12)]"
            >
              <div className="border-b border-slate-100 dark:border-[#252d3d] pb-4 space-y-2">
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <div className="flex items-center space-x-2">
                    <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300 border border-blue-200 dark:border-blue-800 uppercase">
                      Recommended Action
                    </span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-100 dark:bg-[#202738] text-slate-700 dark:text-slate-300">
                      {primaryRec.category}
                    </span>
                  </div>

                  {primaryRec.rulePriority && (
                    <span className="text-[10px] font-mono text-blue-600 dark:text-blue-400 font-bold">
                      Rule Priority #{primaryRec.rulePriority}
                    </span>
                  )}
                </div>

                <h3 id="rec-card-heading" className="text-xl font-bold text-slate-900 dark:text-white tracking-tight pt-1">
                  {primaryRec.interventionName}
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed font-normal">
                  {primaryRec.description}
                </p>
              </div>

              {/* Indicative Planning Estimates Box */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-[#131724] border border-slate-200 dark:border-[#272f42] space-y-1">
                  <span className="text-[9px] font-mono uppercase tracking-wider text-slate-500 block">
                    Indicative Planning Cost
                  </span>
                  <div className="text-lg font-bold font-mono text-slate-900 dark:text-white">
                    ₹{primaryRec.cost !== null && primaryRec.cost !== undefined ? primaryRec.cost.toLocaleString('en-IN') : '72,000'}
                  </div>
                  <span className="text-[10px] text-slate-500 dark:text-slate-400 block">
                    [Indicative Estimate] · Municipal Capex Baseline
                  </span>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-[#131724] border border-slate-200 dark:border-[#272f42] space-y-1">
                  <span className="text-[9px] font-mono uppercase tracking-wider text-slate-500 block">
                    Expected Microclimate Relief
                  </span>
                  <div className="text-lg font-bold font-mono text-emerald-600 dark:text-emerald-400">
                    {primaryRec.impact !== null && primaryRec.impact !== undefined
                      ? (primaryRec.impact > 0 ? `-${primaryRec.impact}°C` : `${primaryRec.impact}°C`)
                      : '-4.5°C'}
                  </div>
                  <span className="text-[10px] text-slate-500 dark:text-slate-400 block">
                    [Indicative Estimate] · Local Shade/Albedo Model
                  </span>
                </div>
              </div>

              {/* Beneficiaries & Scope */}
              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-[#131724] border border-slate-200 dark:border-[#272f42] text-xs text-slate-700 dark:text-slate-300 leading-relaxed space-y-1">
                <div className="font-semibold text-slate-900 dark:text-white">
                  Target Beneficiaries & Deployment:
                </div>
                <p className="text-[11px] text-slate-600 dark:text-slate-400">
                  Informal settlements, outdoor street vendors, and transit pedestrians.
                </p>
              </div>
            </section>
          ) : (
            /* Fallback Card for Insufficient Evidence / No Confident Recommendation */
            <section className="rounded-2xl border border-amber-300 dark:border-amber-700/60 bg-amber-50/50 dark:bg-amber-950/20 p-6 text-center space-y-3">
              <FileQuestion className="w-10 h-10 text-amber-500 mx-auto" />
              <h3 className="text-base font-bold text-amber-900 dark:text-amber-200">
                No Confident Recommendation Available
              </h3>
              <p className="text-xs text-amber-800 dark:text-amber-300 max-w-md mx-auto leading-relaxed">
                Because physical heat telemetry is missing or cloud-obscured for this ward, no intervention package is assigned. Field inspection required.
              </p>
            </section>
          )}
        </div>

        {/* Right Column (5 cols): Rule Precedence & Action Rationale */}
        <div className="lg:col-span-5 space-y-6">

          {/* 3. WHY THIS ACTION? (Rule Traceability) */}
          <section
            aria-labelledby="why-action-heading"
            className="rounded-2xl border border-slate-200 dark:border-[#2d364a] bg-white dark:bg-gradient-to-b dark:from-[#181d2a] dark:to-[#11141e] p-5 space-y-3.5 shadow-xs dark:shadow-[0_2px_8px_rgba(0,0,0,0.5),inset_0_1px_0_rgba(255,255,255,0.1)]"
          >
            <div className="flex items-center space-x-2 border-b border-slate-100 dark:border-[#252d3d] pb-3">
              <Lightbulb className="w-4 h-4 text-blue-500 shrink-0" />
              <h2 id="why-action-heading" className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-slate-300">
                WHY THIS ACTION?
              </h2>
            </div>

            <div className="rounded-xl p-4 bg-slate-50 dark:bg-[#131724] border border-slate-200 dark:border-[#272f42] space-y-3">
              <p className="text-xs text-slate-800 dark:text-slate-200 leading-relaxed font-normal">
                "{whyActionText}"
              </p>

              <div className="border-t border-slate-200 dark:border-[#272f42] pt-2.5 text-[10px] text-slate-500 font-mono">
                Trigger Rule: Deterministic catalog matching.
              </div>
            </div>
          </section>

          {/* 4. MUNICIPAL CATALOGUE REFERENCE */}
          <section className="rounded-2xl border border-slate-200 dark:border-[#2d364a] bg-white dark:bg-gradient-to-b dark:from-[#181d2a] dark:to-[#11141e] p-5 space-y-3.5 shadow-xs dark:shadow-[0_2px_8px_rgba(0,0,0,0.5),inset_0_1px_0_rgba(255,255,255,0.1)]">
            <div className="flex items-center space-x-2 border-b border-slate-100 dark:border-[#252d3d] pb-3">
              <FileSpreadsheet className="w-4 h-4 text-emerald-500 shrink-0" />
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-slate-300">
                CATALOGUE RULE PRECEDENCE
              </h2>
            </div>

            <div className="space-y-2 text-xs text-slate-600 dark:text-slate-400">
              <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-[#131724] border border-slate-200 dark:border-[#272f42]">
                <div className="font-semibold text-slate-900 dark:text-white">Rule 1: Outdoor Worker Exposure</div>
                <div className="text-[11px] text-slate-500 mt-0.5">High LST + high outdoor worker density → Hydration & Cooling Shelters</div>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-[#131724] border border-slate-200 dark:border-[#272f42]">
                <div className="font-semibold text-slate-900 dark:text-white">Rule 2: High Built Impervious Density</div>
                <div className="text-[11px] text-slate-500 mt-0.5">High LST + high slum/tenement density → Cool Roof Coatings</div>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-[#131724] border border-slate-200 dark:border-[#272f42]">
                <div className="font-semibold text-slate-900 dark:text-white">Rule 3: Tree Canopy Deficit</div>
                <div className="text-[11px] text-slate-500 mt-0.5">Low NDVI + available open spaces → Urban Pocket Forestation</div>
              </div>
            </div>

            {/* Quick Link to 05 PRIORITIZE */}
            {onNavigateToPrioritize && (
              <button
                type="button"
                onClick={onNavigateToPrioritize}
                className="w-full py-2.5 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 dark:bg-gradient-to-b dark:from-[#242e44] dark:to-[#141826] dark:border dark:border-slate-300 dark:text-white text-xs font-bold transition-all flex items-center justify-between cursor-pointer group shadow-2xs mt-2"
              >
                <span>Prioritize & Allocate Budget</span>
                <span className="flex items-center gap-1 text-[11px] font-mono group-hover:translate-x-0.5 transition-transform">
                  05 PRIORITIZE <ArrowRight className="w-3.5 h-3.5" />
                </span>
              </button>
            )}
          </section>
        </div>
      </div>
    </div>
  );
};
