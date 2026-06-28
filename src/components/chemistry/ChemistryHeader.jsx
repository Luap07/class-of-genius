import React, { useState } from "react";
import { Bot, FileText, FlaskConical } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function ChemistryHeader() {
  const [showReport, setShowReport] = useState(false);
  const navigate = useNavigate();

  const today = new Date().toLocaleDateString();

  return (
    <>
      <header className="relative h-20 border-b border-slate-800 bg-[#050816] overflow-hidden flex items-center justify-between px-8">

        {/* Background */}
        <div className="absolute inset-0 overflow-hidden">

          <div className="absolute top-0 right-20 w-96 h-96 bg-green-500/10 blur-[120px] rounded-full" />
          <div className="absolute top-0 right-72 w-80 h-80 bg-emerald-500/10 blur-[120px] rounded-full" />

          {/* Molecules */}
          <div className="absolute right-96 top-8 w-10 h-10 rounded-full border border-green-400/50" />
          <div className="absolute right-[350px] top-14 w-4 h-4 rounded-full bg-green-400 animate-pulse" />
          <div className="absolute right-[430px] top-4 w-4 h-4 rounded-full bg-cyan-400 animate-pulse" />
          <div className="absolute right-[390px] top-24 w-4 h-4 rounded-full bg-emerald-400 animate-pulse" />

          <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-green-500 to-transparent" />
        </div>

        {/* Left */}
        <div className="relative z-10 flex items-center gap-4">

          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center">
            <FlaskConical size={20} className="text-white" />
          </div>

          <div>
            <h1 className="text-2xl font-bold text-white">
              Chemistry Laboratory
            </h1>

            <p className="text-xs text-slate-400">
              Interactive chemistry simulations & virtual experiments
            </p>
          </div>
        </div>

        {/* Right */}
        <div className="relative z-10 flex gap-4">

          <button
            onClick={() => navigate("/ai-tutor/session")}
            className="flex items-center gap-2 px-5 py-2 rounded-xl bg-slate-900 border border-green-500/30 hover:bg-slate-800"
          >
            <Bot size={18} className="text-green-100" />
            AI Chemist
          </button>

          <button
            onClick={() => setShowReport(true)}
            className="flex items-center gap-2 px-5 py-2 rounded-xl bg-slate-900 border border-slate-700 hover:bg-slate-800"
          >
            <FileText size={18} className="text-cyan-400" />
            Lab Report
          </button>

        </div>
      </header>

      {showReport && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">

          <div className="bg-slate-900 border border-slate-700 rounded-2xl p-6 w-[90%] max-w-2xl">

            <h2 className="text-2xl font-bold text-white mb-2">
              🧪 Chemistry Lab Report
            </h2>

            <p className="text-green-400 mb-4">
              {today}
            </p>

            <ul className="space-y-2 text-slate-300 list-disc list-inside">
              <li>Experiment performed successfully</li>
              <li>Reaction observations recorded</li>
              <li>Chemical properties analyzed</li>
              <li>Results stored in laboratory notebook</li>
            </ul>

            <button
              onClick={() => setShowReport(false)}
              className="mt-6 px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700"
            >
              Close Report
            </button>

          </div>

        </div>
      )}
    </>
  );
}