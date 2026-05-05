export interface LogEventParams {
  action: string;
  resource: string;
  detail?: string;
}

export async function logEvent({ action, resource, detail }: LogEventParams): Promise<void> {
  try {
    const stored = typeof window !== "undefined" ? localStorage.getItem("yi_user") : null;
    const user = stored ? JSON.parse(stored).email ?? JSON.parse(stored).name ?? "unknown" : "unknown";

    await fetch("/api/audit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ user, action, resource, detail }),
    });
  } catch {
    // Audit log failures are non-blocking
  }
}
