import React from "react";
import { motion } from "framer-motion";
import {
  BookText,
  Volume2,
  Copy,
  Star,
  ArrowRight,
  Languages,
} from "lucide-react";

const DictionaryCard = ({
  word,
  onPronounce,
  onCopy,
  onClick,
}) => {
  return (
    <motion.div
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
      className="overflow-hidden rounded-3xl border border-white/10 bg-slate-900"
    >
      {/* Header */}

      <div className="bg-gradient-to-r from-cyan-600 to-blue-700 p-6">

        <div className="flex items-center justify-between">

          <div>

            <h2 className="text-3xl font-black text-white">
              {word?.word || "Language"}
            </h2>

            <p className="mt-2 text-cyan-100">
              {word?.phonetic || "/ˈlæŋɡwɪdʒ/"}
            </p>

          </div>

          <div className="rounded-2xl bg-white/10 p-4">

            <BookText
              size={36}
              className="text-white"
            />

          </div>

        </div>

      </div>

      {/* Content */}

      <div className="p-6">

        <div className="flex items-center gap-2 text-sm text-slate-400">

          <Languages
            size={16}
            className="text-cyan-400"
          />

          <span>
            {word?.partOfSpeech || "Noun"}
          </span>

        </div>

        <p className="mt-5 leading-8 text-slate-300">
          {word?.definition ||
            "Definition of the selected word will appear here."}
        </p>

        {word?.example && (
          <div className="mt-6 rounded-2xl border border-white/10 bg-black/20 p-5">

            <p className="text-sm font-bold text-cyan-300">
              Example
            </p>

            <p className="mt-3 italic leading-7 text-slate-300">
              "{word.example}"
            </p>

          </div>
        )}

        <div className="mt-8 flex flex-wrap gap-3">

          <button
            onClick={onPronounce}
            className="flex items-center gap-2 rounded-xl bg-cyan-600 px-5 py-3 font-bold transition hover:bg-cyan-500"
          >
            <Volume2 size={18} />
            Pronounce
          </button>

          <button
            onClick={onCopy}
            className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-5 py-3 font-bold transition hover:bg-white/10"
          >
            <Copy size={18} />
            Copy
          </button>

          <button
            onClick={onClick}
            className="ml-auto flex items-center gap-2 rounded-xl bg-purple-600 px-5 py-3 font-bold transition hover:bg-purple-500"
          >
            More Details
            <ArrowRight size={18} />
          </button>

        </div>

        <div className="mt-8 flex items-center gap-2">

          {[1, 2, 3, 4, 5].map((item) => (
            <Star
              key={item}
              size={18}
              className="fill-yellow-400 text-yellow-400"
            />
          ))}

          <span className="ml-2 text-sm text-slate-400">
            {word?.rating || "5.0"} Dictionary Rating
          </span>

        </div>

      </div>
    </motion.div>
  );
};

export default DictionaryCard;