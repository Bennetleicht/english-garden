"use client";

/**
 * Vorlesen (Text-to-Speech) über die kostenlose Sprachausgabe des Browsers / Betriebssystems.
 * Auf Mac, iPhone, Windows 11 und in Chrome/Edge gibt es sehr natürliche englische Stimmen.
 */

export function ttsSupported(): boolean {
  return typeof window !== "undefined" && "speechSynthesis" in window;
}

export function loadEnglishVoices(): Promise<SpeechSynthesisVoice[]> {
  if (!ttsSupported()) return Promise.resolve([]);
  const pick = () => window.speechSynthesis.getVoices().filter((v) => v.lang.toLowerCase().startsWith("en"));
  const now = pick();
  if (now.length > 0) return Promise.resolve(now);
  return new Promise((resolve) => {
    const done = () => resolve(pick());
    window.speechSynthesis.addEventListener("voiceschanged", done, { once: true });
    setTimeout(done, 1500);
  });
}

const PREFERRED = ["natural", "neural", "google uk english female", "serena", "kate", "samantha", "daniel", "google us english", "libby", "sonia"];

export function pickDefaultVoice(voices: SpeechSynthesisVoice[]): SpeechSynthesisVoice | undefined {
  for (const hint of PREFERRED) {
    const v = voices.find((voice) => voice.name.toLowerCase().includes(hint));
    if (v) return v;
  }
  return voices.find((v) => v.lang === "en-GB") ?? voices[0];
}

export async function speak(text: string, opts: { voiceURI?: string; rate?: number; onEnd?: () => void } = {}) {
  if (!ttsSupported() || !text.trim()) {
    opts.onEnd?.();
    return;
  }
  const synth = window.speechSynthesis;
  synth.cancel();
  const voices = await loadEnglishVoices();
  const utterance = new SpeechSynthesisUtterance(text);
  const voice = voices.find((v) => v.voiceURI === opts.voiceURI) ?? pickDefaultVoice(voices);
  if (voice) utterance.voice = voice;
  utterance.lang = voice?.lang ?? "en-GB";
  utterance.rate = opts.rate ?? 0.92;
  utterance.onend = () => opts.onEnd?.();
  utterance.onerror = () => opts.onEnd?.();
  synth.speak(utterance);
}

export function stopSpeaking() {
  if (ttsSupported()) window.speechSynthesis.cancel();
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
