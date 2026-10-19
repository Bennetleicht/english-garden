import { createHash, timingSafeEqual } from "node:crypto";
import { hashPassword } from "@/lib/auth";
import { computeStreak } from "@/lib/dates";
import { accountsEnabled, getSql } from "@/lib/db";
import { migrate } from "@/lib/state";

export const dynamic = "force-dynamic";

/** Neue Sitzung, wenn zwischen zwei Lebenszeichen mehr als 10 Minuten liegen. */
const SESSION_GAP_MS = 10 * 60_000;

function checkAdmin(req: Request): Response | null {
  const expected = process.env.ADMIN_PASSWORD?.trim();
  if (!expected) {
    return Response.json({ error: "In Vercel ist noch kein ADMIN_PASSWORD gesetzt (siehe README)." }, { status: 503 });
  }
  const given = req.headers.get("x-admin-password") ?? "";
  const a = createHash("sha256").update(given).digest();
  const b = createHash("sha256").update(expected).digest();
  if (!timingSafeEqual(a, b)) return Response.json({ error: "Falsches Admin-Passwort." }, { status: 401 });
  return null;
}

interface EventRow {
  account_id: number;
  path: string;
  at: string;
}

/** GET: Konten mit Lernstand und Besuche der letzten 30 Tage. */
export async function GET(req: Request) {
  const denied = checkAdmin(req);
  if (denied) return denied;
  if (!accountsEnabled()) return Response.json({ error: "Keine Datenbank verbunden." }, { status: 503 });

  try {
    const { sql, ready } = getSql();
    await ready;
    const accounts = (await sql`
      SELECT id, display_name, email, created_at, last_seen, state FROM eg_accounts ORDER BY created_at`) as {
      id: number;
      display_name: string;
      email: string | null;
      created_at: string;
      last_seen: string | null;
      state: unknown;
    }[];
    const events = (await sql`
      SELECT account_id, path, at FROM eg_events
      WHERE at > now() - interval '30 days'
      ORDER BY account_id, at
      LIMIT 100000`) as EventRow[];

    // Lebenszeichen zu Sitzungen zusammenfassen
    const sessions: { accountId: number; start: string; end: string; minutes: number; pages: string[] }[] = [];
    let current: (typeof sessions)[number] | null = null;
    for (const e of events) {
      const at = new Date(e.at).getTime();
      if (!current || current.accountId !== e.account_id || at - new Date(current.end).getTime() > SESSION_GAP_MS) {
        current = { accountId: e.account_id, start: e.at, end: e.at, minutes: 1, pages: [] };
        sessions.push(current);
      }
      current.end = e.at;
      current.minutes = Math.max(1, Math.round((at - new Date(current.start).getTime()) / 60_000) + 1);
      if (current.pages[current.pages.length - 1] !== e.path) current.pages.push(e.path);
    }
    sessions.sort((x, y) => y.start.localeCompare(x.start));

    return Response.json({
      now: new Date().toISOString(),
      accounts: accounts.map((a) => {
        const s = migrate(a.state);
        return {
          id: a.id,
          name: a.display_name,
          email: a.email,
          createdAt: a.created_at,
          lastSeen: a.last_seen,
          level: s.profile.level,
          lessons: Object.keys(s.lessons).length,
          cards: s.cards.length,
          verbs: Object.keys(s.verbs).length,
          learningDays: s.activityDays.length,
          streak: computeStreak(s.activityDays).count,
          lastLearningDay: s.activityDays.slice().sort().at(-1) ?? null,
          chaptersPassed: Object.values(s.chapterTests).filter((t) => t.passed).length,
          examsPassed: Object.values(s.exams).filter((t) => t.passed).length,
        };
      }),
      sessions: sessions.slice(0, 400),
    });
  } catch (err) {
    console.error("[admin]", err);
    return Response.json({ error: "Daten konnten nicht geladen werden." }, { status: 500 });
  }
}

/** POST: { action: "reset-password", accountId, password } */
export async function POST(req: Request) {
  const denied = checkAdmin(req);
  if (denied) return denied;
  if (!accountsEnabled()) return Response.json({ error: "Keine Datenbank verbunden." }, { status: 503 });
  try {
    const body = (await req.json()) as { action?: string; accountId?: number; password?: string };
    if (body.action === "reset-password") {
      const password = (body.password ?? "").toString();
      if (password.length < 6) return Response.json({ error: "Mindestens 6 Zeichen." }, { status: 400 });
      const { sql, ready } = getSql();
      await ready;
      await sql`UPDATE eg_accounts SET pw_hash = ${await hashPassword(password)} WHERE id = ${Number(body.accountId)}`;
      return Response.json({ ok: true });
    }
    return Response.json({ error: "Unbekannte Aktion." }, { status: 400 });
  } catch (err) {
    console.error("[admin] POST", err);
    return Response.json({ error: "Das hat nicht geklappt." }, { status: 500 });
  }
}
