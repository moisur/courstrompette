import type { IRealSong } from './iRealParser';

export type DisplayMode = 'chords' | 'sheet' | 'split';
export type PlaybackMode = 'ireal' | 'melody' | 'both';
export type ScoreTrackKind = 'melody' | 'accompaniment';

export interface WikifoniaLeadSheetRef {
  wikifoniaPath: string;
  wikifoniaLabel: string;
}

export interface IrealWikifoniaMatch extends WikifoniaLeadSheetRef {
  irealTitle: string;
  irealComposer: string;
  matchType: 'exact-normalized-title';
}

export interface StandaloneWikifoniaEntry extends WikifoniaLeadSheetRef {
  id: string;
  title: string;
  composer: string;
  matchType: 'standalone-rendered-score';
}

export type SheetReference = IrealWikifoniaMatch | StandaloneWikifoniaEntry;
export type LibrarySongSource = 'ireal' | 'standalone';

export interface LibrarySong {
  id: string;
  title: string;
  composer: string;
  style: string;
  keyLabel: string;
  song: IRealSong | null;
  sheet: SheetReference | null;
  source: LibrarySongSource;
}

export interface PlaybackPosition {
  measure: number;
  beat: number;
  time: number;
}

export interface ScoreTrack {
  id: string;
  label: string;
  kind: ScoreTrackKind;
  visible: boolean;
  audioEnabled: boolean;
  fingeringEnabled: boolean;
}

export function buildIrealSongKey(title: string, composer: string): string {
  return `${title}\u0000${composer}`;
}
