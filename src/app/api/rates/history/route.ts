import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/db";

export async function GET(req: NextRequest) {
  const url       = new URL(req.url);
  const productId = url.searchParams.get("product_id");
  const indexName = url.searchParams.get("index_name");

  if (!productId || !indexName) {
    return NextResponse.json({ error: "product_id and index_name are required" }, { status: 400 });
  }

  const { data, error } = await supabaseAdmin
    .from("rates")
    .select("id, cap_rate, par_rate, spread, effective_date, is_current, updated_by")
    .eq("product_id", productId)
    .eq("index_name", indexName)
    .order("effective_date", { ascending: true });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json(data ?? []);
}
