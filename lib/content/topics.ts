/** Gesprächsthemen für den Sprachtrainer und Schreibaufgaben – nach Stufen geordnet. */

export interface Topic {
  label: string; // Deutsch, für die Anzeige
  prompt: string; // Englisch, für die KI
}

export const CHAT_TOPICS: Topic[] = [
  { label: "Urlaub & Reisen", prompt: "holidays and travelling" },
  { label: "Ein Buch besprechen", prompt: "a book she has read recently" },
  { label: "Ein Rezept erklären", prompt: "explaining a favourite recipe step by step" },
  { label: "Familie", prompt: "family and family traditions" },
  { label: "Garten & Natur", prompt: "gardening, plants and nature" },
  { label: "Mein Wochenende", prompt: "what she did last weekend" },
  { label: "Ein Film oder eine Serie", prompt: "a film or TV series she likes" },
  { label: "Im Restaurant", prompt: "a role-play: ordering food in a restaurant in London (you are the waiter)" },
  { label: "Im Hotel", prompt: "a role-play: checking in at a hotel (you are the receptionist)" },
  { label: "Nach dem Weg fragen", prompt: "a role-play: asking for directions in an English city (you are a friendly local)" },
  { label: "Gesundheit & Wohlbefinden", prompt: "health, sleep and feeling good" },
  { label: "Erinnerungen", prompt: "a nice memory from her childhood or youth" },
];

export const WRITING_TASKS: Record<number, string[]> = {
  1: [
    "Schreibe 3 Sätze über deinen heutigen Tag.",
    "Beschreibe deine Familie in 3–4 Sätzen.",
    "Was hast du letztes Wochenende gemacht? Schreibe 4 Sätze.",
    "Beschreibe dein Lieblingsessen und warum du es magst.",
  ],
  2: [
    "Schreibe eine kurze Postkarte aus dem Urlaub an eine Freundin (5–6 Sätze).",
    "Welche Länder hast du schon besucht? Was hat dir am besten gefallen?",
    "Was sind deine Pläne für den nächsten Sommer?",
    "Ist das Leben in der Stadt oder auf dem Land schöner? Begründe deine Meinung.",
  ],
  3: [
    "Was würdest du tun, wenn du ein Jahr frei hättest?",
    "Beschreibe eine Person, die dich in deinem Leben geprägt hat.",
    "Schreibe eine höfliche E-Mail an ein Hotel und frage nach einem Zimmer für drei Nächte.",
    "Erzähle von einem Buch oder Film, der dich bewegt hat, und erkläre warum.",
  ],
  4: [
    "Was hättest du in deinem Leben anders gemacht – und was genau richtig?",
    "Schreibe einen kurzen Leserbrief zu einem Thema, das dir am Herzen liegt.",
    "Wie hat sich das Leben in den letzten 30 Jahren verändert? Nenne Vor- und Nachteile.",
    "Beschreibe eine Tradition aus deiner Heimat für jemanden aus England.",
  ],
};
