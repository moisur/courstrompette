import { NextResponse } from "next/server";
import nodemailer from "nodemailer";
import { getAdminSession } from "@/lib/admin-auth";
import { prisma } from "@/lib/db";

interface CancelRequestBody {
  numFactureTiers: string;
  subject: string;
  emailBody: string;
}

function createTransporter() {
  const host = process.env.SMTP_HOST;
  if (!host) throw new Error("SMTP_HOST manquant");

  const port = Number(process.env.SMTP_PORT ?? "465");
  const secure = port === 465;

  return nodemailer.createTransport({
    host,
    port,
    secure,
    auth: {
      user: process.env.SMTP_USER!,
      pass: process.env.SMTP_PASS!,
    },
    tls: { servername: host },
  });
}

function escapeHtml(text: string) {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\n/g, "<br/>");
}

function buildConfirmationHtml(subject: string, emailBody: string) {
  return `
    <div style="margin:0; padding:32px 16px; background:#f5f5f4; font-family: Arial, Helvetica, sans-serif; color:#1c1917;">
      <div style="max-width:640px; margin:0 auto; background:#ffffff; border:1px solid #e7e5e4; border-radius:24px; overflow:hidden; box-shadow:0 12px 40px rgba(28,25,23,0.08);">
        <div style="padding:20px 24px; background:linear-gradient(135deg, #d97706, #f59e0b); color:#ffffff;">
          <div style="font-size:12px; letter-spacing:0.18em; text-transform:uppercase; opacity:0.85; margin-bottom:8px;">URSSAF — Demande d'annulation</div>
          <h1 style="margin:0; font-size:20px; line-height:1.2; font-family: Georgia, serif;">Confirmation d'envoi</h1>
        </div>
        <div style="padding:32px 24px;">
          <p style="margin:0 0 16px; font-size:16px; line-height:1.7; color:#44403c;">
            Votre demande d'annulation a bien été envoyée à <strong>avance-immediate@urssaf.fr</strong>.
          </p>
          <div style="padding:18px 20px; background:#fffbeb; border:1px solid #fde68a; border-radius:18px; margin: 16px 0;">
            <p style="margin:0 0 10px; font-size:12px; color:#92400e; text-transform:uppercase; letter-spacing:0.08em; font-weight:700;">Objet du mail</p>
            <p style="margin:0 0 16px; font-size:14px; font-weight:bold;">${escapeHtml(subject)}</p>
            <p style="margin:0 0 10px; font-size:12px; color:#92400e; text-transform:uppercase; letter-spacing:0.08em; font-weight:700;">Contenu envoyé</p>
            <div style="font-size:13px; line-height:1.6; color:#44403c; white-space:pre-wrap; font-family:monospace; background:#fff; padding:12px; border-radius:8px; border:1px solid #e7e5e4;">${escapeHtml(emailBody)}</div>
          </div>
          <p style="margin:16px 0 0; font-size:14px; color:#78716c;">
            Le statut sera mis à jour automatiquement lors de la prochaine synchronisation.
          </p>
        </div>
      </div>
    </div>
  `;
}

export async function POST(request: Request) {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  let body: CancelRequestBody;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Requête invalide" }, { status: 400 });
  }

  if (!body.numFactureTiers || !body.emailBody || !body.subject) {
    return NextResponse.json({ error: "Champs requis manquants" }, { status: 400 });
  }

  try {
    const transporter = createTransporter();
    const from = process.env.SMTP_FROM || process.env.SMTP_USER!;
    const adminEmail = "jc@courstrompette.fr";

    // 1. Send the cancellation request to URSSAF
    await transporter.sendMail({
      from,
      to: "avance-immediate@urssaf.fr",
      cc: adminEmail,
      replyTo: adminEmail,
      subject: body.subject,
      text: body.emailBody,
    });

    // 2. Send confirmation to admin
    await transporter.sendMail({
      from,
      to: adminEmail,
      subject: `[Confirmation] ${body.subject}`,
      html: buildConfirmationHtml(body.subject, body.emailBody),
    });

    // 3. Update status in database to 110 (Annulée)
    const requestItem = await prisma.urssafPaymentRequest.findUnique({
      where: { numFactureTiers: body.numFactureTiers },
    });

    if (requestItem) {
      await prisma.$transaction([
        prisma.urssafPaymentRequest.update({
          where: { id: requestItem.id },
          data: {
            statutCode: "110",
            statutLabel: "Annulation demandée",
          },
        }),
        prisma.urssafStatusHistory.create({
          data: {
            paymentRequestId: requestItem.id,
            previousCode: requestItem.statutCode,
            previousLabel: requestItem.statutLabel,
            newCode: "110",
            newLabel: "Annulation demandée",
            changedAt: new Date(),
          },
        }),
      ]);
      console.log(`Database updated for URSSAF cancel request ${body.numFactureTiers}`);
    }

    console.log(`URSSAF cancel request sent for ${body.numFactureTiers}`);

    return NextResponse.json({
      success: true,
      message: `Demande d'annulation envoyée pour ${body.numFactureTiers}`,
    });
  } catch (error) {
    console.error("URSSAF cancel email error:", error);
    return NextResponse.json(
      { error: "Erreur lors de l'envoi du mail. Vérifiez la configuration SMTP." },
      { status: 500 }
    );
  }
}
