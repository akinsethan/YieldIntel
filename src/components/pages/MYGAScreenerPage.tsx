"use client";

import { useState, useMemo } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { C } from "@/lib/tokens";
import { MYGA_PRODUCTS, AM_BEST_RATINGS, MYGA_TERMS, type MYGAProduct } from "@/lib/myga-data";
import { Card } from "@/components/ui/Card";
import { SectionTitle } from "@/components/ui/SectionTitle";
import { Label } from "@/components/ui/Label";
import { Select } from "@/components/ui/Input";
import { Pill } from "@/components/ui/Pill";

const fmtUSD = (n: number) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(n);

function amBestColor(rating: string): string {
  if (rating === "A++" || rating === "A+") return C.green;
  if (rating === "A"   || rating === "A-") return C.blue;
  return C.amber;
}

function SortIcon({ field, sortKey, dir }: { field: string; sortKey: string; dir: "asc" | "desc" }) {
  if (field !== sortKey) return <span style={{ color: C.textDim, fontSize: 9 }}> ⇅</span>;
  return <span style={{ color: C.blue, fontSize: 9 }}> {dir === "asc" ? "↑" : "↓"}</span>;
}

function DetailPanel({ product, onClose }: { product: MYGAProduct; onClose: () => void }) {
  const hypothetical = Array.from({ length: product.term + 1 }, (_, i) => ({
    year: `Y${i}`,
    value: Math.round(100_000 * Math.pow(1 + product.rate / 100, i)),
  }));

  return (
    <div style={{ position: "fixed", top: 0, right: 0, width: 420, height: "100vh", background: C.surface, borderLeft: `1px solid ${C.border}`, zIndex: 50, overflowY: "auto", boxShadow: "-4px 0 24px rgba(11,28,46,0.12)" }}>
      <div style={{ padding: "20px 24px", borderBottom: `1px solid ${C.border}`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <div style={{ color: C.textDim, fontSize: 11, fontFamily: "monospace", fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase" }}>{product.carrier}</div>
          <div style={{ color: C.navy, fontSize: 16, fontWeight: 800 }}>{product.product}</div>
        </div>
        <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: C.textDim, fontSize: 20, padding: 4 }}>✕</button>
      </div>

      <div style={{ padding: "20px 24px" }}>
        {/* Key metrics */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 20 }}>
          {[
            { label: "Rate",          value: `${product.rate.toFixed(2)}%`,        color: C.green  },
            { label: "Term",          value: `${product.term} Years`,              color: C.navy   },
            { label: "AM Best",       value: product.amBest,                       color: amBestColor(product.amBest) },
            { label: "Bonus",         value: product.bonus > 0 ? `${product.bonus}%` : "None", color: product.bonus > 0 ? C.teal : C.textMid },
            { label: "MVA",           value: product.mva ? "Yes" : "No",           color: product.mva ? C.amber : C.green },
            { label: "Min Premium",   value: fmtUSD(product.minPremium),           color: C.textMid },
          ].map(m => (
            <div key={m.label} style={{ background: C.bg, borderRadius: 10, padding: "12px 14px", border: `1px solid ${C.border}` }}>
              <div style={{ color: C.textDim, fontSize: 10, fontFamily: "monospace", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 4 }}>{m.label}</div>
              <div style={{ color: m.color, fontSize: 15, fontWeight: 800, fontFamily: "monospace" }}>{m.value}</div>
            </div>
          ))}
        </div>

        {/* Surrender schedule */}
        <div style={{ marginBottom: 20 }}>
          <div style={{ color: C.textMid, fontSize: 11, fontFamily: "monospace", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 10, fontWeight: 700 }}>Surrender Schedule</div>
          <div style={{ display: "flex", gap: 6 }}>
            {product.surrenderSchedule.map((pct, i) => (
              <div key={i} style={{ flex: 1, textAlign: "center" }}>
                <div style={{ background: `${C.red}${Math.round((pct / 12) * 255).toString(16).padStart(2, "0")}`, borderRadius: 6, padding: "8px 4px", marginBottom: 4 }}>
                  <div style={{ color: C.red, fontSize: 12, fontWeight: 700, fontFamily: "monospace" }}>{pct}%</div>
                </div>
                <div style={{ color: C.textDim, fontSize: 9, fontFamily: "monospace" }}>Yr {i + 1}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Premium bands */}
        <div style={{ marginBottom: 20 }}>
          <div style={{ color: C.textMid, fontSize: 11, fontFamily: "monospace", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 10, fontWeight: 700 }}>Premium Bands</div>
          {product.premiumBands.map((band, i) => (
            <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 12px", background: C.bg, borderRadius: 8, marginBottom: 6, border: `1px solid ${C.border}` }}>
              <span style={{ color: C.textMid, fontSize: 12 }}>
                {fmtUSD(band.min)} – {band.max ? fmtUSD(band.max) : "Unlimited"}
              </span>
              <span style={{ color: C.green, fontFamily: "monospace", fontWeight: 800, fontSize: 14 }}>{band.rate.toFixed(2)}%</span>
            </div>
          ))}
        </div>

        {/* Growth chart */}
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
        {product.notes && (
          <div style={{ background: C.amberDim, borderRadius: 10, padding: "12px 14px", border: `1px solid ${C.amber}22` }}>
            <div style={{ color: C.amber, fontSize: 10, fontFamily: "monospace", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 4 }}>Advisor Notes</div>
            <div style={{ color: C.textMid, fontSize: 12, lineHeight: 1.6 }}>{product.notes}</div>
          </div>
        )}

        {/* Disclaimer */}
        <div style={{ marginTop: 16, padding: "10px 12px", background: C.surfaceHi, borderRadius: 8, border: `1px solid ${C.border}` }}>
          <div style={{ color: C.textDim, fontSize: 10, lineHeight: 1.6 }}>
            Rates are indicative and subject to change without notice. Verify current rates with carrier before presenting to clients. This is a research tool, not a recommendation.
          </div>
        </div>
      </div>
    </div>
  );
}

type SortKey = "rate" | "term" | "carrier" | "amBest" | "minPremium" | "bonus";

export function MYGAScreenerPage() {
  const [filters, setFilters] = useState({
    carrier: "All",
    term: "All",
    minAmBest: "All",
    mva: "All",
    bonus: "All",
    minRate: 0,
    maxPremium: 0,
  });
  const [sortKey, setSortKey]   = useState<SortKey>("rate");
  const [sortDir, setSortDir]   = useState<"asc" | "desc">("desc");
  const [selected, setSelected] = useState<MYGAProduct | null>(null);

  const carriers = ["All", ...new Set(MYGA_PRODUCTS.map(p => p.carrier))];

  const RATING_ORDER = ["A++", "A+", "A", "A-", "B++", "B+"];

  const filtered = useMemo(() => {
    const minRatingIdx = filters.minAmBest === "All" ? 999 : RATING_ORDER.indexOf(filters.minAmBest);
    return MYGA_PRODUCTS.filter(p => {
      if (filters.carrier !== "All" && p.carrier !== filters.carrier) return false;
      if (filters.term !== "All" && p.term !== Number(filters.term)) return false;
      if (filters.minAmBest !== "All" && RATING_ORDER.indexOf(p.amBest) > minRatingIdx) return false;
      if (filters.mva === "No"  && p.mva)  return false;
      if (filters.mva === "Yes" && !p.mva) return false;
      if (filters.bonus === "Yes" && p.bonus === 0) return false;
      return true;
    }).sort((a, b) => {
      let av: string | number, bv: string | number;
      if (sortKey === "amBest") {
        av = RATING_ORDER.indexOf(a.amBest);
        bv = RATING_ORDER.indexOf(b.amBest);
      } else {
        av = a[sortKey] as number;
        bv = b[sortKey] as number;
      }
      return sortDir === "asc" ? (av > bv ? 1 : -1) : (av < bv ? 1 : -1);
    });
  }, [filters, sortKey, sortDir]);

  const handleSort = (key: SortKey) => {
    if (sortKey === key) setSortDir(d => d === "asc" ? "desc" : "asc");
    else { setSortKey(key); setSortDir("desc"); }
  };

  const thStyle: React.CSSProperties = { color: C.textDim, fontWeight: 700, textAlign: "left", padding: "10px 14px", fontSize: 11, letterSpacing: "0.06em", textTransform: "uppercase", fontFamily: "monospace", cursor: "pointer", userSelect: "none", whiteSpace: "nowrap" };

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ color: C.navy, fontSize: 24, fontWeight: 800, letterSpacing: "-0.03em", margin: 0 }}>MYGA Rate Screener</h1>
        <div style={{ color: C.textMid, fontSize: 13, marginTop: 4 }}>
          Multi-year guaranteed annuity rates · {filtered.length} of {MYGA_PRODUCTS.length} products · Updated daily
        </div>
      </div>

      {/* Filter bar */}
      <Card style={{ marginBottom: 16 }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 16 }}>
          <div>
            <Label>Carrier</Label>
            <Select value={filters.carrier} onChange={v => setFilters(f => ({ ...f, carrier: v }))}
              options={carriers.map(c => ({ value: c, label: c }))} />
          </div>
          <div>
            <Label>Term</Label>
            <Select value={filters.term} onChange={v => setFilters(f => ({ ...f, term: v }))}
              options={[{ value: "All", label: "All Terms" }, ...MYGA_TERMS.map(t => ({ value: String(t), label: `${t} Year` }))]} />
          </div>
          <div>
            <Label>Min AM Best</Label>
            <Select value={filters.minAmBest} onChange={v => setFilters(f => ({ ...f, minAmBest: v }))}
              options={[{ value: "All", label: "Any Rating" }, ...AM_BEST_RATINGS.map(r => ({ value: r, label: `${r} or better` }))]} />
          </div>
          <div>
            <Label>MVA</Label>
            <Select value={filters.mva} onChange={v => setFilters(f => ({ ...f, mva: v }))}
              options={[{ value: "All", label: "Any" }, { value: "No", label: "No MVA only" }, { value: "Yes", label: "MVA included" }]} />
          </div>
          <div>
            <Label>Bonus</Label>
            <Select value={filters.bonus} onChange={v => setFilters(f => ({ ...f, bonus: v }))}
              options={[{ value: "All", label: "Any" }, { value: "Yes", label: "Bonus products only" }]} />
          </div>
        </div>
      </Card>

      {/* Rate summary bar */}
      {filtered.length > 0 && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12, marginBottom: 16 }}>
          {[
            { label: "Best Rate",     value: `${Math.max(...filtered.map(p => p.rate)).toFixed(2)}%`, color: C.green  },
            { label: "Avg Rate",      value: `${(filtered.reduce((s, p) => s + p.rate, 0) / filtered.length).toFixed(2)}%`, color: C.blue },
            { label: "No-MVA Best",   value: `${Math.max(...filtered.filter(p => !p.mva).map(p => p.rate), 0).toFixed(2)}%`, color: C.teal  },
            { label: "Products Shown", value: String(filtered.length), color: C.navy },
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
        <SectionTitle sub="Click any row to view product detail, surrender schedule, and premium bands">
          Rate Comparison Table
        </SectionTitle>
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
                <th style={thStyle}>Surrender Yrs</th>
                <th style={{ ...thStyle, cursor: "default" }}></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(p => (
                <tr key={p.id}
                  onClick={() => setSelected(selected?.id === p.id ? null : p)}
                  style={{ borderBottom: `1px solid ${C.border}`, cursor: "pointer", background: selected?.id === p.id ? C.blueDim : "transparent" }}
                  onMouseEnter={e => { if (selected?.id !== p.id) e.currentTarget.style.background = C.surfaceHi; }}
                  onMouseLeave={e => { e.currentTarget.style.background = selected?.id === p.id ? C.blueDim : "transparent"; }}>
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
                  <td style={{ padding: "12px 14px", color: C.textMid, fontFamily: "monospace", fontSize: 12 }}>{p.surrenderSchedule.length} yr</td>
                  <td style={{ padding: "12px 14px" }}>
                    <span style={{ color: C.blue, fontSize: 11, fontFamily: "monospace", fontWeight: 700 }}>View →</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && (
            <div style={{ textAlign: "center", padding: 48, color: C.textMid }}>No products match current filters</div>
          )}
        </div>

        <div style={{ marginTop: 16, padding: "10px 14px", background: C.surfaceHi, borderRadius: 8, border: `1px solid ${C.border}` }}>
          <span style={{ color: C.textDim, fontSize: 10, lineHeight: 1.6 }}>
            Rates shown are indicative only. Rates are subject to change without notice and may vary by state and premium band. Verify current rates with the carrier prior to client presentation. This tool is for research purposes and does not constitute a product recommendation.
          </span>
        </div>
      </Card>

      {/* Detail panel */}
      {selected && <DetailPanel product={selected} onClose={() => setSelected(null)} />}
      {selected && <div onClick={() => setSelected(null)} style={{ position: "fixed", inset: 0, zIndex: 49 }} />}
    </div>
  );
}
