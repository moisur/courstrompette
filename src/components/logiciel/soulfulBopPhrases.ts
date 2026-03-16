// Soulful Bop Jazz Phrases – Trompette Sib (Written pitch)
// Style Kellin Hanas / Chad LB – Bebop Modern Jazz

type BopNote = { key: string; duration: string; newLine?: boolean };

export const SOULFUL_BOP_PHRASES: { [key: string]: BopNote[] } = {

  // ==========================================
  // BEBOP LINES – 10 Phrases Détaillées
  // ==========================================

  'Bebop Scale Desc. – Gm7': [
    { key: 'B4/r', duration: '8' }, { key: 'G4', duration: '8' },
    { key: 'A4', duration: '16' }, { key: 'Bb4', duration: '16' }, { key: 'C5', duration: '16' }, { key: 'D5', duration: '16' },
    { key: 'Eb5', duration: '8' }, { key: 'E5', duration: '8' },
    { key: 'F5', duration: '8' }, { key: 'F#5', duration: '8' },
    { key: 'G5', duration: 'q' },
  ],

  'Triolets Bluesy – Eb7': [
    { key: 'Bb4', duration: '8' }, { key: 'G4', duration: '8' }, { key: 'F4', duration: '8' },
    { key: 'Eb4', duration: '8' }, { key: 'Db4', duration: '8' },
    { key: 'C4', duration: '8' }, { key: 'B4/r', duration: '8' },
    { key: 'Bb3', duration: '16' }, { key: 'A3', duration: '16' }, { key: 'Ab3', duration: '16' }, { key: 'G3', duration: '16' },
    { key: 'Gb4', duration: 'q' },
  ],

  'Altered Tension – G7alt': [
    { key: 'B4/r', duration: '8' }, { key: 'Ab4', duration: '8' },
    { key: 'Bb4', duration: '16' }, { key: 'B4', duration: '16' }, { key: 'Db5', duration: '16' }, { key: 'Eb5', duration: '16' },
    { key: 'F5', duration: '8' }, { key: 'G5', duration: '8' },
    { key: 'F5', duration: '16' }, { key: 'Eb5', duration: '16' }, { key: 'Db5', duration: '16' }, { key: 'B4', duration: '16' },
    { key: 'C5', duration: 'q' },
  ],

  'Double-Time Enclosure – Cmaj7': [
    { key: 'G4', duration: '8' }, { key: 'E4', duration: '8' },
    { key: 'F4', duration: '16' }, { key: 'F#4', duration: '16' }, { key: 'G4', duration: '16' }, { key: 'A4', duration: '16' },
    { key: 'B4', duration: '16' }, { key: 'C5', duration: '16' }, { key: 'D5', duration: '16' }, { key: 'D#5', duration: '16' },
    { key: 'E5', duration: '8' }, { key: 'G5', duration: '8' },
    { key: 'C5', duration: 'q' },
  ],

  'La Hanas – Half Valve (F7)': [
    { key: 'B4/r', duration: '8' }, { key: 'C5', duration: '8' },
    { key: 'Eb5', duration: '16' }, { key: 'D5', duration: '16' }, { key: 'Db5', duration: '16' }, { key: 'C5', duration: '16' },
    { key: 'B4', duration: '16' }, { key: 'Bb4', duration: '16' }, { key: 'A4', duration: '16' }, { key: 'Ab4', duration: '16' },
    { key: 'G4', duration: '8' }, { key: 'C5', duration: '8' },
    { key: 'F4', duration: 'q' },
  ],

  'Arpège 9ème & Turn – Dm7': [
    { key: 'F4', duration: '8' }, { key: 'A4', duration: '8' },
    { key: 'C5', duration: '8' }, { key: 'E5', duration: '8' },
    { key: 'D5', duration: '16' }, { key: 'C5', duration: '16' }, { key: 'B4', duration: '16' }, { key: 'Bb4', duration: '16' },
    { key: 'A4', duration: '8' }, { key: 'F4', duration: '8' },
    { key: 'D4', duration: 'q' },
  ],

  'Chromatisme V-I – C7→Fmaj7': [
    { key: 'E4', duration: '8' }, { key: 'G4', duration: '8' },
    { key: 'Bb4', duration: '8' }, { key: 'Db5', duration: '8' },
    { key: 'C5', duration: '8' }, { key: 'Bb4', duration: '8' },
    { key: 'A4', duration: '8' }, { key: 'Ab4', duration: '8' },
    { key: 'G4', duration: '8' }, { key: 'F4', duration: '8' },
    { key: 'E4', duration: 'h' },
  ],

  'Lydian Dominant #11 – Bb7': [
    { key: 'D5', duration: '8' }, { key: 'F5', duration: '8' },
    { key: 'A5', duration: '8' }, { key: 'Ab5', duration: '8' },
    { key: 'G5', duration: '16' }, { key: 'F5', duration: '16' }, { key: 'Eb5', duration: '16' }, { key: 'D5', duration: '16' },
    { key: 'C5', duration: '8' }, { key: 'Ab4', duration: '8' },
    { key: 'Bb4', duration: 'q' },
  ],

  'Descente Intervallic – Gm7': [
    { key: 'B4/r', duration: '8' }, { key: 'Bb4', duration: '8' },
    { key: 'G4', duration: '8' }, { key: 'D4', duration: '8' },
    { key: 'Bb3', duration: '8' }, { key: 'D4', duration: '8' },
    { key: 'F4', duration: '16' }, { key: 'E4', duration: '16' }, { key: 'Eb4', duration: '16' }, { key: 'D4', duration: '16' },
    { key: 'G4', duration: 'q' },
  ],

  'Le Climax Aigu – G7': [
    { key: 'B4/r', duration: 'q' },
    { key: 'G5', duration: '8' }, { key: 'F5', duration: '8' },
    { key: 'E5', duration: '8' }, { key: 'Eb5', duration: '8' },
    { key: 'D5', duration: '16' }, { key: 'Db5', duration: '16' }, { key: 'C5', duration: '16' }, { key: 'B4', duration: '16' },
    { key: 'G4', duration: 'q' },
  ],

  // ==========================================
  // GROUP 1 – MINOR 7  (Gm7 / Cm7 / Dm7)
  // ==========================================

  'Gm7 Chromatic Line (180bpm)': [
    { key: 'Bb4', duration: '8' }, { key: 'A4', duration: '8' },
    { key: 'Ab4', duration: '8' }, { key: 'G4', duration: '8' },
    { key: 'F#4', duration: '8' }, { key: 'G4', duration: '8' },
    { key: 'A4', duration: '8' }, { key: 'Bb4', duration: '8' },
  ],

  'Cm7 Inner Chromatic (200bpm)': [
    { key: 'B4/r', duration: '8' }, { key: 'Eb5', duration: '8' },
    { key: 'D5', duration: '16' }, { key: 'Db5', duration: '16' }, { key: 'C5', duration: '16' }, { key: 'B4', duration: '16' },
    { key: 'Bb4', duration: '8' }, { key: 'G4', duration: '8' },
    { key: 'Eb5', duration: 'q' },
  ],

  'Dm7 Ascending 16ths (160bpm)': [
    { key: 'F4', duration: '16' }, { key: 'G4', duration: '16' }, { key: 'G#4', duration: '16' }, { key: 'A4', duration: '16' },
    { key: 'C5', duration: '8' }, { key: 'E5', duration: '8' },
    { key: 'D5', duration: '8' }, { key: 'B4/r', duration: '8' },
    { key: 'C5', duration: '16' }, { key: 'B4', duration: '16' }, { key: 'Bb4', duration: '16' }, { key: 'A4', duration: '16' },
  ],

  'Gm7 Drop & Recover (220bpm)': [
    { key: 'G4', duration: '8' }, { key: 'D4', duration: '8' },
    { key: 'Bb4', duration: '8' }, { key: 'G4', duration: '8' },
    { key: 'F4', duration: '16' }, { key: 'E4', duration: '16' }, { key: 'Eb4', duration: '16' }, { key: 'D4', duration: '16' },
    { key: 'C4', duration: '8' }, { key: 'Bb3', duration: '8' },
  ],

  'Cm7 Triplet Swing (140bpm)': [
    { key: 'Eb4', duration: '8' }, { key: 'F4', duration: '8' }, { key: 'G4', duration: '8' },
    { key: 'Bb4', duration: '8' }, { key: 'D5', duration: '8' },
    { key: 'C5', duration: '8' }, { key: 'Ab4', duration: '8' },
    { key: 'G4', duration: '8' }, { key: 'F#4', duration: '8' },
  ],

  'Dm7 Ghost Note Run (190bpm)': [
    { key: 'B4/r', duration: '8' }, { key: 'A4', duration: '8' },
    { key: 'C5', duration: '16' }, { key: 'B4', duration: '16' }, { key: 'Bb4', duration: '16' }, { key: 'A4', duration: '16' },
    { key: 'G4', duration: '8' }, { key: 'F4', duration: '8' },
    { key: 'E4', duration: '8' }, { key: 'D4', duration: '8' },
  ],

  'Gm7 Soulful Answer (170bpm)': [
    { key: 'Bb4', duration: '8' }, { key: 'A4', duration: '8' },
    { key: 'G4', duration: '16' }, { key: 'F4', duration: '16' }, { key: 'E4', duration: '16' }, { key: 'Eb4', duration: '16' },
    { key: 'D4', duration: '8' }, { key: 'G4', duration: '8' },
    { key: 'Bb4', duration: 'q' },
  ],

  'Cm7 High Register (210bpm)': [
    { key: 'C5', duration: '8' }, { key: 'Eb5', duration: '8' },
    { key: 'G5', duration: '8' }, { key: 'Bb5', duration: '8' },
    { key: 'D5', duration: '16' }, { key: 'C5', duration: '16' }, { key: 'B4', duration: '16' }, { key: 'Bb4', duration: '16' },
    { key: 'A4', duration: '8' }, { key: 'Ab4', duration: '8' },
  ],

  'Dm7 Lazy Triplet (150bpm)': [
    { key: 'B4/r', duration: 'q' },
    { key: 'F4', duration: '8' }, { key: 'G4', duration: '8' }, { key: 'A4', duration: '8' },
    { key: 'C5', duration: '8' }, { key: 'E5', duration: '8' },
    { key: 'D4', duration: 'q' },
  ],

  'Gm7 Arpège Chromatic (185bpm)': [
    { key: 'G4', duration: '8' }, { key: 'Bb4', duration: '8' },
    { key: 'D5', duration: '8' }, { key: 'F5', duration: '8' },
    { key: 'E5', duration: '16' }, { key: 'Eb5', duration: '16' }, { key: 'D5', duration: '16' }, { key: 'C5', duration: '16' },
    { key: 'Bb4', duration: '8' }, { key: 'G4', duration: '8' },
  ],

  // ==========================================
  // GROUP 2 – DOMINANT 7  (C7 / F7 / Bb7 / Eb7 / G7)
  // ==========================================

  'C7 Tritone Shell (160bpm)': [
    { key: 'E4', duration: '8' }, { key: 'G4', duration: '8' },
    { key: 'Bb4', duration: '8' }, { key: 'Db5', duration: '8' },
    { key: 'C5', duration: '8' }, { key: 'Bb4', duration: '8' },
    { key: 'A4', duration: '8' }, { key: 'Ab4', duration: '8' },
  ],

  'F7 Triplet Approach (130bpm)': [
    { key: 'A4', duration: '8' }, { key: 'Bb4', duration: '8' }, { key: 'B4', duration: '8' },
    { key: 'C5', duration: '8' }, { key: 'Eb5', duration: '8' },
    { key: 'D5', duration: '8' }, { key: 'Db5', duration: '8' },
    { key: 'C5', duration: '8' }, { key: 'Bb4', duration: '8' },
  ],

  'Bb7 Dominant Drop (200bpm)': [
    { key: 'D5', duration: '8' }, { key: 'F5', duration: '8' },
    { key: 'Ab5', duration: '16' }, { key: 'G5', duration: '16' }, { key: 'Gb5', duration: '16' }, { key: 'F5', duration: '16' },
    { key: 'D5', duration: '8' }, { key: 'Bb4', duration: '8' },
    { key: 'Ab4', duration: 'q' },
  ],

  'Eb7 Chromatic Approach (145bpm)': [
    { key: 'B4/r', duration: '8' }, { key: 'G4', duration: '8' },
    { key: 'Bb4', duration: '16' }, { key: 'B4', duration: '16' }, { key: 'C5', duration: '16' }, { key: 'Db5', duration: '16' },
    { key: 'Eb5', duration: '8' }, { key: 'Bb4', duration: '8' },
    { key: 'G4', duration: '8' }, { key: 'Eb4', duration: '8' },
  ],

  'G7alt Outside Line (175bpm)': [
    { key: 'Ab4', duration: '8' }, { key: 'Bb4', duration: '8' },
    { key: 'B4', duration: '8' }, { key: 'Db5', duration: '8' },
    { key: 'Eb5', duration: '16' }, { key: 'Db5', duration: '16' }, { key: 'B4', duration: '16' }, { key: 'Bb4', duration: '16' },
    { key: 'Ab4', duration: '8' }, { key: 'G4', duration: '8' },
  ],

  'C7 Cascading 8ths (220bpm)': [
    { key: 'Bb4', duration: '8' }, { key: 'A4', duration: '8' },
    { key: 'Ab4', duration: '8' }, { key: 'G4', duration: '8' },
    { key: 'Gb4', duration: '8' }, { key: 'F4', duration: '8' },
    { key: 'E4', duration: '8' }, { key: 'C4', duration: '8' },
  ],

  'F7 Lazy Groove (120bpm)': [
    { key: 'C4', duration: '8' }, { key: 'D4', duration: '8' }, { key: 'Eb4', duration: '8' },
    { key: 'E4', duration: '8' }, { key: 'G4', duration: '8' },
    { key: 'F4', duration: '8' }, { key: 'C5', duration: '8' },
    { key: 'A4', duration: '8' }, { key: 'F4', duration: 'q' },
  ],

  'Bb7 Soul Riff (190bpm)': [
    { key: 'Ab4', duration: '8' }, { key: 'G4', duration: '8' },
    { key: 'F4', duration: '8' }, { key: 'D4', duration: '8' },
    { key: 'Eb4', duration: '16' }, { key: 'D4', duration: '16' }, { key: 'Db4', duration: '16' }, { key: 'C4', duration: '16' },
    { key: 'Bb3', duration: '8' }, { key: 'Ab3', duration: '8' },
  ],

  'Eb7 Ascending Tension (155bpm)': [
    { key: 'Bb4', duration: '8' }, { key: 'Db5', duration: '8' },
    { key: 'D5', duration: '8' }, { key: 'F5', duration: '8' },
    { key: 'G5', duration: '8' }, { key: 'Bb5', duration: '8' },
    { key: 'A5', duration: '16' }, { key: 'Ab5', duration: '16' }, { key: 'G5', duration: '16' }, { key: 'F5', duration: '16' },
  ],

  'G7 Full Diminished (210bpm)': [
    { key: 'B4', duration: '8' }, { key: 'D5', duration: '8' },
    { key: 'F5', duration: '8' }, { key: 'Ab5', duration: '8' },
    { key: 'G5', duration: '8' }, { key: 'F5', duration: '8' },
    { key: 'E5', duration: '16' }, { key: 'Eb5', duration: '16' }, { key: 'D5', duration: '16' }, { key: 'C5', duration: '16' },
  ],

  // ==========================================
  // GROUP 3 – MAJOR 7  (Fmaj7 / Bbmaj7 / Cmaj7)
  // ==========================================

  'Fmaj7 Lydian Line (165bpm)': [
    { key: 'A4', duration: '8' }, { key: 'C5', duration: '8' },
    { key: 'E5', duration: '8' }, { key: 'G5', duration: '8' },
    { key: 'F5', duration: '16' }, { key: 'E5', duration: '16' }, { key: 'D5', duration: '16' }, { key: 'C5', duration: '16' },
    { key: 'B4', duration: '8' }, { key: 'C5', duration: '8' },
  ],

  'Bbmaj7 Triplet Rise (140bpm)': [
    { key: 'B4/r', duration: '8' }, { key: 'A4', duration: '8' },
    { key: 'Bb4', duration: '8' }, { key: 'C5', duration: '8' }, { key: 'D5', duration: '8' },
    { key: 'F4', duration: '8' }, { key: 'A4', duration: '8' },
    { key: 'Bb4', duration: 'q' },
  ],

  'Cmaj7 Bop Contour (180bpm)': [
    { key: 'G4', duration: '8' }, { key: 'E4', duration: '8' },
    { key: 'C5', duration: '8' }, { key: 'B4', duration: '8' },
    { key: 'A4', duration: '16' }, { key: 'Ab4', duration: '16' }, { key: 'G4', duration: '16' }, { key: 'F#4', duration: '16' },
    { key: 'G4', duration: '8' }, { key: 'B4', duration: '8' },
  ],

  'Fmaj7 Stepwise Descent (200bpm)': [
    { key: 'E4', duration: '8' }, { key: 'G4', duration: '8' },
    { key: 'F4', duration: '8' }, { key: 'D4', duration: '8' },
    { key: 'C4', duration: '8' }, { key: 'A3', duration: '8' },
    { key: 'Bb3', duration: '16' }, { key: 'A3', duration: '16' }, { key: 'Ab3', duration: '16' }, { key: 'G3', duration: '16' },
  ],

  'Bbmaj7 Arpège Triplet (130bpm)': [
    { key: 'F4', duration: '8' }, { key: 'G4', duration: '8' }, { key: 'A4', duration: '8' },
    { key: 'C5', duration: '8' }, { key: 'D5', duration: '8' },
    { key: 'E5', duration: '8' }, { key: 'F5', duration: '8' },
    { key: 'A5', duration: '8' }, { key: 'Bb5', duration: 'q' },
  ],

  'Cmaj7 Major 7 Voice (170bpm)': [
    { key: 'B4', duration: '8' }, { key: 'C5', duration: '8' },
    { key: 'D5', duration: '8' }, { key: 'E5', duration: '8' },
    { key: 'G5', duration: '16' }, { key: 'F#5', duration: '16' }, { key: 'F5', duration: '16' }, { key: 'E5', duration: '16' },
    { key: 'D5', duration: '8' }, { key: 'C5', duration: '8' },
  ],

  'Fmaj7 Bebop Turn (190bpm)': [
    { key: 'C5', duration: '8' }, { key: 'A4', duration: '8' },
    { key: 'F4', duration: '8' }, { key: 'E4', duration: '8' },
    { key: 'D4', duration: '16' }, { key: 'D#4', duration: '16' }, { key: 'E4', duration: '16' }, { key: 'G4', duration: '16' },
    { key: 'F4', duration: 'q' },
  ],

  'Bbmaj7 Rhythmic Punch (150bpm)': [
    { key: 'D5', duration: '8' }, { key: 'F5', duration: '8' },
    { key: 'A5', duration: '8' }, { key: 'C6', duration: '8' },
    { key: 'Bb5', duration: '8' }, { key: 'A5', duration: '8' },
    { key: 'G5', duration: '16' }, { key: 'F5', duration: '16' }, { key: 'E5', duration: '16' }, { key: 'Eb5', duration: '16' },
  ],

  'Cmaj7 Double-Time (210bpm)': [
    { key: 'G4', duration: '8' }, { key: 'F#4', duration: '8' },
    { key: 'F4', duration: '8' }, { key: 'E4', duration: '8' },
    { key: 'D4', duration: '8' }, { key: 'D#4', duration: '8' },
    { key: 'E4', duration: '8' }, { key: 'G4', duration: '8' },
  ],

  'Fmaj7 Lazy Triplet (125bpm)': [
    { key: 'B4/r', duration: 'q' },
    { key: 'A4', duration: '8' }, { key: 'B4', duration: '8' }, { key: 'C5', duration: '8' },
    { key: 'E5', duration: '8' }, { key: 'G5', duration: '8' },
    { key: 'F5', duration: 'q' },
  ],

  // ==========================================
  // GROUP 4 – ii-V-I & BLUES
  // ==========================================

  'ii-V Gm7-C7 (180bpm)': [
    { key: 'Bb4', duration: '8' }, { key: 'G4', duration: '8' },
    { key: 'A4', duration: '16' }, { key: 'Ab4', duration: '16' }, { key: 'G4', duration: '16' }, { key: 'Gb4', duration: '16' },
    { key: 'E4', duration: '8' }, { key: 'Bb4', duration: '8' },
    { key: 'A4', duration: '8' }, { key: 'Ab4', duration: '8' },
  ],

  'ii-V Cm7-F7 (190bpm)': [
    { key: 'Eb5', duration: '8' }, { key: 'C5', duration: '8' },
    { key: 'Bb4', duration: '8' }, { key: 'A4', duration: '8' },
    { key: 'Ab4', duration: '16' }, { key: 'G4', duration: '16' }, { key: 'Gb4', duration: '16' }, { key: 'F4', duration: '16' },
    { key: 'Eb4', duration: '8' }, { key: 'D4', duration: '8' },
  ],

  'ii-V Fm7-Bb7 (170bpm)': [
    { key: 'Ab4', duration: '8' }, { key: 'F4', duration: '8' },
    { key: 'Eb4', duration: '8' }, { key: 'D4', duration: '8' },
    { key: 'Db4', duration: '16' }, { key: 'C4', duration: '16' }, { key: 'B3', duration: '16' }, { key: 'Bb3', duration: '16' },
    { key: 'A3', duration: '8' }, { key: 'Bb3', duration: '8' },
  ],

  'ii-V Dm7-G7 (200bpm)': [
    { key: 'F4', duration: '8' }, { key: 'A4', duration: '8' },
    { key: 'C5', duration: '8' }, { key: 'B4', duration: '8' },
    { key: 'Bb4', duration: '16' }, { key: 'A4', duration: '16' }, { key: 'Ab4', duration: '16' }, { key: 'G4', duration: '16' },
    { key: 'F#4', duration: '8' }, { key: 'G4', duration: '8' },
  ],

  'ii-V Am7-D7 (160bpm)': [
    { key: 'C5', duration: '8' }, { key: 'E5', duration: '8' },
    { key: 'G5', duration: '8' }, { key: 'F#5', duration: '8' },
    { key: 'F5', duration: '16' }, { key: 'E5', duration: '16' }, { key: 'Eb5', duration: '16' }, { key: 'D5', duration: '16' },
    { key: 'C#5', duration: '8' }, { key: 'D5', duration: '8' },
  ],

  'Blues Gm7 Triplet (140bpm)': [
    { key: 'G4', duration: '8' }, { key: 'Bb4', duration: '8' }, { key: 'C5', duration: '8' },
    { key: 'Db5', duration: '8' }, { key: 'C5', duration: '8' },
    { key: 'Bb4', duration: '8' }, { key: 'G4', duration: '8' },
    { key: 'F4', duration: '8' }, { key: 'F#4', duration: '8' },
  ],

  'Blues C7 Call & Response (130bpm)': [
    { key: 'B4/r', duration: '8' }, { key: 'Bb4', duration: '8' },
    { key: 'C4', duration: '8' }, { key: 'Eb4', duration: '8' }, { key: 'E4', duration: '8' },
    { key: 'G4', duration: '8' }, { key: 'Bb4', duration: '8' },
    { key: 'A4', duration: '8' }, { key: 'Ab4', duration: '8' },
  ],

  'Soul F7 Riff (150bpm)': [
    { key: 'C5', duration: '8' }, { key: 'Eb5', duration: '8' },
    { key: 'F5', duration: '8' }, { key: 'Ab5', duration: '8' },
    { key: 'A5', duration: '16' }, { key: 'Ab5', duration: '16' }, { key: 'G5', duration: '16' }, { key: 'Gb5', duration: '16' },
    { key: 'F5', duration: '8' }, { key: 'C5', duration: '8' },
  ],

  'ii-V-I in F (220bpm)': [
    { key: 'G4', duration: '8' }, { key: 'Bb4', duration: '8' },
    { key: 'D5', duration: '8' }, { key: 'Db5', duration: '8' },
    { key: 'C5', duration: '8' }, { key: 'Bb4', duration: '8' },
    { key: 'A4', duration: '8' }, { key: 'F4', duration: '8' },
  ],

  'Turnaround Bebop (200bpm)': [
    { key: 'Bb4', duration: '8' }, { key: 'G4', duration: '8' },
    { key: 'C5', duration: '8' }, { key: 'A4', duration: '8' },
    { key: 'D5', duration: '8' }, { key: 'Bb4', duration: '8' },
    { key: 'Eb5', duration: '8' }, { key: 'C5', duration: '8' },
  ],
};

export const SOULFUL_BOP_KEYS = Object.keys(SOULFUL_BOP_PHRASES);
