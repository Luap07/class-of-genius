import React, { useState } from "react";
import { motion } from "framer-motion";

const GenreCard = ({ genre }) => {
  if (!genre) return null;

  const [loading, setLoading] = useState(false);

  /* ================= GENERATE NOVEL ================= */
  const handleGenerate = async () => {
    try {
      setLoading(true);

      const res = await fetch("http://localhost:5000/api/generate-novel", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ genre: genre.title }),
      });

      const data = await res.json();

      console.log("📚 Generated Novel:", data.story);

      // later you can pass to modal or state
      alert("Novel generated! Check console.");
    } catch (err) {
      console.error("Error generating novel:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      whileHover={{ scale: 1.04 }}
      whileTap={{ scale: 0.98 }}
      onClick={handleGenerate}
      className="
        group relative cursor-pointer
        rounded-2xl p-6
        overflow-hidden
        border border-white/10
        bg-gradient-to-br from-[#0d1322] via-[#0b1220] to-[#070b14]
        shadow-md
        transition-all duration-300
        transform-gpu
        will-change-transform
        hover:border-blue-500/50
      "
    >

      {/* ================= GLOW ================= */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
        <div className="absolute -top-12 -left-12 w-48 h-48 bg-blue-500/20 blur-3xl rounded-full" />
        <div className="absolute -bottom-12 -right-12 w-48 h-48 bg-purple-500/20 blur-3xl rounded-full" />
      </div>

      <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-transparent opacity-0 group-hover:opacity-100 transition duration-700" />

      {/* ================= CONTENT ================= */}
      <div className="relative z-10">

        {/* TITLE */}
        <h3 className="
          text-xl font-bold text-white
          group-hover:text-blue-300
          transition-colors duration-300
        ">
          {genre.title}
        </h3>

        {/* DESCRIPTION */}
        <p className="text-gray-400 text-sm mt-2 leading-6 line-clamp-3">
          {genre.description || "Explore amazing stories in this category."}
        </p>

        {/* META */}
        {genre.count && (
          <p className="text-xs text-blue-400 mt-3 font-medium">
            {genre.count} novels available
          </p>
        )}

        {/* BUTTON */}
        <button
          onClick={(e) => {
            e.stopPropagation(); // important fix
            handleGenerate();
          }}
          disabled={loading}
          className="
            mt-5 px-4 py-2
            rounded-xl
            bg-gradient-to-r from-blue-600 to-indigo-600
            hover:from-blue-500 hover:to-indigo-500
            text-white text-sm font-medium
            transition-all duration-300
            shadow-md hover:shadow-blue-500/20
            active:scale-95
            disabled:opacity-60
          "
        >
          {loading ? "Generating..." : "Explore →"}
        </button>

      </div>
    </motion.div>
  );
};

export default GenreCard;