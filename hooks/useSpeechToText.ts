"use client";

import { useCallback, useEffect, useRef, useState } from "react";

function getRecognitionCtor(): SpeechRecognitionConstructor | null {
  if (typeof window === "undefined") return null;
  return window.SpeechRecognition ?? window.webkitSpeechRecognition ?? null;
}

/** Trình duyệt có Web Speech API (thường Chrome, Edge — HTTPS hoặc localhost). */
export function speechRecognitionSupported(): boolean {
  return !!getRecognitionCtor();
}

export type SpeechToTextChunkHandler = (text: string) => void;

type StartOpts = {
  lang?: string;
  continuous?: boolean;
  onChunk: SpeechToTextChunkHandler;
};

/**
 * Thu âm thoại → text (Recognition). Một phiên chỉ một instance.
 */
export function useSpeechToText() {
  const recRef = useRef<SpeechRecognition | null>(null);
  const [listening, setListening] = useState(false);

  const stop = useCallback(() => {
    const r = recRef.current;
    recRef.current = null;
    if (!r) {
      setListening(false);
      return;
    }
    try {
      r.stop();
    } catch {
      try {
        r.abort();
      } catch {
        /* ignore */
      }
    }
    setListening(false);
  }, []);

  const start = useCallback(
    ({
      lang = "vi-VN",
      continuous = false,
      onChunk,
    }: StartOpts): boolean => {
      const Ctor = getRecognitionCtor();
      if (!Ctor) return false;

      if (recRef.current) {
        try {
          recRef.current.abort();
        } catch {
          /* ignore */
        }
        recRef.current = null;
      }

      const rec = new Ctor();
      rec.lang = lang;
      rec.continuous = continuous;
      rec.interimResults = false;

      rec.onresult = (event: SpeechRecognitionEvent) => {
        let chunk = "";
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const row = event.results[i];
          if (row?.isFinal) chunk += row[0]?.transcript ?? "";
        }
        const t = chunk.trim();
        if (t) onChunk(t);
      };

      rec.onerror = () => {
        recRef.current = null;
        setListening(false);
      };

      rec.onend = () => {
        recRef.current = null;
        setListening(false);
      };

      recRef.current = rec;
      try {
        rec.start();
        setListening(true);
        return true;
      } catch {
        recRef.current = null;
        setListening(false);
        return false;
      }
    },
    [],
  );

  useEffect(() => {
    return () => {
      const r = recRef.current;
      recRef.current = null;
      if (!r) return;
      try {
        r.abort();
      } catch {
        try {
          r.stop();
        } catch {
          /* ignore */
        }
      }
    };
  }, []);

  return { start, stop, listening };
}
