/**
 * Alle Grammatik-Lektionen. Die Inhalte liegen je Stufe in `lessons/levelN.ts`,
 * die Typen (Erklärungsbausteine und Übungsarten) in `types.ts`.
 */
import type { Lesson } from "./types";
import { LEVEL1_LESSONS } from "./lessons/level1";
import { LEVEL2_LESSONS } from "./lessons/level2";
import { LEVEL3_LESSONS } from "./lessons/level3";
import { LEVEL4_LESSONS } from "./lessons/level4";

export type { Block, Exercise, Lesson } from "./types";

export const LESSONS: Lesson[] = [...LEVEL1_LESSONS, ...LEVEL2_LESSONS, ...LEVEL3_LESSONS, ...LEVEL4_LESSONS];

export function getLesson(slug: string): Lesson | undefined {
  return LESSONS.find((l) => l.slug === slug);
}

export function lessonsForLevel(level: number): Lesson[] {
  return LESSONS.filter((l) => l.level === level);
}
