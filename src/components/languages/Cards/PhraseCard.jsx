import React from "react";
import { motion } from "framer-motion";
import {
  MessageSquareText,
  Volume2,
  Copy,
  Heart,
  Star,
  Bookmark,
  ArrowRight,
} from "lucide-react";

const PhraseCard = ({
  phrase,
  onPronounce,
  onCopy,
  onSave,
  onClick,
}) => {
  return (
    <motion.article
      whileHover={{
        y: -8,
        scale: 1.02,
      }}
      whileTap={{
        scale: 0.98,
      }}
      transition={{
        duration: 0.25,
      }}
      className="group overflow-hidden rounded-3xl border border-white/10 bg-slate-900"
    >
      {/* Header */}

      <div className="bg-gradient-to-r from-orange-600 via-pink-600 to-purple-600 p-6">

        <div className="flex items-center justify-between">

          <div className="rounded-2xl bg-white/10 p-4">
            <MessageSquareText
              size={34}
              className="text-white"
            />
          </div>

          <span className="rounded-full bg-black/30 px-4 py-2 text-xs font-bold text-white">
            {phrase?.category || "Conversation"}
          </span>

        </div>

      </div>

      {/* Content */}

      <div className="p-6">

        <h2 className="text-2xl font-black text-white">
          {phrase?.text || "How are you?"}
        </h2>

        <p className="mt-3 text-lg text-cyan-300">
          {phrase?.translation || "Comment allez-vous ?"}
        </p>

        <div className="mt-6 rounded-2xl bg-black/20 p-5">

          <p className="text-sm font-semibold text-slate-400">
            Meaning
          </p>

          <p className="mt-3 leading-7 text-slate-300">
            {phrase?.meaning ||
              "Used as a polite greeting when asking about someone's well-being."}
          </p>

        </div>

        {phrase?.example && (
          <div className="mt-5 rounded-2xl border border-white/10 bg-white/5 p-5">

            <p className="text-sm font-semibold text-cyan-300">
              Example
            </p>

            <p className="mt-3 italic leading-7 text-slate-300">
              "{phrase.example}"
            </p>

          </div>
        )}

        <div className="mt-6 flex items-center gap-2">

          {[1, 2, 3, 4, 5].map((item) => (
            <Star
              key={item}
              size={16}
              className="fill-yellow-400 text-yellow-400"
            />
          ))}

          <span className="ml-2 text-sm text-slate-400">
            {phrase?.rating || "4.9"}
          </span>

        </div>

        <div className="mt-8 grid grid-cols-2 gap-3">

          <button
            onClick={onPronounce}
            className="flex items-center justify-center gap-2 rounded-2xl bg-cyan-600 py-3 font-bold transition hover:bg-cyan-500"
          >
            <Volume2 size={18} />
            Listen
          </button>

          <button
            onClick={onCopy}
            className="flex items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/5 py-3 font-bold transition hover:bg-white/10"
          >
            <Copy size={18} />
            Copy
          </button>

          <button
            onClick={onSave}
            className="flex items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/5 py-3 font-bold transition hover:bg-white/10"
          >
            <Bookmark size={18} />
            Save
          </button>

          <button
            onClick={onClick}
            className="flex items-center justify-center gap-2 rounded-2xl bg-purple-600 py-3 font-bold transition hover:bg-purple-500"
          >
            Learn
            <ArrowRight size={18} />
          </button>

        </div>

        <div className="mt-6 flex items-center gap-2 text-pink-400">

          <Heart
            size={18}
            className="fill-pink-400"
          />

          <span className="text-sm">
            {phrase?.favorites ?? 0} learners saved this phrase
          </span>

        </div>

      </div>
    </motion.article>
  );
};

export default PhraseCard;