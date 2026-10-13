"use client";

import { useEffect, useRef, useState } from "react";
import { Download, Upload, Volume2 } from "lucide-react";
import { Button, Loading, PageHeader, Panel } from "@/components/ui";
import { getStatus, type ServerStatus } from "@/lib/api";
import { LEVELS } from "@/lib/content/levels";
import { today } from "@/lib/dates";
import { loadEnglishVoices, pickDefaultVoice, speak } from "@/lib/speech";
import { defaultState, exportState, replaceState, setProfile, useAppState } from "@/lib/storage";

export default function SettingsPage() {
  const state = useAppState();
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [status, setStatus] = useState<ServerStatus | null>(null);
  const [message, setMessage] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    void loadEnglishVoices().then(setVoices);
    void getStatus().then(setStatus);
  }, []);

  if (!state) return <Loading />;
  const { profile } = state;
  const currentVoice = voices.find((v) => v.voiceURI === profile.voiceURI) ?? pickDefaultVoice(voices);

  const download = () => {
    const blob = new Blob([exportState()], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `english-garden-sicherung-${today()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const upload = async (file: File) => {
    try {
      const data = JSON.parse(await file.text());
      if (!data || typeof data !== "object" || !("profile" in data)) throw new Error();
      if (!window.confirm("Den aktuellen Lernstand durch die Sicherung ersetzen?")) return;
      replaceState(data);
      setMessage("Sicherung erfolgreich geladen.");
    } catch {
      setMessage("Diese Datei ist leider keine gültige Sicherung.");
    }
  };

  return (
    <div>
      <PageHeader eyebrow="Einstellungen" title="Alles nach deinem Geschmack" />

      <div className="space-y-6">
        <Panel>
          <h2 className="font-serif text-xl text-navy-800">Über dich</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <label className="block">
              <span className="mb-1.5 block text-navy-600">Dein Name</span>
              <input className="field" value={profile.name} onChange={(e) => setProfile({ name: e.target.value })} />
            </label>
            <label className="block">
              <span className="mb-1.5 block text-navy-600">Deine Stufe</span>
              <select className="field" value={profile.level} onChange={(e) => setProfile({ level: Number(e.target.value) })}>
                {LEVELS.map((l) => (
                  <option key={l.id} value={l.id}>
                    {l.id}. {l.title} ({l.cefr})
                  </option>
                ))}
              </select>
            </label>
          </div>
        </Panel>

        <Panel>
          <h2 className="font-serif text-xl text-navy-800">Stimme zum Vorlesen</h2>
          {voices.length === 0 ? (
            <p className="mt-3 text-navy-600">Dieser Browser bietet keine englischen Stimmen an.</p>
          ) : (
            <>
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                <label className="block">
                  <span className="mb-1.5 block text-navy-600">Stimme</span>
                  <select className="field" value={currentVoice?.voiceURI ?? ""} onChange={(e) => setProfile({ voiceURI: e.target.value })}>
                    {voices.map((v) => (
                      <option key={v.voiceURI} value={v.voiceURI}>
                        {v.name} ({v.lang})
                      </option>
                    ))}
                  </select>
                </label>
                <label className="block">
                  <span className="mb-1.5 block text-navy-600">Sprechtempo: {Math.round(profile.speechRate * 100)} %</span>
                  <input
                    type="range"
                    min={0.6}
                    max={1.2}
                    step={0.02}
                    value={profile.speechRate}
                    onChange={(e) => setProfile({ speechRate: Number(e.target.value) })}
                    className="mt-3 w-full accent-sage-600"
                  />
                </label>
              </div>
              <div className="mt-4 flex flex-wrap items-center gap-4">
                <Button
                  variant="secondary"
                  onClick={() =>
                    void speak("Hello! It's lovely to hear from you. Shall we practise a little English today?", {
                      voiceURI: currentVoice?.voiceURI,
                      rate: profile.speechRate,
                    })
                  }
                >
                  <Volume2 className="h-4 w-4" /> Probe hören
                </Button>
                <label className="flex cursor-pointer items-center gap-3 text-navy-600">
                  <input
                    type="checkbox"
                    className="h-5 w-5 accent-sage-600"
                    checked={profile.autoSpeak}
                    onChange={(e) => setProfile({ autoSpeak: e.target.checked })}
                  />
                  Antworten im Gespräch automatisch vorlesen
                </label>
              </div>
              <p className="mt-3 text-sm text-navy-500">
                Tipp: Stimmen mit „Natural“, „Neural“ oder „Google“ im Namen klingen meist am natürlichsten.
              </p>
            </>
          )}
        </Panel>

        <Panel>
          <h2 className="font-serif text-xl text-navy-800">Datensicherung</h2>
          <p className="mt-2 text-navy-600">
            Dein Lernstand wird nur hier in diesem Browser gespeichert. Mit einer Sicherungsdatei kannst du ihn aufbewahren oder
            auf ein anderes Gerät (z. B. Tablet) übertragen.
          </p>
          <div className="mt-4 flex flex-wrap gap-3">
            <Button variant="secondary" onClick={download}>
              <Download className="h-4 w-4" /> Sicherung herunterladen
            </Button>
            <Button variant="secondary" onClick={() => fileRef.current?.click()}>
              <Upload className="h-4 w-4" /> Sicherung laden
            </Button>
            <input
              ref={fileRef}
              type="file"
              accept="application/json,.json"
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) void upload(f);
                e.target.value = "";
              }}
            />
          </div>
          {message && <p className="mt-3 text-sage-700">{message}</p>}
        </Panel>

        <Panel>
          <h2 className="font-serif text-xl text-navy-800">Technik</h2>
          <p className="mt-2 text-navy-600">
            KI-Sprachtrainer:{" "}
            {status === null ? "wird geprüft …" : status.ai ? `bereit (${status.provider === "gemini" ? "Google Gemini" : "Groq"}, kostenlos)` : "nicht eingerichtet"}
          </p>
          <Button
            variant="danger"
            className="mt-5"
            onClick={() => {
              if (window.confirm("Wirklich den gesamten Lernstand löschen? Das kann nicht rückgängig gemacht werden.")) {
                replaceState(defaultState());
              }
            }}
          >
            Lernstand zurücksetzen
          </Button>
        </Panel>
      </div>
    </div>
  );
}
