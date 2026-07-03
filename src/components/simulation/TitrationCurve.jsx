// src/components/simulation/TitrationCurve.jsx

import React, { useMemo } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  Dot,
} from "recharts";
import { TrendingUp } from "lucide-react";

const clamp = (value, min, max) =>
  Math.max(min, Math.min(max, value));

const generateCurve = ({
  endpointVolume,
  currentVolume,
}) => {
  const data = [];

  const end = Math.max(endpointVolume * 2, 50);

  for (let v = 0; v <= end; v += 0.5) {
    const ratio = endpointVolume === 0 ? 0 : v / endpointVolume;

    let pH;

    // Educational approximation
    if (ratio < 0.2) pH = 1.2;
    else if (ratio < 0.4) pH = 2.3;
    else if (ratio < 0.6) pH = 3.8;
    else if (ratio < 0.8) pH = 5.1;
    else if (ratio < 0.95) pH = 6.4;
    else if (ratio < 1.02) pH = 7.0 + (ratio - 0.95) * 30;
    else if (ratio < 1.1) pH = 9.5;
    else if (ratio < 1.3) pH = 10.5;
    else pH = 12.5;

    data.push({
      volume: Number(v.toFixed(1)),
      pH: clamp(Number(pH.toFixed(2)), 0, 14),
    });
  }

  const current =
    data.find((d) => d.volume >= currentVolume) ??
    data[data.length - 1];

  return { data, current };
};

const CustomTooltip = ({
  active,
  payload,
}) => {
  if (!active || !payload?.length) return null;

  return (
    <div className="rounded-xl border border-slate-700 bg-slate-900 p-3 shadow-xl">
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
  const { data, current } = useMemo(
    () =>
      generateCurve({
        endpointVolume,
        currentVolume,
      }),
    [endpointVolume, currentVolume]
  );

  return (
    <div className="rounded-2xl border border-slate-700 bg-slate-900 p-5 shadow-lg">

      {/* Header */}
      <div className="flex items-center gap-2 mb-5">
        <TrendingUp
          size={20}
          className="text-cyan-400"
        />

        <h2 className="text-xl font-bold">
          Titration Curve
        </h2>
      </div>

      {/* Chart */}
      <div className="h-[380px]">

        <ResponsiveContainer
          width="100%"
          height="100%"
        >
          <LineChart data={data}>

            <CartesianGrid
              strokeDasharray="3 3"
              stroke="#334155"
            />

            <XAxis
              dataKey="volume"
              tick={{ fill: "#CBD5E1" }}
              label={{
                value: "Volume Added (mL)",
                position: "insideBottom",
                offset: -5,
                fill: "#CBD5E1",
              }}
            />

            <YAxis
              domain={[0, 14]}
              tick={{ fill: "#CBD5E1" }}
              label={{
                value: "pH",
                angle: -90,
                position: "insideLeft",
                fill: "#CBD5E1",
              }}
            />

            <Tooltip
              content={<CustomTooltip />}
            />

            {/* Endpoint */}
            <ReferenceLine
              x={endpointVolume}
              stroke="#f43f5e"
              strokeDasharray="5 5"
              label={{
                value: "Endpoint",
                fill: "#f43f5e",
              }}
            />

            {/* Neutral */}
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
                r: 6,
              }}
            />

            {/* Current Position */}
            <ReferenceLine
              x={currentVolume}
              stroke="#eab308"
            />

            <Line
              data={[
                {
                  volume: current.volume,
                  pH: current.pH,
                },
              ]}
              dataKey="pH"
              stroke="transparent"
              dot={
                <Dot
                  r={8}
                  fill="#eab308"
                  stroke="#fff"
                  strokeWidth={2}
                />
              }
            />

          </LineChart>
        </ResponsiveContainer>

      </div>

      {/* Information */}
      <div className="grid grid-cols-3 gap-4 mt-6">

        <div className="rounded-xl bg-slate-800 p-4">

          <div className="text-slate-400 text-sm">
            Current Volume
          </div>

          <div className="text-2xl font-bold text-cyan-400">
            {currentVolume.toFixed(2)} mL
          </div>

        </div>

        <div className="rounded-xl bg-slate-800 p-4">

          <div className="text-slate-400 text-sm">
            Current pH
          </div>

          <div className="text-2xl font-bold text-green-400">
            {current.pH.toFixed(2)}
          </div>

        </div>

        <div className="rounded-xl bg-slate-800 p-4">

          <div className="text-slate-400 text-sm">
            Endpoint
          </div>

          <div className="text-2xl font-bold text-pink-400">
            {endpointVolume.toFixed(2)} mL
          </div>

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