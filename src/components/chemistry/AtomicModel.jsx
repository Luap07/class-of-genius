import React from "react";

const SHELL_NAMES = [
  "K",
  "L",
  "M",
  "N",
  "O",
  "P",
  "Q",
];

export default function AtomicModel({ element }) {
  if (!element) return null;

  const shells = element.shells || [2, 8, 1];

  const orbitColors = [
    "border-cyan-500/40",
    "border-blue-500/40",
    "border-indigo-500/40",
    "border-purple-500/40",
    "border-pink-500/40",
    "border-green-500/40",
    "border-yellow-500/40",
  ];

  return (
    <div className="flex justify-center py-10">
      <div className="relative w-[520px] h-[520px] flex items-center justify-center">

        {/* Background Glow */}
        <div className="absolute w-80 h-80 rounded-full bg-cyan-500/5 blur-3xl" />

        {/* Nucleus Glow */}
        <div className="absolute w-32 h-32 rounded-full bg-cyan-500/20 blur-2xl animate-pulse" />

        {/* Nucleus */}
        <div
          className="
            absolute
            z-30
            w-28
            h-28
            rounded-full
            bg-gradient-to-br
            from-cyan-400
            via-blue-500
            to-blue-700
            border
            border-cyan-200
            shadow-[0_0_50px_rgba(34,211,238,0.45)]
            flex
            flex-col
            items-center
            justify-center
            text-center
          "
        >
          <h2 className="text-3xl font-bold text-white">
            {element.symbol}
          </h2>

          <p className="text-xs text-cyan-100">
            Z = {element.number}
          </p>
        </div>

        {/* Electron Shells */}
        {shells.map((count, shellIndex) => {
          const size = 120 + shellIndex * 60;

          return (
            <div
              key={shellIndex}
              className="absolute flex items-center justify-center"
              style={{
                width: size,
                height: size,
              }}
            >
              {/* Orbit */}
              <div
                className={`
                  absolute
                  inset-0
                  rounded-full
                  border-2
                  ${orbitColors[shellIndex]}
                `}
              />

              {/* Shell Label */}
              <span
                className="
                  absolute
                  -top-6
                  left-1/2
                  -translate-x-1/2
                  text-xs
                  text-cyan-300
                "
              >
                {SHELL_NAMES[shellIndex]}
              </span>

              {/* Electrons */}
              <div
                className="absolute inset-0 animate-spin"
                style={{
                  animationDuration: `${18 + shellIndex * 6}s`,
                  animationTimingFunction: "linear",
                  animationIterationCount: "infinite",
                }}
              >
                {[...Array(count)].map((_, electronIndex) => {
                  const angle =
                    (360 / count) * electronIndex;

                  const radius = size / 2 - 10;

                  const x =
                    Math.cos((angle * Math.PI) / 180) *
                    radius;

                  const y =
                    Math.sin((angle * Math.PI) / 180) *
                    radius;

                  return (
                    <div
                      key={electronIndex}
                      className="
                        absolute
                        w-4
                        h-4
                        rounded-full
                        bg-cyan-300
                        border
                        border-white
                        shadow-[0_0_15px_rgba(103,232,249,0.9)]
                        animate-pulse
                      "
                      style={{
                        left: `calc(50% + ${x}px - 8px)`,
                        top: `calc(50% + ${y}px - 8px)`,
                      }}
                    />
                  );
                })}
              </div>
            </div>
          );
        })}

        {/* Information Card */}
        <div className="absolute bottom-0 translate-y-24 bg-slate-900 border border-slate-700 rounded-2xl px-6 py-4 shadow-xl">
          <h3 className="text-xl font-bold text-cyan-400">
            {element.name}
          </h3>

          <div className="grid grid-cols-2 gap-x-8 gap-y-2 mt-3 text-sm">
            <div>
              <span className="text-slate-400">Atomic No.</span>
              <p className="text-white font-semibold">
                {element.number}
              </p>
            </div>

            <div>
              <span className="text-slate-400">Mass</span>
              <p className="text-white font-semibold">
                {element.mass}
              </p>
            </div>

            <div>
              <span className="text-slate-400">Shells</span>
              <p className="text-white font-semibold">
                {shells.join(" • ")}
              </p>
            </div>

            <div>
              <span className="text-slate-400">Electrons</span>
              <p className="text-white font-semibold">
                {shells.reduce((a, b) => a + b, 0)}
              </p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}