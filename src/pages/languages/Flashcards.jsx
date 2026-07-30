import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  RotateCcw,
  Volume2,
  ChevronLeft,
  ChevronRight,
  CheckCircle,
  XCircle,
  Brain,
} from "lucide-react";

const flashcards = [
  {
    id: 1,
    word: "Innovation",
    meaning: "The introduction of new ideas, methods or products.",
    example: "Innovation drives economic growth.",
    pronunciation: "/ˌɪnəˈveɪʃən/",
  },
  {
    id: 2,
    word: "Courage",
    meaning: "The ability to face fear with confidence.",
    example: "She showed courage during the rescue.",
    pronunciation: "/ˈkʌrɪdʒ/",
  },
  {
    id: 3,
    word: "Journey",
    meaning: "Travel from one place to another.",
    example: "Learning is a lifelong journey.",
    pronunciation: "/ˈdʒɜːni/",
  },
];

export default function Flashcards() {
  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);

  const card = flashcards[index];

  const nextCard = () => {
    setFlipped(false);
    setIndex((prev) => (prev + 1) % flashcards.length);
  };

  const previousCard = () => {
    setFlipped(false);
    setIndex((prev) =>
      prev === 0 ? flashcards.length - 1 : prev - 1
    );
  };

  return (
    <section className="min-h-screen bg-[#030712] text-white px-6 py-16">

      <div className="mx-auto max-w-6xl">

        <div className="text-center">

          <div className="inline-flex items-center gap-2 rounded-full bg-cyan-500/20 px-5 py-2 text-cyan-400 font-bold">
            <Brain size={18} />
            AI Flashcards
          </div>

          <h1 className="mt-6 text-5xl font-black">
            Flashcards
          </h1>

          <p className="mt-5 text-slate-400 max-w-3xl mx-auto leading-8">
            Learn faster using interactive flashcards powered by
            spaced repetition and AI explanations.
          </p>

        </div>

        <div className="mt-16 flex justify-center">

          <motion.div
            layout
            whileTap={{ scale: 0.97 }}
            onClick={() => setFlipped(!flipped)}
            className="cursor-pointer w-full max-w-xl rounded-3xl border border-cyan-500/20 bg-slate-900 p-10 shadow-2xl"
          >

            {!flipped ? (
              <>
                <p className="text-cyan-400 font-bold">
                  Word
                </p>

                <h2 className="mt-6 text-5xl font-black">
                  {card.word}
                </h2>

                <p className="mt-5 text-lg text-slate-400">
                  {card.pronunciation}
                </p>

                <div className="mt-10 flex justify-center">
                  <button className="rounded-full bg-cyan-600 p-4">
                    <Volume2 />
                  </button>
                </div>

                <p className="mt-12 text-center text-slate-500">
                  Click card to reveal meaning
                </p>
              </>
            ) : (
              <>
                <p className="text-green-400 font-bold">
                  Meaning
                </p>

                <h2 className="mt-6 text-3xl font-black leading-relaxed">
                  {card.meaning}
                </h2>

                <div className="mt-8 rounded-2xl bg-slate-800 p-5">
                  <p className="text-slate-400">
                    Example
                  </p>

                  <p className="mt-3 text-lg">
                    {card.example}
                  </p>
                </div>

                <button className="mt-8 rounded-xl bg-cyan-600 px-6 py-3 font-bold">
                  Explain with AI
                </button>
              </>
            )}

          </motion.div>

        </div>

        <div className="mt-14 flex flex-wrap justify-center gap-4">

          <button
            onClick={previousCard}
            className="flex items-center gap-2 rounded-xl bg-slate-800 px-6 py-3"
          >
            <ChevronLeft size={18} />
            Previous
          </button>

          <button
            onClick={() => setFlipped(false)}
            className="flex items-center gap-2 rounded-xl bg-blue-600 px-6 py-3"
          >
            <RotateCcw size={18} />
            Reset
          </button>

          <button
            onClick={nextCard}
            className="flex items-center gap-2 rounded-xl bg-slate-800 px-6 py-3"
          >
            Next
            <ChevronRight size={18} />
          </button>

        </div>

        <div className="mt-16 grid gap-6 md:grid-cols-2">

          <button className="rounded-2xl bg-green-600 p-8">
            <CheckCircle className="mx-auto mb-4" size={40} />

            <h2 className="text-2xl font-black">
              I Know This
            </h2>

            <p className="mt-3 text-green-100">
              Increase mastery level
            </p>

          </button>

          <button className="rounded-2xl bg-red-600 p-8">

            <XCircle className="mx-auto mb-4" size={40} />

            <h2 className="text-2xl font-black">
              Study Again
            </h2>

            <p className="mt-3 text-red-100">
              AI will show this word again later.
            </p>

          </button>

        </div>

      </div>

    </section>
  );
}