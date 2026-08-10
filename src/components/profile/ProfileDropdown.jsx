import React, { useContext } from "react";
import {
  User,
  BarChart3,
  Settings,
  LogOut,
} from "lucide-react";

import { AuthContext } from "../../context/AuthContext";

const ProfileDropdown = ({
  onClose,
  onLogout,
  onOpenProfile,
}) => {
  const { profile, user } = useContext(AuthContext);

  /* =========================================================
     USERNAME
  ========================================================= */

  const username =
    profile?.username ||
    profile?.full_name ||
    user?.user_metadata?.username ||
    user?.user_metadata?.full_name ||
    user?.email?.split("@")[0] ||
    "Student";

  /* =========================================================
     EMAIL
  ========================================================= */

  const email =
    profile?.email ||
    user?.email ||
    "";

  /* =========================================================
     FALLBACK INITIAL
  ========================================================= */

  const firstLetter =
    String(username || "S").charAt(0).toUpperCase();

  /* =========================================================
     PROFILE IMAGE
     
     IMPORTANT:
     These fields match the profile page and common Supabase
     profile image fields.

     Priority is given to the uploaded profile picture.
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
     HANDLE MENU ACTION
  ========================================================= */

  const handleAction = (action) => {
    if (typeof action === "function") {
      action();
    }

    if (typeof onClose === "function") {
      onClose();
    }
  };

  return (
    <div className="w-80 overflow-hidden rounded-2xl border border-white/10 bg-slate-950 shadow-2xl shadow-black/40 backdrop-blur-2xl">

      {/* =====================================================
          PROFILE HEADER
      ===================================================== */}

      <div className="border-b border-white/10 bg-gradient-to-br from-blue-500/10 via-transparent to-cyan-400/5 p-5">

        <div className="flex items-center gap-4">

          {/* =================================================
              PROFILE IMAGE
          ================================================= */}

          <div className="relative shrink-0">

            <div className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-2xl border-2 border-cyan-400/20 bg-gradient-to-br from-cyan-500/20 to-blue-600/20 text-xl font-black text-cyan-300 shadow-lg shadow-cyan-500/10">

              {profileImage ? (
                <img
                  src={profileImage}
                  alt={username}
                  className="block h-full w-full object-cover"
                  onError={(event) => {
                    event.currentTarget.onerror = null;
                    event.currentTarget.style.display = "none";
                  }}
                />
              ) : (
                <span>{firstLetter}</span>
              )}

            </div>

            {/* Online indicator */}

            <span className="absolute -bottom-1 -right-1 h-4 w-4 rounded-full border-[3px] border-slate-950 bg-emerald-400" />

          </div>

          {/* =================================================
              USER DETAILS
          ================================================= */}

          <div className="min-w-0 flex-1">

            <p className="truncate text-base font-black text-white">
              {username}
            </p>

            <p className="mt-1 truncate text-xs font-medium text-cyan-400">
              @{String(username).replace(/\s+/g, "").toLowerCase()}
            </p>

          </div>

        </div>

      </div>

      {/* =====================================================
          MENU
      ===================================================== */}

      <div className="p-2">

        {/* =================================================
            VIEW PROFILE
        ================================================= */}

        <button
          type="button"
          onClick={() =>
            handleAction(onOpenProfile)
          }
          className="
            flex
            w-full
            items-center
            gap-3
            rounded-xl
            px-3
            py-3
            text-left
            text-sm
            font-medium
            text-slate-300
            transition
            duration-200
            hover:bg-white/5
            hover:text-white
          "
        >

          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-500/10 text-blue-400">
            <User size={17} />
          </span>

          <span className="flex-1">
            View Profile
          </span>

        </button>

        {/* =================================================
            LEARNING STATS
        ================================================= */}

        <button
          type="button"
          onClick={() =>
            handleAction(() => {
              window.location.href = "/learning-stats";
            })
          }
          className="
            flex
            w-full
            items-center
            gap-3
            rounded-xl
            px-3
            py-3
            text-left
            text-sm
            font-medium
            text-slate-300
            transition
            duration-200
            hover:bg-white/5
            hover:text-white
          "
        >

          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-violet-500/10 text-violet-400">
            <BarChart3 size={17} />
          </span>

          <span className="flex-1">
            Learning Stats
          </span>

        </button>

        {/* =================================================
            SETTINGS
        ================================================= */}

        <button
          type="button"
          onClick={() =>
            handleAction(() => {
              window.location.href = "/settings";
            })
          }
          className="
            flex
            w-full
            items-center
            gap-3
            rounded-xl
            px-3
            py-3
            text-left
            text-sm
            font-medium
            text-slate-300
            transition
            duration-200
            hover:bg-white/5
            hover:text-white
          "
        >

          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-700/40 text-slate-400">
            <Settings size={17} />
          </span>

          <span className="flex-1">
            Settings
          </span>

        </button>

        {/* =================================================
            DIVIDER
        ================================================= */}

        <div className="my-2 border-t border-white/10" />

        {/* =================================================
            LOGOUT
        ================================================= */}

        <button
          type="button"
          onClick={() => {
            if (typeof onLogout === "function") {
              onLogout();
            }

            if (typeof onClose === "function") {
              onClose();
            }
          }}
          className="
            flex
            w-full
            items-center
            gap-3
            rounded-xl
            px-3
            py-3
            text-left
            text-sm
            font-semibold
            text-red-400
            transition
            duration-200
            hover:bg-red-500/10
            hover:text-red-300
          "
        >

          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-red-500/10">
            <LogOut size={17} />
          </span>

          <span className="flex-1">
            Logout
          </span>

        </button>

      </div>

      {/* =====================================================
          FOOTER
      ===================================================== */}

      <div className="border-t border-white/10 px-4 py-3">

        <p className="text-center text-[10px] font-medium uppercase tracking-[0.15em] text-slate-600">
          Scholiqen Learning Platform
        </p>

      </div>

    </div>
  );
};

export default ProfileDropdown;