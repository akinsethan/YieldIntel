import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export interface SessionUser {
  id: string;
  email: string;
  role: "admin" | "advisor";
  full_name: string | null;
}

export async function getSessionUser(): Promise<SessionUser | null> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("role, full_name")
    .eq("id", user.id)
    .single();

  return {
    id:        user.id,
    email:     user.email ?? "",
    role:      (profile?.role as "admin" | "advisor") ?? "advisor",
    full_name: profile?.full_name ?? null,
  };
}

export async function requireAuth(): Promise<SessionUser> {
  const user = await getSessionUser();
  if (!user) redirect("/login");
  return user;
}

export async function requireAdmin(): Promise<SessionUser> {
  const user = await requireAuth();
  if (user.role !== "admin") redirect("/dashboard/rates");
  return user;
}
