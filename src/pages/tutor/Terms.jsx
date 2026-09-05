import React from "react";

export default function Terms() {
  return (
    <div className="min-h-screen bg-[#050816] text-white p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-6">Terms & Conditions</h1>

        <div className="space-y-6 text-slate-300 leading-7">
          <p>
            Welcome to Scholiqen. By accessing or using the platform, you
            agree to comply with these Terms and Conditions.
          </p>

          <section>
            <h2 className="text-xl font-semibold text-white mb-2">
              Use of the Platform
            </h2>
            <p>
              Scholiqen provides educational resources, learning tools,
              examinations, tutoring services and related academic features.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-2">
              User Responsibilities
            </h2>
            <p>
              Users are expected to provide accurate information and use the
              platform responsibly and lawfully.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}