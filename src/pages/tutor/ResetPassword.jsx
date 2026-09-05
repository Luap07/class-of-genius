import React, { useState } from "react";

export default function ResetPassword() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      alert("Passwords do not match.");
      return;
    }

    alert("Password reset request submitted.");
  };

  return (
    <div className="min-h-screen bg-[#050816] text-white p-6 md:p-8">
      <div className="max-w-xl mx-auto">
        <h1 className="text-3xl font-bold">Reset Password</h1>

        <p className="mt-2 text-slate-400">
          Create a new password for your tutor account.
        </p>

        <form
          onSubmit={handleSubmit}
          className="mt-8 rounded-2xl border border-white/10 bg-white/[0.03] p-6 space-y-5"
        >
          <div>
            <label className="block text-sm text-slate-300 mb-2">
              New Password
            </label>

            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none placeholder:text-slate-500 focus:border-cyan-400"
              placeholder="Enter new password"
            />
          </div>

          <div>
            <label className="block text-sm text-slate-300 mb-2">
              Confirm Password
            </label>

            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              minLength={6}
              className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none placeholder:text-slate-500 focus:border-cyan-400"
              placeholder="Confirm new password"
            />
          </div>

          <button
            type="submit"
            className="w-full rounded-xl bg-cyan-500 px-5 py-3 font-semibold text-black transition hover:bg-cyan-400"
          >
            Reset Password
          </button>
        </form>
      </div>
    </div>
  );
}