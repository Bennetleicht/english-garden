import { neon } from "@neondatabase/serverless";

/**
 * Konto-Datenbank: kostenlose Postgres-Datenbank von Neon (über Vercel → Storage eingerichtet).
 * Vercel setzt die Verbindungsadresse automatisch als DATABASE_URL bzw. POSTGRES_URL.
 * Die Tabelle wird beim ersten Zugriff automatisch angelegt.
 */

export function databaseUrl(): string | undefined {
  return process.env.DATABASE_URL || process.env.POSTGRES_URL || process.env.NEON_DATABASE_URL || undefined;
}

export function accountsEnabled(): boolean {
  return Boolean(databaseUrl());
}

let schemaReady: Promise<void> | null = null;

export function getSql() {
  const url = databaseUrl();
  if (!url) throw new Error("Keine Datenbank eingerichtet");
  const sql = neon(url);
  if (!schemaReady) {
    schemaReady = (async () => {
      await sql`
        CREATE TABLE IF NOT EXISTS eg_accounts (
          id SERIAL PRIMARY KEY,
          username TEXT UNIQUE NOT NULL,
          display_name TEXT NOT NULL,
          pw_hash TEXT NOT NULL,
          state JSONB,
          updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
          created_at TIMESTAMPTZ NOT NULL DEFAULT now()
        )`;
    })().catch((err) => {
      schemaReady = null;
      throw err;
    });
  }
  return { sql, ready: schemaReady };
}

export interface AccountRow {
  id: number;
  username: string;
  display_name: string;
  pw_hash: string;
  state: unknown;
}
