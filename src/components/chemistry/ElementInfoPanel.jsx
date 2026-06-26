import React from "react";
import AtomicModel from "./AtomicModel";

export default function ElementInfoPanel({ element }) {
  if (!element) {
    return (
      <div className="bg-[#081827] border border-slate-800 rounded-2xl p-6">
        <div className="text-center text-slate-400">
          Select an element
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#081827] border border-slate-800 rounded-2xl p-6">

      {/* Symbol */}
      <div className="flex flex-col items-center">
        <div
          className="
            w-24
            h-24
            rounded-full
            border
            border-cyan-500/30
            bg-cyan-500/10
            flex
            items-center
            justify-center
            text-5xl
            font-bold
            text-cyan-400
          "
        >
          {element.symbol}
        </div>

        <h2 className="text-2xl font-bold text-white mt-4">
          {element.name}
        </h2>

        <p className="text-slate-400 capitalize">
          {element.category}
        </p>
      </div>

      {/* Atomic Model */}
      <div className="mt-6">
        <AtomicModel element={element} />
      </div>

      {/* Properties */}
      <div className="mt-6 space-y-3">

        <div className="flex justify-between border-b border-slate-800 pb-2">
          <span className="text-slate-400">
            Atomic Number
          </span>

          <span className="text-white font-medium">
            {element.number}
          </span>
        </div>

        <div className="flex justify-between border-b border-slate-800 pb-2">
          <span className="text-slate-400">
            Atomic Mass
          </span>

          <span className="text-white font-medium">
            {element.mass}
          </span>
        </div>

        <div className="flex justify-between border-b border-slate-800 pb-2">
          <span className="text-slate-400">
            Symbol
          </span>

          <span className="text-white font-medium">
            {element.symbol}
          </span>
        </div>

        <div className="flex justify-between border-b border-slate-800 pb-2">
          <span className="text-slate-400">
            Category
          </span>

          <span className="text-white font-medium capitalize">
            {element.category}
          </span>
        </div>

      </div>

      {/* Electron Configuration */}
      <div className="mt-6">
        <h3 className="text-white font-semibold mb-2">
          Electron Configuration
        </h3>

        <div
          className="
            bg-slate-900
            border
            border-slate-700
            rounded-xl
            p-4
            font-mono
            text-cyan-400
          "
        >
          {element.config}
        </div>
      </div>

      {/* Description */}
      {element.description && (
        <div className="mt-6">
          <h3 className="text-white font-semibold mb-2">
            Description
          </h3>

          <p className="text-slate-400 text-sm leading-relaxed">
            {element.description}
          </p>
        </div>
      )}

    </div>
  );
}