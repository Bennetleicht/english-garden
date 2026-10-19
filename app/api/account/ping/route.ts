import { readToken } from "@/lib/auth";
import { accountsEnabled, getSql } from "@/lib/db";

export const dynamic = "force-dynamic";

/**
 * POST (angemeldet): „Ich bin gerade auf Seite X.“
 * Wird beim Seitenwechsel und etwa jede Minute gesendet, solange die App sichtbar ist.
 * Daraus zeigt /admin, wer wann wie lange auf der Website war.
 */
export async function POST(req: Request) {
  if (!accountsEnabled()) return new Response(null, { status: 204 });
  const id = readToken(req);
  if (id === null) return Response.json({ error: "session" }, { status: 401 });
  try {
    const body = (await req.json().catch(() => ({}))) as { path?: string };
    const path = (body.path ?? "/").toString().slice(0, 200);
    const { sql, ready } = getSql();
    await ready;
    await sql`INSERT INTO eg_events (account_id, path) VALUES (${id}, ${path})`;
    await sql`UPDATE eg_accounts SET last_seen = now() WHERE id = ${id}`;
    // Gelegentlich aufräumen: Besuche älter als 180 Tage löschen
    if (Math.random() < 0.01) await sql`DELETE FROM eg_events WHERE at < now() - interval '180 days'`;
    return new Response(null, { status: 204 });
  } catch (err) {
    console.error("[ping]", err);
    return new Response(null, { status: 204 });
  }
}
