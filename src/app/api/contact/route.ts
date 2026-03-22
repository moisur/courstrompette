import { headers } from 'next/headers';
import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

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
const EXPERIENCE_LABELS: Record<string, string> = {
  beginner: 'Debutant total',
  intermediate: 'Intermediaire',
  advanced: 'Avance',
};

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

function getClientIp() {
  const requestHeaders = headers();
  const forwardedFor = requestHeaders.get('x-forwarded-for');

  if (forwardedFor) {
    return forwardedFor.split(',')[0]?.trim() || 'unknown';
  }

  return requestHeaders.get('x-real-ip') || 'unknown';
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
    'J ai bien recu vos informations pour le cours de trompette.',
    'Merci pour votre demande.',
    '',
    'Dites-moi simplement quand je peux vous contacter par telephone pour organiser votre prochain cours.',
    '',
    'A tres vite,',
    'Courstrompette',
  ].join('\n');
}

function buildConfirmationHtmlBody(payload: ContactPayload) {
  return `
    <div style="font-family: Georgia, serif; color: #1c1917; line-height: 1.6;">
      <p style="font-size: 18px; margin-bottom: 16px;">Hello ${escapeHtml(payload.name)},</p>
      <p>J ai bien recu vos informations pour le cours de trompette.</p>
      <p>Merci pour votre demande.</p>
      <p>
        Dites-moi simplement quand je peux vous contacter par telephone
        pour organiser votre prochain cours.
      </p>
      <p style="margin-top: 24px;">A tres vite,<br />Courstrompette</p>
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

  const ip = getClientIp();

  if (isRateLimited(ip)) {
    return NextResponse.json(
      { message: 'Trop de tentatives. Reessayez dans quelques minutes.' },
      { status: 429 },
    );
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
        subject: `Hello ${payload.name}, j ai bien recu votre demande`,
        text: buildConfirmationTextBody(payload),
        html: buildConfirmationHtmlBody(payload),
      }),
    ]);

    return NextResponse.json({ message: 'Message envoye.' }, { status: 200 });
  } catch (error) {
    console.error('Error sending contact email:', error);

    return NextResponse.json(
      { message: 'Impossible d envoyer le message pour le moment.' },
      { status: 500 },
    );
  }
}
