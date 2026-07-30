import React, { useMemo } from "react";
import { motion } from "framer-motion";
import {
  Languages,
  Mic,
  Camera,
  Clipboard,
  Trash2,
  Sparkles,
  Type,
} from "lucide-react";

const MAX_CHARACTERS = 5000;

const TranslateInput = ({
  value = "",
  language = "English",
  placeholder = "Enter text to translate...",
  disabled = false,
  maxCharacters = MAX_CHARACTERS,
  onChange,
  onVoiceInput,
  onCameraInput,
  onPaste,
  onClear,
}) => {
  const characterCount = useMemo(
    () => value.length,
    [value]
  );

  const remaining = maxCharacters - characterCount;

  const handlePaste = async () => {
    if (onPaste) {
      onPaste();
      return;
    }

    try {
      const text = await navigator.clipboard.readText();

      onChange?.({
        target: {
          value: text,
        },
      });
    } catch (error) {
      console.error("Clipboard access denied.", error);
    }
  };

  return (
    <motion.section
      initial={{
        opacity: 0,
        y: 20,
      }}
      animate={{
        opacity: 1,
        y: 0,
      }}
      className="overflow-hidden rounded-3xl border border-white/10 bg-slate-900"
    >
      {/* Header */}

      <div className="flex items-center justify-between border-b border-white/10 bg-gradient-to-r from-cyan-600 via-blue-600 to-indigo-700 p-5">

        <div className="flex items-center gap-3">

          <div className="rounded-xl bg-white/10 p-3">
            <Languages
              size={24}
              className="text-white"
            />
          </div>

          <div>
            <h2 className="text-xl font-black text-white">
              Source Text
            </h2>

            <p className="text-sm text-cyan-100">
              {language}
            </p>
          </div>

        </div>

        <div className="rounded-full bg-white/10 px-4 py-2 text-sm font-semibold text-white">
          {characterCount}/{maxCharacters}
        </div>

      </div>

      {/* Input */}

      <div className="p-6">

        <textarea
          rows={10}
          value={value}
          disabled={disabled}
          placeholder={placeholder}
          onChange={onChange}
          className="min-h-[260px] w-full resize-none rounded-2xl border border-white/10 bg-black/20 p-5 text-lg text-white outline-none transition placeholder:text-slate-500 focus:border-cyan-500"
        />

        {/* Bottom */}

        <div className="mt-6 flex flex-wrap items-center justify-between gap-4">

          <div className="flex flex-wrap gap-3">

            <button
              onClick={handlePaste}
              className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-3 transition hover:bg-white/10"
            >
              <Clipboard size={18} />
              Paste
            </button>

            <button
              onClick={onVoiceInput}
              className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-3 transition hover:bg-white/10"
            >
              <Mic size={18} />
              Voice
            </button>

            <button
              onClick={onCameraInput}
              className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-3 transition hover:bg-white/10"
            >
              <Camera size={18} />
              Camera
            </button>

            <button
              onClick={onClear}
              className="flex items-center gap-2 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-red-300 transition hover:bg-red-500/20"
            >
              <Trash2 size={18} />
              Clear
            </button>

          </div>

          <div className="flex items-center gap-3">

            <Type
              size={18}
              className="text-cyan-400"
            />

            <span
              className={`text-sm font-semibold ${
                remaining < 200
                  ? "text-red-400"
                  : "text-slate-400"
              }`}
            >
              {remaining} characters remaining
            </span>

          </div>

        </div>

        <div className="mt-6 flex items-center gap-2 rounded-2xl bg-cyan-500/10 p-4 text-cyan-300">

          <Sparkles size={18} />

          <span className="text-sm">
            AI-powered translation supports grammar,
            punctuation, and contextual meaning.
          </span>

        </div>

      </div>

    </motion.section>
  );
};

export default TranslateInput;