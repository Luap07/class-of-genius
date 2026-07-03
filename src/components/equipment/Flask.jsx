// src/components/equipment/Flask.jsx

import React from "react";
import { motion } from "framer-motion";
import { FlaskConical } from "lucide-react";

const Flask = ({
  volume = 25,
  maxVolume = 250,
  liquidColor = "#38bdf8",
  label = "Conical Flask",
  bubbling = false,
  endpointReached = false,
}) => {
  const fillPercent = Math.max(
    0,
    Math.min((volume / maxVolume) * 100, 100)
  );

  const liquidHeight = (160 * fillPercent) / 100;
  const liquidY = 210 - liquidHeight;

  return (
    <div className="flex flex-col items-center select-none">

      {/* Header */}

      <div className="flex items-center gap-2 mb-4">

        <FlaskConical
          size={20}
          className="text-cyan-400"
        />

        <span className="font-semibold text-slate-200">
          {label}
        </span>

      </div>

      {/* Flask */}

      <div className="relative w-52 h-64">

        {endpointReached && (
          <motion.div
            animate={{
              opacity: [0.2, 0.6, 0.2],
            }}
            transition={{
              duration: 1,
              repeat: Infinity,
            }}
            className="absolute inset-0 rounded-full bg-pink-500 blur-2xl"
          />
        )}

        <svg
          viewBox="0 0 220 260"
          className="absolute inset-0 w-full h-full"
        >
          <defs>

            <clipPath id="flaskClip">

              <path d="M92 12 L128 12 L128 75 C128 90 152 120 180 170 C195 200 188 246 110 248 C32 246 25 200 40 170 C68 120 92 90 92 75 Z" />

            </clipPath>

            <linearGradient
              id="flaskLiquid"
              x1="0"
              y1="0"
              x2="0"
              y2="1"
            >
              <stop
                offset="0%"
                stopColor="#ffffff88"
              />

              <stop
                offset="100%"
                stopColor={liquidColor}
              />

            </linearGradient>

          </defs>

          {/* Liquid */}

          <rect
            x="20"
            y={liquidY}
            width="180"
            height={liquidHeight}
            clipPath="url(#flaskClip)"
            fill="url(#flaskLiquid)"
            opacity="0.9"
          />

          {/* Surface */}

          <ellipse
            cx="110"
            cy={liquidY}
            rx="70"
            ry="5"
            fill="#ffffff55"
            clipPath="url(#flaskClip)"
          />

          {/* Glass */}

          <path
            d="M92 12 L128 12 L128 75 C128 90 152 120 180 170 C195 200 188 246 110 248 C32 246 25 200 40 170 C68 120 92 90 92 75 Z"
            fill="rgba(255,255,255,.05)"
            stroke="#CBD5E1"
            strokeWidth="4"
          />

          {/* Neck */}

          <rect
            x="92"
            y="5"
            width="36"
            height="12"
            rx="3"
            fill="#e2e8f0"
          />

          {/* Shine */}

          <path
            d="M70 55 C55 95 50 160 62 215"
            stroke="rgba(255,255,255,.35)"
            strokeWidth="6"
            strokeLinecap="round"
          />

        </svg>

        {/* Bubbles */}

        {bubbling &&
          Array.from({ length: 8 }).map((_, i) => (
            <motion.div
              key={i}
              className="absolute rounded-full bg-white/70"
              style={{
                width: 5 + Math.random() * 6,
                height: 5 + Math.random() * 6,
                left: 75 + Math.random() * 60,
                bottom: 25 + Math.random() * 50,
              }}
              animate={{
                y: [-5, -90],
                opacity: [0, 1, 0],
              }}
              transition={{
                duration: 1.4 + Math.random(),
                repeat: Infinity,
                delay: Math.random(),
              }}
            />
          ))}

      </div>

      {/* Info */}

      <div className="mt-5 w-52 rounded-xl border border-slate-700 bg-slate-900 p-4">

        <div className="flex justify-between mb-2">

          <span className="text-slate-400">
            Volume
          </span>

          <span className="text-cyan-400 font-semibold">
            {volume.toFixed(1)} mL
          </span>

        </div>

        <div className="flex justify-between mb-3">

          <span className="text-slate-400">
            Fill Level
          </span>

          <span>
            {fillPercent.toFixed(0)}%
          </span>

        </div>

        <div className="h-2 rounded-full overflow-hidden bg-slate-800">

          <div
            className="h-full bg-cyan-400 transition-all duration-300"
            style={{
              width: `${fillPercent}%`,
            }}
          />

        </div>

        {endpointReached && (

          <div className="mt-4 rounded-lg bg-pink-500/20 border border-pink-500/30 text-center py-2 text-pink-300 font-semibold">

            Endpoint Reached

          </div>

        )}

      </div>

    </div>
  );
};

export default Flask;