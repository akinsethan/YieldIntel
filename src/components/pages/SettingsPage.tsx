"use client";

import { useState, useEffect } from "react";
import { C } from "@/lib/tokens";
import { Card } from "@/components/ui/Card";
import { SectionTitle } from "@/components/ui/SectionTitle";
import { Label } from "@/components/ui/Label";
import { Input } from "@/components/ui/Input";

const SECTIONS = [
  { title: "Advisor Profile",  fields: ["Firm Name", "License Number", "Email", "Phone"] },
  { title: "Data Sources",     fields: ["Data Provider API Key", "Rate Feed URL", "Refresh Interval (min)"] },
  { title: "Risk Parameters",  fields: ["Default Risk-Free Rate (%)", "Equity Risk Premium (%)", "Monte Carlo Paths"] },
  { title: "Display",          fields: ["Default Currency", "Number Format", "Date Format"] },
];

interface AuditEvent {
  id: string;
  ts: string;
  user: string;
  action: string;
  resource: string;
  detail?: string;
  ip?: string;
}

const ACTION_COLORS: Record<string, string> = {
  VIEW:     "#3b82f6",
  SEARCH:   "#8b5cf6",
  EXPORT:   "#f59e0b",
  LOGIN:    "#22c55e",
  LOGOUT:   "#6b7280",
  YIELDBOT: "#06b6d4",
};

function AuditLogPanel() {
  const [events, setEvents] = useState<AuditEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/audit")
      .then((r) => r.json())
      .then((d) => { setEvents(d.events ?? []); setLoading(false); })
      .catch(() => { setError("Failed to load audit log."); setLoading(false); });
  }, []);

  function fmtTs(ts: string) {
    const d = new Date(ts);
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric" }) +
      " " + d.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
  }

  return (
    <Card>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
        <SectionTitle>Audit Log</SectionTitle>
        <button
          onClick={() => { setLoading(true); fetch("/api/audit").then(r => r.json()).then(d => { setEvents(d.events ?? []); setLoading(false); }); }}
          style={{ fontSize: 11, color: C.blue, background: "none", border: "none", cursor: "pointer", fontFamily: "monospace" }}
        >
          ↺ Refresh
        </button>
      </div>

      {loading && (
        <div style={{ color: C.textDim, fontSize: 13, padding: "20px 0", textAlign: "center" }}>Loading...</div>
      )}
      {error && (
        <div style={{ color: "#ef4444", fontSize: 12 }}>{error}</div>
      )}
      {!loading && !error && events.length === 0 && (
        <div style={{ color: C.textDim, fontSize: 13, padding: "20px 0", textAlign: "center" }}>
          No activity recorded yet. Events will appear here as you use the platform.
        </div>
      )}
      {!loading && events.length > 0 && (
        <div style={{ maxHeight: 320, overflowY: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
            <thead>
              <tr style={{ borderBottom: `1px solid ${C.border}` }}>
                {["Time", "User", "Action", "Resource", "Detail"].map((h) => (
                  <th key={h} style={{ padding: "6px 10px", textAlign: "left", color: C.textDim, fontWeight: 600, whiteSpace: "nowrap" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {events.map((ev) => (
                <tr key={ev.id} style={{ borderBottom: `1px solid ${C.border}` }}>
                  <td style={{ padding: "7px 10px", color: C.textDim, whiteSpace: "nowrap" }}>{fmtTs(ev.ts)}</td>
                  <td style={{ padding: "7px 10px", color: C.text }}>{ev.user}</td>
                  <td style={{ padding: "7px 10px" }}>
                    <span style={{
                      background: (ACTION_COLORS[ev.action] ?? C.border) + "22",
                      color: ACTION_COLORS[ev.action] ?? C.textDim,
                      borderRadius: 4,
                      padding: "2px 6px",
                      fontSize: 10,
                      fontWeight: 700,
                      fontFamily: "monospace",
                    }}>
                      {ev.action}
                    </span>
                  </td>
                  <td style={{ padding: "7px 10px", color: C.text }}>{ev.resource}</td>
                  <td style={{ padding: "7px 10px", color: C.textDim, maxWidth: 200, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{ev.detail ?? "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div style={{ marginTop: 12, fontSize: 11, color: C.textDim }}>
        Showing most recent 500 events · Stored server-side in append-only JSONL format
      </div>
    </Card>
  );
}

export function SettingsPage() {
  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ color: C.navy, fontSize: 24, fontWeight: 800, letterSpacing: "-0.03em", margin: 0 }}>Settings</h1>
        <div style={{ color: C.textMid, fontSize: 13, marginTop: 4 }}>Platform preferences and integrations</div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
        {SECTIONS.map(s => (
          <Card key={s.title}>
            <SectionTitle>{s.title}</SectionTitle>
            {s.fields.map(f => (
              <div key={f} style={{ marginBottom: 14 }}>
                <Label>{f}</Label>
                <Input type="text" value="" onChange={() => {}} />
              </div>
            ))}
            <button style={{ padding: "9px 20px", background: C.blue, border: "none", borderRadius: 8, color: "#fff", fontFamily: "monospace", fontSize: 12, cursor: "pointer", fontWeight: 700 }}>
              Save Changes
            </button>
          </Card>
        ))}
      </div>

      <div style={{ marginTop: 20 }}>
        <AuditLogPanel />
      </div>
    </div>
  );
}
