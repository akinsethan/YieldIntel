import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export interface AuditEvent {
  id: string;
  ts: string;
  user: string;
  action: string;
  resource: string;
  detail?: string;
  ip?: string;
}

const LOG_PATH = path.join(process.cwd(), "data", "audit.jsonl");

function ensureLogDir() {
  const dir = path.dirname(LOG_PATH);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { user, action, resource, detail } = body;

    if (!user || !action || !resource) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const event: AuditEvent = {
      id: crypto.randomUUID(),
      ts: new Date().toISOString(),
      user,
      action,
      resource,
      detail: detail ?? undefined,
      ip: req.headers.get("x-forwarded-for") ?? req.headers.get("x-real-ip") ?? undefined,
    };

    ensureLogDir();
    fs.appendFileSync(LOG_PATH, JSON.stringify(event) + "\n", "utf8");

    return NextResponse.json({ ok: true, id: event.id });
  } catch (err) {
    console.error("Audit log error:", err);
    return NextResponse.json({ error: "Failed to write audit log" }, { status: 500 });
  }
}

export async function GET() {
  try {
    ensureLogDir();
    if (!fs.existsSync(LOG_PATH)) {
      return NextResponse.json({ events: [] });
    }

    const lines = fs.readFileSync(LOG_PATH, "utf8").trim().split("\n").filter(Boolean);
    const events: AuditEvent[] = lines
      .map((line) => {
        try { return JSON.parse(line) as AuditEvent; }
        catch { return null; }
      })
      .filter((e): e is AuditEvent => e !== null)
      .reverse()
      .slice(0, 500);

    return NextResponse.json({ events });
  } catch (err) {
    console.error("Audit read error:", err);
    return NextResponse.json({ error: "Failed to read audit log" }, { status: 500 });
  }
}
