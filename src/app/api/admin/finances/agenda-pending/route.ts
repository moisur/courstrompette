import { NextRequest, NextResponse } from "next/server";
import { getAdminSession } from "@/lib/admin-auth";
import { getSessionUser, isAdmin } from "@/lib/auth/session";
import { prisma } from "@/lib/db";
import { getPendingPastAgendaCourses } from "@/lib/services/agenda-reconciliation-service";
import {
  submitPendingUrssafLessonsForStudent,
  UrssafPaymentSubmissionError,
} from "@/lib/services/urssaf-payment-service";
import { UrssafApiError, UrssafConfigurationError } from "@/lib/services/urssaf-service";

async function verifyAdmin(): Promise<boolean> {
  const adminSession = await getAdminSession().catch(() => null);
  if (adminSession) return true;

  const sessionUser = await getSessionUser().catch(() => null);
  if (sessionUser && isAdmin(sessionUser)) return true;

  return false;
}

/**
 * GET /api/admin/finances/agenda-pending
 * Fetches past courses from CalDAV starting from the specified date (default: 2026-09-18).
 */
export async function GET(request: NextRequest) {
  const isAuthorized = await verifyAdmin();
  if (!isAuthorized) {
    return NextResponse.json({ error: "Non autorise" }, { status: 401 });
  }

  try {
    const searchParams = request.nextUrl.searchParams;
    const fromDateParam = searchParams.get("fromDate");
    // Default start date: 2026-09-19 as explicitly requested by user
    const defaultFromDate = new Date("2026-09-19T00:00:00.000Z");
    const fromDate = fromDateParam ? new Date(fromDateParam) : defaultFromDate;

    const pendingCourses = await getPendingPastAgendaCourses(fromDate);

    return NextResponse.json({
      success: true,
      fromDate: fromDate.toISOString(),
      courses: pendingCourses,
    });
  } catch (error) {
    console.error("[AgendaPending] Error fetching pending agenda courses:", error);
    return NextResponse.json(
      { error: "Erreur lors de la recuperation des cours de l'agenda" },
      { status: 500 },
    );
  }
}

/**
 * POST /api/admin/finances/agenda-pending
 * Validates and records one or more courses from the agenda into the Lesson table.
 * If the student is URSSAF-declared, automatically triggers the URSSAF payment submission.
 */
export async function POST(request: NextRequest) {
  const isAuthorized = await verifyAdmin();
  if (!isAuthorized) {
    return NextResponse.json({ error: "Non autorise" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const {
      eventUid,
      recurrenceId,
      title,
      startDate,
      studentId,
      rememberAlias = true,
      rememberUid = true,
    } = body;

    if (!studentId || !startDate) {
      return NextResponse.json(
        { error: "Parametres manquants: studentId et startDate sont obligatoires" },
        { status: 400 },
      );
    }

    // 1. Fetch student
    const student = await prisma.student.findUnique({
      where: { id: studentId },
      include: { urssafClient: true },
    });

    if (!student) {
      return NextResponse.json({ error: "Eleve introuvable" }, { status: 404 });
    }

    const lessonDate = new Date(startDate);
    const amount = student.rate;
    const isUrssafCandidate = student.declared && Boolean(student.urssafClient);
    const paymentMethod = isUrssafCandidate ? "URSSAF" : "DIRECT";

    // 2. Create the Lesson (statut payé = true, note = "Cours de musique à domicile")
    const newLesson = await prisma.lesson.create({
      data: {
        studentId: student.id,
        date: lessonDate,
        amount,
        comment: "Cours de musique à domicile",
        paymentMethod: paymentMethod as any,
        isPaid: true,
      },
    });

    // 2b. Permanently mark event UID as validated so it can never be presented as pending again
    if (eventUid) {
      const validatedKey = recurrenceId ? `${eventUid}_${recurrenceId}` : eventUid;
      await prisma.agendaIgnoredEvent
        .upsert({
          where: { eventUid: validatedKey },
          create: {
            eventUid: validatedKey,
            title: title || student.name,
            date: lessonDate,
            reason: "VALIDATED",
          },
          update: {
            reason: "VALIDATED",
          },
        })
        .catch((e) => console.error("[AgendaPending] Error marking event validated:", e));
    }

    // 3. Update student agenda aliases, UIDs & agendaName for future auto-linking
    const updates: { agendaUids?: string[]; agendaAliases?: string[]; agendaName?: string } = {};
    if (rememberUid && eventUid && !student.agendaUids.includes(eventUid)) {
      updates.agendaUids = [...student.agendaUids, eventUid];
    }
    if (rememberAlias && title) {
      const cleanTitle = title.trim();
      if (cleanTitle && !student.agendaAliases.includes(cleanTitle)) {
        updates.agendaAliases = [...student.agendaAliases, cleanTitle];
      }
      if (!student.agendaName) {
        updates.agendaName = cleanTitle;
      }
    }
    if (Object.keys(updates).length > 0) {
      await prisma.student.update({
        where: { id: student.id },
        data: updates,
      });
    }

    // 4. If URSSAF candidate, automatically dispatch URSSAF payment request!
    let urssafResult: {
      submitted: boolean;
      numFactureTiers?: string;
      statutLabel?: string;
      error?: string;
    } = { submitted: false };

    if (isUrssafCandidate) {
      try {
        const submission = await submitPendingUrssafLessonsForStudent(student.id, [newLesson.id]);
        urssafResult = {
          submitted: true,
          numFactureTiers: submission.request.numFactureTiers,
          statutLabel: submission.request.statutLabel || "Transmise",
        };
      } catch (urssafErr: any) {
        console.error("[AgendaPending] URSSAF automatic submission error:", urssafErr);
        let errorDetail = "Erreur transmission URSSAF";
        if (urssafErr instanceof UrssafPaymentSubmissionError) {
          errorDetail = urssafErr.message || "Erreur de transmission URSSAF";
        } else if (urssafErr instanceof UrssafApiError) {
          errorDetail = urssafErr.message || "Erreur API URSSAF";
        } else if (urssafErr instanceof UrssafConfigurationError) {
          errorDetail = urssafErr.message;
        } else if (urssafErr?.message === "URSSAF_PAIRING_NOT_FINALIZED") {
          errorDetail = "Appareillage élève non finalisé (CGU non acceptées par l'élève)";
        } else if (urssafErr?.message) {
          errorDetail = urssafErr.message;
        }

        urssafResult = {
          submitted: false,
          error: errorDetail,
        };
      }
    }

    return NextResponse.json({
      success: true,
      lesson: {
        id: newLesson.id,
        studentName: student.name,
        amount: Number(newLesson.amount),
        date: newLesson.date.toISOString(),
      },
      urssaf: urssafResult,
    });
  } catch (error) {
    console.error("[AgendaPending] Error creating lesson from agenda:", error);
    return NextResponse.json(
      { error: "Impossible d'enregistrer ce cours" },
      { status: 500 },
    );
  }
}

/**
 * DELETE /api/admin/finances/agenda-pending
 * Marks an event as ignored / cancelled so it won't be suggested again.
 */
export async function DELETE(request: NextRequest) {
  const isAuthorized = await verifyAdmin();
  if (!isAuthorized) {
    return NextResponse.json({ error: "Non autorise" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { eventUid, recurrenceId, title, reason } = body;

    if (!eventUid) {
      return NextResponse.json({ error: "eventUid requis" }, { status: 400 });
    }

    const uniqueUid = recurrenceId ? `${eventUid}_${recurrenceId}` : eventUid;

    await prisma.agendaIgnoredEvent.upsert({
      where: { eventUid: uniqueUid },
      create: {
        eventUid: uniqueUid,
        title: title || null,
        reason: reason || "Ignore par l'utilisateur",
      },
      update: {
        reason: reason || "Ignore par l'utilisateur",
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[AgendaPending] Error ignoring event:", error);
    return NextResponse.json(
      { error: "Impossible d'ignorer cet evenement" },
      { status: 500 },
    );
  }
}
