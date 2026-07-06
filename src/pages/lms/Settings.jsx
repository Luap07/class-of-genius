import React, { useState } from "react";
import {
  Bell,
  Globe,
  Lock,
  Moon,
  Sun,
  Shield,
  Save,
  LogOut,
  UserCog,
  Database,
} from "lucide-react";

const Settings = () => {
  const [darkMode, setDarkMode] = useState(true);
  const [notifications, setNotifications] = useState(true);
  const [autoSave, setAutoSave] = useState(true);
  const [language, setLanguage] = useState("English");

  return (
    <div className="space-y-8">

      {/* Header */}
      <div>
        <h1 className="text-4xl font-bold text-white">
          Settings
        </h1>

        <p className="text-slate-400 mt-2">
          Manage your account preferences and learning experience.
        </p>
      </div>

      {/* Appearance */}
      <div className="rounded-3xl bg-slate-900 border border-slate-800 p-8">

        <div className="flex items-center gap-3 mb-6">
          {darkMode ? (
            <Moon className="text-blue-400" />
          ) : (
            <Sun className="text-yellow-400" />
          )}

          <h2 className="text-2xl font-bold">
            Appearance
          </h2>
        </div>

        <div className="flex items-center justify-between">

          <div>
            <p className="font-semibold">
              Dark Mode
            </p>

            <p className="text-slate-400">
              Enable the dark interface.
            </p>
          </div>

          <button
            onClick={() => setDarkMode(!darkMode)}
            className={`w-16 h-8 rounded-full transition ${
              darkMode
                ? "bg-blue-600"
                : "bg-slate-700"
            }`}
          >
            <div
              className={`w-6 h-6 bg-white rounded-full mt-1 transition ${
                darkMode
                  ? "ml-9"
                  : "ml-1"
              }`}
            />
          </button>

        </div>

      </div>

      {/* Notifications */}
      <div className="rounded-3xl bg-slate-900 border border-slate-800 p-8">

        <div className="flex items-center gap-3 mb-6">

          <Bell className="text-cyan-400" />

          <h2 className="text-2xl font-bold">
            Notifications
          </h2>

        </div>

        <div className="flex justify-between items-center">

          <div>

            <p className="font-semibold">
              Enable Notifications
            </p>

            <p className="text-slate-400">
              Receive reminders and updates.
            </p>

          </div>

          <button
            onClick={() =>
              setNotifications(!notifications)
            }
            className={`w-16 h-8 rounded-full transition ${
              notifications
                ? "bg-green-600"
                : "bg-slate-700"
            }`}
          >
            <div
              className={`w-6 h-6 bg-white rounded-full mt-1 transition ${
                notifications
                  ? "ml-9"
                  : "ml-1"
              }`}
            />
          </button>

        </div>

      </div>

      {/* Language */}
      <div className="rounded-3xl bg-slate-900 border border-slate-800 p-8">

        <div className="flex items-center gap-3 mb-6">

          <Globe className="text-emerald-400" />

          <h2 className="text-2xl font-bold">
            Language
          </h2>

        </div>

        <select
          value={language}
          onChange={(e) =>
            setLanguage(e.target.value)
          }
          className="w-full rounded-2xl bg-slate-800 border border-slate-700 px-5 py-4 outline-none"
        >
          <option>English</option>
          <option>French</option>
          <option>Spanish</option>
          <option>Arabic</option>
        </select>

      </div>

      {/* Privacy */}
      <div className="rounded-3xl bg-slate-900 border border-slate-800 p-8">

        <div className="flex items-center gap-3 mb-6">

          <Shield className="text-red-400" />

          <h2 className="text-2xl font-bold">
            Privacy & Security
          </h2>

        </div>

        <div className="space-y-4">

          <button className="w-full flex justify-between items-center rounded-2xl bg-slate-950 border border-slate-800 p-5 hover:border-blue-500">

            <div className="flex items-center gap-3">
              <Lock />
              Change Password
            </div>

            →

          </button>

          <button className="w-full flex justify-between items-center rounded-2xl bg-slate-950 border border-slate-800 p-5 hover:border-blue-500">

            <div className="flex items-center gap-3">
              <UserCog />
              Account Security
            </div>

            →

          </button>

        </div>

      </div>

      {/* Auto Save */}
      <div className="rounded-3xl bg-slate-900 border border-slate-800 p-8">

        <div className="flex items-center gap-3 mb-6">

          <Database className="text-purple-400" />

          <h2 className="text-2xl font-bold">
            Learning Data
          </h2>

        </div>

        <div className="flex justify-between items-center">

          <div>

            <p className="font-semibold">
              Auto Save Progress
            </p>

            <p className="text-slate-400">
              Automatically save learning progress.
            </p>

          </div>

          <button
            onClick={() =>
              setAutoSave(!autoSave)
            }
            className={`w-16 h-8 rounded-full ${
              autoSave
                ? "bg-blue-600"
                : "bg-slate-700"
            }`}
          >
            <div
              className={`w-6 h-6 bg-white rounded-full mt-1 transition ${
                autoSave
                  ? "ml-9"
                  : "ml-1"
              }`}
            />
          </button>

        </div>

      </div>

      {/* Footer Buttons */}
      <div className="flex flex-wrap gap-5">

        <button className="flex items-center gap-2 px-8 py-4 rounded-2xl bg-blue-600 hover:bg-blue-700">

          <Save />

          Save Changes

        </button>

        <button className="flex items-center gap-2 px-8 py-4 rounded-2xl bg-red-600 hover:bg-red-700">

          <LogOut />

          Logout

        </button>

      </div>

    </div>
  );
};

export default Settings;