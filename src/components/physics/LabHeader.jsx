import React from "react";
import { Bot, FileText } from "lucide-react";

export default function LabHeader() {
  return (
    <header className="relative w-full h-20 bg-[#050816] border-b border-slate-800 px-8 flex items-center justify-between overflow-hidden">
      
      {/* Physics Background */}
      <div className="absolute inset-0 overflow-hidden">
        
        {/* Glow Effects */}
        <div className="absolute right-1/3 top-1/2 -translate-y-1/2 w-96 h-96 bg-blue-500/20 blur-[120px] rounded-full" />

        <div className="absolute right-10 top-0 w-80 h-80 bg-purple-500/20 blur-[120px] rounded-full" />

        {/* Orbit Rings */}
        <div className="absolute right-52 top-6 w-80 h-24 border border-cyan-500/30 rounded-full rotate-12" />

        <div className="absolute right-44 top-8 w-72 h-24 border border-blue-500/30 rounded-full -rotate-12" />

        <div className="absolute right-56 top-2 w-96 h-28 border border-purple-500/20 rounded-full rotate-6" />

        {/* Atom Core */}
        <div className="absolute right-80 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-gradient-to-br from-cyan-400 to-blue-600 shadow-[0_0_50px_rgba(59,130,246,0.9)]" />

        {/* Electrons */}
        <div className="absolute right-[520px] top-[20px] w-4 h-4 rounded-full bg-purple-400 shadow-[0_0_20px_rgba(168,85,247,1)]" />

        <div className="absolute right-[320px] top-[18px] w-3 h-3 rounded-full bg-yellow-400 shadow-[0_0_20px_rgba(250,204,21,1)]" />

        <div className="absolute right-[600px] top-[45px] w-3 h-3 rounded-full bg-blue-500 shadow-[0_0_20px_rgba(59,130,246,1)]" />

        <div className="absolute right-[450px] top-[85px] w-2 h-2 rounded-full bg-pink-400 shadow-[0_0_15px_rgba(236,72,153,1)]" />

        {/* Bottom Glow Line */}
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-cyan-500/95 to-transparent" />
      </div>

      {/* Left Content */}
      <div className="relative z-10">
        <h1 className="text-2xl font-bold text-white mb-1">
          Physics Laboratory
        </h1>

        <p className="text-slate-400 text-[12px]">
          Explore the laws of nature through interactive experiments
        </p>
      </div>

      {/* Right Content */}
      <div className="relative z-10 flex items-center gap-4">
        <button className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-purple-500/20 bg-slate-900/70 backdrop-blur-md text-slate-200 hover:bg-slate-800 transition">
          <Bot size={18} className="text-purple-400" />
          <span className="text-sm font-medium">AI Tutor</span>
        </button>

        <button className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-slate-700 bg-slate-900/70 backdrop-blur-md text-slate-200 hover:bg-slate-800 transition">
          <FileText size={18} className="text-cyan-400" />
          <span className="text-sm font-medium">Lab Report</span>
        </button>
      </div>
    </header>
  );
}