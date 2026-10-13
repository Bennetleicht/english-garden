"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowLeft } from "lucide-react";
import { Reviewer } from "@/components/Reviewer";
import { LinkButton, Loading, PageHeader, Panel } from "@/components/ui";
import { buildSession } from "@/lib/srs";
import { useAppState, type Card } from "@/lib/storage";

export default function LearnPage() {
  const state = useAppState();
  // Die Sitzung wird einmalig beim Öffnen zusammengestellt.
  const [session, setSession] = useState<Card[] | null>(null);

  useEffect(() => {
    if (state && session === null) setSession(buildSession(state.cards));
  }, [state, session]);

  if (!state || session === null) return <Loading />;

  return (
    <div>
      <Link href="/vokabeln" className="mb-6 inline-flex items-center gap-2 text-navy-500 hover:text-navy-700">
        <ArrowLeft className="h-4 w-4" /> Vokabelkasten
      </Link>
      <PageHeader eyebrow="Vokabeln" title="Heutige Wiederholung" />

      {session.length === 0 ? (
        <Panel>
          <p className="text-lg text-navy-700">Gerade ist keine Karte fällig. Die nächsten Wiederholungen warten morgen auf dich.</p>
          <LinkButton href="/vokabeln" variant="secondary" className="mt-5">
            Zum Vokabelkasten
          </LinkButton>
        </Panel>
      ) : (
        <Reviewer initialCards={session} />
      )}
    </div>
  );
}
