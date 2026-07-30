import React from "react";
import { motion } from "framer-motion";
import {
  Languages,
  Volume2,
  Copy,
  Share2,
  Bookmark,
  Check,
  Loader2,
  Sparkles,
} from "lucide-react";

const TranslateOutput = ({
  value = "",
  language = "French",
  loading = false,
  copied = false,
  onSpeak,
  onCopy,
  onShare,
  onSave,
}) => {
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

      <div className="flex items-center justify-between border-b border-white/10 bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-700 p-5">

        <div className="flex items-center gap-3">

          <div className="rounded-xl bg-white/10 p-3">
            <Languages
              size={24}
              className="text-white"
            />
          </div>

          <div>
            <h2 className="text-xl font-black text-white">
              Translation
            </h2>

            <p className="text-sm text-cyan-100">
              {language}
            </p>
          </div>

        </div>

        {loading && (
          <div className="flex items-center gap-2 text-white">

            <Loader2
              size={18}
              className="animate-spin"
            />

            Translating...

          </div>
        )}

      </div>

      {/* Body */}

      <div className="p-6">

        <div className="min-h-[260px] rounded-2xl border border-white/10 bg-black/20 p-5">

          {loading ? (

            <div className="flex h-full min-h-[220px] flex-col items-center justify-center">

              <Loader2
                size={42}
                className="animate-spin text-cyan-400"
              />

              <p className="mt-5 text-slate-400">
                AI is translating your text...
              </p>

            </div>

          ) : value ? (

            <p className="whitespace-pre-wrap text-lg leading-9 text-white">
              {value}
            </p>

          ) : (

            <div className="flex h-full min-h-[220px] flex-col items-center justify-center text-center">

              <Sparkles
                size={48}
                className="text-slate-600"
              />

              <h3 className="mt-5 text-xl font-bold text-white">
                No Translation Yet
              </h3>

              <p className="mt-3 max-w-md text-slate-400">
                Enter text in the source panel and start translating.
              </p>

            </div>

          )}

        </div>

        {/* Actions */}

        <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">

          <button
            onClick={onSpeak}
            disabled={!value}
            className="flex items-center justify-center gap-2 rounded-2xl bg-cyan-600 py-3 font-bold transition hover:bg-cyan-500 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Volume2 size={18} />
            Listen
          </button>

          <button
            onClick={onCopy}
            disabled={!value}
            className="flex items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/5 py-3 font-bold transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {copied ? (
              <>
                <Check size={18} />
                Copied
              </>
            ) : (
              <>
                <Copy size={18} />
                Copy
              </>
            )}
          </button>

          <button
            onClick={onShare}
            disabled={!value}
            className="flex items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/5 py-3 font-bold transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Share2 size={18} />
            Share
          </button>

          <button
            onClick={onSave}
            disabled={!value}
            className="flex items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/5 py-3 font-bold transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Bookmark size={18} />
            Save
          </button>

        </div>

      </div>

    </motion.section>
  );
};

export default TranslateOutput;