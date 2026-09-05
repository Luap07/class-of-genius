import React from "react";

export default function Profile() {
  return (
    <div className="min-h-screen bg-[#050816] text-white p-6 md:p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold">My Profile</h1>
        <p className="text-slate-400 mt-2">
          View your tutor profile and professional information.
        </p>

        <div className="mt-8 rounded-2xl border border-white/10 bg-white/[0.03] p-6">
          <h2 className="text-lg font-semibold">Tutor Profile</h2>
          <p className="text-slate-400 mt-2">
            Your profile information will appear here.
          </p>
        </div>
      </div>
    </div>
  );
}