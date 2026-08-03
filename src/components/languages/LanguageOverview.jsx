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

      const { error } = await supabase
        .from("language_overviews")
        .update({
          difficulty: value,
          updated_at: new Date().toISOString(),
        })
        .eq("language_id", language.id);

      if (error) {
        throw error;
      }

      setOverview((prev) => ({
        ...prev,
        difficulty: value,
      }));
    } catch (error) {
      console.error("Difficulty Update Error:", error);
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
          .order("created_at", { ascending: false })
          .limit(1)
          .maybeSingle();

        if (error) {
          console.error("Overview Fetch Error:", error);
        }

        setOverview(data || null);
        setSelectedDifficulty(data?.difficulty || "Beginner");
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    }

    loadOverview();
  }, [language]);

  if (loading) {
    return (
      <div className="flex h-[70vh] items-center justify-center bg-[#020617]">
        <div className="text-center">
          <div className="mx-auto mb-6 h-14 w-14 animate-spin rounded-full border-4 border-cyan-500 border-t-transparent" />
          <p className="text-slate-400">Loading language overview...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-10 bg-[#020617] p-2">
      {/* COVER IMAGE */}
      {overview?.cover_image && (
        <div className="overflow-hidden rounded-[36px] border border-white/10">
          <img
            src={overview.cover_image}
            alt={overview.title}
            className="h-[420px] w-full object-cover"
          />
        </div>
      )}

      {/* HEADER */}
      <section className="rounded-[36px] border border-white/10 bg-slate-900 p-10">
        <div className="flex flex-wrap items-center gap-4">
          <span className="rounded-full bg-cyan-500/10 px-5 py-2 text-xs font-bold uppercase tracking-[0.35em] text-cyan-300">
            {language?.code || "LANGUAGE"}
          </span>

          {/* DIFFICULTY SWITCH */}
          <select
            value={selectedDifficulty}
            onChange={(e) => updateDifficulty(e.target.value)}
            className="rounded-full border border-white/10 bg-[#020617] px-6 py-3 text-sm font-black uppercase tracking-[0.25em] text-white shadow-lg outline-none transition hover:border-cyan-500/50 focus:border-cyan-500"
          >
            <option value="Beginner" className="bg-[#020617] text-white">
              Beginner
            </option>
            <option value="Intermediate" className="bg-[#020617] text-white">
              Intermediate
            </option>
            <option value="Advanced" className="bg-[#020617] text-white">
              Advanced
            </option>
          </select>
        </div>

        <h1 className="mt-8 text-5xl font-black leading-tight text-white lg:text-6xl">
          {overview?.title || language?.name}
        </h1>

        <p className="mt-8 max-w-5xl text-lg leading-9 text-slate-300">
          {overview?.description || "No overview has been added for this language yet."}
        </p>
      </section>

      {/* MAIN GRID CONTENT */}
      <div className="grid gap-8 xl:grid-cols-3">
        {/* LEFT CONTENT */}
        <div className="space-y-8 xl:col-span-2">
          {/* LEARNING OBJECTIVES */}
          <section className="rounded-[32px] border border-white/10 bg-slate-900 p-10">
            <div className="flex items-center gap-4">
              <Target size={34} className="text-cyan-400" />
              <div>
                <h2 className="text-3xl font-black text-white">Learning Objectives</h2>
                <p className="mt-2 text-slate-400">
                  What learners should achieve after completing this language.
                </p>
              </div>
            </div>

            <div className="mt-8 whitespace-pre-wrap rounded-3xl border border-white/10 bg-slate-950/40 p-8 text-lg leading-9 text-slate-300">
              {overview?.objectives || "No learning objectives have been added yet."}
            </div>
          </section>

          {/* ABOUT LANGUAGE */}
          <section className="rounded-[32px] border border-white/10 bg-slate-900 p-10">
            <div className="flex items-center gap-4">
              <BookOpen size={34} className="text-blue-400" />
              <div>
                <h2 className="text-3xl font-black text-white">About {language?.name}</h2>
                <p className="mt-2 text-slate-400">Learn more about this language.</p>
              </div>
            </div>

            <div className="mt-8 whitespace-pre-wrap text-lg leading-9 text-slate-300">
              {overview?.description || "No description available."}
            </div>
          </section>

          {/* HERO IMAGE */}
          {overview?.hero_image && (
            <section className="overflow-hidden rounded-[32px] border border-white/10 bg-slate-900">
              <img
                src={overview.hero_image}
                alt={overview.title}
                className="h-[420px] w-full object-cover"
              />
              <div className="p-8">
                <div className="flex items-center gap-3">
                  <Sparkles size={28} className="text-cyan-400" />
                  <h2 className="text-2xl font-black text-white">Featured Visual</h2>
                </div>
                <p className="mt-4 leading-8 text-slate-400">
                  This image highlights the culture and identity of {language?.name}.
                </p>
              </div>
            </section>
          )}
        </div>

        {/* RIGHT SIDEBAR */}
        <div className="space-y-8">
          {/* QUICK FACTS */}
<section className="rounded-[32px] border border-white/10 bg-slate-900 p-8">

  <div className="flex items-center gap-3">
    <Languages
      size={30}
      className="text-cyan-400"
    />

    <h2 className="text-2xl font-black text-white">
      Quick Facts
    </h2>
  </div>


  <div className="mt-8 space-y-6">


    <div className="flex items-center justify-between">
      <span className="text-slate-500">
        Language Type
      </span>

      <span className="font-bold text-white">
        Natural Language
      </span>
    </div>



    <div className="flex items-center justify-between">
      <span className="text-slate-500">
        Global Status
      </span>

      <span className="font-bold text-emerald-400">
        Widely Spoken
      </span>
    </div>



    <div className="flex items-center justify-between">
      <span className="text-slate-500">
        Learning Category
      </span>

      <span className="font-bold text-white">
        Foreign Language
      </span>
    </div>



    <div className="flex items-center justify-between">
      <span className="text-slate-500">
        Learning Mode
      </span>

      <span className="font-bold text-white">
        Reading, Writing & Speaking
      </span>
    </div>



    <div className="flex items-center justify-between">
      <span className="text-slate-500">
        Content Level
      </span>

      <span className="font-bold text-cyan-300">
        Beginner to Advanced
      </span>
    </div>


  </div>

</section>          {/* STATISTICS CARDS */}
          <div className="grid gap-5">
            <div className="rounded-3xl border border-white/10 bg-slate-900 p-6">
              <Globe2 size={34} className="text-cyan-400" />
              <p className="mt-4 text-sm uppercase tracking-wider text-slate-500">Native Name</p>
              <h3 className="mt-2 text-2xl font-black text-white">
                {language?.native_name || "-"}
              </h3>
            </div>

            <div className="rounded-3xl border border-white/10 bg-slate-900 p-6">
              <Users size={34} className="text-emerald-400" />
              <p className="mt-4 text-sm uppercase tracking-wider text-slate-500">Speakers</p>
              <h3 className="mt-2 text-2xl font-black text-white">
                {overview?.speakers || "Worldwide"}
              </h3>
            </div>

            <div className="rounded-3xl border border-white/10 bg-slate-900 p-6">
              <GraduationCap size={34} className="text-violet-400" />
              <p className="mt-4 text-sm uppercase tracking-wider text-slate-500">Difficulty</p>
              <div className="mt-3">
                <select
                  value={selectedDifficulty}
                  onChange={(e) => updateDifficulty(e.target.value)}
                  className="w-full rounded-2xl border border-white/10 bg-[#020617] px-4 py-3 text-base font-black text-white shadow-xl outline-none transition hover:border-cyan-500/50 focus:border-cyan-500"
                >
                  <option value="Beginner" className="bg-[#020617] text-white">Beginner</option>
                  <option value="Intermediate" className="bg-[#020617] text-white">Intermediate</option>
                  <option value="Advanced" className="bg-[#020617] text-white">Advanced</option>
                </select>
              </div>
            </div>

            <div className="rounded-3xl border border-white/10 bg-slate-900 p-6">
              <MapPin size={34} className="text-orange-400" />
              <p className="mt-4 text-sm uppercase tracking-wider text-slate-500">Region</p>
              <h3 className="mt-2 text-2xl font-black text-white">
                {overview?.primary_region || "-"}
              </h3>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}