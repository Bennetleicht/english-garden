import { checkAccess, completeJSON, errorResponse, LEVEL_PROFILES } from "@/lib/ai";

export const dynamic = "force-dynamic";
export const maxDuration = 30;

interface Body {
  task?: string;
  text?: string;
  level?: number;
  name?: string;
}

export async function POST(req: Request) {
  const denied = checkAccess(req);
  if (denied) return denied;

  try {
    const body = (await req.json()) as Body;
    const text = body.text?.toString().trim().slice(0, 4000) ?? "";
    const task = body.task?.toString().slice(0, 300) ?? "Freies Schreiben";
    const level = Math.min(4, Math.max(1, Number(body.level) || 1));

    if (text.length < 3) {
      return Response.json({ error: "Bitte schreibe zuerst ein paar Wörter." }, { status: 400 });
    }

    const system = `You are an experienced, warm English teacher giving written feedback to a German-speaking adult woman${
      body.name ? ` named ${body.name.toString().slice(0, 40)}` : ""
    }.
Her level: ${LEVEL_PROFILES[level] ?? LEVEL_PROFILES[1]}
She completed this writing task: "${task}".

Give honest, encouraging and concrete feedback. Write ALL explanations in German (address her with "du"). No emojis, no exaggerated praise, no childish tone.

Respond ONLY with a JSON object in exactly this shape:
{
 "praise": "1–2 German sentences about what is genuinely good in her text",
 "corrected_text": "her full text with all mistakes corrected, keeping her style and ideas",
 "corrections": [{"before": "original phrase", "after": "corrected phrase", "explanation": "short German explanation of the rule"}],
 "tips": ["1–3 German tips to make the text sound more natural, each with a concrete English example"],
 "new_words": [{"en": "useful English word or phrase", "de": "German translation"}],
 "encouragement": "one calm, motivating German closing sentence"
}
List at most 6 corrections, the most important first. If there are no mistakes, "corrections" is an empty array. "new_words": 2–4 items.`;

    const result = await completeJSON<{
      praise?: string;
      corrected_text?: string;
      corrections?: { before?: string; after?: string; explanation?: string }[];
      tips?: string[];
      new_words?: { en?: string; de?: string }[];
      encouragement?: string;
    }>(
      [
        { role: "system", content: system },
        { role: "user", content: text },
      ],
      0.4,
    );

    return Response.json({
      praise: result.praise ?? "",
      corrected_text: result.corrected_text ?? text,
      corrections: (result.corrections ?? [])
        .filter((c) => c.before && c.after && c.before.trim() !== c.after.trim())
        .map((c) => ({ before: c.before!, after: c.after!, explanation: c.explanation ?? "" })),
      tips: (result.tips ?? []).filter(Boolean),
      new_words: (result.new_words ?? []).filter((w) => w.en && w.de).map((w) => ({ en: w.en!, de: w.de! })),
      encouragement: result.encouragement ?? "",
    });
  } catch (err) {
    return errorResponse(err);
  }
}
