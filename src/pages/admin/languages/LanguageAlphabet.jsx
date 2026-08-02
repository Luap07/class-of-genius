import React, {
  useEffect,
  useState,
  useCallback,
  useMemo,
} from "react";

import {
  Plus,
  Trash2,
  Loader2,
  Languages,
  Search,
  Star,
  Type,
  Volume2,
  X,
} from "lucide-react";

import { motion, AnimatePresence } from "framer-motion";

import { supabase } from "../../../lib/supabaseClient";

export default function LanguageAlphabet({ language, refresh }) {
  const [letters, setLetters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState("");

  const [showModal, setShowModal] = useState(false);
  const [editingLetter, setEditingLetter] = useState(null);

  // Form states
  const [letter, setLetter] = useState("");
  const [uppercase, setUppercase] = useState("");
  const [lowercase, setLowercase] = useState("");
  const [pronunciation, setPronunciation] = useState("");
  const [ipa, setIpa] = useState("");
  const [exampleWord, setExampleWord] = useState("");
  const [exampleTranslation, setExampleTranslation] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [audioUrl, setAudioUrl] = useState("");
  const [sortOrder, setSortOrder] = useState(0);
  const [featured, setFeatured] = useState(false);

  const fetchAlphabet = useCallback(async () => {
    if (!language?.id) return;

    try {
      setLoading(true);

      const { data, error } = await supabase
        .from("language_alphabet")
        .select("*")
        .eq("language_id", language.id)
        .order("sort_order", {
          ascending: true,
        });

      if (error) throw error;

      setLetters(data || []);
    } catch (error) {
      console.error("Alphabet Fetch Error:", error);
    } finally {
      setLoading(false);
    }
  }, [language]);

  useEffect(() => {
    if (language?.id) {
      fetchAlphabet();
    }
  }, [language, fetchAlphabet]);

  // Synchronize form fields when editingLetter changes or modal opens
  useEffect(() => {
    if (editingLetter) {
      setLetter(editingLetter.letter || "");
      setUppercase(editingLetter.uppercase || "");
      setLowercase(editingLetter.lowercase || "");
      setPronunciation(editingLetter.pronunciation || "");
      setIpa(editingLetter.ipa || "");
      setExampleWord(editingLetter.example_word || editingLetter.example || "");
      setExampleTranslation(editingLetter.example_translation || "");
      setImageUrl(editingLetter.image_url || "");
      setAudioUrl(editingLetter.audio_url || "");
      setSortOrder(editingLetter.sort_order || 0);
      setFeatured(editingLetter.featured || false);
    } else {
      setLetter("");
      setUppercase("");
      setLowercase("");
      setPronunciation("");
      setIpa("");
      setExampleWord("");
      setExampleTranslation("");
      setImageUrl("");
      setAudioUrl("");
      setSortOrder(letters.length);
      setFeatured(false);
    }
  }, [editingLetter, letters.length]);

  const filteredLetters = useMemo(() => {
    const keyword = search.toLowerCase();

    return letters.filter((item) => {
      return (
        item.letter?.toLowerCase().includes(keyword) ||
        item.uppercase?.toLowerCase().includes(keyword) ||
        item.lowercase?.toLowerCase().includes(keyword) ||
        item.example_word?.toLowerCase().includes(keyword) ||
        item.example?.toLowerCase().includes(keyword)
      );
    });
  }, [letters, search]);

  const stats = useMemo(() => {
    return {
      total: letters.length,
      featured: letters.filter((item) => item.featured).length,
      pronunciation: letters.filter((item) => item.pronunciation).length,
      audio: letters.filter((item) => item.audio_url).length,
    };
  }, [letters]);

  const saveLetter = async () => {
    if (!letter.trim()) return;

    try {
      setSaving(true);

      const payload = {
        language_id: language.id,
        letter,
        uppercase,
        lowercase,
        pronunciation,
        ipa,
        example_word: exampleWord,
        example: exampleWord, // Fallback schema compatibility
        example_translation: exampleTranslation,
        image_url: imageUrl,
        audio_url: audioUrl,
        sort_order: sortOrder,
        featured,
        updated_at: new Date().toISOString(),
      };

      let error;

      if (editingLetter) {
        ({ error } = await supabase
          .from("language_alphabet")
          .update(payload)
          .eq("id", editingLetter.id));
      } else {
        ({ error } = await supabase
          .from("language_alphabet")
          .insert({
            ...payload,
            created_at: new Date().toISOString(),
          }));
      }

      if (error) throw error;

      setShowModal(false);
      setEditingLetter(null);
      await fetchAlphabet();

      if (refresh) {
        await refresh();
      }
    } catch (error) {
      console.error("Save Letter Error:", error);
      alert("Failed to save alphabet letter.");
    } finally {
      setSaving(false);
    }
  };

  const deleteLetter = async (id) => {
    try {
      const { error } = await supabase
        .from("language_alphabet")
        .delete()
        .eq("id", id);

      if (error) throw error;

      await fetchAlphabet();
      if (refresh) await refresh();
    } catch (error) {
      console.error("Delete Letter Error:", error);
    }
  };

  if (loading && letters.length === 0) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-indigo-400" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header Banner */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-3xl border border-indigo-500/20 bg-gradient-to-r from-indigo-500/10 via-cyan-500/5 to-indigo-500/10 p-8"
      >
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="mb-4 flex items-center gap-3">
              <Languages className="h-6 w-6 text-indigo-400" />
              <span className="rounded-full bg-indigo-500/10 px-4 py-1 text-xs font-bold uppercase tracking-[0.3em] text-indigo-300">
                Alphabet Manager
              </span>
            </div>

            <h2 className="text-4xl font-black text-white">
              {language.name} Alphabet
            </h2>

            <p className="mt-3 max-w-3xl text-slate-400">
              Manage letters, pronunciation, IPA, examples, images and audio for this language.
            </p>
          </div>

          <button
            onClick={() => {
              setEditingLetter(null);
              setShowModal(true);
            }}
            className="flex items-center gap-3 rounded-2xl bg-indigo-500 px-6 py-4 font-bold text-black transition hover:bg-indigo-400"
          >
            <Plus className="h-5 w-5" />
            New Letter
          </button>
        </div>
      </motion.div>

      {/* Statistics */}
      <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-3xl border border-indigo-500/20 bg-indigo-500/10 p-6"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-400">Total Letters</p>
              <h3 className="mt-2 text-4xl font-black text-white">{stats.total}</h3>
            </div>
            <Type className="h-10 w-10 text-indigo-400" />
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
              <p className="text-sm text-slate-400">Featured</p>
              <h3 className="mt-2 text-4xl font-black text-white">{stats.featured}</h3>
            </div>
            <Star className="h-10 w-10 text-yellow-400" />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="rounded-3xl border border-emerald-500/20 bg-emerald-500/10 p-6"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-400">Pronunciations</p>
              <h3 className="mt-2 text-4xl font-black text-white">{stats.pronunciation}</h3>
            </div>
            <Languages className="h-10 w-10 text-emerald-400" />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="rounded-3xl border border-pink-500/20 bg-pink-500/10 p-6"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-400">Audio Files</p>
              <h3 className="mt-2 text-4xl font-black text-white">{stats.audio}</h3>
            </div>
            <Volume2 className="h-10 w-10 text-pink-400" />
          </div>
        </motion.div>
      </div>

      {/* Search + Toolbar */}
      <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-6">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div className="relative w-full lg:max-w-lg">
            <Search
              className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-500"
              size={20}
            />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search letters, words or pronunciation..."
              className="w-full rounded-2xl border border-white/10 bg-black/20 py-4 pl-14 pr-5 text-white outline-none transition focus:border-indigo-500"
            />
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              onClick={fetchAlphabet}
              className="rounded-2xl border border-indigo-500/20 bg-indigo-500/10 px-6 py-3 font-semibold text-white transition hover:bg-indigo-500/20"
            >
              Refresh
            </button>

            <button
              onClick={() => {
                setEditingLetter(null);
                setShowModal(true);
              }}
              className="rounded-2xl bg-indigo-500 px-6 py-3 font-bold text-black transition hover:bg-indigo-400"
            >
              + Add Letter
            </button>
          </div>
        </div>
      </div>

      {/* Alphabet Grid */}
      {filteredLetters.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-white/10 bg-white/[0.03] py-24 text-center">
          <Languages className="mx-auto mb-6 h-16 w-16 text-slate-600" />
          <h3 className="text-2xl font-black text-white">No Letters Found</h3>
          <p className="mt-3 text-slate-400">
            Add your first alphabet letter to begin building this language.
          </p>
          <button
            onClick={() => {
              setEditingLetter(null);
              setShowModal(true);
            }}
            className="mt-8 rounded-2xl bg-indigo-500 px-8 py-4 font-bold text-black transition hover:bg-indigo-400"
          >
            Add First Letter
          </button>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {filteredLetters.map((item, index) => (
            <motion.div
              key={item.id}
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
              className="group overflow-hidden rounded-3xl border border-white/10 bg-white/[0.04] transition hover:border-indigo-500/40 hover:bg-white/[0.06]"
            >
              <div className="relative p-7">
                {item.featured && (
                  <span className="absolute right-5 top-5 rounded-full bg-yellow-500/20 px-3 py-1 text-xs font-bold text-yellow-300">
                    Featured
                  </span>
                )}

                <div className="flex items-center gap-5">
                  <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-br from-indigo-500 to-cyan-600 text-4xl font-black text-white">
                    {item.letter}
                  </div>

                  <div className="flex-1">
                    <h3 className="text-2xl font-black text-white">
                      {item.uppercase || item.letter || "-"}
                      {item.lowercase && (
                        <span className="ml-2 text-indigo-300">
                          {item.lowercase}
                        </span>
                      )}
                    </h3>
                    <p className="mt-2 text-sm text-slate-400">
                      {item.pronunciation || "No pronunciation"}
                    </p>
                  </div>
                </div>

                <div className="mt-6 space-y-4">
                  {item.ipa && (
                    <div>
                      <p className="mb-1 text-xs uppercase tracking-widest text-slate-500">
                        IPA
                      </p>
                      <p className="rounded-xl bg-black/20 px-4 py-3 font-mono text-indigo-300">
                        {item.ipa}
                      </p>
                    </div>
                  )}

                  <div>
                    <p className="mb-1 text-xs uppercase tracking-widest text-slate-500">
                      Example Word
                    </p>
                    <p className="font-semibold text-white">
                      {item.example_word || item.example || "No example"}
                    </p>
                    {item.example_translation && (
                      <p className="mt-1 text-sm text-slate-400">
                        {item.example_translation}
                      </p>
                    )}
                  </div>

                  {item.image_url && (
                    <img
                      src={item.image_url}
                      alt={item.letter}
                      className="h-40 w-full rounded-2xl object-cover"
                    />
                  )}

                  <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                    <div className="flex flex-wrap gap-2">
                      {item.audio_url && (
                        <button
                          onClick={() => window.open(item.audio_url, "_blank")}
                          className="rounded-xl bg-indigo-500/20 px-4 py-2 text-sm font-semibold text-indigo-300 transition hover:bg-indigo-500/30"
                        >
                          Play Audio
                        </button>
                      )}

                      <button
                        onClick={() => {
                          setEditingLetter(item);
                          setShowModal(true);
                        }}
                        className="rounded-xl bg-indigo-500 px-5 py-2 text-sm font-bold text-black transition hover:bg-indigo-400"
                      >
                        Edit
                      </button>
                    </div>

                    <button
                      onClick={() => deleteLetter(item.id)}
                      className="rounded-xl bg-red-500/10 p-2.5 text-red-400 transition hover:bg-red-500/20"
                      title="Delete letter"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Modal Form for Creating/Editing Letter */}
      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-3xl border border-white/10 bg-slate-900 p-8 shadow-2xl"
            >
              <div className="flex items-center justify-between pb-6 border-b border-white/10">
                <h3 className="text-2xl font-black text-white">
                  {editingLetter ? "Edit Letter" : "New Alphabet Letter"}
                </h3>
                <button
                  onClick={() => setShowModal(false)}
                  className="rounded-full bg-white/5 p-2 text-slate-400 hover:bg-white/10 hover:text-white"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="space-y-6 pt-6">
                <div className="grid gap-6 md:grid-cols-3">
                  <div>
                    <label className="mb-2 block text-sm font-semibold text-slate-300">
                      Letter / Symbol *
                    </label>
                    <input
                      type="text"
                      value={letter}
                      onChange={(e) => setLetter(e.target.value)}
                      placeholder="e.g. A"
                      className="w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-white outline-none focus:border-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="mb-2 block text-sm font-semibold text-slate-300">
                      Uppercase
                    </label>
                    <input
                      type="text"
                      value={uppercase}
                      onChange={(e) => setUppercase(e.target.value)}
                      placeholder="e.g. A"
                      className="w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-white outline-none focus:border-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="mb-2 block text-sm font-semibold text-slate-300">
                      Lowercase
                    </label>
                    <input
                      type="text"
                      value={lowercase}
                      onChange={(e) => setLowercase(e.target.value)}
                      placeholder="e.g. a"
                      className="w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-white outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>

                <div className="grid gap-6 md:grid-cols-2">
                  <div>
                    <label className="mb-2 block text-sm font-semibold text-slate-300">
                      Pronunciation Guide
                    </label>
                    <input
                      type="text"
                      value={pronunciation}
                      onChange={(e) => setPronunciation(e.target.value)}
                      placeholder="e.g. sounds like 'ah'"
                      className="w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-white outline-none focus:border-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="mb-2 block text-sm font-semibold text-slate-300">
                      IPA (International Phonetic Alphabet)
                    </label>
                    <input
                      type="text"
                      value={ipa}
                      onChange={(e) => setIpa(e.target.value)}
                      placeholder="e.g. /a/"
                      className="w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 font-mono text-white outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>

                <div className="grid gap-6 md:grid-cols-2">
                  <div>
                    <label className="mb-2 block text-sm font-semibold text-slate-300">
                      Example Word
                    </label>
                    <input
                      type="text"
                      value={exampleWord}
                      onChange={(e) => setExampleWord(e.target.value)}
                      placeholder="e.g. Apple"
                      className="w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-white outline-none focus:border-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="mb-2 block text-sm font-semibold text-slate-300">
                      Example Translation
                    </label>
                    <input
                      type="text"
                      value={exampleTranslation}
                      onChange={(e) => setExampleTranslation(e.target.value)}
                      placeholder="e.g. Apple (fruit)"
                      className="w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-white outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>

                <div className="grid gap-6 md:grid-cols-2">
                  <div>
                    <label className="mb-2 block text-sm font-semibold text-slate-300">
                      Image URL
                    </label>
                    <input
                      type="text"
                      value={imageUrl}
                      onChange={(e) => setImageUrl(e.target.value)}
                      placeholder="https://..."
                      className="w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-white outline-none focus:border-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="mb-2 block text-sm font-semibold text-slate-300">
                      Audio URL
                    </label>
                    <input
                      type="text"
                      value={audioUrl}
                      onChange={(e) => setAudioUrl(e.target.value)}
                      placeholder="https://..."
                      className="w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-white outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>

                <div className="grid gap-6 md:grid-cols-2 items-center">
                  <div>
                    <label className="mb-2 block text-sm font-semibold text-slate-300">
                      Sort Order
                    </label>
                    <input
                      type="number"
                      value={sortOrder}
                      onChange={(e) => setSortOrder(parseInt(e.target.value) || 0)}
                      className="w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-white outline-none focus:border-indigo-500"
                    />
                  </div>
                  <div className="flex items-center gap-3 pt-6">
                    <input
                      type="checkbox"
                      id="featured-checkbox"
                      checked={featured}
                      onChange={(e) => setFeatured(e.target.checked)}
                      className="h-5 w-5 rounded border-white/10 bg-black/20 text-indigo-500 focus:ring-indigo-500"
                    />
                    <label htmlFor="featured-checkbox" className="text-sm font-semibold text-slate-300 cursor-pointer">
                      Feature this letter
                    </label>
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-white/10">
                  <button
                    onClick={() => setShowModal(false)}
                    className="rounded-2xl border border-white/10 bg-white/5 px-6 py-3 font-semibold text-white transition hover:bg-white/10"
                  >
                    Cancel
                  </button>
                  <button
                    disabled={saving}
                    onClick={saveLetter}
                    className="rounded-2xl bg-indigo-500 px-7 py-3 font-bold text-black transition hover:bg-indigo-400 disabled:opacity-50 flex items-center justify-center min-w-[120px]"
                  >
                    {saving ? (
                      <Loader2 className="h-5 w-5 animate-spin" />
                    ) : (
                      editingLetter ? "Update Letter" : "Create Letter"
                    )}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}