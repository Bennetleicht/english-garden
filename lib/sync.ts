"use client";

import { useSyncExternalStore } from "react";
import { request } from "./api";
import { hasProgress, mergeStates, migrate, type AppState } from "./state";
import { applyRemoteState, clearLocalState, getState, onLocalChange } from "./storage";

/**
 * Konto-Abgleich: Der Lernstand liegt weiterhin lokal im Browser (schnell, funktioniert auch offline)
 * und wird im Hintergrund mit dem Konto abgeglichen:
 * - beim Öffnen der App und wenn sie wieder in den Vordergrund kommt → vom Server holen und zusammenführen
 * - nach jeder Änderung (kurz verzögert) und beim Verlassen → zum Server schicken
 */

const SESSION_KEY = "english-garden-session";
const OWNER_KEY = "english-garden-owner";

export interface Session {
  token: string;
  name: string;
  email?: string | null;
}

export type SyncStatus = "idle" | "syncing" | "saved" | "offline";

/* ---------- kleine Stores für Sitzung und Status ---------- */

let session: Session | null | undefined;
let syncStatus: SyncStatus = "idle";
const listeners = new Set<() => void>();
const notify = () => listeners.forEach((l) => l());
const subscribe = (l: () => void) => {
  listeners.add(l);
  return () => listeners.delete(l);
};

function readSession(): Session | null {
  if (session !== undefined) return session;
  try {
    const raw = window.localStorage.getItem(SESSION_KEY);
    session = raw ? (JSON.parse(raw) as Session) : null;
  } catch {
    session = null;
  }
  return session;
}

function writeSession(next: Session | null) {
  session = next;
  try {
    if (next) window.localStorage.setItem(SESSION_KEY, JSON.stringify(next));
    else window.localStorage.removeItem(SESSION_KEY);
  } catch {
    /* ignorieren */
  }
  notify();
}

function setStatus(s: SyncStatus) {
  syncStatus = s;
  notify();
}

/** Angemeldetes Konto – `undefined` während des ersten (Server-)Renderns. */
export function useSession(): Session | null | undefined {
  return useSyncExternalStore(subscribe, readSession, () => undefined);
}

export function useSyncStatus(): SyncStatus {
  return useSyncExternalStore(subscribe, () => syncStatus, () => "idle" as SyncStatus);
}

/** Wem gehört der Lernstand, der gerade lokal auf diesem Gerät liegt? */
function localOwner(): string {
  try {
    return window.localStorage.getItem(OWNER_KEY) ?? "";
  } catch {
    return "";
  }
}

function setLocalOwner(name: string) {
  try {
    window.localStorage.setItem(OWNER_KEY, name.trim().toLowerCase());
  } catch {
    /* ignorieren */
  }
}

/** Gibt es auf diesem Gerät Fortschritt ohne Konto (z. B. aus der Zeit vor den Konten)? */
export function unownedLocalProgress(): AppState | null {
  const local = getState();
  return !localOwner() && hasProgress(local) ? local : null;
}

/* ---------- Anmelden / Abmelden ---------- */

export async function signIn(opts: {
  mode: "login" | "register";
  name?: string;
  email: string;
  password: string;
  takeLocal: boolean;
}) {
  const local = getState();
  const owner = localOwner();
  // Fortschritt ohne Besitzer (aus der Zeit vor den Konten) nur auf Wunsch mitnehmen
  const includeLocal = hasProgress(local) && !owner && opts.takeLocal;

  const res = await request("/api/account", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      action: opts.mode,
      name: opts.name,
      email: opts.email,
      password: opts.password,
      state: includeLocal ? local : undefined,
    }),
  });
  const data = (await res.json().catch(() => ({}))) as {
    token?: string;
    name?: string;
    email?: string | null;
    state?: unknown;
    error?: string;
  };
  if (!res.ok || !data.token) {
    throw new Error(data.error === "access" ? "Der Zugangscode stimmt leider nicht." : data.error || "Das hat nicht geklappt.");
  }
  const name = data.name ?? opts.name ?? "";
  const remote = migrate(data.state);
  // Gehört der lokale Stand genau dieser Person (z. B. offline gelernt)? Dann zusammenführen statt verwerfen.
  const sameOwner = Boolean(owner) && [data.email, name].some((x) => x && x.trim().toLowerCase() === owner);
  if (sameOwner) applyRemoteState(mergeStates(remote, local));
  else {
    if (!includeLocal) clearLocalState();
    applyRemoteState(remote);
  }
  setLocalOwner(data.email || name);
  writeSession({ token: data.token, name, email: data.email ?? null });
  startSync();
  if (sameOwner) void pushNow();
}

/** E-Mail hinterlegen/ändern bzw. Passwort ändern (Einstellungen). */
export async function updateAccount(body: { email?: string; currentPassword?: string; newPassword?: string }) {
  const res = await request("/api/account", { method: "PATCH", headers: authHeaders(), body: JSON.stringify(body) });
  const data = (await res.json().catch(() => ({}))) as { error?: string; email?: string };
  if (!res.ok) throw new Error(data.error === "session" ? "Bitte melde dich neu an." : data.error || "Das hat nicht geklappt.");
  const current = readSession();
  if (data.email && current) {
    writeSession({ ...current, email: data.email });
    setLocalOwner(data.email);
  }
}

/** Meldet die gerade geöffnete Seite (für die Entwickler-Übersicht). */
export function ping(path: string) {
  if (!readSession()) return;
  void request("/api/account/ping", { method: "POST", headers: authHeaders(), body: JSON.stringify({ path }), keepalive: true }).catch(
    () => undefined,
  );
}

export async function signOut() {
  await pushNow().catch(() => undefined);
  writeSession(null);
  clearLocalState();
  setLocalOwner("");
}

/* ---------- Abgleich ---------- */

let started = false;
let pushTimer: ReturnType<typeof setTimeout> | null = null;
let pushing = false;
let pendingPush = false;

function authHeaders(): HeadersInit {
  const s = readSession();
  return s ? { Authorization: `Bearer ${s.token}`, "Content-Type": "application/json" } : { "Content-Type": "application/json" };
}

function handleUnauthorized(res: Response): boolean {
  if (res.status !== 401) return false;
  // Sitzung abgelaufen → neu anmelden lassen (lokaler Stand bleibt erhalten)
  writeSession(null);
  return true;
}

/** Holt den Stand vom Server und führt ihn mit dem lokalen zusammen. */
export async function pull() {
  if (!readSession()) return;
  setStatus("syncing");
  try {
    const res = await request("/api/account/state", { headers: authHeaders() });
    if (handleUnauthorized(res)) return;
    if (!res.ok) throw new Error(String(res.status));
    const data = (await res.json()) as { state: unknown };
    const remote = migrate(data.state);
    const merged = mergeStates(remote, getState());
    applyRemoteState(merged);
    // Hatte das Gerät noch Änderungen, die der Server nicht kennt? → hochladen
    if (JSON.stringify(merged) !== JSON.stringify(remote)) await pushNow();
    else setStatus("saved");
  } catch {
    setStatus("offline");
  }
}

export async function pushNow(opts: { replace?: boolean } = {}) {
  if (!readSession()) return;
  if (pushTimer) {
    clearTimeout(pushTimer);
    pushTimer = null;
  }
  if (pushing) {
    pendingPush = true;
    return;
  }
  pushing = true;
  setStatus("syncing");
  const sent = getState();
  try {
    const res = await request("/api/account/state", {
      method: "PUT",
      headers: authHeaders(),
      body: JSON.stringify({ state: sent, replace: opts.replace }),
      keepalive: JSON.stringify(sent).length < 60_000,
    });
    if (handleUnauthorized(res)) return;
    if (!res.ok) throw new Error(String(res.status));
    const data = (await res.json()) as { state: unknown };
    // Nur übernehmen, wenn sich lokal inzwischen nichts geändert hat
    if (getState().updatedAt === sent.updatedAt) applyRemoteState(migrate(data.state));
    else pendingPush = true;
    setStatus("saved");
  } catch {
    setStatus("offline");
    pendingPush = true;
  } finally {
    pushing = false;
  }
  if (pendingPush) {
    pendingPush = false;
    schedulePush(3_000);
  }
}

function schedulePush(delay = 2_000) {
  if (!readSession()) return;
  if (pushTimer) clearTimeout(pushTimer);
  pushTimer = setTimeout(() => void pushNow(), delay);
}

/** Startet den Hintergrund-Abgleich (einmal pro Seitenaufruf). */
export function startSync() {
  if (started || typeof window === "undefined") return;
  started = true;
  onLocalChange(() => schedulePush());
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "visible") void pull();
    else if (pushTimer) void pushNow();
  });
  window.addEventListener("online", () => void pull());
  void pull();
}
