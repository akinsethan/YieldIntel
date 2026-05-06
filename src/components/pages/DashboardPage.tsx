"use client";

import { useState, useEffect } from "react";
import { AreaChart, Area, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { C } from "@/lib/tokens";
import { MOCK_CLIENTS } from "@/lib/data";
import { fmtM } from "@/lib/utils";
import { Card } from "@/components/ui/Card";
import { MetricCard } from "@/components/ui/MetricCard";
import { SectionTitle } from "@/components/ui/SectionTitle";
import { Pill } from "@/components/ui/Pill";
import { CustomTooltip } from "@/components/ui/CustomTooltip";
import type { MarketData, TreasuryData, NewsItem } from "@/app/api/market/route";

interface StatsData {
  carrierCount: number;
  productCount: number;
  rateCount: number;
  lastUpdated: string | null;
}

const sparkData = [
  { m: "Jul", aum: 2.1 }, { m: "Aug", aum: 2.3 }, { m: "Sep", aum: 2.2 }, { m: "Oct", aum: 2.5 },
  { m: "Nov", aum: 2.7 }, { m: "Dec", aum: 2.9 }, { m: "Jan", aum: 3.1 }, { m: "Feb", aum: 3.0 }, { m: "Mar", aum: 3.4 },
];

function RateEnvironmentBar({ treasury, fedRate }: { treasury: TreasuryData | null; fedRate: number | null }) {
  const rates = [
    { label: "Fed Funds",  value: fedRate,          color: C.amber  },
    { label: "1-yr",       value: treasury?.year1,  color: C.teal   },
    { label: "2-yr",       value: treasury?.year2,  color: C.blue   },
    { label: "5-yr",       value: treasury?.year5,  color: C.blue   },
    { label: "10-yr",      value: treasury?.year10, color: C.purple },
    { label: "30-yr",      value: treasury?.year30, color: C.navy   },
  ];

  const curveData = treasury ? [
    { term: "1yr",  rate: treasury.year1  },
    { term: "2yr",  rate: treasury.year2  },
    { term: "5yr",  rate: treasury.year5  },
    { term: "10yr", rate: treasury.year10 },
    { term: "20yr", rate: treasury.year20 },
    { term: "30yr", rate: treasury.year30 },
  ] : [];

  return (
    <Card>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
        <SectionTitle>Rate Environment</SectionTitle>
        {treasury?.date && (
          <span style={{ fontSize: 11, color: C.textDim, fontFamily: "monospace" }}>
            as of {new Date(treasury.date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
          </span>
        )}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
        {/* Rate badges */}
        <div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 10, marginBottom: 8 }}>
            {rates.map(({ label, value, color }) => (
              <div key={label} style={{ background: C.surfaceHi, border: `1px solid ${C.border}`, borderRadius: 10, padding: "10px 16px", minWidth: 88, textAlign: "center" }}>
                <div style={{ fontSize: 11, color: C.textDim, fontWeight: 600, marginBottom: 4 }}>{label}</div>
                <div style={{ fontSize: 18, fontWeight: 800, fontFamily: "monospace", color: value != null ? color : C.textDim }}>
                  {value != null ? `${value.toFixed(2)}%` : "—"}
                </div>
              </div>
            ))}
          </div>
          <p style={{ fontSize: 11, color: C.textDim, margin: 0, lineHeight: 1.5 }}>
            10-yr Treasury is the primary benchmark for MYGA crediting rates. Carriers typically price MYGAs at a 50–150bps spread below the 10-yr.
          </p>
        </div>

        {/* Yield curve chart */}
        <div>
          <div style={{ fontSize: 11, color: C.textDim, marginBottom: 8, fontWeight: 600 }}>YIELD CURVE</div>
          {curveData.length > 0 ? (
            <ResponsiveContainer width="100%" height={120}>
              <LineChart data={curveData} margin={{ top: 4, right: 8, bottom: 0, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={C.border} vertical={false} />
                <XAxis dataKey="term" tick={{ fill: C.textDim, fontSize: 10 }} axisLine={false} tickLine={false} />
                <YAxis
                  tick={{ fill: C.textDim, fontSize: 10, fontFamily: "monospace" }}
                  axisLine={false} tickLine={false}
                  tickFormatter={v => `${v.toFixed(1)}%`}
                  domain={["auto", "auto"]}
                  width={40}
                />
                <Tooltip
                  formatter={(v) => [`${(v as number).toFixed(2)}%`, "Yield"]}
                  contentStyle={{ fontSize: 12, fontFamily: "monospace", borderRadius: 8, border: `1px solid ${C.border}` }}
                />
                <Line type="monotone" dataKey="rate" stroke={C.blue} strokeWidth={2.5} dot={{ r: 4, fill: C.blue }} />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div style={{ height: 120, display: "flex", alignItems: "center", justifyContent: "center", color: C.textDim, fontSize: 12 }}>
              Loading yield curve…
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}

function timeSince(dateStr: string): string {
  const mins = Math.floor((Date.now() - new Date(dateStr).getTime()) / 60000);
  if (mins < 60)   return `${mins}m ago`;
  if (mins < 1440) return `${Math.floor(mins / 60)}h ago`;
  return `${Math.floor(mins / 1440)}d ago`;
}

function tagForSymbol(symbol: string): { label: string; color: string } {
  if (!symbol)              return { label: "MARKET",  color: C.blue   };
  if (symbol.includes("TLT") || symbol.includes("BND") || symbol.includes("AGG"))
                            return { label: "BONDS",   color: C.teal   };
  if (symbol.includes("SPY")) return { label: "EQUITY", color: C.green  };
  return                       { label: "RATES",    color: C.amber  };
}

function LiveNewsFeed({ news }: { news: NewsItem[] }) {
  if (news.length === 0) {
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {[0,1,2,3].map(i => (
          <div key={i} style={{ height: 48, background: C.surfaceHi, borderRadius: 8, animation: "pulse 1.5s ease-in-out infinite" }} />
        ))}
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      {news.map((item, i) => {
        const tag = tagForSymbol(item.symbol);
        return (
          <div key={i} style={{ display: "flex", gap: 10, paddingBottom: 12, borderBottom: i < news.length - 1 ? `1px solid ${C.border}` : "none" }}>
            <div style={{ display: "flex", flexDirection: "column", gap: 4, minWidth: 60 }}>
              <span style={{ color: C.textDim, fontSize: 10, fontFamily: "monospace", whiteSpace: "nowrap" }}>
                {item.published ? timeSince(item.published) : ""}
              </span>
              <Pill color={tag.color}>{tag.label}</Pill>
            </div>
            <div>
              {item.url ? (
                <a href={item.url} target="_blank" rel="noopener noreferrer"
                  style={{ color: C.text, fontSize: 12, lineHeight: 1.5, textDecoration: "none", display: "block" }}
                  onMouseEnter={e => (e.currentTarget.style.color = C.blue)}
                  onMouseLeave={e => (e.currentTarget.style.color = C.text)}>
                  {item.title}
                </a>
              ) : (
                <div style={{ color: C.textMid, fontSize: 12, lineHeight: 1.5 }}>{item.title}</div>
              )}
              <div style={{ color: C.textDim, fontSize: 10, marginTop: 2 }}>{item.source}</div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

interface DashboardPageProps {
  market?: MarketData | null;
}

export function DashboardPage({ market: marketProp }: DashboardPageProps) {
  const today = new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" });
  const [stats, setStats]   = useState<StatsData | null>(null);
  const [market, setMarket] = useState<MarketData | null>(marketProp ?? null);

  useEffect(() => {
    fetch("/api/stats").then(r => r.json()).then(setStats).catch(() => {});
    if (!marketProp) {
      fetch("/api/market").then(r => r.json()).then(setMarket).catch(() => {});
    }
  }, [marketProp]);

  const lastUpdatedLabel = stats?.lastUpdated
    ? new Date(stats.lastUpdated).toLocaleDateString("en-US", { month: "short", day: "numeric" })
    : "—";

  return (
    <div>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ color: C.navy, fontSize: 24, fontWeight: 800, letterSpacing: "-0.03em", margin: 0 }}>Advisor Overview</h1>
        <div style={{ color: C.textMid, fontSize: 13, marginTop: 4 }}>{today}</div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 16, marginBottom: 24 }}>
        <MetricCard label="Total Clients"     value={String(MOCK_CLIENTS.length)} sub="Active accounts"      change={8.3}  icon="👥" />
        <MetricCard label="Annuity Products"  value={stats ? String(stats.productCount) : "…"} sub="Live in database"  icon="🛡️" />
        <MetricCard label="Active Rates"      value={stats ? String(stats.rateCount)    : "…"} sub="Current rate rows" icon="📊" />
        <MetricCard label="Last Rate Update"  value={lastUpdatedLabel} sub={stats ? `${stats.carrierCount} carriers` : "Loading…"} icon="🔄" />
      </div>

      {/* Rate environment — full width */}
      <div style={{ marginBottom: 20 }}>
        <RateEnvironmentBar treasury={market?.treasury ?? null} fedRate={market?.fedRate ?? null} />
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
          <SectionTitle sub="Live · bonds &amp; rates">Market News</SectionTitle>
          <LiveNewsFeed news={market?.news ?? []} />
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
