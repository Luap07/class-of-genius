import React from "react";
import {
  Save,
  Trash2,
  RotateCcw,
} from "lucide-react";

export default function Toolbar({
  moleculeName,
  setMoleculeName,
  clearCanvas,
  saveProject,
  loadProject,
}) {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col md:flex-row md:items-center gap-4">

      {/* NAME */}
      <input
        value={moleculeName}
        onChange={(e) => setMoleculeName(e.target.value)}
        placeholder="Molecule name..."
        className="flex-1 px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white outline-none"
      />

      {/* ACTIONS */}
      <div className="flex gap-2">

        <button
          onClick={saveProject}
          className="flex items-center gap-2 px-4 py-2 bg-green-500/20 text-green-400 border border-green-500/30 rounded-xl"
        >
          <Save size={16} />
          Save
        </button>

        <button
          onClick={loadProject}
          className="flex items-center gap-2 px-4 py-2 bg-blue-500/20 text-blue-400 border border-blue-500/30 rounded-xl"
        >
          Load
        </button>

        <button
          onClick={clearCanvas}
          className="flex items-center gap-2 px-4 py-2 bg-red-500/20 text-red-400 border border-red-500/30 rounded-xl"
        >
          <Trash2 size={16} />
          Clear
        </button>

      </div>
    </div>
  );
}