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

/** Ruft das Sprachmodell auf und gibt die Antwort als JSON-Objekt zurück. */
export async function completeJSON<T>(messages: ChatMessage[], temperature = 0.7): Promise<T> {
  const provider = getChatProvider();
  if (!provider) {
    throw new AIError(
      "Es ist noch kein KI-Schlüssel hinterlegt. Bitte GEMINI_API_KEY oder GROQ_API_KEY setzen (siehe README).",
      503,
    );
  }

  const send = (withJsonMode: boolean) =>
    fetch(`${provider.baseUrl}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${provider.apiKey}`,
      },
      body: JSON.stringify({
        model: provider.model,
        messages,
        temperature,
        max_tokens: 1500,
        ...(withJsonMode ? { response_format: { type: "json_object" } } : {}),
      }),
    });

  let res = await send(true);
  // Manche Modelle kennen den JSON-Modus nicht – dann ohne erneut versuchen.
  if (res.status === 400) res = await send(false);

  if (!res.ok) {
    const detail = await res.text().catch(() => "");
    if (res.status === 429) {
      throw new AIError(
        "Das kostenlose Kontingent ist für den Moment aufgebraucht. Bitte in ein paar Minuten noch einmal versuchen.",
        429,
      );
    }
    console.error(`[ai] ${provider.name} ${res.status}: ${detail.slice(0, 500)}`);
    throw new AIError(`Die KI hat gerade nicht geantwortet (Fehler ${res.status}). Bitte gleich noch einmal versuchen.`, 502);
  }

  const data = (await res.json()) as { choices?: { message?: { content?: string } }[] };
  const text = data.choices?.[0]?.message?.content ?? "";
  return parseJSON<T>(text);
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
