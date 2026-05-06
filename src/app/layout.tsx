import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "YieldIntel — Rate Intelligence for Annuity Producers",
  description: "Compare live annuity rates from 100+ carriers. MYGA, FIA, RILA, SPIA, and DIA — all in one platform.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
