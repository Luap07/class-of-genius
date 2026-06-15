import React, { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { NOVEL_GENRES } from "../data/genres";

/* ================= BACKGROUND IMAGES ================= */
import {
  mystery,
  adventures,
  africa_literature,
  fantasy,
  history,
  romance,
  thriller,
  sci_fic,
  comedy,
  christian,
  educational,
} from "../assets";

/* ================= IMAGE MAP ================= */
const genreImages = {
  romance,
  mystery,
  thriller,
  fantasy,
  sci_fic,
  adventure: adventures,
  historical: history,
  christian,
  comedy,
  educational,
  african: africa_literature,
};

const Novels = () => {
  const [search, setSearch] = useState("");

  /* ================= FILTER ================= */
  const filteredGenres = useMemo(() => {
    if (!search.trim()) return NOVEL_GENRES || [];

    return (NOVEL_GENRES || []).filter((genre) =>
      genre.title.toLowerCase().includes(search.toLowerCase())
    );
  }, [search]);

  return (
    <div className="relative min-h-screen text-white overflow-hidden">

      {/* ================= CINEMATIC BACKGROUND ================= */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#05070f] via-[#070b14] to-black" />

      <div className="absolute -top-40 -left-40 w-[500px] h-[500px] bg-blue-600/20 blur-[120px] rounded-full animate-pulse" />
      <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-purple-600/20 blur-[120px] rounded-full animate-pulse" />

      {/* ================= CONTENT ================= */}
      <div className="relative z-10 px-6 sm:px-10 py-10">

        {/* HEADER */}
        <div className="mb-10">
          <h1 className="text-5xl font-extrabold">
            📚 Novels Library
          </h1>

          <p className="text-gray-400 mt-3 max-w-2xl">
            Explore cinematic stories across Romance, Mystery, Fantasy,
            Science Fiction, Christian, Educational and African Literature.
          </p>

          <input
            type="text"
            placeholder="Search genres..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="
              mt-6
              w-full
              sm:w-[420px]
              px-4
              py-3
              rounded-xl
              bg-white/5
              border border-white/10
              backdrop-blur-xl
              outline-none
              focus:border-blue-500
            "
          />
        </div>

        {/* ================= TRENDING ================= */}
        <h2 className="text-2xl font-bold mb-5">
          🔥 Trending Genres
        </h2>

        {/* 🔥 SMOOTH NETFLIX SCROLL ROW */}
        <div
          className="
            flex
            gap-5
            overflow-x-auto
            overflow-y-hidden
            pb-6
            scroll-smooth
            snap-x
            snap-mandatory
            scrollbar-hide
          "
        >
          {filteredGenres.map((genre) => {
            const img = genreImages[genre.id];

            return (
              <motion.div
                key={genre.id}
                whileHover={{ scale: 1.06, y: -5 }}
                transition={{ duration: 0.25 }}
                className="
                  snap-start
                  shrink-0
                  relative
                  min-w-[260px]
                  h-[340px]
                  rounded-2xl
                  overflow-hidden
                  border border-white/10
                  cursor-pointer
                  group
                  shadow-xl
                "
              >
                {/* IMAGE */}
                {img ? (
                  <img
                    src={img}
                    alt={genre.title}
                    className="
                      absolute
                      inset-0
                      w-full
                      h-full
                      object-cover
                      transition-transform
                      duration-500
                      group-hover:scale-110
                    "
                  />
                ) : (
                  <div className="absolute inset-0 bg-[#111827]" />
                )}

                {/* OVERLAY */}
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />

                {/* TEXT */}
                <div className="absolute bottom-0 p-4">
                  <h3 className="font-bold text-lg">
                    {genre.title}
                  </h3>

                  <p className="text-xs text-gray-300">
                    {genre.description}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* ================= CLEAN GRID ================= */}
        <h2 className="text-2xl font-bold mt-10 mb-5">
          ⭐ Explore More Genres
        </h2>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">

          {NOVEL_GENRES.slice(0, 6).map((genre) => (
            <motion.div
              key={genre.id}
              whileHover={{ scale: 1.03 }}
              className="
                p-6
                rounded-2xl
                bg-white/5
                backdrop-blur-xl
                border border-white/10
              "
            >
              <h3 className="text-xl font-bold">
                {genre.title}
              </h3>

              <p className="text-gray-400 mt-3">
                {genre.description}
              </p>

              <button className="mt-5 px-4 py-2 bg-blue-600 rounded-lg hover:bg-blue-500 transition">
                Explore →
              </button>
            </motion.div>
          ))}

        </div>

      </div>
    </div>
  );
};

export default Novels;