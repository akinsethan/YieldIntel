"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

const C = {
  navy: "#0A2342", teal: "#0D7377", bg: "#F4F6F9", surface: "#FFFFFF",
  border: "#E2E8F0", text: "#1A1A2E", textMid: "#64748B", textDim: "#94A3B8",
  red: "#DC2626", redDim: "#FEF2F2",
};

export default function LoginPage() {
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState("");
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const supabase = createClient();
    const { error: authError } = await supabase.auth.signInWithPassword({ email, password });

    if (authError) {
      setError("Invalid email or password. Please try again.");
      setLoading(false);
      return;
    }

    router.push("/dashboard/rates");
    router.refresh();
  }

  const inputStyle: React.CSSProperties = {
    width: "100%", padding: "11px 14px", background: C.bg, border: `1px solid ${C.border}`,
    borderRadius: 9, fontSize: 14, color: C.text, fontFamily: "inherit", outline: "none",
  };

  return (
    <div style={{ minHeight: "100vh", background: C.bg, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "24px 16px" }}>

      <Link href="/" style={{ display: "flex", alignItems: "center", gap: 9, marginBottom: 40, textDecoration: "none" }}>
        <div style={{ width: 32, height: 32, background: C.navy, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <span style={{ color: "#fff", fontSize: 14, fontWeight: 800, letterSpacing: "-0.02em" }}>Yi</span>
        </div>
        <span style={{ color: C.navy, fontWeight: 800, fontSize: 18, letterSpacing: "-0.02em" }}>YieldIntel</span>
      </Link>

      <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 16, padding: "36px 40px", width: "100%", maxWidth: 420, boxShadow: "0 4px 24px rgba(10,35,66,0.07)" }}>
        <h1 style={{ color: C.navy, fontSize: 22, fontWeight: 800, letterSpacing: "-0.03em", marginBottom: 6 }}>Sign in to your account</h1>
        <p style={{ color: C.textMid, fontSize: 13, marginBottom: 28 }}>
          Enter your credentials to access the rate platform.
        </p>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: C.textMid, letterSpacing: "0.07em", textTransform: "uppercase" as const, marginBottom: 6 }}>Email</label>
            <input
              type="email" value={email} onChange={e => setEmail(e.target.value)}
              style={inputStyle} placeholder="advisor@firm.com" required autoComplete="email"
              onFocus={e => (e.target.style.borderColor = C.teal)}
              onBlur={e => (e.target.style.borderColor = C.border)}
            />
          </div>

          <div style={{ marginBottom: 8 }}>
            <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: C.textMid, letterSpacing: "0.07em", textTransform: "uppercase" as const, marginBottom: 6 }}>Password</label>
            <input
              type="password" value={password} onChange={e => setPassword(e.target.value)}
              style={inputStyle} placeholder="••••••••" required autoComplete="current-password"
              onFocus={e => (e.target.style.borderColor = C.teal)}
              onBlur={e => (e.target.style.borderColor = C.border)}
            />
          </div>

          <div style={{ textAlign: "right", marginBottom: 20 }}>
            <a href="mailto:support@yieldintel.com?subject=Password Reset Request" style={{ color: C.teal, fontSize: 12, textDecoration: "none", fontWeight: 600 }}>
              Forgot password?
            </a>
          </div>

          {error && (
            <div style={{ background: C.redDim, borderRadius: 8, padding: "10px 14px", marginBottom: 16 }}>
              <p style={{ color: C.red, fontSize: 13 }}>{error}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={loading || !email || !password}
            style={{
              width: "100%", padding: "12px 24px",
              background: loading || !email || !password ? C.textDim : C.teal,
              border: "none", borderRadius: 9, color: "#fff", fontSize: 14, fontWeight: 700,
              cursor: loading || !email || !password ? "not-allowed" : "pointer",
            }}
          >
            {loading ? "Signing in…" : "Sign In"}
          </button>
        </form>
      </div>

      <p style={{ color: C.textDim, fontSize: 12, marginTop: 24, textAlign: "center" }}>
        Don&apos;t have access?{" "}
        <a href="mailto:demo@yieldintel.com?subject=Access Request" style={{ color: C.teal, textDecoration: "none", fontWeight: 600 }}>
          Request it here
        </a>
      </p>
    </div>
  );
}
