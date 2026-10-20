"use client";

/** Kleiner Client für die eigenen API-Routen – inkl. optionalem Zugangscode. */

const CODE_KEY = "english-garden-access-code";

function getCode(): string {
  try {
    return window.localStorage.getItem(CODE_KEY) ?? "";
  } catch {
    return "";
  }
}

export async function request(path: string, init: RequestInit, retry = true): Promise<Response> {
  const headers = new Headers(init.headers);
  const code = getCode();
  if (code) headers.set("x-access-code", code);
  const res = await fetch(path, { ...init, headers });

  const isAccessError =
    res.status === 401 &&
    (await res
      .clone()
      .json()
      .then((d: { error?: string }) => d.error === "access")
      .catch(() => false));

  if (isAccessError && retry) {
    const entered = window.prompt("Bitte gib einmalig den Zugangscode ein:");
    if (entered) {
      try {
        window.localStorage.setItem(CODE_KEY, entered.trim());
      } catch {
        /* ignorieren */
      }
      return request(path, init, false);
    }
  }
  return res;
}

async function readError(res: Response): Promise<never> {
  let message = "Da ist etwas schiefgelaufen. Bitte noch einmal versuchen.";
  try {
    const data = (await res.json()) as { error?: string };
    if (data.error === "access") message = "Der Zugangscode stimmt leider nicht.";
    else if (data.error) message = data.error;
  } catch {
    /* Standardtext */
  }
  throw new Error(message);
}

export async function postJSON<T>(path: string, body: unknown): Promise<T> {
  const res = await request(path, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) return readError(res);
  return (await res.json()) as T;
}

/** Dateiendung passend zum Aufnahmeformat (Safari nimmt mp4 auf, Chrome/Firefox webm bzw. ogg). */
function audioFileName(type: string): string {
  if (type.includes("mp4") || type.includes("aac") || type.includes("m4a")) return "aufnahme.mp4";
  if (type.includes("ogg")) return "aufnahme.ogg";
  if (type.includes("wav")) return "aufnahme.wav";
  return "aufnahme.webm";
}

export async function postAudio(path: string, blob: Blob): Promise<{ text: string }> {
  const form = new FormData();
  form.append("file", blob, audioFileName(blob.type));
  const res = await request(path, { method: "POST", body: form });
  if (!res.ok) return readError(res);
  return (await res.json()) as { text: string };
}

export interface ServerStatus {
  ai: boolean;
  provider: string | null;
  transcription: boolean;
  accounts: boolean;
}

let statusCache: Promise<ServerStatus> | null = null;

export function getStatus(): Promise<ServerStatus> {
  if (!statusCache) {
    statusCache = fetch("/api/status")
      .then((r) => r.json() as Promise<ServerStatus>)
      .catch(() => ({ ai: false, provider: null, transcription: false, accounts: false }));
  }
  return statusCache;
}

/* Gemeinsame Antworttypen */

export interface Correction {
  before: string;
  after: string;
  explanation: string;
}

export interface NewWord {
  en: string;
  de: string;
}

export interface ChatReply {
  reply: string;
  reply_de: string;
  corrections: Correction[];
  new_words: NewWord[];
  topic?: string;
}

export interface WritingFeedback {
  overall: string;
  praise: string;
  corrected_text: string;
  errors: Correction[]; // echte Fehler
  improvements: Correction[]; // korrekt, aber schöner formulierbar
  tips: string[];
  new_words: NewWord[];
  encouragement: string;
}
