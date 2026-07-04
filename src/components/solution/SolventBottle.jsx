import React from "react";
import { motion } from "framer-motion";

const SolventBottle = ({
  label = "Distilled Water",
  color = "#38bdf8",
  level = 85,
  pouring = false,
}) => {
  return (
    <motion.div
      animate={{
        rotate: pouring ? -35 : 0,
        x: pouring ? -10 : 0,
        y: pouring ? -5 : 0,
      }}
      transition={{ duration: 0.35 }}
      className="relative w-28 h-64"
    >
      {/* Bottle Neck */}
      <div className="absolute left-10 -top-3 w-8 h-6 bg-slate-300 rounded-t-md border border-slate-500" />

      {/* Cap */}
      <div className="absolute left-[34px] -top-10 w-12 h-8 bg-blue-700 rounded-t-lg border border-blue-900 shadow-md" />

      {/* Bottle Body */}
      <div className="absolute inset-0 rounded-2xl border-2 border-slate-300 bg-white/10 backdrop-blur-md overflow-hidden shadow-xl">

        {/* Liquid */}
        <motion.div
          animate={{
            height: `${level}%`,
          }}
          transition={{ duration: 0.5 }}
          className="absolute bottom-0 left-0 right-0"
          style={{
            background: `linear-gradient(to top, ${color}, #7dd3fc)`,
          }}
        />

        {/* Shine */}
        <div className="absolute left-2 top-3 w-4 h-40 bg-white/25 rounded-full blur-sm" />

        {/* Water Bubbles */}
        {Array.from({ length: 12 }).map((_, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full bg-white/40"
            style={{
              width: 4 + Math.random() * 6,
              height: 4 + Math.random() * 6,
              left: `${15 + Math.random() * 65}%`,
              bottom: `${Math.random() * level}%`,
            }}
            animate={{
              y: [-2, -8, -2],
            }}
            transition={{
              repeat: Infinity,
              duration: 2 + Math.random() * 2,
            }}
          />
        ))}

        {/* Label */}
        <div className="absolute bottom-5 left-3 right-3 bg-white rounded-lg shadow text-center py-2 border">
          <div className="text-xs font-bold text-slate-900">
            SOLVENT
          </div>

          <div className="text-[11px] text-slate-600 mt-1">
            {label}
          </div>
        </div>
      </div>

      {/* Pour Stream */}
      {pouring && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="absolute -left-16 top-12 w-2 h-40 rounded-full"
          style={{
            background: color,
          }}
        />
      )}
    </motion.div>
  );
};

export default SolventBottle;