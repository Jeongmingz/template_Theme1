import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase-server";

export const dynamic = "force-dynamic";

const HISTORY_TABLE = process.env.SUPABASE_HISTORY_TABLE || "faq_history";

export async function GET() {
  try {
    const supabase = createSupabaseServerClient();
    const { data, error } = await supabase
      .from(HISTORY_TABLE)
      .select("brand, brand_name")
      .not("brand", "is", null)
      .order("brand", { ascending: true })
      .limit(1000);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const brands = Array.from(
      new Map(
        (data || []).map((row) => [
          row.brand,
          {
            brand: row.brand,
            brand_name: row.brand_name || row.brand,
          },
        ]),
      ).values(),
    );

    return NextResponse.json({ brands });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "브랜드 목록을 불러오는 중 오류가 발생했습니다." },
      { status: 500 },
    );
  }
}
