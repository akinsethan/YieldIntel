import { C } from "@/lib/tokens";
import { fmtM, fmt } from "@/lib/utils";

interface Payload {
  color: string;
  name: string;
  value: number;
}

export function CustomTooltip({ active, payload, label }: { active?: boolean; payload?: Payload[]; label?: string }) {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 10, padding: "10px 14px", fontSize: 12, fontFamily: "monospace", boxShadow: "0 4px 20px rgba(11,28,46,0.12)" }}>
      <div style={{ color: C.textMid, marginBottom: 6, fontWeight: 600 }}>{label}</div>
      {payload.map((p, i) => (
        <div key={i} style={{ color: p.color, marginBottom: 2 }}>
          {p.name}: {typeof p.value === "number" && p.value > 10000 ? fmtM(p.value) : fmt(p.value)}
        </div>
      ))}
    </div>
  );
}
