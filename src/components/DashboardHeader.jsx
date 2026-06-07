import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import {
  LayoutDashboard,
  HelpCircle,
  Lightbulb,
  Bell,
} from "lucide-react";

const DashboardHeader = () => {
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showReminderMenu, setShowReminderMenu] = useState(false);
  const [showInsight, setShowInsight] = useState(false);

  const [profileImage, setProfileImage] = useState(
    localStorage.getItem("profileImage") || ""
  );

  const fileInputRef = useRef(null);

  const username = "Akinwole Damilare";
  const firstLetter = username.charAt(0).toUpperCase();

  const [reminderTime, setReminderTime] = useState(
    localStorage.getItem("studyReminder") || "18:00"
  );

  const [streak] = useState({
    current: 12,
    longest: 28,
  });

  useEffect(() => {
    localStorage.setItem("studyReminder", reminderTime);
  }, [reminderTime]);

  useEffect(() => {
    if ("Notification" in window) {
      Notification.requestPermission();
    }
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();

      const current =
        String(now.getHours()).padStart(2, "0") +
        ":" +
        String(now.getMinutes()).padStart(2, "0");

      if (
        current === reminderTime &&
        Notification.permission === "granted"
      ) {
        new Notification("📚 Study Reminder", {
          body: "Time to continue your learning session!",
        });
      }
    }, 60000);

    return () => clearInterval(interval);
  }, [reminderTime]);

  const handleUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      setProfileImage(reader.result);
      localStorage.setItem("profileImage", reader.result);
      setShowProfileMenu(false);
    };
    reader.readAsDataURL(file);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    window.location.href = "/";
  };

  // ✅ FIXED FAQ SCROLL FUNCTION
  const scrollToFAQ = () => {
    const el = document.getElementById("faq-section");
    if (el) {
      el.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
  };

  return (
    <header className="sticky top-0 z-20 bg-gray-50 shadow-sm px-4 md:px-6 py-4">

      {/* MOBILE TOP NAV */}
      <div className="flex md:hidden justify-center gap-6 text-sm font-medium mb-3">

        <Link to="/dashboard" className="flex items-center gap-1">
          <LayoutDashboard size={16} />
          Dashboard
        </Link>

        <div className="relative" onClick={() => setShowInsight(!showInsight)}>
          <button className="flex items-center gap-1">
            <Lightbulb size={16} />
            Insight
          </button>

          {showInsight && (
            <div className="absolute top-8 left-1/2 -translate-x-1/2 w-64 bg-black text-white text-xs p-3 rounded-lg shadow-lg z-50">
              Education is the foundation of success — consistency builds mastery.
            </div>
          )}
        </div>

        {/* ✅ FIXED FAQ BUTTON */}
        <button onClick={scrollToFAQ} className="flex items-center gap-1">
          <HelpCircle size={16} />
          FAQs
        </button>

      </div>

      {/* MAIN HEADER */}
      <div className="flex items-center justify-between">

        {/* LEFT */}
        <div className="flex items-center gap-3">
          <h1 className="text-xl md:text-3xl font-bold text-left">
            👋 Welcome, {username.split(" ")[0]}
          </h1>
        </div>

        {/* CENTER */}
        <div className="hidden md:flex items-center gap-10 font-medium">

          <Link to="/dashboard" className="flex items-center gap-2">
            <LayoutDashboard size={18} />
            Dashboard
          </Link>

          <div
            className="relative"
            onMouseEnter={() => setShowInsight(true)}
            onMouseLeave={() => setShowInsight(false)}
          >
            <button className="flex items-center gap-2">
              <Lightbulb size={18} />
              Insight
            </button>

            {showInsight && (
              <div className="absolute top-8 left-0 w-72 bg-black text-white text-xs p-3 rounded-lg shadow-lg z-50">
                Education is the foundation of success — consistency builds mastery.
              </div>
            )}
          </div>

          {/* ✅ FIXED FAQ BUTTON */}
          <button onClick={scrollToFAQ} className="flex items-center gap-2">
            <HelpCircle size={18} />
            FAQs
          </button>

        </div>

        {/* RIGHT */}
        <div className="flex items-center gap-4">

          {/* NOTIFICATION */}
          <div className="relative">

            <button onClick={() => setShowReminderMenu(!showReminderMenu)}>
              <Bell />
            </button>

            {showReminderMenu && (
              <div className="absolute right-0 mt-3 w-64 bg-white border rounded-xl shadow p-3 z-50">
                <p className="text-sm mb-2">📚 Read today's lesson</p>
                <p className="text-sm mb-2">🧠 CBT practice ready</p>
                <p className="text-sm mb-2">📖 Continue reading</p>

                <input
                  type="time"
                  value={reminderTime}
                  onChange={(e) => setReminderTime(e.target.value)}
                  className="w-full border p-2 rounded mt-2"
                />
              </div>
            )}

          </div>

          {/* PROFILE */}
          <div className="relative">

            <button
              onClick={() => setShowProfileMenu(!showProfileMenu)}
              className="w-11 h-11 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold overflow-hidden"
            >
              {profileImage ? (
                <img
                  src={profileImage}
                  className="w-full h-full object-cover"
                  alt="profile"
                />
              ) : (
                firstLetter
              )}
            </button>

            {showProfileMenu && (
              <div className="absolute right-0 mt-3 w-72 bg-white border rounded-xl shadow-lg p-3 z-50">

                <button
                  onClick={() => fileInputRef.current.click()}
                  className="w-full text-left p-2 hover:bg-gray-100 rounded"
                >
                  👤 Profile → Upload Image
                </button>

                <input
                  type="file"
                  ref={fileInputRef}
                  className="hidden"
                  onChange={handleUpload}
                />

                <button
                  onClick={handleLogout}
                  className="w-full text-left p-2 text-red-600 hover:bg-red-50 rounded"
                >
                  🚪 Logout
                </button>

              </div>
            )}

          </div>

        </div>

      </div>
    </header>
  );
};

export default DashboardHeader;