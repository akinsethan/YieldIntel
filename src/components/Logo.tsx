import { C } from "@/lib/tokens";

export function YieldIntelLogo() {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
      <svg width="34" height="34" viewBox="0 0 34 34" fill="none">
        <rect width="34" height="34" rx="9" fill={C.navy} />
        <path d="M8 22 L13 16 L18 19 L26 10" stroke={C.teal} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
        <circle cx="26" cy="10" r="2.5" fill={C.blue} />
        <path d="M8 26 L26 26" stroke={C.blue} strokeWidth="1.5" strokeLinecap="round" opacity="0.4" />
      </svg>
      <div>
        <div style={{ color: C.navy, fontWeight: 900, fontSize: 15, letterSpacing: "-0.04em", lineHeight: 1 }}>
          Yield<span style={{ color: C.blue }}>Intel</span>
        </div>
        <div style={{ color: C.textDim, fontSize: 9.5, letterSpacing: "0.1em", textTransform: "uppercase", fontFamily: "monospace", marginTop: 2 }}>Advisor Platform</div>
      </div>
    </div>
  );
}

export function YieldIntelIcon() {
  return (
    <svg width="28" height="28" viewBox="0 0 34 34" fill="none">
      <rect width="34" height="34" rx="9" fill={C.navy} />
      <path d="M8 22 L13 16 L18 19 L26 10" stroke={C.teal} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="26" cy="10" r="2.5" fill={C.blue} />
    </svg>
  );
}
