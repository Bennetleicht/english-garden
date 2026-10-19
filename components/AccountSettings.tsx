"use client";

import { useState } from "react";
import { KeyRound, Mail } from "lucide-react";
import { updateAccount, type Session } from "@/lib/sync";
import { Button, ErrorNote } from "./ui";

/** E-Mail hinterlegen/ändern und Passwort ändern – Teil der Einstellungen. */
export function AccountSettings({ session }: { session: Session }) {
  const [editEmail, setEditEmail] = useState(!session.email);
  const [email, setEmail] = useState(session.email ?? "");
  const [editPw, setEditPw] = useState(false);
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [ok, setOk] = useState("");

  const run = async (fn: () => Promise<void>, success: string) => {
    setBusy(true);
    setError("");
    setOk("");
    try {
      await fn();
      setOk(success);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Das hat nicht geklappt.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="mt-5 space-y-4 border-t border-cream-200 pt-5">
      {/* E-Mail */}
      {!editEmail ? (
        <div className="flex flex-wrap items-center gap-3">
          <Mail className="h-5 w-5 text-sage-600" />
          <span className="text-navy-700">{session.email}</span>
          <button type="button" className="text-sage-700 underline-offset-4 hover:underline" onClick={() => setEditEmail(true)}>
            ändern
          </button>
        </div>
      ) : (
        <form
          className="space-y-2"
          onSubmit={(e) => {
            e.preventDefault();
            void run(async () => {
              await updateAccount({ email });
              setEditEmail(false);
            }, "E-Mail-Adresse gespeichert. Ab jetzt meldest du dich damit an.");
          }}
        >
          <span className="block text-navy-600">
            {session.email ? "Neue E-Mail-Adresse" : "Hinterlege eine E-Mail-Adresse – damit meldest du dich künftig an:"}
          </span>
          <div className="flex flex-col gap-2 sm:flex-row">
            <input className="field" type="email" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" />
            <Button type="submit" variant="secondary" disabled={busy || !email.trim()}>
              Speichern
            </Button>
          </div>
        </form>
      )}

      {/* Passwort */}
      {!editPw ? (
        <button type="button" className="flex items-center gap-2 text-sage-700 underline-offset-4 hover:underline" onClick={() => setEditPw(true)}>
          <KeyRound className="h-4 w-4" /> Passwort ändern
        </button>
      ) : (
        <form
          className="grid gap-2 sm:grid-cols-2"
          onSubmit={(e) => {
            e.preventDefault();
            void run(async () => {
              await updateAccount({ currentPassword: current, newPassword: next });
              setEditPw(false);
              setCurrent("");
              setNext("");
            }, "Passwort geändert.");
          }}
        >
          <label className="block">
            <span className="mb-1 block text-navy-600">Bisheriges Passwort</span>
            <input className="field" type="password" value={current} onChange={(e) => setCurrent(e.target.value)} autoComplete="current-password" />
          </label>
          <label className="block">
            <span className="mb-1 block text-navy-600">Neues Passwort (mind. 6 Zeichen)</span>
            <input className="field" type="password" value={next} onChange={(e) => setNext(e.target.value)} autoComplete="new-password" />
          </label>
          <div className="flex gap-2 sm:col-span-2">
            <Button type="submit" variant="secondary" disabled={busy || !current || next.length < 6}>
              Passwort speichern
            </Button>
            <Button type="button" variant="ghost" onClick={() => setEditPw(false)}>
              Abbrechen
            </Button>
          </div>
        </form>
      )}

      {error && <ErrorNote message={error} />}
      {ok && <p className="text-sage-700">{ok}</p>}
    </div>
  );
}
