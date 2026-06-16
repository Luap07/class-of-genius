import React from "react";
import { X } from "lucide-react";

const NovelsSidebar = ({
  genres,
  selectedGenre,
  setSelectedGenre,
  openSidebar,
  setOpenSidebar,
}) => {
  return (
    <div
      className={`
        fixed top-0 left-0 h-full w-72 z-50
        bg-[#0b0f1a] border-r border-white/10
        transition-transform duration-300
        md:static md:translate-x-0
        ${openSidebar ? "translate-x-0" : "-translate-x-full"}
      `}
    >
      {/* HEADER */}
      <div className="p-4 border-b border-white/10 flex justify-between items-center">
        <h2 className="font-bold text-white">Genres</h2>

        <button
          onClick={() => setOpenSidebar(false)}
          className="md:hidden text-white"
        >
          <X size={18} />
        </button>
      </div>

      {/* GENRES LIST */}
      <div className="p-3 space-y-2">
        {genres.map((g) => (
          <div
            key={g}
            onClick={() => {
              setSelectedGenre(g);
              setOpenSidebar(false);
            }}
            className={`
              p-2 rounded cursor-pointer transition
              ${
                selectedGenre === g
                  ? "bg-blue-600"
                  : "hover:bg-white/10"
              }
            `}
          >
            {g.toUpperCase()}
          </div>
        ))}
      </div>
    </div>
  );
};

export default NovelsSidebar;