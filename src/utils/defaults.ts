export interface Team {
  id: string;
  name: string;
  color: string;
  score: number;
}

export interface Envelope {
  id: string;
  category: 'dire' | 'fare' | 'indovinare';
  label: string;
  points: number;
  title: string;
  content: string;
  isOpened: boolean;
}

export const DEFAULT_TEAMS: Team[] = [
  { id: 'team-red', name: 'Squadra Rossa', color: '#ef4444', score: 0 },
  { id: 'team-blue', name: 'Squadra Blu', color: '#3b82f6', score: 0 },
  { id: 'team-green', name: 'Squadra Verde', color: '#10b981', score: 0 },
  { id: 'team-yellow', name: 'Squadra Gialla', color: '#eab308', score: 0 }
];

export const DEFAULT_ENVELOPES: Envelope[] = [
  // CATEGORIA: DIRE
  {
    id: 'env-dire-100',
    category: 'dire',
    label: 'Busta 1',
    points: 100,
    title: 'DIRE - La Voce da Papera',
    content: 'Canta il ritornello di una canzone famosa usando esclusivamente la voce da papera! La tua squadra deve indovinarla entro 30 secondi.',
    isOpened: false
  },
  {
    id: 'env-dire-150',
    category: 'dire',
    label: 'Busta 2',
    points: 150,
    title: 'DIRE - Scioglilingua di Fuoco',
    content: 'Recita senza errori e senza fermarti questo scioglilingua tre volte velocemente: "Sotto le frasche del fitto bosco quattro gatti fiutano un grosso osso".',
    isOpened: false
  },
  {
    id: 'env-dire-200',
    category: 'dire',
    label: 'Busta 3',
    points: 200,
    title: 'DIRE - La Bugia Credibile',
    content: 'Racconta un aneddoto assurdo inventato sul momento. Gli avversari ti faranno 3 domande rapide e dovranno decidere entro 30 secondi se stai dicendo il vero o il falso.',
    isOpened: false
  },
  {
    id: 'env-dire-250',
    category: 'dire',
    label: 'Busta 4',
    points: 250,
    title: 'DIRE - L\'Alfabeto al Contrario',
    content: 'Pronuncia ad alta voce le lettere dell\'alfabeto italiano al contrario (dalla Z alla A) in soli 20 secondi, senza fare pause superiori a 1 secondo.',
    isOpened: false
  },

  // CATEGORIA: FARE
  {
    id: 'env-fare-100',
    category: 'fare',
    label: 'Busta 1',
    points: 100,
    title: 'FARE - La Flessione Poetica',
    content: 'Esegui 5 flessioni consecutive. Durante ciascuna flessione, recita ad alta voce un verso inventato sul momento che faccia rima con la parola "Busta"!',
    isOpened: false
  },
  {
    id: 'env-fare-150',
    category: 'fare',
    label: 'Busta 2',
    points: 150,
    title: 'FARE - L\'Equilibrio Cieco',
    content: 'Rimani in equilibrio su una sola gamba, con le braccia tese in avanti e gli occhi completamente chiusi, per almeno 30 secondi senza toccare terra.',
    isOpened: false
  },
  {
    id: 'env-fare-200',
    category: 'fare',
    label: 'Busta 3',
    points: 200,
    title: 'FARE - La Torre di Bicchieri',
    content: 'Costruisci una piramide di bicchieri di plastica alta 5 livelli (15 bicchieri alla base) in meno di 30 secondi, usando solo la mano non dominante.',
    isOpened: false
  },
  {
    id: 'env-fare-250',
    category: 'fare',
    label: 'Busta 4',
    points: 250,
    title: 'FARE - Il Disegno Cieco',
    content: 'Fatti bendare gli occhi. Disegna su una lavagna o foglio "un gatto che va in bicicletta" guidato esclusivamente dalle indicazioni vocali della tua squadra. Limite: 45 secondi.',
    isOpened: false
  },

  // CATEGORIA: INDOVINARE
  {
    id: 'env-indovinare-100',
    category: 'indovinare',
    label: 'Busta 1',
    points: 100,
    title: 'INDOVINARE - La Mente Sincrona',
    content: 'Due giocatori della squadra devono contare fino a 3 e pronunciare contemporaneamente una parola basata su un indizio dato dagli avversari (es. "qualcosa di freddo"). Devono dire la stessa parola per vincere.',
    isOpened: false
  },
  {
    id: 'env-indovinare-150',
    category: 'indovinare',
    label: 'Busta 2',
    points: 150,
    title: 'INDOVINARE - Mimo al Contrario',
    content: 'Un giocatore mima un\'azione quotidiana al contrario (es. sbucciare una banana partendo dalla fine). La squadra deve indovinare l\'azione corretta entro 45 secondi.',
    isOpened: false
  },
  {
    id: 'env-indovinare-200',
    category: 'indovinare',
    label: 'Busta 3',
    points: 200,
    title: 'INDOVINARE - Parole Proibite',
    content: 'Fai indovinare alla tua squadra la parola "PROIETTORE" senza usare le parole vietate: cinema, schermo, luce, presentare, video. Tempo massimo: 45 secondi.',
    isOpened: false
  },
  {
    id: 'env-indovinare-250',
    category: 'indovinare',
    label: 'Busta 4',
    points: 250,
    title: 'INDOVINARE - Il Ritmo Battuto',
    content: 'Batti il ritmo di 3 canzoni famose solo con le mani su un tavolo. La tua squadra deve indovinarne almeno 2 per superare la prova. Limite: 60 secondi.',
    isOpened: false
  }
];
