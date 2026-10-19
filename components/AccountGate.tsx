"use client";

import { usePathname } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";
import { Eye, EyeOff, Loader2, Sprout } from "lucide-react";
import { getStatus } from "@/lib/api";
import type { AppState } from "@/lib/state";
import { ping, signIn, startSync, unownedLocalProgress, useSession } from "@/lib/sync";
import { Button, ErrorNote } from "./ui";

/**
 * Sind Konten eingerichtet (Datenbank vorhanden), muss man sich einmal pro Gerät anmelden.
 * Ohne Datenbank läuft die App wie bisher rein lokal. Die Entwickler-Übersicht (/admin) hat ihren eigenen Schutz.
 */
export function AccountGate({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const session = useSession();
  const [enabled, setEnabled] = useState<boolean | null>(null);

  useEffect(() => {
    void getStatus().then((s) => setEnabled(Boolean(s.accounts)));
  }, []);

  useEffect(() => {
    if (enabled && session) startSync();
  }, [enabled, session]);

  // Besuch melden: bei jedem Seitenwechsel und jede Minute, solange die App sichtbar ist
  useEffect(() => {
    if (!enabled || !session || pathname.startsWith("/admin")) return;
    ping(pathname);
    const timer = setInterval(() => {
      if (document.visibilityState === "visible") ping(pathname);
    }, 60_000);
    return () => clearInterval(timer);
  }, [enabled, session, pathname]);

  if (pathname.startsWith("/admin")) return <>{children}</>;

  if (enabled === null || session === undefined) {
    return (
      <div className="flex min-h-screen items-center justify-center text-navy-500">
        <Loader2 className="h-6 w-6 animate-spin" aria-label="Lädt" />
      </div>
    );
  }
  if (enabled && !session) return <LoginScreen />;
  return <>{children}</>;
}

function progressSummary(s: AppState): string {
  const parts = [
    [Object.keys(s.lessons).length, "Lektion", "Lektionen"],
    [s.cards.length, "Vokabel", "Vokabeln"],
    [Object.keys(s.verbs).length, "geübtes Verb", "geübte Verben"],
    [s.activityDays.length, "Lerntag", "Lerntage"],
  ] as const;
  return parts
    .filter(([n]) => n > 0)
    .map(([n, one, many]) => `${n} ${n === 1 ? one : many}`)
    .join(", ");
}

function LoginScreen() {
  const [mode, setMode] = useState<"login" | "register">("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [password2, setPassword2] = useState("");
  const [show, setShow] = useState(false);
  const [takeLocal, setTakeLocal] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [forgot, setForgot] = useState(false);
  const [local] = useState(() => unownedLocalProgress());

  const switchMode = (m: "login" | "register") => {
    setMode(m);
    setError("");
    setPassword("");
    setPassword2("");
    setForgot(false);
  };

  const submit = async () => {
    setError("");
    if (mode === "register") {
      if (!name.trim()) return setError("Bitte gib deinen Vornamen ein.");
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email.trim())) return setError("Bitte gib eine gültige E-Mail-Adresse ein.");
      if (password.length < 6) return setError("Das Passwort muss mindestens 6 Zeichen lang sein.");
      if (password !== password2) return setError("Die beiden Passwörter stimmen nicht überein.");
    } else if (!email.trim() || !password) {
      return setError("Bitte gib E-Mail und Passwort ein.");
    }
    setBusy(true);
    try {
      await signIn({ mode, name: name.trim(), email: email.trim(), password, takeLocal });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Das hat nicht geklappt.");
    } finally {
      setBusy(false);
    }
  };

  const passwordInput = (value: string, onChange: (v: string) => void, autoComplete: string) => (
    <div className="relative">
      <input
        className="field pr-12"
        type={show ? "text" : "password"}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        autoComplete={autoComplete}
      />
      <button
        type="button"
        onClick={() => setShow((s) => !s)}
        className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-navy-500"
        aria-label={show ? "Passwort verbergen" : "Passwort anzeigen"}
      >
        {show ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
      </button>
    </div>
  );

  return (
    <div className="flex min-h-screen items-center justify-center px-5 py-12">
      <div className="w-full max-w-md animate-fadeIn">
        <div className="mb-8 text-center">
          <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-sage-100 text-sage-700">
            <Sprout className="h-7 w-7" aria-hidden />
          </span>
          <h1 className="mt-4 font-serif text-3xl text-navy-800">English Garden</h1>
          <p className="mt-2 text-lg text-navy-600">Dein ruhiger Ort zum Englischlernen.</p>
        </div>

        <div className="rounded-2xl border border-cream-200 bg-white/90 shadow-soft">
          <div className="grid grid-cols-2 border-b border-cream-200 text-center text-lg">
            {(["login", "register"] as const).map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => switchMode(m)}
                className={`py-4 font-semibold transition-colors ${
                  mode === m ? "border-b-2 border-sage-600 text-sage-800" : "text-navy-500 hover:text-navy-700"
                }`}
              >
                {m === "login" ? "Anmelden" : "Registrieren"}
              </button>
            ))}
          </div>

          <form
            className="space-y-4 p-6 sm:p-7"
            onSubmit={(e) => {
              e.preventDefault();
              void submit();
            }}
          >
            {mode === "register" && (
              <label className="block">
                <span className="mb-1.5 block text-navy-600">Dein Vorname</span>
                <input className="field" value={name} onChange={(e) => setName(e.target.value)} autoComplete="given-name" />
              </label>
            )}
            <label className="block">
              <span className="mb-1.5 block text-navy-600">E-Mail-Adresse</span>
              <input
                className="field"
                type="email"
                inputMode="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
                autoCapitalize="off"
              />
            </label>
            <label className="block">
              <span className="mb-1.5 block text-navy-600">{mode === "register" ? "Passwort (mind. 6 Zeichen)" : "Passwort"}</span>
              {passwordInput(password, setPassword, mode === "register" ? "new-password" : "current-password")}
            </label>
            {mode === "register" && (
              <label className="block">
                <span className="mb-1.5 block text-navy-600">Passwort wiederholen</span>
                {passwordInput(password2, setPassword2, "new-password")}
              </label>
            )}

            {local && (
              <label className="flex cursor-pointer gap-3 rounded-xl bg-cream-100 px-4 py-3 text-navy-700">
                <input type="checkbox" className="mt-1 h-5 w-5 shrink-0 accent-sage-600" checked={takeLocal} onChange={(e) => setTakeLocal(e.target.checked)} />
                <span>
                  Bisherigen Fortschritt auf diesem Gerät übernehmen
                  {local.profile.name ? ` (von ${local.profile.name})` : ""}: {progressSummary(local)}
                </span>
              </label>
            )}

            {error && <ErrorNote message={error} />}

            <Button type="submit" className="w-full" disabled={busy}>
              {busy && <Loader2 className="h-4 w-4 animate-spin" />}
              {mode === "login" ? "Anmelden" : "Konto erstellen"}
            </Button>

            {mode === "login" && (
              <div className="text-center">
                <button type="button" onClick={() => setForgot((f) => !f)} className="text-navy-500 underline-offset-4 hover:underline">
                  Passwort vergessen?
                </button>
                {forgot && (
                  <p className="mt-2 rounded-xl bg-cream-100 px-4 py-3 text-left text-navy-700">
                    Kein Problem: Sag der Person Bescheid, die dir die App eingerichtet hat. Sie kann dein Passwort in der
                    Verwaltung zurücksetzen – dein Fortschritt bleibt dabei erhalten.
                  </p>
                )}
              </div>
            )}
          </form>
        </div>

        <p className="mt-6 text-center text-navy-500">
          {mode === "login"
            ? "Noch kein Konto? Tippe oben auf „Registrieren“."
            : "Du registrierst dich nur einmal. Danach meldest du dich auf jedem Gerät mit E-Mail und Passwort an – dein Fortschritt ist überall gleich."}
        </p>
      </div>
    </div>
  );
}
