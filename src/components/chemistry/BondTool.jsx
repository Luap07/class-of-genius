import React from "react";
import {
  Link2,
  Minus,
  Equal,
  Grip,
  Trash2,
  MousePointer2,
} from "lucide-react";

export default function BondTool({
  bondType,
  setBondType,
  bondMode,
  setBondMode,
  clearBonds,
}) {
  const bondButtons = [
    {
      id: "single",
      label: "Single",
      icon: Minus,
      color: "from-cyan-500 to-blue-600",
      description: "One shared electron pair",
    },
    {
      id: "double",
      label: "Double",
      icon: Equal,
      color: "from-purple-500 to-pink-600",
      description: "Two shared electron pairs",
    },
    {
      id: "triple",
      label: "Triple",
      icon: Grip,
      color: "from-orange-500 to-red-600",
      description: "Three shared electron pairs",
    },
  ];

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden">

      {/* HEADER */}
      <div className="p-5 border-b border-slate-800 flex items-center gap-3">
        <div className="w-11 h-11 rounded-xl bg-cyan-500/20 flex items-center justify-center">
          <Link2 className="text-cyan-400" size={22} />
        </div>

        <div>
          <h2 className="text-xl font-bold text-white">Bond Tool</h2>
          <p className="text-sm text-slate-400">Connect atoms together</p>
        </div>
      </div>

      {/* BOND TYPE */}
      <div className="p-5 space-y-4">
        <h3 className="text-sm uppercase tracking-wider text-slate-400">
          Bond Type
        </h3>

        {bondButtons.map((bond) => {
          const Icon = bond.icon;

          const isActive = bondType === bond.id;

          return (
            <button
              key={bond.id}
              onClick={() => setBondType(bond.id)}
              className={`
                w-full rounded-2xl border transition-all duration-300
                ${isActive
                  ? "border-cyan-400 bg-cyan-500/15 shadow-md shadow-cyan-500/20"
                  : "border-slate-700 bg-slate-950 hover:border-cyan-600"}
              `}
            >
              <div className="flex items-center gap-4 p-4">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center bg-gradient-to-br ${bond.color}`}>
                  <Icon className="text-white" size={22} />
                </div>

                <div className="text-left">
                  <h4 className="font-semibold text-white">{bond.label}</h4>
                  <p className="text-xs text-slate-400">{bond.description}</p>
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* BOND MODE */}
      <div className="px-5 pb-5">
        <button
          onClick={() => setBondMode((prev) => !prev)}
          className={`
            w-full rounded-2xl py-4 font-semibold transition-all duration-300
            flex items-center justify-center gap-3
            ${bondMode
              ? "bg-cyan-500 text-black"
              : "bg-slate-800 text-white hover:bg-slate-700"}
          `}
        >
          <MousePointer2 size={20} />
          {bondMode ? "Bond Mode Enabled" : "Enable Bond Mode"}
        </button>
      </div>

      {/* CLEAR */}
      <div className="border-t border-slate-800 p-5">
        <button
          onClick={clearBonds}
          className="w-full rounded-2xl py-4 bg-red-500/10 border border-red-500/30 hover:bg-red-500/20 flex items-center justify-center gap-3 text-red-400 font-semibold"
        >
          <Trash2 size={20} />
          Clear All Bonds
        </button>
      </div>

    </div>
  );
}