"use client";

import { useState, useMemo, useEffect } from "react";
import {
  LineChart, Line, AreaChart, Area, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer, ReferenceLine, Cell
} from "recharts";

const ALPHA_KEY = process.env.NEXT_PUBLIC_ALPHA_VANTAGE_KEY;

async function fetchQuote(symbol: string) {
  try {
    const res = await fetch(
      `https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${symbol}&apikey=${ALPHA_KEY}`
    );
    const data = await res.json();
    const q = data["Global Quote"];
    if (!q || !q["05. price"]) return null;
    return {
      price: new Intl.NumberFormat("en-US", { minimumFractionDigits:2, maximumFractionDigits:2 }).format(parseFloat(q["05. price"])),
      change: parseFloat(q["10. change percent"].replace("%", "")).toFixed(2),
    };
  } catch {
    return null;
  }
}

// ─── DESIGN TOKENS ────────────────────────────────────────────────────────────
const C = {
  bg:          "#F8FAFC",
  surface:     "#FFFFFF",
  surfaceHi:   "#F1F5F9",
  surfaceMid:  "#EEF2F7",
  navy:        "#0B1C2E",
  blue:        "#2E86FF",
  blueDim:     "#EBF3FF",
  blueMid:     "#BFDBFE",
  teal:        "#19C6B4",
  tealDim:     "#E6FAF8",
  text:        "#0B1C2E",
  textMid:     "#475569",
  textDim:     "#94A3B8",
  border:      "#E2E8F0",
  borderHi:    "#CBD5E1",
  green:       "#059669",
  greenDim:    "#ECFDF5",
  red:         "#DC2626",
  redDim:      "#FEF2F2",
  amber:       "#D97706",
  amberDim:    "#FFFBEB",
  purple:      "#7C3AED",
  purpleDim:   "#F5F3FF",
};

// ─── MOCK DATA ────────────────────────────────────────────────────────────────
const MOCK_CLIENTS = [
  { id:1, name:"Margaret Chen",     age:58, retirementAge:65, assets:1_240_000, contributions:24_000, risk:"Moderate",     status:"On Track" },
  { id:2, name:"Robert Halverson",  age:62, retirementAge:67, assets:890_000,   contributions:18_000, risk:"Conservative", status:"At Risk"  },
  { id:3, name:"Patricia Williams", age:54, retirementAge:65, assets:2_150_000, contributions:36_000, risk:"Aggressive",   status:"Excellent"},
  { id:4, name:"James Okonkwo",     age:49, retirementAge:65, assets:640_000,   contributions:22_000, risk:"Moderate",     status:"On Track" },
];

const ANNUITY_PRODUCTS = [
  { id:1,  carrier:"Allianz Life",      product:"360 RILA",            buffer:10, cap:12.5, participation:100, term:6, liquidity:"10% Free", fees:"0.00%" },
  { id:2,  carrier:"Brighthouse",       product:"Shield Level Select", buffer:10, cap:14.0, participation:100, term:6, liquidity:"10% Free", fees:"0.00%" },
  { id:3,  carrier:"Nationwide",        product:"Peaks RILA",          buffer:15, cap:11.0, participation:100, term:6, liquidity:"10% Free", fees:"0.25%" },
  { id:4,  carrier:"Lincoln Financial", product:"Level Advantage",     buffer:10, cap:13.5, participation:100, term:3, liquidity:"10% Free", fees:"0.00%" },
  { id:5,  carrier:"Protective",        product:"Protective RILA",     buffer:20, cap:9.5,  participation:100, term:6, liquidity:"10% Free", fees:"0.10%" },
  { id:6,  carrier:"Global Atlantic",   product:"ForeStructured",      buffer:10, cap:15.0, participation:110, term:6, liquidity:"10% Free", fees:"0.00%" },
  { id:7,  carrier:"F and G",           product:"Flourish RILA",       buffer:15, cap:12.0, participation:100, term:6, liquidity:"10% Free", fees:"0.00%" },
  { id:8,  carrier:"Midland National",  product:"Endeavor RILA",       buffer:10, cap:11.5, participation:100, term:3, liquidity:"10% Free", fees:"0.15%" },
  { id:9,  carrier:"American Equity",   product:"AssetShield",         buffer:10, cap:13.0, participation:100, term:6, liquidity:"10% Free", fees:"0.00%" },
  { id:10, carrier:"Pacific Life",      product:"Pacific Odyssey",     buffer:10, cap:14.5, participation:105, term:6, liquidity:"10% Free", fees:"0.00%" },
];

const MARKET_UPDATES = [
  { time:"09:42", tag:"FED",     msg:"Fed holds rates steady; markets react positively to forward guidance" },
  { time:"08:15", tag:"EQUITY",  msg:"S&P 500 futures +0.4%; tech sector leads gains ahead of earnings" },
  { time:"07:30", tag:"RATES",   msg:"10-yr Treasury yield at 4.31%, down 5bps after jobs data revision" },
  { time:"06:55", tag:"ANNUITY", msg:"Allianz increases RILA cap rates by 50bps effective next month" },
];

const NAV_ITEMS = [
  { id:"dashboard", label:"Dashboard",       icon:"▦", children:[] },
  { id:"clients",   label:"Clients",         icon:"◉", children:[
    { id:"clientplanner", label:"Client Planner" },
  ]},
  { id:"simulators", label:"Simulators",     icon:"◈", children:[
    { id:"rila", label:"RILA Simulator" },
  ]},
  { id:"products",  label:"Products",        icon:"⊞", children:[] },
  { id:"strategy",  label:"Strategy Builder",icon:"◇", children:[] },
  { id:"research",  label:"Market Research", icon:"◎", children:[] },
  { id:"settings",  label:"Settings",        icon:"◌", children:[] },
];

// ─── HELPERS ──────────────────────────────────────────────────────────────────
const fmt    = (n: number, opts: object = {}) => new Intl.NumberFormat("en-US",{ maximumFractionDigits:1,...opts }).format(n);
const fmtUSD = (n: number) => new Intl.NumberFormat("en-US",{ style:"currency", currency:"USD", maximumFractionDigits:0 }).format(n);
const fmtM   = (n: number) => n >= 1_000_000 ? `$${fmt(n/1_000_000)}M` : `$${fmt(n/1_000)}K`;

function generateRetirementData(age: number, retirementAge: number, assets: number, contributions: number, risk: string) {
  const years = retirementAge - age + 20;
  const rate  = { Conservative:0.055, Moderate:0.075, Aggressive:0.095 }[risk] ?? 0.075;
  let base = assets, pess = assets, opti = assets;
  return Array.from({ length: years+1 }, (_,i) => {
    const yr = age + i;
    const contrib = yr >= retirementAge ? -60_000 : contributions;
    if (i > 0) {
      base = base*(1+rate)        + contrib;
      pess = pess*(1+rate-0.03)   + contrib;
      opti = opti*(1+rate+0.025)  + contrib;
    }
    return { year:yr, base:Math.max(0,Math.round(base)), pessimistic:Math.max(0,Math.round(pess)), optimistic:Math.max(0,Math.round(opti)) };
  });
}

function simulateRILA({ amount, cap, buffer, participation, meanReturn, volatility, years }: { amount: number, cap: number, buffer: number, participation: number, meanReturn: number, volatility: number, years: number }) {
  const simCount = 500;
  const finalValues: number[] = [];
  for (let s=0; s<simCount; s++) {
    let val = amount;
    for (let y=0; y<years; y++) {
      const z1=Math.random(), z2=Math.random();
      const norm = Math.sqrt(-2*Math.log(z1))*Math.cos(2*Math.PI*z2);
      const idx  = (meanReturn/100) + (volatility/100)*norm;
      let cr;
      if      (idx < -(buffer/100)) cr = idx + (buffer/100);
      else if (idx < 0)             cr = 0;
      else                          cr = Math.min(idx*(participation/100), cap/100);
      val *= (1+cr);
    }
    finalValues.push(val);
  }
  finalValues.sort((a,b)=>a-b);
  const p10 = finalValues[Math.floor(simCount*0.10)];
  const p50 = finalValues[Math.floor(simCount*0.50)];
  const p90 = finalValues[Math.floor(simCount*0.90)];
  const growthData = Array.from({ length:years+1 },(_,i) => ({
    year:`Y${i}`,
    worstCase: Math.round(amount + (p10-amount)*(i/years)),
    median:    Math.round(amount + (p50-amount)*(i/years)),
    bestCase:  Math.round(amount + (p90-amount)*(i/years)),
  }));
  const buckets=20, minV=finalValues[0], maxV=finalValues[simCount-1], step=(maxV-minV)/buckets;
  const hist = Array.from({ length:buckets },(_,i) => {
    const lo=minV+i*step, hi=lo+step;
    return { range:`$${fmt(lo/1000)}K`, count:finalValues.filter(v=>v>=lo&&v<hi).length };
  });
  return { growthData, hist, p10, p50, p90 };
}

// ─── SHARED UI ────────────────────────────────────────────────────────────────
const Card = ({ children, style={} }: { children: React.ReactNode, style?: React.CSSProperties }) => (
  <div style={{ background:C.surface, borderRadius:14, border:`1px solid ${C.border}`, padding:24, boxShadow:"0 1px 4px rgba(11,28,46,0.06)", ...style }}>
    {children}
  </div>
);

const MetricCard = ({ label, value, sub, change, icon }: { label: string, value: string, sub?: string, change?: number, icon: string }) => (
  <Card>
    <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start" }}>
      <div>
        <div style={{ color:C.textDim, fontSize:11, letterSpacing:"0.07em", textTransform:"uppercase", fontFamily:"monospace", marginBottom:8, fontWeight:600 }}>{label}</div>
        <div style={{ color:C.navy, fontSize:26, fontWeight:800, letterSpacing:"-0.03em" }}>{value}</div>
        {sub && <div style={{ color:C.textMid, fontSize:12, marginTop:3 }}>{sub}</div>}
      </div>
      <div style={{ fontSize:22 }}>{icon}</div>
    </div>
    {change !== undefined && (
      <div style={{ marginTop:12, paddingTop:12, borderTop:`1px solid ${C.border}`, display:"flex", alignItems:"center", gap:6 }}>
        <span style={{ color:change>=0?C.green:C.red, fontSize:12, fontWeight:700, fontFamily:"monospace" }}>
          {change>=0?"▲":"▼"} {Math.abs(change)}%
        </span>
        <span style={{ color:C.textDim, fontSize:11 }}>vs last quarter</span>
      </div>
    )}
  </Card>
);

const Label = ({ children }: { children: React.ReactNode }) => (
  <label style={{ display:"block", color:C.textMid, fontSize:11, letterSpacing:"0.07em", textTransform:"uppercase", marginBottom:6, fontFamily:"monospace", fontWeight:600 }}>
    {children}
  </label>
);

const inputStyle: React.CSSProperties = { width:"100%", background:C.bg, border:`1.5px solid ${C.border}`, borderRadius:8, color:C.text, padding:"9px 12px", fontSize:13, fontFamily:"monospace", outline:"none", boxSizing:"border-box" };

const Input = ({ type="number", value, onChange, min, max, step=1 }: { type?: string, value: number | string, onChange: (v: number | string) => void, min?: number, max?: number, step?: number }) => (
  <input type={type} value={value} onChange={e=>onChange(type==="number"?Number(e.target.value):e.target.value)}
    min={min} max={max} step={step} style={inputStyle}
    onFocus={e=>e.target.style.borderColor=C.blue}
    onBlur={e=>e.target.style.borderColor=C.border}
  />
);

const Select = ({ value, onChange, options }: { value: string | number, onChange: (v: string) => void, options: { value: string | number, label: string }[] }) => (
  <select value={value} onChange={e=>onChange(e.target.value)} style={inputStyle}>
    {options.map(o=><option key={o.value??o} value={o.value??o}>{o.label??o}</option>)}
  </select>
);

const SectionTitle = ({ children, sub }: { children: React.ReactNode, sub?: string }) => (
  <div style={{ marginBottom:20 }}>
    <div style={{ color:C.navy, fontSize:15, fontWeight:700, letterSpacing:"-0.02em" }}>{children}</div>
    {sub && <div style={{ color:C.textDim, fontSize:12, marginTop:2 }}>{sub}</div>}
  </div>
);

const Pill = ({ children, color=C.blue }: { children: React.ReactNode, color?: string }) => {
  const bgMap = { [C.blue]:C.blueDim, [C.green]:C.greenDim, [C.red]:C.redDim, [C.amber]:C.amberDim, [C.teal]:C.tealDim, [C.purple]:C.purpleDim };
  return (
    <span style={{ display:"inline-block", padding:"3px 9px", borderRadius:99, fontSize:11, fontFamily:"monospace", fontWeight:700, letterSpacing:"0.04em", background:bgMap[color]||C.blueDim, color }}>
      {children}
    </span>
  );
};

const CustomTooltip = ({ active, payload, label }: { active?: boolean, payload?: { color: string, name: string, value: number }[], label?: string }) => {
  if (!active||!payload?.length) return null;
  return (
    <div style={{ background:C.surface, border:`1px solid ${C.border}`, borderRadius:10, padding:"10px 14px", fontSize:12, fontFamily:"monospace", boxShadow:"0 4px 20px rgba(11,28,46,0.12)" }}>
      <div style={{ color:C.textMid, marginBottom:6, fontWeight:600 }}>{label}</div>
      {payload.map((p,i)=>(
        <div key={i} style={{ color:p.color, marginBottom:2 }}>
          {p.name}: {typeof p.value==="number"&&p.value>10000?fmtM(p.value):fmt(p.value)}
        </div>
      ))}
    </div>
  );
};

const RunButton = ({ onClick, label }: { onClick: () => void, label: string }) => (
  <button onClick={onClick} style={{ width:"100%", padding:"11px 0", background:C.blue, border:"none", borderRadius:9, color:"#fff", fontFamily:"monospace", fontWeight:700, fontSize:13, cursor:"pointer", letterSpacing:"0.06em", boxShadow:`0 2px 12px ${C.blue}44` }}>
    {label}
  </button>
);

// ─── DASHBOARD ────────────────────────────────────────────────────────────────
function DashboardPage() {
  
  const sparkData = [
    {m:"Jul",aum:2.1},{m:"Aug",aum:2.3},{m:"Sep",aum:2.2},{m:"Oct",aum:2.5},
    {m:"Nov",aum:2.7},{m:"Dec",aum:2.9},{m:"Jan",aum:3.1},{m:"Feb",aum:3.0},{m:"Mar",aum:3.4},
  ];
  return (
    <div>
      <div style={{ marginBottom:28 }}>
        <h1 style={{ color:C.navy, fontSize:24, fontWeight:800, letterSpacing:"-0.03em", margin:0 }}>Advisor Overview</h1>
        <div style={{ color:C.textMid, fontSize:13, marginTop:4 }}>Wednesday, March 12, 2026 · Q1 2026</div>
      </div>
      <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:16, marginBottom:24 }}>
        <MetricCard label="Total Clients"     value="142"   sub="Active accounts"      change={8.3}  icon="👥" />
        <MetricCard label="Assets Analyzed"   value="$3.4B" sub="All portfolios"        change={12.7} icon="📊" />
        <MetricCard label="Annuity Products"  value="10"    sub="Live in database"      change={2.1}  icon="🛡️" />
        <MetricCard label="Avg. Return Proj." value="7.2%"  sub="Blended weighted avg"  change={-0.3} icon="📈" />
      </div>
      <div style={{ display:"grid", gridTemplateColumns:"2fr 1fr", gap:20, marginBottom:20 }}>
        <Card>
          <SectionTitle sub="9-month trailing AUM">Assets Under Management</SectionTitle>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={sparkData}>
              <defs>
                <linearGradient id="aumGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor={C.blue} stopOpacity={0.15}/>
                  <stop offset="95%" stopColor={C.blue} stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke={C.border} vertical={false}/>
              <XAxis dataKey="m" tick={{ fill:C.textDim, fontSize:11 }} axisLine={false} tickLine={false}/>
              <YAxis tick={{ fill:C.textDim, fontSize:11, fontFamily:"monospace" }} axisLine={false} tickLine={false} tickFormatter={v=>`$${v}B`}/>
              <Tooltip content={<CustomTooltip/>}/>
              <Area type="monotone" dataKey="aum" stroke={C.blue} strokeWidth={2.5} fill="url(#aumGrad)" name="AUM ($B)"/>
            </AreaChart>
          </ResponsiveContainer>
        </Card>
        <Card>
          <SectionTitle sub="Live feed">Market Updates</SectionTitle>
          <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
            {MARKET_UPDATES.map((u,i)=>(
              <div key={i} style={{ display:"flex", gap:10, paddingBottom:12, borderBottom:i<MARKET_UPDATES.length-1?`1px solid ${C.border}`:"none" }}>
                <div style={{ display:"flex", flexDirection:"column", gap:4, minWidth:56 }}>
                  <span style={{ color:C.textDim, fontSize:10, fontFamily:"monospace" }}>{u.time}</span>
                  <Pill color={u.tag==="FED"?C.amber:u.tag==="ANNUITY"?C.purple:u.tag==="EQUITY"?C.green:C.blue}>{u.tag}</Pill>
                </div>
                <div style={{ color:C.textMid, fontSize:12, lineHeight:1.6 }}>{u.msg}</div>
              </div>
            ))}
          </div>
        </Card>
      </div>
      <Card>
        <SectionTitle sub="All active advisory clients">Client Overview</SectionTitle>
        <table style={{ width:"100%", borderCollapse:"collapse", fontSize:13 }}>
          <thead>
            <tr style={{ borderBottom:`2px solid ${C.border}` }}>
              {["Client","Age","Ret. Age","Assets","Annual Contrib.","Risk","Status"].map(h=>(
                <th key={h} style={{ color:C.textDim, fontWeight:700, textAlign:"left", padding:"8px 12px", fontSize:11, letterSpacing:"0.06em", textTransform:"uppercase", fontFamily:"monospace" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {MOCK_CLIENTS.map(c=>(
              <tr key={c.id} style={{ borderBottom:`1px solid ${C.border}` }}
                onMouseEnter={e=>e.currentTarget.style.background=C.surfaceHi}
                onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
                <td style={{ padding:"11px 12px", color:C.navy, fontWeight:600 }}>{c.name}</td>
                <td style={{ padding:"11px 12px", color:C.textMid, fontFamily:"monospace" }}>{c.age}</td>
                <td style={{ padding:"11px 12px", color:C.textMid, fontFamily:"monospace" }}>{c.retirementAge}</td>
                <td style={{ padding:"11px 12px", color:C.green, fontFamily:"monospace", fontWeight:600 }}>{fmtM(c.assets)}</td>
                <td style={{ padding:"11px 12px", color:C.textMid, fontFamily:"monospace" }}>{fmtM(c.contributions)}</td>
                <td style={{ padding:"11px 12px" }}><Pill color={c.risk==="Aggressive"?C.red:c.risk==="Conservative"?C.green:C.amber}>{c.risk}</Pill></td>
                <td style={{ padding:"11px 12px" }}><Pill color={c.status==="Excellent"?C.green:c.status==="At Risk"?C.red:C.blue}>{c.status}</Pill></td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
}

// ─── CLIENT PLANNER ───────────────────────────────────────────────────────────
function ClientPlannerPage() {
  const [form, setForm] = useState({ age:52, retirementAge:67, assets:850000, contributions:24000, risk:"Moderate" });
  const set = (k: string) => (v: string | number) => setForm(f=>({...f,[k]:v}));
  const projData  = useMemo(()=>generateRetirementData(form.age,form.retirementAge,form.assets,form.contributions,form.risk),[form]);
  const retVal    = projData.find(d=>d.year===form.retirementAge)?.base ?? 0;
  const incomeGap = Math.max(0, 120_000 - retVal*0.04);
  const annuityRec = incomeGap>30_000?"High":incomeGap>10_000?"Moderate":"Low";
  const gapData   = Array.from({ length:form.retirementAge-form.age+20 },(_,i)=>{
    const yr=form.age+i; if(yr<form.retirementAge) return null;
    const port=projData.find(d=>d.year===yr);
    return { year:yr, income:Math.round((port?.base??0)*0.04), gap:Math.max(0,120_000-Math.round((port?.base??0)*0.04)) };
  }).filter(Boolean);

  return (
    <div>
      <div style={{ marginBottom:24 }}>
        <h1 style={{ color:C.navy, fontSize:24, fontWeight:800, letterSpacing:"-0.03em", margin:0 }}>Client Retirement Planner</h1>
        <div style={{ color:C.textMid, fontSize:13, marginTop:4 }}>Monte Carlo projection and income gap analysis</div>
      </div>
      <div style={{ display:"grid", gridTemplateColumns:"280px 1fr", gap:20 }}>
        <div style={{ display:"flex", flexDirection:"column", gap:16 }}>
          <Card>
            <SectionTitle>Client Parameters</SectionTitle>
            {[
              {label:"Current Age",key:"age",min:25,max:80},
              {label:"Retirement Age",key:"retirementAge",min:50,max:85},
              {label:"Current Assets ($)",key:"assets",min:0,max:10000000,step:10000},
              {label:"Annual Contributions ($)",key:"contributions",min:0,max:500000,step:1000},
            ].map(f=>(
              <div key={f.key} style={{ marginBottom:14 }}>
                <Label>{f.label}</Label>
                <Input value={form[f.key as keyof typeof form]} onChange={set(f.key)} min={f.min} max={f.max} step={f.step}/>
              </div>
            ))}
            <Label>Risk Tolerance</Label>
            <Select value={form.risk} onChange={set("risk")} options={["Conservative","Moderate","Aggressive"].map(o=>({value:o,label:o}))}/>
          </Card>
          <Card>
            <SectionTitle>Strategy Summary</SectionTitle>
            {[
              {label:"Projected at Retirement", value:fmtM(retVal),              color:C.navy},
              {label:"4% Safe Withdrawal",      value:`${fmtM(retVal*0.04)}/yr`, color:C.blue},
              {label:"Income Gap vs $120K",      value:incomeGap>0?`-${fmtM(incomeGap)}`:"Surplus", color:incomeGap>0?C.red:C.green},
            ].map(r=>(
              <div key={r.label} style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:12, paddingBottom:12, borderBottom:`1px solid ${C.border}` }}>
                <span style={{ color:C.textMid, fontSize:12 }}>{r.label}</span>
                <span style={{ color:r.color, fontFamily:"monospace", fontSize:13, fontWeight:700 }}>{r.value}</span>
              </div>
            ))}
            <Label>Annuity Priority</Label>
            <Pill color={annuityRec==="High"?C.red:annuityRec==="Moderate"?C.amber:C.green}>{annuityRec} Need</Pill>
            <div style={{ color:C.textMid, fontSize:11, marginTop:8, lineHeight:1.6 }}>
              {annuityRec==="High"&&"Significant income shortfall. Consider RILA or income annuity to bridge gap."}
              {annuityRec==="Moderate"&&"Moderate gap. A small income annuity could provide added security."}
              {annuityRec==="Low"&&"Portfolio likely sufficient. Annuity optional for longevity protection."}
            </div>
          </Card>
        </div>
        <div style={{ display:"flex", flexDirection:"column", gap:20 }}>
          <Card>
            <SectionTitle sub="Optimistic / base / pessimistic scenarios">Retirement Projection</SectionTitle>
            <ResponsiveContainer width="100%" height={240}>
              <AreaChart data={projData}>
                <defs>
                  {[["opti",C.green],["base",C.blue],["pess",C.red]].map(([id,color])=>(
                    <linearGradient key={id} id={`${id}Grad`} x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%"  stopColor={color} stopOpacity={0.12}/>
                      <stop offset="95%" stopColor={color} stopOpacity={0}/>
                    </linearGradient>
                  ))}
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke={C.border} vertical={false}/>
                <XAxis dataKey="year" tick={{ fill:C.textDim, fontSize:11 }} axisLine={false} tickLine={false}/>
                <YAxis tick={{ fill:C.textDim, fontSize:11, fontFamily:"monospace" }} axisLine={false} tickLine={false} tickFormatter={fmtM}/>
                <Tooltip content={<CustomTooltip/>}/>
                <ReferenceLine x={form.retirementAge} stroke={C.amber} strokeDasharray="4 4" label={{ value:"Retire", fill:C.amber, fontSize:11 }}/>
                <Area type="monotone" dataKey="optimistic"  stroke={C.green} strokeWidth={2}   fill="url(#optiGrad)" name="Optimistic"/>
                <Area type="monotone" dataKey="base"        stroke={C.blue}  strokeWidth={2.5} fill="url(#baseGrad)" name="Base Case"/>
                <Area type="monotone" dataKey="pessimistic" stroke={C.red}   strokeWidth={2}   fill="url(#pessGrad)" name="Pessimistic"/>
                <Legend wrapperStyle={{ fontSize:11, color:C.textMid }}/>
              </AreaChart>
            </ResponsiveContainer>
          </Card>
          <Card>
            <SectionTitle sub="Annual income vs $120K retirement target">Income Gap Analysis</SectionTitle>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={gapData.slice(0,20)}>
                <CartesianGrid strokeDasharray="3 3" stroke={C.border} vertical={false}/>
                <XAxis dataKey="year" tick={{ fill:C.textDim, fontSize:10 }} axisLine={false} tickLine={false}/>
                <YAxis tick={{ fill:C.textDim, fontSize:11, fontFamily:"monospace" }} axisLine={false} tickLine={false} tickFormatter={v=>`$${v/1000}K`}/>
                <Tooltip content={<CustomTooltip/>}/>
                <Bar dataKey="income" name="Portfolio Income" fill={C.teal} radius={[3,3,0,0]} opacity={0.85}/>
                <Bar dataKey="gap"    name="Income Gap"       fill={C.red}  radius={[3,3,0,0]} opacity={0.6}/>
                <ReferenceLine y={120000} stroke={C.amber} strokeDasharray="4 4" label={{ value:"Target $120K", fill:C.amber, fontSize:10 }}/>
                <Legend wrapperStyle={{ fontSize:11, color:C.textMid }}/>
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </div>
      </div>
    </div>
  );
}

// ─── RILA SIMULATOR ───────────────────────────────────────────────────────────
function RILASimulatorPage() {
  const [params, setParams] = useState({ amount:250000, cap:12, buffer:10, participation:100, meanReturn:9, volatility:16, years:7 });
  const [results, setResults] = useState<ReturnType<typeof simulateRILA> | null>(null);
  const set = (k: string) => (v: number) => setParams(p=>({...p,[k]:v}));
  return (
    <div>
      <div style={{ marginBottom:24 }}>
        <h1 style={{ color:C.navy, fontSize:24, fontWeight:800, letterSpacing:"-0.03em", margin:0 }}>RILA Monte Carlo Simulator</h1>
        <div style={{ color:C.textMid, fontSize:13, marginTop:4 }}>500-path simulation with lognormal index returns</div>
      </div>
      <div style={{ display:"grid", gridTemplateColumns:"280px 1fr", gap:20 }}>
        <div style={{ display:"flex", flexDirection:"column", gap:16 }}>
          <Card>
            <SectionTitle>Product Parameters</SectionTitle>
            {[
              {label:"Investment Amount ($)",  key:"amount",       step:10000},
              {label:"Cap Rate (%)",           key:"cap",          step:0.5,min:0,max:30},
              {label:"Buffer (%)",             key:"buffer",       step:1,  min:0,max:30},
              {label:"Participation Rate (%)", key:"participation",step:5,  min:50,max:150},
              {label:"Index Mean Return (%)",  key:"meanReturn",   step:0.5,min:-5,max:25},
              {label:"Index Volatility (%)",   key:"volatility",   step:1,  min:1,max:50},
              {label:"Term (Years)",           key:"years",        step:1,  min:1,max:20},
            ].map(f=>(
              <div key={f.key} style={{ marginBottom:14 }}>
                <Label>{f.label}</Label>
                <Input value={params[f.key as keyof typeof params]} onChange={(v) => set(f.key)(v as number)} min={f.min} max={f.max} step={f.step}/>
              </div>
            ))}
            <RunButton onClick={()=>setResults(simulateRILA(params))} label="RUN SIMULATION"/>
          </Card>
          {results && (
            <Card>
              <SectionTitle>Results Summary</SectionTitle>
              {[
                {label:"Worst Case (P10)",value:fmtUSD(results.p10),color:C.red},
                {label:"Median (P50)",    value:fmtUSD(results.p50),color:C.amber},
                {label:"Best Case (P90)", value:fmtUSD(results.p90),color:C.green},
              ].map(r=>(
                <div key={r.label} style={{ display:"flex", justifyContent:"space-between", marginBottom:12, paddingBottom:12, borderBottom:`1px solid ${C.border}` }}>
                  <span style={{ color:C.textMid, fontSize:12 }}>{r.label}</span>
                  <span style={{ color:r.color, fontFamily:"monospace", fontSize:13, fontWeight:700 }}>{r.value}</span>
                </div>
              ))}
              <div style={{ display:"flex", justifyContent:"space-between" }}>
                <span style={{ color:C.textMid, fontSize:12 }}>Median Total Return</span>
                <span style={{ color:C.blue, fontFamily:"monospace", fontWeight:700 }}>{fmt((results.p50/params.amount-1)*100)}%</span>
              </div>
            </Card>
          )}
        </div>
        <div style={{ display:"flex", flexDirection:"column", gap:20 }}>
          {!results && (
            <Card style={{ display:"flex", alignItems:"center", justifyContent:"center", minHeight:420 }}>
              <div style={{ textAlign:"center" }}>
                <div style={{ fontSize:52, marginBottom:12, opacity:0.3 }}>◈</div>
                <div style={{ color:C.textMid, fontSize:14 }}>Configure parameters and run simulation</div>
                <div style={{ color:C.textDim, fontSize:12, marginTop:4 }}>500 Monte Carlo paths will be generated</div>
              </div>
            </Card>
          )}
          {results && (
            <>
              <Card>
                <SectionTitle sub="Worst / median / best case trajectories">Growth Projection</SectionTitle>
                <ResponsiveContainer width="100%" height={230}>
                  <LineChart data={results.growthData}>
                    <CartesianGrid strokeDasharray="3 3" stroke={C.border} vertical={false}/>
                    <XAxis dataKey="year" tick={{ fill:C.textDim, fontSize:11 }} axisLine={false} tickLine={false}/>
                    <YAxis tick={{ fill:C.textDim, fontSize:11, fontFamily:"monospace" }} axisLine={false} tickLine={false} tickFormatter={fmtM}/>
                    <Tooltip content={<CustomTooltip/>}/>
                    <Line type="monotone" dataKey="worstCase" stroke={C.red}   strokeWidth={2}   dot={false} name="Worst (P10)"/>
                    <Line type="monotone" dataKey="median"    stroke={C.blue}  strokeWidth={2.5} dot={false} name="Median (P50)"/>
                    <Line type="monotone" dataKey="bestCase"  stroke={C.green} strokeWidth={2}   dot={false} name="Best (P90)"/>
                    <Legend wrapperStyle={{ fontSize:11, color:C.textMid }}/>
                  </LineChart>
                </ResponsiveContainer>
              </Card>
              <Card>
                <SectionTitle sub="Distribution of 500 simulated final values">Return Distribution</SectionTitle>
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={results.hist}>
                    <CartesianGrid strokeDasharray="3 3" stroke={C.border} vertical={false}/>
                    <XAxis dataKey="range" tick={{ fill:C.textDim, fontSize:9 }} axisLine={false} tickLine={false} interval={2}/>
                    <YAxis tick={{ fill:C.textDim, fontSize:11 }} axisLine={false} tickLine={false}/>
                    <Tooltip content={<CustomTooltip/>}/>
                    <Bar dataKey="count" name="Simulations" radius={[3,3,0,0]}>
                      {results.hist.map((_,i)=>(
                        <Cell key={i} fill={i<results.hist.length*0.2?C.red:i<results.hist.length*0.5?C.amber:C.teal} opacity={0.85}/>
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

// ─── MARKET RESEARCH ──────────────────────────────────────────────────────────
function MarketResearchPage() {
  const [filters, setFilters] = useState({ carrier:"All", minBuffer:0, minCap:0, maxTerm:99 });
  const setF = (k: string) => (v: string | number) => setFilters(f=>({...f,[k]:v}));
  const carriers = ["All",...new Set(ANNUITY_PRODUCTS.map(p=>p.carrier))];
  const filtered = ANNUITY_PRODUCTS.filter(p=>
    (filters.carrier==="All"||p.carrier===filters.carrier) &&
    p.buffer>=filters.minBuffer && p.cap>=filters.minCap && p.term<=filters.maxTerm
  );
  return (
    <div>
      <div style={{ marginBottom:24 }}>
        <h1 style={{ color:C.navy, fontSize:24, fontWeight:800, letterSpacing:"-0.03em", margin:0 }}>Annuity Market Research</h1>
        <div style={{ color:C.textMid, fontSize:13, marginTop:4 }}>Live product database · {filtered.length} products shown</div>
      </div>
      <Card style={{ marginBottom:16 }}>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:16 }}>
          {[
            {label:"Carrier",    key:"carrier",   opts:carriers.map(c=>({value:c,label:c}))},
            {label:"Min Buffer", key:"minBuffer", opts:[{value:0,label:"Any Buffer"},{value:10,label:"10% or more"},{value:15,label:"15% or more"},{value:20,label:"20% or more"}]},
            {label:"Min Cap",    key:"minCap",    opts:[{value:0,label:"Any Cap"},{value:10,label:"10% or more"},{value:12,label:"12% or more"},{value:14,label:"14% or more"}]},
            {label:"Max Term",   key:"maxTerm",   opts:[{value:99,label:"Any Term"},{value:3,label:"3 Years"},{value:6,label:"6 Years"}]},
          ].map(f=>(
            <div key={f.key}>
              <Label>{f.label}</Label>
              <Select value={filters[f.key as keyof typeof filters]} onChange={v=>setF(f.key)(isNaN(Number(v))?v:Number(v))} options={f.opts}/>
            </div>
          ))}
        </div>
      </Card>
      <Card>
        <table style={{ width:"100%", borderCollapse:"collapse", fontSize:13 }}>
          <thead>
            <tr style={{ borderBottom:`2px solid ${C.border}` }}>
              {["Carrier","Product","Buffer","Cap","Participation","Term","Liquidity","Fees"].map(h=>(
                <th key={h} style={{ color:C.textDim, fontWeight:700, textAlign:"left", padding:"8px 14px", fontSize:11, letterSpacing:"0.06em", textTransform:"uppercase", fontFamily:"monospace" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map(p=>(
              <tr key={p.id} style={{ borderBottom:`1px solid ${C.border}` }}
                onMouseEnter={e=>e.currentTarget.style.background=C.surfaceHi}
                onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
                <td style={{ padding:"11px 14px", color:C.navy, fontWeight:600 }}>{p.carrier}</td>
                <td style={{ padding:"11px 14px", color:C.textMid }}>{p.product}</td>
                <td style={{ padding:"11px 14px" }}><Pill color={p.buffer>=15?C.green:p.buffer>=10?C.amber:C.red}>{p.buffer}%</Pill></td>
                <td style={{ padding:"11px 14px" }}><Pill color={p.cap>=14?C.green:p.cap>=12?C.blue:C.amber}>{p.cap}%</Pill></td>
                <td style={{ padding:"11px 14px", color:C.textMid, fontFamily:"monospace" }}>{p.participation}%</td>
                <td style={{ padding:"11px 14px", color:C.textMid, fontFamily:"monospace" }}>{p.term} yr</td>
                <td style={{ padding:"11px 14px", color:C.textMid, fontSize:12 }}>{p.liquidity}</td>
                <td style={{ padding:"11px 14px" }}><Pill color={p.fees==="0.00%"?C.green:C.amber}>{p.fees}</Pill></td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length===0&&<div style={{ textAlign:"center", padding:48, color:C.textMid }}>No products match current filters</div>}
      </Card>
    </div>
  );
}

// ─── PRODUCT COMPARISON ───────────────────────────────────────────────────────
function ProductComparisonPage() {
  const [selected, setSelected] = useState([ANNUITY_PRODUCTS[0].id, ANNUITY_PRODUCTS[1].id]);
  const toggle = (id: number) => setSelected(s=>s.includes(id)?s.filter(x=>x!==id):s.length<4?[...s,id]:s);
  const products = ANNUITY_PRODUCTS.filter(p=>selected.includes(p.id));
  const COLORS = [C.blue, C.teal, C.purple, C.amber];
 const projData = Array.from({ length:7 },(_,i)=>{
    const yr=i+1;
    const row: Record<string, string | number> = { year:`Y${yr}` };
    products.forEach(p=>{ row[p.product]=Math.round(100000*Math.pow(1+Math.min(0.09,p.cap/100)*(p.participation/100),yr)); });
    return row;
  });
  return (
    <div>
      <div style={{ marginBottom:24 }}>
        <h1 style={{ color:C.navy, fontSize:24, fontWeight:800, letterSpacing:"-0.03em", margin:0 }}>Product Comparison</h1>
        <div style={{ color:C.textMid, fontSize:13, marginTop:4 }}>Select up to 4 products for side-by-side analysis</div>
      </div>
      <Card style={{ marginBottom:20 }}>
        <SectionTitle sub="Click to toggle">Select Products</SectionTitle>
        <div style={{ display:"flex", flexWrap:"wrap", gap:8 }}>
          {ANNUITY_PRODUCTS.map(p=>{
            const isSel=selected.includes(p.id), idx=selected.indexOf(p.id), col=isSel?COLORS[idx]:C.textDim;
            return (
              <button key={p.id} onClick={()=>toggle(p.id)} style={{ padding:"7px 14px", borderRadius:8, border:`1.5px solid ${isSel?col:C.border}`, background:isSel?`${col}12`:"transparent", color:isSel?col:C.textMid, fontSize:12, fontFamily:"monospace", cursor:"pointer", fontWeight:isSel?700:400 }}>
                {p.carrier} · {p.product}
              </button>
            );
          })}
        </div>
      </Card>
      {products.length<2 ? (
        <Card style={{ textAlign:"center", padding:60 }}>
          <div style={{ color:C.textMid }}>Select at least 2 products to compare</div>
        </Card>
      ) : (
        <>
          <div style={{ display:"grid", gridTemplateColumns:`repeat(${products.length},1fr)`, gap:16, marginBottom:20 }}>
            {products.map((p,i)=>(
              <Card key={p.id} style={{ borderTop:`3px solid ${COLORS[i]}` }}>
                <div style={{ color:COLORS[i], fontSize:11, fontWeight:700, fontFamily:"monospace", marginBottom:2, textTransform:"uppercase", letterSpacing:"0.06em" }}>{p.carrier}</div>
                <div style={{ color:C.navy, fontSize:15, fontWeight:700, marginBottom:18 }}>{p.product}</div>
                {[
                  {label:"Buffer",        value:`${p.buffer}%`},
                  {label:"Cap",           value:`${p.cap}%`},
                  {label:"Participation", value:`${p.participation}%`},
                  {label:"Term",          value:`${p.term} years`},
                  {label:"Fees",          value:p.fees},
                  {label:"Liquidity",     value:p.liquidity},
                ].map(r=>(
                  <div key={r.label} style={{ display:"flex", justifyContent:"space-between", marginBottom:10, paddingBottom:10, borderBottom:`1px solid ${C.border}` }}>
                    <span style={{ color:C.textMid, fontSize:12 }}>{r.label}</span>
                    <span style={{ color:C.navy, fontSize:12, fontFamily:"monospace", fontWeight:600 }}>{r.value}</span>
                  </div>
                ))}
                <div style={{ marginTop:8 }}>
                  <div style={{ color:C.textDim, fontSize:11, marginBottom:6, textTransform:"uppercase", letterSpacing:"0.06em", fontFamily:"monospace" }}>Downside Protection</div>
                  <div style={{ background:C.surfaceMid, borderRadius:99, height:7 }}>
                    <div style={{ width:`${(p.buffer/30)*100}%`, height:"100%", background:`linear-gradient(90deg,${COLORS[i]}88,${COLORS[i]})`, borderRadius:99 }}/>
                  </div>
                  <div style={{ color:COLORS[i], fontSize:11, marginTop:4, fontFamily:"monospace", fontWeight:700 }}>{p.buffer}% buffer</div>
                </div>
              </Card>
            ))}
          </div>
          <Card>
            <SectionTitle sub="$100,000 hypothetical assuming cap return each year">Projected Growth Comparison</SectionTitle>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={projData}>
                <CartesianGrid strokeDasharray="3 3" stroke={C.border} vertical={false}/>
                <XAxis dataKey="year" tick={{ fill:C.textDim, fontSize:11 }} axisLine={false} tickLine={false}/>
                <YAxis tick={{ fill:C.textDim, fontSize:11, fontFamily:"monospace" }} axisLine={false} tickLine={false} tickFormatter={v=>`$${(v/1000).toFixed(0)}K`}/>
                <Tooltip content={<CustomTooltip/>}/>
                {products.map((p,i)=>(
                  <Line key={p.id} type="monotone" dataKey={p.product} stroke={COLORS[i]} strokeWidth={2.5} dot={{ fill:COLORS[i], r:3 }} name={p.product}/>
                ))}
                <Legend wrapperStyle={{ fontSize:11, color:C.textMid }}/>
              </LineChart>
            </ResponsiveContainer>
          </Card>
        </>
      )}
    </div>
  );
}

// ─── SETTINGS ─────────────────────────────────────────────────────────────────
function SettingsPage() {
  return (
    <div>
      <div style={{ marginBottom:24 }}>
        <h1 style={{ color:C.navy, fontSize:24, fontWeight:800, letterSpacing:"-0.03em", margin:0 }}>Settings</h1>
        <div style={{ color:C.textMid, fontSize:13, marginTop:4 }}>Platform preferences and integrations</div>
      </div>
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:20 }}>
        {[
          {title:"Advisor Profile",  fields:["Firm Name","License Number","Email","Phone"]},
          {title:"Data Sources",     fields:["Data Provider API Key","Rate Feed URL","Refresh Interval (min)"]},
          {title:"Risk Parameters",  fields:["Default Risk-Free Rate (%)","Equity Risk Premium (%)","Monte Carlo Paths"]},
          {title:"Display",          fields:["Default Currency","Number Format","Date Format"]},
        ].map(s=>(
          <Card key={s.title}>
            <SectionTitle>{s.title}</SectionTitle>
            {s.fields.map(f=>(
              <div key={f} style={{ marginBottom:14 }}>
                <Label>{f}</Label>
                <Input type="text" value="" onChange={()=>{}}/>
              </div>
            ))}
            <button style={{ padding:"9px 20px", background:C.blue, border:"none", borderRadius:8, color:"#fff", fontFamily:"monospace", fontSize:12, cursor:"pointer", fontWeight:700 }}>
              Save Changes
            </button>
          </Card>
        ))}
      </div>
    </div>
  );
}

// ─── PLACEHOLDER PAGES ────────────────────────────────────────────────────────
function PlaceholderPage({ title, icon, description }: { title:string, icon:string, description:string }) {
  return (
    <div style={{ display:"flex", alignItems:"center", justifyContent:"center", minHeight:"60vh" }}>
      <div style={{ textAlign:"center" }}>
        <div style={{ fontSize:56, marginBottom:16, opacity:0.15 }}>{icon}</div>
        <div style={{ color:C.navy, fontSize:22, fontWeight:800, letterSpacing:"-0.03em", marginBottom:8 }}>{title}</div>
        <div style={{ color:C.textMid, fontSize:14, maxWidth:380, lineHeight:1.6 }}>{description}</div>
        <div style={{ marginTop:20, display:"inline-block", padding:"8px 20px", background:C.blueDim, borderRadius:8, color:C.blue, fontSize:12, fontFamily:"monospace", fontWeight:700 }}>COMING SOON</div>
      </div>
    </div>
  );
}
function ProductsPage() {
  return <PlaceholderPage title="Products" icon="⊞" description="Browse and manage annuity products. Full product library with filtering, sorting, and detailed product sheets." />;
}
function StrategyBuilderPage() {
  return <PlaceholderPage title="Strategy Builder" icon="◇" description="Build and save custom retirement strategies combining multiple products, income sources, and client scenarios." />;
}

// ─── LOGO ─────────────────────────────────────────────────────────────────────
function YieldIntelLogo() {
  return (
    <div style={{ display:"flex", alignItems:"center", gap:10 }}>
      <svg width="34" height="34" viewBox="0 0 34 34" fill="none">
        <rect width="34" height="34" rx="9" fill={C.navy}/>
        <path d="M8 22 L13 16 L18 19 L26 10" stroke={C.teal} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
        <circle cx="26" cy="10" r="2.5" fill={C.blue}/>
        <path d="M8 26 L26 26" stroke={C.blue} strokeWidth="1.5" strokeLinecap="round" opacity="0.4"/>
      </svg>
      <div>
        <div style={{ color:C.navy, fontWeight:900, fontSize:15, letterSpacing:"-0.04em", lineHeight:1 }}>
          Yield<span style={{ color:C.blue }}>Intel</span>
        </div>
        <div style={{ color:C.textDim, fontSize:9.5, letterSpacing:"0.1em", textTransform:"uppercase", fontFamily:"monospace", marginTop:2 }}>Advisor Platform</div>
      </div>
    </div>
  );
}

// ─── ROOT APP ─────────────────────────────────────────────────────────────────
export default function App() {
  const PAGE_MAP = {
    dashboard:     DashboardPage,
    clientplanner: ClientPlannerPage,
    rila:          RILASimulatorPage,
    research:      MarketResearchPage,
    compare:       ProductComparisonPage,
    products:      ProductsPage,
    strategy:      StrategyBuilderPage,
    settings:      SettingsPage,
  };

  const [page, setPage] = useState<keyof typeof PAGE_MAP>("dashboard");
  const [collapsed, setCollapsed] = useState(false);
  const [expanded, setExpanded] = useState<string[]>(["clients","simulators"]);
  const [notifications] = useState(3);
  const [search, setSearch] = useState("");
  const [spx, setSpx] = useState<{price:string, change:string}|null>(null);
  const [user, setUser] = useState<{name:string, role:string, email:string}|null>(null);
  const [authChecked, setAuthChecked] = useState(false);

  useEffect(()=>{ fetchQuote("SPY").then(setSpx); },[]);

  useEffect(()=>{
    const stored = localStorage.getItem("yi_user");
    if (stored) setUser(JSON.parse(stored));
    setAuthChecked(true);
  },[]);

  if (!authChecked) return (
    <div style={{ minHeight:"100vh", background:"#F8FAFC", display:"flex", alignItems:"center", justifyContent:"center" }}>
      <div style={{ color:"#94A3B8", fontFamily:"monospace", fontSize:14 }}>Loading...</div>
    </div>
  );

  if (!user) {
    if (typeof window !== "undefined") window.location.href = "/login";
    return null;
  }
  const ActivePage = PAGE_MAP[page] as React.ComponentType<{spx?: {price:string,change:string}|null}>;
  const sidebarW = collapsed ? 64 : 230;

  const toggleExpand = (id: string) =>
    setExpanded(e => e.includes(id) ? e.filter(x=>x!==id) : [...e, id]);

  const navBtn = (isActive: boolean): React.CSSProperties => ({
    display:"flex", alignItems:"center", gap:10, width:"100%",
    padding: collapsed ? "10px 0" : "9px 12px",
    justifyContent: collapsed ? "center" : "flex-start",
    borderRadius:9, border:"none", cursor:"pointer",
    background: isActive ? C.blueDim : "transparent",
    color: isActive ? C.blue : C.textMid,
    fontSize:13, fontWeight: isActive ? 700 : 400,
    marginBottom:2, textAlign:"left", transition:"all 0.15s",
    borderLeft: isActive ? `3px solid ${C.blue}` : "3px solid transparent",
    boxSizing:"border-box",
  });

  return (
    <div style={{ display:"flex", minHeight:"100vh", background:C.bg, color:C.text, fontFamily:"'Geist','Outfit','Segoe UI',sans-serif" }}>

      {/* ── Sidebar ── */}
      <div style={{ width:sidebarW, minHeight:"100vh", background:C.surface, borderRight:`1px solid ${C.border}`, display:"flex", flexDirection:"column", position:"fixed", top:0, left:0, zIndex:10, boxShadow:"2px 0 12px rgba(11,28,46,0.06)", transition:"width 0.2s", overflow:"hidden" }}>

        {/* Logo row */}
        <div style={{ padding: collapsed ? "16px 0" : "18px 16px", borderBottom:`1px solid ${C.border}`, display:"flex", alignItems:"center", justifyContent: collapsed ? "center" : "space-between", minHeight:64 }}>
          {!collapsed && <YieldIntelLogo/>}
          {collapsed && (
            <svg width="28" height="28" viewBox="0 0 34 34" fill="none">
              <rect width="34" height="34" rx="9" fill={C.navy}/>
              <path d="M8 22 L13 16 L18 19 L26 10" stroke={C.teal} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
              <circle cx="26" cy="10" r="2.5" fill={C.blue}/>
            </svg>
          )}
          {!collapsed && (
            <button onClick={()=>setCollapsed(true)} style={{ background:"none", border:"none", cursor:"pointer", color:C.textDim, fontSize:20, padding:4, lineHeight:1 }}>‹</button>
          )}
        </div>

        {/* Expand toggle when collapsed */}
        {collapsed && (
          <button onClick={()=>setCollapsed(false)} style={{ background:"none", border:"none", cursor:"pointer", color:C.textDim, fontSize:20, padding:"6px 0", textAlign:"center", borderBottom:`1px solid ${C.border}`, width:"100%" }}>›</button>
        )}

        {/* Nav items */}
        <nav style={{ flex:1, padding: collapsed ? "10px 6px" : "12px 10px", overflowY:"auto" }}>
          {!collapsed && <div style={{ color:C.textDim, fontSize:10, letterSpacing:"0.1em", textTransform:"uppercase", fontFamily:"monospace", padding:"4px 10px 10px", fontWeight:600 }}>Navigation</div>}

          {NAV_ITEMS.map(item => {
            const hasChildren  = item.children && item.children.length > 0;
            const isExpanded   = expanded.includes(item.id);
            const isChildActive = hasChildren && item.children.some(c => c.id === page);
            const isActive     = page === item.id || isChildActive;

            return (
              <div key={item.id}>
                <button
                  onClick={() => { if (hasChildren) toggleExpand(item.id); else setPage(item.id as keyof typeof PAGE_MAP); }}
                  style={navBtn(isActive)}
                  onMouseEnter={e=>{ if(!isActive){e.currentTarget.style.background=C.surfaceHi;e.currentTarget.style.color=C.navy;}}}
                  onMouseLeave={e=>{ if(!isActive){e.currentTarget.style.background="transparent";e.currentTarget.style.color=C.textMid;}}}
                  title={collapsed ? item.label : undefined}
                >
                  <span style={{ fontSize:15, flexShrink:0 }}>{item.icon}</span>
                  {!collapsed && <span style={{ flex:1 }}>{item.label}</span>}
                  {!collapsed && hasChildren && (
                    <span style={{ fontSize:9, opacity:0.4, transition:"transform 0.2s", display:"inline-block", transform: isExpanded ? "rotate(90deg)" : "rotate(0deg)" }}>▶</span>
                  )}
                </button>

                {/* Sub-items */}
                {!collapsed && hasChildren && isExpanded && item.children.map(child => {
                  const isChildPage = page === child.id;
                  return (
                    <button key={child.id} onClick={()=>setPage(child.id as keyof typeof PAGE_MAP)}
                      style={{ display:"flex", alignItems:"center", gap:8, width:"100%", padding:"7px 12px 7px 34px", borderRadius:8, border:"none", cursor:"pointer", background: isChildPage ? C.blueDim : "transparent", color: isChildPage ? C.blue : C.textMid, fontSize:12, fontWeight: isChildPage ? 700 : 400, marginBottom:1, textAlign:"left", borderLeft: isChildPage ? `3px solid ${C.blue}` : "3px solid transparent", boxSizing:"border-box", transition:"all 0.12s" }}
                      onMouseEnter={e=>{ if(!isChildPage){e.currentTarget.style.background=C.surfaceHi;e.currentTarget.style.color=C.navy;}}}
                      onMouseLeave={e=>{ if(!isChildPage){e.currentTarget.style.background="transparent";e.currentTarget.style.color=C.textMid;}}}>
                      <span style={{ width:5, height:5, borderRadius:"50%", background: isChildPage ? C.blue : C.textDim, flexShrink:0 }}/>
                      {child.label}
                    </button>
                  );
                })}
              </div>
            );
          })}
        </nav>
      </div>

      {/* ── Main area ── */}
      <div style={{ marginLeft:sidebarW, flex:1, display:"flex", flexDirection:"column", minHeight:"100vh", transition:"margin-left 0.2s" }}>

        {/* Top bar */}
        <div style={{ height:56, background:C.surface, borderBottom:`1px solid ${C.border}`, display:"flex", alignItems:"center", padding:"0 28px", gap:16, position:"sticky", top:0, zIndex:9, boxShadow:"0 1px 4px rgba(11,28,46,0.05)" }}>
          <div style={{ flex:1, maxWidth:380, position:"relative" }}>
            <span style={{ position:"absolute", left:10, top:"50%", transform:"translateY(-50%)", color:C.textDim, fontSize:13 }}>🔍</span>
            <input value={search} onChange={e=>setSearch(e.target.value)}
              placeholder="Search clients, products, strategies..."
              style={{ width:"100%", background:C.surfaceHi, border:`1px solid ${C.border}`, borderRadius:8, padding:"7px 12px 7px 32px", fontSize:13, color:C.text, outline:"none", boxSizing:"border-box", fontFamily:"inherit" }}/>
          </div>

          <div style={{ flex:1 }}/>

          {/* Live ticker */}
          <div style={{ display:"flex", alignItems:"center", gap:6, padding:"5px 12px", background:C.surfaceHi, borderRadius:8, border:`1px solid ${C.border}` }}>
            <div style={{ width:6, height:6, borderRadius:"50%", background:C.green }}/>
            <span style={{ color:C.textMid, fontSize:12, fontFamily:"monospace" }}>
              S&P {spx ? spx.price : "..."}
            </span>
            {spx && (
              <span style={{ color: parseFloat(spx.change) >= 0 ? C.green : C.red, fontSize:12, fontFamily:"monospace", fontWeight:700 }}>
                {parseFloat(spx.change) >= 0 ? "▲" : "▼"}{Math.abs(parseFloat(spx.change))}%
              </span>
            )}
          </div>

          {/* Notifications */}
          <div style={{ position:"relative", cursor:"pointer", padding:4 }}>
            <span style={{ fontSize:18 }}>🔔</span>
            {notifications > 0 && (
              <div style={{ position:"absolute", top:0, right:0, width:15, height:15, borderRadius:"50%", background:C.red, color:"#fff", fontSize:9, fontWeight:700, display:"flex", alignItems:"center", justifyContent:"center" }}>{notifications}</div>
            )}
          </div>

          {/* Profile */}
          <div style={{ display:"flex", alignItems:"center", gap:8, paddingLeft:12, borderLeft:`1px solid ${C.border}` }}>
            <div style={{ width:32, height:32, borderRadius:"50%", background:`linear-gradient(135deg,${C.blue},${C.teal})`, display:"flex", alignItems:"center", justifyContent:"center", color:"#fff", fontSize:12, fontWeight:700 }}>
              {user?.name?.charAt(0) ?? "?"}
            </div>
            <div>
              <div style={{ color:C.navy, fontSize:12, fontWeight:600, lineHeight:1.2 }}>{user?.name ?? "Advisor"}</div>
              <div style={{ color:C.textDim, fontSize:10, fontFamily:"monospace" }}>{user?.role ?? "advisor"}</div>
            </div>
            <button onClick={()=>{ localStorage.removeItem("yi_user"); window.location.href = "/login"; }} style={{ marginLeft:8, padding:"4px 10px", background:"transparent", border:`1px solid ${C.border}`, borderRadius:6, color:C.textMid, fontSize:11, cursor:"pointer", fontFamily:"monospace" }}>
              Sign out
            </button>
          </div>

        </div>{/* end top bar */}

        {/* Page content */}
        <div style={{ flex:1, padding:"32px 36px", overflowX:"hidden" }}>
          <ActivePage spx={spx}/>
        </div>
      </div>
    </div>
  );
}