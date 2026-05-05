import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";
import SessionWrapper from "./SessionWrapper";

const geist = Geist({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "YieldIntel",
  description: "Advisor Platform",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={geist.className}>
        <SessionWrapper session={null}>
          {children}
        </SessionWrapper>
      </body>
    </html>
  );
}