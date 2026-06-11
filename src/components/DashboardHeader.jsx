import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  HelpCircle,
  Lightbulb,
  Bell,
  Sparkles,
} from "lucide-react";

import ProfileDropdown from "../components/profile/ProfileDropdown";

const DashboardHeader = () => {
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showReminderMenu, setShowReminderMenu] = useState(false);
  const [showInsight, setShowInsight] = useState(false);

  const navigate = useNavigate();

  const username = "Akinwole Damilare";
  const firstLetter = username.charAt(0).toUpperCase();

  const [reminderTime, setReminderTime] = useState("18:00");

  const insightQuote =
    "Education is the foundation of success — consistency builds mastery.";

  const scrollToFAQ = () => {
    const el = document.getElementById("faq-section");
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/");
  };

  return (
    <header className="sticky top-0 z-50 border-b border-white/10
      bg-gradient-to-r from-[#0b0f1a] via-[#0a0f1f] to-[#05070f]
      backdrop-blur-xl text-white">

      <div className="flex items-center justify-between px-6 py-4">

        {/* LEFT */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center">
            <Sparkles size={18} />
          </div>

          <h1 className="text-lg font-bold">
            Welcome,{" "}
            <span className="text-blue-400">
              {username.split(" ")[0]}
            </span>
          </h1>
        </div>

        {/* CENTER NAV */}
        <div className="hidden md:flex items-center gap-8 text-sm">

          <Link to="/dashboard" className="flex items-center gap-2 hover:text-blue-400">
            <LayoutDashboard size={18} />
            Dashboard
          </Link>

          {/* INSIGHT (DESKTOP ONLY) */}
          <div className="relative">
            <button
              onClick={() => setShowInsight(!showInsight)}
              className="flex items-center gap-2 hover:text-blue-400"
            >
              <Lightbulb size={18} />
              Insight
            </button>

            {showInsight && (
              <div className="absolute top-10 left-0 w-80 bg-black/90 border border-white/10 p-3 rounded-xl text-sm shadow-xl">
                {insightQuote}
              </div>
            )}
          </div>

          {/* FAQ (DESKTOP ONLY) */}
          <button
            onClick={scrollToFAQ}
            className="flex items-center gap-2 hover:text-blue-400"
          >
            <HelpCircle size={18} />
            FAQs
          </button>
        </div>

        {/* RIGHT SIDE */}
        <div className="flex items-center gap-4">

          {/* NOTIFICATION */}
          <div className="relative">
            <button
              onClick={() => setShowReminderMenu(!showReminderMenu)}
              className="p-2 hover:bg-white/10 rounded-xl"
            >
              <Bell />
            </button>

            {showReminderMenu && (
              <div className="absolute right-0 mt-3 w-64 bg-[#0b0f1a] border border-white/10 rounded-xl p-3">
                <p className="text-sm">📚 Study your lesson</p>
                <p className="text-sm">🧠 CBT practice ready</p>
                <p className="text-sm">📖 Continue reading</p>

                <input
                  type="time"
                  value={reminderTime}
                  onChange={(e) => setReminderTime(e.target.value)}
                  className="w-full mt-2 p-2 bg-black/40 border border-white/10 rounded"
                />
              </div>
            )}
          </div>

          {/* PROFILE */}
          <div className="relative">

            <button
              onClick={() => setShowProfileMenu(!showProfileMenu)}
              className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center font-bold"
            >
              {firstLetter}
            </button>

            {showProfileMenu && (
              <ProfileDropdown
                onClose={() => setShowProfileMenu(false)}
                onLogout={handleLogout}
                onOpenProfile={() => navigate("/profile")}
              />
            )}

          </div>

        </div>
      </div>

      {/* ================= MOBILE NAV (FIXED) ================= */}
      <div className="md:hidden flex justify-center gap-10 pb-3 text-sm">

        <Link to="/dashboard" className="flex items-center gap-2">
          <LayoutDashboard size={16} />
          Dashboard
        </Link>

        {/* ONLY DASHBOARD SHOWN — NO INSIGHT / FAQ ON MOBILE */}
      </div>

    </header>
  );
};

export default DashboardHeader;