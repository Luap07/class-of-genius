import React, { useMemo, useState } from "react";
import { Search, Atom, X } from "lucide-react";
import elements from "../../data/elements";

export default function AtomPalette({ onAddAtom }) {
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);

  const filteredElements = useMemo(() => {
    return elements.filter((el) => {
      const q = search.toLowerCase();
      return (
        el.name.toLowerCase().includes(q) ||
        el.symbol.toLowerCase().includes(q) ||
        String(el.number).includes(q)
      );
    });
  }, [search]);

  const handleDragStart = (e, element) => {
    e.dataTransfer.setData(
      "application/json",
      JSON.stringify(element)
    );
    e.dataTransfer.effectAllowed = "copy";
  };

  /* ================= CLOSED STATE ================= */
  if (!open) {
    return (
      <div className="flex items-center justify-center h-full">
        <button
          onClick={() => setOpen(true)}
          className="w-16 h-16 rounded-2xl bg-cyan-500/20 border border-cyan-500 flex items-center justify-center hover:scale-110 transition"
        >
          <Atom className="text-cyan-400" size={30} />
        </button>
      </div>
    );
  }

  /* ================= OPEN STATE ================= */
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden h-full flex flex-col">

      {/* HEADER */}
      <div className="p-4 border-b border-slate-800 flex items-center justify-between">
        
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-cyan-500/20 flex items-center justify-center">
            <Atom className="text-cyan-400" size={20} />
          </div>

          <div>
            <h2 className="text-lg font-bold text-white">
              Atom Palette
            </h2>
            <p className="text-xs text-slate-400">
              Click or drag atoms
            </p>
          </div>
        </div>

        <button
          onClick={() => setOpen(false)}
          className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700"
        >
          <X size={18} />
        </button>
      </div>

      {/* SEARCH */}
      <div className="p-4 border-b border-slate-800">
        <div className="relative">
          <Search
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"
          />

          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search element..."
            className="w-full bg-slate-950 border border-slate-700 rounded-xl py-2 pl-10 pr-3 outline-none focus:border-cyan-500 text-sm"
          />
        </div>
      </div>

      {/* GRID (PERIODIC STYLE) */}
      <div className="flex-1 overflow-y-auto p-3">
        <div className="grid grid-cols-10 gap-2">

          {filteredElements.map((element) => (
            <div
              key={element.number}
              draggable
              onDragStart={(e) => handleDragStart(e, element)}
              onClick={() => onAddAtom(element)}
              className="
                group
                cursor-grab
                active:cursor-grabbing
                bg-slate-950
                border border-slate-800
                hover:border-cyan-500
                rounded-lg
                p-2
                flex flex-col items-center justify-center
                transition
                hover:scale-105
              "
            >
              {/* SYMBOL */}
              <div className="w-9 h-9 rounded-md bg-cyan-500/20 flex items-center justify-center text-cyan-400 font-bold text-sm">
                {element.symbol}
              </div>

              {/* NUMBER */}
              <div className="text-[9px] text-slate-500 mt-1">
                {element.number}
              </div>
            </div>
          ))}

        </div>
      </div>
    </div>
  );
}