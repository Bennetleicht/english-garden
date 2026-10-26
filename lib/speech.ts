"use client";

import { getStatus, request } from "./api";

/**
 * Vorlesen (Text-to-Speech).
 *
 * 1. Natürliche Online-Stimme (Gemini/Groq über /api/tts, kostenlos). Einmal gehörte Sätze werden im Browser
 *    gespeichert und danach sofort abgespielt – das schont auch das Gratis-Kontingent.
 * 2. Ausweichlösung: die beste englische Stimme des Geräts.
 *
 * Wichtig für iPhone/iPad: Ton ist nur erlaubt, wenn er direkt auf ein Antippen folgt. Deshalb wird beim Antippen
 * sofort (ohne Warten) ein stummer Ton gestartet, der Audio und Sprachausgabe „freischaltet“.
 */

export type VoiceSetting = string; // "" / "online:female" / "online:male" / Gerätestimme (voiceURI)

export function ttsSupported(): boolean {
  return typeof window !== "undefined" && ("speechSynthesis" in window || "Audio" in window);
}

function synthSupported(): boolean {
  return typeof window !== "undefined" && "speechSynthesis" in window;
}

/* ---------- Gerätestimmen ---------- */

let voiceCache: SpeechSynthesisVoice[] = [];

function refreshVoices() {
  if (!synthSupported()) return;
  voiceCache = window.speechSynthesis.getVoices().filter((v) => v.lang.toLowerCase().startsWith("en"));
}

if (synthSupported()) {
  refreshVoices();
  window.speechSynthesis.addEventListener?.("voiceschanged", refreshVoices);
}

// Spielerei-Stimmen von Apple und sehr alte Sprachausgaben aussortieren
const NOVELTY =
  /(albert|bad news|bahh|bells|boing|bubbles|cellos|wobble|whisper|zarvox|trinoids|junior|ralph|fred|kathy|organ|superstar|jester|grandma|grandpa|reed|rocko|sandy|shelley|flo|eddy|eloquence|espeak|compact)/i;

function voiceScore(v: SpeechSynthesisVoice): number {
  let s = 0;
  if (/natural|neural|premium|enhanced|online|siri/i.test(v.name)) s += 50;
  if (v.lang === "en-GB") s += 20;
  else if (v.lang === "en-US") s += 10;
  if (/sonia|libby|ryan|serena|daniel|kate|stephanie|arthur|martha|jamie/i.test(v.name)) s += 8;
  if (/google/i.test(v.name)) s -= 5;
  if (NOVELTY.test(v.name)) s -= 100;
  return s;
}

/** Englische Gerätestimmen, die besten zuerst (ohne Spielerei-Stimmen). */
export function deviceVoices(): SpeechSynthesisVoice[] {
  if (voiceCache.length === 0) refreshVoices();
  return [...voiceCache].filter((v) => !NOVELTY.test(v.name)).sort((a, b) => voiceScore(b) - voiceScore(a));
}

export function loadEnglishVoices(): Promise<SpeechSynthesisVoice[]> {
  if (!synthSupported()) return Promise.resolve([]);
  if (deviceVoices().length) return Promise.resolve(deviceVoices());
  return new Promise((resolve) => {
    const done = () => {
      refreshVoices();
      resolve(deviceVoices());
    };
    window.speechSynthesis.addEventListener("voiceschanged", done, { once: true });
    setTimeout(done, 1500);
  });
}

export function pickDefaultVoice(voices: SpeechSynthesisVoice[]): SpeechSynthesisVoice | undefined {
  return [...voices].sort((a, b) => voiceScore(b) - voiceScore(a))[0];
}

/* ---------- Online-Stimme ---------- */

const SILENT_WAV = "data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEAQB8AAIA+AAACABAAZGF0YQAAAAA=";
let audioEl: HTMLAudioElement | null = null;
let onlineAvailable: boolean | null = null;
let onlineFailures = 0;
const memoryCache = new Map<string, string>();

if (typeof window !== "undefined") {
  void getStatus().then((s) => {
    onlineAvailable = Boolean(s.tts);
  });
}

function getAudio(): HTMLAudioElement {
  if (!audioEl) {
    audioEl = new Audio();
    audioEl.preload = "auto";
  }
  return audioEl;
}

/** Im Klick-Handler aufrufen: schaltet Audio und Sprachausgabe für spätere Wiedergabe frei (iPhone/iPad). */
export function primeAudio() {
  try {
    const a = getAudio();
    if (a.paused) {
      a.src = SILENT_WAV;
      void a.play().catch(() => undefined);
    }
  } catch {
    /* ignorieren */
  }
  try {
    if (synthSupported() && !window.speechSynthesis.speaking) {
      const u = new SpeechSynthesisUtterance(" ");
      u.volume = 0;
      window.speechSynthesis.speak(u);
    }
  } catch {
    /* ignorieren */
  }
}

async function fetchSpeech(text: string, gender: "female" | "male"): Promise<string> {
  const key = `${gender}|${text}`;
  const cached = memoryCache.get(key);
  if (cached) return cached;

  const cacheKey = `/tts-cache/${gender}/${encodeURIComponent(text).slice(0, 1500)}`;
  let blob: Blob | null = null;
  try {
    const cache = await caches.open("english-garden-tts-v1");
    const hit = await cache.match(cacheKey);
    if (hit) blob = await hit.blob();
    if (!blob) {
      const res = await request("/api/tts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, voice: gender }),
      });
      if (!res.ok) throw new Error(String(res.status));
      blob = await res.blob();
      await cache.put(cacheKey, new Response(blob, { headers: { "Content-Type": "audio/wav" } })).catch(() => undefined);
    }
  } catch (err) {
    if (!blob) {
      // Ohne Cache-Speicher (z. B. privates Fenster) direkt laden
      if (err instanceof Error && /^\d+$/.test(err.message)) throw err;
      const res = await request("/api/tts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, voice: gender }),
      });
      if (!res.ok) throw new Error(String(res.status));
      blob = await res.blob();
    }
  }
  const url = URL.createObjectURL(blob);
  memoryCache.set(key, url);
  return url;
}

/* ---------- Vorlesen ---------- */

let token = 0;
let keepAlive: SpeechSynthesisUtterance[] = []; // Chrome verliert sonst Äußerungen (Garbage Collection)

export interface SpeakOptions {
  voice?: VoiceSetting;
  rate?: number;
  onLoading?: (loading: boolean) => void;
  onEnd?: () => void;
}

export function isOnlineVoice(voice: VoiceSetting | undefined): boolean {
  return !voice || voice.startsWith("online:");
}

/** Lange Texte in Sätze teilen – Chrome bricht sonst nach ca. 15 Sekunden ab. */
function chunks(text: string): string[] {
  const parts = text.match(/[^.!?]+[.!?]*["')\]]*\s*/g) ?? [text];
  const out: string[] = [];
  let current = "";
  for (const p of parts) {
    if ((current + p).length > 180 && current) {
      out.push(current.trim());
      current = "";
    }
    current += p;
  }
  if (current.trim()) out.push(current.trim());
  return out;
}

function speakDevice(text: string, voiceURI: string | undefined, rate: number, my: number, onEnd?: () => void) {
  if (!synthSupported()) {
    onEnd?.();
    return;
  }
  const synth = window.speechSynthesis;
  const voices = deviceVoices();
  const voice = (voiceURI && voices.find((v) => v.voiceURI === voiceURI)) || pickDefaultVoice(voices);
  synth.cancel();
  synth.resume();
  keepAlive = [];
  const parts = chunks(text);
  parts.forEach((part, i) => {
    const u = new SpeechSynthesisUtterance(part);
    if (voice) u.voice = voice;
    u.lang = voice?.lang ?? "en-GB";
    u.rate = rate;
    if (i === parts.length - 1) {
      u.onend = () => my === token && onEnd?.();
      u.onerror = () => my === token && onEnd?.();
    }
    keepAlive.push(u);
    synth.speak(u);
  });
  // Chrome verschluckt gelegentlich die erste Äußerung direkt nach cancel() → einmal nachfassen
  setTimeout(() => {
    if (my === token && !synth.speaking && !synth.pending && keepAlive.length) {
      keepAlive.forEach((u) => synth.speak(u));
    }
  }, 350);
}

/**
 * Liest einen englischen Text vor. Startet sofort (wichtig für iPhone/iPad) – nicht mit await aufrufen.
 */
export function speak(text: string, opts: SpeakOptions = {}) {
  const clean = text.trim();
  if (!clean) {
    opts.onEnd?.();
    return;
  }
  stopSpeaking();
  const my = ++token;
  const rate = Math.min(1.2, Math.max(0.6, opts.rate ?? 0.92));
  const online = isOnlineVoice(opts.voice) && onlineAvailable !== false && onlineFailures < 3;

  if (!online) {
    speakDevice(clean, isOnlineVoice(opts.voice) ? undefined : opts.voice, rate, my, opts.onEnd);
    return;
  }

  primeAudio(); // noch innerhalb des Antippens freischalten
  const gender = opts.voice === "online:male" ? "male" : "female";
  opts.onLoading?.(true);
  fetchSpeech(clean, gender)
    .then(async (url) => {
      if (my !== token) return;
      opts.onLoading?.(false);
      const a = getAudio();
      a.src = url;
      a.playbackRate = rate / 0.92; // 0.92 = normales Tempo der Online-Stimme
      a.onended = () => my === token && opts.onEnd?.();
      a.onerror = () => my === token && opts.onEnd?.();
      await a.play();
      onlineFailures = 0;
    })
    .catch(() => {
      if (my !== token) return;
      onlineFailures++;
      opts.onLoading?.(false);
      speakDevice(clean, undefined, rate, my, opts.onEnd);
    });
}

export function stopSpeaking() {
  token++;
  if (audioEl && !audioEl.paused) audioEl.pause();
  if (synthSupported()) window.speechSynthesis.cancel();
}

/* ---------- Spracherkennung (Speech-to-Text) ---------- */

// Minimale Typen für die (noch nicht standardisierte) Web Speech API.
export interface RecognitionLike {
  lang: string;
  interimResults: boolean;
  continuous: boolean;
  maxAlternatives: number;
  start(): void;
  stop(): void;
  abort(): void;
  onresult: ((e: { resultIndex: number; results: ArrayLike<ArrayLike<{ transcript: string }> & { isFinal: boolean }> }) => void) | null;
  onerror: ((e: { error: string }) => void) | null;
  onend: (() => void) | null;
}

export function createRecognition(): RecognitionLike | null {
  if (typeof window === "undefined") return null;
  const w = window as unknown as { SpeechRecognition?: new () => RecognitionLike; webkitSpeechRecognition?: new () => RecognitionLike };
  const Ctor = w.SpeechRecognition ?? w.webkitSpeechRecognition;
  return Ctor ? new Ctor() : null;
}
