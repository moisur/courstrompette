import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/db";
import { UrssafService } from "@/lib/services/urssaf-service";

const URSSAF_SETTLED_CODES = new Set(["70", "120", "270"]);
const URSSAF_ERROR_CODES = new Set(["40", "60", "110", "111", "112", "113", "260"]);

export class UrssafPaymentSubmissionError extends Error {
  status: number;
  payload: unknown;

  constructor(message: string, payload: unknown, status = 400) {
    super(message);
    this.name = "UrssafPaymentSubmissionError";
    this.status = status;
    this.payload = payload;
  }
}

function formatIntervenantIdentifier(value: string) {
  const trimmed = value.trim().toUpperCase();

  if (!trimmed) {
    return "";
  }

  if (/^(SAP\d{9}|SIR\d{14})$/.test(trimmed)) {
    return trimmed;
  }

  const digitsOnly = trimmed.replace(/\D/g, "");
  if (/^\d{14}$/.test(digitsOnly)) {
    return `SIR${digitsOnly}`;
  }

  if (/^\d{9}$/.test(digitsOnly)) {
    return `SAP${digitsOnly}`;
  }

  return trimmed;
}

function buildStatusLabel(code?: string | null, fallback?: string | null) {
  switch (code) {
    case "10":
      return "Integree";
    case "20":
      return "En attente de validation";
    case "30":
      return "Validee";
    case "40":
      return "Refusee";
    case "50":
      return "Prelevee";
    case "60":
      return "Refus de prelevement";
    case "70":
      return "Payee";
    case "110":
    case "111":
    case "112":
    case "113":
      return "Annulee";
    case "120":
      return "Recouvree";
    case "260":
      return "Impaye prestataire";
    case "270":
      return "Regularisee prestataire";
    default:
      return fallback ?? null;
  }
}

function slugifyStudentName(name: string) {
  return name
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .toUpperCase();
}

function buildMonthlyFactureRef(studentName: string, lessonDate: Date) {
  const year = lessonDate.getUTCFullYear();
  const month = String(lessonDate.getUTCMonth() + 1).padStart(2, "0");
  return `URSSAF-${slugifyStudentName(studentName)}-${year}${month}-${Date.now()}`;
}

function toSameUtcMonthKey(date: Date) {
  return `${date.getUTCFullYear()}-${date.getUTCMonth()}`;
}

function toIsoDate(value: Date) {
  return value.toISOString();
}

function getIntervenantIdentifier() {
  const source =
    process.env.URSSAF_INTERVENANT_SIRET?.trim() ||
    process.env.SIRET?.trim() ||
    "";

  return formatIntervenantIdentifier(source);
}

function getTiersFacturationId(studentId: string) {
  return (
    process.env.URSSAF_TIERS_FACTURATION_ID?.trim() ||
    process.env.URSSAF_ID_TIERS_FACTURATION?.trim() ||
    `facturation-${studentId}`
  );
}

function isSettledStatus(code?: string | null) {
  return Boolean(code && URSSAF_SETTLED_CODES.has(code));
}

function isErrorStatus(code?: string | null) {
  return Boolean(code && URSSAF_ERROR_CODES.has(code));
}

function isRejectedBusinessStatus(code?: string | null) {
  return Boolean(code && (code.startsWith("ERR_") || URSSAF_ERROR_CODES.has(code)));
}

function getFirstResponseErrorMessage(response: Record<string, unknown> | undefined) {
  if (!response) {
    return "La transmission URSSAF a ete refusee.";
  }

  const errors = Array.isArray(response.errors) ? response.errors : [];
  const firstError = errors[0];

  if (firstError && typeof firstError === "object") {
    const candidate = firstError as Record<string, unknown>;
    if (typeof candidate.message === "string" && candidate.message.trim()) {
      return candidate.message;
    }
    if (typeof candidate.description === "string" && candidate.description.trim()) {
      return candidate.description;
    }
  }

  if (typeof response.statut === "string" && response.statut.trim()) {
    return response.statut;
  }

  return "La transmission URSSAF a ete refusee.";
}

type SearchPaymentResponse = {
  Errors?: Array<{ code?: string; message?: string; description?: string }>;
  infoDemandePaiements?: Array<{
    idDemandePaiement?: string;
    demandePaiement?: {
      numFactureTiers?: string;
      idClient?: string;
      mntFactureTTC?: number;
    };
    statut?: {
      code?: string;
      libelle?: string;
    };
  }>;
};

export async function submitPendingUrssafLessonsForStudent(studentId: string, lessonIds?: string[]) {
  const student = await prisma.student.findUnique({
    where: { id: studentId },
    include: {
      urssafClient: true,
      lessons: {
        where: {
          paymentMethod: "URSSAF",
          urssafPaymentRequestId: null,
          ...(lessonIds?.length ? { id: { in: lessonIds } } : {}),
        },
        orderBy: { date: "asc" },
      },
    },
  });

  if (!student || !student.urssafClient) {
    throw new Error("URSSAF_STUDENT_NOT_READY");
  }

  if (!student.lessons.length) {
    throw new Error("NO_PENDING_URSSAF_LESSONS");
  }

  const firstLessonDate = new Date(student.lessons[0].date);
  const expectedMonthKey = toSameUtcMonthKey(firstLessonDate);
  const hasMultipleMonths = student.lessons.some((lesson) => toSameUtcMonthKey(new Date(lesson.date)) !== expectedMonthKey);

  if (hasMultipleMonths) {
    throw new Error("URSSAF_MULTIPLE_MONTHS");
  }

  const amountTtc = student.lessons.reduce((sum, lesson) => sum + Number(lesson.amount), 0);
  const dateDebutEmploi = new Date(student.lessons[0].date);
  const dateFinEmploi = new Date(student.lessons[student.lessons.length - 1].date);
  const dateFacture = new Date();
  const numFactureTiers = buildMonthlyFactureRef(student.name, firstLessonDate);
  const intervenantIdentifier = getIntervenantIdentifier();

  const payload = [
    {
      idTiersFacturation: getTiersFacturationId(student.id),
      idClient: student.urssafClient.id,
      dateNaissanceClient: student.urssafClient.dateNaissance,
      numFactureTiers,
      dateFacture: toIsoDate(dateFacture),
      dateDebutEmploi: toIsoDate(dateDebutEmploi),
      dateFinEmploi: toIsoDate(dateFinEmploi),
      mntFactureTTC: Number(amountTtc.toFixed(2)),
      mntFactureHT: Number(amountTtc.toFixed(2)),
      inputPrestations: student.lessons.map((lesson) => {
        const amount = Number(Number(lesson.amount).toFixed(2));
        return {
          codeNature: "100",
          codeActivite: "100A001",
          quantite: 1,
          unite: "FORFAIT",
          mntUnitaireTTC: amount,
          mntPrestationTTC: amount,
          mntPrestationHT: amount,
          mntPrestationTVA: 0,
          dateDebutEmploi: toIsoDate(new Date(lesson.date)),
          dateFinEmploi: toIsoDate(new Date(lesson.date)),
          complement1: lesson.comment?.trim() ? lesson.comment.trim().slice(0, 120) : undefined,
          complement2: intervenantIdentifier || undefined,
        };
      }),
    },
  ];

  const result = await UrssafService.submitPaymentRequestRequest(payload);
  const firstResponse = Array.isArray(result.data) ? (result.data[0] as Record<string, unknown> | undefined) : undefined;
  const statutCode = typeof firstResponse?.statut === "string" ? firstResponse.statut : null;
  const idDemandePaiement =
    typeof firstResponse?.idDemandePaiement === "string" ? firstResponse.idDemandePaiement : null;
  const hasResponseErrors = Array.isArray(firstResponse?.errors) && firstResponse.errors.length > 0;

  if (hasResponseErrors || isRejectedBusinessStatus(statutCode)) {
    throw new UrssafPaymentSubmissionError(getFirstResponseErrorMessage(firstResponse), result.data);
  }

  const request = await prisma.$transaction(async (tx) => {
    const created = await tx.urssafPaymentRequest.create({
      data: {
        studentId: student.id,
        urssafClientId: student.urssafClient?.id,
        numFactureTiers,
        idDemandePaiement,
        statutCode,
        statutLabel: buildStatusLabel(statutCode),
        amountTtc: new Prisma.Decimal(amountTtc),
        dateFacture,
        dateDebutEmploi,
        dateFinEmploi,
        submittedAt: new Date(),
        lastSyncedAt: new Date(),
        rawLastResponse: result.data as Prisma.InputJsonValue,
      },
    });

    await tx.lesson.updateMany({
      where: {
        id: { in: student.lessons.map((lesson) => lesson.id) },
      },
      data: {
        urssafPaymentRequestId: created.id,
        isPaid: isSettledStatus(statutCode),
      },
    });

    return created;
  });

  return {
    request,
    payload,
    response: result.data,
  };
}

export async function reopenFailedUrssafPaymentRequest(studentId: string, requestId: string) {
  const request = await prisma.urssafPaymentRequest.findFirst({
    where: {
      id: requestId,
      studentId,
    },
    include: {
      lessons: {
        select: {
          id: true,
        },
      },
    },
  });

  if (!request) {
    throw new Error("URSSAF_REQUEST_NOT_FOUND");
  }

  const isReopenable =
    isRejectedBusinessStatus(request.statutCode) ||
    isErrorStatus(request.statutCode) ||
    !request.idDemandePaiement;

  if (!isReopenable) {
    throw new Error("URSSAF_REQUEST_NOT_REOPENABLE");
  }

  await prisma.$transaction(async (tx) => {
    if (request.lessons.length > 0) {
      await tx.lesson.updateMany({
        where: {
          id: { in: request.lessons.map((lesson) => lesson.id) },
        },
        data: {
          urssafPaymentRequestId: null,
          isPaid: false,
        },
      });
    }

    await tx.urssafPaymentRequest.delete({
      where: { id: request.id },
    });
  });

  return {
    requestId: request.id,
    restoredLessonCount: request.lessons.length,
  };
}

export async function submitSingleLessonAsUrssafDP(studentId: string, lessonId: string) {
  const student = await prisma.student.findUnique({
    where: { id: studentId },
    include: {
      urssafClient: true,
    },
  });

  if (!student || !student.urssafClient) {
    throw new Error("URSSAF_STUDENT_NOT_READY");
  }

  const lesson = await prisma.lesson.findUnique({
    where: { id: lessonId },
  });

  if (!lesson || lesson.studentId !== studentId) {
    throw new Error("LESSON_NOT_FOUND");
  }

  if (lesson.paymentMethod !== "URSSAF") {
    throw new Error("LESSON_NOT_URSSAF");
  }

  if (lesson.urssafPaymentRequestId) {
    throw new Error("LESSON_ALREADY_HAS_DP");
  }

  const amount = Number(Number(lesson.amount).toFixed(2));
  const lessonDate = new Date(lesson.date);
  const numFactureTiers = buildMonthlyFactureRef(student.name, lessonDate);
  const intervenantIdentifier = getIntervenantIdentifier();
  const dateFacture = new Date();

  const payload = [
    {
      idTiersFacturation: getTiersFacturationId(student.id),
      idClient: student.urssafClient.id,
      dateNaissanceClient: student.urssafClient.dateNaissance,
      numFactureTiers,
      dateFacture: toIsoDate(dateFacture),
      dateDebutEmploi: toIsoDate(lessonDate),
      dateFinEmploi: toIsoDate(lessonDate),
      mntFactureTTC: amount,
      mntFactureHT: amount,
      inputPrestations: [
        {
          codeNature: "100",
          codeActivite: "100A001",
          quantite: 1,
          unite: "FORFAIT",
          mntUnitaireTTC: amount,
          mntPrestationTTC: amount,
          mntPrestationHT: amount,
          mntPrestationTVA: 0,
          dateDebutEmploi: toIsoDate(lessonDate),
          dateFinEmploi: toIsoDate(lessonDate),
          complement1: lesson.comment?.trim() ? lesson.comment.trim().slice(0, 120) : undefined,
          complement2: intervenantIdentifier || undefined,
        },
      ],
    },
  ];

  const result = await UrssafService.submitPaymentRequestRequest(payload);
  const firstResponse = Array.isArray(result.data) ? (result.data[0] as Record<string, unknown> | undefined) : undefined;
  const statutCode = typeof firstResponse?.statut === "string" ? firstResponse.statut : null;
  const idDemandePaiement =
    typeof firstResponse?.idDemandePaiement === "string" ? firstResponse.idDemandePaiement : null;
  const hasResponseErrors = Array.isArray(firstResponse?.errors) && firstResponse.errors.length > 0;

  if (hasResponseErrors || isRejectedBusinessStatus(statutCode)) {
    throw new UrssafPaymentSubmissionError(getFirstResponseErrorMessage(firstResponse), result.data);
  }

  const request = await prisma.$transaction(async (tx) => {
    const created = await tx.urssafPaymentRequest.create({
      data: {
        studentId: student.id,
        urssafClientId: student.urssafClient?.id,
        numFactureTiers,
        idDemandePaiement,
        statutCode,
        statutLabel: buildStatusLabel(statutCode),
        amountTtc: new Prisma.Decimal(amount),
        dateFacture,
        dateDebutEmploi: lessonDate,
        dateFinEmploi: lessonDate,
        submittedAt: new Date(),
        lastSyncedAt: new Date(),
        rawLastResponse: result.data as Prisma.InputJsonValue,
      },
    });

    await tx.lesson.update({
      where: { id: lessonId },
      data: {
        urssafPaymentRequestId: created.id,
        isPaid: isSettledStatus(statutCode),
      },
    });

    return created;
  });

  return {
    request,
    numFactureTiers,
    idDemandePaiement,
    statutCode,
    statutLabel: buildStatusLabel(statutCode),
    payload,
    response: result.data,
  };
}

export async function syncUrssafPaymentRequests(filters?: { studentId?: string }) {
  const requests = await prisma.urssafPaymentRequest.findMany({
    where: {
      ...(filters?.studentId ? { studentId: filters.studentId } : {}),
      OR: [
        { statutCode: null },
        { statutCode: { in: ["10", "20", "30", "50"] } },
      ],
    },
    orderBy: { createdAt: "desc" },
  });

  const synced: Array<{
    id: string;
    numFactureTiers: string;
    statutCode: string | null;
    statutLabel: string | null;
  }> = [];

  for (const request of requests) {
    const searchPayload = {
      numFactureTiers: [request.numFactureTiers],
    };

    const result = await UrssafService.searchPaymentRequestsRequest(searchPayload);
    const data = result.data as SearchPaymentResponse;
    const paymentInfo = data.infoDemandePaiements?.[0];
    const statutCode = paymentInfo?.statut?.code ?? null;
    const statutLabel = buildStatusLabel(statutCode, paymentInfo?.statut?.libelle ?? null);
    const idDemandePaiement = paymentInfo?.idDemandePaiement ?? request.idDemandePaiement ?? null;

    await prisma.$transaction(async (tx) => {
      await tx.urssafPaymentRequest.update({
        where: { id: request.id },
        data: {
          idDemandePaiement,
          statutCode,
          statutLabel,
          lastSyncedAt: new Date(),
          rawLastResponse: data as Prisma.InputJsonValue,
        },
      });

      if (isSettledStatus(statutCode)) {
        await tx.lesson.updateMany({
          where: { urssafPaymentRequestId: request.id },
          data: { isPaid: true },
        });
      } else if (isErrorStatus(statutCode)) {
        await tx.lesson.updateMany({
          where: { urssafPaymentRequestId: request.id },
          data: { isPaid: false },
        });
      }
    });

    synced.push({
      id: request.id,
      numFactureTiers: request.numFactureTiers,
      statutCode,
      statutLabel,
    });
  }

  return synced;
}
