import React from "react";
import { FlaskConical } from "lucide-react";

export default function Flask({
  x = 250,
  y = 250,
  width = 140,
  height = 180,
  liquidLevel = 45, // 0 - 100
  liquidColor = "#22d3ee",
  selected = false,
  label = "Erlenmeyer Flask",
  draggable = false,
  onMouseDown,
}) {
  const bodyHeight = 120;
  const fillHeight = (bodyHeight * liquidLevel) / 100;

  return (
    <div
      className={`absolute transition-all duration-300 ${
        draggable ? "cursor-grab active:cursor-grabbing" : ""
      }`}
      style={{
        left: x,
        top: y,
        width,
        height,
        transform: "translate(-50%, -50%)",
      }}
      onMouseDown={onMouseDown}
    >
      {/* Glow */}

      {selected && (
        <div className="absolute inset-0 rounded-full bg-cyan-400/25 blur-2xl scale-110" />
      )}

      <svg
        viewBox="0 0 140 180"
        className="absolute inset-0 w-full h-full"
      >
        <defs>
          <linearGradient
            id="flaskLiquid"
            x1="0"
            y1="0"
            x2="0"
            y2="1"
          >
            <stop offset="0%" stopColor="#ffffff88" />
            <stop offset="100%" stopColor={liquidColor} />
          </linearGradient>
        </defs>

        {/* ================= Liquid ================= */}

        <path
          d={`
            M40 ${155 - fillHeight}
            L100 ${155 - fillHeight}
            L118 155
            Q70 172 22 155
            Z
          `}
          fill="url(#flaskLiquid)"
          opacity="0.9"
        />

        {/* Liquid Surface */}

        <ellipse
          cx="70"
          cy={155 - fillHeight}
          rx="30"
          ry="5"
          fill="#ffffff55"
        />

        {/* ================= Flask ================= */}

        <path
          d="
            M60 10
            L60 45
            L22 155
            Q70 172 118 155
            L80 45
            L80 10
          "
          fill="rgba(255,255,255,.05)"
          stroke={selected ? "#22d3ee" : "#d1d5db"}
          strokeWidth="3"
          strokeLinejoin="round"
        />

        {/* Neck */}

        <rect
          x="60"
          y="5"
          width="20"
          height="12"
          rx="2"
          fill="#e2e8f0"
        />

        {/* Shine */}

        <path
          d="M48 40 L35 145"
          stroke="#ffffff66"
          strokeWidth="3"
          strokeLinecap="round"
        />

        {/* Measurement Marks */}

        {[70, 90, 110, 130].map((y) => (
          <line
            key={y}
            x1="95"
            y1={y}
            x2="103"
            y2={y}
            stroke="#94a3b8"
            strokeWidth="2"
          />
        ))}
      </svg>

      {/* Floating Icon */}

      <div className="absolute -top-10 left-1/2 -translate-x-1/2">
        <div className="w-10 h-10 rounded-xl bg-slate-900 border border-cyan-500 flex items-center justify-center shadow-lg">
          <FlaskConical
            size={18}
            className="text-cyan-400"
          />
        </div>
      </div>

      {/* Label */}

      <div className="absolute top-full mt-3 left-1/2 -translate-x-1/2 text-center whitespace-nowrap">

        <div className="font-bold text-white">
          {label}
        </div>

        <div className="text-xs text-slate-400">
          {liquidLevel}% Full
        </div>

      </div>
    </div>
  );
}