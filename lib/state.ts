/**
 * Datenmodell des Lernstands – gemeinsam für Browser (localStorage) und Server (Konto-Datenbank).
 *
 * Lernt jemand auf mehreren Geräten, werden die Stände mit `mergeStates` zusammengeführt:
 * Es geht nie etwas verloren – von jeder Karte, Lektion und Prüfung bleibt der weitere Fortschritt erhalten.
 */

export type CardSource = "start" | "gespraech" | "schreiben" | "manuell" | "grammatik";

export interface Card {
  id: string;
  front: string; // Englisch
  back: string; // Deutsch / Erklärung
  example?: string;
  source: CardSource;
  createdAt: string; // YYYY-MM-DD
  due: string; // YYYY-MM-DD
  interval: number; // Tage
  ease: number;
  reps: number;
  lapses: number;
  history: { day: string; ok: boolean }[];
}

export interface LessonResult {
  correct: number;
  total: number;
  day: string;
}

export interface ExamResult {
  percent: number;
  passed: boolean;
  day: string;
}

export interface WritingEntry {
  id: string;
  day: string;
  task: string;
  text: string;
  summary: string;
}

/** Lernstand eines unregelmäßigen Verbs (Karteikasten mit Fächern 0–5). */
export interface VerbStat {
  box: number;
  right: number;
  wrong: number;
  last: string; // YYYY-MM-DD
}

export interface Profile {
  name: string;
  level: number; // 1–4
  placementDone: boolean;
  voiceURI: string;
  speechRate: number;
  autoSpeak: boolean;
}

export interface AppState {
  version: 1;
  updatedAt: number; // ms – letzte Änderung
  resetAt: number; // ms – wann zuletzt „Neu anfangen“ gewählt wurde (0 = nie)
  profile: Profile;
  profileUpdatedAt: number;
  activityDays: string[];
  cards: Card[];
  deletedCards: string[]; // gelöschte Karten-IDs, damit sie beim Abgleich nicht zurückkommen
  lessons: Record<string, LessonResult>;
  addedDecks: number[]; // alt: Startwortschatz je Stufe
  addedVocab: string[]; // Kapitel-IDs, deren Wortschatz im Vokabelkasten liegt
  chapterTests: Record<string, ExamResult>; // bester Kapiteltest je Kapitel
  writing: WritingEntry[];
  exams: Record<number, ExamResult>; // beste Abschlussprüfung je Stufe
  verbs: Record<string, VerbStat>; // unregelmäßige Verben
}

export function defaultState(): AppState {
  return {
    version: 1,
    updatedAt: 0,
    resetAt: 0,
    profile: { name: "", level: 1, placementDone: false, voiceURI: "", speechRate: 0.92, autoSpeak: false },
    profileUpdatedAt: 0,
    activityDays: [],
    cards: [],
    deletedCards: [],
    lessons: {},
    addedDecks: [],
    addedVocab: [],
    chapterTests: {},
    writing: [],
    exams: {},
    verbs: {},
  };
}

const arr = <T>(v: unknown): T[] => (Array.isArray(v) ? (v as T[]) : []);
const obj = <T>(v: unknown): T => (v && typeof v === "object" && !Array.isArray(v) ? (v as T) : ({} as T));

/** Ergänzt fehlende Felder (ältere Versionen, defekte Daten). */
export function migrate(raw: unknown): AppState {
  const base = defaultState();
  if (!raw || typeof raw !== "object") return base;
  const r = raw as Partial<AppState>;
  return {
    version: 1,
    updatedAt: typeof r.updatedAt === "number" ? r.updatedAt : 0,
    profile: { ...base.profile, ...obj<Partial<Profile>>(r.profile) },
    profileUpdatedAt: typeof r.profileUpdatedAt === "number" ? r.profileUpdatedAt : 0,
    resetAt: typeof r.resetAt === "number" ? r.resetAt : 0,
    activityDays: arr<string>(r.activityDays),
    cards: arr<Card>(r.cards),
    deletedCards: arr<string>(r.deletedCards),
    lessons: obj(r.lessons),
    addedDecks: arr<number>(r.addedDecks),
    addedVocab: arr<string>(r.addedVocab),
    chapterTests: obj(r.chapterTests),
    writing: arr<WritingEntry>(r.writing),
    exams: obj(r.exams),
    verbs: obj(r.verbs),
  };
}

/** Hat dieser Stand überhaupt schon Fortschritt? */
export function hasProgress(s: AppState): boolean {
  return (
    s.cards.length > 0 ||
    Object.keys(s.lessons).length > 0 ||
    Object.keys(s.verbs).length > 0 ||
    s.activityDays.length > 0 ||
    s.writing.length > 0
  );
}

export function normalizeFront(text: string): string {
  return text.trim().toLowerCase().replace(/[’`]/g, "'").replace(/\s+/g, " ");
}

function betterCard(a: Card, b: Card): Card {
  if (a.history.length !== b.history.length) return a.history.length > b.history.length ? a : b;
  return a.due >= b.due ? a : b;
}

function bestResult<T extends { day: string }>(a: T | undefined, b: T | undefined, score: (x: T) => number): T | undefined {
  if (!a) return b;
  if (!b) return a;
  return score(a) > score(b) || (score(a) === score(b) && a.day >= b.day) ? a : b;
}

function mergeRecord<T extends { day: string }>(a: Record<string, T>, b: Record<string, T>, score: (x: T) => number): Record<string, T> {
  const out: Record<string, T> = {};
  for (const key of new Set([...Object.keys(a), ...Object.keys(b)])) {
    const best = bestResult(a[key], b[key], score);
    if (best) out[key] = best;
  }
  return out;
}

/** Pro Verb gilt der Stand mit den meisten Übungsdurchgängen (bei Gleichstand der neuere). */
function mergeVerbs(a: Record<string, VerbStat>, b: Record<string, VerbStat>): Record<string, VerbStat> {
  const out: Record<string, VerbStat> = { ...a };
  for (const [key, vb] of Object.entries(b)) {
    const va = out[key];
    const na = va ? va.right + va.wrong : -1;
    const nb = vb.right + vb.wrong;
    if (!va || nb > na || (nb === na && vb.last > va.last)) out[key] = vb;
  }
  return out;
}

const union = <T>(a: T[], b: T[]) => Array.from(new Set([...a, ...b]));

/** Führt zwei Lernstände (z. B. Handy und Tablet) zusammen. */
export function mergeStates(aRaw: AppState, bRaw: AppState): AppState {
  const a = migrate(aRaw);
  const b = migrate(bRaw);
  // Wurde auf einem Gerät „Neu anfangen“ gewählt, gilt nur der Stand ab diesem Zeitpunkt –
  // ältere Stände anderer Geräte dürfen den alten Fortschritt nicht zurückbringen.
  if (a.resetAt !== b.resetAt) return a.resetAt > b.resetAt ? a : b;
  const deleted = new Set(union(a.deletedCards, b.deletedCards));

  // Karten: gleiche ID oder gleicher englischer Begriff → die mit mehr Lernfortschritt behalten
  const byId = new Map<string, Card>();
  for (const c of [...a.cards, ...b.cards]) {
    if (deleted.has(c.id)) continue;
    const prev = byId.get(c.id);
    byId.set(c.id, prev ? betterCard(prev, c) : c);
  }
  const byFront = new Map<string, Card>();
  for (const c of byId.values()) {
    const key = normalizeFront(c.front);
    const prev = byFront.get(key);
    byFront.set(key, prev ? betterCard(prev, c) : c);
  }
  const cards = [...byFront.values()].sort((x, y) => x.createdAt.localeCompare(y.createdAt));

  const writing = new Map<string, WritingEntry>();
  for (const w of [...a.writing, ...b.writing]) writing.set(w.id, w);

  const examScore = (x: ExamResult) => x.percent + (x.passed ? 1000 : 0);

  return {
    version: 1,
    updatedAt: Math.max(a.updatedAt, b.updatedAt),
    resetAt: a.resetAt,
    profile: b.profileUpdatedAt >= a.profileUpdatedAt ? b.profile : a.profile,
    profileUpdatedAt: Math.max(a.profileUpdatedAt, b.profileUpdatedAt),
    activityDays: union(a.activityDays, b.activityDays).sort(),
    cards,
    deletedCards: [...deleted].slice(-2000),
    lessons: mergeRecord(a.lessons, b.lessons, (x) => (x.total ? x.correct / x.total : 0)),
    addedDecks: union(a.addedDecks, b.addedDecks),
    addedVocab: union(a.addedVocab, b.addedVocab),
    chapterTests: mergeRecord(a.chapterTests, b.chapterTests, examScore),
    writing: [...writing.values()].sort((x, y) => y.day.localeCompare(x.day)).slice(0, 30),
    exams: mergeRecord(a.exams as Record<string, ExamResult>, b.exams as Record<string, ExamResult>, examScore),
    verbs: mergeVerbs(a.verbs, b.verbs),
  };
}
