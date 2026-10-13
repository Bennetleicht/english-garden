import { checkAccess } from "@/lib/ai";
import { createToken, hashPassword, normalizeUsername, verifyPassword } from "@/lib/auth";
import { accountsEnabled, getSql, type AccountRow } from "@/lib/db";
import { mergeStates, migrate } from "@/lib/state";

export const dynamic = "force-dynamic";

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

function bad(error: string, status = 400) {
  return Response.json({ error }, { status });
}

/** GET: Namen der vorhandenen Konten – für die Auswahl „Wer lernt heute?“. */
export async function GET(req: Request) {
  if (!accountsEnabled()) return Response.json({ enabled: false, accounts: [] });
  const denied = checkAccess(req);
  if (denied) return denied;
  try {
    const { sql, ready } = getSql();
    await ready;
    const rows = (await sql`SELECT display_name FROM eg_accounts ORDER BY created_at`) as { display_name: string }[];
    return Response.json({ enabled: true, accounts: rows.map((r) => r.display_name) });
  } catch (err) {
    console.error("[account] list", err);
    return bad("Die Konten konnten gerade nicht geladen werden.", 500);
  }
}

/**
 * POST: Anmelden oder neues Konto anlegen.
 * Body: { action: "login" | "register", name, password, state? }
 */
export async function POST(req: Request) {
  if (!accountsEnabled()) return bad("Konten sind noch nicht eingerichtet (siehe README).", 503);
  const denied = checkAccess(req);
  if (denied) return denied;

  try {
    const body = (await req.json()) as { action?: string; name?: string; password?: string; state?: unknown };
    const displayName = (body.name ?? "").toString().trim().slice(0, 40);
    const username = normalizeUsername(displayName);
    const password = (body.password ?? "").toString();

    if (!username) return bad("Bitte gib deinen Namen ein.");
    if (password.length < 4) return bad("Das Passwort muss mindestens 4 Zeichen lang sein.");

    const { sql, ready } = getSql();
    await ready;

    if (body.action === "register") {
      const existing = (await sql`SELECT id FROM eg_accounts WHERE username = ${username}`) as { id: number }[];
      if (existing.length > 0) return bad("Diesen Namen gibt es schon. Bitte melde dich an oder wähle einen anderen Namen.");

      const state = migrate(body.state);
      state.profile = { ...state.profile, name: displayName };
      state.profileUpdatedAt = Date.now();
      const pwHash = await hashPassword(password);
      const rows = (await sql`
        INSERT INTO eg_accounts (username, display_name, pw_hash, state)
        VALUES (${username}, ${displayName}, ${pwHash}, ${JSON.stringify(state)}::jsonb)
        RETURNING id`) as { id: number }[];
      return Response.json({ token: createToken(rows[0].id), name: displayName, state });
    }

    // Anmelden
    const rows = (await sql`SELECT id, username, display_name, pw_hash, state FROM eg_accounts WHERE username = ${username}`) as AccountRow[];
    const row = rows[0];
    if (!row || !(await verifyPassword(password, row.pw_hash))) {
      await sleep(600); // bremst wiederholtes Raten
      return bad("Name oder Passwort stimmt nicht.");
    }
    // Lokalen Stand (z. B. bisheriger Fortschritt auf diesem Gerät) gleich mit übernehmen
    let state = migrate(row.state);
    if (body.state) {
      state = mergeStates(state, migrate(body.state));
      await sql`UPDATE eg_accounts SET state = ${JSON.stringify(state)}::jsonb, updated_at = now() WHERE id = ${row.id}`;
    }
    return Response.json({ token: createToken(row.id), name: row.display_name, state });
  } catch (err) {
    console.error("[account]", err);
    return bad("Das hat gerade nicht geklappt. Bitte noch einmal versuchen.", 500);
  }
}
