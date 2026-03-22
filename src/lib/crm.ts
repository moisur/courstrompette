import { randomUUID } from 'crypto';

import { dbQuery } from '@/lib/db';

export type LeadStage = 'new' | 'contacted' | 'scheduled' | 'student' | 'lost';
export type LeadMailStatus = 'pending' | 'sent' | 'failed';

export type LeadRecord = {
  id: string;
  createdAt: string;
  updatedAt: string;
  name: string;
  email: string;
  phone: string;
  experience: string;
  message: string;
  stage: LeadStage;
  mailStatus: LeadMailStatus;
  mailError: string | null;
  notes: string;
  convertedAt: string | null;
  studentId: string | null;
};

export type StudentRecord = {
  id: string;
  createdAt: string;
  updatedAt: string;
  leadId: string | null;
  name: string;
  email: string | null;
  phone: string;
  experience: string | null;
  notes: string;
  active: boolean;
};

export type LeadInput = {
  name: string;
  email: string;
  phone: string;
  experience: string;
  message: string;
};

export const EXPERIENCE_LABELS: Record<string, string> = {
  beginner: 'Debutant total',
  intermediate: 'Intermediaire',
  advanced: 'Avance',
};

let schemaPromise: Promise<void> | null = null;

function mapLead(row: Record<string, unknown>): LeadRecord {
  return {
    id: String(row.id),
    createdAt: new Date(String(row.created_at)).toISOString(),
    updatedAt: new Date(String(row.updated_at)).toISOString(),
    name: String(row.name),
    email: String(row.email),
    phone: String(row.phone),
    experience: String(row.experience),
    message: String(row.message ?? ''),
    stage: String(row.stage) as LeadStage,
    mailStatus: String(row.mail_status) as LeadMailStatus,
    mailError: row.mail_error ? String(row.mail_error) : null,
    notes: String(row.notes ?? ''),
    convertedAt: row.converted_at ? new Date(String(row.converted_at)).toISOString() : null,
    studentId: row.student_id ? String(row.student_id) : null,
  };
}

function mapStudent(row: Record<string, unknown>): StudentRecord {
  return {
    id: String(row.id),
    createdAt: new Date(String(row.created_at)).toISOString(),
    updatedAt: new Date(String(row.updated_at)).toISOString(),
    leadId: row.lead_id ? String(row.lead_id) : null,
    name: String(row.name),
    email: row.email ? String(row.email) : null,
    phone: String(row.phone),
    experience: row.experience ? String(row.experience) : null,
    notes: String(row.notes ?? ''),
    active: Boolean(row.active),
  };
}

export async function ensureCrmSchema() {
  if (!schemaPromise) {
    schemaPromise = (async () => {
      await dbQuery(`
        CREATE TABLE IF NOT EXISTS leads (
          id TEXT PRIMARY KEY,
          created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
          updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
          name TEXT NOT NULL,
          email TEXT NOT NULL,
          phone TEXT NOT NULL,
          experience TEXT NOT NULL,
          message TEXT NOT NULL DEFAULT '',
          stage TEXT NOT NULL DEFAULT 'new',
          mail_status TEXT NOT NULL DEFAULT 'pending',
          mail_error TEXT,
          notes TEXT NOT NULL DEFAULT '',
          converted_at TIMESTAMPTZ
        );
      `);

      await dbQuery(`
        CREATE TABLE IF NOT EXISTS students (
          id TEXT PRIMARY KEY,
          created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
          updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
          lead_id TEXT UNIQUE REFERENCES leads(id) ON DELETE SET NULL,
          name TEXT NOT NULL,
          email TEXT,
          phone TEXT NOT NULL,
          experience TEXT,
          notes TEXT NOT NULL DEFAULT '',
          active BOOLEAN NOT NULL DEFAULT TRUE
        );
      `);

      await dbQuery('CREATE INDEX IF NOT EXISTS leads_created_at_idx ON leads(created_at DESC);');
      await dbQuery('CREATE INDEX IF NOT EXISTS leads_stage_idx ON leads(stage);');
      await dbQuery('CREATE INDEX IF NOT EXISTS students_created_at_idx ON students(created_at DESC);');
    })().catch((error) => {
      schemaPromise = null;
      throw error;
    });
  }

  return schemaPromise;
}

export async function createLead(input: LeadInput) {
  await ensureCrmSchema();

  const id = randomUUID();
  const result = await dbQuery(
    `
      INSERT INTO leads (id, name, email, phone, experience, message)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING id, created_at, updated_at, name, email, phone, experience, message, stage, mail_status, mail_error, notes, converted_at, NULL::TEXT AS student_id
    `,
    [id, input.name, input.email, input.phone, input.experience, input.message],
  );

  return mapLead(result.rows[0] as Record<string, unknown>);
}

export async function updateLeadMailStatus(id: string, mailStatus: LeadMailStatus, mailError: string | null = null) {
  await ensureCrmSchema();

  const result = await dbQuery(
    `
      UPDATE leads
      SET mail_status = $2, mail_error = $3, updated_at = NOW()
      WHERE id = $1
      RETURNING id, created_at, updated_at, name, email, phone, experience, message, stage, mail_status, mail_error, notes, converted_at,
        (SELECT id FROM students WHERE students.lead_id = leads.id LIMIT 1) AS student_id
    `,
    [id, mailStatus, mailError],
  );

  return result.rows[0] ? mapLead(result.rows[0] as Record<string, unknown>) : null;
}

export async function convertLeadToStudent(leadId: string) {
  await ensureCrmSchema();

  const leadResult = await dbQuery(
    `
      SELECT id, name, email, phone, experience
      FROM leads
      WHERE id = $1
      LIMIT 1
    `,
    [leadId],
  );

  if (!leadResult.rows[0]) {
    throw new Error('Lead not found.');
  }

  const existingStudent = await dbQuery(
    `
      SELECT id, created_at, updated_at, lead_id, name, email, phone, experience, notes, active
      FROM students
      WHERE lead_id = $1
      LIMIT 1
    `,
    [leadId],
  );

  let studentId = existingStudent.rows[0]?.id ? String(existingStudent.rows[0].id) : randomUUID();

  if (!existingStudent.rows[0]) {
    await dbQuery(
      `
        INSERT INTO students (id, lead_id, name, email, phone, experience)
        VALUES ($1, $2, $3, $4, $5, $6)
      `,
      [
        studentId,
        leadId,
        String(leadResult.rows[0].name),
        String(leadResult.rows[0].email),
        String(leadResult.rows[0].phone),
        String(leadResult.rows[0].experience),
      ],
    );
  }

  await dbQuery(
    `
      UPDATE leads
      SET stage = 'student', converted_at = COALESCE(converted_at, NOW()), updated_at = NOW()
      WHERE id = $1
    `,
    [leadId],
  );

  const studentResult = await dbQuery(
    `
      SELECT id, created_at, updated_at, lead_id, name, email, phone, experience, notes, active
      FROM students
      WHERE id = $1
      LIMIT 1
    `,
    [studentId],
  );

  return mapStudent(studentResult.rows[0] as Record<string, unknown>);
}

export async function listLeads() {
  await ensureCrmSchema();

  const result = await dbQuery(
    `
      SELECT
        leads.id,
        leads.created_at,
        leads.updated_at,
        leads.name,
        leads.email,
        leads.phone,
        leads.experience,
        leads.message,
        leads.stage,
        leads.mail_status,
        leads.mail_error,
        leads.notes,
        leads.converted_at,
        students.id AS student_id
      FROM leads
      LEFT JOIN students ON students.lead_id = leads.id
      ORDER BY leads.created_at DESC
    `,
  );

  return result.rows.map((row: Record<string, unknown>) => mapLead(row));
}

export async function listStudents() {
  await ensureCrmSchema();

  const result = await dbQuery(
    `
      SELECT id, created_at, updated_at, lead_id, name, email, phone, experience, notes, active
      FROM students
      ORDER BY created_at DESC
    `,
  );

  return result.rows.map((row: Record<string, unknown>) => mapStudent(row));
}

export async function getCrmStats() {
  await ensureCrmSchema();

  const [leadCount, studentCount, mailCount, latestLeadResult, latestStudentResult] = await Promise.all([
    dbQuery('SELECT COUNT(*)::INT AS count FROM leads'),
    dbQuery('SELECT COUNT(*)::INT AS count FROM students'),
    dbQuery(`SELECT
      COUNT(*) FILTER (WHERE mail_status = 'sent')::INT AS sent,
      COUNT(*) FILTER (WHERE mail_status = 'failed')::INT AS failed,
      COUNT(*) FILTER (WHERE stage = 'student')::INT AS converted
      FROM leads`),
    dbQuery(`
      SELECT leads.id, leads.created_at, leads.updated_at, leads.name, leads.email, leads.phone, leads.experience, leads.message,
        leads.stage, leads.mail_status, leads.mail_error, leads.notes, leads.converted_at,
        students.id AS student_id
      FROM leads
      LEFT JOIN students ON students.lead_id = leads.id
      ORDER BY leads.created_at DESC
      LIMIT 1
    `),
    dbQuery(`
      SELECT id, created_at, updated_at, lead_id, name, email, phone, experience, notes, active
      FROM students
      ORDER BY created_at DESC
      LIMIT 1
    `),
  ]);

  return {
    leads: Number(leadCount.rows[0]?.count ?? 0),
    students: Number(studentCount.rows[0]?.count ?? 0),
    sent: Number(mailCount.rows[0]?.sent ?? 0),
    failed: Number(mailCount.rows[0]?.failed ?? 0),
    converted: Number(mailCount.rows[0]?.converted ?? 0),
    latestLead: latestLeadResult.rows[0] ? mapLead(latestLeadResult.rows[0] as Record<string, unknown>) : null,
    latestStudent: latestStudentResult.rows[0] ? mapStudent(latestStudentResult.rows[0] as Record<string, unknown>) : null,
  };
}
