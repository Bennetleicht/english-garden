import { addDays, today } from "./dates";
import type { Card } from "./storage";

/**
 * Vereinfachtes SM-2-Verfahren (das Prinzip hinter Anki) mit zwei Antworten:
 * - "Gewusst": Abstand wächst (1 → 3 → 7 → … Tage, multipliziert mit dem Leichtigkeitsfaktor).
 * - "Nicht gewusst": Karte kommt sofort wieder (noch in dieser Sitzung) und morgen erneut,
 *   der Leichtigkeitsfaktor sinkt – schwierige Karten erscheinen dauerhaft häufiger.
 */
export const NEW_CARDS_PER_DAY = 10;

export function reviewCard(card: Card, knewIt: boolean): Card {
  const t = today();
  const history = [...card.history, { day: t, ok: knewIt }];

  if (knewIt) {
    const reps = card.reps + 1;
    let interval: number;
    if (reps === 1) interval = 1;
    else if (reps === 2) interval = 3;
    else interval = Math.max(card.interval + 1, Math.round(card.interval * card.ease));
    const ease = Math.min(3.0, card.ease + 0.05);
    return { ...card, reps, interval, ease, due: addDays(t, interval), history };
  }

  return {
    ...card,
    reps: 0,
    interval: 0,
    lapses: card.lapses + 1,
    ease: Math.max(1.3, card.ease - 0.2),
    due: addDays(t, 1),
    history,
  };
}

export function isNew(card: Card): boolean {
  return card.history.length === 0;
}

/** Karten für die heutige Sitzung: fällige Wiederholungen + begrenzt viele neue Karten. */
export function buildSession(cards: Card[]): Card[] {
  const t = today();
  const due = cards
    .filter((c) => !isNew(c) && c.due <= t)
    .sort((a, b) => a.due.localeCompare(b.due) || a.ease - b.ease);

  const introducedToday = cards.filter((c) => c.history.length > 0 && c.history[0].day === t).length;
  const newBudget = Math.max(0, NEW_CARDS_PER_DAY - introducedToday);
  const fresh = cards
    .filter(isNew)
    .sort((a, b) => a.createdAt.localeCompare(b.createdAt))
    .slice(0, newBudget);

  return [...due, ...fresh];
}

export function dueCount(cards: Card[]): number {
  return buildSession(cards).length;
}

/** Wie gut sitzt eine Karte? Für eine dezente Anzeige im Vokabelkasten. */
export function strength(card: Card): "neu" | "lernend" | "gefestigt" | "sicher" {
  if (isNew(card)) return "neu";
  if (card.interval < 3) return "lernend";
  if (card.interval < 21) return "gefestigt";
  return "sicher";
}
