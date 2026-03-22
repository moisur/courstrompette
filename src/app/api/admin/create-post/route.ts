import fs from 'fs';
import path from 'path';

import { NextResponse } from 'next/server';

import { getAdminSession } from '@/lib/admin-auth';
import {
  buildPostMarkdownFile,
  getPostFilePath,
  getPostPublicUrl,
  normalizeCreatePostPayload,
} from '@/lib/post-workflow';

export async function POST(request: Request) {
  if (!getAdminSession()) {
    return NextResponse.json({ message: 'Authentification admin requise.' }, { status: 401 });
  }

  try {
    const payload = normalizeCreatePostPayload(await request.json());
    const filePath = getPostFilePath(payload.category, payload.slug);

    if (fs.existsSync(filePath)) {
      return NextResponse.json(
        { message: 'Un article avec ce slug existe deja dans cette categorie.' },
        { status: 409 },
      );
    }

    fs.mkdirSync(path.dirname(filePath), { recursive: true });
    fs.writeFileSync(filePath, buildPostMarkdownFile(payload), 'utf8');

    return NextResponse.json(
      {
        message: 'Article cree avec succes.',
        path: filePath,
        url: getPostPublicUrl(payload.category, payload.slug),
      },
      { status: 200 },
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Erreur interne du serveur.';
    const status = error instanceof Error ? 400 : 500;

    console.error('Error creating post:', error);

    return NextResponse.json({ message }, { status });
  }
}