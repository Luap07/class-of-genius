import React from "react";
import ElectronShells from "./ElectronShells";

export default function AtomCanvas({
  protons,
  neutrons,
  electrons,
  element,
}) {
  const atomicNumber = protons;
  const massNumber = protons + neutrons;
  const charge = protons - electrons;

  const chargeColor =
    charge === 0
      ? "text-green-400"
      : charge > 0
      ? "text-red-400"
      : "text-blue-400";

  const chargeText =
    charge === 0
      ? "Neutral"
      : charge > 0
      ? `+${charge}`
      : `${charge}`;

  return (
    <div className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-slate-900 to-slate-950 rounded-3xl border border-slate-700 shadow-2xl">

      {/* Background Glow */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(6,182,212,0.08),transparent_70%)]" />

      {/* Floating Particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {Array.from({ length: 30 }).map((_, i) => (
          <span
            key={i}
            className="absolute rounded-full bg-cyan-400/40 animate-pulse"
            style={{
              width: `${2 + Math.random() * 4}px`,
              height: `${2 + Math.random() * 4}px`,
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 5}s`,
              animationDuration: `${2 + Math.random() * 4}s`,
            }}
          />
        ))}
      </div>

      <div className="relative p-8">

        {/* Header */}
        <div className="flex items-center justify-between mb-8">

          <div>
            <h2 className="text-3xl font-bold text-white">
              {element?.name || "Unknown Element"}
            </h2>

            <p className="text-cyan-400 text-lg">
              {element?.symbol || "--"}
            </p>
          </div>

          <div className="text-right">

            <div className="text-sm text-slate-400">
              Atomic Number
            </div>

            <div className="text-4xl font-bold text-cyan-400">
              {atomicNumber}
            </div>

          </div>

        </div>

        {/* Atom */}

        <div className="relative flex items-center justify-center w-full">

          <div className="relative w-[520px] h-[520px]">

            {/* Electron Shells */}

            <ElectronShells
              electrons={electrons}
            />

            {/* Nucleus Glow */}

            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">

              <div className="absolute inset-0 rounded-full bg-cyan-500 blur-3xl opacity-40 animate-pulse scale-150" />

              <div className="relative w-40 h-40 rounded-full bg-gradient-to-br from-cyan-500 via-blue-600 to-indigo-700 border-4 border-cyan-300 shadow-[0_0_70px_rgba(34,211,238,0.5)] flex flex-col items-center justify-center">

                <div className="text-5xl font-black">
                  {element?.symbol || "?"}
                </div>

                <div className="text-sm mt-2">
                  {element?.name}
                </div>

              </div>

            </div>

          </div>

        </div>

        {/* Stats */}

        <div className="grid md:grid-cols-4 gap-4 mt-8">

          <div className="bg-slate-800/60 rounded-2xl border border-slate-700 p-5">

            <p className="text-slate-400 text-sm">
              Protons
            </p>

            <h2 className="text-3xl font-bold text-red-400 mt-2">
              {protons}
            </h2>

          </div>

          <div className="bg-slate-800/60 rounded-2xl border border-slate-700 p-5">

            <p className="text-slate-400 text-sm">
              Neutrons
            </p>

            <h2 className="text-3xl font-bold text-gray-200 mt-2">
              {neutrons}
            </h2>

          </div>

          <div className="bg-slate-800/60 rounded-2xl border border-slate-700 p-5">

            <p className="text-slate-400 text-sm">
              Electrons
            </p>

            <h2 className="text-3xl font-bold text-cyan-400 mt-2">
              {electrons}
            </h2>

          </div>

          <div className="bg-slate-800/60 rounded-2xl border border-slate-700 p-5">

            <p className="text-slate-400 text-sm">
              Charge
            </p>

            <h2 className={`text-3xl font-bold mt-2 ${chargeColor}`}>
              {chargeText}
            </h2>

          </div>

        </div>

        {/* Bottom Information */}

        <div className="grid md:grid-cols-3 gap-4 mt-8">

          <div className="bg-slate-800/60 rounded-2xl border border-slate-700 p-5">

            <p className="text-slate-400 text-sm">
              Mass Number
            </p>

            <h2 className="text-2xl font-bold mt-2">
              {massNumber}
            </h2>

          </div>

          <div className="bg-slate-800/60 rounded-2xl border border-slate-700 p-5">

            <p className="text-slate-400 text-sm">
              Category
            </p>

            <h2 className="text-xl capitalize mt-2 text-cyan-400">
              {element?.category || "--"}
            </h2>

          </div>

          <div className="bg-slate-800/60 rounded-2xl border border-slate-700 p-5">

            <p className="text-slate-400 text-sm">
              Electron Configuration
            </p>

            <h2 className="text-sm mt-2 font-mono text-green-400 break-words">
              {element?.config || "--"}
            </h2>

          </div>

        </div>

      </div>
    </div>
  );
}