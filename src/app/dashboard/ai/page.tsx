import type { Metadata } from "next";
import { C } from "@/lib/tokens";

export const metadata: Metadata = { title: "AI Assistant — YieldIntel" };

export default function AiPage() {
  return (
    <div style={{ padding: "80px 36px", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "60vh", textAlign: "center" }}>
      <div style={{ fontSize: 48, marginBottom: 20 }}>◉</div>
      <h1 style={{ color: C.navy, fontSize: 24, fontWeight: 800, letterSpacing: "-0.03em", marginBottom: 12 }}>AI Research Assistant</h1>
      <p style={{ color: C.textMid, fontSize: 15, lineHeight: 1.65, maxWidth: 480, marginBottom: 24 }}>
        Ask any question about the rate environment, product features, or competitive positioning. Get answers sourced from live data.
      </p>
      <div style={{ display: "inline-flex", alignItems: "center", gap: 8, background: C.goldDim, border: `1px solid ${C.gold}44`, borderRadius: 20, padding: "6px 16px" }}>
        <span style={{ width: 6, height: 6, background: C.gold, borderRadius: "50%", display: "inline-block" }} />
        <span style={{ color: C.gold, fontSize: 12, fontWeight: 700, letterSpacing: "0.06em" }}>PHASE 4 — COMING SOON</span>
      </div>
    </div>
  );
}
