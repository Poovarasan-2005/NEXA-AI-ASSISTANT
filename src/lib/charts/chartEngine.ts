export type ChartType = "BAR" | "LINE" | "SCATTER" | "PIE";

export interface ChartDataPoint {
  label: string;
  value: number;
  secondaryValue?: number;
  category?: string;
}

export interface ChartConfig {
  title: string;
  type: ChartType;
  xAxisLabel?: string;
  yAxisLabel?: string;
  data: ChartDataPoint[];
}

export interface ChartResult {
  id: string;
  title: string;
  type: ChartType;
  svgMarkup: string;
  dataPointsCount: number;
  summary: string;
}

export function generateChart(config: ChartConfig): ChartResult {
  const { title, type, data } = config;
  const id = `chart_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;

  let svgMarkup = "";
  let summary = "";

  switch (type) {
    case "LINE":
      svgMarkup = renderLineChartSvg(title, data, config.xAxisLabel, config.yAxisLabel);
      summary = `Line trend showing progression across ${data.length} sample points.`;
      break;
    case "SCATTER":
      svgMarkup = renderScatterChartSvg(title, data, config.xAxisLabel, config.yAxisLabel);
      summary = `Scatter plot correlating 2-dimensional metrics across ${data.length} records.`;
      break;
    case "PIE":
      svgMarkup = renderPieChartSvg(title, data);
      summary = `Proportional distribution across ${data.length} distinct categorical segments.`;
      break;
    case "BAR":
    default:
      svgMarkup = renderBarChartSvg(title, data, config.xAxisLabel, config.yAxisLabel);
      summary = `Bar comparison chart across ${data.length} categorical bins.`;
      break;
  }

  return {
    id,
    title,
    type,
    svgMarkup,
    dataPointsCount: data.length,
    summary,
  };
}

// Preset Generator for Quick Data Studio Demos
export function getPresetChart(type: ChartType = "BAR"): ChartResult {
  switch (type) {
    case "LINE":
      return generateChart({
        title: "Episodic Memory Recall Latency (Last 7 Epochs)",
        type: "LINE",
        xAxisLabel: "Epoch",
        yAxisLabel: "Latency (ms)",
        data: [
          { label: "Ep-1", value: 24.5 },
          { label: "Ep-2", value: 21.2 },
          { label: "Ep-3", value: 18.0 },
          { label: "Ep-4", value: 16.4 },
          { label: "Ep-5", value: 14.8 },
          { label: "Ep-6", value: 13.9 },
          { label: "Ep-7", value: 12.1 },
        ],
      });

    case "PIE":
      return generateChart({
        title: "Sovereign Memory Tier Distribution",
        type: "PIE",
        data: [
          { label: "Semantic Vectors", value: 45 },
          { label: "Episodic Traces", value: 30 },
          { label: "Procedural Rules", value: 15 },
          { label: "Identity & Prefs", value: 10 },
        ],
      });

    case "SCATTER":
      return generateChart({
        title: "Inference Latency vs Context Window Size",
        type: "SCATTER",
        xAxisLabel: "Context Tokens (x1000)",
        yAxisLabel: "Latency (ms)",
        data: [
          { label: "Req-1", value: 2, secondaryValue: 85 },
          { label: "Req-2", value: 4, secondaryValue: 110 },
          { label: "Req-3", value: 8, secondaryValue: 145 },
          { label: "Req-4", value: 16, secondaryValue: 195 },
          { label: "Req-5", value: 32, secondaryValue: 280 },
          { label: "Req-6", value: 64, secondaryValue: 410 },
        ],
      });

    case "BAR":
    default:
      return generateChart({
        title: "Subsystem Operational Efficiency (Grade A Targets)",
        type: "BAR",
        xAxisLabel: "Subsystem",
        yAxisLabel: "Efficiency Score (%)",
        data: [
          { label: "Sandbox Isolation", value: 99.8 },
          { label: "Human Firewall", value: 100.0 },
          { label: "Memory Recall", value: 98.4 },
          { label: "Model Router", value: 97.9 },
          { label: "Audit Vault", value: 100.0 },
          { label: "Secret Scrubber", value: 100.0 },
        ],
      });
  }
}

// 1. BAR CHART SVG
function renderBarChartSvg(
  title: string,
  data: ChartDataPoint[],
  xLabel = "Category",
  yLabel = "Metric Value"
): string {
  const width = 800;
  const height = 400;
  const padding = { top: 60, right: 40, bottom: 60, left: 70 };
  const chartW = width - padding.left - padding.right;
  const chartH = height - padding.top - padding.bottom;

  const maxVal = Math.max(...data.map((d) => d.value), 100);
  const barW = Math.min(Math.floor(chartW / data.length) - 16, 60);

  let barsSvg = "";
  data.forEach((d, i) => {
    const barH = (d.value / maxVal) * chartH;
    const x = padding.left + i * (chartW / data.length) + (chartW / data.length - barW) / 2;
    const y = padding.top + chartH - barH;
    const gradId = `barGrad_${i % 4}`;

    barsSvg += `
      <rect x="${x}" y="${y}" width="${barW}" height="${barH}" rx="6" fill="url(#${gradId})" />
      <text x="${x + barW / 2}" y="${y - 8}" fill="#38bdf8" font-size="11" font-family="monospace" font-weight="bold" text-anchor="middle">${d.value}%</text>
      <text x="${x + barW / 2}" y="${padding.top + chartH + 20}" fill="#94a3b8" font-size="10" font-family="sans-serif" text-anchor="middle">${d.label}</text>
    `;
  });

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="100%" height="100%" style="background:#090d16; border-radius:12px; font-family:'Segoe UI',system-ui,sans-serif;">
  <defs>
    <linearGradient id="barGrad_0" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#06b6d4" /><stop offset="100%" stop-color="#0284c7" />
    </linearGradient>
    <linearGradient id="barGrad_1" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#10b981" /><stop offset="100%" stop-color="#059669" />
    </linearGradient>
    <linearGradient id="barGrad_2" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#8b5cf6" /><stop offset="100%" stop-color="#6d28d9" />
    </linearGradient>
    <linearGradient id="barGrad_3" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#38bdf8" /><stop offset="100%" stop-color="#0369a1" />
    </linearGradient>
  </defs>

  <text x="${padding.left}" y="36" fill="#06b6d4" font-size="11" font-family="monospace" font-weight="bold" letter-spacing="1.5">DATA STUDIO // BAR VISUALIZATION</text>
  <text x="${padding.left}" y="52" fill="#ffffff" font-size="15" font-weight="bold">${title}</text>

  <!-- Grid Lines -->
  <line x1="${padding.left}" y1="${padding.top}" x2="${width - padding.right}" y2="${padding.top}" stroke="#1e293b" stroke-dasharray="3" />
  <line x1="${padding.left}" y1="${padding.top + chartH / 2}" x2="${width - padding.right}" y2="${padding.top + chartH / 2}" stroke="#1e293b" stroke-dasharray="3" />
  <line x1="${padding.left}" y1="${padding.top + chartH}" x2="${width - padding.right}" y2="${padding.top + chartH}" stroke="#334155" stroke-width="1.5" />

  <!-- Y Axis Labels -->
  <text x="${padding.left - 12}" y="${padding.top + 4}" fill="#64748b" font-size="10" font-family="monospace" text-anchor="end">${maxVal}</text>
  <text x="${padding.left - 12}" y="${padding.top + chartH / 2 + 4}" fill="#64748b" font-size="10" font-family="monospace" text-anchor="end">${(maxVal / 2).toFixed(0)}</text>
  <text x="${padding.left - 12}" y="${padding.top + chartH + 4}" fill="#64748b" font-size="10" font-family="monospace" text-anchor="end">0</text>

  ${barsSvg}
</svg>`;
}

// 2. LINE CHART SVG
function renderLineChartSvg(
  title: string,
  data: ChartDataPoint[],
  xLabel = "Time",
  yLabel = "Value"
): string {
  const width = 800;
  const height = 400;
  const padding = { top: 60, right: 40, bottom: 60, left: 70 };
  const chartW = width - padding.left - padding.right;
  const chartH = height - padding.top - padding.bottom;

  const maxVal = Math.max(...data.map((d) => d.value)) * 1.15;
  const minVal = Math.min(...data.map((d) => d.value)) * 0.85;
  const range = maxVal - minVal || 1;

  const points: { x: number; y: number; label: string; val: number }[] = data.map((d, i) => {
    const x = padding.left + (i / (data.length - 1 || 1)) * chartW;
    const y = padding.top + chartH - ((d.value - minVal) / range) * chartH;
    return { x, y, label: d.label, val: d.value };
  });

  const pathD = points.reduce((acc, p, i) => `${acc} ${i === 0 ? "M" : "L"} ${p.x} ${p.y}`, "");
  const areaD = `${pathD} L ${points[points.length - 1].x} ${padding.top + chartH} L ${points[0].x} ${padding.top + chartH} Z`;

  let dotsSvg = "";
  points.forEach((p) => {
    dotsSvg += `
      <circle cx="${p.x}" cy="${p.y}" r="5" fill="#06b6d4" stroke="#090d16" stroke-width="2" />
      <text x="${p.x}" y="${p.y - 10}" fill="#38bdf8" font-size="10" font-family="monospace" font-weight="bold" text-anchor="middle">${p.val}ms</text>
      <text x="${p.x}" y="${padding.top + chartH + 20}" fill="#94a3b8" font-size="10" font-family="sans-serif" text-anchor="middle">${p.label}</text>
    `;
  });

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="100%" height="100%" style="background:#090d16; border-radius:12px; font-family:'Segoe UI',system-ui,sans-serif;">
  <defs>
    <linearGradient id="areaGrad" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#06b6d4" stop-opacity="0.35" />
      <stop offset="100%" stop-color="#06b6d4" stop-opacity="0.0" />
    </linearGradient>
  </defs>

  <text x="${padding.left}" y="36" fill="#06b6d4" font-size="11" font-family="monospace" font-weight="bold" letter-spacing="1.5">DATA STUDIO // TREND ANALYSIS</text>
  <text x="${padding.left}" y="52" fill="#ffffff" font-size="15" font-weight="bold">${title}</text>

  <!-- Grid -->
  <line x1="${padding.left}" y1="${padding.top}" x2="${width - padding.right}" y2="${padding.top}" stroke="#1e293b" stroke-dasharray="3" />
  <line x1="${padding.left}" y1="${padding.top + chartH / 2}" x2="${width - padding.right}" y2="${padding.top + chartH / 2}" stroke="#1e293b" stroke-dasharray="3" />
  <line x1="${padding.left}" y1="${padding.top + chartH}" x2="${width - padding.right}" y2="${padding.top + chartH}" stroke="#334155" stroke-width="1.5" />

  <!-- Filled Area & Line -->
  <path d="${areaD}" fill="url(#areaGrad)" />
  <path d="${pathD}" fill="none" stroke="#06b6d4" stroke-width="3" stroke-linecap="round" />

  ${dotsSvg}
</svg>`;
}

// 3. PIE / DONUT CHART SVG
function renderPieChartSvg(title: string, data: ChartDataPoint[]): string {
  const width = 800;
  const height = 400;
  const centerX = 280;
  const centerY = 210;
  const radius = 120;
  const innerRadius = 60; // Donut style

  const total = data.reduce((sum, d) => sum + d.value, 0) || 1;
  const colors = ["#06b6d4", "#10b981", "#8b5cf6", "#f59e0b", "#f43f5e", "#38bdf8"];

  let currentAngle = 0;
  let slicesSvg = "";
  let legendSvg = "";

  data.forEach((d, i) => {
    const sliceAngle = (d.value / total) * 2 * Math.PI;
    const startX = centerX + radius * Math.cos(currentAngle);
    const startY = centerY + radius * Math.sin(currentAngle);
    const endX = centerX + radius * Math.cos(currentAngle + sliceAngle);
    const endY = centerY + radius * Math.sin(currentAngle + sliceAngle);

    const innerStartX = centerX + innerRadius * Math.cos(currentAngle);
    const innerStartY = centerY + innerRadius * Math.sin(currentAngle);
    const innerEndX = centerX + innerRadius * Math.cos(currentAngle + sliceAngle);
    const innerEndY = centerY + innerRadius * Math.sin(currentAngle + sliceAngle);

    const largeArcFlag = sliceAngle > Math.PI ? 1 : 0;
    const pathData = `
      M ${innerStartX} ${innerStartY}
      L ${startX} ${startY}
      A ${radius} ${radius} 0 ${largeArcFlag} 1 ${endX} ${endY}
      L ${innerEndX} ${innerEndY}
      A ${innerRadius} ${innerRadius} 0 ${largeArcFlag} 0 ${innerStartX} ${innerStartY}
      Z
    `;

    const color = colors[i % colors.length];
    slicesSvg += `<path d="${pathData}" fill="${color}" stroke="#090d16" stroke-width="2" />`;

    // Legend
    const pct = ((d.value / total) * 100).toFixed(1);
    const ly = 120 + i * 36;
    legendSvg += `
      <g transform="translate(480, ${ly})">
        <rect width="14" height="14" rx="4" fill="${color}" />
        <text x="24" y="11" fill="#f8fafc" font-size="12" font-weight="600">${d.label}</text>
        <text x="240" y="11" fill="#94a3b8" font-size="11" font-family="monospace" text-anchor="end">${d.value} (${pct}%)</text>
      </g>
    `;

    currentAngle += sliceAngle;
  });

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="100%" height="100%" style="background:#090d16; border-radius:12px; font-family:'Segoe UI',system-ui,sans-serif;">
  <text x="40" y="36" fill="#06b6d4" font-size="11" font-family="monospace" font-weight="bold" letter-spacing="1.5">DATA STUDIO // DISTRIBUTION BREAKDOWN</text>
  <text x="40" y="54" fill="#ffffff" font-size="15" font-weight="bold">${title}</text>

  ${slicesSvg}
  ${legendSvg}

  <text x="${centerX}" y="${centerY - 4}" fill="#ffffff" font-size="16" font-weight="bold" text-anchor="middle">${total}</text>
  <text x="${centerX}" y="${centerY + 14}" fill="#94a3b8" font-size="9" font-family="monospace" text-anchor="middle">TOTAL</text>
</svg>`;
}

// 4. SCATTER PLOT SVG
function renderScatterChartSvg(
  title: string,
  data: ChartDataPoint[],
  xLabel = "X Axis",
  yLabel = "Y Axis"
): string {
  const width = 800;
  const height = 400;
  const padding = { top: 60, right: 40, bottom: 60, left: 70 };
  const chartW = width - padding.left - padding.right;
  const chartH = height - padding.top - padding.bottom;

  const maxX = Math.max(...data.map((d) => d.value)) * 1.2 || 10;
  const maxY = Math.max(...data.map((d) => d.secondaryValue || d.value)) * 1.2 || 100;

  let pointsSvg = "";
  data.forEach((d) => {
    const yVal = d.secondaryValue || d.value;
    const cx = padding.left + (d.value / maxX) * chartW;
    const cy = padding.top + chartH - (yVal / maxY) * chartH;

    pointsSvg += `
      <circle cx="${cx}" cy="${cy}" r="6" fill="#8b5cf6" stroke="#06b6d4" stroke-width="2" />
      <text x="${cx}" y="${cy - 10}" fill="#c4b5fd" font-size="9" font-family="monospace" text-anchor="middle">(${d.value}, ${yVal})</text>
    `;
  });

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="100%" height="100%" style="background:#090d16; border-radius:12px; font-family:'Segoe UI',system-ui,sans-serif;">
  <text x="${padding.left}" y="36" fill="#8b5cf6" font-size="11" font-family="monospace" font-weight="bold" letter-spacing="1.5">DATA STUDIO // SCATTER CORRELATION</text>
  <text x="${padding.left}" y="52" fill="#ffffff" font-size="15" font-weight="bold">${title}</text>

  <!-- Grid -->
  <line x1="${padding.left}" y1="${padding.top}" x2="${width - padding.right}" y2="${padding.top}" stroke="#1e293b" stroke-dasharray="3" />
  <line x1="${padding.left}" y1="${padding.top + chartH / 2}" x2="${width - padding.right}" y2="${padding.top + chartH / 2}" stroke="#1e293b" stroke-dasharray="3" />
  <line x1="${padding.left}" y1="${padding.top + chartH}" x2="${width - padding.right}" y2="${padding.top + chartH}" stroke="#334155" stroke-width="1.5" />

  ${pointsSvg}

  <text x="${width / 2}" y="${height - 15}" fill="#64748b" font-size="11" font-family="sans-serif" text-anchor="middle">${xLabel}</text>
  <text x="20" y="${height / 2}" fill="#64748b" font-size="11" font-family="sans-serif" transform="rotate(-90 20 ${height / 2})" text-anchor="middle">${yLabel}</text>
</svg>`;
}
