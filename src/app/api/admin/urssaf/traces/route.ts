import { NextResponse } from "next/server";

import { getAdminSession } from "@/lib/admin-auth";
import { clearRecentUrssafTraces, getRecentUrssafTraces } from "@/lib/urssaf/tracing";

export async function GET() {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Non autorise" }, { status: 401 });
  }

  return NextResponse.json(getRecentUrssafTraces());
}

export async function DELETE() {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Non autorise" }, { status: 401 });
  }

  clearRecentUrssafTraces();
  return NextResponse.json({ ok: true });
}
