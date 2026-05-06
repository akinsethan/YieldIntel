"use client";

import { useState, useEffect } from "react";
import { C } from "@/lib/tokens";

interface StaleCarrier {
  id:              string;
  name:            string;
  am_best:         string | null;
  oldest_date:     string;
  rate_count:      number;
  product_count:   number;
  days_stale:      number;
  last_updated_by: string | null;
}

function StaleBadge({ days }: { days: number }) {
  if (days === 0)  return <span style={{ background: C.greenDim, color: C.green,  borderRadius: 5, padding: "3px 9px", fontSize: 11, fontWeight: 700 }}>Today</span>;
  if (days <= 3)   return <span style={{ background: C.greenDim, color: C.green,  borderRadius: 5, padding: "3px 9px", fontSize: 11, fontWeight: 700 }}>{days}d ago</span>;
  if (days <= 7)   return <span style={{ background: C.amberDim, color: C.amber,  borderRadius: 5, padding: "3px 9px", fontSize: 11, fontWeight: 700 }}>{days}d ago</span>;
  if (days <= 14)  return <span style={{ background: C.redDim,   color: C.red,    borderRadius: 5, padding: "3px 9px", fontSize: 11, fontWeight: 700 }}>{days}d ago ⚠</span>;
  return               <span style={{ background: C.redDim,   color: C.red,    borderRadius: 5, padding: "3px 9px", fontSize: 11, fontWeight: 700 }}>{days}d ago !</span>;
}

export default function StaleRatesPage() {
  const [carriers, setCarriers] = useState<StaleCarrier[]>([]);
  const [loading, setLoading]   = useState(true);

  useEffect(() => {
    fetch("/api/rates/stale")
      .then(r => r.json())
      .then(data => { setCarriers(Array.isArray(data) ? data : []); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const stale7  = carriers.filter(c => c.days_stale > 7).length;
  const stale3  = carriers.filter(c => c.days_stale > 3 && c.days_stale <= 7).length;
  const fresh   = carriers.filter(c => c.days_stale <= 3).length;
  const noRates = carriers.length === 0 && !loading;

  return (
    <div style={{ padding: "36px 40px", maxWidth: 1000 }}>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ color: C.navy, fontSize: 24, fontWeight: 800, letterSpacing: "-0.03em", margin: 0 }}>Stale Rate Dashboard</h1>
        <p style={{ color: C.textMid, fontSize: 13, marginTop: 4 }}>
          Carriers sorted by their oldest current rate. Click "Update" to jump to rate entry.
        </p>
      </div>

      {/* Summary cards */}
      {!loading && carriers.length > 0 && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16, marginBottom: 28 }}>
          {[
            { label: "Stale (>7 days)",     value: stale7,  bg: C.redDim,   color: C.red   },
            { label: "Aging (4–7 days)",    value: stale3,  bg: C.amberDim, color: C.amber },
            { label: "Fresh (≤3 days)",     value: fresh,   bg: C.greenDim, color: C.green },
          ].map(s => (
            <div key={s.label} style={{ background: s.bg, border: `1px solid ${s.color}30`, borderRadius: 12, padding: "16px 20px" }}>
              <div style={{ fontSize: 28, fontWeight: 800, color: s.color, fontFamily: "monospace" }}>{s.value}</div>
              <div style={{ fontSize: 12, color: s.color, fontWeight: 600, marginTop: 2 }}>{s.label}</div>
            </div>
          ))}
        </div>
      )}

      <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 14, overflow: "hidden" }}>
        {loading ? (
          <div style={{ padding: 60, textAlign: "center", color: C.textDim }}>Loading…</div>
        ) : noRates ? (
          <div style={{ padding: 60, textAlign: "center", color: C.textDim }}>No rate data found. Add rates in Admin → Rate Update.</div>
        ) : (
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
            <thead>
              <tr style={{ borderBottom: `1px solid ${C.border}`, background: C.surfaceHi }}>
                {["Carrier", "AM Best", "Oldest Rate", "Staleness", "Rates", "Last Updated By", ""].map(h => (
                  <th key={h} style={{ padding: "10px 16px", textAlign: "left", color: C.textDim, fontWeight: 600, fontSize: 11, letterSpacing: "0.04em" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {carriers.map(c => (
                <tr key={c.id} style={{ borderBottom: `1px solid ${C.border}` }}
                  onMouseEnter={e => (e.currentTarget.style.background = C.surfaceHi)}
                  onMouseLeave={e => (e.currentTarget.style.background = "")}>
                  <td style={{ padding: "12px 16px", fontWeight: 600, color: C.text }}>{c.name}</td>
                  <td style={{ padding: "12px 16px" }}>
                    {c.am_best
                      ? <span style={{ background: C.greenDim, color: C.green, borderRadius: 5, padding: "2px 8px", fontSize: 11, fontWeight: 700 }}>{c.am_best}</span>
                      : <span style={{ color: C.textDim }}>—</span>}
                  </td>
                  <td style={{ padding: "12px 16px", color: C.textMid, fontFamily: "monospace", fontSize: 12 }}>
                    {new Date(c.oldest_date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                  </td>
                  <td style={{ padding: "12px 16px" }}>
                    <StaleBadge days={c.days_stale} />
                  </td>
                  <td style={{ padding: "12px 16px", color: C.textMid, fontSize: 12 }}>
                    {c.rate_count} rate{c.rate_count !== 1 ? "s" : ""} · {c.product_count} product{c.product_count !== 1 ? "s" : ""}
                  </td>
                  <td style={{ padding: "12px 16px", color: C.textDim, fontSize: 11, fontFamily: "monospace" }}>
                    {c.last_updated_by ?? "—"}
                  </td>
                  <td style={{ padding: "12px 16px", textAlign: "right" }}>
                    <a
                      href={`/admin/rates?carrier=${encodeURIComponent(c.name)}`}
                      style={{ background: c.days_stale > 7 ? C.red : c.days_stale > 3 ? C.amber : C.teal, color: "#fff", borderRadius: 6, padding: "5px 14px", fontSize: 12, fontWeight: 700, textDecoration: "none", display: "inline-block" }}
                    >
                      Update →
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {!loading && carriers.length > 0 && (
        <p style={{ color: C.textDim, fontSize: 11, marginTop: 12 }}>
          Showing {carriers.length} carrier{carriers.length !== 1 ? "s" : ""} with active rates. Staleness is measured from the oldest current rate effective date per carrier.
        </p>
      )}
    </div>
  );
}
