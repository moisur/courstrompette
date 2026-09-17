import { prisma } from "@/lib/db";
import { CalendarEventItem, fetchCalendarEvents } from "./caldav-service";

export interface StudentSummary {
  id: string;
  name: string;
  rate: number;
  declared: boolean;
  hasUrssafClient: boolean;
  courseDay: string | null;
  courseHour: string | null;
  courseFrequency?: string | null;
  agendaName?: string | null;
  agendaAliases: string[];
  agendaUids: string[];
}

export interface ReconciledAgendaCourse {
  eventUid: string;
  recurrenceId?: string;
  title: string;
  startDate: string; // ISO string
  endDate: string; // ISO string
  dayOfWeek: string;
  timeSlot: string;
  durationMinutes: number;
  matchedStudent: StudentSummary | null;
  matchConfidence: "AGENDA_NAME" | "EXACT_UID" | "ALIAS" | "TIME_AND_NAME" | "NAME_ONLY" | "NONE";
  isHomonymWarning: boolean;
  candidateStudents: StudentSummary[];
  isAlreadyRecorded: boolean;
}

const STOP_WORDS = new Set([
  "trompette",
  "cours",
  "musique",
  "visio",
  "skype",
  "zoom",
  "domicile",
  "vincennes",
  "paris",
  "1h",
  "45min",
  "30min",
  "repete",
  "classe",
  "lecon",
]);

function normalizeString(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function extractKeywords(title: string): string[] {
  const normalized = normalizeString(title);
  return normalized
    .split(" ")
    .filter((word) => word.length > 1 && !STOP_WORDS.has(word));
}

const DAYS_FR = ["dimanche", "lundi", "mardi", "mercredi", "jeudi", "vendredi", "samedi"];

function getDayFr(date: Date): string {
  return DAYS_FR[date.getDay()];
}

function formatTimeSlot(start: Date, end: Date): string {
  const formatHour = (d: Date) => {
    const hours = d.getHours().toString().padStart(2, "0");
    const mins = d.getMinutes().toString().padStart(2, "0");
    return `${hours}:${mins}`;
  };
  return `${formatHour(start)} - ${formatHour(end)}`;
}

/**
 * Checks if an event's schedule matches a student's declared schedule.
 */
function isScheduleMatch(student: StudentSummary, eventDate: Date): boolean {
  if (!student.courseDay) return false;
  const eventDay = getDayFr(eventDate);
  const studentDay = normalizeString(student.courseDay);

  if (!studentDay.includes(eventDay)) return false;

  if (student.courseHour) {
    const normalizedHour = student.courseHour.replace("h", ":").replace(/\s/g, "");
    const [expectedHour, expectedMin] = normalizedHour.split(":").map(Number);
    if (!isNaN(expectedHour)) {
      const eventHour = eventDate.getHours();
      const eventMin = eventDate.getMinutes();
      const diffMinutes = Math.abs(eventHour * 60 + eventMin - (expectedHour * 60 + (expectedMin || 0)));
      return diffMinutes <= 30; // within 30 min window
    }
  }

  return true;
}

/**
 * Finds the best student match for a calendar event with strict anti-homonym safety.
 */
export function matchStudentForEvent(
  event: CalendarEventItem,
  students: StudentSummary[],
): {
  matchedStudent: StudentSummary | null;
  matchConfidence: "AGENDA_NAME" | "EXACT_UID" | "ALIAS" | "TIME_AND_NAME" | "NAME_ONLY" | "NONE";
  isHomonymWarning: boolean;
  candidateStudents: StudentSummary[];
} {
  const cleanTitle = normalizeString(event.title);

  // 0. Primary Priority (User Option 1: "Titre dans mon agenda")
  // If the teacher has explicitly set an agenda title on the student profile, match with highest priority.
  // E.g.: "Nicolas trompette" matches student with agendaName "Nicolas trompette" rather than just "Nicolas".
  const agendaNameMatches = students.filter((s) => {
    if (!s.agendaName || !s.agendaName.trim()) return false;
    const normAgendaName = normalizeString(s.agendaName);
    if (!normAgendaName) return false;
    // Word-boundary or exact phrase match inside cleanTitle
    const regex = new RegExp(`(^|\\s)${normAgendaName.replace(/[.*+?^${}()|[\\]\\]/g, "\\$&")}(\\s|$)`);
    return regex.test(cleanTitle);
  });

  if (agendaNameMatches.length > 0) {
    // Sort candidate matches by longest agendaName first to prioritize the most specific title
    agendaNameMatches.sort((a, b) => {
      const lenB = normalizeString(b.agendaName || "").length;
      const lenA = normalizeString(a.agendaName || "").length;
      return lenB - lenA;
    });

    const bestMatch = agendaNameMatches[0];
    const secondMatch = agendaNameMatches[1];
    const bestLen = normalizeString(bestMatch.agendaName || "").length;
    const secondLen = secondMatch ? normalizeString(secondMatch.agendaName || "").length : 0;

    if (!secondMatch || bestLen > secondLen) {
      return {
        matchedStudent: bestMatch,
        matchConfidence: "AGENDA_NAME",
        isHomonymWarning: false,
        candidateStudents: [bestMatch],
      };
    } else {
      // Ambiguity between identical agendaNames
      return {
        matchedStudent: null,
        matchConfidence: "NONE",
        isHomonymWarning: true,
        candidateStudents: agendaNameMatches,
      };
    }
  }

  // 1. Strict Priority: Match by Event Series UID
  const exactUidMatch = students.find((s) => s.agendaUids.includes(event.uid));
  if (exactUidMatch) {
    return {
      matchedStudent: exactUidMatch,
      matchConfidence: "EXACT_UID",
      isHomonymWarning: false,
      candidateStudents: [exactUidMatch],
    };
  }

  const titleWords = extractKeywords(event.title);

  // 2. Match by explicit Aliases
  const aliasMatches = students.filter((s) =>
    s.agendaAliases.some((alias) => {
      const normAlias = normalizeString(alias);
      return cleanTitle.includes(normAlias) || normAlias.includes(cleanTitle);
    }),
  );

  if (aliasMatches.length === 1) {
    return {
      matchedStudent: aliasMatches[0],
      matchConfidence: "ALIAS",
      isHomonymWarning: false,
      candidateStudents: aliasMatches,
    };
  }

  // 3. Match by Student First Name or Full Name
  const nameMatches = students.filter((s) => {
    const normName = normalizeString(s.name);
    const nameParts = normName.split(" ").filter((p) => p.length > 1);
    const firstName = nameParts[0];

    // Check if first name matches any extracted keyword
    return (
      titleWords.includes(firstName) ||
      cleanTitle.includes(normName) ||
      cleanTitle.startsWith(firstName)
    );
  });

  // If no student matches at all
  if (nameMatches.length === 0) {
    return {
      matchedStudent: null,
      matchConfidence: "NONE",
      isHomonymWarning: false,
      candidateStudents: [],
    };
  }

  // If exactly ONE student matches by name
  if (nameMatches.length === 1) {
    const student = nameMatches[0];
    const scheduleMatches = isScheduleMatch(student, event.startDate);
    return {
      matchedStudent: student,
      matchConfidence: scheduleMatches ? "TIME_AND_NAME" : "NAME_ONLY",
      isHomonymWarning: false,
      candidateStudents: nameMatches,
    };
  }

  // If MULTIPLE students match (e.g. "Nicolas" -> multiple Nicolas in DB)
  // Check if exactly one matches the day & hour slot
  const scheduleFiltered = nameMatches.filter((s) => isScheduleMatch(s, event.startDate));

  if (scheduleFiltered.length === 1) {
    // Exactly one Nicolas has this day/time slot
    return {
      matchedStudent: scheduleFiltered[0],
      matchConfidence: "TIME_AND_NAME",
      isHomonymWarning: true, // Show warning so user can confirm
      candidateStudents: nameMatches,
    };
  }

  // Ambiguous: multiple students match schedule, or none match schedule
  return {
    matchedStudent: null,
    matchConfidence: "NONE",
    isHomonymWarning: true,
    candidateStudents: nameMatches,
  };
}

/**
 * Gets pending courses from the agenda that have passed and are not yet saved.
 * @param fromDate Date to start scanning from (default: 2026-09-18T00:00:00.000Z)
 */
export async function getPendingPastAgendaCourses(
  fromDate: Date = new Date("2026-09-18T00:00:00.000Z"),
  toDate: Date = new Date(),
): Promise<ReconciledAgendaCourse[]> {
  const now = new Date();
  // We only show events that are finished (endDate <= now)
  const maxScanDate = toDate > now ? now : toDate;

  // 1. Fetch raw calendar events
  const rawEvents = await fetchCalendarEvents(fromDate, maxScanDate);
  if (rawEvents.length === 0) {
    return [];
  }

  // 2. Fetch active students
  const dbStudents = await prisma.student.findMany({
    where: { archived: false },
    select: {
      id: true,
      name: true,
      rate: true,
      declared: true,
      courseDay: true,
      courseHour: true,
      courseFrequency: true,
      agendaName: true,
      agendaAliases: true,
      agendaUids: true,
      urssafClient: {
        select: { id: true },
      },
    },
  });

  const students: StudentSummary[] = dbStudents.map((s) => ({
    id: s.id,
    name: s.name,
    rate: Number(s.rate),
    declared: s.declared,
    hasUrssafClient: Boolean(s.urssafClient),
    courseDay: s.courseDay,
    courseHour: s.courseHour,
    courseFrequency: s.courseFrequency,
    agendaName: s.agendaName,
    agendaAliases: s.agendaAliases,
    agendaUids: s.agendaUids,
  }));

  // 3. Fetch ignored events
  const ignoredRecords = await prisma.agendaIgnoredEvent.findMany({
    select: { eventUid: true },
  });
  const ignoredUids = new Set(ignoredRecords.map((r) => r.eventUid));

  // 4. Fetch existing lessons in the scanned date window
  const existingLessons = await prisma.lesson.findMany({
    where: {
      date: {
        gte: new Date(fromDate.getTime() - 24 * 60 * 60 * 1000),
        lte: new Date(maxScanDate.getTime() + 24 * 60 * 60 * 1000),
      },
    },
    select: {
      id: true,
      studentId: true,
      date: true,
    },
  });

  const results: ReconciledAgendaCourse[] = [];

  for (const event of rawEvents) {
    // Only past events (ended before now)
    if (event.endDate.getTime() > now.getTime()) {
      continue;
    }

    // Must be after fromDate
    if (event.startDate.getTime() < fromDate.getTime()) {
      continue;
    }

    // Check if explicitly ignored
    if (ignoredUids.has(event.uid) || (event.recurrenceId && ignoredUids.has(`${event.uid}_${event.recurrenceId}`))) {
      continue;
    }

    // Match student
    const match = matchStudentForEvent(event, students);

    // Check if already recorded as a lesson in database for this student on this day
    let isAlreadyRecorded = false;
    if (match.matchedStudent) {
      const studentId = match.matchedStudent.id;
      const eventTime = event.startDate.getTime();
      isAlreadyRecorded = existingLessons.some((l) => {
        if (l.studentId !== studentId) return false;
        const diffHours = Math.abs(l.date.getTime() - eventTime) / (1000 * 60 * 60);
        return diffHours < 6; // same day / near slot
      });
    }

    if (isAlreadyRecorded) {
      continue;
    }

    const durationMinutes = Math.round(
      (event.endDate.getTime() - event.startDate.getTime()) / (1000 * 60),
    );

    results.push({
      eventUid: event.uid,
      recurrenceId: event.recurrenceId,
      title: event.title,
      startDate: event.startDate.toISOString(),
      endDate: event.endDate.toISOString(),
      dayOfWeek: getDayFr(event.startDate),
      timeSlot: formatTimeSlot(event.startDate, event.endDate),
      durationMinutes: durationMinutes > 0 ? durationMinutes : 45,
      matchedStudent: match.matchedStudent,
      matchConfidence: match.matchConfidence,
      isHomonymWarning: match.isHomonymWarning,
      candidateStudents: match.candidateStudents,
      isAlreadyRecorded,
    });
  }

  // Sort chronologically (most recent first)
  return results.sort(
    (a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime(),
  );
}
