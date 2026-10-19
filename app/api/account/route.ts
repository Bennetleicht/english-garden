import { checkAccess } from "@/lib/ai";
import { createToken, hashPassword, normalizeUsername, readToken, verifyPassword } from "@/lib/auth";
import { accountsEnabled, getSql, type AccountRow } from "@/lib/db";
import { mergeStates, migrate } from "@/lib/state";

export const dynamic = "force-dynamic";

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));
const MIN_PASSWORD = 6;

function bad(error: string, status = 400) {
  return Response.json({ error }, { status });
}

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

function isEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email);
}

/** GET: Sind Konten eingerichtet? (Keine Namensliste – die bleibt privat.) */
export function GET() {
  return Response.json({ enabled: accountsEnabled() });
}

/**
 * POST: Registrieren oder Anmelden.
 * - register: { action: "register", name, email, password, state? }
 * - login:    { action: "login", email, password, state? }  (ältere Konten ohne E-Mail: Name statt E-Mail)
 */
export async function POST(req: Request) {
  if (!accountsEnabled()) return bad("Konten sind noch nicht eingerichtet (siehe README).", 503);
  const denied = checkAccess(req);
  if (denied) return denied;

  try {
    const body = (await req.json()) as { action?: string; name?: string; email?: string; password?: string; state?: unknown };
    const password = (body.password ?? "").toString();
    const { sql, ready } = getSql();
    await ready;

    if (body.action === "register") {
      const displayName = (body.name ?? "").toString().trim().slice(0, 40);
      const email = normalizeEmail((body.email ?? "").toString());
      if (!displayName) return bad("Bitte gib deinen Vornamen ein.");
      if (!isEmail(email)) return bad("Bitte gib eine gültige E-Mail-Adresse ein.");
      if (password.length < MIN_PASSWORD) return bad(`Das Passwort muss mindestens ${MIN_PASSWORD} Zeichen lang sein.`);

      const existing = (await sql`SELECT id FROM eg_accounts WHERE email = ${email} OR username = ${email}`) as { id: number }[];
      if (existing.length > 0) return bad("Mit dieser E-Mail-Adresse gibt es schon ein Konto. Bitte melde dich an.");

      const state = migrate(body.state);
      state.profile = { ...state.profile, name: displayName };
      state.profileUpdatedAt = Date.now();
      const pwHash = await hashPassword(password);
      const rows = (await sql`
        INSERT INTO eg_accounts (username, display_name, email, pw_hash, state, last_seen)
        VALUES (${email}, ${displayName}, ${email}, ${pwHash}, ${JSON.stringify(state)}::jsonb, now())
        RETURNING id`) as { id: number }[];
      return Response.json({ token: createToken(rows[0].id), name: displayName, email, state });
    }

    // Anmelden – mit E-Mail (oder bei älteren Konten mit dem Namen)
    const login = (body.email ?? body.name ?? "").toString();
    if (!login.trim() || !password) return bad("Bitte gib E-Mail und Passwort ein.");
    const rows = (await sql`
      SELECT id, username, display_name, email, pw_hash, state FROM eg_accounts
      WHERE email = ${normalizeEmail(login)} OR username = ${normalizeUsername(login)}
      LIMIT 1`) as (AccountRow & { email: string | null })[];
    const row = rows[0];
    if (!row || !(await verifyPassword(password, row.pw_hash))) {
      await sleep(600); // bremst wiederholtes Raten
      return bad("E-Mail oder Passwort stimmt nicht.");
    }
    // Lokalen Stand (z. B. bisheriger Fortschritt auf diesem Gerät) gleich mit übernehmen
    let state = migrate(row.state);
    if (body.state) state = mergeStates(state, migrate(body.state));
    await sql`UPDATE eg_accounts SET state = ${JSON.stringify(state)}::jsonb, updated_at = now(), last_seen = now() WHERE id = ${row.id}`;
    return Response.json({ token: createToken(row.id), name: row.display_name, email: row.email, state });
  } catch (err) {
    console.error("[account]", err);
    return bad("Das hat gerade nicht geklappt. Bitte noch einmal versuchen.", 500);
  }
}

/**
 * PATCH (angemeldet): E-Mail hinterlegen/ändern oder Passwort ändern.
 * Body: { email?, currentPassword?, newPassword? }
 */
export async function PATCH(req: Request) {
  if (!accountsEnabled()) return bad("Konten sind nicht eingerichtet.", 503);
  const id = readToken(req);
  if (id === null) return Response.json({ error: "session" }, { status: 401 });

  try {
    const body = (await req.json()) as { email?: string; currentPassword?: string; newPassword?: string };
    const { sql, ready } = getSql();
    await ready;
    const rows = (await sql`SELECT pw_hash, email FROM eg_accounts WHERE id = ${id}`) as { pw_hash: string; email: string | null }[];
    if (!rows[0]) return Response.json({ error: "session" }, { status: 401 });

    if (body.email !== undefined) {
      const email = normalizeEmail(body.email);
      if (!isEmail(email)) return bad("Bitte gib eine gültige E-Mail-Adresse ein.");
      const taken = (await sql`SELECT id FROM eg_accounts WHERE (email = ${email} OR username = ${email}) AND id <> ${id}`) as { id: number }[];
      if (taken.length) return bad("Diese E-Mail-Adresse wird schon von einem anderen Konto verwendet.");
      await sql`UPDATE eg_accounts SET email = ${email} WHERE id = ${id}`;
      return Response.json({ ok: true, email });
    }

    if (body.newPassword !== undefined) {
      if (!(await verifyPassword((body.currentPassword ?? "").toString(), rows[0].pw_hash))) {
        await sleep(600);
        return bad("Das bisherige Passwort stimmt nicht.");
      }
      if (body.newPassword.length < MIN_PASSWORD) return bad(`Das neue Passwort muss mindestens ${MIN_PASSWORD} Zeichen lang sein.`);
      await sql`UPDATE eg_accounts SET pw_hash = ${await hashPassword(body.newPassword)} WHERE id = ${id}`;
      return Response.json({ ok: true });
    }
    return bad("Nichts zu ändern.");
  } catch (err) {
    console.error("[account] PATCH", err);
    return bad("Das hat gerade nicht geklappt. Bitte noch einmal versuchen.", 500);
  }
}
