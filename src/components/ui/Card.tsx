import { C } from "@/lib/tokens";

export function Card({ children, style = {} }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <div style={{ background: C.surface, borderRadius: 14, border: `1px solid ${C.border}`, padding: 24, boxShadow: "0 1px 4px rgba(11,28,46,0.06)", ...style }}>
      {children}
    </div>
  );
}
