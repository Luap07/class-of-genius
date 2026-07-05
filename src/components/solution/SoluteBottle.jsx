// src/components/lab/SoluteBottle.jsx

import React from "react";

const SoluteBottle = ({
  solute,
  running,
  color,
  dissolvedPercent,
  onClick,
}) => {
  // Defensive calculation: ensure we always have a number between 0 and 100
  const numericDissolved = Number(dissolvedPercent ?? 0);
  const level = Math.max(0, Math.min(100, numericDissolved));

  return (
    <div
      onClick={onClick}
      className="flex flex-col items-center cursor-pointer select-none"
    >
      {/* Bottle */}
      <div
        className={`relative w-20 h-40 transition-transform duration-300 ${
          running ? "scale-105" : "scale-100"
        }`}
      >
        {/* Cap */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-10 h-4 bg-slate-700 rounded-t-md border border-slate-500" />

        {/* Neck */}
        <div className="absolute top-4 left-1/2 -translate-x-1/2 w-8 h-5 bg-slate-300 border border-slate-500" />

        {/* Bottle Glass */}
        <div className="absolute top-8 left-0 w-full h-32 rounded-b-2xl rounded-t-lg border-2 border-slate-300 bg-white/10 backdrop-blur overflow-hidden">
          
          {/* Liquid */}
          <div
            className="absolute bottom-0 left-0 w-full transition-all duration-500"
            style={{
              height: `${level}%`,
              backgroundColor: color || "#38bdf8", // Added fallback color
              opacity: 0.85,
            }}
          />

          {/* Shine */}
          <div className="absolute left-2 top-3 w-2 h-20 bg-white/40 rounded-full" />
        </div>
      </div>

      {/* Label */}
      <div className="mt-3 text-center">
        <div className="font-semibold text-white">
          {solute || "Unknown"}
        </div>

        <div className="text-xs text-slate-400">
          {level.toFixed(0)}% Dissolved
        </div>
      </div>
    </div>
  );
};

export default SoluteBottle;