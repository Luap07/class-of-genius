import React, { useRef } from "react";
import { motion } from "framer-motion";
import {
  Send,
  Mic,
  Paperclip,
  Sparkles,
  Trash2,
  Loader2,
} from "lucide-react";

const AIInput = ({
  value = "",
  loading = false,
  placeholder = "Ask anything about languages...",
  disabled = false,
  onChange,
  onSend,
  onVoice,
  onAttach,
  onClear,
}) => {
  const fileInputRef = useRef(null);

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!value.trim() || loading) return;

    onSend?.(value.trim());
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];

    if (!file) return;

    onAttach?.(file);

    e.target.value = "";
  };

  return (
    <motion.form
      initial={{
        opacity: 0,
        y: 15,
      }}
      animate={{
        opacity: 1,
        y: 0,
      }}
      onSubmit={handleSubmit}
      className="rounded-3xl border border-white/10 bg-slate-900 p-6"
    >
      {/* Input */}

      <div className="relative">

        <textarea
          rows={5}
          value={value}
          disabled={disabled || loading}
          placeholder={placeholder}
          onChange={(e) => onChange?.(e.target.value)}
          className="w-full resize-none rounded-2xl border border-white/10 bg-black/20 p-5 pr-16 text-white outline-none transition placeholder:text-slate-500 focus:border-cyan-500"
        />

        <button
          type="button"
          onClick={onVoice}
          className="absolute bottom-4 right-4 rounded-xl bg-cyan-600 p-3 transition hover:bg-cyan-500"
        >
          <Mic size={18} />
        </button>

      </div>

      {/* Actions */}

      <div className="mt-6 flex flex-wrap items-center justify-between gap-4">

        <div className="flex flex-wrap gap-3">

          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-3 transition hover:bg-white/10"
          >
            <Paperclip size={18} />
            Attach
          </button>

          <input
            ref={fileInputRef}
            type="file"
            hidden
            onChange={handleFileChange}
          />

          <button
            type="button"
            onClick={onClear}
            className="flex items-center gap-2 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-red-300 transition hover:bg-red-500/20"
          >
            <Trash2 size={18} />
            Clear
          </button>

        </div>

        <button
          type="submit"
          disabled={loading || !value.trim()}
          className="flex items-center gap-3 rounded-2xl bg-gradient-to-r from-cyan-600 to-blue-600 px-8 py-4 font-bold transition hover:scale-105 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading ? (
            <>
              <Loader2
                size={20}
                className="animate-spin"
              />
              Thinking...
            </>
          ) : (
            <>
              <Send size={20} />
              Send
            </>
          )}
        </button>

      </div>

      {/* Footer */}

      <div className="mt-6 flex items-center gap-3 rounded-2xl bg-cyan-500/10 p-4 text-cyan-300">

        <Sparkles size={18} />

        <p className="text-sm">
          Ask for grammar explanations, translations,
          pronunciation help, vocabulary, writing feedback,
          quizzes, or conversation practice.
        </p>

      </div>
    </motion.form>
  );
};

export default AIInput;