import React, { useMemo, useState } from "react";
import {
  Search,
  FlaskConical,
  Check,
} from "lucide-react";

const CHEMICALS = [
  /* ==========================
            ACIDS
  ========================== */

  {
    id: 1,
    formula: "HCl",
    name: "Hydrochloric Acid",
    type: "Acid",
    color: "#ef4444",
    ph: 1,
    strength: "strong",
  },
  {
    id: 2,
    formula: "H₂SO₄",
    name: "Sulfuric Acid",
    type: "Acid",
    color: "#dc2626",
    ph: 1,
    strength: "strong",
  },
  {
    id: 3,
    formula: "HNO₃",
    name: "Nitric Acid",
    type: "Acid",
    color: "#f97316",
    ph: 2,
    strength: "strong",
  },
  {
    id: 4,
    formula: "CH₃COOH",
    name: "Acetic Acid",
    type: "Acid",
    color: "#fb7185",
    ph: 3,
    strength: "weak",
  },
  {
    id: 5,
    formula: "H₃PO₄",
    name: "Phosphoric Acid",
    type: "Acid",
    color: "#f472b6",
    ph: 2,
    strength: "weak",
  },
  {
    id: 6,
    formula: "HCOOH",
    name: "Formic Acid",
    type: "Acid",
    color: "#ec4899",
    ph: 2,
    strength: "weak",
  },
  {
    id: 7,
    formula: "HClO₄",
    name: "Perchloric Acid",
    type: "Acid",
    color: "#b91c1c",
    ph: 1,
    strength: "strong",
  },
  {
    id: 8,
    formula: "HF",
    name: "Hydrofluoric Acid",
    type: "Acid",
    color: "#f43f5e",
    ph: 2,
    strength: "weak",
  },
  {
    id: 9,
    formula: "HBr",
    name: "Hydrobromic Acid",
    type: "Acid",
    color: "#dc2626",
    ph: 1,
    strength: "strong",
  },
  {
    id: 10,
    formula: "HI",
    name: "Hydroiodic Acid",
    type: "Acid",
    color: "#991b1b",
    ph: 1,
    strength: "strong",
  },
  {
    id: 11,
    formula: "H₂C₂O₄",
    name: "Oxalic Acid",
    type: "Acid",
    color: "#db2777",
    ph: 2,
    strength: "weak",
  },

  /* ==========================
            BASES
  ========================== */

  {
    id: 12,
    formula: "NaOH",
    name: "Sodium Hydroxide",
    type: "Base",
    color: "#3b82f6",
    ph: 13,
    strength: "strong",
  },
  {
    id: 13,
    formula: "KOH",
    name: "Potassium Hydroxide",
    type: "Base",
    color: "#2563eb",
    ph: 14,
    strength: "strong",
  },
  {
    id: 14,
    formula: "Ca(OH)₂",
    name: "Calcium Hydroxide",
    type: "Base",
    color: "#60a5fa",
    ph: 12,
    strength: "strong",
  },
  {
    id: 15,
    formula: "NH₄OH",
    name: "Ammonium Hydroxide",
    type: "Base",
    color: "#38bdf8",
    ph: 11,
    strength: "weak",
  },
  {
    id: 16,
    formula: "LiOH",
    name: "Lithium Hydroxide",
    type: "Base",
    color: "#3b82f6",
    ph: 13,
    strength: "strong",
  },
  {
    id: 17,
    formula: "Ba(OH)₂",
    name: "Barium Hydroxide",
    type: "Base",
    color: "#2563eb",
    ph: 13,
    strength: "strong",
  },
  {
    id: 18,
    formula: "Mg(OH)₂",
    name: "Magnesium Hydroxide",
    type: "Base",
    color: "#60a5fa",
    ph: 10,
    strength: "weak",
  },
  {
    id: 19,
    formula: "Sr(OH)₂",
    name: "Strontium Hydroxide",
    type: "Base",
    color: "#1d4ed8",
    ph: 13,
    strength: "strong",
  },
  {
    id: 20,
    formula: "Al(OH)₃",
    name: "Aluminium Hydroxide",
    type: "Base",
    color: "#7dd3fc",
    ph: 9,
    strength: "weak",
  },
  {
    id: 21,
    formula: "RbOH",
    name: "Rubidium Hydroxide",
    type: "Base",
    color: "#1e40af",
    ph: 14,
    strength: "strong",
  },
  {
    id: 22,
    formula: "CsOH",
    name: "Cesium Hydroxide",
    type: "Base",
    color: "#0f172a",
    ph: 14,
    strength: "strong",
  },
];

export default function ChemicalShelf({
  selectedAcid,
  setSelectedAcid,
  selectedBase,
  setSelectedBase,
}) {
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    return CHEMICALS.filter(
      (chemical) =>
        chemical.name
          .toLowerCase()
          .includes(search.toLowerCase()) ||
        chemical.formula
          .toLowerCase()
          .includes(search.toLowerCase())
    );
  }, [search]);

  const handleSelect = (chemical) => {
    if (chemical.type === "Acid") {
      if (selectedAcid?.id === chemical.id) {
        setSelectedAcid(null);
      } else {
        setSelectedAcid(chemical);
      }
    }

    if (chemical.type === "Base") {
      if (selectedBase?.id === chemical.id) {
        setSelectedBase(null);
      } else {
        setSelectedBase(chemical);
      }
    }
  };

  return (
    <div className="bg-slate-900 rounded-3xl border border-slate-800 h-full flex flex-col overflow-hidden">

      <div className="p-4 border-b border-slate-800 flex items-center gap-3">

        <FlaskConical className="text-cyan-400" />

        <div>
          <h2 className="font-bold text-white">
            Chemical Shelf
          </h2>

          <p className="text-xs text-slate-400">
            Select one Acid and one Base
          </p>
        </div>

      </div>

      <div className="p-3">

        <div className="relative">

          <Search
            size={18}
            className="absolute left-3 top-3 text-slate-500"
          />

          <input
            value={search}
            onChange={(e) =>
              setSearch(e.target.value)
            }
            placeholder="Search chemical..."
            className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-10 pr-4 py-2 text-white focus:outline-none focus:border-cyan-500"
          />

        </div>

      </div>

      <div className="flex-1 overflow-y-auto px-3 pb-3 space-y-2">

        {filtered.map((chemical) => {

          const selected =
            chemical.type === "Acid"
              ? selectedAcid?.id === chemical.id
              : selectedBase?.id === chemical.id;

          return (
            <button
              key={chemical.id}
              onClick={() => handleSelect(chemical)}
              className={`w-full rounded-2xl border transition p-3 text-left ${
                selected
                  ? "border-green-500 bg-green-500/10"
                  : "border-slate-700 bg-slate-950 hover:border-cyan-500"
              }`}
            >

              <div className="flex items-center gap-3">

                <div
                  className="w-10 h-10 rounded-xl"
                  style={{
                    background: chemical.color,
                  }}
                />

                <div className="flex-1">

                  <h3 className="font-bold text-white">
                    {chemical.formula}
                  </h3>

                  <p className="text-xs text-slate-400">
                    {chemical.name}
                  </p>

                  <div className="flex gap-2 mt-1">

                    <span
                      className={`text-[10px] px-2 py-0.5 rounded-full ${
                        chemical.type === "Acid"
                          ? "bg-red-500/20 text-red-400"
                          : "bg-blue-500/20 text-blue-400"
                      }`}
                    >
                      {chemical.type}
                    </span>

                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-300">
                      pH {chemical.ph}
                    </span>

                  </div>

                </div>

                {selected && (
                  <Check className="text-green-400" />
                )}

              </div>

            </button>
          );
        })}

      </div>

      <div className="border-t border-slate-800 p-4 bg-slate-950">

        <div className="flex justify-between text-sm">

          <span className="text-red-400">
            Acid:
          </span>

          <span className="text-white">
            {selectedAcid
              ? selectedAcid.formula
              : "None"}
          </span>

        </div>

        <div className="flex justify-between text-sm mt-2">

          <span className="text-blue-400">
            Base:
          </span>

          <span className="text-white">
            {selectedBase
              ? selectedBase.formula
              : "None"}
          </span>

        </div>

      </div>

    </div>
  );
}