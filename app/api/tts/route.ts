import { checkAccess } from "@/lib/ai";

export const dynamic = "force-dynamic";
export const maxDuration = 30;

/**
 * Natürliche Vorlese-Stimme (Text-to-Speech) über die kostenlosen KI-Kontingente:
 * 1. Google Gemini (TTS-Modelle, sehr natürliche Stimmen)
 * 2. Groq (TTS-Modell, falls vorhanden)
 * Antwortet mit einer WAV-Datei. Klappt beides nicht, liest der Browser mit der Gerätestimme vor.
 */

type Gender = "female" | "male";

const GEMINI_BASE = "https://generativelanguage.googleapis.com/v1beta";
// Warme, ruhige Stimmen; falls eine Stimme unbekannt ist, wird die zweite versucht
const GEMINI_VOICES: Record<Gender, string[]> = { female: ["Sulafat", "Kore"], male: ["Algieba", "Charon"] };
const GROQ_VOICE_PREFERENCE: Record<Gender, string[]> = {
  female: ["tara", "autumn", "diana", "hannah", "leah", "Celeste-PlayAI", "Arista-PlayAI"],
  male: ["leo", "daniel", "austin", "troy", "dan", "Fritz-PlayAI", "Mason-PlayAI"],
};

let geminiModels: { at: number; ids: string[] } | null = null;
let groqModels: { at: number; ids: string[] } | null = null;
const HOUR = 3_600_000;

async function listGeminiTtsModels(key: string): Promise<string[]> {
  if (geminiModels && Date.now() - geminiModels.at < HOUR) return geminiModels.ids;
  let ids: string[] = [];
  try {
    const res = await fetch(`${GEMINI_BASE}/models?pageSize=200&key=${encodeURIComponent(key)}`, { signal: AbortSignal.timeout(5000) });
    if (res.ok) {
      const data = (await res.json()) as { models?: { name?: string; supportedGenerationMethods?: string[] }[] };
      ids = (data.models ?? [])
        .filter((m) => /tts/i.test(m.name ?? "") && (m.supportedGenerationMethods ?? ["generateContent"]).includes("generateContent"))
        .map((m) => (m.name ?? "").replace(/^models\//, ""))
        // Flash vor Pro (schneller, größeres Gratis-Kontingent), neuere Versionen zuerst
        .sort((a, b) => Number(/pro/.test(a)) - Number(/pro/.test(b)) || b.localeCompare(a));
    }
  } catch {
    /* Liste nicht verfügbar */
  }
  if (ids.length === 0) ids = ["gemini-2.5-flash-preview-tts"];
  geminiModels = { at: Date.now(), ids };
  return ids;
}

/** Rohes PCM (16 Bit, mono) in eine abspielbare WAV-Datei verpacken. */
function pcmToWav(pcm: Buffer, sampleRate: number): Buffer {
  const header = Buffer.alloc(44);
  header.write("RIFF", 0);
  header.writeUInt32LE(36 + pcm.length, 4);
  header.write("WAVE", 8);
  header.write("fmt ", 12);
  header.writeUInt32LE(16, 16);
  header.writeUInt16LE(1, 20); // PCM
  header.writeUInt16LE(1, 22); // mono
  header.writeUInt32LE(sampleRate, 24);
  header.writeUInt32LE(sampleRate * 2, 28);
  header.writeUInt16LE(2, 32);
  header.writeUInt16LE(16, 34);
  header.write("data", 36);
  header.writeUInt32LE(pcm.length, 40);
  return Buffer.concat([header, pcm]);
}

async function geminiSpeech(text: string, gender: Gender, key: string): Promise<Buffer | null> {
  const models = await listGeminiTtsModels(key);
  for (const model of models.slice(0, 2)) {
    for (const voice of GEMINI_VOICES[gender]) {
      const res = await fetch(`${GEMINI_BASE}/models/${model}:generateContent?key=${encodeURIComponent(key)}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        signal: AbortSignal.timeout(20_000),
        body: JSON.stringify({
          contents: [{ parts: [{ text: `Read aloud in a warm, calm and natural British English voice, at a relaxed pace for a language learner:\n\n${text}` }] }],
          generationConfig: {
            responseModalities: ["AUDIO"],
            speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: voice } } },
          },
        }),
      }).catch(() => null);
      if (!res) continue;
      if (!res.ok) {
        const detail = await res.text().catch(() => "");
        console.error(`[tts] gemini ${model}/${voice} ${res.status}: ${detail.slice(0, 200)}`);
        if (res.status === 400) continue; // z. B. unbekannte Stimme → nächste Stimme
        break; // 404/429/5xx → nächstes Modell
      }
      const data = (await res.json()) as {
        candidates?: { content?: { parts?: { inlineData?: { data?: string; mimeType?: string } }[] } }[];
      };
      const part = data.candidates?.[0]?.content?.parts?.find((p) => p.inlineData?.data)?.inlineData;
      if (!part?.data) continue;
      const rate = Number(/rate=(\d+)/.exec(part.mimeType ?? "")?.[1] ?? 24000);
      const raw = Buffer.from(part.data, "base64");
      return /wav/i.test(part.mimeType ?? "") ? raw : pcmToWav(raw, rate);
    }
  }
  return null;
}

async function listGroqTtsModels(key: string): Promise<string[]> {
  if (groqModels && Date.now() - groqModels.at < HOUR) return groqModels.ids;
  let ids: string[] = [];
  try {
    const res = await fetch("https://api.groq.com/openai/v1/models", { headers: { Authorization: `Bearer ${key}` }, signal: AbortSignal.timeout(5000) });
    if (res.ok) {
      const data = (await res.json()) as { data?: { id?: string }[] };
      ids = (data.data ?? []).map((m) => m.id ?? "").filter((id) => /tts|orpheus/i.test(id) && !/arabic/i.test(id));
    }
  } catch {
    /* Liste nicht verfügbar */
  }
  groqModels = { at: Date.now(), ids };
  return ids;
}

async function groqSpeech(text: string, gender: Gender, key: string): Promise<Buffer | null> {
  for (const model of (await listGroqTtsModels(key)).slice(0, 2)) {
    let voices = GROQ_VOICE_PREFERENCE[gender];
    for (let attempt = 0; attempt < 3 && voices.length; attempt++) {
      const voice = voices[0];
      const res = await fetch("https://api.groq.com/openai/v1/audio/speech", {
        method: "POST",
        headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
        signal: AbortSignal.timeout(20_000),
        body: JSON.stringify({ model, input: text, voice, response_format: "wav" }),
      }).catch(() => null);
      if (!res) break;
      if (res.ok) return Buffer.from(await res.arrayBuffer());
      const detail = await res.text().catch(() => "");
      console.error(`[tts] groq ${model}/${voice} ${res.status}: ${detail.slice(0, 200)}`);
      if (res.status !== 400) break;
      // Groq nennt bei unbekannter Stimme die erlaubten – daraus eine passende wählen
      const allowed = Array.from(detail.matchAll(/["'`]([A-Za-z-]{3,30})["'`]/g)).map((m) => m[1]);
      const preferred = GROQ_VOICE_PREFERENCE[gender].filter((v) => allowed.includes(v) && v !== voice);
      voices = preferred.length ? preferred : allowed.filter((v) => v !== voice && v !== model).slice(0, 1);
    }
  }
  return null;
}

export async function POST(req: Request) {
  const denied = checkAccess(req);
  if (denied) return denied;
  try {
    const body = (await req.json()) as { text?: string; voice?: string };
    const text = (body.text ?? "").toString().trim().slice(0, 1200);
    const gender: Gender = body.voice === "male" ? "male" : "female";
    if (!text) return Response.json({ error: "Kein Text." }, { status: 400 });

    let audio: Buffer | null = null;
    if (process.env.GEMINI_API_KEY) audio = await geminiSpeech(text, gender, process.env.GEMINI_API_KEY);
    if (!audio && process.env.GROQ_API_KEY) audio = await groqSpeech(text, gender, process.env.GROQ_API_KEY);
    if (!audio) return Response.json({ error: "Die Online-Stimme ist gerade nicht verfügbar." }, { status: 503 });

    return new Response(new Uint8Array(audio), {
      headers: { "Content-Type": "audio/wav", "Cache-Control": "private, max-age=31536000" },
    });
  } catch (err) {
    console.error("[tts]", err);
    return Response.json({ error: "Vorlesen fehlgeschlagen." }, { status: 500 });
  }
}
