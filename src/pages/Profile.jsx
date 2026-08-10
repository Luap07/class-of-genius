import React, { useContext, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  User,
  Mail,
  Phone,
  Calendar,
  MapPin,
  ShieldCheck,
  Edit3,
  Sparkles,
} from "lucide-react";

import { AuthContext } from "../context/AuthContext";

const Profile = () => {
  const navigate = useNavigate();
  const { profile, user } = useContext(AuthContext);

  /* =========================================================
     SCROLL TO TOP
  ========================================================= */

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  /* =========================================================
     USER DATA
  ========================================================= */

  const username =
    profile?.username ||
    user?.user_metadata?.username ||
    user?.email?.split("@")[0] ||
    "Student";

  const fullName =
    profile?.full_name ||
    user?.user_metadata?.full_name ||
    user?.user_metadata?.name ||
    username;

  const email =
    profile?.email ||
    user?.email ||
    "Not available";

  const phone =
    profile?.phone ||
    profile?.phone_number ||
    user?.user_metadata?.phone ||
    user?.user_metadata?.phone_number ||
    "Not available";

  const dateOfBirth =
    profile?.date_of_birth ||
    profile?.dob ||
    user?.user_metadata?.date_of_birth ||
    user?.user_metadata?.dob ||
    "Not available";

  const gender =
    profile?.gender ||
    user?.user_metadata?.gender ||
    "Not available";

  const location =
    profile?.location ||
    profile?.address ||
    user?.user_metadata?.location ||
    user?.user_metadata?.address ||
    "Not available";

  /* =========================================================
     PROFILE PICTURE
     
     Priority:
     1. Scholiqen profile image
     2. Google/provider image
  ========================================================= */

  const profilePicture =
    profile?.profile_picture ||
    profile?.profile_picture_url ||
    profile?.avatar_url ||
    profile?.photo_url ||
    user?.user_metadata?.profile_picture ||
    user?.user_metadata?.profile_picture_url ||
    user?.user_metadata?.avatar_url ||
    user?.user_metadata?.picture ||
    null;

  /* =========================================================
     INITIALS
  ========================================================= */

  const initials = useMemo(() => {
    const name = String(fullName || username || "Student").trim();

    const parts = name
      .split(/\s+/)
      .filter(Boolean);

    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
    }

    return name.charAt(0).toUpperCase();
  }, [fullName, username]);

  /* =========================================================
     FORMAT DATE
  ========================================================= */

  const formattedDate = useMemo(() => {
    if (!dateOfBirth || dateOfBirth === "Not available") {
      return "Not available";
    }

    const date = new Date(dateOfBirth);

    if (Number.isNaN(date.getTime())) {
      return dateOfBirth;
    }

    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  }, [dateOfBirth]);

  /* =========================================================
     INFO ROW
  ========================================================= */

  const InfoRow = ({
    icon: Icon,
    title,
    value,
    iconClass = "bg-cyan-400/10 text-cyan-400",
  }) => {
    return (
      <div className="flex items-center gap-4 rounded-2xl border border-white/5 bg-white/[0.02] p-4 transition hover:border-white/10 hover:bg-white/[0.035]">
        <div
          className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${iconClass}`}
        >
          <Icon size={19} />
        </div>

        <div className="min-w-0">
          <p className="text-xs font-bold uppercase tracking-[0.14em] text-slate-600">
            {title}
          </p>

          <p className="mt-1 truncate text-sm font-semibold text-slate-200">
            {value || "Not available"}
          </p>
        </div>
      </div>
    );
  };

  /* =========================================================
     PAGE
  ========================================================= */

  return (
    <section className="min-h-screen bg-slate-950 px-4 py-6 text-white sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">

        {/* =====================================================
            TOP BAR
        ===================================================== */}

        <div className="mb-8 flex items-center justify-between">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-semibold text-slate-300 transition hover:bg-white/10 hover:text-white"
          >
            <ArrowLeft size={17} />
            Back
          </button>

          <div className="hidden items-center gap-2 text-xs font-bold uppercase tracking-[0.18em] text-slate-600 sm:flex">
            <Sparkles size={14} />
            Scholiqen
          </div>
        </div>

        {/* =====================================================
            PROFILE HERO
        ===================================================== */}

        <motion.div
          initial={{
            opacity: 0,
            y: 20,
          }}
          animate={{
            opacity: 1,
            y: 0,
          }}
          transition={{
            duration: 0.45,
          }}
          className="relative mb-8 overflow-hidden rounded-[2rem] border border-white/10 bg-gradient-to-br from-slate-900 via-slate-900 to-cyan-950/30 p-6 shadow-2xl sm:p-8"
        >
          {/* Background decoration */}

          <div className="pointer-events-none absolute -right-24 -top-24 h-64 w-64 rounded-full bg-cyan-500/10 blur-3xl" />

          <div className="pointer-events-none absolute -bottom-32 -left-24 h-64 w-64 rounded-full bg-blue-500/10 blur-3xl" />

          <div className="relative z-10 flex flex-col gap-7 sm:flex-row sm:items-center sm:justify-between">

            {/* =================================================
                PROFILE IDENTITY
            ================================================= */}

            <div className="flex min-w-0 items-center gap-5">

              {/* =================================================
                  PROFILE IMAGE
              ================================================= */}

              <div className="relative shrink-0">

                <div className="flex h-24 w-24 items-center justify-center overflow-hidden rounded-2xl border-2 border-cyan-400/20 bg-gradient-to-br from-cyan-500/20 to-blue-600/20 text-3xl font-black text-cyan-300 shadow-xl shadow-cyan-500/10 sm:h-28 sm:w-28 sm:text-4xl">

                  {profilePicture ? (
                    <img
                      src={profilePicture}
                      alt={fullName}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    initials
                  )}

                </div>

                {/* Online indicator */}

                <span className="absolute bottom-1 right-1 h-5 w-5 rounded-full border-4 border-slate-900 bg-emerald-400" />
              </div>

              {/* =================================================
                  NAME / USERNAME
              ================================================= */}

              <div className="min-w-0">

                <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-cyan-400/10 bg-cyan-400/5 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.16em] text-cyan-400">
                  <ShieldCheck size={12} />
                  Student Account
                </div>

                <h1 className="truncate text-2xl font-black tracking-tight text-white sm:text-3xl">
                  {fullName}
                </h1>

                <p className="mt-1 text-sm font-semibold text-slate-500">
                  @{username}
                </p>

              </div>
            </div>

            {/* =================================================
                EDIT BUTTON
            ================================================= */}

            <button
              type="button"
              onClick={() => navigate("/profile/edit")}
              className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 px-5 py-3 text-sm font-bold text-slate-200 transition hover:bg-white/10 hover:text-white"
            >
              <Edit3 size={16} />
              Edit Profile
            </button>

          </div>
        </motion.div>

        {/* =====================================================
            PERSONAL INFORMATION
        ===================================================== */}

        <motion.div
          initial={{
            opacity: 0,
            y: 20,
          }}
          animate={{
            opacity: 1,
            y: 0,
          }}
          transition={{
            duration: 0.45,
            delay: 0.05,
          }}
          className="mb-8"
        >
          <div className="mb-4">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-cyan-400">
              Personal Information
            </p>

            <h2 className="mt-1 text-xl font-black text-white">
              Your Details
            </h2>
          </div>

          <div className="grid gap-3 md:grid-cols-2">

            <InfoRow
              icon={User}
              title="Full Name"
              value={fullName}
            />

            <InfoRow
              icon={User}
              title="Username"
              value={`@${username}`}
              iconClass="bg-blue-400/10 text-blue-400"
            />

            <InfoRow
              icon={Mail}
              title="Email Address"
              value={email}
              iconClass="bg-violet-400/10 text-violet-400"
            />

            <InfoRow
              icon={Phone}
              title="Phone Number"
              value={phone}
              iconClass="bg-emerald-400/10 text-emerald-400"
            />

            <InfoRow
              icon={Calendar}
              title="Date of Birth"
              value={formattedDate}
              iconClass="bg-yellow-400/10 text-yellow-400"
            />

            <InfoRow
              icon={User}
              title="Gender"
              value={gender}
              iconClass="bg-pink-400/10 text-pink-400"
            />

            <InfoRow
              icon={MapPin}
              title="Location"
              value={location}
              iconClass="bg-orange-400/10 text-orange-400"
            />

          </div>
        </motion.div>

        {/* =====================================================
            ACCOUNT INFORMATION
        ===================================================== */}

        <motion.div
          initial={{
            opacity: 0,
            y: 20,
          }}
          animate={{
            opacity: 1,
            y: 0,
          }}
          transition={{
            duration: 0.45,
            delay: 0.1,
          }}
          className="mb-8"
        >
          <div className="mb-4">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-cyan-400">
              Account
            </p>

            <h2 className="mt-1 text-xl font-black text-white">
              Account Information
            </h2>
          </div>

          <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-5">

            <div className="flex items-center gap-4">

              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-400/10 text-emerald-400">
                <ShieldCheck size={20} />
              </div>

              <div>
                <p className="text-sm font-bold text-white">
                  Account Active
                </p>

                <p className="mt-1 text-xs text-slate-500">
                  Your Scholiqen account is currently active.
                </p>
              </div>

            </div>

          </div>
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

export default Profile;
