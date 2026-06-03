import { NextRequest, NextResponse } from "next/server";
import { parseReportRows } from "@/lib/report";
import { createSupabaseServerClient } from "@/lib/supabase-server";

export const dynamic = "force-dynamic";

const TABLES = {
  history: process.env.SUPABASE_HISTORY_TABLE || "faq_history",
  daily: process.env.SUPABASE_DAILY_SUMMARY_VIEW || "faq_history_daily_summary",
  faq: process.env.SUPABASE_FAQ_SUMMARY_VIEW || "faq_history_faq_summary",
  unmatched: process.env.SUPABASE_UNMATCHED_QUERIES_VIEW || "faq_history_unmatched_queries",
};

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    const from = searchParams.get("from");
    const to = searchParams.get("to");
    const brand = searchParams.get("brand")?.trim();
    const limit = clampLimit(searchParams.get("limit"));
    const supabase = createSupabaseServerClient();

    const [dailyResult, faqResult, unmatchedResult, historyResult] = await Promise.all([
      queryDaily(supabase, { from, to, brand, limit }),
      queryFaqSummary(supabase, { from, to, brand, limit }),
      queryUnmatched(supabase, { from, to, brand, limit }),
      queryHistory(supabase, { from, to, brand, limit }),
    ]);

    const firstError = [dailyResult.error, faqResult.error, unmatchedResult.error, historyResult.error].find(Boolean);
    if (firstError) {
      return NextResponse.json({ error: firstError.message }, { status: 500 });
    }

    return NextResponse.json({
      daily: dailyResult.data?.length ? parseReportRows(dailyResult.data) : [],
      faqSummary: faqResult.data || [],
      unmatchedQueries: unmatchedResult.data || [],
      history: historyResult.data || [],
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "히스토리 데이터를 불러오는 중 오류가 발생했습니다." },
      { status: 500 },
    );
  }
}

type QueryOptions = {
  from: string | null;
  to: string | null;
  brand?: string;
  limit: number;
};

type SupabaseClient = ReturnType<typeof createSupabaseServerClient>;

function queryDaily(supabase: SupabaseClient, options: QueryOptions) {
  let query = supabase
    .from(TABLES.daily)
    .select("report_date, brand, brand_name, total_count, matched_count, unmatched_count, match_rate, unique_user_count, avg_score")
    .order("report_date", { ascending: false })
    .order("brand", { ascending: true })
    .limit(options.limit);

  if (options.from) query = query.gte("report_date", options.from);
  if (options.to) query = query.lte("report_date", options.to);
  if (options.brand) query = query.eq("brand", options.brand);
  return query;
}

function queryFaqSummary(supabase: SupabaseClient, options: QueryOptions) {
  let query = supabase
    .from(TABLES.faq)
    .select("brand, brand_name, category_id, category_name, faq_id, faq_question, answer_type, selected_model, hit_count, unique_user_count, avg_score, first_occurred_at, last_occurred_at")
    .order("hit_count", { ascending: false })
    .order("last_occurred_at", { ascending: false })
    .limit(options.limit);

  if (options.from) query = query.gte("last_occurred_at", `${options.from}T00:00:00`);
  if (options.to) query = query.lte("last_occurred_at", `${options.to}T23:59:59`);
  if (options.brand) query = query.eq("brand", options.brand);
  return query;
}

function queryUnmatched(supabase: SupabaseClient, options: QueryOptions) {
  let query = supabase
    .from(TABLES.unmatched)
    .select("brand, brand_name, query_key, sample_query, query_count, unique_user_count, last_occurred_at")
    .order("query_count", { ascending: false })
    .order("last_occurred_at", { ascending: false })
    .limit(options.limit);

  if (options.from) query = query.gte("last_occurred_at", `${options.from}T00:00:00`);
  if (options.to) query = query.lte("last_occurred_at", `${options.to}T23:59:59`);
  if (options.brand) query = query.eq("brand", options.brand);
  return query;
}

function queryHistory(supabase: SupabaseClient, options: QueryOptions) {
  let query = supabase
    .from(TABLES.history)
    .select("id, occurred_at, brand, brand_name, source, user_id, query, matched, score, faq_id, faq_question, category_name, answer_type, selected_model")
    .order("occurred_at", { ascending: false })
    .limit(options.limit);

  if (options.from) query = query.gte("occurred_at", `${options.from}T00:00:00`);
  if (options.to) query = query.lte("occurred_at", `${options.to}T23:59:59`);
  if (options.brand) query = query.eq("brand", options.brand);
  return query;
}

function clampLimit(value: string | null) {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return 100;
  return Math.max(1, Math.min(Math.floor(parsed), 500));
}
