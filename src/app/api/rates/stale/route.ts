import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/db";

export async function GET() {
  // Get the most recent rate per carrier (by max effective_date)
  const { data, error } = await supabaseAdmin
    .from("rates")
    .select(`
      effective_date,
      updated_by,
      product:products(
        id,
        name,
        type,
        carrier:carriers(id, name, am_best_rating)
      )
    `)
    .eq("is_current", true)
    .order("effective_date", { ascending: true });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Aggregate by carrier: find oldest effective_date per carrier
  type RateRow = NonNullable<typeof data>[number];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const carrierMap = new Map<string, { id: string; name: string; am_best: string | null; oldestDate: string; rateCount: number; products: Set<string>; lastUpdatedBy: string | null }>();

  for (const r of data ?? []) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const p = (r as any).product as Record<string, any> | null;
    const c = p?.carrier as Record<string, string | null> | null;
    if (!c?.id || !c?.name) continue;

    const existing = carrierMap.get(c.id as string);
    if (!existing) {
      carrierMap.set(c.id as string, {
        id:            c.id as string,
        name:          c.name as string,
        am_best:       c.am_best_rating as string | null,
        oldestDate:    r.effective_date,
        rateCount:     1,
        products:      new Set([p?.name as string]),
        lastUpdatedBy: r.updated_by,
      });
    } else {
      existing.rateCount++;
      if (p?.name) existing.products.add(p.name as string);
      if (r.effective_date < existing.oldestDate) {
        existing.oldestDate = r.effective_date;
      }
    }
  }

  const today = Date.now();
  const result = Array.from(carrierMap.values()).map(c => ({
    id:            c.id,
    name:          c.name,
    am_best:       c.am_best,
    oldest_date:   c.oldestDate,
    rate_count:    c.rateCount,
    product_count: c.products.size,
    days_stale:    Math.floor((today - new Date(c.oldestDate).getTime()) / 86400000),
    last_updated_by: c.lastUpdatedBy,
  })).sort((a, b) => b.days_stale - a.days_stale);

  return NextResponse.json(result);
}
