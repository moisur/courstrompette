import { headers } from 'next/headers';
import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

import { EXPERIENCE_LABELS, createLead, updateLeadMailStatus } from '@/lib/crm';

type ContactPayload = {
  name: string;
  email: string;
  phone: string;
  experience: string;
  message: string;
  company: string;
};

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000;
const RATE_LIMIT_MAX_REQUESTS = 5;
const BRAND_NAME = 'JC Trompette';
const PHONE_DISPLAY = '06 63 73 89 02';
const PHONE_E164 = '+33663738902';
const WHATSAPP_URL = `https://api.whatsapp.com/send/?phone=33663738902&text=${encodeURIComponent(
  'Bonjour JC Trompette, je viens de recevoir votre email. Je suis disponible pour organiser mon cours.',
)}`;

declare global {
  var __contactRateLimitStore: Map<string, number[]> | undefined;
}

const rateLimitStore = globalThis.__contactRateLimitStore ?? new Map<string, number[]>();
if (!globalThis.__contactRateLimitStore) {
  globalThis.__contactRateLimitStore = rateLimitStore;
}

function requireEnv(name: string) {
  const value = process.env[name];

  if (!value) {
    throw new Error(`Missing environment variable: ${name}`);
  }

  return value;
}

function parseBoolean(value: string | undefined, fallback: boolean) {
  if (value == null) {
    return fallback;
  }

  return ['1', 'true', 'yes', 'on'].includes(value.toLowerCase());
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function normalizeString(value: unknown) {
  return typeof value === 'string' ? value.trim() : '';
}

function normalizePayload(payload: unknown): ContactPayload {
  const data = typeof payload === 'object' && payload !== null ? (payload as Record<string, unknown>) : {};

  return {
    name: normalizeString(data.name),
    email: normalizeString(data.email),
    phone: normalizeString(data.phone),
    experience: normalizeString(data.experience),
    message: normalizeString(data.message),
    company: normalizeString(data.company),
  };
}

function validatePayload(payload: ContactPayload) {
  if (payload.company) {
    return 'bot';
  }

  if (payload.name.length < 2) {
    return 'Nom invalide.';
  }

  if (!EMAIL_RE.test(payload.email)) {
    return 'Email invalide.';
  }

  if (payload.phone.replace(/\D/g, '').length < 6) {
    return 'Telephone invalide.';
  }

  if (!EXPERIENCE_LABELS[payload.experience]) {
    return 'Niveau invalide.';
  }

  if (payload.message.length > 2000) {
    return 'Message trop long.';
  }

  return null;
}

async function getClientIp() {
  const requestHeaders = await headers();
  const forwardedFor = (requestHeaders as any).get('x-forwarded-for');

  if (forwardedFor) {
    return forwardedFor.split(',')[0]?.trim() || 'unknown';
  }

  return (requestHeaders as any).get('x-real-ip') || 'unknown';
}

function isRateLimited(ip: string) {
  const now = Date.now();
  const recentRequests = (rateLimitStore.get(ip) ?? []).filter(
    (timestamp) => now - timestamp < RATE_LIMIT_WINDOW_MS,
  );

  if (recentRequests.length >= RATE_LIMIT_MAX_REQUESTS) {
    rateLimitStore.set(ip, recentRequests);
    return true;
  }

  recentRequests.push(now);
  rateLimitStore.set(ip, recentRequests);
  return false;
}

function createTransporter() {
  const host = requireEnv('SMTP_HOST');
  const port = Number(process.env.SMTP_PORT ?? '465');

  if (!Number.isFinite(port)) {
    throw new Error('Invalid SMTP_PORT value.');
  }

  const secure = parseBoolean(process.env.SMTP_SECURE, port === 465);

  return nodemailer.createTransport({
    host,
    port,
    secure,
    auth: {
      user: requireEnv('SMTP_USER'),
      pass: requireEnv('SMTP_PASS'),
    },
    tls: {
      servername: host,
    },
  });
}

function buildTextBody(payload: ContactPayload) {
  return [
    'Nouvelle demande depuis courstrompette.fr',
    '',
    `Nom: ${payload.name}`,
    `Email: ${payload.email}`,
    `Telephone: ${payload.phone}`,
    `Niveau: ${EXPERIENCE_LABELS[payload.experience]}`,
    '',
    'Message:',
    payload.message || '(aucun message)',
  ].join('\n');
}

function buildHtmlBody(payload: ContactPayload) {
  return `
    <h2>Nouvelle demande depuis courstrompette.fr</h2>
    <p><strong>Nom :</strong> ${escapeHtml(payload.name)}</p>
    <p><strong>Email :</strong> ${escapeHtml(payload.email)}</p>
    <p><strong>Telephone :</strong> ${escapeHtml(payload.phone)}</p>
    <p><strong>Niveau :</strong> ${escapeHtml(EXPERIENCE_LABELS[payload.experience])}</p>
    <p><strong>Message :</strong></p>
    <p>${escapeHtml(payload.message || '(aucun message)').replace(/\n/g, '<br />')}</p>
  `;
}

function buildConfirmationTextBody(payload: ContactPayload) {
  return [
    `Hello ${payload.name},`,
    '',
    'Votre demande de cours de trompette est bien recue.',
    '',
    'Merci pour votre message. Dites-moi simplement quand je peux vous contacter par telephone pour organiser le prochain cours.',
    '',
    `WhatsApp direct : ${WHATSAPP_URL}`,
    `Telephone : ${PHONE_DISPLAY}`,
    '',
    'A tres vite,',
    BRAND_NAME,
    PHONE_DISPLAY,
  ].join('\n');
}

function buildConfirmationHtmlBody(payload: ContactPayload) {
  return `
    <div style="margin:0; padding:32px 16px; background:#f5f5f4; font-family: Arial, Helvetica, sans-serif; color:#1c1917;">
      <div style="max-width:640px; margin:0 auto; background:#ffffff; border:1px solid #e7e5e4; border-radius:24px; overflow:hidden; box-shadow:0 12px 40px rgba(28,25,23,0.08);">
        <div style="padding:20px 24px; background:linear-gradient(135deg, #d97706, #f59e0b); color:#ffffff;">
          <div style="font-size:12px; letter-spacing:0.18em; text-transform:uppercase; opacity:0.85; margin-bottom:8px;">${BRAND_NAME}</div>
          <h1 style="margin:0; font-size:30px; line-height:1.2; font-family: Georgia, serif;">Cours de trompette</h1>
        </div>
        <div style="padding:32px 24px;">
          <p style="margin:0 0 16px; font-size:24px; line-height:1.3; font-family: Georgia, serif;">Hello ${escapeHtml(payload.name)},</p>
          <p style="margin:0 0 14px; font-size:16px; line-height:1.7; color:#44403c;">
            J ai bien recu votre demande. Merci pour votre message.
          </p>
          <p style="margin:0 0 20px; font-size:16px; line-height:1.7; color:#44403c;">
            Pour organiser votre prochain cours, dites-moi simplement quand je peux vous contacter par telephone.
          </p>
          <div style="margin:28px 0 20px;">
            <a href="${WHATSAPP_URL}" style="display:inline-block; padding:14px 20px; border-radius:999px; background:#25d366; color:#ffffff; text-decoration:none; font-weight:700; margin-right:10px; margin-bottom:10px;">Ecrire sur WhatsApp</a>
            <a href="tel:${PHONE_E164}" style="display:inline-block; padding:14px 20px; border-radius:999px; background:#fff7ed; color:#c2410c; text-decoration:none; font-weight:700; border:1px solid #fdba74; margin-bottom:10px;">Appeler le ${PHONE_DISPLAY}</a>
          </div>
          <div style="margin-top:24px; padding:18px 20px; background:#fffbeb; border:1px solid #fde68a; border-radius:18px;">
            <p style="margin:0 0 6px; font-size:14px; color:#92400e; text-transform:uppercase; letter-spacing:0.08em; font-weight:700;">Contact direct</p>
            <p style="margin:0; font-size:18px; font-weight:700; color:#78350f;">${BRAND_NAME} - ${PHONE_DISPLAY}</p>
          </div>
          <p style="margin:24px 0 0; font-size:16px; line-height:1.7; color:#44403c;">
            A tres vite,<br />${BRAND_NAME}
          </p>
        </div>
      </div>
    </div>
  `;
}

export async function POST(request: Request) {
  let payload: ContactPayload;

  try {
    payload = normalizePayload(await request.json());
  } catch {
    return NextResponse.json({ message: 'Requete invalide.' }, { status: 400 });
  }

  const validationMessage = validatePayload(payload);

  if (validationMessage === 'bot') {
    return NextResponse.json({ message: 'Message recu.' }, { status: 200 });
  }

  if (validationMessage) {
    return NextResponse.json({ message: validationMessage }, { status: 400 });
  }

  const ip = await getClientIp();

  if (isRateLimited(ip)) {
    return NextResponse.json(
      { message: 'Trop de tentatives. Reessayez dans quelques minutes.' },
      { status: 429 },
    );
  }

  let lead;

  try {
    lead = await createLead({
      name: payload.name,
      email: payload.email,
      phone: payload.phone,
      experience: payload.experience,
      message: payload.message,
    });
  } catch (error) {
    console.error('Error saving contact lead:', error);
    return NextResponse.json({ message: 'Impossible d enregistrer la demande.' }, { status: 500 });
  }

  try {
    const smtpUser = requireEnv('SMTP_USER');
    const to = process.env.CONTACT_TO || smtpUser;
    const from = process.env.SMTP_FROM || smtpUser;
    const transporter = createTransporter();

    await Promise.all([
      transporter.sendMail({
        from,
        to,
        replyTo: payload.email,
        subject: `Nouvelle demande - ${payload.name}`,
        text: buildTextBody(payload),
        html: buildHtmlBody(payload),
      }),
      transporter.sendMail({
        from,
        to: payload.email,
        replyTo: to,
        subject: 'Cours de trompette - votre demande est bien recue',
        text: buildConfirmationTextBody(payload),
        html: buildConfirmationHtmlBody(payload),
      }),
    ]);

    void updateLeadMailStatus(lead.id, 'sent').catch((updateError) => {
      console.error('Error updating lead mail status to sent:', updateError);
    });

    return NextResponse.json({ message: 'Message envoye.' }, { status: 200 });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown email error';

    void updateLeadMailStatus(lead.id, 'failed', errorMessage).catch((updateError) => {
      console.error('Error updating lead mail status to failed:', updateError);
    });

    console.error('Error sending contact email:', error);

    return NextResponse.json(
      { message: 'Impossible d envoyer le message pour le moment.' },
      { status: 500 },
    );
  }
}
