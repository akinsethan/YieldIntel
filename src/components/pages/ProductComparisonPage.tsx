"use client";

import { useState, useEffect, useMemo } from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { C } from "@/lib/tokens";
import { Card } from "@/components/ui/Card";
import { SectionTitle } from "@/components/ui/SectionTitle";

const SLOT_COLORS = [C.blue, C.teal, C.purple, C.amber];
const TYPE_COLORS: Record<string, string> = { FIA: C.blue, MYGA: C.teal, RILA: C.purple, SPIA: C.green, DIA: C.amber };

const fmtUSD = (n: number | null) =>
  n != null ? new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(n) : "—";

interface RateRow {
  id:             string;
  index_name:     string;
  cap_rate:       number | null;
  par_rate:       number | null;
  spread:         number | null;
  effective_date: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  product:        any;
}

interface ComparableProduct {
  rateId:       string;
  productId:    string;
  label:        string; // "Carrier · Product"
  carrier:      string;
  product:      string;
  type:         string;
  amBest:       string;
  spRating:     string;
  surrender:    number | null;
  cap:          number | null;
  par:          number | null;
  spread:       number | null;
  minPremium:   number | null;
  bonus:        number;
  mva:          boolean;
  notes:        string;
  updatedDate:  string;
}

function freshnessColor(dateStr: string) {
  const days = Math.floor((Date.now() - new Date(dateStr).getTime()) / 86400000);
  if (days === 0)  return C.green;
  if (days <= 7)   return C.amber;
  return C.red;
}

function freshnessLabel(dateStr: string) {
  const days = Math.floor((Date.now() - new Date(dateStr).getTime()) / 86400000);
  if (days === 0)  return "Today";
  if (days <= 7)   return `${days}d ago`;
  return `${days}d ago`;
}

// Highlight the best numeric value across selected columns for a given row
function bestIdx(values: (number | null)[], higherIsBetter = true): number {
  const nums = values.map((v, i) => ({ v, i })).filter(x => x.v != null) as { v: number; i: number }[];
  if (nums.length < 2) return -1;
  const best = higherIsBetter
    ? nums.reduce((a, b) => a.v >= b.v ? a : b)
    : nums.reduce((a, b) => a.v <= b.v ? a : b);
  return best.i;
}

export function ProductComparisonPage() {
  const [allRates, setAllRates]   = useState<RateRow[]>([]);
  const [loading, setLoading]     = useState(true);
  const [slots, setSlots]         = useState<(string | null)[]>([null, null, null, null]); // rateId per slot
  const [search, setSearch]       = useState("");
  const [typeFilter, setTypeFilter] = useState("All");

  useEffect(() => {
    fetch("/api/rates")
      .then(r => r.json())
      .then(data => { setAllRates(data); setLoading(false); });
  }, []);

  const allProducts: ComparableProduct[] = useMemo(() =>
    allRates.map(r => ({
      rateId:      r.id,
      productId:   r.product?.id ?? "",
      label:       `${r.product?.carrier?.name ?? ""} · ${r.product?.name ?? ""}`,
      carrier:     r.product?.carrier?.name ?? "Unknown",
      product:     r.product?.name ?? "Unknown",
      type:        r.product?.type ?? "—",
      amBest:      r.product?.carrier?.am_best_rating ?? "—",
      spRating:    r.product?.carrier?.sp_rating ?? "—",
      surrender:   r.product?.surrender_years ?? null,
      cap:         r.cap_rate,
      par:         r.par_rate,
      spread:      r.spread,
      minPremium:  r.product?.min_premium ?? null,
      bonus:       r.product?.bonus ?? 0,
      mva:         r.product?.mva ?? false,
      notes:       r.product?.notes ?? "",
      updatedDate: r.effective_date ?? "",
    })), [allRates]);

  const TYPES = ["All", ...Array.from(new Set(allProducts.map(p => p.type))).filter(t => t !== "—")];

  const searchResults = useMemo(() => {
    const q = search.toLowerCase();
    return allProducts.filter(p => {
      if (typeFilter !== "All" && p.type !== typeFilter) return false;
      if (q && !p.label.toLowerCase().includes(q) && !p.type.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [allProducts, search, typeFilter]);

  function addToSlot(rateId: string) {
    const firstEmpty = slots.findIndex(s => s === null);
    if (firstEmpty === -1) return;
    setSlots(s => s.map((v, i) => i === firstEmpty ? rateId : v));
    setSearch("");
  }

  function removeSlot(i: number) {
    setSlots(s => s.map((v, idx) => idx === i ? null : v));
  }

  const selected: (ComparableProduct | null)[] = slots.map(id =>
    id ? (allProducts.find(p => p.rateId === id) ?? null) : null
  );
  const filled = selected.filter(Boolean) as ComparableProduct[];

  // Projected growth (guaranteed rate compound for MYGA; cap for FIA/RILA)
  const projData = useMemo(() => {
    const maxYears = Math.max(...filled.map(p => p.surrender ?? 7), 7);
    return Array.from({ length: maxYears + 1 }, (_, yr) => {
      const row: Record<string, string | number> = { year: `Y${yr}` };
      filled.forEach(p => {
        const r = (p.cap ?? p.par ?? 0) / 100;
        row[`${p.carrier} · ${p.product}`] = Math.round(100_000 * Math.pow(1 + r, yr));
      });
      return row;
    });
  }, [filled]);

  // Comparison rows definition
  const rows: { label: string; key: keyof ComparableProduct; fmt: (v: unknown, p: ComparableProduct) => string; bestFn?: (vals: (number | null)[]) => number; highlight?: boolean }[] = [
    { label: "Product Type",    key: "type",        fmt: v => String(v) },
    { label: "AM Best",         key: "amBest",       fmt: v => String(v) },
    { label: "S&P Rating",      key: "spRating",     fmt: v => String(v) },
    { label: "Surrender Period",key: "surrender",    fmt: v => v != null ? `${v} years` : "—" },
    { label: "Cap Rate",        key: "cap",          fmt: v => v != null ? `${(v as number).toFixed(2)}%` : "—", bestFn: vs => bestIdx(vs), highlight: true },
    { label: "Par Rate",        key: "par",          fmt: v => v != null ? `${(v as number).toFixed(2)}%` : "—", bestFn: vs => bestIdx(vs), highlight: true },
    { label: "Spread",          key: "spread",       fmt: v => v != null ? `${(v as number).toFixed(2)}%` : "—", bestFn: vs => bestIdx(vs, false), highlight: true },
    { label: "Min Premium",     key: "minPremium",   fmt: v => fmtUSD(v as number | null), bestFn: vs => bestIdx(vs, false), highlight: true },
    { label: "Bonus",           key: "bonus",        fmt: v => (v as number) > 0 ? `${v}%` : "None" },
    { label: "MVA",             key: "mva",          fmt: v => v ? "Yes" : "No" },
    { label: "Last Updated",    key: "updatedDate",  fmt: (v, p) => v ? freshnessLabel(String(v)) : "—" },
  ];

  const inputStyle = { background: C.bg, border: `1px solid ${C.border}`, borderRadius: 8, padding: "9px 12px", fontSize: 13, color: C.text, fontFamily: "inherit", outline: "none" };

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ color: C.navy, fontSize: 24, fontWeight: 800, letterSpacing: "-0.03em", margin: 0 }}>Product Comparison</h1>
        <div style={{ color: C.textMid, fontSize: 13, marginTop: 4 }}>
          Compare up to 4 products side-by-side · Best values highlighted in green
        </div>
      </div>

      {/* Product selector */}
      <Card style={{ marginBottom: 20 }}>
        <SectionTitle sub="Search and select products to compare">Add Products</SectionTitle>

        <div style={{ display: "flex", gap: 12, marginBottom: 16, flexWrap: "wrap" }}>
          {/* Search */}
          <div style={{ position: "relative", flex: "1 1 260px" }}>
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search by carrier or product name…"
              style={{ ...inputStyle, width: "100%", boxSizing: "border-box" }}
              disabled={filled.length >= 4}
            />
            {search && searchResults.length > 0 && (
              <div style={{ position: "absolute", top: "100%", left: 0, right: 0, background: C.surface, border: `1px solid ${C.border}`, borderRadius: 10, boxShadow: "0 8px 24px rgba(0,0,0,0.12)", zIndex: 20, maxHeight: 240, overflowY: "auto", marginTop: 4 }}>
                {searchResults.slice(0, 12).map(p => (
                  <div key={p.rateId}
                    onClick={() => addToSlot(p.rateId)}
                    style={{ padding: "10px 14px", cursor: "pointer", borderBottom: `1px solid ${C.border}`, display: "flex", alignItems: "center", gap: 10 }}
                    onMouseEnter={e => (e.currentTarget.style.background = C.surfaceHi)}
                    onMouseLeave={e => (e.currentTarget.style.background = "")}>
                    <span style={{ background: (TYPE_COLORS[p.type] ?? C.border) + "22", color: TYPE_COLORS[p.type] ?? C.textDim, borderRadius: 4, padding: "1px 7px", fontSize: 10, fontWeight: 700, fontFamily: "monospace" }}>{p.type}</span>
                    <div>
                      <div style={{ fontSize: 13, color: C.navy, fontWeight: 600 }}>{p.carrier}</div>
                      <div style={{ fontSize: 11, color: C.textDim }}>{p.product}</div>
                    </div>
                    {p.cap != null && <span style={{ marginLeft: "auto", fontSize: 13, fontFamily: "monospace", color: C.green, fontWeight: 700 }}>{p.cap.toFixed(2)}%</span>}
                  </div>
                ))}
              </div>
            )}
          </div>
          {/* Type filter */}
          <select value={typeFilter} onChange={e => setTypeFilter(e.target.value)} style={{ ...inputStyle, width: 140 }}>
            {TYPES.map(t => <option key={t} value={t}>{t === "All" ? "All types" : t}</option>)}
          </select>
        </div>

        {/* Slots */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 10 }}>
          {slots.map((id, i) => {
            const p = selected[i];
            return (
              <div key={i} style={{ border: `2px ${p ? "solid" : "dashed"} ${p ? SLOT_COLORS[i] : C.border}`, borderRadius: 10, padding: "12px 14px", minHeight: 70, background: p ? `${SLOT_COLORS[i]}08` : C.surfaceHi, position: "relative" }}>
                {p ? (
                  <>
                    <button onClick={() => removeSlot(i)} style={{ position: "absolute", top: 8, right: 8, background: "none", border: "none", cursor: "pointer", color: C.textDim, fontSize: 14, lineHeight: 1 }}>✕</button>
                    <div style={{ fontSize: 10, color: SLOT_COLORS[i], fontWeight: 700, fontFamily: "monospace", letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: 2 }}>{p.type}</div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: C.navy, lineHeight: 1.3 }}>{p.carrier}</div>
                    <div style={{ fontSize: 11, color: C.textMid }}>{p.product}</div>
                    {p.cap != null && <div style={{ fontSize: 15, fontFamily: "monospace", fontWeight: 800, color: C.green, marginTop: 4 }}>{p.cap.toFixed(2)}%</div>}
                  </>
                ) : (
                  <div style={{ color: C.textDim, fontSize: 12, display: "flex", alignItems: "center", justifyContent: "center", height: "100%" }}>
                    {filled.length >= 4 ? "Max 4 selected" : "Search to add"}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </Card>

      {loading && (
        <Card><div style={{ padding: 60, textAlign: "center", color: C.textDim }}>Loading products…</div></Card>
      )}

      {!loading && allProducts.length === 0 && (
        <Card>
          <div style={{ padding: 60, textAlign: "center" }}>
            <div style={{ color: C.textMid, fontSize: 15, fontWeight: 600, marginBottom: 8 }}>No products in database yet</div>
            <div style={{ color: C.textDim, fontSize: 13, marginBottom: 20 }}>Add carriers and products via Admin, then post rates to compare them here.</div>
            <a href="/admin/rates" style={{ padding: "10px 20px", background: C.blue, color: "#fff", borderRadius: 8, fontSize: 13, fontWeight: 700, textDecoration: "none" }}>Go to Admin →</a>
          </div>
        </Card>
      )}

      {filled.length < 2 && allProducts.length > 0 && (
        <Card>
          <div style={{ padding: 48, textAlign: "center", color: C.textDim, fontSize: 13 }}>
            Select at least 2 products above to begin comparison.
          </div>
        </Card>
      )}

      {filled.length >= 2 && (
        <>
          {/* Comparison table */}
          <Card style={{ marginBottom: 20 }}>
            <SectionTitle>Side-by-Side Comparison</SectionTitle>
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                <thead>
                  <tr style={{ borderBottom: `2px solid ${C.border}` }}>
                    <th style={{ padding: "10px 16px", textAlign: "left", color: C.textDim, fontSize: 11, fontWeight: 600, width: 160 }}>Attribute</th>
                    {filled.map((p, i) => (
                      <th key={p.rateId} style={{ padding: "10px 16px", textAlign: "left", borderLeft: `3px solid ${SLOT_COLORS[i]}` }}>
                        <div style={{ fontSize: 10, color: SLOT_COLORS[i], fontWeight: 700, fontFamily: "monospace", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 2 }}>{p.type}</div>
                        <div style={{ fontSize: 13, fontWeight: 700, color: C.navy }}>{p.carrier}</div>
                        <div style={{ fontSize: 11, color: C.textDim }}>{p.product}</div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {rows.map(row => {
                    const values = filled.map(p => p[row.key] as unknown);
                    const numVals = row.highlight ? values.map(v => (typeof v === "number" ? v : null)) : [];
                    const best = row.bestFn ? row.bestFn(numVals) : -1;

                    return (
                      <tr key={row.label} style={{ borderBottom: `1px solid ${C.border}` }}>
                        <td style={{ padding: "11px 16px", color: C.textDim, fontWeight: 600, fontSize: 11, letterSpacing: "0.03em", textTransform: "uppercase", fontFamily: "monospace" }}>{row.label}</td>
                        {filled.map((p, i) => {
                          const val   = p[row.key];
                          const isTop = best === i;
                          const display = row.fmt(val, p);
                          return (
                            <td key={p.rateId} style={{ padding: "11px 16px", borderLeft: `3px solid ${SLOT_COLORS[i]}22` }}>
                              {row.key === "updatedDate" ? (
                                <span style={{ color: freshnessColor(String(val)), fontFamily: "monospace", fontSize: 12, fontWeight: 600 }}>{display}</span>
                              ) : row.key === "type" ? (
                                <span style={{ background: (TYPE_COLORS[String(val)] ?? C.border) + "22", color: TYPE_COLORS[String(val)] ?? C.textDim, borderRadius: 4, padding: "2px 8px", fontSize: 11, fontWeight: 700 }}>{display}</span>
                              ) : row.key === "mva" ? (
                                <span style={{ color: val ? C.amber : C.green, fontWeight: 600, fontSize: 12 }}>{display}</span>
                              ) : isTop ? (
                                <span style={{ color: C.green, fontFamily: "monospace", fontWeight: 800, fontSize: 14, background: C.greenDim, borderRadius: 5, padding: "2px 8px" }}>{display} ★</span>
                              ) : (
                                <span style={{ color: C.text, fontFamily: typeof val === "number" ? "monospace" : "inherit", fontSize: 13 }}>{display}</span>
                              )}
                            </td>
                          );
                        })}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </Card>

          {/* Growth chart */}
          <Card>
            <SectionTitle sub="$100,000 hypothetical · assumes full cap/par each year · for illustration only">Projected Growth Comparison</SectionTitle>
            <ResponsiveContainer width="100%" height={260}>
              <LineChart data={projData} margin={{ top: 4, right: 16, bottom: 0, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={C.border} vertical={false} />
                <XAxis dataKey="year" tick={{ fill: C.textDim, fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: C.textDim, fontSize: 11, fontFamily: "monospace" }} axisLine={false} tickLine={false} tickFormatter={v => `$${(v / 1000).toFixed(0)}K`} width={52} />
                <Tooltip
                  formatter={(v) => [`$${(v as number).toLocaleString()}`, ""]}
                  contentStyle={{ fontSize: 12, fontFamily: "monospace", borderRadius: 8, border: `1px solid ${C.border}` }}
                />
                <Legend wrapperStyle={{ fontSize: 11, color: C.textMid }} />
                {filled.map((p, i) => (
                  <Line key={p.rateId} type="monotone" dataKey={`${p.carrier} · ${p.product}`}
                    stroke={SLOT_COLORS[i]} strokeWidth={2.5}
                    dot={{ fill: SLOT_COLORS[i], r: 3 }} />
                ))}
              </LineChart>
            </ResponsiveContainer>

            <div style={{ marginTop: 14, padding: "10px 14px", background: C.surfaceHi, borderRadius: 8, border: `1px solid ${C.border}` }}>
              <span style={{ color: C.textDim, fontSize: 10, lineHeight: 1.6 }}>
                Projections are hypothetical and assume the cap/par rate is credited every year for the full term. Actual results will vary. This comparison is for research purposes only and does not constitute a product recommendation. Rates are subject to change — verify with carrier prior to client presentation.
              </span>
            </div>
          </Card>
        </>
      )}
    </div>
  );
}
