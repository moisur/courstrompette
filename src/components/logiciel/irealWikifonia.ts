export type DisplayMode = 'chords' | 'sheet' | 'split';
export type PlaybackMode = 'ireal' | 'melody' | 'both';
export type ScoreTrackKind = 'melody' | 'accompaniment';

export interface IrealWikifoniaMatch {
  irealTitle: string;
  irealComposer: string;
  wikifoniaPath: string;
  wikifoniaLabel: string;
  matchType: 'exact-normalized-title';
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
