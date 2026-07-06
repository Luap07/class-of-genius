import React, { useState } from "react";
import { Outlet } from "react-router-dom";
import { motion } from "framer-motion";

import Sidebar from "../components/Sidebar";
import DashboardHeader from "../components/DashboardHeader";

const DashboardLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-950 text-white overflow-hidden">

      {/* Sidebar */}
      <Sidebar
        open={sidebarOpen}
        setOpen={setSidebarOpen}
      />

      {/* Main Content */}
      <div className="flex flex-col flex-1 lg:pl-72 min-h-screen">

        {/* Header */}
        <DashboardHeader
          setSidebarOpen={setSidebarOpen}
        />

        {/* Page */}
        <motion.main
          key={location.pathname}
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          className="flex-1 overflow-y-auto bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950"
        >
          <div className="min-h-full p-6 md:p-8">
            <Outlet />
          </div>
        </motion.main>

      </div>

    </div>
  );
};

export default DashboardLayout;