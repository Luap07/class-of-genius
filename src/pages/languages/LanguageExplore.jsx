// src/pages/languages/LanguageExplore.jsx

import React, { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Globe2,
  Search,
  Users,
  Star,
  ArrowRight,
  Languages,
  GraduationCap,
  Sparkles,
  RotateCcw,
  AlertCircle,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { languages } from "../../data/language/languages";

const continents = [
  "All",
  "Africa",
  "Europe",
  "Asia",
  "North America",
  "South America",
  "Oceania",
];

const levels = ["All", "Beginner", "Intermediate", "Advanced"];

const stats = [
  {
    title: "Available Languages",
    value: languages.length.toString(),
    icon: Globe2,
  },
  {
    title: "Featured Languages",
    value: languages.filter((language) => language.featured).length.toString(),
    icon: Star,
  },
  {
    title: "Regions Covered",
    value: new Set(languages.map((language) => language.continent)).size.toString(),
    icon: Users,
  },
  {
    title: "Learning Levels",
    value: new Set(languages.map((language) => language.level)).size.toString(),
    icon: GraduationCap,
  },
];

const LanguageExplore = () => {
  const [search, setSearch] = useState("");
  const [continent, setContinent] = useState("All");
  const [level, setLevel] = useState("All");
  const [featuredOnly, setFeaturedOnly] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const filteredLanguages = useMemo(() => {
    return languages.filter((language) => {
      const matchesSearch =
        language.name.toLowerCase().includes(search.toLowerCase()) ||
        language.nativeName.toLowerCase().includes(search.toLowerCase());

      const matchesContinent =
        continent === "All" ? true : language.continent === continent;

      const matchesLevel = level === "All" ? true : language.level === level;

      const matchesFeatured = featuredOnly ? language.featured : true;

      return matchesSearch && matchesContinent && matchesLevel && matchesFeatured;
    });
  }, [search, continent, level, featuredOnly]);

  const hasActiveFilters =
    search !== "" || continent !== "All" || level !== "All" || featuredOnly;

  const resetFilters = () => {
    setSearch("");
    setContinent("All");
    setLevel("All");
    setFeaturedOnly(false);
  };

  return (
    <section
      id="language-explore"
      className="relative text-white selection:bg-blue-500 selection:text-white"
    >
      {/* HERO SECTION */}
      <div className="relative overflow-hidden border-b border-slate-800/80 bg-gradient-to-b from-slate-900/60 via-slate-950 to-[#020617]">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(59,130,246,.18),transparent_45%),radial-gradient(circle_at_bottom_left,rgba(6,182,212,.12),transparent_45%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.03)_1px,transparent_1px)] bg-[size:45px_45px] opacity-20" />

        <div className="relative mx-auto max-w-7xl px-6 py-24 lg:py-28">
          <motion.div
            initial={{ opacity: 0, y: 25 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="inline-flex items-center gap-2 rounded-full border border-cyan-500/30 bg-cyan-500/10 px-4 py-2 text-sm font-semibold text-cyan-300 backdrop-blur-xl">
              <Sparkles size={16} className="text-cyan-400 animate-pulse" />
              Learn Without Borders
            </div>

            <h1 className="mt-6 max-w-5xl text-5xl font-black tracking-tight sm:text-6xl lg:text-7xl">
              Explore The World's
              <span className="block bg-gradient-to-r from-cyan-400 via-blue-400 to-indigo-500 bg-clip-text pb-2 text-transparent">
                Languages
              </span>
            </h1>

            <p className="mt-6 max-w-3xl text-lg leading-8 text-slate-400">
              Discover languages from around the world, improve your communication skills,
              practice pronunciation, build vocabulary, and master new cultures through
              immersive learning experiences.
            </p>
          </motion.div>
        </div>
      </div>

      {/* STATS SECTION */}
      <div className="relative z-10 mx-auto -mt-10 grid max-w-7xl gap-6 px-6 md:grid-cols-2 xl:grid-cols-4">
        {stats.map((item, index) => {
          const Icon = item.icon;

          return (
            <motion.div
              key={item.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
              whileHover={{ y: -6 }}
              className="rounded-3xl border border-slate-800 bg-slate-900/90 p-8 shadow-2xl backdrop-blur-xl transition-all hover:border-cyan-500/30"
            >
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-cyan-500/10 border border-cyan-500/20">
                <Icon size={26} className="text-cyan-400" />
              </div>

              <h2 className="mt-6 text-4xl font-black">{item.value}</h2>
              <p className="mt-2 text-slate-400">{item.title}</p>
            </motion.div>
          );
        })}
      </div>

      {/* SEARCH & FILTERS */}
      <div className="mx-auto mt-16 max-w-7xl px-6">
        <div className="rounded-3xl border border-slate-800 bg-slate-900/90 p-6 md:p-8 backdrop-blur-xl shadow-2xl">
          <div className="grid gap-6 lg:grid-cols-4">
            <div className="lg:col-span-2">
              <label className="mb-3 block text-sm font-semibold text-slate-300">
                Search Languages
              </label>
              <div className="flex items-center rounded-2xl border border-slate-700 bg-slate-800/60 px-4 transition focus-within:border-cyan-500 focus-within:ring-2 focus-within:ring-cyan-500/20">
                <Search size={20} className="text-slate-400" />
                <input
                  type="text"
                  placeholder="Search English, Yoruba, French..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full bg-transparent px-4 py-4 text-white placeholder:text-slate-500 outline-none"
                />
              </div>
            </div>

            <div>
              <label className="mb-3 block text-sm font-semibold text-slate-300">
                Region
              </label>
              <select
                value={continent}
                onChange={(e) => setContinent(e.target.value)}
                className="w-full rounded-2xl border border-slate-700 bg-slate-800/60 px-4 py-4 text-white outline-none transition focus:border-cyan-500"
              >
                {continents.map((item) => (
                  <option key={item} value={item} className="bg-slate-900">
                    {item}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-3 block text-sm font-semibold text-slate-300">
                Difficulty
              </label>
              <select
                value={level}
                onChange={(e) => setLevel(e.target.value)}
                className="w-full rounded-2xl border border-slate-700 bg-slate-800/60 px-4 py-4 text-white outline-none transition focus:border-cyan-500"
              >
                {levels.map((item) => (
                  <option key={item} value={item} className="bg-slate-900">
                    {item}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="mt-8 flex flex-wrap items-center justify-between gap-4 border-t border-slate-800 pt-6">
            <div className="flex flex-wrap items-center gap-3">
              <button
                onClick={() => setFeaturedOnly(!featuredOnly)}
                className={`flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold transition-all ${
                  featuredOnly
                    ? "bg-cyan-600 text-white"
                    : "border border-slate-700 bg-slate-800 text-slate-300 hover:bg-slate-700"
                }`}
              >
                <Star size={16} className={featuredOnly ? "fill-white" : ""} />
                Featured Languages
              </button>

              {hasActiveFilters && (
                <button
                  onClick={resetFilters}
                  className="flex items-center gap-2 rounded-full border border-slate-700 bg-slate-800 px-5 py-2.5 text-sm font-semibold text-slate-300 transition hover:bg-slate-700"
                >
                  <RotateCcw size={15} />
                  Reset Filters
                </button>
              )}
            </div>

            <div className="text-sm font-medium text-slate-400">
              Showing
              <span className="mx-2 font-bold text-white">
                {filteredLanguages.length}
              </span>
              {filteredLanguages.length === 1 ? "language" : "languages"}
            </div>
          </div>
        </div>
      </div>

      {/* LANGUAGE GRID */}
      <div className="mx-auto mt-14 mb-24 max-w-7xl px-6">
        {filteredLanguages.length > 0 ? (
          <div className="grid gap-8 md:grid-cols-2 xl:grid-cols-3">
            <AnimatePresence>
              {filteredLanguages.map((language, index) => (
                <motion.div
                  key={language.id}
                  initial={{ opacity: 0, y: 30, scale: 0.96 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.35, delay: index * 0.05 }}
                  whileHover={{ y: -8 }}
                  className="group overflow-hidden rounded-[28px] border border-slate-800 bg-slate-900/90 backdrop-blur-xl shadow-xl transition-all hover:border-cyan-500/30 hover:shadow-cyan-500/10"
                >
                  {/* IMAGE */}
                  <div className="relative h-56 overflow-hidden">
                    <img
                      src={language.image || language.coverUrl || language.cover_url}
                      alt={language.name}
                      className="h-full w-full object-cover transition-all duration-700 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-900/20 to-transparent" />

                    {language.featured && (
                      <div className="absolute right-4 top-4 rounded-full bg-gradient-to-r from-yellow-400 to-amber-500 px-4 py-1.5 text-xs font-bold text-slate-900 shadow-lg">
                        Featured
                      </div>
                    )}
                  </div>

                  {/* CONTENT */}
                  <div className="p-7">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <h3 className="text-2xl font-black text-white transition group-hover:text-cyan-400">
                          {language.name}
                        </h3>
                        <p className="mt-1 text-blue-400 font-medium">
                          {language.nativeName}
                        </p>
                      </div>

                      <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-cyan-500/20 bg-cyan-500/10">
                        <Languages size={22} className="text-cyan-400" />
                      </div>
                    </div>

                    <p className="mt-5 line-clamp-3 leading-7 text-slate-400">
                      {language.description}
                    </p>

                    <div className="mt-6 flex flex-wrap gap-3">
                      <span className="rounded-full border border-slate-700 bg-slate-800 px-4 py-2 text-sm text-slate-300">
                        {language.continent}
                      </span>
                      <span className="rounded-full border border-cyan-500/20 bg-cyan-500/10 px-4 py-2 text-sm text-cyan-300">
                        {language.level}
                      </span>
                    </div>

                    {/* ACTION */}
                    <div className="mt-8">
                      <button
                        onClick={() => navigate(`/languages/${language.id}`)}
                        className="group/button flex w-full items-center justify-center gap-3 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 py-4 font-bold text-white shadow-lg shadow-cyan-500/20 transition-all duration-300 hover:scale-[1.02] hover:shadow-cyan-500/40 active:scale-[0.98]"
                      >
                        Start Learning
                        <ArrowRight
                          size={18}
                          className="transition-transform duration-300 group-hover/button:translate-x-1"
                        />
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center justify-center rounded-[32px] border border-slate-800 bg-slate-900/70 py-24 px-8 text-center"
          >
            <div className="flex h-20 w-20 items-center justify-center rounded-3xl border border-slate-700 bg-slate-800">
              <AlertCircle size={36} className="text-slate-400" />
            </div>

            <h2 className="mt-8 text-3xl font-black">No Languages Found</h2>
            <p className="mt-3 max-w-md text-slate-400 leading-7">
              We couldn't find any language matching your search or selected filters. Try
              another keyword or reset the filters.
            </p>

            <button
              onClick={resetFilters}
              className="mt-8 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 px-7 py-3.5 font-bold text-white transition hover:scale-105"
            >
              Reset All Filters
            </button>
          </motion.div>
        )}
      </div>
    </section>
  );
};

export default LanguageExplore;