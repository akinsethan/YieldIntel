import { C } from "@/lib/tokens";

export function PlaceholderPage({ title, icon, description }: { title: string; icon: string; description: string }) {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "60vh" }}>
      <div style={{ textAlign: "center" }}>
        <div style={{ fontSize: 56, marginBottom: 16, opacity: 0.15 }}>{icon}</div>
        <div style={{ color: C.navy, fontSize: 22, fontWeight: 800, letterSpacing: "-0.03em", marginBottom: 8 }}>{title}</div>
        <div style={{ color: C.textMid, fontSize: 14, maxWidth: 380, lineHeight: 1.6 }}>{description}</div>
        <div style={{ marginTop: 20, display: "inline-block", padding: "8px 20px", background: C.blueDim, borderRadius: 8, color: C.blue, fontSize: 12, fontFamily: "monospace", fontWeight: 700 }}>COMING SOON</div>
      </div>
    </div>
  );
}
