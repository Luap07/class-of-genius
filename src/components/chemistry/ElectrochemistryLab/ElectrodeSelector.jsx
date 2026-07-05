// src/pages/labs/chemistry/components/ElectrodeSelector.jsx

import React from "react";
import { Atom, ArrowRightLeft } from "lucide-react";
import { ELECTRODES } from "../../../data/ElectrochemistryLab/electrodes";

const ElectrodeCard = ({
  electrode,
  active,
  onClick,
  label,
}) => {
  return (
    <button
      onClick={onClick}
      className={`w-full rounded-xl border p-4 transition-all duration-200 text-left ${
        active
          ? "border-cyan-400 bg-cyan-500/10 shadow-lg shadow-cyan-500/20"
          : "border-slate-700 bg-slate-900 hover:border-slate-500 hover:bg-slate-800"
      }`}
    >
      <div className="flex justify-between items-start">

        <div>
          <h3 className="text-white font-semibold text-lg">
            {electrode.name}
          </h3>

          <p className="text-slate-400">
            {electrode.symbol}
          </p>
        </div>

        <div
          className="w-5 h-5 rounded-full border"
          style={{
            backgroundColor: electrode.color,
          }}
        />

      </div>

      <div className="mt-4 space-y-1 text-sm">

        <div className="flex justify-between">
          <span className="text-slate-400">Ion</span>
          <span className="text-white">
            {electrode.ion}
          </span>
        </div>

        <div className="flex justify-between">
          <span className="text-slate-400">
            Electrolyte
          </span>
          <span className="text-white">
            {electrode.electrolyte}
          </span>
        </div>

        <div className="flex justify-between">
          <span className="text-slate-400">
            E°
          </span>
          <span className="text-cyan-400">
            {electrode.potential === null
              ? "—"
              : `${electrode.potential} V`}
          </span>
        </div>

      </div>

      {active && (
        <div className="mt-4 text-xs font-semibold text-cyan-400">
          {label}
        </div>
      )}
    </button>
  );
};

const ElectrodeSelector = ({
  anode,
  cathode,
  onSelectAnode,
  onSelectCathode,
}) => {
  return (
    <div className="bg-slate-900 border border-slate-700 rounded-2xl p-6">

      {/* Header */}

      <div className="flex items-center gap-3 mb-6">

        <Atom className="w-7 h-7 text-cyan-400" />

        <div>
          <h2 className="text-xl font-bold text-white">
            Electrode Selector
          </h2>

          <p className="text-slate-400 text-sm">
            Choose the anode and cathode.
          </p>
        </div>

      </div>

      {/* Selected */}

      <div className="grid md:grid-cols-2 gap-4 mb-8">

        <div className="rounded-xl bg-slate-800 p-4">

          <p className="text-sm text-slate-400 mb-2">
            Selected Anode
          </p>

          <h3 className="text-lg font-bold text-red-400">
            {anode?.name || "None"}
          </h3>

        </div>

        <div className="rounded-xl bg-slate-800 p-4">

          <p className="text-sm text-slate-400 mb-2">
            Selected Cathode
          </p>

          <h3 className="text-lg font-bold text-green-400">
            {cathode?.name || "None"}
          </h3>

        </div>

      </div>

      {/* Arrow */}

      <div className="flex justify-center mb-8">

        <ArrowRightLeft className="w-8 h-8 text-cyan-400" />

      </div>

      {/* Electrodes */}

      <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-5">

        {ELECTRODES.map((electrode) => (
          <div
            key={electrode.id}
            className="space-y-3"
          >
            <ElectrodeCard
              electrode={electrode}
              active={anode?.id === electrode.id}
              label="Anode"
              onClick={() =>
                onSelectAnode(electrode)
              }
            />

            <button
              onClick={() =>
                onSelectCathode(electrode)
              }
              className={`w-full rounded-lg py-2 font-semibold transition ${
                cathode?.id === electrode.id
                  ? "bg-green-600 text-white"
                  : "bg-slate-700 hover:bg-green-700 text-slate-200"
              }`}
            >
              {cathode?.id === electrode.id
                ? "Cathode Selected"
                : "Set as Cathode"}
            </button>

          </div>
        ))}

      </div>

    </div>
  );
};

export default ElectrodeSelector;