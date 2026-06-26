import React, { useState } from "react";

export default function CircuitSimulation() {
  const [batteryCount, setBatteryCount] = useState(2);
  const [bulbCount, setBulbCount] = useState(2);
  const [isOn, setIsOn] = useState(true);
  const [circuitType, setCircuitType] = useState("series");

  const totalVoltage = batteryCount * 9;

  const brightness = isOn
    ? circuitType === "series"
      ? Math.max(0.25, 1 / bulbCount)
      : 1
    : 0.1;

  return (
    <div className="bg-slate-900 rounded-2xl p-6 border border-slate-800 text-white">
      <h1 className="text-3xl font-bold mb-6">
        ⚡ Circuit Lab
      </h1>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Controls */}
        <div className="bg-slate-800 rounded-xl p-5">
          <h2 className="text-xl font-semibold mb-4">
            Circuit Controls
          </h2>

          <label className="block mb-2">
            Circuit Type
          </label>

          <select
            value={circuitType}
            onChange={(e) =>
              setCircuitType(e.target.value)
            }
            className="w-full bg-slate-700 rounded-lg p-3 mb-5"
          >
            <option value="series">
              Series Circuit
            </option>
            <option value="parallel">
              Parallel Circuit
            </option>
          </select>

          <label className="block mb-2">
            Batteries: {batteryCount}
          </label>

          <input
            type="range"
            min="1"
            max="4"
            value={batteryCount}
            onChange={(e) =>
              setBatteryCount(
                Number(e.target.value)
              )
            }
            className="w-full mb-5"
          />

          <label className="block mb-2">
            Bulbs: {bulbCount}
          </label>

          <input
            type="range"
            min="1"
            max="5"
            value={bulbCount}
            onChange={(e) =>
              setBulbCount(
                Number(e.target.value)
              )
            }
            className="w-full mb-5"
          />

          <button
            onClick={() => setIsOn(!isOn)}
            className={`px-5 py-3 rounded-lg font-semibold transition ${
              isOn
                ? "bg-green-600 hover:bg-green-700"
                : "bg-red-600 hover:bg-red-700"
            }`}
          >
            {isOn
              ? "Circuit ON"
              : "Circuit OFF"}
          </button>
        </div>

        {/* Info */}
        <div className="bg-slate-800 rounded-xl p-5">
          <h2 className="text-xl font-semibold mb-4">
            Circuit Information
          </h2>

          <div className="space-y-3 text-lg">
            <p>
              🔋 Batteries: {batteryCount}
            </p>

            <p>
              💡 Bulbs: {bulbCount}
            </p>

            <p>
              ⚡ Total Voltage:{" "}
              {totalVoltage}V
            </p>

            <p>
              🔄 Circuit Type:{" "}
              {circuitType}
            </p>

            <p>
              {isOn
                ? "🟢 Closed Circuit"
                : "🔴 Open Circuit"}
            </p>
          </div>

          {/* Bulb Preview */}
          <div className="flex flex-wrap justify-center gap-4 mt-8">
            {[...Array(bulbCount)].map(
              (_, index) => (
                <div
                  key={index}
                  className="rounded-full transition-all duration-300"
                  style={{
                    width: "70px",
                    height: "70px",
                    background: `rgba(255,255,0,${brightness})`,
                    boxShadow: isOn
                      ? `0 0 ${
                          20 +
                          brightness * 40
                        }px yellow`
                      : "none",
                  }}
                />
              )
            )}
          </div>
        </div>
      </div>

      {/* Circuit Diagram */}
      <div className="mt-8 bg-slate-800 rounded-xl p-6">
        <h2 className="text-xl font-semibold mb-5">
          Circuit Diagram
        </h2>

        <svg
          viewBox="0 0 1000 300"
          className="w-full h-72"
        >
          {/* Outer Wire */}
          <rect
            x="100"
            y="60"
            width="800"
            height="180"
            fill="none"
            stroke="white"
            strokeWidth="4"
          />

          {/* Battery Pack */}
          {[...Array(batteryCount)].map(
            (_, i) => (
              <g key={i}>
                <line
                  x1={150 + i * 30}
                  y1="100"
                  x2={150 + i * 30}
                  y2="200"
                  stroke="#22c55e"
                  strokeWidth="6"
                />

                <line
                  x1={165 + i * 30}
                  y1="120"
                  x2={165 + i * 30}
                  y2="180"
                  stroke="#22c55e"
                  strokeWidth="3"
                />
              </g>
            )
          )}

          {/* Bulbs */}
          {[...Array(bulbCount)].map(
            (_, i) => (
              <g key={i}>
                <circle
                  cx={
                    450 +
                    i *
                      (250 /
                        Math.max(
                          bulbCount,
                          1
                        ))
                  }
                  cy="150"
                  r="28"
                  fill={`rgba(255,255,0,${brightness})`}
                  stroke="white"
                  strokeWidth="3"
                />

                <text
                  x={
                    440 +
                    i *
                      (250 /
                        Math.max(
                          bulbCount,
                          1
                        ))
                  }
                  y="155"
                  fill="black"
                  fontSize="12"
                >
                  💡
                </text>
              </g>
            )
          )}

          {/* Switch */}
          <line
            x1="780"
            y1="150"
            x2="820"
            y2={
              isOn ? "150" : "120"
            }
            stroke={
              isOn
                ? "#22c55e"
                : "#ef4444"
            }
            strokeWidth="5"
          />

          <text
            x="740"
            y="220"
            fill={
              isOn
                ? "#22c55e"
                : "#ef4444"
            }
            fontSize="18"
          >
            {isOn
              ? "Switch Closed"
              : "Switch Open"}
          </text>
        </svg>
      </div>

      {/* Learning Panel */}
      <div className="mt-8 bg-slate-800 rounded-xl p-6">
        <h2 className="text-xl font-semibold mb-4">
          What Happens?
        </h2>

        {circuitType === "series" ? (
          <p className="text-slate-300 leading-relaxed">
            In a series circuit, all bulbs
            share one path. Adding more bulbs
            makes each bulb dimmer because the
            electrical energy is shared across
            the circuit.
          </p>
        ) : (
          <p className="text-slate-300 leading-relaxed">
            In a parallel circuit, each bulb
            receives power through its own
            branch. Bulbs stay bright even
            when more bulbs are added.
          </p>
        )}
      </div>
    </div>
  );
}