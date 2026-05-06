import type { Metadata } from "next";
import { RateDatabasePage } from "@/components/pages/RateDatabasePage";

export const metadata: Metadata = {
  title: "Rate Database — YieldIntel",
  description: "Live annuity rates from 100+ carriers. Filter, sort, and export.",
};

export default function DashboardRatesPage() {
  return <RateDatabasePage />;
}
