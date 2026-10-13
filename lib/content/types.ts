/**
 * Gemeinsame Typen für Lektionen und Prüfungen.
 * In allen deutschen Texten markiert **so** eine Hervorhebung (wird fett dargestellt).
 */

export type Block =
  /** Fließtext */
  | { kind: "text"; text: string }
  /** Eine Regel mit Überschrift (wird als Karte mit grünem Rand dargestellt) */
  | { kind: "rule"; title: string; text: string }
  /** Beispielsätze Englisch / Deutsch – jeder Satz kann vorgelesen werden */
  | { kind: "examples"; title?: string; items: { en: string; de: string }[] }
  /** Übersichtstabelle, z. B. Bildung einer Zeit. Erste Zeile = headers */
  | { kind: "table"; title?: string; headers: string[]; rows: string[][] }
  /** Typische Fehler von Deutschsprachigen: falsch → richtig + kurze Begründung */
  | { kind: "mistakes"; items: { wrong: string; right: string; note: string }[] }
  /** Tipp / Eselsbrücke (beiger Kasten mit Glühbirne) */
  | { kind: "tip"; text: string }
  /** „Auf einen Blick“ – 3–5 Stichpunkte als Zusammenfassung am Ende */
  | { kind: "summary"; points: string[] };

/**
 * Übungstypen:
 * - gap:    Lückentext, "___" markiert genau EINE Lücke, `answers` enthält alle akzeptierten Lösungen
 *           (Groß-/Kleinschreibung, Apostrophe und Satzzeichen am Ende werden beim Vergleich ignoriert).
 * - choice: Auswahl, `answer` = Index der richtigen Option. Mit "___" im Satz wird die Auswahl in die Lücke gesetzt.
 * - order:  Satzbau – `words` stehen in der RICHTIGEN Reihenfolge und werden gemischt angezeigt.
 *           Satzzeichen nicht als eigene Wörter, sondern weglassen. Max. ca. 10 Wörter.
 */
export type Exercise =
  | { type: "gap"; sentence: string; answers: string[]; hint?: string; explanation: string }
  | { type: "choice"; sentence: string; options: string[]; answer: number; explanation: string }
  | { type: "order"; words: string[]; translation: string; explanation: string };

export interface Lesson {
  slug: string;
  level: number;
  title: string;
  subtitle: string;
  blocks: Block[];
  exercises: Exercise[];
}

/* ---------------------------------------------------------------- Prüfungen */

/** Eine Lücke in einem zusammenhängenden Text. */
export interface ClozeGap {
  /** Mit Optionen → Auswahlfeld, ohne → Eingabefeld */
  options?: string[];
  /** Bei Optionen: Index der richtigen Option. */
  answer?: number;
  /** Ohne Optionen: alle akzeptierten Antworten */
  answers?: string[];
  /** Grundform/Hinweis in Klammern hinter der Lücke, z. B. "(go)" */
  hint?: string;
  /** slug der Lektion, zu der die Lücke gehört (für die Auswertung) */
  lesson: string;
  explanation: string;
}

export interface ExamCloze {
  title: string; // englischer Titel der Geschichte
  intro: string; // deutsche Anleitung
  /** Text mit Platzhaltern {1}, {2}, … – Absätze mit "\n\n" trennen */
  text: string;
  gaps: ClozeGap[]; // gaps[0] gehört zu {1}
}

export type ExamExercise = Exercise & { lesson: string };

export interface ExamReading {
  title: string; // englischer Titel
  intro: string; // deutsche Anleitung
  text: string; // englischer Lesetext, Absätze mit "\n\n"
  questions: { question: string; options: string[]; answer: number; explanation: string }[];
}

export interface Exam {
  level: number;
  cloze: ExamCloze;
  grammar: ExamExercise[];
  reading: ExamReading;
}
