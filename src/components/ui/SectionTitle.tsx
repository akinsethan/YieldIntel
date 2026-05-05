import { C } from "@/lib/tokens";

export function SectionTitle({ children, sub }: { children: React.ReactNode; sub?: string }) {
  return (
    <div style={{ marginBottom: 20 }}>
      <div style={{ color: C.navy, fontSize: 15, fontWeight: 700, letterSpacing: "-0.02em" }}>{children}</div>
      {sub && <div style={{ color: C.textDim, fontSize: 12, marginTop: 2 }}>{sub}</div>}
    </div>
  );
}
