import React, { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  ArrowRight,
  Eye,
  EyeOff,
  GraduationCap,
  Lock,
  LogIn,
  ShieldCheck,
  Mail,
  AlertCircle,
  Sparkles,
} from "lucide-react";

/* =========================================================
   API
========================================================= */

const API_URL = (
  import.meta.env.VITE_API_URL ||
  "http://localhost:5000"
).replace(/\/$/, "");

/* =========================================================
   STORAGE KEYS
========================================================= */

const ACADEMY_TOKEN_KEY =
  "scholiqen_academy_token";

const ACADEMY_USER_KEY =
  "scholiqen_academy_user";

/*
  Keep these because older Academy/student pages
  may still use the general authentication keys.
*/
const AUTH_TOKEN_KEY =
  "scholiqen_auth_token";

const AUTH_USER_KEY =
  "scholiqen_current_user";

/* =========================================================
   COMPONENT
========================================================= */

export default function StudentEnrollmentLogin() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const [showPassword, setShowPassword] =
    useState(false);

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState("");

  /* =========================================================
     HANDLE INPUT
  ========================================================= */

  const handleChange = (e) => {
    const {
      name,
      value,
    } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (error) {
      setError("");
    }
  };

  /* =========================================================
     STUDENT LOGIN
  ========================================================= */

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");

    const email =
      form.email
        .trim()
        .toLowerCase();

    const password =
      form.password;

    /* -------------------------------------------------------
       VALIDATION
    ------------------------------------------------------- */

    if (!email || !password) {
      setError(
        "Please enter your email and password."
      );
      return;
    }

    setLoading(true);

    try {
      /* -----------------------------------------------------
         LOGIN REQUEST
      ----------------------------------------------------- */

      const response =
        await fetch(
          `${API_URL}/api/academy/student-login`,
          {
            method: "POST",

            headers: {
              "Content-Type":
                "application/json",
            },

            body: JSON.stringify({
              email,
              password,
            }),
          }
        );

      const data =
        await response
          .json()
          .catch(() => ({}));

      /* -----------------------------------------------------
         API ERROR
      ----------------------------------------------------- */

      if (!response.ok) {
        throw new Error(
          data?.message ||
            data?.error ||
            "Invalid email or password."
        );
      }

      /* -----------------------------------------------------
         TOKEN
      ----------------------------------------------------- */

      const token =
        data?.token ||
        data?.accessToken ||
        data?.access_token;

      /* -----------------------------------------------------
         USER
      ----------------------------------------------------- */

      const user =
        data?.user ||
        data?.data?.user ||
        data?.profile ||
        data?.data;

      /* -----------------------------------------------------
         TOKEN VALIDATION
      ----------------------------------------------------- */

      if (!token) {
        throw new Error(
          "Login succeeded, but no authentication token was returned."
        );
      }

      /* -----------------------------------------------------
         USER VALIDATION
      ----------------------------------------------------- */

      if (!user) {
        throw new Error(
          "Login succeeded, but no student account information was returned."
        );
      }

      /* =====================================================
         SAVE ACADEMY SESSION
      ===================================================== */

      localStorage.setItem(
        ACADEMY_TOKEN_KEY,
        token
      );

      localStorage.setItem(
        ACADEMY_USER_KEY,
        JSON.stringify(user)
      );

      /* =====================================================
         SAVE BACKWARD-COMPATIBLE SESSION
      ===================================================== */

      localStorage.setItem(
        AUTH_TOKEN_KEY,
        token
      );

      localStorage.setItem(
        AUTH_USER_KEY,
        JSON.stringify(user)
      );

      /* =====================================================
         DEBUG
      ===================================================== */

      console.log(
        "======================================"
      );

      console.log(
        "STUDENT LOGIN SUCCESS"
      );

      console.log(
        "STUDENT USER:",
        user
      );

      console.log(
        "STUDENT TOKEN SAVED"
      );

      console.log(
        "======================================"
      );

      /* =====================================================
         ENTER STUDENT LEARNING PORTAL
      ===================================================== */

      navigate(
        "/academy/student-portal",
        {
          replace: true,
        }
      );
    } catch (err) {
      console.error(
        "Student login error:",
        err
      );

      setError(
        err?.message ||
          "Unable to log in right now. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  /* =========================================================
     RENDER
  ========================================================= */

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#050816] text-white">

      {/* =====================================================
          BACKGROUND
      ===================================================== */}

      <div className="pointer-events-none absolute inset-0">

        <div
          className="absolute inset-0 opacity-[0.08]"
          style={{
            backgroundImage:
              "radial-gradient(circle at 1px 1px, rgba(56,189,248,0.8) 1px, transparent 0)",
            backgroundSize:
              "32px 32px",
          }}
        />

        <div className="absolute -left-40 -top-40 h-[500px] w-[500px] rounded-full bg-cyan-500/10 blur-[130px]" />

        <div className="absolute -right-40 top-1/3 h-[500px] w-[500px] rounded-full bg-violet-600/10 blur-[140px]" />

        <div className="absolute -bottom-40 left-1/3 h-[450px] w-[450px] rounded-full bg-blue-600/10 blur-[130px]" />

      </div>

      {/* =====================================================
          HEADER
      ===================================================== */}

      <header className="relative z-10 border-b border-white/10 bg-[#050816]/80 backdrop-blur-xl">

        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">

          {/* BRAND */}

          <button
            type="button"
            onClick={() =>
              navigate("/academy")
            }
            className="group flex items-center gap-3"
          >

            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-400 to-blue-600 shadow-lg shadow-cyan-500/20 transition-transform group-hover:scale-105">
              <GraduationCap className="h-6 w-6 text-white" />
            </div>

            <div className="text-left">

              <p className="text-lg font-black tracking-tight">
                SCHOLIQEN
              </p>

              <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-cyan-400">
                Academy
              </p>

            </div>

          </button>

          {/* BACK */}

          <button
            type="button"
            onClick={() =>
              navigate("/academy")
            }
            className="flex items-center gap-2 text-sm text-slate-400 transition hover:text-white"
          >
            <ArrowLeft className="h-4 w-4" />

            Back to Academy
          </button>

        </div>

      </header>

      {/* =====================================================
          MAIN
      ===================================================== */}

      <main className="relative z-10 flex min-h-[calc(100vh-81px)] items-center justify-center px-6 py-14">

        <motion.div
          initial={{
            opacity: 0,
            y: 25,
          }}
          animate={{
            opacity: 1,
            y: 0,
          }}
          transition={{
            duration: 0.6,
          }}
          className="w-full max-w-md"
        >

          {/* =================================================
              HEADER CONTENT
          ================================================= */}

          <div className="mb-8 text-center">

            <motion.div
              initial={{
                scale: 0.8,
                opacity: 0,
              }}
              animate={{
                scale: 1,
                opacity: 1,
              }}
              transition={{
                delay: 0.1,
                duration: 0.5,
              }}
              className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-3xl border border-cyan-400/20 bg-gradient-to-br from-cyan-400/20 via-blue-500/20 to-violet-500/20 shadow-2xl shadow-cyan-500/10"
            >

              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-400 to-blue-600">

                <LogIn className="h-7 w-7 text-white" />

              </div>

            </motion.div>

            {/* BADGE */}

            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-400/5 px-3 py-1.5 text-xs font-bold text-cyan-300">

              <Sparkles className="h-3.5 w-3.5" />

              STUDENT PORTAL

            </div>

            {/* TITLE */}

            <h1 className="text-3xl font-black tracking-tight sm:text-4xl">
              Welcome Back
            </h1>

            <p className="mt-3 text-sm leading-6 text-slate-400">
              Sign in with the email address and
              password assigned to you by
              Scholiqen Academy.
            </p>

          </div>

          {/* =================================================
              LOGIN CARD
          ================================================= */}

          <div className="rounded-3xl border border-white/10 bg-white/[0.035] p-6 shadow-2xl shadow-black/30 backdrop-blur-xl sm:p-8">

            {/* ERROR */}

            {error && (
              <motion.div
                initial={{
                  opacity: 0,
                  y: -8,
                }}
                animate={{
                  opacity: 1,
                  y: 0,
                }}
                className="mb-5 flex items-start gap-3 rounded-2xl border border-red-400/20 bg-red-500/10 px-4 py-3.5 text-sm text-red-300"
              >

                <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />

                <span>
                  {error}
                </span>

              </motion.div>
            )}

            {/* FORM */}

            <form
              onSubmit={handleSubmit}
              className="space-y-5"
            >

              {/* EMAIL */}

              <div>

                <label
                  htmlFor="email"
                  className="mb-2 block text-sm font-bold text-slate-200"
                >
                  Email Address
                </label>

                <div className="relative">

                  <Mail className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-500" />

                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    value={form.email}
                    onChange={
                      handleChange
                    }
                    placeholder="Enter your email address"
                    className="h-14 w-full rounded-2xl border border-white/10 bg-black/20 pl-12 pr-4 text-white outline-none transition placeholder:text-slate-600 focus:border-cyan-400/50 focus:ring-4 focus:ring-cyan-400/10"
                  />

                </div>

              </div>

              {/* PASSWORD */}

              <div>

                <label
                  htmlFor="password"
                  className="mb-2 block text-sm font-bold text-slate-200"
                >
                  Password
                </label>

                <div className="relative">

                  <Lock className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-500" />

                  <input
                    id="password"
                    name="password"
                    type={
                      showPassword
                        ? "text"
                        : "password"
                    }
                    autoComplete="current-password"
                    value={
                      form.password
                    }
                    onChange={
                      handleChange
                    }
                    placeholder="Enter your password"
                    className="h-14 w-full rounded-2xl border border-white/10 bg-black/20 pl-12 pr-12 text-white outline-none transition placeholder:text-slate-600 focus:border-cyan-400/50 focus:ring-4 focus:ring-cyan-400/10"
                  />

                  <button
                    type="button"
                    onClick={() =>
                      setShowPassword(
                        (prev) =>
                          !prev
                      )
                    }
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 transition hover:text-white"
                    aria-label={
                      showPassword
                        ? "Hide password"
                        : "Show password"
                    }
                  >

                    {showPassword ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}

                  </button>

                </div>

              </div>

              {/* LOGIN BUTTON */}

              <button
                type="submit"
                disabled={loading}
                className="flex h-14 w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-cyan-400 via-blue-500 to-violet-600 font-black text-white shadow-xl shadow-blue-500/20 transition hover:scale-[1.01] hover:shadow-cyan-500/20 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:scale-100"
              >

                {loading ? (
                  <>
                    <span className="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white" />

                    Signing in...
                  </>
                ) : (
                  <>
                    Enter Student Portal

                    <ArrowRight className="h-5 w-5" />
                  </>
                )}

              </button>

            </form>

            {/* SECURITY */}

            <div className="mt-6 flex items-start gap-3 rounded-2xl border border-emerald-400/10 bg-emerald-400/5 p-4">

              <ShieldCheck className="h-5 w-5 shrink-0 text-emerald-400" />

              <div>

                <p className="text-sm font-bold text-emerald-300">
                  Secure Student Access
                </p>

                <p className="mt-1 text-xs leading-5 text-slate-500">
                  Your Academy account is
                  protected by Scholiqen
                  authentication.
                </p>

              </div>

            </div>

          </div>

          {/* =================================================
              ENROLLMENT PROMPT
          ================================================= */}

          <div className="mt-7 text-center">

            <p className="text-sm text-slate-500">
              Not enrolled yet?
            </p>

            <button
              type="button"
              onClick={() =>
                navigate(
                  "/academy/student-enrollment"
                )
              }
              className="mt-2 text-sm font-bold text-cyan-400 transition hover:text-cyan-300"
            >

              Start Student Enrollment

              <ArrowRight className="ml-1 inline-block h-4 w-4" />

            </button>

          </div>

          {/* FOOTER */}

          <p className="mt-10 text-center text-[11px] text-slate-600">
            ©{" "}
            {new Date().getFullYear()}{" "}
            Scholiqen Academy
          </p>

        </motion.div>

      </main>

    </div>
  );
}
