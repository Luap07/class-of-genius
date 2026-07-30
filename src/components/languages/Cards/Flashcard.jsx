import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  RotateCcw,
  Volume2,
  Bookmark,
  CheckCircle2,
  XCircle,
  Brain,
} from "lucide-react";

const Flashcard = ({
  card,
  onPronounce,
  onBookmark,
  onCorrect,
  onIncorrect,
}) => {
  const [flipped, setFlipped] = useState(false);

  return (
    <div className="perspective-[1200px] w-full">

      <motion.div
        animate={{
          rotateY: flipped ? 180 : 0,
        }}
        transition={{
          duration: 0.6,
        }}
        style={{
          transformStyle: "preserve-3d",
        }}
        className="relative h-[420px] w-full cursor-pointer"
        onClick={() => setFlipped(!flipped)}
      >

        {/* Front */}

        <div
          style={{
            backfaceVisibility: "hidden",
          }}
          className="absolute inset-0 flex flex-col justify-between rounded-3xl border border-white/10 bg-gradient-to-br from-cyan-700 via-blue-700 to-indigo-800 p-8 text-white"
        >

          <div className="flex items-center justify-between">

            <div className="rounded-2xl bg-white/10 p-4">

              <Brain size={34} />

            </div>

            <button
              onClick={(e) => {
                e.stopPropagation();
                onBookmark?.();
              }}
              className="rounded-xl bg-white/10 p-3 transition hover:bg-white/20"
            >
              <Bookmark size={20} />
            </button>

          </div>

          <div className="text-center">

            <p className="text-sm uppercase tracking-widest text-cyan-200">
              Vocabulary
            </p>

            <h2 className="mt-6 text-5xl font-black">
              {card?.front || "Hello"}
            </h2>

            <p className="mt-5 text-slate-200">
              Tap the card to reveal the answer
            </p>

          </div>

          <div className="flex justify-center">

            <button
              onClick={(e) => {
                e.stopPropagation();
                onPronounce?.();
              }}
              className="flex items-center gap-2 rounded-2xl bg-white/10 px-6 py-3 font-bold transition hover:bg-white/20"
            >
              <Volume2 size={18} />
              Listen
            </button>

          </div>

        </div>

        {/* Back */}

        <div
          style={{
            transform: "rotateY(180deg)",
            backfaceVisibility: "hidden",
          }}
          className="absolute inset-0 flex flex-col justify-between rounded-3xl border border-white/10 bg-gradient-to-br from-emerald-700 via-green-700 to-teal-800 p-8 text-white"
        >

          <div className="flex items-center justify-between">

            <button
              onClick={(e) => {
                e.stopPropagation();
                setFlipped(false);
              }}
              className="rounded-xl bg-white/10 p-3 transition hover:bg-white/20"
            >
              <RotateCcw size={20} />
            </button>

            <span className="rounded-full bg-white/10 px-4 py-2 text-sm">
              Answer
            </span>

          </div>

          <div className="text-center">

            <h2 className="text-4xl font-black">
              {card?.back || "Bonjour"}
            </h2>

            <p className="mt-6 leading-8 text-slate-200">
              {card?.example ||
                "Use this word repeatedly in conversations to improve long-term memory."}
            </p>

          </div>

          <div className="grid grid-cols-2 gap-4">

            <button
              onClick={(e) => {
                e.stopPropagation();
                onIncorrect?.();
              }}
              className="flex items-center justify-center gap-2 rounded-2xl bg-red-600 py-3 font-bold transition hover:bg-red-500"
            >
              <XCircle size={18} />
              Again
            </button>

            <button
              onClick={(e) => {
                e.stopPropagation();
                onCorrect?.();
              }}
              className="flex items-center justify-center gap-2 rounded-2xl bg-green-600 py-3 font-bold transition hover:bg-green-500"
            >
              <CheckCircle2 size={18} />
              Got It
            </button>

          </div>

        </div>

      </motion.div>

    </div>
  );
};

export default Flashcard;