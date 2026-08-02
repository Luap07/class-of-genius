import React, {
  useCallback,
  useEffect,
  useState,
} from "react";

import {
  Loader2,
  Save,
  Globe,
  BookOpen,
  Languages,
  Sparkles,
} from "lucide-react";

import { motion } from "framer-motion";

import { supabase } from "../../../lib/supabaseClient";

export default function LanguageOverview({
  language,
  refresh,
}) {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [name, setName] = useState("");
  const [nativeName, setNativeName] = useState("");
  const [code, setCode] = useState("");
  const [difficulty, setDifficulty] = useState("Beginner");
  
  // Added missing states
  const [description, setDescription] = useState("");
  const [objectives, setObjectives] = useState("");
  const [heroImage, setHeroImage] = useState("");
  const [coverImage, setCoverImage] = useState("");
  const [seoTitle, setSeoTitle] = useState("");
  const [seoDescription, setSeoDescription] = useState("");
  const [status, setStatus] = useState("draft");

  const [fetchError, setFetchError] = useState("");

  const loadLanguage = useCallback(async () => {
    if (!language?.id) return;

    setLoading(true);
    setFetchError("");

    try {
      const { data, error } = await supabase
        .from("languages")
        .select("*")
        .eq("id", language.id)
        .single();

      if (error) throw error;

      setName(data?.name || "");
      setNativeName(data?.native_name || "");
      setCode(data?.code || "");
      setDifficulty(data?.difficulty || "Beginner");
      
      // Properly assign fetched data to states
      setDescription(data?.description || "");
      setObjectives(data?.objectives || "");
      setHeroImage(data?.hero_image || "");
      setCoverImage(data?.cover_image || "");
      setSeoTitle(data?.seo_title || "");
      setSeoDescription(data?.seo_description || "");
      setStatus(data?.status || "draft");
    } catch (err) {
      console.error(err);
      setFetchError(err.message);
    }

    setLoading(false);
  }, [language]);

  useEffect(() => {
    loadLanguage();
  }, [loadLanguage]);

  if (loading) {
    return (
      <div className="flex min-h-[550px] items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-cyan-400" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <motion.div
        initial={{
          opacity: 0,
          y: 20,
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
              <Sparkles className="h-6 w-6 text-cyan-400" />
              <span className="rounded-full bg-cyan-500/10 px-4 py-1 text-xs font-bold uppercase tracking-[0.3em] text-cyan-300">
                Language Overview
              </span>
            </div>
            <h2 className="text-4xl font-black text-white">
              {language?.name}
            </h2>
            <p className="mt-3 max-w-3xl text-slate-400">
              Manage the core information and identity of this language.
            </p>
          </div>
          <div className="flex items-center gap-3 rounded-2xl border border-cyan-500/20 bg-cyan-500/10 px-5 py-4">
            <Languages className="h-7 w-7 text-cyan-400" />
            <div>
              <p className="text-xs uppercase tracking-widest text-slate-400">
                Current Language
              </p>
              <p className="font-bold text-white">
                {language?.name}
              </p>
            </div>
          </div>
        </div>
      </motion.div>

      {fetchError && (
        <div className="rounded-2xl border border-red-500/30 bg-red-500/10 p-4 text-red-300">
          {fetchError}
        </div>
      )}

      <div className="grid gap-8 xl:grid-cols-2">
        <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-8">
          <div className="mb-8 flex items-center gap-3">
            <Globe className="h-6 w-6 text-cyan-400" />
            <h3 className="text-2xl font-black">
              Basic Information
            </h3>
          </div>
          <div className="space-y-6">
            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-300">
                Language Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="English"
                className="w-full rounded-2xl border border-white/10 bg-black/20 px-5 py-4 text-white outline-none transition focus:border-cyan-500"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-300">
                Native Name
              </label>
              <input
                type="text"
                value={nativeName}
                onChange={(e) => setNativeName(e.target.value)}
                placeholder="English"
                className="w-full rounded-2xl border border-white/10 bg-black/20 px-5 py-4 text-white outline-none transition focus:border-cyan-500"
              />
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-300">
                  Language Code
                </label>
                <input
                  type="text"
                  value={code}
                  onChange={(e) =>
                    setCode(e.target.value.toUpperCase())
                  }
                  placeholder="EN"
                  className="w-full rounded-2xl border border-white/10 bg-black/20 px-5 py-4 uppercase text-white outline-none transition focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-300">
                  Difficulty
                </label>
                <select
                  value={difficulty}
                  onChange={(e) =>
                    setDifficulty(e.target.value)
                  }
                  className="w-full rounded-2xl border border-white/10 bg-black/20 px-5 py-4 text-white outline-none transition focus:border-cyan-500"
                >
                  <option value="Beginner">Beginner</option>
                  <option value="Elementary">Elementary</option>
                  <option value="Intermediate">Intermediate</option>
                  <option value="Upper Intermediate">Upper Intermediate</option>
                  <option value="Advanced">Advanced</option>
                  <option value="Native">Native</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-8">
          <div className="mb-8 flex items-center gap-3">
            <BookOpen className="h-6 w-6 text-cyan-400" />
            <h3 className="text-2xl font-black">
              Overview Summary
            </h3>
          </div>

          <div className="space-y-6">
            <div className="rounded-2xl border border-cyan-500/20 bg-cyan-500/5 p-6">
              <h4 className="mb-3 text-lg font-bold">
                Current Information
              </h4>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Language</span>
                  <span className="font-bold text-white">{name || "-"}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Native Name</span>
                  <span className="font-bold text-white">{nativeName || "-"}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Code</span>
                  <span className="font-bold text-cyan-300">{code || "-"}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Difficulty</span>
                  <span className="rounded-full bg-indigo-500/20 px-3 py-1 text-sm font-semibold text-indigo-300">
                    {difficulty}
                  </span>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-white/10 bg-black/20 p-6">
              <h4 className="mb-4 text-lg font-bold">
                Quick Preview
              </h4>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-xl border border-white/10 bg-white/5 p-4">
                  <p className="text-xs uppercase tracking-widest text-slate-500">
                    Language
                  </p>
                  <p className="mt-2 text-xl font-black text-white">
                    {name || "Not set"}
                  </p>
                </div>
                <div className="rounded-xl border border-white/10 bg-white/5 p-4">
                  <p className="text-xs uppercase tracking-widest text-slate-500">
                    Level
                  </p>
                  <p className="mt-2 text-xl font-black text-cyan-300">
                    {difficulty}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Description */}
      <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-8">
        <div className="mb-8">
          <h3 className="text-2xl font-black">
            Language Description
          </h3>
          <p className="mt-2 text-slate-400">
            Introduce learners to this language.
          </p>
        </div>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={8}
          placeholder="Write an engaging description..."
          className="w-full rounded-2xl border border-white/10 bg-black/20 p-5 text-white outline-none transition focus:border-cyan-500 resize-none"
        />
      </div>

      {/* Learning Objectives */}
      <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-8">
        <div className="mb-8">
          <h3 className="text-2xl font-black">
            Learning Objectives
          </h3>
          <p className="mt-2 text-slate-400">
            What should students achieve after completing this language?
          </p>
        </div>
        <textarea
          value={objectives}
          onChange={(e) => setObjectives(e.target.value)}
          rows={6}
          placeholder="Example:&#10;• Hold everyday conversations&#10;• Read short stories&#10;• Understand native pronunciation"
          className="w-full rounded-2xl border border-white/10 bg-black/20 p-5 text-white outline-none transition focus:border-cyan-500 resize-none"
        />
      </div>

      {/* Language Details */}
      <div className="grid gap-8 xl:grid-cols-3">
        <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-6">
          <p className="text-sm uppercase tracking-widest text-slate-500">Status</p>
          <h4 className="mt-3 text-3xl font-black text-cyan-300">Active</h4>
        </div>
        <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-6">
          <p className="text-sm uppercase tracking-widest text-slate-500">Modules</p>
          <h4 className="mt-3 text-3xl font-black text-white">10+</h4>
        </div>
        <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-6">
          <p className="text-sm uppercase tracking-widest text-slate-500">Curriculum</p>
          <h4 className="mt-3 text-3xl font-black text-indigo-300">Complete</h4>
        </div>
      </div>

      {/* Save */}
      <div className="flex justify-end">
        <button
          onClick={async () => {
            if (!language?.id) return;

            try {
              setSaving(true);

              const { error } = await supabase
                .from("languages")
                .update({
                  name,
                  native_name: nativeName,
                  code,
                  difficulty,
                  description,
                  objectives,
                  hero_image: heroImage,
                  cover_image: coverImage,
                  seo_title: seoTitle,
                  seo_description: seoDescription,
                  status,
                  updated_at: new Date().toISOString(),
                })
                .eq("id", language.id);

              if (error) throw error;

              if (refresh) {
                await refresh();
              }

              alert("Language updated successfully.");
            } catch (err) {
              console.error(err);
              alert("Failed to save language.");
            } finally {
              setSaving(false);
            }
          }}
          disabled={saving}
          className="flex items-center gap-3 rounded-2xl bg-cyan-500 px-8 py-4 font-bold text-black transition hover:bg-cyan-400 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {saving ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            <Save className="h-5 w-5" />
          )}
          Save Changes
        </button>
      </div>
    </div>
  );
}