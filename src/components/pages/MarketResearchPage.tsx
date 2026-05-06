"use client";

import { useState, useEffect, useCallback } from "react";
import { C } from "@/lib/tokens";
import { Card } from "@/components/ui/Card";
import { SectionTitle } from "@/components/ui/SectionTitle";
import { Label } from "@/components/ui/Label";
import { Select } from "@/components/ui/Input";
import { Pill } from "@/components/ui/Pill";

interface ResearchRow {
  rate_id: string;
  carrier_name: string;
  am_best_rating: string | null;
  product_name: string;
  product_type: string;
  surrender_years: number | null;
  index_name: string;
  cap_rate: number | null;
  par_rate: number | null;
  spread: number | null;
  buffer_rate: number | null;
  min_premium: number | null;
  effective_date: string;
  states_available: string[] | null;
}

type SortKey = "carrier_name" | "product_name" | "cap_rate" | "par_rate" | "spread" | "surrender_years" | "buffer_rate";

function sortRows(rows: ResearchRow[], key: SortKey, dir: "asc" | "desc"): ResearchRow[] {
  return [...rows].sort((a, b) => {
    const av = a[key] ?? -Infinity;
    const bv = b[key] ?? -Infinity;
    if (typeof av === "string" && typeof bv === "string")
      return dir === "asc" ? av.localeCompare(bv) : bv.localeCompare(av);
    return dir === "asc" ? Number(av) - Number(bv) : Number(bv) - Number(av);
  });
}

export function MarketResearchPage() {
  const [rows, setRows]         = useState<ResearchRow[]>([]);
  const [loading, setLoading]   = useState(true);
  const [typeFilter, setTypeFilter] = useState<"All" | "FIA" | "RILA">("All");
  const [carrier, setCarrier]   = useState("All");
  const [minCap, setMinCap]     = useState(0);
  const [maxSurrender, setMaxSurrender] = useState(99);
  const [sort, setSort]         = useState<{ key: SortKey; dir: "asc" | "desc" }>({ key: "cap_rate", dir: "desc" });

  const load = useCallback(async () => {
    setLoading(true);
    const urls = typeFilter === "All"
      ? ["/api/rates?type=FIA", "/api/rates?type=RILA"]
      : [`/api/rates?type=${typeFilter}`];
    const results = await Promise.all(urls.map(u => fetch(u).then(r => r.json())));
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const mapped: ResearchRow[] = (results.flat() as any[]).map(r => ({
      rate_id:         r.id,
      carrier_name:    r.product?.carrier?.name ?? "Unknown",
      am_best_rating:  r.product?.carrier?.am_best_rating ?? null,
      product_name:    r.product?.name ?? "Unknown",
      product_type:    r.product?.type ?? "",
      surrender_years: r.product?.surrender_years ?? null,
      index_name:      r.index_name ?? "",
      cap_rate:        r.cap_rate ?? null,
      par_rate:        r.par_rate ?? null,
      spread:          r.spread ?? null,
      buffer_rate:     r.product?.buffer_rate ?? null,
      min_premium:     r.product?.min_premium ?? null,
      effective_date:  r.effective_date ?? "",
      states_available: r.product?.states_available ?? null,
    }));
    setRows(mapped);
    setLoading(false);
  }, [typeFilter]);

  useEffect(() => { load(); }, [load]);

  const carriers = ["All", ...Array.from(new Set(rows.map(r => r.carrier_name))).sort()];

  const filtered = rows.filter(r =>
    (carrier === "All" || r.carrier_name === carrier) &&
    (r.cap_rate == null || r.cap_rate >= minCap) &&
    (r.surrender_years == null || r.surrender_years <= maxSurrender)
  );

  const sorted = sortRows(filtered, sort.key, sort.dir);

  function toggleSort(key: SortKey) {
    setSort(s => s.key === key ? { key, dir: s.dir === "asc" ? "desc" : "asc" } : { key, dir: "desc" });
  }

  function SortTh({ col, label }: { col: SortKey; label: string }) {
    const active = sort.key === col;
    return (
      <th
        onClick={() => toggleSort(col)}
        style={{ color: active ? C.blue : C.textDim, fontWeight: 700, textAlign: "left", padding: "8px 14px", fontSize: 11, letterSpacing: "0.06em", textTransform: "uppercase" as const, fontFamily: "monospace", cursor: "pointer", userSelect: "none", whiteSpace: "nowrap" }}>
        {label} {active ? (sort.dir === "desc" ? "↓" : "↑") : ""}
      </th>
    );
  }

  const isRILA = (r: ResearchRow) => r.product_type === "RILA";

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ color: C.navy, fontSize: 24, fontWeight: 800, letterSpacing: "-0.03em", margin: 0 }}>FIA / RILA Research</h1>
        <div style={{ color: C.textMid, fontSize: 13, marginTop: 4 }}>Live product database · {sorted.length} rate{sorted.length !== 1 ? "s" : ""} shown</div>
      </div>

      {/* Type toggle */}
      <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
        {(["All", "FIA", "RILA"] as const).map(t => (
          <button key={t} onClick={() => setTypeFilter(t)} style={{
            padding: "7px 18px", borderRadius: 8, border: `1px solid ${typeFilter === t ? C.blue : C.border}`,
            background: typeFilter === t ? C.blue + "18" : C.surface,
            color: typeFilter === t ? C.blue : C.textMid,
            fontWeight: typeFilter === t ? 700 : 500, fontSize: 13, cursor: "pointer",
          }}>{t === "All" ? "All Types" : t}</button>
        ))}
      </div>

      <Card style={{ marginBottom: 16 }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 16 }}>
          <div>
            <Label>Carrier</Label>
            <Select value={carrier} onChange={v => setCarrier(String(v))} options={carriers.map(c => ({ value: c, label: c }))} />
          </div>
          <div>
            <Label>Min Cap Rate</Label>
            <Select value={minCap} onChange={v => setMinCap(Number(v))} options={[
              { value: 0, label: "Any Cap" }, { value: 8, label: "8% or more" },
              { value: 10, label: "10% or more" }, { value: 12, label: "12% or more" },
              { value: 14, label: "14% or more" },
            ]} />
          </div>
          <div>
            <Label>Max Surrender (yrs)</Label>
            <Select value={maxSurrender} onChange={v => setMaxSurrender(Number(v))} options={[
              { value: 99, label: "Any" }, { value: 3, label: "≤ 3 yrs" },
              { value: 5, label: "≤ 5 yrs" }, { value: 7, label: "≤ 7 yrs" },
              { value: 10, label: "≤ 10 yrs" },
            ]} />
          </div>
        </div>
      </Card>

      {loading ? (
        <Card>
          <div style={{ padding: 48, textAlign: "center", color: C.textDim }}>Loading…</div>
        </Card>
      ) : sorted.length === 0 ? (
        <Card>
          <div style={{ padding: 48, textAlign: "center" }}>
            <div style={{ fontSize: 32, marginBottom: 12 }}>📭</div>
            <div style={{ color: C.navy, fontWeight: 700, fontSize: 16, marginBottom: 8 }}>No Products Found</div>
            <div style={{ color: C.textMid, fontSize: 13, marginBottom: 20 }}>
              {rows.length === 0 ? "No FIA or RILA products in the database yet." : "No products match the current filters."}
            </div>
            {rows.length === 0 && (
              <a href="/admin/rates" style={{ color: C.blue, fontSize: 13, fontWeight: 600, textDecoration: "none" }}>
                → Add rates in Admin
              </a>
            )}
          </div>
        </Card>
      ) : (
        <Card>
          <SectionTitle>{sorted.length} Rate{sorted.length !== 1 ? "s" : ""}</SectionTitle>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
              <thead>
                <tr style={{ borderBottom: `2px solid ${C.border}` }}>
                  <SortTh col="carrier_name"  label="Carrier" />
                  <SortTh col="product_name"  label="Product" />
                  <th style={{ color: C.textDim, fontWeight: 700, textAlign: "left", padding: "8px 14px", fontSize: 11, letterSpacing: "0.06em", textTransform: "uppercase", fontFamily: "monospace" }}>Type</th>
                  <SortTh col="cap_rate"      label="Cap Rate" />
                  <SortTh col="par_rate"      label="Par Rate" />
                  <SortTh col="spread"        label="Spread" />
                  <SortTh col="buffer_rate"   label="Buffer" />
                  <SortTh col="surrender_years" label="Surrender" />
                  <th style={{ color: C.textDim, fontWeight: 700, textAlign: "left", padding: "8px 14px", fontSize: 11, letterSpacing: "0.06em", textTransform: "uppercase", fontFamily: "monospace" }}>Index</th>
                  <th style={{ color: C.textDim, fontWeight: 700, textAlign: "left", padding: "8px 14px", fontSize: 11, letterSpacing: "0.06em", textTransform: "uppercase", fontFamily: "monospace" }}>AM Best</th>
                  <th style={{ color: C.textDim, fontWeight: 700, textAlign: "left", padding: "8px 14px", fontSize: 11, letterSpacing: "0.06em", textTransform: "uppercase", fontFamily: "monospace" }}>Eff. Date</th>
                </tr>
              </thead>
              <tbody>
                {sorted.map(r => {
                  const rila = isRILA(r);
                  return (
                    <tr key={r.rate_id} style={{ borderBottom: `1px solid ${C.border}` }}
                      onMouseEnter={e => (e.currentTarget.style.background = C.surfaceHi)}
                      onMouseLeave={e => (e.currentTarget.style.background = "transparent")}>
                      <td style={{ padding: "11px 14px", color: C.navy, fontWeight: 600, whiteSpace: "nowrap" }}>{r.carrier_name}</td>
                      <td style={{ padding: "11px 14px", color: C.textMid }}>{r.product_name}</td>
                      <td style={{ padding: "11px 14px" }}>
                        <Pill color={rila ? C.purple : C.blue}>{r.product_type}</Pill>
                      </td>
                      <td style={{ padding: "11px 14px" }}>
                        {r.cap_rate != null
                          ? <Pill color={r.cap_rate >= 12 ? C.green : r.cap_rate >= 10 ? C.blue : C.amber}>{r.cap_rate.toFixed(2)}%</Pill>
                          : <span style={{ color: C.textDim }}>—</span>}
                      </td>
                      <td style={{ padding: "11px 14px", color: C.textMid, fontFamily: "monospace" }}>
                        {r.par_rate != null ? `${r.par_rate.toFixed(0)}%` : "—"}
                      </td>
                      <td style={{ padding: "11px 14px", color: C.textMid, fontFamily: "monospace" }}>
                        {r.spread != null ? `${r.spread.toFixed(2)}%` : "—"}
                      </td>
                      <td style={{ padding: "11px 14px" }}>
                        {rila && r.buffer_rate != null
                          ? <Pill color={r.buffer_rate >= 15 ? C.green : r.buffer_rate >= 10 ? C.amber : C.textDim}>{r.buffer_rate}%</Pill>
                          : <span style={{ color: C.textDim }}>—</span>}
                      </td>
                      <td style={{ padding: "11px 14px", color: C.textMid, fontFamily: "monospace" }}>
                        {r.surrender_years != null ? `${r.surrender_years} yr` : "—"}
                      </td>
                      <td style={{ padding: "11px 14px", color: C.textMid, fontSize: 12 }}>{r.index_name}</td>
                      <td style={{ padding: "11px 14px" }}>
                        {r.am_best_rating
                          ? <Pill color={r.am_best_rating.startsWith("A+") ? C.green : r.am_best_rating.startsWith("A") ? C.blue : C.amber}>{r.am_best_rating}</Pill>
                          : <span style={{ color: C.textDim }}>—</span>}
                      </td>
                      <td style={{ padding: "11px 14px", color: C.textDim, fontSize: 11, fontFamily: "monospace", whiteSpace: "nowrap" }}>
                        {new Date(r.effective_date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      <div style={{ marginTop: 16, padding: "12px 16px", background: C.surfaceHi, borderRadius: 8, fontSize: 11, color: C.textDim, lineHeight: 1.6 }}>
        Rates subject to change without notice. Cap rates, par rates, and buffers are current as of the effective date shown. Not all products available in all states. Verify current rates directly with carrier before client presentation. Not a solicitation of sale.
      </div>
    </div>
  );
}
