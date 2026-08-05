import React from "react";
import { motion } from "framer-motion";
import {
  BookOpen,
  BookText,
  GraduationCap,
  Languages,
  Brain,
  Sparkles,
  Library,
  PenTool,
  Lightbulb,
  Quote,
} from "lucide-react";

export default function Dictionary() {
  return (
    <section className="min-h-screen bg-[#020617] px-6 py-12 text-white lg:px-8">
      <div className="mx-auto max-w-7xl">

        {/* ========================================================= */}
        {/* HERO */}
        {/* ========================================================= */}

        <motion.div
          initial={{ opacity: 0, y: 25 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="
            overflow-hidden
            rounded-[36px]
            border
            border-cyan-500/20
            bg-gradient-to-br
            from-cyan-500/10
            via-blue-500/10
            to-indigo-500/10
            p-10
            lg:p-14
          "
        >
          <div className="grid items-center gap-12 lg:grid-cols-2">

            <div>

              <span
                className="
                  inline-flex
                  items-center
                  gap-2
                  rounded-full
                  bg-cyan-500/10
                  px-5
                  py-2
                  text-sm
                  font-bold
                  text-cyan-300
                "
              >
                <Library size={16} />
                Language Dictionary
              </span>

              <h1 className="mt-8 text-5xl font-black leading-tight lg:text-7xl">
                Discover The
                <span className="block bg-gradient-to-r from-cyan-300 to-blue-400 bg-clip-text text-transparent">
                  Power Of Words
                </span>
              </h1>

              <p className="mt-8 max-w-2xl text-lg leading-9 text-slate-300">
                A dictionary is much more than a collection of words.
                It helps you understand meanings, improve communication,
                strengthen your vocabulary, and become a more confident
                language learner every single day.
              </p>

            </div>

            <div className="grid gap-5 sm:grid-cols-2">

              <div className="rounded-3xl border border-white/10 bg-black/20 p-6">
                <BookOpen
                  size={34}
                  className="text-cyan-400"
                />

                <h3 className="mt-5 text-xl font-black">
                  Learn
                </h3>

                <p className="mt-3 leading-7 text-slate-400">
                  Discover the meanings of unfamiliar words and expand
                  your vocabulary naturally.
                </p>
              </div>

              <div className="rounded-3xl border border-white/10 bg-black/20 p-6">
                <Languages
                  size={34}
                  className="text-purple-400"
                />

                <h3 className="mt-5 text-xl font-black">
                  Communicate
                </h3>

                <p className="mt-3 leading-7 text-slate-400">
                  Express your ideas clearly using accurate vocabulary
                  in everyday conversations.
                </p>
              </div>

              <div className="rounded-3xl border border-white/10 bg-black/20 p-6">
                <Brain
                  size={34}
                  className="text-green-400"
                />

                <h3 className="mt-5 text-xl font-black">
                  Remember
                </h3>

                <p className="mt-3 leading-7 text-slate-400">
                  Build long-term memory through repeated exposure to
                  useful words and expressions.
                </p>
              </div>

              <div className="rounded-3xl border border-white/10 bg-black/20 p-6">
                <Sparkles
                  size={34}
                  className="text-yellow-400"
                />

                <h3 className="mt-5 text-xl font-black">
                  Grow
                </h3>

                <p className="mt-3 leading-7 text-slate-400">
                  Every new word you learn opens another opportunity to
                  understand the world around you.
                </p>
              </div>

            </div>

          </div>
        </motion.div>

        {/* ========================================================= */}
        {/* WHAT IS A DICTIONARY */}
        {/* ========================================================= */}

        <section className="mt-16">

          <motion.div
            initial={{ opacity: 0, y: 25 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="
              rounded-[32px]
              border
              border-white/10
              bg-slate-900
              p-10
            "
          >

            <div className="flex items-center gap-4">

              <div className="rounded-3xl bg-cyan-500/15 p-5">

                <BookText
                  size={36}
                  className="text-cyan-400"
                />

              </div>

              <div>

                <h2 className="text-4xl font-black">
                  What Is A Dictionary?
                </h2>

                <p className="mt-2 text-slate-400">
                  Understanding the purpose of a dictionary.
                </p>

              </div>

            </div>

            <p className="mt-10 text-lg leading-9 text-slate-300">
              A dictionary is one of the most valuable learning tools
              for anyone studying a language. It provides reliable
              information about words, their meanings, pronunciation,
              grammar, spelling, and usage in real-life situations.
            </p>

            <p className="mt-6 text-lg leading-9 text-slate-300">
              Whether you are reading a book, writing an essay,
              preparing for an examination, or speaking with others,
              a dictionary helps you understand unfamiliar vocabulary
              and use words correctly with confidence.
            </p>

          </motion.div>

        </section>

        {/* ========================================================= */}
        {/* WHY VOCABULARY MATTERS */}
        {/* ========================================================= */}

        <section className="mt-16">

          <div className="mb-10">

            <h2 className="text-4xl font-black">
              Why Vocabulary Matters
            </h2>

            <p className="mt-3 text-slate-400">
              Building your vocabulary improves every language skill.
            </p>

          </div>

          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">

            <div className="rounded-3xl border border-white/10 bg-slate-900 p-8">
              <GraduationCap
                size={34}
                className="text-cyan-400"
              />

              <h3 className="mt-6 text-2xl font-black">
                Academic Success
              </h3>

              <p className="mt-4 leading-8 text-slate-400">
                Understanding more words makes reading textbooks,
                examinations, assignments, and research much easier.
              </p>
            </div>

            <div className="rounded-3xl border border-white/10 bg-slate-900 p-8">
              <Languages
                size={34}
                className="text-purple-400"
              />

              <h3 className="mt-6 text-2xl font-black">
                Better Communication
              </h3>

              <p className="mt-4 leading-8 text-slate-400">
                A rich vocabulary allows you to express ideas clearly,
                confidently, and accurately in conversations.
              </p>
            </div>

            <div className="rounded-3xl border border-white/10 bg-slate-900 p-8">
              <PenTool
                size={34}
                className="text-pink-400"
              />

              <h3 className="mt-6 text-2xl font-black">
                Stronger Writing
              </h3>

              <p className="mt-4 leading-8 text-slate-400">
                Choosing the right words helps create clearer,
                more engaging, and more professional writing.
              </p>
            </div>

            <div className="rounded-3xl border border-white/10 bg-slate-900 p-8">
              <Brain
                size={34}
                className="text-green-400"
              />

              <h3 className="mt-6 text-2xl font-black">
                Critical Thinking
              </h3>

              <p className="mt-4 leading-8 text-slate-400">
                Learning new vocabulary improves understanding,
                reasoning, and the ability to explain complex ideas.
              </p>
            </div>

            <div className="rounded-3xl border border-white/10 bg-slate-900 p-8">
              <Lightbulb
                size={34}
                className="text-yellow-400"
              />

              <h3 className="mt-6 text-2xl font-black">
                Confidence
              </h3>

              <p className="mt-4 leading-8 text-slate-400">
                Knowing the correct words makes speaking and writing
                feel more natural and less intimidating.
              </p>
            </div>

            <div className="rounded-3xl border border-white/10 bg-slate-900 p-8">
              <Quote
                size={34}
                className="text-orange-400"
              />

              <h3 className="mt-6 text-2xl font-black">
                Self Expression
              </h3>

              <p className="mt-4 leading-8 text-slate-400">
                Every new word gives you another way to describe
                your thoughts, emotions, and experiences.
              </p>
            </div>

          </div>

        </section>
                {/* ========================================================= */}
        {/* DICTIONARY FEATURES */}
        {/* ========================================================= */}

        <section className="mt-20">

          <div className="mb-10">

            <h2 className="text-4xl font-black">
              What You Can Learn From A Dictionary
            </h2>

            <p className="mt-3 text-slate-400">
              Every dictionary entry contains valuable information that
              helps you understand and use words correctly.
            </p>

          </div>

          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">

            <motion.div
              whileHover={{ y: -8 }}
              className="rounded-3xl border border-white/10 bg-slate-900 p-7"
            >
              <BookOpen
                size={34}
                className="text-cyan-400"
              />

              <h3 className="mt-6 text-2xl font-black">
                Meaning
              </h3>

              <p className="mt-4 leading-8 text-slate-400">
                Understand what a word means and when it should be used
                in everyday communication.
              </p>

            </motion.div>

            <motion.div
              whileHover={{ y: -8 }}
              className="rounded-3xl border border-white/10 bg-slate-900 p-7"
            >
              <Languages
                size={34}
                className="text-blue-400"
              />

              <h3 className="mt-6 text-2xl font-black">
                Pronunciation
              </h3>

              <p className="mt-4 leading-8 text-slate-400">
                Learn how words are pronounced so you can speak naturally
                and confidently.
              </p>

            </motion.div>

            <motion.div
              whileHover={{ y: -8 }}
              className="rounded-3xl border border-white/10 bg-slate-900 p-7"
            >
              <PenTool
                size={34}
                className="text-purple-400"
              />

              <h3 className="mt-6 text-2xl font-black">
                Spelling
              </h3>

              <p className="mt-4 leading-8 text-slate-400">
                Improve your writing by learning the correct spelling of
                words and common vocabulary.
              </p>

            </motion.div>

            <motion.div
              whileHover={{ y: -8 }}
              className="rounded-3xl border border-white/10 bg-slate-900 p-7"
            >
              <Sparkles
                size={34}
                className="text-pink-400"
              />

              <h3 className="mt-6 text-2xl font-black">
                Examples
              </h3>

              <p className="mt-4 leading-8 text-slate-400">
                Discover practical examples that show how words are used
                naturally in real sentences.
              </p>

            </motion.div>

            <motion.div
              whileHover={{ y: -8 }}
              className="rounded-3xl border border-white/10 bg-slate-900 p-7"
            >
              <Brain
                size={34}
                className="text-green-400"
              />

              <h3 className="mt-6 text-2xl font-black">
                Grammar
              </h3>

              <p className="mt-4 leading-8 text-slate-400">
                Learn the grammatical role of words to improve sentence
                construction.
              </p>

            </motion.div>

            <motion.div
              whileHover={{ y: -8 }}
              className="rounded-3xl border border-white/10 bg-slate-900 p-7"
            >
              <Lightbulb
                size={34}
                className="text-yellow-400"
              />

              <h3 className="mt-6 text-2xl font-black">
                Usage Tips
              </h3>

              <p className="mt-4 leading-8 text-slate-400">
                Learn when, where and how particular words should be
                used correctly.
              </p>

            </motion.div>

            <motion.div
              whileHover={{ y: -8 }}
              className="rounded-3xl border border-white/10 bg-slate-900 p-7"
            >
              <Library
                size={34}
                className="text-orange-400"
              />

              <h3 className="mt-6 text-2xl font-black">
                Word Origins
              </h3>

              <p className="mt-4 leading-8 text-slate-400">
                Explore where words came from and how their meanings have
                changed over time.
              </p>

            </motion.div>

            <motion.div
              whileHover={{ y: -8 }}
              className="rounded-3xl border border-white/10 bg-slate-900 p-7"
            >
              <Quote
                size={34}
                className="text-indigo-400"
              />

              <h3 className="mt-6 text-2xl font-black">
                Vocabulary Growth
              </h3>

              <p className="mt-4 leading-8 text-slate-400">
                Every word you learn expands your ability to read,
                understand and communicate effectively.
              </p>

            </motion.div>

          </div>

        </section>

        {/* ========================================================= */}
        {/* TYPES OF WORDS */}
        {/* ========================================================= */}

        <section className="mt-20">

          <div className="mb-10">

            <h2 className="text-4xl font-black">
              Types Of Words
            </h2>

            <p className="mt-3 text-slate-400">
              Every word belongs to a grammatical category that explains
              its purpose in a sentence.
            </p>

          </div>

          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">

            <div className="rounded-3xl border border-cyan-500/20 bg-cyan-500/5 p-7">
              <h3 className="text-2xl font-black text-cyan-300">
                Nouns
              </h3>

              <p className="mt-4 leading-8 text-slate-300">
                Name people, places, animals, objects and ideas.
              </p>
            </div>

            <div className="rounded-3xl border border-blue-500/20 bg-blue-500/5 p-7">
              <h3 className="text-2xl font-black text-blue-300">
                Verbs
              </h3>

              <p className="mt-4 leading-8 text-slate-300">
                Describe actions, events or states of being.
              </p>
            </div>

            <div className="rounded-3xl border border-purple-500/20 bg-purple-500/5 p-7">
              <h3 className="text-2xl font-black text-purple-300">
                Adjectives
              </h3>

              <p className="mt-4 leading-8 text-slate-300">
                Give more information by describing nouns.
              </p>
            </div>

            <div className="rounded-3xl border border-pink-500/20 bg-pink-500/5 p-7">
              <h3 className="text-2xl font-black text-pink-300">
                Adverbs
              </h3>

              <p className="mt-4 leading-8 text-slate-300">
                Describe verbs, adjectives or other adverbs.
              </p>
            </div>

            <div className="rounded-3xl border border-green-500/20 bg-green-500/5 p-7">
              <h3 className="text-2xl font-black text-green-300">
                Pronouns
              </h3>

              <p className="mt-4 leading-8 text-slate-300">
                Replace nouns to avoid unnecessary repetition.
              </p>
            </div>

            <div className="rounded-3xl border border-yellow-500/20 bg-yellow-500/5 p-7">
              <h3 className="text-2xl font-black text-yellow-300">
                Prepositions
              </h3>

              <p className="mt-4 leading-8 text-slate-300">
                Show relationships between words such as place, time and
                direction.
              </p>
            </div>

            <div className="rounded-3xl border border-orange-500/20 bg-orange-500/5 p-7">
              <h3 className="text-2xl font-black text-orange-300">
                Conjunctions
              </h3>

              <p className="mt-4 leading-8 text-slate-300">
                Connect words, phrases and complete sentences together.
              </p>
            </div>

            <div className="rounded-3xl border border-red-500/20 bg-red-500/5 p-7">
              <h3 className="text-2xl font-black text-red-300">
                Interjections
              </h3>

              <p className="mt-4 leading-8 text-slate-300">
                Express strong feelings, surprise, excitement or emotion.
              </p>
            </div>

          </div>

        </section>
                {/* ========================================================= */}
        {/* HOW TO USE A DICTIONARY */}
        {/* ========================================================= */}

        <section className="mt-20">

          <div className="mb-10">

            <h2 className="text-4xl font-black">
              How To Use A Dictionary Effectively
            </h2>

            <p className="mt-3 max-w-3xl text-slate-400">
              Using a dictionary is more than simply looking up a word.
              The more information you explore about each word, the
              faster your language skills improve.
            </p>

          </div>

          <div className="space-y-6">

            <motion.div
              whileHover={{ x: 6 }}
              className="flex gap-6 rounded-3xl border border-white/10 bg-slate-900 p-8"
            >

              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-cyan-500/10 text-xl font-black text-cyan-300">
                1
              </div>

              <div>

                <h3 className="text-2xl font-black">
                  Read The Meaning Carefully
                </h3>

                <p className="mt-3 leading-8 text-slate-400">
                  Don't stop at the first definition. Some words have
                  multiple meanings depending on how they are used.
                </p>

              </div>

            </motion.div>

            <motion.div
              whileHover={{ x: 6 }}
              className="flex gap-6 rounded-3xl border border-white/10 bg-slate-900 p-8"
            >

              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-500/10 text-xl font-black text-blue-300">
                2
              </div>

              <div>

                <h3 className="text-2xl font-black">
                  Study The Example Sentence
                </h3>

                <p className="mt-3 leading-8 text-slate-400">
                  Examples show how native speakers naturally use a word
                  in everyday conversations and writing.
                </p>

              </div>

            </motion.div>

            <motion.div
              whileHover={{ x: 6 }}
              className="flex gap-6 rounded-3xl border border-white/10 bg-slate-900 p-8"
            >

              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-purple-500/10 text-xl font-black text-purple-300">
                3
              </div>

              <div>

                <h3 className="text-2xl font-black">
                  Learn Related Words
                </h3>

                <p className="mt-3 leading-8 text-slate-400">
                  Understanding similar and opposite words helps expand
                  your vocabulary much faster.
                </p>

              </div>

            </motion.div>

            <motion.div
              whileHover={{ x: 6 }}
              className="flex gap-6 rounded-3xl border border-white/10 bg-slate-900 p-8"
            >

              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-green-500/10 text-xl font-black text-green-300">
                4
              </div>

              <div>

                <h3 className="text-2xl font-black">
                  Practice The Word
                </h3>

                <p className="mt-3 leading-8 text-slate-400">
                  Use newly learned words in conversations, writing and
                  personal notes to remember them for a long time.
                </p>

              </div>

            </motion.div>

          </div>

        </section>

        {/* ========================================================= */}
        {/* VOCABULARY LEARNING TIPS */}
        {/* ========================================================= */}

        <section className="mt-20">

          <div className="mb-10">

            <h2 className="text-4xl font-black">
              Vocabulary Learning Tips
            </h2>

            <p className="mt-3 text-slate-400">
              Small daily habits can lead to remarkable language
              improvement over time.
            </p>

          </div>

          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">

            <motion.div
              whileHover={{ y: -8 }}
              className="rounded-3xl border border-cyan-500/20 bg-cyan-500/5 p-8"
            >
              <Brain
                size={34}
                className="text-cyan-400"
              />

              <h3 className="mt-6 text-2xl font-black">
                Learn Daily
              </h3>

              <p className="mt-4 leading-8 text-slate-300">
                Learning just a few words every day builds a strong
                vocabulary over time.
              </p>

            </motion.div>

            <motion.div
              whileHover={{ y: -8 }}
              className="rounded-3xl border border-green-500/20 bg-green-500/5 p-8"
            >
              <BookOpen
                size={34}
                className="text-green-400"
              />

              <h3 className="mt-6 text-2xl font-black">
                Read More
              </h3>

              <p className="mt-4 leading-8 text-slate-300">
                Books, newspapers and articles introduce you to useful
                vocabulary in real contexts.
              </p>

            </motion.div>

            <motion.div
              whileHover={{ y: -8 }}
              className="rounded-3xl border border-purple-500/20 bg-purple-500/5 p-8"
            >
              <Languages
                size={34}
                className="text-purple-400"
              />

              <h3 className="mt-6 text-2xl font-black">
                Speak Often
              </h3>

              <p className="mt-4 leading-8 text-slate-300">
                Speaking regularly helps move words from memory into
                natural everyday use.
              </p>

            </motion.div>

            <motion.div
              whileHover={{ y: -8 }}
              className="rounded-3xl border border-yellow-500/20 bg-yellow-500/5 p-8"
            >
              <PenTool
                size={34}
                className="text-yellow-400"
              />

              <h3 className="mt-6 text-2xl font-black">
                Write Frequently
              </h3>

              <p className="mt-4 leading-8 text-slate-300">
                Keeping a journal or writing short paragraphs reinforces
                newly learned vocabulary.
              </p>

            </motion.div>

            <motion.div
              whileHover={{ y: -8 }}
              className="rounded-3xl border border-pink-500/20 bg-pink-500/5 p-8"
            >
              <Sparkles
                size={34}
                className="text-pink-400"
              />

              <h3 className="mt-6 text-2xl font-black">
                Review Regularly
              </h3>

              <p className="mt-4 leading-8 text-slate-300">
                Revisiting familiar words prevents forgetting and
                strengthens long-term memory.
              </p>

            </motion.div>

            <motion.div
              whileHover={{ y: -8 }}
              className="rounded-3xl border border-orange-500/20 bg-orange-500/5 p-8"
            >
              <Lightbulb
                size={34}
                className="text-orange-400"
              />

              <h3 className="mt-6 text-2xl font-black">
                Stay Curious
              </h3>

              <p className="mt-4 leading-8 text-slate-300">
                Whenever you encounter a new word, take a moment to learn
                its meaning, pronunciation and usage.
              </p>

            </motion.div>

          </div>

        </section>
                {/* ========================================================= */}
        {/* DICTIONARY FACTS */}
        {/* ========================================================= */}

        <section className="mt-20">

          <div className="mb-10">

            <h2 className="text-4xl font-black">
              Interesting Dictionary Facts
            </h2>

            <p className="mt-3 max-w-3xl text-slate-400">
              Dictionaries have evolved for centuries and continue to be
              one of the most important learning resources in the world.
            </p>

          </div>

          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">

            <motion.div
              whileHover={{ y: -8 }}
              className="rounded-3xl border border-cyan-500/20 bg-cyan-500/5 p-8"
            >

              <h1 className="text-5xl font-black text-cyan-400">
                100+
              </h1>

              <h3 className="mt-5 text-2xl font-black">
                Languages
              </h3>

              <p className="mt-4 leading-8 text-slate-300">
                Modern dictionaries exist for hundreds of languages
                spoken across the world.
              </p>

            </motion.div>

            <motion.div
              whileHover={{ y: -8 }}
              className="rounded-3xl border border-purple-500/20 bg-purple-500/5 p-8"
            >

              <h1 className="text-5xl font-black text-purple-400">
                Millions
              </h1>

              <h3 className="mt-5 text-2xl font-black">
                Of Words
              </h3>

              <p className="mt-4 leading-8 text-slate-300">
                Languages constantly grow as new words are created every
                year.
              </p>

            </motion.div>

            <motion.div
              whileHover={{ y: -8 }}
              className="rounded-3xl border border-green-500/20 bg-green-500/5 p-8"
            >

              <h1 className="text-5xl font-black text-green-400">
                Daily
              </h1>

              <h3 className="mt-5 text-2xl font-black">
                Learning
              </h3>

              <p className="mt-4 leading-8 text-slate-300">
                Learning one new word every day can greatly improve your
                vocabulary over time.
              </p>

            </motion.div>

            <motion.div
              whileHover={{ y: -8 }}
              className="rounded-3xl border border-orange-500/20 bg-orange-500/5 p-8"
            >

              <h1 className="text-5xl font-black text-orange-400">
                Forever
              </h1>

              <h3 className="mt-5 text-2xl font-black">
                Growing
              </h3>

              <p className="mt-4 leading-8 text-slate-300">
                Every language continues to evolve as cultures and
                technology change.
              </p>

            </motion.div>

          </div>

        </section>

        {/* ========================================================= */}
        {/* DID YOU KNOW */}
        {/* ========================================================= */}

        <section className="mt-20">

          <motion.div
            whileHover={{ y: -5 }}
            className="
              rounded-[32px]
              border
              border-indigo-500/20
              bg-gradient-to-br
              from-indigo-500/10
              via-blue-500/10
              to-cyan-500/10
              p-10
            "
          >

            <div className="flex items-center gap-4">

              <div className="rounded-3xl bg-indigo-500/15 p-5">

                <Sparkles
                  size={34}
                  className="text-indigo-300"
                />

              </div>

              <div>

                <h2 className="text-4xl font-black">
                  Did You Know?
                </h2>

                <p className="mt-2 text-slate-400">
                  Language is constantly changing.
                </p>

              </div>

            </div>

            <div className="mt-10 grid gap-6 md:grid-cols-2">

              <div className="rounded-3xl bg-black/20 p-7">

                <h3 className="text-2xl font-black text-cyan-300">
                  New Words
                </h3>

                <p className="mt-4 leading-8 text-slate-300">
                  New words are added to dictionaries every year as
                  technology, science and culture continue to evolve.
                </p>

              </div>

              <div className="rounded-3xl bg-black/20 p-7">

                <h3 className="text-2xl font-black text-purple-300">
                  Language Never Stops Growing
                </h3>

                <p className="mt-4 leading-8 text-slate-300">
                  Every generation contributes new expressions,
                  vocabulary and meanings to languages around the world.
                </p>

              </div>

            </div>

          </motion.div>

        </section>

        {/* ========================================================= */}
        {/* DAILY MOTIVATION */}
        {/* ========================================================= */}

       <section className="mt-24">

  <motion.div
    initial={{
      opacity: 0,
      y: 40,
    }}
    whileInView={{
      opacity: 1,
      y: 0,
    }}
    viewport={{
      once: true,
    }}
    transition={{
      duration: 0.6,
    }}
    whileHover={{
      y: -6,
    }}
    className="
      relative
      overflow-hidden
      rounded-[40px]
      border
      border-cyan-500/15
      bg-gradient-to-br
      from-slate-900
      via-[#08111f]
      to-slate-950
      p-12
      lg:p-16
    "
  >

    {/* Decorative Background */}

    <div className="absolute -top-24 -right-24 h-72 w-72 rounded-full bg-cyan-500/10 blur-3xl" />

    <div className="absolute -bottom-24 -left-24 h-72 w-72 rounded-full bg-blue-500/10 blur-3xl" />

    <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(34,211,238,0.06),transparent_45%)]" />

    <div className="relative z-10">

      <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-[28px] border border-cyan-500/20 bg-cyan-500/10">

        <Quote
          size={46}
          className="text-cyan-400"
        />

      </div>

      <span
        className="
          mt-8
          inline-flex
          items-center
          rounded-full
          border
          border-cyan-500/20
          bg-cyan-500/10
          px-5
          py-2
          text-sm
          font-bold
          uppercase
          tracking-[0.25em]
          text-cyan-300
        "
      >
        Daily Inspiration
      </span>

      <h2
        className="
          mx-auto
          mt-8
          max-w-4xl
          text-4xl
          font-black
          leading-tight
          text-white
          md:text-5xl
          xl:text-6xl
        "
      >
        Every New Word Opens
        <br />
        A New Way To Think
      </h2>

      <p
        className="
          mx-auto
          mt-8
          max-w-5xl
          text-lg
          leading-9
          text-slate-300
          lg:text-xl
        "
      >
        Language shapes ideas, conversations and opportunities.
        Every word you understand expands your ability to express
        yourself, discover new perspectives and communicate with
        confidence. Keep exploring, keep learning and let your
        vocabulary become one of your greatest strengths.
      </p>

      <div className="mt-14 grid gap-6 md:grid-cols-3">

        <div
          className="
            rounded-3xl
            border
            border-white/10
            bg-white/5
            p-7
            backdrop-blur-xl
          "
        >

          <h3 className="text-4xl font-black text-cyan-400">
            Learn
          </h3>

          <p className="mt-4 leading-8 text-slate-300">
            Discover new words that improve your reading,
            speaking and writing every day.
          </p>

        </div>

        <div
          className="
            rounded-3xl
            border
            border-white/10
            bg-white/5
            p-7
            backdrop-blur-xl
          "
        >

          <h3 className="text-4xl font-black text-blue-400">
            Practice
          </h3>

          <p className="mt-4 leading-8 text-slate-300">
            Reinforce your vocabulary by using newly learned
            words in real conversations and writing.
          </p>

        </div>

        <div
          className="
            rounded-3xl
            border
            border-white/10
            bg-white/5
            p-7
            backdrop-blur-xl
          "
        >

          <h3 className="text-4xl font-black text-purple-400">
            Master
          </h3>

          <p className="mt-4 leading-8 text-slate-300">
            Build lasting confidence through consistent learning
            and continuous vocabulary growth.
          </p>

        </div>

      </div>

    </div>

  </motion.div>

</section>
      </div>

    </section>
  );
}