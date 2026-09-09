import React from 'react';
import {
  Info,
  AlertTriangle,
  CheckCircle2,
  FileQuestion,
  Thermometer,
  Trees,
  Users2,
  Layers,
  ChevronDown,
  ArrowRight,
  Calculator,
} from 'lucide-react';
import type { ScoredZoneItem } from './RiskSummaryCards';

interface ExplainViewProps {
  scoredZones: ScoredZoneItem[];
  selectedZoneId: string;
  onSelectZone: (zoneId: string) => void;
  onNavigateToRecommend?: () => void;
}

/**
 * RESPIRE Stage 03 — EXPLAIN RISK
 * 
 * Municipal Decision-Support View answering:
 * "WHY is this ward at risk?"
 */
export const ExplainView: React.FC<ExplainViewProps> = ({
  scoredZones,
  selectedZoneId,
  onSelectZone,
  onNavigateToRecommend,
}) => {
  // 1. Resolve selected zone item (with deterministic fallback to first zone if missing)
  const currentItem =
    scoredZones.find((item) => (item.zone.zoneId || item.zone.id) === selectedZoneId) ||
    scoredZones[0];

  const zone = currentItem?.zone;
  const score = currentItem?.score;

  // 2. Evaluate completeness & insufficient evidence status
  const isInsufficient =
    !score ||
    score.totalScore === null ||
    score.riskLevel === 'INSUFFICIENT_DATA' ||
    score.riskLevel === 'INSUFFICIENT_EVIDENCE' ||
    score.riskBand === 'INSUFFICIENT_EVIDENCE';

  const totalScoreVal = score?.totalScore ?? null;

  // 3. Resolve Risk Band text and color badges
  let bandBadgeColor = 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300';
  let scoreColor = 'text-slate-900 dark:text-white';
  let bandLabel = 'INSUFFICIENT EVIDENCE';

  if (!isInsufficient && totalScoreVal !== null) {
    if (score.riskLevel === 'VERY_HIGH') {
      bandBadgeColor = 'bg-rose-100 text-rose-800 dark:bg-rose-950/80 dark:border dark:border-rose-400/40 dark:text-rose-200';
      scoreColor = 'text-rose-600 dark:text-rose-400';
      bandLabel = 'VERY HIGH';
    } else if (score.riskLevel === 'HIGH') {
      bandBadgeColor = 'bg-orange-100 text-orange-800 dark:bg-orange-950/80 dark:border dark:border-orange-400/40 dark:text-orange-200';
      scoreColor = 'text-orange-500 dark:text-orange-400';
      bandLabel = 'HIGH';
    } else if (score.riskLevel === 'MODERATE') {
      bandBadgeColor = 'bg-blue-100 text-blue-800 dark:bg-blue-950/80 dark:border dark:border-blue-400/40 dark:text-blue-200';
      scoreColor = 'text-blue-600 dark:text-blue-400';
      bandLabel = 'MODERATE';
    } else {
      bandBadgeColor = 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:border dark:border-emerald-400/40 dark:text-emerald-200';
      scoreColor = 'text-emerald-600 dark:text-emerald-400';
      bandLabel = 'LOW';
    }
  }

  // 4. Drivers strictly sourced from scoring engine
  const primaryDriver = isInsufficient
    ? 'Insufficient evidence to determine dominant risk drivers.'
    : score?.whyThisZone?.primaryDriver || 'Balanced Factors';

  const secondaryDriver = isInsufficient
    ? 'None'
    : score?.whyThisZone?.secondaryDriver || 'None';

  // 5. Component breakdown specifications
  const components = [
    {
      id: 'heat',
      name: 'Heat Exposure',
      weight: 50,
      icon: Thermometer,
      normalized: score?.normalizedInputs.heatExposure ?? null,
      contribution: score?.heatScore ?? null,
      barColor: 'bg-rose-500',
      accentText: 'text-rose-500 dark:text-rose-400',
      metricIndicator: 'Land Surface Temperature (LST)',
    },
    {
      id: 'vegetation',
      name: 'Vegetation Deficit',
      weight: 20,
      icon: Trees,
      normalized: score?.normalizedInputs.vegetationDeficit ?? null,
      contribution: score?.vegetationScore ?? null,
      barColor: 'bg-emerald-500',
      accentText: 'text-emerald-600 dark:text-emerald-400',
      metricIndicator: 'NDVI Canopy Inversion',
    },
    {
      id: 'vulnerability',
      name: 'Social Vulnerability',
      weight: 30,
      icon: Users2,
      normalized: score?.normalizedInputs.socialVulnerability ?? null,
      contribution: score?.vulnerabilityScore ?? null,
      barColor: 'bg-blue-500',
      accentText: 'text-blue-600 dark:text-blue-400',
      metricIndicator: 'Socioeconomic Exposure Density',
    },
  ];

  // 6. Data Quality details
  const completenessPercent = Math.round((score?.completeness ?? 0) * 100);
  const confidenceLabel = score?.confidence ?? 'NONE';

  const availableIndicators: string[] = [];
  const missingIndicators: string[] = [];

  components.forEach((c) => {
    if (c.normalized !== null && c.normalized !== undefined) {
      availableIndicators.push(`${c.name} (${c.metricIndicator})`);
    } else {
      missingIndicators.push(`${c.name} (${c.metricIndicator})`);
    }
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Page Title & Context Header */}
      <section aria-labelledby="explain-header" className="space-y-3">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <div>
            <div className="flex items-center space-x-2 text-xs font-mono text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
              <span className="inline-block w-2 h-2 rounded-full bg-blue-500"></span>
              <span className="font-bold text-slate-900 dark:text-white">STAGE 03</span>
              <span className="text-slate-300 dark:text-slate-600">/</span>
              <span>EXPLAIN RISK</span>
            </div>
            <h1 id="explain-header" className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
              Why Is This Ward At Risk?
            </h1>
            <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5">
              Transparent, causal breakdown: Understand the specific observational factors driving heat vulnerability.
            </p>
          </div>

          {/* Accessible Zone Switcher Dropdown */}
          <div className="flex items-center space-x-2.5">
            <label htmlFor="zone-select" className="text-xs text-slate-600 dark:text-slate-400 font-medium whitespace-nowrap">
              Focus Ward:
            </label>
            <div className="relative inline-block w-64">
              <select
                id="zone-select"
                aria-label="Select Ward to Explain"
                value={zone?.zoneId || zone?.id || ''}
                onChange={(e) => onSelectZone(e.target.value)}
                className="w-full appearance-none bg-white dark:bg-[#151926] border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 pr-8 text-xs font-medium text-slate-800 dark:text-slate-200 focus:outline-hidden focus:border-blue-500 cursor-pointer shadow-2xs"
              >
                {Array.from(new Set(scoredZones.map((item) => item.zone.zoneName || 'Greater Chennai Corporation'))).map((zoneGroupName) => {
                  const groupItems = scoredZones.filter(
                    (item) => (item.zone.zoneName || 'Greater Chennai Corporation') === zoneGroupName
                  );
                  return (
                    <optgroup key={zoneGroupName} label={zoneGroupName} className="bg-slate-100 dark:bg-slate-900 font-bold text-slate-700 dark:text-slate-400">
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
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 pt-1 no-scrollbar" role="tablist" aria-label="Wards list">
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
        
        {/* Left Column (7 cols): Selected Zone Hero, Why This Zone?, Risk Contribution Breakdown */}
        <div className="lg:col-span-7 space-y-6">

          {/* 1. Selected Zone Hero Card */}
          <section
            aria-labelledby="selected-zone-heading"
            className="rounded-2xl border border-slate-200 dark:border-[#2d364a] bg-white dark:bg-gradient-to-b dark:from-[#181d2a] dark:to-[#11141e] p-5 space-y-4 shadow-xs dark:shadow-[0_2px_8px_rgba(0,0,0,0.5),inset_0_1px_0_rgba(255,255,255,0.1)]"
          >
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-slate-100 dark:border-[#252d3d] pb-3.5">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-wider text-slate-500 dark:text-slate-400 block">
                  Focus Ward
                </span>
                <h2 id="selected-zone-heading" className="text-lg font-bold text-slate-900 dark:text-white tracking-tight">
                  {zone?.wardName || zone?.zoneName || zone?.name}
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-mono">
                  {zone?.zoneId || zone?.id} · Greater Chennai Corporation
                  {zone?.areaKm2 ? ` · ${zone.areaKm2} km²` : ''}
                </p>
              </div>

              <div className="flex sm:flex-col items-end justify-between gap-1">
                <span className={`text-[10px] font-mono font-bold px-2.5 py-1 rounded-md border ${bandBadgeColor}`}>
                  {bandLabel}
                </span>
                <span className="text-[10px] font-mono text-slate-500 dark:text-slate-400">
                  {zone?.dataSourceLabel || 'Processed Dataset'}
                </span>
              </div>
            </div>

            {/* Score & Risk Band Display */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
              <div className="sm:col-span-2 rounded-xl p-4 bg-slate-50 dark:bg-[#131724] border border-slate-200 dark:border-[#272f42] space-y-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 block">
                  Urban Heat Risk Score
                </span>

                <div className="flex items-baseline space-x-2">
                  {!isInsufficient && totalScoreVal !== null ? (
                    <>
                      <span className={`text-4xl font-extrabold font-mono tracking-tight ${scoreColor}`}>
                        {totalScoreVal.toFixed(1)}
                      </span>
                      <span className="text-sm text-slate-400 font-mono">/ 100 max</span>
                    </>
                  ) : (
                    <div className="flex items-center space-x-2 py-1 text-amber-600 dark:text-amber-400">
                      <FileQuestion className="w-5 h-5 shrink-0" />
                      <span className="text-base font-bold">INSUFFICIENT EVIDENCE</span>
                    </div>
                  )}
                </div>

                {/* Horizontal Meter */}
                <div className="space-y-1.5 pt-1">
                  <div className="relative w-full h-2 rounded-full bg-slate-200 dark:bg-[#202738] overflow-hidden">
                    {!isInsufficient && totalScoreVal !== null ? (
                      <div
                        className={`h-full ${
                          totalScoreVal >= 75
                            ? 'bg-rose-500'
                            : totalScoreVal >= 50
                            ? 'bg-orange-500'
                            : totalScoreVal >= 25
                            ? 'bg-blue-500'
                            : 'bg-emerald-500'
                        } transition-all duration-500 rounded-full`}
                        style={{ width: `${Math.min(100, Math.max(0, totalScoreVal))}%` }}
                      />
                    ) : (
                      <div className="h-full w-full bg-slate-300 dark:bg-slate-700 border-t border-dashed border-slate-400" />
                    )}
                  </div>
                  <div className="flex justify-between text-[9px] font-mono text-slate-500 dark:text-slate-400">
                    <span>0 Low</span>
                    <span>25 Mod</span>
                    <span>50 High</span>
                    <span>75 Very High</span>
                    <span>100</span>
                  </div>
                </div>
              </div>

              {/* Data Completeness & Confidence Box */}
              <div className="rounded-xl p-4 bg-slate-50 dark:bg-[#131724] border border-slate-200 dark:border-[#272f42] flex flex-col justify-between space-y-2">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 block">
                    Data Completeness
                  </span>
                  <span className={`text-2xl font-extrabold font-mono mt-1 block ${completenessPercent === 100 ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600 dark:text-amber-400'}`}>
                    {completenessPercent}%
                  </span>
                </div>
                <div className="border-t border-slate-200 dark:border-[#272f42] pt-2">
                  <span className="text-[9px] font-mono uppercase text-slate-500 block">Confidence</span>
                  <span className="text-xs font-semibold font-mono text-slate-800 dark:text-slate-200">
                    {confidenceLabel}
                  </span>
                </div>
              </div>
            </div>
          </section>

          {/* 2. WHY THIS ZONE? (Driver Hierarchy) */}
          <section
            aria-labelledby="why-zone-heading"
            className="rounded-2xl border border-slate-200 dark:border-[#2d364a] bg-white dark:bg-gradient-to-b dark:from-[#181d2a] dark:to-[#11141e] p-5 space-y-4 shadow-xs dark:shadow-[0_2px_8px_rgba(0,0,0,0.5),inset_0_1px_0_rgba(255,255,255,0.1)]"
          >
            <div className="flex items-center space-x-2 border-b border-slate-100 dark:border-[#252d3d] pb-3">
              <Info className="w-4 h-4 text-blue-500 shrink-0" />
              <h2 id="why-zone-heading" className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-slate-300">
                WHY THIS WARD IS AT RISK
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Primary Driver */}
              <div className="rounded-xl p-4 bg-slate-50 dark:bg-[#131724] border border-slate-200 dark:border-[#272f42] space-y-1">
                <span className="text-[9px] font-mono uppercase tracking-wider text-rose-600 dark:text-rose-400 font-bold block">
                  Primary Driver
                </span>
                <p className="text-sm font-bold text-slate-900 dark:text-slate-100">
                  {primaryDriver}
                </p>
                {!isInsufficient && score?.whyThisZone?.primaryDriver && (
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                    Dominant observational factor contributing most heavily to score.
                  </p>
                )}
              </div>

              {/* Secondary Driver */}
              <div className="rounded-xl p-4 bg-slate-50 dark:bg-[#131724] border border-slate-200 dark:border-[#272f42] space-y-1">
                <span className="text-[9px] font-mono uppercase tracking-wider text-slate-500 dark:text-slate-400 font-bold block">
                  Secondary Driver
                </span>
                <p className="text-sm font-bold text-slate-900 dark:text-slate-100">
                  {secondaryDriver}
                </p>
                {!isInsufficient && score?.whyThisZone?.secondaryDriver && (
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                    Compounding factor contributing to heat vulnerability.
                  </p>
                )}
              </div>
            </div>

            {/* Priority Rationale Note */}
            {score?.whyThisZone?.priorityRationale && (
              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-[#131724] border border-slate-200 dark:border-[#272f42] text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                <span className="font-semibold text-slate-900 dark:text-slate-200">Domain Rationale: </span>
                {score.whyThisZone.priorityRationale}
              </div>
            )}
          </section>

          {/* 3. RISK CONTRIBUTION BREAKDOWN */}
          <section
            aria-labelledby="breakdown-heading"
            className="rounded-2xl border border-slate-200 dark:border-[#2d364a] bg-white dark:bg-gradient-to-b dark:from-[#181d2a] dark:to-[#11141e] p-5 space-y-4 shadow-xs dark:shadow-[0_2px_8px_rgba(0,0,0,0.5),inset_0_1px_0_rgba(255,255,255,0.1)]"
          >
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-slate-100 dark:border-[#252d3d] pb-3">
              <div className="flex items-center space-x-2">
                <Layers className="w-4 h-4 text-blue-500 shrink-0" />
                <h2 id="breakdown-heading" className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-slate-300">
                  RISK CONTRIBUTION BREAKDOWN
                </h2>
              </div>
              <span className="text-[10px] text-slate-500 dark:text-slate-400 font-mono whitespace-nowrap">
                Formula: (Heat × 50%) + (Veg × 20%) + (Vuln × 30%)
              </span>
            </div>

            <div className="space-y-3">
              {components.map((c) => {
                const Icon = c.icon;
                const isMissing = c.normalized === null || c.contribution === null;
                const progressPercent = typeof c.normalized === 'number'
                  ? Math.min(100, Math.max(0, c.normalized * 100))
                  : 0;

                return (
                  <div
                    key={c.id}
                    className="rounded-xl p-3.5 bg-slate-50 dark:bg-[#131724] border border-slate-200 dark:border-[#272f42] space-y-2.5 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Icon className={`w-4 h-4 ${c.accentText}`} />
                        <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">{c.name}</span>
                        <span className="text-[10px] text-slate-500 font-mono">
                          (Weight: {c.weight}%)
                        </span>
                      </div>

                      <div className="text-right font-mono text-xs">
                        {isMissing ? (
                          <span className="text-amber-600 dark:text-amber-400 italic font-semibold">Unavailable</span>
                        ) : (
                          <span className="font-bold text-slate-900 dark:text-slate-100">
                            {c.contribution?.toFixed(1)}{' '}
                            <span className="text-slate-400 text-[10px]">/ {c.weight} pts</span>
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Progress Track */}
                    <div className="w-full h-1.5 rounded-full bg-slate-200 dark:bg-[#202738] overflow-hidden">
                      {!isMissing ? (
                        <div
                          className={`h-full ${c.barColor} transition-all duration-500 rounded-full`}
                          style={{ width: `${progressPercent}%` }}
                        />
                      ) : (
                        <div className="h-full w-full bg-slate-300 dark:bg-slate-700 border-t border-dashed border-slate-400" />
                      )}
                    </div>

                    <div className="flex items-center justify-between text-[10px] text-slate-500 font-mono">
                      <span>Normalized Indicator Value:</span>
                      <span>
                        {c.normalized === null ? (
                          <span className="text-slate-400 italic">null (Unavailable)</span>
                        ) : (
                          <span className="text-slate-700 dark:text-slate-300 font-semibold">{c.normalized.toFixed(2)} / 1.00</span>
                        )}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Total Summary Row */}
            <div className="border-t border-slate-100 dark:border-[#252d3d] pt-3 flex items-center justify-between font-mono text-xs">
              <span className="text-slate-600 dark:text-slate-400 font-semibold uppercase">Computed Risk Score:</span>
              <span>
                {!isInsufficient && totalScoreVal !== null ? (
                  <span className="text-base font-extrabold text-slate-900 dark:text-slate-100">
                    {totalScoreVal.toFixed(1)} <span className="text-slate-400 text-xs font-normal">/ 100</span>
                  </span>
                ) : (
                  <span className="text-xs font-bold text-amber-600 dark:text-amber-400">INSUFFICIENT EVIDENCE</span>
                )}
              </span>
            </div>
          </section>
        </div>

        {/* Right Column (5 cols): Plain-Language Explanation, Scoring Formula & Data Quality */}
        <div className="lg:col-span-5 space-y-6">

          {/* 4. PLAIN-LANGUAGE EXPLANATION */}
          <section
            aria-labelledby="explanation-heading"
            className="rounded-2xl border border-slate-200 dark:border-[#2d364a] bg-white dark:bg-gradient-to-b dark:from-[#181d2a] dark:to-[#11141e] p-5 space-y-3.5 shadow-xs dark:shadow-[0_2px_8px_rgba(0,0,0,0.5),inset_0_1px_0_rgba(255,255,255,0.1)]"
          >
            <div className="flex items-center space-x-2 border-b border-slate-100 dark:border-[#252d3d] pb-3">
              <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
              <h2 id="explanation-heading" className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-slate-300">
                PLAIN-LANGUAGE EXPLANATION
              </h2>
            </div>

            <div className="rounded-xl p-4 bg-slate-50 dark:bg-[#131724] border border-slate-200 dark:border-[#272f42] space-y-3">
              <p className="text-sm text-slate-800 dark:text-slate-200 leading-relaxed font-normal">
                "{score?.explanation}"
              </p>

              <div className="border-t border-slate-200 dark:border-[#272f42] pt-2.5 text-[10px] text-slate-500 font-mono">
                Computed via deterministic rule engine. Single source of truth.
              </div>
            </div>
          </section>

          {/* Scoring Formula Box */}
          <section
            className="rounded-2xl border border-slate-200 dark:border-[#2d364a] bg-white dark:bg-gradient-to-b dark:from-[#181d2a] dark:to-[#11141e] p-5 space-y-3 shadow-xs dark:shadow-[0_2px_8px_rgba(0,0,0,0.5),inset_0_1px_0_rgba(255,255,255,0.1)]"
          >
            <div className="flex items-center space-x-2 border-b border-slate-100 dark:border-[#252d3d] pb-2.5">
              <Calculator className="w-4 h-4 text-blue-500 shrink-0" />
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-slate-300">
                SCORING METHODOLOGY
              </h2>
            </div>
            <div className="p-3 bg-slate-50 dark:bg-[#131724] border border-slate-200 dark:border-[#272f42] rounded-xl font-mono text-xs text-slate-700 dark:text-slate-300 space-y-1.5">
              <div className="font-semibold text-slate-900 dark:text-white">
                Total Score = (Heat × 0.50) + (Veg × 0.20) + (Vuln × 0.30)
              </div>
              <p className="text-[11px] text-slate-500 leading-relaxed font-sans">
                Weights align with NDMA municipal heat resilience framework: Heat Exposure (50%), Vegetation Canopy Deficit (20%), and Socioeconomic Exposure (30%).
              </p>
            </div>
          </section>

          {/* 5. DATA QUALITY & PROVENANCE PANEL */}
          <section
            aria-labelledby="data-quality-heading"
            className="rounded-2xl border border-slate-200 dark:border-[#2d364a] bg-white dark:bg-gradient-to-b dark:from-[#181d2a] dark:to-[#11141e] p-5 space-y-4 shadow-xs dark:shadow-[0_2px_8px_rgba(0,0,0,0.5),inset_0_1px_0_rgba(255,255,255,0.1)]"
          >
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-[#252d3d] pb-3">
              <div className="flex items-center space-x-2">
                <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0" />
                <h2 id="data-quality-heading" className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-slate-300">
                  DATA QUALITY & PROVENANCE
                </h2>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-100 dark:bg-[#202738] text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
                Audit Status
              </span>
            </div>

            {/* Completeness & Confidence Overview */}
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-[#131724] border border-slate-200 dark:border-[#272f42]">
                <span className="text-[9px] font-mono uppercase text-slate-500 block">
                  Completeness
                </span>
                <span className={`text-xl font-extrabold font-mono mt-0.5 block ${completenessPercent === 100 ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600 dark:text-amber-400'}`}>
                  {completenessPercent}%
                </span>
              </div>
              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-[#131724] border border-slate-200 dark:border-[#272f42]">
                <span className="text-[9px] font-mono uppercase text-slate-500 block">
                  Confidence
                </span>
                <span className="text-xl font-extrabold font-mono text-slate-900 dark:text-slate-200 mt-0.5 block">
                  {confidenceLabel}
                </span>
              </div>
            </div>

            {/* Indicator Inventory */}
            <div className="space-y-2.5 text-xs">
              <div>
                <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider block mb-1">
                  Available Indicators ({availableIndicators.length})
                </span>
                {availableIndicators.length > 0 ? (
                  <ul className="space-y-1">
                    {availableIndicators.map((ind) => (
                      <li key={ind} className="flex items-center space-x-2 text-slate-700 dark:text-slate-300 text-xs">
                        <CheckCircle2 className="w-3 h-3 text-emerald-500 shrink-0" />
                        <span>{ind}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-slate-400 italic">None</p>
                )}
              </div>

              <div className="border-t border-slate-100 dark:border-[#252d3d] pt-2.5">
                <span className="text-[10px] font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider block mb-1">
                  Missing Indicators ({missingIndicators.length})
                </span>
                {missingIndicators.length > 0 ? (
                  <ul className="space-y-1">
                    {missingIndicators.map((ind) => (
                      <li key={ind} className="flex items-center space-x-2 text-amber-700 dark:text-amber-300 text-xs">
                        <AlertTriangle className="w-3 h-3 text-amber-500 shrink-0" />
                        <span>{ind}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-slate-400 italic text-[11px]">None · Full observational coverage</p>
                )}
              </div>
            </div>

            {/* Special Notice for Insufficient Evidence */}
            {isInsufficient && (
              <div className="p-3.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-700 text-xs text-amber-800 dark:text-amber-200 space-y-1.5">
                <div className="font-semibold text-amber-700 dark:text-amber-300 flex items-center space-x-1.5">
                  <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                  <span>Ground-Truth Verification Required</span>
                </div>
                <p className="text-[11px] leading-relaxed text-amber-800 dark:text-amber-200">
                  Because physical heat exposure and vegetation deficit data are unavailable for this zone, municipal capital allocation cannot be recommended until ground-truth thermal telemetry is collected.
                </p>
              </div>
            )}

            {/* Quick Link to 04 RECOMMEND */}
            {onNavigateToRecommend && (
              <button
                type="button"
                onClick={onNavigateToRecommend}
                className="w-full py-2.5 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 dark:bg-gradient-to-b dark:from-[#242e44] dark:to-[#141826] dark:border dark:border-slate-300 dark:text-white text-xs font-bold transition-all flex items-center justify-between cursor-pointer group shadow-2xs"
              >
                <span>Recommended Interventions</span>
                <span className="flex items-center gap-1 text-[11px] font-mono group-hover:translate-x-0.5 transition-transform">
                  04 RECOMMEND <ArrowRight className="w-3.5 h-3.5" />
                </span>
              </button>
            )}
          </section>
        </div>
      </div>
    </div>
  );
};
