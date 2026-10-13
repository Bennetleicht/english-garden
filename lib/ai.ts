/**
 * Serverseitige KI-Anbindung – nur kostenlose Anbieter.
 *
 * Google Gemini und Groq bieten beide einen OpenAI-kompatiblen Endpunkt an.
 * Deshalb reicht ein einziger, schlanker fetch-Client ohne zusätzliche Pakete.
 *
 * Die kostenlosen Modelle sind manchmal überlastet oder werden von den Anbietern umbenannt.
 * Deshalb wird bei Problemen automatisch wiederholt und auf andere Modelle ausgewichen.
 */

export interface Provider {
  name: "gemini" | "groq";
  baseUrl: string;
  apiKey: string;
  model: string;
}

const GEMINI_BASE = "https://generativelanguage.googleapis.com/v1beta/openai";
const GROQ_BASE = "https://api.groq.com/openai/v1";

/** Hauptanbieter – nur für die Statusanzeige in den Einstellungen. */
export function getChatProvider(): Provider | null {
  const custom = process.env.AI_MODEL?.trim();
  if (process.env.GEMINI_API_KEY) {
    return { name: "gemini", baseUrl: GEMINI_BASE, apiKey: process.env.GEMINI_API_KEY, model: custom || "gemini-flash-latest" };
  }
  if (process.env.GROQ_API_KEY) {
    return { name: "groq", baseUrl: GROQ_BASE, apiKey: process.env.GROQ_API_KEY, model: custom || "llama-3.3-70b-versatile" };
  }
  return null;
}

export function hasTranscription(): boolean {
  return Boolean(process.env.GROQ_API_KEY);
}

export class AIError extends Error {
  constructor(message: string, public status = 500) {
    super(message);
  }
}

/** Prüft den optionalen Zugangscode (Umgebungsvariable ACCESS_CODE). */
export function checkAccess(req: Request): Response | null {
  const code = process.env.ACCESS_CODE?.trim();
  if (!code) return null;
  if (req.headers.get("x-access-code")?.trim() === code) return null;
  return Response.json({ error: "access" }, { status: 401 });
}

export interface ChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

/** Gesamtzeit für eine KI-Anfrage – knapp unter `maxDuration` (60 s) der API-Routen. */
const TOTAL_BUDGET_MS = 52_000;

/** Fehler, bei denen ein erneuter Versuch helfen kann. */
const TRANSIENT = new Set([500, 502, 503, 504]);

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

/** Modelle, die mit 404 geantwortet haben (abgeschaltet), werden eine Stunde lang übersprungen. */
const deadModels = new Map<string, number>();
const isDead = (model: string) => (deadModels.get(model) ?? 0) > Date.now();

const modelListCache = new Map<string, { at: number; ids: string[] }>();

/** Fragt beim Anbieter ab, welche Modelle es gerade gibt (eine Stunde zwischengespeichert). */
async function listModels(baseUrl: string, apiKey: string): Promise<string[]> {
  const cached = modelListCache.get(baseUrl);
  if (cached && Date.now() - cached.at < 3_600_000) return cached.ids;
  let ids: string[] = [];
  try {
    const res = await fetch(`${baseUrl}/models`, {
      headers: { Authorization: `Bearer ${apiKey}` },
      signal: AbortSignal.timeout(5_000),
    });
    if (res.ok) {
      const data = (await res.json()) as { data?: { id?: string }[] };
      ids = (data.data ?? []).map((m) => (m.id ?? "").replace(/^models\//, "")).filter(Boolean);
    }
  } catch {
    /* Liste nicht verfügbar – dann ohne Ausweichmodelle */
  }
  modelListCache.set(baseUrl, { at: Date.now(), ids });
  return ids;
}

function geminiVersion(id: string): number {
  return Number(/^gemini-(\d+(?:\.\d+)?)/.exec(id)?.[1] ?? 0);
}

/** Gemini-Ausweichmodelle: neueste Version zuerst, stabile vor Vorschau-Versionen. */
async function geminiFallbacks(apiKey: string, primary: string): Promise<string[]> {
  return (await listModels(GEMINI_BASE, apiKey))
    .filter((id) => /^gemini-[\d.]+-flash/.test(id) && !/(image|tts|audio|live|embedding|thinking|exp)/.test(id))
    .filter((id) => id !== primary && !isDead(id))
    .sort(
      (x, y) =>
        geminiVersion(y) - geminiVersion(x) ||
        Number(x.includes("preview")) - Number(y.includes("preview")) ||
        Number(x.includes("lite")) - Number(y.includes("lite")),
    )
    .slice(0, 4);
}

const GROQ_PREFERRED = [
  "llama-3.3-70b-versatile",
  "openai/gpt-oss-120b",
  "moonshotai/kimi-k2-instruct",
  "qwen/qwen3-32b",
  "openai/gpt-oss-20b",
  "llama-3.1-8b-instant",
];

/** Groq-Modell: das erste verfügbare aus der Wunschliste, sonst irgendein Chat-Modell. */
async function groqModel(apiKey: string): Promise<string> {
  const ids = (await listModels(GROQ_BASE, apiKey)).filter((id) => !isDead(id));
  if (ids.length === 0) return GROQ_PREFERRED[0];
  return (
    GROQ_PREFERRED.find((m) => ids.includes(m)) ??
    ids.find((id) => !/(whisper|guard|tts|compound|playai|orpheus|prompt|distil)/i.test(id)) ??
    GROQ_PREFERRED[0]
  );
}

interface Attempt {
  name: Provider["name"];
  baseUrl: string;
  apiKey: string;
  model: string;
  tries: number;
  timeoutMs: number;
}

async function buildAttempts(): Promise<Attempt[]> {
  const custom = process.env.AI_MODEL?.trim();
  const gemini = process.env.GEMINI_API_KEY;
  const groq = process.env.GROQ_API_KEY;
  const attempts: Attempt[] = [];

  const groqAttempt = async (key: string): Promise<Attempt> => ({
    name: "groq",
    baseUrl: GROQ_BASE,
    apiKey: key,
    model: !gemini && custom ? custom : await groqModel(key),
    tries: 2,
    timeoutMs: 20_000,
  });

  if (gemini) {
    const primary = custom || "gemini-flash-latest";
    // Mit Groq als Reserve bekommt Gemini weniger Zeit – Groq antwortet meist in 1–3 Sekunden.
    if (!isDead(primary)) {
      attempts.push({
        name: "gemini",
        baseUrl: GEMINI_BASE,
        apiKey: gemini,
        model: primary,
        tries: groq ? 1 : 2,
        timeoutMs: groq ? 15_000 : 25_000,
      });
    }
    if (groq) attempts.push(await groqAttempt(groq));
    for (const model of await geminiFallbacks(gemini, primary)) {
      attempts.push({ name: "gemini", baseUrl: GEMINI_BASE, apiKey: gemini, model, tries: 1, timeoutMs: 20_000 });
    }
  } else if (groq) {
    attempts.push(await groqAttempt(groq));
  }
  return attempts;
}

async function callModel(a: Attempt, messages: ChatMessage[], temperature: number, timeoutMs: number): Promise<Response> {
  const send = (extras: boolean) =>
    fetch(`${a.baseUrl}/chat/completions`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${a.apiKey}` },
      body: JSON.stringify({
        model: a.model,
        messages,
        temperature,
        // Großzügig, weil neuere Modelle einen Teil davon zum internen "Nachdenken" verbrauchen
        max_tokens: 4096,
        ...(extras
          ? {
              response_format: { type: "json_object" },
              // Weniger internes Nachdenken = schnellere Antworten
              ...(a.name === "gemini" ? { reasoning_effort: "low" } : {}),
            }
          : {}),
      }),
      signal: AbortSignal.timeout(timeoutMs),
    });

  const res = await send(true);
  // Kennt ein Modell eine der Zusatzoptionen nicht, ohne sie noch einmal versuchen.
  return res.status === 400 ? send(false) : res;
}

/** Ruft das Sprachmodell auf und gibt die Antwort als JSON-Objekt zurück. */
export async function completeJSON<T>(messages: ChatMessage[], temperature = 0.7): Promise<T> {
  const started = Date.now();
  const attempts = await buildAttempts();
  if (attempts.length === 0) {
    throw new AIError(
      "Es ist noch kein KI-Schlüssel hinterlegt. Bitte GEMINI_API_KEY oder GROQ_API_KEY setzen (siehe README).",
      503,
    );
  }

  const statuses: number[] = [];

  for (const attempt of attempts) {
    for (let tryNo = 0; tryNo < attempt.tries; tryNo++) {
      const remaining = TOTAL_BUDGET_MS - (Date.now() - started);
      if (remaining < 3_000) break;
      let res: Response;
      try {
        res = await callModel(attempt, messages, temperature, Math.min(attempt.timeoutMs, remaining));
      } catch (err) {
        console.error(`[ai] ${attempt.name}/${attempt.model}: ${String(err)}`);
        statuses.push(504);
        break; // Zeitüberschreitung → gleich nächstes Modell
      }

      if (res.ok) {
        const data = (await res.json()) as { choices?: { message?: { content?: string } }[] };
        const text = data.choices?.[0]?.message?.content ?? "";
        if (text.trim()) {
          if (attempt !== attempts[0]) console.log(`[ai] Antwort über Ausweichmodell ${attempt.name}/${attempt.model}`);
          return parseJSON<T>(text);
        }
        console.error(`[ai] ${attempt.name}/${attempt.model}: leere Antwort`);
        statuses.push(502);
        break;
      }

      statuses.push(res.status);
      const detail = await res.text().catch(() => "");
      console.error(`[ai] ${attempt.name}/${attempt.model} ${res.status}: ${detail.slice(0, 300)}`);
      if (res.status === 404) {
        deadModels.set(attempt.model, Date.now() + 3_600_000);
        break;
      }
      if (!TRANSIENT.has(res.status)) break; // z. B. 429: Kontingent gilt pro Modell → nächstes Modell
      if (tryNo + 1 < attempt.tries) await sleep(1200);
    }
  }

  if (statuses.length > 0 && statuses.every((st) => st === 401 || st === 403)) {
    throw new AIError("Der KI-Schlüssel wird nicht akzeptiert. Bitte den Schlüssel in Vercel prüfen (siehe README).", 502);
  }
  if (statuses.includes(429) && statuses.every((st) => st === 429 || st === 404)) {
    throw new AIError(
      "Das kostenlose Kontingent ist für den Moment aufgebraucht. Bitte in ein paar Minuten noch einmal versuchen.",
      429,
    );
  }
  throw new AIError(
    "Die KI ist gerade sehr ausgelastet und hat nicht geantwortet. Bitte in ein, zwei Minuten noch einmal versuchen – dein Text bleibt erhalten.",
    503,
  );
}

function parseJSON<T>(text: string): T {
  const cleaned = text.replace(/^```(?:json)?\s*/i, "").replace(/```\s*$/, "").trim();
  try {
    return JSON.parse(cleaned) as T;
  } catch {
    const start = cleaned.indexOf("{");
    const end = cleaned.lastIndexOf("}");
    if (start >= 0 && end > start) {
      try {
        return JSON.parse(cleaned.slice(start, end + 1)) as T;
      } catch {
        /* fällt durch */
      }
    }
    throw new AIError("Die Antwort der KI war unvollständig. Bitte noch einmal versuchen.", 502);
  }
}

export function errorResponse(err: unknown): Response {
  if (err instanceof AIError) return Response.json({ error: err.message }, { status: err.status });
  console.error(err);
  return Response.json({ error: "Unerwarteter Fehler. Bitte noch einmal versuchen." }, { status: 500 });
}

export const LEVEL_PROFILES: Record<number, string> = {
  1: "CEFR A1/A2 (Grundlagen & Alltag). Use short, simple sentences, very common words, mostly present and past simple.",
  2: "CEFR A2/B1 (Sicher im Gespräch). Use everyday language, mix present perfect and past simple naturally, ask for opinions.",
  3: "CEFR B1/B2 (Flüssig ausdrücken). Use richer vocabulary, conditionals, passive voice and longer sentences when natural.",
  4: "CEFR B2 (Freies Englisch & Kultur). Speak naturally like with a friend, use idioms occasionally and nuanced vocabulary.",
};
