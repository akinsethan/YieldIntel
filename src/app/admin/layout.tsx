"use client";

import { AdminToastProvider } from "@/components/ui/AdminToast";
import { C } from "@/lib/tokens";

const NAV = [
  { href: "/admin/carriers", label: "Carriers" },
  { href: "/admin/products", label: "Products" },
  { href: "/admin/rates",    label: "Rate Update" },
  { href: "/admin/import",   label: "Bulk Import" },
  { href: "/admin/audit",    label: "Audit Log" },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <AdminToastProvider>
      <div style={{ minHeight: "100vh", background: C.bg, color: C.text, fontFamily: "inherit" }}>
        <nav style={{ background: C.navy, padding: "0 32px", display: "flex", alignItems: "center", height: 52 }}>
          <span style={{ color: "#fff", fontWeight: 800, fontSize: 15, letterSpacing: "-0.02em", marginRight: 32 }}>YieldIntel Admin</span>
          {NAV.map(({ href, label }) => (
            <a key={href} href={href} style={{ color: "#94A3B8", fontSize: 13, padding: "0 16px", height: 52, display: "flex", alignItems: "center", textDecoration: "none" }}>
              {label}
            </a>
          ))}
          <div style={{ flex: 1 }} />
          <a href="/dashboard/rates" style={{ color: "#94A3B8", fontSize: 12, textDecoration: "none" }}>← Dashboard</a>
        </nav>
        {children}
      </div>
    </AdminToastProvider>
  );
}
