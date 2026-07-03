// src/components/simulation/TitrationCurve.jsx

import React, { useMemo } from "react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
} from "recharts";
import { TrendingUp } from "lucide-react";

const clamp = (v, min, max) => Math.max(min, Math.min(max, v));

function generateCurve(endpointVolume = 25) {
  const data = [];

  const maxVolume = Math.max(endpointVolume * 2, 50);

  for (let volume = 0; volume <= maxVolume; volume += 0.5) {
    const ratio = volume / endpointVolume;

    let pH;

    if (ratio < 0.20) pH = 1.2;
    else if (ratio < 0.40) pH = 2.3;
    else if (ratio < 0.60) pH = 3.8;
    else if (ratio < 0.80) pH = 5.1;
    else if (ratio < 0.95) pH = 6.4;
    else if (ratio < 1.02) pH = 7 + (ratio - 0.95) * 30;
    else if (ratio < 1.10) pH = 9.5;
    else if (ratio < 1.30) pH = 10.5;
    else pH = 12.5;

    data.push({
      volume: Number(volume.toFixed(1)),
      pH: clamp(Number(pH.toFixed(2)), 0, 14),
    });
  }

  return data;
}

const CustomTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null;

  return (
    <div className="rounded-xl bg-slate-900 border border-slate-700 p-3 shadow-lg">
      <p className="text-cyan-400 font-semibold">
        {payload[0].payload.volume} mL
      </p>
      <p className="text-white">
        pH: {payload[0].payload.pH}
      </p>
    </div>
  );
};

const TitrationCurve = ({
  endpointVolume = 25,
  currentVolume = 0,
}) => {
  const data = useMemo(
    () => generateCurve(endpointVolume),
    [endpointVolume]
  );

  const activeIndex = useMemo(() => {
    return data.findIndex((d) => d.volume >= currentVolume);
  }, [data, currentVolume]);

  const current =
    activeIndex >= 0
      ? data[activeIndex]
      : data[data.length - 1];

  return (
    <div className="bg-slate-900 rounded-2xl border border-slate-700 p-5">

      {/* Header */}
      <div className="flex items-center gap-2 mb-5">
        <TrendingUp className="text-cyan-400" />
        <h2 className="text-xl font-bold">
          Titration Curve
        </h2>
      </div>

      {/* Chart */}
      <div className="h-[360px]">

        <ResponsiveContainer width="100%" height="100%">

          <LineChart data={data}>

            <CartesianGrid
              strokeDasharray="3 3"
              stroke="#334155"
            />

            <XAxis
              dataKey="volume"
              tick={{ fill: "#CBD5E1" }}
            />

            <YAxis
              domain={[0, 14]}
              tick={{ fill: "#CBD5E1" }}
            />

            <Tooltip content={<CustomTooltip />} />

            <ReferenceLine
              x={endpointVolume}
              stroke="#ef4444"
              strokeDasharray="5 5"
              label="Endpoint"
            />

            <ReferenceLine
              x={currentVolume}
              stroke="#facc15"
            />

            <ReferenceLine
              y={7}
              stroke="#22c55e"
              strokeDasharray="3 3"
            />

            <Line
              type="monotone"
              dataKey="pH"
              stroke="#22d3ee"
              strokeWidth={3}
              dot={false}
              activeDot={{
                r: 7,
                fill: "#facc15",
                stroke: "#fff",
                strokeWidth: 2,
              }}
            />

          </LineChart>

        </ResponsiveContainer>

      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mt-6">

        <div className="bg-slate-800 rounded-xl p-4">
          <p className="text-slate-400 text-sm">
            Current Volume
          </p>
          <p className="text-cyan-400 text-2xl font-bold">
            {currentVolume.toFixed(2)} mL
          </p>
        </div>

        <div className="bg-slate-800 rounded-xl p-4">
          <p className="text-slate-400 text-sm">
            Current pH
          </p>
          <p className="text-green-400 text-2xl font-bold">
            {current?.pH.toFixed(2)}
          </p>
        </div>

        <div className="bg-slate-800 rounded-xl p-4">
          <p className="text-slate-400 text-sm">
            Endpoint
          </p>
          <p className="text-pink-400 text-2xl font-bold">
            {endpointVolume.toFixed(2)} mL
          </p>
        </div>
              
      </div>
               {/* Footer */}
      <div className="mt-6 rounded-xl border border-cyan-500/20 bg-cyan-500/10 p-4">

        <p className="text-sm text-slate-300 leading-6">
          The yellow line shows the current titrant volume. The red
          dashed line marks the theoretical endpoint (equivalence
          point). During the experiment, this graph updates
          automatically as titrant is added.
        </p>

      </div>
    </div>
  );
};

export default TitrationCurve;