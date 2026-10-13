"use client";

import { useEffect, useRef, useState } from "react";
import { Loader2, Mic, Square } from "lucide-react";
import { getStatus, postAudio } from "@/lib/api";
import { createRecognition, stopSpeaking, type RecognitionLike } from "@/lib/speech";

type Mode = "browser" | "upload" | "none";

/**
 * Mikrofon-Knopf. Bevorzugt die kostenlose Spracherkennung des Browsers (Chrome, Edge, Safari).
 * Gibt es die nicht (z. B. Firefox) und ist ein Groq-Schlüssel hinterlegt, wird die Aufnahme
 * an /api/transcribe (Whisper, kostenlos) geschickt.
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
  const [mode, setMode] = useState<Mode>("none");
  const [recording, setRecording] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const recognitionRef = useRef<RecognitionLike | null>(null);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const finalRef = useRef("");

  useEffect(() => {
    if (createRecognition()) {
      setMode("browser");
      return;
    }
    const canRecord = typeof window !== "undefined" && "MediaRecorder" in window && !!navigator.mediaDevices;
    if (!canRecord) return;
    void getStatus().then((s) => setMode(s.transcription ? "upload" : "none"));
  }, []);

  useEffect(
    () => () => {
      recognitionRef.current?.abort();
      recorderRef.current?.stream.getTracks().forEach((t) => t.stop());
    },
    [],
  );

  if (mode === "none") return null;

  const startBrowser = () => {
    const rec = createRecognition();
    if (!rec) return;
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
        setError("Bitte erlaube den Zugriff auf das Mikrofon (Symbol in der Adressleiste).");
      } else if (e.error !== "no-speech" && e.error !== "aborted") {
        setError("Die Spracherkennung hat gerade nicht geklappt. Bitte noch einmal versuchen.");
      }
    };
    rec.onend = () => {
      setRecording(false);
      const text = finalRef.current.trim();
      if (text) onText(text);
    };
    recognitionRef.current = rec;
    rec.start();
    setRecording(true);
  };

  const startUpload = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      const chunks: Blob[] = [];
      recorder.ondataavailable = (e) => e.data.size > 0 && chunks.push(e.data);
      recorder.onstop = async () => {
        stream.getTracks().forEach((t) => t.stop());
        setRecording(false);
        setBusy(true);
        try {
          const { text } = await postAudio("/api/transcribe", new Blob(chunks, { type: recorder.mimeType || "audio/webm" }));
          if (text) onText(text);
        } catch (err) {
          setError(err instanceof Error ? err.message : "Die Aufnahme konnte nicht verarbeitet werden.");
        } finally {
          setBusy(false);
        }
      };
      recorderRef.current = recorder;
      recorder.start();
      setRecording(true);
    } catch {
      setError("Bitte erlaube den Zugriff auf das Mikrofon.");
    }
  };

  const toggle = () => {
    setError("");
    if (recording) {
      recognitionRef.current?.stop();
      if (recorderRef.current?.state === "recording") recorderRef.current.stop();
      return;
    }
    stopSpeaking();
    if (mode === "browser") startBrowser();
    else void startUpload();
  };

  return (
    <div className="relative">
      <button
        type="button"
        onClick={toggle}
        disabled={disabled || busy}
        aria-label={recording ? "Aufnahme beenden" : "Sprechen"}
        title={recording ? "Aufnahme beenden" : "Auf Englisch sprechen"}
        className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-full transition-colors disabled:opacity-50 ${
          recording ? "animate-pulse bg-clay-400 text-white" : "bg-sage-100 text-sage-700 hover:bg-sage-200"
        }`}
      >
        {busy ? <Loader2 className="h-6 w-6 animate-spin" /> : recording ? <Square className="h-5 w-5" /> : <Mic className="h-6 w-6" />}
      </button>
      {error && (
        <p className="absolute bottom-full left-0 mb-2 w-64 rounded-lg bg-clay-50 px-3 py-2 text-sm text-clay-600 shadow-soft">{error}</p>
      )}
    </div>
  );
}
