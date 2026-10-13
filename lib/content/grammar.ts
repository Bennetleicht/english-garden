/**
 * Alle Grammatik-Lektionen. Die Inhalte liegen je Stufe in `lessons/levelN.ts`,
 * die Reihenfolge innerhalb einer Stufe ergibt sich aus den Kapiteln (`chapters/levelN.ts`).
 */
import { CHAPTERS } from "./chapters";
import { LEVEL1_LESSONS } from "./lessons/level1";
import { LEVEL2_LESSONS } from "./lessons/level2";
import { LEVEL3_LESSONS } from "./lessons/level3";
import { LEVEL4_LESSONS } from "./lessons/level4";
import type { Lesson } from "./types";

export type { Block, Exercise, Lesson } from "./types";

const ALL: Lesson[] = [...LEVEL1_LESSONS, ...LEVEL2_LESSONS, ...LEVEL3_LESSONS, ...LEVEL4_LESSONS];

/** Position einer Lektion in der Kapitel-Reihenfolge (nicht zugeordnete Lektionen ans Ende ihrer Stufe). */
function orderIndex(slug: string): number {
  let i = 0;
  for (const chapter of CHAPTERS) {
    for (const s of chapter.lessons) {
      if (s === slug) return i;
      i++;
    }
  }
  return Number.MAX_SAFE_INTEGER;
}

export const LESSONS: Lesson[] = [...ALL].sort((a, b) => a.level - b.level || orderIndex(a.slug) - orderIndex(b.slug));

export function getLesson(slug: string): Lesson | undefined {
  return LESSONS.find((l) => l.slug === slug);
}

export function lessonsForLevel(level: number): Lesson[] {
  return LESSONS.filter((l) => l.level === level);
}
