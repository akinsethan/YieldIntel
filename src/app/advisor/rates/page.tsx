"use client";

import { useState, useEffect, useMemo } from "react";
import { C } from "@/lib/tokens";
import type { Rate, Carrier, Product, ProductType } from "@/lib/types";

const PRODUCT_TYPES: ProductType[] = ["FIA", "MYGA", "RILA", "SPIA", "DIA"];
const AM_BEST_OPTS = ["A++", "A+", "A", "A-", "B++", "B+"];
const SURRENDER_OPTS = [3, 5, 7, 10];
const TYPE_COLORS: Record<string, string> = { FIA: C.blue, MYGA: C.teal, RILA: C.purple, SPIA: C.green, DIA: C.amber };

type SortKey = "carrier" | "product" | "type" | "surrender" | "cap" | "par" | "spread" | "premium" | "updated";
type SortDir = "asc" | "desc";

function fmt(v: number | null) { return v != null ? `${v.toFixed(2)}%` : "—"; }
function fmtPremium(v: number | null) { return v != null ? `$${Number(v).toLocaleString()}` : "—"; }

function freshnessTag(dateStr: string) {
  const days = Math.floor((Date.now() - new Date(dateStr).getTime()) / 86400000);
  if (days === 0) return { bg: C.greenDim,  color: C.green,  label: "Today" };
  if (days <= 7)  return { bg: C.amberDim,  color: C.amber,  label: `${days}d ago` };
  return              { bg: C.redDim,    color: C.red,    label: `${days}d ago` };
}

function SortIcon({ active, dir }: { active: boolean; dir: SortDir }) {
  return <span style={{ marginLeft: 4, opacity: active ? 1 : 0.25, fontSize: 10 }}>{active && dir === "desc" ? "▼" : "▲"}</span>;
}

function exportCSV(rows: Rate[]) {
  const headers = ["Carrier","AM Best","Product","Type","Surrender (yr)","Index","Cap %","Par %","Spread %","Min Premium","Effective Date"];
  const lines = rows.map(r => {
    const p = r.product as (Product & { carrier?: Carrier }) | undefined;
    return [
      p?.carrier?.name ?? "",
      p?.carrier?.am_best_rating ?? "",
      p?.name ?? "",
      p?.type ?? "",
      p?.surrender_years ?? "",
      r.index_name,
      r.cap_rate ?? "",
      r.par_rate ?? "",
      r.spread ?? "",
      p?.min_premium ?? "",
      r.effective_date,
    ].map(v => `"${String(v).replace(/"/g, '""')}"`).join(",");
  });
  const csv = [headers.join(","), ...lines].join("\n");
  const blob = new Blob([csv], { type: "text/csv" });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement("a");
  a.href = url; a.download = `yieldintel-rates-${new Date().toISOString().slice(0,10)}.csv`;
  a.click(); URL.revokeObjectURL(url);
}

export default function AdvisorRatesPage() {
  const [rates, setRates]           = useState<Rate[]>([]);
  const [carriers, setCarriers]     = useState<Carrier[]>([]);
  const [loading, setLoading]       = useState(true);
  const [sortKey, setSortKey]       = useState<SortKey>("updated");
  const [sortDir, setSortDir]       = useState<SortDir>("desc");
  const [filterType,     setFilterType]     = useState("");
  const [filterCarrier,  setFilterCarrier]  = useState("");
  const [filterAmBest,   setFilterAmBest]   = useState("");
  const [filterSurrender,setFilterSurrender]= useState("");

  useEffect(() => {
    Promise.all([
      fetch("/api/rates").then(r => r.json()),
      fetch("/api/carriers").then(r => r.json()),
    ]).then(([r, c]) => { setRates(r); setCarriers(c); setLoading(false); });
  }, []);

  function toggleSort(key: SortKey) {
    if (sortKey === key) setSortDir(d => d === "asc" ? "desc" : "asc");
    else { setSortKey(key); setSortDir("desc"); }
  }

  const filtered = useMemo(() => {
    let rows = rates;
    if (filterType)      rows = rows.filter(r => (r.product as Product)?.type === filterType);
    if (filterCarrier)   rows = rows.filter(r => ((r.product as Product & { carrier?: Carrier })?.carrier?.id) === filterCarrier);
    if (filterAmBest)    rows = rows.filter(r => ((r.product as Product & { carrier?: Carrier })?.carrier?.am_best_rating) === filterAmBest);
    if (filterSurrender) rows = rows.filter(r => String((r.product as Product)?.surrender_years) === filterSurrender);
    return rows;
  }, [rates, filterType, filterCarrier, filterAmBest, filterSurrender]);

  const sorted = useMemo(() => {
    return [...filtered].sort((a, b) => {
      const pa = a.product as (Product & { carrier?: Carrier }) | undefined;
      const pb = b.product as (Product & { carrier?: Carrier }) | undefined;
      let av: string | number | null = null;
      let bv: string | number | null = null;
      switch (sortKey) {
        case "carrier":   av = pa?.carrier?.name ?? ""; bv = pb?.carrier?.name ?? ""; break;
        case "product":   av = pa?.name ?? ""; bv = pb?.name ?? ""; break;
        case "type":      av = pa?.type ?? ""; bv = pb?.type ?? ""; break;
        case "surrender": av = pa?.surrender_years ?? 0; bv = pb?.surrender_years ?? 0; break;
        case "cap":       av = a.cap_rate ?? -1; bv = b.cap_rate ?? -1; break;
        case "par":       av = a.par_rate ?? -1; bv = b.par_rate ?? -1; break;
        case "spread":    av = a.spread ?? -1; bv = b.spread ?? -1; break;
        case "premium":   av = pa?.min_premium ?? 0; bv = pb?.min_premium ?? 0; break;
        case "updated":   av = a.effective_date; bv = b.effective_date; break;
      }
      if (av === null) return 1; if (bv === null) return -1;
      const cmp = av < bv ? -1 : av > bv ? 1 : 0;
      return sortDir === "asc" ? cmp : -cmp;
    });
  }, [filtered, sortKey, sortDir]);

  const selectStyle = { background: C.surface, border: `1px solid ${C.border}`, borderRadius: 8, padding: "8px 12px", fontSize: 12, color: C.text, outline: "none", cursor: "pointer" };

  const thStyle = (key: SortKey): React.CSSProperties => ({
    padding: "10px 14px", textAlign: "left", color: C.textDim, fontWeight: 600,
    fontSize: 11, letterSpacing: "0.04em", whiteSpace: "nowrap", cursor: "pointer",
    userSelect: "none", background: C.surfaceHi,
    borderBottom: `1px solid ${C.border}`,
  });

  return (
    <div style={{ padding: "36px 40px" }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 24 }}>
        <div>
          <h1 style={{ color: C.navy, fontSize: 24, fontWeight: 800, letterSpacing: "-0.03em", margin: 0 }}>Live Rate Database</h1>
          <p style={{ color: C.textMid, fontSize: 13, marginTop: 4 }}>
            {loading ? "Loading…" : `${sorted.length} rate${sorted.length !== 1 ? "s" : ""} · Current only`}
          </p>
        </div>
        <button
          onClick={() => exportCSV(sorted)}
          disabled={sorted.length === 0}
          style={{ padding: "10px 20px", background: sorted.length ? C.surface : C.surfaceHi, border: `1px solid ${C.border}`, borderRadius: 9, fontSize: 13, color: sorted.length ? C.text : C.textDim, cursor: sorted.length ? "pointer" : "not-allowed", fontWeight: 600 }}
        >
          ↓ Export CSV
        </button>
      </div>

      {/* Filters */}
      <div style={{ display: "flex", gap: 10, marginBottom: 20, flexWrap: "wrap" }}>
        <select value={filterType} onChange={e => setFilterType(e.target.value)} style={selectStyle}>
          <option value="">All types</option>
          {PRODUCT_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
        </select>
        <select value={filterCarrier} onChange={e => setFilterCarrier(e.target.value)} style={selectStyle}>
          <option value="">All carriers</option>
          {carriers.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
        <select value={filterAmBest} onChange={e => setFilterAmBest(e.target.value)} style={selectStyle}>
          <option value="">All AM Best</option>
          {AM_BEST_OPTS.map(r => <option key={r} value={r}>{r}</option>)}
        </select>
        <select value={filterSurrender} onChange={e => setFilterSurrender(e.target.value)} style={selectStyle}>
          <option value="">Any surrender</option>
          {SURRENDER_OPTS.map(y => <option key={y} value={y}>{y}-year</option>)}
        </select>
        {(filterType || filterCarrier || filterAmBest || filterSurrender) && (
          <button onClick={() => { setFilterType(""); setFilterCarrier(""); setFilterAmBest(""); setFilterSurrender(""); }}
            style={{ padding: "8px 14px", background: "none", border: `1px solid ${C.border}`, borderRadius: 8, fontSize: 12, color: C.textDim, cursor: "pointer" }}>
            Clear ✕
          </button>
        )}
      </div>

      {/* Table */}
      <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 14, overflow: "hidden" }}>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
            <thead>
              <tr>
                {([
                  ["carrier",   "Carrier"],
                  ["product",   "Product"],
                  ["type",      "Type"],
                  ["surrender", "Surrender"],
                  ["cap",       "Cap Rate"],
                  ["par",       "Par Rate"],
                  ["spread",    "Spread"],
                  ["premium",   "Min Premium"],
                  ["updated",   "Last Updated"],
                ] as [SortKey, string][]).map(([key, label]) => (
                  <th key={key} style={thStyle(key)} onClick={() => toggleSort(key)}>
                    {label}<SortIcon active={sortKey === key} dir={sortDir} />
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading && (
                <tr><td colSpan={9} style={{ padding: 60, textAlign: "center", color: C.textDim }}>Loading rates…</td></tr>
              )}
              {!loading && sorted.length === 0 && (
                <tr><td colSpan={9} style={{ padding: 60, textAlign: "center", color: C.textDim }}>
                  No rates match your filters. {rates.length === 0 ? "Add rates in Admin → Rate Update." : "Try adjusting your filters."}
                </td></tr>
              )}
              {sorted.map(r => {
                const p = r.product as (Product & { carrier?: Carrier }) | undefined;
                const fresh = freshnessTag(r.effective_date);
                return (
                  <tr key={r.id} style={{ borderBottom: `1px solid ${C.border}` }}
                    onMouseEnter={e => (e.currentTarget.style.background = C.surfaceHi)}
                    onMouseLeave={e => (e.currentTarget.style.background = "")}>
                    <td style={{ padding: "12px 14px", fontWeight: 600, color: C.text, whiteSpace: "nowrap" }}>
                      <div>{p?.carrier?.name ?? "—"}</div>
                      {p?.carrier?.am_best_rating && (
                        <div style={{ fontSize: 11, color: C.green, fontWeight: 700, marginTop: 1 }}>{p.carrier.am_best_rating}</div>
                      )}
                    </td>
                    <td style={{ padding: "12px 14px", color: C.text }}>
                      <div>{p?.name ?? "—"}</div>
                      <div style={{ fontSize: 11, color: C.textDim, marginTop: 1 }}>{r.index_name}</div>
                    </td>
                    <td style={{ padding: "12px 14px" }}>
                      <span style={{ background: (TYPE_COLORS[p?.type ?? ""] ?? C.border) + "22", color: TYPE_COLORS[p?.type ?? ""] ?? C.textDim, borderRadius: 5, padding: "2px 8px", fontSize: 11, fontWeight: 700 }}>
                        {p?.type ?? "—"}
                      </span>
                    </td>
                    <td style={{ padding: "12px 14px", color: C.textMid, textAlign: "center" }}>
                      {p?.surrender_years != null ? `${p.surrender_years} yr` : "—"}
                    </td>
                    <td style={{ padding: "12px 14px", fontFamily: "monospace", fontWeight: 700, color: r.cap_rate ? C.navy : C.textDim, textAlign: "right" }}>
                      {fmt(r.cap_rate)}
                    </td>
                    <td style={{ padding: "12px 14px", fontFamily: "monospace", fontWeight: 700, color: r.par_rate ? C.navy : C.textDim, textAlign: "right" }}>
                      {fmt(r.par_rate)}
                    </td>
                    <td style={{ padding: "12px 14px", fontFamily: "monospace", color: r.spread ? C.navy : C.textDim, textAlign: "right" }}>
                      {fmt(r.spread)}
                    </td>
                    <td style={{ padding: "12px 14px", fontFamily: "monospace", color: C.textMid, fontSize: 12, textAlign: "right" }}>
                      {fmtPremium(p?.min_premium ?? null)}
                    </td>
                    <td style={{ padding: "12px 14px", textAlign: "right" }}>
                      <span style={{ background: fresh.bg, color: fresh.color, borderRadius: 5, padding: "3px 8px", fontSize: 11, fontWeight: 600 }}>
                        {fresh.label}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {!loading && sorted.length > 0 && (
          <div style={{ padding: "12px 16px", borderTop: `1px solid ${C.border}`, fontSize: 11, color: C.textDim }}>
            This rate information is for research purposes only and does not constitute a product recommendation. Rates are subject to change without notice. Verify current rates directly with the carrier before client placement.
          </div>
        )}
      </div>
    </div>
  );
}
