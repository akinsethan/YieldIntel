import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/db";
import { logAction } from "@/lib/audit";

interface ImportRateRow {
  carrier_name: string;
  product_name: string;
  product_type: string;
  surrender_years?: number;
  min_premium?: number;
  index_name: string;
  cap_rate?: number;
  par_rate?: number;
  spread?: number;
  effective_date: string;
}

export async function POST(req: NextRequest) {
  const { rows }: { rows: ImportRateRow[] } = await req.json();

  if (!Array.isArray(rows) || rows.length === 0) {
    return NextResponse.json({ error: "No rows provided" }, { status: 400 });
  }

  const results: { row: number; status: "ok" | "error"; message?: string }[] = [];

  // Fetch all carriers once
  const { data: carriers } = await supabaseAdmin.from("carriers").select("id, name").eq("is_active", true);
  const carrierMap = new Map((carriers ?? []).map(c => [c.name.toLowerCase(), c.id]));

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    try {
      // Validate required fields
      if (!row.carrier_name || !row.product_name || !row.product_type || !row.index_name || !row.effective_date) {
        results.push({ row: i, status: "error", message: "Missing required field (carrier_name, product_name, product_type, index_name, effective_date)" });
        continue;
      }

      const carrierId = carrierMap.get(row.carrier_name.toLowerCase());
      if (!carrierId) {
        results.push({ row: i, status: "error", message: `Carrier not found: "${row.carrier_name}"` });
        continue;
      }

      // Upsert product
      const { data: existingProduct } = await supabaseAdmin
        .from("products")
        .select("id")
        .eq("carrier_id", carrierId)
        .eq("name", row.product_name)
        .single();

      let productId: string;
      if (existingProduct) {
        productId = existingProduct.id;
      } else {
        const { data: newProduct, error: prodErr } = await supabaseAdmin
          .from("products")
          .insert({
            carrier_id:     carrierId,
            name:           row.product_name,
            type:           row.product_type,
            surrender_years: row.surrender_years ?? null,
            min_premium:    row.min_premium ?? null,
            is_active:      true,
          })
          .select("id")
          .single();
        if (prodErr || !newProduct) {
          results.push({ row: i, status: "error", message: prodErr?.message ?? "Failed to create product" });
          continue;
        }
        productId = newProduct.id;
      }

      // Expire current rate for this product + index
      await supabaseAdmin
        .from("rates")
        .update({ is_current: false })
        .eq("product_id", productId)
        .eq("index_name", row.index_name)
        .eq("is_current", true);

      // Insert new rate
      const { error: rateErr } = await supabaseAdmin.from("rates").insert({
        product_id:     productId,
        index_name:     row.index_name,
        cap_rate:       row.cap_rate ?? null,
        par_rate:       row.par_rate ?? null,
        spread:         row.spread ?? null,
        effective_date: row.effective_date,
        is_current:     true,
      });

      if (rateErr) {
        results.push({ row: i, status: "error", message: rateErr.message });
        continue;
      }

      await logAction({
        action: "CREATE", tableName: "rates",
        newValues: { product_id: productId, index_name: row.index_name, effective_date: row.effective_date, source: "bulk_import" },
      });

      results.push({ row: i, status: "ok" });
    } catch (err) {
      results.push({ row: i, status: "error", message: String(err) });
    }
  }

  const ok    = results.filter(r => r.status === "ok").length;
  const errors = results.filter(r => r.status === "error").length;
  return NextResponse.json({ ok, errors, results });
}
