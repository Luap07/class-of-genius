// src/pages/labs/chemistry/ElectrochemistryLab.jsx

import React from "react";
import ElectrochemicalCell from "../../../components/chemistry/ElectrochemistryLab/ElectrochemicalCell";

const ElectrochemistryLab = () => {
  return (
    <div className="min-h-screen bg-slate-950 text-white p-4 lg:p-8">

      {/* ================= HEADER ================= */}

      <div className="mb-6">

        <h1 className="text-3xl lg:text-4xl font-bold bg-gradient-to-r from-cyan-400 to-green-400 bg-clip-text text-transparent">

          ⚡ Electrochemistry Virtual Lab

        </h1>

        <p className="text-slate-400 mt-2 text-sm lg:text-base">

          Build galvanic cells, observe electron flow, and calculate cell potential in real time.

        </p>

      </div>

      {/* ================= MAIN LAB ================= */}

      <div className="max-w-7xl mx-auto">

        <ElectrochemicalCell />

      </div>

    </div>
  );
};

export default ElectrochemistryLab;