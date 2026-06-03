"use client";

import {
  ArcElement,
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  Filler,
  Legend,
  LinearScale,
  LineElement,
  PointElement,
  Tooltip,
} from "chart.js";
import type { ChartOptions } from "chart.js";
import { useEffect, useMemo, useState } from "react";
import { Bar, Doughnut, Line } from "react-chartjs-2";
import { brandLabel, matchRate, shortDate, sortByDate, type ReportRow } from "@/lib/report";

ChartJS.register(ArcElement, BarElement, CategoryScale, Filler, Legend, LinearScale, LineElement, PointElement, Tooltip);

type DashboardData = {
  daily: ReportRow[];
  faqSummary: FaqSummaryRow[];
  unmatchedQueries: UnmatchedQueryRow[];
  history: HistoryRow[];
};

type FaqSummaryRow = {
  brand: string;
  brand_name: string;
  category_id: string | null;
  category_name: string | null;
  faq_id: string | null;
  faq_question: string | null;
  answer_type: string | null;
  selected_model: string | null;
  hit_count: number;
  unique_user_count: number;
  avg_score: number | null;
  first_occurred_at: string | null;
  last_occurred_at: string | null;
};

type UnmatchedQueryRow = {
  brand: string;
  brand_name: string;
  query_key: string;
  sample_query: string;
  query_count: number;
  unique_user_count: number;
  last_occurred_at: string | null;
};

type HistoryRow = {
  id: number;
  occurred_at: string;
  brand: string;
  brand_name: string;
  source: string;
  user_id: string | null;
  query: string;
  matched: boolean;
  score: number;
  faq_id: string | null;
  faq_question: string | null;
  category_name: string | null;
  answer_type: string | null;
  selected_model: string | null;
};

type ActiveTab = "daily" | "faq" | "unmatched" | "history";

type BrandOption = {
  brand: string;
  brand_name: string;
};

const numberFormat = new Intl.NumberFormat("ko-KR");

const commonChartOptions = {
  responsive: true,
  maintainAspectRatio: false,
} satisfies ChartOptions;

const valueLabelPlugin = {
  id: "valueLabel",
  afterDatasetsDraw(chart: ChartJS) {
    try {
      drawValueLabels(chart);
    } catch {
      // Keep the chart visible even if value label placement fails.
    }
  },
};

function drawValueLabels(chart: ChartJS) {
  const { ctx } = chart;
  const chartType = getChartType(chart);
  const chartArea = chart.chartArea;

  ctx.save();
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.font = "700 11px -apple-system, BlinkMacSystemFont, sans-serif";

  chart.data.datasets.forEach((dataset, datasetIndex) => {
    const meta = chart.getDatasetMeta(datasetIndex);
    if (meta.hidden) return;

    meta.data.forEach((element, index) => {
      const value = Number(dataset.data[index]) || 0;
      if (value <= 0) return;

      const position = element.tooltipPosition(true);
      if (position.x === null || position.y === null) return;
      const label = chartType === "line" ? `${value}%` : String(value);

      if (chartType === "doughnut") {
        ctx.fillStyle = getContrastTextColor(getDatasetColor(dataset.backgroundColor, index));
        drawPlainText(ctx, label, clamp(position.x, chartArea.left + 18, chartArea.right - 18), clamp(position.y, chartArea.top + 18, chartArea.bottom - 18));
        return;
      }

      const x = clamp(position.x, chartArea.left + 18, chartArea.right - 18);
      const y =
        chartType === "line"
          ? clamp(position.y - 14, chartArea.top + 12, chartArea.bottom - 18)
          : clamp(position.y, chartArea.top + 12, chartArea.bottom - 12);
      ctx.fillStyle = chartType === "bar" ? getContrastTextColor(getDatasetColor(dataset.backgroundColor, index)) : "#000";
      drawPlainText(ctx, label, x, y);
    });
  });

  ctx.restore();
}

ChartJS.register(valueLabelPlugin);

export default function Home() {
  const [from, setFrom] = useState(() => getDefaultFromDate());
  const [to, setTo] = useState(() => getTodayDate());
  const [brand, setBrand] = useState("");
  const [limit, setLimit] = useState("100");
  const [activeTab, setActiveTab] = useState<ActiveTab>("daily");
  const [brands, setBrands] = useState<BrandOption[]>([]);
  const [isLoadingBrands, setIsLoadingBrands] = useState(false);
  const [data, setData] = useState<DashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  useEffect(() => {
    if (!notice) return;
    const timer = window.setTimeout(() => setNotice(""), 3600);
    return () => window.clearTimeout(timer);
  }, [notice]);

  useEffect(() => {
    async function loadBrands() {
      setIsLoadingBrands(true);
      try {
        const response = await fetch("/api/brands", { cache: "no-store" });
        const payload = (await response.json()) as { brands?: BrandOption[]; error?: string };
        if (!response.ok) throw new Error(payload.error || "브랜드 목록을 불러오지 못했습니다.");
        setBrands(payload.brands || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : "브랜드 목록을 불러오는 중 오류가 발생했습니다.");
      } finally {
        setIsLoadingBrands(false);
      }
    }

    void loadBrands();
  }, []);

  async function loadDashboard() {
    setError("");
    setNotice("");
    setIsLoading(true);

    try {
      const params = new URLSearchParams({ limit });
      if (from) params.set("from", from);
      if (to) params.set("to", to);
      if (brand.trim()) params.set("brand", brand.trim());

      const response = await fetch(`/api/reports?${params.toString()}`, { cache: "no-store" });
      const payload = (await response.json()) as Partial<DashboardData> & { error?: string };

      if (!response.ok) {
        throw new Error(payload.error || "DB 데이터를 불러오지 못했습니다.");
      }

      const nextData = {
        daily: payload.daily || [],
        faqSummary: payload.faqSummary || [],
        unmatchedQueries: payload.unmatchedQueries || [],
        history: payload.history || [],
      };

      setData(nextData);
      setNotice(
        `일일 ${numberFormat.format(nextData.daily.length)}건, FAQ ${numberFormat.format(nextData.faqSummary.length)}건, 미매칭 ${numberFormat.format(nextData.unmatchedQueries.length)}건, 히스토리 ${numberFormat.format(nextData.history.length)}건을 불러왔습니다.`,
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "DB 데이터를 불러오는 중 오류가 발생했습니다.");
    } finally {
      setIsLoading(false);
    }
  }

  async function exportPdf() {
    const target = document.getElementById("pdfContent");
    if (!target) return;

    setError("");
    setIsExporting(true);
    document.body.classList.add("pdf-exporting");
    try {
      const html2pdf = (await import("html2pdf.js")).default;
      const today = new Date().toISOString().slice(0, 10);
      await new Promise((resolve) => window.setTimeout(resolve, 250));
      await html2pdf()
        .set({
          margin: [10, 10, 10, 10],
          filename: `챗봇_히스토리_리포트_${today}.pdf`,
          image: { type: "jpeg", quality: 0.98 },
          html2canvas: {
            scale: 2,
            useCORS: true,
            logging: false,
            backgroundColor: "#f5f4f0",
          },
          jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
          pagebreak: { mode: ["avoid-all", "css", "legacy"] },
        })
        .from(target)
        .save();
    } catch (err) {
      setError(err instanceof Error ? `PDF 생성 중 오류가 발생했습니다: ${err.message}` : "PDF 생성 중 오류가 발생했습니다.");
    } finally {
      document.body.classList.remove("pdf-exporting");
      setIsExporting(false);
    }
  }

  const summary = useMemo(() => summarize(data), [data]);

  return (
    <main className="app-shell dashboard-shell">
      <div className={`pdf-loading ${isExporting ? "show" : ""}`} aria-hidden={!isExporting}>
        <div className="pdf-spinner" />
        <div className="pdf-loading-text">PDF 생성 중...</div>
      </div>
      <TopBar />
      <FilterPanel
        from={from}
        to={to}
        brand={brand}
        brands={brands}
        limit={limit}
        isLoading={isLoading}
        isLoadingBrands={isLoadingBrands}
        onFromChange={setFrom}
        onToChange={setTo}
        onBrandChange={setBrand}
        onLimitChange={setLimit}
        onLoad={loadDashboard}
        onExport={exportPdf}
        canExport={Boolean(data)}
      />
      <ErrorBox message={error} />
      <NoticeBox message={notice} />

      {data ? (
        <section className="dashboard" id="pdfContent">
          <MetricGrid
            metrics={[
              ["총 대화", summary.totalCount, "건"],
              ["매칭 성공", summary.matchedCount, "건", "blue"],
              ["매칭 실패", summary.unmatchedCount, "건", "red"],
              ["평균 매칭률", summary.matchRate, "%", summary.matchRate >= 80 ? "blue" : summary.matchRate >= 60 ? "warn" : "red", 1],
            ]}
          />

          <div className="charts-row">
            <ChartCard title="일자별 대화량">
              <div className="chart-frame" style={{ "--chart-height": "260px" } as React.CSSProperties}>
                <Bar data={dailyVolumeChart(data.daily)} options={stackedBarOptions} />
              </div>
            </ChartCard>
            <ChartCard title="매칭 현황">
              <div className="chart-frame" style={{ "--chart-height": "260px" } as React.CSSProperties}>
                <Doughnut data={matchDoughnutChart(summary.matchedCount, summary.unmatchedCount)} options={doughnutOptions(summary.totalCount)} />
              </div>
            </ChartCard>
          </div>

          <div className="charts-row">
            <ChartCard title="일자별 매칭률">
              <div className="chart-frame" style={{ "--chart-height": "240px" } as React.CSSProperties}>
                <Line data={dailyRateChart(data.daily)} options={linePercentOptions} />
              </div>
            </ChartCard>
            <ChartCard title="상위 미매칭 질문">
              <TopList rows={data.unmatchedQueries.slice(0, 5)} />
            </ChartCard>
          </div>

          <Tabs activeTab={activeTab} onChange={setActiveTab} counts={data} />

          {activeTab === "daily" && <DataTable title="faq_history_daily_summary" rows={data.daily} columns={dailyColumns} />}
          {activeTab === "faq" && <DataTable title="faq_history_faq_summary" rows={data.faqSummary} columns={faqColumns} />}
          {activeTab === "unmatched" && <DataTable title="faq_history_unmatched_queries" rows={data.unmatchedQueries} columns={unmatchedColumns} />}
          {activeTab === "history" && <DataTable title="faq_history" rows={data.history} columns={historyColumns} />}
        </section>
      ) : (
        <section className="empty-state">
          <div className="empty-state__title">DB 데이터를 불러오면 히스토리 테이블과 분석 뷰가 표시됩니다.</div>
          <div className="empty-state__sub">`sql/history_sql.sql` 기준: faq_history, daily_summary, faq_summary, unmatched_queries</div>
        </section>
      )}
    </main>
  );
}

function TopBar() {
  return (
    <header className="top-bar">
      <div className="logo-area">
        <div className="logo-icon">💬</div>
        <div>
          <div className="logo-text">챗봇 히스토리 대시보드</div>
          <div className="logo-sub">Supabase FAQ 히스토리 기반 운영 리포트</div>
        </div>
      </div>
    </header>
  );
}

function FilterPanel({
  from,
  to,
  brand,
  brands,
  limit,
  isLoading,
  isLoadingBrands,
  onFromChange,
  onToChange,
  onBrandChange,
  onLimitChange,
  onLoad,
  onExport,
  canExport,
}: {
  from: string;
  to: string;
  brand: string;
  brands: BrandOption[];
  limit: string;
  isLoading: boolean;
  isLoadingBrands: boolean;
  onFromChange: (value: string) => void;
  onToChange: (value: string) => void;
  onBrandChange: (value: string) => void;
  onLimitChange: (value: string) => void;
  onLoad: () => void;
  onExport: () => void;
  canExport: boolean;
}) {
  return (
    <section className="db-panel">
      <div className="db-panel__header">
        <div className="header-actions">
          <button className="btn btn-primary" type="button" onClick={onLoad} disabled={isLoading}>
            <DatabaseIcon />
            {isLoading ? "불러오는 중" : "DB 조회"}
          </button>
          <button className="btn btn-pdf" type="button" onClick={onExport} disabled={!canExport}>
            <PdfIcon />
            PDF 내보내기
          </button>
        </div>
      </div>
      <div className="db-fields db-fields--wide">
        <label className="db-field">
          <span>시작일</span>
          <input type="date" value={from} onChange={(event) => onFromChange(event.target.value)} />
        </label>
        <label className="db-field">
          <span>종료일</span>
          <input type="date" value={to} onChange={(event) => onToChange(event.target.value)} />
        </label>
        <label className="db-field">
          <span>브랜드</span>
          <select value={brand} onChange={(event) => onBrandChange(event.target.value)} disabled={isLoadingBrands}>
            <option value="">{isLoadingBrands ? "불러오는 중" : "전체"}</option>
            {brands.map((item) => (
              <option value={item.brand} key={item.brand}>
                {item.brand_name} ({item.brand})
              </option>
            ))}
          </select>
        </label>
        <label className="db-field">
          <span>표시 개수</span>
          <select value={limit} onChange={(event) => onLimitChange(event.target.value)}>
            <option value="50">50</option>
            <option value="100">100</option>
            <option value="200">200</option>
            <option value="500">500</option>
          </select>
        </label>
      </div>
    </section>
  );
}

function Tabs({ activeTab, onChange, counts }: { activeTab: ActiveTab; onChange: (tab: ActiveTab) => void; counts: DashboardData }) {
  const tabs: Array<[ActiveTab, string, number]> = [
    ["daily", "일일 요약", counts.daily.length],
    ["faq", "FAQ 매칭", counts.faqSummary.length],
    ["unmatched", "미매칭 질문", counts.unmatchedQueries.length],
    ["history", "원본 히스토리", counts.history.length],
  ];

  return (
    <div className="tabs" role="tablist" aria-label="히스토리 테이블">
      {tabs.map(([key, label, count]) => (
        <button className={`tab ${activeTab === key ? "active" : ""}`} type="button" role="tab" aria-selected={activeTab === key} onClick={() => onChange(key)} key={key}>
          <span>{label}</span>
          <strong>{numberFormat.format(count)}</strong>
        </button>
      ))}
    </div>
  );
}

type Column<T> = {
  key: keyof T | string;
  label: string;
  render?: (row: T) => React.ReactNode;
};

function DataTable<T extends Record<string, unknown>>({ title, rows, columns }: { title: string; rows: T[]; columns: Array<Column<T>> }) {
  return (
    <section className="table-card">
      <div className="table-card__header">
        <div>
          <div className="table-card__title">{title}</div>
          <div className="table-card__sub">{numberFormat.format(rows.length)} rows</div>
        </div>
      </div>
      <div className="table-scroll">
        <table>
          <thead>
            <tr>
              {columns.map((column) => (
                <th key={String(column.key)}>{column.label}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.length ? (
              rows.map((row, rowIndex) => (
                <tr key={rowIndex}>
                  {columns.map((column) => (
                    <td key={String(column.key)}>{column.render ? column.render(row) : formatCell(row[column.key])}</td>
                  ))}
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={columns.length} className="empty-cell">
                  조회된 데이터가 없습니다.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function TopList({ rows }: { rows: UnmatchedQueryRow[] }) {
  if (!rows.length) {
    return <div className="empty-list">미매칭 질문이 없습니다.</div>;
  }

  return (
    <div className="top-list">
      {rows.map((row, index) => (
        <div className="top-list__row" key={`${row.brand}-${row.query_key}`}>
          <span className="top-list__rank">{index + 1}</span>
          <div className="top-list__main">
            <strong>{row.sample_query}</strong>
            <span>{row.brand_name}</span>
          </div>
          <span className="top-list__count">{numberFormat.format(row.query_count)}건</span>
        </div>
      ))}
    </div>
  );
}

function MetricGrid({
  metrics,
}: {
  metrics: Array<[label: string, value: string | number, unit?: string, tone?: "blue" | "red" | "warn" | string, decimals?: number]>;
}) {
  return (
    <div className="metrics-grid">
      {metrics.map(([label, value, unit = "", tone = "", decimals], index) => (
        <div className="metric-card" key={`${label}-${index}`}>
          <div className="metric-label">{label}</div>
          <div className={`metric-value ${tone}`}>
            {typeof value === "number" ? numberFormat.format(Number(value.toFixed(decimals ?? 0))) : value}
            {unit && <span className="metric-unit">{unit}</span>}
          </div>
        </div>
      ))}
    </div>
  );
}

function ChartCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="chart-card">
      <div className="chart-card-title">{title}</div>
      {children}
    </div>
  );
}

function ErrorBox({ message }: { message: string }) {
  return (
    <div className={`error-box ${message ? "show" : ""}`} role="alert">
      <AlertIcon />
      <span>{message}</span>
    </div>
  );
}

function NoticeBox({ message }: { message: string }) {
  return <div className={`notice-box ${message ? "show" : ""}`}>{message}</div>;
}

function summarize(data: DashboardData | null) {
  const daily = data?.daily || [];
  const totalCount = daily.reduce((sum, row) => sum + row.total_count, 0);
  const matchedCount = daily.reduce((sum, row) => sum + row.matched_count, 0);
  const unmatchedCount = daily.reduce((sum, row) => sum + row.unmatched_count, 0);

  return {
    totalCount,
    matchedCount,
    unmatchedCount,
    matchRate: totalCount ? (matchedCount / totalCount) * 100 : 0,
  };
}

function dailyVolumeChart(rows: ReportRow[]) {
  const sorted = sortByDate(rows);
  const labels = getDailyChartLabels(sorted);
  return {
    labels,
    datasets: [
      { label: "매칭 성공", data: sorted.map((row) => row.matched_count), backgroundColor: "#378ADD", borderRadius: 4 },
      { label: "매칭 실패", data: sorted.map((row) => row.unmatched_count), backgroundColor: "#B4B2A9", borderRadius: 4 },
    ],
  };
}

function dailyRateChart(rows: ReportRow[]) {
  const sorted = sortByDate(rows);
  const labels = getDailyChartLabels(sorted);
  return {
    labels,
    datasets: [
      {
        label: "매칭률(%)",
        data: sorted.map((row) => Number(matchRate(row).toFixed(1))),
        borderColor: "#378ADD",
        backgroundColor: "rgba(55,138,221,0.15)",
        fill: true,
        tension: 0.35,
        pointRadius: 3,
        pointHoverRadius: 5,
      },
    ],
  };
}

function getDailyChartLabels(rows: ReportRow[]) {
  const brandCount = new Set(rows.map((row) => row.brand || brandLabel(row))).size;
  return rows.map((row) => (brandCount === 1 ? shortDate(row.report_date) : `${shortDate(row.report_date)} ${brandLabel(row)}`));
}

function matchDoughnutChart(matched: number, unmatched: number) {
  return {
    labels: ["매칭 성공", "매칭 실패"],
    datasets: [{ data: [matched, unmatched], backgroundColor: ["#378ADD", "#B4B2A9"], borderWidth: 0, hoverOffset: 4 }],
  };
}

function getChartType(chart: ChartJS) {
  return ((chart.config as { type?: string }).type || chart.getDatasetMeta(0).type || "") as string;
}

function drawPlainText(ctx: CanvasRenderingContext2D, label: string, x: number, y: number) {
  ctx.fillText(label, x, y);
}

function getDatasetColor(color: unknown, index: number) {
  if (Array.isArray(color)) return String(color[index] || color[0] || "#ffffff");
  return String(color || "#ffffff");
}

function getContrastTextColor(color: string) {
  const hex = color.trim();
  if (!hex.startsWith("#")) return "#000";

  const normalized = hex.length === 4 ? `#${hex[1]}${hex[1]}${hex[2]}${hex[2]}${hex[3]}${hex[3]}` : hex;
  const r = parseInt(normalized.slice(1, 3), 16);
  const g = parseInt(normalized.slice(3, 5), 16);
  const b = parseInt(normalized.slice(5, 7), 16);
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.58 ? "#000" : "#fff";
}

function clamp(value: number, min: number, max: number) {
  if (max < min) return value;
  return Math.min(Math.max(value, min), max);
}

const stackedBarOptions: ChartOptions<"bar"> = {
  ...commonChartOptions,
  layout: {
    padding: { top: 18, right: 8, left: 4 },
  },
  plugins: {
    legend: { position: "bottom" },
    tooltip: {
      callbacks: {
        label: (context) => `${context.dataset.label}: ${numberFormat.format(Number(context.raw) || 0)}건`,
      },
    },
  },
  scales: {
    x: {
      stacked: true,
      ticks: {
        maxRotation: 0,
      },
    },
    y: { stacked: true, beginAtZero: true },
  },
};

const linePercentOptions: ChartOptions<"line"> = {
  ...commonChartOptions,
  layout: {
    padding: { top: 24, right: 10, left: 4 },
  },
  plugins: {
    legend: { display: false },
    tooltip: { callbacks: { label: (context) => `${Number(context.raw).toFixed(1)}%` } },
  },
  scales: {
    y: { min: 0, max: 100, ticks: { callback: (value) => `${value}%` } },
  },
};

function doughnutOptions(total: number): ChartOptions<"doughnut"> {
  return {
    ...commonChartOptions,
    layout: {
      padding: 8,
    },
    cutout: "68%",
    plugins: {
      legend: { position: "bottom" },
      tooltip: {
        callbacks: {
          label: (context) => {
            const value = Number(context.raw) || 0;
            const percent = total > 0 ? ((value / total) * 100).toFixed(1) : "0.0";
            return `${context.label}: ${numberFormat.format(value)}건 (${percent}%)`;
          },
        },
      },
    },
  };
}

const dailyColumns: Array<Column<ReportRow & Record<string, unknown>>> = [
  { key: "report_date", label: "일자" },
  { key: "brand_name", label: "브랜드", render: (row) => row.brand_name || row.brand || "-" },
  { key: "total_count", label: "총 대화", render: (row) => numberFormat.format(row.total_count) },
  { key: "matched_count", label: "매칭" },
  { key: "unmatched_count", label: "미매칭" },
  { key: "match_rate", label: "매칭률", render: (row) => `${matchRate(row).toFixed(1)}%` },
  { key: "unique_user_count", label: "사용자" },
  { key: "avg_score", label: "평균 점수", render: (row) => (row.avg_score ?? 0).toFixed(1) },
];

const faqColumns: Array<Column<FaqSummaryRow & Record<string, unknown>>> = [
  { key: "brand_name", label: "브랜드" },
  { key: "category_name", label: "카테고리" },
  { key: "faq_question", label: "FAQ 질문" },
  { key: "answer_type", label: "응답 타입" },
  { key: "selected_model", label: "모델" },
  { key: "hit_count", label: "조회수", render: (row) => numberFormat.format(row.hit_count) },
  { key: "unique_user_count", label: "사용자" },
  { key: "avg_score", label: "평균 점수", render: (row) => row.avg_score?.toFixed(1) || "-" },
  { key: "last_occurred_at", label: "최근 발생", render: (row) => formatDateTime(row.last_occurred_at) },
];

const unmatchedColumns: Array<Column<UnmatchedQueryRow & Record<string, unknown>>> = [
  { key: "brand_name", label: "브랜드" },
  { key: "sample_query", label: "샘플 질문" },
  { key: "query_key", label: "정규화 키" },
  { key: "query_count", label: "건수", render: (row) => numberFormat.format(row.query_count) },
  { key: "unique_user_count", label: "사용자" },
  { key: "last_occurred_at", label: "최근 발생", render: (row) => formatDateTime(row.last_occurred_at) },
];

const historyColumns: Array<Column<HistoryRow & Record<string, unknown>>> = [
  { key: "occurred_at", label: "발생 시각", render: (row) => formatDateTime(row.occurred_at) },
  { key: "brand_name", label: "브랜드" },
  { key: "source", label: "소스" },
  { key: "query", label: "질문" },
  { key: "matched", label: "매칭", render: (row) => <span className={`status-chip ${row.matched ? "good" : "bad"}`}>{row.matched ? "성공" : "실패"}</span> },
  { key: "score", label: "점수", render: (row) => row.score.toFixed(1) },
  { key: "faq_question", label: "매칭 FAQ" },
  { key: "category_name", label: "카테고리" },
  { key: "selected_model", label: "모델" },
];

function formatCell(value: unknown) {
  if (value === null || value === undefined || value === "") return "-";
  if (typeof value === "boolean") return value ? "true" : "false";
  if (typeof value === "number") return numberFormat.format(value);
  return String(value);
}

function formatDateTime(value?: string | null) {
  if (!value) return "-";
  return value.replace("T", " ").slice(0, 19);
}

function getTodayDate() {
  return new Date().toISOString().slice(0, 10);
}

function getDefaultFromDate() {
  const date = new Date();
  date.setDate(date.getDate() - 6);
  return date.toISOString().slice(0, 10);
}

function DatabaseIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <ellipse cx="12" cy="5" rx="8" ry="3" />
      <path d="M4 5v6c0 1.66 3.58 3 8 3s8-1.34 8-3V5" />
      <path d="M4 11v6c0 1.66 3.58 3 8 3s8-1.34 8-3v-6" />
    </svg>
  );
}

function PdfIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="9" y1="13" x2="15" y2="13" />
      <line x1="9" y1="17" x2="15" y2="17" />
    </svg>
  );
}

function AlertIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="8" x2="12" y2="12" />
      <line x1="12" y1="16" x2="12.01" y2="16" />
    </svg>
  );
}
