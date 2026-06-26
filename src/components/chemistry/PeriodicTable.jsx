import React, { useState } from "react";
import elements from "../../data/elements"; // ✅ ONLY import

const categoryStyles = {
  nonmetal: "from-cyan-500/20 to-cyan-600/10 border-cyan-500/30",
  noble: "from-purple-500/20 to-purple-600/10 border-purple-500/30",
  alkali: "from-red-500/20 to-red-600/10 border-red-500/30",
  alkaline: "from-orange-500/20 to-orange-600/10 border-orange-500/30",
  metalloid: "from-yellow-500/20 to-yellow-600/10 border-yellow-500/30",
  halogen: "from-green-500/20 to-green-600/10 border-green-500/30",
};

export default function PeriodicTable() {
  const [selected, setSelected] = useState(elements[0]);
  const [search, setSearch] = useState("");

  const filtered = elements.filter((e) =>
    e.name.toLowerCase().includes(search.toLowerCase()) ||
    e.symbol.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-4">

      {/* SEARCH */}
      <input
        type="text"
        placeholder="Search element..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-white outline-none"
      />

      {/* GRID */}
      <div className="grid grid-cols-2 md:grid-cols-5 lg:grid-cols-10 gap-3 mt-4">
        {filtered.map((element) => (
          <button
            key={element.number}
            onClick={() => setSelected(element)}
            className={`p-3 rounded-2xl border bg-gradient-to-br transition hover:scale-105 ${categoryStyles[element.category]}`}
          >
            <div className="text-xs text-slate-400">{element.number}</div>
            <div className="text-2xl font-bold text-white">
              {element.symbol}
            </div>
            <div className="text-xs text-slate-300 truncate">
              {element.name}
            </div>
            <div className="text-[10px] text-slate-500">
              {element.mass}
            </div>
          </button>
        ))}
      </div>

      {/* DETAILS */}
      {selected && (
        <div className="mt-6 bg-slate-900 border border-slate-700 rounded-2xl p-6">
          <h2 className="text-2xl font-bold text-white">
            {selected.name}
          </h2>

          <p className="text-slate-400">
            Atomic Number: {selected.number}
          </p>

          <p className="text-slate-400">
            Atomic Mass: {selected.mass}
          </p>

          <p className="text-slate-400">
            Category: {selected.category}
          </p>

          <div className="mt-4">
            <h3 className="text-white font-semibold mb-2">
              Electron Configuration
            </h3>

            <div className="bg-slate-800 p-4 rounded-xl text-cyan-400 font-mono">
              {selected.config}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}