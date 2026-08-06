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
  Search,
} from "lucide-react";

import { phraseCategories } from "../../data/language/phraseCategories";

export default function Phrasebook() {
  const [activeCategory, setActiveCategory] = useState("all");
  const [favorites, setFavorites] = useState([]);
  const [copied, setCopied] = useState(null);
  const [expanded, setExpanded] = useState(null);
  const [search, setSearch] = useState("");

  /*
    CATEGORY LIST
  */
  const categories = useMemo(() => {
    return [
      {
        id: "all",
        title: "All Phrases",
        icon: "🌍",
        description: "Explore a preview phrase from every category.",
      },
      ...phraseCategories,
    ];
  }, []);

  /*
    FLATTEN ALL PHRASES
  */
  const allPhrases = useMemo(() => {
    return phraseCategories.flatMap((category) => {
      return (category.phrases || []).map((phrase) => ({
        ...phrase,
        categoryId: category.id,
        categoryTitle: category.title,
        categoryIcon: category.icon,
        categoryDescription: category.description,
      }));
    });
  }, []);

  /*
    FILTER DATA (Displays 1 phrase per category when "all" is active, or all phrases of selected category)
  */
  const visiblePhrases = useMemo(() => {
    let phrasesList = [];

    if (activeCategory === "all") {
      phrasesList = phraseCategories.map((cat) => {
        const firstPhrase = cat.phrases?.[0];
        return firstPhrase
          ? {
              ...firstPhrase,
              categoryId: cat.id,
              categoryTitle: cat.title,
              categoryIcon: cat.icon,
            }
          : null;
      }).filter(Boolean);
    } else {
      const currentCat = phraseCategories.find((cat) => cat.id === activeCategory);
      phrasesList = (currentCat?.phrases || []).map((phrase) => ({
        ...phrase,
        categoryId: currentCat.id,
        categoryTitle: currentCat.title,
        categoryIcon: currentCat.icon,
      }));
    }

    if (!search.trim()) return phrasesList;

    return phrasesList.filter(
      (phrase) =>
        phrase.english?.toLowerCase().includes(search.toLowerCase()) ||
        phrase.translation?.toLowerCase().includes(search.toLowerCase())
    );
  }, [activeCategory, search]);

  /*
    FAVORITES
  */
  const toggleFavorite = (id) => {
    setFavorites((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  /*
    SPEECH
  */
  const speak = (text) => {
    if (!window.speechSynthesis) return;

    const voice = new SpeechSynthesisUtterance(text);

    voice.lang = "en-US";
    voice.rate = 0.85;
    voice.pitch = 1;

    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(voice);
  };

  /*
    COPY
  */
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
        <div className="absolute top-0 left-0 h-[500px] w-[500px] rounded-full bg-cyan-500/10 blur-[160px]" />
        <div className="absolute bottom-0 right-0 h-[500px] w-[500px] rounded-full bg-purple-500/10 blur-[160px]" />
      </div>

      {/* HERO */}
      <section>
        <div className="mx-auto text-center max-w-7xl px-6 pt-24 pb-16">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
          >
            <div className="inline-flex items-center gap-3 rounded-full border border-cyan-400/30 bg-cyan-500/10 px-6 py-3 text-cyan-300 font-bold backdrop-blur-xl">
              <Languages size={20} />
              Premium Phrasebook
            </div>

            <h1 className="mt-8 text-5xl md:text-7xl font-black leading-tight">
              Master
              <br />
              <span className="bg-gradient-to-r from-cyan-400 via-sky-300 to-purple-400 bg-clip-text text-transparent">
                Real Conversations
              </span>
            </h1>

            <p className="mt-8  text-lg text-center leading-9 text-slate-400">
              Learn practical phrases for travel, business, school, emergencies
              and daily communication with pronunciation, tips and explanations.
            </p>

            {/* SEARCH */}
            <div className="mt-10 max-w-xl relative">
              <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search phrases..."
                className="w-full rounded-3xl border border-white/10 bg-white/5 py-5 pl-14 pr-6 outline-none text-white placeholder:text-slate-500 backdrop-blur-xl focus:border-cyan-400"
              />
            </div>

            {/* STATS */}
            <div className="mt-16 grid gap-6 md:grid-cols-4">
              {[
                { icon: <Globe />, number: "100+", title: "Languages" },
                {
                  icon: <BookOpen />,
                  number: `${allPhrases.length}+`,
                  title: "Expressions",
                },
                { icon: <Mic />, number: "Native", title: "Pronunciation" },
                { icon: <Sparkles />, number: "24/7", title: "Learning" },
              ].map((item, index) => (
                <motion.div
                  key={index}
                  whileHover={{ y: -8 }}
                  className="rounded-3xl border border-white/10 bg-white/5 p-8 backdrop-blur-2xl shadow-2xl"
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
      <section className="mx-auto max-w-7xl px-6 mt-10">
        <div className="rounded-[36px] border border-white/10 bg-white/5 p-8 backdrop-blur-xl">
          <div className="mb-8">
            <h2 className="text-3xl font-black">Explore Categories</h2>
            <p className="mt-3 text-slate-400">
              Choose a conversation area and start learning.
            </p>
          </div>

          <div className="grid gap-5 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-5">
            {categories.map((item) => (
              <motion.button
                key={item.id}
                whileHover={{ y: -6 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => setActiveCategory(item.id)}
                className={`rounded-3xl border p-6 text-left transition-all ${
                  activeCategory === item.id
                    ? "border-cyan-400 bg-cyan-500/20 shadow-xl shadow-cyan-500/20"
                    : "border-white/10 bg-slate-900/70 hover:border-cyan-500/40"
                }`}
              >
                <div className="text-4xl">{item.icon}</div>
                <h3 className="mt-4 font-black text-lg">{item.title}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-400">
                  {item.description}
                </p>
              </motion.button>
            ))}
          </div>
        </div>
      </section>

      {/* PHRASE AREA */}
      <section className="mx-auto max-w-7xl px-6 mt-20 pb-24">
        <div className="mb-12 flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-4xl font-black">Conversation Library</h2>
            <p className="mt-3 text-slate-400">
              {activeCategory === "all"
                ? "Displaying 1 preview phrase from each category in a unified grid."
                : "Learn phrases with pronunciation and practical usage."}
            </p>
          </div>

          <div className="rounded-full border border-cyan-400/30 bg-cyan-500/10 px-6 py-3 font-bold text-cyan-300">
            {visiblePhrases.length} Phrases
          </div>
        </div>

        {/* UNIFIED GRID */}
        <div className="grid gap-8 md:grid-cols-2 xl:grid-cols-3">
          {visiblePhrases.map((phrase, index) => {
            const uniquePhraseId = `${phrase.categoryId}-${phrase.id}`;
            return (
              <motion.div
                key={uniquePhraseId}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.04 }}
                whileHover={{ y: -10 }}
                className="overflow-hidden rounded-[34px] border border-white/10 bg-gradient-to-br from-slate-900 via-slate-900 to-slate-800 shadow-2xl flex flex-col justify-between"
              >
                <div>
                  {/* HEADER */}
                  <div className="flex items-start justify-between border-b border-white/10 p-7">
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-lg">{phrase.categoryIcon}</span>
                        <span className="text-xs uppercase tracking-[0.2em] text-cyan-400 font-bold">
                          {phrase.categoryTitle}
                        </span>
                      </div>
                      <p className="text-xs uppercase tracking-[0.3em] text-slate-500">
                        English
                      </p>
                      <h3 className="mt-2 text-2xl font-black">
                        {phrase.english}
                      </h3>
                    </div>

                    <button
                      onClick={() => toggleFavorite(uniquePhraseId)}
                      className="rounded-full p-3 hover:bg-yellow-500/10 transition"
                    >
                      <Star
                        size={24}
                        className={
                          favorites.includes(uniquePhraseId)
                            ? "fill-yellow-400 text-yellow-400"
                            : "text-slate-500"
                        }
                      />
                    </button>
                  </div>

                  {/* CONTENT */}
                  <div className="p-7">
                    <div>
                      <p className="text-xs uppercase tracking-[0.3em] text-slate-500">
                        Translation
                      </p>
                      <h2 className="mt-3 text-3xl font-black text-green-400">
                        {phrase.translation}
                      </h2>
                    </div>

                    <div className="mt-7 rounded-3xl bg-white/5 p-5">
                      <p className="text-xs uppercase tracking-widest text-slate-500">
                        Pronunciation
                      </p>
                      <p className="mt-3 font-bold text-cyan-300">
                        {phrase.pronunciation || "Not available"}
                      </p>
                    </div>

                    <div className="mt-6 rounded-3xl bg-purple-500/10 p-5">
                      <div className="flex items-center gap-2 font-bold text-purple-300">
                        <Sparkles size={18} />
                        Learning Tip
                      </div>
                      <p className="mt-3 leading-7 text-slate-300">
                        {phrase.tip ||
                          phrase.meaning ||
                          "Practice this phrase daily."}
                      </p>
                    </div>
                  </div>
                </div>

                <div>
                  {/* ACTIONS */}
                  <div className="border-t border-white/10 p-6 flex flex-wrap gap-3">
                    <button
                      onClick={() => speak(phrase.english)}
                      className="flex items-center gap-2 rounded-2xl bg-cyan-400 px-5 py-3 font-bold text-black transition hover:scale-105"
                    >
                      <Volume2 size={18} />
                      Listen
                    </button>

                    <button
                      onClick={() => speak(phrase.translation)}
                      className="flex items-center gap-2 rounded-2xl bg-green-400 px-5 py-3 font-bold text-black transition hover:scale-105"
                    >
                      <Mic size={18} />
                      Practice
                    </button>

                    <button
                      onClick={() => copyText(phrase.translation, uniquePhraseId)}
                      className="flex items-center gap-2 rounded-2xl bg-white/10 px-5 py-3 font-bold hover:bg-white/20 transition"
                    >
                      {copied === uniquePhraseId ? (
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
                  </div>

                  {/* EXPLANATION */}
                  <div className="border-t border-white/10">
                    <button
                      onClick={() => toggleExplanation(uniquePhraseId)}
                      className="flex w-full items-center justify-between px-7 py-6 hover:bg-white/5 transition"
                    >
                      <div className="flex items-center gap-3 font-bold text-cyan-300">
                        <Sparkles size={20} />
                        Phrase Explanation
                      </div>
                      {expanded === uniquePhraseId ? (
                        <ChevronUp />
                      ) : (
                        <ChevronDown />
                      )}
                    </button>

                    <AnimatePresence>
                      {expanded === uniquePhraseId && phrase.explanation && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.3 }}
                          className="overflow-hidden"
                        >
                          <div className="border-t border-white/10 bg-gradient-to-br from-cyan-500/5 to-purple-500/5 p-7">
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
                              <div className="mt-6 rounded-3xl bg-black/20 p-5">
                                <h4 className="font-black text-purple-300">
                                  Grammar
                                </h4>
                                <p className="mt-3 leading-7 text-slate-300">
                                  {phrase.explanation.grammar}
                                </p>
                              </div>
                            )}

                            {phrase.explanation.culture && (
                              <div className="mt-6 rounded-3xl bg-black/20 p-5">
                                <h4 className="font-black text-emerald-300">
                                  Culture
                                </h4>
                                <p className="mt-3 leading-7 text-slate-300">
                                  {phrase.explanation.culture}
                                </p>
                              </div>
                            )}

                            {phrase.explanation.whenToUse?.length > 0 && (
                              <div className="mt-6">
                                <h4 className="mb-4 font-black text-yellow-300">
                                  When To Use
                                </h4>
                                <div className="flex flex-wrap gap-3">
                                  {phrase.explanation.whenToUse.map(
                                    (item, i) => (
                                      <span
                                        key={i}
                                        className="rounded-full border border-cyan-400/20 bg-cyan-500/10 px-4 py-2 text-sm font-semibold text-cyan-300"
                                      >
                                        {item}
                                      </span>
                                    )
                                  )}
                                </div>
                              </div>
                            )}

                            {phrase.explanation.examples?.length > 0 && (
                              <div className="mt-8">
                                <h4 className="mb-4 font-black text-pink-300">
                                  Example Sentences
                                </h4>
                                <div className="space-y-3">
                                  {phrase.explanation.examples.map(
                                    (example, i) => (
                                      <div
                                        key={i}
                                        className="rounded-2xl border border-white/10 bg-black/20 p-5 italic text-slate-300"
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
                </div>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* FOOTER CTA */}
      <section className="mx-auto max-w-7xl px-6 pb-20">
        <motion.div
          whileHover={{ y: -6 }}
          className="rounded-[36px] border border-white/10 bg-gradient-to-r from-cyan-500/10 via-purple-500/10 to-blue-500/10 p-12 text-center"
        >
          <Languages size={54} className="mx-auto text-cyan-400" />
          <h2 className="mt-8 text-4xl font-black">Learn One Phrase Every Day</h2>
          <p className="mx-auto mt-5 max-w-3xl leading-8 text-slate-300">
            Daily practice builds confidence, improves pronunciation and helps you
            communicate naturally.
          </p>
        </motion.div>
      </section>
    </div>
  );
}