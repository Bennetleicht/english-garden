"use client";

import { ArrowRight, CheckCircle2, Lightbulb, TriangleAlert } from "lucide-react";
import type { Block } from "@/lib/content/types";
import { SpeakButton } from "./SpeakButton";
import { RichText } from "./ui";

/** Stellt einen Erklärungsbaustein einer Grammatik-Lektion dar. */
export function LessonBlock({ block }: { block: Block }) {
  switch (block.kind) {
    case "text":
      return (
        <p className="max-w-3xl text-lg leading-relaxed text-navy-700">
          <RichText text={block.text} />
        </p>
      );

    case "rule":
      return (
        <div className="rounded-2xl border-l-4 border-sage-400 bg-white/80 px-6 py-5 shadow-soft">
          <h3 className="font-serif text-xl text-navy-800">{block.title}</h3>
          <p className="mt-2 text-lg leading-relaxed text-navy-700">
            <RichText text={block.text} />
          </p>
        </div>
      );

    case "examples":
      return (
        <div className="overflow-hidden rounded-2xl border border-cream-200 bg-white/80">
          <p className="border-b border-cream-200 bg-cream-100 px-6 py-2.5 text-sm font-semibold uppercase tracking-wider text-navy-500">
            {block.title ?? "Beispiele"}
          </p>
          <ul className="divide-y divide-cream-200">
            {block.items.map((ex) => (
              <li key={ex.en} className="flex flex-col gap-1 px-6 py-3.5 sm:flex-row sm:items-center sm:gap-4">
                <span className="flex-1 text-lg text-navy-800">{ex.en}</span>
                <span className="flex-1 text-navy-500">{ex.de}</span>
                <SpeakButton text={ex.en} label="Anhören" className="self-start sm:self-auto" />
              </li>
            ))}
          </ul>
        </div>
      );

    case "table":
      return (
        <div className="overflow-hidden rounded-2xl border border-cream-200 bg-white/80">
          {block.title && (
            <p className="border-b border-cream-200 bg-cream-100 px-6 py-2.5 text-sm font-semibold uppercase tracking-wider text-navy-500">
              {block.title}
            </p>
          )}
          <div className="overflow-x-auto">
            <table className="w-full min-w-[480px] text-left">
              <thead>
                <tr className="border-b border-cream-200 bg-sage-50">
                  {block.headers.map((h, i) => (
                    <th key={i} className="px-5 py-3 text-[15px] font-semibold text-sage-800">
                      <RichText text={h} />
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-cream-200">
                {block.rows.map((row, r) => (
                  <tr key={r}>
                    {row.map((cell, c) => (
                      <td key={c} className={`px-5 py-3 align-top ${c === 0 ? "font-semibold text-navy-800" : "text-navy-700"}`}>
                        <RichText text={cell} />
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      );

    case "mistakes":
      return (
        <div className="rounded-2xl border border-clay-100 bg-clay-50/60 px-6 py-5">
          <h3 className="flex items-center gap-2 font-serif text-xl text-navy-800">
            <TriangleAlert className="h-5 w-5 text-clay-400" aria-hidden /> Typische Fehler
          </h3>
          <ul className="mt-4 space-y-4">
            {block.items.map((m, i) => (
              <li key={i}>
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-lg">
                  <span className="text-navy-500 line-through decoration-clay-400/70">{m.wrong}</span>
                  <ArrowRight className="h-4 w-4 text-sage-500" aria-hidden />
                  <span className="font-semibold text-sage-800">{m.right}</span>
                </div>
                <p className="mt-0.5 text-navy-600">
                  <RichText text={m.note} />
                </p>
              </li>
            ))}
          </ul>
        </div>
      );

    case "tip":
      return (
        <div className="flex gap-3 rounded-2xl bg-cream-100 px-6 py-5">
          <Lightbulb className="mt-1 h-5 w-5 shrink-0 text-cream-400" aria-hidden />
          <p className="text-lg leading-relaxed text-navy-700">
            <RichText text={block.text} />
          </p>
        </div>
      );

    case "summary":
      return (
        <div className="rounded-2xl border border-sage-200 bg-sage-50 px-6 py-5">
          <h3 className="font-serif text-xl text-navy-800">Auf einen Blick</h3>
          <ul className="mt-3 space-y-2">
            {block.points.map((p, i) => (
              <li key={i} className="flex gap-2.5 text-lg text-navy-700">
                <CheckCircle2 className="mt-1 h-5 w-5 shrink-0 text-sage-500" aria-hidden />
                <RichText text={p} />
              </li>
            ))}
          </ul>
        </div>
      );
  }
}
