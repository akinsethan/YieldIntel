import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/db";
import { logAction } from "@/lib/audit";

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { data: old } = await supabaseAdmin.from("rates").select("*").eq("id", id).single();

  const { error } = await supabaseAdmin
    .from("rates").update({ is_current: false }).eq("id", id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  await logAction({
    action: "DELETE", tableName: "rates", recordId: id,
    oldValues: old ?? undefined,
    ipAddress: req.headers.get("x-forwarded-for") ?? undefined,
  });

  return NextResponse.json({ ok: true });
}
