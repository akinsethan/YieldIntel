"use client";

import { C } from "@/lib/tokens";

export function RunButton({ onClick, label }: { onClick: () => void; label: string }) {
  return (
    <button
      onClick={onClick}
      style={{ width: "100%", padding: "11px 0", background: C.blue, border: "none", borderRadius: 9, color: "#fff", fontFamily: "monospace", fontWeight: 700, fontSize: 13, cursor: "pointer", letterSpacing: "0.06em", boxShadow: `0 2px 12px ${C.blue}44` }}
    >
      {label}
    </button>
  );
}
