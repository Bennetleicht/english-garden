import Link from "next/link";
import { Loader2 } from "lucide-react";
import type { ComponentProps, ReactNode } from "react";

export function PageHeader({ eyebrow, title, children }: { eyebrow?: string; title: string; children?: ReactNode }) {
  return (
    <header className="mb-8 animate-fadeIn">
      {eyebrow && <p className="mb-2 text-sm font-semibold uppercase tracking-[0.14em] text-sage-600">{eyebrow}</p>}
      <h1 className="font-serif text-3xl leading-tight text-navy-800 sm:text-4xl">{title}</h1>
      {children && <div className="mt-3 max-w-2xl text-lg leading-relaxed text-navy-600">{children}</div>}
    </header>
  );
}

export function Panel({ className = "", children }: { className?: string; children: ReactNode }) {
  return <section className={`rounded-2xl border border-cream-200 bg-white/80 p-6 shadow-soft sm:p-7 ${className}`}>{children}</section>;
}

type Variant = "primary" | "secondary" | "ghost" | "danger";

const variants: Record<Variant, string> = {
  primary: "bg-sage-600 text-white hover:bg-sage-700 disabled:bg-sage-300",
  secondary: "border border-cream-300 bg-white text-navy-700 hover:bg-cream-100 disabled:text-navy-500/50",
  ghost: "text-navy-600 hover:bg-cream-100 disabled:text-navy-500/40",
  danger: "border border-clay-100 bg-white text-clay-600 hover:bg-clay-50",
};

const base =
  "inline-flex items-center justify-center gap-2 rounded-xl px-5 py-3 text-base font-semibold transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-sage-400 focus-visible:ring-offset-2 disabled:cursor-not-allowed";

export function Button({ variant = "primary", className = "", ...props }: ComponentProps<"button"> & { variant?: Variant }) {
  return <button className={`${base} ${variants[variant]} ${className}`} {...props} />;
}

export function LinkButton({
  variant = "primary",
  className = "",
  ...props
}: ComponentProps<typeof Link> & { variant?: Variant }) {
  return <Link className={`${base} ${variants[variant]} ${className}`} {...props} />;
}

export function Loading({ label = "Einen Moment …" }: { label?: string }) {
  return (
    <div className="flex items-center gap-3 py-10 text-navy-500">
      <Loader2 className="h-5 w-5 animate-spin" aria-hidden />
      <span>{label}</span>
    </div>
  );
}

/** Wandelt **fett** in <strong> um – mehr Markup brauchen die Lektionen nicht. */
export function RichText({ text, className = "" }: { text: string; className?: string }) {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return (
    <span className={className}>
      {parts.map((part, i) =>
        part.startsWith("**") && part.endsWith("**") ? (
          <strong key={i} className="font-semibold text-navy-800">
            {part.slice(2, -2)}
          </strong>
        ) : (
          <span key={i}>{part}</span>
        ),
      )}
    </span>
  );
}

export function ProgressBar({ value, max, className = "" }: { value: number; max: number; className?: string }) {
  const pct = max > 0 ? Math.round((value / max) * 100) : 0;
  return (
    <div className={`h-2 w-full overflow-hidden rounded-full bg-cream-200 ${className}`} role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100}>
      <div className="h-full rounded-full bg-sage-500 transition-all duration-500" style={{ width: `${pct}%` }} />
    </div>
  );
}

export function ErrorNote({ message }: { message: string }) {
  return <p className="rounded-xl border border-clay-100 bg-clay-50 px-4 py-3 text-clay-600">{message}</p>;
}
