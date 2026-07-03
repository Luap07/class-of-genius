// src/components/equipment/Beaker.jsx

import React from "react";
import { motion } from "framer-motion";
import { Beaker as BeakerIcon } from "lucide-react";

const Beaker = ({
  label = "Beaker",
  volume = 100,
  maxVolume = 250,
  liquidColor = "#3b82f6",
  solutionName = "Solution",
  stirring = false,
}) => {
  const fillPercentage = Math.max(
    0,
    Math.min((volume / maxVolume) * 100, 100)
  );

  const liquidHeight = `${fillPercentage}%`;

  return (
    <div className="flex flex-col items-center select-none">

      {/* Title */}
      <div className="flex items-center gap-2 mb-3">
        <BeakerIcon className="text-cyan-400" size={20} />
        <span className="font-semibold text-slate-200">
          {label}
        </span>
      </div>

      {/* Beaker */}
      <div className="relative w-40 h-52">

        {/* Glass */}
        <div className="absolute inset-0 border-[4px] border-slate-300 rounded-b-3xl rounded-t-md bg-white/5 overflow-hidden">

          {/* Lip */}
          <div className="absolute -top-1 left-4 w-8 h-2 bg-slate-300 rounded-full" />

          {/* Shine */}
          <div className="absolute left-2 top-3 h-[85%] w-2 rounded-full bg-white/30" />

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
            {/* Liquid Surface */}
            <motion.div
              animate={
                stirring
                  ? {
                      x: [-4, 4, -4],
                    }
                  : {
                      x: 0,
                    }
              }
              transition={{
                repeat: Infinity,
                duration: 2,
              }}
              className="absolute top-0 left-0 w-full h-2 bg-white/20"
            />
          </motion.div>

          {/* Scale Marks */}
          {Array.from({ length: 10 }).map((_, i) => (
            <div
              key={i}
              className="absolute right-0 w-5 h-[2px] bg-slate-700"
              style={{
                bottom: `${(i + 1) * 10}%`,
              }}
            />
          ))}

          {/* Bubble Animation */}
          {stirring &&
            Array.from({ length: 10 }).map((_, i) => (
              <motion.div
                key={i}
                className="absolute rounded-full bg-white/60"
                style={{
                  width: 4 + Math.random() * 5,
                  height: 4 + Math.random() * 5,
                  left: 25 + Math.random() * 80,
                  bottom: 20,
                }}
                animate={{
                  y: [-5, -120],
                  opacity: [0, 1, 0],
                }}
                transition={{
                  duration: 1.5 + Math.random(),
                  repeat: Infinity,
                  delay: Math.random(),
                }}
              />
            ))}
        </div>
      </div>

      {/* Information */}
      <div className="mt-5 w-44 rounded-xl bg-slate-900 border border-slate-700 p-4">

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
            Fill
          </span>

          <span className="text-white">
            {fillPercentage.toFixed(0)}%
          </span>
        </div>

        <div className="h-2 rounded-full bg-slate-800 overflow-hidden">
          <motion.div
            animate={{
              width: `${fillPercentage}%`,
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

export default Beaker;