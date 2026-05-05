"use client";

import { useState, useEffect } from "react";
import { C } from "@/lib/tokens";
import { fetchQuote } from "@/lib/api";
import { Sidebar } from "@/components/Sidebar";
import { TopBar } from "@/components/TopBar";
import { DashboardPage } from "@/components/pages/DashboardPage";
import { ClientPlannerPage } from "@/components/pages/ClientPlannerPage";
import { RILASimulatorPage } from "@/components/pages/RILASimulatorPage";
import { MarketResearchPage } from "@/components/pages/MarketResearchPage";
import { MYGAScreenerPage } from "@/components/pages/MYGAScreenerPage";
import { ProductComparisonPage } from "@/components/pages/ProductComparisonPage";
import { SettingsPage } from "@/components/pages/SettingsPage";
import { PlaceholderPage } from "@/components/pages/PlaceholderPage";
import { YieldBot } from "@/components/YieldBot";

const PAGE_MAP = {
  dashboard:     () => <DashboardPage />,
  clientplanner: () => <ClientPlannerPage />,
  myga:          () => <MYGAScreenerPage />,
  rila:          () => <RILASimulatorPage />,
  research:      () => <MarketResearchPage />,
  compare:       () => <ProductComparisonPage />,
  products:      () => <PlaceholderPage title="Products" icon="⊞" description="Browse and manage annuity products. Full product library with filtering, sorting, and detailed product sheets." />,
  strategy:      () => <PlaceholderPage title="Strategy Builder" icon="◇" description="Build and save custom retirement strategies combining multiple products, income sources, and client scenarios." />,
  settings:      () => <SettingsPage />,
  rates:         () => <MYGAScreenerPage />,
} as const;

type PageKey = keyof typeof PAGE_MAP;

export default function App() {
  const [page, setPage]           = useState<PageKey>("dashboard");
  const [collapsed, setCollapsed] = useState(false);
  const [expanded, setExpanded]   = useState(["clients", "simulators"]);
  const [search, setSearch]       = useState("");
  const [spx, setSpx]             = useState<{ price: string; change: string } | null>(null);
  const [user, setUser]           = useState<{ name: string; role: string; email: string } | null>(null);
  const [authChecked, setAuthChecked] = useState(false);

  useEffect(() => { fetchQuote("SPY").then(setSpx); }, []);

  useEffect(() => {
    const stored = localStorage.getItem("yi_user");
    if (stored) setUser(JSON.parse(stored));
    setAuthChecked(true);
  }, []);

  if (!authChecked) {
    return (
      <div style={{ minHeight: "100vh", background: C.bg, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ color: C.textDim, fontFamily: "monospace", fontSize: 14 }}>Loading...</div>
      </div>
    );
  }

  if (!user) {
    if (typeof window !== "undefined") window.location.href = "/login";
    return null;
  }

  const sidebarW  = collapsed ? 64 : 230;
  const ActivePage = PAGE_MAP[page];

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: C.bg, color: C.text, fontFamily: "'Geist','Outfit','Segoe UI',sans-serif" }}>
      <Sidebar
        page={page}
        setPage={p => setPage(p as PageKey)}
        collapsed={collapsed}
        setCollapsed={setCollapsed}
        expanded={expanded}
        setExpanded={setExpanded}
      />

      <div style={{ marginLeft: sidebarW, flex: 1, display: "flex", flexDirection: "column", minHeight: "100vh", transition: "margin-left 0.2s" }}>
        <TopBar
          search={search}
          setSearch={setSearch}
          spx={spx}
          notifications={3}
          user={user}
        />
        <div style={{ flex: 1, padding: "32px 36px", overflowX: "hidden" }}>
          <ActivePage />
        </div>
      </div>
      <YieldBot />
    </div>
  );
}
