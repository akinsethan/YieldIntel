import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/db";
import { logAction } from "@/lib/audit";

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const productId = url.searchParams.get("product_id");
  const type      = url.searchParams.get("type");
  const carrier   = url.searchParams.get("carrier");
  const amBest    = url.searchParams.get("am_best");
  const surrender = url.searchParams.get("surrender_years");
  const history   = url.searchParams.get("history") === "true";

  // Join through products and carriers for the advisor rate table
  let query = supabaseAdmin
    .from("rates")
    .select(`
      id,
      index_name,
      cap_rate,
      par_rate,
      spread,
      effective_date,
      expiration_date,
      is_current,
      created_at,
      product:products(
        id,
        name,
        type,
        surrender_years,
        min_premium,
        states_available,
        buffer_rate,
        carrier:carriers(id, name, am_best_rating, sp_rating)
      )
    `)
    .order("effective_date", { ascending: false });

  if (!history) query = query.eq("is_current", true);
  if (productId) query = query.eq("product_id", productId);

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Apply filters that require joined fields
  type RateRow = typeof data extends (infer T)[] | null ? T : never;
  let rows: RateRow[] = data ?? [];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const pf = (r: RateRow) => (r as any).product as Record<string, any> | null;
  if (type)     rows = rows.filter(r => pf(r)?.type === type);
  if (carrier)  rows = rows.filter(r => pf(r)?.carrier?.id === carrier);
  if (amBest)   rows = rows.filter(r => pf(r)?.carrier?.am_best_rating === amBest);
  if (surrender) rows = rows.filter(r => String(pf(r)?.surrender_years) === surrender);

  return NextResponse.json(rows);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { product_id, index_name, cap_rate, par_rate, spread, effective_date, expiration_date, updated_by } = body;

  if (!product_id || !index_name || !effective_date) {
    return NextResponse.json({ error: "product_id, index_name, and effective_date are required" }, { status: 400 });
  }

  // Fetch old current rate for audit log
  const { data: oldRate } = await supabaseAdmin
    .from("rates")
    .select("*")
    .eq("product_id", product_id)
    .eq("index_name", index_name)
    .eq("is_current", true)
    .maybeSingle();

  // Flip old row to is_current=false
  if (oldRate) {
    await supabaseAdmin
      .from("rates")
      .update({ is_current: false, expiration_date: effective_date })
      .eq("id", oldRate.id);
  }

  // Insert new rate row
  const { data: newRate, error } = await supabaseAdmin
    .from("rates")
    .insert({ product_id, index_name, cap_rate, par_rate, spread, effective_date, expiration_date, updated_by, is_current: true })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  await logAction({
    action: oldRate ? "UPDATE" : "CREATE",
    tableName: "rates",
    recordId: newRate.id,
    oldValues: oldRate ?? undefined,
    newValues: newRate,
    userId: updated_by ?? undefined,
    ipAddress: req.headers.get("x-forwarded-for") ?? undefined,
  });

  return NextResponse.json(newRate, { status: 201 });
}
