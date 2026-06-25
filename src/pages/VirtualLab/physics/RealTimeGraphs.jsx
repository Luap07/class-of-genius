import React from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";

const GraphCard = ({ title, data, color }) => (
  <div className="bg-[#030b24] p-4 rounded-xl border border-gray-800">
    <h3 className="text-sm text-gray-400 mb-4">{title}</h3>

    <div className="h-40">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <CartesianGrid stroke="#1e293b" strokeDasharray="3 3" />
          <XAxis dataKey="time" stroke="#475569" />
          <YAxis stroke="#475569" />
          <Line
            type="monotone"
            dataKey="value"
            stroke={color}
            dot={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  </div>
);

export default function RealTimeGraphs({
  forceData,
  accelData,
  velocityData,
}) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
      <GraphCard title="Force" data={forceData} color="#22c55e" />
      <GraphCard title="Acceleration" data={accelData} color="#eab308" />
      <GraphCard title="Velocity" data={velocityData} color="#a855f7" />
    </div>
  );
}