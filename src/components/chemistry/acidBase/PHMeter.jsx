// src/components/chemistry/acidBase/PHMeter.jsx

import React from "react";
import { motion } from "framer-motion";
import { Gauge } from "lucide-react";

export default function PHMeter({ ph = 7 }) {
  const percentage = (ph / 14) * 100;

  const getStatus = () => {
    if (ph < 7) return "Acidic";
    if (ph > 7) return "Basic";
    return "Neutral";
  };

  const getColor = () => {
    if (ph <= 2) return "#dc2626";
    if (ph <= 4) return "#ea580c";
    if (ph <= 6) return "#facc15";
    if (ph === 7) return "#22c55e";
    if (ph <= 10) return "#38bdf8";
    if (ph <= 12) return "#2563eb";
    return "#7c3aed";
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6">

      {/* Header */}

      <div className="flex items-center gap-3 mb-6">

        <div className="w-12 h-12 rounded-xl bg-cyan-500/20 flex items-center justify-center">
          <Gauge
            className="text-cyan-400"
            size={24}
          />
        </div>

        <div>

          <h2 className="text-xl font-bold text-white">
            Digital pH Meter
          </h2>

          <p className="text-sm text-slate-400">
            Live Solution Reading
          </p>

        </div>

      </div>

      {/* Value */}

      <motion.div
        key={ph}
        initial={{
          scale: 0.8,
          opacity: 0,
        }}
        animate={{
          scale: 1,
          opacity: 1,
        }}
        transition={{
          duration: 0.35,
        }}
        className="text-center"
      >

        <h1
          className="text-6xl font-black"
          style={{
            color: getColor(),
          }}
        >
          {ph.toFixed(1)}
        </h1>

        <div className="mt-3">

          <span
            className="px-4 py-1 rounded-full font-bold"
            style={{
              backgroundColor: `${getColor()}22`,
              color: getColor(),
            }}
          >
            {getStatus()}
          </span>

        </div>

      </motion.div>

      {/* Gradient Scale */}

      <div className="mt-8">

        <div className="relative h-5 rounded-full overflow-hidden">

          <div
            className="absolute inset-0"
            style={{
              background:
                "linear-gradient(90deg,#dc2626,#ea580c,#facc15,#22c55e,#38bdf8,#2563eb,#7c3aed)",
            }}
          />

          <motion.div
            animate={{
              left: `calc(${percentage}% - 10px)`,
            }}
            transition={{
              duration: 0.5,
            }}
            className="absolute top-1/2 w-5 h-5 rounded-full border-4 border-white shadow-xl"
            style={{
              background: getColor(),
              transform: "translateY(-50%)",
            }}
          />

        </div>

        <div className="flex justify-between text-xs text-slate-500 mt-2">

          <span>0</span>
          <span>2</span>
          <span>4</span>
          <span>6</span>
          <span>7</span>
          <span>8</span>
          <span>10</span>
          <span>12</span>
          <span>14</span>

        </div>

      </div>

      {/* Categories */}

      <div className="grid grid-cols-3 gap-3 mt-8">

        <div
          className={`rounded-xl p-3 text-center transition ${
            ph < 7
              ? "bg-red-500/20 border border-red-500"
              : "bg-slate-800"
          }`}
        >
          <p className="font-bold text-red-400">
            Acid
          </p>
        </div>

        <div
          className={`rounded-xl p-3 text-center transition ${
            ph === 7
              ? "bg-green-500/20 border border-green-500"
              : "bg-slate-800"
          }`}
        >
          <p className="font-bold text-green-400">
            Neutral
          </p>
        </div>

        <div
          className={`rounded-xl p-3 text-center transition ${
            ph > 7
              ? "bg-blue-500/20 border border-blue-500"
              : "bg-slate-800"
          }`}
        >
          <p className="font-bold text-blue-400">
            Base
          </p>
        </div>

      </div>

    </div>
  );
}