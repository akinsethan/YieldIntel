"use client";

import { C } from "@/lib/tokens";

interface TopBarProps {
  search: string;
  setSearch: (v: string) => void;
  spx: { price: string; change: string } | null;
  treasury?: { year2?: number; year10?: number } | null;
  notifications: number;
  user: { name: string; role: string } | null;
}

export function TopBar({ search, setSearch, spx, treasury, notifications, user }: TopBarProps) {
  const signOut = () => {
    localStorage.removeItem("yi_user");
    window.location.href = "/login";
  };

  return (
    <div style={{ height: 56, background: C.surface, borderBottom: `1px solid ${C.border}`, display: "flex", alignItems: "center", padding: "0 28px", gap: 16, position: "sticky", top: 0, zIndex: 9, boxShadow: "0 1px 4px rgba(11,28,46,0.05)" }}>

      {/* Search */}
      <div style={{ flex: 1, maxWidth: 380, position: "relative" }}>
        <span style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", color: C.textDim, fontSize: 13 }}>🔍</span>
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search clients, products, strategies..."
          style={{ width: "100%", background: C.surfaceHi, border: `1px solid ${C.border}`, borderRadius: 8, padding: "7px 12px 7px 32px", fontSize: 13, color: C.text, outline: "none", boxSizing: "border-box", fontFamily: "inherit" }}
        />
      </div>

      <div style={{ flex: 1 }} />

      {/* Live market tickers */}
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        {/* S&P */}
        <div style={{ display: "flex", alignItems: "center", gap: 6, padding: "5px 12px", background: C.surfaceHi, borderRadius: 8, border: `1px solid ${C.border}` }}>
          <div style={{ width: 6, height: 6, borderRadius: "50%", background: C.green }} />
          <span style={{ color: C.textMid, fontSize: 12, fontFamily: "monospace" }}>SPY {spx ? spx.price : "…"}</span>
          {spx && (
            <span style={{ color: parseFloat(spx.change) >= 0 ? C.green : C.red, fontSize: 12, fontFamily: "monospace", fontWeight: 700 }}>
              {parseFloat(spx.change) >= 0 ? "▲" : "▼"}{Math.abs(parseFloat(spx.change))}%
            </span>
          )}
        </div>
        {/* 2-yr Treasury */}
        {treasury?.year2 != null && (
          <div style={{ display: "flex", alignItems: "center", gap: 5, padding: "5px 12px", background: C.surfaceHi, borderRadius: 8, border: `1px solid ${C.border}` }}>
            <span style={{ color: C.textDim, fontSize: 11, fontFamily: "monospace" }}>2yr</span>
            <span style={{ color: C.teal, fontSize: 12, fontFamily: "monospace", fontWeight: 700 }}>{treasury.year2.toFixed(2)}%</span>
          </div>
        )}
        {/* 10-yr Treasury */}
        {treasury?.year10 != null && (
          <div style={{ display: "flex", alignItems: "center", gap: 5, padding: "5px 12px", background: C.surfaceHi, borderRadius: 8, border: `1px solid ${C.border}` }}>
            <span style={{ color: C.textDim, fontSize: 11, fontFamily: "monospace" }}>10yr</span>
            <span style={{ color: C.purple, fontSize: 12, fontFamily: "monospace", fontWeight: 700 }}>{treasury.year10.toFixed(2)}%</span>
          </div>
        )}
      </div>

      {/* Notifications */}
      <div style={{ position: "relative", cursor: "pointer", padding: 4 }}>
        <span style={{ fontSize: 18 }}>🔔</span>
        {notifications > 0 && (
          <div style={{ position: "absolute", top: 0, right: 0, width: 15, height: 15, borderRadius: "50%", background: C.red, color: "#fff", fontSize: 9, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center" }}>{notifications}</div>
        )}
      </div>

      {/* Profile */}
      <div style={{ display: "flex", alignItems: "center", gap: 8, paddingLeft: 12, borderLeft: `1px solid ${C.border}` }}>
        <div style={{ width: 32, height: 32, borderRadius: "50%", background: `linear-gradient(135deg,${C.blue},${C.teal})`, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 12, fontWeight: 700 }}>
          {user?.name?.charAt(0) ?? "?"}
        </div>
        <div>
          <div style={{ color: C.navy, fontSize: 12, fontWeight: 600, lineHeight: 1.2 }}>{user?.name ?? "Advisor"}</div>
          <div style={{ color: C.textDim, fontSize: 10, fontFamily: "monospace" }}>{user?.role ?? "advisor"}</div>
        </div>
        <button onClick={signOut} style={{ marginLeft: 8, padding: "4px 10px", background: "transparent", border: `1px solid ${C.border}`, borderRadius: 6, color: C.textMid, fontSize: 11, cursor: "pointer", fontFamily: "monospace" }}>
          Sign out
        </button>
      </div>
    </div>
  );
}
