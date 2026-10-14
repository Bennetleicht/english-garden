import { checkAccess, completeJSON, errorResponse, LEVEL_PROFILES } from "@/lib/ai";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

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

    const system = `You are an experienced, warm but HONEST English teacher correcting a text written by a German-speaking adult learner${
      body.name ? ` named ${body.name.toString().slice(0, 40)}` : ""
    }.
Learner level: ${LEVEL_PROFILES[level] ?? LEVEL_PROFILES[1]}
Writing task: "${task}".

Your job is to correct thoroughly, like a good teacher marking homework – not to flatter.
- Find EVERY real mistake: wrong tense or verb form (e.g. "I am eat", "yesterday I go"), wrong word or false friend (e.g. "become" for "bekommen/werden"), wrong prepositions, articles, plural, word order taken from German, wrong collocations ("make rainy", "very much delicious"), missing words. Do not skip mistakes to be nice. Each mistake is its own entry in "errors" (group only if it is literally the same mistake twice).
- Separately, list phrases that are grammatically correct but sound unnatural or could be said more elegantly in "improvements" (max 4).
- Be honest in "overall": one or two German sentences that clearly say how correct the text is (e.g. "Dein Text enthält noch einige grundlegende Fehler bei den Zeitformen …"). Do not call a text with many mistakes "sehr gut" or "fehlerfrei".
- "praise" names something that is GENUINELY good (ideas, vocabulary, courage, structure) – specific, short, never exaggerated.
- Write all explanations in German, addressing the learner with "du". Explanations are short and name the rule (e.g. "Bei 'this morning' (Vergangenheit) steht das Simple Past: ate.").
- No emojis, no childish tone.

Respond ONLY with a JSON object in exactly this shape:
{
 "overall": "honest German assessment, 1–2 sentences",
 "praise": "1 German sentence about what is genuinely good",
 "errors": [{"before": "exact original phrase", "after": "corrected phrase", "explanation": "short German rule"}],
 "improvements": [{"before": "correct but unnatural phrase", "after": "more natural phrase", "explanation": "short German reason"}],
 "corrected_text": "the full text with ALL errors corrected, keeping the learner's ideas and simple style",
 "tips": ["1–2 German tips for the next text, each with a concrete English example"],
 "new_words": [{"en": "useful English word or phrase", "de": "German translation"}],
 "encouragement": "one calm, motivating German closing sentence"
}
If there are no errors, "errors" is an empty array. "new_words": 2–4 items.`;

    type Item = { before?: string; after?: string; explanation?: string };
    const result = await completeJSON<{
      overall?: string;
      praise?: string;
      errors?: Item[];
      improvements?: Item[];
      corrections?: Item[];
      corrected_text?: string;
      tips?: string[];
      new_words?: { en?: string; de?: string }[];
      encouragement?: string;
    }>(
      [
        { role: "system", content: system },
        { role: "user", content: text },
      ],
      0.2,
    );

    const clean = (items: Item[] | undefined) =>
      (items ?? [])
        .filter((c) => c.before && c.after && c.before.trim() !== c.after.trim())
        .map((c) => ({ before: c.before!, after: c.after!, explanation: c.explanation ?? "" }));

    return Response.json({
      overall: result.overall ?? "",
      praise: result.praise ?? "",
      errors: clean(result.errors ?? result.corrections),
      improvements: clean(result.improvements),
      corrected_text: result.corrected_text ?? text,
      tips: (result.tips ?? []).filter(Boolean),
      new_words: (result.new_words ?? []).filter((w) => w.en && w.de).map((w) => ({ en: w.en!, de: w.de! })),
      encouragement: result.encouragement ?? "",
    });
  } catch (err) {
    return errorResponse(err);
  }
}
