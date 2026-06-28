import React from "react";
import { Thermometer } from "lucide-react";

export default function ThermometerComponent({
  x = 650,
  y = 220,
  temperature = 25,
  min = 0,
  max = 200,
  selected = false,
  draggable = false,
  onMouseDown,
  onClick,
}) {
  const clamped = Math.min(max, Math.max(min, temperature));

  const percent = ((clamped - min) / (max - min)) * 100;

  const liquidHeight = 150 * (percent / 100);

  const getColor = () => {
    if (temperature < 20) return "#38bdf8";
    if (temperature < 60) return "#22c55e";
    if (temperature < 100) return "#facc15";
    if (temperature < 160) return "#fb923c";
    return "#ef4444";
  };

  return (
    <div
      onMouseDown={onMouseDown}
      onClick={onClick}
      className={`absolute transition-all duration-300 ${
        draggable
          ? "cursor-grab active:cursor-grabbing"
          : ""
      }`}
      style={{
        left: x,
        top: y,
        transform: "translate(-50%, -50%)",
      }}
    >
      {/* Glow */}

      {selected && (
        <div className="absolute inset-0 rounded-full bg-cyan-400/30 blur-2xl scale-125" />
      )}

      <svg width="90" height="260">

        {/* Glass */}

        <rect
          x="37"
          y="20"
          width="16"
          height="170"
          rx="8"
          fill="#ffffff15"
          stroke="#d1d5db"
          strokeWidth="3"
        />

        {/* Liquid */}

        <rect
          x="40"
          y={190 - liquidHeight}
          width="10"
          height={liquidHeight}
          rx="5"
          fill={getColor()}
        >
          <animate
            attributeName="height"
            dur=".4s"
            to={liquidHeight}
            fill="freeze"
          />
        </rect>

        {/* Bulb */}

        <circle
          cx="45"
          cy="205"
          r="18"
          fill={getColor()}
          stroke="#d1d5db"
          strokeWidth="3"
        />

        {/* Shine */}

        <rect
          x="42"
          y="28"
          width="3"
          height="150"
          rx="2"
          fill="#ffffff88"
        />

        {/* Tick Marks */}

        {Array.from({ length: 11 }).map((_, i) => (
          <line
            key={i}
            x1="54"
            x2="64"
            y1={20 + i * 17}
            y2={20 + i * 17}
            stroke="#94a3b8"
            strokeWidth="2"
          />
        ))}

      </svg>

      {/* Floating Icon */}

      <div className="absolute -top-12 left-1/2 -translate-x-1/2">

        <div className="w-10 h-10 rounded-xl bg-slate-900 border border-red-500 flex items-center justify-center shadow-lg">

          <Thermometer
            size={18}
            className="text-red-400"
          />

        </div>

      </div>

      {/* Temperature Card */}

      <div className="absolute top-full mt-3 left-1/2 -translate-x-1/2">

        <div className="rounded-xl bg-slate-900 border border-slate-700 px-4 py-2 text-center shadow-lg">

          <div className="text-xl font-bold text-white">
            {temperature}°C
          </div>

          <div className="text-xs text-slate-400">
            Temperature
          </div>

        </div>

      </div>
    </div>
  );
}