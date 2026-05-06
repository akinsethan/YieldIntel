import { C } from "@/lib/tokens";
import { Card } from "./Card";

interface MetricCardProps {
  label: string;
  value: string;
  sub?: string;
  change?: number;
  icon: string;
}

export function MetricCard({ label, value, sub, change, icon }: MetricCardProps) {
  return (
    <Card>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div>
          <div style={{ color: C.textDim, fontSize: 11, letterSpacing: "0.07em", textTransform: "uppercase", fontFamily: "monospace", marginBottom: 8, fontWeight: 600 }}>{label}</div>
          <div style={{ color: C.navy, fontSize: 26, fontWeight: 800, letterSpacing: "-0.03em" }}>{value}</div>
          {sub && <div style={{ color: C.textMid, fontSize: 12, marginTop: 3 }}>{sub}</div>}
        </div>
        <div style={{ fontSize: 22 }}>{icon}</div>
      </div>
      {change !== undefined && (
        <div style={{ marginTop: 12, paddingTop: 12, borderTop: `1px solid ${C.border}`, display: "flex", alignItems: "center", gap: 6 }}>
          <span style={{ color: change >= 0 ? C.green : C.red, fontSize: 12, fontWeight: 700, fontFamily: "monospace" }}>
            {change >= 0 ? "▲" : "▼"} {Math.abs(change)}%
          </span>
          <span style={{ color: C.textDim, fontSize: 11 }}>vs last quarter</span>
        </div>
      )}
    </Card>
  );
}
