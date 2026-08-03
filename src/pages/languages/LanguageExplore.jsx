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
import { supabase } from "../../lib/supabaseClient";
import englishImg from "../../assets/englishImg.jpeg";
import spanishImg from "../../assets/spanishImg.jpeg";
import frenchImg from "../../assets/frenchImg.jpeg";
import germanImg from "../../assets/germanImg.jpeg";
import japaneseImg from "../../assets/japaneseImg.jpeg";
import chineseImg from "../../assets/chineseImg.jpeg";
import arabicImg from "../../assets/arabicImg.jpeg";
import yorubaImg from "../../assets/yorubaImg.jpeg";
import portugueseImg from "../../assets/portugueseImg.jpeg";
import italianImg from "../../assets/italianImg.jpeg";
import koreanImg from "../../assets/koreanImg.jpeg";
import russianImg from "../../assets/russianImg.jpeg";
import hindiImg from "../../assets/hindiImg.jpeg";
import turkishImg from "../../assets/turkishImg.jpeg";
import dutchImg from "../../assets/dutchImg.jpeg";
import swahiliImg from "../../assets/swahiliImg.jpeg";
import hausaImg from "../../assets/hausaImg.jpeg";
import igboImg from "../../assets/igboImg.jpeg";
import greekImg from "../../assets/greekImg.jpeg";
import hebrewImg from "../../assets/hebrewImg.jpeg";
import swedishImg from "../../assets/swedishImg.jpeg";
import polishImg from "../../assets/polishImg.jpeg";
import thaiImg from "../../assets/thaiImg.jpeg";
import vietnameseImg from "../../assets/vietnameseImg.jpeg";
import indonesianImg from "../../assets/indonesianImg.jpeg";
import persianImg from "../../assets/persianImg.jpeg";
import danishImg from "../../assets/danishImg.jpeg";
import finnishImg from "../../assets/finnishImg.jpeg";
import norwegianImg from "../../assets/norwegianImg.jpeg";
import czechImg from "../../assets/czechImg.jpeg";

const continents = [
  "All",
  "Africa",
  "Europe",
  "Asia",
  "North America",
  "South America",
  "Oceania",
];
const languageImages = {
  English: englishImg,
  Spanish: spanishImg,
  French: frenchImg,
  German: germanImg,
  Japanese: japaneseImg,
  Chinese: chineseImg,
  Arabic: arabicImg,
  Yoruba: yorubaImg,
  Portuguese: portugueseImg,
  Italian: italianImg,
  Korean: koreanImg,
  Russian: russianImg,
  Hindi: hindiImg,
  Turkish: turkishImg,
  Dutch: dutchImg,
  Swahili: swahiliImg,
  Hausa: hausaImg,
  Igbo: igboImg,
  Greek: greekImg,
  Hebrew: hebrewImg,
  Swedish: swedishImg,
  Polish: polishImg,
  Thai: thaiImg,
  Vietnamese: vietnameseImg,
  Indonesian: indonesianImg,
  Persian: persianImg,
  Danish: danishImg,
  Finnish: finnishImg,
  Norwegian: norwegianImg,
  Czech: czechImg,
};

const levels = ["All", "Beginner", "Intermediate", "Advanced"];

export default function LanguageExplore() {
  const navigate = useNavigate();

  const [languages, setLanguages] = useState([]);
  const [loadingLanguages, setLoadingLanguages] = useState(true);

  const [search, setSearch] = useState("");
  const [continent, setContinent] = useState("All");
  const [level, setLevel] = useState("All");
  const [featuredOnly, setFeaturedOnly] = useState(false);

  /*
  ======================================
      FETCH LANGUAGES FROM SUPABASE
  ======================================
  */
  useEffect(() => {
    const fetchLanguages = async () => {
      try {
        setLoadingLanguages(true);

        const { data, error } = await supabase
          .from("languages")
          .select("*")
          .order("created_at", { ascending: false });

        if (error) {
          throw error;
        }

        setLanguages(data || []);
      } catch (error) {
        console.error("Fetch Languages:", error);
      } finally {
        setLoadingLanguages(false);
      }
    };

    fetchLanguages();
  }, []);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  /*
  ======================================
              STATS
  ======================================
  */
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
      value: new Set(languages.map((language) => language.continent))
        .size.toString(),
      icon: Users,
    },
    {
      title: "Learning Levels",
      value: new Set(languages.map((language) => language.level))
        .size.toString(),
      icon: GraduationCap,
    },
  ];

  /*
  ======================================
        FILTER LANGUAGES
  ======================================
  */
  const filteredLanguages = useMemo(() => {
    return languages.filter((language) => {
      const name = language.name || "";
      const nativeName = language.native_name || "";

      const matchesSearch =
        name.toLowerCase().includes(search.toLowerCase()) ||
        nativeName.toLowerCase().includes(search.toLowerCase());

      const matchesContinent =
        continent === "All" || language.continent === continent;

      const matchesLevel = level === "All" || language.level === level;

      const matchesFeatured = featuredOnly ? language.featured : true;

      return matchesSearch && matchesContinent && matchesLevel && matchesFeatured;
    });
  }, [languages, search, continent, level, featuredOnly]);

  const hasActiveFilters =
    search !== "" ||
    continent !== "All" ||
    level !== "All" ||
    featuredOnly;

  const resetFilters = () => {
    setSearch("");
    setContinent("All");
    setLevel("All");
    setFeaturedOnly(false);
  };

  /*
  ======================================
          LOADING SCREEN
  ======================================
  */
  if (loadingLanguages) {
    return (
      <section className="flex min-h-screen items-center justify-center bg-[#020617] text-white">
        <div className="text-center">
          <div className="mx-auto h-14 w-14 animate-spin rounded-full border-4 border-cyan-500 border-t-transparent" />
          <p className="mt-6 text-lg text-slate-400">Loading languages...</p>
        </div>
      </section>
    );
  }

  return (
    <section
      id="language-explore"
      className="relative text-white selection:bg-blue-500 selection:text-white"
    >
      {/* HERO */}
      <div className="relative overflow-hidden border-b border-slate-800/80 bg-gradient-to-b from-slate-900/60 via-slate-950 to-[#020617]">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(59,130,246,.18),transparent_45%),radial-gradient(circle_at_bottom_left,rgba(6,182,212,.12),transparent_45%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.03)_1px,transparent_1px)] bg-[size:45px_45px] opacity-20" />

        <div className="relative mx-auto max-w-7xl px-6 py-24 lg:py-28">
          <motion.div
            initial={{ opacity: 0, y: 25 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="inline-flex items-center gap-2 rounded-full border border-cyan-500/35 bg-cyan-500/10 px-4 py-2 text-sm font-semibold text-cyan-300 backdrop-blur-xl">
              <Sparkles size={16} className="text-cyan-400 animate-pulse" />
              Learn Without Borders
            </div>

            <h1 className="mt-6 max-w-5xl text-5xl font-black tracking-tight sm:text-6xl lg:text-7xl">
              Explore The World's{" "}
              <span className="block bg-gradient-to-r from-cyan-400 via-blue-400 to-indigo-500 bg-clip-text pb-2 text-transparent">
                Languages
              </span>
            </h1>

            <p className="mt-6 max-w-3xl text-lg leading-8 text-slate-400">
              Discover languages from around the world, improve your communication
              skills, practice pronunciation, build vocabulary, and master new
              cultures through immersive learning experiences.
            </p>
          </motion.div>
        </div>
      </div>

      {/* STATS */}
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
              className="rounded-3xl border border-slate-800 bg-slate-900/90 p-8 shadow-2xl backdrop-blur-xl"
            >
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-cyan-500/20 bg-cyan-500/10">
                <Icon size={26} className="text-cyan-400" />
              </div>

              <h2 className="mt-6 text-4xl font-black">{item.value}</h2>
              <p className="mt-2 text-slate-400">{item.title}</p>
            </motion.div>
          );
        })}
      </div>

      {/* SEARCH & FILTER */}
      <div className="mx-auto mt-16 max-w-7xl px-6">
        <div className="rounded-3xl border border-slate-800 bg-slate-900/90 p-6 shadow-2xl backdrop-blur-xl md:p-8">
          <div className="grid gap-6 lg:grid-cols-4">
            {/* SEARCH */}
            <div className="lg:col-span-2">
              <label className="mb-3 block text-sm font-semibold text-slate-300">
                Search Languages
              </label>
              <div className="flex items-center rounded-2xl border border-slate-700 bg-slate-800/60 px-4 focus-within:border-cyan-500">
                <Search size={20} className="text-slate-400" />
                <input
                  type="text"
                  placeholder="Search English, Yoruba, French..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full bg-transparent px-4 py-4 text-white outline-none"
                />
              </div>
            </div>

            {/* CONTINENT */}
            <div>
              <label className="mb-3 block text-sm font-semibold text-slate-300">
                Region
              </label>
              <select
                value={continent}
                onChange={(e) => setContinent(e.target.value)}
                className="w-full rounded-2xl border border-slate-700 bg-slate-800/60 px-4 py-4 text-white outline-none"
              >
                {continents.map((item) => (
                  <option key={item} value={item} className="bg-slate-900">
                    {item}
                  </option>
                ))}
              </select>
            </div>

            {/* LEVEL */}
            <div>
              <label className="mb-3 block text-sm font-semibold text-slate-300">
                Difficulty
              </label>
              <select
                value={level}
                onChange={(e) => setLevel(e.target.value)}
                className="w-full rounded-2xl border border-slate-700 bg-slate-800/60 px-4 py-4 text-white outline-none"
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
                    : "border border-slate-700 bg-slate-800 text-slate-300"
                }`}
              >
                <Star
                  size={16}
                  className={featuredOnly ? "fill-white" : ""}
                />
                Featured Languages
              </button>

              {hasActiveFilters && (
                <button
                  onClick={resetFilters}
                  className="flex items-center gap-2 rounded-full border border-slate-700 bg-slate-800 px-5 py-2.5 text-sm font-semibold text-slate-300"
                >
                  <RotateCcw size={15} />
                  Reset Filters
                </button>
              )}
            </div>

            <div className="text-sm font-medium text-slate-400">
              Showing{" "}
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
                  className="group overflow-hidden rounded-[28px] border border-slate-800 bg-slate-900/90 shadow-xl backdrop-blur-xl"
                >
                  {/* IMAGE */}
                  <div className="relative h-56 overflow-hidden">
                   <img
  src={
    language.cover_image ||
    language.hero_image ||
    language.image_url ||
    languageImages[language.name]
  }
  alt={language.name}
/>
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-900/20 to-transparent" />

                    {language.featured && (
                      <div className="absolute right-4 top-4 rounded-full bg-yellow-400 px-4 py-1.5 text-xs font-bold text-slate-900">
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
                        <p className="mt-1 font-medium text-blue-400">
                          {language.native_name}
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
                        className="flex w-full items-center justify-center gap-3 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 py-4 font-bold text-white transition hover:scale-[1.02]"
                      >
                        Start Learning
                        <ArrowRight size={18} />
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
            <AlertCircle size={40} className="text-slate-400" />
            <h2 className="mt-8 text-3xl font-black">No Languages Found</h2>
            <p className="mt-3 text-slate-400">
              No language matches your search.
            </p>
            <button
              onClick={resetFilters}
              className="mt-8 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 px-7 py-3.5 font-bold text-white"
            >
              Reset Filters
            </button>
          </motion.div>
        )}
      </div>
    </section>
  );
}