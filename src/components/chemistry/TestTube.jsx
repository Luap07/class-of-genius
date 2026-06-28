import React from "react";
import { TestTube2 } from "lucide-react";

export default function TestTube({
  x = 200,
  y = 220,
  width = 60,
  height = 180,
  liquidLevel = 45, // 0 - 100
  liquidColor = "#38bdf8",
  selected = false,
  label = "Test Tube",
  draggable = false,
  onMouseDown,
}) {
  const innerHeight = height - 20;
  const fillHeight = (innerHeight * liquidLevel) / 100;

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
        <div className="absolute inset-0 rounded-full bg-cyan-400/25 blur-xl scale-110" />
      )}

      {/* Tube */}

      <svg
        viewBox="0 0 60 180"
        className="absolute inset-0 w-full h-full"
      >
        <defs>
          <linearGradient
            id="tubeLiquid"
            x1="0"
            y1="0"
            x2="0"
            y2="1"
          >
            <stop offset="0%" stopColor="#ffffff66" />
            <stop offset="100%" stopColor={liquidColor} />
          </linearGradient>
        </defs>

        {/* Liquid */}

        <path
          d={`
            M15 ${165 - fillHeight}
            L15 150
            A15 15 0 0 0 45 150
            L45 ${165 - fillHeight}
            Z
          `}
          fill="url(#tubeLiquid)"
          opacity="0.92"
        />

        {/* Liquid Surface */}

        <ellipse
          cx="30"
          cy={165 - fillHeight}
          rx="14"
          ry="3"
          fill="#ffffff66"
        />

        {/* Glass */}

        <path
          d="
            M15 10
            L15 150
            A15 15 0 0 0 45 150
            L45 10
          "
          fill="rgba(255,255,255,.05)"
          stroke={selected ? "#22d3ee" : "#cbd5e1"}
          strokeWidth="3"
        />

        {/* Rim */}

        <ellipse
          cx="30"
          cy="10"
          rx="17"
          ry="5"
          fill="none"
          stroke="#cbd5e1"
          strokeWidth="3"
        />

        {/* Reflection */}

        <line
          x1="22"
          y1="18"
          x2="22"
          y2="145"
          stroke="#ffffff55"
          strokeWidth="2.5"
        />
      </svg>

      {/* Floating Icon */}

      <div className="absolute -top-11 left-1/2 -translate-x-1/2">
        <div className="w-10 h-10 rounded-xl bg-slate-900 border border-cyan-500 flex items-center justify-center shadow-lg">
          <TestTube2
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