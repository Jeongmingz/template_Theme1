export type ReportRow = {
  report_date?: string;
  brand?: string;
  brand_name?: string;
  total_count: number;
  matched_count: number;
  unmatched_count: number;
  match_rate?: number;
  unique_user_count?: number;
  avg_score?: number;
};

export type ReportMode = "single" | "trend" | "multi";

const REQUIRED_FIELDS = ["total_count", "matched_count", "unmatched_count"] as const;

type RawRecord = Record<string, unknown>;

export function parseReportJson(raw: string): ReportRow[] {
  const parsed = JSON.parse(raw) as unknown;
  return parseReportRows(parsed);
}

export function parseReportRows(value: unknown): ReportRow[] {
  const rows = Array.isArray(value) ? value : [value];

  if (rows.length === 0) {
    throw new Error("데이터가 비어 있습니다.");
  }

  return rows.map((row, index) => normalizeRow(row, index));
}

function normalizeRow(row: unknown, index: number): ReportRow {
  if (!row || typeof row !== "object" || Array.isArray(row)) {
    throw new Error(`${index + 1}번째 항목이 객체 형태가 아닙니다.`);
  }

  const record = row as RawRecord;
  const missing = REQUIRED_FIELDS.filter((field) => !(field in record));
  if (missing.length > 0) {
    throw new Error(`${index + 1}번째 항목 필수 필드 누락: ${missing.join(", ")}`);
  }

  const total = toNumber(record.total_count, "total_count", index);
  const matched = toNumber(record.matched_count, "matched_count", index);
  const unmatched = toNumber(record.unmatched_count, "unmatched_count", index);

  return {
    report_date: toOptionalString(record.report_date),
    brand: toOptionalString(record.brand),
    brand_name: toOptionalString(record.brand_name),
    total_count: total,
    matched_count: matched,
    unmatched_count: unmatched,
    match_rate: toOptionalNumber(record.match_rate),
    unique_user_count: toOptionalNumber(record.unique_user_count),
    avg_score: toOptionalNumber(record.avg_score),
  };
}

function toNumber(value: unknown, field: string, index: number): number {
  const numberValue = typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(numberValue) || numberValue < 0) {
    throw new Error(`${index + 1}번째 항목 ${field} 값이 올바른 숫자가 아닙니다.`);
  }
  return numberValue;
}

function toOptionalNumber(value: unknown): number | undefined {
  if (value === undefined || value === null || value === "") return undefined;
  const numberValue = typeof value === "number" ? value : Number(value);
  return Number.isFinite(numberValue) ? numberValue : undefined;
}

function toOptionalString(value: unknown): string | undefined {
  if (value === undefined || value === null) return undefined;
  const stringValue = String(value).trim();
  return stringValue || undefined;
}

export function brandLabel(row: ReportRow): string {
  return row.brand_name || row.brand || "-";
}

export function dateLabel(row: ReportRow): string {
  return row.report_date || "-";
}

export function detectReportMode(rows: ReportRow[]): ReportMode {
  const brands = new Set(rows.map(brandLabel));
  const dates = new Set(rows.map(dateLabel));

  if (rows.length === 1) return "single";
  if (brands.size === 1 && dates.size > 1) return "trend";
  return "multi";
}

export function formatDate(value?: string): string {
  if (!value) return "-";
  const date = new Date(`${value}T00:00:00`);
  if (Number.isNaN(date.getTime())) return value;

  return new Intl.DateTimeFormat("ko-KR", {
    year: "numeric",
    month: "long",
    day: "numeric",
    weekday: "short",
  }).format(date);
}

export function shortDate(value?: string): string {
  if (!value) return "-";
  const parts = value.split("-");
  return parts.length === 3 ? `${Number(parts[1])}/${Number(parts[2])}` : value;
}

export function matchRate(row: ReportRow): number {
  if (row.match_rate !== undefined) return row.match_rate;
  return row.total_count > 0 ? (row.matched_count / row.total_count) * 100 : 0;
}

export function unmatchedRate(row: ReportRow): number {
  return row.total_count > 0 ? (row.unmatched_count / row.total_count) * 100 : 0;
}

export function conversationsPerUser(row: ReportRow): string {
  const users = row.unique_user_count || 0;
  return users > 0 ? (row.total_count / users).toFixed(1) : "-";
}

export function rateTone(rate: number): "good" | "warn" | "bad" {
  if (rate >= 80) return "good";
  if (rate >= 60) return "warn";
  return "bad";
}

export function generateInsight(matchRateValue: number, unmatched: number, users: number, perUser: string) {
  const status =
    matchRateValue >= 80 ? "양호한 수준입니다." : matchRateValue >= 60 ? "개선 여지가 있습니다." : "주의가 필요합니다.";

  return {
    lead: `매칭률은 ${matchRateValue.toFixed(1)}%로 ${status}`,
    unmatched: unmatched > 0 ? `미매칭 ${unmatched.toLocaleString()}건은 별도 확인이 필요합니다.` : undefined,
    users: users > 0 ? `응대객수 ${users.toLocaleString()}명이 평균 ${perUser}건의 대화를 진행했습니다.` : undefined,
  };
}

export function sortByDate(rows: ReportRow[]): ReportRow[] {
  return [...rows].sort((a, b) => {
    const aTime = new Date(`${a.report_date || "0000-01-01"}T00:00:00`).getTime();
    const bTime = new Date(`${b.report_date || "0000-01-01"}T00:00:00`).getTime();
    return aTime - bTime;
  });
}
