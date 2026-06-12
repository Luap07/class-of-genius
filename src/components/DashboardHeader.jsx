import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  HelpCircle,
  Lightbulb,
  Bell,
  Sparkles,
  PanelLeft,
  X,
} from "lucide-react";

import ProfileDropdown from "../components/profile/ProfileDropdown";

const DashboardHeader = () => {
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showReminderMenu, setShowReminderMenu] = useState(false);
  const [showInsight, setShowInsight] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const navigate = useNavigate();
  const username = "Akinwole Damilare";
  const firstLetter = username.charAt(0).toUpperCase();
  const [reminderTime, setReminderTime] = useState("18:00");

  const scrollToFAQ = () => {
    const el = document.getElementById("faq-section");
    if (el) el.scrollIntoView({ behavior: "smooth" });
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/");
  };

  return (
    <>
      {/* HEADER */}
      <header className="sticky top-0 z-40 border-b border-white/10 bg-gradient-to-r from-[#0b0f1a] via-[#0a0f1f] to-[#05070f] backdrop-blur-xl text-white">
        <div className="flex items-center justify-between px-6 py-4">
          
          {/* LEFT */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="p-2 hover:bg-white/10 rounded-lg md:hidden"
            >
              <PanelLeft size={20} />
            </button>

            <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center">
              <Sparkles size={18} />
            </div>

            <h1 className="text-lg font-bold sm:block">
              Welcome, <span className="text-blue-400">{username.split(" ")[0]}</span>
            </h1>
          </div>

          {/* CENTER (DESKTOP ONLY) */}
          <div className="hidden md:flex items-center gap-8 text-sm">
            <Link to="/dashboard" className="flex items-center gap-2 hover:text-blue-400">
              <LayoutDashboard size={18} /> Dashboard
            </Link>
            <button onClick={() => setShowInsight(!showInsight)} className="flex items-center gap-2 hover:text-blue-400">
              <Lightbulb size={18} /> Insight
            </button>
            <button onClick={scrollToFAQ} className="flex items-center gap-2 hover:text-blue-400">
              <HelpCircle size={18} /> FAQs
            </button>
          </div>

          {/* RIGHT */}
          <div className="flex items-center gap-4">
            <div className="relative">
              <button onClick={() => setShowReminderMenu(!showReminderMenu)} className="p-2 hover:bg-white/10 rounded-xl">
                <Bell size={20} />
              </button>
              {showReminderMenu && (
                <div className="absolute right-0 mt-3 w-64 bg-[#0b0f1a] border border-white/10 rounded-xl p-3 shadow-2xl z-50">
                  <p className="text-sm mb-2">📚 Study your lesson</p>
                  <p className="text-sm mb-2">🧠 CBT practice ready</p>
                  <input
                    type="time"
                    value={reminderTime}
                    onChange={(e) => setReminderTime(e.target.value)}
                    className="w-full mt-2 p-2 bg-black/40 border border-white/10 rounded text-sm"
                  />
                </div>
              )}
            </div>

            <div className="relative">
              <button onClick={() => setShowProfileMenu(!showProfileMenu)} className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center font-bold">
                {firstLetter}
              </button>
              {showProfileMenu && (
                <div className="absolute right-0 z-50">
                  <ProfileDropdown
                    onClose={() => setShowProfileMenu(false)}
                    onLogout={handleLogout}
                    onOpenProfile={() => navigate("/profile")}
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* MOBILE SIDEBAR OVERLAY */}
      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 bg-black/60 z-[999] md:hidden"
        />
      )}

      {/* MOBILE SIDEBAR */}
      <aside
        className={`fixed top-0 left-0 h-full w-72 z-[1000] bg-[#0b0f1a] border-r border-white/10 transform transition-transform duration-300 ease-in-out md:hidden ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="p-6">
          <div className="flex justify-between items-center mb-8">
            <span className="font-bold text-blue-400"></span>
            <button onClick={() => setSidebarOpen(false)}><X size={24} /></button>
          </div>

          <nav className="flex flex-col gap-6">
            <Link to="/dashboard" onClick={() => setSidebarOpen(false)} className="flex items-center gap-3 hover:text-blue-400">
              <LayoutDashboard size={20} /> Dashboard
            </Link>
            <button onClick={() => { setShowInsight(true); setSidebarOpen(false); }} className="flex items-center gap-3 hover:text-blue-400">
              <Lightbulb size={20} /> Insight
            </button>
            <button onClick={() => { scrollToFAQ(); setSidebarOpen(false); }} className="flex items-center gap-3 hover:text-blue-400">
              <HelpCircle size={20} /> FAQs
            </button>
          </nav>
        </div>
      </aside>
    </>
  );
};

export default DashboardHeader;