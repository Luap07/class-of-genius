import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { STORIES } from "../data/stories";
import { Menu } from "lucide-react";

const Novels = () => {
  const navigate = useNavigate();

  const [selectedGenre, setSelectedGenre] = useState("all");
  const [openSidebar, setOpenSidebar] = useState(false);

  /* ================= GENRES ================= */
  const genres = useMemo(() => {
    return ["all", ...new Set(STORIES.map((s) => s.genre))];
  }, []);

  /* ================= FILTER ================= */
  const filteredStories = useMemo(() => {
    if (selectedGenre === "all") return STORIES;
    return STORIES.filter((s) => s.genre === selectedGenre);
  }, [selectedGenre]);

  /* ================= HOT ================= */
  const hot = useMemo(() => {
    return [...STORIES].sort(() => 0.5 - Math.random()).slice(0, 4);
  }, []);

  return (
    <div className="flex min-h-screen bg-[#05070f] text-white overflow-hidden">

      {/* ================= SIDEBAR (CHATGPT STYLE FIXED) ================= */}
      <div
        className={`
          fixed md:static
          top-0 left-0
          z-50
          h- w-64
          bg-[#0b0f1a]/95 backdrop-blur-xl
          border-r border-white/10
          transform transition-transform duration-300
          md:translate-x-0
          ${openSidebar ? "translate-x-0" : "-translate-x-full"}
        `}
      >
        {/* HEADER */}
        <div className="p-4 border-b border-white/10 font-bold text-gray-300 flex justify-between">
          GENRES

          {/* close ONLY mobile */}
          <button
            onClick={() => setOpenSidebar(false)}
            className="md:hidden text-white"
          >
            ✕
          </button>
        </div>

        {/* LIST */}
        <div className="p-3 space-y-2 overflow-y-auto h-full">

          {genres.map((g) => (
            <div
              key={g}
              onClick={() => {
                setSelectedGenre(g);
                setOpenSidebar(false);
              }}
              className={`
                px-3 py-2 rounded-lg cursor-pointer text-sm
                hover:bg-white/10 transition
                ${selectedGenre === g ? "bg-blue-600" : ""}
              `}
            >
              {g.toUpperCase()}
            </div>
          ))}
        </div>
      </div>

      {/* ================= MAIN AREA ================= */}
      <div className="flex-1">

        {/* TOP BAR */}
        <div className="flex items-center gap-3 p-4 border-b border-white/10">

          {/* hamburger ONLY mobile */}
          <button
            onClick={() => setOpenSidebar(true)}
            className="md:hidden"
          >
            <Menu size={22} />
          </button>

          <h1 className="text-xl font-bold">📚 Novels Library</h1>
        </div>

        {/* CONTENT */}
        <div className="p-6 space-y-10">

          {/* HERO */}
          <div className="rounded-2xl p-10 border border-white/10 bg-gradient-to-r from-blue-600/20 via-purple-600/20 to-pink-600/10 backdrop-blur-md">

            <h2 className="text-4xl font-extrabold bg-gradient-to-r from-blue-400 via-purple-900 to-pink-600 bg-clip-text">
              Discover Amazing Stories
            </h2>

            <p className="text-gray-300 mt-3 max-w-xl">
              Dive into sci-fi, romance, thrillers and African literature.
            </p>
          </div>

          {/* HOT */}
          <div>
            <h2 className="text-lg font-bold mb-3">🔥 Hot Picks</h2>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {hot.map((story) => (
                <div
                  key={story.id}
                  onClick={() => navigate(`/story/${story.id}`)}
                  className="bg-white/5 border border-white/10 p-4 rounded-xl cursor-pointer hover:scale-105 transition"
                >
                  <h3 className="font-bold text-sm">{story.title}</h3>
                  <p className="text-xs text-gray-400">{story.genre}</p>
                </div>
              ))}
            </div>
          </div>

          {/* RECOMMENDATIONS */}
          <div>
            <h2 className="text-lg font-bold mb-3">📌 Recommendations</h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">

              {filteredStories.map((story) => (
                <div
                  key={story.id}
                  onClick={() => navigate(`/story/${story.id}`)}
                  className="bg-white/5 border border-white/10 p-4 rounded-xl cursor-pointer hover:scale-[1.03] transition"
                >
                  <h3 className="font-bold">{story.title}</h3>
                  <p className="text-xs text-gray-400 mt-1">
                    {story.genre}
                  </p>
                </div>
              ))}

            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Novels;