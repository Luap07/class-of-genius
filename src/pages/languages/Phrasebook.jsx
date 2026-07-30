import React, { useMemo, useState } from "react";
import { motion } from "framer-motion";

import {
  Search,
  Globe,
  Mic,
  Volume2,
  Star,
  Languages,
  BookOpen,
} from "lucide-react";

const categories = [
  "All",
  "Greetings",
  "Travel",
  "Restaurant",
  "Shopping",
  "School",
  "Business",
  "Hospital",
  "Airport",
  "Hotel",
  "Emergency",
];

const phrases = [
  {
    id: 1,
    category: "Greetings",
    english: "Good morning",
    translation: "Buenos días",
    pronunciation: "BWEH-nos DEE-ahs",
  },
  {
    id: 2,
    category: "Travel",
    english: "Where is the bus station?",
    translation: "¿Dónde está la estación de autobuses?",
    pronunciation: "DON-de es-TA...",
  },
  {
    id: 3,
    category: "Restaurant",
    english: "I would like to order.",
    translation: "Me gustaría pedir.",
    pronunciation: "Me gus-ta-REE-a pe-DEER",
  },
  {
    id: 4,
    category: "Shopping",
    english: "How much is this?",
    translation: "¿Cuánto cuesta esto?",
    pronunciation: "KWAN-to KWES-ta ES-to",
  },
];

export default function Phrasebook() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");

  const filtered = useMemo(() => {
    return phrases.filter((item) => {
      const matchCategory =
        category === "All" || item.category === category;

      const matchSearch =
        item.english
          .toLowerCase()
          .includes(search.toLowerCase()) ||
        item.translation
          .toLowerCase()
          .includes(search.toLowerCase());

      return matchCategory && matchSearch;
    });
  }, [search, category]);

  return (
    <div className="min-h-screen bg-[#030712] text-white">

      {/* HERO */}

      <section className="border-b border-white/10">

        <div className="mx-auto max-w-7xl px-6 py-20">

          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
          >

            <div className="inline-flex items-center gap-2 rounded-full bg-cyan-500/20 px-5 py-2 text-cyan-400">

              <Languages size={18} />

              Phrasebook

            </div>

            <h1 className="mt-6 text-6xl font-black">

              Speak Like A Native

            </h1>

            <p className="mt-6 max-w-3xl text-slate-400 leading-8">

              Learn useful conversations for travelling,
              business, school, shopping,
              emergencies and everyday communication.

            </p>

          </motion.div>

        </div>

      </section>

      {/* SEARCH */}

      <section className="mx-auto mt-12 max-w-7xl px-6">

        <div className="relative">

          <Search
            className="absolute left-5 top-5 text-slate-500"
            size={20}
          />

          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search phrases..."
            className="w-full rounded-2xl border border-white/10 bg-slate-900 py-5 pl-14 pr-6 outline-none"
          />

        </div>

      </section>

      {/* CATEGORIES */}

      <section className="mx-auto mt-10 max-w-7xl px-6">

        <div className="flex flex-wrap gap-3">

          {categories.map((item) => (

            <button
              key={item}
              onClick={() => setCategory(item)}
              className={`rounded-full px-6 py-3 font-semibold transition

              ${
                category === item
                  ? "bg-cyan-500 text-black"
                  : "bg-slate-900 border border-white/10"
              }
              `}
            >
              {item}
            </button>

          ))}

        </div>

      </section>

      {/* STATS */}

      <section className="mx-auto mt-12 max-w-7xl px-6">

        <div className="grid gap-6 md:grid-cols-4">

          <div className="rounded-3xl bg-slate-900 p-8">

            <Globe className="text-cyan-400" />

            <h2 className="mt-5 text-4xl font-black">
              100+
            </h2>

            <p className="mt-2 text-slate-400">
              Languages
            </p>

          </div>

          <div className="rounded-3xl bg-slate-900 p-8">

            <BookOpen className="text-green-400" />

            <h2 className="mt-5 text-4xl font-black">
              50,000+
            </h2>

            <p className="mt-2 text-slate-400">
              Phrases
            </p>

          </div>

          <div className="rounded-3xl bg-slate-900 p-8">

            <Mic className="text-pink-400" />

            <h2 className="mt-5 text-4xl font-black">
              AI
            </h2>

            <p className="mt-2 text-slate-400">
              Speaking Practice
            </p>

          </div>

          <div className="rounded-3xl bg-slate-900 p-8">

            <Star className="text-yellow-400" />

            <h2 className="mt-5 text-4xl font-black">
              Offline
            </h2>

            <p className="mt-2 text-slate-400">
              Phrase Packs
            </p>

          </div>

        </div>

      </section>

      {/* Phrase cards start below */}
      <section className="mx-auto mt-16 mb-20 max-w-7xl px-6">

  <div className="mb-8 flex items-center justify-between">

    <div>

      <h2 className="text-3xl font-black">
        Everyday Conversations
      </h2>

      <p className="mt-2 text-slate-400">
        Learn useful expressions used by native speakers.
      </p>

    </div>

    <div className="rounded-full bg-cyan-500/10 px-5 py-2 text-cyan-400 font-semibold">

      {filtered.length} Phrases

    </div>

  </div>

  <div className="grid gap-8">

    {filtered.map((phrase) => (

      <motion.div
        key={phrase.id}
        whileHover={{
          y: -5,
          scale: 1.01,
        }}
        transition={{
          duration: 0.25,
        }}
        className="
          rounded-3xl
          border
          border-white/10
          bg-slate-900
          overflow-hidden
        "
      >

        {/* HEADER */}

        <div className="flex items-center justify-between border-b border-white/10 px-8 py-5">

          <div>

            <span
              className="
                rounded-full
                bg-cyan-500/20
                px-4
                py-2
                text-sm
                font-bold
                text-cyan-400
              "
            >
              {phrase.category}
            </span>

          </div>

          <button
            className="
              rounded-full
              p-3
              transition
              hover:bg-yellow-500/20
            "
          >
            <Star size={20} />
          </button>

        </div>

        {/* BODY */}

        <div className="grid gap-8 lg:grid-cols-2 p-8">

          {/* LEFT */}

          <div>

            <p className="text-sm uppercase tracking-widest text-slate-500">

              English

            </p>

            <h2 className="mt-4 text-4xl font-black leading-tight">

              {phrase.english}

            </h2>

            <div className="mt-10">

              <p className="text-sm uppercase tracking-widest text-slate-500">

                Pronunciation

              </p>

              <p className="mt-3 text-xl text-cyan-300">

                {phrase.pronunciation}

              </p>

            </div>

          </div>

          {/* RIGHT */}

          <div>

            <p className="text-sm uppercase tracking-widest text-slate-500">

              Translation

            </p>

            <h2 className="mt-4 text-4xl font-black text-green-400 leading-tight">

              {phrase.translation}

            </h2>

            <div
              className="
                mt-8
                rounded-2xl
                bg-slate-800
                p-5
              "
            >

              <h3 className="font-bold">

                AI Tip

              </h3>

              <p className="mt-3 leading-8 text-slate-400">

                This phrase is commonly used during
                everyday conversations.
                Practice saying it aloud several
                times to improve fluency and
                pronunciation.

              </p>

            </div>

          </div>

        </div>

        {/* ACTIONS */}

        <div
          className="
            flex
            flex-wrap
            gap-4
            border-t
            border-white/10
            p-6
          "
        >

          <button
            className="
              flex
              items-center
              gap-2
              rounded-xl
              bg-cyan-600
              px-5
              py-3
              font-semibold
            "
          >
            <Volume2 size={18} />
            Listen
          </button>

          <button
            className="
              flex
              items-center
              gap-2
              rounded-xl
              bg-green-600
              px-5
              py-3
              font-semibold
            "
          >
            <Mic size={18} />
            Practice
          </button>

          <button
            className="
              rounded-xl
              bg-slate-800
              px-5
              py-3
              font-semibold
            "
          >
            Copy
          </button>

          <button
            className="
              rounded-xl
              bg-slate-800
              px-5
              py-3
              font-semibold
            "
          >
            Share
          </button>

          <button
            className="
              rounded-xl
              bg-purple-600
              px-5
              py-3
              font-semibold
            "
          >
            Explain with AI
          </button>

        </div>

      </motion.div>

    ))}

  </div>

</section>

    </div>
  );
}