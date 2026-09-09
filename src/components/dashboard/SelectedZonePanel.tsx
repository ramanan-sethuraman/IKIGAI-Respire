import React from 'react';
import {
  AlertTriangle,
  ArrowRight,
} from 'lucide-react';
import type { Zone, RiskScoreResult } from '../../types';

interface SelectedZonePanelProps {
  selectedZone?: Zone;
  score?: RiskScoreResult | null;
  onNavigateToExplain?: () => void;
  onSelectZone?: (zoneId: string) => void;
  allZones?: { zone: Zone; score: RiskScoreResult }[];
}

export const SelectedZonePanel: React.FC<SelectedZonePanelProps> = ({
  selectedZone,
  score,
  onNavigateToExplain,
  onSelectZone,
  allZones = [],
}) => {
  if (!selectedZone) {
    return (
      <div className="bg-white dark:bg-[#181d2a] border border-slate-200 dark:border-[#2d364a] p-6 rounded-2xl shadow-xs text-center text-slate-500 dark:text-slate-400 h-full flex flex-col items-center justify-center">
        <AlertTriangle className="w-8 h-8 text-slate-400 mb-2" />
        <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">No Ward Selected</p>
        <p className="text-xs text-slate-400 max-w-xs mt-1">
          Click any ward polygon on the map or select from the list to inspect its heat risk profile.
        </p>
      </div>
    );
  }

  const isInsufficient =
    !score ||
    score.totalScore === null ||
    score.riskLevel === 'INSUFFICIENT_DATA' ||
    score.riskLevel === 'INSUFFICIENT_EVIDENCE' ||
    score.riskBand === 'INSUFFICIENT_EVIDENCE';

  const totalScoreVal = score?.totalScore ?? null;
  const rawLST = selectedZone.metrics?.heat?.lst?.value;
  const ndviVal = selectedZone.metrics?.vegetation?.ndvi?.value;
  const cleanName = (selectedZone.zoneName || selectedZone.name || 'Vyasarpadi').replace(/^(Ward\s*\d+\s*[-–:]\s*)/i, '');
  const wardCode = selectedZone.wardId || selectedZone.id || 'Ward 045';
  const zoneName = selectedZone.zoneName || 'North Sector • Zone IV';
  const completeness = Math.round((score?.completeness ?? (isInsufficient ? 0.3 : 1)) * 100);
  const confidence = score?.confidence ?? (isInsufficient ? 'LOW' : 'MEDIUM');
  const primaryDriver = isInsufficient
    ? null
    : score?.whyThisZone?.primaryDriver || 'Heat Exposure & Surface Temperature Anomaly';

  const topQueue = allZones.slice(0, 5);

  return (
    <div className="flex flex-col gap-4 select-none animate-in fade-in duration-200">
      {/* Main Ward Summary Card */}
      <div className="bg-white dark:bg-gradient-to-b dark:from-[#181d2a] dark:to-[#11141e] border border-slate-200 dark:border-[#2d364a] p-5 rounded-2xl shadow-xs dark:shadow-[0_2px_8px_rgba(0,0,0,0.5),inset_0_1px_0_rgba(255,255,255,0.1)] relative overflow-hidden">
        {/* Accent Bar */}
        <div
          className={`absolute top-0 left-0 right-0 h-1.5 ${
            isInsufficient
              ? 'bg-slate-400'
              : (totalScoreVal ?? 0) >= 75
              ? 'bg-rose-600'
              : (totalScoreVal ?? 0) >= 50
              ? 'bg-orange-500'
              : 'bg-blue-600'
          }`}
        />

        {/* Ward Title & Risk Badge */}
        <div className="flex items-start justify-between mb-3 pt-1">
          <div>
            <div className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">
              Selected Ward Summary
            </div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight mt-0.5">
              {cleanName}
            </h2>
            <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              {zoneName} • {wardCode.toUpperCase()}
            </div>
          </div>

          <span
            className={`px-2.5 py-1 text-[10px] font-bold rounded-md uppercase tracking-wide ${
              isInsufficient
                ? 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                : (totalScoreVal ?? 0) >= 75
                ? 'bg-rose-100 text-rose-800 dark:bg-rose-950/80 dark:border dark:border-rose-400/40 dark:text-rose-200'
                : (totalScoreVal ?? 0) >= 50
                ? 'bg-orange-100 text-orange-800 dark:bg-orange-950/80 dark:border dark:border-orange-400/40 dark:text-orange-200'
                : 'bg-blue-100 text-blue-800 dark:bg-blue-950/80 dark:border dark:border-blue-400/40 dark:text-blue-200'
            }`}
          >
            {isInsufficient ? 'INSUFFICIENT EVIDENCE' : score?.riskBand ?? 'VERY HIGH RISK'}
          </span>
        </div>

        {/* Primary Metrics Grid */}
        <div className="grid grid-cols-2 gap-3 py-3 border-y border-slate-100 dark:border-[#252d3d] my-2">
          {/* Heat Risk Score */}
          <div className="flex flex-col">
            <span className="text-[10px] uppercase tracking-wider font-semibold text-slate-400">
              Heat Risk Score
            </span>
            <div className="flex items-baseline gap-1 mt-0.5">
              <span className="text-3xl font-bold text-rose-600 dark:text-rose-400 font-mono leading-none">
                {totalScoreVal !== null ? totalScoreVal.toFixed(0) : '—'}
              </span>
              <span className="text-xs font-mono text-slate-400">/ 100</span>
            </div>
            <span className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">
              {isInsufficient ? 'Score unavailable' : 'Multi-criteria index'}
            </span>
          </div>

          {/* Surface Temperature */}
          <div className="flex flex-col">
            <span className="text-[10px] uppercase tracking-wider font-semibold text-slate-400">
              Surface LST (Landsat)
            </span>
            <div className="flex items-baseline gap-1 mt-0.5">
              <span className="text-3xl font-bold text-slate-900 dark:text-white font-mono leading-none">
                {isInsufficient || rawLST === undefined || rawLST === null ? '—' : rawLST.toFixed(1)}
              </span>
              <span className="text-xs font-mono text-slate-400">°C</span>
            </div>
            <span className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">
              {isInsufficient ? 'Cloud obscured' : 'Satellite observation'}
            </span>
          </div>

          {/* Data Completeness */}
          <div className="flex flex-col">
            <span className="text-[10px] uppercase tracking-wider font-semibold text-slate-400">
              Data Completeness
            </span>
            <div className="flex items-baseline gap-1 mt-0.5">
              <span className="text-2xl font-bold text-slate-900 dark:text-white font-mono leading-none">
                {completeness}%
              </span>
            </div>
            <span className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">
              Confidence: <strong>{confidence}</strong>
            </span>
          </div>

          {/* Canopy / NDVI */}
          <div className="flex flex-col">
            <span className="text-[10px] uppercase tracking-wider font-semibold text-slate-400">
              Vegetation (NDVI)
            </span>
            <div className="flex items-baseline gap-1 mt-0.5">
              <span className="text-2xl font-bold text-slate-900 dark:text-white font-mono leading-none">
                {isInsufficient || ndviVal === undefined || ndviVal === null ? '—' : ndviVal.toFixed(2)}
              </span>
            </div>
            <span className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">
              Sentinel-2 MSI
            </span>
          </div>
        </div>

        {/* Primary Driver Banner */}
        <div className="bg-slate-50 dark:bg-[#131724] border border-slate-200 dark:border-[#272f42] p-3 rounded-xl mb-4">
          <div className="text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400 tracking-wider">
            Primary Heat Driver
          </div>
          <div className="text-xs font-semibold text-slate-800 dark:text-slate-200 mt-0.5 flex items-center gap-1.5">
            {isInsufficient ? (
              <span className="text-amber-600 dark:text-amber-400">
                Insufficient observational data to evaluate drivers
              </span>
            ) : (
              <span>{primaryDriver}</span>
            )}
          </div>
        </div>

        {/* CTA: Explain Why */}
        <button
          type="button"
          onClick={onNavigateToExplain}
          className="w-full flex items-center justify-center gap-2 bg-[#0b1c30] hover:bg-slate-800 text-white font-semibold text-xs sm:text-sm py-2.5 px-4 rounded-xl shadow-xs transition-all cursor-pointer dark:bg-gradient-to-b dark:from-[#2a344a] dark:to-[#151926] dark:border dark:border-slate-300 dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.35)] dark:hover:border-white"
        >
          <span>Explain Why This Ward Is At Risk</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      {/* Ward Quick Selector List */}
      <div className="bg-white dark:bg-gradient-to-b dark:from-[#181d2a] dark:to-[#11141e] border border-slate-200 dark:border-[#2d364a] p-4 rounded-2xl shadow-xs">
        <div className="flex items-center justify-between mb-2.5">
          <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">
            High Priority Wards
          </span>
          <span className="text-[10px] font-mono text-slate-400">Top Candidates</span>
        </div>

        <div className="space-y-1">
          {topQueue.map(({ zone, score: zScore }) => {
            const zId = zone.wardId || zone.zoneId || zone.id || '';
            const isSelected = (selectedZone.wardId || selectedZone.zoneId || selectedZone.id) === zId;
            const name = (zone.wardName || zone.zoneName || zone.name || '').replace(/^(Ward\s*\d+\s*[-–:]\s*)/i, '');
            const num = (zone.wardId || zId).replace('ward-', '');
            const scoreNum = zScore.totalScore !== null ? zScore.totalScore.toFixed(0) : 'N/A';
            const lst = zone.metrics?.heat?.lst?.value?.toFixed(1) ?? '—';

            return (
              <button
                key={zId}
                type="button"
                onClick={() => onSelectZone?.(zId)}
                className={`w-full p-2 rounded-xl flex items-center justify-between cursor-pointer transition-colors text-left ${
                  isSelected
                    ? 'bg-slate-100 dark:bg-[#202738] border border-slate-300 dark:border-slate-400/50'
                    : 'hover:bg-slate-50 dark:hover:bg-[#171c2a]'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span
                    className={`w-2 h-2 rounded-full ${
                      zScore.totalScore === null
                        ? 'bg-slate-400'
                        : zScore.totalScore >= 75
                        ? 'bg-rose-600'
                        : 'bg-orange-500'
                    }`}
                  />
                  <span className="text-xs font-medium text-slate-800 dark:text-slate-200">
                    {num.padStart(3, '0')} • {name}
                  </span>
                </div>
                <div className="flex items-center gap-2 font-mono text-xs">
                  <span className="text-rose-600 dark:text-rose-400 font-bold">{scoreNum}</span>
                  <span className="text-slate-400">{lst !== '—' ? `${lst}°C` : '—'}</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
