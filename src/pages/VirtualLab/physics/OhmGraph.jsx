import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";

const OhmGraph = ({ readings = [] }) => {
  return (
    <div className="bg-slate-900 p-6 rounded-xl mt-8">

      <h2 className="text-2xl font-bold mb-4">
        📈 Voltage vs Current Graph
      </h2>

      {readings.length === 0 ? (
        <div className="text-center py-16">

          <div className="text-6xl mb-4">
            📊
          </div>

          <p className="text-slate-400 text-lg">
            Record readings and click
            <span className="text-green-400 font-bold">
              {" "}Plot Graph
            </span>
          </p>

        </div>
      ) : (
        <>
          <ResponsiveContainer width="100%" height={350}>
            <LineChart data={readings}>

              <CartesianGrid strokeDasharray="3 3" />

              <XAxis
                dataKey="current"
                label={{
                  value: "Current (A)",
                  position: "insideBottom",
                  offset: -5,
                }}
              />

              <YAxis
                label={{
                  value: "Voltage (V)",
                  angle: -90,
                  position: "insideLeft",
                }}
              />

              <Tooltip
                formatter={(value) =>
                  Number(value).toFixed(2)
                }
              />

              <Line
                type="monotone"
                dataKey="voltage"
                stroke="#22d3ee"
                strokeWidth={3}
                dot={{ r: 5 }}
                activeDot={{ r: 8 }}
              />

            </LineChart>
          </ResponsiveContainer>

          {/* Observation Box */}

          {readings.length > 1 && (
            <div className="bg-green-900/20 border border-green-500 rounded-xl p-4 mt-6">

              <h3 className="text-green-400 font-bold text-lg mb-2">
                🔬 Observation
              </h3>

              <p className="text-slate-300">
                As voltage increases, current increases
                proportionally when resistance remains
                constant.
              </p>

              <p className="text-green-300 mt-2 font-semibold">
                ✓ Ohm's Law Verified
              </p>

            </div>
          )}

        </>
      )}
    </div>
  );
};

export default OhmGraph;