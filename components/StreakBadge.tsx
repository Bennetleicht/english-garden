"use client";

import { Leaf } from "lucide-react";
import { computeStreak } from "@/lib/dates";
import { useAppState } from "@/lib/storage";

/** Dezenter Tageszähler – ohne Druck, ohne Alarm. */
export function StreakBadge({ compact = false }: { compact?: boolean }) {
  const state = useAppState();
  if (!state) return null;
  const { count, learnedToday } = computeStreak(state.activityDays);
  if (count === 0) return compact ? null : <p className="px-4 text-sm text-navy-500">Schön, dass du da bist.</p>;

  if (compact) {
    return (
      <span className="flex items-center gap-1.5 rounded-full bg-sage-100 px-3 py-1 text-sm text-sage-800" title="Lerntage in Folge">
        <Leaf className="h-4 w-4" aria-hidden />
        {count}
      </span>
    );
  }

  return (
    <div className="rounded-xl bg-sage-50 px-4 py-3">
      <p className="flex items-center gap-2 text-[15px] font-semibold text-sage-800">
        <Leaf className="h-4 w-4" aria-hidden />
        Tag {count} in Folge
      </p>
      <p className="mt-0.5 text-sm text-navy-500">{learnedToday ? "Heute schon gelernt." : "Schön, dass du wieder da bist."}</p>
    </div>
  );
}
