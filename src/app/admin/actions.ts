import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

import { clearAdminSession, requireAdminSession } from '@/lib/admin-auth';
import { convertLeadToStudent } from '@/lib/crm';

export async function convertLeadToStudentAction(formData: FormData) {
  'use server';

  requireAdminSession('/admin/leads');

  const leadId = String(formData.get('leadId') ?? '').trim();

  if (!leadId) {
    throw new Error('Lead id missing.');
  }

  await convertLeadToStudent(leadId);
  revalidatePath('/admin');
  revalidatePath('/admin/leads');
  revalidatePath('/admin/students');
}

export async function logoutAdminAction() {
  'use server';

  clearAdminSession();
  redirect('/login');
}