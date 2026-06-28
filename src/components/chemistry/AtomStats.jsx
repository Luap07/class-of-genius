import React from "react";
import {
  Atom,
  Hash,
  Scale,
  Zap,
  Circle,
  Activity,
} from "lucide-react";

export default function AtomStats({
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

  const chargeBadge =
    charge === 0
      ? "Neutral Atom"
      : charge > 0
      ? "Positive Ion"
      : "Negative Ion";

  const stability =
    Math.abs(neutrons - protons) <= 2
      ? "Likely Stable"
      : "Unstable";

  return (
    <div className="bg-slate-900 rounded-3xl border border-slate-800 p-6 shadow-xl">

      {/* Header */}

      <div className="flex items-center gap-3 mb-6">

        <div className="h-14 w-14 rounded-2xl bg-cyan-500/15 flex items-center justify-center">
          <Atom className="text-cyan-400" size={28} />
        </div>

        <div>
          <h2 className="text-2xl font-bold">
            Atom Statistics
          </h2>

          <p className="text-slate-400 text-sm">
            Live Atomic Properties
          </p>
        </div>

      </div>

      {/* Element Card */}

      <div className="bg-slate-800 rounded-2xl p-5 mb-6">

        <div className="flex items-center justify-between">

          <div>

            <h3 className="text-2xl font-bold">
              {element?.name || "Unknown"}
            </h3>

            <p className="text-slate-400">
              {element?.category || "--"}
            </p>

          </div>

          <div className="h-16 w-16 rounded-2xl bg-cyan-500 flex items-center justify-center text-3xl font-bold text-white shadow-lg">
            {element?.symbol || "--"}
          </div>

        </div>

      </div>

      {/* Statistics */}

      <div className="space-y-4">

        <StatRow
          icon={<Hash size={18} />}
          label="Atomic Number"
          value={atomicNumber}
        />

        <StatRow
          icon={<Scale size={18} />}
          label="Mass Number"
          value={massNumber}
        />

        <StatRow
          icon={<Zap size={18} />}
          label="Charge"
          value={
            charge === 0
              ? "0"
              : charge > 0
              ? `+${charge}`
              : charge
          }
          color={chargeColor}
        />

        <StatRow
          icon={<Circle size={18} />}
          label="Protons"
          value={protons}
        />

        <StatRow
          icon={<Circle size={18} />}
          label="Neutrons"
          value={neutrons}
        />

        <StatRow
          icon={<Circle size={18} />}
          label="Electrons"
          value={electrons}
        />

      </div>

      {/* Charge Status */}

      <div className="mt-8">

        <div className="flex justify-between mb-2">

          <span className="text-slate-400">
            Charge Status
          </span>

          <span className={`font-bold ${chargeColor}`}>
            {chargeBadge}
          </span>

        </div>

        <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">

          <div
            className={`h-full transition-all duration-500 ${
              charge === 0
                ? "bg-green-400 w-full"
                : charge > 0
                ? "bg-red-400 w-3/4"
                : "bg-blue-400 w-3/4"
            }`}
          />

        </div>

      </div>

      {/* Stability */}

      <div className="mt-8 bg-slate-800 rounded-2xl p-4">

        <div className="flex items-center gap-3">

          <Activity
            className={
              stability === "Likely Stable"
                ? "text-green-400"
                : "text-yellow-400"
            }
          />

          <div>

            <p className="text-sm text-slate-400">
              Stability Estimate
            </p>

            <h4
              className={`font-bold ${
                stability === "Likely Stable"
                  ? "text-green-400"
                  : "text-yellow-400"
              }`}
            >
              {stability}
            </h4>

          </div>

        </div>

      </div>

      {/* Element Details */}

      {element && (

        <div className="mt-8 border-t border-slate-800 pt-6 space-y-3">

          <InfoRow
            label="Atomic Mass"
            value={element.mass}
          />

          <InfoRow
            label="Configuration"
            value={element.config}
          />

          <InfoRow
            label="Category"
            value={element.category}
          />

        </div>

      )}

    </div>
  );
}

function StatRow({
  icon,
  label,
  value,
  color = "text-white",
}) {
  return (
    <div className="flex items-center justify-between bg-slate-800 rounded-xl px-4 py-3">

      <div className="flex items-center gap-3">

        <div className="text-cyan-400">
          {icon}
        </div>

        <span className="text-slate-300">
          {label}
        </span>

      </div>

      <span className={`font-bold text-lg ${color}`}>
        {value}
      </span>

    </div>
  );
}

function InfoRow({
  label,
  value,
}) {
  return (
    <div className="flex justify-between border-b border-slate-800 pb-2">

      <span className="text-slate-400">
        {label}
      </span>

      <span className="text-right max-w-[140px] break-words">
        {value}
      </span>

    </div>
  );
}