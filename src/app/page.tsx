import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "YieldIntel — Rate Intelligence for Annuity Producers",
  description: "Compare live annuity rates from 100+ carriers. Every MYGA, FIA, RILA, SPIA, and DIA in one platform — updated in real time.",
};

const N  = "#0A2342";
const T  = "#0D7377";
const G  = "#C9982A";
const BG = "#F4F6F9";
const SU = "#FFFFFF";
const BD = "#E2E8F0";
const TM = "#64748B";
const TD = "#94A3B8";

// ── Mock rate table rows shown in hero ──────────────────────────────────────
const MOCK_RATES = [
  { carrier: "Athene Annuity",      rating: "A",   type: "MYGA", term: "5 yr", index: "Declared Rate",      cap: "5.65%", fresh: "#059669" },
  { carrier: "American Equity",     rating: "A-",  type: "FIA",  term: "7 yr", index: "S&P 500 Ann. PTP",   cap: "9.75%", fresh: "#059669" },
  { carrier: "Allianz Life",        rating: "A+",  type: "RILA", term: "6 yr", index: "S&P 500 Buff. 10%",  cap: "12.50%",fresh: "#D97706" },
  { carrier: "North American",      rating: "A+",  type: "MYGA", term: "7 yr", index: "Declared Rate",      cap: "5.40%", fresh: "#059669" },
  { carrier: "Global Atlantic",     rating: "A",   type: "FIA",  term: "10 yr",index: "S&P 500 Ann. PTP",   cap: "8.25%", fresh: "#D97706" },
];

const TYPE_COLORS: Record<string, string> = { FIA: "#2E86FF", MYGA: "#0D7377", RILA: "#7C3AED", SPIA: "#059669", DIA: "#D97706" };

// ── Components ────────────────────────────────────────────────────────────────

function NavBar() {
  return (
    <nav style={{ position: "sticky", top: 0, zIndex: 50, background: N, borderBottom: `1px solid rgba(255,255,255,0.08)` }}>
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 32px", height: 60, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 28, height: 28, background: T, borderRadius: 6, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <span style={{ color: "#fff", fontSize: 14, fontWeight: 800, letterSpacing: "-0.02em" }}>Yi</span>
          </div>
          <span style={{ color: "#fff", fontWeight: 800, fontSize: 16, letterSpacing: "-0.02em" }}>YieldIntel</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <Link href="/login" style={{ padding: "8px 20px", background: T, borderRadius: 8, color: "#fff", fontSize: 13, fontWeight: 700, textDecoration: "none", letterSpacing: "0.01em" }}>
            Sign In
          </Link>
        </div>
      </div>
    </nav>
  );
}

function Hero() {
  return (
    <section style={{ background: N, paddingTop: 80, paddingBottom: 64, overflow: "hidden" }}>
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 32px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 64, alignItems: "center" }}>
          {/* Left */}
          <div>
            <div style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "rgba(13,115,119,0.2)", border: "1px solid rgba(13,115,119,0.4)", borderRadius: 20, padding: "5px 14px", marginBottom: 24 }}>
              <span style={{ width: 6, height: 6, background: T, borderRadius: "50%", display: "inline-block" }} />
              <span style={{ color: T, fontSize: 11, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase" }}>Live Rate Intelligence</span>
            </div>

            <h1 style={{ color: "#FFFFFF", fontSize: 48, fontWeight: 800, lineHeight: 1.08, letterSpacing: "-0.04em", marginBottom: 20 }}>
              The Rate Intelligence Platform for<br />
              <span style={{ color: T }}>Annuity Producers</span>
            </h1>

            <p style={{ color: "#94A3B8", fontSize: 17, lineHeight: 1.65, marginBottom: 36, maxWidth: 480 }}>
              Compare live rates from 100+ carriers across MYGA, FIA, RILA, SPIA, and DIA. Spot opportunities before your competitors do. Close more business.
            </p>

            <div style={{ display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
              <Link href="/login" style={{ padding: "14px 32px", background: T, borderRadius: 10, color: "#fff", fontSize: 15, fontWeight: 700, textDecoration: "none", letterSpacing: "0.01em" }}>
                Sign In to Your Account
              </Link>
              <a href="mailto:demo@yieldintel.com?subject=Demo Request" style={{ padding: "14px 28px", background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 10, color: "#FFFFFF", fontSize: 15, fontWeight: 600, textDecoration: "none" }}>
                Request a Demo
              </a>
            </div>
          </div>

          {/* Right — mock rate table */}
          <div>
            <div style={{ background: SU, borderRadius: 14, overflow: "hidden", boxShadow: "0 25px 60px rgba(0,0,0,0.4)", border: "1px solid rgba(255,255,255,0.08)" }}>
              <div style={{ background: "#F8FAFC", borderBottom: `1px solid ${BD}`, padding: "12px 16px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <span style={{ color: N, fontSize: 12, fontWeight: 700, letterSpacing: "0.04em" }}>LIVE RATE DATABASE</span>
                <div style={{ display: "flex", gap: 5 }}>
                  {["FIA", "MYGA", "RILA"].map(t => (
                    <span key={t} style={{ background: (TYPE_COLORS[t] ?? BD) + "22", color: TYPE_COLORS[t], fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 4 }}>{t}</span>
                  ))}
                </div>
              </div>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
                <thead>
                  <tr style={{ borderBottom: `1px solid ${BD}`, background: "#F8FAFC" }}>
                    {["Carrier", "Rating", "Type", "Cap / Rate", "Updated"].map(h => (
                      <th key={h} style={{ padding: "8px 12px", textAlign: "left", color: TM, fontWeight: 600, fontSize: 10, letterSpacing: "0.06em", textTransform: "uppercase" }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {MOCK_RATES.map((r, i) => (
                    <tr key={i} style={{ borderBottom: i < MOCK_RATES.length - 1 ? `1px solid ${BD}` : "none" }}>
                      <td style={{ padding: "10px 12px", fontWeight: 600, color: N, whiteSpace: "nowrap" }}>{r.carrier}</td>
                      <td style={{ padding: "10px 12px", color: "#059669", fontWeight: 700, fontSize: 11 }}>{r.rating}</td>
                      <td style={{ padding: "10px 12px" }}>
                        <span style={{ background: (TYPE_COLORS[r.type] ?? BD) + "22", color: TYPE_COLORS[r.type], fontSize: 10, fontWeight: 700, padding: "2px 7px", borderRadius: 4 }}>{r.type}</span>
                      </td>
                      <td style={{ padding: "10px 12px", fontFamily: "monospace", fontWeight: 700, color: N }}>{r.cap}</td>
                      <td style={{ padding: "10px 12px" }}>
                        <span style={{ color: r.fresh, fontSize: 10, fontWeight: 700 }}>● Today</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div style={{ padding: "10px 14px", borderTop: `1px solid ${BD}`, background: "#F8FAFC", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ color: TD, fontSize: 10 }}>Showing 5 of 847 current rates</span>
                <span style={{ color: T, fontSize: 10, fontWeight: 700 }}>↓ Export CSV</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function PainPoints() {
  const pains = [
    {
      icon: "📋",
      title: "Chasing 50 Rate Sheets a Week",
      body: "Rate updates arrive via email, fax, and carrier portals — with no way to compare them in one place. You spend hours on admin instead of closing.",
    },
    {
      icon: "⏱️",
      title: "Missing Rate Changes That Cost Deals",
      body: "A 25bps cap increase goes unnoticed. Your client places with a competitor while you were checking your inbox. Speed wins in this market.",
    },
    {
      icon: "📄",
      title: "Manual Compliance From Scratch",
      body: "Every illustration, every quote — recreated manually for every deal. That's time you're not selling and compliance exposure you don't need.",
    },
  ];

  return (
    <section style={{ background: SU, borderTop: `1px solid ${BD}`, borderBottom: `1px solid ${BD}` }}>
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "80px 32px" }}>
        <div style={{ textAlign: "center", marginBottom: 56 }}>
          <p style={{ color: T, fontSize: 12, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 12 }}>THE PROBLEM</p>
          <h2 style={{ color: N, fontSize: 36, fontWeight: 800, letterSpacing: "-0.03em", lineHeight: 1.15 }}>
            Annuity producers waste hours every week<br />on work that should take minutes.
          </h2>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 24 }}>
          {pains.map(p => (
            <div key={p.title} style={{ background: BG, border: `1px solid ${BD}`, borderRadius: 14, padding: 28 }}>
              <div style={{ fontSize: 32, marginBottom: 16 }}>{p.icon}</div>
              <h3 style={{ color: N, fontSize: 17, fontWeight: 700, marginBottom: 10, lineHeight: 1.3 }}>{p.title}</h3>
              <p style={{ color: TM, fontSize: 14, lineHeight: 1.65 }}>{p.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Features() {
  const pillars = [
    {
      icon: "◎",
      color: T,
      title: "Real-Time Rate Database",
      body: "Every carrier, every product, every rate — updated by your team and surfaced instantly. Filter by type, AM Best rating, surrender period, and cap rate.",
    },
    {
      icon: "◈",
      color: G,
      title: "AI Research Assistant",
      body: "Ask any question about the rate environment, product features, or competitive positioning. Get answers sourced from live data, not stale training data.",
      badge: "Phase 4",
    },
    {
      icon: "◉",
      color: "#7C3AED",
      title: "Compliance Infrastructure",
      body: "Compliance-ready output from first quote to signed contract. Illustrations, disclosures, and Reg BI documentation generated automatically.",
      badge: "Coming Soon",
    },
    {
      icon: "⊞",
      color: "#2E86FF",
      title: "Full Sales Pipeline",
      body: "Track every opportunity from lead to placed contract. See which clients are up for renewal, which carriers are competitive, and where every deal stands.",
      badge: "Coming Soon",
    },
  ];

  return (
    <section style={{ background: BG }}>
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "80px 32px" }}>
        <div style={{ textAlign: "center", marginBottom: 56 }}>
          <p style={{ color: T, fontSize: 12, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 12 }}>WHAT YIELDINTEL DOES</p>
          <h2 style={{ color: N, fontSize: 36, fontWeight: 800, letterSpacing: "-0.03em", lineHeight: 1.15 }}>
            One platform. Every tool you need<br />to win more annuity business.
          </h2>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(2,1fr)", gap: 20 }}>
          {pillars.map(p => (
            <div key={p.title} style={{ background: SU, border: `1px solid ${BD}`, borderRadius: 14, padding: 32, position: "relative" }}>
              {p.badge && (
                <span style={{ position: "absolute", top: 20, right: 20, background: p.badge === "Phase 4" ? G + "22" : "#F1F5F9", color: p.badge === "Phase 4" ? G : TM, fontSize: 10, fontWeight: 700, padding: "3px 9px", borderRadius: 20, letterSpacing: "0.06em" }}>
                  {p.badge}
                </span>
              )}
              <div style={{ width: 44, height: 44, background: p.color + "18", borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 18, fontSize: 20, color: p.color }}>
                {p.icon}
              </div>
              <h3 style={{ color: N, fontSize: 19, fontWeight: 700, marginBottom: 10, letterSpacing: "-0.01em" }}>{p.title}</h3>
              <p style={{ color: TM, fontSize: 14, lineHeight: 1.7 }}>{p.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function HowItWorks() {
  const steps = [
    {
      n: "01",
      title: "Search & Filter",
      body: "Find the right MYGA, FIA, or RILA for your client in seconds using our live rate database. Filter by type, carrier, AM Best rating, surrender period, and minimum cap.",
    },
    {
      n: "02",
      title: "Compare & Illustrate",
      body: "Side-by-side carrier comparisons with projected growth, surrender schedules, and fee breakdowns. Show your clients exactly why your recommendation is right for them.",
    },
    {
      n: "03",
      title: "Document & Close",
      body: "Compliance-ready illustrations and Reg BI documentation generated automatically. Track the deal from quote to placed contract, all in one place.",
    },
  ];

  return (
    <section style={{ background: SU, borderTop: `1px solid ${BD}`, borderBottom: `1px solid ${BD}` }}>
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "80px 32px" }}>
        <div style={{ textAlign: "center", marginBottom: 56 }}>
          <p style={{ color: T, fontSize: 12, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 12 }}>HOW IT WORKS</p>
          <h2 style={{ color: N, fontSize: 36, fontWeight: 800, letterSpacing: "-0.03em" }}>
            From rate search to closed deal<br />in three steps.
          </h2>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 0, position: "relative" }}>
          {steps.map((s, i) => (
            <div key={s.n} style={{ padding: "0 32px", borderRight: i < steps.length - 1 ? `1px solid ${BD}` : "none", paddingTop: 0 }}>
              <div style={{ fontSize: 42, fontWeight: 800, color: BD, fontFamily: "monospace", letterSpacing: "-0.04em", marginBottom: 16 }}>{s.n}</div>
              <h3 style={{ color: N, fontSize: 20, fontWeight: 700, marginBottom: 10, letterSpacing: "-0.01em" }}>{s.title}</h3>
              <p style={{ color: TM, fontSize: 14, lineHeight: 1.7 }}>{s.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function TrustBar() {
  const stats = [
    { value: "110+",     label: "Carriers in Database" },
    { value: "Reg BI",   label: "Compliance Built-In" },
    { value: "SOC 2",    label: "Security In Progress" },
    { value: "Live",     label: "Rate Updates Daily" },
  ];

  return (
    <section style={{ background: N }}>
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "56px 32px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 0 }}>
          {stats.map((s, i) => (
            <div key={s.value} style={{ textAlign: "center", borderRight: i < stats.length - 1 ? "1px solid rgba(255,255,255,0.1)" : "none", padding: "0 24px" }}>
              <div style={{ color: T, fontSize: 36, fontWeight: 800, letterSpacing: "-0.03em", marginBottom: 6, fontFamily: "monospace" }}>{s.value}</div>
              <div style={{ color: "rgba(255,255,255,0.55)", fontSize: 13, fontWeight: 500 }}>{s.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function CTA() {
  return (
    <section style={{ background: BG }}>
      <div style={{ maxWidth: 700, margin: "0 auto", padding: "80px 32px", textAlign: "center" }}>
        <h2 style={{ color: N, fontSize: 36, fontWeight: 800, letterSpacing: "-0.03em", marginBottom: 16, lineHeight: 1.15 }}>
          Ready to stop chasing rate sheets?
        </h2>
        <p style={{ color: TM, fontSize: 16, lineHeight: 1.65, marginBottom: 36 }}>
          YieldIntel is invitation-only. Request access and our team will set you up within 24 hours.
        </p>
        <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
          <Link href="/login" style={{ padding: "14px 36px", background: N, borderRadius: 10, color: "#fff", fontSize: 15, fontWeight: 700, textDecoration: "none" }}>
            Sign In
          </Link>
          <a href="mailto:demo@yieldintel.com?subject=Access Request" style={{ padding: "14px 32px", background: SU, border: `1px solid ${BD}`, borderRadius: 10, color: N, fontSize: 15, fontWeight: 600, textDecoration: "none" }}>
            Request Access
          </a>
        </div>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer style={{ background: N, borderTop: "1px solid rgba(255,255,255,0.08)" }}>
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "40px 32px 32px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 32, flexWrap: "wrap", gap: 24 }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
              <div style={{ width: 24, height: 24, background: T, borderRadius: 5, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <span style={{ color: "#fff", fontSize: 11, fontWeight: 800 }}>Yi</span>
              </div>
              <span style={{ color: "#fff", fontWeight: 800, fontSize: 14 }}>YieldIntel</span>
            </div>
            <p style={{ color: "rgba(255,255,255,0.4)", fontSize: 13, maxWidth: 280, lineHeight: 1.55 }}>
              Rate intelligence for producing annuity advisors.
            </p>
          </div>
          <div style={{ display: "flex", gap: 32, flexWrap: "wrap" }}>
            <div>
              <div style={{ color: "rgba(255,255,255,0.25)", fontSize: 10, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 12 }}>PLATFORM</div>
              {["Sign In", "Request Access"].map(l => (
                <div key={l} style={{ marginBottom: 8 }}>
                  <a href={l === "Sign In" ? "/login" : "mailto:demo@yieldintel.com"} style={{ color: "rgba(255,255,255,0.5)", fontSize: 13, textDecoration: "none" }}>{l}</a>
                </div>
              ))}
            </div>
            <div>
              <div style={{ color: "rgba(255,255,255,0.25)", fontSize: 10, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 12 }}>LEGAL</div>
              {["Privacy Policy", "Terms of Service", "Contact"].map(l => (
                <div key={l} style={{ marginBottom: 8 }}>
                  <a href="#" style={{ color: "rgba(255,255,255,0.5)", fontSize: 13, textDecoration: "none" }}>{l}</a>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div style={{ borderTop: "1px solid rgba(255,255,255,0.08)", paddingTop: 20 }}>
          <p style={{ color: "rgba(255,255,255,0.3)", fontSize: 11, lineHeight: 1.6 }}>
            YieldIntel is a research and data analytics platform for licensed financial professionals. Not investment advice. Rate information is provided for research purposes only and is subject to change without notice. Verify current rates directly with the carrier before client placement. © {new Date().getFullYear()} YieldIntel.
          </p>
        </div>
      </div>
    </footer>
  );
}

export default function LandingPage() {
  return (
    <>
      <NavBar />
      <Hero />
      <PainPoints />
      <Features />
      <HowItWorks />
      <TrustBar />
      <CTA />
      <Footer />
    </>
  );
}
