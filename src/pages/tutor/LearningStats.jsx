import React from "react";

export default function LearningStats() {
  return (
    <div className="min-h-screen bg-[#050816] text-white p-6 md:p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold">Learning Statistics</h1>
        <p className="mt-2 text-slate-400">
          Monitor your teaching and student learning performance.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mt-8">
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
            <p className="text-slate-400">Total Students</p>
            <h2 className="text-3xl font-bold mt-2">0</h2>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
            <p className="text-slate-400">Active Classes</p>
            <h2 className="text-3xl font-bold mt-2">0</h2>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
            <p className="text-slate-400">Tasks Completed</p>
            <h2 className="text-3xl font-bold mt-2">0</h2>
          </div>
        </div>
      </div>
    </div>
  );
}