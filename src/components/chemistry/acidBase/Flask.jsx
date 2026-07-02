import React from "react";
import { FlaskConical } from "lucide-react";

export default function Flask({
  acid = null,
  reaction = null,
  playing = false,
  size = "md",
}) {
  const color = reaction?.color || acid?.color || "#38bdf8";

  const level = acid ? 60 : 0;

  const bubbling = playing && reaction?.bubbles;

  const heating = playing && reaction?.heat;

  const sizes = {
    sm: {
      flask: "w-28 h-40",
      neck: "w-8 h-10",
    },
    md: {
      flask: "w-40 h-56",
      neck: "w-10 h-14",
    },
    lg: {
      flask: "w-52 h-72",
      neck: "w-12 h-16",
    },
  };

  const current = sizes[size] || sizes.md;

  return (
    <div className="flex flex-col items-center">

      {/* Label */}

      <div className="mb-4 text-center">

        <h3 className="font-bold text-white">
          {acid?.formula || "Flask"}
        </h3>

        <p className="text-xs text-slate-400">
          {acid?.name || "Empty Flask"}
        </p>

      </div>

      {/* Flask */}

      <div className="relative">

        {/* Neck */}

        <div
          className={`${current.neck} mx-auto rounded-t-lg border-x-2 border-t-2 border-slate-300 bg-white/5`}
        />

        {/* Body */}

        <div
          className={`${current.flask} relative rounded-b-[45%] border-2 border-slate-300 bg-white/5 overflow-hidden`}
        >

          {/* Liquid */}

          {acid && (
            <div
              className="absolute bottom-0 left-0 w-full transition-all duration-700"
              style={{
                height: `${level}%`,
                background: color,
              }}
            />
          )}

          {/* Glass Highlight */}

          <div className="absolute left-3 top-4 w-2 h-32 rounded-full bg-white/30" />

          {/* Bubble Animation */}

          {bubbling &&
            [...Array(10)].map((_, i) => (
              <span
                key={i}
                className="absolute rounded-full bg-white/70 animate-bounce"
                style={{
                  width: `${4 + Math.random() * 6}px`,
                  height: `${4 + Math.random() * 6}px`,
                  left: `${15 + Math.random() * 70}%`,
                  bottom: `${10 + Math.random() * 50}%`,
                  animationDelay: `${i * 0.15}s`,
                  animationDuration: `${1 + Math.random()}s`,
                }}
              />
            ))}

          {/* Heating Glow */}

          {heating && (
            <div className="absolute inset-0 animate-pulse bg-orange-500/20" />
          )}

        </div>

        {/* Icon */}

        <div className="absolute -right-8 top-8 text-cyan-400">
          <FlaskConical size={24} />
        </div>

      </div>

      {/* Footer */}

      {acid && (
        <div className="mt-4 text-center">

          <span
            className="inline-flex items-center rounded-full px-3 py-1 text-xs font-bold"
            style={{
              background: `${color}22`,
              color,
            }}
          >
            {acid.type}
          </span>

        </div>
      )}

    </div>
  );
}