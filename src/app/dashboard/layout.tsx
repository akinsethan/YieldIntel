import type { Metadata } from "next";
import { DashboardShell } from "@/components/DashboardShell";
import { requireAuth } from "@/lib/auth";

export const metadata: Metadata = {
  title: "Rate Database — YieldIntel",
  description: "Live annuity rate database for licensed advisors.",
};

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const user = await requireAuth();
  return <DashboardShell user={user}>{children}</DashboardShell>;
}
