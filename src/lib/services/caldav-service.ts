/**
 * CalDAV / iCal Service for fetching calendar events from Stalwart mail server.
 */

export interface CalendarEventItem {
  uid: string;
  recurrenceId?: string;
  title: string;
  startDate: Date;
  endDate: Date;
  isRecurring: boolean;
  frequency?: "WEEKLY" | "BIWEEKLY" | "MONTHLY" | "DAILY";
  rawDescription?: string;
  location?: string;
  status?: string;
}

export interface CaldavConfig {
  url?: string;
  user?: string;
  password?: string;
  icsUrl?: string;
}

function getCaldavConfig(): CaldavConfig {
  const url = process.env.CALDAV_URL?.trim() || "https://mail.courstrompette.fr/dav/cal";
  // Default user is jc@courstrompette.fr or SMTP_USER
  const user = process.env.CALDAV_USER?.trim() || process.env.SMTP_USER?.trim() || "jc@courstrompette.fr";
  // Stalwart shares the same credentials between SMTP/IMAP and CalDAV
  const password = process.env.CALDAV_PASSWORD?.trim() || process.env.SMTP_PASS?.trim();
  const icsUrl = process.env.CALDAV_ICS_URL?.trim();

  return { url, user, password, icsUrl };
}

/**
 * Parse an iCalendar date string like:
 * 20260918T100000Z
 * 20260918T120000
 * TZID=Europe/Paris:20260918T120000
 * 20260918
 */
function parseIcalDate(raw: string): Date | null {
  const cleaned = raw.replace(/^.*:/, "").trim();
  if (!cleaned) return null;

  // Format: YYYYMMDDTHHMMSSZ
  const utcMatch = cleaned.match(/^(\d{4})(\d{2})(\d{2})T(\d{2})(\d{2})(\d{2})Z$/);
  if (utcMatch) {
    const [, year, month, day, hour, min, sec] = utcMatch;
    return new Date(Date.UTC(+year, +month - 1, +day, +hour, +min, +sec));
  }

  // Format: YYYYMMDDTHHMMSS (assumed Europe/Paris if not UTC)
  const localMatch = cleaned.match(/^(\d{4})(\d{2})(\d{2})T(\d{2})(\d{2})(\d{2})$/);
  if (localMatch) {
    const [, year, month, day, hour, min, sec] = localMatch;
    const date = new Date(+year, +month - 1, +day, +hour, +min, +sec);
    return date;
  }

  // Format: YYYYMMDD (all day)
  const dayMatch = cleaned.match(/^(\d{4})(\d{2})(\d{2})$/);
  if (dayMatch) {
    const [, year, month, day] = dayMatch;
    return new Date(+year, +month - 1, +day, 0, 0, 0);
  }

  const fallback = new Date(cleaned);
  return isNaN(fallback.getTime()) ? null : fallback;
}

/**
 * Parses raw iCalendar text into a list of event items.
 * Expands weekly / bi-weekly recurrences within [rangeStart, rangeEnd].
 */
export function parseIcalData(
  icsText: string,
  rangeStart: Date,
  rangeEnd: Date,
): CalendarEventItem[] {
  const events: CalendarEventItem[] = [];
  // Unfold folded lines (RFC 5545 CRLF followed by space or tab)
  const unfolded = icsText.replace(/\r?\n[ \t]/g, "");
  const lines = unfolded.split(/\r?\n/);

  let inEvent = false;
  let currentEvent: Partial<{
    uid: string;
    summary: string;
    description: string;
    location: string;
    status: string;
    dtstart: Date;
    dtend: Date;
    rrule: string;
    recurrenceId: string;
  }> = {};

  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed === "BEGIN:VEVENT") {
      inEvent = true;
      currentEvent = {};
      continue;
    }

    if (trimmed === "END:VEVENT") {
      inEvent = false;
      if (currentEvent.uid && currentEvent.dtstart) {
        const start = currentEvent.dtstart;
        const durationMs = currentEvent.dtend
          ? currentEvent.dtend.getTime() - start.getTime()
          : 45 * 60 * 1000;
        const summary = currentEvent.summary || "Cours";
        const rrule = currentEvent.rrule || "";

        // Determine recurrence frequency
        let frequency: "WEEKLY" | "BIWEEKLY" | "MONTHLY" | "DAILY" | undefined;
        let interval = 1;
        if (rrule.includes("FREQ=WEEKLY")) {
          const intervalMatch = rrule.match(/INTERVAL=(\d+)/);
          interval = intervalMatch ? parseInt(intervalMatch[1], 10) : 1;
          frequency = interval === 2 ? "BIWEEKLY" : "WEEKLY";
        }

        if (rrule && frequency && interval > 0) {
          // Expand recurring instances within rangeStart and rangeEnd
          const stepMs = interval * 7 * 24 * 60 * 60 * 1000;
          let instanceStart = new Date(start.getTime());

          // Fast forward near rangeStart if event started long ago
          if (instanceStart.getTime() < rangeStart.getTime()) {
            const diffMs = rangeStart.getTime() - instanceStart.getTime();
            const stepsToSkip = Math.floor(diffMs / stepMs);
            if (stepsToSkip > 0) {
              instanceStart = new Date(instanceStart.getTime() + stepsToSkip * stepMs);
            }
          }

          // Generate instances up to rangeEnd
          while (instanceStart.getTime() <= rangeEnd.getTime()) {
            if (instanceStart.getTime() >= rangeStart.getTime()) {
              const instanceEnd = new Date(instanceStart.getTime() + durationMs);
              events.push({
                uid: currentEvent.uid,
                recurrenceId: instanceStart.toISOString(),
                title: summary,
                startDate: new Date(instanceStart),
                endDate: instanceEnd,
                isRecurring: true,
                frequency,
                rawDescription: currentEvent.description,
                location: currentEvent.location,
                status: currentEvent.status,
              });
            }
            instanceStart = new Date(instanceStart.getTime() + stepMs);
          }
        } else {
          // Single / non-recurring or specific occurrence
          const end = currentEvent.dtend || new Date(start.getTime() + durationMs);
          if (start.getTime() >= rangeStart.getTime() && start.getTime() <= rangeEnd.getTime()) {
            events.push({
              uid: currentEvent.uid,
              recurrenceId: currentEvent.recurrenceId,
              title: summary,
              startDate: start,
              endDate: end,
              isRecurring: Boolean(currentEvent.rrule),
              frequency,
              rawDescription: currentEvent.description,
              location: currentEvent.location,
              status: currentEvent.status,
            });
          }
        }
      }
      currentEvent = {};
      continue;
    }

    if (!inEvent) continue;

    if (trimmed.startsWith("UID:")) {
      currentEvent.uid = trimmed.slice(4).trim();
    } else if (trimmed.startsWith("SUMMARY:")) {
      currentEvent.summary = trimmed.slice(8).trim();
    } else if (trimmed.startsWith("DESCRIPTION:")) {
      currentEvent.description = trimmed.slice(12).trim();
    } else if (trimmed.startsWith("LOCATION:")) {
      currentEvent.location = trimmed.slice(9).trim();
    } else if (trimmed.startsWith("STATUS:")) {
      currentEvent.status = trimmed.slice(7).trim();
    } else if (trimmed.startsWith("RRULE:")) {
      currentEvent.rrule = trimmed.slice(6).trim();
    } else if (trimmed.startsWith("RECURRENCE-ID")) {
      currentEvent.recurrenceId = trimmed.slice(trimmed.indexOf(":") + 1).trim();
    } else if (trimmed.startsWith("DTSTART")) {
      const parsed = parseIcalDate(trimmed);
      if (parsed) currentEvent.dtstart = parsed;
    } else if (trimmed.startsWith("DTEND")) {
      const parsed = parseIcalDate(trimmed);
      if (parsed) currentEvent.dtend = parsed;
    }
  }

  return events;
}

/**
 * Fetches calendar events from Stalwart CalDAV server or private .ics feed.
 */
export async function fetchCalendarEvents(
  rangeStart: Date,
  rangeEnd: Date,
  customConfig?: CaldavConfig,
): Promise<CalendarEventItem[]> {
  const config = { ...getCaldavConfig(), ...customConfig };

  // Format range for CalDAV XML query: YYYYMMDDTHHMMSSZ
  const formatUtc = (d: Date) =>
    d.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");

  // If a direct ICS URL is supplied
  if (config.icsUrl) {
    try {
      const response = await fetch(config.icsUrl, {
        headers: { Accept: "text/calendar" },
        next: { revalidate: 60 },
      });
      if (!response.ok) {
        throw new Error(`Failed to fetch ICS feed: HTTP ${response.status}`);
      }
      const icsText = await response.text();
      return parseIcalData(icsText, rangeStart, rangeEnd);
    } catch (error) {
      console.error("[CaldavService] Error fetching ICS feed:", error);
      return [];
    }
  }

  // CalDAV endpoint
  if (!config.url || !config.password) {
    console.warn(
      "[CaldavService] CalDAV credentials missing (CALDAV_PASSWORD or SMTP_PASS). Using empty calendar feed.",
    );
    return [];
  }

  try {
    const authHeader = `Basic ${Buffer.from(`${config.user}:${config.password}`).toString("base64")}`;
    const startStr = formatUtc(rangeStart);
    const endStr = formatUtc(rangeEnd);

    const queryXml = `<?xml version="1.0" encoding="utf-8" ?>
<c:calendar-query xmlns:d="DAV:" xmlns:c="urn:ietf:params:xml:ns:caldav">
  <d:prop>
    <d:getetag />
    <c:calendar-data />
  </d:prop>
  <c:filter>
    <c:comp-filter name="VCALENDAR">
      <c:comp-filter name="VEVENT">
        <c:time-range start="${startStr}" end="${endStr}" />
      </c:comp-filter>
    </c:comp-filter>
  </c:filter>
</c:calendar-query>`;

    const response = await fetch(config.url, {
      method: "REPORT",
      headers: {
        Authorization: authHeader,
        Depth: "1",
        "Content-Type": "application/xml; charset=utf-8",
        Prefer: "return-minimal",
      },
      body: queryXml,
    });

    if (!response.ok) {
      // Fallback: try GET in case the URL points directly to an .ics resource
      const getResponse = await fetch(config.url, {
        method: "GET",
        headers: {
          Authorization: authHeader,
          Accept: "text/calendar",
        },
      });

      if (getResponse.ok) {
        const icsText = await getResponse.text();
        return parseIcalData(icsText, rangeStart, rangeEnd);
      }

      console.error(
        `[CaldavService] CalDAV REPORT returned ${response.status}: ${await response.text()}`,
      );
      return [];
    }

    const xmlResponse = await response.text();
    // Extract calendar-data nodes from multi-status response
    const calendarDataRegex = /<[^:]*:?calendar-data[^>]*>([\s\S]*?)<\/[^:]*:?calendar-data>/gi;
    const extractedEvents: CalendarEventItem[] = [];

    let match: RegExpExecArray | null;
    while ((match = calendarDataRegex.exec(xmlResponse)) !== null) {
      let icsChunk = match[1]
        .replace(/&lt;/g, "<")
        .replace(/&gt;/g, ">")
        .replace(/&amp;/g, "&");
      const parsed = parseIcalData(icsChunk, rangeStart, rangeEnd);
      extractedEvents.push(...parsed);
    }

    return extractedEvents;
  } catch (error) {
    console.error("[CaldavService] CalDAV connection error:", error);
    return [];
  }
}
