import React from "react";
import { ArrowRight } from "lucide-react";

export default function ReactionEquation({
  reactants = [],
  products = [],
  selectedReaction = null,
}) {
  const renderSide = (items, emptyText) => {
    if (!items.length) {
      return (
        <span className="text-slate-500 italic">
          {emptyText}
        </span>
      );
    }

    return items.map((item, index) => (
      <React.Fragment key={item.id || `${item.formula}-${index}`}>
        <span className="px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white font-semibold">
          {item.formula || item.symbol || item.name}
        </span>

        {index < items.length - 1 && (
          <span className="text-cyan-400 font-bold text-xl">
            +
          </span>
        )}
      </React.Fragment>
    ));
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6">

      {/* ================= HEADER ================= */}

      <div className="flex items-center justify-between mb-6">

        <div>
          <h2 className="text-xl font-bold text-white">
            Chemical Equation
          </h2>

          <p className="text-sm text-slate-400 mt-1">
            Balanced reaction preview
          </p>
        </div>

        <span className="px-3 py-2 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-sm font-semibold">
          {selectedReaction || "No Reaction"}
        </span>

      </div>

      {/* ================= EQUATION ================= */}

      <div
        className="
          rounded-2xl
          border
          border-slate-700
          bg-slate-950
          p-8
        "
      >
        <div
          className="
            flex
            flex-wrap
            items-center
            justify-center
            gap-4
            text-lg
          "
        >

          {/* Reactants */}

          {renderSide(
            reactants,
            "Add Reactants"
          )}

          {/* Arrow */}

          <ArrowRight
            size={32}
            className="text-cyan-400 mx-4"
          />

          {/* Products */}

          {renderSide(
            products,
            "Products"
          )}

        </div>
      </div>

      {/* ================= SUMMARY ================= */}

      <div className="grid grid-cols-3 gap-4 mt-6">

        <div className="rounded-2xl bg-slate-950 border border-slate-800 p-4 text-center">
          <div className="text-2xl font-bold text-cyan-400">
            {reactants.length}
          </div>

          <div className="text-sm text-slate-400 mt-1">
            Reactants
          </div>
        </div>

        <div className="rounded-2xl bg-slate-950 border border-slate-800 p-4 text-center">
          <div className="text-2xl font-bold text-emerald-400">
            {products.length}
          </div>

          <div className="text-sm text-slate-400 mt-1">
            Products
          </div>
        </div>

        <div className="rounded-2xl bg-slate-950 border border-slate-800 p-4 text-center">
          <div className="text-2xl font-bold text-purple-400">
            {reactants.length + products.length}
          </div>

          <div className="text-sm text-slate-400 mt-1">
            Molecules
          </div>
        </div>

      </div>

    </div>
  );
}