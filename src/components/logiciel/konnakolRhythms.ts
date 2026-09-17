// Konnakol / Solkattu Rhythms Database (1 à 23 subdivisions)
// Utilisé pour le travail du débit rythmique, des mesures asymétriques et de la précision

export interface KonnakolWord {
  text: string;
  syllables: string[];
  count: number;
  color?: string;
}

export interface KonnakolRhythm {
  id: number;
  title: string;
  subdivisions: number;
  formula: string;
  timeSignature?: string;
  beatsPerMeasure?: number;
  words: KonnakolWord[];
  notes: { key: string; duration: string; newLine?: boolean }[];
}

export const KONNAKOL_RHYTHMS_LIST: KonnakolRhythm[] = [
  {
    id: 1,
    title: '1 — Thom',
    subdivisions: 1,
    formula: '1',
    words: [
      { text: 'Thom', syllables: ['Thom'], count: 1, color: 'bg-emerald-500' }
    ],
    notes: [{ key: 'C4', duration: 'q' }]
  },
  {
    id: 2,
    title: '2 — Thaka',
    subdivisions: 2,
    formula: '2',
    words: [
      { text: 'Thaka', syllables: ['Tha', 'ka'], count: 2, color: 'bg-blue-500' }
    ],
    notes: [{ key: 'G4', duration: '8' }, { key: 'C4', duration: '8' }]
  },
  {
    id: 3,
    title: '3 — Thakita',
    subdivisions: 3,
    formula: '3',
    words: [
      { text: 'Thakita', syllables: ['Tha', 'ki', 'ta'], count: 3, color: 'bg-amber-500' }
    ],
    notes: [{ key: 'G4', duration: '8' }, { key: 'E4', duration: '8' }, { key: 'C4', duration: '8' }]
  },
  {
    id: 4,
    title: '4 — Thakadhimi',
    subdivisions: 4,
    formula: '4',
    words: [
      { text: 'Thakadhimi', syllables: ['Tha', 'ka', 'dhi', 'mi'], count: 4, color: 'bg-indigo-500' }
    ],
    notes: [{ key: 'G4', duration: '8' }, { key: 'E4', duration: '8' }, { key: 'F4', duration: '8' }, { key: 'C4', duration: '8' }]
  },
  {
    id: 5,
    title: '5 — Thadhikitathom',
    subdivisions: 5,
    formula: '5',
    words: [
      { text: 'Thadhikitathom', syllables: ['Tha', 'dhi', 'ki', 'ta', 'thom'], count: 5, color: 'bg-rose-500' }
    ],
    notes: [
      { key: 'G4', duration: '8' }, { key: 'F4', duration: '8' },
      { key: 'E4', duration: '8' }, { key: 'D4', duration: '8' }, { key: 'C4', duration: '8' }
    ]
  },
  {
    id: 6,
    title: '6 — Thadheen Ginathom',
    subdivisions: 6,
    formula: '6',
    words: [
      { text: 'Thadheen Ginathom', syllables: ['Tha', 'dheen', 'Gi', 'na', 'thom', 'ta'], count: 6, color: 'bg-purple-500' }
    ],
    notes: [
      { key: 'G4', duration: '8' }, { key: 'F4', duration: '8' },
      { key: 'E4', duration: '8' }, { key: 'D4', duration: '8' },
      { key: 'C4', duration: '8' }, { key: 'G4', duration: '8' }
    ]
  },
  {
    id: 7,
    title: '7 — Tha Thi Kitathom',
    subdivisions: 7,
    formula: '2 + 2 + 3 = 7',
    words: [
      { text: 'Tha', syllables: ['Tha', 'ka'], count: 2, color: 'bg-teal-500' },
      { text: 'Thi', syllables: ['Thi', 'na'], count: 2, color: 'bg-teal-600' },
      { text: 'Kitathom', syllables: ['Ki', 'ta', 'thom'], count: 3, color: 'bg-teal-700' }
    ],
    notes: [
      { key: 'G4', duration: '8' }, { key: 'E4', duration: '8' },
      { key: 'F4', duration: '8' }, { key: 'D4', duration: '8' },
      { key: 'E4', duration: '8' }, { key: 'D4', duration: '8' }, { key: 'C4', duration: '8' }
    ]
  },
  {
    id: 8,
    title: '8 — Thakita Thadhikitathom (3+5)',
    subdivisions: 8,
    formula: '3 + 5 = 8',
    words: [
      { text: 'Thakita', syllables: ['Tha', 'ki', 'ta'], count: 3, color: 'bg-amber-500' },
      { text: 'Thadhikitathom', syllables: ['Tha', 'dhi', 'ki', 'ta', 'thom'], count: 5, color: 'bg-rose-500' }
    ],
    notes: [
      { key: 'G4', duration: '8' }, { key: 'E4', duration: '8' }, { key: 'C4', duration: '8' },
      { key: 'G4', duration: '8' }, { key: 'F4', duration: '8' }, { key: 'E4', duration: '8' }, { key: 'D4', duration: '8' }, { key: 'C4', duration: '8' }
    ]
  },
  {
    id: 9,
    title: '9 — Thakadhimi Thadhikitathom (4+5)',
    subdivisions: 9,
    formula: '4 + 5 = 9',
    words: [
      { text: 'Thakadhimi', syllables: ['Tha', 'ka', 'dhi', 'mi'], count: 4, color: 'bg-indigo-500' },
      { text: 'Thadhikitathom', syllables: ['Tha', 'dhi', 'ki', 'ta', 'thom'], count: 5, color: 'bg-rose-500' }
    ],
    notes: [
      { key: 'G4', duration: '8' }, { key: 'E4', duration: '8' }, { key: 'F4', duration: '8' }, { key: 'C4', duration: '8' },
      { key: 'G4', duration: '8' }, { key: 'F4', duration: '8' }, { key: 'E4', duration: '8' }, { key: 'D4', duration: '8' }, { key: 'C4', duration: '8' }
    ]
  },
  {
    id: 10,
    title: '10 — Thakitathom Thathikitathom (5+5)',
    subdivisions: 10,
    formula: '5 + 5 = 10',
    words: [
      { text: 'Thakitathom', syllables: ['Tha', 'ki', 'ta', 'thom', 'ta'], count: 5, color: 'bg-cyan-600' },
      { text: 'Thathikitathom', syllables: ['Tha', 'thi', 'ki', 'ta', 'thom'], count: 5, color: 'bg-cyan-700' }
    ],
    notes: [
      { key: 'G4', duration: '8' }, { key: 'E4', duration: '8' }, { key: 'D4', duration: '8' }, { key: 'C4', duration: '8' }, { key: 'G4', duration: '8' },
      { key: 'G4', duration: '8' }, { key: 'F4', duration: '8' }, { key: 'E4', duration: '8' }, { key: 'D4', duration: '8' }, { key: 'C4', duration: '8' }
    ]
  },
  {
    id: 11,
    title: '11 — Thom Thakitathom Thathikitathom (1+10)',
    subdivisions: 11,
    formula: '1 + (5 + 5) = 11',
    words: [
      { text: 'Thom', syllables: ['Thom'], count: 1, color: 'bg-emerald-500' },
      { text: 'Thakitathom', syllables: ['Tha', 'ki', 'ta', 'thom', 'ta'], count: 5, color: 'bg-cyan-600' },
      { text: 'Thathikitathom', syllables: ['Tha', 'thi', 'ki', 'ta', 'thom'], count: 5, color: 'bg-cyan-700' }
    ],
    notes: [
      { key: 'C4', duration: '8' },
      { key: 'G4', duration: '8' }, { key: 'E4', duration: '8' }, { key: 'D4', duration: '8' }, { key: 'C4', duration: '8' }, { key: 'G4', duration: '8' },
      { key: 'G4', duration: '8' }, { key: 'F4', duration: '8' }, { key: 'E4', duration: '8' }, { key: 'D4', duration: '8' }, { key: 'C4', duration: '8' }
    ]
  },
  {
    id: 12,
    title: '12 — Thaka Thakitathom Thathikitathom (2+10)',
    subdivisions: 12,
    formula: '2 + (5 + 5) = 12',
    words: [
      { text: 'Thaka', syllables: ['Tha', 'ka'], count: 2, color: 'bg-blue-500' },
      { text: 'Thakitathom', syllables: ['Tha', 'ki', 'ta', 'thom', 'ta'], count: 5, color: 'bg-cyan-600' },
      { text: 'Thathikitathom', syllables: ['Tha', 'thi', 'ki', 'ta', 'thom'], count: 5, color: 'bg-cyan-700' }
    ],
    notes: [
      { key: 'G4', duration: '8' }, { key: 'C4', duration: '8' },
      { key: 'G4', duration: '8' }, { key: 'E4', duration: '8' }, { key: 'D4', duration: '8' }, { key: 'C4', duration: '8' }, { key: 'G4', duration: '8' },
      { key: 'G4', duration: '8' }, { key: 'F4', duration: '8' }, { key: 'E4', duration: '8' }, { key: 'D4', duration: '8' }, { key: 'C4', duration: '8' }
    ]
  },
  {
    id: 13,
    title: '13 — Thakita Thakitathom Thathikitathom (3+10)',
    subdivisions: 13,
    formula: '3 + (5 + 5) = 13',
    words: [
      { text: 'Thakita', syllables: ['Tha', 'ki', 'ta'], count: 3, color: 'bg-amber-500' },
      { text: 'Thakitathom', syllables: ['Tha', 'ki', 'ta', 'thom', 'ta'], count: 5, color: 'bg-cyan-600' },
      { text: 'Thathikitathom', syllables: ['Tha', 'thi', 'ki', 'ta', 'thom'], count: 5, color: 'bg-cyan-700' }
    ],
    notes: [
      { key: 'G4', duration: '8' }, { key: 'E4', duration: '8' }, { key: 'C4', duration: '8' },
      { key: 'G4', duration: '8' }, { key: 'E4', duration: '8' }, { key: 'D4', duration: '8' }, { key: 'C4', duration: '8' }, { key: 'G4', duration: '8' },
      { key: 'G4', duration: '8' }, { key: 'F4', duration: '8' }, { key: 'E4', duration: '8' }, { key: 'D4', duration: '8' }, { key: 'C4', duration: '8' }
    ]
  },
  {
    id: 14,
    title: '14 — Thakadhimi Thakitathom Thathikitathom (4+10)',
    subdivisions: 14,
    formula: '4 + (5 + 5) = 14',
    words: [
      { text: 'Thakadhimi', syllables: ['Tha', 'ka', 'dhi', 'mi'], count: 4, color: 'bg-indigo-500' },
      { text: 'Thakitathom', syllables: ['Tha', 'ki', 'ta', 'thom', 'ta'], count: 5, color: 'bg-cyan-600' },
      { text: 'Thathikitathom', syllables: ['Tha', 'thi', 'ki', 'ta', 'thom'], count: 5, color: 'bg-cyan-700' }
    ],
    notes: [
      { key: 'G4', duration: '8' }, { key: 'E4', duration: '8' }, { key: 'F4', duration: '8' }, { key: 'C4', duration: '8' },
      { key: 'G4', duration: '8' }, { key: 'E4', duration: '8' }, { key: 'D4', duration: '8' }, { key: 'C4', duration: '8' }, { key: 'G4', duration: '8' },
      { key: 'G4', duration: '8' }, { key: 'F4', duration: '8' }, { key: 'E4', duration: '8' }, { key: 'D4', duration: '8' }, { key: 'C4', duration: '8' }
    ]
  },
  {
    id: 15,
    title: '15 — Thathikitathom x3 (5+5+5)',
    subdivisions: 15,
    formula: '5 + 5 + 5 = 15',
    words: [
      { text: 'Thathikitathom', syllables: ['Tha', 'thi', 'ki', 'ta', 'thom'], count: 5, color: 'bg-rose-500' },
      { text: 'Thathikitathom', syllables: ['Tha', 'thi', 'ki', 'ta', 'thom'], count: 5, color: 'bg-pink-600' },
      { text: 'Thathikitathom', syllables: ['Tha', 'thi', 'ki', 'ta', 'thom'], count: 5, color: 'bg-rose-700' }
    ],
    notes: [
      { key: 'G4', duration: '8' }, { key: 'F4', duration: '8' }, { key: 'E4', duration: '8' }, { key: 'D4', duration: '8' }, { key: 'C4', duration: '8' },
      { key: 'G4', duration: '8' }, { key: 'F4', duration: '8' }, { key: 'E4', duration: '8' }, { key: 'D4', duration: '8' }, { key: 'C4', duration: '8' },
      { key: 'G4', duration: '8' }, { key: 'F4', duration: '8' }, { key: 'E4', duration: '8' }, { key: 'D4', duration: '8' }, { key: 'C4', duration: '8' }
    ]
  },
  {
    id: 16,
    title: '16 — Thakadhimi Thakajunu (4+4+4+4)',
    subdivisions: 16,
    formula: '4 + 4 + 4 + 4 = 16',
    words: [
      { text: 'Thakadhimi', syllables: ['Tha', 'ka', 'dhi', 'mi'], count: 4, color: 'bg-indigo-500' },
      { text: 'Thakajunu', syllables: ['Tha', 'ka', 'ju', 'nu'], count: 4, color: 'bg-violet-500' },
      { text: 'Thakadhimi', syllables: ['Tha', 'ka', 'dhi', 'mi'], count: 4, color: 'bg-indigo-600' },
      { text: 'Thakajunu', syllables: ['Tha', 'ka', 'ju', 'nu'], count: 4, color: 'bg-violet-600' }
    ],
    notes: [
      { key: 'G4', duration: '8' }, { key: 'E4', duration: '8' }, { key: 'F4', duration: '8' }, { key: 'C4', duration: '8' },
      { key: 'G4', duration: '8' }, { key: 'E4', duration: '8' }, { key: 'D4', duration: '8' }, { key: 'C4', duration: '8' },
      { key: 'G4', duration: '8' }, { key: 'E4', duration: '8' }, { key: 'F4', duration: '8' }, { key: 'C4', duration: '8' },
      { key: 'G4', duration: '8' }, { key: 'E4', duration: '8' }, { key: 'D4', duration: '8' }, { key: 'C4', duration: '8' }
    ]
  },
  {
    id: 17,
    title: '17 — Thom + 16 (1+16)',
    subdivisions: 17,
    formula: '1 + 16 = 17',
    words: [
      { text: 'Thom', syllables: ['Thom'], count: 1, color: 'bg-emerald-500' },
      { text: 'Thakadhimi', syllables: ['Tha', 'ka', 'dhi', 'mi'], count: 4, color: 'bg-indigo-500' },
      { text: 'Thakajunu', syllables: ['Tha', 'ka', 'ju', 'nu'], count: 4, color: 'bg-violet-500' },
      { text: 'Thakadhimi', syllables: ['Tha', 'ka', 'dhi', 'mi'], count: 4, color: 'bg-indigo-600' },
      { text: 'Thakajunu', syllables: ['Tha', 'ka', 'ju', 'nu'], count: 4, color: 'bg-violet-600' }
    ],
    notes: [
      { key: 'C4', duration: '8' },
      { key: 'G4', duration: '8' }, { key: 'E4', duration: '8' }, { key: 'F4', duration: '8' }, { key: 'C4', duration: '8' },
      { key: 'G4', duration: '8' }, { key: 'E4', duration: '8' }, { key: 'D4', duration: '8' }, { key: 'C4', duration: '8' },
      { key: 'G4', duration: '8' }, { key: 'E4', duration: '8' }, { key: 'F4', duration: '8' }, { key: 'C4', duration: '8' },
      { key: 'G4', duration: '8' }, { key: 'E4', duration: '8' }, { key: 'D4', duration: '8' }, { key: 'C4', duration: '8' }
    ]
  },
  {
    id: 18,
    title: '18 — Thaka + 16 (2+16)',
    subdivisions: 18,
    formula: '2 + 16 = 18',
    words: [
      { text: 'Thaka', syllables: ['Tha', 'ka'], count: 2, color: 'bg-blue-500' },
      { text: 'Thakadhimi', syllables: ['Tha', 'ka', 'dhi', 'mi'], count: 4, color: 'bg-indigo-500' },
      { text: 'Thakajunu', syllables: ['Tha', 'ka', 'ju', 'nu'], count: 4, color: 'bg-violet-500' },
      { text: 'Thakadhimi', syllables: ['Tha', 'ka', 'dhi', 'mi'], count: 4, color: 'bg-indigo-600' },
      { text: 'Thakajunu', syllables: ['Tha', 'ka', 'ju', 'nu'], count: 4, color: 'bg-violet-600' }
    ],
    notes: [
      { key: 'G4', duration: '8' }, { key: 'C4', duration: '8' },
      { key: 'G4', duration: '8' }, { key: 'E4', duration: '8' }, { key: 'F4', duration: '8' }, { key: 'C4', duration: '8' },
      { key: 'G4', duration: '8' }, { key: 'E4', duration: '8' }, { key: 'D4', duration: '8' }, { key: 'C4', duration: '8' },
      { key: 'G4', duration: '8' }, { key: 'E4', duration: '8' }, { key: 'F4', duration: '8' }, { key: 'C4', duration: '8' },
      { key: 'G4', duration: '8' }, { key: 'E4', duration: '8' }, { key: 'D4', duration: '8' }, { key: 'C4', duration: '8' }
    ]
  },
  {
    id: 19,
    title: '19 — Thakita + 16 (3+16)',
    subdivisions: 19,
    formula: '3 + 16 = 19',
    words: [
      { text: 'Thakita', syllables: ['Tha', 'ki', 'ta'], count: 3, color: 'bg-amber-500' },
      { text: 'Thakadhimi', syllables: ['Tha', 'ka', 'dhi', 'mi'], count: 4, color: 'bg-indigo-500' },
      { text: 'Thakajunu', syllables: ['Tha', 'ka', 'ju', 'nu'], count: 4, color: 'bg-violet-500' },
      { text: 'Thakadhimi', syllables: ['Tha', 'ka', 'dhi', 'mi'], count: 4, color: 'bg-indigo-600' },
      { text: 'Thakajunu', syllables: ['Tha', 'ka', 'ju', 'nu'], count: 4, color: 'bg-violet-600' }
    ],
    notes: [
      { key: 'G4', duration: '8' }, { key: 'E4', duration: '8' }, { key: 'C4', duration: '8' },
      { key: 'G4', duration: '8' }, { key: 'E4', duration: '8' }, { key: 'F4', duration: '8' }, { key: 'C4', duration: '8' },
      { key: 'G4', duration: '8' }, { key: 'E4', duration: '8' }, { key: 'D4', duration: '8' }, { key: 'C4', duration: '8' },
      { key: 'G4', duration: '8' }, { key: 'E4', duration: '8' }, { key: 'F4', duration: '8' }, { key: 'C4', duration: '8' },
      { key: 'G4', duration: '8' }, { key: 'E4', duration: '8' }, { key: 'D4', duration: '8' }, { key: 'C4', duration: '8' }
    ]
  },
  {
    id: 20,
    title: '20 — Thathikitathom x4 (5+5+5+5)',
    subdivisions: 20,
    formula: '5 + 5 + 5 + 5 = 20',
    words: [
      { text: 'Thathikitathom', syllables: ['Tha', 'thi', 'ki', 'ta', 'thom'], count: 5, color: 'bg-rose-500' },
      { text: 'Thathikitathom', syllables: ['Tha', 'thi', 'ki', 'ta', 'thom'], count: 5, color: 'bg-pink-600' },
      { text: 'Thathikitathom', syllables: ['Tha', 'thi', 'ki', 'ta', 'thom'], count: 5, color: 'bg-rose-700' },
      { text: 'Thathikitathom', syllables: ['Tha', 'thi', 'ki', 'ta', 'thom'], count: 5, color: 'bg-pink-800' }
    ],
    notes: [
      { key: 'G4', duration: '8' }, { key: 'F4', duration: '8' }, { key: 'E4', duration: '8' }, { key: 'D4', duration: '8' }, { key: 'C4', duration: '8' },
      { key: 'G4', duration: '8' }, { key: 'F4', duration: '8' }, { key: 'E4', duration: '8' }, { key: 'D4', duration: '8' }, { key: 'C4', duration: '8' },
      { key: 'G4', duration: '8' }, { key: 'F4', duration: '8' }, { key: 'E4', duration: '8' }, { key: 'D4', duration: '8' }, { key: 'C4', duration: '8' },
      { key: 'G4', duration: '8' }, { key: 'F4', duration: '8' }, { key: 'E4', duration: '8' }, { key: 'D4', duration: '8' }, { key: 'C4', duration: '8' }
    ]
  },
  {
    id: 21,
    title: '21 — Thom + 20 (1+20)',
    subdivisions: 21,
    formula: '1 + 20 = 21',
    words: [
      { text: 'Thom', syllables: ['Thom'], count: 1, color: 'bg-emerald-500' },
      { text: 'Thathikitathom', syllables: ['Tha', 'thi', 'ki', 'ta', 'thom'], count: 5, color: 'bg-rose-500' },
      { text: 'Thathikitathom', syllables: ['Tha', 'thi', 'ki', 'ta', 'thom'], count: 5, color: 'bg-pink-600' },
      { text: 'Thathikitathom', syllables: ['Tha', 'thi', 'ki', 'ta', 'thom'], count: 5, color: 'bg-rose-700' },
      { text: 'Thathikitathom', syllables: ['Tha', 'thi', 'ki', 'ta', 'thom'], count: 5, color: 'bg-pink-800' }
    ],
    notes: [
      { key: 'C4', duration: '8' },
      { key: 'G4', duration: '8' }, { key: 'F4', duration: '8' }, { key: 'E4', duration: '8' }, { key: 'D4', duration: '8' }, { key: 'C4', duration: '8' },
      { key: 'G4', duration: '8' }, { key: 'F4', duration: '8' }, { key: 'E4', duration: '8' }, { key: 'D4', duration: '8' }, { key: 'C4', duration: '8' },
      { key: 'G4', duration: '8' }, { key: 'F4', duration: '8' }, { key: 'E4', duration: '8' }, { key: 'D4', duration: '8' }, { key: 'C4', duration: '8' },
      { key: 'G4', duration: '8' }, { key: 'F4', duration: '8' }, { key: 'E4', duration: '8' }, { key: 'D4', duration: '8' }, { key: 'C4', duration: '8' }
    ]
  },
  {
    id: 22,
    title: '22 — Thaka + 20 (2+20)',
    subdivisions: 22,
    formula: '2 + 20 = 22',
    words: [
      { text: 'Thaka', syllables: ['Tha', 'ka'], count: 2, color: 'bg-blue-500' },
      { text: 'Thathikitathom', syllables: ['Tha', 'thi', 'ki', 'ta', 'thom'], count: 5, color: 'bg-rose-500' },
      { text: 'Thathikitathom', syllables: ['Tha', 'thi', 'ki', 'ta', 'thom'], count: 5, color: 'bg-pink-600' },
      { text: 'Thathikitathom', syllables: ['Tha', 'thi', 'ki', 'ta', 'thom'], count: 5, color: 'bg-rose-700' },
      { text: 'Thathikitathom', syllables: ['Tha', 'thi', 'ki', 'ta', 'thom'], count: 5, color: 'bg-pink-800' }
    ],
    notes: [
      { key: 'G4', duration: '8' }, { key: 'C4', duration: '8' },
      { key: 'G4', duration: '8' }, { key: 'F4', duration: '8' }, { key: 'E4', duration: '8' }, { key: 'D4', duration: '8' }, { key: 'C4', duration: '8' },
      { key: 'G4', duration: '8' }, { key: 'F4', duration: '8' }, { key: 'E4', duration: '8' }, { key: 'D4', duration: '8' }, { key: 'C4', duration: '8' },
      { key: 'G4', duration: '8' }, { key: 'F4', duration: '8' }, { key: 'E4', duration: '8' }, { key: 'D4', duration: '8' }, { key: 'C4', duration: '8' },
      { key: 'G4', duration: '8' }, { key: 'F4', duration: '8' }, { key: 'E4', duration: '8' }, { key: 'D4', duration: '8' }, { key: 'C4', duration: '8' }
    ]
  },
  {
    id: 23,
    title: '23 — Thakita + 20 (3+20)',
    subdivisions: 23,
    formula: '3 + 20 = 23',
    words: [
      { text: 'Thakita', syllables: ['Tha', 'ki', 'ta'], count: 3, color: 'bg-amber-500' },
      { text: 'Thathikitathom', syllables: ['Tha', 'thi', 'ki', 'ta', 'thom'], count: 5, color: 'bg-rose-500' },
      { text: 'Thathikitathom', syllables: ['Tha', 'thi', 'ki', 'ta', 'thom'], count: 5, color: 'bg-pink-600' },
      { text: 'Thathikitathom', syllables: ['Tha', 'thi', 'ki', 'ta', 'thom'], count: 5, color: 'bg-rose-700' },
      { text: 'Thathikitathom', syllables: ['Tha', 'thi', 'ki', 'ta', 'thom'], count: 5, color: 'bg-pink-800' }
    ],
    notes: [
      { key: 'G4', duration: '8' }, { key: 'E4', duration: '8' }, { key: 'C4', duration: '8' },
      { key: 'G4', duration: '8' }, { key: 'F4', duration: '8' }, { key: 'E4', duration: '8' }, { key: 'D4', duration: '8' }, { key: 'C4', duration: '8' },
      { key: 'G4', duration: '8' }, { key: 'F4', duration: '8' }, { key: 'E4', duration: '8' }, { key: 'D4', duration: '8' }, { key: 'C4', duration: '8' },
      { key: 'G4', duration: '8' }, { key: 'F4', duration: '8' }, { key: 'E4', duration: '8' }, { key: 'D4', duration: '8' }, { key: 'C4', duration: '8' },
      { key: 'G4', duration: '8' }, { key: 'F4', duration: '8' }, { key: 'E4', duration: '8' }, { key: 'D4', duration: '8' }, { key: 'C4', duration: '8' }
    ]
  }
];

export const KONNAKOL_RHYTHMS: { [key: string]: { key: string; duration: string; newLine?: boolean }[] } = {};
export const KONNAKOL_METADATA: { [key: string]: KonnakolRhythm } = {};

export function getKonnakolMetric(subdivisions: number): { timeSignature: string; beatsPerMeasure: number } {
  if (subdivisions === 1) return { timeSignature: '1/4', beatsPerMeasure: 1.0 };
  if (subdivisions % 8 === 0) return { timeSignature: '4/4', beatsPerMeasure: 4.0 };
  if (subdivisions % 5 === 0) return { timeSignature: '5/8', beatsPerMeasure: 2.5 };
  if (subdivisions % 6 === 0) return { timeSignature: '6/8', beatsPerMeasure: 3.0 };
  if (subdivisions % 7 === 0) return { timeSignature: '7/8', beatsPerMeasure: 3.5 };
  if (subdivisions % 9 === 0) return { timeSignature: '9/8', beatsPerMeasure: 4.5 };
  return { timeSignature: `${subdivisions}/8`, beatsPerMeasure: subdivisions * 0.5 };
}

KONNAKOL_RHYTHMS_LIST.forEach(r => {
  const metric = getKonnakolMetric(r.subdivisions);
  r.timeSignature = r.timeSignature || metric.timeSignature;
  r.beatsPerMeasure = r.beatsPerMeasure || metric.beatsPerMeasure;
  KONNAKOL_RHYTHMS[r.title] = r.notes;
  KONNAKOL_METADATA[r.title] = r;
});
