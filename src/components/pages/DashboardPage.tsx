"use client";

import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { C } from "@/lib/tokens";
import { MOCK_CLIENTS, MARKET_UPDATES } from "@/lib/data";
import { fmtM } from "@/lib/utils";
import { Card } from "@/components/ui/Card";
import { MetricCard } from "@/components/ui/MetricCard";
import { SectionTitle } from "@/components/ui/SectionTitle";
import { Pill } from "@/components/ui/Pill";
import { CustomTooltip } from "@/components/ui/CustomTooltip";

const sparkData = [
  { m: "Jul", aum: 2.1 }, { m: "Aug", aum: 2.3 }, { m: "Sep", aum: 2.2 }, { m: "Oct", aum: 2.5 },
  { m: "Nov", aum: 2.7 }, { m: "Dec", aum: 2.9 }, { m: "Jan", aum: 3.1 }, { m: "Feb", aum: 3.0 }, { m: "Mar", aum: 3.4 },
];

export function DashboardPage() {
  return (
    <div>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ color: C.navy, fontSize: 24, fontWeight: 800, letterSpacing: "-0.03em", margin: 0 }}>Advisor Overview</h1>
        <div style={{ color: C.textMid, fontSize: 13, marginTop: 4 }}>Wednesday, March 12, 2026 · Q1 2026</div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 16, marginBottom: 24 }}>
        <MetricCard label="Total Clients"     value="142"   sub="Active accounts"      change={8.3}   icon="👥" />
        <MetricCard label="Assets Analyzed"   value="$3.4B" sub="All portfolios"        change={12.7}  icon="📊" />
        <MetricCard label="Annuity Products"  value="10"    sub="Live in database"      change={2.1}   icon="🛡️" />
        <MetricCard label="Avg. Return Proj." value="7.2%"  sub="Blended weighted avg"  change={-0.3}  icon="📈" />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 20, marginBottom: 20 }}>
        <Card>
          <SectionTitle sub="9-month trailing AUM">Assets Under Management</SectionTitle>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={sparkData}>
              <defs>
                <linearGradient id="aumGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor={C.blue} stopOpacity={0.15} />
                  <stop offset="95%" stopColor={C.blue} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke={C.border} vertical={false} />
              <XAxis dataKey="m" tick={{ fill: C.textDim, fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: C.textDim, fontSize: 11, fontFamily: "monospace" }} axisLine={false} tickLine={false} tickFormatter={v => `$${v}B`} />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="aum" stroke={C.blue} strokeWidth={2.5} fill="url(#aumGrad)" name="AUM ($B)" />
            </AreaChart>
          </ResponsiveContainer>
        </Card>

        <Card>
          <SectionTitle sub="Live feed">Market Updates</SectionTitle>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {MARKET_UPDATES.map((u, i) => (
              <div key={i} style={{ display: "flex", gap: 10, paddingBottom: 12, borderBottom: i < MARKET_UPDATES.length - 1 ? `1px solid ${C.border}` : "none" }}>
                <div style={{ display: "flex", flexDirection: "column", gap: 4, minWidth: 56 }}>
                  <span style={{ color: C.textDim, fontSize: 10, fontFamily: "monospace" }}>{u.time}</span>
                  <Pill color={u.tag === "FED" ? C.amber : u.tag === "ANNUITY" ? C.purple : u.tag === "EQUITY" ? C.green : C.blue}>{u.tag}</Pill>
                </div>
                <div style={{ color: C.textMid, fontSize: 12, lineHeight: 1.6 }}>{u.msg}</div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <Card>
        <SectionTitle sub="All active advisory clients">Client Overview</SectionTitle>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
          <thead>
            <tr style={{ borderBottom: `2px solid ${C.border}` }}>
              {["Client", "Age", "Ret. Age", "Assets", "Annual Contrib.", "Risk", "Status"].map(h => (
                <th key={h} style={{ color: C.textDim, fontWeight: 700, textAlign: "left", padding: "8px 12px", fontSize: 11, letterSpacing: "0.06em", textTransform: "uppercase", fontFamily: "monospace" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {MOCK_CLIENTS.map(c => (
              <tr key={c.id} style={{ borderBottom: `1px solid ${C.border}` }}
                onMouseEnter={e => (e.currentTarget.style.background = C.surfaceHi)}
                onMouseLeave={e => (e.currentTarget.style.background = "transparent")}>
                <td style={{ padding: "11px 12px", color: C.navy, fontWeight: 600 }}>{c.name}</td>
                <td style={{ padding: "11px 12px", color: C.textMid, fontFamily: "monospace" }}>{c.age}</td>
                <td style={{ padding: "11px 12px", color: C.textMid, fontFamily: "monospace" }}>{c.retirementAge}</td>
                <td style={{ padding: "11px 12px", color: C.green, fontFamily: "monospace", fontWeight: 600 }}>{fmtM(c.assets)}</td>
                <td style={{ padding: "11px 12px", color: C.textMid, fontFamily: "monospace" }}>{fmtM(c.contributions)}</td>
                <td style={{ padding: "11px 12px" }}><Pill color={c.risk === "Aggressive" ? C.red : c.risk === "Conservative" ? C.green : C.amber}>{c.risk}</Pill></td>
                <td style={{ padding: "11px 12px" }}><Pill color={c.status === "Excellent" ? C.green : c.status === "At Risk" ? C.red : C.blue}>{c.status}</Pill></td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
}
