// src/components/curriculum/CurriculumHeader.jsx

import React from "react";
import {
  Search,
  Bell,
  Globe2,
  ChevronDown,
} from "lucide-react"; // Removed Sparkles

const CurriculumHeader = () => {
  return (
    <header className="sticky top-0 z-40 bg-slate-950/95 backdrop-blur-xl border-b border-slate-800">
      <div className="px-8 py-5 flex items-center justify-between">
        {/* Left */}
        <div>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/30">
              <Globe2 size={26} className="text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-extrabold text-white">
                Global Curriculum
              </h1>
              <p className="text-slate-400 mt-1">
                Discover curricula from around the world.
              </p>
            </div>
          </div>
        </div>

        {/* Right */}
        <div className="flex items-center gap-4">
          {/* Search */}
          <div className="hidden lg:flex items-center bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 w-[420px]">
            <Search
              size={20}
              className="text-slate-500"
            />
            <input
              type="text"
              placeholder="Search country, curriculum, subject..."
              className="flex-1 ml-3 bg-transparent outline-none text-white placeholder:text-slate-500"
            />
          </div>

          {/* Notifications */}
         

          {/* User */}
          <button className="flex items-center gap-3 bg-slate-900 border border-slate-800 rounded-xl px-4 py-2 hover:border-cyan-500 transition">
            <img
              src="https://ui-avatars.com/api/?name=Student&background=0f172a&color=22d3ee"
              alt=""
              className="w-10 h-10 rounded-full"
            />
            <div className="text-left hidden xl:block">
              <h3 className="text-white font-semibold">
                Welcome
              </h3>
              <p className="text-slate-400 text-sm">
                Student
              </p>
            </div>
            <ChevronDown
              size={18}
              className="text-slate-500"
            />
          </button>
        </div>
      </div>
    </header>
  );
};

export default CurriculumHeader;