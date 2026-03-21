"use client";

import React, { useEffect, useState } from 'react';
import JSZip from 'jszip';

import SheetMusic from '@/components/musique/SheetMusic';

import type { IrealWikifoniaMatch } from './irealWikifonia';

const COMPRESSED_SCORE_RE = /\.mxl(?:\.\d+)?$/i;
const XML_SCORE_RE = /\.(musicxml|xml)$/i;

function normalizeServedAssetPath(path: string): string {
  return path
    .replace(/%21/gi, '!')
    .replace(/%26/gi, '&')
    .replace(/%27/gi, "'")
    .replace(/%28/gi, '(')
    .replace(/%29/gi, ')')
    .replace(/%2C/gi, ',');
}

function getFallbackServedPath(path: string): string | null {
  if (!COMPRESSED_SCORE_RE.test(path)) {
    return null;
  }

  if (!path.startsWith('/Wikifonia.windows-safe/')) {
    return null;
  }

  return path
    .replace('/Wikifonia.windows-safe/', '/Wikifonia.rendered/')
    .replace(/\.mxl(?:\.\d+)?$/i, '.musicxml');
}

function normalizeZipEntryPath(entryPath: string): string {
  return entryPath.replace(/\\/g, '/').replace(/^\/+/, '');
}

function findXmlEntryPath(zip: JSZip, preferredPaths: string[]): string | null {
  const files = Object.values(zip.files).filter((entry) => !entry.dir);
  const fileLookup = new Map(files.map((entry) => [entry.name.toLowerCase(), entry.name]));

  for (const preferredPath of preferredPaths) {
    const normalizedPath = normalizeZipEntryPath(preferredPath).toLowerCase();
    const match = fileLookup.get(normalizedPath);
    if (match) {
      return match;
    }
  }

  const fallback = files.find(
    (entry) => XML_SCORE_RE.test(entry.name) && !entry.name.toLowerCase().startsWith('meta-inf/')
  );

  return fallback?.name ?? null;
}

function extractContainerPaths(containerXml: string): string[] {
  const xmlDocument = new DOMParser().parseFromString(containerXml, 'application/xml');
  const rootfiles = Array.from(xmlDocument.getElementsByTagName('*')).filter(
    (node) => node.localName === 'rootfile'
  );

  return rootfiles
    .map((node) => node.getAttribute('full-path')?.trim() ?? '')
    .filter(Boolean);
}

async function readMusicXmlFromArchive(buffer: ArrayBuffer): Promise<string> {
  const archive = await JSZip.loadAsync(buffer);
  const containerEntry = archive.file(/^META-INF\/container\.xml$/i)?.[0];

  let preferredPaths: string[] = [];
  if (containerEntry) {
    const containerXml = await containerEntry.async('string');
    preferredPaths = extractContainerPaths(containerXml);
  }

  const xmlEntryPath = findXmlEntryPath(archive, preferredPaths);
  if (!xmlEntryPath) {
    throw new Error('No MusicXML entry found in archive.');
  }

  const xmlEntry = archive.file(xmlEntryPath);
  if (!xmlEntry) {
    throw new Error(`Missing MusicXML entry: ${xmlEntryPath}`);
  }

  return xmlEntry.async('string');
}

interface WikifoniaSheetProps {
  match: IrealWikifoniaMatch;
}

export default function WikifoniaSheet({ match }: WikifoniaSheetProps) {
  const [xmlContent, setXmlContent] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const abortController = new AbortController();

    async function loadSheet() {
      setIsLoading(true);
      setError(null);
      setXmlContent(null);

      try {
        const requestedPath = normalizeServedAssetPath(match.wikifoniaPath);
        let response = await fetch(requestedPath, { signal: abortController.signal, cache: 'no-store' });
        let resolvedPath = requestedPath;

        if (!response.ok && response.status === 404) {
          const fallbackPath = getFallbackServedPath(requestedPath);

          if (fallbackPath) {
            const fallbackResponse = await fetch(fallbackPath, { signal: abortController.signal, cache: 'no-store' });
            if (fallbackResponse.ok) {
              response = fallbackResponse;
              resolvedPath = fallbackPath;
            }
          }
        }

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }

        const nextXmlContent = COMPRESSED_SCORE_RE.test(resolvedPath)
          ? await readMusicXmlFromArchive(await response.arrayBuffer())
          : await response.text();

        setXmlContent(nextXmlContent);
      } catch (loadError) {
        if (abortController.signal.aborted) {
          return;
        }

        const message = loadError instanceof Error ? loadError.message : 'Unknown error';
        setError(message);
      } finally {
        if (!abortController.signal.aborted) {
          setIsLoading(false);
        }
      }
    }

    loadSheet();

    return () => abortController.abort();
  }, [match.wikifoniaPath]);

  return (
    <section className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
      <div className="border-b border-slate-200 bg-slate-50 px-4 py-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
              Partition Wikifonia
            </p>
            <h3 className="text-sm font-bold text-slate-800">{match.wikifoniaLabel}</h3>
          </div>
          <span className="rounded-full bg-slate-200 px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest text-slate-600">
            Non transposee
          </span>
        </div>
      </div>

      {isLoading ? (
        <div className="flex min-h-[18rem] items-center justify-center px-4 py-10">
          <div className="flex items-center gap-3 text-sm font-medium text-slate-500">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-orange-500 border-t-transparent" />
            Chargement de la partition...
          </div>
        </div>
      ) : null}

      {!isLoading && error ? (
        <div className="px-4 py-6">
          <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3">
            <p className="text-sm font-semibold text-amber-700">Impossible de charger cette partition.</p>
            <p className="mt-1 text-xs text-amber-700/80">{error}</p>
          </div>
        </div>
      ) : null}

      {!isLoading && !error && xmlContent ? (
        <div className="px-4 py-4">
          <SheetMusic
            xmlContent={xmlContent}
            readOnly
            className="h-[28rem] md:h-[40rem]"
          />
        </div>
      ) : null}
    </section>
  );
}
