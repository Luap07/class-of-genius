// src/components/equipment/Burette.jsx

import React from "react";
import { motion } from "framer-motion";
import { Droplets } from "lucide-react";

const Burette = ({
  volume = 50,
  maxVolume = 50,
  liquidColor = "#38bdf8",
  isRunning = false,
}) => {
  const percentage = Math.max(
    0,
    Math.min((volume / maxVolume) * 100, 100)
  );

  const liquidHeight = `${percentage}%`;

  return (
    <div className="flex flex-col items-center select-none">

      {/* Title */}
      <div className="flex items-center gap-2 mb-3">
        <Droplets className="text-cyan-400" size={20} />
        <span className="font-semibold text-slate-200">
          Burette
        </span>
      </div>

      {/* Body */}
      <div className="relative">

        {/* Scale */}
        <div className="absolute -left-12 top-0 h-[420px] flex flex-col justify-between text-[10px] text-slate-400">
          {Array.from({ length: 11 }).map((_, i) => (
            <span key={i}>{50 - i * 5}</span>
          ))}
        </div>

        {/* Glass Tube */}
        <div className="relative w-12 h-[420px] rounded-full border-[3px] border-slate-300 bg-slate-100 overflow-hidden shadow-xl">

          {/* Glass Shine */}
          <div className="absolute left-1 top-0 h-full w-2 rounded-full bg-white/40 z-20" />

          {/* Liquid */}
          <motion.div
            animate={{
              height: liquidHeight,
            }}
            transition={{
              duration: 0.5,
            }}
            className="absolute bottom-0 left-0 w-full"
            style={{
              background: liquidColor,
            }}
          >
            {/* Animated Surface */}
            <motion.div
              animate={
                isRunning
                  ? {
                      y: [0, -3, 0],
                    }
                  : {}
              }
              transition={{
                duration: 1,
                repeat: Infinity,
              }}
              className="absolute top-0 left-0 w-full h-3 bg-white/25"
            />
          </motion.div>

          {/* Graduation Marks */}
          {Array.from({ length: 51 }).map((_, i) => (
            <div
              key={i}
              className={`absolute right-0 ${
                i % 5 === 0 ? "w-5" : "w-3"
              } h-[1px] bg-slate-700`}
              style={{
                top: `${(i / 50) * 100}%`,
              }}
            />
          ))}
        </div>

        {/* Stopcock Connector */}
        <div className="mx-auto w-4 h-8 bg-slate-300 rounded-b-lg shadow" />

        {/* Nozzle */}
        <div className="mx-auto w-[3px] h-10 bg-slate-400 rounded-full" />

        {/* Dripping */}
        {isRunning && volume > 0 && (
          <motion.div
            initial={{ y: 0, opacity: 1 }}
            animate={{
              y: 40,
              opacity: 0,
            }}
            transition={{
              duration: 0.6,
              repeat: Infinity,
            }}
            className="absolute left-1/2 -translate-x-1/2 bottom-[-35px]"
          >
            <Droplets
              size={18}
              className="text-cyan-400"
            />
          </motion.div>
        )}
      </div>

      {/* Current Volume */}
      <div className="mt-6 bg-slate-900 border border-slate-700 rounded-xl px-4 py-2 text-center">

        <div className="text-xs text-slate-400">
          Current Volume
        </div>

        <div className="text-2xl font-bold text-cyan-400">
          {volume.toFixed(2)}
        </div>

        <div className="text-sm text-slate-500">
          mL
        </div>
      </div>

      {/* Fill Percentage */}
      <div className="mt-3 w-40">

        <div className="flex justify-between text-xs text-slate-400 mb-1">
          <span>Fill Level</span>
          <span>{percentage.toFixed(0)}%</span>
        </div>

        <div className="h-2 rounded-full bg-slate-800 overflow-hidden">
          <motion.div
            animate={{
              width: `${percentage}%`,
            }}
            transition={{
              duration: 0.4,
            }}
            className="h-full bg-cyan-400"
          />
        </div>

      </div>

    </div>
  );
};

export default Burette;