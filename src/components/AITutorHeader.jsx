import React, { useState } from "react";
import Cog from "../assets/cog.png";
import { Flame, ChevronDown } from "lucide-react";
import { tutor } from "../assets";
import AISessionProfile from "./AISessionProfile";

const AITutorHeader = () => {
  const userName = "Daniel";

  const [openProfile, setOpenProfile] = useState(false);

  return (
    <div className="w-full flex items-center justify-between px-6 py-3 bg-slate-950/70 backdrop-blur-md border-b border-slate-800">

      {/* LEFT */}
      <div className="flex items-center gap-2">
        <img src={Cog} alt="logo" className="w-15 h-15" />
        <span className="font-bold text-lg text-white">Scholiqen</span>
      </div>

      {/* CENTER */}
      <div className="flex items-center gap-3">
        <img src={tutor} className="rounded-full w-8 h-8" />
        <span className="text-lg font-semibold text-blue-100">
          AI Tutor
        </span>
        <p className="text-sm text-gray-400 hidden md:block">
          Your intelligent learning companion
        </p>
      </div>

      {/* RIGHT */}
      <div className="flex items-center gap-3 relative">

        {/* STREAK */}
        <div className="flex items-center gap-2 bg-orange-500/10 border border-orange-500/30 px-3 py-1 rounded-full">
          <Flame size={16} className="text-orange-400" />
          <span className="text-xs text-orange-300 font-semibold">
            12 Day Streak
          </span>
        </div>

        {/* PROFILE BUTTON */}
        <div
          onClick={() => setOpenProfile((prev) => !prev)}
          className="flex items-center gap-2 bg-slate-800 px-3 py-1 rounded-full border border-slate-700 cursor-pointer hover:border-blue-500 transition relative"
        >
          {/* avatar */}
          <div className="w-6 h-6 rounded-full bg-blue-600 flex items-center justify-center text-xs font-bold text-white">
            {userName[0]}
          </div>

          {/* name */}
          <span className="text-xs text-white">{userName}</span>

          {/* 🔽 DROPDOWN ICON */}
          <ChevronDown
            size={14}
            className={`text-slate-300 transition-transform duration-200 ${
              openProfile ? "rotate-180" : ""
            }`}
          />
        </div>

        {/* DROPDOWN */}
        {openProfile && (
          <div className="absolute right-0 top-12 z-50">
            <AISessionProfile />
          </div>
        )}

      </div>
    </div>
  );
};

export default AITutorHeader;