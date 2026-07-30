import React, { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import {
  Mic,
  MicOff,
  Volume2,
  Trash2,
  Copy,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";

const SpeechRecognition =
  window.SpeechRecognition || window.webkitSpeechRecognition;

const VoiceInput = ({
  language = "en-US",
  transcript = "",
  onTranscript,
  onStart,
  onStop,
  onError,
}) => {
  const recognitionRef = useRef(null);

  const [listening, setListening] = useState(false);
  const [supported] = useState(!!SpeechRecognition);

  useEffect(() => {
    if (!SpeechRecognition) return;

    const recognition = new SpeechRecognition();

    recognition.lang = language;
    recognition.continuous = true;
    recognition.interimResults = true;

    recognition.onresult = (event) => {
      let text = "";

      for (
        let i = event.resultIndex;
        i < event.results.length;
        i++
      ) {
        text += event.results[i][0].transcript;
      }

      onTranscript?.(text);
    };

    recognition.onstart = () => {
      setListening(true);
      onStart?.();
    };

    recognition.onend = () => {
      setListening(false);
      onStop?.();
    };

    recognition.onerror = (event) => {
      setListening(false);
      onError?.(event.error);
    };

    recognitionRef.current = recognition;

    return () => {
      recognition.stop();
    };
  }, [language, onTranscript, onStart, onStop, onError]);

  const startListening = () => {
    recognitionRef.current?.start();
  };

  const stopListening = () => {
    recognitionRef.current?.stop();
  };

  const clearTranscript = () => {
    onTranscript?.("");
  };

  const copyTranscript = async () => {
    if (!transcript) return;

    try {
      await navigator.clipboard.writeText(transcript);
    } catch (err) {
      console.error(err);
    }
  };

  if (!supported) {
    return (
      <div className="rounded-3xl border border-red-500/20 bg-red-500/10 p-6">
        <div className="flex items-center gap-3">

          <AlertCircle className="text-red-400" />

          <div>
            <h3 className="font-bold text-white">
              Voice Recognition Unsupported
            </h3>

            <p className="mt-1 text-sm text-slate-300">
              Your browser does not support the Web Speech API.
            </p>
          </div>

        </div>
      </div>
    );
  }

  return (
    <motion.section
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-3xl border border-white/10 bg-slate-900 p-6"
    >
      {/* Header */}

      <div className="flex items-center justify-between">

        <div>

          <h2 className="text-2xl font-black text-white">
            Voice Input
          </h2>

          <p className="mt-1 text-slate-400">
            Speak naturally and we'll convert it into text.
          </p>

        </div>

        <div
          className={`rounded-full px-4 py-2 text-sm font-semibold ${
            listening
              ? "bg-green-500/20 text-green-400"
              : "bg-white/10 text-slate-300"
          }`}
        >
          {listening ? "Listening..." : "Idle"}
        </div>

      </div>

      {/* Pulse */}

      <div className="my-10 flex justify-center">

        <motion.div
          animate={
            listening
              ? {
                  scale: [1, 1.2, 1],
                }
              : {}
          }
          transition={{
            repeat: Infinity,
            duration: 1,
          }}
          className={`flex h-28 w-28 items-center justify-center rounded-full ${
            listening
              ? "bg-red-500"
              : "bg-cyan-600"
          }`}
        >
          {listening ? (
            <Mic size={46} />
          ) : (
            <MicOff size={46} />
          )}
        </motion.div>

      </div>

      {/* Transcript */}

      <div className="rounded-2xl border border-white/10 bg-black/20 p-5">

        <p className="min-h-[140px] whitespace-pre-wrap text-slate-200">
          {transcript || "Your speech will appear here..."}
        </p>

      </div>

      {/* Controls */}

      <div className="mt-6 grid gap-3 md:grid-cols-4">

        <button
          onClick={startListening}
          disabled={listening}
          className="flex items-center justify-center gap-2 rounded-2xl bg-cyan-600 py-3 font-bold transition hover:bg-cyan-500 disabled:opacity-50"
        >
          <Mic size={18} />
          Start
        </button>

        <button
          onClick={stopListening}
          disabled={!listening}
          className="flex items-center justify-center gap-2 rounded-2xl bg-red-600 py-3 font-bold transition hover:bg-red-500 disabled:opacity-50"
        >
          <MicOff size={18} />
          Stop
        </button>

        <button
          onClick={copyTranscript}
          className="flex items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/5 py-3 hover:bg-white/10"
        >
          <Copy size={18} />
          Copy
        </button>

        <button
          onClick={clearTranscript}
          className="flex items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/5 py-3 hover:bg-white/10"
        >
          <Trash2 size={18} />
          Clear
        </button>

      </div>

      <div className="mt-6 flex items-center gap-2 text-sm text-green-400">
        <CheckCircle2 size={18} />
        Speech recognition uses your selected language.
      </div>
    </motion.section>
  );
};

export default VoiceInput;