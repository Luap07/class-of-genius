// src/components/chemistry/acidBase/Dropper.jsx

import React from "react";
import { motion } from "framer-motion";
import { Pipette } from "lucide-react";

export default function Dropper({
  chemical = null,
  pouring = false,
  onClick,
}) {
  const liquidColor = chemical?.color || "#38bdf8";

  return (
    <div
      onClick={onClick}
      className="relative flex flex-col items-center cursor-pointer select-none"
    >
      {/* Label */}
      <div className="mb-2 text-center">
        <p className="text-xs font-semibold text-white">
          {chemical?.formula || "Dropper"}
        </p>

        {chemical && (
          <p className="text-[10px] text-slate-400">
            {chemical.name}
          </p>
        )}
      </div>

      {/* Dropper */}
      <div className="relative flex flex-col items-center">

        {/* Rubber Bulb */}
        <div className="w-10 h-10 rounded-full bg-slate-700 border-2 border-slate-500 shadow-lg" />

        {/* Glass Tube */}
        <div className="relative w-5 h-40 rounded-full bg-white/10 border border-slate-400 overflow-hidden">

          {/* Liquid */}
          {chemical && (
            <motion.div
              animate={{
                height: pouring ? "55%" : "70%",
              }}
              transition={{
                duration: 0.4,
              }}
              className="absolute bottom-0 left-0 w-full"
              style={{
                background: liquidColor,
              }}
            />
          )}

          {/* Glass Highlight */}
          <div className="absolute left-1 top-2 w-1 h-28 rounded-full bg-white/40" />

        </div>

        {/* Tip */}
        <div className="w-1 h-10 bg-slate-300 rounded-full" />

        {/* Falling Droplet */}
        {pouring && (
          <motion.div
            initial={{
              y: 0,
              opacity: 1,
              scale: 1,
            }}
            animate={{
              y: 70,
              opacity: 0,
              scale: 0.5,
            }}
            transition={{
              repeat: Infinity,
              duration: 0.8,
              ease: "easeIn",
            }}
            className="absolute top-full mt-1 w-3 h-5 rounded-b-full"
            style={{
              background: liquidColor,
            }}
          />
        )}

      </div>

      {/* Icon */}
      <div className="absolute -right-8 top-10 text-cyan-400">
        <Pipette size={20} />
      </div>
    </div>
  );
}