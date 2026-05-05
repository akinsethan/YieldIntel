"use client";

import { useState } from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { C } from "@/lib/tokens";
import { ANNUITY_PRODUCTS } from "@/lib/data";
import { Card } from "@/components/ui/Card";
import { SectionTitle } from "@/components/ui/SectionTitle";
import { CustomTooltip } from "@/components/ui/CustomTooltip";

const COLORS = [C.blue, C.teal, C.purple, C.amber];

export function ProductComparisonPage() {
  const [selected, setSelected] = useState([ANNUITY_PRODUCTS[0].id, ANNUITY_PRODUCTS[1].id]);
  const toggle = (id: number) =>
    setSelected(s => s.includes(id) ? s.filter(x => x !== id) : s.length < 4 ? [...s, id] : s);

  const products = ANNUITY_PRODUCTS.filter(p => selected.includes(p.id));

  const projData = Array.from({ length: 7 }, (_, i) => {
    const yr = i + 1;
    const row: Record<string, string | number> = { year: `Y${yr}` };
    products.forEach(p => {
      row[p.product] = Math.round(100000 * Math.pow(1 + Math.min(0.09, p.cap / 100) * (p.participation / 100), yr));
    });
    return row;
  });

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ color: C.navy, fontSize: 24, fontWeight: 800, letterSpacing: "-0.03em", margin: 0 }}>Product Comparison</h1>
        <div style={{ color: C.textMid, fontSize: 13, marginTop: 4 }}>Select up to 4 products for side-by-side analysis</div>
      </div>

      <Card style={{ marginBottom: 20 }}>
        <SectionTitle sub="Click to toggle">Select Products</SectionTitle>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
          {ANNUITY_PRODUCTS.map(p => {
            const isSel = selected.includes(p.id);
            const idx   = selected.indexOf(p.id);
            const col   = isSel ? COLORS[idx] : C.textDim;
            return (
              <button key={p.id} onClick={() => toggle(p.id)} style={{ padding: "7px 14px", borderRadius: 8, border: `1.5px solid ${isSel ? col : C.border}`, background: isSel ? `${col}12` : "transparent", color: isSel ? col : C.textMid, fontSize: 12, fontFamily: "monospace", cursor: "pointer", fontWeight: isSel ? 700 : 400 }}>
                {p.carrier} · {p.product}
              </button>
            );
          })}
        </div>
      </Card>

      {products.length < 2 ? (
        <Card style={{ textAlign: "center", padding: 60 }}>
          <div style={{ color: C.textMid }}>Select at least 2 products to compare</div>
        </Card>
      ) : (
        <>
          <div style={{ display: "grid", gridTemplateColumns: `repeat(${products.length},1fr)`, gap: 16, marginBottom: 20 }}>
            {products.map((p, i) => (
              <Card key={p.id} style={{ borderTop: `3px solid ${COLORS[i]}` }}>
                <div style={{ color: COLORS[i], fontSize: 11, fontWeight: 700, fontFamily: "monospace", marginBottom: 2, textTransform: "uppercase", letterSpacing: "0.06em" }}>{p.carrier}</div>
                <div style={{ color: C.navy, fontSize: 15, fontWeight: 700, marginBottom: 18 }}>{p.product}</div>
                {[
                  { label: "Buffer",        value: `${p.buffer}%` },
                  { label: "Cap",           value: `${p.cap}%` },
                  { label: "Participation", value: `${p.participation}%` },
                  { label: "Term",          value: `${p.term} years` },
                  { label: "Fees",          value: p.fees },
                  { label: "Liquidity",     value: p.liquidity },
                ].map(r => (
                  <div key={r.label} style={{ display: "flex", justifyContent: "space-between", marginBottom: 10, paddingBottom: 10, borderBottom: `1px solid ${C.border}` }}>
                    <span style={{ color: C.textMid, fontSize: 12 }}>{r.label}</span>
                    <span style={{ color: C.navy, fontSize: 12, fontFamily: "monospace", fontWeight: 600 }}>{r.value}</span>
                  </div>
                ))}
                <div style={{ marginTop: 8 }}>
                  <div style={{ color: C.textDim, fontSize: 11, marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.06em", fontFamily: "monospace" }}>Downside Protection</div>
                  <div style={{ background: C.surfaceMid, borderRadius: 99, height: 7 }}>
                    <div style={{ width: `${(p.buffer / 30) * 100}%`, height: "100%", background: `linear-gradient(90deg,${COLORS[i]}88,${COLORS[i]})`, borderRadius: 99 }} />
                  </div>
                  <div style={{ color: COLORS[i], fontSize: 11, marginTop: 4, fontFamily: "monospace", fontWeight: 700 }}>{p.buffer}% buffer</div>
                </div>
              </Card>
            ))}
          </div>

          <Card>
            <SectionTitle sub="$100,000 hypothetical assuming cap return each year">Projected Growth Comparison</SectionTitle>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={projData}>
                <CartesianGrid strokeDasharray="3 3" stroke={C.border} vertical={false} />
                <XAxis dataKey="year" tick={{ fill: C.textDim, fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: C.textDim, fontSize: 11, fontFamily: "monospace" }} axisLine={false} tickLine={false} tickFormatter={v => `$${(v / 1000).toFixed(0)}K`} />
                <Tooltip content={<CustomTooltip />} />
                {products.map((p, i) => (
                  <Line key={p.id} type="monotone" dataKey={p.product} stroke={COLORS[i]} strokeWidth={2.5} dot={{ fill: COLORS[i], r: 3 }} name={p.product} />
                ))}
                <Legend wrapperStyle={{ fontSize: 11, color: C.textMid }} />
              </LineChart>
            </ResponsiveContainer>
          </Card>
        </>
      )}
    </div>
  );
}
