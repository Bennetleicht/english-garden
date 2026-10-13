import { readToken } from "@/lib/auth";
import { accountsEnabled, getSql } from "@/lib/db";
import { mergeStates, migrate } from "@/lib/state";

export const dynamic = "force-dynamic";

function unauthorized() {
  return Response.json({ error: "session" }, { status: 401 });
}

/** GET: aktuellen Lernstand des angemeldeten Kontos laden. */
export async function GET(req: Request) {
  if (!accountsEnabled()) return Response.json({ error: "disabled" }, { status: 503 });
  const id = readToken(req);
  if (id === null) return unauthorized();
  try {
    const { sql, ready } = getSql();
    await ready;
    const rows = (await sql`SELECT display_name, state FROM eg_accounts WHERE id = ${id}`) as { display_name: string; state: unknown }[];
    if (!rows[0]) return unauthorized();
    return Response.json({ name: rows[0].display_name, state: migrate(rows[0].state) });
  } catch (err) {
    console.error("[account/state] GET", err);
    return Response.json({ error: "Laden fehlgeschlagen" }, { status: 500 });
  }
}

/**
 * PUT: Lernstand speichern. Der Server führt ihn mit dem gespeicherten Stand zusammen,
 * damit parallel genutzte Geräte nichts überschreiben. Mit { replace: true } wird ersetzt
 * (nur für „Lernstand zurücksetzen“).
 */
export async function PUT(req: Request) {
  if (!accountsEnabled()) return Response.json({ error: "disabled" }, { status: 503 });
  const id = readToken(req);
  if (id === null) return unauthorized();
  try {
    const body = (await req.json()) as { state?: unknown; replace?: boolean };
    const incoming = migrate(body.state);
    const { sql, ready } = getSql();
    await ready;
    const rows = (await sql`SELECT state FROM eg_accounts WHERE id = ${id}`) as { state: unknown }[];
    if (!rows[0]) return unauthorized();
    const merged = body.replace ? incoming : mergeStates(migrate(rows[0].state), incoming);
    const json = JSON.stringify(merged);
    if (json.length > 2_000_000) return Response.json({ error: "Der Lernstand ist zu groß." }, { status: 413 });
    await sql`UPDATE eg_accounts SET state = ${json}::jsonb, updated_at = now() WHERE id = ${id}`;
    return Response.json({ state: merged });
  } catch (err) {
    console.error("[account/state] PUT", err);
    return Response.json({ error: "Speichern fehlgeschlagen" }, { status: 500 });
  }
}
