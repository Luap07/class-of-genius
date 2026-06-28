import React, { useState } from "react";
import elements from "../../data/elements";

const categoryStyles = {
  nonmetal: "from-cyan-500/20 to-cyan-600/10 border-cyan-500/30",
  noble: "from-purple-500/20 to-purple-600/10 border-purple-500/30",
  alkali: "from-red-500/20 to-red-600/10 border-red-500/30",
  alkaline: "from-orange-500/20 to-orange-600/10 border-orange-500/30",
  metalloid: "from-yellow-500/20 to-yellow-600/10 border-yellow-500/30",
  halogen: "from-green-500/20 to-green-600/10 border-green-500/30",
};

const StatCard = ({ label, value }) => {
  return (
    <div className="bg-slate-900 border border-slate-700 rounded-xl p-4 text-center">
      <p className="text-slate-400 text-sm">{label}</p>
      <p className="text-white text-xl font-bold mt-1">{value}</p>
    </div>
  );
};

export default function PeriodicTable() {
  const [selectedElement, setSelectedElement] = useState(
    elements.length > 0 ? elements[0] : null
  );

  const [search, setSearch] = useState("");

  const filteredElements = elements.filter(
    (element) =>
      element.name.toLowerCase().includes(search.toLowerCase()) ||
      element.symbol.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-4 mt-3">

      {/* SEARCH */}
      <input
        type="text"
        placeholder="Search element..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-white outline-none"
      />

      {/* ELEMENT GRID */}
      <div className="grid grid-cols-2 md:grid-cols-5 lg:grid-cols-10 gap-3 mt-4">
        {filteredElements.map((element) => (
          <button
            key={element.number}
            onClick={() => setSelectedElement(element)}
            className={`p-3 rounded-2xl border bg-gradient-to-br transition duration-300 hover:scale-105 ${
              categoryStyles[element.category] ||
              "from-slate-700/20 to-slate-800/10 border-slate-600"
            }`}
          >
            <div className="text-xs text-slate-400">
              {element.number}
            </div>

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

      {/* DETAILS PANEL */}
      {selectedElement && (
        <div className="mt-6 bg-slate-900 border border-slate-700 rounded-2xl p-6">
          <h2 className="text-3xl font-bold text-white">
            {selectedElement.name}
          </h2>

          <div className="mt-4 space-y-2">
            <p className="text-slate-300">
              Atomic Number: {selectedElement.number}
            </p>

            <p className="text-slate-300">
              Symbol: {selectedElement.symbol}
            </p>

            <p className="text-slate-300">
              Atomic Mass: {selectedElement.mass}
            </p>

            <p className="text-slate-300">
              Category: {selectedElement.category}
            </p>
          </div>

          <div className="mt-6">
            <h3 className="text-white font-semibold mb-2">
              Electron Configuration
            </h3>

            <div className="bg-slate-800 rounded-xl p-4 text-cyan-400 font-mono">
              {selectedElement.config || "Not Available"}
            </div>
          </div>
        </div>
      )}

      {/* STATS SECTION */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
        <StatCard
          label="Total Elements"
          value={elements.length}
        />

        <StatCard
          label="Selected"
          value={selectedElement?.symbol || "--"}
        />

        <StatCard
          label="Atomic Number"
          value={selectedElement?.number || "--"}
        />

        <StatCard
          label="Category"
          value={selectedElement?.category || "--"}
        />
      </div>

    </div>
  );
}