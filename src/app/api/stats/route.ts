import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/db";

export const revalidate = 60;

export async function GET() {
  const [carriers, products, rates, latestRate] = await Promise.all([
    supabaseAdmin.from("carriers").select("id", { count: "exact", head: true }).eq("is_active", true),
    supabaseAdmin.from("products").select("id", { count: "exact", head: true }).eq("is_active", true),
    supabaseAdmin.from("rates").select("id", { count: "exact", head: true }).eq("is_current", true),
    supabaseAdmin.from("rates").select("effective_date").eq("is_current", true).order("effective_date", { ascending: false }).limit(1),
  ]);

  return NextResponse.json({
    carrierCount: carriers.count ?? 0,
    productCount: products.count ?? 0,
    rateCount:    rates.count ?? 0,
    lastUpdated:  latestRate.data?.[0]?.effective_date ?? null,
  });
}
