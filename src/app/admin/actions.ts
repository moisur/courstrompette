import { revalidatePath } from 'next/cache';

import { convertLeadToStudent } from '@/lib/crm';

export async function convertLeadToStudentAction(formData: FormData) {
  'use server';

  const leadId = String(formData.get('leadId') ?? '').trim();

  if (!leadId) {
    throw new Error('Lead id missing.');
  }

  await convertLeadToStudent(leadId);
  revalidatePath('/admin');
  revalidatePath('/admin/leads');
  revalidatePath('/admin/students');
}
