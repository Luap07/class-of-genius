import React, { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Globe,
  Languages,
  BookOpen,
  Sparkles,
  Volume2,
  Mic,
  Copy,
  Check,
  Star,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { phraseCategories } from "../../data/language/phraseCategories";

export default function Phrasebook() {
  const [activeCategory, setActiveCategory] = useState("all");
  const [favorites, setFavorites] = useState([]);
  const [copied, setCopied] = useState(null);
  const [expanded, setExpanded] = useState(null);

  const categories = useMemo(
    () => [
      {
        id: "all",
        title: "All",
        icon: "🌍",
      },
      ...phraseCategories,
    ],
    []
  );

  const phrases = useMemo(() => {
    if (!phraseCategories || !phraseCategories.length) return [];

    if (activeCategory === "all") {
      return phraseCategories.flatMap((category) =>
        (category.phrases || []).map((phrase) => ({
          ...phrase,
          category: category.title || "General",
          categoryIcon: category.icon || "📁",
        }))
      );
    }

    const selected = phraseCategories.find(
      (item) => item.id === activeCategory
    );

    if (!selected || !selected.phrases) return [];

    return selected.phrases.map((phrase) => ({
      ...phrase,
      category: selected.title || "General",
      categoryIcon: selected.icon || "📁",
    }));
  }, [activeCategory]);

  const toggleFavorite = (id) => {
    setFavorites((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const speak = (text) => {
    if (!window.speechSynthesis) return;
    const speech = new SpeechSynthesisUtterance(text);
    speech.lang = "en-US";
    speech.rate = 0.9;
    speech.pitch = 1;
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(speech);
  };

  const copyText = (text, id) => {
    navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => {
      setCopied(null);
    }, 1500);
  };

  const toggleExplanation = (id) => {
    setExpanded((prev) => (prev === id ? null : id));
  };

  return (
    <div className="min-h-screen overflow-hidden bg-[#020617] text-white">
      {/* BACKGROUND */}
      <div className="fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-[#020617]" />
        <div className="absolute left-0 top-0 h-[500px] w-[500px] rounded-full bg-cyan-500/10 blur-[160px]" />
        <div className="absolute right-0 bottom-0 h-[500px] w-[500px] rounded-full bg-purple-500/10 blur-[160px]" />
      </div>

      {/* HERO */}
      <section className="relative">
        <div className="mx-auto max-w-7xl px-6 pt-24 pb-16">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
          >
            <div className="inline-flex items-center gap-3 rounded-full border border-cyan-400/30 bg-cyan-500/10 px-6 py-3 font-bold text-cyan-300 backdrop-blur-xl">
              <Languages size={20} />
              Premium Phrasebook
            </div>

            <h1 className="mt-8 max-w-5xl text-5xl font-black leading-tight md:text-7xl">
              Learn
              <br />
              <span className="bg-gradient-to-r from-cyan-400 via-sky-300 to-purple-400 bg-clip-text text-transparent">
                Real Conversations
              </span>
            </h1>

            <p className="mt-8 max-w-3xl text-lg leading-9 text-slate-400">
              Master useful expressions for travel, business, school, shopping,
              emergencies and everyday life. Every phrase comes with pronunciation,
              learning tips and a detailed explanation.
            </p>

            {/* PREMIUM STATS */}
            <div className="mt-16 grid gap-6 md:grid-cols-4">
              {[
                {
                  icon: <Globe size={28} />,
                  number: "100+",
                  title: "Languages",
                },
                {
                  icon: <BookOpen size={28} />,
                  number: `${phrases.length}+`,
                  title: "Expressions",
                },
                {
                  icon: <Mic size={28} />,
                  number: "Native",
                  title: "Pronunciation",
                },
                {
                  icon: <Sparkles size={28} />,
                  number: "24/7",
                  title: "Learning",
                },
              ].map((item, index) => (
                <motion.div
                  key={index}
                  whileHover={{ y: -8 }}
                  className="rounded-3xl border border-white/10 bg-white/5 backdrop-blur-2xl p-8 shadow-2xl"
                >
                  <div className="text-cyan-400">{item.icon}</div>
                  <h2 className="mt-6 text-4xl font-black">{item.number}</h2>
                  <p className="mt-2 text-slate-400">{item.title}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* CATEGORY NAVIGATION */}
      <section className="mx-auto mt-16 max-w-7xl px-6">
        <div className="rounded-[34px] border border-white/10 bg-white/5 backdrop-blur-xl p-8">
          <div className="mb-8">
            <h2 className="text-3xl font-black">Explore Categories</h2>
            <p className="mt-3 text-slate-400">
              Select a category to browse useful phrases.
            </p>
          </div>

          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6">
            {categories.map((item) => (
              <motion.button
                key={item.id}
                whileHover={{ y: -5 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => setActiveCategory(item.id)}
                className={`rounded-3xl border p-6 text-left transition-all ${
                  activeCategory === item.id
                    ? "border-cyan-400 bg-cyan-500/20 shadow-xl shadow-cyan-500/20"
                    : "border-white/10 bg-slate-900/70 hover:border-cyan-500/40"
                }`}
              >
                <div className="text-4xl">{item.icon}</div>
                <h3 className="mt-4 text-lg font-black">{item.title}</h3>
                {item.description && (
                  <p className="mt-2 text-sm leading-6 text-slate-400">
                    {item.description}
                  </p>
                )}
              </motion.button>
            ))}
          </div>
        </div>
      </section>

      {/* PHRASES */}
      <section className="mx-auto mt-20 max-w-7xl px-6 pb-24">
        <div className="mb-10 flex items-center justify-between">
          <div>
            <h2 className="text-4xl font-black">Everyday Conversations</h2>
            <p className="mt-3 text-slate-400">
              {activeCategory === "all"
                ? "Showing phrases from every category."
                : `Showing ${phrases.length} phrases.`}
            </p>
          </div>

          <div className="rounded-full border border-cyan-400/20 bg-cyan-500/10 px-6 py-3 font-bold text-cyan-300">
            {phrases.length} Phrases
          </div>
        </div>

        <div className="grid gap-8">
          {phrases.map((phrase, index) => (
            <motion.div
              key={`${phrase.id}-${index}`}
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.03 }}
              whileHover={{ y: -8 }}
              className="overflow-hidden rounded-[34px] border border-white/10 bg-gradient-to-br from-slate-900 via-slate-900 to-slate-800 shadow-2xl"
            >
              {/* CARD HEADER */}
              <div className="flex items-center justify-between border-b border-white/10 px-8 py-6">
                <div className="flex items-center gap-4">
                  <div className="text-4xl">{phrase.categoryIcon}</div>
                  <div>
                    <p className="text-sm text-slate-400">{phrase.category}</p>
                    <h3 className="text-xl font-black">{phrase.english}</h3>
                  </div>
                </div>

                <button
                  onClick={() => toggleFavorite(phrase.id)}
                  className="rounded-full p-3 transition hover:bg-yellow-500/10"
                >
                  <Star
                    size={22}
                    className={
                      favorites.includes(phrase.id)
                        ? "fill-yellow-400 text-yellow-400"
                        : "text-slate-500"
                    }
                  />
                </button>
              </div>

              {/* CONTENT */}
              <div className="grid gap-8 p-8 lg:grid-cols-2">
                <div>
                  <p className="text-xs uppercase tracking-[0.35em] text-slate-500">
                    Translation
                  </p>
                  <h2 className="mt-5 text-4xl font-black text-green-400">
                    {phrase.translation}
                  </h2>

                  <div className="mt-8">
                    <p className="text-xs uppercase tracking-[0.35em] text-slate-500">
                      Pronunciation
                    </p>
                    <p className="mt-3 text-xl font-bold text-cyan-300">
                      {phrase.pronunciation || "Pronunciation not available"}
                    </p>
                  </div>
                </div>

                <div>
                  <div className="rounded-3xl bg-slate-800/60 p-6">
                    <div className="flex items-center gap-2 font-bold text-purple-300">
                      <Sparkles size={18} />
                      Learning Tip
                    </div>
                    <p className="mt-4 leading-8 text-slate-300">
                      {phrase.tip || phrase.meaning || "Keep practicing daily!"}
                    </p>
                  </div>
                </div>
              </div>

              {/* ACTION BAR */}
              <div className="flex flex-wrap gap-4 border-t border-white/10 px-8 py-6">
                <button
                  onClick={() => speak(phrase.english)}
                  className="rounded-2xl bg-cyan-500 px-6 py-3 font-bold text-black transition hover:scale-105"
                >
                  <div className="flex items-center gap-2">
                    <Volume2 size={18} />
                    Listen
                  </div>
                </button>

                <button
                  onClick={() => speak(phrase.translation)}
                  className="rounded-2xl bg-green-500 px-6 py-3 font-bold text-black transition hover:scale-105"
                >
                  <div className="flex items-center gap-2">
                    <Mic size={18} />
                    Practice
                  </div>
                </button>

                <button
                  onClick={() => copyText(phrase.translation, phrase.id)}
                  className="rounded-2xl bg-slate-800 px-6 py-3 font-bold"
                >
                  <div className="flex items-center gap-2">
                    {copied === phrase.id ? (
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
                  </div>
                </button>
              </div>

              {/* EXPLANATION */}
              <div className="border-t border-white/10">
                <button
                  onClick={() => toggleExplanation(phrase.id)}
                  className="flex w-full items-center justify-between px-8 py-6 transition hover:bg-white/5"
                >
                  <div className="flex items-center gap-3">
                    <Sparkles className="text-cyan-400" size={20} />
                    <span className="font-bold text-cyan-300">
                      Explain Phrase
                    </span>
                  </div>

                  {expanded === phrase.id ? (
                    <ChevronUp className="text-cyan-300" />
                  ) : (
                    <ChevronDown className="text-cyan-300" />
                  )}
                </button>

                <AnimatePresence>
                  {expanded === phrase.id && phrase.explanation && (
                    <motion.div
                      initial={{
                        opacity: 0,
                        height: 0,
                      }}
                      animate={{
                        opacity: 1,
                        height: "auto",
                      }}
                      exit={{
                        opacity: 0,
                        height: 0,
                      }}
                      transition={{
                        duration: 0.3,
                      }}
                      className="overflow-hidden"
                    >
                      <div className="border-t border-white/10 bg-gradient-to-br from-cyan-500/5 to-purple-500/5 p-8">
                        {phrase.explanation.title && (
                          <h3 className="text-2xl font-black text-cyan-300">
                            {phrase.explanation.title}
                          </h3>
                        )}

                        {phrase.explanation.content && (
                          <p className="mt-5 leading-8 text-slate-300">
                            {phrase.explanation.content}
                          </p>
                        )}

                        {phrase.explanation.grammar && (
                          <div className="mt-8 rounded-3xl bg-slate-900/70 p-6">
                            <h4 className="font-black text-purple-300">
                              Grammar
                            </h4>
                            <p className="mt-3 leading-8 text-slate-300">
                              {phrase.explanation.grammar}
                            </p>
                          </div>
                        )}

                        {phrase.explanation.culture && (
                          <div className="mt-6 rounded-3xl bg-slate-900/70 p-6">
                            <h4 className="font-black text-emerald-300">
                              Culture
                            </h4>
                            <p className="mt-3 leading-8 text-slate-300">
                              {phrase.explanation.culture}
                            </p>
                          </div>
                        )}

                        {phrase.explanation.whenToUse &&
                          phrase.explanation.whenToUse.length > 0 && (
                            <div className="mt-6">
                              <h4 className="mb-4 font-black text-yellow-300">
                                When To Use
                              </h4>
                              <div className="flex flex-wrap gap-3">
                                {phrase.explanation.whenToUse.map((item, index) => (
                                  <span
                                    key={index}
                                    className="rounded-full border border-cyan-400/20 bg-cyan-500/10 px-4 py-2 text-sm font-semibold text-cyan-300"
                                  >
                                    {item}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}

                        {phrase.explanation.examples &&
                          phrase.explanation.examples.length > 0 && (
                            <div className="mt-8">
                              <h4 className="mb-4 font-black text-pink-300">
                                Example Sentences
                              </h4>
                              <div className="space-y-4">
                                {phrase.explanation.examples.map(
                                  (example, index) => (
                                    <div
                                      key={index}
                                      className="rounded-2xl border border-white/10 bg-slate-900/70 p-5 italic text-slate-300"
                                    >
                                      "{example}"
                                    </div>
                                  )
                                )}
                              </div>
                            </div>
                          )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* FOOTER */}
      <section className="mx-auto max-w-7xl px-6 pb-20">
        <motion.div
          whileHover={{ y: -5 }}
          className="rounded-[36px] border border-white/10 bg-gradient-to-r from-cyan-500/10 via-purple-500/10 to-blue-500/10 p-12 text-center"
        >
          <Languages size={54} className="mx-auto text-cyan-400" />
          <h2 className="mt-8 text-4xl font-black">Learn One Phrase Every Day</h2>
          <p className="mx-auto mt-5 max-w-3xl leading-9 text-slate-300">
            Consistent daily practice builds confidence, improves pronunciation and
            helps you speak naturally in real-life situations.
          </p>
        </motion.div>
      </section>
    </div>
  );
}