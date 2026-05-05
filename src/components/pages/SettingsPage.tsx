"use client";

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
    </div>
  );
}
