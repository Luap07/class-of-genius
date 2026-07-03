// src/components/equipment/IndicatorBottle.jsx

import React from "react";
import { motion } from "framer-motion";
import {
  FlaskConical,
  Droplets,
  CircleDot,
} from "lucide-react";

const indicatorColors = {
  Phenolphthalein: "#ec4899",
  "Methyl Orange": "#f97316",
  "Methyl Red": "#ef4444",
  "Bromothymol Blue": "#3b82f6",
  Litmus: "#8b5cf6",
};

const IndicatorBottle = ({
  indicator = "Phenolphthalein",
  drops = 3,
  isPouring = false,
  onAddIndicator,
}) => {
  const liquidColor =
    indicatorColors[indicator] || "#38bdf8";

  return (
    <div className="flex flex-col items-center select-none">

      {/* Heading */}
      <div className="flex items-center gap-2 mb-3">
        <FlaskConical
          size={20}
          className="text-cyan-400"
        />
        <span className="text-sm font-semibold text-slate-200">
          Indicator Bottle
        </span>
      </div>

      {/* Bottle */}
      <div className="relative w-32 h-56">

        {/* Bottle Cap */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-12 h-6 rounded-t-lg bg-slate-500 border border-slate-400" />

        {/* Neck */}
        <div className="absolute top-5 left-1/2 -translate-x-1/2 w-8 h-8 rounded bg-slate-300 border border-slate-400" />

        {/* Bottle Body */}
        <div className="absolute top-10 left-1/2 -translate-x-1/2 w-24 h-40 rounded-2xl border-[3px] border-slate-300 bg-white/10 overflow-hidden shadow-xl">

          {/* Liquid */}
          <motion.div
            animate={{
              height: "65%",
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
              animate={{
                x: isPouring
                  ? [-4, 4, -4]
                  : 0,
              }}
              transition={{
                repeat: Infinity,
                duration: 1,
              }}
              className="absolute top-0 left-0 w-full h-2 bg-white/20"
            />
          </motion.div>

          {/* Glass Shine */}
          <div className="absolute left-2 top-2 w-2 h-[85%] rounded-full bg-white/30" />
        </div>

        {/* Bottle Label */}
        <div className="absolute bottom-12 left-1/2 -translate-x-1/2 w-16 rounded-lg bg-slate-100 text-slate-900 text-[10px] font-bold py-1 text-center">
          {indicator}
        </div>

        {/* Animated Drops */}
        {isPouring &&
          Array.from({ length: drops }).map((_, i) => (
            <motion.div
              key={i}
              initial={{
                y: 0,
                opacity: 1,
              }}
              animate={{
                y: 80,
                opacity: 0,
              }}
              transition={{
                duration: 0.7,
                repeat: Infinity,
                delay: i * 0.15,
              }}
              className="absolute left-1/2 -translate-x-1/2 bottom-[-25px]"
            >
              <Droplets
                size={18}
                color={liquidColor}
              />
            </motion.div>
          ))}
      </div>

      {/* Information Card */}
      <div className="mt-5 w-56 rounded-xl border border-slate-700 bg-slate-900 p-4">

        <div className="flex justify-between mb-3">
          <span className="text-slate-400">
            Indicator
          </span>

          <span
            className="font-semibold"
            style={{ color: liquidColor }}
          >
            {indicator}
          </span>
        </div>

        <div className="flex justify-between mb-3">
          <span className="text-slate-400">
            Drops
          </span>

          <span className="text-white">
            {drops}
          </span>
        </div>

        <div className="flex items-center gap-2 mt-4">
          <CircleDot
            size={14}
            style={{ color: liquidColor }}
          />

          <span className="text-sm text-slate-300">
            Ready for use
          </span>
        </div>

        <button
          onClick={onAddIndicator}
          className="mt-5 w-full rounded-xl bg-cyan-600 hover:bg-cyan-500 transition-all py-2 font-semibold"
        >
          Add Indicator
        </button>

      </div>

    </div>
  );
};

export default IndicatorBottle;