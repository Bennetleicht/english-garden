"use client";

import { useEffect, useRef, useState } from "react";
import { Loader2, Square, Volume2 } from "lucide-react";
import { speak, stopSpeaking, ttsSupported } from "@/lib/speech";
import { useAppState } from "@/lib/storage";

export function SpeakButton({ text, label = "Vorlesen", className = "" }: { text: string; label?: string; className?: string }) {
  const state = useAppState();
  const [speaking, setSpeaking] = useState(false);
  const [loading, setLoading] = useState(false);
  const [supported, setSupported] = useState(false);
  const active = useRef(false);

  useEffect(() => setSupported(ttsSupported()), []);
  useEffect(
    () => () => {
      if (active.current) stopSpeaking();
    },
    [],
  );

  if (!supported) return null;

  const toggle = () => {
    if (speaking) {
      stopSpeaking();
      active.current = false;
      setSpeaking(false);
      setLoading(false);
      return;
    }
    active.current = true;
    setSpeaking(true);
    // Wichtig: sofort (ohne await) starten – sonst blockieren iPhone/iPad den Ton
    speak(text, {
      voice: state?.profile.voiceURI,
      rate: state?.profile.speechRate,
      onLoading: setLoading,
      onEnd: () => {
        active.current = false;
        setSpeaking(false);
        setLoading(false);
      },
    });
  };

  return (
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation();
        toggle();
      }}
      className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-sm text-sage-700 transition-colors hover:bg-sage-50 ${className}`}
      aria-label={speaking ? "Vorlesen beenden" : label || "Vorlesen"}
    >
      {loading ? (
        <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
      ) : speaking ? (
        <Square className="h-4 w-4" aria-hidden />
      ) : (
        <Volume2 className="h-4 w-4" aria-hidden />
      )}
      {label && <span>{speaking ? "Stopp" : label}</span>}
    </button>
  );
}
