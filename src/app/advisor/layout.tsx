import type { Metadata } from "next";

export const metadata: Metadata = { title: "Rate Database — YieldIntel" };

export default function AdvisorLayout({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ minHeight: "100vh", background: "#F8FAFC", color: "#0B1C2E", fontFamily: "'Geist','Outfit','Segoe UI',sans-serif" }}>
      <nav style={{ background: "#0B1C2E", padding: "0 32px", display: "flex", alignItems: "center", height: 52 }}>
        <span style={{ color: "#2E86FF", fontWeight: 800, fontSize: 15, letterSpacing: "-0.02em" }}>YieldIntel</span>
        <div style={{ flex: 1 }} />
        <a href="/" style={{ color: "#94A3B8", fontSize: 12, textDecoration: "none" }}>← Back to App</a>
      </nav>
      {children}
    </div>
  );
}
