import React from "react";
import { motion } from "framer-motion";

const Stirrer = ({
  running = false,
  speed = 1,
  label = "Magnetic Stirrer",
}) => {
  return (
    <div className="flex flex-col items-center">

      {/* Label */}
      <p className="mb-2 text-sm font-semibold text-slate-300">
        {label}
      </p>

      {/* Base */}
      <div className="relative w-52 h-28">

        {/* Machine Body */}
        <div className="absolute inset-0 rounded-2xl bg-gradient-to-b from-slate-700 to-slate-900 border border-slate-600 shadow-xl" />

        {/* Top Plate */}
        <div className="absolute left-4 right-4 top-4 h-12 rounded-xl bg-slate-800 border border-slate-500">

          {/* Rotating Magnetic Plate */}
          <motion.div
            animate={{
              rotate: running ? 360 : 0,
            }}
            transition={{
              repeat: running ? Infinity : 0,
              duration: Math.max(0.3, 2 / speed),
              ease: "linear",
            }}
            className="absolute left-1/2 top-1/2 w-8 h-8 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-cyan-400"
          >
            <div className="absolute left-1/2 top-0 w-[2px] h-full bg-cyan-400 -translate-x-1/2" />
            <div className="absolute top-1/2 left-0 h-[2px] w-full bg-cyan-400 -translate-y-1/2" />
          </motion.div>

        </div>

        {/* Power LED */}
        <div
          className={`absolute left-5 bottom-4 w-3 h-3 rounded-full ${
            running ? "bg-green-400 shadow-lg shadow-green-400/60" : "bg-red-500"
          }`}
        />

        {/* Speed Knob */}
        <div className="absolute right-6 bottom-3">

          <div className="relative w-8 h-8 rounded-full bg-slate-500 border border-slate-300">

            <motion.div
              animate={{
                rotate: running ? speed * 45 : 0,
              }}
              className="absolute left-1/2 top-1 w-[2px] h-3 bg-white origin-bottom -translate-x-1/2"
            />

          </div>

        </div>

        {/* Speed Text */}
        <div className="absolute left-1/2 bottom-2 -translate-x-1/2 text-xs text-slate-300">
          Speed × {speed.toFixed(1)}
        </div>

      </div>

      {/* Stir Bar */}
      <motion.div
        animate={{
          rotate: running ? 360 : 0,
        }}
        transition={{
          repeat: running ? Infinity : 0,
          duration: Math.max(0.3, 1.5 / speed),
          ease: "linear",
        }}
        className="mt-6 w-20 h-2 rounded-full bg-white shadow-md"
      />

    </div>
  );
};

export default Stirrer;