import React, { useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  User,
  Mail,
  Bell,
  BookOpen,
  Target,
  Clock3,
  Shield,
  LogOut,
  ChevronRight,
  Check,
  Sparkles,
  Save,
} from "lucide-react";

import { AuthContext } from "../context/AuthContext";

const Settings = () => {
  const navigate = useNavigate();
  const { profile, user } = useContext(AuthContext);

  /* =========================================================
     USER INFORMATION
  ========================================================= */

  const username =
    profile?.username ||
    profile?.full_name ||
    user?.user_metadata?.username ||
    user?.user_metadata?.full_name ||
    user?.email?.split("@")[0] ||
    "Student";

  const email =
    profile?.email ||
    user?.email ||
    "";

  /* =========================================================
     SETTINGS STATE
  ========================================================= */

  const [notifications, setNotifications] = useState(() => {
    return localStorage.getItem("scholiqen-notifications") !== "false";
  });

  const [studyReminders, setStudyReminders] = useState(() => {
    return localStorage.getItem("scholiqen-study-reminders") !== "false";
  });

  const [emailNotifications, setEmailNotifications] = useState(() => {
    return localStorage.getItem("scholiqen-email-notifications") !== "false";
  });

  const [studyGoal, setStudyGoal] = useState(() => {
    return localStorage.getItem("scholiqen-study-goal") || "2";
  });

  const [studyMode, setStudyMode] = useState(() => {
    return localStorage.getItem("scholiqen-study-mode") || "focused";
  });

  const [reminderTime, setReminderTime] = useState(() => {
    return localStorage.getItem("scholiqen-reminder-time") || "18:00";
  });

  const [saved, setSaved] = useState(false);

  /* =========================================================
     SAVE SETTINGS
  ========================================================= */

  const handleSave = () => {
    localStorage.setItem(
      "scholiqen-notifications",
      String(notifications)
    );

    localStorage.setItem(
      "scholiqen-study-reminders",
      String(studyReminders)
    );

    localStorage.setItem(
      "scholiqen-email-notifications",
      String(emailNotifications)
    );

    localStorage.setItem(
      "scholiqen-study-goal",
      studyGoal
    );

    localStorage.setItem(
      "scholiqen-study-mode",
      studyMode
    );

    localStorage.setItem(
      "scholiqen-reminder-time",
      reminderTime
    );

    setSaved(true);

    setTimeout(() => {
      setSaved(false);
    }, 2500);
  };

  /* =========================================================
     LOGOUT
  ========================================================= */

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/");
  };

  /* =========================================================
     SETTING ROW
  ========================================================= */

  const SettingRow = ({
    icon: Icon,
    iconClass = "text-blue-400 bg-blue-400/10",
    title,
    description,
    children,
  }) => {
    return (
      <div className="flex flex-col gap-5 rounded-2xl border border-white/5 bg-white/[0.02] p-5 transition hover:border-white/10 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-4">
          <div
            className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${iconClass}`}
          >
            <Icon size={19} />
          </div>

          <div>
            <h3 className="font-bold text-white">
              {title}
            </h3>

            <p className="mt-1 max-w-xl text-sm leading-6 text-slate-500">
              {description}
            </p>
          </div>
        </div>

        <div className="shrink-0">
          {children}
        </div>
      </div>
    );
  };

  /* =========================================================
     TOGGLE
  ========================================================= */

  const Toggle = ({ enabled, onChange }) => {
    return (
      <button
        type="button"
        onClick={() => onChange(!enabled)}
        className={`relative h-7 w-12 rounded-full transition ${
          enabled
            ? "bg-cyan-500"
            : "bg-slate-700"
        }`}
        aria-pressed={enabled}
      >
        <span
          className={`absolute top-1 h-5 w-5 rounded-full bg-white shadow-md transition-transform ${
            enabled
              ? "translate-x-6"
              : "translate-x-1"
          }`}
        />
      </button>
    );
  };

  return (
    <section className="min-h-screen bg-slate-950 px-4 py-6 text-white sm:px-6 lg:px-8">

      <div className="mx-auto max-w-5xl">

        {/* =====================================================
            TOP BAR
        ===================================================== */}

        <div className="mb-8 flex items-center justify-between">

          <button
            type="button"
            onClick={() => navigate(-1)}
            className="
              inline-flex
              items-center
              gap-2
              rounded-xl
              border
              border-white/10
              bg-white/5
              px-4
              py-2.5
              text-sm
              font-semibold
              text-slate-300
              transition
              hover:bg-white/10
              hover:text-white
            "
          >
            <ArrowLeft size={17} />
            Back
          </button>

          <div className="hidden items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-slate-600 sm:flex">
            <Sparkles size={14} />
            Scholiqen
          </div>

        </div>

        {/* =====================================================
            HEADER
        ===================================================== */}

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
          className="
            relative
            mb-8
            overflow-hidden
            rounded-[2rem]
            border
            border-white/10
            bg-gradient-to-br
            from-slate-900
            via-slate-900
            to-blue-950/40
            p-7
            shadow-2xl
            sm:p-9
          "
        >
          <div className="absolute -right-24 -top-24 h-64 w-64 rounded-full bg-cyan-500/10 blur-3xl" />

          <div className="relative z-10">

            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl border border-cyan-400/10 bg-cyan-400/10">
              <Sparkles
                size={22}
                className="text-cyan-400"
              />
            </div>

            <h1 className="text-3xl font-black tracking-tight sm:text-4xl">
              Settings
            </h1>

            <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-400 sm:text-base">
              Manage your Scholiqen account, notifications,
              learning preferences and study routine.
            </p>

          </div>
        </motion.div>

        {/* =====================================================
            ACCOUNT
        ===================================================== */}

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.05 }}
          className="mb-7"
        >

          <div className="mb-4">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-cyan-400">
              Account
            </p>

            <h2 className="mt-1 text-xl font-black text-white">
              Account Information
            </h2>
          </div>

          <div className="space-y-3">

            <SettingRow
              icon={User}
              title="Username"
              description="The username associated with your Scholiqen account."
            >
              <div className="rounded-xl border border-white/10 bg-black/20 px-4 py-2.5 text-sm font-semibold text-slate-300">
                {username}
              </div>
            </SettingRow>

            <SettingRow
              icon={Mail}
              iconClass="bg-violet-400/10 text-violet-400"
              title="Email Address"
              description="Your registered account email address."
            >
              <div className="max-w-[240px] truncate rounded-xl border border-white/10 bg-black/20 px-4 py-2.5 text-sm font-semibold text-slate-300">
                {email || "Not available"}
              </div>
            </SettingRow>

          </div>
        </motion.div>

        {/* =====================================================
            NOTIFICATIONS
        ===================================================== */}

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.1 }}
          className="mb-7"
        >

          <div className="mb-4">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-cyan-400">
              Notifications
            </p>

            <h2 className="mt-1 text-xl font-black text-white">
              Stay Updated
            </h2>
          </div>

          <div className="space-y-3">

            <SettingRow
              icon={Bell}
              title="Notifications"
              description="Receive important updates and activity notifications."
            >
              <Toggle
                enabled={notifications}
                onChange={setNotifications}
              />
            </SettingRow>

            <SettingRow
              icon={Sparkles}
              iconClass="bg-yellow-400/10 text-yellow-400"
              title="Study Reminders"
              description="Get reminders to keep your learning routine consistent."
            >
              <Toggle
                enabled={studyReminders}
                onChange={setStudyReminders}
              />
            </SettingRow>

            <SettingRow
              icon={Mail}
              iconClass="bg-violet-400/10 text-violet-400"
              title="Email Notifications"
              description="Receive important learning and account updates by email."
            >
              <Toggle
                enabled={emailNotifications}
                onChange={setEmailNotifications}
              />
            </SettingRow>

          </div>
        </motion.div>

        {/* =====================================================
            LEARNING PREFERENCES
        ===================================================== */}

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.15 }}
          className="mb-7"
        >

          <div className="mb-4">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-cyan-400">
              Learning
            </p>

            <h2 className="mt-1 text-xl font-black text-white">
              Learning Preferences
            </h2>
          </div>

          <div className="space-y-3">

            {/* Study Goal */}

            <SettingRow
              icon={Target}
              iconClass="bg-emerald-400/10 text-emerald-400"
              title="Daily Study Goal"
              description="Set how many hours you want to dedicate to learning each day."
            >
              <select
                value={studyGoal}
                onChange={(event) =>
                  setStudyGoal(event.target.value)
                }
                className="
                  rounded-xl
                  border
                  border-white/10
                  bg-[#0b0f1a]
                  px-4
                  py-2.5
                  text-sm
                  font-semibold
                  text-white
                  outline-none
                  transition
                  focus:border-cyan-400
                "
              >
                <option value="1">1 hour</option>
                <option value="2">2 hours</option>
                <option value="3">3 hours</option>
                <option value="4">4 hours</option>
                <option value="5">5 hours</option>
                <option value="6">6+ hours</option>
              </select>
            </SettingRow>

            {/* Study Mode */}

            <SettingRow
              icon={BookOpen}
              iconClass="bg-blue-400/10 text-blue-400"
              title="Study Mode"
              description="Choose the learning style you prefer when studying."
            >
              <select
                value={studyMode}
                onChange={(event) =>
                  setStudyMode(event.target.value)
                }
                className="
                  rounded-xl
                  border
                  border-white/10
                  bg-[#0b0f1a]
                  px-4
                  py-2.5
                  text-sm
                  font-semibold
                  text-white
                  outline-none
                  transition
                  focus:border-cyan-400
                "
              >
                <option value="focused">
                  Focused
                </option>

                <option value="balanced">
                  Balanced
                </option>

                <option value="relaxed">
                  Relaxed
                </option>
              </select>
            </SettingRow>

            {/* Reminder Time */}

            <SettingRow
              icon={Clock3}
              iconClass="bg-orange-400/10 text-orange-400"
              title="Study Reminder Time"
              description="Choose the time you would like to receive your study reminder."
            >
              <input
                type="time"
                value={reminderTime}
                onChange={(event) =>
                  setReminderTime(event.target.value)
                }
                className="
                  rounded-xl
                  border
                  border-white/10
                  bg-[#0b0f1a]
                  px-4
                  py-2.5
                  text-sm
                  font-semibold
                  text-white
                  outline-none
                  transition
                  focus:border-cyan-400
                "
              />
            </SettingRow>

          </div>
        </motion.div>

        {/* =====================================================
            SECURITY
        ===================================================== */}

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.2 }}
          className="mb-7"
        >

          <div className="mb-4">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-cyan-400">
              Security
            </p>

            <h2 className="mt-1 text-xl font-black text-white">
              Account Security
            </h2>
          </div>

          <button
            type="button"
            onClick={() => navigate("/profile")}
            className="
              group
              flex
              w-full
              items-center
              gap-4
              rounded-2xl
              border
              border-white/5
              bg-white/[0.02]
              p-5
              text-left
              transition
              hover:border-white/10
              hover:bg-white/5
            "
          >

            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-400/10 text-emerald-400">
              <Shield size={19} />
            </div>

            <div className="flex-1">
              <h3 className="font-bold text-white">
                Manage Account
              </h3>

              <p className="mt-1 text-sm text-slate-500">
                View and manage your account information.
              </p>
            </div>

            <ChevronRight
              size={18}
              className="text-slate-600 transition group-hover:translate-x-1 group-hover:text-white"
            />

          </button>

        </motion.div>

        {/* =====================================================
            SAVE
        ===================================================== */}

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.25 }}
          className="mb-7 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"
        >

          <p className="text-xs text-slate-600">
            Your learning preferences are saved on this device.
          </p>

          <button
            type="button"
            onClick={handleSave}
            className="
              inline-flex
              items-center
              justify-center
              gap-2
              rounded-xl
              bg-cyan-500
              px-6
              py-3
              text-sm
              font-black
              text-slate-950
              shadow-lg
              shadow-cyan-500/10
              transition
              hover:bg-cyan-400
              active:scale-[0.98]
            "
          >
            {saved ? (
              <>
                <Check size={17} />
                Saved
              </>
            ) : (
              <>
                <Save size={17} />
                Save Settings
              </>
            )}
          </button>

        </motion.div>

        {/* =====================================================
            LOGOUT
        ===================================================== */}

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.3 }}
          className="mb-10"
        >

          <button
            type="button"
            onClick={handleLogout}
            className="
              flex
              w-full
              items-center
              gap-4
              rounded-2xl
              border
              border-red-500/10
              bg-red-500/5
              p-5
              text-left
              transition
              hover:border-red-500/20
              hover:bg-red-500/10
            "
          >

            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-red-500/10 text-red-400">
              <LogOut size={19} />
            </div>

            <div>
              <h3 className="font-bold text-red-400">
                Log Out
              </h3>

              <p className="mt-1 text-sm text-slate-600">
                Sign out of your Scholiqen account.
              </p>
            </div>

          </button>

        </motion.div>

        {/* =====================================================
            FOOTER
        ===================================================== */}

        <div className="border-t border-white/5 py-8 text-center">

          <div className="flex items-center justify-center gap-2 text-slate-600">

            <Sparkles size={14} />

            <span className="text-xs font-semibold uppercase tracking-[0.15em]">
              Scholiqen
            </span>

          </div>

          <p className="mt-2 text-xs text-slate-700">
            Your learning. Your journey. Your progress.
          </p>

        </div>

      </div>
    </section>
  );
};

export default Settings;
