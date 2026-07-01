// src/components/chemistry/acidBase/ResultCard.jsx

import React from "react";
import {
  CheckCircle2,
  FlaskConical,
  Thermometer,
  Droplets,
  Sparkles,
} from "lucide-react";

export default function ResultCard({
  acid,
  base,
  products = [],
  equation = "",
  ph = 7,
  temperature = 25,
  observation = "No reaction performed.",
  reactionComplete = false,
  energy = "None",
}) {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden">

      {/* Header */}
      <div className="p-5 border-b border-slate-800 flex items-center gap-3">
        <div className="w-12 h-12 rounded-xl bg-emerald-500/20 flex items-center justify-center">
          <CheckCircle2
            className="text-emerald-400"
            size={24}
          />
        </div>

        <div>
          <h2 className="text-xl font-bold text-white">
            Experiment Result
          </h2>

          <p className="text-sm text-slate-400">
            Neutralization Summary
          </p>
        </div>
      </div>

      {/* Body */}
      <div className="p-5 space-y-5">

        {/* Reactants */}
        <div className="grid grid-cols-2 gap-3">

          <div className="rounded-xl bg-slate-950 border border-slate-800 p-4">
            <p className="text-xs text-slate-500 mb-1">
              Acid
            </p>

            <p className="font-bold text-red-400">
              {acid?.name || "None"}
            </p>
          </div>

          <div className="rounded-xl bg-slate-950 border border-slate-800 p-4">
            <p className="text-xs text-slate-500 mb-1">
              Base
            </p>

            <p className="font-bold text-blue-400">
              {base?.name || "None"}
            </p>
          </div>

        </div>

        {/* Equation */}
        <div className="rounded-xl bg-slate-950 border border-slate-800 p-4">
          <p className="text-xs text-slate-500 mb-2">
            Neutralization Equation
          </p>

          <p className="font-mono text-cyan-300 text-center">
            {equation || "No equation"}
          </p>
        </div>

        {/* Products */}
        <div className="rounded-xl bg-slate-950 border border-slate-800 p-4">

          <div className="flex items-center gap-2 mb-3">
            <FlaskConical
              className="text-emerald-400"
              size={18}
            />

            <span className="font-semibold text-white">
              Products
            </span>
          </div>

          {products.length === 0 ? (
            <p className="text-slate-500 text-sm">
              No products generated.
            </p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {products.map((item, index) => (
                <span
                  key={index}
                  className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 text-sm font-semibold"
                >
                  {typeof item === "string"
                    ? item
                    : item.name}
                </span>
              ))}
            </div>
          )}

        </div>

        {/* Statistics */}
        <div className="grid grid-cols-2 gap-3">

          <StatCard
            icon={Droplets}
            title="Final pH"
            value={ph}
            color="text-cyan-400"
            bg="bg-cyan-500/20"
          />

          <StatCard
            icon={Thermometer}
            title="Temperature"
            value={`${temperature}°C`}
            color="text-red-400"
            bg="bg-red-500/20"
          />

        </div>

        {/* Observation */}
        <div className="rounded-xl bg-slate-950 border border-slate-800 p-4">

          <div className="flex items-center gap-2 mb-2">
            <Sparkles
              className="text-yellow-400"
              size={18}
            />

            <span className="font-semibold text-white">
              Observation
            </span>
          </div>

          <p className="text-slate-300 text-sm leading-6">
            {observation}
          </p>

        </div>

      </div>

      {/* Footer */}
      <div className="border-t border-slate-800 bg-slate-950 px-5 py-4 flex justify-between">

        <span className="text-slate-500">
          Experiment Status
        </span>

        <span
          className={`font-bold ${
            reactionComplete
              ? "text-emerald-400"
              : "text-yellow-400"
          }`}
        >
          {reactionComplete
            ? "Completed"
            : "Waiting"}
        </span>

      </div>

    </div>
  );
}

/* ========================= */

function StatCard({
  icon: Icon,
  title,
  value,
  color,
  bg,
}) {
  return (
    <div className="rounded-xl bg-slate-950 border border-slate-800 p-4 flex items-center gap-3">

      <div
        className={`w-10 h-10 rounded-xl ${bg} flex items-center justify-center`}
      >
        <Icon
          className={color}
          size={20}
        />
      </div>

      <div>
        <p className="text-xs text-slate-500">
          {title}
        </p>

        <p className="text-white font-bold">
          {value}
        </p>
      </div>

    </div>
  );
}