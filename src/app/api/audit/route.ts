import { NextRequest, NextResponse } from "next/server";
import { logAction } from "@/lib/audit";
import { supabaseAdmin } from "@/lib/db";

export async function POST(req: NextRequest) {
  try {
    const { user, action, resource, detail } = await req.json();
    if (!action || !resource) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    await logAction({
      userId:     user ?? undefined,
      action:     action as Parameters<typeof logAction>[0]["action"],
      tableName:  resource,
      newValues:  detail ? { detail } : undefined,
      ipAddress:  req.headers.get("x-forwarded-for") ?? req.headers.get("x-real-ip") ?? undefined,
    });

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const url   = new URL(req.url);
    const limit = Math.min(parseInt(url.searchParams.get("limit") ?? "100"), 500);

    const { data, error } = await supabaseAdmin
      .from("audit_log")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(limit);

    if (error) throw error;
    return NextResponse.json({ events: data ?? [] });
  } catch {
    return NextResponse.json({ error: "Failed to read audit log" }, { status: 500 });
  }
}
