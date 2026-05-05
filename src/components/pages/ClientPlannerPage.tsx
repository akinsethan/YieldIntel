"use client";

import { useState, useMemo } from "react";
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine } from "recharts";
import { C } from "@/lib/tokens";
import { fmtM, generateRetirementData } from "@/lib/utils";
import { Card } from "@/components/ui/Card";
import { SectionTitle } from "@/components/ui/SectionTitle";
import { Label } from "@/components/ui/Label";
import { Input, Select } from "@/components/ui/Input";
import { Pill } from "@/components/ui/Pill";
import { CustomTooltip } from "@/components/ui/CustomTooltip";

export function ClientPlannerPage() {
  const [form, setForm] = useState({ age: 52, retirementAge: 67, assets: 850000, contributions: 24000, risk: "Moderate" });
  const set = (k: string) => (v: string | number) => setForm(f => ({ ...f, [k]: v }));

  const projData  = useMemo(() => generateRetirementData(form.age, form.retirementAge, form.assets, form.contributions, form.risk), [form]);
  const retVal    = projData.find(d => d.year === form.retirementAge)?.base ?? 0;
  const incomeGap = Math.max(0, 120_000 - retVal * 0.04);
  const annuityRec = incomeGap > 30_000 ? "High" : incomeGap > 10_000 ? "Moderate" : "Low";

  const gapData = Array.from({ length: form.retirementAge - form.age + 20 }, (_, i) => {
    const yr = form.age + i;
    if (yr < form.retirementAge) return null;
    const port = projData.find(d => d.year === yr);
    return { year: yr, income: Math.round((port?.base ?? 0) * 0.04), gap: Math.max(0, 120_000 - Math.round((port?.base ?? 0) * 0.04)) };
  }).filter(Boolean);

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ color: C.navy, fontSize: 24, fontWeight: 800, letterSpacing: "-0.03em", margin: 0 }}>Client Retirement Planner</h1>
        <div style={{ color: C.textMid, fontSize: 13, marginTop: 4 }}>Monte Carlo projection and income gap analysis</div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "280px 1fr", gap: 20 }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <Card>
            <SectionTitle>Client Parameters</SectionTitle>
            {[
              { label: "Current Age",               key: "age",           min: 25, max: 80 },
              { label: "Retirement Age",             key: "retirementAge", min: 50, max: 85 },
              { label: "Current Assets ($)",         key: "assets",        min: 0,  max: 10000000, step: 10000 },
              { label: "Annual Contributions ($)",   key: "contributions", min: 0,  max: 500000,   step: 1000 },
            ].map(f => (
              <div key={f.key} style={{ marginBottom: 14 }}>
                <Label>{f.label}</Label>
                <Input value={form[f.key as keyof typeof form]} onChange={set(f.key)} min={f.min} max={f.max} step={f.step} />
              </div>
            ))}
            <Label>Risk Tolerance</Label>
            <Select value={form.risk} onChange={set("risk")} options={["Conservative", "Moderate", "Aggressive"].map(o => ({ value: o, label: o }))} />
          </Card>

          <Card>
            <SectionTitle>Strategy Summary</SectionTitle>
            {[
              { label: "Projected at Retirement", value: fmtM(retVal),               color: C.navy  },
              { label: "4% Safe Withdrawal",      value: `${fmtM(retVal * 0.04)}/yr`, color: C.blue  },
              { label: "Income Gap vs $120K",      value: incomeGap > 0 ? `-${fmtM(incomeGap)}` : "Surplus", color: incomeGap > 0 ? C.red : C.green },
            ].map(r => (
              <div key={r.label} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12, paddingBottom: 12, borderBottom: `1px solid ${C.border}` }}>
                <span style={{ color: C.textMid, fontSize: 12 }}>{r.label}</span>
                <span style={{ color: r.color, fontFamily: "monospace", fontSize: 13, fontWeight: 700 }}>{r.value}</span>
              </div>
            ))}
            <Label>Annuity Priority</Label>
            <Pill color={annuityRec === "High" ? C.red : annuityRec === "Moderate" ? C.amber : C.green}>{annuityRec} Need</Pill>
            <div style={{ color: C.textMid, fontSize: 11, marginTop: 8, lineHeight: 1.6 }}>
              {annuityRec === "High"     && "Significant income shortfall. Consider RILA or income annuity to bridge gap."}
              {annuityRec === "Moderate" && "Moderate gap. A small income annuity could provide added security."}
              {annuityRec === "Low"      && "Portfolio likely sufficient. Annuity optional for longevity protection."}
            </div>
          </Card>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <Card>
            <SectionTitle sub="Optimistic / base / pessimistic scenarios">Retirement Projection</SectionTitle>
            <ResponsiveContainer width="100%" height={240}>
              <AreaChart data={projData}>
                <defs>
                  {([["opti", C.green], ["base", C.blue], ["pess", C.red]] as [string, string][]).map(([id, color]) => (
                    <linearGradient key={id} id={`${id}Grad`} x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%"  stopColor={color} stopOpacity={0.12} />
                      <stop offset="95%" stopColor={color} stopOpacity={0} />
                    </linearGradient>
                  ))}
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke={C.border} vertical={false} />
                <XAxis dataKey="year" tick={{ fill: C.textDim, fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: C.textDim, fontSize: 11, fontFamily: "monospace" }} axisLine={false} tickLine={false} tickFormatter={fmtM} />
                <Tooltip content={<CustomTooltip />} />
                <ReferenceLine x={form.retirementAge} stroke={C.amber} strokeDasharray="4 4" label={{ value: "Retire", fill: C.amber, fontSize: 11 }} />
                <Area type="monotone" dataKey="optimistic"  stroke={C.green} strokeWidth={2}   fill="url(#optiGrad)" name="Optimistic" />
                <Area type="monotone" dataKey="base"        stroke={C.blue}  strokeWidth={2.5} fill="url(#baseGrad)" name="Base Case" />
                <Area type="monotone" dataKey="pessimistic" stroke={C.red}   strokeWidth={2}   fill="url(#pessGrad)" name="Pessimistic" />
                <Legend wrapperStyle={{ fontSize: 11, color: C.textMid }} />
              </AreaChart>
            </ResponsiveContainer>
          </Card>

          <Card>
            <SectionTitle sub="Annual income vs $120K retirement target">Income Gap Analysis</SectionTitle>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={gapData.slice(0, 20) as { year: number; income: number; gap: number }[]}>
                <CartesianGrid strokeDasharray="3 3" stroke={C.border} vertical={false} />
                <XAxis dataKey="year" tick={{ fill: C.textDim, fontSize: 10 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: C.textDim, fontSize: 11, fontFamily: "monospace" }} axisLine={false} tickLine={false} tickFormatter={v => `$${v / 1000}K`} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="income" name="Portfolio Income" fill={C.teal} radius={[3, 3, 0, 0]} opacity={0.85} />
                <Bar dataKey="gap"    name="Income Gap"       fill={C.red}  radius={[3, 3, 0, 0]} opacity={0.6} />
                <ReferenceLine y={120000} stroke={C.amber} strokeDasharray="4 4" label={{ value: "Target $120K", fill: C.amber, fontSize: 10 }} />
                <Legend wrapperStyle={{ fontSize: 11, color: C.textMid }} />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </div>
      </div>
    </div>
  );
}
