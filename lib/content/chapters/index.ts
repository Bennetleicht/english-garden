import type { AppState } from "../../state";
import type { Chapter, VocabItem } from "../types";
import { LEVEL1_CHAPTERS } from "./level1";
import { LEVEL2_CHAPTERS } from "./level2";
import { LEVEL3_CHAPTERS } from "./level3";
import { LEVEL4_CHAPTERS } from "./level4";

/** Jede Stufe besteht aus 3 Kapiteln mit Lektionen, Wortschatz und Kapiteltest. */
export const CHAPTERS: Chapter[] = [...LEVEL1_CHAPTERS, ...LEVEL2_CHAPTERS, ...LEVEL3_CHAPTERS, ...LEVEL4_CHAPTERS];

/** Ab diesem Ergebnis gilt ein Kapiteltest als bestanden. */
export const CHAPTER_PASS_PERCENT = 70;

export function chaptersForLevel(level: number): Chapter[] {
  return CHAPTERS.filter((c) => c.level === level);
}

export function getChapter(id: string): Chapter | undefined {
  return CHAPTERS.find((c) => c.id === id);
}

export function chapterOfLesson(slug: string): Chapter | undefined {
  return CHAPTERS.find((c) => c.lessons.includes(slug));
}

export function vocabForLevel(level: number): VocabItem[] {
  return chaptersForLevel(level).flatMap((c) => c.vocab);
}

export interface ChapterProgress {
  lessonsDone: number;
  lessonsTotal: number;
  testPassed: boolean;
  testPercent: number | null;
  vocabAdded: boolean;
  complete: boolean;
}

export function chapterProgress(chapter: Chapter, state: AppState): ChapterProgress {
  const lessonsDone = chapter.lessons.filter((slug) => state.lessons[slug]).length;
  const test = state.chapterTests[chapter.id];
  const testPassed = Boolean(test?.passed);
  return {
    lessonsDone,
    lessonsTotal: chapter.lessons.length,
    testPassed,
    testPercent: test ? test.percent : null,
    vocabAdded: state.addedVocab.includes(chapter.id),
    complete: lessonsDone === chapter.lessons.length && testPassed,
  };
}

/** Das Kapitel, an dem man auf dieser Stufe gerade arbeitet (erstes nicht abgeschlossenes). */
export function currentChapter(level: number, state: AppState): Chapter | undefined {
  const chapters = chaptersForLevel(level);
  return chapters.find((c) => !chapterProgress(c, state).complete) ?? chapters[chapters.length - 1];
}
