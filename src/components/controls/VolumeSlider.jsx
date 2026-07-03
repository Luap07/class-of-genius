// src/components/controls/VolumeSlider.jsx

import React from "react";
import { motion } from "framer-motion";
import {
  Droplets,
  Gauge,
  Minus,
  Plus,
  RotateCcw,
} from "lucide-react";

const VolumeSlider = ({
  volume = 50,
  setVolume,
  min = 0,
  max = 50,
  step = 0.1,
}) => {
  const percentage = ((volume - min) / (max - min)) * 100;

  const decrease = () => {
    setVolume((prev) =>
      Math.max(min, Number((prev - step).toFixed(2)))
    );
  };

  const increase = () => {
    setVolume((prev) =>
      Math.min(max, Number((prev + step).toFixed(2)))
    );
  };

  const reset = () => {
    setVolume(max);
  };

  return (
    <div className="rounded-2xl border border-slate-700 bg-slate-900 p-5 shadow-lg">

      {/* Header */}
      <div className="flex items-center justify-between mb-5">

        <div className="flex items-center gap-2">
          <Gauge
            className="text-cyan-400"
            size={20}
          />

          <h2 className="text-lg font-bold">
            Burette Volume
          </h2>
        </div>

        <button
          onClick={reset}
          className="rounded-lg bg-slate-800 p-2 hover:bg-slate-700 transition"
        >
          <RotateCcw size={16} />
        </button>

      </div>

      {/* Volume Display */}
      <motion.div
        key={volume}
        initial={{
          scale: 0.9,
          opacity: 0,
        }}
        animate={{
          scale: 1,
          opacity: 1,
        }}
        className="mb-6 text-center"
      >
        <div className="text-5xl font-bold text-cyan-400">
          {volume.toFixed(2)}
        </div>

        <div className="text-slate-400">
          mL
        </div>
      </motion.div>

      {/* Slider */}
      <div className="mb-5">

        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={volume}
          onChange={(e) =>
            setVolume(Number(e.target.value))
          }
          className="w-full accent-cyan-500 cursor-pointer"
        />

      </div>

      {/* Progress */}
      <div className="mb-6">

        <div className="flex justify-between text-sm mb-2">

          <span className="text-slate-400">
            Fill Level
          </span>

          <span className="text-cyan-400">
            {percentage.toFixed(0)}%
          </span>

        </div>

        <div className="h-3 rounded-full overflow-hidden bg-slate-800">

          <motion.div
            animate={{
              width: `${percentage}%`,
            }}
            transition={{
              duration: 0.3,
            }}
            className="h-full bg-gradient-to-r from-cyan-500 to-blue-500"
          />

        </div>

      </div>

      {/* Controls */}
      <div className="grid grid-cols-2 gap-3 mb-5">

        <button
          onClick={decrease}
          className="flex items-center justify-center gap-2 rounded-xl bg-red-600 hover:bg-red-500 py-3 transition"
        >
          <Minus size={18} />

          Remove
        </button>

        <button
          onClick={increase}
          className="flex items-center justify-center gap-2 rounded-xl bg-green-600 hover:bg-green-500 py-3 transition"
        >
          <Plus size={18} />

          Add
        </button>

      </div>

      {/* Presets */}
      <div className="grid grid-cols-4 gap-2 mb-6">

        {[10, 20, 30, 50].map((v) => (
          <button
            key={v}
            onClick={() => setVolume(v)}
            className={`
              rounded-lg
              py-2
              transition
              ${
                volume === v
                  ? "bg-cyan-500 text-black font-bold"
                  : "bg-slate-800 hover:bg-slate-700"
              }
            `}
          >
            {v}
          </button>
        ))}

      </div>

      {/* Information */}
      <div className="rounded-xl bg-slate-800 p-4 space-y-3">

        <div className="flex justify-between">

          <div className="flex items-center gap-2">

            <Droplets
              size={16}
              className="text-cyan-400"
            />

            <span className="text-slate-400">
              Current Volume
            </span>

          </div>

          <span className="font-semibold text-white">
            {volume.toFixed(2)} mL
          </span>

        </div>

        <div className="flex justify-between">

          <span className="text-slate-400">
            Maximum
          </span>

          <span>{max} mL</span>

        </div>

        <div className="flex justify-between">

          <span className="text-slate-400">
            Minimum
          </span>

          <span>{min} mL</span>

        </div>

        <div className="flex justify-between">

          <span className="text-slate-400">
            Step Size
          </span>

          <span>{step} mL</span>

        </div>

      </div>

      {/* Tip */}
      <div className="mt-5 rounded-xl border border-cyan-500/20 bg-cyan-500/10 p-4">

        <p className="text-sm text-slate-300 leading-6">
          During a real titration, the volume in the burette
          gradually decreases as the stopcock is opened.
          Later, this slider will automatically move when
          the titration is running.
        </p>

      </div>

    </div>
  );
};

export default VolumeSlider;