import { NextRequest, NextResponse } from "next/server";

import { syncUrssafPaymentRequests } from "@/lib/services/urssaf-payment-service";
import { UrssafApiError, UrssafConfigurationError } from "@/lib/services/urssaf-service";

function isAuthorized(request: NextRequest) {
  const secret = process.env.CRON_SECRET?.trim();
  if (!secret) {
    return false;
  }

  const bearer = request.headers.get("authorization")?.replace(/^Bearer\s+/i, "").trim();
  const headerSecret = request.headers.get("x-cron-secret")?.trim();

  return bearer === secret || headerSecret === secret;
}

async function handle(request: NextRequest) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: "Non autorise" }, { status: 401 });
  }

  try {
    const synced = await syncUrssafPaymentRequests();
    return NextResponse.json({ syncedCount: synced.length, synced });
  } catch (error) {
    if (error instanceof UrssafApiError) {
      return NextResponse.json(error.payload, { status: error.status });
    }

    if (error instanceof UrssafConfigurationError) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    console.error("URSSAF cron sync error:", error);
    return NextResponse.json({ error: "Erreur lors de la synchronisation URSSAF" }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  return handle(request);
}

export async function POST(request: NextRequest) {
  return handle(request);
}
