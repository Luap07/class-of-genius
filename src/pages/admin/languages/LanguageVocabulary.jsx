import React, {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import { motion } from "framer-motion";

import {
  Loader2,
  Search,
  Plus,
  BookOpen,
  Languages,
  Star,
  Volume2,
} from "lucide-react";

import { supabase } from "../../../lib/supabaseClient";

export default function LanguageVocabulary({
  language,
  refresh,
}) {
  const [loading, setLoading] = useState(true);

  const [vocabulary, setVocabulary] = useState([]);

  const [search, setSearch] = useState("");

  const [showModal, setShowModal] = useState(false);

  const [editingWord, setEditingWord] = useState(null);

    const [saving, setSaving] = useState(false);

const [word, setWord] = useState("");
const [translation, setTranslation] = useState("");

const [pronunciation, setPronunciation] = useState("");
const [ipa, setIpa] = useState("");

const [partOfSpeech, setPartOfSpeech] = useState("");

const [definition, setDefinition] = useState("");

const [exampleSentence, setExampleSentence] = useState("");
const [exampleTranslation, setExampleTranslation] = useState("");

const [imageUrl, setImageUrl] = useState("");
const [audioUrl, setAudioUrl] = useState("");

const [difficulty, setDifficulty] = useState("Beginner");

const [sortOrder, setSortOrder] = useState(0);

const [featured, setFeatured] = useState(false);
  const fetchVocabulary = useCallback(async () => {
    if (!language?.id) return;

    try {
      setLoading(true);

      const { data, error } = await supabase
        .from("language_vocabulary")
        .select("*")
        .eq("language_id", language.id)
        .order("sort_order", {
          ascending: true,
        });

      if (error) throw error;

      setVocabulary(data || []);
    } catch (err) {
      console.error("Vocabulary Fetch Error:", err);
    } finally {
      setLoading(false);
    }
  }, [language]);

  useEffect(() => {
    fetchVocabulary();
  }, [fetchVocabulary]);
useEffect(() => {
  if (editingWord) {
    setWord(editingWord.word || "");
    setTranslation(editingWord.translation || "");
    setPronunciation(editingWord.pronunciation || "");
    setIpa(editingWord.ipa || "");
    setPartOfSpeech(editingWord.part_of_speech || "");
    setDefinition(editingWord.definition || "");
    setExampleSentence(editingWord.example_sentence || "");
    setExampleTranslation(editingWord.example_translation || "");
    setImageUrl(editingWord.image_url || "");
    setAudioUrl(editingWord.audio_url || "");
    setDifficulty(editingWord.difficulty || "Beginner");
    setSortOrder(editingWord.sort_order || 0);
    setFeatured(editingWord.featured || false);
  } else {
    setWord("");
    setTranslation("");
    setPronunciation("");
    setIpa("");
    setPartOfSpeech("");
    setDefinition("");
    setExampleSentence("");
    setExampleTranslation("");
    setImageUrl("");
    setAudioUrl("");
    setDifficulty("Beginner");
    setSortOrder(0);
    setFeatured(false);
  }
}, [editingWord, showModal]);
  const filteredVocabulary = useMemo(() => {
    const keyword = search.toLowerCase();

    return vocabulary.filter((item) => {
      return (
        item.word?.toLowerCase().includes(keyword) ||
        item.translation?.toLowerCase().includes(keyword) ||
        item.definition?.toLowerCase().includes(keyword) ||
        item.part_of_speech?.toLowerCase().includes(keyword)
      );
    });
  }, [vocabulary, search]);

  const stats = useMemo(() => {
    return {
      total: vocabulary.length,

      featured: vocabulary.filter(
        (item) => item.featured
      ).length,

      beginner: vocabulary.filter(
        (item) => item.difficulty === "Beginner"
      ).length,

      audio: vocabulary.filter(
        (item) => item.audio_url
      ).length,
    };
  }, [vocabulary]);

  if (loading) {
    return (
      <div className="flex min-h-[600px] items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-cyan-400" />
      </div>
    );
  }

  return (
    <div className="space-y-8">

      <motion.div
        initial={{
          opacity: 0,
          y: 25,
        }}
        animate={{
          opacity: 1,
          y: 0,
        }}
        className="rounded-3xl border border-cyan-500/20 bg-gradient-to-r from-cyan-500/10 via-blue-500/5 to-indigo-500/10 p-8"
      >

        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">

          <div>

            <div className="mb-4 flex items-center gap-3">

              <Languages className="h-6 w-6 text-cyan-400" />

              <span className="rounded-full bg-cyan-500/10 px-4 py-1 text-xs font-bold uppercase tracking-[0.3em] text-cyan-300">

                Vocabulary Manager

              </span>

            </div>

            <h2 className="text-4xl font-black text-white">

              {language?.name} Vocabulary

            </h2>

            <p className="mt-3 max-w-3xl text-slate-400">

              Manage words, meanings, pronunciations,
              examples, audio and vocabulary lessons.

            </p>

          </div>

          <button
            onClick={() => {
              setEditingWord(null);
              setShowModal(true);
            }}
            className="flex items-center gap-3 rounded-2xl bg-cyan-500 px-6 py-4 font-bold text-black transition hover:bg-cyan-400"
          >
            <Plus className="h-5 w-5" />

            New Vocabulary

          </button>

        </div>

      </motion.div>
            {/* Statistics */}

      <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4">

        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-3xl border border-cyan-500/20 bg-cyan-500/10 p-6"
        >
          <div className="flex items-center justify-between">

            <div>

              <p className="text-sm text-slate-400">
                Total Words
              </p>

              <h3 className="mt-2 text-4xl font-black">
                {stats.total}
              </h3>

            </div>

            <BookOpen className="h-10 w-10 text-cyan-400" />

          </div>

        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="rounded-3xl border border-yellow-500/20 bg-yellow-500/10 p-6"
        >
          <div className="flex items-center justify-between">

            <div>

              <p className="text-sm text-slate-400">
                Featured
              </p>

              <h3 className="mt-2 text-4xl font-black">
                {stats.featured}
              </h3>

            </div>

            <Star className="h-10 w-10 text-yellow-400" />

          </div>

        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.10 }}
          className="rounded-3xl border border-emerald-500/20 bg-emerald-500/10 p-6"
        >
          <div className="flex items-center justify-between">

            <div>

              <p className="text-sm text-slate-400">
                Beginner
              </p>

              <h3 className="mt-2 text-4xl font-black">
                {stats.beginner}
              </h3>

            </div>

            <Languages className="h-10 w-10 text-emerald-400" />

          </div>

        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="rounded-3xl border border-purple-500/20 bg-purple-500/10 p-6"
        >
          <div className="flex items-center justify-between">

            <div>

              <p className="text-sm text-slate-400">
                Audio
              </p>

              <h3 className="mt-2 text-4xl font-black">
                {stats.audio}
              </h3>

            </div>

            <Volume2 className="h-10 w-10 text-purple-400" />

          </div>

        </motion.div>

      </div>

      {/* Toolbar */}

      <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-6">

        <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">

          <div className="relative w-full lg:max-w-xl">

            <Search
              size={20}
              className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-500"
            />

            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search vocabulary..."
              className="w-full rounded-2xl border border-white/10 bg-black/20 py-4 pl-14 pr-5 text-white outline-none transition focus:border-cyan-500"
            />

          </div>

          <div className="flex flex-wrap gap-3">

            <button
              onClick={fetchVocabulary}
              className="rounded-2xl border border-cyan-500/20 bg-cyan-500/10 px-6 py-3 font-semibold transition hover:bg-cyan-500/20"
            >
              Refresh
            </button>

            <button
              onClick={() => {
                setEditingWord(null);
                setShowModal(true);
              }}
              className="rounded-2xl bg-cyan-500 px-6 py-3 font-bold text-black transition hover:bg-cyan-400"
            >
              + New Word
            </button>

          </div>

        </div>

      </div>
            {/* Vocabulary Grid */}

      {filteredVocabulary.length === 0 ? (

        <div className="rounded-3xl border border-dashed border-white/10 bg-white/[0.03] py-24 text-center">

          <Languages className="mx-auto mb-6 h-16 w-16 text-slate-600" />

          <h3 className="text-2xl font-black text-white">

            No Vocabulary Added

          </h3>

          <p className="mt-3 text-slate-400">

            Create your first vocabulary word for this language.

          </p>

          <button
            onClick={() => {
              setEditingWord(null);
              setShowModal(true);
            }}
            className="mt-8 rounded-2xl bg-cyan-500 px-8 py-4 font-bold text-black transition hover:bg-cyan-400"
          >
            Create First Word
          </button>

        </div>

      ) : (

        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">

          {filteredVocabulary.map((word, index) => (

            <motion.div
              key={word.id}
              initial={{
                opacity: 0,
                y: 25,
              }}
              animate={{
                opacity: 1,
                y: 0,
              }}
              transition={{
                delay: index * 0.04,
              }}
              className="group overflow-hidden rounded-3xl border border-white/10 bg-white/[0.04] transition-all duration-300 hover:border-cyan-500/40 hover:bg-white/[0.06]"
            >

              <div className="p-7">

                <div className="mb-6 flex items-start justify-between">

                  <div>

                    <h3 className="text-3xl font-black text-white">

                      {word.word}

                    </h3>

                    <p className="mt-2 text-lg font-semibold text-cyan-300">

                      {word.translation || "-"}

                    </p>

                  </div>

                  {word.featured && (

                    <span className="rounded-full bg-yellow-500/20 px-3 py-1 text-xs font-bold text-yellow-300">

                      Featured

                    </span>

                  )}

                </div>

                <div className="mb-5 flex flex-wrap gap-2">

                  <span className="rounded-full bg-cyan-500/10 px-3 py-1 text-xs font-bold text-cyan-300">

                    {word.part_of_speech || "General"}

                  </span>

                  <span
                    className={`rounded-full px-3 py-1 text-xs font-bold ${
                      word.difficulty === "Beginner"
                        ? "bg-emerald-500/20 text-emerald-300"
                        : word.difficulty === "Intermediate"
                        ? "bg-amber-500/20 text-amber-300"
                        : "bg-rose-500/20 text-rose-300"
                    }`}
                  >
                    {word.difficulty}
                  </span>

                </div>

                {(word.pronunciation || word.ipa) && (

                  <div className="mb-5 rounded-2xl bg-black/20 p-4">

                    <div className="flex items-center gap-2 text-cyan-300">

                      <Volume2 className="h-4 w-4" />

                      <span className="font-semibold">

                        {word.pronunciation}

                      </span>

                    </div>

                    {word.ipa && (

                      <p className="mt-2 text-sm text-slate-400">

                        {word.ipa}

                      </p>

                    )}

                  </div>

                )}

                <div className="space-y-5">

                  <div>

                    <p className="mb-2 text-xs font-bold uppercase tracking-widest text-slate-500">

                      Definition

                    </p>

                    <p className="line-clamp-4 text-sm leading-7 text-slate-300">

                      {word.definition || "No definition provided."}

                    </p>

                  </div>

                  <div>

                    <p className="mb-2 text-xs font-bold uppercase tracking-widest text-slate-500">

                      Example

                    </p>

                    <p className="rounded-xl bg-black/20 p-4 text-sm text-cyan-300 line-clamp-3">

                      {word.example_sentence || "No example sentence."}

                    </p>

                  </div>

                  {word.example_translation && (

                    <div>

                      <p className="mb-2 text-xs font-bold uppercase tracking-widest text-slate-500">

                        Translation

                      </p>

                      <p className="text-sm italic text-slate-400 line-clamp-3">

                        {word.example_translation}

                      </p>

                    </div>

                  )}

                </div>

                <div className="mt-8 flex items-center justify-between border-t border-white/10 pt-5">

                  <span className="text-xs uppercase tracking-widest text-slate-500">

                    Order #{word.sort_order}

                  </span>

                  <button
                    onClick={() => {
                      setEditingWord(word);
                      setShowModal(true);
                    }}
                    className="rounded-xl bg-cyan-500 px-5 py-2 text-sm font-bold text-black transition hover:bg-cyan-400"
                  >
                    Edit Word
                  </button>

                </div>

              </div>

            </motion.div>

          ))}

        </div>

      )}
            {/* Add / Edit Vocabulary Modal */}

      {showModal && (

        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-6 backdrop-blur-sm">

          <div className="max-h-[90vh] w-full max-w-5xl overflow-y-auto rounded-3xl border border-white/10 bg-[#08111f] p-8">

            <div className="mb-8 flex items-center justify-between">

              <div>

                <h2 className="text-3xl font-black text-white">

                  {editingWord ? "Edit Vocabulary" : "Create Vocabulary"}

                </h2>

                <p className="mt-2 text-slate-400">

                  Add words, pronunciation, meanings and examples.

                </p>

              </div>

              <button
                onClick={() => {
                  setShowModal(false);
                  setEditingWord(null);
                }}
                className="rounded-xl bg-white/10 px-4 py-2 font-semibold hover:bg-white/20"
              >
                Close
              </button>

            </div>

            <div className="grid gap-6 md:grid-cols-2">

              <input
                value={word}
                onChange={(e) => setWord(e.target.value)}
                placeholder="Word"
                className="rounded-2xl border border-white/10 bg-black/20 p-4 text-white outline-none focus:border-cyan-500"
              />

              <input
                value={translation}
                onChange={(e) => setTranslation(e.target.value)}
                placeholder="Translation"
                className="rounded-2xl border border-white/10 bg-black/20 p-4 text-white outline-none focus:border-cyan-500"
              />

              <input
                value={pronunciation}
                onChange={(e) => setPronunciation(e.target.value)}
                placeholder="Pronunciation"
                className="rounded-2xl border border-white/10 bg-black/20 p-4 text-white outline-none focus:border-cyan-500"
              />

              <input
                value={ipa}
                onChange={(e) => setIpa(e.target.value)}
                placeholder="IPA"
                className="rounded-2xl border border-white/10 bg-black/20 p-4 text-white outline-none focus:border-cyan-500"
              />

              <input
                value={partOfSpeech}
                onChange={(e) => setPartOfSpeech(e.target.value)}
                placeholder="Part of Speech"
                className="rounded-2xl border border-white/10 bg-black/20 p-4 text-white outline-none focus:border-cyan-500"
              />

              <select
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value)}
                className="rounded-2xl border border-white/10 bg-black/20 p-4 text-white outline-none focus:border-cyan-500"
              >
                <option>Beginner</option>
                <option>Intermediate</option>
                <option>Advanced</option>
              </select>

            </div>

            <div className="mt-6 space-y-6">

              <textarea
                rows={5}
                value={definition}
                onChange={(e) => setDefinition(e.target.value)}
                placeholder="Definition..."
                className="w-full rounded-2xl border border-white/10 bg-black/20 p-4 text-white outline-none resize-none focus:border-cyan-500"
              />

              <textarea
                rows={4}
                value={exampleSentence}
                onChange={(e) => setExampleSentence(e.target.value)}
                placeholder="Example sentence..."
                className="w-full rounded-2xl border border-white/10 bg-black/20 p-4 text-white outline-none resize-none focus:border-cyan-500"
              />

              <textarea
                rows={3}
                value={exampleTranslation}
                onChange={(e) => setExampleTranslation(e.target.value)}
                placeholder="Example translation..."
                className="w-full rounded-2xl border border-white/10 bg-black/20 p-4 text-white outline-none resize-none focus:border-cyan-500"
              />

              <div className="grid gap-6 md:grid-cols-2">

                <input
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  placeholder="Image URL"
                  className="rounded-2xl border border-white/10 bg-black/20 p-4 text-white outline-none focus:border-cyan-500"
                />

                <input
                  value={audioUrl}
                  onChange={(e) => setAudioUrl(e.target.value)}
                  placeholder="Audio URL"
                  className="rounded-2xl border border-white/10 bg-black/20 p-4 text-white outline-none focus:border-cyan-500"
                />

                <input
                  type="number"
                  value={sortOrder}
                  onChange={(e) => setSortOrder(Number(e.target.value))}
                  placeholder="Sort Order"
                  className="rounded-2xl border border-white/10 bg-black/20 p-4 text-white outline-none focus:border-cyan-500"
                />

                <label className="flex items-center gap-3 rounded-2xl border border-white/10 bg-black/20 p-4 text-white">

                  <input
                    type="checkbox"
                    checked={featured}
                    onChange={(e) => setFeatured(e.target.checked)}
                  />

                  Featured Vocabulary

                </label>

              </div>

            </div>

            <div className="mt-8 flex justify-end gap-4">

              <button
                onClick={() => {
                  setShowModal(false);
                  setEditingWord(null);
                }}
                className="rounded-2xl border border-white/10 px-6 py-3 font-semibold hover:bg-white/10"
              >
                Cancel
              </button>
                            <button
                disabled={saving}
                onClick={async () => {
                  try {
                    setSaving(true);

                    const payload = {
                      language_id: language.id,

                      word,
                      translation,

                      pronunciation,
                      ipa,

                      part_of_speech: partOfSpeech,

                      definition,

                      example_sentence: exampleSentence,
                      example_translation: exampleTranslation,

                      image_url: imageUrl,
                      audio_url: audioUrl,

                      difficulty,

                      sort_order: sortOrder,
                      featured,

                      updated_at: new Date().toISOString(),
                    };

                    let error;

                    if (editingWord) {
                      ({ error } = await supabase
                        .from("language_vocabulary")
                        .update(payload)
                        .eq("id", editingWord.id));
                    } else {
                      ({ error } = await supabase
                        .from("language_vocabulary")
                        .insert({
                          ...payload,
                          created_at: new Date().toISOString(),
                        }));
                    }

                    if (error) throw error;

                    await fetchVocabulary();

                    if (refresh) {
                      await refresh();
                    }

                    setShowModal(false);
                    setEditingWord(null);

                    setWord("");
                    setTranslation("");
                    setPronunciation("");
                    setIpa("");
                    setPartOfSpeech("");
                    setDefinition("");
                    setExampleSentence("");
                    setExampleTranslation("");
                    setImageUrl("");
                    setAudioUrl("");
                    setDifficulty("Beginner");
                    setSortOrder(0);
                    setFeatured(false);

                  } catch (err) {
                    console.error(err);
                    alert("Failed to save vocabulary.");
                  } finally {
                    setSaving(false);
                  }
                }}
                className="rounded-2xl bg-cyan-500 px-7 py-3 font-bold text-black transition hover:bg-cyan-400 disabled:opacity-50"
              >
                {saving ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  editingWord
                    ? "Update Vocabulary"
                    : "Create Vocabulary"
                )}
              </button>

            </div>

          </div>

        </div>

      )}

    </div>
  );
}