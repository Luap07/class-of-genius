import React, { useMemo } from "react";

export default function EnergyGraph({ data = [] }) {
  const safe = Array.isArray(data) ? data : [];

  const max = useMemo(() => {
    return Math.max(...safe.map((d) => d.total || 1), 1);
  }, [safe]);

  return (
    <div className="w-full h-64 bg-slate-950 rounded-xl border border-slate-800 p-3 relative overflow-hidden">
      <h3 className="text-xs text-slate-400 mb-2">
        Energy Over Time
      </h3>

      {safe.map((d, i) => {
        const x = i * 3;
        const y = (d.total / max) * 200;

        return (
          <div
            key={i}
            className="absolute w-1 h-1 bg-purple-400 rounded-full"
            style={{
              left: `${x}px`,
              bottom: `${y}px`,
            }}
          />
        );
      })}

      <div className="absolute bottom-0 w-full h-px bg-slate-700" />
    </div>
  );
}