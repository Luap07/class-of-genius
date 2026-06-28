import React from "react";
import {
  FlaskConical,
  Droplets,
  Flame,
  Snowflake,
  RotateCcw,
  Sparkles,
} from "lucide-react";

const reactions = [
  { id: "neutralization", name: "Neutralization", icon: Droplets, color: "from-cyan-500 to-blue-600" },
  { id: "combustion", name: "Combustion", icon: Flame, color: "from-orange-500 to-red-600" },
  { id: "precipitation", name: "Precipitation", icon: FlaskConical, color: "from-purple-500 to-pink-600" },
  { id: "decomposition", name: "Decomposition", icon: Sparkles, color: "from-yellow-500 to-amber-600" },
  { id: "cooling", name: "Cooling", icon: Snowflake, color: "from-sky-500 to-cyan-600" },
];

export default function ReactionToolbar({
  selectedReaction,
  setSelectedReaction,
  resetReaction,
}) {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5">
      {/* HEADER */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <h2 className="text-2xl font-bold text-white">Chemical Reactions</h2>
          <p className="text-slate-400 text-sm mt-1">Select a reaction type</p>
        </div>

        <button
          onClick={resetReaction}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 hover:bg-red-500/20 transition"
        >
          <RotateCcw size={18} />
          Reset
        </button>
      </div>

      {/* BUTTONS */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        {reactions.map((reaction) => {
          const Icon = reaction.icon;
          const active = selectedReaction === reaction.id;

          return (
            <button
              key={reaction.id}
              onClick={() => setSelectedReaction(reaction.id)}
              className={`rounded-2xl border transition-all duration-300 overflow-hidden ${
                active
                  ? "border-cyan-400 bg-cyan-500/10 shadow-lg shadow-cyan-500/20"
                  : "border-slate-700 bg-slate-950 hover:border-cyan-500"
              }`}
            >
              <div className="p-5 flex flex-col items-center">
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center bg-gradient-to-br ${reaction.color} mb-4`}>
                  <Icon className="text-white" size={26} />
                </div>

                <span className="text-white font-semibold text-sm text-center">
                  {reaction.name}
                </span>

                {active && (
                  <div className="mt-3 text-xs text-cyan-400 font-semibold">
                    Selected
                  </div>
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}