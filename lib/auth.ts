import { createHash, createHmac, randomBytes, scrypt as scryptCb, timingSafeEqual } from "node:crypto";
import { promisify } from "node:util";
import { databaseUrl } from "./db";

/**
 * Einfache, sichere Anmeldung ohne E-Mail: Name + Passwort.
 * Passwörter werden nur als scrypt-Hash gespeichert. Nach der Anmeldung erhält das Gerät
 * ein signiertes Token (1 Jahr gültig), das bei jeder Anfrage mitgeschickt wird.
 */

const scrypt = promisify(scryptCb) as (password: string, salt: Buffer, keylen: number) => Promise<Buffer>;

export function normalizeUsername(name: string): string {
  return name.trim().toLowerCase().replace(/\s+/g, " ");
}

export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16);
  const hash = await scrypt(password, salt, 32);
  return `${salt.toString("hex")}:${hash.toString("hex")}`;
}

export async function verifyPassword(password: string, stored: string): Promise<boolean> {
  const [saltHex, hashHex] = stored.split(":");
  if (!saltHex || !hashHex) return false;
  const expected = Buffer.from(hashHex, "hex");
  const actual = await scrypt(password, Buffer.from(saltHex, "hex"), expected.length);
  return timingSafeEqual(actual, expected);
}

/** Geheimnis zum Signieren: AUTH_SECRET, sonst aus der (geheimen) Datenbank-Adresse abgeleitet. */
function secret(): string {
  const s = process.env.AUTH_SECRET || databaseUrl();
  if (!s) throw new Error("Kein Geheimnis für Anmeldungen verfügbar");
  return createHash("sha256").update(`english-garden:${s}`).digest("hex");
}

const TOKEN_DAYS = 365;

export function createToken(accountId: number): string {
  const expires = Date.now() + TOKEN_DAYS * 86_400_000;
  const payload = `${accountId}.${expires}`;
  const sig = createHmac("sha256", secret()).update(payload).digest("base64url");
  return `${payload}.${sig}`;
}

/** Liefert die Konto-ID aus dem Authorization-Header – oder null. */
export function readToken(req: Request): number | null {
  const header = req.headers.get("authorization") ?? "";
  const token = header.startsWith("Bearer ") ? header.slice(7).trim() : "";
  const [id, expires, sig] = token.split(".");
  if (!id || !expires || !sig) return null;
  const expected = createHmac("sha256", secret()).update(`${id}.${expires}`).digest("base64url");
  const a = Buffer.from(sig);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !timingSafeEqual(a, b)) return null;
  if (Number(expires) < Date.now()) return null;
  const accountId = Number(id);
  return Number.isInteger(accountId) ? accountId : null;
}
