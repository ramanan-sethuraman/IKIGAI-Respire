import React, { useState } from 'react';
import {
  Download,
  Copy,
  Printer,
  Check,
  Building2,
  ShieldCheck,
  Layers,
} from 'lucide-react';
import type { ScoredZoneItem } from './RiskSummaryCards';
import { exportZonesToCsv, copySummaryReport } from '../../utils/exportTelemetry';

interface ReportsViewProps {
  scoredZones: ScoredZoneItem[];
}

export const ReportsView: React.FC<ReportsViewProps> = ({ scoredZones }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    copySummaryReport(scoredZones);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  const totalWards = scoredZones.length || 200;
  const highRiskWards = scoredZones.filter((z) => {
    const band = z.score.riskBand ?? z.score.riskLevel;
    return band === 'VERY_HIGH' || band === 'HIGH';
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <section aria-labelledby="reports-header" className="space-y-3">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <div>
            <div className="flex items-center space-x-2 text-xs font-mono text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
              <span className="inline-block w-2 h-2 rounded-full bg-blue-500"></span>
              <span className="font-bold text-slate-900 dark:text-white">STAGE 07</span>
              <span className="text-slate-300 dark:text-slate-600">/</span>
              <span>COUNCIL DOCKETS & REPORTS</span>
            </div>
            <h1 id="reports-header" className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
              Urban Heat Resilience Decision Docket
            </h1>
            <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5">
              Formal decision briefing dockets, exportable CSV datasets, and administrative audit logs.
            </p>
          </div>

          {/* Quick Action Toolbar */}
          <div className="flex items-center gap-2 flex-wrap">
            <button
              type="button"
              onClick={() => exportZonesToCsv(scoredZones)}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold rounded-xl transition-all cursor-pointer dark:bg-gradient-to-b dark:from-[#242b3d] dark:to-[#141824] dark:border dark:border-slate-400/60 dark:text-slate-200 dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.2)] dark:hover:border-white"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export CSV</span>
            </button>
            <button
              type="button"
              onClick={handleCopy}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold rounded-xl transition-all cursor-pointer dark:bg-gradient-to-b dark:from-[#242b3d] dark:to-[#141824] dark:border dark:border-slate-400/60 dark:text-slate-200 dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.2)] dark:hover:border-white"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied' : 'Copy Text'}</span>
            </button>
            <button
              type="button"
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-[#0b1c30] hover:bg-slate-800 text-white text-xs font-semibold rounded-xl transition-all cursor-pointer dark:bg-gradient-to-b dark:from-[#2d374d] dark:to-[#161a28] dark:border dark:border-slate-300 dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.4)] dark:hover:border-white"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print / PDF</span>
            </button>
          </div>
        </div>
      </section>

      {/* Formal Decision Docket Document Container */}
      <div className="bg-white dark:bg-gradient-to-b dark:from-[#181d2a] dark:to-[#11141e] border border-slate-200 dark:border-[#2d364a] rounded-2xl p-6 sm:p-8 shadow-xs dark:shadow-[0_4px_20px_rgba(0,0,0,0.5),inset_0_1px_0_rgba(255,255,255,0.1)] space-y-6 max-w-5xl mx-auto">
        
        {/* Docket Header */}
        <div className="border-b-2 border-slate-900 dark:border-slate-300 pb-4 flex flex-col sm:flex-row sm:items-end justify-between gap-3">
          <div>
            <div className="text-[10px] font-mono uppercase tracking-widest text-slate-500 font-bold">
              GREATER CHENNAI CORPORATION • DISASTER MANAGEMENT & WORKS WING
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight mt-1">
              URBAN HEAT ACTION RESILIENCE DOCKET (FY 2026-27)
            </h2>
            <p className="text-xs text-slate-600 dark:text-slate-400 font-mono mt-0.5">
              Ref: GCC/DM/HEAT-2026/DKT-084 · Document Classification: OFFICIAL CIVIC RECORD
            </p>
          </div>
          <div className="text-right font-mono text-xs text-slate-500">
            <div>Date: <strong>09 September 2026</strong></div>
            <div>Wards Evaluated: <strong>{totalWards}</strong></div>
          </div>
        </div>

        {/* Section 1: Executive Summary */}
        <div className="space-y-2">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-slate-200 flex items-center gap-2">
            <Building2 className="w-4 h-4 text-blue-500" />
            <span>1. EXECUTIVE SUMMARY & STRATEGIC CONTEXT</span>
          </h3>
          <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
            In compliance with the Tamil Nadu State Disaster Management Authority guidelines and GCC Urban Heat Mitigation Policy, this docket synthesizes Landsat 8/9 thermal infrared satellite observations, Sentinel-2 canopy deficit calculations, and census socioeconomic vulnerability indices across all 200 wards. A total of <strong>{highRiskWards.length} wards</strong> exhibit elevated thermal risk requiring immediate structural and administrative cooling interventions.
          </p>
        </div>

        {/* Section 2: Priority Wards Candidate Table */}
        <div className="space-y-2">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-slate-200 flex items-center gap-2">
            <Layers className="w-4 h-4 text-blue-500" />
            <span>2. PRIORITY CANDIDATE SITES & RECOMMENDED INTERVENTIONS</span>
          </h3>
          <div className="border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-[#131724] text-slate-600 dark:text-slate-300 font-bold border-b border-slate-200 dark:border-slate-700">
                <tr>
                  <th className="p-2.5">Priority</th>
                  <th className="p-2.5">Ward & Zone</th>
                  <th className="p-2.5">Primary Risk Driver</th>
                  <th className="p-2.5">Intervention Package</th>
                  <th className="p-2.5">Lead Agency</th>
                  <th className="p-2.5 text-right">Planning Cost</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                <tr>
                  <td className="p-2.5 font-mono font-bold text-rose-600">#01</td>
                  <td className="p-2.5 font-bold text-slate-900 dark:text-white">Vyasarpadi (Ward 045, Zone IV)</td>
                  <td className="p-2.5 text-slate-600 dark:text-slate-300">Heat Exposure & Outdoor Workers</td>
                  <td className="p-2.5 text-slate-800 dark:text-slate-200 font-medium">Modular Outdoor Worker Hydration Shelter</td>
                  <td className="p-2.5 text-slate-600 dark:text-slate-400">GCC Works & Metro Water</td>
                  <td className="p-2.5 text-right font-mono font-bold text-slate-900 dark:text-white">₹72,000</td>
                </tr>
                <tr>
                  <td className="p-2.5 font-mono font-bold text-rose-600">#02</td>
                  <td className="p-2.5 font-bold text-slate-900 dark:text-white">Washermanpet (Ward 051, Zone V)</td>
                  <td className="p-2.5 text-slate-600 dark:text-slate-300">High Built Impervious Density</td>
                  <td className="p-2.5 text-slate-800 dark:text-slate-200 font-medium">High-Albedo Cool Roof Coating Program</td>
                  <td className="p-2.5 text-slate-600 dark:text-slate-400">TNUHDB & Slum Board</td>
                  <td className="p-2.5 text-right font-mono font-bold text-slate-900 dark:text-white">₹1,20,000</td>
                </tr>
                <tr>
                  <td className="p-2.5 font-mono font-bold text-orange-500">#03</td>
                  <td className="p-2.5 font-bold text-slate-900 dark:text-white">Royapuram (Ward 049, Zone V)</td>
                  <td className="p-2.5 text-slate-600 dark:text-slate-300">Severe Canopy & Green Deficit</td>
                  <td className="p-2.5 text-slate-800 dark:text-slate-200 font-medium">Urban Canopy Green Buffer Planting</td>
                  <td className="p-2.5 text-slate-600 dark:text-slate-400">GCC Parks & Playgrounds</td>
                  <td className="p-2.5 text-right font-mono font-bold text-slate-900 dark:text-white">₹95,000</td>
                </tr>
                <tr>
                  <td className="p-2.5 font-mono font-bold text-orange-500">#04</td>
                  <td className="p-2.5 font-bold text-slate-900 dark:text-white">T. Nagar (Ward 134, Zone X)</td>
                  <td className="p-2.5 text-slate-600 dark:text-slate-300">Pedestrian Exposure & Urban Heat Island</td>
                  <td className="p-2.5 text-slate-800 dark:text-slate-200 font-medium">Pedestrian Misting & Shade Canopies</td>
                  <td className="p-2.5 text-slate-600 dark:text-slate-400">GCC Smart City SPV</td>
                  <td className="p-2.5 text-right font-mono font-bold text-slate-900 dark:text-white">₹85,000</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Section 3: Governance & Missing Data Declarations */}
        <div className="space-y-2">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-slate-200 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
            <span>3. TRANSPARENCY & DATA INTEGRITY DISCLOSURES</span>
          </h3>
          <div className="p-3 bg-slate-50 dark:bg-[#131724] border border-slate-200 dark:border-[#272f42] rounded-xl text-xs text-slate-600 dark:text-slate-400 space-y-1">
            <p>
              • <strong>Deterministic Rule Scoring:</strong> Scores strictly adhere to the formula <code>Score = (Heat × 50%) + (Veg × 20%) + (Vuln × 30%)</code>.
            </p>
            <p>
              • <strong>Explicit Exclusion of Missing Evidence:</strong> Wards with insufficient satellite passover (e.g. Ward 198) are formally flagged as unranked pending field sensor installation.
            </p>
          </div>
        </div>

        {/* Section 4: Administrative Sign-Off Lines */}
        <div className="pt-6 border-t-2 border-slate-200 dark:border-slate-700 grid grid-cols-1 sm:grid-cols-3 gap-6 text-center text-xs">
          <div className="space-y-6">
            <div className="h-10 border-b border-dashed border-slate-300 dark:border-slate-600" />
            <div>
              <div className="font-bold text-slate-900 dark:text-white">Chief Engineer (Works)</div>
              <div className="text-[11px] text-slate-400">Greater Chennai Corporation</div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="h-10 border-b border-dashed border-slate-300 dark:border-slate-600" />
            <div>
              <div className="font-bold text-slate-900 dark:text-white">City Health Officer</div>
              <div className="text-[11px] text-slate-400">Public Health Department</div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="h-10 border-b border-dashed border-slate-300 dark:border-slate-600" />
            <div>
              <div className="font-bold text-slate-900 dark:text-white">Commissioner</div>
              <div className="text-[11px] text-slate-400">Greater Chennai Corporation</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
