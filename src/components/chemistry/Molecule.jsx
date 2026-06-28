import React from "react";

const COLORS = {
  H: "#ffffff",
  O: "#ef4444",
  C: "#111827",
  N: "#2563eb",
  Cl: "#22c55e",
  Na: "#a855f7",
  K: "#8b5cf6",
  Ca: "#64748b",
  Mg: "#94a3b8",
  S: "#facc15",
};

export default function Molecule({
  molecule,
  x = 0,
  y = 0,
  scale = 1,
  draggable = false,
  selected = false,
  onMouseDown,
  onClick,
}) {
  if (!molecule) return null;

  const atoms = molecule.atoms || [];

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
        transform: `translate(-50%, -50%) scale(${scale})`,
      }}
    >
      {/* Glow */}

      {selected && (
        <div className="absolute inset-0 rounded-full bg-cyan-400/30 blur-xl scale-150" />
      )}

      <svg
        width="180"
        height="180"
        style={{
          overflow: "visible",
        }}
      >
        {/* ================= Bonds ================= */}

        {atoms.map((atom, i) =>
          atom.connections?.map((target) => {
            const other = atoms[target];

            if (!other) return null;

            if (target < i) return null;

            return (
              <line
                key={`${i}-${target}`}
                x1={atom.x}
                y1={atom.y}
                x2={other.x}
                y2={other.y}
                stroke="#cbd5e1"
                strokeWidth="5"
                strokeLinecap="round"
              />
            );
          })
        )}

        {/* ================= Atoms ================= */}

        {atoms.map((atom, index) => (
          <g key={index}>

            {/* Glow */}

            <circle
              cx={atom.x}
              cy={atom.y}
              r={atom.radius + 6}
              fill={COLORS[atom.symbol] || "#38bdf8"}
              opacity="0.18"
            />

            {/* Atom */}

            <circle
              cx={atom.x}
              cy={atom.y}
              r={atom.radius}
              fill={COLORS[atom.symbol] || "#38bdf8"}
              stroke="#ffffff"
              strokeWidth="2"
            />

            {/* Reflection */}

            <circle
              cx={atom.x - atom.radius / 3}
              cy={atom.y - atom.radius / 3}
              r={atom.radius / 4}
              fill="#ffffff88"
            />

            {/* Symbol */}

            <text
              x={atom.x}
              y={atom.y + 5}
              textAnchor="middle"
              fontSize="14"
              fontWeight="bold"
              fill={
                atom.symbol === "C"
                  ? "#ffffff"
                  : "#111827"
              }
            >
              {atom.symbol}
            </text>

          </g>
        ))}
      </svg>

      {/* ================= Formula ================= */}

      <div className="absolute top-full mt-3 left-1/2 -translate-x-1/2 whitespace-nowrap text-center">

        <div className="font-bold text-white text-lg">
          {molecule.formula}
        </div>

        <div className="text-xs text-slate-400">
          {molecule.name}
        </div>

      </div>
    </div>
  );
}