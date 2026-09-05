import React from "react";

export default function Help() {
  return (
    <div className="min-h-screen bg-[#050816] text-white p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-6">Help Center</h1>

        <div className="space-y-6 text-slate-300 leading-7">
          <p>
            Need help using Scholiqen? This section provides assistance with
            your account, courses, CBT examinations, academy and learning
            tools.
          </p>

          <section>
            <h2 className="text-xl font-semibold text-white mb-2">
              Account Help
            </h2>
            <p>
              If you are having trouble signing in, check your login details
              and make sure your account has been properly registered.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-2">
              Academy Help
            </h2>
            <p>
              Students and tutors can access their respective Academy portals
              after completing the required registration and verification
              process.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}