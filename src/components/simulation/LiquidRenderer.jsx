// src/components/simulation/LiquidRenderer.jsx

import React from "react";
import { motion } from "framer-motion";

const LiquidRenderer = ({
  volume = 25,
  maxVolume = 50,
  color = "#3b82f6",
  width = 140,
  height = 280,
  rounded = "rounded-b-3xl",
  showWaves = true,
  animate = true,
}) => {
  const fillPercentage = Math.max(
    0,
    Math.min((volume / maxVolume) * 100, 100)
  );

  const liquidHeight = (fillPercentage / 100) * height;

  return (
    <div
      className={`relative overflow-hidden border border-white/20 bg-white/5 ${rounded}`}
      style={{
        width,
        height,
      }}
    >
      {/* Liquid */}
      <motion.div
        animate={
          animate
            ? {
                height: liquidHeight,
              }
            : false
        }
        transition={{
          duration: 0.4,
          ease: "easeInOut",
        }}
        className="absolute bottom-0 left-0 w-full"
        style={{
          background: color,
          height: liquidHeight,
        }}
      >
        {/* Animated Surface */}
        {showWaves && (
          <motion.div
            animate={{
              x: [-12, 12, -12],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            className="absolute top-0 left-0 w-[200%] h-4 opacity-30"
          >
            <svg
              viewBox="0 0 400 40"
              className="w-full h-full"
              preserveAspectRatio="none"
            >
              <path
                d="
                  M0 20
                  C25 5 50 35 75 20
                  S125 5 150 20
                  S200 35 225 20
                  S275 5 300 20
                  S350 35 375 20
                  S425 5 450 20
                "
                stroke="rgba(255,255,255,0.55)"
                strokeWidth="3"
                fill="none"
              />
            </svg>
          </motion.div>
        )}

        {/* Highlight */}
        <div className="absolute left-2 top-2 w-2 h-[90%] rounded-full bg-white/20" />

        {/* Gradient */}
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(to top, rgba(255,255,255,0.05), rgba(255,255,255,0.25))",
          }}
        />

        {/* Bubble Animation */}
        {showWaves &&
          [...Array(10)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute rounded-full bg-white/40"
              style={{
                width: 4 + Math.random() * 5,
                height: 4 + Math.random() * 5,
                left: `${10 + Math.random() * 80}%`,
                bottom: `${Math.random() * 20}%`,
              }}
              animate={{
                y: [-5, -100],
                opacity: [0, 1, 0],
              }}
              transition={{
                duration: 2 + Math.random(),
                delay: Math.random() * 2,
                repeat: Infinity,
                ease: "easeOut",
              }}
            />
          ))}
      </motion.div>

      {/* Fill Percentage */}
      <div className="absolute top-3 right-3 rounded-lg bg-slate-900/70 px-2 py-1 text-xs font-semibold text-cyan-300">
        {fillPercentage.toFixed(0)}%
      </div>

      {/* Volume */}
      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 rounded-lg bg-slate-900/70 px-3 py-1 text-sm font-semibold text-white">
        {volume.toFixed(2)} mL
      </div>
    </div>
  );
};

export default LiquidRenderer;