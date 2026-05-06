import type { Metadata } from "next";
import { DashboardPage } from "@/components/pages/DashboardPage";

export const metadata: Metadata = { title: "Dashboard — YieldIntel" };
export default function DashboardHome() { return <DashboardPage />; }
