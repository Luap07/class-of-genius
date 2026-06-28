import React, { useMemo, useState } from "react";
import { Search, FlaskConical, Plus, Check } from "lucide-react";

const DEFAULT_REACTANTS = [
  { id: 1, formula: "HCl", name: "Hydrochloric Acid", color: "#ef4444", type: "Acid", state: "aq" },
  { id: 2, formula: "NaOH", name: "Sodium Hydroxide", color: "#3b82f6", type: "Base", state: "aq" },
  { id: 3, formula: "AgNO₃", name: "Silver Nitrate", color: "#e5e7eb", type: "Salt", state: "aq" },
  { id: 4, formula: "NaCl", name: "Sodium Chloride", color: "#f8fafc", type: "Salt", state: "s" },
  { id: 5, formula: "CuSO₄", name: "Copper Sulfate", color: "#2563eb", type: "Salt", state: "aq" },
  { id: 6, formula: "Zn", name: "Zinc", color: "#9ca3af", type: "Metal", state: "s" },
  { id: 7, formula: "Mg", name: "Magnesium", color: "#d1d5db", type: "Metal", state: "s" },
  { id: 8, formula: "H₂SO₄", name: "Sulfuric Acid", color: "#f97316", type: "Acid", state: "aq" },
  { id: 9, formula: "NH₃", name: "Ammonia", color: "#22c55e", type: "Base", state: "aq" },
  { id: 10, formula: "CaCO₃", name: "Calcium Carbonate", color: "#f8fafc", type: "Solid", state: "s" },
];

export default function ReactantShelf({ reactants = [], setReactants = () => {} }) {
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    const s = search.toLowerCase();
    return DEFAULT_REACTANTS.filter(
      (c) => c.name.toLowerCase().includes(s) || c.formula.toLowerCase().includes(s)
    );
  }, [search]);

  // Toggle function: Adds if not present, removes if already selected
  const toggleChemical = (chemical) => {
    const isSelected = reactants.some((r) => r.id === chemical.id);
    
    if (isSelected) {
      setReactants(reactants.filter((r) => r.id !== chemical.id));
    } else {
      setReactants([...reactants, { ...chemical, x: 0, y: 0 }]);
    }
  };

  return (
    <div className="bg-slate-900 h-full flex flex-col rounded-3xl border border-slate-800 overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-slate-800 flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-cyan-500/20 flex items-center justify-center shrink-0">
          <FlaskConical className="text-cyan-400" size={20} />
        </div>
        <div>
          <h2 className="font-bold text-white">Reactants</h2>
          <p className="text-xs text-slate-400">Available Chemicals</p>
        </div>
      </div>

      {/* Search */}
      <div className="p-3">
        <div className="relative">
          <Search size={16} className="absolute left-3 top-3.5 text-slate-500" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search..."
            className="w-full rounded-xl bg-slate-950 border border-slate-700 pl-10 pr-4 py-2.5 text-sm text-white outline-none focus:border-cyan-500 transition-colors"
          />
        </div>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto px-3 pb-4 space-y-2">
        {filtered.map((chemical) => {
          const isSelected = reactants.some((r) => r.id === chemical.id);
          return (
            <button
              key={chemical.id}
              onClick={() => toggleChemical(chemical)}
              className={`w-full rounded-xl border p-3 transition-all duration-300 text-left ${
                isSelected 
                  ? "border-green-500/50 bg-green-500/10" 
                  : "border-slate-700 bg-slate-950 hover:border-cyan-500"
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg shrink-0 border border-white/10" style={{ background: chemical.color }} />
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-white text-sm truncate">{chemical.formula}</h3>
                  <p className="text-[11px] text-slate-400 truncate">{chemical.name}</p>
                </div>
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${isSelected ? "bg-green-500 text-white" : "bg-slate-800 text-slate-400"}`}>
                  {isSelected ? <Check size={16} /> : <Plus size={16} />}
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Footer */}
      <div className="border-t border-slate-800 p-3 flex justify-between items-center bg-slate-950">
        <span className="text-xs text-slate-400">Total Selected</span>
        <span className="font-bold text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded-md text-xs">{reactants.length}</span>
      </div>
    </div>
  );
}