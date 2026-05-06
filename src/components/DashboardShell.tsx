"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { ToastProvider } from "@/components/ui/Toast";
import { C } from "@/lib/tokens";
import type { SessionUser } from "@/lib/auth";

interface NavItem {
  href:    string;
  label:   string;
  icon:    string;
  badge?:  string;
  dim?:    boolean;
}

const MAIN_NAV: NavItem[] = [
  { href: "/dashboard/rates",   label: "Rate Database",   icon: "◎" },
  { href: "/dashboard/screener",label: "Screener",        icon: "◈", badge: "Coming Soon", dim: true },
  { href: "/dashboard/compare", label: "Compare",         icon: "⊞", badge: "Coming Soon", dim: true },
  { href: "/dashboard/ai",      label: "AI Assistant",    icon: "◉", badge: "Phase 4",     dim: true },
];

const ADMIN_NAV: NavItem[] = [
  { href: "/admin/rates",    label: "Manage Rates",    icon: "⚙" },
  { href: "/admin/carriers", label: "Manage Carriers", icon: "◉" },
  { href: "/admin/products", label: "Manage Products", icon: "⊞" },
  { href: "/admin/import",   label: "Bulk Import",     icon: "↑" },
];

function NavLink({ item, collapsed }: { item: NavItem; collapsed: boolean }) {
  const pathname = usePathname();
  const active = pathname === item.href || pathname.startsWith(item.href + "/");

  return (
    <Link
      href={item.dim ? "#" : item.href}
      onClick={item.dim ? e => e.preventDefault() : undefined}
      title={item.dim ? (item.badge ?? "") : item.label}
      style={{
        display: "flex", alignItems: "center", gap: 10, padding: collapsed ? "9px 0" : "9px 12px",
        borderRadius: 8, textDecoration: "none",
        background: active ? C.teal + "18" : "transparent",
        color: item.dim ? C.textDim : active ? C.teal : C.textMid,
        fontSize: 13, fontWeight: active ? 700 : 500,
        cursor: item.dim ? "default" : "pointer",
        justifyContent: collapsed ? "center" : "flex-start",
        transition: "background 0.1s, color 0.1s",
        position: "relative",
      }}
    >
      <span style={{ fontSize: 15, flexShrink: 0, opacity: item.dim ? 0.5 : 1 }}>{item.icon}</span>
      {!collapsed && (
        <>
          <span style={{ opacity: item.dim ? 0.5 : 1 }}>{item.label}</span>
          {item.badge && (
            <span style={{
              marginLeft: "auto", fontSize: 9, fontWeight: 700, letterSpacing: "0.06em",
              background: item.badge === "Phase 4" ? C.gold + "22" : C.surfaceHi,
              color: item.badge === "Phase 4" ? C.gold : C.textDim,
              padding: "2px 7px", borderRadius: 10,
            }}>{item.badge}</span>
          )}
        </>
      )}
    </Link>
  );
}

export function DashboardShell({ user, children }: { user: SessionUser; children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);
  const router = useRouter();

  async function signOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  const initials = (user.full_name ?? user.email)
    .split(/\s+/).slice(0, 2).map(w => w[0]?.toUpperCase() ?? "").join("") || "U";

  const sidebarW = collapsed ? 64 : 232;

  return (
    <ToastProvider>
      <div style={{ display: "flex", minHeight: "100vh", background: C.bg }}>
        {/* Sidebar */}
        <aside style={{
          width: sidebarW, minWidth: sidebarW, background: C.surface, borderRight: `1px solid ${C.border}`,
          display: "flex", flexDirection: "column", position: "sticky", top: 0, height: "100vh",
          transition: "width 0.2s, min-width 0.2s", overflow: "hidden",
        }}>
          {/* Logo */}
          <div style={{ padding: collapsed ? "16px 0" : "16px 16px", borderBottom: `1px solid ${C.border}`, display: "flex", alignItems: "center", gap: 10, justifyContent: collapsed ? "center" : "flex-start" }}>
            <div style={{ width: 28, height: 28, background: C.navy, borderRadius: 6, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <span style={{ color: "#fff", fontSize: 12, fontWeight: 800, letterSpacing: "-0.02em" }}>Yi</span>
            </div>
            {!collapsed && <span style={{ color: C.navy, fontWeight: 800, fontSize: 15, letterSpacing: "-0.02em" }}>YieldIntel</span>}
          </div>

          {/* Nav */}
          <nav style={{ flex: 1, padding: collapsed ? "12px 8px" : "12px 10px", overflowY: "auto" }}>
            {/* Main */}
            {!collapsed && <div style={{ fontSize: 10, fontWeight: 700, color: C.textDim, letterSpacing: "0.1em", textTransform: "uppercase", padding: "4px 4px 8px", marginTop: 4 }}>Main</div>}
            <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
              {MAIN_NAV.map(item => <NavLink key={item.href} item={item} collapsed={collapsed} />)}
            </div>

            {/* Admin section — only shown for admin role */}
            {user.role === "admin" && (
              <>
                {!collapsed && <div style={{ fontSize: 10, fontWeight: 700, color: C.textDim, letterSpacing: "0.1em", textTransform: "uppercase", padding: "4px 4px 8px", marginTop: 16, borderTop: `1px solid ${C.border}`, paddingTop: 14 }}>Admin</div>}
                {collapsed && <div style={{ borderTop: `1px solid ${C.border}`, margin: "10px 0 6px" }} />}
                <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                  {ADMIN_NAV.map(item => <NavLink key={item.href} item={item} collapsed={collapsed} />)}
                </div>
              </>
            )}
          </nav>

          {/* Bottom: user + sign out */}
          <div style={{ padding: collapsed ? "12px 8px" : "12px 10px", borderTop: `1px solid ${C.border}` }}>
            {!collapsed && (
              <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 10px", marginBottom: 4 }}>
                <div style={{ width: 30, height: 30, background: C.teal, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <span style={{ color: "#fff", fontSize: 11, fontWeight: 700 }}>{initials}</span>
                </div>
                <div style={{ minWidth: 0 }}>
                  <div style={{ color: C.text, fontSize: 12, fontWeight: 600, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                    {user.full_name ?? user.email}
                  </div>
                  <div style={{ color: C.textDim, fontSize: 10, textTransform: "uppercase", letterSpacing: "0.08em" }}>{user.role}</div>
                </div>
              </div>
            )}
            <button
              onClick={signOut}
              style={{
                width: "100%", padding: collapsed ? "8px 0" : "8px 12px", background: "none", border: "none",
                borderRadius: 8, display: "flex", alignItems: "center", gap: 8,
                justifyContent: collapsed ? "center" : "flex-start",
                color: C.textMid, fontSize: 12, cursor: "pointer",
              }}
            >
              <span style={{ fontSize: 13 }}>→</span>
              {!collapsed && "Sign Out"}
            </button>
          </div>
        </aside>

        {/* Main content */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }}>
          {/* Top bar */}
          <header style={{ background: C.surface, borderBottom: `1px solid ${C.border}`, height: 52, display: "flex", alignItems: "center", padding: "0 24px", gap: 12, position: "sticky", top: 0, zIndex: 10 }}>
            <button
              onClick={() => setCollapsed(c => !c)}
              style={{ background: "none", border: "none", cursor: "pointer", color: C.textMid, fontSize: 16, padding: "4px 6px", borderRadius: 6, display: "flex", alignItems: "center" }}
              title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            >
              {collapsed ? "☰" : "✕"}
            </button>
            <div style={{ flex: 1 }} />
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <div style={{ width: 28, height: 28, background: C.teal, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <span style={{ color: "#fff", fontSize: 11, fontWeight: 700 }}>{initials}</span>
              </div>
              <span style={{ color: C.textMid, fontSize: 12 }}>{user.email}</span>
            </div>
          </header>

          <main style={{ flex: 1, overflow: "auto" }}>
            {children}
          </main>
        </div>
      </div>
    </ToastProvider>
  );
}
