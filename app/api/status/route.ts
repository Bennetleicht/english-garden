import { getChatProvider, hasTranscription } from "@/lib/ai";

export const dynamic = "force-dynamic";

export function GET() {
  const provider = getChatProvider();
  return Response.json({
    ai: Boolean(provider),
    provider: provider?.name ?? null,
    transcription: hasTranscription(),
  });
}
