import { C } from "@/lib/tokens";

const BG_MAP: Record<string, string> = {
  [C.blue]:   C.blueDim,
  [C.green]:  C.greenDim,
  [C.red]:    C.redDim,
  [C.amber]:  C.amberDim,
  [C.teal]:   C.tealDim,
  [C.purple]: C.purpleDim,
};

export function Pill({ children, color = C.blue }: { children: React.ReactNode; color?: string }) {
  return (
    <span style={{ display: "inline-block", padding: "3px 9px", borderRadius: 99, fontSize: 11, fontFamily: "monospace", fontWeight: 700, letterSpacing: "0.04em", background: BG_MAP[color] ?? C.blueDim, color }}>
      {children}
    </span>
  );
}
