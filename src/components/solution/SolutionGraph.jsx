import React, { useMemo } from "react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";

const SolutionGraph = ({
  mass = 10,
  volume = 100,
  molarity = 1,
}) => {
  const data = useMemo(() => {
    const points = [];

    for (let i = 0; i <= 20; i++) {
      const addedMass = Number((i * (mass / 20)).toFixed(2));

      points.push({
        mass: addedMass,
        molarity: Number(((addedMass / mass) * molarity).toFixed(2)),
      });
    }

    return points;
  }, [mass, molarity]);

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">

      <h2 className="text-2xl font-bold text-cyan-400 mb-2">
        📈 Solution Concentration Graph
      </h2>

      <p className="text-slate-400 mb-6">
        Relationship between solute mass and molarity.
      </p>

      <div className="w-full h-[420px]">

        <ResponsiveContainer width="100%" height="100%">

          <LineChart data={data}>

            <CartesianGrid strokeDasharray="4 4" stroke="#334155" />

            <XAxis
              dataKey="mass"
              stroke="#CBD5E1"
              label={{
                value: "Mass of Solute (g)",
                position: "insideBottom",
                offset: -5,
                fill: "#CBD5E1",
              }}
            />

            <YAxis
              stroke="#CBD5E1"
              label={{
                value: "Molarity (M)",
                angle: -90,
                position: "insideLeft",
                fill: "#CBD5E1",
              }}
            />

            <Tooltip
              contentStyle={{
                background: "#0f172a",
                border: "1px solid #334155",
                borderRadius: "10px",
                color: "#fff",
              }}
            />

            <Line
              type="monotone"
              dataKey="molarity"
              stroke="#06b6d4"
              strokeWidth={3}
              dot={{ r: 4 }}
              activeDot={{ r: 7 }}
            />

          </LineChart>

        </ResponsiveContainer>

      </div>

      <div className="grid grid-cols-3 gap-4 mt-6">

        <div className="bg-slate-800 rounded-xl p-4 text-center">
          <p className="text-slate-400 text-sm">
            Final Mass
          </p>

          <h3 className="text-xl font-bold text-white">
            {mass} g
          </h3>
        </div>

        <div className="bg-slate-800 rounded-xl p-4 text-center">
          <p className="text-slate-400 text-sm">
            Volume
          </p>

          <h3 className="text-xl font-bold text-white">
            {volume} mL
          </h3>
        </div>

        <div className="bg-slate-800 rounded-xl p-4 text-center">
          <p className="text-slate-400 text-sm">
            Final Molarity
          </p>

          <h3 className="text-xl font-bold text-cyan-400">
            {molarity.toFixed(2)} M
          </h3>
        </div>

      </div>

    </div>
  );
};

export default SolutionGraph;