import React from "react";
import { Flame } from "lucide-react";

export default function Burner({
  x = 250,
  y = 420,
  scale = 1,
  flame = false,
  flameColor = "#38bdf8",
  intensity = 1,
  label = "Bunsen Burner",
  onClick,
}) {
  const flameHeight = 80 * intensity;

  return (
    <div
      onClick={onClick}
      className="absolute cursor-pointer select-none transition-transform hover:scale-105"
      style={{
        left: x,
        top: y,
        transform: `translate(-50%, -50%) scale(${scale})`,
      }}
    >
      {/* Glow */}

      {flame && (
        <div
          className="absolute left-1/2 -translate-x-1/2 rounded-full blur-2xl opacity-50"
          style={{
            width: 80,
            height: 80,
            background: flameColor,
            top: -90,
          }}
        />
      )}

      <svg width="120" height="220">

        {/* ========= Flame ========= */}

        {flame && (
          <>
            {/* Outer */}

            <path
              d={`
                M60 ${110 - flameHeight}
                C95 ${90 - flameHeight}
                95 65
                60 30
                C25 65
                25 ${90 - flameHeight}
                60 ${110 - flameHeight}
              `}
              fill={flameColor}
              opacity=".35"
            >
              <animate
                attributeName="d"
                dur="0.6s"
                repeatCount="indefinite"
                values={`
                M60 ${110 - flameHeight}
                C95 ${90 - flameHeight}
                95 65
                60 30
                C25 65
                25 ${90 - flameHeight}
                60 ${110 - flameHeight};

                M60 ${100 - flameHeight}
                C90 ${80 - flameHeight}
                90 60
                60 20
                C30 60
                30 ${80 - flameHeight}
                60 ${100 - flameHeight};

                M60 ${110 - flameHeight}
                C95 ${90 - flameHeight}
                95 65
                60 30
                C25 65
                25 ${90 - flameHeight}
                60 ${110 - flameHeight}
                `}
              />
            </path>

            {/* Inner */}

            <path
              d={`
                M60 ${105 - flameHeight}
                C80 ${90 - flameHeight}
                80 70
                60 48
                C40 70
                40 ${90 - flameHeight}
                60 ${105 - flameHeight}
              `}
              fill="#ffffff"
              opacity=".85"
            />
          </>
        )}

        {/* ========= Pipe ========= */}

        <rect
          x="54"
          y="65"
          width="12"
          height="95"
          rx="5"
          fill="#9ca3af"
        />

        {/* Air Hole */}

        <circle
          cx="60"
          cy="115"
          r="4"
          fill="#1e293b"
        />

        {/* Base */}

        <ellipse
          cx="60"
          cy="180"
          rx="38"
          ry="12"
          fill="#475569"
        />

        <rect
          x="30"
          y="160"
          width="60"
          height="25"
          rx="8"
          fill="#64748b"
        />

        <ellipse
          cx="60"
          cy="160"
          rx="30"
          ry="8"
          fill="#94a3b8"
        />

      </svg>

      {/* Icon */}

      <div className="absolute -top-10 left-1/2 -translate-x-1/2">

        <div className="w-10 h-10 rounded-xl bg-slate-900 border border-orange-500 flex items-center justify-center">

          <Flame
            size={18}
            className="text-orange-400"
          />

        </div>

      </div>

      {/* Label */}

      <div className="text-center mt-2">

        <div className="text-white font-semibold">
          {label}
        </div>

        <div className="text-xs text-slate-400">
          {flame ? "Heating" : "Off"}
        </div>

      </div>

    </div>
  );
}