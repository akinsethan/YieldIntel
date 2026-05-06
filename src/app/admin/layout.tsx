"use client";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ minHeight: "100vh", background: "#F8FAFC", color: "#0B1C2E", fontFamily: "'Geist','Outfit','Segoe UI',sans-serif" }}>
      <nav style={{ background: "#0B1C2E", padding: "0 32px", display: "flex", alignItems: "center", gap: 0, height: 52 }}>
        <span style={{ color: "#2E86FF", fontWeight: 800, fontSize: 15, letterSpacing: "-0.02em", marginRight: 32 }}>YieldIntel Admin</span>
        {[
          { href: "/admin/carriers", label: "Carriers" },
          { href: "/admin/products", label: "Products" },
          { href: "/admin/rates",    label: "Rate Update" },
          { href: "/admin/import",   label: "Bulk Import" },
        ].map(({ href, label }) => (
          <a key={href} href={href} style={{ color: "#94A3B8", fontSize: 13, padding: "0 16px", height: 52, display: "flex", alignItems: "center", textDecoration: "none" }}>
            {label}
          </a>
        ))}
        <div style={{ flex: 1 }} />
        <a href="/" style={{ color: "#94A3B8", fontSize: 12, textDecoration: "none" }}>← Back to App</a>
      </nav>
      {children}
    </div>
  );
}
