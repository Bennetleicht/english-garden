/**
 * Serverseitige KI-Anbindung – nur kostenlose Anbieter.
 *
 * Google Gemini und Groq bieten beide einen OpenAI-kompatiblen Endpunkt an.
 * Deshalb reicht ein einziger, schlanker fetch-Client ohne zusätzliche Pakete.
 */

export interface Provider {
  name: "gemini" | "groq";
  baseUrl: string;
  apiKey: string;
  model: string;
}

export function getChatProvider(): Provider | null {
  const custom = process.env.AI_MODEL?.trim();
  if (process.env.GEMINI_API_KEY) {
    return {
      name: "gemini",
      baseUrl: "https://generativelanguage.googleapis.com/v1beta/openai",
      apiKey: process.env.GEMINI_API_KEY,
      model: custom || "gemini-flash-latest",
    };
  }
  if (process.env.GROQ_API_KEY) {
    return {
      name: "groq",
      baseUrl: "https://api.groq.com/openai/v1",
      apiKey: process.env.GROQ_API_KEY,
      model: custom || "llama-3.3-70b-versatile",
    };
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

const GEMINI_BASE = "https://generativelanguage.googleapis.com/v1beta/openai";
const GROQ_BASE = "https://api.groq.com/openai/v1";

/** Fehler, bei denen ein erneuter Versuch bzw. ein anderes Modell helfen kann. */
const TRANSIENT = new Set([429, 500, 502, 503, 504]);

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

let geminiModelCache: { at: number; models: string[] } | null = null;

/**
 * Kostenlose Gemini-Ausweichmodelle. Google benennt Modelle regelmäßig um – deshalb wird die
 * aktuelle Liste direkt bei Google abgefragt (für eine Stunde zwischengespeichert).
 */
async function geminiFallbackModels(apiKey: string, primary: string): Promise<string[]> {
  if (!geminiModelCache || Date.now() - geminiModelCache.at > 3_600_000) {
    let models: string[] = [];
    try {
      const res = await fetch(`${GEMINI_BASE}/models`, { headers: { Authorization: `Bearer ${apiKey}` } });
      if (res.ok) {
        const data = (await res.json()) as { data?: { id?: string }[] };
        models = (data.data ?? [])
          .map((m) => (m.id ?? "").replace(/^models\//, ""))
          .filter((id) => /^gemini-.*flash/.test(id) && !/(image|tts|audio|live|embedding|thinking|exp)/.test(id));
      }
    } catch {
      /* Liste nicht verfügbar – dann eben ohne Ausweichmodelle */
    }
    // Stabile Modelle vor Vorschau-Modellen, "-lite" (meist weniger ausgelastet) zuerst nach dem Hauptmodell
    models.sort((x, y) => Number(x.includes("preview")) - Number(y.includes("preview")) || Number(!x.includes("lite")) - Number(!y.includes("lite")));
    geminiModelCache = { at: Date.now(), models };
  }
  return geminiModelCache.models.filter((m) => m !== primary).slice(0, 2);
}

interface Attempt {
  name: Provider["name"];
  baseUrl: string;
  apiKey: string;
  model: string;
}

async function buildAttempts(): Promise<Attempt[]> {
  const custom = process.env.AI_MODEL?.trim();
  const attempts: Attempt[] = [];
  const gemini = process.env.GEMINI_API_KEY;
  const groq = process.env.GROQ_API_KEY;
  if (gemini) {
    const primary = custom || "gemini-flash-latest";
    attempts.push({ name: "gemini", baseUrl: GEMINI_BASE, apiKey: gemini, model: primary });
    for (const model of await geminiFallbackModels(gemini, primary)) {
      attempts.push({ name: "gemini", baseUrl: GEMINI_BASE, apiKey: gemini, model });
    }
  }
  if (groq) {
    attempts.push({ name: "groq", baseUrl: GROQ_BASE, apiKey: groq, model: (!gemini && custom) || "llama-3.3-70b-versatile" });
  }
  return attempts;
}

async function callModel(a: Attempt, messages: ChatMessage[], temperature: number): Promise<Response> {
  const send = (extras: boolean) =>
    fetch(`${a.baseUrl}/chat/completions`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${a.apiKey}` },
      body: JSON.stringify({
        model: a.model,
        messages,
        temperature,
        // Großzügig, weil neuere Gemini-Modelle einen Teil davon zum internen "Nachdenken" verbrauchen
        max_tokens: 4096,
        ...(extras
          ? {
              response_format: { type: "json_object" },
              // Weniger internes Nachdenken = schnellere Antworten
              ...(a.name === "gemini" ? { reasoning_effort: "low" } : {}),
            }
          : {}),
      }),
      signal: AbortSignal.timeout(20_000),
    });

  const res = await send(true);
  // Kennt ein Modell eine der Zusatzoptionen nicht, ohne sie noch einmal versuchen.
  return res.status === 400 ? send(false) : res;
}

/** Ruft das Sprachmodell auf und gibt die Antwort als JSON-Objekt zurück. */
export async function completeJSON<T>(messages: ChatMessage[], temperature = 0.7): Promise<T> {
  const attempts = await buildAttempts();
  if (attempts.length === 0) {
    throw new AIError(
      "Es ist noch kein KI-Schlüssel hinterlegt. Bitte GEMINI_API_KEY oder GROQ_API_KEY setzen (siehe README).",
      503,
    );
  }

  const started = Date.now();
  let lastStatus = 0;
  let sawQuota = false;

  for (const attempt of attempts) {
    // Pro Modell bis zu zwei Versuche – Überlastung ist oft nach einer Sekunde vorbei.
    for (let tryNo = 0; tryNo < 2; tryNo++) {
      if (Date.now() - started > 22_000) break; // Vercel beendet die Anfrage nach 30 Sekunden
      let res: Response;
      try {
        res = await callModel(attempt, messages, temperature);
      } catch (err) {
        console.error(`[ai] ${attempt.name}/${attempt.model}: ${String(err)}`);
        lastStatus = 504;
        break; // Zeitüberschreitung → gleich nächstes Modell
      }

      if (res.ok) {
        const data = (await res.json()) as { choices?: { message?: { content?: string } }[] };
        const text = data.choices?.[0]?.message?.content ?? "";
        if (text.trim()) return parseJSON<T>(text);
        console.error(`[ai] ${attempt.name}/${attempt.model}: leere Antwort`);
        lastStatus = 502;
        break;
      }

      lastStatus = res.status;
      const detail = await res.text().catch(() => "");
      console.error(`[ai] ${attempt.name}/${attempt.model} ${res.status}: ${detail.slice(0, 300)}`);
      if (res.status === 429) {
        sawQuota = true;
        break; // Kontingent gilt pro Modell → direkt das nächste Modell probieren
      }
      if (!TRANSIENT.has(res.status)) break; // z. B. 404: Modell gibt es nicht → nächstes Modell
      if (tryNo === 0) await sleep(1200);
    }
  }

  if (lastStatus === 401 || lastStatus === 403) {
    throw new AIError("Der KI-Schlüssel wird nicht akzeptiert. Bitte den Schlüssel in Vercel prüfen (siehe README).", 502);
  }
  if (sawQuota && lastStatus === 429) {
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
