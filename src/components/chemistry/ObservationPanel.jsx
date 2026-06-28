import React from "react";
import {
  Eye,
  Sparkles,
  Thermometer,
  Droplets,
  FlaskConical,
} from "lucide-react";

const ObservationPanel = ({
  observation,
  observations = [],
}) => {
  const latestObservation =
    observation ||
    (Array.isArray(observations) && observations.length
      ? observations[observations.length - 1]
      : null);

  const indicators = [
    {
      label: "Temperature",
      value: "Stable",
      icon: Thermometer,
      color: "text-red-400",
      bg: "bg-red-500/20",
    },
    {
      label: "Gas",
      value: "None",
      icon: Sparkles,
      color: "text-cyan-400",
      bg: "bg-cyan-500/20",
    },
    {
      label: "Color",
      value: "No Change",
      icon: Droplets,
      color: "text-purple-400",
      bg: "bg-purple-500/20",
    },
    {
      label: "Precipitate",
      value: "None",
      icon: FlaskConical,
      color: "text-green-400",
      bg: "bg-green-500/20",
    },
  ];

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden h-full flex flex-col">

      {/* Header */}

      <div className="p-5 border-b border-slate-800 flex items-center gap-4">

        <div className="w-12 h-12 rounded-xl bg-cyan-500/20 flex items-center justify-center">
          <Eye className="text-cyan-400" size={24} />
        </div>

        <div>
          <h2 className="text-xl font-bold text-white">
            Observation Panel
          </h2>

          <p className="text-sm text-slate-400">
            Live laboratory observations
          </p>
        </div>

      </div>

      {/* Observation */}

      <div className="p-5">

        <div className="rounded-2xl border border-slate-700 bg-slate-950 min-h-[170px] p-5 text-slate-300 leading-7">

          {latestObservation ? (
            <p>{latestObservation}</p>
          ) : (
            <div className="text-slate-500">
              No observations yet.
              <br />
              Select a reaction and press Start.
            </div>
          )}

        </div>

      </div>

      {/* Indicators */}

      <div className="border-t border-slate-800 p-5 flex-1">

        <h3 className="text-xs uppercase tracking-widest text-slate-500 mb-4">
          Live Indicators
        </h3>

        <div className="space-y-3">

          {indicators.map((item, index) => {
            const Icon = item.icon;

            return (
              <div
                key={index}
                className="flex items-center gap-4 rounded-xl bg-slate-950 border border-slate-800 p-3"
              >
                <div
                  className={`w-10 h-10 rounded-xl ${item.bg} flex items-center justify-center`}
                >
                  <Icon
                    className={item.color}
                    size={20}
                  />
                </div>

                <div>
                  <p className="text-xs text-slate-500">
                    {item.label}
                  </p>

                  <p className="text-white font-semibold">
                    {item.value}
                  </p>
                </div>
              </div>
            );
          })}

        </div>

      </div>

      {/* Footer */}

      <div className="border-t border-slate-800 bg-slate-950 px-5 py-4 flex justify-between">

        <span className="text-slate-500">
          Status
        </span>

        <span className="text-emerald-400 font-semibold">
          Ready
        </span>

      </div>

    </div>
  );
};

export default ObservationPanel;