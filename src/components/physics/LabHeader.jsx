import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Bot, FileText, FlaskConical } from "lucide-react";

export default function LabHeader() {
  const [showReport, setShowReport] = useState(false);
  const navigate = useNavigate();

  const dailyReports = {
    Monday: {
      title: "Ohm's Law Verification",
      objective:
        "Verify the relationship between voltage, current, and resistance.",
      observations: [
        "Voltage varied from 1V to 12V",
        "Current increased proportionally",
        "Resistance remained constant",
        "Ohm's Law validated successfully",
      ],
    },

    Tuesday: {
      title: "Series Circuit Investigation",
      objective:
        "Study equivalent resistance and voltage distribution in series circuits.",
      observations: [
        "Resistances added together",
        "Current remained constant",
        "Voltage divided across resistors",
        "Results matched theoretical calculations",
      ],
    },

    Wednesday: {
      title: "Parallel Circuit Investigation",
      objective:
        "Investigate current distribution in parallel branches.",
      observations: [
        "Current split among branches",
        "Voltage remained constant",
        "Equivalent resistance decreased",
        "Experimental values verified theory",
      ],
    },

    Thursday: {
      title: "Electrical Power Measurement",
      objective:
        "Determine electrical power consumption using voltage and current.",
      observations: [
        "Power increased with voltage",
        "Power increased with current",
        "P = VI relationship verified",
        "Energy calculations completed",
      ],
    },

    Friday: {
      title: "Electromagnetism Experiment",
      objective:
        "Investigate magnetic fields produced by electric current.",
      observations: [
        "Current generated magnetic field",
        "Compass needle deflected",
        "Field strength increased with current",
        "Results agreed with theory",
      ],
    },

    Saturday: {
      title: "Simple Harmonic Motion",
      objective:
        "Study oscillatory motion and determine time period.",
      observations: [
        "Pendulum oscillated periodically",
        "Time period remained nearly constant",
        "Amplitude gradually decreased",
        "SHM characteristics observed",
      ],
    },

    Sunday: {
      title: "Physics Laboratory Review",
      objective:
        "Review experiments completed during the week.",
      observations: [
        "Reviewed circuit experiments",
        "Reviewed power calculations",
        "Reviewed electromagnetism concepts",
        "Prepared weekly laboratory summary",
      ],
    },
  };

  const dayName = new Date().toLocaleDateString("en-US", {
    weekday: "long",
  });

  const report = dailyReports[dayName];

  return (
    <>
      <header className="relative w-full h-20 bg-[#050816] border-b border-slate-800 px-8 flex items-center justify-between overflow-hidden">

        {/* Background */}
        <div className="absolute inset-0 overflow-hidden">

          <div className="absolute right-1/3 top-1/2 -translate-y-1/2 w-96 h-96 bg-blue-500/20 blur-[120px] rounded-full" />
          <div className="absolute right-10 top-0 w-80 h-80 bg-purple-500/20 blur-[120px] rounded-full" />

          <div className="absolute right-52 top-6 w-80 h-24 border border-cyan-500/30 rounded-full rotate-12" />
          <div className="absolute right-44 top-8 w-72 h-24 border border-blue-500/30 rounded-full -rotate-12" />
          <div className="absolute right-56 top-2 w-96 h-28 border border-purple-500/20 rounded-full rotate-6" />

          <div className="absolute right-80 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-gradient-to-br from-cyan-400 to-blue-600 shadow-[0_0_50px_rgba(59,130,246,0.9)]" />

          <div className="absolute right-[520px] top-[20px] w-4 h-4 rounded-full bg-purple-400 shadow-[0_0_20px_rgba(168,85,247,1)] animate-pulse" />
          <div className="absolute right-[320px] top-[18px] w-3 h-3 rounded-full bg-yellow-400 shadow-[0_0_20px_rgba(250,204,21,1)] animate-ping" />
          <div className="absolute right-[600px] top-[45px] w-3 h-3 rounded-full bg-blue-500 shadow-[0_0_20px_rgba(59,130,246,1)] animate-pulse" />
          <div className="absolute right-[450px] top-[85px] w-2 h-2 rounded-full bg-pink-400 shadow-[0_0_15px_rgba(236,72,153,1)] animate-bounce" />

          <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-cyan-500/95 to-transparent" />
        </div>

        {/* Left Side */}
        <div className="relative z-10 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg">
            <FlaskConical className="text-white" size={20} />
          </div>

          <div>
            <h1 className="text-2xl font-bold text-white">
              Physics Laboratory
            </h1>

            <p className="text-slate-400 text-[12px]">
              Explore physics through interactive PhET-style simulations
            </p>
          </div>
        </div>

        {/* Right Side */}
        <div className="relative z-10 flex items-center gap-4">

          <button
            onClick={() => navigate("/ai-tutor/session")}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-purple-500/20 bg-slate-900/70 backdrop-blur-md text-slate-200 hover:bg-slate-800 transition"
          >
            <Bot size={18} className="text-purple-400" />
            <span className="text-sm font-medium">AI Tutor</span>
          </button>

          <button
            onClick={() => setShowReport(true)}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-slate-700 bg-slate-900/70 backdrop-blur-md text-slate-200 hover:bg-slate-800 transition"
          >
            <FileText size={18} className="text-cyan-400" />
            <span className="text-sm font-medium">Lab Report</span>
          </button>

        </div>
      </header>

      {/* Daily Lab Report Modal */}
      {showReport && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">

          <div className="bg-slate-900 w-[90%] max-w-2xl p-6 rounded-2xl border border-slate-700">

            <h2 className="text-2xl font-bold mb-2 text-white">
              🧪 {report.title}
            </h2>

            <p className="text-cyan-400 mb-4">
              {dayName} • {new Date().toLocaleDateString()}
            </p>

            <p className="text-slate-300 mb-5">
              {report.objective}
            </p>

            <ul className="space-y-2 text-slate-400 list-disc list-inside">
              {report.observations.map((item, index) => (
                <li key={index}>{item}</li>
              ))}
            </ul>

            <button
              onClick={() => setShowReport(false)}
              className="mt-6 bg-red-600 px-4 py-2 rounded-lg hover:bg-red-700 text-white"
            >
              Close Report
            </button>

          </div>

        </div>
      )}
    </>
  );
}