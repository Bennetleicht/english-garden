import { checkAccess, errorResponse } from "@/lib/ai";

export const dynamic = "force-dynamic";
export const maxDuration = 30;

/**
 * Sprache-zu-Text als Rückfalloption für Browser ohne eingebaute Spracherkennung (z. B. Firefox).
 * Nutzt das kostenlose Whisper-Modell bei Groq. In Chrome, Edge und Safari wird stattdessen
 * die kostenlose Spracherkennung des Browsers verwendet und diese Route gar nicht aufgerufen.
 */
export async function POST(req: Request) {
  const denied = checkAccess(req);
  if (denied) return denied;

  const key = process.env.GROQ_API_KEY;
  if (!key) {
    return Response.json(
      { error: "Spracherkennung ist in diesem Browser nicht verfügbar. Bitte Chrome, Edge oder Safari verwenden." },
      { status: 503 },
    );
  }

  try {
    const incoming = await req.formData();
    const file = incoming.get("file");
    if (!(file instanceof Blob) || file.size === 0) {
      return Response.json({ error: "Keine Aufnahme erhalten." }, { status: 400 });
    }
    if (file.size > 10 * 1024 * 1024) {
      return Response.json({ error: "Die Aufnahme ist zu lang. Bitte kürzer sprechen." }, { status: 413 });
    }

    // Dateiname mit passender Endung übernehmen (iPhone: mp4, Chrome: webm) – Whisper erkennt das Format daran
    const fileName = file instanceof File && file.name ? file.name : "aufnahme.webm";
    const send = (model: string) => {
      const form = new FormData();
      form.append("file", file, fileName);
      form.append("model", model);
      form.append("language", "en");
      form.append("response_format", "json");
      return fetch("https://api.groq.com/openai/v1/audio/transcriptions", {
        method: "POST",
        headers: { Authorization: `Bearer ${key}` },
        body: form,
      });
    };

    let res = await send("whisper-large-v3-turbo");
    // Falls das Turbo-Modell einmal abgeschaltet ist: normales Whisper versuchen
    if (res.status === 404 || res.status === 400) res = await send("whisper-large-v3");

    if (!res.ok) {
      console.error("[transcribe]", res.status, await res.text().catch(() => ""));
      return Response.json({ error: "Die Aufnahme konnte nicht verstanden werden. Bitte noch einmal versuchen." }, { status: 502 });
    }
    const data = (await res.json()) as { text?: string };
    return Response.json({ text: (data.text ?? "").trim() });
  } catch (err) {
    return errorResponse(err);
  }
}
