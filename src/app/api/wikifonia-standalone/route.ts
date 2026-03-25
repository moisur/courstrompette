import { promises as fs } from 'fs';
import path from 'path';
import { NextResponse } from 'next/server';

import type { IrealWikifoniaMatch, StandaloneWikifoniaEntry } from '@/components/logiciel/irealWikifonia';

declare global {
  var __wikifoniaStandaloneCatalog: StandaloneWikifoniaEntry[] | undefined;
}

export const dynamic = 'force-dynamic';

const STANDALONE_SCORE_RE = /\.mxl(?:\.\d+)?$/i;

function encodePublicSegment(segment: string) {
  return encodeURIComponent(segment)
    .replace(/%21/gi, '!')
    .replace(/%26/gi, '&')
    .replace(/%27/gi, "'")
    .replace(/%28/gi, '(')
    .replace(/%29/gi, ')')
    .replace(/%2C/gi, ',');
}

function toPublicAssetPath(fullPath: string, publicRoot: string) {
  const relativePath = path.relative(publicRoot, fullPath);
  const segments = relativePath.split(path.sep).filter(Boolean).map(encodePublicSegment);
  return `/${segments.join('/')}`;
}

function parseStandaloneLabel(filePath: string) {
  const wikifoniaLabel = path.basename(filePath).replace(STANDALONE_SCORE_RE, '');
  const separatorIndex = wikifoniaLabel.lastIndexOf(' - ');

  if (separatorIndex < 0) {
    return {
      title: wikifoniaLabel,
      composer: 'Wikifonia',
      wikifoniaLabel,
    };
  }

  const composer = wikifoniaLabel.slice(0, separatorIndex).trim() || 'Wikifonia';
  const title = wikifoniaLabel.slice(separatorIndex + 3).trim() || wikifoniaLabel;

  return {
    title,
    composer,
    wikifoniaLabel,
  };
}

async function collectFiles(root: string): Promise<string[]> {
  const entries = await fs.readdir(root, { withFileTypes: true });
  const files = await Promise.all(
    entries.map(async (entry) => {
      const fullPath = path.join(root, entry.name);
      if (entry.isDirectory()) {
        return collectFiles(fullPath);
      }
      return STANDALONE_SCORE_RE.test(entry.name) ? [fullPath] : [];
    })
  );

  return files.flat();
}

async function loadMatchedLabels(publicRoot: string) {
  const manifestPath = path.join(publicRoot, 'ireal-wikifonia-matches.json');
  const payload = JSON.parse(await fs.readFile(manifestPath, 'utf8')) as IrealWikifoniaMatch[];

  return new Set(
    payload
      .map((item) => item.wikifoniaLabel)
      .filter((value): value is string => typeof value === 'string' && value.length > 0)
  );
}

async function buildStandaloneCatalog(): Promise<StandaloneWikifoniaEntry[]> {
  if (globalThis.__wikifoniaStandaloneCatalog) {
    return globalThis.__wikifoniaStandaloneCatalog;
  }

  const publicRoot = path.join(process.cwd(), 'public');
  const standaloneRoot = path.join(publicRoot, 'Wikifonia.windows-safe');
  const matchedLabels = await loadMatchedLabels(publicRoot);
  const sourceFiles = await collectFiles(standaloneRoot);

  const entries = sourceFiles
    .map((filePath) => {
      const labelData = parseStandaloneLabel(filePath);
      if (matchedLabels.has(labelData.wikifoniaLabel)) {
        return null;
      }

      const wikifoniaPath = toPublicAssetPath(filePath, publicRoot);
      return {
        id: wikifoniaPath,
        title: labelData.title,
        composer: labelData.composer,
        wikifoniaPath,
        wikifoniaLabel: labelData.wikifoniaLabel,
        matchType: 'standalone-rendered-score',
      } satisfies StandaloneWikifoniaEntry;
    })
    .filter((entry): entry is StandaloneWikifoniaEntry => Boolean(entry))
    .sort((left, right) => {
      const titleCompare = left.title.localeCompare(right.title);
      if (titleCompare !== 0) {
        return titleCompare;
      }
      return left.composer.localeCompare(right.composer);
    });

  globalThis.__wikifoniaStandaloneCatalog = entries;
  return entries;
}

export async function GET() {
  try {
    const entries = await buildStandaloneCatalog();

    return NextResponse.json(entries, {
      headers: {
        'Cache-Control': 'public, max-age=3600',
      },
    });
  } catch (error) {
    console.error('Failed to build standalone Wikifonia catalog:', error);
    return NextResponse.json(
      { message: 'Failed to load standalone Wikifonia catalog.' },
      { status: 500 }
    );
  }
}
