import { checkAccess, completeJSON, errorResponse, LEVEL_PROFILES, type ChatMessage } from "@/lib/ai";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

interface Body {
  messages?: { role: "user" | "assistant"; content: string }[];
  topic?: string | null;
  level?: number;
  name?: string;
}

function systemPrompt(topic: string | null, level: number, name: string) {
  return `You are a warm, patient and respectful English conversation partner for a German-speaking adult learner${
    name ? ` named ${name}` : ""
  }. The learner already knows some English but feels unsure about grammar, vocabulary and speaking freely.
Level: ${LEVEL_PROFILES[level] ?? LEVEL_PROFILES[1]}

${topic ? `Today's conversation topic: "${topic}".` : "No topic has been chosen yet: suggest one pleasant everyday topic yourself (e.g. a favourite place, cooking, a book, the garden, a trip, family traditions) and open the conversation about it."}

How to behave:
- Have a natural, friendly conversation. Keep your replies short (2–4 sentences) and always end with one open, easy question so the learner can keep talking.
- Never be condescending, never use exaggerated praise, emojis or childish language. Treat the learner as an intelligent adult.
- Look carefully at the learner's LAST message only and correct it like a good teacher: list EVERY real grammar or vocabulary mistake in "corrections" (wrong tense or verb form, false friends like "become" for "bekommen", wrong prepositions, German word order, wrong collocations) – max. 5, most important first. Never skip a clear mistake to be polite. Ignore only missing capital letters, missing final punctuation and tiny typos from speech recognition. If the message is correct, "corrections" is an empty array.
- Each correction: "before" = the original phrase, "after" = the corrected phrase, "explanation" = one short, kind sentence IN GERMAN explaining the rule (e.g. "Bei 'yesterday' steht das Simple Past.").
- Do NOT mention the corrections inside "reply" – they are shown separately. In "reply", simply continue the conversation naturally (you may naturally reuse the correct form).
- "new_words": 0–3 useful English words or phrases from YOUR reply or from the corrections that are worth learning at the learner's level, with German translation.
- "reply_de": a natural German translation of your reply (shown on request).
- If the learner writes in German, answer in simple English and gently show how to say it in English via a correction.

Respond ONLY with a JSON object in exactly this shape:
{"reply": "...", "reply_de": "...", "corrections": [{"before": "...", "after": "...", "explanation": "..."}], "new_words": [{"en": "...", "de": "..."}], "topic": "short topic name in German"}`;
}

export async function POST(req: Request) {
  const denied = checkAccess(req);
  if (denied) return denied;

  try {
    const body = (await req.json()) as Body;
    const level = Math.min(4, Math.max(1, Number(body.level) || 1));
    const topic = body.topic?.toString().slice(0, 120) || null;
    const name = body.name?.toString().slice(0, 40) ?? "";

    const history: ChatMessage[] = (body.messages ?? [])
      .slice(-16)
      .filter((m) => (m.role === "user" || m.role === "assistant") && typeof m.content === "string")
      .map((m) => ({ role: m.role, content: m.content.slice(0, 2000) }));

    // Manche Modelle erwarten, dass das Gespräch mit einer Nutzer-Nachricht beginnt.
    if (history.length === 0 || history[0].role !== "user") {
      history.unshift({ role: "user", content: "(Please start the conversation.)" });
    }

    const result = await completeJSON<{
      reply?: string;
      reply_de?: string;
      corrections?: { before?: string; after?: string; explanation?: string }[];
      new_words?: { en?: string; de?: string }[];
      topic?: string;
    }>([{ role: "system", content: systemPrompt(topic, level, name) }, ...history]);

    return Response.json({
      reply: result.reply ?? "",
      reply_de: result.reply_de ?? "",
      corrections: (result.corrections ?? [])
        .filter((c) => c.before && c.after && c.before.trim() !== c.after.trim())
        .map((c) => ({ before: c.before!, after: c.after!, explanation: c.explanation ?? "" })),
      new_words: (result.new_words ?? []).filter((w) => w.en && w.de).map((w) => ({ en: w.en!, de: w.de! })),
      topic: result.topic ?? topic ?? "",
    });
  } catch (err) {
    return errorResponse(err);
  }
}
