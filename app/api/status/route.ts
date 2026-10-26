import { getChatProvider, hasTranscription } from "@/lib/ai";
import { accountsEnabled } from "@/lib/db";

export const dynamic = "force-dynamic";

export function GET() {
  const provider = getChatProvider();
  return Response.json({
    ai: Boolean(provider),
    provider: provider?.name ?? null,
    transcription: hasTranscription(),
    accounts: accountsEnabled(),
    tts: Boolean(process.env.GEMINI_API_KEY || process.env.GROQ_API_KEY),
  });
}
