import React from "react";
import { Outlet } from "react-router-dom";

import AdminSidebar from "./AdminSidebar";
import AdminHeader from "./AdminHeader";

const AdminLayout = () => {
  return (
    <div className="flex h-screen bg-slate-950 text-white overflow-hidden">

      {/* Sidebar */}
      <AdminSidebar />

      {/* Main */}
      <div className="flex flex-1 flex-col overflow-hidden">

        {/* Header */}
        <AdminHeader />

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto bg-slate-950 p-6">

          <div className="mx-auto max-w-7xl">
            <Outlet />
          </div>

        </main>

      </div>

    </div>
  );
};

export default AdminLayout;