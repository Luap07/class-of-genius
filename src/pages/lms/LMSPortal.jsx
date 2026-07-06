import React, { useState } from "react";

import Sidebar from "../../components/lms/Sidebar";
import Topbar from "../../components/lms/Topbar";
import MainContent from "../../components/lms/MainContent";
import Footer from "../../components/lms/Footer";

import { LMSProvider } from "../../context/LMSContext";

const LMSPortalContent = () => {
  const [activePage, setActivePage] = useState("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <div className="h-screen w-full bg-slate-950 text-slate-100 flex overflow-hidden p-3 gap-3">
      {/* Sidebar */}
      <aside
        className={`flex-shrink-0 transition-all duration-500 ease-in-out ${
          sidebarOpen ? "w-64" : "w-20"
        } bg-slate-900/50 backdrop-blur-md border border-slate-800 rounded-2xl overflow-hidden`}
      >
        <Sidebar
          activePage={activePage}
          setActivePage={setActivePage}
          sidebarOpen={sidebarOpen}
          setSidebarOpen={setSidebarOpen}
        />
      </aside>

      {/* Main Column */}
      <div className="flex flex-col flex-1 h-full gap-3 overflow-hidden">
        {/* Header */}
        <header className="h-16 flex-shrink-0 bg-slate-900/50 backdrop-blur-md border border-slate-800 rounded-2xl flex items-center px-6 overflow-hidden">
          <div className="w-full min-w-0">
            <Topbar
              sidebarOpen={sidebarOpen}
              setSidebarOpen={setSidebarOpen}
            />
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent bg-slate-900/30 border border-slate-800/50 rounded-2xl flex flex-col relative">
          <div className="flex-1 p-8">
            <div className="max-w-7xl mx-auto">
              <MainContent
                activePage={activePage}
                setActivePage={setActivePage}
              />
            </div>
          </div>

          {/* Footer */}
          <div className="mt-auto pt-8 border-t border-slate-800/50 p-8">
            <Footer />
          </div>
        </main>
      </div>
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