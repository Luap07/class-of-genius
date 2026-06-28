import React, { useState } from "react";
import {
  RotateCcw,
  Shuffle,
  Atom,
  Zap,
} from "lucide-react";

import elements from "../../../data/elements";

import AtomCanvas from "../../../components/chemistry/AtomCanvas";
import ParticleControls from "../../../components/chemistry/ParticleControls";
import AtomStats from "../../../components/chemistry/AtomStats";

export default function AtomBuilder() {
  const [protons, setProtons] = useState(1);
  const [neutrons, setNeutrons] = useState(0);
  const [electrons, setElectrons] = useState(1);

  const atomicNumber = protons;

  const element =
    elements.find((e) => e.number === atomicNumber) || null;

  const massNumber = protons + neutrons;
  const charge = protons - electrons;

  const atomType =
    charge === 0
      ? "Neutral Atom"
      : charge > 0
      ? "Positive Ion"
      : "Negative Ion";

  const isotope =
    neutrons !== Math.round(protons)
      ? "Isotope"
      : "Stable Atom";

  const resetAtom = () => {
    setProtons(1);
    setNeutrons(0);
    setElectrons(1);
  };

  const randomAtom = () => {
    const p = Math.floor(Math.random() * 20) + 1;
    setProtons(p);
    setNeutrons(p + Math.floor(Math.random() * 5));
    setElectrons(p);
  };

  const loadElement = (e) => {
    setProtons(e.number);
    setElectrons(e.number);
    setNeutrons(Math.round(e.number));
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white p-6">
      <div className="max-w-7xl mx-auto space-y-8">

        {/* HEADER */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">

          <div>
            <h1 className="text-4xl md:text-5xl font-bold text-cyan-400 flex items-center gap-3">
              <Atom size={36} />
              Atom Builder
            </h1>

            <p className="text-slate-400 mt-2">
              Build atoms, ions, and isotopes interactively.
            </p>
          </div>

          <div className="flex gap-3 flex-wrap">

            <button
              onClick={randomAtom}
              className="px-4 py-2 bg-purple-600 rounded-xl hover:bg-purple-500 flex items-center gap-2"
            >
              <Shuffle size={18} />
              Random
            </button>

            <button
              onClick={resetAtom}
              className="px-4 py-2 bg-red-600 rounded-xl hover:bg-red-500 flex items-center gap-2"
            >
              <RotateCcw size={18} />
              Reset
            </button>

          </div>

        </div>

        {/* STATUS CARDS */}
        <div className="grid md:grid-cols-3 gap-4">

          <div className="bg-slate-900 p-4 rounded-xl border border-slate-800">
            <p className="text-slate-400 text-sm">Atom Type</p>
            <h3 className="text-xl font-bold text-cyan-400">
              {atomType}
            </h3>
          </div>

          <div className="bg-slate-900 p-4 rounded-xl border border-slate-800">
            <p className="text-slate-400 text-sm">Isotope Status</p>
            <h3 className="text-xl font-bold text-yellow-400">
              {isotope}
            </h3>
          </div>

          <div className="bg-slate-900 p-4 rounded-xl border border-slate-800">
            <p className="text-slate-400 text-sm">Net Charge</p>
            <h3 className="text-xl font-bold text-green-400">
              {charge > 0 ? `+${charge}` : charge}
            </h3>
          </div>

        </div>

        {/* MAIN GRID */}
        <div className="grid lg:grid-cols-4 gap-6">

          {/* CONTROLS */}
          <div className="lg:col-span-1">
            <ParticleControls
              protons={protons}
              setProtons={setProtons}
              neutrons={neutrons}
              setNeutrons={setNeutrons}
              electrons={electrons}
              setElectrons={setElectrons}
            />
          </div>

          {/* CANVAS */}
          <div className="lg:col-span-2">
            <AtomCanvas
              protons={protons}
              neutrons={neutrons}
              electrons={electrons}
              element={element}
            />
          </div>

          {/* STATS */}
          <div className="lg:col-span-1">
            <AtomStats
              protons={protons}
              neutrons={neutrons}
              electrons={electrons}
              element={element}
            />
          </div>

        </div>

        {/* ELEMENT INFO */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">

          {element ? (
            <div className="grid md:grid-cols-2 gap-8">

              <div>
                <h2 className="text-3xl font-bold text-cyan-400">
                  {element.name}
                </h2>

                <p className="text-slate-400 text-lg">
                  {element.symbol}
                </p>

                <p className="mt-4 text-slate-300">
                  {element.description || "No description available."}
                </p>
              </div>

              <div className="space-y-2 text-slate-300">

                <p><strong>Atomic Number:</strong> {atomicNumber}</p>
                <p><strong>Mass Number:</strong> {massNumber}</p>
                <p><strong>Charge:</strong> {charge > 0 ? `+${charge}` : charge}</p>
                <p><strong>Category:</strong> {element.category}</p>
                <p><strong>Atomic Mass:</strong> {element.mass}</p>
                <p><strong>Electron Config:</strong> {element.config}</p>

              </div>

            </div>
          ) : (
            <div className="text-center py-10">
              <Zap size={50} className="mx-auto text-yellow-400" />
              <h2 className="text-2xl font-bold mt-4">
                Unknown Element
              </h2>
              <p className="text-slate-400">
                No element exists with atomic number {atomicNumber}
              </p>
            </div>
          )}

        </div>

      </div>
    </div>
  );
}