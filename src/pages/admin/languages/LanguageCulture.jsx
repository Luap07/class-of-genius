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
  Globe2,
  Landmark,
  Star,
  Image as ImageIcon,
} from "lucide-react";

import { supabase } from "../../../lib/supabaseClient";

export default function LanguageCulture({
  language,
  refresh,
}) {
  const [loading, setLoading] = useState(true);

  const [cultureItems, setCultureItems] = useState([]);

  const [search, setSearch] = useState("");

  const [showModal, setShowModal] = useState(false);

  const [editingCulture, setEditingCulture] = useState(null);
  const [saving, setSaving] = useState(false);

const [title, setTitle] = useState("");
const [category, setCategory] = useState("");

const [description, setDescription] = useState("");
const [history, setHistory] = useState("");
const [traditions, setTraditions] = useState("");
const [etiquette, setEtiquette] = useState("");
const [festivals, setFestivals] = useState("");
const [food, setFood] = useState("");
const [landmarks, setLandmarks] = useState("");
const [media, setMedia] = useState("");

const [imageUrl, setImageUrl] = useState("");
const [videoUrl, setVideoUrl] = useState("");

const [difficulty, setDifficulty] = useState("Beginner");

const [sortOrder, setSortOrder] = useState(0);

const [featured, setFeatured] = useState(false);
  const fetchCulture = useCallback(async () => {
    if (!language?.id) return;

    try {
      setLoading(true);

      const { data, error } = await supabase
        .from("language_culture")
        .select("*")
        .eq("language_id", language.id)
        .order("sort_order", {
          ascending: true,
        });

      if (error) throw error;

      setCultureItems(data || []);
    } catch (err) {
      console.error("Culture Fetch Error:", err);
    } finally {
      setLoading(false);
    }
  }, [language]);

  useEffect(() => {
    fetchCulture();
  }, [fetchCulture]);
useEffect(() => {
  if (editingCulture) {
    setTitle(editingCulture.title || "");
    setCategory(editingCulture.category || "");

    setDescription(editingCulture.description || "");
    setHistory(editingCulture.history || "");
    setTraditions(editingCulture.traditions || "");
    setEtiquette(editingCulture.etiquette || "");
    setFestivals(editingCulture.festivals || "");
    setFood(editingCulture.food || "");
    setLandmarks(editingCulture.landmarks || "");
    setMedia(editingCulture.media || "");

    setImageUrl(editingCulture.image_url || "");
    setVideoUrl(editingCulture.video_url || "");

    setDifficulty(editingCulture.difficulty || "Beginner");

    setSortOrder(editingCulture.sort_order || 0);

    setFeatured(editingCulture.featured || false);
  } else {
    setTitle("");
    setCategory("");

    setDescription("");
    setHistory("");
    setTraditions("");
    setEtiquette("");
    setFestivals("");
    setFood("");
    setLandmarks("");
    setMedia("");

    setImageUrl("");
    setVideoUrl("");

    setDifficulty("Beginner");

    setSortOrder(0);

    setFeatured(false);
  }
}, [editingCulture, showModal]);
  const filteredCulture = useMemo(() => {
    const keyword = search.toLowerCase();

    return cultureItems.filter((item) => {
      return (
        item.title?.toLowerCase().includes(keyword) ||
        item.category?.toLowerCase().includes(keyword) ||
        item.description?.toLowerCase().includes(keyword) ||
        item.history?.toLowerCase().includes(keyword)
      );
    });
  }, [cultureItems, search]);

  const stats = useMemo(() => {
    return {
      total: cultureItems.length,

      featured: cultureItems.filter(
        (item) => item.featured
      ).length,

      beginner: cultureItems.filter(
        (item) => item.difficulty === "Beginner"
      ).length,

      images: cultureItems.filter(
        (item) => item.image_url
      ).length,
    };
  }, [cultureItems]);

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

              <Globe2 className="h-6 w-6 text-cyan-400" />

              <span className="rounded-full bg-cyan-500/10 px-4 py-1 text-xs font-bold uppercase tracking-[0.3em] text-cyan-300">

                Culture Manager

              </span>

            </div>

            <h2 className="text-4xl font-black text-white">

              {language?.name} Culture

            </h2>

            <p className="mt-3 max-w-3xl text-slate-400">

              Manage cultural information, traditions,
              etiquette, festivals, food, landmarks,
              media and historical background.

            </p>

          </div>

          <button
            onClick={() => {
              setEditingCulture(null);
              setShowModal(true);
            }}
            className="flex items-center gap-3 rounded-2xl bg-cyan-500 px-6 py-4 font-bold text-black transition hover:bg-cyan-400"
          >
            <Plus className="h-5 w-5" />

            New Culture Topic

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
                Total Topics
              </p>

              <h3 className="mt-2 text-4xl font-black">
                {stats.total}
              </h3>

            </div>

            <Globe2 className="h-10 w-10 text-cyan-400" />

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

            <Landmark className="h-10 w-10 text-emerald-400" />

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
                Images
              </p>

              <h3 className="mt-2 text-4xl font-black">
                {stats.images}
              </h3>

            </div>

            <ImageIcon className="h-10 w-10 text-purple-400" />

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
              placeholder="Search culture topics..."
              className="w-full rounded-2xl border border-white/10 bg-black/20 py-4 pl-14 pr-5 text-white outline-none transition focus:border-cyan-500"
            />

          </div>

          <div className="flex flex-wrap gap-3">

            <button
              onClick={fetchCulture}
              className="rounded-2xl border border-cyan-500/20 bg-cyan-500/10 px-6 py-3 font-semibold transition hover:bg-cyan-500/20"
            >
              Refresh
            </button>

            <button
              onClick={() => {
                setEditingCulture(null);
                setShowModal(true);
              }}
              className="rounded-2xl bg-cyan-500 px-6 py-3 font-bold text-black transition hover:bg-cyan-400"
            >
              + New Topic
            </button>

          </div>

        </div>

      </div>
            {/* Culture Topics */}

      {filteredCulture.length === 0 ? (

        <div className="rounded-3xl border border-dashed border-white/10 bg-white/[0.03] py-24 text-center">

          <Globe2 className="mx-auto mb-6 h-16 w-16 text-slate-600" />

          <h3 className="text-2xl font-black text-white">
            No Culture Topics
          </h3>

          <p className="mt-3 text-slate-400">
            Create your first cultural lesson for this language.
          </p>

          <button
            onClick={() => {
              setEditingCulture(null);
              setShowModal(true);
            }}
            className="mt-8 rounded-2xl bg-cyan-500 px-8 py-4 font-bold text-black transition hover:bg-cyan-400"
          >
            Create First Topic
          </button>

        </div>

      ) : (

        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">

          {filteredCulture.map((item, index) => (

            <motion.div
              key={item.id}
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

              {item.image_url && (
                <img
                  src={item.image_url}
                  alt={item.title}
                  className="h-52 w-full object-cover"
                />
              )}

              <div className="p-7">

                <div className="mb-6 flex items-start justify-between">

                  <div>

                    <h3 className="text-2xl font-black text-white">
                      {item.title}
                    </h3>

                    <p className="mt-2 text-cyan-300">
                      {item.category || "General"}
                    </p>

                  </div>

                  {item.featured && (
                    <span className="rounded-full bg-yellow-500/20 px-3 py-1 text-xs font-bold text-yellow-300">
                      Featured
                    </span>
                  )}

                </div>

                <div className="mb-5 flex flex-wrap gap-2">

                  <span className="rounded-full bg-cyan-500/10 px-3 py-1 text-xs font-bold text-cyan-300">
                    {item.category || "Culture"}
                  </span>

                  <span
                    className={`rounded-full px-3 py-1 text-xs font-bold ${
                      item.difficulty === "Beginner"
                        ? "bg-emerald-500/20 text-emerald-300"
                        : item.difficulty === "Intermediate"
                        ? "bg-amber-500/20 text-amber-300"
                        : "bg-rose-500/20 text-rose-300"
                    }`}
                  >
                    {item.difficulty}
                  </span>

                </div>

                <div className="space-y-5">

                  <div>

                    <p className="mb-2 text-xs font-bold uppercase tracking-widest text-slate-500">
                      Description
                    </p>

                    <p className="line-clamp-4 text-sm leading-7 text-slate-300">
                      {item.description || "No description available."}
                    </p>

                  </div>

                  {item.history && (
                    <div>

                      <p className="mb-2 text-xs font-bold uppercase tracking-widest text-slate-500">
                        History
                      </p>

                      <p className="line-clamp-3 text-sm text-slate-400">
                        {item.history}
                      </p>

                    </div>
                  )}

                  {item.traditions && (
                    <div>

                      <p className="mb-2 text-xs font-bold uppercase tracking-widest text-slate-500">
                        Traditions
                      </p>

                      <p className="line-clamp-3 text-sm text-slate-400">
                        {item.traditions}
                      </p>

                    </div>
                  )}

                  {item.etiquette && (
                    <div>

                      <p className="mb-2 text-xs font-bold uppercase tracking-widest text-slate-500">
                        Etiquette
                      </p>

                      <p className="line-clamp-3 text-sm text-slate-400">
                        {item.etiquette}
                      </p>

                    </div>
                  )}

                  {item.food && (
                    <div>

                      <p className="mb-2 text-xs font-bold uppercase tracking-widest text-slate-500">
                        Food
                      </p>

                      <p className="line-clamp-3 text-sm text-slate-400">
                        {item.food}
                      </p>

                    </div>
                  )}

                </div>

                <div className="mt-8 flex items-center justify-between border-t border-white/10 pt-5">

                  <span className="text-xs uppercase tracking-widest text-slate-500">
                    Order #{item.sort_order}
                  </span>

                  <button
                    onClick={() => {
                      setEditingCulture(item);
                      setShowModal(true);
                    }}
                    className="rounded-xl bg-cyan-500 px-5 py-2 text-sm font-bold text-black transition hover:bg-cyan-400"
                  >
                    Edit Topic
                  </button>

                </div>

              </div>

            </motion.div>

          ))}

        </div>

      )}
            {/* Add / Edit Culture Modal */}

      {showModal && (

        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-6 backdrop-blur-sm">

          <div className="max-h-[90vh] w-full max-w-6xl overflow-y-auto rounded-3xl border border-white/10 bg-[#08111f] p-8">

            <div className="mb-8 flex items-center justify-between">

              <div>

                <h2 className="text-3xl font-black text-white">

                  {editingCulture ? "Edit Culture Topic" : "Create Culture Topic"}

                </h2>

                <p className="mt-2 text-slate-400">

                  Manage traditions, festivals, etiquette, food,
                  landmarks, history and media.

                </p>

              </div>

              <button
                onClick={() => {
                  setShowModal(false);
                  setEditingCulture(null);
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
                placeholder="Topic Title"
                className="rounded-2xl border border-white/10 bg-black/20 p-4 text-white outline-none focus:border-cyan-500"
              />

              <input
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                placeholder="Category"
                className="rounded-2xl border border-white/10 bg-black/20 p-4 text-white outline-none focus:border-cyan-500"
              />

            </div>

            <div className="mt-6 space-y-6">

              <textarea
                rows={4}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Description..."
                className="w-full rounded-2xl border border-white/10 bg-black/20 p-4 text-white outline-none resize-none focus:border-cyan-500"
              />

              <textarea
                rows={4}
                value={history}
                onChange={(e) => setHistory(e.target.value)}
                placeholder="History..."
                className="w-full rounded-2xl border border-white/10 bg-black/20 p-4 text-white outline-none resize-none focus:border-cyan-500"
              />

              <textarea
                rows={4}
                value={traditions}
                onChange={(e) => setTraditions(e.target.value)}
                placeholder="Traditions..."
                className="w-full rounded-2xl border border-white/10 bg-black/20 p-4 text-white outline-none resize-none focus:border-cyan-500"
              />

              <textarea
                rows={4}
                value={etiquette}
                onChange={(e) => setEtiquette(e.target.value)}
                placeholder="Etiquette..."
                className="w-full rounded-2xl border border-white/10 bg-black/20 p-4 text-white outline-none resize-none focus:border-cyan-500"
              />

              <textarea
                rows={4}
                value={festivals}
                onChange={(e) => setFestivals(e.target.value)}
                placeholder="Festivals..."
                className="w-full rounded-2xl border border-white/10 bg-black/20 p-4 text-white outline-none resize-none focus:border-cyan-500"
              />

              <textarea
                rows={4}
                value={food}
                onChange={(e) => setFood(e.target.value)}
                placeholder="Food..."
                className="w-full rounded-2xl border border-white/10 bg-black/20 p-4 text-white outline-none resize-none focus:border-cyan-500"
              />

              <textarea
                rows={4}
                value={landmarks}
                onChange={(e) => setLandmarks(e.target.value)}
                placeholder="Landmarks..."
                className="w-full rounded-2xl border border-white/10 bg-black/20 p-4 text-white outline-none resize-none focus:border-cyan-500"
              />

              <textarea
                rows={4}
                value={media}
                onChange={(e) => setMedia(e.target.value)}
                placeholder="Media..."
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
                  value={videoUrl}
                  onChange={(e) => setVideoUrl(e.target.value)}
                  placeholder="Video URL"
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

                  Featured Topic

                </label>

              </div>

            </div>

            <div className="mt-8 flex justify-end gap-4">

              <button
                onClick={() => {
                  setShowModal(false);
                  setEditingCulture(null);
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
                      category,

                      description,
                      history,
                      traditions,
                      etiquette,
                      festivals,
                      food,
                      landmarks,
                      media,

                      image_url: imageUrl,
                      video_url: videoUrl,

                      difficulty,

                      sort_order: sortOrder,

                      featured,

                      updated_at: new Date().toISOString(),
                    };

                    let error;

                    if (editingCulture) {
                      ({ error } = await supabase
                        .from("language_culture")
                        .update(payload)
                        .eq("id", editingCulture.id));
                    } else {
                      ({ error } = await supabase
                        .from("language_culture")
                        .insert({
                          ...payload,
                          created_at: new Date().toISOString(),
                        }));
                    }

                    if (error) throw error;

                    await fetchCulture();

                    if (refresh) {
                      await refresh();
                    }

                    setShowModal(false);
                    setEditingCulture(null);

                    setTitle("");
                    setCategory("");

                    setDescription("");
                    setHistory("");
                    setTraditions("");
                    setEtiquette("");
                    setFestivals("");
                    setFood("");
                    setLandmarks("");
                    setMedia("");

                    setImageUrl("");
                    setVideoUrl("");

                    setDifficulty("Beginner");

                    setSortOrder(0);

                    setFeatured(false);

                  } catch (err) {
                    console.error(err);
                    alert("Failed to save culture topic.");
                  } finally {
                    setSaving(false);
                  }
                }}
                className="rounded-2xl bg-cyan-500 px-7 py-3 font-bold text-black transition hover:bg-cyan-400 disabled:opacity-50"
              >
                {saving ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : editingCulture ? (
                  "Update Topic"
                ) : (
                  "Create Topic"
                )}
              </button>

            </div>

          </div>

        </div>

      )}

    </div>
  );
}