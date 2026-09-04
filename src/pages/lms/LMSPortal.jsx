import React, { useState } from "react";

import Topbar from "../../components/lms/Topbar";
import MainContent from "../../components/lms/MainContent";

import { LMSProvider } from "../../context/LMSContext";

const LMSPortalContent = () => {
  const [activePage, setActivePage] = useState("dashboard");

  return (
    <div className="min-h-screen w-full overflow-hidden bg-slate-950 text-slate-100">

      {/* =====================================================
          TOPBAR
      ===================================================== */}

      <header
        className="
          sticky
          top-0
          z-50
          h-16
          w-full
          border-b
          border-slate-800/80
          bg-slate-950/80
          backdrop-blur-xl
        "
      >
        <div className="mx-auto flex h-full w-full max-w-[1600px] items-center px-6 lg:px-8">
          <div className="w-full min-w-0">
            <Topbar />
          </div>
        </div>
      </header>

      {/* =====================================================
          MAIN CONTENT
      ===================================================== */}

      <main className="relative min-h-[calc(100vh-4rem)] w-full overflow-y-auto">

        {/* Background glow */}

        <div className="pointer-events-none fixed left-[10%] top-[15%] h-72 w-72 rounded-full bg-blue-500/[0.04] blur-[120px]" />

        <div className="pointer-events-none fixed bottom-[10%] right-[10%] h-80 w-80 rounded-full bg-cyan-500/[0.04] blur-[140px]" />

        {/* Subtle grid */}

        <div
          className="pointer-events-none fixed inset-0 opacity-[0.02]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,.3) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.3) 1px, transparent 1px)",
            backgroundSize: "55px 55px",
          }}
        />

        <div className="relative z-10 mx-auto w-full max-w-[1600px] px-6 py-8 lg:px-8 lg:py-10">

          <MainContent
            activePage={activePage}
            setActivePage={setActivePage}
          />

        </div>

      </main>

    </div>
  );
};

const LMSPortal = () => {
  return (
    <LMSProvider>
      <LMSPortalContent />
    </LMSProvider>
  );
};

export default LMSPortal;
