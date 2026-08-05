import React, { useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  CalendarDays,
  Volume2,
  Sparkles,
  Globe,
  Languages,
  BadgeCheck,
  Heart,
  Bookmark,
  Info,
  BookOpen,
} from "lucide-react";

import wordsOfTheDay from "../../data/language/wordOfTheDay";

export default function WordOfTheDay() {
  const [saved, setSaved] = useState(false);

  const today = new Date();

  const startOfYear = new Date(today.getFullYear(), 0, 0);

  const diff =
    today - startOfYear;

  const oneDay =
    1000 * 60 * 60 * 24;

  const dayOfYear =
    Math.floor(diff / oneDay);

  const word = useMemo(() => {
    if (!wordsOfTheDay?.length) return null;

    return wordsOfTheDay[
      (dayOfYear - 1) %
        wordsOfTheDay.length
    ];
  }, [dayOfYear]);

  if (!word) {
    return (
      <section className="min-h-screen bg-[#020617] flex items-center justify-center text-white">
        <div className="text-center">
          <BookOpen
            size={60}
            className="mx-auto text-cyan-400"
          />

          <h2 className="mt-6 text-3xl font-black">
            No Words Available
          </h2>

          <p className="mt-3 text-slate-400">
            Please add words inside
            wordOfTheDay.js
          </p>
        </div>
      </section>
    );
  }

  const level =
    word.level ||
    word.difficulty ||
    "All Levels";

  const partOfSpeech =
    word.partOfSpeech ||
    word.category ||
    "Word";

  const ipa =
    word.ipa ||
    word.transcription ||
    "";

  const related =
    word.related ||
    word.relatedWords ||
    [];

  const synonyms =
    word.synonyms || [];

  const antonyms =
    word.antonyms || [];

  return (
    <section className="min-h-screen bg-[#020617] px-6 py-12 text-white lg:px-8">
      <div className="mx-auto max-w-7xl">

        {/* HERO */}

        <motion.div
          initial={{
            opacity: 0,
            y: 30,
          }}
          animate={{
            opacity: 1,
            y: 0,
          }}
          transition={{
            duration: 0.5,
          }}
          className="
          overflow-hidden
          rounded-[32px]
          border
          border-yellow-500/20
          bg-gradient-to-br
          from-yellow-500/20
          via-orange-500/10
          to-red-500/10
          p-10
        "
        >
          <div className="flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">

            <div className="flex items-center gap-5">

              <div
                className="
                flex
                h-20
                w-20
                items-center
                justify-center
                rounded-3xl
                bg-yellow-500/20
              "
              >
                <CalendarDays
                  size={42}
                  className="text-yellow-400"
                />
              </div>

              <div>

                <span
                  className="
                  inline-flex
                  items-center
                  gap-2
                  rounded-full
                  bg-yellow-500/20
                  px-4
                  py-2
                  text-sm
                  font-bold
                  text-yellow-300
                "
                >
                  <Sparkles size={15} />

                  Today's Featured Word
                </span>

                <h1 className="mt-5 text-5xl font-black lg:text-6xl">
                  Word Of The Day
                </h1>

                <p className="mt-4 max-w-3xl leading-8 text-slate-300">
                  Learn one new word every day.
                  The word changes automatically
                  based on today's date.
                </p>

              </div>

            </div>

            <div
              className="
              rounded-3xl
              border
              border-white/10
              bg-black/20
              px-8
              py-6
              backdrop-blur-xl
            "
            >
              <p className="text-sm text-slate-400">
                Today's Date
              </p>

              <h2 className="mt-2 text-2xl font-black">
                {today.toLocaleDateString(
                  "en-US",
                  {
                    weekday: "long",
                    month: "long",
                    day: "numeric",
                  }
                )}
              </h2>

            </div>

          </div>
        </motion.div>
                {/* ================= WORD CARD ================= */}

        <section className="mt-12">
          <motion.div
            whileHover={{ y: -4 }}
            className="
              rounded-[32px]
              border
              border-white/10
              bg-slate-900
              p-8
            "
          >
            <div className="flex flex-wrap items-start justify-between gap-8">
              <div>

                <div className="flex flex-wrap gap-3">

                  {word.language && (
                    <span className="rounded-full bg-cyan-500/15 px-4 py-2 text-sm font-semibold text-cyan-300">
                      <Globe className="mr-2 inline" size={15} />
                      {word.language}
                    </span>
                  )}

                  {word.level && (
                    <span className="rounded-full bg-blue-500/15 px-4 py-2 text-sm font-semibold text-blue-300">
                      <Languages className="mr-2 inline" size={15} />
                      {word.level}
                    </span>
                  )}

                  {word.partOfSpeech && (
                    <span className="rounded-full bg-purple-500/15 px-4 py-2 text-sm font-semibold text-purple-300">
                      <BadgeCheck className="mr-2 inline" size={15} />
                      {word.partOfSpeech}
                    </span>
                  )}

                </div>

                <h2 className="mt-8 text-6xl font-black">
                  {word.word}
                </h2>

                {word.ipa && (
                  <p className="mt-4 text-2xl text-cyan-300">
                    {word.ipa}
                  </p>
                )}

                {word.pronunciation && (
                  <p className="mt-2 text-lg text-purple-300">
                    {word.pronunciation}
                  </p>
                )}

              </div>

              <button
                onClick={() => setSaved(!saved)}
                className="
                  rounded-3xl
                  bg-white/10
                  p-5
                  transition
                  hover:bg-white/20
                "
              >
                <Heart
                  size={28}
                  className={
                    saved
                      ? "fill-red-500 text-red-500"
                      : "text-white"
                  }
                />
              </button>
            </div>

            <div className="mt-10 grid gap-6 lg:grid-cols-2">

              <div className="rounded-3xl border border-white/10 bg-black/30 p-6">
                <h3 className="text-2xl font-black">
                  Meaning
                </h3>

                <p className="mt-4 leading-8 text-slate-300">
                  {word.meaning}
                </p>
              </div>

              <div className="rounded-3xl border border-white/10 bg-black/30 p-6">
                <h3 className="text-2xl font-black">
                  Example
                </h3>

                <p className="mt-4 italic leading-8 text-slate-300">
                  "{word.example}"
                </p>

                {word.exampleTranslation && (
                  <p className="mt-4 text-sm text-slate-400">
                    {word.exampleTranslation}
                  </p>
                )}
              </div>

              {word.pronunciation && (
                <div className="rounded-3xl border border-white/10 bg-black/30 p-6">

                  <h3 className="text-2xl font-black">
                    Pronunciation
                  </h3>

                  <p className="mt-4 text-xl text-cyan-300">
                    {word.pronunciation}
                  </p>

                  <button
                    className="
                      mt-6
                      inline-flex
                      items-center
                      gap-3
                      rounded-2xl
                      bg-blue-600
                      px-6
                      py-3
                      font-bold
                      hover:bg-blue-500
                    "
                  >
                    <Volume2 size={20} />
                    Listen
                  </button>

                </div>
              )}

              <div className="rounded-3xl border border-white/10 bg-black/30 p-6">

                <h3 className="text-2xl font-black">
                  Word Information
                </h3>

                <div className="mt-5 space-y-4">

                  {word.language && (
                    <div className="flex justify-between">
                      <span className="text-slate-400">
                        Language
                      </span>

                      <span>{word.language}</span>
                    </div>
                  )}

                  {word.level && (
                    <div className="flex justify-between">
                      <span className="text-slate-400">
                        Level
                      </span>

                      <span>{word.level}</span>
                    </div>
                  )}

                  {word.partOfSpeech && (
                    <div className="flex justify-between">
                      <span className="text-slate-400">
                        Part of Speech
                      </span>

                      <span>{word.partOfSpeech}</span>
                    </div>
                  )}

                </div>

              </div>

            </div>
            
                        {/* ================= SYNONYMS ================= */}

            {Array.isArray(word.synonyms) && word.synonyms.length > 0 && (
              <div className="mt-10">
                <h3 className="text-2xl font-black">
                  Synonyms
                </h3>

                <div className="mt-5 flex flex-wrap gap-3">
                  {word.synonyms.map((item) => (
                    <span
                      key={item}
                      className="
                        rounded-full
                        border
                        border-cyan-500/20
                        bg-cyan-500/10
                        px-5
                        py-2
                        text-cyan-300
                      "
                    >
                      {item}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* ================= ANTONYMS ================= */}

            {Array.isArray(word.antonyms) && word.antonyms.length > 0 && (
              <div className="mt-10">
                <h3 className="text-2xl font-black">
                  Antonyms
                </h3>

                <div className="mt-5 flex flex-wrap gap-3">
                  {word.antonyms.map((item) => (
                    <span
                      key={item}
                      className="
                        rounded-full
                        border
                        border-rose-500/20
                        bg-rose-500/10
                        px-5
                        py-2
                        text-rose-300
                      "
                    >
                      {item}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* ================= RELATED WORDS ================= */}

            {(Array.isArray(word.related) ||
              Array.isArray(word.relatedWords)) && (
              <div className="mt-10">
                <h3 className="text-2xl font-black">
                  Related Words
                </h3>

                <div className="mt-5 flex flex-wrap gap-3">
                  {(word.related || word.relatedWords).map((item) => (
                    <span
                      key={item}
                      className="
                        rounded-full
                        border
                        border-violet-500/20
                        bg-violet-500/10
                        px-5
                        py-2
                        text-violet-300"
                      >
                      {item}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* ================= GRAMMAR ================= */}

            {word.grammar && (
              <div
                className="
                  mt-10
                  rounded-3xl
                  border
                  border-white/10
                  bg-black/30
                  p-7
                "
              >
                <h3 className="text-2xl font-black">
                  Grammar
                </h3>

                <p className="mt-4 leading-8 text-slate-300">
                  {word.grammar}
                </p>
              </div>
            )}

            {/* ================= ORIGIN ================= */}

            {word.origin && (
              <div
                className="
                  mt-8
                  rounded-3xl
                  border
                  border-amber-500/20
                  bg-gradient-to-br
                  from-amber-500/10
                  to-orange-500/10
                  p-7
                "
              >
                <h3 className="flex items-center gap-3 text-2xl font-black">
                  <Sparkles
                    size={24}
                    className="text-amber-400"
                  />
                  Origin
                </h3>

                <p className="mt-4 leading-8 text-slate-300">
                  {word.origin}
                </p>
              </div>
            )}

            {/* ================= FUN FACT ================= */}

            {word.funFact && (
              <div
                className="
                  mt-8
                  rounded-3xl
                  border
                  border-blue-500/20
                  bg-gradient-to-br
                  from-blue-500/10
                  to-cyan-500/10
                  p-7
                "
              >
                <h3 className="flex items-center gap-3 text-2xl font-black">
                  <Sparkles
                    size={24}
                    className="text-cyan-400"
                  />
                  Fun Fact
                </h3>

                <p className="mt-4 leading-8 text-slate-300">
                  {word.funFact}
                </p>
              </div>
            )}

          </motion.div>
        </section>
                {/* ================= DAILY GOAL ================= */}

        <section className="mt-14 grid gap-6 lg:grid-cols-2">

          <motion.div
            whileHover={{ y: -6 }}
            className="
              rounded-3xl
              border
              border-white/10
              bg-gradient-to-br
              from-green-600/20
              to-cyan-600/20
              p-8
            "
          >
            <div className="flex items-center gap-4">
              <div
                className="
                  rounded-2xl
                  bg-green-500/20
                  p-4
                "
              >
                <BookOpen
                  size={30}
                  className="text-green-400"
                />
              </div>

              <div>

  <h3 className="text-2xl font-black">
    Daily Vocabulary Goal
  </h3>

  <p className="mt-3 leading-8 text-slate-300">
    Build your vocabulary one word at a time. Learning a single
    carefully selected word every day is an easy habit that
    strengthens your communication, reading, writing, and speaking
    skills over time.
  </p>

  <div className="mt-6 space-y-3">

    <div className="flex items-center gap-3">
      <div className="h-2.5 w-2.5 rounded-full bg-green-400" />
      <span className="text-slate-300">
        Understand today's meaning and pronunciation.
      </span>
    </div>

    <div className="flex items-center gap-3">
      <div className="h-2.5 w-2.5 rounded-full bg-cyan-400" />
      <span className="text-slate-300">
        Read the example sentence carefully.
      </span>
    </div>

    <div className="flex items-center gap-3">
      <div className="h-2.5 w-2.5 rounded-full bg-purple-400" />
      <span className="text-slate-300">
        Learn the synonyms and antonyms.
      </span>
    </div>

    <div className="flex items-center gap-3">
      <div className="h-2.5 w-2.5 rounded-full bg-yellow-400" />
      <span className="text-slate-300">
        Use the word in your own conversation today.
      </span>
    </div>

  </div>

  <div
    className="
      mt-6
      rounded-2xl
      border
      border-green-500/20
      bg-green-500/10
      p-4
    "
  >
    <p className="text-sm leading-7 text-green-200">
      <strong>Goal:</strong> Consistently learning one word each day
      can help you build hundreds of new vocabulary words every year,
      making your communication more confident and expressive.
    </p>
  </div>

</div>
            </div>

            <div className="mt-8 h-3 overflow-hidden rounded-full bg-black/40">
              <div className="h-full w-full rounded-full bg-green-500" />
            </div>

            <p className="mt-4 text-green-300">
              Today's word unlocked
            </p>
          </motion.div>

          <motion.div
            whileHover={{ y: -6 }}
            className="
              rounded-3xl
              border
              border-white/10
              bg-gradient-to-br
              from-purple-600/20
              to-blue-600/20
              p-8
            "
          >
            <div className="flex items-center gap-4">

              <div
                className="
                  rounded-2xl
                  bg-purple-500/20
                  p-4
                "
              >
                <Sparkles
                  size={30}
                  className="text-purple-400"
                />
              </div>

              <div>

  <h3 className="text-2xl font-black">
    Daily Challenge
  </h3>

  <p className="mt-3 leading-8 text-slate-300">
    Reinforce today's learning by actively using the featured word.
    Applying new vocabulary in real conversations or writing helps
    improve understanding, memory, and long-term retention.
  </p>

  <div className="mt-6 space-y-3">

    <div className="flex items-center gap-3">
      <div className="h-2.5 w-2.5 rounded-full bg-purple-400" />
      <span className="text-slate-300">
        Say today's word aloud several times.
      </span>
    </div>

    <div className="flex items-center gap-3">
      <div className="h-2.5 w-2.5 rounded-full bg-cyan-400" />
      <span className="text-slate-300">
        Create your own sentence using the word correctly.
      </span>
    </div>

    <div className="flex items-center gap-3">
      <div className="h-2.5 w-2.5 rounded-full bg-pink-400" />
      <span className="text-slate-300">
        Use the word naturally in a conversation today.
      </span>
    </div>

    <div className="flex items-center gap-3">
      <div className="h-2.5 w-2.5 rounded-full bg-yellow-400" />
      <span className="text-slate-300">
        Review the word again before the day ends.
      </span>
    </div>

  </div>

  <div
    className="
      mt-6
      rounded-2xl
      border
      border-purple-500/20
      bg-purple-500/10
      p-4
    "
  >
    <p className="text-sm leading-7 text-purple-200">
      <strong>Challenge:</strong> The more frequently you use a new
      word in speaking, writing, or reading, the more naturally it
      becomes part of your everyday vocabulary.
    </p>
  </div>

</div>
            </div>

            <div
  className="
    mt-8
    rounded-2xl
    border
    border-purple-500/20
    bg-purple-500/10
    p-5
  "
>
  <div className="flex items-start gap-3">

    <Sparkles
      size={22}
      className="mt-1 text-purple-300"
    />

    <div>

      <h4 className="font-bold text-white">
        Daily Vocabulary Reminder
      </h4>

      <p className="mt-2 leading-7 text-slate-300">
        Read today's word several times, understand its meaning,
        and try to use it naturally in conversations throughout
        the day. Tomorrow, a new word will be selected
        automatically.
      </p>

    </div>

  </div>
</div>
          </motion.div>

        </section>

        {/* ================= FOOTER ================= */}

        <motion.div
          initial={{
            opacity: 0,
            y: 20,
          }}
          whileInView={{
            opacity: 1,
            y: 0,
          }}
          viewport={{
            once: true,
          }}
          transition={{
            duration: 0.5,
          }}
          className="
            mt-20
            overflow-hidden
            rounded-[32px]
            border
            border-white/10
            bg-gradient-to-br
            from-slate-900
            via-slate-900
            to-slate-800
            p-10
            text-center
          "
        >

          <div
            className="
              mx-auto
              flex
              h-20
              w-20
              items-center
              justify-center
              rounded-full
              bg-gradient-to-r
              from-cyan-500
              to-blue-600
            "
          >
            <BookOpen
              size={38}
              className="text-white"
            />
          </div>

          <h2 className="mt-8 text-4xl font-black">
            Learn One Word Every Day
          </h2>

          <p
            className="
              mx-auto
              mt-6
              max-w-3xl
              leading-8
              text-slate-400
            "
          >
            Every day a different word is automatically selected from your
            <strong> wordOfTheDay.js </strong>
            file based on the current date. The same word remains available
            for the entire day and changes automatically at midnight.
          </p>

          <div
            className="
              mt-10
              flex
              flex-wrap
              justify-center
              gap-4
            "
          >
            <div
              className="
                rounded-full
                border
                border-cyan-500/20
                bg-cyan-500/10
                px-5
                py-3
                text-cyan-300
              "
            >
              📖 Daily Learning
            </div>

            <div
              className="
                rounded-full
                border
                border-green-500/20
                bg-green-500/10
                px-5
                py-3
                text-green-300"
              >
              🌍 Expand Vocabulary
            </div>

            <div
              className="
                rounded-full
                border
                border-purple-500/20
                bg-purple-500/10
                px-5
                py-3
                text-purple-300
              "
            >
              🚀 Speak With Confidence
            </div>

          </div>

        </motion.div>

      </div>
    </section>
  );
}