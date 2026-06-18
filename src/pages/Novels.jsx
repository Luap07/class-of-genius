import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";
import novelImg from "../assets/novel.jpg";
import Cog from "../assets/cog.png";

const Novels = () => {
  const navigate = useNavigate();

  const [novels, setNovels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedGenre, setSelectedGenre] = useState("ALL");

  /* ================= FETCH ================= */
  useEffect(() => {
    const fetchNovels = async () => {
      setLoading(true);

      const { data } = await supabase
        .from("novels")
        .select("*")
        .order("created_at", { ascending: false });

      setNovels(data || []);
      setLoading(false);
    };

    fetchNovels();
  }, []);

  /* ================= GENRES ================= */
  const genres = [
    "ALL",
    "SCI_FIC",
    "ROMANCE",
    "FANTASY",
    "THRILLER",
    "MYSTERY",
    "ADVENTURE",
    "HISTORICAL",
    "CHRISTIAN",
    "COMEDY",
    "EDUCATIONAL",
    "AFRICAN",
  ];

  const normalize = (g) =>
    g ? g.toUpperCase().replace(/\s+/g, "_") : "";

  /* ================= TRENDING ================= */
  const trendingNovels = useMemo(() => {
    const usedGenres = new Set();

    return novels
      .filter((novel) => {
        const genre = normalize(novel.genre);

        if (usedGenres.has(genre)) return false;

        usedGenres.add(genre);
        return true;
      })
      .slice(0, 6);
  }, [novels]);

  /* ================= HOT PICKS ================= */
  const hotPicks = useMemo(() => {
    const usedGenres = new Set();

    return [...novels]
      .filter((novel) => {
        const genre = normalize(novel.genre);

        if (usedGenres.has(genre)) return false;

        usedGenres.add(genre);
        return true;
      })
      .slice(0, 6);
  }, [novels]);

  /* ================= GENRE FILTER ================= */
  const displayNovels = useMemo(() => {
    if (selectedGenre === "ALL") {
      return trendingNovels;
    }

    return novels.filter(
      (novel) => normalize(novel.genre) === selectedGenre
    );
  }, [novels, selectedGenre, trendingNovels]);

  return (
    <div className="min-h-screen bg-[#05070f] text-white">
      {/* ================= HEADER ================= */}
      <header className="sticky top-0 z-50 bg-black/60 backdrop-blur-md border-b border-white/10 px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <img src={Cog} alt="logo" className="w-12 h-12 object-contain" />

          <div>
            <h2 className="font-bold text-lg">Scholiqen</h2>
            <p className="text-xs text-gray-300">Novel Section</p>
          </div>
        </div>
      </header>

      {/* ================= HERO ================= */}
      <section className="px-6 pt-8">
        <div className="relative rounded-3xl overflow-hidden border border-white/10 h-[420px]">
          <img
            src={novelImg}
            className="absolute w-full h-full object-cover"
            alt="hero"
          />

          <div className="absolute inset-0 bg-gradient-to-r from-black via-black/70 to-transparent" />

          <div className="relative z-10 p-10 h-full flex flex-col justify-end max-w-2xl">
            <h1 className="text-5xl font-black">
              Discover Amazing Stories
            </h1>

            <p className="text-gray-300 mt-4">
              Sci-Fi • Romance • Fantasy • African Literature • More
            </p>
          </div>
        </div>
      </section>

      {/* ================= GENRES ================= */}
      <section className="px-6 mt-8">
        <div className="flex gap-3 overflow-x-auto pb-2">
          {genres.map((g) => (
            <button
              key={g}
              onClick={() => setSelectedGenre(g)}
              className={`px-5 py-2 rounded-full whitespace-nowrap transition ${
                selectedGenre === g
                  ? "bg-blue-600"
                  : "bg-white/5 hover:bg-white/10"
              }`}
            >
              {g.replace(/_/g, " ")}
            </button>
          ))}
        </div>
      </section>

      {/* ================= HOT PICKS ================= */}
      {selectedGenre === "ALL" && (
        <section className="px-6 mt-10">
          <h2 className="text-2xl font-bold mb-4">🔥 Hot Picks</h2>

          <div className="flex gap-5 overflow-x-auto pb-4">
            {hotPicks.map((n) => (
              <div
                key={n.id}
                onClick={() => navigate(`/story/${n.id}`)}
                className="w-[180px] cursor-pointer"
              >
                <img
                  src={n.cover_url || novelImg}
                  className="h-[280px] w-full object-cover rounded-2xl"
                  alt={n.title}
                />

                <h3 className="mt-3 font-bold">{n.title}</h3>

                <p className="text-gray-400 text-sm">{n.genre}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ================= TRENDING / GENRE ================= */}
      <section className="px-6 mt-12 pb-16">
        <h2 className="text-2xl font-bold mb-6">
          {selectedGenre === "ALL"
            ? "📚 Trending"
            : `📚 ${selectedGenre.replace(/_/g, " ")}`}
        </h2>

        {loading ? (
          <p className="text-gray-400">Loading...</p>
        ) : displayNovels.length === 0 ? (
          <p className="text-gray-500">No novels found.</p>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
            {displayNovels.map((n) => (
              <div
                key={n.id}
                onClick={() => navigate(`/story/${n.id}`)}
                className="bg-white/5 border border-white/10 rounded-xl overflow-hidden cursor-pointer hover:scale-105 transition"
              >
                <img
                  src={n.cover_url || novelImg}
                  className="h-[280px] w-full object-cover"
                  alt={n.title}
                />

                <div className="p-3">
                  <h3 className="font-semibold line-clamp-1">
                    {n.title}
                  </h3>
                  <p className="text-xs text-gray-400">
                    {n.genre}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

export default Novels;