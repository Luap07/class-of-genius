import React from "react";
import {
  X,
  CheckCircle2,
  AlertTriangle,
  FlaskConical,
  Sparkles,
  Beaker,
} from "lucide-react";

export default function ResultModal({
  open = false,
  onClose,
  reaction = null,
}) {
  if (!open || !reaction) return null;

  const success =
    reaction.success ?? true;

  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/70 backdrop-blur-sm">

      {/* Window */}

      <div className="w-full max-w-2xl rounded-3xl bg-slate-900 border border-slate-700 shadow-2xl overflow-hidden">

        {/* Header */}

        <div
          className={`flex items-center justify-between px-6 py-5 border-b ${
            success
              ? "border-cyan-500/30"
              : "border-red-500/30"
          }`}
        >
          <div className="flex items-center gap-4">

            <div
              className={`w-14 h-14 rounded-2xl flex items-center justify-center ${
                success
                  ? "bg-cyan-500/20"
                  : "bg-red-500/20"
              }`}
            >
              {success ? (
                <CheckCircle2
                  size={30}
                  className="text-cyan-400"
                />
              ) : (
                <AlertTriangle
                  size={30}
                  className="text-red-400"
                />
              )}
            </div>

            <div>

              <h2 className="text-2xl font-bold text-white">
                {success
                  ? "Reaction Complete"
                  : "Reaction Failed"}
              </h2>

              <p className="text-slate-400 text-sm">
                Chemistry Laboratory
              </p>

            </div>

          </div>

          <button
            onClick={onClose}
            className="w-10 h-10 rounded-xl bg-slate-800 hover:bg-slate-700 flex items-center justify-center"
          >
            <X size={20} />
          </button>
        </div>

        {/* Body */}

        <div className="p-6 space-y-6">

          {/* Equation */}

          <div className="rounded-2xl bg-slate-950 border border-slate-800 p-5">

            <div className="flex items-center gap-3 mb-3">

              <FlaskConical
                className="text-cyan-400"
                size={22}
              />

              <h3 className="font-semibold text-white">
                Balanced Equation
              </h3>

            </div>

            <div className="text-center text-2xl font-bold text-cyan-300">

              {reaction.equation}

            </div>

          </div>

          {/* Products */}

          <div className="rounded-2xl bg-slate-950 border border-slate-800 p-5">

            <div className="flex items-center gap-3 mb-4">

              <Beaker
                size={22}
                className="text-green-400"
              />

              <h3 className="font-semibold text-white">
                Products Formed
              </h3>

            </div>

            <div className="grid grid-cols-2 gap-3">

              {(reaction.products || []).map((item) => (

                <div
                  key={item}
                  className="rounded-xl bg-slate-800 p-3 text-center text-white"
                >
                  {item}
                </div>

              ))}

            </div>

          </div>

          {/* Observation */}

          <div className="rounded-2xl bg-slate-950 border border-slate-800 p-5">

            <div className="flex items-center gap-3 mb-3">

              <Sparkles
                size={22}
                className="text-yellow-400"
              />

              <h3 className="font-semibold text-white">
                Observation
              </h3>

            </div>

            <p className="text-slate-300 leading-relaxed">
              {reaction.observation}
            </p>

          </div>

          {/* Energy */}

          <div className="grid grid-cols-2 gap-4">

            <div className="rounded-2xl bg-slate-950 border border-slate-800 p-5">

              <div className="text-sm text-slate-400">
                Energy Change
              </div>

              <div
                className={`mt-2 text-xl font-bold ${
                  reaction.energy === "Exothermic"
                    ? "text-red-400"
                    : "text-cyan-400"
                }`}
              >
                {reaction.energy}
              </div>

            </div>

            <div className="rounded-2xl bg-slate-950 border border-slate-800 p-5">

              <div className="text-sm text-slate-400">
                Reaction Type
              </div>

              <div className="mt-2 text-xl font-bold text-green-400">
                {reaction.type}
              </div>

            </div>

          </div>

          {/* Safety */}

          <div className="rounded-2xl border border-yellow-500/30 bg-yellow-500/10 p-5">

            <h3 className="font-bold text-yellow-300 mb-2">
              Safety Notes
            </h3>

            <p className="text-yellow-100">
              {reaction.safety}
            </p>

          </div>

        </div>

        {/* Footer */}

        <div className="border-t border-slate-800 p-5 flex justify-end">

          <button
            onClick={onClose}
            className="px-8 py-3 rounded-2xl bg-cyan-500 hover:bg-cyan-400 text-black font-bold transition"
          >
            Continue Experiment
          </button>

        </div>

      </div>
    </div>
  );
}