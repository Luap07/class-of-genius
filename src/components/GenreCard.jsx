import React from "react";
import { motion } from "framer-motion";

const GenreCard = ({ genre, onClick }) => {
  if (!genre) return null;

  return (
    <motion.div
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.97 }}
      onClick={onClick}
      className="
        group relative cursor-pointer
        rounded-2xl p-6
        bg-gradient-to-br from-[#0d1322] to-[#0a0f1c]
        border border-white/10
        hover:border-blue-500/60
        transition-all duration-300
        overflow-hidden
      "
    >
      {/* GLOW EFFECT */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition duration-500">
        <div className="absolute -top-10 -left-10 w-40 h-40 bg-blue-600/20 blur-3xl rounded-full" />
        <div className="absolute bottom-0 right-0 w-40 h-40 bg-purple-600/20 blur-3xl rounded-full" />
      </div>

      {/* CONTENT */}
      <div className="relative z-10">

        {/* TITLE */}
        <h3 className="text-xl font-bold text-white group-hover:text-blue-300 transition">
          {genre.title}
        </h3>

        {/* DESCRIPTION */}
        <p className="text-gray-400 text-sm mt-2 leading-6 line-clamp-3">
          {genre.description || "Explore amazing stories in this category."}
        </p>

        {/* META INFO */}
        {genre.count && (
          <p className="text-xs text-blue-400 mt-3 font-medium">
            {genre.count} novels available
          </p>
        )}

        {/* BUTTON */}
        <button
          className="
            mt-5 px-4 py-2 rounded-xl
            bg-blue-600/90 hover:bg-blue-500
            text-white text-sm font-medium
            transition-all duration-300
            focus:outline-none focus:ring-2 focus:ring-blue-400
          "
        >
          Explore →
        </button>

      </div>
    </motion.div>
  );
};

export default GenreCard;