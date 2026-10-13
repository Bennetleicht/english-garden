export interface Level {
  id: number;
  title: string;
  cefr: string;
  short: string;
  description: string;
  goals: string[];
}

export const LEVELS: Level[] = [
  {
    id: 1,
    title: "Grundlagen & Alltag",
    cefr: "A1/A2",
    short: "Die Basis sicher beherrschen",
    description:
      "Hier festigen wir das Fundament: die wichtigsten Zeiten der Gegenwart und Vergangenheit, Fragen stellen und den Grundwortschatz für Reisen, Familie und Hobbys.",
    goals: [
      "Über deinen Alltag in der Gegenwart sprechen",
      "Erzählen, was gestern oder im Urlaub passiert ist",
      "Fragen stellen und kurze Gespräche führen",
      "Zeitangaben mit in, on und at richtig verwenden",
    ],
  },
  {
    id: 2,
    title: "Sicher im Gespräch",
    cefr: "A2/B1",
    short: "Zeiten mischen, Meinung sagen",
    description:
      "Jetzt geht es um die Zeiten, die Deutschsprachige oft verwechseln – Present Perfect und Simple Past – sowie darum, Pläne zu schildern, zu vergleichen und die eigene Meinung zu äußern.",
    goals: [
      "Present Perfect und Simple Past sicher unterscheiden",
      "Über Pläne und die Zukunft sprechen",
      "Dinge vergleichen und beschreiben",
      "Höflich zustimmen, widersprechen und Smalltalk führen",
    ],
  },
  {
    id: 3,
    title: "Flüssig ausdrücken",
    cefr: "B1/B2",
    short: "Komplexere Sätze bauen",
    description:
      "Auf dieser Stufe werden die Sätze länger und eleganter: Bedingungen, Passiv, Relativsätze und indirekte Rede machen dein Englisch flüssiger und genauer.",
    goals: [
      "Wenn-dann-Sätze (Conditionals) bilden",
      "Das Passiv sicher verwenden",
      "Sätze mit who, which und that verbinden",
      "Wiedergeben, was andere gesagt haben",
    ],
  },
  {
    id: 4,
    title: "Freies Englisch & Kultur",
    cefr: "B2",
    short: "Feinheiten, Redewendungen, Kultur",
    description:
      "Hier geht es um die feinen Unterschiede: Redewendungen, typische Stolperfallen für Deutschsprachige, Bedauern ausdrücken und echte Texte verstehen.",
    goals: [
      "Häufige Idioms verstehen und benutzen",
      "False Friends sicher vermeiden",
      "Über Vergangenes nachdenken (should have, would have)",
      "used to, be used to und get used to unterscheiden",
    ],
  },
];

export function getLevel(id: number): Level {
  return LEVELS.find((l) => l.id === id) ?? LEVELS[0];
}
