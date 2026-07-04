
import React from "react";
import { Droplets } from "lucide-react";

const VolumeSlider = ({
  volume = 100,
  setVolume,
  min = 10,
  max = 1000,
  step = 10,
}) => {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">

      <div className="flex items-center gap-2 mb-4">
        <Droplets className="text-cyan-400" size={22} />
        <h2 className="text-lg font-bold text-white">
          Solution Volume
        </h2>
      </div>

      <div className="flex justify-between text-sm text-slate-400 mb-2">
        <span>{min} mL</span>
        <span>{max} mL</span>
      </div>

      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={volume}
        onChange={(e) => setVolume(Number(e.target.value))}
        className="
          w-full
          accent-cyan-500
          cursor-pointer
        "
      />

      <div className="mt-5 text-center">

        <div className="text-4xl font-bold text-cyan-400">
          {volume}
        </div>

        <div className="text-slate-400 text-sm">
          millilitres (mL)
        </div>

      </div>

      <div className="mt-6 grid grid-cols-4 gap-2">

        {[50, 100, 250, 500].map((v) => (
          <button
            key={v}
            onClick={() => setVolume(v)}
            className={`
              rounded-lg
              py-2
              transition
              ${
                volume === v
                  ? "bg-cyan-600 text-white"
                  : "bg-slate-800 hover:bg-slate-700"
              }
            `}
          >
            {v} mL
          </button>
        ))}

      </div>

    </div>
  );
};

export default VolumeSlider;