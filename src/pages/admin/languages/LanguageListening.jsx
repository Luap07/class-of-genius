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
  Headphones,
  PlayCircle,
  Star,
  Music4,
} from "lucide-react";

import { supabase } from "../../../lib/supabaseClient";

export default function LanguageListening({
  language,
  refresh,
}) {
  const [loading, setLoading] = useState(true);

  const [listeningLessons, setListeningLessons] = useState([]);

  const [search, setSearch] = useState("");

  const [showModal, setShowModal] = useState(false);

  const [editingLesson, setEditingLesson] = useState(null);
    const [saving, setSaving] = useState(false);

const [title, setTitle] = useState("");
const [level, setLevel] = useState("Beginner");
const [category, setCategory] = useState("");

const [description, setDescription] = useState("");
const [transcript, setTranscript] = useState("");
const [translation, setTranslation] = useState("");
const [vocabulary, setVocabulary] = useState("");
const [grammarNotes, setGrammarNotes] = useState("");

const [audioUrl, setAudioUrl] = useState("");
const [videoUrl, setVideoUrl] = useState("");
const [thumbnailUrl, setThumbnailUrl] = useState("");

const [duration, setDuration] = useState("");

const [featured, setFeatured] = useState(false);

const [sortOrder, setSortOrder] = useState(0);
  const fetchListening = useCallback(async () => {
    if (!language?.id) return;

    try {
      setLoading(true);

      const { data, error } = await supabase
        .from("language_listening")
        .select("*")
        .eq("language_id", language.id)
        .order("sort_order", {
          ascending: true,
        });

      if (error) throw error;

      setListeningLessons(data || []);
    } catch (err) {
      console.error("Listening Fetch Error:", err);
    } finally {
      setLoading(false);
    }
  }, [language]);

  useEffect(() => {
    fetchListening();
  }, [fetchListening]);
  useEffect(() => {
  if (editingLesson) {
    setTitle(editingLesson.title || "");
    setLevel(editingLesson.level || "Beginner");
    setCategory(editingLesson.category || "");

    setDescription(editingLesson.description || "");
    setTranscript(editingLesson.transcript || "");
    setTranslation(editingLesson.translation || "");
    setVocabulary(editingLesson.vocabulary || "");
    setGrammarNotes(editingLesson.grammar_notes || "");

    setAudioUrl(editingLesson.audio_url || "");
    setVideoUrl(editingLesson.video_url || "");
    setThumbnailUrl(editingLesson.thumbnail_url || "");

    setDuration(editingLesson.duration || "");

    setFeatured(editingLesson.featured || false);

    setSortOrder(editingLesson.sort_order || 0);
  } else {
    setTitle("");
    setLevel("Beginner");
    setCategory("");

    setDescription("");
    setTranscript("");
    setTranslation("");
    setVocabulary("");
    setGrammarNotes("");

    setAudioUrl("");
    setVideoUrl("");
    setThumbnailUrl("");

    setDuration("");

    setFeatured(false);

    setSortOrder(0);
  }
}, [editingLesson, showModal]);
  const filteredLessons = useMemo(() => {
    const keyword = search.toLowerCase();

    return listeningLessons.filter((lesson) => {
      return (
        lesson.title?.toLowerCase().includes(keyword) ||
        lesson.category?.toLowerCase().includes(keyword) ||
        lesson.level?.toLowerCase().includes(keyword) ||
        lesson.description?.toLowerCase().includes(keyword)
      );
    });
  }, [listeningLessons, search]);

  const stats = useMemo(() => {
    return {
      total: listeningLessons.length,

      featured: listeningLessons.filter(
        (lesson) => lesson.featured
      ).length,

      beginner: listeningLessons.filter(
        (lesson) => lesson.level === "Beginner"
      ).length,

      audio: listeningLessons.filter(
        (lesson) => lesson.audio_url
      ).length,
    };
  }, [listeningLessons]);

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

              <Headphones className="h-6 w-6 text-cyan-400" />

              <span className="rounded-full bg-cyan-500/10 px-4 py-1 text-xs font-bold uppercase tracking-[0.3em] text-cyan-300">

                Listening Manager

              </span>

            </div>

            <h2 className="text-4xl font-black text-white">

              {language?.name} Listening

            </h2>

            <p className="mt-3 max-w-3xl text-slate-400">

              Manage listening lessons, conversations,
              audio clips, transcripts, vocabulary,
              grammar notes and media resources.

            </p>

          </div>

          <button
            onClick={() => {
              setEditingLesson(null);
              setShowModal(true);
            }}
            className="flex items-center gap-3 rounded-2xl bg-cyan-500 px-6 py-4 font-bold text-black transition hover:bg-cyan-400"
          >
            <Plus className="h-5 w-5" />

            New Listening Lesson

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
                Total Lessons
              </p>

              <h3 className="mt-2 text-4xl font-black text-white">
                {stats.total}
              </h3>

            </div>

            <Headphones className="h-10 w-10 text-cyan-400" />

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

              <h3 className="mt-2 text-4xl font-black text-white">
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

              <h3 className="mt-2 text-4xl font-black text-white">
                {stats.beginner}
              </h3>

            </div>

            <PlayCircle className="h-10 w-10 text-emerald-400" />

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
                Audio Files
              </p>

              <h3 className="mt-2 text-4xl font-black text-white">
                {stats.audio}
              </h3>

            </div>

            <Music4 className="h-10 w-10 text-purple-400" />

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
              placeholder="Search listening lessons..."
              className="w-full rounded-2xl border border-white/10 bg-black/20 py-4 pl-14 pr-5 text-white outline-none transition focus:border-cyan-500"
            />

          </div>

          <div className="flex flex-wrap gap-3">

            <button
              onClick={fetchListening}
              className="rounded-2xl border border-cyan-500/20 bg-cyan-500/10 px-6 py-3 font-semibold transition hover:bg-cyan-500/20"
            >
              Refresh
            </button>

            <button
              onClick={() => {
                setEditingLesson(null);
                setShowModal(true);
              }}
              className="rounded-2xl bg-cyan-500 px-6 py-3 font-bold text-black transition hover:bg-cyan-400"
            >
              + New Lesson
            </button>

          </div>

        </div>

      </div>
            {/* Listening Lessons */}

      {filteredLessons.length === 0 ? (

        <div className="rounded-3xl border border-dashed border-white/10 bg-white/[0.03] py-24 text-center">

          <Headphones className="mx-auto mb-6 h-16 w-16 text-slate-600" />

          <h3 className="text-2xl font-black text-white">
            No Listening Lessons
          </h3>

          <p className="mt-3 text-slate-400">
            Create your first listening lesson for this language.
          </p>

          <button
            onClick={() => {
              setEditingLesson(null);
              setShowModal(true);
            }}
            className="mt-8 rounded-2xl bg-cyan-500 px-8 py-4 font-bold text-black transition hover:bg-cyan-400"
          >
            Create First Lesson
          </button>

        </div>

      ) : (

        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">

          {filteredLessons.map((lesson, index) => (

            <motion.div
              key={lesson.id}
              initial={{
                opacity: 0,
                y: 20,
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

              {lesson.thumbnail_url && (
                <img
                  src={lesson.thumbnail_url}
                  alt={lesson.title}
                  className="h-52 w-full object-cover"
                />
              )}

              <div className="p-7">

                <div className="mb-6 flex items-start justify-between">

                  <div>

                    <h3 className="text-2xl font-black text-white">
                      {lesson.title}
                    </h3>

                    <p className="mt-2 text-cyan-300">
                      {lesson.category || "Listening"}
                    </p>

                  </div>

                  {lesson.featured && (
                    <span className="rounded-full bg-yellow-500/20 px-3 py-1 text-xs font-bold text-yellow-300">
                      Featured
                    </span>
                  )}

                </div>

                <div className="mb-5 flex flex-wrap gap-2">

                  <span className="rounded-full bg-cyan-500/10 px-3 py-1 text-xs font-bold text-cyan-300">
                    {lesson.level}
                  </span>

                  {lesson.duration && (
                    <span className="rounded-full bg-indigo-500/10 px-3 py-1 text-xs font-bold text-indigo-300">
                      {lesson.duration}
                    </span>
                  )}

                  {lesson.audio_url && (
                    <span className="rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-bold text-emerald-300">
                      Audio
                    </span>
                  )}

                  {lesson.video_url && (
                    <span className="rounded-full bg-rose-500/10 px-3 py-1 text-xs font-bold text-rose-300">
                      Video
                    </span>
                  )}

                </div>

                <div className="space-y-5">

                  <div>

                    <p className="mb-2 text-xs font-bold uppercase tracking-widest text-slate-500">
                      Description
                    </p>

                    <p className="line-clamp-3 text-sm leading-7 text-slate-300">
                      {lesson.description || "No description available."}
                    </p>

                  </div>

                  {lesson.transcript && (

                    <div>

                      <p className="mb-2 text-xs font-bold uppercase tracking-widest text-slate-500">
                        Transcript
                      </p>

                      <p className="line-clamp-4 text-sm text-slate-400">
                        {lesson.transcript}
                      </p>

                    </div>

                  )}

                  {lesson.vocabulary && (

                    <div>

                      <p className="mb-2 text-xs font-bold uppercase tracking-widest text-slate-500">
                        Vocabulary
                      </p>

                      <p className="line-clamp-3 text-sm text-slate-400">
                        {lesson.vocabulary}
                      </p>

                    </div>

                  )}

                  {lesson.grammar_notes && (

                    <div>

                      <p className="mb-2 text-xs font-bold uppercase tracking-widest text-slate-500">
                        Grammar Notes
                      </p>

                      <p className="line-clamp-3 text-sm text-slate-400">
                        {lesson.grammar_notes}
                      </p>

                    </div>

                  )}

                </div>

                <div className="mt-8 flex items-center justify-between border-t border-white/10 pt-5">

                  <span className="text-xs uppercase tracking-widest text-slate-500">
                    Order #{lesson.sort_order}
                  </span>

                  <button
                    onClick={() => {
                      setEditingLesson(lesson);
                      setShowModal(true);
                    }}
                    className="rounded-xl bg-cyan-500 px-5 py-2 text-sm font-bold text-black transition hover:bg-cyan-400"
                  >
                    Edit Lesson
                  </button>

                </div>

              </div>

            </motion.div>

          ))}

        </div>

      )}
            {/* Add / Edit Listening Lesson */}

      {showModal && (

        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-6 backdrop-blur-sm">

          <div className="max-h-[90vh] w-full max-w-6xl overflow-y-auto rounded-3xl border border-white/10 bg-[#08111f] p-8">

            <div className="mb-8 flex items-center justify-between">

              <div>

                <h2 className="text-3xl font-black text-white">
                  {editingLesson
                    ? "Edit Listening Lesson"
                    : "Create Listening Lesson"}
                </h2>

                <p className="mt-2 text-slate-400">
                  Upload listening exercises, transcripts,
                  translations and audio resources.
                </p>

              </div>

              <button
                onClick={() => {
                  setShowModal(false);
                  setEditingLesson(null);
                }}
                className="rounded-xl bg-white/10 px-4 py-2 font-semibold hover:bg-white/20"
              >
                Close
              </button>

            </div>

            <div className="grid gap-6 md:grid-cols-2">

              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Lesson Title"
                className="rounded-2xl border border-white/10 bg-black/20 p-4 text-white outline-none focus:border-cyan-500"
              />

              <input
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                placeholder="Category"
                className="rounded-2xl border border-white/10 bg-black/20 p-4 text-white outline-none focus:border-cyan-500"
              />

              <select
                value={level}
                onChange={(e) => setLevel(e.target.value)}
                className="rounded-2xl border border-white/10 bg-black/20 p-4 text-white outline-none focus:border-cyan-500"
              >
                <option>Beginner</option>
                <option>Intermediate</option>
                <option>Advanced</option>
              </select>

              <input
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                placeholder="Duration (e.g. 08:45)"
                className="rounded-2xl border border-white/10 bg-black/20 p-4 text-white outline-none focus:border-cyan-500"
              />

            </div>

            <div className="mt-6 space-y-6">

              <textarea
                rows={4}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Description..."
                className="w-full resize-none rounded-2xl border border-white/10 bg-black/20 p-4 text-white outline-none focus:border-cyan-500"
              />

              <textarea
                rows={8}
                value={transcript}
                onChange={(e) => setTranscript(e.target.value)}
                placeholder="Transcript..."
                className="w-full resize-none rounded-2xl border border-white/10 bg-black/20 p-4 text-white outline-none focus:border-cyan-500"
              />

              <textarea
                rows={6}
                value={translation}
                onChange={(e) => setTranslation(e.target.value)}
                placeholder="Translation..."
                className="w-full resize-none rounded-2xl border border-white/10 bg-black/20 p-4 text-white outline-none focus:border-cyan-500"
              />

              <textarea
                rows={5}
                value={vocabulary}
                onChange={(e) => setVocabulary(e.target.value)}
                placeholder="Vocabulary..."
                className="w-full resize-none rounded-2xl border border-white/10 bg-black/20 p-4 text-white outline-none focus:border-cyan-500"
              />

              <textarea
                rows={5}
                value={grammarNotes}
                onChange={(e) => setGrammarNotes(e.target.value)}
                placeholder="Grammar Notes..."
                className="w-full resize-none rounded-2xl border border-white/10 bg-black/20 p-4 text-white outline-none focus:border-cyan-500"
              />

              <div className="grid gap-6 md:grid-cols-2">

                <input
                  value={audioUrl}
                  onChange={(e) => setAudioUrl(e.target.value)}
                  placeholder="Audio URL"
                  className="rounded-2xl border border-white/10 bg-black/20 p-4 text-white outline-none focus:border-cyan-500"
                />

                <input
                  value={videoUrl}
                  onChange={(e) => setVideoUrl(e.target.value)}
                  placeholder="Video URL"
                  className="rounded-2xl border border-white/10 bg-black/20 p-4 text-white outline-none focus:border-cyan-500"
                />

                <input
                  value={thumbnailUrl}
                  onChange={(e) => setThumbnailUrl(e.target.value)}
                  placeholder="Thumbnail URL"
                  className="rounded-2xl border border-white/10 bg-black/20 p-4 text-white outline-none focus:border-cyan-500"
                />

                <input
                  type="number"
                  value={sortOrder}
                  onChange={(e) => setSortOrder(Number(e.target.value))}
                  placeholder="Sort Order"
                  className="rounded-2xl border border-white/10 bg-black/20 p-4 text-white outline-none focus:border-cyan-500"
                />

                <label className="flex items-center gap-3 rounded-2xl border border-white/10 bg-black/20 p-4 text-white md:col-span-2">

                  <input
                    type="checkbox"
                    checked={featured}
                    onChange={(e) => setFeatured(e.target.checked)}
                  />

                  Featured Lesson

                </label>

              </div>

            </div>

            <div className="mt-8 flex justify-end gap-4">

              <button
                onClick={() => {
                  setShowModal(false);
                  setEditingLesson(null);
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

                      title,
                      level,
                      category,

                      description,
                      transcript,
                      translation,
                      vocabulary,

                      grammar_notes: grammarNotes,

                      audio_url: audioUrl,
                      video_url: videoUrl,
                      thumbnail_url: thumbnailUrl,

                      duration,

                      featured,

                      sort_order: sortOrder,

                      updated_at: new Date().toISOString(),
                    };

                    let error;

                    if (editingLesson) {
                      ({ error } = await supabase
                        .from("language_listening")
                        .update(payload)
                        .eq("id", editingLesson.id));
                    } else {
                      ({ error } = await supabase
                        .from("language_listening")
                        .insert({
                          ...payload,
                          created_at: new Date().toISOString(),
                        }));
                    }

                    if (error) throw error;

                    await fetchListening();

                    if (refresh) {
                      await refresh();
                    }

                    setShowModal(false);
                    setEditingLesson(null);

                    setTitle("");
                    setLevel("Beginner");
                    setCategory("");

                    setDescription("");
                    setTranscript("");
                    setTranslation("");
                    setVocabulary("");
                    setGrammarNotes("");

                    setAudioUrl("");
                    setVideoUrl("");
                    setThumbnailUrl("");

                    setDuration("");

                    setFeatured(false);

                    setSortOrder(0);

                  } catch (err) {
                    console.error(err);
                    alert("Failed to save listening lesson.");
                  } finally {
                    setSaving(false);
                  }
                }}
                className="rounded-2xl bg-cyan-500 px-7 py-3 font-bold text-black transition hover:bg-cyan-400 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {saving ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : editingLesson ? (
                  "Update Lesson"
                ) : (
                  "Create Lesson"
                )}
              </button>

            </div>

          </div>

        </div>

      )}

    </div>
  );
}