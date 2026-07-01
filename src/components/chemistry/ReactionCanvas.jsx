import React from "react";

export default function ReactionCanvas({ reactants, products }) {
  return (
    <div className="bg-slate-900 rounded-3xl p-6 h-full border border-slate-800">
      <h2 className="text-white mb-4">Beaker</h2>
      <div className="flex flex-wrap gap-2">
        {/* Show Reactants */}
        {reactants.map(r => (
          <span key={r.id} className="bg-blue-900 px-3 py-1 rounded text-white">{r.name}</span>
        ))}
        {/* Show Products if reaction finished */}
        {products.map(p => (
          <span key={p.id} className="bg-emerald-900 px-3 py-1 rounded text-white italic">{p.name}</span>
        ))}
      </div>
    </div>
  );
}