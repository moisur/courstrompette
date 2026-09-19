import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/admin-auth";
import { getSessionUser, isAdmin } from "@/lib/auth/session";
import { fetchCalendarEventsWithDiagnostic } from "@/lib/services/caldav-service";

async function verifyAdmin(): Promise<boolean> {
  const adminSession = await getAdminSession().catch(() => null);
  if (adminSession) return true;
  const sessionUser = await getSessionUser().catch(() => null);
  if (sessionUser && isAdmin(sessionUser)) return true;
  return false;
}

/**
 * GET /api/admin/caldav/titles
 * Returns a deduplicated list of event titles from the CalDAV calendar
 * covering the past 6 months + next 1 month, along with connection diagnostics.
 * Directly accessible in the browser for admin inspection.
 */
export async function GET() {
  const isAuthorized = await verifyAdmin();
  if (!isAuthorized) {
    return NextResponse.json({ error: "Non autorise" }, { status: 401 });
  }

  try {
    const now = new Date();
    // Scan 6 months back and 1 month forward to capture all relevant titles
    const rangeStart = new Date(now.getTime() - 6 * 30 * 24 * 60 * 60 * 1000);
    const rangeEnd = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

    const { events, diagnostic } = await fetchCalendarEventsWithDiagnostic(
      rangeStart,
      rangeEnd,
    );

    // Deduplicate titles, sort alphabetically
    const titleSet = new Set<string>();
    for (const event of events) {
      const title = event.title?.trim();
      if (title && title.length > 1) {
        titleSet.add(title);
      }
    }

    const titles = Array.from(titleSet).sort((a, b) =>
      a.localeCompare(b, "fr", { sensitivity: "base" }),
    );

    // Provide a sample of recent events for instant visual inspection
    const recentEventsSample = events.slice(0, 15).map((e) => ({
      title: e.title,
      start: e.startDate.toISOString(),
      end: e.endDate.toISOString(),
      isRecurring: e.isRecurring,
    }));

    return NextResponse.json({
      success: true,
      totalEvents: events.length,
      titlesCount: titles.length,
      titles,
      recentEventsSample,
      diagnostic,
    });
  } catch (error: any) {
    console.error("[CalDAV Titles] Error:", error);
    return NextResponse.json(
      {
        error: "Erreur lors de la récupération des titres CalDAV",
        details: error?.message,
      },
      { status: 500 },
    );
  }
}
