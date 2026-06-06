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

      if (current === reminderTime && Notification.permission === "granted") {
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

  return (
    <header className="sticky top-0 bg-gray-50 z-20 px-6 py-5 shadow-sm">

      {/* DESKTOP */}
      <div className="hidden md:flex items-center justify-between">

        <div className="w-1/3">
          <h1 className="text-3xl font-bold">
            👋 Welcome, {username.split(" ")[0]}
          </h1>
        </div>

        <div className="w-1/3 flex justify-center gap-10 font-medium">

          <Link to="/dashboard" className="flex items-center gap-2">
            <LayoutDashboard size={18} />
            Dashboard
          </Link>

          <div
            className="relative"
            onMouseEnter={() => setShowInsight(true)}
            onMouseLeave={() => setShowInsight(false)}
          >
            <button
              onClick={() => setShowInsight(!showInsight)}
              className="flex items-center gap-2"
            >
              <Lightbulb size={18} />
              Insight
            </button>

            {showInsight && (
              <div className="absolute top-8 left-0 w-72 bg-black text-white text-xs p-3 rounded-lg shadow-lg z-50">
                Education is the foundation of success — consistency builds mastery
              </div>
            )}
          </div>

          <a href="#faq-section" className="flex items-center gap-2">
            <HelpCircle size={18} />
            FAQs
          </a>
        </div>

        <div className="w-1/3 flex justify-end items-center gap-4">

          {/* NOTIFICATION */}
          <div className="relative">
            <button onClick={() => setShowReminderMenu(!showReminderMenu)}>
              <Bell />
            </button>

            {showReminderMenu && (
              <div className="absolute right-0 mt-3 w-64 bg-white border rounded-xl shadow p-3 z-50">
                <p className="text-sm mb-2">📚 Read today’s lesson</p>
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
                <img src={profileImage} className="w-full h-full object-cover" />
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

                {/* ❌ ACCOUNT SETTINGS REMOVED */}

                <div className="p-2 mt-2 rounded hover:bg-gray-100">
                  <p className="font-semibold">🔵 Study Streak</p>

                  <div className="grid grid-cols-7 gap-1 mt-2">
                    {Array.from({ length: 21 }).map((_, i) => (
                      <div
                        key={i}
                        className={`w-3 h-3 rounded-sm ${
                          Math.random() > 0.4
                            ? "bg-green-500"
                            : "bg-gray-200"
                        }`}
                      />
                    ))}
                  </div>

                  <p className="text-xs mt-2">
                    Current: {streak.current}
                  </p>
                  <p className="text-xs">
                    Longest: {streak.longest}
                  </p>
                </div>

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