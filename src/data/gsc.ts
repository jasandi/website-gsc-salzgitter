export interface TrainingSlot {
  daysLabel: string;
  dayIndices: number[]; // 0 = Sun, 1 = Mon, ... 6 = Sat
  timeLabel: string;
  windows: Array<{ start: string; end: string }>;
  note?: string;
}

export const trainingSchedule: TrainingSlot[] = [
  {
    daysLabel: 'Di, Mi, Do, Fr',
    dayIndices: [2, 3, 4, 5],
    timeLabel: '15.00 - 19.00 Uhr',
    windows: [{ start: '15:00', end: '19:00' }],
    note: 'Donnerstag nur Kinder, Jugendliche und Anfänger bis 16 Jahre',
  },
  {
    daysLabel: 'Sa',
    dayIndices: [6],
    timeLabel: '10.00 - 13.00 Uhr • 15.00 - 19.00 Uhr',
    windows: [
      { start: '10:00', end: '13:00' },
      { start: '15:00', end: '19:00' },
    ],
    note: 'Regulärer Trainingsbetrieb für alle',
  },
  {
    daysLabel: 'So',
    dayIndices: [0],
    timeLabel: '10.00 - 13.00 Uhr',
    windows: [{ start: '10:00', end: '13:00' }],
    note: 'Nur bis 85 ccm',
  },
];

export const nutzungshinweise = {
  title: 'Nutzungshinweise für das Training',
  intro:
    'Für die Teilnahme am Training auf den Strecken des GSC Salzgitter e.V. gelten folgende Voraussetzungen:',
  registrationRule:
    'Eine gültige Anmeldung bei MX-Tickets sowie die passende Schutzausrüstung sind vor Fahrantritt notwendig.',
  gearRule:
    'Vollständige Schutzausrüstung: Das Tragen der passenden Sicherheitsausrüstung ist Pflicht. Dazu gehören mindestens:',
  gearItems: ['Helm', 'Stiefel', 'Brustpanzer', 'Knieschoner', 'Brille', 'Handschuhe'],
};

export interface TrackSpec {
  id: 'motocross' | 'supercross' | 'kids';
  slug: string;
  badge: string;
  name: string;
  subtitle: string;
  description: string;
  image: string;
  imageAlt: string;
  level: string;
  lengthLabel: string;
  lengthMeters: number;
  jumpsLabel: string;
  hoursLabel: string;
  highlights: string[];
  svgPath: string;
  startPoint: { x: number; y: number };
}

export const tracksData: TrackSpec[] = [
  {
    id: 'motocross',
    slug: '/strecken/motocross.html',
    badge: 'Hauptstrecke · Der Hüttenring',
    name: 'Motocross',
    subtitle: 'Weitläufig, schnell & abwechslungsreich',
    description:
      'Weitläufig und breit mit langen Geraden für hohe Geschwindigkeiten und einem Mix aus kleinen bis großen Sprüngen.',
    image: '/assets/mx_track.png',
    imageAlt: 'Motocross Hauptstrecke Hüttenring',
    level: 'Anfänger bis Profi',
    lengthLabel: 'ca. 1.900 m',
    lengthMeters: 1900,
    jumpsLabel: '15 Sprünge',
    hoursLabel: 'Regulär',
    highlights: [
      'Harter Lehmboden, der ambitionierte Fahrer technisch fordert',
      'Insgesamt 15 abwechslungsreiche Sektionen & großer Table-Top',
      'Permanente Bewässerung gegen Staubentwicklung',
    ],
    svgPath:
      'M 55 170 C 40 120, 75 55, 145 55 L 285 55 C 335 55, 360 90, 330 125 L 245 135 C 215 140, 215 175, 250 180 L 340 185 C 385 190, 385 245, 330 250 L 185 250 C 145 250, 140 210, 105 215 C 70 220, 70 195, 55 170 Z',
    startPoint: { x: 55, y: 170 },
  },
  {
    id: 'supercross',
    slug: '/strecken/supercross.html',
    badge: 'Supercross-Strecke',
    name: 'Supercross',
    subtitle: 'Kompakt, kurz und intensiv',
    description:
      'Technisch anspruchsvoll, enge Kurven und anspruchsvolle Rhythmus-Sektionen für das Training von Präzision und Timing.',
    image: '/assets/sx_track.png',
    imageAlt: 'Supercross Strecke Salzgitter',
    level: 'Erfahren bis Profi',
    lengthLabel: 'ca. 600 m',
    lengthMeters: 600,
    jumpsLabel: 'Whoops & Rhythmus',
    hoursLabel: 'Gesondert',
    highlights: [
      'Steile Rhythmus-Tische, technische Anlieger und Whoops',
      'Extrem harter Lehm für maximalen Grip unter SX-Bedingungen',
      'Modernste Flutlichtanlage für abendliche Sessions & Nachtrennen',
    ],
    svgPath:
      'M 75 210 L 75 85 C 75 55, 125 55, 125 85 L 125 185 C 125 215, 180 215, 180 185 L 180 85 C 180 55, 240 55, 240 85 L 240 185 C 240 215, 305 215, 305 185 L 305 95 C 305 60, 355 75, 345 135 L 330 225 C 320 255, 260 255, 195 250 L 105 245 C 80 242, 75 230, 75 210 Z',
    startPoint: { x: 75, y: 210 },
  },
  {
    id: 'kids',
    slug: '/strecken/kids.html',
    badge: 'Nachwuchs · 3 Layouts',
    name: 'Kinder',
    subtitle: 'Sicherer Einstieg für die Kleinsten',
    description:
      'Separater Abschnitt für die kleinsten Fahrerinnen und Fahrer, um sich mit dem Sport vertraut zu machen.',
    image: '/assets/kids_track.png',
    imageAlt: 'Kinderstrecke GSC Salzgitter',
    level: 'Neueinsteiger',
    lengthLabel: 'ca. 800 m',
    lengthMeters: 800,
    jumpsLabel: '3 Ausbaustufen',
    hoursLabel: 'Regulär',
    highlights: [
      '1. PW Kreis: Einfacher Kreis für die ganz Kleinen',
      '2. Anfänger Strecke: Mit Anfänger-Abkürzung ohne große Hindernisse',
      '3. Komplettstrecke: 800m Track inkl. Tables & Bergabsprung für schnelle 50/65er',
    ],
    svgPath:
      'M 95 165 C 95 95, 165 70, 235 80 C 315 90, 345 140, 320 190 C 295 240, 215 245, 150 225 C 110 212, 95 190, 95 165 Z',
    startPoint: { x: 95, y: 165 },
  },
];

export interface EventItem {
  id: string;
  gridPos: string;
  title: string;
  description: string;
  dateLabel: string;
  isoStart: string;
  isoEnd: string;
  day: string;
  month: string;
  ctaLabel: string;
  ctaHref?: string;
  external?: boolean;
}

export const upcomingEvents: EventItem[] = [
  {
    id: 'supercross-dm-2026',
    gridPos: 'P1 · Highlight',
    title: 'Deutsche Amateur-Supercross-Serie',
    description:
      'Zweiter Tourstopp auf dem Hüttenring Salzgitter-Watenstedt: Klassen SX-Beginner bis SX-Pro und After-Race-Party ab 20:00 Uhr.',
    dateLabel: '04. Juli 2026',
    isoStart: '20260704T080000',
    isoEnd: '20260704T230000',
    day: '04',
    month: 'Jul',
    ctaLabel: 'Alle Infos zum Event →',
    ctaHref: '/neuigkeiten/2026-07-04-supercross.html',
  },
  {
    id: '3h-cross-2026',
    gridPos: 'P2 · Endurance',
    title: '3 Stunden Cross',
    description: 'Team Rennen über 3 Stunden mit Ausklang am Abend.',
    dateLabel: '26. September 2026',
    isoStart: '20260926T100000',
    isoEnd: '20260926T220000',
    day: '26',
    month: 'Sep',
    ctaLabel: 'Zur Ausschreibung →',
    ctaHref: '/termine/2026-09-26-3h-cross.html',
  },
  {
    id: 'cross-kids-cup-2026',
    gridPos: 'P3 · Nachwuchs',
    title: 'Cross Kids',
    description:
      '2. Lauf zum GSC Cross Kids Cup 2026. Klassen: 50ccm, 65ccm, 85ccm. Gastfahrer sind willkommen.',
    dateLabel: '27. September 2026',
    isoStart: '20260927T090000',
    isoEnd: '20260927T170000',
    day: '27',
    month: 'Sep',
    ctaLabel: 'Zur Anmeldung →',
    ctaHref: 'https://mx-tickets.com/de-DE/t/gsc-salzgitter/events/5GBRmNxxrH8F9jCs7mS6',
    external: true,
  },
  {
    id: 'luca-lier-cup-2026',
    gridPos: 'P4 · Finale',
    title: 'Luca Lier Cup',
    description:
      'Lauf 2 unseres klassischen Vereinsrennens ab 85ccm von Hobby bis Lizenz.',
    dateLabel: '31. Oktober 2026',
    isoStart: '20261031T090000',
    isoEnd: '20261031T180000',
    day: '31',
    month: 'Okt',
    ctaLabel: 'Ganztägig',
  },
];

export const clubMilestones = [
  {
    year: '1985',
    title: 'Die 8 Gründer am Hüttenring',
    text: 'Thomas Rusitzka, Andreas Kalus, Uwe Strack, Anton Baumstark, Helmut Knips, Michael Reichelt, Christian Zadow und George Dick gründen den Verein und pachten das Gelände an der Eisenhüttenstraße als legale Vereinsstrecke.',
  },
  {
    year: '1999',
    title: 'Vizeweltmeister Pit Beirer',
    text: 'Bekanntestes Vereinsmitglied wird der Vizeweltmeister von 1999 in der 250ccm Motocross-WM: Pit Beirer – heute Motorsport Direktor bei KTM.',
  },
  {
    year: '2017–2021',
    title: 'Strecken-Evolution',
    text: 'Umbau der 1.900m Hauptstrecke nach Zeichnungen von Stefan Ludwig sowie große Verlängerung der Kinderstrecke für 50ccm- und 65ccm-Talente.',
  },
  {
    year: 'Seit 2025',
    title: 'Stolzer Ortsclub im ADAC',
    text: 'Fast 600 Mitglieder – darunter allein 140 Kinder und Jugendliche – trainieren heute regelmäßig auf dem Hüttenring. Seit Frühjahr 2025 ist der GSC Salzgitter offizieller Ortsclub im ADAC.',
  },
];

export const initiativesCards = [
  {
    id: 'school',
    tag: 'Technik & Speed',
    title: 'GSC',
    highlight: 'School',
    description:
      'Möchtest du deine Technik verbessern, sicherer und schneller fahren? In der GSC School bringen dir erfahrene Instruktoren bei, worauf es ankommt.',
    bullets: [
      'Unterteilt nach Erfahrungsleveln',
      'Regelmäßiges Angebot',
      'Vielseitiges Coaching',
    ],
    image: '/assets/school_img.png',
    imageAlt: 'Motocross Training GSC School',
    primaryHref: '/faq.html#faq-school-kontakt',
    primaryLabel: 'Kontakt',
  },
  {
    id: 'kids',
    tag: '5 bis 10 Jahre · 50 & 65 ccm',
    title: 'Cross',
    highlight: 'Kids',
    description:
      'Die Zukunft unseres Sports liegt uns am Herzen. Hier können die Kleinsten auf 50ccm und 65ccm sicher und unter Aufsicht ihre ersten Erfahrungen sammeln.',
    bullets: [
      'Dediziertes Jugendwart Team',
      'Erfahrungsaustausch',
      'Gegenseitige Unterstützung',
    ],
    image: '/assets/cross_kids.png',
    imageAlt: 'Junge Motocross Fahrer auf der Kinder Strecke',
    primaryHref: '/faq.html#faq-cross-kids-kontakt',
    primaryLabel: 'Kontakt',
  },
  {
    id: 'girlsday',
    tag: 'Jährliches Highlight',
    title: 'Girls',
    highlight: 'Day',
    description:
      'Unser exklusiver MX Girls Only Day für Frauen und Mädchen jeden Alters und Fahrkönnens. Zusammen trainieren, austauschen und Spaß haben.',
    bullets: [
      'Alle Alters- & Fahrstufen',
      'Freies Training & Netzwerken',
      'Camping & After-Ride Treffen',
    ],
    image: '/assets/girlsday_group.jpg',
    imageAlt: 'Girlsday GSC Salzgitter',
    primaryHref: '/neuigkeiten/2026-08-08-girlsday.html',
    primaryLabel: 'Mehr erfahren →',
  },
];

export const faqCategories = [
  {
    category: 'Training',
    items: [
      {
        id: 'faq-trainingszeiten',
        question: 'Darf ich immer zu den regulären Öffnungszeiten trainieren?',
        answer:
          'Nein. Du findest die „Wahrheit“ für tatsächlich verfügbare Trainingszeiten immer bei MX-Tickets. Die buchbaren Tickets werden in den meisten Fällen zu den regulären Trainingszeiten angeboten, können aber auch vereinzelt eingeschränkt werden (z.B. bei extremer Hitze und Staubentwicklung oder starkem Regen). Eine Sperrung der Strecke wird immer über MX-Tickets an alle Buchungen bekannt gegeben.',
      },
      {
        id: 'faq-training-anmeldung',
        question: 'Wie kann ich mich für ein Training anmelden?',
        answer:
          'Die Anmeldung für Trainings erfolgt über MX-Tickets und hat vor Fahrantritt zu erfolgen. Dies gilt für Mitglieder und Gastfahrer. Eine Anmeldung vor Ort mit Barzahlung ist nicht möglich. Wer beim Fahren ohne entrichtete Gebühr bzw. Anmeldung über MX-Tickets erwischt wird, muss sofort einen Strafbetrag von 40 € bezahlen und bekommt Hausverbot auf der Strecke.',
      },
      {
        id: 'faq-gastfahrer-preise',
        question: 'Was kostet ein Training als Gastfahrer?',
        answer:
          'Die Preise findest du bei der Anmeldung auf MX-Tickets (regulär 20 € je Training, Samstag Vor- und Nachmittag 30 €). Der Preis gilt je Fahrer und ist für alle Altersgruppen gleich.',
      },
      {
        id: 'faq-kinder-grosse-strecke',
        question: 'Darf mein Kind auf der großen Strecke fahren?',
        answer:
          'Dies ist Sonntags zwischen 10:00 und 13:00 Uhr uneingeschränkt möglich. Zu den anderen Trainingszeiten dürfen nur Kinder ab 65ccm mit genügend Fahrpraxis die große Strecke befahren. Dabei darf nicht abgekürzt werden. Kinder müssen immer ihre Spur halten und dürfen die Strecke nicht kreuzen, wenn sich von hinten ein schnellerer Fahrer nähert.',
      },
      {
        id: 'faq-kinderstrecke',
        question: 'Wer darf alles auf der Kinderstrecke fahren?',
        answer:
          'Die Kinderstrecke darf ausschließlich von Motorrädern der Größe 50–65 ccm befahren werden. Elektrisch angetriebene Motorräder dieser Größe sind selbstverständlich ebenfalls erlaubt.',
      },
    ],
  },
  {
    category: 'Initiativen',
    items: [
      {
        id: 'faq-cross-kids-kontakt',
        question: 'An wen kann ich mich bzgl. der Cross Kids Initiative wenden?',
        answer:
          'Marian Stanze und Marcel Gengals bilden das Jugendwart Team und freuen sich über eure Kontaktaufnahme über WhatsApp (Marcel): 0171 4926462.',
      },
      {
        id: 'faq-school-kontakt',
        question: 'An wen kann ich mich bzgl. der GSC School Initiative wenden?',
        answer:
          'Maike Lehmann freut sich über eure Kontaktaufnahme über WhatsApp: 0175 20 18 632.',
      },
      {
        id: 'faq-school-anmeldung',
        question: 'Wie kann ich mich für Lehrgänge der GSC School anmelden?',
        answer:
          'Lehrgangstermine der GSC School werden auf MX-Tickets veröffentlicht und können direkt dort gebucht werden.',
      },
      {
        id: 'faq-school-teilnahme',
        question: 'Wer darf alles an der GSC School teilnehmen?',
        answer:
          'Die Teilnahme ist bevorzugt für Mitglieder und bei verbleibenden Plätzen für Gastfahrer erlaubt. Die Veranstaltungen und Teilnehmenden werden nach Fahrerfahrung getrennt. Die Erfahrung ist selbst einzuschätzen (Anfänger, Einsteiger, Fortgeschrittene, Lizenz).',
      },
    ],
  },
  {
    category: 'Camping & Gelände',
    items: [
      {
        id: 'faq-camping',
        question: 'Ist Camping im Fahrerlager erlaubt?',
        answer:
          'Ja, grundsätzlich ist das Camping im Fahrerlager kostenlos und ohne Anmeldung erlaubt. Jeder Müll ist ausnahmslos wieder mitzunehmen.',
      },
      {
        id: 'faq-sanitaer',
        question: 'Gibt es Toiletten oder Duschen?',
        answer: 'Ja, diese sind allerdings nicht durchgehend geöffnet.',
      },
    ],
  },
];
