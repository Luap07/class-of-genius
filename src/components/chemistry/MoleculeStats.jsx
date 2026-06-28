import React, { useMemo } from "react";
import {
  Atom,
  Activity,
  FlaskConical,
  Target,
  Sparkles,
} from "lucide-react";

export default function MoleculeStats({
  atoms = [],
  moleculeName = "",
  selectedAtom = null,
}) {
  const stats = useMemo(() => {
    const composition = {};

    atoms.forEach((atom) => {
      composition[atom.symbol] =
        (composition[atom.symbol] || 0) + 1;
    });

    const formula = Object.entries(composition)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([symbol, count]) =>
        count > 1 ? `${symbol}${count}` : symbol
      )
      .join("");

    return {
      formula,
      composition,
    };
  }, [atoms]);

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-6 shadow-xl">

      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-2xl bg-cyan-500/20 flex items-center justify-center">
          <FlaskConical className="text-cyan-400" size={24} />
        </div>

        <div>
          <h2 className="text-2xl font-bold text-white">
            Molecule Statistics
          </h2>

          <p className="text-slate-400 text-sm">
            Live molecular analysis
          </p>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 gap-4">

        <div className="rounded-2xl bg-slate-800 p-4">
          <div className="flex items-center gap-2 text-cyan-400 mb-2">
            <Atom size={18} />
            <span>Atoms</span>
          </div>

          <p className="text-3xl font-bold">
            {atoms.length}
          </p>
        </div>

        <div className="rounded-2xl bg-slate-800 p-4">
          <div className="flex items-center gap-2 text-purple-400 mb-2">
            <Activity size={18} />
            <span>Formula</span>
          </div>

          <p className="text-xl font-mono font-bold text-white">
            {stats.formula || "--"}
          </p>
        </div>

      </div>

      {/* Molecule Name */}
      <div className="rounded-2xl bg-slate-800 p-5">

        <div className="flex items-center gap-2 mb-2">
          <Sparkles size={18} className="text-yellow-400" />

          <span className="font-semibold">
            Molecule
          </span>
        </div>

        <h3 className="text-2xl font-bold text-cyan-400">
          {moleculeName || "Unnamed Molecule"}
        </h3>

      </div>

      {/* Composition */}
      <div className="rounded-2xl bg-slate-800 p-5">

        <h3 className="font-semibold mb-4">
          Composition
        </h3>

        {Object.keys(stats.composition).length === 0 ? (
          <p className="text-slate-500">
            No atoms added.
          </p>
        ) : (
          <div className="space-y-3">
            {Object.entries(stats.composition).map(
              ([symbol, count]) => (
                <div
                  key={symbol}
                  className="flex justify-between"
                >
                  <span>{symbol}</span>

                  <span className="text-cyan-400 font-bold">
                    {count}
                  </span>
                </div>
              )
            )}
          </div>
        )}

      </div>

      {/* Selected Atom */}
      <div className="rounded-2xl bg-slate-800 p-5">

        <div className="flex items-center gap-2 mb-3">
          <Target size={18} className="text-green-400" />

          <span className="font-semibold">
            Selected Atom
          </span>
        </div>

        {selectedAtom ? (
          <div className="space-y-2">

            <div className="flex justify-between">
              <span>Element</span>
              <span className="font-bold">
                {selectedAtom.name}
              </span>
            </div>

            <div className="flex justify-between">
              <span>Symbol</span>
              <span className="text-cyan-400 font-bold">
                {selectedAtom.symbol}
              </span>
            </div>

            <div className="flex justify-between">
              <span>Atomic Number</span>
              <span>
                {selectedAtom.atomicNumber}
              </span>
            </div>

            <div className="flex justify-between">
              <span>Position</span>
              <span>
                ({Math.round(selectedAtom.x)}, {Math.round(selectedAtom.y)})
              </span>
            </div>

          </div>
        ) : (
          <p className="text-slate-500">
            Click an atom to inspect it.
          </p>
        )}

      </div>

    </div>
  );
}