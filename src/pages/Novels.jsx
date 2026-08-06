import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";
import novelImg from "../assets/novel.jpg";
import Cog from "../assets/cog.png";

// ================= CONSTANTS & HELPERS =================
const GENRES = [
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

const normalize = (g) => (g ? g.toUpperCase().replace(/\s+/g, "_") : "");

// ================= SUB-COMPONENTS (Performance Optimized) =================
const ScrollCard = ({ n, navigate }) => {
  const [imgSrc, setImgSrc] = useState(n.cover_url || novelImg);

  return (
    <div
      onClick={() => navigate(`/story/${n.id}`)}
      className="min-w-[180px] w-[180px] cursor-pointer group shrink-0"
    >
      <div className="relative overflow-hidden rounded-2xl bg-white/5 border border-white/10 aspect-[3/4]">
        <img
          src={imgSrc}
          onError={() => setImgSrc(novelImg)}
          className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
          alt={n.title}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-3">
          <span className="text-xs font-medium text-blue-400 bg-blue-950/80 px-2 py-1 rounded-md border border-blue-500/30">
            {n.genre?.replace(/_/g, " ")}
          </span>
        </div>
      </div>
      <h3 className="mt-2 font-semibold text-sm truncate text-white group-hover:text-blue-400 transition-colors">
        {n.title}
      </h3>
      <p className="text-gray-400 text-xs">{n.author || "Unknown Author"}</p>
    </div>
  );
};

const GridCard = ({ n, navigate }) => {
  const [imgSrc, setImgSrc] = useState(n.cover_url || novelImg);

  return (
    <div
      onClick={() => navigate(`/story/${n.id}`)}
      className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden cursor-pointer group hover:border-white/20 transition-all duration-300 hover:shadow-xl hover:shadow-blue-500/5 flex flex-col"
    >
      <div className="relative aspect-[3/4] overflow-hidden bg-white/5">
        <img
          src={imgSrc}
          onError={() => setImgSrc(novelImg)}
          className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
          alt={n.title}
        />
      </div>
      <div className="p-4 flex flex-col flex-grow justify-between">
        <div>
          <span className="text-[10px] uppercase tracking-wider font-semibold text-blue-400">
            {n.genre?.replace(/_/g, " ")}
          </span>
          <h3 className="font-bold text-sm line-clamp-1 mt-1 text-white group-hover:text-blue-300 transition-colors">
            {n.title}
          </h3>
        </div>
        <p className="text-xs text-gray-400 mt-2">By {n.author || "Unknown"}</p>
      </div>
    </div>
  );
};

const SkeletonCard = () => (
  <div className="animate-pulse bg-white/5 border border-white/10 rounded-2xl overflow-hidden flex flex-col aspect-[3/4]">
    <div className="bg-white/10 w-full flex-grow" />
    <div className="p-4 space-y-2">
      <div className="h-3 bg-white/10 rounded w-1/3" />
      <div className="h-4 bg-white/10 rounded w-4/5" />
    </div>
  </div>
);

// ================= MAIN COMPONENT =================
const Novels = () => {
  const navigate = useNavigate();
  const [novels, setNovels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedGenre, setSelectedGenre] = useState("ALL");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const fetchNovels = async () => {
      setLoading(true);
      const { data, error } = await supabase.from("novels").select("*");

      if (error) {
        console.error("Error fetching novels:", error.message);
      } else {
        setNovels(data || []);
      }
      setLoading(false);
    };

    fetchNovels();
  }, []);

  // 2-Week Rotation algorithm for Hot Picks & Trending
  const { trendingNovels, hotPicks } = useMemo(() => {
    if (novels.length === 0) return { trendingNovels: [], hotPicks: [] };

    const twoWeeksInMs = 14 * 24 * 60 * 60 * 1000;
    const periodIndex = Math.floor(Date.now() / twoWeeksInMs);

    const seededShuffle = (array, seed) => {
      const arr = [...array];
      let m = arr.length, i;
      const random = (s) => {
        let x = Math.sin(s++) * 10000;
        return x - Math.floor(x);
      };
      while (m) {
        i = Math.floor(random(seed + m) * m--);
        [arr[m], arr[i]] = [arr[i], arr[m]];
      }
      return arr;
    };

    const grouped = {};
    novels.forEach((n) => {
      const g = normalize(n.genre);
      if (!grouped[g]) grouped[g] = [];
      grouped[g].push(n);
    });

    const t = [];
    const h = [];
    Object.keys(grouped).forEach((g) => {
      const shuffled = seededShuffle(grouped[g], periodIndex);
      if (shuffled[0]) t.push(shuffled[0]);
      if (shuffled[1]) h.push(shuffled[1]);
    });
    return { trendingNovels: t, hotPicks: h };
  }, [novels]);

  // Filtered novels based on Genre and Search Query
  const filteredNovels = useMemo(() => {
    return novels.filter((n) => {
      const matchesGenre =
        selectedGenre === "ALL" || normalize(n.genre) === selectedGenre;
      const matchesSearch =
        n.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        n.author?.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesGenre && matchesSearch;
    });
  }, [novels, selectedGenre, searchQuery]);

  return (
    <div className="min-h-screen bg-[#05070f] text-white selection:bg-blue-600 selection:text-white">
      {/* HEADER */}
      <header className="sticky top-0 z-50 bg-[#05070f]/80 backdrop-blur-xl border-b border-white/10 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate("/")}>
          <img src={Cog} alt="logo" className="w-10 h-10 object-contain" />
          <div>
            <h2 className="font-bold text-base tracking-tight">Scholiqen</h2>
            <p className="text-[11px] text-gray-400">Novel Library</p>
          </div>
        </div>

        {/* Search Bar */}
        <div className="relative max-w-xs w-full hidden sm:block">
          <input
            type="text"
            placeholder="Search stories or authors..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-full px-4 py-1.5 text-xs text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 transition-colors"
          />
        </div>
      </header>

      {/* HERO SECTION */}
      <section className="px-6 pt-8">
        <div className="relative rounded-3xl overflow-hidden border border-white/10 h-[380px] group shadow-2xl">
          <img
            src={novelImg}
            className="absolute w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
            alt="hero"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black via-black/70 to-transparent" />
          <div className="relative z-10 p-8 md:p-12 h-full flex flex-col justify-end max-w-2xl">
            <span className="text-xs uppercase tracking-widest text-blue-400 font-semibold mb-2">
              Explore & Escape
            </span>
            <h1 className="text-3xl md:text-5xl font-black tracking-tight">
              Discover Amazing Stories
            </h1>
            <p className="text-gray-300 text-sm mt-2 max-w-md">
              Immerse yourself in handpicked collections, trending series, and captivating fiction across multiple genres.
            </p>
          </div>
        </div>
      </section>

      {/* GENRES FILTER BAR */}
      <section className="px-6 mt-8">
        <div className="flex gap-2.5 overflow-x-auto pb-2 scrollbar-none">
          {GENRES.map((g) => (
            <button
              key={g}
              onClick={() => setSelectedGenre(g)}
              className={`px-4 py-2 rounded-full text-xs font-medium whitespace-nowrap transition-all duration-200 ${
                selectedGenre === g
                  .replace(/_/g, " ")
                  .toUpperCase() || selectedGenre === g
                  ? "bg-blue-600 text-white shadow-lg shadow-blue-600/30"
                  : "bg-white/5 text-gray-300 hover:bg-white/10 border border-white/5"
              }`}
            >
              {g.replace(/_/g, " ")}
            </button>
          ))}
        </div>
      </section>

      {/* CONTENT AREA */}
      <section className="px-6 mt-8 pb-20">
        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
            {[...Array(6)].map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        ) : selectedGenre === "ALL" && !searchQuery ? (
          <div className="space-y-12">
            {/* Hot Picks */}
            {hotPicks.length > 0 && (
              <div>
                <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                  <span>🔥 Hot Picks</span>
                </h2>
                <div className="flex gap-5 overflow-x-auto pb-4 scrollbar-none">
                  {hotPicks.map((n) => (
                    <ScrollCard key={`hot-${n.id}`} n={n} navigate={navigate} />
                  ))}
                </div>
              </div>
            )}

            {/* Trending */}
            {trendingNovels.length > 0 && (
              <div>
                <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                  <span>📚 Trending Now</span>
                </h2>
                <div className="flex gap-5 overflow-x-auto pb-4 scrollbar-none">
                  {trendingNovels.map((n) => (
                    <ScrollCard key={`trend-${n.id}`} n={n} navigate={navigate} />
                  ))}
                </div>
              </div>
            )}

            {/* All Library Grid */}
            <div>
              <h2 className="text-xl font-bold mb-4">📖 Complete Catalog</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
                {novels.map((n) => (
                  <GridCard key={`all-${n.id}`} n={n} navigate={navigate} />
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold">
                {selectedGenre === "ALL" ? "Search Results" : `📚 ${selectedGenre.replace(/_/g, " ")}`}
              </h2>
              <span className="text-xs text-gray-400">{filteredNovels.length} books found</span>
            </div>

            {filteredNovels.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
                {filteredNovels.map((n) => (
                  <GridCard key={n.id} n={n} navigate={navigate} />
                ))}
              </div>
            ) : (
              <div className="text-center py-20 bg-white/5 rounded-3xl border border-white/5">
                <p className="text-gray-400 text-sm">No novels found matching your criteria.</p>
                <button
                  onClick={() => {
                    setSelectedGenre("ALL");
                    setSearchQuery("");
                  }}
                  className="mt-3 text-xs text-blue-400 hover:underline font-medium"
                >
                  Reset filters
                </button>
              </div>
            )}
          </div>
        )}
      </section>
    </div>
  );
};

export default Novels;