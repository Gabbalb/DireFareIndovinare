export interface Team {
  id: string;
  name: string;
  color: string;
  score: number;
}

export interface Envelope {
  id: string;
  teamId: string | null;
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
  // SQUADRA ROSSA
  {
    id: 'env-red-100',
    teamId: 'team-red',
    label: 'Busta 1',
    points: 100,
    title: 'DIRE - La Voce da Papera',
    content: 'Canta il ritornello di una canzone famosa utilizzando esclusivamente la voce da papera! La tua squadra deve indovinare il titolo entro 30 secondi.',
    isOpened: false
  },
  {
    id: 'env-red-150',
    teamId: 'team-red',
    label: 'Busta 2',
    points: 150,
    title: 'DIRE - Scioglilingua di Fuoco',
    content: 'Recita senza errori e senza fermarti questo scioglilingua tre volte velocemente: "Sotto le frasche del fitto bosco quattro gatti fiutano un grosso osso".',
    isOpened: false
  },
  {
    id: 'env-red-200',
    teamId: 'team-red',
    label: 'Busta 3',
    points: 200,
    title: 'FARE - La Flessione Poetica',
    content: 'Esegui 5 flessioni consecutive. Durante ciascuna flessione, recita ad alta voce un verso inventato sul momento che faccia rima con la parola "Busta"!',
    isOpened: false
  },
  {
    id: 'env-red-250',
    teamId: 'team-red',
    label: 'Busta 4',
    points: 250,
    title: 'FARE - Il Mimo della Pasticceria',
    content: 'Mima esclusivamente con i gesti (senza parlare) l\'atto di "preparare una torta nuziale gigante che sta per crollare". La squadra deve indovinare entro 45 secondi.',
    isOpened: false
  },

  // SQUADRA BLU
  {
    id: 'env-blue-100',
    teamId: 'team-blue',
    label: 'Busta 1',
    points: 100,
    title: 'DIRE - La Sfida dei 5 Secondi',
    content: 'Elenca ad alta voce 5 oggetti di metallo che puoi trovare in cucina e 5 parole che contengono due "Z", il tutto in soli 10 secondi complessivi!',
    isOpened: false
  },
  {
    id: 'env-blue-150',
    teamId: 'team-blue',
    label: 'Busta 2',
    points: 150,
    title: 'DIRE - Titoli al Contrario',
    content: 'Fai indovinare alla tua squadra 3 titoli di film famosi pronunciando le parole al contrario (es. "Anelli degli signore Il"). Hai 30 secondi!',
    isOpened: false
  },
  {
    id: 'env-blue-200',
    teamId: 'team-blue',
    label: 'Busta 3',
    points: 200,
    title: 'FARE - L\'Equilibrio Cieco',
    content: 'Rimani in equilibrio su una sola gamba, con le braccia tese in avanti e gli occhi completamente chiusi, per almeno 30 secondi senza toccare terra.',
    isOpened: false
  },
  {
    id: 'env-blue-250',
    teamId: 'team-blue',
    label: 'Busta 4',
    points: 250,
    title: 'FARE - Il Mimo degli Opposti',
    content: 'Mima un subacqueo che cerca di sfuggire a uno squalo gigante al rallentatore, usando solo espressioni del viso e movimenti corporali. Limite: 45 secondi.',
    isOpened: false
  },

  // SQUADRA VERDE
  {
    id: 'env-green-100',
    teamId: 'team-green',
    label: 'Busta 1',
    points: 100,
    title: 'DIRE - Il Colore della Mente',
    content: 'Elenca 7 oggetti di colore verde che puoi trovare in un giardino e 5 animali che volano, il tutto entro 12 secondi senza esitazioni.',
    isOpened: false
  },
  {
    id: 'env-green-150',
    teamId: 'team-green',
    label: 'Busta 2',
    points: 150,
    title: 'DIRE - La Bugia Credibile',
    content: 'Racconta un aneddoto assurdo e inventato sul momento. Gli avversari devono farti 3 domande rapide e decidere entro 30 secondi se stai dicendo il vero o il falso.',
    isOpened: false
  },
  {
    id: 'env-green-200',
    teamId: 'team-green',
    label: 'Busta 3',
    points: 200,
    title: 'FARE - La Torre di Bicchieri',
    content: 'Costruisci una piramide di bicchieri di plastica alta 5 livelli (15 bicchieri alla base e salire) in meno di 30 secondi, usando esclusivamente la mano sinistra (o destra se sei mancino).',
    isOpened: false
  },
  {
    id: 'env-green-250',
    teamId: 'team-green',
    label: 'Busta 4',
    points: 250,
    title: 'FARE - Il Direttore D\'Orchestra',
    content: 'Dirigi la tua squadra nel cantare un coro natalizio o popolare usando solo le mani per indicare il volume (più alto/silenzio) e la velocità. La performance deve durare 30 secondi.',
    isOpened: false
  },

  // SQUADRA GIALLA
  {
    id: 'env-yellow-100',
    teamId: 'team-yellow',
    label: 'Busta 1',
    points: 100,
    title: 'DIRE - La Barzelletta Seria',
    content: 'Racconta una barzelletta divertente agli avversari. Per ottenere i punti, devi far ridere almeno uno di loro mantenendo un viso completamente serio e impassibile.',
    isOpened: false
  },
  {
    id: 'env-yellow-150',
    teamId: 'team-yellow',
    label: 'Busta 2',
    points: 150,
    title: 'DIRE - L\'Alfabeto al Contrario',
    content: 'Dici ad alta voce le lettere dell\'alfabeto italiano al contrario (dalla Z alla A) entro 20 secondi, senza consultare fogli o fare pause superiori a 1 secondo.',
    isOpened: false
  },
  {
    id: 'env-yellow-200',
    teamId: 'team-yellow',
    label: 'Busta 3',
    points: 200,
    title: 'FARE - La Statua Vivente',
    content: 'Assumi una posa da statua eroica indicata dagli avversari. Rimanete completamente immobile per 45 secondi mentre loro provano a farti ridere facendoti smorfie (senza toccarti).',
    isOpened: false
  },
  {
    id: 'env-yellow-250',
    teamId: 'team-yellow',
    label: 'Busta 4',
    points: 250,
    title: 'FARE - Il Disegno Cieco',
    content: 'Fatti bendare gli occhi. Disegna su un foglio o lavagna "un gatto che va in bicicletta" guidato esclusivamente dalle indicazioni vocali della tua squadra. Limite: 45 secondi.',
    isOpened: false
  }
];
