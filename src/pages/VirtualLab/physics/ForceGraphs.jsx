import React from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
} from "recharts";

const GraphCard = ({ title, data, color }) => {
  return (
    <div className="h-full bg-[#030b24] border border-gray-800 rounded-xl p-4 flex flex-col">
      <h3 className="text-sm text-gray-400 mb-4">{title}</h3>

      <div className="flex-1 min-h-[220px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <CartesianGrid
              stroke="#1e293b"
              strokeDasharray="3 3"
            />

            <XAxis
              dataKey="time"
              stroke="#64748b"
              tick={{ fontSize: 12 }}
            />

            <YAxis
              stroke="#64748b"
              tick={{ fontSize: 12 }}
            />

            <Tooltip />

            <Line
              type="monotone"
              dataKey="value"
              stroke={color}
              strokeWidth={3}
              dot={false}
              isAnimationActive={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default function ForceGraphs({
  forceData = [],
  velocityData = [],
  accelData = [],
}) {
  return (
    <div className="w-full mt-6">
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 items-stretch">
        <GraphCard
          title="Force (N)"
          data={forceData}
          color="#ef4444"
        />

        <GraphCard
          title="Velocity (m/s)"
          data={velocityData}
          color="#a855f7"
        />

        <GraphCard
          title="Acceleration (m/s²)"
          data={accelData}
          color="#22c55e"
        />
      </div>
    </div>
  );
}