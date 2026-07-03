// src/components/equipment/Stopcock.jsx

import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  Power,
  Droplets,
  Gauge,
  RotateCw,
} from "lucide-react";

const Stopcock = ({
  isOpen = false,
  flowRate = 0,
  maxFlowRate = 100,
  disabled = false,
  onToggle,
  onFlowRateChange,
}) => {
  const rotation = isOpen ? 90 : 0;

  const handleToggle = () => {
  if (disabled) return;

  onToggle?.(!isOpen);
};

  const handleSlider = (e) => {
    const value = Number(e.target.value);

    if (onFlowRateChange) {
      onFlowRateChange(value);
    }
  };

  return (
    <div className="flex flex-col items-center select-none">

      {/* Title */}
      <div className="flex items-center gap-2 mb-3">
        <Gauge className="text-cyan-400" size={18} />
        <span className="font-semibold text-slate-200">
          Stopcock
        </span>
      </div>

      {/* Valve */}
      <div className="relative flex items-center justify-center w-32 h-32">

        {/* Connector */}
        <div className="absolute w-28 h-3 rounded-full bg-slate-600" />

        {/* Valve Body */}
        <div className="absolute w-12 h-12 rounded-full bg-slate-500 border-2 border-slate-300 shadow-lg" />

        {/* Rotating Handle */}
        <motion.button
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.95 }}
          animate={{
            rotate: rotation,
          }}
          transition={{
            duration: 0.25,
          }}
          onClick={handleToggle}
          disabled={disabled}
          className={`absolute w-24 h-3 rounded-full shadow-lg
            ${
              disabled
                ? "bg-slate-700 cursor-not-allowed"
                : "bg-cyan-400 hover:bg-cyan-300"
            }`}
        />

        {/* Centre Cap */}
        <div className="absolute w-5 h-5 rounded-full bg-slate-300 border border-slate-500" />

      </div>

      {/* Status */}
      <div
        className={`mt-4 px-4 py-2 rounded-full text-sm font-semibold
        ${
          rotation === 90
            ? "bg-green-500/20 text-green-400 border border-green-500/30"
            : "bg-red-500/20 text-red-400 border border-red-500/30"
        }`}
      >
        {rotation === 90 ? "OPEN" : "CLOSED"}
      </div>

      {/* Flow Rate */}
      <div className="w-64 mt-6 rounded-xl bg-slate-900 border border-slate-700 p-4">

        <div className="flex justify-between items-center mb-3">

          <div className="flex items-center gap-2">
            <Droplets
              className="text-cyan-400"
              size={16}
            />

            <span className="text-slate-300">
              Flow Rate
            </span>
          </div>

          <span className="text-cyan-400 font-bold">
            {flowRate}%
          </span>

        </div>

        <input
          type="range"
          min={0}
          max={maxFlowRate}
          value={flowRate}
          disabled={!isOpen || disabled}
          onChange={handleSlider}
          className="w-full accent-cyan-500 cursor-pointer"
        />

        <div className="flex justify-between text-xs text-slate-500 mt-2">
          <span>Slow</span>
          <span>Fast</span>
        </div>

      </div>

      {/* Controls */}
      <div className="flex gap-3 mt-5">

        <button
          onClick={handleToggle}
          disabled={disabled}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl transition
          ${
            rotation === 90
              ? "bg-red-600 hover:bg-red-500"
              : "bg-green-600 hover:bg-green-500"
          }`}
        >
          <Power size={16} />

          {rotation === 90
            ? "Close Valve"
            : "Open Valve"}
        </button>

        <button
          onClick={() => {
           onToggle?.(false);
            onFlowRateChange?.(0);

            if (onFlowRateChange) {
              onFlowRateChange(0);
            }
          }}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-700 hover:bg-slate-600 transition"
        >
          <RotateCw size={16} />

          Reset
        </button>

      </div>

      {/* Live Indicator */}
      {rotation === 90 && flowRate > 0 && (
        <motion.div
          animate={{
            opacity: [0.4, 1, 0.4],
            scale: [0.9, 1.1, 0.9],
          }}
          transition={{
            repeat: Infinity,
            duration: 1,
          }}
          className="mt-6 flex items-center gap-2 text-cyan-400"
        >
          <Droplets size={20} />

          <span className="font-semibold">
            Solution Flowing...
          </span>
        </motion.div>
      )}

    </div>
  );
};

export default Stopcock;