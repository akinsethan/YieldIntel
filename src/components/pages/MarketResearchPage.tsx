"use client";

import { useState } from "react";
import { C } from "@/lib/tokens";
import { ANNUITY_PRODUCTS } from "@/lib/data";
import { Card } from "@/components/ui/Card";
import { SectionTitle } from "@/components/ui/SectionTitle";
import { Label } from "@/components/ui/Label";
import { Select } from "@/components/ui/Input";
import { Pill } from "@/components/ui/Pill";

export function MarketResearchPage() {
  const [filters, setFilters] = useState({ carrier: "All", minBuffer: 0, minCap: 0, maxTerm: 99 });
  const setF = (k: string) => (v: string | number) => setFilters(f => ({ ...f, [k]: v }));

  const carriers = ["All", ...new Set(ANNUITY_PRODUCTS.map(p => p.carrier))];
  const filtered = ANNUITY_PRODUCTS.filter(p =>
    (filters.carrier === "All" || p.carrier === filters.carrier) &&
    p.buffer >= filters.minBuffer && p.cap >= filters.minCap && p.term <= filters.maxTerm
  );

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ color: C.navy, fontSize: 24, fontWeight: 800, letterSpacing: "-0.03em", margin: 0 }}>Annuity Market Research</h1>
        <div style={{ color: C.textMid, fontSize: 13, marginTop: 4 }}>Live product database · {filtered.length} products shown</div>
      </div>

      <Card style={{ marginBottom: 16 }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 16 }}>
          {[
            { label: "Carrier",    key: "carrier",   opts: carriers.map(c => ({ value: c, label: c })) },
            { label: "Min Buffer", key: "minBuffer", opts: [{ value: 0, label: "Any Buffer" }, { value: 10, label: "10% or more" }, { value: 15, label: "15% or more" }, { value: 20, label: "20% or more" }] },
            { label: "Min Cap",    key: "minCap",    opts: [{ value: 0, label: "Any Cap"    }, { value: 10, label: "10% or more" }, { value: 12, label: "12% or more" }, { value: 14, label: "14% or more" }] },
            { label: "Max Term",   key: "maxTerm",   opts: [{ value: 99, label: "Any Term" }, { value: 3, label: "3 Years" }, { value: 6, label: "6 Years" }] },
          ].map(f => (
            <div key={f.key}>
              <Label>{f.label}</Label>
              <Select
                value={filters[f.key as keyof typeof filters]}
                onChange={v => setF(f.key)(isNaN(Number(v)) ? v : Number(v))}
                options={f.opts.map(o => ({ value: o.value, label: o.label }))}
              />
            </div>
          ))}
        </div>
      </Card>

      <Card>
        <SectionTitle>{filtered.length} Products</SectionTitle>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
          <thead>
            <tr style={{ borderBottom: `2px solid ${C.border}` }}>
              {["Carrier", "Product", "Buffer", "Cap", "Participation", "Term", "Liquidity", "Fees"].map(h => (
                <th key={h} style={{ color: C.textDim, fontWeight: 700, textAlign: "left", padding: "8px 14px", fontSize: 11, letterSpacing: "0.06em", textTransform: "uppercase", fontFamily: "monospace" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map(p => (
              <tr key={p.id} style={{ borderBottom: `1px solid ${C.border}` }}
                onMouseEnter={e => (e.currentTarget.style.background = C.surfaceHi)}
                onMouseLeave={e => (e.currentTarget.style.background = "transparent")}>
                <td style={{ padding: "11px 14px", color: C.navy, fontWeight: 600 }}>{p.carrier}</td>
                <td style={{ padding: "11px 14px", color: C.textMid }}>{p.product}</td>
                <td style={{ padding: "11px 14px" }}><Pill color={p.buffer >= 15 ? C.green : p.buffer >= 10 ? C.amber : C.red}>{p.buffer}%</Pill></td>
                <td style={{ padding: "11px 14px" }}><Pill color={p.cap >= 14 ? C.green : p.cap >= 12 ? C.blue : C.amber}>{p.cap}%</Pill></td>
                <td style={{ padding: "11px 14px", color: C.textMid, fontFamily: "monospace" }}>{p.participation}%</td>
                <td style={{ padding: "11px 14px", color: C.textMid, fontFamily: "monospace" }}>{p.term} yr</td>
                <td style={{ padding: "11px 14px", color: C.textMid, fontSize: 12 }}>{p.liquidity}</td>
                <td style={{ padding: "11px 14px" }}><Pill color={p.fees === "0.00%" ? C.green : C.amber}>{p.fees}</Pill></td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <div style={{ textAlign: "center", padding: 48, color: C.textMid }}>No products match current filters</div>
        )}
      </Card>
    </div>
  );
}
