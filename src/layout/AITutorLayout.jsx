import React from "react";
import { Outlet } from "react-router-dom";
import AITutorHeader from "../components/AITutorHeader";
import AITutorSidebar from "../components/AITutorSidebar";

const AITutorLayout = () => {
  return (
    <div className="h-screen flex bg-gradient-to-br from-[#020617] via-[#0b1120] to-[#020614] text-white">

      {/* LEFT PANEL (HEADER + SIDEBAR TOGETHER) */}
      <div className="w-72 flex flex-col border-r border-slate-800 bg-slate-950/60 backdrop-blur-md">

        {/* HEADER INSIDE SIDEBAR AREA */}
        <AITutorHeader />

        {/* SIDEBAR BELOW HEADER */}
        <div className="flex-1 overflow-y-auto">
          <AITutorSidebar />
        </div>

      </div>

      {/* RIGHT MAIN CONTENT */}
      <div className="flex-1 overflow-y-auto p-4">
        <Outlet />
      </div>

    </div>
  );
};

export default AITutorLayout;