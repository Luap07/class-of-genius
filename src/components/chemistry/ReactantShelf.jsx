import React, { useMemo, useState } from "react";
import { Search, FlaskConical, Plus, Check } from "lucide-react";

const DEFAULT_REACTANTS = [
  { id: 1, formula: "HCl", name: "Hydrochloric Acid", color: "#ef4444" },
  { id: 2, formula: "NaOH", name: "Sodium Hydroxide", color: "#3b82f6" },
  { id: 3, formula: "AgNO₃", name: "Silver Nitrate", color: "#e5e7eb" },
  { id: 4, formula: "NaCl", name: "Sodium Chloride", color: "#f8fafc" },
];

export default function ReactantShelf({ reactants, setReactants }) {
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    return DEFAULT_REACTANTS.filter(
      (c) => c.name.toLowerCase().includes(search.toLowerCase()) || 
             c.formula.toLowerCase().includes(search.toLowerCase())
    );
  }, [search]);

  const toggleChemical = (chemical) => {
    const isSelected = reactants.some((r) => r.id === chemical.id);
    if (isSelected) {
      setReactants(reactants.filter((r) => r.id !== chemical.id));
    } else {
      setReactants([...reactants, chemical]);
    }
  };

  return (
    <div className="bg-slate-900 h-full flex flex-col rounded-3xl border border-slate-800 overflow-hidden">
      <div className="p-4 border-b border-slate-800 flex items-center gap-3">
        <FlaskConical className="text-cyan-400" />
        <h2 className="font-bold text-white">Reactants</h2>
      </div>
      <div className="p-3">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search..."
          className="w-full rounded-xl bg-slate-950 border border-slate-700 p-2 text-white"
        />
      </div>
      <div className="flex-1 overflow-y-auto px-3 space-y-2">
        {filtered.map((chemical) => {
          const isSelected = reactants.some((r) => r.id === chemical.id);
          return (
            <button
              key={chemical.id}
              onClick={() => toggleChemical(chemical)}
              className={`w-full rounded-xl p-3 text-left border ${isSelected ? "border-green-500 bg-green-900/20" : "border-slate-700 bg-slate-950"}`}
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg" style={{ background: chemical.color }} />
                <div className="flex-1 text-white">
                  <div className="font-bold">{chemical.formula}</div>
                  <div className="text-[10px] text-slate-400">{chemical.name}</div>
                </div>
                {isSelected ? <Check className="text-green-500" /> : <Plus className="text-slate-500" />}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}