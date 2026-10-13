/** Vergleich von Antworten – großzügig bei Groß-/Kleinschreibung, Apostrophen und Satzzeichen am Ende. */
export function normalizeAnswer(s: string): string {
  return (
    s
      .toLowerCase()
      // Apostrophe ignorieren: "dont" zählt wie "don't" (typischer Tipp-Unterschied auf Tablets)
      .replace(/['’`´]/g, "")
      .replace(/[.!?,]+$/g, "")
      .replace(/\s+/g, " ")
      .trim()
  );
}

export function matchesAny(given: string, answers: string[]): boolean {
  const n = normalizeAnswer(given);
  return n.length > 0 && answers.some((a) => normalizeAnswer(a) === n);
}

export function shuffle<T>(items: T[]): T[] {
  const arr = [...items];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

/** Mischt Wörter für Satzbau-Übungen – aber nie so, dass sie schon richtig stehen. */
export function shuffleWords<T>(items: T[]): T[] {
  const arr = shuffle(items);
  if (arr.length > 1 && arr.every((w, i) => w === items[i])) return [...arr.slice(1), arr[0]];
  return arr;
}
