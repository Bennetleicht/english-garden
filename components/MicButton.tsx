"use client";

import { useEffect, useRef, useState } from "react";
import { Loader2, Mic, Square, X } from "lucide-react";
import { getStatus, postAudio } from "@/lib/api";
import { createRecognition, stopSpeaking, type RecognitionLike } from "@/lib/speech";

/** Längste Aufnahme – danach wird automatisch beendet. */
const MAX_RECORDING_MS = 90_000;

type Engine = "whisper" | "browser";

/**
 * Mikrofon-Knopf.
 *
 * 1. Fragt beim Tippen immer zuerst ausdrücklich nach dem Mikrofon (getUserMedia) – so erscheint die
 *    Erlaubnis-Abfrage des Browsers zuverlässig, auch dort, wo die Browser-Spracherkennung still scheitert.
 * 2. Erkennung bevorzugt über Whisper bei Groq (kostenlos, funktioniert in jedem Browser, versteht Akzente gut).
 *    Ohne Groq-Schlüssel wird die eingebaute Spracherkennung des Browsers genutzt.
 */
export function MicButton({
  onText,
  onInterim,
  disabled,
}: {
  onText: (text: string) => void;
  onInterim?: (text: string) => void;
  disabled?: boolean;
}) {
  const [supported, setSupported] = useState(false);
  const [whisper, setWhisper] = useState(false);
  const [recording, setRecording] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const streamRef = useRef<MediaStream | null>(null);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const recognitionRef = useRef<RecognitionLike | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const finalRef = useRef("");

  useEffect(() => {
    const canRecord = typeof navigator !== "undefined" && !!navigator.mediaDevices?.getUserMedia;
    setSupported(canRecord || !!createRecognition());
    void getStatus().then((s) => setWhisper(s.transcription && canRecord && typeof MediaRecorder !== "undefined"));
  }, []);

  const releaseMic = () => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = null;
  };

  useEffect(
    () => () => {
      recognitionRef.current?.abort();
      if (recorderRef.current?.state === "recording") recorderRef.current.stop();
      releaseMic();
    },
    [],
  );

  if (!supported) return null;

  /* ---------- Mikrofon-Erlaubnis ---------- */

  const requestMic = async (): Promise<MediaStream | null> => {
    if (!navigator.mediaDevices?.getUserMedia) return null;
    try {
      return await navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: true, noiseSuppression: true } });
    } catch (err) {
      const name = err instanceof DOMException ? err.name : "";
      if (name === "NotAllowedError" || name === "SecurityError") {
        setError(
          "Das Mikrofon ist für diese Seite gesperrt. So erlaubst du es: Am Computer auf das Schloss-Symbol links in der Adressleiste tippen → Mikrofon → Zulassen. Auf dem iPhone: Einstellungen → Safari → Mikrofon → Fragen oder Erlauben. Danach die Seite neu laden.",
        );
      } else if (name === "NotFoundError") {
        setError("Es wurde kein Mikrofon gefunden. Ist eins angeschlossen bzw. eingeschaltet?");
      } else if (name === "NotReadableError") {
        setError("Das Mikrofon wird gerade von einer anderen App benutzt (z. B. einem Videoanruf). Bitte diese schließen.");
      } else {
        setError("Auf das Mikrofon konnte nicht zugegriffen werden. Bitte die Seite neu laden und noch einmal versuchen.");
      }
      return null;
    }
  };

  /* ---------- Whisper (Aufnahme hochladen) ---------- */

  const startWhisper = (stream: MediaStream) => {
    const preferred = ["audio/webm;codecs=opus", "audio/webm", "audio/mp4", "audio/ogg"];
    const mimeType = preferred.find((t) => typeof MediaRecorder.isTypeSupported === "function" && MediaRecorder.isTypeSupported(t));
    const recorder = mimeType ? new MediaRecorder(stream, { mimeType }) : new MediaRecorder(stream);
    const chunks: Blob[] = [];
    recorder.ondataavailable = (e) => {
      if (e.data.size > 0) chunks.push(e.data);
    };
    recorder.onstop = async () => {
      releaseMic();
      setRecording(false);
      const blob = new Blob(chunks, { type: recorder.mimeType || mimeType || "audio/webm" });
      if (blob.size < 1000) {
        setError("Es wurde nichts aufgenommen. Tippe aufs Mikrofon, sprich und tippe dann noch einmal zum Beenden.");
        return;
      }
      setBusy(true);
      try {
        const { text } = await postAudio("/api/transcribe", blob);
        if (text) onText(text);
        else setError("Ich habe leider nichts verstanden. Bitte noch einmal etwas lauter sprechen.");
      } catch (err) {
        setError(err instanceof Error ? err.message : "Die Aufnahme konnte nicht verarbeitet werden.");
      } finally {
        setBusy(false);
      }
    };
    recorderRef.current = recorder;
    recorder.start();
    setRecording(true);
    timerRef.current = setTimeout(() => {
      if (recorder.state === "recording") recorder.stop();
    }, MAX_RECORDING_MS);
  };

  /* ---------- Spracherkennung des Browsers ---------- */

  const startBrowser = (stream: MediaStream | null) => {
    const rec = createRecognition();
    if (!rec) {
      releaseMic();
      setError("Dieser Browser hat keine Spracherkennung. Bitte Chrome, Edge oder Safari verwenden.");
      return;
    }
    // Die Erlaubnis ist erteilt – das Mikrofon übernimmt jetzt die Spracherkennung selbst.
    stream?.getTracks().forEach((t) => t.stop());
    rec.lang = "en-US";
    rec.interimResults = true;
    rec.continuous = true;
    rec.maxAlternatives = 1;
    finalRef.current = "";

    rec.onresult = (e) => {
      let interim = "";
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const result = e.results[i];
        const transcript = result[0]?.transcript ?? "";
        if (result.isFinal) finalRef.current += transcript + " ";
        else interim += transcript;
      }
      onInterim?.((finalRef.current + interim).trim());
    };
    rec.onerror = (e) => {
      if (e.error === "not-allowed" || e.error === "service-not-allowed") {
        setError(
          "Die Spracherkennung ist auf diesem Gerät ausgeschaltet. Auf dem iPhone/iPad: Einstellungen → Allgemein → Tastatur → Diktierfunktion einschalten. Alternativ kannst du deine Antwort tippen.",
        );
      } else if (e.error === "network") {
        setError("Die Spracherkennung dieses Browsers funktioniert gerade nicht. Bitte tippe deine Antwort oder nutze Chrome, Edge oder Safari.");
      } else if (e.error !== "no-speech" && e.error !== "aborted") {
        setError("Die Spracherkennung hat gerade nicht geklappt. Bitte noch einmal versuchen.");
      }
    };
    rec.onend = () => {
      setRecording(false);
      if (timerRef.current) clearTimeout(timerRef.current);
      const text = finalRef.current.trim();
      if (text) onText(text);
    };
    recognitionRef.current = rec;
    try {
      rec.start();
      setRecording(true);
      timerRef.current = setTimeout(() => rec.stop(), MAX_RECORDING_MS);
    } catch {
      setError("Die Spracherkennung konnte nicht gestartet werden. Bitte die Seite neu laden.");
    }
  };

  /* ---------- Knopf ---------- */

  const toggle = async () => {
    setError("");
    if (recording) {
      recognitionRef.current?.stop();
      if (recorderRef.current?.state === "recording") recorderRef.current.stop();
      return;
    }
    stopSpeaking();
    setBusy(true);
    const stream = await requestMic();
    setBusy(false);
    // Ohne Mikrofon-Erlaubnis geht es nur weiter, wenn der Browser gar kein getUserMedia hat (dann fragt die Spracherkennung selbst)
    const hasGetUserMedia = typeof navigator.mediaDevices?.getUserMedia === "function";
    if (!stream && hasGetUserMedia) return;

    const engine: Engine = whisper && stream ? "whisper" : "browser";
    if (engine === "whisper" && stream) {
      streamRef.current = stream;
      startWhisper(stream);
    } else {
      startBrowser(stream);
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={() => void toggle()}
        disabled={disabled || busy}
        aria-label={recording ? "Aufnahme beenden" : "Sprechen"}
        title={recording ? "Aufnahme beenden" : "Auf Englisch sprechen"}
        className={`relative flex h-14 w-14 shrink-0 items-center justify-center rounded-full transition-colors disabled:opacity-50 ${
          recording ? "bg-clay-400 text-white" : "bg-sage-100 text-sage-700 hover:bg-sage-200"
        }`}
      >
        {recording && <span className="absolute inset-0 animate-ping rounded-full bg-clay-400/40" aria-hidden />}
        {busy ? <Loader2 className="h-6 w-6 animate-spin" /> : recording ? <Square className="relative h-5 w-5" /> : <Mic className="h-6 w-6" />}
      </button>

      {recording && (
        <span className="pointer-events-none fixed inset-x-4 bottom-36 z-30 mx-auto max-w-sm rounded-xl bg-navy-800/90 px-4 py-2.5 text-center text-white shadow-soft lg:bottom-24">
          Ich höre zu … Tippe noch einmal auf den Knopf, wenn du fertig bist.
        </span>
      )}

      {error && (
        <div
          role="alert"
          className="fixed inset-x-4 bottom-36 z-30 mx-auto flex max-w-md gap-3 rounded-xl border border-clay-100 bg-white px-4 py-3 text-navy-700 shadow-soft lg:bottom-24"
        >
          <p className="flex-1 text-[15px]">{error}</p>
          <button type="button" onClick={() => setError("")} aria-label="Hinweis schließen" className="self-start text-navy-500">
            <X className="h-5 w-5" />
          </button>
        </div>
      )}
    </>
  );
}
