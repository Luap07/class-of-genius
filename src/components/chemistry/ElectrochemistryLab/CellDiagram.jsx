// src/pages/labs/chemistry/components/CellDiagram.jsx

import React from "react";
import { Beaker, Zap } from "lucide-react";

const CellDiagram = ({
  anode,
  cathode,
  anodeElectrolyte = "ZnSO₄",
  cathodeElectrolyte = "CuSO₄",
  voltage = 0,
  running = false,
  children,
}) => {
  // Defensive calculation for display
  const displayVoltage = Number(voltage ?? 0);

  return (
    <div className="bg-slate-900 h-[210vh] border border-slate-700 rounded-2xl shadow-xl overflow-hidden">
      {/* ================= HEADER ================= */}
      <div className="border-b border-slate-700 bg-slate-800 px-6 py-4 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Electrochemical Cell</h2>
          <p className="text-slate-400 text-sm mt-1">Interactive Galvanic Cell Simulation</p>
        </div>

        <div className="flex items-center gap-3">
          <div className={`px-3 py-1 rounded-full text-xs font-semibold ${running ? "bg-green-600/20 text-green-400" : "bg-slate-700 text-slate-300"}`}>
            {running ? "RUNNING" : "STOPPED"}
          </div>
          <div className="flex items-center gap-2 bg-slate-700 rounded-lg px-4 py-2">
            <Zap className="w-5 h-5 text-yellow-400" />
            <span className="font-bold text-white">{displayVoltage.toFixed(2)} V</span>
          </div>
        </div>
      </div>

      {/* ================= WORKSPACE ================= */}
      <div className="relative h-[200vh] bg-gradient-to-b from-slate-950 to-slate-900 overflow-hidden">
        {children}

        {/* ================= INDICATORS & GLOWS ================= */}
        <div className="absolute top-28 left-1/2 -translate-x-1/2">
          <div className="flex items-center gap-3 bg-slate-800 border border-slate-700 rounded-full px-5 py-2">
            <div className={`w-3 h-3 rounded-full ${running ? "bg-green-400 animate-pulse" : "bg-red-400"}`} />
            <span className="text-white mb-6  font-medium">{running ? "Current Flowing" : "No Current"}</span>
          </div>
        </div>

        {running && (
          <>
            <div className="absolute left-[165px] top-[125px] w-10 h-10 rounded-full bg-red-500/30 blur-xl animate-pulse" />
            <div className="absolute right-[165px] top-[125px] w-10 h-10 rounded-full bg-green-500/30 blur-xl animate-pulse" />
          </>
        )}

        {/* ================= BEAKERS (Anode/Cathode) ================= */}
        {/* Anode */}
        <div className="absolute left-10 bottom-14 w-72">
          <div className="flex items-center gap-2 mb-3">
            <Beaker className="w-5 h-5 text-cyan-400" />
            <h3 className="text-lg font-semibold text-white">Anode Half-Cell</h3>
          </div>
          <div className="relative h-80 border-4 border-cyan-300 rounded-b-[40px] rounded-t-xl overflow-hidden bg-slate-800">
            <div className="absolute bottom-0 left-0 right-0 h-52 bg-blue-500/40 backdrop-blur-sm" />
            <div className="absolute left-1/2 -translate-x-1/2 top-0 w-8 h-56 rounded bg-gray-300 shadow-lg" />
            <div className="absolute top-60 left-1/2 -translate-x-1/2 text-center">
              <h3 className="text-xl font-bold text-white">{anode?.symbol || "--"}</h3>
              <p className="text-sm text-slate-300">{anode?.name || "Select Electrode"}</p>
            </div>
            <div className="absolute bottom-4 left-0 right-0 text-center">
              <span className="inline-block bg-slate-900/80 px-4 py-2 rounded-lg text-cyan-300 font-semibold">{anodeElectrolyte}</span>
            </div>
          </div>
        </div>

        {/* Cathode */}
        <div className="absolute right-10 bottom-14 w-72">
          <div className="flex items-center gap-2 mb-3 justify-end">
            <h3 className="text-lg font-semibold text-white">Cathode Half-Cell</h3>
            <Beaker className="w-5 h-5 text-green-400" />
          </div>
          <div className="relative h-80 border-4 border-green-300 rounded-b-[40px] rounded-t-xl overflow-hidden bg-slate-800">
            <div className="absolute bottom-0 left-0 right-0 h-52 bg-blue-500/40 backdrop-blur-sm" />
            <div className="absolute left-1/2 -translate-x-1/2 top-0 w-8 h-56 rounded bg-orange-400 shadow-lg" />
            <div className="absolute top-60 left-1/2 -translate-x-1/2 text-center">
              <h3 className="text-xl font-bold text-white">{cathode?.symbol || "--"}</h3>
              <p className="text-sm text-slate-300">{cathode?.name || "Select Electrode"}</p>
            </div>
            <div className="absolute bottom-4 left-0 right-0 text-center">
              <span className="inline-block bg-slate-900/80 px-4 py-2 rounded-lg text-green-300 font-semibold">{cathodeElectrolyte}</span>
            </div>
          </div>
        </div>

        {/* ================= UI OVERLAYS ================= */}
        <div className="absolute right-6 top-4">
          <div className="bg-black/70 backdrop-blur border border-yellow-500 rounded-xl px-4 py-3">
            <p className="text-xs uppercase tracking-widest text-yellow-400">Standard Potential</p>
            <h2 className="text-3xl font-bold text-yellow-300 mt-1">{displayVoltage.toFixed(2)} V</h2>
          </div>
        </div>

        <div className="absolute left-6 top-18">
          <div className="bg-slate-800/90 backdrop-blur border border-slate-700 rounded-xl p-4 w-60">
            <h3 className="text-white font-semibold ">Diagram Legend</h3>
            <div className="space-y-2 text-sm">
              <div className="flex items-center justify-between"><span className="text-slate-300">Red Electrode</span><span className="text-red-400">Anode</span></div>
              <div className="flex items-center justify-between"><span className="text-slate-300">Green Electrode</span><span className="text-green-400">Cathode</span></div>
              <div className="flex items-center justify-between"><span className="text-slate-300">Wire</span><span className="text-cyan-300">Electron Path</span></div>
              <div className="flex items-center justify-between"><span className="text-slate-300">Salt Bridge</span><span className="text-blue-300">Ion Path</span></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CellDiagram;