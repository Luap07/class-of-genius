import React from "react";
import {
  Eye,
  Thermometer,
  Droplets,
  FlaskConical,
  Sparkles,
} from "lucide-react";

export default function ObservationPanel({
  observation = "Select an acid and a base to begin.",
  reaction = null,
  temperature = 25,
}) {
  const reactionComplete = reaction?.success || false;

  const gasProduced = reaction?.bubbles || false;

  const heatProduced = reaction?.heat || false;

  const solutionColor = reaction?.color || "Clear";

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-3xl h-full flex flex-col overflow-hidden">

      {/* Header */}
      <div className="p-5 border-b border-slate-800 flex items-center gap-4">

        <div className="w-12 h-12 rounded-xl bg-cyan-500/20 flex items-center justify-center">
          <Eye
            className="text-cyan-400"
            size={24}
          />
        </div>

        <div>
          <h2 className="text-xl font-bold text-white">
            Observation Panel
          </h2>

          <p className="text-sm text-slate-400">
            Live laboratory observations
          </p>
        </div>

      </div>

      {/* Observation */}
      <div className="p-5">

        <div className="rounded-2xl border border-slate-700 bg-slate-950 min-h-[170px] p-5 text-slate-300 leading-7">
          {observation}
        </div>

      </div>

      {/* Live Indicators */}
      <div className="flex-1 border-t border-slate-800 p-5">

        <h3 className="text-xs uppercase tracking-widest text-slate-500 mb-4">
          Live Indicators
        </h3>

        <div className="space-y-3">

          <Indicator
            icon={Thermometer}
            color="text-red-400"
            bg="bg-red-500/20"
            title="Temperature"
            value={`${temperature}°C`}
          />

          <Indicator
            icon={Droplets}
            color="text-blue-400"
            bg="bg-blue-500/20"
            title="Solution Color"
            value={solutionColor}
          />

          <Indicator
            icon={Sparkles}
            color="text-cyan-400"
            bg="bg-cyan-500/20"
            title="Gas Evolution"
            value={gasProduced ? "Detected" : "None"}
          />

          <Indicator
            icon={Thermometer}
            color="text-orange-400"
            bg="bg-orange-500/20"
            title="Heat Released"
            value={heatProduced ? "Detected" : "None"}
          />

          <Indicator
            icon={FlaskConical}
            color="text-green-400"
            bg="bg-green-500/20"
            title="Reaction"
            value={reactionComplete ? "Completed" : "Waiting"}
          />

        </div>

      </div>

      {/* Footer */}
      <div className="border-t border-slate-800 bg-slate-950 px-5 py-4 flex justify-between">

        <span className="text-slate-500">
          Experiment Status
        </span>

        <span
          className={`font-semibold ${
            reactionComplete
              ? "text-emerald-400"
              : "text-yellow-400"
          }`}
        >
          {reaction
            ? reactionComplete
              ? "Completed"
              : "No Reaction"
            : "Ready"}
        </span>

      </div>

    </div>
  );
}

/* -------------------------------- */

function Indicator({
  icon: Icon,
  title,
  value,
  color,
  bg,
}) {
  return (
    <div className="flex items-center gap-4 rounded-xl bg-slate-950 border border-slate-800 p-3">

      <div
        className={`w-10 h-10 rounded-xl ${bg} flex items-center justify-center`}
      >
        <Icon
          className={color}
          size={20}
        />
      </div>

      <div>
        <p className="text-xs text-slate-500">
          {title}
        </p>

        <p className="text-white font-semibold">
          {value}
        </p>
      </div>

    </div>
  );
}