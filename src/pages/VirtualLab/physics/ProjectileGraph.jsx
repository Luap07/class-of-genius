import React, { useMemo } from "react";

export default function ProjectileGraph({ data = [], type }) {
  const enriched = useMemo(() => {
    return data.map((p) => ({
      ...p,
      speed: Math.sqrt((p.velocityX || 0) ** 2 + (p.velocityY || 0) ** 2),
    }));
  }, [data]);

  return (
    <div className="relative w-full h-40 bg-slate-950 rounded-lg overflow-hidden border border-slate-800">
      {enriched.map((p, i) => {
        let x = 0, y = 0;
        if (type === "trajectory") { x = p.x * 4; y = p.y * 4; }
        else if (type === "height") { x = p.time * 35; y = p.y * 4; }
        else if (type === "velocity") { x = p.time * 35; y = p.speed * 3; }

        return (
          <div
            key={i}
            className={`absolute w-1.5 h-1.5 rounded-full ${
              type === "trajectory" ? "bg-yellow-400" : 
              type === "height" ? "bg-cyan-400" : "bg-green-400"
            }`}
            style={{ left: `${x}px`, bottom: `${y}px` }}
          />
        );
      })}
      <div className="absolute bottom-0 w-full h-[2px] bg-slate-700" />
    </div>
  );
}