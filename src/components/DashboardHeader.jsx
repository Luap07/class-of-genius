import React, { useContext, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  HelpCircle,
  Lightbulb,
  Bell,
  PanelLeft,
  X,
  ArrowRight,
} from "lucide-react";

import { AuthContext } from "../context/AuthContext";
import ProfileDropdown from "../components/profile/ProfileDropdown";
import cog from "../assets/cog.png";

const DashboardHeader = () => {
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showReminderMenu, setShowReminderMenu] = useState(false);
  const [showInsight, setShowInsight] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const [reminderTime, setReminderTime] = useState("18:00");
  const [currentInsight, setCurrentInsight] = useState("Focus");

  const navigate = useNavigate();

  const { profile, user } = useContext(AuthContext);

  /* =========================================================
     USER NAME
  ========================================================= */

  const username =
    profile?.username ||
    profile?.full_name ||
    user?.user_metadata?.username ||
    user?.user_metadata?.full_name ||
    user?.email?.split("@")[0] ||
    "Student";

  const firstLetter =
    String(username || "S").charAt(0).toUpperCase();

  /* =========================================================
     PROFILE IMAGE

     IMPORTANT:
     The uploaded profile image is checked FIRST using the
     same fields used by the Profile page.

     This keeps DashboardHeader and Profile synchronized.
  ========================================================= */

  const profileImage =
    profile?.profile_picture ||
    profile?.profile_picture_url ||
    profile?.avatar_url ||
    profile?.avatar ||
    profile?.profile_image ||
    profile?.profile_image_url ||
    profile?.photo_url ||
    profile?.image_url ||
    user?.user_metadata?.profile_picture ||
    user?.user_metadata?.profile_picture_url ||
    user?.user_metadata?.avatar_url ||
    user?.user_metadata?.avatar ||
    user?.user_metadata?.picture ||
    user?.user_metadata?.photo_url ||
    user?.user_metadata?.profile_image ||
    user?.user_metadata?.profile_image_url ||
    user?.user_metadata?.image_url ||
    null;

  /* =========================================================
     ENCOURAGING INSIGHTS
  ========================================================= */

  const insights = [
    "Focus",
    "Believe",
    "Persist",
    "Grow",
    "Create",
    "Excel",
    "Progress",
    "Conquer",
    "Achieve",
    "Succeed",
  ];

  /* =========================================================
     ROTATE INSIGHT
  ========================================================= */

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentInsight((previous) => {
        const currentIndex = insights.indexOf(previous);

        return insights[
          (currentIndex + 1) % insights.length
        ];
      });
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  /* =========================================================
     FAQ
  ========================================================= */

  const scrollToFAQ = () => {
    const el = document.getElementById("faq-section");

    if (el) {
      el.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
  };

  /* =========================================================
     LOGOUT
  ========================================================= */

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/");
  };

  /* =========================================================
     INSIGHT HANDLER
  ========================================================= */

  const handleInsight = () => {
    setShowInsight((previous) => !previous);

    setCurrentInsight((previous) => {
      const currentIndex = insights.indexOf(previous);

      return insights[
        (currentIndex + 1) % insights.length
      ];
    });
  };

  return (
    <>
      {/* =========================================================
          HEADER
      ========================================================= */}

      <header className="sticky top-0 z-40 border-b border-white/10 bg-slate-950/90 text-white backdrop-blur-xl">
        <div className="flex h-[72px] items-center justify-between px-4 sm:px-6 md:px-8">

          {/* =====================================================
              LEFT
          ===================================================== */}

          <div className="flex items-center gap-3">

            {/* Mobile Menu */}

            <button
              type="button"
              onClick={() => setSidebarOpen(true)}
              className="rounded-lg p-2 transition hover:bg-white/10 md:hidden"
              aria-label="Open menu"
            >
              <PanelLeft size={20} />
            </button>

            {/* =================================================
                COG LOGO
            ================================================= */}

            <Link
              to="/dashboard"
              className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-xl transition hover:scale-105"
              aria-label="Scholiqen Dashboard"
            >
              <img
                src={cog}
                alt="Class Of Genius"
                className="h-full w-full object-contain"
              />
            </Link>

            {/* Welcome */}

            <h1 className="text-lg font-bold">
              Welcome{" "}
              <span className="text-blue-400">
                {username.split(" ")[0]}
              </span>
            </h1>
          </div>

          {/* =====================================================
              CENTER NAVIGATION
          ===================================================== */}

          <div className="hidden items-center gap-8 text-sm md:flex">

            {/* Dashboard */}

            <Link
              to="/dashboard"
              className="flex items-center gap-2 text-slate-300 transition hover:text-blue-400"
            >
              <LayoutDashboard size={18} />
              Dashboard
            </Link>

            {/* =================================================
                INSIGHT
            ================================================= */}

            <div className="relative">

              <button
                type="button"
                onClick={handleInsight}
                onMouseEnter={() => setShowInsight(true)}
                className={`
                  flex
                  items-center
                  gap-2
                  rounded-lg
                  px-2
                  py-2
                  transition
                  ${
                    showInsight
                      ? "text-yellow-400"
                      : "text-slate-300 hover:text-yellow-400"
                  }
                `}
              >
                <Lightbulb size={18} />
                Insight
              </button>

              {/* =================================================
                  INSIGHT POPUP
              ================================================= */}

              {showInsight && (
                <div
                  onMouseLeave={() =>
                    setShowInsight(false)
                  }
                  className="
                    absolute
                    left-1/2
                    top-full
                    z-50
                    mt-3
                    -translate-x-1/2
                  "
                >
                  <div className="relative min-w-[150px] overflow-hidden rounded-2xl border border-yellow-400/20 bg-[#0b0f1a] px-5 py-4 text-center shadow-2xl shadow-black/40">

                    <div className="absolute -right-8 -top-8 h-20 w-20 rounded-full bg-yellow-400/10 blur-2xl" />

                    <div className="relative">

                      <div className="mx-auto mb-2 flex h-9 w-9 items-center justify-center rounded-xl bg-yellow-400/10">
                        <Lightbulb
                          size={18}
                          className="text-yellow-400"
                        />
                      </div>

                      <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-500">
                        Today's Insight
                      </p>

                      <p className="mt-1 text-xl font-black tracking-tight text-white">
                        {currentInsight}
                      </p>

                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* =================================================
                FAQ
            ================================================= */}

            <button
              type="button"
              onClick={scrollToFAQ}
              className="flex items-center gap-2 text-slate-300 transition hover:text-blue-400"
            >
              <HelpCircle size={18} />
              FAQs
            </button>
          </div>

          {/* =====================================================
              RIGHT
          ===================================================== */}

          <div className="flex items-center gap-3 sm:gap-4">

            {/* =================================================
                REMINDER
            ================================================= */}

            <div className="relative">

              <button
                type="button"
                onClick={() =>
                  setShowReminderMenu(
                    (previous) => !previous
                  )
                }
                className="
                  relative
                  rounded-xl
                  p-2
                  text-slate-300
                  transition
                  hover:bg-white/10
                  hover:text-white
                "
                aria-label="Study reminders"
              >
                <Bell size={20} />

                <span className="absolute right-1.5 top-1.5 h-1.5 w-1.5 rounded-full bg-blue-400" />
              </button>

              {showReminderMenu && (
                <div className="absolute right-0 z-50 mt-3 w-64 rounded-2xl border border-white/10 bg-[#0b0f1a] p-4 shadow-2xl">

                  <div className="mb-4">
                    <p className="text-sm font-bold text-white">
                      Study Reminder
                    </p>

                    <p className="mt-1 text-xs text-slate-500">
                      Stay consistent with your learning.
                    </p>
                  </div>

                  <div className="space-y-2">
                    <p className="text-sm text-slate-300">
                      📚 Study your lesson
                    </p>

                    <p className="text-sm text-slate-300">
                      🧠 CBT practice ready
                    </p>
                  </div>

                  <div className="mt-4">

                    <label className="mb-2 block text-xs font-semibold text-slate-500">
                      Reminder time
                    </label>

                    <input
                      type="time"
                      value={reminderTime}
                      onChange={(event) =>
                        setReminderTime(
                          event.target.value
                        )
                      }
                      className="
                        w-full
                        rounded-xl
                        border
                        border-white/10
                        bg-black/40
                        p-2.5
                        text-sm
                        text-white
                        outline-none
                        focus:border-blue-500
                      "
                    />

                  </div>
                </div>
              )}
            </div>

            {/* =================================================
                PROFILE IMAGE
            ================================================= */}

            <div className="relative">

              <button
                type="button"
                onClick={() =>
                  setShowProfileMenu(
                    (previous) => !previous
                  )
                }
                className="
                  flex
                  h-10
                  w-10
                  items-center
                  justify-center
                  overflow-hidden
                  rounded-full
                  border
                  border-white/10
                  bg-slate-800
                  font-bold
                  text-white
                  shadow-lg
                  transition
                  hover:border-blue-400/50
                  hover:ring-2
                  hover:ring-blue-500/20
                "
                aria-label="Open profile menu"
              >

                {/* =================================================
                    ACTUAL UPLOADED PROFILE IMAGE
                ================================================= */}

                {profileImage ? (
                  <img
                    src={profileImage}
                    alt={username}
                    className="block h-full w-full object-cover"
                  />
                ) : (
                  <span>{firstLetter}</span>
                )}

              </button>

              {/* Profile Dropdown */}

              {showProfileMenu && (
                <div className="absolute right-0 z-50 mt-3">
                  <ProfileDropdown
                    onClose={() =>
                      setShowProfileMenu(false)
                    }
                    onLogout={handleLogout}
                    onOpenProfile={() =>
                      navigate("/profile")
                    }
                  />
                </div>
              )}

            </div>

          </div>
        </div>
      </header>

      {/* =========================================================
          MOBILE SIDEBAR OVERLAY
      ========================================================= */}

      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 z-[999] bg-black/60 backdrop-blur-sm md:hidden"
        />
      )}

      {/* =========================================================
          MOBILE SIDEBAR
      ========================================================= */}

      <aside
        className={`
          fixed
          left-0
          top-0
          z-[1000]
          h-full
          w-72
          border-r
          border-white/10
          bg-[#0b0f1a]
          transition-transform
          duration-300
          ease-in-out
          md:hidden
          ${
            sidebarOpen
              ? "translate-x-0"
              : "-translate-x-full"
          }
        `}
      >

        <div className="p-6">

          {/* =================================================
              MOBILE SIDEBAR HEADER
          ================================================= */}

          <div className="mb-8 flex items-center justify-between">

            <div className="flex items-center gap-2">

              <Link
                to="/dashboard"
                onClick={() =>
                  setSidebarOpen(false)
                }
                className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-xl"
              >
                <img
                  src={cog}
                  alt="Class Of Genius"
                  className="h-full w-full object-contain"
                />
              </Link>

              <span className="font-black text-white">
                Scholiqen
              </span>

            </div>

            <button
              type="button"
              onClick={() =>
                setSidebarOpen(false)
              }
              className="rounded-lg p-2 text-slate-400 transition hover:bg-white/10 hover:text-white"
            >
              <X size={22} />
            </button>

          </div>

          {/* =================================================
              MOBILE NAVIGATION
          ================================================= */}

          <nav className="flex flex-col gap-2">

            <Link
              to="/dashboard"
              onClick={() =>
                setSidebarOpen(false)
              }
              className="flex items-center gap-3 rounded-xl px-3 py-3 text-slate-300 transition hover:bg-white/5 hover:text-blue-400"
            >
              <LayoutDashboard size={20} />
              Dashboard
            </Link>

            {/* Mobile Insight */}

            <button
              type="button"
              onClick={() => {
                handleInsight();
                setSidebarOpen(false);
              }}
              className="flex items-center gap-3 rounded-xl px-3 py-3 text-left text-slate-300 transition hover:bg-white/5 hover:text-yellow-400"
            >
              <Lightbulb size={20} />
              Insight
            </button>

            {/* Mobile FAQ */}

            <button
              type="button"
              onClick={() => {
                scrollToFAQ();
                setSidebarOpen(false);
              }}
              className="flex items-center gap-3 rounded-xl px-3 py-3 text-left text-slate-300 transition hover:bg-white/5 hover:text-blue-400"
            >
              <HelpCircle size={20} />
              FAQs
            </button>

          </nav>

          {/* =================================================
              MOBILE INSIGHT
          ================================================= */}

          {showInsight && (
            <div className="mt-8 rounded-2xl border border-yellow-400/20 bg-yellow-400/5 p-5 text-center">

              <Lightbulb
                size={22}
                className="mx-auto text-yellow-400"
              />

              <p className="mt-3 text-[10px] font-bold uppercase tracking-[0.18em] text-slate-500">
                Today's Insight
              </p>

              <p className="mt-1 text-2xl font-black text-white">
                {currentInsight}
              </p>

              <div className="mt-3 flex items-center justify-center gap-1 text-xs text-slate-500">
                Keep going
                <ArrowRight size={12} />
              </div>

            </div>
          )}

        </div>
      </aside>
    </>
  );
};

export default DashboardHeader;