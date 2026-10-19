import { shuffle } from "./answers";
import { VERBS, type IrregularVerb } from "./content/verbs";
import { addDays, today } from "./dates";
import type { VerbStat } from "./state";

/**
 * Karteikasten für unregelmäßige Verben: Fach 0–5.
 * Richtig → ein Fach weiter (kommt später wieder), falsch → zurück in Fach 0 (kommt gleich wieder).
 */
const INTERVAL_DAYS = [0, 1, 2, 4, 8, 16];

export type VerbSet = "basic" | "all" | "hard";

export const VERB_SET_LABEL: Record<VerbSet, string> = {
  basic: "Die wichtigsten",
  all: "Alle Verben",
  hard: "Meine schwierigen",
};

export function isDue(stat: VerbStat | undefined): boolean {
  if (!stat || !stat.last) return true;
  return addDays(stat.last, INTERVAL_DAYS[Math.min(stat.box, 5)]) <= today();
}

export function verbStrength(stat: VerbStat | undefined): "neu" | "übe ich" | "gut" | "sicher" {
  if (!stat) return "neu";
  if (stat.box < 2) return "übe ich";
  if (stat.box < 4) return "gut";
  return "sicher";
}

export function verbsInSet(set: VerbSet, stats: Record<string, VerbStat>): IrregularVerb[] {
  if (set === "basic") return VERBS.filter((v) => v.basic);
  if (set === "hard") return VERBS.filter((v) => stats[v.inf] && (stats[v.inf].wrong > 0 && stats[v.inf].box < 3));
  return VERBS;
}

/** Stellt eine Runde zusammen: zuerst fällige, schwache Verben, dann neue. */
export function buildVerbRound(set: VerbSet, stats: Record<string, VerbStat>, size = 10): IrregularVerb[] {
  const pool = verbsInSet(set, stats);
  const due = pool.filter((v) => stats[v.inf] && isDue(stats[v.inf])).sort((a, b) => stats[a.inf].box - stats[b.inf].box);
  // Neue Verben gemischt, damit eine Runde nicht nur aus einem Muster besteht
  const fresh = shuffle(pool.filter((v) => !stats[v.inf]));
  let round = [...due, ...fresh].slice(0, size);
  // Alles gelernt und nichts fällig? Dann die am wenigsten sicheren Verben üben.
  if (round.length < size) {
    const rest = pool
      .filter((v) => !round.includes(v))
      .sort((a, b) => (stats[a.inf]?.box ?? 0) - (stats[b.inf]?.box ?? 0));
    round = [...round, ...rest].slice(0, size);
  }
  return shuffle(round);
}
