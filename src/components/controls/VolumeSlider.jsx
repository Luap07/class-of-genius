import React from "react";
import { Gauge, Droplets, RotateCcw } from "lucide-react";

const VolumeSlider = ({ volume, setVolume }) => {
  const handleChange = (e) => {
    setVolume(Number(e.target.value));
  };

  const presets = [0, 5, 10, 15, 20, 25, 30, 40, 50];

  return (
    <div className="bg-slate-900 rounded-2xl border border-slate-800 p-5">

      {/* Header */}
      <div className="flex items-center gap-3 mb-5">
        <Gauge className="w-6 h-6 text-cyan-400" />
        <h2 className="text-xl font-bold text-white">
          Titrant Volume
        </h2>
      </div>

      {/* Digital Display */}
      <div className="rounded-xl bg-slate-950 border border-cyan-700 p-6 text-center mb-5">

        <p className="text-sm text-slate-400 uppercase tracking-widest">
          Volume Added
        </p>

        <h1 className="text-5xl font-bold text-cyan-400 mt-2">
          {volume.toFixed(2)}
        </h1>

        <p className="text-slate-400 mt-2">
          mL
        </p>

      </div>

      {/* Slider */}
      <div className="space-y-2">

        <input
          type="range"
          min={0}
          max={50}
          step={0.1}
          value={volume}
          onChange={handleChange}
          className="w-full accent-cyan-500 cursor-pointer"
        />

        <div className="flex justify-between text-xs text-slate-500">
          <span>0 mL</span>
          <span>25 mL</span>
          <span>50 mL</span>
        </div>

      </div>

      {/* Quick Presets */}
      <div className="mt-6">

        <p className="text-sm text-slate-300 mb-3">
          Quick Set
        </p>

        <div className="grid grid-cols-3 gap-2">

          {presets.map((item) => (
            <button
              key={item}
              onClick={() => setVolume(item)}
              className={`
                rounded-lg
                py-2
                text-sm
                transition
                border
                ${
                  volume === item
                    ? "bg-cyan-600 border-cyan-500 text-white"
                    : "bg-slate-800 border-slate-700 hover:bg-slate-700 text-slate-300"
                }
              `}
            >
              {item} mL
            </button>
          ))}

        </div>

      </div>

      {/* Progress */}
      <div className="mt-6">

        <div className="flex justify-between mb-2 text-sm">
          <span className="text-slate-400">
            Burette Usage
          </span>

          <span className="text-cyan-400 font-semibold">
            {(volume / 50 * 100).toFixed(0)}%
          </span>
        </div>

        <div className="h-3 rounded-full bg-slate-800 overflow-hidden">

          <div
            className="h-full bg-cyan-500 transition-all duration-300"
            style={{
              width: `${(volume / 50) * 100}%`,
            }}
          />

        </div>

      </div>

      {/* Information */}
      <div className="mt-6 rounded-xl bg-slate-800 border border-slate-700 p-4 space-y-3">

        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Droplets className="w-4 h-4 text-cyan-400" />
            <span className="text-slate-300">
              Current Volume
            </span>
          </div>

          <span className="font-semibold text-white">
            {volume.toFixed(2)} mL
          </span>
        </div>

        <div className="flex justify-between items-center">

          <div className="flex items-center gap-2">
            <RotateCcw className="w-4 h-4 text-orange-400" />
            <span className="text-slate-300">
              Remaining
            </span>
          </div>

          <span className="font-semibold text-white">
            {(50 - volume).toFixed(2)} mL
          </span>

        </div>

      </div>

    </div>
  );
};

export default VolumeSlider;