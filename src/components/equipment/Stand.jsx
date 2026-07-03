// src/components/equipment/Stand.jsx

import React from "react";
import { motion } from "framer-motion";
import { Wrench } from "lucide-react";

const Stand = ({
  children,
  height = 520,
  showBase = true,
  showClamp = true,
  clampTop = 70,
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 25 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="relative flex justify-center items-end select-none"
      style={{
        width: 220,
        height,
      }}
    >
      {/* Shadow */}
      <div className="absolute bottom-0 w-52 h-5 rounded-full bg-black/30 blur-md" />

      {/* Base */}
      {showBase && (
        <div className="absolute bottom-0 w-48 h-5 rounded-full bg-gradient-to-r from-slate-700 via-slate-500 to-slate-700 border border-slate-400 shadow-xl" />
      )}

      {/* Vertical Rod */}
      <div
        className="absolute bottom-5 left-1/2 -translate-x-1/2 rounded-full border border-slate-400 bg-gradient-to-b from-slate-200 via-slate-500 to-slate-800 shadow-lg"
        style={{
          width: 8,
          height: height - 60,
        }}
      />

      {/* Upper Support */}
      <div
        className="absolute left-1/2 -translate-x-1/2 w-5 h-5 rounded-full bg-slate-300 border border-slate-500"
        style={{
          top: 8,
        }}
      />

      {/* Clamp */}
      {showClamp && (
        <>
          {/* Clamp Arm */}
          <motion.div
            animate={{
              x: [0, 1.5, 0],
            }}
            transition={{
              repeat: Infinity,
              duration: 3,
            }}
            className="absolute left-1/2 bg-gradient-to-r from-slate-600 via-slate-400 to-slate-600 border border-slate-300 rounded-full shadow-md"
            style={{
              top: clampTop,
              width: 90,
              height: 8,
            }}
          />

          {/* Clamp Head */}
          <div
            className="absolute rounded-md border border-slate-300 bg-slate-500 shadow"
            style={{
              top: clampTop - 5,
              left: "calc(50% + 80px)",
              width: 14,
              height: 18,
            }}
          />

          {/* Clamp Screw */}
          <motion.div
            whileHover={{
              rotate: 180,
            }}
            className="absolute"
            style={{
              top: clampTop - 16,
              left: "calc(50% + 74px)",
            }}
          >
            <Wrench
              size={14}
              className="text-slate-300"
            />
          </motion.div>
        </>
      )}

      {/* Equipment Holder */}
      <div
        className="absolute flex flex-col items-center"
        style={{
          top: clampTop + 18,
          left: "calc(50% + 58px)",
        }}
      >
        {children}
      </div>

      {/* Base Reflection */}
      <div className="absolute bottom-1 w-40 h-1 rounded-full bg-white/10" />
    </motion.div>
  );
};

export default Stand;