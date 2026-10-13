/** Datumshilfen. Alle Tage werden als lokale "YYYY-MM-DD"-Strings gespeichert. */

export function toDay(date: Date = new Date()): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function today(): string {
  return toDay(new Date());
}

export function parseDay(day: string): Date {
  const [y, m, d] = day.split("-").map(Number);
  return new Date(y, m - 1, d);
}

export function addDays(day: string, n: number): string {
  const date = parseDay(day);
  date.setDate(date.getDate() + n);
  return toDay(date);
}

/** Montag der Woche, in der `day` liegt. */
export function startOfWeek(day: string = today()): string {
  const date = parseDay(day);
  const weekday = (date.getDay() + 6) % 7; // Mo = 0 … So = 6
  date.setDate(date.getDate() - weekday);
  return toDay(date);
}

export function isInCurrentWeek(day: string): boolean {
  const start = startOfWeek();
  return day >= start && day <= addDays(start, 6);
}

/** Anzahl aufeinanderfolgender Lerntage bis heute (oder bis gestern, wenn heute noch nicht gelernt wurde). */
export function computeStreak(days: string[]): { count: number; learnedToday: boolean } {
  const set = new Set(days);
  const t = today();
  const learnedToday = set.has(t);
  let cursor = learnedToday ? t : addDays(t, -1);
  let count = 0;
  while (set.has(cursor)) {
    count++;
    cursor = addDays(cursor, -1);
  }
  return { count, learnedToday };
}

export function greeting(): string {
  const h = new Date().getHours();
  if (h < 11) return "Guten Morgen";
  if (h < 17) return "Hallo";
  return "Guten Abend";
}

export function formatDayGerman(day: string): string {
  return parseDay(day).toLocaleDateString("de-DE", { weekday: "long", day: "numeric", month: "long" });
}
