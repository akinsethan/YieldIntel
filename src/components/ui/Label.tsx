import { C } from "@/lib/tokens";

export function Label({ children }: { children: React.ReactNode }) {
  return (
    <label style={{ display: "block", color: C.textMid, fontSize: 11, letterSpacing: "0.07em", textTransform: "uppercase", marginBottom: 6, fontFamily: "monospace", fontWeight: 600 }}>
      {children}
    </label>
  );
}
