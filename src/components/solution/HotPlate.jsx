// src/components/equipment/HotPlate.jsx

import React from "react";
import { motion } from "framer-motion";
import { Flame } from "lucide-react";

const HotPlate = ({
  power = false,
  temperature = 25,
  heating = false,
  label = "Hot Plate",
}) => {
  const heat =
    temperature <= 25
      ? "Cold"
      : temperature < 60
      ? "Warm"
      : temperature < 120
      ? "Hot"
      : "Very Hot";

  const glowColor =
    temperature < 60
      ? "#22c55e"
      : temperature < 120
      ? "#f59e0b"
      : "#ef4444";

  return (
    <div className="flex flex-col items-center">

      {/* Label */}
      <h3 className="mb-3 text-sm font-semibold text-slate-300">
        {label}
      </h3>

      {/* Machine */}
      <div className="relative w-56 h-36">

        {/* Body */}
        <div className="absolute inset-0 rounded-2xl bg-gradient-to-b from-slate-700 to-slate-900 border border-slate-600 shadow-2xl" />

        {/* Heating Plate */}
        <motion.div
          animate={{
            boxShadow: power
              ? `0 0 25px ${glowColor}`
              : "0 0 0px transparent",
          }}
          className="absolute left-6 right-6 top-5 h-16 rounded-xl bg-slate-800 border border-slate-500 flex items-center justify-center"
        >
          <motion.div
            animate={{
              scale: heating ? [1, 1.05, 1] : 1,
            }}
            transition={{
              repeat: heating ? Infinity : 0,
              duration: 1,
            }}
            className="w-20 h-20 rounded-full border-2 border-slate-500"
            style={{
              background: power
                ? `radial-gradient(circle, ${glowColor}55 0%, transparent 70%)`
                : "transparent",
            }}
          />
        </motion.div>

        {/* Temperature Display */}
        <div className="absolute left-4 bottom-4 text-sm font-bold text-cyan-300">
          {temperature}°C
        </div>

        {/* Heat Status */}
        <div className="absolute right-4 bottom-4 text-xs text-slate-300">
          {heat}
        </div>

        {/* Power LED */}
        <div
          className={`absolute left-4 top-4 w-3 h-3 rounded-full ${
            power
              ? "bg-green-400 shadow-lg shadow-green-500/60"
              : "bg-red-500"
          }`}
        />

        {/* Temperature Knob */}
        <motion.div
          animate={{
            rotate: (temperature / 200) * 270,
          }}
          transition={{ duration: 0.4 }}
          className="absolute right-5 top-6 w-10 h-10 rounded-full bg-slate-500 border border-slate-300"
        >
          <div className="absolute left-1/2 top-1 w-[2px] h-4 bg-white -translate-x-1/2 origin-bottom" />
        </motion.div>

        {/* Flame */}
        {heating && (
          <motion.div
            animate={{
              scale: [1, 1.15, 1],
              opacity: [0.7, 1, 0.7],
            }}
            transition={{
              repeat: Infinity,
              duration: 0.8,
            }}
            className="absolute left-1/2 -translate-x-1/2 -top-8"
          >
            <Flame
              size={28}
              className="text-orange-500"
            />
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default HotPlate;