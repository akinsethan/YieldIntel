import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/db";
import { logAction } from "@/lib/audit";

export async function GET(req: NextRequest) {
  const carrierId = new URL(req.url).searchParams.get("carrier_id");
  let query = supabaseAdmin
    .from("products")
    .select("*, carrier:carriers(id,name,am_best_rating)")
    .eq("is_active", true)
    .order("name");

  if (carrierId) query = query.eq("carrier_id", carrierId);

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { carrier_id, name, type, surrender_years, min_premium, states_available, bonus, mva, surrender_schedule, renewal_type, notes, buffer_rate } = body;
  if (!carrier_id || !name || !type) {
    return NextResponse.json({ error: "carrier_id, name, and type are required" }, { status: 400 });
  }

  const { data, error } = await supabaseAdmin
    .from("products")
    .insert({ carrier_id, name, type, surrender_years, min_premium, states_available, bonus, mva, surrender_schedule, renewal_type, notes, buffer_rate })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  await logAction({
    action: "CREATE", tableName: "products", recordId: data.id,
    newValues: data,
    ipAddress: req.headers.get("x-forwarded-for") ?? undefined,
  });

  return NextResponse.json(data, { status: 201 });
}
