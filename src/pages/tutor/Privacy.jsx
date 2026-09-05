import React from "react";

export default function Privacy() {
  return (
    <div className="min-h-screen bg-[#050816] text-white p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-6">Privacy Policy</h1>

        <div className="space-y-6 text-slate-300 leading-7">
          <p>
            Scholiqen respects your privacy and is committed to protecting
            information provided while using the platform.
          </p>

          <section>
            <h2 className="text-xl font-semibold text-white mb-2">
              Information We Collect
            </h2>
            <p>
              Depending on the services you use, information may include
              account details, academic information and activity associated
              with your use of the platform.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-2">
              How Information Is Used
            </h2>
            <p>
              Information may be used to provide educational services,
              maintain accounts, improve the platform and support users.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}