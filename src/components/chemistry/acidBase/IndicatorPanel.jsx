// src/components/chemistry/acidBase/IndicatorPanel.jsx

import React from "react";
import {
  Droplets,
  CheckCircle2,
  Info,
} from "lucide-react";

import indicatorEngine from "../../../engine/acidBase/IndicatorEngine";

const INDICATORS = [
  {
    id: "Litmus",
    description: "Turns red in acids and blue in bases.",
  },
  {
    id: "Phenolphthalein",
    description: "Colorless in acids and pink in bases.",
  },
  {
    id: "Methyl Orange",
    description: "Red in acids and yellow in bases.",
  },
  {
    id: "Universal Indicator",
    description: "Displays the full pH spectrum.",
  },
];

export default function IndicatorPanel({
  indicator,
  setIndicator,
  ph = 7,
}) {
  const getIndicatorData = (name) => {
    return indicatorEngine.getColor(name, ph);
  };

  const liveReading = getIndicatorData(indicator);

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">

      {/* Header */}

      <div className="flex items-center gap-3 p-4 border-b border-slate-800">

        <div className="w-11 h-11 rounded-xl bg-cyan-500/20 flex items-center justify-center">
          <Droplets
            className="text-cyan-400"
            size={22}
          />
        </div>

        <div>
          <h2 className="font-bold text-white">
            Indicators
          </h2>

          <p className="text-xs text-slate-400">
            Choose a chemical indicator
          </p>
        </div>

      </div>

      {/* Indicator List */}

      <div className="p-4 space-y-3">

        {INDICATORS.map((item) => {

          const active = indicator === item.id;

          const data = getIndicatorData(item.id);

          return (
            <button
              key={item.id}
              onClick={() => setIndicator(item.id)}
              className={`w-full rounded-xl border transition-all duration-300 p-3 flex items-center gap-4 ${
                active
                  ? "border-cyan-500 bg-cyan-500/10"
                  : "border-slate-700 bg-slate-950 hover:border-cyan-600"
              }`}
            >

              {/* Color Preview */}

              <div
                className="w-12 h-12 rounded-xl border border-slate-700 shadow"
                style={{
                  background: data.color,
                }}
              />

              {/* Name */}

              <div className="flex-1 text-left">

                <h3 className="font-semibold text-white">
                  {item.id}
                </h3>

                <p className="text-xs text-slate-400">
                  {item.description}
                </p>

              </div>

              {active && (
                <CheckCircle2
                  className="text-green-400"
                  size={22}
                />
              )}

            </button>
          );
        })}

      </div>

      {/* Live Reading */}

      <div className="border-t border-slate-800 p-4 bg-slate-950">

        <div className="flex items-center gap-2 mb-4">

          <Info
            className="text-cyan-400"
            size={18}
          />

          <span className="font-semibold text-white">
            Live Reading
          </span>

        </div>

        <div className="space-y-3">

          <div className="flex justify-between">
            <span className="text-slate-400">
              Indicator
            </span>

            <span className="text-cyan-400 font-semibold">
              {indicator}
            </span>
          </div>

          <div className="flex justify-between">
            <span className="text-slate-400">
              pH
            </span>

            <span className="text-white font-bold">
              {ph.toFixed(1)}
            </span>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-slate-400">
              Color
            </span>

            <div className="flex items-center gap-2">

              <div
                className="w-5 h-5 rounded-full border border-slate-600"
                style={{
                  background: liveReading.color,
                }}
              />

              <span className="text-white">
                {liveReading.color}
              </span>

            </div>
          </div>

          <div className="flex justify-between">
            <span className="text-slate-400">
              State
            </span>

            <span className="font-bold text-emerald-400">
              {liveReading.state}
            </span>
          </div>

        </div>

      </div>

    </div>
  );
}