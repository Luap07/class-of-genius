import React from "react";
import { Pipette } from "lucide-react";

export default function Dropper({
  x = 220,
  y = 120,
  angle = -20,
  liquidColor = "#38bdf8",
  dropping = false,
  label = "Dropper",
  draggable = false,
  selected = false,
  onMouseDown,
  onClick,
}) {
  return (
    <div
      onMouseDown={onMouseDown}
      onClick={onClick}
      className={`absolute transition-all duration-300 ${
        draggable ? "cursor-grab active:cursor-grabbing" : ""
      }`}
      style={{
        left: x,
        top: y,
        transform: `translate(-50%, -50%) rotate(${angle}deg)`,
      }}
    >
      {/* Glow */}

      {selected && (
        <div className="absolute inset-0 bg-cyan-400/30 blur-xl rounded-full scale-125" />
      )}

      <svg width="180" height="90">

        {/* Rubber Bulb */}

        <ellipse
          cx="28"
          cy="45"
          rx="18"
          ry="20"
          fill="#3b82f6"
        />

        {/* Glass Tube */}

        <rect
          x="38"
          y="40"
          width="105"
          height="10"
          rx="5"
          fill="#e2e8f0"
          opacity="0.85"
        />

        {/* Liquid */}

        <rect
          x="38"
          y="42"
          width="65"
          height="6"
          rx="3"
          fill={liquidColor}
        />

        {/* Tip */}

        <polygon
          points="143,45 172,42 172,48"
          fill="#d1d5db"
        />

        {/* Shine */}

        <line
          x1="45"
          y1="43"
          x2="130"
          y2="43"
          stroke="#ffffff"
          strokeWidth="1"
          opacity="0.8"
        />

        {/* Falling Drop */}

        {dropping && (
          <>
            <circle
              cx="173"
              cy="58"
              r="4"
              fill={liquidColor}
            >
              <animate
                attributeName="cy"
                values="58;85;58"
                dur="0.9s"
                repeatCount="indefinite"
              />
            </circle>

            <circle
              cx="173"
              cy="72"
              r="2"
              fill={liquidColor}
              opacity=".6"
            >
              <animate
                attributeName="cy"
                values="72;92;72"
                dur="0.9s"
                repeatCount="indefinite"
              />
            </circle>
          </>
        )}

      </svg>

      {/* Icon */}

      <div className="absolute -top-12 left-1/2 -translate-x-1/2">
        <div className="w-10 h-10 rounded-xl bg-slate-900 border border-cyan-500 flex items-center justify-center shadow-lg">
          <Pipette
            size={18}
            className="text-cyan-400"
          />
        </div>
      </div>

      {/* Label */}

      <div className="absolute top-full mt-3 left-1/2 -translate-x-1/2 whitespace-nowrap text-center">

        <div className="font-semibold text-white">
          {label}
        </div>

        <div className="text-xs text-slate-400">
          {dropping ? "Dispensing" : "Ready"}
        </div>

      </div>

    </div>
  );
}