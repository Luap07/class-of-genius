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

const API_URL = (
  import.meta.env.VITE_API_URL ||
  "http://localhost:5000"
).replace(/\/$/, "");

const AUTH_TOKEN_KEY = "scholiqen_auth_token";
const AUTH_USER_KEY = "scholiqen_current_user";

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

  const [error, setError] = useState("");

  /* =========================================================
     HANDLE INPUT
  ========================================================= */

  const handleChange = (e) => {
    const { name, value } = e.target;

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

    const email = form.email.trim().toLowerCase();
    const password = form.password;

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
         API REQUEST
      ----------------------------------------------------- */

      const response = await fetch(
        `${API_URL}/api/academy/student-login`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email,
            password,
          }),
        }
      );

      const data =
        await response.json().catch(() => ({}));

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

      if (!token) {
        throw new Error(
          "Login succeeded, but no authentication token was returned."
        );
      }

      /* -----------------------------------------------------
         SAVE TOKEN
      ----------------------------------------------------- */

      localStorage.setItem(
        AUTH_TOKEN_KEY,
        token
      );

      /* -----------------------------------------------------
         SAVE USER
      ----------------------------------------------------- */

      if (user) {
        localStorage.setItem(
          AUTH_USER_KEY,
          JSON.stringify(user)
        );
      }

      console.log(
        "✅ STUDENT LOGIN SUCCESS:",
        user
      );

      /* -----------------------------------------------------
         PORTAL
      ----------------------------------------------------- */

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
    <div className="min-h-screen bg-[#050816] text-white relative overflow-hidden">
      {/* =====================================================
          BACKGROUND
      ===================================================== */}

      <div className="absolute inset-0 pointer-events-none">
        {/* Dots */}

        <div
          className="absolute inset-0 opacity-[0.08]"
          style={{
            backgroundImage:
              "radial-gradient(circle at 1px 1px, rgba(56,189,248,0.8) 1px, transparent 0)",
            backgroundSize: "32px 32px",
          }}
        />

        {/* Cyan Glow */}

        <div className="absolute -top-40 -left-40 w-[500px] h-[500px] bg-cyan-500/10 rounded-full blur-[130px]" />

        {/* Violet Glow */}

        <div className="absolute top-1/3 -right-40 w-[500px] h-[500px] bg-violet-600/10 rounded-full blur-[140px]" />

        {/* Blue Glow */}

        <div className="absolute -bottom-40 left-1/3 w-[450px] h-[450px] bg-blue-600/10 rounded-full blur-[130px]" />
      </div>

      {/* =====================================================
          HEADER
      ===================================================== */}

      <header className="relative z-10 border-b border-white/10 bg-[#050816]/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 py-5 flex items-center justify-between">
          {/* BRAND */}

          <button
            type="button"
            onClick={() =>
              navigate("/academy")
            }
            className="flex items-center gap-3 group"
          >
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/20 group-hover:scale-105 transition-transform">
              <GraduationCap className="w-6 h-6 text-white" />
            </div>

            <div className="text-left">
              <p className="font-black tracking-tight text-lg">
                SCHOLIQEN
              </p>

              <p className="text-[10px] uppercase tracking-[0.3em] text-cyan-400 font-bold">
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
            className="flex items-center gap-2 text-sm text-slate-400 hover:text-white transition"
          >
            <ArrowLeft className="w-4 h-4" />

            Back to Academy
          </button>
        </div>
      </header>

      {/* =====================================================
          MAIN
      ===================================================== */}

      <main className="relative z-10 min-h-[calc(100vh-81px)] flex items-center justify-center px-6 py-14">
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

          <div className="text-center mb-8">
            {/* ICON */}

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
              className="mx-auto mb-6 w-20 h-20 rounded-3xl bg-gradient-to-br from-cyan-400/20 via-blue-500/20 to-violet-500/20 border border-cyan-400/20 flex items-center justify-center shadow-2xl shadow-cyan-500/10"
            >
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center">
                <LogIn className="w-7 h-7 text-white" />
              </div>
            </motion.div>

            {/* BADGE */}

            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-cyan-400/20 bg-cyan-400/5 text-cyan-300 text-xs font-bold mb-4">
              <Sparkles className="w-3.5 h-3.5" />

              STUDENT PORTAL
            </div>

            {/* TITLE */}

            <h1 className="text-3xl sm:text-4xl font-black tracking-tight">
              Welcome Back
            </h1>

            {/* DESCRIPTION */}

            <p className="text-slate-400 mt-3 text-sm leading-6">
              Sign in with the email address and
              password assigned to you by
              Scholiqen Academy.
            </p>
          </div>

          {/* =================================================
              LOGIN CARD
          ================================================= */}

          <div className="rounded-3xl border border-white/10 bg-white/[0.035] backdrop-blur-xl p-6 sm:p-8 shadow-2xl shadow-black/30">
            {/* =================================================
                ERROR
            ================================================= */}

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
                <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />

                <span>{error}</span>
              </motion.div>
            )}

            {/* =================================================
                FORM
            ================================================= */}

            <form
              onSubmit={handleSubmit}
              className="space-y-5"
            >
              {/* =================================================
                  EMAIL
              ================================================= */}

              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-bold text-slate-200 mb-2"
                >
                  Email Address
                </label>

                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 pointer-events-none" />

                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    value={form.email}
                    onChange={handleChange}
                    placeholder="Enter your email address"
                    className="w-full h-14 rounded-2xl border border-white/10 bg-black/20 pl-12 pr-4 text-white placeholder:text-slate-600 outline-none transition focus:border-cyan-400/50 focus:ring-4 focus:ring-cyan-400/10"
                  />
                </div>
              </div>

              {/* =================================================
                  PASSWORD
              ================================================= */}

              <div>
                <label
                  htmlFor="password"
                  className="block text-sm font-bold text-slate-200 mb-2"
                >
                  Password
                </label>

                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 pointer-events-none" />

                  <input
                    id="password"
                    name="password"
                    type={
                      showPassword
                        ? "text"
                        : "password"
                    }
                    autoComplete="current-password"
                    value={form.password}
                    onChange={handleChange}
                    placeholder="Enter your password"
                    className="w-full h-14 rounded-2xl border border-white/10 bg-black/20 pl-12 pr-12 text-white placeholder:text-slate-600 outline-none transition focus:border-cyan-400/50 focus:ring-4 focus:ring-cyan-400/10"
                  />

                  {/* SHOW PASSWORD */}

                  <button
                    type="button"
                    onClick={() =>
                      setShowPassword(
                        (prev) => !prev
                      )
                    }
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white transition"
                    aria-label={
                      showPassword
                        ? "Hide password"
                        : "Show password"
                    }
                  >
                    {showPassword ? (
                      <EyeOff className="w-5 h-5" />
                    ) : (
                      <Eye className="w-5 h-5" />
                    )}
                  </button>
                </div>
              </div>

              {/* =================================================
                  LOGIN BUTTON
              ================================================= */}

              <button
                type="submit"
                disabled={loading}
                className="w-full h-14 rounded-2xl bg-gradient-to-r from-cyan-400 via-blue-500 to-violet-600 text-white font-black flex items-center justify-center gap-2 shadow-xl shadow-blue-500/20 hover:shadow-cyan-500/20 hover:scale-[1.01] active:scale-[0.99] transition disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:scale-100"
              >
                {loading ? (
                  <>
                    <span className="w-5 h-5 rounded-full border-2 border-white/30 border-t-white animate-spin" />

                    Signing in...
                  </>
                ) : (
                  <>
                    Enter Student Portal

                    <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </button>
            </form>

            {/* =================================================
                SECURITY NOTICE
            ================================================= */}

            <div className="mt-6 flex items-start gap-3 rounded-2xl border border-emerald-400/10 bg-emerald-400/5 p-4">
              <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0" />

              <div>
                <p className="text-sm font-bold text-emerald-300">
                  Secure Student Access
                </p>

                <p className="text-xs text-slate-500 leading-5 mt-1">
                  Your Academy account is protected
                  by Scholiqen authentication.
                </p>
              </div>
            </div>
          </div>

          {/* =================================================
              ENROLLMENT PROMPT
          ================================================= */}

          <div className="text-center mt-7">
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
              className="mt-2 text-cyan-400 hover:text-cyan-300 font-bold text-sm transition"
            >
              Start Student Enrollment

              <ArrowRight className="inline-block w-4 h-4 ml-1" />
            </button>
          </div>

          {/* =================================================
              FOOTER
          ================================================= */}

          <p className="text-center text-[11px] text-slate-600 mt-10">
            © {new Date().getFullYear()} Scholiqen Academy
          </p>
        </motion.div>
      </main>
    </div>
  );
}