"use client";

import { useState, useEffect, useMemo } from "react";
import { C } from "@/lib/tokens";
import type { Rate, Carrier, Product, ProductType } from "@/lib/types";

const PRODUCT_TYPES: ProductType[] = ["FIA", "MYGA", "RILA", "SPIA", "DIA"];
const AM_BEST_OPTS = ["A++", "A+", "A", "A-", "B++", "B+"];
const SURRENDER_OPTS = [3, 5, 7, 10];
const TYPE_COLORS: Record<string, string> = {
  FIA: C.blue, MYGA: C.teal, RILA: C.purple, SPIA: C.green, DIA: C.amber,
};

type SortKey = "carrier" | "product" | "type" | "surrender" | "cap" | "par" | "spread" | "premium" | "updated";
type SortDir  = "asc" | "desc";

interface RateWithPrev extends Rate {
  prev_cap_rate?: number | null;
  prev_par_rate?: number | null;
  updated_by_name?: string | null;
}

function fmt(v: number | null) { return v != null ? `${v.toFixed(2)}%` : "—"; }
function fmtPremium(v: number | null) { return v != null ? `$${Number(v).toLocaleString()}` : "—"; }

function freshnessTag(dateStr: string) {
  const days = Math.floor((Date.now() - new Date(dateStr).getTime()) / 86400000);
  if (days === 0) return { bg: C.greenDim, color: C.green, dot: C.green,   label: "Today"        };
  if (days <= 7)  return { bg: C.amberDim, color: C.amber, dot: C.amber,   label: `${days}d ago` };
  return              { bg: C.redDim,   color: C.red,   dot: C.red,     label: `${days}d ago` };
}

function DeltaBadge({ current, previous, label }: { current: number | null; previous: number | null | undefined; label: string }) {
  if (current == null || previous == null || previous === undefined) return null;
  const diff = current - previous;
  if (Math.abs(diff) < 0.001) return null;
  const up = diff > 0;
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 2,
      fontSize: 10, fontWeight: 700, fontFamily: "monospace",
      color: up ? C.green : C.red,
      background: up ? C.greenDim : C.redDim,
      borderRadius: 4, padding: "1px 5px", marginLeft: 4,
    }}>
      {up ? "▲" : "▼"} {Math.abs(diff).toFixed(2)}%
    </span>
  );
}

function SortIcon({ active, dir }: { active: boolean; dir: SortDir }) {
  return <span style={{ marginLeft: 4, opacity: active ? 1 : 0.3, fontSize: 10 }}>{active && dir === "desc" ? "▼" : "▲"}</span>;
}

function exportCSV(rows: RateWithPrev[]) {
  const headers = ["Carrier", "AM Best", "Product", "Type", "Surrender (yr)", "Index", "Cap %", "Par %", "Spread %", "Min Premium", "Effective Date"];
  const lines = rows.map(r => {
    const p = r.product as (Product & { carrier?: Carrier }) | undefined;
    return [
      p?.carrier?.name ?? "", p?.carrier?.am_best_rating ?? "",
      p?.name ?? "", p?.type ?? "", p?.surrender_years ?? "",
      r.index_name, r.cap_rate ?? "", r.par_rate ?? "", r.spread ?? "",
      p?.min_premium ?? "", r.effective_date,
    ].map(v => `"${String(v).replace(/"/g, '""')}"`).join(",");
  });
  const csv  = [headers.join(","), ...lines].join("\n");
  const blob = new Blob([csv], { type: "text/csv" });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement("a");
  a.href = url; a.download = `yieldintel-rates-${new Date().toISOString().slice(0, 10)}.csv`;
  a.click(); URL.revokeObjectURL(url);
}

export function RateDatabasePage() {
  const [rates, setRates]       = useState<RateWithPrev[]>([]);
  const [carriers, setCarriers] = useState<Carrier[]>([]);
  const [loading, setLoading]   = useState(true);
  const [sortKey, setSortKey]   = useState<SortKey>("updated");
  const [sortDir, setSortDir]   = useState<SortDir>("desc");
  const [filterType,      setFilterType]      = useState("");
  const [filterCarrier,   setFilterCarrier]   = useState("");
  const [filterAmBest,    setFilterAmBest]    = useState("");
  const [filterSurrender, setFilterSurrender] = useState("");

  useEffect(() => {
    Promise.all([
      fetch("/api/rates").then(r => r.json()),
      fetch("/api/rates?history=true").then(r => r.json()),
      fetch("/api/carriers").then(r => r.json()),
    ]).then(([current, history, c]) => {
      // Build map of product+index → previous rate for delta display
      const prevMap = new Map<string, { cap: number | null; par: number | null }>();
      (history as Rate[]).forEach(r => {
        if (r.is_current) return;
        const p = r.product as Product | undefined;
        const key = `${p?.id ?? ""}|${r.index_name}`;
        if (!prevMap.has(key)) {
          prevMap.set(key, { cap: r.cap_rate ?? null, par: r.par_rate ?? null });
        }
      });

      const withPrev: RateWithPrev[] = (current as Rate[]).map(r => {
        const p = r.product as Product | undefined;
        const key = `${p?.id ?? ""}|${r.index_name}`;
        const prev = prevMap.get(key);
        return { ...r, prev_cap_rate: prev?.cap, prev_par_rate: prev?.par };
      });

      setRates(withPrev);
      setCarriers(c);
      setLoading(false);
    });
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

  const sorted = useMemo(() => [...filtered].sort((a, b) => {
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
  }), [filtered, sortKey, sortDir]);

  const selectStyle: React.CSSProperties = {
    background: C.surface, border: `1px solid ${C.border}`, borderRadius: 8,
    padding: "8px 12px", fontSize: 12, color: C.text, outline: "none", cursor: "pointer",
    fontFamily: "inherit",
  };

  const thStyle = (key: SortKey): React.CSSProperties => ({
    padding: "10px 14px", textAlign: "left", color: sortKey === key ? C.teal : C.textDim,
    fontWeight: 600, fontSize: 11, letterSpacing: "0.04em", whiteSpace: "nowrap",
    cursor: "pointer", userSelect: "none", background: C.surfaceHi,
    borderBottom: `1px solid ${C.border}`,
  });

  return (
    <div style={{ padding: "32px 36px", maxWidth: 1400 }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 24 }}>
        <div>
          <h1 style={{ color: C.navy, fontSize: 22, fontWeight: 800, letterSpacing: "-0.03em" }}>Live Rate Database</h1>
          <p style={{ color: C.textMid, fontSize: 13, marginTop: 4 }}>
            {loading ? "Loading…" : `${sorted.length} rate${sorted.length !== 1 ? "s" : ""} · Current only`}
          </p>
        </div>
        <button
          onClick={() => exportCSV(sorted)}
          disabled={sorted.length === 0}
          style={{ padding: "9px 18px", background: C.surface, border: `1px solid ${C.border}`, borderRadius: 9, fontSize: 13, color: sorted.length ? C.text : C.textDim, cursor: sorted.length ? "pointer" : "not-allowed", fontWeight: 600 }}
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
        <div className="table-scroll">
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
                  ["updated",   "Updated"],
                ] as [SortKey, string][]).map(([key, label]) => (
                  <th key={key} style={thStyle(key)} onClick={() => toggleSort(key)}>
                    {label}<SortIcon active={sortKey === key} dir={sortDir} />
                  </th>
                ))}
                <th style={{ ...thStyle("updated"), cursor: "default" }}>Updated By</th>
              </tr>
            </thead>
            <tbody>
              {loading && (
                <tr><td colSpan={10} style={{ padding: 60, textAlign: "center", color: C.textDim }}>Loading rates…</td></tr>
              )}
              {!loading && sorted.length === 0 && (
                <tr><td colSpan={10} style={{ padding: 60, textAlign: "center" }}>
                  <div style={{ color: C.textDim, marginBottom: 8 }}>
                    {rates.length === 0 ? "No rates in the database yet." : "No rates match your filters."}
                  </div>
                  {rates.length === 0 && (
                    <a href="/admin/rates" style={{ color: C.teal, fontSize: 13, fontWeight: 600, textDecoration: "none" }}>
                      Add rates in Admin → Rate Update
                    </a>
                  )}
                </td></tr>
              )}
              {sorted.map(r => {
                const p = r.product as (Product & { carrier?: Carrier }) | undefined;
                const fresh = freshnessTag(r.effective_date);
                return (
                  <tr key={r.id} style={{ borderBottom: `1px solid ${C.border}` }}
                    onMouseEnter={e => (e.currentTarget.style.background = C.surfaceHi)}
                    onMouseLeave={e => (e.currentTarget.style.background = "")}>
                    <td style={{ padding: "12px 14px", whiteSpace: "nowrap" }}>
                      <div style={{ fontWeight: 600, color: C.text }}>{p?.carrier?.name ?? "—"}</div>
                      {p?.carrier?.am_best_rating && (
                        <div style={{ fontSize: 11, color: C.green, fontWeight: 700, marginTop: 1 }}>{p.carrier.am_best_rating}</div>
                      )}
                    </td>
                    <td style={{ padding: "12px 14px" }}>
                      <div style={{ color: C.text }}>{p?.name ?? "—"}</div>
                      <div style={{ fontSize: 11, color: C.textDim, marginTop: 1 }}>{r.index_name}</div>
                    </td>
                    <td style={{ padding: "12px 14px" }}>
                      <span style={{ background: (TYPE_COLORS[p?.type ?? ""] ?? C.border) + "22", color: TYPE_COLORS[p?.type ?? ""] ?? C.textDim, borderRadius: 5, padding: "2px 8px", fontSize: 11, fontWeight: 700 }}>
                        {p?.type ?? "—"}
                      </span>
                    </td>
                    <td style={{ padding: "12px 14px", color: C.textMid, textAlign: "center", fontFamily: "var(--font-mono)" }}>
                      {p?.surrender_years != null ? `${p.surrender_years} yr` : "—"}
                    </td>
                    <td style={{ padding: "12px 14px", fontFamily: "var(--font-mono)", fontWeight: 700, color: r.cap_rate ? C.navy : C.textDim, textAlign: "right", whiteSpace: "nowrap" }}>
                      {fmt(r.cap_rate)}
                      <DeltaBadge current={r.cap_rate} previous={r.prev_cap_rate} label="cap" />
                    </td>
                    <td style={{ padding: "12px 14px", fontFamily: "var(--font-mono)", fontWeight: 700, color: r.par_rate ? C.navy : C.textDim, textAlign: "right", whiteSpace: "nowrap" }}>
                      {fmt(r.par_rate)}
                      <DeltaBadge current={r.par_rate} previous={r.prev_par_rate} label="par" />
                    </td>
                    <td style={{ padding: "12px 14px", fontFamily: "var(--font-mono)", color: r.spread ? C.navy : C.textDim, textAlign: "right" }}>
                      {fmt(r.spread)}
                    </td>
                    <td style={{ padding: "12px 14px", fontFamily: "var(--font-mono)", color: C.textMid, fontSize: 12, textAlign: "right" }}>
                      {fmtPremium(p?.min_premium ?? null)}
                    </td>
                    <td style={{ padding: "12px 14px", textAlign: "right" }}>
                      <span style={{ background: fresh.bg, color: fresh.color, borderRadius: 5, padding: "3px 8px", fontSize: 11, fontWeight: 700, display: "inline-flex", alignItems: "center", gap: 4 }}>
                        <span style={{ width: 6, height: 6, borderRadius: "50%", background: fresh.dot, display: "inline-block" }} />
                        {fresh.label}
                      </span>
                    </td>
                    <td style={{ padding: "12px 14px", color: C.textDim, fontSize: 11 }}>
                      {r.updated_by ?? "—"}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {!loading && sorted.length > 0 && (
          <div style={{ padding: "10px 16px", borderTop: `1px solid ${C.border}`, fontSize: 11, color: C.textDim }}>
            Rate information is for research purposes only. Rates are subject to change without notice. Verify current rates directly with the carrier before client placement.
          </div>
        )}
      </div>
    </div>
  );
}
