import { lessonsForLevel } from "../grammar";
import type { Exam } from "../types";
import { LEVEL1_EXAM } from "./level1";
import { LEVEL2_EXAM } from "./level2";
import { LEVEL3_EXAM } from "./level3";
import { LEVEL4_EXAM } from "./level4";

export const EXAMS: Exam[] = [LEVEL1_EXAM, LEVEL2_EXAM, LEVEL3_EXAM, LEVEL4_EXAM];

export function getExam(level: number): Exam | undefined {
  return EXAMS.find((e) => e.level === level);
}

/** Lektionen der Stufe, die in Lückentext und Grammatikteil nicht vorkommen (z. B. später ergänzte Lektionen). */
export function uncoveredLessons(exam: Exam): string[] {
  const covered = new Set([...exam.cloze.gaps.map((g) => g.lesson), ...exam.grammar.map((g) => g.lesson)]);
  return lessonsForLevel(exam.level)
    .map((l) => l.slug)
    .filter((slug) => !covered.has(slug));
}

/** Anzahl der Aufgaben inkl. 8 Wortschatzfragen und je einer Zusatzaufgabe pro nicht abgedeckter Lektion. */
export function examSize(exam: Exam): number {
  return exam.cloze.gaps.length + exam.grammar.length + uncoveredLessons(exam).length + exam.reading.questions.length + 8;
}
