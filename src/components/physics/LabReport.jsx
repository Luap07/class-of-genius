import React, { useState } from "react";

/* ================= AI LAB REPORT ENGINE ================= */
const generateLabReport = (readings) => {
  if (!readings.length) {
    return "No experimental data recorded yet.";
  }

  const avgCurrent =
    readings.reduce((sum, r) => sum + Number(r.current), 0) /
    readings.length;

  const avgVoltage =
    readings.reduce((sum, r) => sum + Number(r.voltage), 0) /
    readings.length;

  const avgResistance =
    readings.reduce((sum, r) => sum + Number(r.resistance), 0) /
    readings.length;

  const maxPower = Math.max(
    ...readings.map((r) => Number(r.power))
  );

  const minCurrent = Math.min(
    ...readings.map((r) => Number(r.current))
  );

  return `
📄 LAB REPORT (AUTO-GENERATED)

🔬 Objective:
To analyze electrical relationships using Ohm’s Law simulation.

📊 Observations:
- Average Voltage: ${avgVoltage.toFixed(2)} V
- Average Resistance: ${avgResistance.toFixed(2)} Ω
- Average Current: ${avgCurrent.toFixed(2)} A
- Maximum Power: ${maxPower.toFixed(2)} W
- Minimum Current: ${minCurrent.toFixed(2)} A

⚡ Physics Interpretation:
- Current decreases as resistance increases.
- Current increases as voltage increases.
- Power is proportional to V × I.

📌 Conclusion:
Ohm’s Law (V = IR) is verified through simulation data.
Electrical behavior matches theoretical physics expectations.
`;
};

/* ================= LAB REPORT COMPONENT ================= */
function LabReport({ readings }) {
  return (
    <div className="bg-slate-900 p-6 rounded-xl mt-6 border border-cyan-500">
      <h2 className="text-2xl font-bold mb-4">📄 AI Lab Report</h2>

      <pre className="text-slate-300 whitespace-pre-wrap leading-relaxed">
        {generateLabReport(readings)}
      </pre>
    </div>
  );
}

/* ================= MAIN LAB ================= */
export default function OhmsLawLab() {
  const [voltage, setVoltage] = useState(12);
  const [resistance, setResistance] = useState(10);
  const [isOn, setIsOn] = useState(true);
  const [readings, setReadings] = useState([]);
  const [showReport, setShowReport] = useState(false);

  const current = isOn ? voltage / resistance : 0;
  const power = isOn ? voltage * current : 0;

  const addReading = () => {
    setReadings([
      ...readings,
      {
        voltage,
        resistance,
        current: current.toFixed(2),
        power: power.toFixed(2),
      },
    ]);
  };

  const clearData = () => setReadings([]);

  return (
    <div className="min-h-screen bg-black text-white p-6">

      {/* HEADER */}
      <h1 className="text-4xl font-bold mb-6">
        ⚡ PHET-LEVEL OHM’S LAW LAB v2
      </h1>

      {/* CONTROLS */}
      <div className="grid md:grid-cols-3 gap-6">

        <div className="bg-slate-900 p-4 rounded-xl">
          <h2 className="font-bold mb-2">Voltage (V)</h2>
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
          <h2 className="font-bold mb-2">Resistance (Ω)</h2>
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

        <div className="bg-slate-900 p-4 rounded-xl flex flex-col gap-3">
          <button
            onClick={() => setIsOn(!isOn)}
            className="bg-green-600 px-4 py-2 rounded-xl"
          >
            {isOn ? "ON" : "OFF"}
          </button>

          <button
            onClick={addReading}
            className="bg-cyan-600 px-4 py-2 rounded-xl"
          >
            Add Reading
          </button>

          <button
            onClick={clearData}
            className="bg-red-600 px-4 py-2 rounded-xl"
          >
            Clear
          </button>
        </div>
      </div>

      {/* LIVE VALUES */}
      <div className="bg-slate-900 mt-6 p-6 rounded-xl">
        <h2 className="text-xl font-bold mb-3">Live Physics Values</h2>

        <p>Voltage: {voltage} V</p>
        <p>Resistance: {resistance} Ω</p>
        <p>Current: {current.toFixed(2)} A</p>
        <p>Power: {power.toFixed(2)} W</p>
      </div>

      {/* DATA TABLE */}
      <div className="bg-slate-900 mt-6 p-6 rounded-xl">
        <h2 className="text-xl font-bold mb-3">Experiment Data</h2>

        {readings.length === 0 ? (
          <p className="text-slate-400">No data yet</p>
        ) : (
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-slate-700">
                <th>V</th>
                <th>R</th>
                <th>I</th>
                <th>P</th>
              </tr>
            </thead>
            <tbody>
              {readings.map((r, i) => (
                <tr key={i} className="border-b border-slate-800">
                  <td>{r.voltage}</td>
                  <td>{r.resistance}</td>
                  <td>{r.current}</td>
                  <td>{r.power}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* REPORT BUTTON */}
      <div className="mt-6">
        <button
          onClick={() => setShowReport(!showReport)}
          className="bg-purple-600 px-5 py-3 rounded-xl"
        >
          {showReport ? "Hide Report" : "Generate AI Lab Report"}
        </button>
      </div>

      {/* AI REPORT */}
      {showReport && <LabReport readings={readings} />}
    </div>
  );
}