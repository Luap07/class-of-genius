import React from "react";

export default function EditProfile() {
  return (
    <div className="min-h-screen bg-[#050816] text-white p-6 md:p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold">Edit Profile</h1>
        <p className="text-slate-400 mt-2">
          Update your tutor information.
        </p>

        <div className="mt-8 rounded-2xl border border-white/10 bg-white/[0.03] p-6">
          <h2 className="text-lg font-semibold">Profile Information</h2>

          <div className="mt-6 grid gap-5 md:grid-cols-2">
            <input
              type="text"
              placeholder="First name"
              className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none placeholder:text-slate-500"
            />

            <input
              type="text"
              placeholder="Last name"
              className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none placeholder:text-slate-500"
            />

            <input
              type="email"
              placeholder="Email"
              className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none placeholder:text-slate-500"
            />

            <input
              type="tel"
              placeholder="Phone number"
              className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none placeholder:text-slate-500"
            />
          </div>

          <button className="mt-6 rounded-xl bg-cyan-500 px-6 py-3 font-semibold text-black hover:bg-cyan-400 transition">
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
}