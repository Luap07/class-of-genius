import React, { useEffect, useState } from "react";
import Cog from "../assets/cog.png";
import { Flame } from "lucide-react";
import { robot } from "../assets";
import { supabase } from "../lib/supabaseClient";

const AITutorHeader = () => {
  const [streak, setStreak] = useState(0);

  const calculateStreak = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    // Fetch the stored streak or calculate it from activity
    const streakKey = `studentStreak_${user.id}`;
    const savedStreak = localStorage.getItem(streakKey) || 0;
    setStreak(savedStreak);
  };

  useEffect(() => {
    calculateStreak();
    // Listen for the update event we fire in AITutorSession
    window.addEventListener("storage-update", calculateStreak);
    return () => window.removeEventListener("storage-update", calculateStreak);
  }, []);

  return (
    <div className="w-full flex items-center justify-between px-6 py-3 bg-slate-950/70 backdrop-blur-md border-b border-slate-800">
      <div className="flex items-center gap-2">
        <img src={Cog} alt="logo" className="w-10 h-10" />
        <span className="font-bold text-lg text-white">Scholiqen</span>
      </div>

      <div className="flex items-center gap-3">
        <img src={robot} className="rounded-full w-8 h-8" />
        <span className="text-lg font-semibold text-blue-100">AI Tutor</span>
      </div>

      <div className="flex items-center gap-2">
        <div className="flex items-center gap-2 bg-orange-500/10 border border-orange-500/30 px-3 py-1 rounded-full">
          <Flame size={16} className={`text-orange-400 ${streak > 0 ? 'animate-pulse' : ''}`} />
          <span className="text-xs text-orange-300 font-semibold">
            {streak} Day Streak
          </span>
        </div>
      </div>
    </div>
  );
};

export default AITutorHeader;