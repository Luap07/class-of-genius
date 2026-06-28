import React from "react";
import {
  Play,
  Pause,
 Square,
  RotateCcw,
  Thermometer,
  Gauge,
  Flame,
  Snowflake,
} from "lucide-react";

export default function ReactionControls({
  playing = false,
  setPlaying = () => {},

  temperature = 25,
  setTemperature = () => {},

  speed = 1,
  setSpeed = () => {},

  onRun = () => {},
  onStop = () => {},
  onReset = () => {},
}) {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6">

      {/* Header */}

      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 rounded-xl bg-cyan-500/20 flex items-center justify-center">
          <Gauge className="text-cyan-400" size={22} />
        </div>

        <div>
          <h2 className="text-xl font-bold text-white">
            Reaction Controls
          </h2>

          <p className="text-sm text-slate-400">
            Control the experiment
          </p>
        </div>
      </div>

      {/* Buttons */}

      <div className="grid grid-cols-4 gap-3 mb-8">

        <button
          onClick={() => {
            setPlaying(true);
            onRun();
          }}
          disabled={playing}
          className={`rounded-2xl py-4 flex flex-col items-center gap-2 transition

          ${
            playing
              ? "bg-slate-800 text-slate-500"
              : "bg-green-500 hover:bg-green-600 text-white"
          }`}
        >
          <Play size={20} />
          Start
        </button>

        <button
          onClick={() => setPlaying(false)}
          disabled={!playing}
          className={`rounded-2xl py-4 flex flex-col items-center gap-2 transition

          ${
            !playing
              ? "bg-slate-800 text-slate-500"
              : "bg-yellow-500 hover:bg-yellow-600 text-white"
          }`}
        >
          <Pause size={20} />
          Pause
        </button>

        <button
          onClick={() => {
            setPlaying(false);
            onStop();
          }}
          className="rounded-2xl bg-red-500 hover:bg-red-600 py-4 text-white flex flex-col items-center gap-2"
        >
          <Square size={20} />
          Stop
        </button>

        <button
          onClick={() => {
            setPlaying(false);
            onReset();
          }}
          className="rounded-2xl bg-slate-700 hover:bg-slate-600 py-4 text-white flex flex-col items-center gap-2"
        >
          <RotateCcw size={20} />
          Reset
        </button>

      </div>

      {/* Temperature */}

      <div className="space-y-6 mb-8">

        <div>

          <div className="flex justify-between mb-2">

            <div className="flex items-center gap-2 text-white">

              <Thermometer
                className="text-orange-400"
                size={16}
              />

              Temperature

            </div>

            <span className="text-cyan-400 font-bold">
              {temperature}°C
            </span>

          </div>

          <input
            type="range"
            min={0}
            max={500}
            value={temperature}
            onChange={(e) =>
              setTemperature(Number(e.target.value))
            }
            className="w-full accent-cyan-500"
          />

        </div>

        <div>

          <div className="flex justify-between mb-2">

            <span className="text-white">
              Reaction Speed
            </span>

            <span className="text-cyan-400 font-bold">
              {speed.toFixed(1)}x
            </span>

          </div>

          <input
            type="range"
            min={0.25}
            max={4}
            step={0.25}
            value={speed}
            onChange={(e) =>
              setSpeed(Number(e.target.value))
            }
            className="w-full accent-cyan-500"
          />

        </div>

      </div>

      {/* Quick Buttons */}

      <div className="grid grid-cols-2 gap-4">

        <button
          onClick={() =>
            setTemperature((t) => Math.min(t + 25, 500))
          }
          className="rounded-xl py-3 bg-orange-500/10 border border-orange-500/20 hover:bg-orange-500/20 text-orange-300 flex items-center justify-center gap-2"
        >
          <Flame size={16} />
          Heat +25°
        </button>

        <button
          onClick={() =>
            setTemperature((t) => Math.max(t - 25, 0))
          }
          className="rounded-xl py-3 bg-sky-500/10 border border-sky-500/20 hover:bg-sky-500/20 text-sky-300 flex items-center justify-center gap-2"
        >
          <Snowflake size={16} />
          Cool -25°
        </button>

      </div>

    </div>
  );
}