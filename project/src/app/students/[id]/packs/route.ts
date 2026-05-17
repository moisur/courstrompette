import { NextResponse } from "next/server";

function notUsedRouteMessage() {
  return NextResponse.json(
    {
      error: "Deprecated route. Use /api/students/:id/packs instead.",
    },
    { status: 410 },
  );
}

export async function GET() {
  return notUsedRouteMessage();
}

export async function POST() {
  return notUsedRouteMessage();
}
