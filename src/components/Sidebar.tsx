"use client";

import { C } from "@/lib/tokens";
import { NAV_ITEMS } from "@/lib/data";
import { YieldIntelLogo, YieldIntelIcon } from "./Logo";

type PageKey = string;

interface SidebarProps {
  page: PageKey;
  setPage: (p: PageKey) => void;
  collapsed: boolean;
  setCollapsed: (v: boolean) => void;
  expanded: string[];
  setExpanded: (e: string[]) => void;
}

export function Sidebar({ page, setPage, collapsed, setCollapsed, expanded, setExpanded }: SidebarProps) {
  const sidebarW = collapsed ? 64 : 230;

  const toggleExpand = (id: string) =>
    setExpanded(expanded.includes(id) ? expanded.filter(x => x !== id) : [...expanded, id]);

  const navBtnStyle = (isActive: boolean): React.CSSProperties => ({
    display: "flex", alignItems: "center", gap: 10, width: "100%",
    padding: collapsed ? "10px 0" : "9px 12px",
    justifyContent: collapsed ? "center" : "flex-start",
    borderRadius: 9, border: "none", cursor: "pointer",
    background: isActive ? C.blueDim : "transparent",
    color: isActive ? C.blue : C.textMid,
    fontSize: 13, fontWeight: isActive ? 700 : 400,
    marginBottom: 2, textAlign: "left", transition: "all 0.15s",
    borderLeft: isActive ? `3px solid ${C.blue}` : "3px solid transparent",
    boxSizing: "border-box",
  });

  return (
    <div style={{ width: sidebarW, minHeight: "100vh", background: C.surface, borderRight: `1px solid ${C.border}`, display: "flex", flexDirection: "column", position: "fixed", top: 0, left: 0, zIndex: 10, boxShadow: "2px 0 12px rgba(11,28,46,0.06)", transition: "width 0.2s", overflow: "hidden" }}>

      {/* Logo row */}
      <div style={{ padding: collapsed ? "16px 0" : "18px 16px", borderBottom: `1px solid ${C.border}`, display: "flex", alignItems: "center", justifyContent: collapsed ? "center" : "space-between", minHeight: 64 }}>
        {collapsed ? <YieldIntelIcon /> : <YieldIntelLogo />}
        {!collapsed && (
          <button onClick={() => setCollapsed(true)} style={{ background: "none", border: "none", cursor: "pointer", color: C.textDim, fontSize: 20, padding: 4, lineHeight: 1 }}>‹</button>
        )}
      </div>

      {/* Expand toggle when collapsed */}
      {collapsed && (
        <button onClick={() => setCollapsed(false)} style={{ background: "none", border: "none", cursor: "pointer", color: C.textDim, fontSize: 20, padding: "6px 0", textAlign: "center", borderBottom: `1px solid ${C.border}`, width: "100%" }}>›</button>
      )}

      {/* Nav items */}
      <nav style={{ flex: 1, padding: collapsed ? "10px 6px" : "12px 10px", overflowY: "auto" }}>
        {!collapsed && (
          <div style={{ color: C.textDim, fontSize: 10, letterSpacing: "0.1em", textTransform: "uppercase", fontFamily: "monospace", padding: "4px 10px 10px", fontWeight: 600 }}>Navigation</div>
        )}

        {NAV_ITEMS.map(item => {
          const hasChildren   = item.children && item.children.length > 0;
          const isExpanded    = expanded.includes(item.id);
          const isChildActive = hasChildren && item.children.some(c => c.id === page);
          const isActive      = page === item.id || isChildActive;

          return (
            <div key={item.id}>
              <button
                onClick={() => hasChildren ? toggleExpand(item.id) : setPage(item.id)}
                style={navBtnStyle(isActive)}
                onMouseEnter={e => { if (!isActive) { e.currentTarget.style.background = C.surfaceHi; e.currentTarget.style.color = C.navy; } }}
                onMouseLeave={e => { if (!isActive) { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = C.textMid; } }}
                title={collapsed ? item.label : undefined}
              >
                <span style={{ fontSize: 15, flexShrink: 0 }}>{item.icon}</span>
                {!collapsed && <span style={{ flex: 1 }}>{item.label}</span>}
                {!collapsed && hasChildren && (
                  <span style={{ fontSize: 9, opacity: 0.4, transition: "transform 0.2s", display: "inline-block", transform: isExpanded ? "rotate(90deg)" : "rotate(0deg)" }}>▶</span>
                )}
              </button>

              {!collapsed && hasChildren && isExpanded && item.children.map(child => {
                const isChildPage = page === child.id;
                return (
                  <button key={child.id} onClick={() => setPage(child.id)}
                    style={{ display: "flex", alignItems: "center", gap: 8, width: "100%", padding: "7px 12px 7px 34px", borderRadius: 8, border: "none", cursor: "pointer", background: isChildPage ? C.blueDim : "transparent", color: isChildPage ? C.blue : C.textMid, fontSize: 12, fontWeight: isChildPage ? 700 : 400, marginBottom: 1, textAlign: "left", borderLeft: isChildPage ? `3px solid ${C.blue}` : "3px solid transparent", boxSizing: "border-box", transition: "all 0.12s" }}
                    onMouseEnter={e => { if (!isChildPage) { e.currentTarget.style.background = C.surfaceHi; e.currentTarget.style.color = C.navy; } }}
                    onMouseLeave={e => { if (!isChildPage) { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = C.textMid; } }}>
                    <span style={{ width: 5, height: 5, borderRadius: "50%", background: isChildPage ? C.blue : C.textDim, flexShrink: 0 }} />
                    {child.label}
                  </button>
                );
              })}
            </div>
          );
        })}
      </nav>
    </div>
  );
}
