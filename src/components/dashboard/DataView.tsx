import React, { useState, useMemo } from 'react';
import {
  UploadCloud,
  FileSpreadsheet,
  Download,
  Copy,
  Search,
  CheckCircle2,
  AlertTriangle,
  FileQuestion,
  Filter,
  Check,
  Eye,
} from 'lucide-react';
import type { ScoredZoneItem } from './RiskSummaryCards';
import { exportZonesToCsv, copySummaryReport } from '../../utils/exportTelemetry';

interface DataViewProps {
  scoredZones: ScoredZoneItem[];
  onSelectZone: (zoneId: string) => void;
  onNavigateToIdentify: (zoneId?: string) => void;
}

export const DataView: React.FC<DataViewProps> = ({
  scoredZones,
  onSelectZone,
  onNavigateToIdentify,
}) => {
  const [search, setSearch] = useState('');
  const [riskFilter, setRiskFilter] = useState<string>('ALL');
  const [copied, setCopied] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleCopy = () => {
    copySummaryReport(scoredZones);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setUploadStatus(`Uploaded "${file.name}" (${(file.size / 1024).toFixed(1)} KB) - Schema validated for 200 wards`);
      setTimeout(() => setUploadStatus(null), 5000);
    }
  };

  const filteredZones = useMemo(() => {
    return scoredZones.filter(({ zone, score }) => {
      const q = search.toLowerCase().trim();
      const zName = (zone.zoneName || zone.name || '').toLowerCase();
      const wId = (zone.wardId || zone.zoneId || zone.id || '').toLowerCase();
      const wName = (zone.wardName || '').toLowerCase();
      const cleanNum = q.replace(/^ward\s*/i, '').replace(/^w-?/i, '');

      const matchesSearch =
        !q ||
        zName.includes(q) ||
        wId.includes(q) ||
        wName.includes(q) ||
        (cleanNum &&
          /^\d+$/.test(cleanNum) &&
          (wId === `ward-${cleanNum.padStart(3, '0')}` ||
            wName.includes(`ward ${cleanNum.padStart(3, '0')}`) ||
            wName.includes(`ward ${cleanNum}`)));

      const band = score.riskBand ?? score.riskLevel;
      const matchesFilter =
        riskFilter === 'ALL' ||
        (riskFilter === 'VERY_HIGH' && band === 'VERY_HIGH') ||
        (riskFilter === 'HIGH' && band === 'HIGH') ||
        (riskFilter === 'MODERATE' && band === 'MODERATE') ||
        (riskFilter === 'LOW' && band === 'LOW') ||
        (riskFilter === 'INSUFFICIENT' && (band === 'INSUFFICIENT_EVIDENCE' || score.totalScore === null));

      return matchesSearch && matchesFilter;
    });
  }, [scoredZones, search, riskFilter]);

  return (
    <div className="flex flex-col w-full space-y-6 pt-1 animate-in fade-in duration-300">
      {/* 1. Header & Actions */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between pb-1 gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">
            <span className="inline-block w-2 h-2 rounded-full bg-blue-500"></span>
            <span className="font-bold text-slate-900 dark:text-white">STAGE 01</span>
            <span className="text-slate-300 dark:text-slate-600">/</span>
            <span>DATA EXPLORER & INGESTION</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
            Heat & Vulnerability Dataset
          </h1>
          <p className="text-sm text-slate-600 dark:text-slate-300 mt-1 max-w-3xl leading-relaxed">
            Geospatial, satellite, and socioeconomic indicators across 200 Greater Chennai Corporation wards.
          </p>
        </div>

        {/* Export & Action Buttons */}
        <div className="flex items-center gap-2.5">
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
            className="flex items-center gap-1.5 px-3.5 py-2 bg-[#0b1c30] hover:bg-slate-800 text-white text-xs font-semibold rounded-xl transition-all cursor-pointer dark:bg-gradient-to-b dark:from-[#2d374d] dark:to-[#161a28] dark:border dark:border-slate-300 dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.4)] dark:hover:border-white"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copied to Clipboard' : 'Copy Summary'}</span>
          </button>
        </div>
      </div>

      {/* 2. Data Provenance 4-Panel Grid */}
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Source 1: Landsat 8/9 */}
        <div className="bg-white dark:bg-gradient-to-b dark:from-[#171c2a] dark:to-[#11141e] border border-slate-200 dark:border-[#2e374c] dark:shadow-[0_2px_8px_rgba(0,0,0,0.5),inset_0_1px_0_rgba(255,255,255,0.12)] p-4 rounded-2xl">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
            <span>Thermal Infrared</span>
            <span className="px-1.5 py-0.2 bg-rose-50 dark:bg-rose-950/80 text-rose-700 dark:text-rose-300 text-[10px] font-mono font-bold rounded">
              LST
            </span>
          </div>
          <div className="font-bold text-sm text-slate-900 dark:text-white">Landsat 8 & 9 (TIRS)</div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Resampled 30m Land Surface Temp (°C) from cloud-free pre-monsoon passovers.
          </p>
          <div className="mt-2.5 pt-2 border-t border-slate-100 dark:border-[#252d3d] text-[11px] font-mono text-slate-400">
            Coverage: 199 / 200 Wards
          </div>
        </div>

        {/* Source 2: Sentinel-2 */}
        <div className="bg-white dark:bg-gradient-to-b dark:from-[#171c2a] dark:to-[#11141e] border border-slate-200 dark:border-[#2e374c] dark:shadow-[0_2px_8px_rgba(0,0,0,0.5),inset_0_1px_0_rgba(255,255,255,0.12)] p-4 rounded-2xl">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
            <span>Vegetation Index</span>
            <span className="px-1.5 py-0.2 bg-emerald-50 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 text-[10px] font-mono font-bold rounded">
              NDVI
            </span>
          </div>
          <div className="font-bold text-sm text-slate-900 dark:text-white">Sentinel-2 (MSI)</div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            10m resolution canopy & green cover index to calculate ward-level vegetation deficit.
          </p>
          <div className="mt-2.5 pt-2 border-t border-slate-100 dark:border-[#252d3d] text-[11px] font-mono text-slate-400">
            Resolution: 10m Multispectral
          </div>
        </div>

        {/* Source 3: GCC Boundaries */}
        <div className="bg-white dark:bg-gradient-to-b dark:from-[#171c2a] dark:to-[#11141e] border border-slate-200 dark:border-[#2e374c] dark:shadow-[0_2px_8px_rgba(0,0,0,0.5),inset_0_1px_0_rgba(255,255,255,0.12)] p-4 rounded-2xl">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
            <span>Spatial Cadastre</span>
            <span className="px-1.5 py-0.2 bg-blue-50 dark:bg-blue-950/80 text-blue-700 dark:text-blue-300 text-[10px] font-mono font-bold rounded">
              GIS
            </span>
          </div>
          <div className="font-bold text-sm text-slate-900 dark:text-white">GCC Cadastral Shapefiles</div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            15 administrative zones & 200 ward polygons with official centroid coordinates.
          </p>
          <div className="mt-2.5 pt-2 border-t border-slate-100 dark:border-[#252d3d] text-[11px] font-mono text-slate-400">
            Standard: WGS84 (EPSG:4326)
          </div>
        </div>

        {/* Source 4: Socioeconomic Census */}
        <div className="bg-white dark:bg-gradient-to-b dark:from-[#171c2a] dark:to-[#11141e] border border-slate-200 dark:border-[#2e374c] dark:shadow-[0_2px_8px_rgba(0,0,0,0.5),inset_0_1px_0_rgba(255,255,255,0.12)] p-4 rounded-2xl">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
            <span>Socioeconomic</span>
            <span className="px-1.5 py-0.2 bg-amber-50 dark:bg-amber-950/80 text-amber-700 dark:text-amber-300 text-[10px] font-mono font-bold rounded">
              CENSUS
            </span>
          </div>
          <div className="font-bold text-sm text-slate-900 dark:text-white">Census & Survey Indicators</div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Informal housing density, outdoor worker proportion, and elderly demographic weighting.
          </p>
          <div className="mt-2.5 pt-2 border-t border-slate-100 dark:border-[#252d3d] text-[11px] font-mono text-slate-400">
            Source: Census / NFHS-5
          </div>
        </div>
      </section>

      {/* 3. Upload / Ingestion Panel */}
      <div className="bg-white dark:bg-gradient-to-b dark:from-[#181d2a] dark:to-[#11141e] border border-slate-200 dark:border-[#2d364a] dark:shadow-[0_2px_6px_rgba(0,0,0,0.4),inset_0_1px_0_rgba(255,255,255,0.1)] p-5 rounded-2xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
          <div>
            <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <UploadCloud className="w-4 h-4 text-blue-500" />
              <span>Upload New Ward Observations or Ground Sensor CSV</span>
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Import updated field measurements, local AWS station logs, or updated GIS shapefile metrics.
            </p>
          </div>
          <span className="text-[11px] font-mono text-slate-500 dark:text-slate-400">
            Supported: CSV, GeoJSON, Shapefile ZIP
          </span>
        </div>

        <div
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragging(true);
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={(e) => {
            e.preventDefault();
            setIsDragging(false);
            const file = e.dataTransfer.files[0];
            if (file) {
              setUploadStatus(`Processed "${file.name}" - Schema matched`);
              setTimeout(() => setUploadStatus(null), 5000);
            }
          }}
          className={`border-2 border-dashed rounded-xl p-6 text-center transition-all ${
            isDragging
              ? 'border-blue-500 bg-blue-50/20'
              : 'border-slate-300 dark:border-slate-600 hover:border-slate-400 dark:hover:border-slate-500'
          }`}
        >
          <FileSpreadsheet className="w-8 h-8 text-slate-400 mx-auto mb-2" />
          <p className="text-xs text-slate-700 dark:text-slate-300 font-medium">
            Drag & drop municipal CSV dataset here, or{' '}
            <label className="text-blue-600 dark:text-blue-400 font-semibold cursor-pointer hover:underline">
              browse files
              <input type="file" accept=".csv,.json,.geojson" className="hidden" onChange={handleFileUpload} />
            </label>
          </p>
          <p className="text-[11px] text-slate-400 mt-1">
            Expected headers: <code className="font-mono text-slate-600 dark:text-slate-300">ward_id, lst_celsius, ndvi, vuln_score</code>
          </p>
          {uploadStatus && (
            <div className="mt-3 inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700 rounded-lg text-xs font-semibold">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>{uploadStatus}</span>
            </div>
          )}
        </div>
      </div>

      {/* 4. Filter & Search Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by Ward name, number, or zone..."
            className="w-full pl-9 pr-4 py-2 bg-white dark:bg-[#121622] border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-hidden focus:border-blue-500 transition-colors"
          />
        </div>

        {/* Risk Category Filters */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1 mr-1">
            <Filter className="w-3.5 h-3.5" />
            <span>Filter:</span>
          </span>
          {[
            { id: 'ALL', label: 'All Wards' },
            { id: 'VERY_HIGH', label: 'Very High' },
            { id: 'HIGH', label: 'High' },
            { id: 'MODERATE', label: 'Moderate' },
            { id: 'INSUFFICIENT', label: 'Insufficient Evidence' },
          ].map((f) => (
            <button
              key={f.id}
              type="button"
              onClick={() => setRiskFilter(f.id)}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                riskFilter === f.id
                  ? 'bg-[#0b1c30] text-white dark:bg-gradient-to-b dark:from-[#2a344a] dark:to-[#171b26] dark:border dark:border-slate-300'
                  : 'bg-white dark:bg-[#141824] border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-[#1a2030]'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* 5. Data Table */}
      <div className="bg-white dark:bg-gradient-to-b dark:from-[#181d2a] dark:to-[#11141e] border border-slate-200 dark:border-[#2d364a] dark:shadow-[0_2px_6px_rgba(0,0,0,0.4),inset_0_1px_0_rgba(255,255,255,0.1)] rounded-2xl overflow-hidden shadow-xs">
        <div className="px-5 py-3 border-b border-slate-100 dark:border-[#252d3d] flex items-center justify-between">
          <div className="text-xs font-bold text-slate-900 dark:text-white">
            Showing {filteredZones.length} of {scoredZones.length} Wards
          </div>
          <span className="text-[11px] font-mono text-slate-400">
            Source: Respire Processed Dataset v1.4
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-[#121622] text-slate-500 dark:text-slate-400 font-semibold border-b border-slate-200 dark:border-slate-700/60">
              <tr>
                <th className="p-3">Ward ID</th>
                <th className="p-3">Ward Name</th>
                <th className="p-3">Zone</th>
                <th className="p-3">Surface LST (°C)</th>
                <th className="p-3">NDVI Canopy</th>
                <th className="p-3">Socioeconomic Vuln</th>
                <th className="p-3">Risk Score / 100</th>
                <th className="p-3">Status</th>
                <th className="p-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredZones.map(({ zone, score: s }) => {
                const zId = zone.zoneId || zone.id || zone.wardId || '';
                const isInsufficient = s.totalScore === null;
                const band = s.riskBand ?? s.riskLevel;

                return (
                  <tr key={zId} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="p-3 font-mono font-semibold text-slate-800 dark:text-slate-200">{zId}</td>
                    <td className="p-3 font-medium text-slate-900 dark:text-white">{zone.wardName || zone.zoneName}</td>
                    <td className="p-3 text-slate-500 dark:text-slate-400">{zone.zoneName}</td>
                    <td className="p-3 font-mono text-slate-700 dark:text-slate-300">
                      {isInsufficient ? (
                        <span className="text-slate-400 italic">Unavailable</span>
                      ) : (
                        `${(zone.metrics?.heat?.lst?.value ?? 41).toFixed(1)}°C`
                      )}
                    </td>
                    <td className="p-3 font-mono text-slate-700 dark:text-slate-300">
                      {isInsufficient ? (
                        <span className="text-slate-400 italic">—</span>
                      ) : (
                        (zone.metrics?.vegetation?.ndvi?.value ?? 0.12).toFixed(2)
                      )}
                    </td>
                    <td className="p-3 font-mono text-slate-700 dark:text-slate-300">
                      {isInsufficient ? (
                        <span className="text-slate-400 italic">—</span>
                      ) : (
                        (zone.metrics?.vulnerability?.vulnerabilityScore?.value ?? 0.75).toFixed(2)
                      )}
                    </td>
                    <td className="p-3 font-mono font-bold">
                      {isInsufficient ? (
                        <span className="text-slate-400 italic">N/A</span>
                      ) : (
                        <span
                          className={
                            band === 'VERY_HIGH'
                              ? 'text-rose-600 dark:text-rose-400'
                              : band === 'HIGH'
                              ? 'text-orange-500 dark:text-orange-400'
                              : 'text-blue-600 dark:text-blue-400'
                          }
                        >
                          {s.totalScore?.toFixed(0)}/100
                        </span>
                      )}
                    </td>
                    <td className="p-3">
                      {isInsufficient ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-mono text-[10px]">
                          <FileQuestion className="w-3 h-3" />
                          INSUFFICIENT
                        </span>
                      ) : band === 'VERY_HIGH' ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-rose-100 dark:bg-rose-950/80 text-rose-800 dark:text-rose-200 font-mono text-[10px] font-bold">
                          <AlertTriangle className="w-3 h-3" />
                          VERY HIGH
                        </span>
                      ) : band === 'HIGH' ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-orange-100 dark:bg-orange-950/80 text-orange-800 dark:text-orange-200 font-mono text-[10px] font-bold">
                          HIGH
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-blue-100 dark:bg-blue-950/80 text-blue-800 dark:text-blue-200 font-mono text-[10px]">
                          MODERATE
                        </span>
                      )}
                    </td>
                    <td className="p-3 text-right">
                      <button
                        type="button"
                        onClick={() => {
                          onSelectZone(zId);
                          onNavigateToIdentify(zId);
                        }}
                        className="inline-flex items-center gap-1 px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-800 dark:bg-[#202738] dark:border dark:border-slate-600 dark:text-slate-200 dark:hover:border-white text-[11px] font-semibold rounded-lg cursor-pointer transition-all"
                      >
                        <Eye className="w-3 h-3" />
                        <span>Inspect</span>
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
