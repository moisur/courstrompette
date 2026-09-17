import { promises as fs } from 'fs';
import path from 'path';
import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

function normalizePathSegment(segment: string): string {
  try {
    return decodeURIComponent(segment);
  } catch {
    return segment;
  }
}

async function findFileOnDisk(publicRoot: string, requestedPath: string): Promise<string | null> {
  const cleanPath = requestedPath.replace(/^\/+/, '');
  const targetPath = path.normalize(path.join(publicRoot, cleanPath));

  // Security check: ensure path stays within publicRoot
  if (!targetPath.startsWith(publicRoot)) {
    return null;
  }

  // 1. Direct path check
  try {
    const stat = await fs.stat(targetPath);
    if (stat.isFile()) {
      return targetPath;
    }
  } catch {
    // proceed to candidate checks
  }

  // 2. Decoded path check
  const decodedPathStr = cleanPath
    .split('/')
    .map(normalizePathSegment)
    .join(path.sep);
  const decodedFullPath = path.normalize(path.join(publicRoot, decodedPathStr));
  if (decodedFullPath.startsWith(publicRoot)) {
    try {
      const stat = await fs.stat(decodedFullPath);
      if (stat.isFile()) {
        return decodedFullPath;
      }
    } catch {
      // proceed
    }
  }

  // 3. Mapped candidates (.windows-safe/Wikifonia/ <-> .rendered/)
  let altPathStr: string | null = null;
  if (cleanPath.startsWith('Wikifonia.windows-safe/')) {
    const filename = cleanPath
      .replace(/^Wikifonia\.windows-safe\/(?:Wikifonia\/)?/, '')
      .replace(/\.mxl(?:\.\d+)?$/i, '.musicxml');
    altPathStr = path.join('Wikifonia.rendered', filename);
  } else if (cleanPath.startsWith('Wikifonia.rendered/')) {
    const filename = cleanPath
      .replace(/^Wikifonia\.rendered\//, '')
      .replace(/\.(musicxml|xml)$/i, '.mxl');
    altPathStr = path.join('Wikifonia.windows-safe', 'Wikifonia', filename);
  }

  if (altPathStr) {
    const altFullPath = path.normalize(path.join(publicRoot, altPathStr));
    if (altFullPath.startsWith(publicRoot)) {
      try {
        const stat = await fs.stat(altFullPath);
        if (stat.isFile()) {
          return altFullPath;
        }
      } catch {
        // proceed
      }
    }

    // Try decoded version of alt path
    const decodedAltStr = altPathStr
      .split(path.sep)
      .map(normalizePathSegment)
      .join(path.sep);
    const decodedAltFullPath = path.normalize(path.join(publicRoot, decodedAltStr));
    if (decodedAltFullPath.startsWith(publicRoot)) {
      try {
        const stat = await fs.stat(decodedAltFullPath);
        if (stat.isFile()) {
          return decodedAltFullPath;
        }
      } catch {
        // proceed
      }
    }
  }

  return null;
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const rawPath = searchParams.get('path');

  if (!rawPath) {
    return NextResponse.json({ error: 'Missing path parameter' }, { status: 400 });
  }

  const publicRoot = path.join(process.cwd(), 'public');
  const foundFile = await findFileOnDisk(publicRoot, rawPath);

  if (!foundFile) {
    return NextResponse.json({ error: 'File not found' }, { status: 404 });
  }

  try {
    const fileBuffer = await fs.readFile(foundFile);
    const isMxl = /\.mxl(?:\.\d+)?$/i.test(foundFile);
    const contentType = isMxl
      ? 'application/vnd.recordare.musicxml'
      : 'application/vnd.recordare.musicxml+xml';

    return new NextResponse(fileBuffer, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=86400',
      },
    });
  } catch (err) {
    console.error('Error reading Wikifonia score file:', err);
    return NextResponse.json({ error: 'Error reading score file' }, { status: 500 });
  }
}
