"use client";

import { useState, useEffect, useMemo } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { C } from "@/lib/tokens";
import { Card } from "@/components/ui/Card";
import { SectionTitle } from "@/components/ui/SectionTitle";
import { Label } from "@/components/ui/Label";
import { Select } from "@/components/ui/Input";
import { Pill } from "@/components/ui/Pill";

const fmtUSD = (n: number) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(n);

// Typical industry surrender schedule by term if not stored in DB
function defaultSchedule(years: number): number[] {
  const base = years + 3;
  return Array.from({ length: years }, (_, i) => Math.max(1, base - i));
}

interface LiveMYGA {
  rateId:           string;
  productId:        string;
  carrier:          string;
  product:          string;
  amBest:           string;
  term:             number;
  rate:             number;
  minPremium:       number;
  bonus:            number;
  mva:              boolean;
  surrenderSchedule: number[];
  renewalType:      string;
  states:           string[] | null;
  notes:            string;
  effectiveDate:    string;
}

function amBestColor(r: string) {
  if (r === "A++" || r === "A+") return C.green;
  if (r === "A"   || r === "A-") return C.blue;
  return C.amber;
}

function SortIcon({ field, sortKey, dir }: { field: string; sortKey: string; dir: "asc" | "desc" }) {
  if (field !== sortKey) return <span style={{ color: C.textDim, fontSize: 9 }}> ⇅</span>;
  return <span style={{ color: C.blue, fontSize: 9 }}> {dir === "asc" ? "↑" : "↓"}</span>;
}

function DetailPanel({ p, onClose }: { p: LiveMYGA; onClose: () => void }) {
  const schedule  = p.surrenderSchedule.length > 0 ? p.surrenderSchedule : defaultSchedule(p.term);
  const isDerived = p.surrenderSchedule.length === 0;

  const growth = Array.from({ length: p.term + 1 }, (_, i) => ({
    year:  `Y${i}`,
    value: Math.round(100_000 * (1 + (p.rate + p.bonus) / 100) * Math.pow(1 + p.rate / 100, Math.max(0, i - 1))),
  }));
  // Simpler: straight compound
  const hypothetical = Array.from({ length: p.term + 1 }, (_, i) => ({
    year:  `Y${i}`,
    value: Math.round(100_000 * Math.pow(1 + p.rate / 100, i)),
  }));

  const days = Math.floor((Date.now() - new Date(p.effectiveDate).getTime()) / 86400000);
  const freshColor = days === 0 ? C.green : days <= 7 ? C.amber : C.red;
  const freshLabel = days === 0 ? "Updated today" : days <= 7 ? `Updated ${days}d ago` : `Updated ${days}d ago`;

  return (
    <div style={{ position: "fixed", top: 0, right: 0, width: 420, height: "100vh", background: C.surface, borderLeft: `1px solid ${C.border}`, zIndex: 50, overflowY: "auto", boxShadow: "-4px 0 24px rgba(11,28,46,0.12)" }}>
      <div style={{ padding: "20px 24px", borderBottom: `1px solid ${C.border}`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <div style={{ color: C.textDim, fontSize: 11, fontFamily: "monospace", fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase" }}>{p.carrier}</div>
          <div style={{ color: C.navy, fontSize: 16, fontWeight: 800 }}>{p.product}</div>
          <div style={{ color: freshColor, fontSize: 11, fontFamily: "monospace", marginTop: 2 }}>{freshLabel}</div>
        </div>
        <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: C.textDim, fontSize: 20, padding: 4 }}>✕</button>
      </div>

      <div style={{ padding: "20px 24px" }}>
        {/* Key metrics */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 20 }}>
          {[
            { label: "Rate",        value: `${p.rate.toFixed(2)}%`,                         color: C.green  },
            { label: "Term",        value: `${p.term} Years`,                               color: C.navy   },
            { label: "AM Best",     value: p.amBest || "—",                                 color: amBestColor(p.amBest) },
            { label: "Bonus",       value: p.bonus > 0 ? `${p.bonus}%` : "None",            color: p.bonus > 0 ? C.teal : C.textMid },
            { label: "MVA",         value: p.mva ? "Yes" : "No",                            color: p.mva ? C.amber : C.green },
            { label: "Min Premium", value: fmtUSD(p.minPremium),                            color: C.textMid },
            { label: "Renewal",     value: p.renewalType || "Declared Rate",                color: C.textMid },
            { label: "States",      value: p.states?.includes("All") ? "All States" : `${p.states?.length ?? 0} States`, color: C.textMid },
          ].map(m => (
            <div key={m.label} style={{ background: C.bg, borderRadius: 10, padding: "12px 14px", border: `1px solid ${C.border}` }}>
              <div style={{ color: C.textDim, fontSize: 10, fontFamily: "monospace", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 4 }}>{m.label}</div>
              <div style={{ color: m.color, fontSize: 14, fontWeight: 800, fontFamily: "monospace" }}>{m.value}</div>
            </div>
          ))}
        </div>

        {/* Surrender schedule */}
        <div style={{ marginBottom: 20 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
            <div style={{ color: C.textMid, fontSize: 11, fontFamily: "monospace", textTransform: "uppercase", letterSpacing: "0.06em", fontWeight: 700 }}>Surrender Schedule</div>
            {isDerived && <span style={{ fontSize: 10, color: C.amber, fontFamily: "monospace" }}>Typical — verify with carrier</span>}
          </div>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
            {schedule.map((pct, i) => (
              <div key={i} style={{ textAlign: "center" }}>
                <div style={{ background: `${C.red}${Math.round((pct / 12) * 200).toString(16).padStart(2, "0")}`, borderRadius: 6, padding: "8px 10px", marginBottom: 4, minWidth: 40 }}>
                  <div style={{ color: C.red, fontSize: 12, fontWeight: 700, fontFamily: "monospace" }}>{pct}%</div>
                </div>
                <div style={{ color: C.textDim, fontSize: 9, fontFamily: "monospace" }}>Yr {i + 1}</div>
              </div>
            ))}
          </div>
        </div>

        {/* $100K growth chart */}
        <div style={{ marginBottom: 20 }}>
          <div style={{ color: C.textMid, fontSize: 11, fontFamily: "monospace", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 10, fontWeight: 700 }}>$100K Hypothetical Growth</div>
          <ResponsiveContainer width="100%" height={160}>
            <BarChart data={hypothetical} barSize={28}>
              <CartesianGrid strokeDasharray="3 3" stroke={C.border} vertical={false} />
              <XAxis dataKey="year" tick={{ fill: C.textDim, fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: C.textDim, fontSize: 10, fontFamily: "monospace" }} axisLine={false} tickLine={false} tickFormatter={v => `$${(v / 1000).toFixed(0)}K`} width={48} />
              <Tooltip formatter={(v) => [fmtUSD(v as number), "Value"]} contentStyle={{ fontSize: 12, fontFamily: "monospace", borderRadius: 8, border: `1px solid ${C.border}` }} />
              <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                {hypothetical.map((_, i) => (
                  <Cell key={i} fill={i === hypothetical.length - 1 ? C.green : C.blue} opacity={0.7 + (i / hypothetical.length) * 0.3} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Notes */}
        {p.notes && (
          <div style={{ background: C.amberDim, borderRadius: 10, padding: "12px 14px", border: `1px solid ${C.amber}22`, marginBottom: 16 }}>
            <div style={{ color: C.amber, fontSize: 10, fontFamily: "monospace", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 4 }}>Advisor Notes</div>
            <div style={{ color: C.textMid, fontSize: 12, lineHeight: 1.6 }}>{p.notes}</div>
          </div>
        )}

        <div style={{ padding: "10px 12px", background: C.surfaceHi, borderRadius: 8, border: `1px solid ${C.border}` }}>
          <div style={{ color: C.textDim, fontSize: 10, lineHeight: 1.6 }}>
            Rates are indicative and subject to change without notice. Verify current rates with carrier before presenting to clients. This tool is for research purposes and does not constitute a product recommendation.
          </div>
        </div>
      </div>
    </div>
  );
}

type SortKey = "rate" | "term" | "carrier" | "amBest" | "minPremium" | "bonus";
const RATING_ORDER = ["A++", "A+", "A", "A-", "B++", "B+"];

export function MYGAScreenerPage() {
  const [products, setProducts] = useState<LiveMYGA[]>([]);
  const [loading, setLoading]   = useState(true);
  const [filters, setFilters]   = useState({ carrier: "All", term: "All", minAmBest: "All", mva: "All", bonus: "All" });
  const [sortKey, setSortKey]   = useState<SortKey>("rate");
  const [sortDir, setSortDir]   = useState<"asc" | "desc">("desc");
  const [selected, setSelected] = useState<LiveMYGA | null>(null);

  useEffect(() => {
    fetch("/api/rates?type=MYGA")
      .then(r => r.json())
      .then(rows => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const mapped: LiveMYGA[] = (rows as any[]).map(r => ({
          rateId:            r.id,
          productId:         r.product?.id ?? "",
          carrier:           r.product?.carrier?.name ?? "Unknown",
          product:           r.product?.name ?? "Unknown",
          amBest:            r.product?.carrier?.am_best_rating ?? "—",
          term:              r.product?.surrender_years ?? 0,
          rate:              r.cap_rate ?? 0,
          minPremium:        r.product?.min_premium ?? 0,
          bonus:             r.product?.bonus ?? 0,
          mva:               r.product?.mva ?? false,
          surrenderSchedule: r.product?.surrender_schedule ?? [],
          renewalType:       r.product?.renewal_type ?? "Declared Rate",
          states:            r.product?.states_available ?? null,
          notes:             r.product?.notes ?? "",
          effectiveDate:     r.effective_date ?? "",
        }));
        setProducts(mapped);
      })
      .finally(() => setLoading(false));
  }, []);

  const carriers  = ["All", ...new Set(products.map(p => p.carrier))];
  const terms     = ["All", ...Array.from(new Set(products.map(p => p.term))).sort((a, b) => a - b).map(String)];

  const filtered = useMemo(() => {
    const minRatingIdx = filters.minAmBest === "All" ? 999 : RATING_ORDER.indexOf(filters.minAmBest);
    return products.filter(p => {
      if (filters.carrier  !== "All" && p.carrier !== filters.carrier) return false;
      if (filters.term     !== "All" && p.term !== Number(filters.term)) return false;
      if (filters.minAmBest !== "All" && RATING_ORDER.indexOf(p.amBest) > minRatingIdx) return false;
      if (filters.mva   === "No"  &&  p.mva) return false;
      if (filters.mva   === "Yes" && !p.mva) return false;
      if (filters.bonus === "Yes" &&  p.bonus === 0) return false;
      return true;
    }).sort((a, b) => {
      const av = sortKey === "amBest" ? RATING_ORDER.indexOf(a.amBest) : (a[sortKey] as number);
      const bv = sortKey === "amBest" ? RATING_ORDER.indexOf(b.amBest) : (b[sortKey] as number);
      return sortDir === "asc" ? (av > bv ? 1 : -1) : (av < bv ? 1 : -1);
    });
  }, [products, filters, sortKey, sortDir]);

  function handleSort(key: SortKey) {
    if (sortKey === key) setSortDir(d => d === "asc" ? "desc" : "asc");
    else { setSortKey(key); setSortDir("desc"); }
  }

  const thStyle: React.CSSProperties = { color: C.textDim, fontWeight: 700, textAlign: "left", padding: "10px 14px", fontSize: 11, letterSpacing: "0.06em", textTransform: "uppercase", fontFamily: "monospace", cursor: "pointer", userSelect: "none", whiteSpace: "nowrap" };

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ color: C.navy, fontSize: 24, fontWeight: 800, letterSpacing: "-0.03em", margin: 0 }}>MYGA Rate Screener</h1>
        <div style={{ color: C.textMid, fontSize: 13, marginTop: 4 }}>
          Multi-year guaranteed annuity rates · {loading ? "Loading…" : `${filtered.length} of ${products.length} products`}
        </div>
      </div>

      {/* Filters */}
      <Card style={{ marginBottom: 16 }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 16 }}>
          <div><Label>Carrier</Label>
            <Select value={filters.carrier} onChange={v => setFilters(f => ({ ...f, carrier: v }))}
              options={carriers.map(c => ({ value: c, label: c }))} />
          </div>
          <div><Label>Term</Label>
            <Select value={filters.term} onChange={v => setFilters(f => ({ ...f, term: v }))}
              options={[{ value: "All", label: "All Terms" }, ...terms.filter(t => t !== "All").map(t => ({ value: t, label: `${t} Year` }))]} />
          </div>
          <div><Label>Min AM Best</Label>
            <Select value={filters.minAmBest} onChange={v => setFilters(f => ({ ...f, minAmBest: v }))}
              options={[{ value: "All", label: "Any Rating" }, ...RATING_ORDER.map(r => ({ value: r, label: `${r} or better` }))]} />
          </div>
          <div><Label>MVA</Label>
            <Select value={filters.mva} onChange={v => setFilters(f => ({ ...f, mva: v }))}
              options={[{ value: "All", label: "Any" }, { value: "No", label: "No MVA only" }, { value: "Yes", label: "MVA included" }]} />
          </div>
          <div><Label>Bonus</Label>
            <Select value={filters.bonus} onChange={v => setFilters(f => ({ ...f, bonus: v }))}
              options={[{ value: "All", label: "Any" }, { value: "Yes", label: "Bonus only" }]} />
          </div>
        </div>
      </Card>

      {/* Summary bar */}
      {!loading && filtered.length > 0 && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12, marginBottom: 16 }}>
          {[
            { label: "Best Rate",     value: `${Math.max(...filtered.map(p => p.rate)).toFixed(2)}%`,  color: C.green },
            { label: "Avg Rate",      value: `${(filtered.reduce((s, p) => s + p.rate, 0) / filtered.length).toFixed(2)}%`, color: C.blue },
            { label: "No-MVA Best",   value: filtered.filter(p => !p.mva).length > 0 ? `${Math.max(...filtered.filter(p => !p.mva).map(p => p.rate)).toFixed(2)}%` : "—", color: C.teal },
            { label: "Showing",       value: String(filtered.length),                                  color: C.navy },
          ].map(m => (
            <div key={m.label} style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 10, padding: "12px 16px" }}>
              <div style={{ color: C.textDim, fontSize: 10, fontFamily: "monospace", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 4 }}>{m.label}</div>
              <div style={{ color: m.color, fontSize: 20, fontWeight: 800, fontFamily: "monospace" }}>{m.value}</div>
            </div>
          ))}
        </div>
      )}

      {/* Table */}
      <Card>
        <SectionTitle sub="Click any row to view detail, surrender schedule, and growth projection">Rate Comparison Table</SectionTitle>

        {loading && (
          <div style={{ padding: 60, textAlign: "center", color: C.textDim }}>Loading rates from database…</div>
        )}

        {!loading && products.length === 0 && (
          <div style={{ padding: 60, textAlign: "center" }}>
            <div style={{ color: C.textMid, fontSize: 15, fontWeight: 600, marginBottom: 8 }}>No MYGA products in database</div>
            <div style={{ color: C.textDim, fontSize: 13, marginBottom: 20 }}>Add carriers and products via Admin, then post rates to see them here.</div>
            <a href="/admin/rates" style={{ padding: "10px 20px", background: C.blue, color: "#fff", borderRadius: 8, fontSize: 13, fontWeight: 700, textDecoration: "none" }}>
              Go to Admin → Rate Update →
            </a>
          </div>
        )}

        {!loading && products.length > 0 && (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
              <thead>
                <tr style={{ borderBottom: `2px solid ${C.border}` }}>
                  <th style={thStyle} onClick={() => handleSort("carrier")}>Carrier <SortIcon field="carrier" sortKey={sortKey} dir={sortDir} /></th>
                  <th style={thStyle}>Product</th>
                  <th style={thStyle} onClick={() => handleSort("amBest")}>AM Best <SortIcon field="amBest" sortKey={sortKey} dir={sortDir} /></th>
                  <th style={thStyle} onClick={() => handleSort("term")}>Term <SortIcon field="term" sortKey={sortKey} dir={sortDir} /></th>
                  <th style={thStyle} onClick={() => handleSort("rate")}>Rate <SortIcon field="rate" sortKey={sortKey} dir={sortDir} /></th>
                  <th style={thStyle} onClick={() => handleSort("bonus")}>Bonus <SortIcon field="bonus" sortKey={sortKey} dir={sortDir} /></th>
                  <th style={thStyle}>MVA</th>
                  <th style={thStyle} onClick={() => handleSort("minPremium")}>Min Premium <SortIcon field="minPremium" sortKey={sortKey} dir={sortDir} /></th>
                  <th style={{ ...thStyle, cursor: "default" }}></th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(p => (
                  <tr key={p.rateId}
                    onClick={() => setSelected(selected?.rateId === p.rateId ? null : p)}
                    style={{ borderBottom: `1px solid ${C.border}`, cursor: "pointer", background: selected?.rateId === p.rateId ? C.blueDim : "transparent" }}
                    onMouseEnter={e => { if (selected?.rateId !== p.rateId) e.currentTarget.style.background = C.surfaceHi; }}
                    onMouseLeave={e => { e.currentTarget.style.background = selected?.rateId === p.rateId ? C.blueDim : "transparent"; }}>
                    <td style={{ padding: "12px 14px", color: C.navy, fontWeight: 600 }}>{p.carrier}</td>
                    <td style={{ padding: "12px 14px", color: C.textMid, fontSize: 12 }}>{p.product}</td>
                    <td style={{ padding: "12px 14px" }}><Pill color={amBestColor(p.amBest)}>{p.amBest}</Pill></td>
                    <td style={{ padding: "12px 14px", color: C.textMid, fontFamily: "monospace" }}>{p.term} yr</td>
                    <td style={{ padding: "12px 14px" }}>
                      <span style={{ color: C.green, fontFamily: "monospace", fontWeight: 800, fontSize: 15 }}>{p.rate.toFixed(2)}%</span>
                    </td>
                    <td style={{ padding: "12px 14px" }}>
                      {p.bonus > 0 ? <Pill color={C.teal}>+{p.bonus}%</Pill> : <span style={{ color: C.textDim, fontSize: 12 }}>—</span>}
                    </td>
                    <td style={{ padding: "12px 14px" }}>
                      <Pill color={p.mva ? C.amber : C.green}>{p.mva ? "MVA" : "No MVA"}</Pill>
                    </td>
                    <td style={{ padding: "12px 14px", color: C.textMid, fontFamily: "monospace", fontSize: 12 }}>{fmtUSD(p.minPremium)}</td>
                    <td style={{ padding: "12px 14px" }}>
                      <span style={{ color: C.blue, fontSize: 11, fontFamily: "monospace", fontWeight: 700 }}>View →</span>
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr><td colSpan={9} style={{ padding: 40, textAlign: "center", color: C.textDim }}>No products match current filters</td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        <div style={{ marginTop: 16, padding: "10px 14px", background: C.surfaceHi, borderRadius: 8, border: `1px solid ${C.border}` }}>
          <span style={{ color: C.textDim, fontSize: 10, lineHeight: 1.6 }}>
            Rates shown are indicative only and subject to change without notice. Verify current rates with the carrier prior to client presentation. This tool is for research purposes and does not constitute a product recommendation.
          </span>
        </div>
      </Card>

      {selected && <DetailPanel p={selected} onClose={() => setSelected(null)} />}
      {selected && <div onClick={() => setSelected(null)} style={{ position: "fixed", inset: 0, zIndex: 49 }} />}
    </div>
  );
}
