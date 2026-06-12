import React, { useState } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import DashboardHeader from "../components/DashboardHeader";

const DashboardLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="h-screen flex bg-slate-50">

      {/* SIDEBAR CONTROLLED HERE */}
      <Sidebar open={sidebarOpen} setOpen={setSidebarOpen} />

      {/* MAIN AREA */}
      <div className="flex-1 flex flex-col lg:pl-72">

        <DashboardHeader setSidebarOpen={setSidebarOpen} />

        <main className="flex-1 overflow-y-auto">
          <Outlet />
        </main>

      </div>
    </div>
  );
};

export default DashboardLayout;