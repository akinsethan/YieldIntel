import { supabaseAdmin } from "@/lib/db";

export interface LogActionParams {
  userId?: string;
  action: "CREATE" | "UPDATE" | "DELETE" | "VIEW" | "EXPORT" | "LOGIN" | "LOGOUT" | "YIELDBOT";
  tableName: string;
  recordId?: string;
  oldValues?: Record<string, unknown>;
  newValues?: Record<string, unknown>;
  ipAddress?: string;
}

export async function logAction(params: LogActionParams): Promise<void> {
  try {
    await supabaseAdmin.from("audit_log").insert({
      user_id:    params.userId    ?? null,
      action:     params.action,
      table_name: params.tableName,
      record_id:  params.recordId  ?? null,
      old_values: params.oldValues ?? null,
      new_values: params.newValues ?? null,
      ip_address: params.ipAddress ?? null,
    });
  } catch {
    // Audit log failures are non-blocking — log to console but don't throw
    console.error("[audit] Failed to write audit log entry", params);
  }
}

// Lightweight client-side helper — calls /api/audit HTTP endpoint
export async function logEvent(action: string, resource: string, detail?: string): Promise<void> {
  try {
    const stored = typeof window !== "undefined" ? localStorage.getItem("yi_user") : null;
    const parsed = stored ? JSON.parse(stored) : null;
    const user = parsed?.email ?? parsed?.name ?? "unknown";
    await fetch("/api/audit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ user, action, resource, detail }),
    });
  } catch {
    // non-blocking
  }
}
