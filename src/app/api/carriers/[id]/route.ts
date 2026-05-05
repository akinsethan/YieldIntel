import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/db";
import { logAction } from "@/lib/audit";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { data, error } = await supabaseAdmin.from("carriers").select("*").eq("id", id).single();
  if (error) return NextResponse.json({ error: error.message }, { status: 404 });
  return NextResponse.json(data);
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await req.json();

  const { data: old } = await supabaseAdmin.from("carriers").select("*").eq("id", id).single();
  const { data, error } = await supabaseAdmin
    .from("carriers").update(body).eq("id", id).select().single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  await logAction({
    action: "UPDATE", tableName: "carriers", recordId: id,
    oldValues: old ?? undefined, newValues: data,
    ipAddress: req.headers.get("x-forwarded-for") ?? undefined,
  });

  return NextResponse.json(data);
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { data: old } = await supabaseAdmin.from("carriers").select("*").eq("id", id).single();

  const { error } = await supabaseAdmin
    .from("carriers").update({ is_active: false }).eq("id", id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  await logAction({
    action: "DELETE", tableName: "carriers", recordId: id,
    oldValues: old ?? undefined,
    ipAddress: req.headers.get("x-forwarded-for") ?? undefined,
  });

  return NextResponse.json({ ok: true });
}
