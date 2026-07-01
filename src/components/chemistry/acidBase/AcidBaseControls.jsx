import React from "react";
import {
  Play,
  Pause,
  RotateCcw,
  Thermometer,
  Gauge,
} from "lucide-react";

export default function AcidBaseControls({
  playing,
  setPlaying,

  speed,
  setSpeed,

  temperature,
  setTemperature,

  onStart,
  onReset,
}) {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">

      {/* Top Controls */}
      <div className="flex flex-wrap items-center gap-3">

        <button
          onClick={() => {
            if (playing) {
              setPlaying(false);
            } else {
              onStart();
            }
          }}
          className={`flex items-center gap-2 px-5 py-2 rounded-xl font-semibold transition ${
            playing
              ? "bg-red-500 hover:bg-red-600"
              : "bg-emerald-500 hover:bg-emerald-600"
          }`}
        >
          {playing ? (
            <Pause size={18} />
          ) : (
            <Play size={18} />
          )}

          {playing ? "Pause" : "Start"}
        </button>

        <button
          onClick={onReset}
          className="flex items-center gap-2 px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 transition"
        >
          <RotateCcw size={18} />
          Reset
        </button>

      </div>

      {/* Temperature */}
      <div className="mt-8">

        <div className="flex justify-between items-center mb-2">

          <div className="flex items-center gap-2 text-orange-400">
            <Thermometer size={18} />
            <span className="font-semibold">
              Temperature
            </span>
          </div>

          <span className="text-white font-bold">
            {temperature}°C
          </span>

        </div>

        <input
          type="range"
          min={0}
          max={100}
          value={temperature}
          onChange={(e) =>
            setTemperature(Number(e.target.value))
          }
          className="w-full accent-orange-500"
        />

      </div>

      {/* Animation Speed */}
      <div className="mt-8">

        <div className="flex justify-between items-center mb-2">

          <div className="flex items-center gap-2 text-cyan-400">
            <Gauge size={18} />
            <span className="font-semibold">
              Animation Speed
            </span>
          </div>

          <span className="text-white font-bold">
            {speed.toFixed(1)}x
          </span>

        </div>

        <input
          type="range"
          min={0.5}
          max={3}
          step={0.5}
          value={speed}
          onChange={(e) =>
            setSpeed(Number(e.target.value))
          }
          className="w-full accent-cyan-500"
        />

      </div>

      {/* Status */}
      <div className="mt-8 grid grid-cols-3 gap-3">

        <div className="rounded-xl bg-slate-950 border border-slate-800 p-3">

          <p className="text-xs text-slate-400">
            Status
          </p>

          <p
            className={`font-bold ${
              playing
                ? "text-emerald-400"
                : "text-yellow-400"
            }`}
          >
            {playing ? "Running" : "Idle"}
          </p>

        </div>

        <div className="rounded-xl bg-slate-950 border border-slate-800 p-3">

          <p className="text-xs text-slate-400">
            Temp
          </p>

          <p className="font-bold text-orange-400">
            {temperature}°C
          </p>

        </div>

        <div className="rounded-xl bg-slate-950 border border-slate-800 p-3">

          <p className="text-xs text-slate-400">
            Speed
          </p>

          <p className="font-bold text-cyan-400">
            {speed.toFixed(1)}x
          </p>

        </div>

      </div>

    </div>
  );
}