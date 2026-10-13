import type { Exam } from "../types";
import { LEVEL1_EXAM } from "./level1";
import { LEVEL2_EXAM } from "./level2";
import { LEVEL3_EXAM } from "./level3";
import { LEVEL4_EXAM } from "./level4";

export const EXAMS: Exam[] = [LEVEL1_EXAM, LEVEL2_EXAM, LEVEL3_EXAM, LEVEL4_EXAM];

export function getExam(level: number): Exam | undefined {
  return EXAMS.find((e) => e.level === level);
}

/** Anzahl der Aufgaben inkl. 8 automatisch erzeugter Wortschatzfragen. */
export function examSize(exam: Exam): number {
  return exam.cloze.gaps.length + exam.grammar.length + exam.reading.questions.length + 8;
}
