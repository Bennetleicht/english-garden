"use client";

import { useEffect, useState } from "react";
import { Square, Volume2 } from "lucide-react";
import { speak, stopSpeaking, ttsSupported } from "@/lib/speech";
import { useAppState } from "@/lib/storage";

export function SpeakButton({ text, label = "Vorlesen", className = "" }: { text: string; label?: string; className?: string }) {
  const state = useAppState();
  const [speaking, setSpeaking] = useState(false);
  const [supported, setSupported] = useState(false);

  useEffect(() => setSupported(ttsSupported()), []);
  useEffect(() => () => stopSpeaking(), []);

  if (!supported) return null;

  const toggle = () => {
    if (speaking) {
      stopSpeaking();
      setSpeaking(false);
      return;
    }
    setSpeaking(true);
    void speak(text, {
      voiceURI: state?.profile.voiceURI,
      rate: state?.profile.speechRate,
      onEnd: () => setSpeaking(false),
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
      {speaking ? <Square className="h-4 w-4" aria-hidden /> : <Volume2 className="h-4 w-4" aria-hidden />}
      {label && <span>{speaking ? "Stopp" : label}</span>}
    </button>
  );
}
