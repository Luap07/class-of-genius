// src/components/chemistry/acidBase/SolutionRenderer.jsx

import React from "react";
import { motion } from "framer-motion";

export default function SolutionRenderer({
  acid,
  base,
  ph = 7,
  color,
  playing = false,
  height = 260,
}) {
  const getPHColor = () => {
    if (ph <= 2) return "#ef4444";
    if (ph <= 4) return "#f97316";
    if (ph <= 6) return "#facc15";
    if (ph === 7) return "#22c55e";
    if (ph <= 10) return "#38bdf8";
    if (ph <= 12) return "#2563eb";
    return "#7c3aed";
  };

  const solutionColor = color || getPHColor();

  const fillHeight =
    acid && base
      ? "70%"
      : acid || base
      ? "35%"
      : "0%";

  return (
    <div
      className="relative w-full flex items-end justify-center"
      style={{ height }}
    >
      {/* Glass */}

      <div className="relative w-56 h-full rounded-t-3xl rounded-b-[70px] border-[6px] border-slate-300/30 bg-white/5 backdrop-blur-sm overflow-hidden">

        {/* Liquid */}

        <motion.div
          initial={{
            height: "0%",
            backgroundColor: solutionColor,
          }}
          animate={{
            height: fillHeight,
            backgroundColor: solutionColor,
          }}
          transition={{
            duration: 0.8,
          }}
          className="absolute bottom-0 left-0 w-full"
        >

          {/* Surface */}

          {playing && (
            <motion.div
              animate={{
                x: [-20, 20, -20],
              }}
              transition={{
                repeat: Infinity,
                duration: 2,
                ease: "easeInOut",
              }}
              className="absolute top-0 left-0 w-[140%] h-4 rounded-full bg-white/20 blur-sm"
            />
          )}

        </motion.div>

        {/* Glass Reflection */}

        <div className="absolute left-4 top-4 bottom-6 w-3 rounded-full bg-white/20 blur-sm" />

      </div>

      {/* Selected Chemicals */}

      {(acid || base) && (
        <div className="absolute -bottom-16 flex gap-4">

          {acid && (
            <div className="px-4 py-2 rounded-xl bg-red-500/20 border border-red-500/40 text-red-300 text-sm font-semibold">
              {acid.formula}
            </div>
          )}

          {base && (
            <div className="px-4 py-2 rounded-xl bg-blue-500/20 border border-blue-500/40 text-blue-300 text-sm font-semibold">
              {base.formula}
            </div>
          )}

        </div>
      )}

      {/* pH */}

      <div className="absolute top-3 right-3 bg-slate-900/80 border border-slate-700 px-3 py-1 rounded-full text-sm font-bold text-white">
        pH {Number(ph).toFixed(1)}
      </div>
    </div>
  );
}