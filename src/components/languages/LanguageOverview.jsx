import React, { useEffect, useState } from "react";
import {
  Globe2,
  Users,
  GraduationCap,
  MapPin,
  Languages,
  BookOpen,
  Sparkles,
  Target,
} from "lucide-react";
import { supabase } from "../../lib/supabaseClient";

export default function LanguageOverview({ language }) {
  const [overview, setOverview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedDifficulty, setSelectedDifficulty] = useState("Beginner");

  /*
  ==================================
        UPDATE DIFFICULTY
  ==================================
  */
  const updateDifficulty = async (value) => {
    try {
      setSelectedDifficulty(value);

      const { data, error } = await supabase
        .from("language_overviews")
        .select("*")
        .eq("language_id", language.id)
        .eq("difficulty", value)
        .maybeSingle();

      if (error) throw error;

      setOverview(data || null);
    } catch (error) {
      console.error("Difficulty Fetch Error:", error);
    }
  };

  /*
  ==================================
        FETCH LANGUAGE OVERVIEW
  ==================================
  */
  useEffect(() => {
    if (!language?.id) return;

    async function loadOverview() {
      try {
        setLoading(true);

        const { data, error } = await supabase
          .from("language_overviews")
          .select("*")
          .eq("language_id", language.id)
          .eq("difficulty", selectedDifficulty)
          .maybeSingle();

        if (error) throw error;

        setOverview(data || null);
      } catch (error) {
        console.error("Overview Fetch Error:", error);
      } finally {
        setLoading(false);
      }
    }

    loadOverview();
  }, [language, selectedDifficulty]);

  if (loading) {
    return (
      <div className="flex h-[70vh] items-center justify-center bg-[#020617]">
        <div className="text-center">
          <div className="mx-auto mb-6 h-14 w-14 animate-spin rounded-full border-4 border-cyan-500 border-t-transparent" />
          <p className="text-slate-400 font-medium">Loading language overview...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-12 bg-[#020617] p-2 sm:p-6">
      {/* ============================================
                  PREMIUM HERO
      ============================================ */}
      <section className="relative overflow-hidden rounded-[40px] border border-white/10 shadow-2xl">
        <div className="relative h-[560px] w-full overflow-hidden">
          {overview?.cover_image ? (
            <img
              src={overview.cover_image}
              alt={overview?.title || language?.name}
              className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 scale-105 hover:scale-110"
            />
          ) : (
            <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-slate-900 to-violet-950" />
          )}

          {/* Overlay Gradient */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#020617] via-[#020617]/70 to-black/30" />

          {/* Decorative Glow Elements */}
          <div className="absolute -top-32 -right-32 h-96 w-96 rounded-full bg-violet-500/20 blur-[160px]" />
          <div className="absolute -bottom-20 -left-20 h-80 w-80 rounded-full bg-cyan-500/20 blur-[150px]" />

          {/* Hero Inner Content */}
          <div className="absolute inset-0 flex items-end">
            <div className="w-full p-8 lg:p-14">
              <div className="flex flex-wrap items-center gap-4">
                <span className="rounded-full border border-cyan-400/30 bg-cyan-500/10 px-5 py-2 text-xs font-black uppercase tracking-[0.35em] text-cyan-300 backdrop-blur-xl">
                  {language?.code || "LANGUAGE"}
                </span>
                <span className="rounded-full border border-violet-400/30 bg-violet-500/20 px-6 py-2 text-xs font-black uppercase tracking-[0.35em] text-violet-200 backdrop-blur-xl shadow-lg shadow-violet-500/20">
                  {selectedDifficulty}
                </span>
              </div>

              <h1 className="mt-8 max-w-5xl text-4xl font-black leading-tight text-white sm:text-6xl lg:text-7xl">
                {overview?.title || language?.name}
              </h1>

              <p className="mt-6 max-w-4xl text-base leading-8 text-slate-300 sm:text-lg sm:leading-9">
                {overview?.description || "No overview has been added for this language yet."}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================
                  MAIN CONTENT GRID
      ============================================ */}
      <div className="grid gap-8 xl:grid-cols-3">
        {/* LEFT COLUMN */}
        <div className="space-y-8 xl:col-span-2">
          {/* LEARNING OBJECTIVES */}
          <section className="relative overflow-hidden rounded-[36px] border border-cyan-500/10 bg-gradient-to-br from-slate-900 via-[#08111f] to-slate-950 p-8 sm:p-12 shadow-xl">
            <div className="absolute -right-24 -top-24 h-72 w-72 rounded-full bg-cyan-500/10 blur-[120px]" />
            <div className="absolute left-0 top-0 h-full w-1 bg-gradient-to-b from-cyan-400 via-sky-500 to-transparent" />

            <div className="flex flex-col sm:flex-row sm:items-center gap-6">
              <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-[28px] bg-cyan-500/10 ring-1 ring-cyan-400/20 shadow-lg">
                <Target size={38} className="text-cyan-300" />
              </div>
              <div>
                <p className="text-xs font-black uppercase tracking-[0.45em] text-cyan-400">
                  Learning Journey
                </p>
                <h2 className="mt-2 text-3xl font-black text-white sm:text-4xl">
                  Learning Objectives
                </h2>
                <p className="mt-2 text-slate-400 text-sm sm:text-base">
                  Master the core competencies expected for the <span className="text-cyan-300 font-bold">{selectedDifficulty}</span> tier.
                </p>
              </div>
            </div>

            <div className="my-8 h-px bg-gradient-to-r from-cyan-500/30 via-white/10 to-transparent" />

            <div className="rounded-[28px] border border-white/5 bg-black/20 p-6 sm:p-8 backdrop-blur-xl">
              <div className="whitespace-pre-wrap text-base sm:text-[17px] leading-8 sm:leading-9 text-slate-300">
                {overview?.objectives || "No learning objectives have been added yet."}
              </div>
            </div>
          </section>

          {/* ABOUT LANGUAGE */}
          <section className="relative overflow-hidden rounded-[36px] border border-white/10 bg-gradient-to-br from-slate-900 via-slate-900 to-slate-950 p-8 sm:p-12 shadow-xl">
            <div className="absolute -left-24 top-0 h-64 w-64 rounded-full bg-violet-500/10 blur-[120px]" />

            <div className="flex flex-col sm:flex-row sm:items-center gap-6">
              <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-[28px] bg-violet-500/10 ring-1 ring-violet-400/20 shadow-lg">
                <BookOpen size={38} className="text-violet-300" />
              </div>
              <div>
                <p className="text-xs font-black uppercase tracking-[0.45em] text-violet-300">
                  Contextual Background
                </p>
                <h2 className="mt-2 text-3xl font-black text-white sm:text-4xl">
                  About {language?.name}
                </h2>
                <p className="mt-2 text-slate-400 text-sm sm:text-base">
                  Explore linguistic origins, features, and cultural background.
                </p>
              </div>
            </div>

            <div className="my-8 h-px bg-gradient-to-r from-violet-500/30 via-white/10 to-transparent" />

            <div className="whitespace-pre-wrap text-base sm:text-[17px] leading-8 sm:leading-10 text-slate-300">
              {overview?.description || "No description available."}
            </div>
          </section>

          {/* FEATURED HERO/VISUAL IMAGE */}
          {overview?.hero_image && (
            <section className="overflow-hidden rounded-[36px] border border-white/10 bg-slate-900 shadow-xl">
              <div className="relative h-[420px] w-full overflow-hidden">
                <img
                  src={overview.hero_image}
                  alt={overview.title || "Featured Visual"}
                  className="h-full w-full object-cover transition duration-700 hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                <div className="absolute bottom-8 left-8 right-8 rounded-[28px] border border-white/10 bg-black/40 p-6 sm:p-8 backdrop-blur-xl">
                  <div className="flex items-center gap-3">
                    <Sparkles size={28} className="text-cyan-400" />
                    <span className="text-lg sm:text-xl font-black text-white">Featured Visual</span>
                  </div>
                  <p className="mt-3 text-sm sm:text-base leading-7 sm:leading-8 text-slate-300">
                    This image highlights the vibrant culture and identity native to {language?.name}.
                  </p>
                </div>
              </div>
            </section>
          )}
        </div>

        {/* RIGHT SIDEBAR */}
        <div className="space-y-8">
          {/* QUICK FACTS */}
          <section className="relative overflow-hidden rounded-[36px] border border-white/10 bg-gradient-to-br from-slate-900 via-[#0b1220] to-slate-950 p-8 shadow-xl">
            <div className="absolute -top-16 -right-16 h-48 w-48 rounded-full bg-cyan-500/10 blur-[120px]" />
            <div className="absolute -bottom-16 -left-16 h-52 w-52 rounded-full bg-violet-500/10 blur-[120px]" />

            <div className="relative">
              <div className="flex items-center gap-4">
                <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-cyan-500/10 ring-1 ring-cyan-400/20">
                  <Languages size={30} className="text-cyan-300" />
                </div>
                <div>
                  <p className="text-xs font-black uppercase tracking-[0.35em] text-cyan-300">
                    At a Glance
                  </p>
                  <h2 className="mt-1 text-2xl font-black text-white">
                    Quick Facts
                  </h2>
                </div>
              </div>

              <div className="mt-8 space-y-5 text-sm sm:text-base">
                <div className="flex items-center justify-between rounded-2xl border border-white/5 bg-white/[0.03] p-4">
                  <span className="text-slate-400">Language Type</span>
                  <span className="font-bold text-white">Natural Language</span>
                </div>

                <div className="flex items-center justify-between rounded-2xl border border-white/5 bg-white/[0.03] p-4">
                  <span className="text-slate-400">Global Status</span>
                  <span className="font-bold text-emerald-400">Widely Spoken</span>
                </div>

                <div className="flex items-center justify-between rounded-2xl border border-white/5 bg-white/[0.03] p-4">
                  <span className="text-slate-400">Learning Category</span>
                  <span className="font-bold text-white">Foreign Language</span>
                </div>

                <div className="flex items-center justify-between rounded-2xl border border-white/5 bg-white/[0.03] p-4">
                  <span className="text-slate-400">Learning Mode</span>
                  <span className="font-bold text-white">Reading, Writing & Speaking</span>
                </div>

                <div className="flex items-center justify-between rounded-2xl border border-white/5 bg-white/[0.03] p-4">
                  <span className="text-slate-400">Content Level</span>
                  <span className="font-bold text-cyan-300">Beginner to Advanced</span>
                </div>
              </div>
            </div>
          </section>

          {/* STATISTICS & CONTROLS CARDS */}
          <div className="grid gap-6">
            {/* Native Name Card */}
            <div className="group relative overflow-hidden rounded-[32px] border border-cyan-500/10 bg-gradient-to-br from-slate-900 via-slate-900 to-slate-950 p-7 transition-all duration-500 hover:-translate-y-1 hover:border-cyan-400/30 shadow-xl">
              <div className="absolute -right-10 -top-10 h-28 w-28 rounded-full bg-cyan-500/10 blur-3xl transition duration-500 group-hover:scale-125" />
              <div className="relative">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-cyan-500/10 ring-1 ring-cyan-400/20">
                  <Globe2 size={30} className="text-cyan-300" />
                </div>
                <p className="mt-6 text-xs font-black uppercase tracking-[0.35em] text-slate-500">
                  Native Name
                </p>
                <h3 className="mt-2 text-2xl font-black text-white">
                  {language?.native_name || "-"}
                </h3>
              </div>
            </div>

            {/* Speakers Card */}
            <div className="group relative overflow-hidden rounded-[32px] border border-emerald-500/10 bg-gradient-to-br from-slate-900 via-slate-900 to-slate-950 p-7 transition-all duration-500 hover:-translate-y-1 hover:border-emerald-400/30 shadow-xl">
              <div className="absolute -left-10 -bottom-10 h-28 w-28 rounded-full bg-emerald-500/10 blur-3xl transition duration-500 group-hover:scale-125" />
              <div className="relative">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-500/10 ring-1 ring-emerald-400/20">
                  <Users size={30} className="text-emerald-300" />
                </div>
                <p className="mt-6 text-xs font-black uppercase tracking-[0.35em] text-slate-500">
                  Speakers
                </p>
                <h3 className="mt-2 text-2xl font-black text-white">
                  {overview?.speakers || "Worldwide"}
                </h3>
              </div>
            </div>

            {/* Difficulty Selector Card */}
            <div className="group relative overflow-hidden rounded-[32px] border border-violet-500/10 bg-gradient-to-br from-slate-900 via-slate-900 to-slate-950 p-7 transition-all duration-500 hover:-translate-y-1 hover:border-violet-400/30 shadow-xl">
              <div className="absolute -right-12 top-0 h-36 w-36 rounded-full bg-violet-500/10 blur-3xl transition duration-500 group-hover:scale-125" />
              <div className="relative">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-violet-500/10 ring-1 ring-violet-400/20">
                  <GraduationCap size={30} className="text-violet-300" />
                </div>
                <p className="mt-6 text-xs font-black uppercase tracking-[0.35em] text-slate-500">
                  Difficulty Level
                </p>
                <div className="mt-4">
                  <select
                    value={selectedDifficulty}
                    onChange={(e) => updateDifficulty(e.target.value)}
                    className="w-full rounded-2xl border border-violet-500/20 bg-[#090f1c] px-5 py-4 text-base font-black text-white shadow-xl outline-none transition hover:border-violet-400 focus:border-violet-400 cursor-pointer"
                  >
                    <option value="Beginner" className="bg-[#020617] text-white">Beginner</option>
                    <option value="Intermediate" className="bg-[#020617] text-white">Intermediate</option>
                    <option value="Advanced" className="bg-[#020617] text-white">Advanced</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Region Card */}
            <div className="group relative overflow-hidden rounded-[32px] border border-orange-500/10 bg-gradient-to-br from-slate-900 via-slate-900 to-slate-950 p-7 transition-all duration-500 hover:-translate-y-1 hover:border-orange-400/30 shadow-xl">
              <div className="absolute -left-12 top-0 h-36 w-36 rounded-full bg-orange-500/10 blur-3xl transition duration-500 group-hover:scale-125" />
              <div className="relative">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-orange-500/10 ring-1 ring-orange-400/20">
                  <MapPin size={30} className="text-orange-300" />
                </div>
                <p className="mt-6 text-xs font-black uppercase tracking-[0.35em] text-slate-500">
                  Primary Region
                </p>
                <h3 className="mt-2 text-2xl font-black text-white">
                  {overview?.primary_region || "-"}
                </h3>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}