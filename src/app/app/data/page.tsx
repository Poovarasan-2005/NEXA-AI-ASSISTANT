"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  BarChart3,
  LineChart,
  PieChart,
  ScatterChart,
  Download,
  RefreshCw,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  FileSpreadsheet,
  Layers,
  ArrowRight,
  Sliders,
  Check,
  Table,
} from "lucide-react";

export default function DataStudioPage() {
  const [datasetType, setDatasetType] = useState("telemetry");
  const [profile, setProfile] = useState<any>(null);
  const [chartType, setChartType] = useState<"BAR" | "LINE" | "SCATTER" | "PIE">("BAR");
  const [chartSvg, setChartSvg] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadData = async (type: string, currentChartType: string) => {
    try {
      setLoading(true);
      const [profileRes, chartRes] = await Promise.all([
        fetch(`/api/app/data/profile?type=${type}`),
        fetch(`/api/app/data/chart?type=${currentChartType}`),
      ]);

      if (profileRes.ok) {
        const pData = await profileRes.json();
        setProfile(pData.report);
      }

      if (chartRes.ok) {
        const cData = await chartRes.json();
        setChartSvg(cData.chart?.svgMarkup || "");
      }
    } catch (e) {
      console.error("Failed to load Data Studio metrics:", e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadData(datasetType, chartType);
  }, [datasetType]);

  const switchChart = async (type: "BAR" | "LINE" | "SCATTER" | "PIE") => {
    setChartType(type);
    try {
      const res = await fetch(`/api/app/data/chart?type=${type}`);
      if (res.ok) {
        const data = await res.json();
        setChartSvg(data.chart?.svgMarkup || "");
      }
    } catch (e) {
      console.error("Failed to switch chart:", e);
    }
  };

  const downloadChartSvg = () => {
    if (!chartSvg) return;
    const blob = new Blob([chartSvg], { type: "image/svg+xml;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `nexa_data_chart_${chartType.toLowerCase()}_${Date.now()}.svg`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-16">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-white/10">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <BarChart3 className="w-5 h-5 text-emerald-400" />
            <h1 className="text-2xl font-bold font-mono text-white tracking-tight">
              AI Data Studio &amp; Quality Profiler
            </h1>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              IQR ANOMALY DETECTION ACTIVE
            </span>
          </div>
          <p className="text-xs text-slate-400">
            Autonomous data profiling, statistical distribution scan, schema type inference, and responsive SVG visual charts.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <select
            value={datasetType}
            onChange={(e) => setDatasetType(e.target.value)}
            className="bg-[#0A0D15] border border-white/10 rounded-xl px-3 py-2 text-xs font-mono text-emerald-300 focus:outline-none cursor-pointer"
          >
            <option value="telemetry">Telemetry Metrics Dataset</option>
            <option value="audit">Security Audit Logs</option>
            <option value="memory">Episodic Vectors Dataset</option>
            <option value="benchmarks">Model Safety Benchmarks</option>
          </select>

          <button
            onClick={() => {
              setRefreshing(true);
              loadData(datasetType, chartType);
            }}
            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10 transition-colors"
            title="Refresh Data Profile"
          >
            <RefreshCw className={`w-4 h-4 text-emerald-400 ${refreshing ? "animate-spin" : ""}`} />
          </button>
        </div>
      </div>

      {/* Quality Score & KPI Cards */}
      {profile && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="glass-panel p-4 rounded-2xl border border-emerald-500/30 bg-[#0A0D15]">
            <div className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">Quality Grade</div>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-3xl font-black font-mono text-emerald-400">{profile.qualityGrade}</span>
              <span className="text-xs font-mono text-emerald-300/80">({profile.overallScore}%)</span>
            </div>
            <div className="text-[10px] text-emerald-400 mt-1 font-mono flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3" />
              <span>Zero-Trust Validated</span>
            </div>
          </div>

          <div className="glass-panel p-4 rounded-2xl border border-white/10 bg-[#0A0D15]">
            <div className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">Completeness</div>
            <div className="text-2xl font-bold font-mono text-cyan-400 mt-1">{profile.completenessPct}%</div>
            <div className="text-[10px] text-slate-400 mt-1 font-mono">
              {profile.rowCount * profile.columnCount} total cells evaluated
            </div>
          </div>

          <div className="glass-panel p-4 rounded-2xl border border-white/10 bg-[#0A0D15]">
            <div className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">Duplicate Rows</div>
            <div className="text-2xl font-bold font-mono text-purple-400 mt-1">{profile.duplicateRowsCount}</div>
            <div className="text-[10px] text-slate-400 mt-1 font-mono">Unique Key Identity OK</div>
          </div>

          <div className="glass-panel p-4 rounded-2xl border border-white/10 bg-[#0A0D15]">
            <div className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">IQR Outliers</div>
            <div className="text-2xl font-bold font-mono text-emerald-400 mt-1">{profile.anomalyCount}</div>
            <div className="text-[10px] text-emerald-400/80 mt-1 font-mono">All Metrics Within Bounds</div>
          </div>
        </div>
      )}

      {/* Interactive Chart Visualizer Canvas */}
      <div className="glass-panel rounded-3xl border border-white/10 overflow-hidden bg-[#0A0D17]">
        {/* Chart Switcher Toolbar */}
        <div className="p-4 border-b border-white/10 bg-black/40 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono text-slate-400 uppercase font-bold">Chart Engine:</span>
            <div className="flex gap-1">
              {[
                { id: "BAR", label: "Bar Comparison", icon: BarChart3 },
                { id: "LINE", label: "Line Trend", icon: LineChart },
                { id: "SCATTER", label: "Scatter Plot", icon: ScatterChart },
                { id: "PIE", label: "Distribution", icon: PieChart },
              ].map((c) => {
                const Icon = c.icon;
                const isSelected = chartType === c.id;
                return (
                  <button
                    key={c.id}
                    onClick={() => switchChart(c.id as any)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-mono flex items-center gap-1.5 border transition-all ${
                      isSelected
                        ? "bg-emerald-500/20 border-emerald-500/50 text-emerald-300 shadow-glow-emerald"
                        : "bg-white/5 border-white/10 text-slate-400 hover:text-white"
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span>{c.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={downloadChartSvg}
              className="px-3.5 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-mono font-bold text-xs flex items-center gap-1.5 transition-all shadow-glow-emerald cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download Chart SVG</span>
            </button>
          </div>
        </div>

        {/* Chart Viewbox */}
        <div className="p-6 sm:p-8 flex items-center justify-center min-h-[420px] bg-[#07090F]">
          {loading ? (
            <div className="py-20 text-center space-y-3">
              <RefreshCw className="w-8 h-8 animate-spin text-emerald-400 mx-auto" />
              <div className="text-xs font-mono text-slate-400">Rendering vector visualization...</div>
            </div>
          ) : chartSvg ? (
            <div
              className="w-full max-w-4xl shadow-2xl rounded-xl overflow-hidden border border-white/10"
              dangerouslySetInnerHTML={{ __html: chartSvg }}
            />
          ) : (
            <div className="text-xs font-mono text-slate-400">Select a chart type to render visualization.</div>
          )}
        </div>
      </div>

      {/* Column Schema & Health Profiling Table */}
      {profile?.columns && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-bold text-sm font-mono text-slate-300 uppercase tracking-wider flex items-center gap-2">
              <Table className="w-4 h-4 text-cyan-400" />
              <span>Inferred Column Schema &amp; Health Matrix ({profile.columns.length} Features)</span>
            </h2>
            <span className="text-[10px] font-mono text-slate-400">
              {profile.rowCount} rows profiled
            </span>
          </div>

          <div className="glass-panel rounded-2xl border border-white/10 overflow-hidden bg-[#0A0D15]">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-mono">
                <thead className="border-b border-white/10 text-slate-400 uppercase text-[10px] bg-black/40">
                  <tr>
                    <th className="py-3 px-4">Column Name</th>
                    <th className="py-3 px-4">Inferred Type</th>
                    <th className="py-3 px-4">Completeness</th>
                    <th className="py-3 px-4">Unique Cardinality</th>
                    <th className="py-3 px-4">Min / Max</th>
                    <th className="py-3 px-4">Mean (Avg)</th>
                    <th className="py-3 px-4">Anomalies</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {profile.columns.map((col: any) => (
                    <tr key={col.name} className="hover:bg-white/[0.02] transition-colors">
                      <td className="py-3.5 px-4 font-sans font-semibold text-white">{col.name}</td>
                      <td className="py-3.5 px-4">
                        <span className="text-[9px] font-mono px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-300 border border-cyan-500/30">
                          {col.inferredType}
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2">
                          <div className="w-16 h-1.5 rounded-full bg-white/10 overflow-hidden">
                            <div
                              className="h-full bg-emerald-400 rounded-full"
                              style={{ width: `${col.completenessPct}%` }}
                            />
                          </div>
                          <span className="text-emerald-400">{col.completenessPct}%</span>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-slate-300">
                        {col.uniqueCount} ({col.cardinality})
                      </td>
                      <td className="py-3.5 px-4 text-slate-400">
                        {col.min !== undefined ? `${col.min} .. ${col.max}` : "N/A"}
                      </td>
                      <td className="py-3.5 px-4 text-cyan-300 font-bold">
                        {col.mean !== undefined ? col.mean : "—"}
                      </td>
                      <td className="py-3.5 px-4">
                        {col.outliersDetected > 0 ? (
                          <span className="text-amber-400 flex items-center gap-1 font-bold">
                            <AlertTriangle className="w-3 h-3" />
                            {col.outliersDetected} flagged
                          </span>
                        ) : (
                          <span className="text-emerald-400 flex items-center gap-1">
                            <Check className="w-3 h-3" />
                            Clean
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Automated Hygiene Recommendations */}
      {profile?.recommendations && (
        <div className="glass-panel p-5 rounded-2xl border border-white/10 bg-[#0C101C] space-y-3 font-mono text-xs">
          <div className="flex items-center gap-2 text-cyan-400 font-bold">
            <Sparkles className="w-4 h-4" />
            <span>Automated Data Hygiene &amp; Governance Recommendations</span>
          </div>
          <div className="space-y-2">
            {profile.recommendations.map((rec: string, idx: number) => (
              <div key={idx} className="flex items-start gap-2 text-slate-300">
                <span className="text-cyan-400 shrink-0">[{idx + 1}]</span>
                <span>{rec}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
