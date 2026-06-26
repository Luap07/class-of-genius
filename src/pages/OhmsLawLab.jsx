import React, { useState } from "react";
import OhmGraph from "./VirtualLab/physics/OhmGraph";

const OhmsLawLab = () => {
  const [voltage, setVoltage] = useState(12);
  const [resistance, setResistance] = useState(10);
  const [isOn, setIsOn] = useState(true);

  const [readings, setReadings] = useState([]);
  const [graphData, setGraphData] = useState([]);

  const current = isOn ? voltage / resistance : 0;
  const power = isOn ? voltage * current : 0;

  const brightness = Math.min((power / 20) * 100, 100);
  const overloaded = power > 30;

  const resistorColor =
    resistance < 20
      ? "text-green-400"
      : resistance < 60
      ? "text-yellow-400"
      : "text-red-400";

  const addReading = () => {
    const newReading = {
      voltage,
      resistance,
      current: Number(current.toFixed(2)),
      power: Number(power.toFixed(2)),
    };

    setReadings((prev) => [...prev, newReading]);
  };

  const clearReadings = () => {
    setReadings([]);
    setGraphData([]);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white p-6">

      <h1 className="text-4xl font-bold mb-6">
        ⚡ Ohm's Law Virtual Lab
      </h1>

      {/* Controls */}
      <div className="grid md:grid-cols-3 gap-4 mb-8">

        <div className="bg-slate-900 p-4 rounded-xl">
          <label>Voltage (V)</label>
          <input
            type="range"
            min="1"
            max="24"
            value={voltage}
            onChange={(e) => setVoltage(Number(e.target.value))}
            className="w-full"
          />
          <p>{voltage} V</p>
        </div>

        <div className="bg-slate-900 p-4 rounded-xl">
          <label>Resistance (Ω)</label>
          <input
            type="range"
            min="1"
            max="100"
            value={resistance}
            onChange={(e) => setResistance(Number(e.target.value))}
            className="w-full"
          />
          <p>{resistance} Ω</p>
        </div>

        <div className="bg-slate-900 p-4 rounded-xl flex items-center justify-center">
          <button
            onClick={() => setIsOn(!isOn)}
            className={`px-6 py-3 rounded-xl font-bold ${
              isOn ? "bg-green-600" : "bg-red-600"
            }`}
          >
            {isOn ? "ON" : "OFF"}
          </button>
        </div>
      </div>

      {/* Circuit */}
      <div className="bg-slate-900 rounded-2xl p-8 mb-8">

        <div className="flex items-center justify-center gap-6 text-6xl">

          <div>🔋</div>

          <div
            className={`h-2 w-24 rounded ${
              isOn ? "bg-yellow-400" : "bg-gray-600"
            }`}
          />

          <div
            style={{
              filter: `brightness(${1 + brightness / 40})`,
              transform: `scale(${1 + brightness / 200})`,
            }}
          >
            {overloaded ? "💥" : "💡"}
          </div>

          <div
            className={`h-2 w-24 rounded ${
              isOn ? "bg-yellow-400" : "bg-gray-600"
            }`}
          />

          <div className={`text-5xl ${resistorColor}`}>
            Ω
          </div>

        </div>

        <p className="text-center mt-4 text-slate-400">
          Current Flow Visualization
        </p>

      </div>

      {/* Meters */}
      <div className="grid md:grid-cols-3 gap-4">

        <div className="bg-slate-900 p-6 rounded-xl">
          <h2>Ammeter</h2>
          <p className="text-3xl text-cyan-400">
            {current.toFixed(2)} A
          </p>
        </div>

        <div className="bg-slate-900 p-6 rounded-xl">
          <h2>Voltmeter</h2>
          <p className="text-3xl text-green-400">
            {voltage} V
          </p>
        </div>

        <div className="bg-slate-900 p-6 rounded-xl">
          <h2>Power</h2>
          <p className="text-3xl text-yellow-400">
            {power.toFixed(2)} W
          </p>
        </div>

      </div>

      {/* Buttons */}
      <div className="flex gap-4 mt-8">

        <button
          onClick={addReading}
          className="bg-cyan-600 px-5 py-3 rounded-xl font-bold"
        >
          Add Reading
        </button>

        <button
          onClick={() => setGraphData([...readings])}
          className="bg-green-600 px-5 py-3 rounded-xl font-bold"
        >
          Plot Graph
        </button>

        <button
          onClick={clearReadings}
          className="bg-red-600 px-5 py-3 rounded-xl font-bold"
        >
          Clear Data
        </button>

      </div>

     {/* Table */}
<div className="bg-slate-900 mt-8 p-6 rounded-xl overflow-x-auto">

  <h2 className="text-xl mb-4 font-bold">
    Data Table
  </h2>

  {readings.length === 0 ? (
    <p className="text-slate-400">No readings yet</p>
  ) : (
    <table className="w-full border-collapse text-left">

      <thead>
        <tr className="border-b border-slate-700 text-slate-300">
          <th className="py-2 px-3">Voltage (V)</th>
          <th className="py-2 px-3">Resistance (Ω)</th>
          <th className="py-2 px-3">Current (A)</th>
          <th className="py-2 px-3">Power (W)</th>
        </tr>
      </thead>

      <tbody>
        {readings.map((r, i) => (
          <tr
            key={i}
            className="border-b border-slate-800 hover:bg-slate-800/50"
          >
            <td className="py-2 px-3">{r.voltage}</td>
            <td className="py-2 px-3">{r.resistance}</td>
            <td className="py-2 px-3">{r.current}</td>
            <td className="py-2 px-3">{r.power}</td>
          </tr>
        ))}
      </tbody>

    </table>
  )}
</div>
      {/* GRAPH */}
      <OhmGraph readings={graphData} />

    </div>
  );
};

export default OhmsLawLab;