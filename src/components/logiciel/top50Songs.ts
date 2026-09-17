import type { LibrarySong } from './irealWikifonia';

export interface Top50Definition {
  rank: number;
  title: string;
  category: 'Standards Jazz' | 'Trompette & Hard Bop' | 'Soul & Funk' | 'Bossa Nova' | 'Ballades & Variétés';
  desc: string;
  irealTitle?: string;
  standaloneFile?: string;
}

export const TOP_50_DEFINITIONS: Top50Definition[] = [
  // 1. Standards Jazz & Swing
  { rank: 1, title: 'Autumn Leaves', category: 'Standards Jazz', desc: 'Le classique absolu, idéal en Sib', standaloneFile: 'Joseph Kosma, Jacques Prevert, Johnny Mercer - Autumn Leaves.mxl' },
  { rank: 2, title: 'Fly Me To The Moon', category: 'Standards Jazz', desc: "L'élégance de Sinatra et Count Basie", standaloneFile: 'Bart Howard - Fly Me to the Moon (2).mxl' },
  { rank: 3, title: 'Take The A Train', category: 'Standards Jazz', desc: 'Le thème légendaire de Duke Ellington', irealTitle: 'Take The A Train' },
  { rank: 4, title: 'All Of Me', category: 'Standards Jazz', desc: 'Le swing universel par excellence', standaloneFile: 'Gerald Marks, Seymour Simons - All Of Me.mxl' },
  { rank: 5, title: 'Take Five', category: 'Standards Jazz', desc: "Le chef-d'œuvre à 5/4 de Paul Desmond", standaloneFile: 'Paul Desmond - Take Five.mxl' },
  { rank: 6, title: 'Summertime', category: 'Standards Jazz', desc: "Le chef-d'œuvre lyrique de Gershwin", standaloneFile: 'George Gershwin - Summertime.mxl' },
  { rank: 7, title: 'Blue Bossa', category: 'Standards Jazz', desc: 'Kenny Dorham, parfait pour la trompette', standaloneFile: 'Kenny Dorham - Blue Bossa.mxl' },
  { rank: 8, title: 'All The Things You Are', category: 'Standards Jazz', desc: "L'anatomie harmonique parfaite", standaloneFile: 'Jerome Kern - All the Things You Are.mxl' },
  { rank: 9, title: 'Night And Day', category: 'Standards Jazz', desc: 'Le standard mythique de Cole Porter', standaloneFile: 'Cole Porter - Night And Day.mxl' },
  { rank: 10, title: 'Satin Doll', category: 'Standards Jazz', desc: "L'art du swing doux d'Ellington", irealTitle: 'Satin Doll' },
  { rank: 11, title: 'Cheek To Cheek', category: 'Standards Jazz', desc: "Le joyau swing d'Irving Berlin", irealTitle: 'Cheek To Cheek' },
  { rank: 12, title: 'On Green Dolphin Street', category: 'Standards Jazz', desc: "L'alternance latin/swing légendaire", irealTitle: 'On Green Dolphin Street' },
  { rank: 13, title: 'Stella By Starlight', category: 'Standards Jazz', desc: "L'hymne incontournable des solistes", irealTitle: 'Stella By Starlight' },
  { rank: 14, title: 'Caravan', category: 'Standards Jazz', desc: "L'orientalisme jazz de Juan Tizol", standaloneFile: 'Duke Ellington - Caravan.mxl' },
  { rank: 15, title: 'Mack The Knife', category: 'Standards Jazz', desc: 'Le grand succès swing de Louis Armstrong', irealTitle: 'Mack The Knife' },

  // 2. Trompette Légendaire & Bebop
  { rank: 16, title: 'So What', category: 'Trompette & Hard Bop', desc: "L'acte de naissance du jazz modal (Miles Davis)", irealTitle: 'So What' },
  { rank: 17, title: 'Blue In Green', category: 'Trompette & Hard Bop', desc: 'La sublime ballade de Kind of Blue', irealTitle: 'Blue In Green' },
  { rank: 18, title: 'Solar', category: 'Trompette & Hard Bop', desc: 'Le cycle de tierces de Miles Davis', irealTitle: 'Solar' },
  { rank: 19, title: 'Nardis', category: 'Trompette & Hard Bop', desc: 'Thème mystérieux composé pour Cannonball', irealTitle: 'Nardis' },
  { rank: 20, title: 'My Funny Valentine', category: 'Trompette & Hard Bop', desc: 'La signature poignante de Chet Baker', irealTitle: 'My Funny Valentine' },
  { rank: 21, title: 'I Remember Clifford', category: 'Trompette & Hard Bop', desc: "L'hommage solennel à Clifford Brown", irealTitle: 'I Remember Clifford' },
  { rank: 22, title: 'Joy Spring', category: 'Trompette & Hard Bop', desc: 'Le monument bebop de Clifford Brown', standaloneFile: 'Clifford Brown - Joy Spring.mxl' },
  { rank: 23, title: 'A Night In Tunisia', category: 'Trompette & Hard Bop', desc: "L'incandescence de Dizzy Gillespie", standaloneFile: 'Dizzy Gillespie - A Night In Tunisia.mxl' },
  { rank: 24, title: 'Work Song', category: 'Trompette & Hard Bop', desc: 'Le chant de bagnard de Nat Adderley', irealTitle: 'Work Song' },
  { rank: 25, title: "Moanin'", category: 'Trompette & Hard Bop', desc: "L'appel et réponse d'Art Blakey & Lee Morgan", irealTitle: "Moanin'" },
  { rank: 26, title: 'Song For My Father', category: 'Trompette & Hard Bop', desc: "Le groove cap-verdien d'Horace Silver", irealTitle: 'Song For My Father' },
  { rank: 27, title: 'St. Thomas', category: 'Trompette & Hard Bop', desc: 'Le calypso exaltant de Sonny Rollins', irealTitle: 'St. Thomas' },
  { rank: 28, title: 'Footprints', category: 'Trompette & Hard Bop', desc: 'Le blues mineur en 6/4 de Wayne Shorter', irealTitle: 'Footprints' },
  { rank: 29, title: 'Donna Lee', category: 'Trompette & Hard Bop', desc: 'La virtuosité bebop absolue de Parker', irealTitle: 'Donna Lee' },
  { rank: 30, title: "Now's The Time", category: 'Trompette & Hard Bop', desc: 'Le blues bebop essentiel de Charlie Parker', irealTitle: "Now's The Time" },

  // 3. Soul, Funk & Groove
  { rank: 31, title: 'Cantaloupe Island', category: 'Soul & Funk', desc: "Le groove mythique d'Herbie Hancock", irealTitle: 'Cantaloupe Island' },
  { rank: 32, title: 'Watermelon Man', category: 'Soul & Funk', desc: 'Le tube jazz-funk intemporel', irealTitle: 'Watermelon Man' },
  { rank: 33, title: 'Chameleon', category: 'Soul & Funk', desc: 'La ligne de basse funk la plus célèbre', irealTitle: 'Chameleon' },
  { rank: 34, title: 'The Chicken', category: 'Soul & Funk', desc: "L'hymne funk de Pee Wee Ellis & Jaco Pastorius", irealTitle: 'Chicken, The' },
  { rank: 35, title: 'Mercy, Mercy, Mercy', category: 'Soul & Funk', desc: 'Le gospel soul jazz de Joe Zawinul', standaloneFile: 'Josef Zawinul - Mercy, Mercy, Mercy.mxl' },

  // 4. Bossa Nova & Rythmes Latins
  { rank: 36, title: 'The Girl From Ipanema', category: 'Bossa Nova', desc: "L'étendard mondial de la bossa nova", standaloneFile: 'Antonio Carlos Jobim - The Girl from Ipanema (2).mxl' },
  { rank: 37, title: 'Corcovado', category: 'Bossa Nova', desc: 'Quiet Nights of Quiet Stars par Jobim', irealTitle: 'Corcovado' },
  { rank: 38, title: 'Wave', category: 'Bossa Nova', desc: "L'harmonie lumineuse de Rio de Janeiro", irealTitle: 'Wave' },
  { rank: 39, title: 'Desafinado', category: 'Bossa Nova', desc: 'Le manifeste subtil de Jobim & Gilberto', standaloneFile: 'Antonio Carlos Jobim, John Hendricks, Jessie Cavanaugh - Desafinado.mxl' },
  { rank: 40, title: 'Black Orpheus', category: 'Bossa Nova', desc: 'Manhã de Carnaval, grand thème brésilien', standaloneFile: 'Luiz Bonfa - Black Orpheus.mxl' },
  { rank: 41, title: 'Besame Mucho', category: 'Bossa Nova', desc: 'Le boléro mexicain le plus joué au monde', standaloneFile: 'Consuelo Velazquez - Besame Mucho.mxl' },
  { rank: 42, title: 'Sway', category: 'Bossa Nova', desc: 'Quién Será, le mambo sensuel et dansant', irealTitle: 'Sway' },
  { rank: 43, title: 'Spain', category: 'Bossa Nova', desc: 'La fusion virtuose de Chick Corea', standaloneFile: 'Chick Corea - Spain.mxl' },

  // 5. Ballades, Cinéma & Variétés
  { rank: 44, title: "'Round Midnight", category: 'Ballades & Variétés', desc: 'Le monument nocturne de Thelonious Monk', standaloneFile: "Thelonious Monk - 'Round Midnight.mxl" },
  { rank: 45, title: 'Misty', category: 'Ballades & Variétés', desc: "Le lyrisme vibrant d'Erroll Garner", standaloneFile: 'Errol Garner, Johnny Burne - Misty.mxl' },
  { rank: 46, title: 'Body And Soul', category: 'Ballades & Variétés', desc: 'Le test ultime de maturité du jazzman', standaloneFile: 'Johnny Green - Body and Soul .mxl' },
  { rank: 47, title: 'What A Wonderful World', category: 'Ballades & Variétés', desc: 'Le sourire immortel de Louis Armstrong', standaloneFile: 'Bob Thiele, George David Weiss - What A Wonderful World.mxl' },
  { rank: 48, title: 'The Pink Panther', category: 'Ballades & Variétés', desc: "Le thème espiègle d'Henry Mancini", irealTitle: 'Pink Panther, The' },
  { rank: 49, title: 'Over The Rainbow', category: 'Ballades & Variétés', desc: "La magie intemporelle du Magicien d'Oz", standaloneFile: 'Harold Allen, Yip Harburg - Over The Rainbow.mxl' },
  { rank: 50, title: 'My Way', category: 'Ballades & Variétés', desc: "Comme d'habitude, l'hymne universel", irealTitle: 'My Way' },
];

export function getTop50Meta(entry: LibrarySong): Top50Definition | null {
  for (const def of TOP_50_DEFINITIONS) {
    if (def.irealTitle && entry.source === 'ireal') {
      if (entry.title.toLowerCase() === def.irealTitle.toLowerCase()) {
        return def;
      }
    } else if (def.standaloneFile && entry.source === 'standalone' && entry.sheet) {
      const decodedFilename = decodeURIComponent(entry.sheet.wikifoniaPath || '').split('/').pop();
      if (decodedFilename && decodedFilename.toLowerCase() === def.standaloneFile.toLowerCase()) {
        return def;
      }
    }
  }
  return null;
}

export function isTop50Song(entry: LibrarySong): boolean {
  return getTop50Meta(entry) !== null;
}
