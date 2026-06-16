import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";
import novelImg from "../assets/novel.jpg";

const Novels = () => {
  const navigate = useNavigate();

  const [novels, setNovels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedGenre, setSelectedGenre] = useState("ALL");

  /* ================= FETCH ================= */
  useEffect(() => {
    const fetchNovels = async () => {
      setLoading(true);

      const { data, error } = await supabase
        .from("novels")
        .select("*")
        .order("created_at", { ascending: false });

      if (!error) setNovels(data || []);

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

  /* ================= FILTER BY GENRE ================= */
  const filteredNovels = useMemo(() => {
    if (selectedGenre === "ALL") return novels;
    return novels.filter((n) => n.genre === selectedGenre);
  }, [novels, selectedGenre]);

  /* ================= TRENDING (LATEST SCI-FI UPLOADED) ================= */
  const trendingSciFi = useMemo(() => {
    return novels
      .filter((n) => n.genre === "SCI_FIC")
      .slice(0, 5); // latest 5 uploads automatically
  }, [novels]);

  /* ================= FEATURED (LATEST SCI-FI) ================= */
  const featured = useMemo(() => {
    return (
      novels.find((n) => n.genre === "SCI_FIC") || novels[0]
    );
  }, [novels]);

  return (
    <div className="min-h-screen bg-[#05070f] text-white">

      {/* ================= HERO (STATIC IMAGE BUT CLEAN) ================= */}
      <section className="px-6 pt-8">
        <div className="relative rounded-3xl overflow-hidden border border-white/10 h-[450px]">
          
          <img
            src={novelImg}
            className="absolute w-full h-full object-cover"
          />

          <div className="absolute inset-0 bg-gradient-to-r from-black via-black/70 to-transparent" />

          <div className="relative z-10 p-10 h-full flex flex-col justify-end max-w-2xl">
            <h1 className="text-5xl font-black">
              Discover Amazing Stories
            </h1>

            <p className="text-gray-300 mt-4">
              Sci-Fi, Romance, Comedy, Historical, African Literature
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
              {g.replace("_", " ")}
            </button>
          ))}
        </div>
      </section>

      {/* ================= TRENDING SCI-FI ================= */}
      <section className="px-6 mt-10">
        <h2 className="text-2xl font-bold mb-4">
          🔥 Trending Sci-Fi (Latest Uploads)
        </h2>

        <div className="flex gap-5 overflow-x-auto pb-4">
          {trendingSciFi.map((n) => (
            <div
              key={n.id}
              onClick={() => navigate(`/story/${n.id}`)}
              className="min-w-[220px] cursor-pointer"
            >
              <img
                src={n.cover_url}
                className="h-[320px] w-full object-cover rounded-2xl"
              />

              <h3 className="mt-3 font-bold">{n.title}</h3>
              <p className="text-gray-400 text-sm">{n.genre}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ================= SELECTED GENRE LIST ================= */}
      <section className="px-6 mt-12 pb-16">
        <h2 className="text-2xl font-bold mb-6">
          {selectedGenre === "ALL"
            ? "📚 All Novels"
            : selectedGenre.replace("_", " ")}
        </h2>

        {loading ? (
          <p className="text-gray-400">Loading...</p>
        ) : filteredNovels.length === 0 ? (
          <p className="text-gray-500">
            No novels found in this genre.
          </p>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
            {filteredNovels.map((n) => (
              <div
                key={n.id}
                onClick={() => navigate(`/story/${n.id}`)}
                className="bg-white/5 border border-white/10 rounded-xl overflow-hidden cursor-pointer hover:scale-105 transition"
              >
                <img
                  src={n.cover_url}
                  className="h-[280px] w-full object-cover"
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