import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sign In — YieldIntel",
  description: "Sign in to YieldIntel to access the live annuity rate database.",
};

export default function LoginLayout({ children }: { children: React.ReactNode }) {
  return children;
}
