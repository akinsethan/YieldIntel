"use client";

import { useState } from "react";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from "recharts";
import { C } from "@/lib/tokens";
import { fmtUSD, fmtM, fmt, simulateRILA } from "@/lib/utils";
import { Card } from "@/components/ui/Card";
import { SectionTitle } from "@/components/ui/SectionTitle";
import { Label } from "@/components/ui/Label";
import { Input } from "@/components/ui/Input";
import { RunButton } from "@/components/ui/RunButton";
import { CustomTooltip } from "@/components/ui/CustomTooltip";

export function RILASimulatorPage() {
  const [params, setParams] = useState({ amount: 250000, cap: 12, buffer: 10, participation: 100, meanReturn: 9, volatility: 16, years: 7 });
  const [results, setResults] = useState<ReturnType<typeof simulateRILA> | null>(null);
  const set = (k: string) => (v: number) => setParams(p => ({ ...p, [k]: v }));

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ color: C.navy, fontSize: 24, fontWeight: 800, letterSpacing: "-0.03em", margin: 0 }}>RILA Monte Carlo Simulator</h1>
        <div style={{ color: C.textMid, fontSize: 13, marginTop: 4 }}>500-path simulation with lognormal index returns</div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "280px 1fr", gap: 20 }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <Card>
            <SectionTitle>Product Parameters</SectionTitle>
            {[
              { label: "Investment Amount ($)",  key: "amount",        step: 10000 },
              { label: "Cap Rate (%)",           key: "cap",           step: 0.5, min: 0,  max: 30  },
              { label: "Buffer (%)",             key: "buffer",        step: 1,   min: 0,  max: 30  },
              { label: "Participation Rate (%)", key: "participation", step: 5,   min: 50, max: 150 },
              { label: "Index Mean Return (%)",  key: "meanReturn",    step: 0.5, min: -5, max: 25  },
              { label: "Index Volatility (%)",   key: "volatility",    step: 1,   min: 1,  max: 50  },
              { label: "Term (Years)",           key: "years",         step: 1,   min: 1,  max: 20  },
            ].map(f => (
              <div key={f.key} style={{ marginBottom: 14 }}>
                <Label>{f.label}</Label>
                <Input value={params[f.key as keyof typeof params]} onChange={v => set(f.key)(v as number)} min={f.min} max={f.max} step={f.step} />
              </div>
            ))}
            <RunButton onClick={() => setResults(simulateRILA(params))} label="RUN SIMULATION" />
          </Card>

          {results && (
            <Card>
              <SectionTitle>Results Summary</SectionTitle>
              {[
                { label: "Worst Case (P10)", value: fmtUSD(results.p10), color: C.red   },
                { label: "Median (P50)",     value: fmtUSD(results.p50), color: C.amber },
                { label: "Best Case (P90)",  value: fmtUSD(results.p90), color: C.green },
              ].map(r => (
                <div key={r.label} style={{ display: "flex", justifyContent: "space-between", marginBottom: 12, paddingBottom: 12, borderBottom: `1px solid ${C.border}` }}>
                  <span style={{ color: C.textMid, fontSize: 12 }}>{r.label}</span>
                  <span style={{ color: r.color, fontFamily: "monospace", fontSize: 13, fontWeight: 700 }}>{r.value}</span>
                </div>
              ))}
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ color: C.textMid, fontSize: 12 }}>Median Total Return</span>
                <span style={{ color: C.blue, fontFamily: "monospace", fontWeight: 700 }}>{fmt((results.p50 / params.amount - 1) * 100)}%</span>
              </div>
            </Card>
          )}
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          {!results && (
            <Card style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: 420 }}>
              <div style={{ textAlign: "center" }}>
                <div style={{ fontSize: 52, marginBottom: 12, opacity: 0.3 }}>◈</div>
                <div style={{ color: C.textMid, fontSize: 14 }}>Configure parameters and run simulation</div>
                <div style={{ color: C.textDim, fontSize: 12, marginTop: 4 }}>500 Monte Carlo paths will be generated</div>
              </div>
            </Card>
          )}

          {results && (
            <>
              <Card>
                <SectionTitle sub="Worst / median / best case trajectories">Growth Projection</SectionTitle>
                <ResponsiveContainer width="100%" height={230}>
                  <LineChart data={results.growthData}>
                    <CartesianGrid strokeDasharray="3 3" stroke={C.border} vertical={false} />
                    <XAxis dataKey="year" tick={{ fill: C.textDim, fontSize: 11 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fill: C.textDim, fontSize: 11, fontFamily: "monospace" }} axisLine={false} tickLine={false} tickFormatter={fmtM} />
                    <Tooltip content={<CustomTooltip />} />
                    <Line type="monotone" dataKey="worstCase" stroke={C.red}   strokeWidth={2}   dot={false} name="Worst (P10)" />
                    <Line type="monotone" dataKey="median"    stroke={C.blue}  strokeWidth={2.5} dot={false} name="Median (P50)" />
                    <Line type="monotone" dataKey="bestCase"  stroke={C.green} strokeWidth={2}   dot={false} name="Best (P90)" />
                    <Legend wrapperStyle={{ fontSize: 11, color: C.textMid }} />
                  </LineChart>
                </ResponsiveContainer>
              </Card>

              <Card>
                <SectionTitle sub="Distribution of 500 simulated final values">Return Distribution</SectionTitle>
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={results.hist}>
                    <CartesianGrid strokeDasharray="3 3" stroke={C.border} vertical={false} />
                    <XAxis dataKey="range" tick={{ fill: C.textDim, fontSize: 9 }} axisLine={false} tickLine={false} interval={2} />
                    <YAxis tick={{ fill: C.textDim, fontSize: 11 }} axisLine={false} tickLine={false} />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar dataKey="count" name="Simulations" radius={[3, 3, 0, 0]}>
                      {results.hist.map((_, i) => (
                        <Cell key={i} fill={i < results.hist.length * 0.2 ? C.red : i < results.hist.length * 0.5 ? C.amber : C.teal} opacity={0.85} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </Card>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
