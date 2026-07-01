// src/components/chemistry/acidBase/TestTube.jsx

import React from "react";
import { motion } from "framer-motion";

export default function TestTube({
  color = "#38bdf8",
  fill = 60,
  label = "",
  bubbling = false,
  className = "",
}) {
  return (
    <div
      className={`relative flex flex-col items-center ${className}`}
    >
      {/* Tube */}
      <div className="relative w-20 h-72 rounded-b-[40px] rounded-t-xl border-[5px] border-slate-300/30 bg-white/5 overflow-hidden shadow-xl">

        {/* Glass Highlight */}
        <div className="absolute left-2 top-3 bottom-6 w-2 rounded-full bg-white/20 blur-sm z-20" />

        {/* Liquid */}
        <motion.div
          initial={{ height: 0 }}
          animate={{
            height: `${fill}%`,
            backgroundColor: color,
          }}
          transition={{
            duration: 0.7,
          }}
          className="absolute bottom-0 left-0 w-full"
        >
          {/* Surface Wave */}
          <motion.div
            animate={{
              x: [-10, 10, -10],
            }}
            transition={{
              repeat: Infinity,
              duration: 2,
              ease: "easeInOut",
            }}
            className="absolute top-0 left-0 w-[130%] h-3 bg-white/20 rounded-full"
          />
        </motion.div>

        {/* Bubbles */}
        {bubbling &&
          Array.from({ length: 8 }).map((_, i) => (
            <motion.div
              key={i}
              initial={{
                y: 220,
                opacity: 0,
                x: Math.random() * 45 + 8,
              }}
              animate={{
                y: -20,
                opacity: [0, 1, 0],
              }}
              transition={{
                repeat: Infinity,
                duration: 1.5 + Math.random(),
                delay: Math.random(),
                ease: "linear",
              }}
              className="absolute w-2 h-2 rounded-full bg-white/70"
            />
          ))}
      </div>

      {/* Label */}
      {label && (
        <div className="mt-4 px-3 py-1 rounded-lg bg-slate-800 border border-slate-700 text-sm text-white font-semibold">
          {label}
        </div>
      )}

      {/* Fill Percentage */}
      <div className="mt-2 text-xs text-slate-400">
        {fill}%
      </div>
    </div>
  );
}