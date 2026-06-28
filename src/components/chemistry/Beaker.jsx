import React from "react";
import { Beaker as BeakerIcon } from "lucide-react";

export default function Beaker({
  x = 200,
  y = 250,
  width = 120,
  height = 150,
  liquidLevel = 60, // 0 - 100
  liquidColor = "#38bdf8",
  selected = false,
  label = "Beaker",
  draggable = false,
  onMouseDown,
}) {
  const fillHeight = (height - 20) * (liquidLevel / 100);

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
        <div className="absolute inset-0 rounded-3xl bg-cyan-400/20 blur-xl scale-110" />
      )}

      {/* Glass */}

      <svg
        viewBox="0 0 120 150"
        className="absolute inset-0 w-full h-full"
      >
        {/* Liquid */}

        <defs>
          <linearGradient
            id="beakerLiquid"
            x1="0"
            y1="0"
            x2="0"
            y2="1"
          >
            <stop offset="0%" stopColor="#ffffff66" />
            <stop offset="100%" stopColor={liquidColor} />
          </linearGradient>
        </defs>

        <rect
          x="15"
          y={130 - fillHeight}
          width="90"
          height={fillHeight}
          rx="8"
          fill="url(#beakerLiquid)"
          opacity="0.9"
        />

        {/* Surface */}

        <ellipse
          cx="60"
          cy={130 - fillHeight}
          rx="45"
          ry="4"
          fill="#ffffff55"
        />

        {/* Glass */}

        <path
          d="
          M20 10
          L20 130
          Q20 140 30 140
          L90 140
          Q100 140 100 130
          L100 10
        "
          fill="rgba(255,255,255,.05)"
          stroke={
            selected ? "#22d3ee" : "#cbd5e1"
          }
          strokeWidth="3"
        />

        {/* Rim */}

        <ellipse
          cx="60"
          cy="10"
          rx="42"
          ry="6"
          fill="none"
          stroke="#cbd5e1"
          strokeWidth="3"
        />

        {/* Shine */}

        <path
          d="M30 20 L30 120"
          stroke="#ffffff55"
          strokeWidth="3"
        />
      </svg>

      {/* Icon */}

      <div className="absolute -top-10 left-1/2 -translate-x-1/2">

        <div className="w-10 h-10 rounded-xl bg-slate-900 border border-cyan-500 flex items-center justify-center">
          <BeakerIcon
            size={18}
            className="text-cyan-400"
          />
        </div>

      </div>

      {/* Label */}

      <div className="absolute top-full mt-3 left-1/2 -translate-x-1/2 text-center">

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