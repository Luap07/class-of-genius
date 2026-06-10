import React from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import DashboardHeader from "../components/DashboardHeader";

const DashboardLayout = () => {
  return (
    <div className="flex h-screen overflow-hidden bg-gray-50 text-black">
      {/* SIDEBAR */}
      <Sidebar />

      {/* MAIN AREA */}
      <main className="flex-1 overflow-y-auto bg-gray-50">
        {/* HEADER */}
        <DashboardHeader />

        {/* ROUTED CONTENT */}
        <Outlet />
      </main>
    </div>
  );
};

export default DashboardLayout;