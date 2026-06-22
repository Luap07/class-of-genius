import React from "react";
import { Mic, PenSquare, Square } from "lucide-react";
import { robot } from "../assets";

const AITutorDisplay = ({
  onStartSpeak,
  onStartWrite,
  onStop,
  sessionMode,
}) => {
  return (
    <div className="flex-1 bg-slate-900 rounded-xl p-6 border border-slate-800">

      {/* ROBOT */}
      <div className="bg-slate-800 mb-6 rounded-lg flex justify-center border border-blue-900/50 shadow-[0_0_15px_rgba(59,130,246,0.3)]">
        <img src={robot} alt="AI Tutor" className="w-full object-contain" />
      </div>

      {/* CONTROLS */}
      <div className="mt-5 grid grid-cols-3 gap-3">

        {/* WRITE */}
        <div className="flex flex-col items-center gap-2">
          <button
            onClick={onStartWrite}
            className={`w-12 h-12 rounded-full flex items-center justify-center border transition-all
              ${sessionMode === "write"
                ? "bg-purple-500/30 border-purple-400 shadow-[0_0_20px_rgba(168,85,247,0.6)]"
                : "bg-purple-500/10 border-purple-700/40"
              }`}
          >
            <PenSquare className="text-purple-300" />
          </button>
          <span className="text-xs text-purple-300">Write</span>
        </div>

        {/* SPEAK */}
        <div className="flex flex-col items-center gap-2">
          <button
            onClick={onStartSpeak}
            className={`w-12 h-12 rounded-full flex items-center justify-center border transition-all
              ${sessionMode === "speak"
                ? "bg-blue-500/30 shadow-[0_0_20px_rgba(59,130,246,0.7)] animate-pulse"
                : "bg-blue-500/20 border-blue-700/40"
              }`}
          >
            <Mic className="text-blue-400" />
          </button>
          <span className="text-xs text-blue-300">Tap to Speak</span>
        </div>

        {/* STOP (ONLY PAUSE) */}
        <div className="flex flex-col items-center gap-2">
          <button
            onClick={onStop}
            className="w-12 h-12 rounded-full bg-red-500/20 flex items-center justify-center border border-red-500/40"
          >
            <Square className="text-red-500" />
          </button>
          <span className="text-xs text-red-400">Stop</span>
        </div>

      </div>
    </div>
  );
};

export default AITutorDisplay;