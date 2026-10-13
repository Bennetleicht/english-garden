"use client";

import { useEffect, useState, type ReactNode } from "react";
import { Eye, EyeOff, Loader2, Sprout, UserRound } from "lucide-react";
import { getStatus, request } from "@/lib/api";
import { signIn, startSync, unownedLocalProgress, useSession } from "@/lib/sync";
import { Button, ErrorNote } from "./ui";

/**
 * Sind Konten eingerichtet (Datenbank vorhanden), muss man sich einmal pro Gerät anmelden.
 * Ohne Datenbank läuft die App wie bisher rein lokal.
 */
export function AccountGate({ children }: { children: ReactNode }) {
  const session = useSession();
  const [enabled, setEnabled] = useState<boolean | null>(null);

  useEffect(() => {
    void getStatus().then((s) => setEnabled(Boolean(s.accounts)));
  }, []);

  useEffect(() => {
    if (enabled && session) startSync();
  }, [enabled, session]);

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

function LoginScreen() {
  const [accounts, setAccounts] = useState<string[] | null>(null);
  const [mode, setMode] = useState<"login" | "register">("login");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [password2, setPassword2] = useState("");
  const [show, setShow] = useState(false);
  const [takeLocal, setTakeLocal] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [local] = useState(() => unownedLocalProgress());

  useEffect(() => {
    void request("/api/account", {})
      .then((r) => r.json() as Promise<{ accounts?: string[] }>)
      .then((d) => {
        const list = d.accounts ?? [];
        setAccounts(list);
        if (list.length === 0) setMode("register");
      })
      .catch(() => setAccounts([]));
  }, []);

  // Fortschritt ohne Konto vorschlagen, wenn der eingegebene Name dazu passt
  useEffect(() => {
    if (local) setTakeLocal(!name.trim() || local.profile.name.trim().toLowerCase() === name.trim().toLowerCase());
  }, [name, local]);

  const submit = async () => {
    setError("");
    if (!name.trim()) return setError("Bitte gib deinen Namen ein.");
    if (password.length < 4) return setError("Das Passwort muss mindestens 4 Zeichen lang sein.");
    if (mode === "register" && password !== password2) return setError("Die beiden Passwörter stimmen nicht überein.");
    setBusy(true);
    try {
      await signIn({ mode, name: name.trim(), password, takeLocal });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Das hat nicht geklappt.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center px-5 py-12">
      <div className="w-full max-w-md animate-fadeIn">
        <div className="mb-8 text-center">
          <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-sage-100 text-sage-700">
            <Sprout className="h-7 w-7" aria-hidden />
          </span>
          <h1 className="mt-4 font-serif text-3xl text-navy-800">English Garden</h1>
          <p className="mt-2 text-lg text-navy-600">{mode === "login" ? "Wer lernt heute?" : "Ein eigenes Konto anlegen"}</p>
        </div>

        <div className="rounded-2xl border border-cream-200 bg-white/90 p-6 shadow-soft sm:p-7">
          {mode === "login" && accounts && accounts.length > 0 && (
            <div className="mb-5 grid gap-2">
              {accounts.map((a) => (
                <button
                  key={a}
                  type="button"
                  onClick={() => {
                    setName(a);
                    setError("");
                  }}
                  className={`flex items-center gap-3 rounded-xl border px-4 py-3 text-left text-lg transition-colors ${
                    name === a ? "border-sage-400 bg-sage-50 text-sage-800" : "border-cream-300 hover:border-sage-300"
                  }`}
                >
                  <UserRound className="h-5 w-5 text-sage-600" aria-hidden /> {a}
                </button>
              ))}
            </div>
          )}

          <form
            className="space-y-3"
            onSubmit={(e) => {
              e.preventDefault();
              void submit();
            }}
          >
            {(mode === "register" || !accounts || accounts.length === 0) && (
              <label className="block">
                <span className="mb-1.5 block text-navy-600">Dein Vorname</span>
                <input className="field" value={name} onChange={(e) => setName(e.target.value)} autoComplete="username" autoFocus />
              </label>
            )}
            {mode === "login" && accounts && accounts.length > 0 && !name && (
              <p className="text-navy-500">Tippe oben auf deinen Namen.</p>
            )}
            {(mode === "register" || name) && (
              <>
                <label className="block">
                  <span className="mb-1.5 block text-navy-600">{mode === "register" ? "Wähle ein Passwort" : "Dein Passwort"}</span>
                  <div className="relative">
                    <input
                      className="field pr-12"
                      type={show ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      autoComplete={mode === "register" ? "new-password" : "current-password"}
                      autoFocus={mode === "login"}
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
                </label>
                {mode === "register" && (
                  <label className="block">
                    <span className="mb-1.5 block text-navy-600">Passwort wiederholen</span>
                    <input className="field" type={show ? "text" : "password"} value={password2} onChange={(e) => setPassword2(e.target.value)} autoComplete="new-password" />
                  </label>
                )}
              </>
            )}

            {local && (mode === "register" || name) && (
              <label className="flex cursor-pointer gap-3 rounded-xl bg-cream-100 px-4 py-3 text-navy-700">
                <input type="checkbox" className="mt-1 h-5 w-5 shrink-0 accent-sage-600" checked={takeLocal} onChange={(e) => setTakeLocal(e.target.checked)} />
                <span>
                  Bisherigen Fortschritt auf diesem Gerät übernehmen
                  {local.profile.name ? ` (von ${local.profile.name})` : ""}: {Object.keys(local.lessons).length} Lektionen, {local.cards.length} Vokabeln
                </span>
              </label>
            )}

            {error && <ErrorNote message={error} />}

            <Button type="submit" className="w-full" disabled={busy || (mode === "login" && !name)}>
              {busy && <Loader2 className="h-4 w-4 animate-spin" />}
              {mode === "login" ? "Anmelden" : "Konto anlegen"}
            </Button>
          </form>

          <p className="mt-5 text-center text-navy-600">
            {mode === "login" ? (
              <button type="button" className="font-semibold text-sage-700 underline-offset-4 hover:underline" onClick={() => { setMode("register"); setName(""); setError(""); }}>
                Neues Konto anlegen
              </button>
            ) : (
              accounts &&
              accounts.length > 0 && (
                <button type="button" className="font-semibold text-sage-700 underline-offset-4 hover:underline" onClick={() => { setMode("login"); setName(""); setError(""); }}>
                  Ich habe schon ein Konto
                </button>
              )
            )}
          </p>
        </div>

        <p className="mt-6 text-center text-navy-500">
          Du musst dich nur einmal pro Gerät anmelden. Dein Fortschritt ist dann auf Handy, Tablet und Computer gleich.
        </p>
      </div>
    </div>
  );
}
