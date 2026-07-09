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

  useEffect(() => {
  const fetchNovels = async () => {
    setLoading(true);

    const { data, error, count } = await supabase
      .from("novels")
      .select("*", { count: "exact" });

    console.log("Supabase Count:", count);
    console.log("Returned Rows:", data?.length);
    console.log(data);

    if (error) {
      console.log(error);
    } else {
      setNovels(data || []);
    }

    setLoading(false);
  };

  fetchNovels();
}, []);

  const genres = ["ALL", "SCI_FIC", "ROMANCE", "FANTASY", "THRILLER", "MYSTERY", "ADVENTURE", "HISTORICAL", "CHRISTIAN", "COMEDY", "EDUCATIONAL", "AFRICAN"];
  const normalize = (g) => (g ? g.toUpperCase().replace(/\s+/g, "_") : "");

  /* ================= 2-WEEK ROTATION (ALL VIEW ONLY) ================= */
  const { trendingNovels, hotPicks } = useMemo(() => {
    if (novels.length === 0) return { trendingNovels: [], hotPicks: [] };

    // 14 days in milliseconds
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

  // Card for horizontal scrolling sections
  const ScrollCard = ({ n }) => (
    <div onClick={() => navigate(`/story/${n.id}`)} className="min-w-[180px] w-[180px] cursor-pointer hover:scale-105 transition-transform shrink-0">
      <img src={n.cover_url || novelImg} className="h-[250px] w-full object-cover rounded-2xl" alt={n.title} />
      <h3 className="mt-2 font-bold truncate">{n.title}</h3>
      <p className="text-gray-400 text-xs">{n.genre}</p>
    </div>
  );

  // Card for grid view
  const GridCard = ({ n }) => (
    <div onClick={() => navigate(`/story/${n.id}`)} className="bg-white/5 border border-white/10 rounded-xl overflow-hidden cursor-pointer hover:scale-105 transition">
      <img src={n.cover_url || novelImg} className="h-[280px] w-full object-cover" alt={n.title} />
      <div className="p-3">
        <h3 className="font-semibold line-clamp-1">{n.title}</h3>
        <p className="text-xs text-gray-400">{n.genre}</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#05070f] text-white">
      <header className="sticky top-0 z-50 bg-black/60 backdrop-blur-md border-b border-white/10 px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <img src={Cog} alt="logo" className="w-12 h-12 object-contain" />
          <div>
            <h2 className="font-bold text-lg">Scholiqen</h2>
            <p className="text-xs text-gray-300">Novel Section</p>
          </div>
        </div>
      </header>

      <section className="px-6 pt-8">
        <div className="relative rounded-3xl overflow-hidden border border-white/10 h-[420px]">
          <img src={novelImg} className="absolute w-full h-full object-cover" alt="hero" />
          <div className="absolute inset-0 bg-gradient-to-r from-black via-black/70 to-transparent" />
          <div className="relative z-10 p-10 h-full flex flex-col justify-end max-w-2xl">
            <h1 className="text-5xl font-black">Discover Amazing Stories</h1>
          </div>
        </div>
      </section>

      <section className="px-6 mt-8">
        <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
          {genres.map((g) => (
            <button key={g} onClick={() => setSelectedGenre(g)} className={`px-5 py-2 rounded-full whitespace-nowrap transition ${selectedGenre === g ? "bg-blue-600" : "bg-white/5 hover:bg-white/10"}`}>
              {g.replace(/_/g, " ")}
            </button>
          ))}
        </div>
      </section>

      <section className="px-6 mt-10 pb-16">
        {selectedGenre === "ALL" ? (
          <div className="space-y-10">
            <div>
              <h2 className="text-2xl font-bold mb-4">🔥 Hot Picks</h2>
              <div className="flex gap-5 overflow-x-auto pb-4 scrollbar-hide">
                {hotPicks.map((n) => <ScrollCard key={`hot-${n.id}`} n={n} />)}
              </div>
            </div>
            <div>
              <h2 className="text-2xl font-bold mb-4">📚 Trending</h2>
              <div className="flex gap-5 overflow-x-auto pb-4 scrollbar-hide">
                {trendingNovels.map((n) => <ScrollCard key={`trend-${n.id}`} n={n} />)}
              </div>
            </div>
          </div>
        ) : (
          <div>
            <h2 className="text-2xl font-bold mb-6">📚 {selectedGenre.replace(/_/g, " ")}</h2>
            {loading ? <p>Loading...</p> : (
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
                {novels.filter(n => normalize(n.genre) === selectedGenre).map(n => <GridCard key={n.id} n={n} />)}
              </div>
            )}
          </div>
        )}
      </section>
    </div>
  );
};

export default Novels;