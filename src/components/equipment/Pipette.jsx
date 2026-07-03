// src/components/equipment/Pipette.jsx

import React from "react";
import { motion } from "framer-motion";
import { Syringe, Droplets } from "lucide-react";

const Pipette = ({
  volume = 25,
  maxVolume = 25,
  liquidColor = "#3b82f6",
  solutionName = "Sample Solution",
  isFilled = true,
  isDispensing = false,
  vertical = false,
}) => {
  const percentage = Math.max(
    0,
    Math.min((volume / maxVolume) * 100, 100)
  );

  return (
    <motion.div
      animate={
        isDispensing
          ? {
              y: [0, 6, 0],
            }
          : {}
      }
      transition={{
        repeat: Infinity,
        duration: 1,
      }}
      className={`flex ${
        vertical ? "flex-col items-center" : "items-center"
      } gap-4 select-none`}
    >
      {/* Label */}
      <div className="flex items-center gap-2">
        <Syringe size={20} className="text-cyan-400" />
        <span className="text-sm font-semibold text-slate-200">
          Pipette
        </span>
      </div>

      {/* Pipette */}
      <div
        className={`relative ${
          vertical
            ? "w-10 h-72"
            : "w-72 h-10"
        }`}
      >
        {/* Glass Tube */}
        <div
          className={`absolute rounded-full border-2 border-slate-300 bg-white/10 overflow-hidden ${
            vertical
              ? "w-6 h-56 left-1/2 -translate-x-1/2 top-4"
              : "h-6 w-56 top-1/2 -translate-y-1/2 left-4"
          }`}
        >
          {/* Liquid */}
          <motion.div
            animate={
              vertical
                ? {
                    height: `${percentage}%`,
                  }
                : {
                    width: `${percentage}%`,
                  }
            }
            transition={{
              duration: 0.4,
            }}
            className="absolute left-0 bottom-0"
            style={{
              background: liquidColor,
              width: vertical ? "100%" : undefined,
              height: vertical ? undefined : "100%",
            }}
          />

          {/* Shine */}
          <div
            className={`absolute bg-white/30 rounded-full ${
              vertical
                ? "left-1 top-0 w-1 h-full"
                : "left-0 top-1 h-1 w-full"
            }`}
          />
        </div>

        {/* Bulb */}
        <div
          className={`absolute rounded-full bg-slate-400 border border-slate-300 shadow-lg ${
            vertical
              ? "top-0 left-1/2 -translate-x-1/2 w-10 h-10"
              : "right-0 top-1/2 -translate-y-1/2 w-10 h-10"
          }`}
        />

        {/* Tip */}
        <div
          className={`absolute bg-slate-300 rounded-full ${
            vertical
              ? "bottom-0 left-1/2 -translate-x-1/2 w-1 h-12"
              : "left-0 top-1/2 -translate-y-1/2 w-12 h-1"
          }`}
        />

        {/* Drip */}
        {isDispensing && (
          <motion.div
            initial={{
              opacity: 1,
              y: 0,
            }}
            animate={{
              opacity: 0,
              y: 30,
            }}
            transition={{
              duration: 0.6,
              repeat: Infinity,
            }}
            className={`absolute ${
              vertical
                ? "left-1/2 -translate-x-1/2 bottom-[-25px]"
                : "left-[-20px] top-1/2 -translate-y-1/2"
            }`}
          >
            <Droplets
              size={18}
              className="text-cyan-400"
            />
          </motion.div>
        )}
      </div>

      {/* Info */}
      <div className="w-48 rounded-xl border border-slate-700 bg-slate-900 p-4">

        <div className="flex justify-between mb-2">
          <span className="text-slate-400">
            Solution
          </span>

          <span className="text-cyan-400 font-semibold">
            {solutionName}
          </span>
        </div>

        <div className="flex justify-between mb-2">
          <span className="text-slate-400">
            Volume
          </span>

          <span className="text-white">
            {volume.toFixed(1)} mL
          </span>
        </div>

        <div className="flex justify-between mb-3">
          <span className="text-slate-400">
            Status
          </span>

          <span
            className={`font-semibold ${
              isFilled
                ? "text-green-400"
                : "text-red-400"
            }`}
          >
            {isFilled ? "Filled" : "Empty"}
          </span>
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
    </motion.div>
  );
};

export default Pipette;