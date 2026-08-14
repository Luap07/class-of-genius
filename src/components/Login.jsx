import React, { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import {
  ArrowRight,
  CheckCircle2,
  LockKeyhole,
  Mail,
  ShieldCheck,
  Sparkles,
  UserRound,
} from "lucide-react";

import Cog from "../assets/cog.png";
import { supabase } from "../lib/supabaseClient";
import { ConnectContext } from "../context/ConnectContext";

const Login = () => {
  const navigate = useNavigate();
  const { darkMode } = useContext(ConnectContext);

  const [isSignup, setIsSignup] = useState(false);

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const [error, setError] = useState("");

  /* =========================================================
     RESET FIELDS WHEN SWITCHING LOGIN / SIGNUP
  ========================================================= */

  useEffect(() => {
    setUsername("");
    setEmail("");
    setPassword("");
    setConfirmPassword("");
    setError("");
    setShowPassword(false);
    setShowConfirmPassword(false);
  }, [isSignup]);

  /* =========================================================
     CLEAR OLD LOCAL PROGRESS
  ========================================================= */

  const clearLocalProgress = () => {
    const keys = Object.keys(localStorage);

    keys.forEach((key) => {
      if (
        key.startsWith("studentProgress_") ||
        key.startsWith("studentWeeklyProgress_")
      ) {
        localStorage.removeItem(key);
      }
    });
  };

  /* =========================================================
     SIGN UP
  ========================================================= */

  const handleSignup = async (e) => {
    e.preventDefault();

    setError("");

    const cleanUsername = username.trim();
    const cleanEmail = email.trim();

    if (!cleanUsername) {
      setError("Please enter a username.");
      return;
    }

    if (!cleanEmail) {
      setError("Please enter your email.");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);

    try {
      const { error } = await supabase.auth.signUp({
        email: cleanEmail,
        password,
        options: {
          data: {
            username: cleanUsername,
          },
        },
      });

      if (error) {
        setError(error.message);
        return;
      }

      alert("Account created successfully 🎉 Check your email!");

      setEmail("");
      setPassword("");
      setConfirmPassword("");

      setIsSignup(false);
    } catch (err) {
      console.error("Signup error:", err);
      setError("Something went wrong while creating your account.");
    } finally {
      setLoading(false);
    }
  };

  /* =========================================================
     LOGIN
  ========================================================= */

  const handleLogin = async (e) => {
    e.preventDefault();

    setError("");
    setLoading(true);

    try {
      clearLocalProgress();

      const { error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (error) {
        setError(error.message);
        return;
      }

      navigate("/dashboard");

      window.scrollTo({ top: 0, behavior: "smooth" });
      window.location.reload();
    } catch (err) {
      console.error("Login error:", err);
      setError("Something went wrong while logging in.");
    } finally {
      setLoading(false);
    }
  };

  /* =========================================================
     GOOGLE AUTH
  ========================================================= */

  const handleGoogleAuth = async () => {
    setError("");
    setGoogleLoading(true);

    try {
      clearLocalProgress();

      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/dashboard`,
        },
      });

      if (error) {
        console.error("Google authentication error:", error);
        setError(error.message);
        setGoogleLoading(false);
      }
    } catch (err) {
      console.error("Google authentication error:", err);
      setError("Unable to continue with Google.");
      setGoogleLoading(false);
    }
  };

  /* =========================================================
     FORGOT PASSWORD
  ========================================================= */

  const handleForgotPassword = async () => {
    setError("");

    if (!email.trim()) {
      setError("Enter your email first.");
      return;
    }

    setLoading(true);

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(
        email.trim(),
        {
          redirectTo: `${window.location.origin}/reset-password`,
        }
      );

      if (error) {
        setError(error.message);
      } else {
        alert("Reset link sent to your email 📩");
      }
    } catch (err) {
      console.error("Password reset error:", err);
      setError("Unable to send password reset email.");
    } finally {
      setLoading(false);
    }
  };

  /* =========================================================
     GOOGLE ICON
  ========================================================= */

  const GoogleIcon = () => (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path
        d="M21.805 12.23c0-.79-.064-1.55-.18-2.28H12v4.315h5.495a4.7 4.7 0 0 1-2.04 3.085v2.565h3.3c1.93-1.778 3.05-4.395 3.05-7.685Z"
        fill="#4285F4"
      />

      <path
        d="M12 22c2.755 0 5.065-.913 6.755-2.475l-3.3-2.565c-.915.615-2.08.98-3.455.98-2.66 0-4.915-1.797-5.725-4.213H2.865v2.648A10.2 10.2 0 0 0 12 22Z"
        fill="#34A853"
      />

      <path
        d="M6.275 13.727A6.13 6.13 0 0 1 5.955 12c0-.6.11-1.182.32-1.727V7.625H2.865A10.03 10.03 0 0 0 1.8 12c0 1.577.38 3.068 1.065 4.375l3.41-2.648Z"
        fill="#FBBC05"
      />

      <path
        d="M12 6.06c1.5 0 2.845.515 3.905 1.525l2.93-2.93C17.06 2.99 14.75 2 12 2a10.2 10.2 0 0 0-9.135 5.625l3.41 2.648C7.085 7.857 9.34 6.06 12 6.06Z"
        fill="#EA4335"
      />
    </svg>
  );

  /* =========================================================
     INPUT COMPONENT
  ========================================================= */

  const inputClass =
    "w-full rounded-2xl border border-white/10 bg-white/[0.045] px-4 py-3.5 text-sm text-white outline-none transition-all duration-300 placeholder:text-slate-600 focus:border-blue-500/50 focus:bg-white/[0.07] focus:ring-4 focus:ring-blue-500/10";

  return (
    <main
      className={`relative flex min-h-screen w-full items-center justify-center overflow-hidden px-4 py-10 sm:px-6 ${
        darkMode ? "bg-[#030712]" : "bg-[#030712]"
      }`}
    >
      {/* =====================================================
          PREMIUM BACKGROUND
      ===================================================== */}

      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        {/* Main gradient */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,#0b1d38_0%,#050914_38%,#030712_75%)]" />

        {/* Blue glow */}
        <div className="absolute -left-40 -top-40 h-[500px] w-[500px] rounded-full bg-blue-600/10 blur-[140px]" />

        {/* Indigo glow */}
        <div className="absolute -bottom-40 -right-40 h-[520px] w-[520px] rounded-full bg-indigo-600/10 blur-[150px]" />

        {/* Center glow */}
        <div className="absolute left-1/2 top-1/2 h-[350px] w-[350px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-cyan-500/[0.035] blur-[120px]" />

        {/* Dotted background */}
        <div
          className="absolute inset-0 opacity-[0.045]"
          style={{
            backgroundImage:
              "radial-gradient(circle, rgba(255,255,255,0.9) 1px, transparent 1px)",
            backgroundSize: "26px 26px",
          }}
        />
      </div>

      {/* =====================================================
          MAIN CONTENT
      ===================================================== */}

      <div className="relative z-10 w-full max-w-[460px]">
        {/* Premium glow around card */}
        <div className="absolute -inset-1 rounded-[34px] bg-gradient-to-r from-blue-500/20 via-cyan-400/10 to-indigo-500/20 opacity-70 blur-2xl" />

        {/* ===================================================
            CARD
        =================================================== */}

        <div className="relative overflow-hidden rounded-[32px] border border-white/10 bg-[#08101d]/90 p-6 shadow-2xl shadow-black/50 backdrop-blur-2xl sm:p-9">
          {/* Top gradient line */}
          <div className="absolute left-1/2 top-0 h-[2px] w-32 -translate-x-1/2 bg-gradient-to-r from-transparent via-blue-400 to-transparent" />

          {/* Decorative glow */}
          <div className="pointer-events-none absolute -right-24 -top-24 h-64 w-64 rounded-full bg-blue-500/10 blur-[90px]" />

          <div className="pointer-events-none absolute -bottom-24 -left-24 h-64 w-64 rounded-full bg-indigo-500/10 blur-[90px]" />

          {/* =================================================
              BRAND
          ================================================= */}

          <div className="relative z-10 mb-8 text-center">
            <div className="relative mx-auto mb-5 h-20 w-20">
              <div className="absolute -inset-3 rounded-[28px] bg-blue-500/15 blur-xl" />

              <div className="relative flex h-20 w-20 items-center justify-center rounded-[22px] border border-white/10 bg-white/[0.055] shadow-xl">
                <img
                  src={Cog}
                  alt="Scholiqen"
                  className="h-16 w-16 object-contain transition-transform duration-500 hover:rotate-12"
                />
              </div>
            </div>

            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-blue-400/20 bg-blue-500/10 px-3.5 py-1.5 text-[10px] font-bold uppercase tracking-[0.18em] text-blue-300">
              <Sparkles className="h-3.5 w-3.5" />
              Premium Learning
            </div>

            <h1 className="text-3xl font-black tracking-tight text-white">
              {isSignup ? "Create Your Account" : "Welcome Back"}
            </h1>

            <p className="mx-auto mt-2 max-w-xs text-sm leading-6 text-slate-500">
              {isSignup
                ? "Join Scholiqen and start your smarter learning journey."
                : "Sign in to continue your learning journey with Scholiqen."}
            </p>
          </div>

          {/* =================================================
              ERROR
          ================================================= */}

          {error && (
            <div className="relative z-10 mb-5 flex items-start gap-3 rounded-2xl border border-red-500/20 bg-red-500/[0.08] px-4 py-3.5 text-sm leading-6 text-red-400">
              <span className="mt-1 h-2 w-2 flex-shrink-0 rounded-full bg-red-400 shadow-[0_0_10px_rgba(248,113,113,0.8)]" />

              <span>{error}</span>
            </div>
          )}

          {/* =================================================
              GOOGLE
          ================================================= */}

          <button
            type="button"
            onClick={handleGoogleAuth}
            disabled={googleLoading || loading}
            className="group relative z-10 flex w-full items-center justify-center gap-3 overflow-hidden rounded-2xl border border-white/10 bg-white py-3.5 text-sm font-bold text-slate-900 shadow-xl transition-all duration-300 hover:-translate-y-0.5 hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-blue-100/50 to-transparent transition-transform duration-700 group-hover:translate-x-full" />

            {googleLoading ? (
              <>
                <span className="h-5 w-5 animate-spin rounded-full border-2 border-slate-300 border-t-slate-900" />

                <span>Connecting to Google...</span>
              </>
            ) : (
              <>
                <GoogleIcon />

                <span>Continue with Google</span>
              </>
            )}
          </button>

          {/* =================================================
              DIVIDER
          ================================================= */}

          <div className="relative z-10 my-7 flex items-center gap-4">
            <div className="h-px flex-1 bg-white/10" />

            <span className="whitespace-nowrap text-[9px] font-bold uppercase tracking-[0.18em] text-slate-600">
              Or continue with email
            </span>

            <div className="h-px flex-1 bg-white/10" />
          </div>

          {/* =================================================
              FORM
          ================================================= */}

          <form
            onSubmit={isSignup ? handleSignup : handleLogin}
            className="relative z-10 space-y-4"
          >
            {/* USERNAME */}
            {isSignup && (
              <div>
                <label className="mb-2 flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.15em] text-slate-500">
                  <UserRound className="h-3.5 w-3.5" />
                  Username
                </label>

                <input
                  type="text"
                  placeholder="Enter your username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className={inputClass}
                  autoComplete="username"
                  required
                />
              </div>
            )}

            {/* EMAIL */}
            <div>
              <label className="mb-2 flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.15em] text-slate-500">
                <Mail className="h-3.5 w-3.5" />
                Email Address
              </label>

              <input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={inputClass}
                autoComplete="email"
                required
              />
            </div>

            {/* PASSWORD */}
            <div>
              <label className="mb-2 flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.15em] text-slate-500">
                <LockKeyhole className="h-3.5 w-3.5" />
                Password
              </label>

              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={`${inputClass} pr-12`}
                  autoComplete={
                    isSignup ? "new-password" : "current-password"
                  }
                  required
                />

                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 transition-colors hover:text-white"
                  aria-label={
                    showPassword ? "Hide password" : "Show password"
                  }
                >
                  {showPassword ? (
                    <FaEyeSlash size={17} />
                  ) : (
                    <FaEye size={17} />
                  )}
                </button>
              </div>
            </div>

            {/* CONFIRM PASSWORD */}
            {isSignup && (
              <div>
                <label className="mb-2 flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.15em] text-slate-500">
                  <LockKeyhole className="h-3.5 w-3.5" />
                  Confirm Password
                </label>

                <div className="relative">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Confirm your password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className={`${inputClass} pr-12`}
                    autoComplete="new-password"
                    required
                  />

                  <button
                    type="button"
                    onClick={() =>
                      setShowConfirmPassword(!showConfirmPassword)
                    }
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 transition-colors hover:text-white"
                    aria-label={
                      showConfirmPassword
                        ? "Hide confirm password"
                        : "Show confirm password"
                    }
                  >
                    {showConfirmPassword ? (
                      <FaEyeSlash size={17} />
                    ) : (
                      <FaEye size={17} />
                    )}
                  </button>
                </div>
              </div>
            )}

            {/* LOGIN OPTIONS */}
            {!isSignup && (
              <div className="flex items-center justify-between pt-1">
                <div className="flex items-center gap-2 text-xs text-slate-600">
                  <ShieldCheck className="h-4 w-4 text-emerald-400/70" />
                  Secure login
                </div>

                <button
                  type="button"
                  onClick={handleForgotPassword}
                  disabled={loading || googleLoading}
                  className="text-xs font-bold text-blue-400 transition-colors hover:text-blue-300 disabled:opacity-50"
                >
                  Forgot Password?
                </button>
              </div>
            )}

            {/* SUBMIT */}
            <button
              type="submit"
              disabled={loading || googleLoading}
              className="group relative mt-2 flex w-full cursor-pointer items-center justify-center gap-2 overflow-hidden rounded-2xl bg-gradient-to-r from-blue-600 via-blue-600 to-indigo-600 py-4 text-sm font-extrabold text-white shadow-xl shadow-blue-950/30 transition-all duration-300 hover:-translate-y-0.5 hover:from-blue-500 hover:to-indigo-500 hover:shadow-blue-500/20 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/15 to-transparent transition-transform duration-700 group-hover:translate-x-full" />

              {loading ? (
                <>
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />

                  <span>Please wait...</span>
                </>
              ) : (
                <>
                  <span>
                    {isSignup ? "Create Account" : "Login"}
                  </span>

                  <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                </>
              )}
            </button>
          </form>

          {/* =================================================
              SWITCH LOGIN / SIGNUP
          ================================================= */}

          <div className="relative z-10 mt-7 border-t border-white/10 pt-6 text-center">
            <p className="text-sm text-slate-500">
              {isSignup
                ? "Already have an account?"
                : "Don't have an account?"}{" "}
              <button
                type="button"
                onClick={() => setIsSignup(!isSignup)}
                className="font-bold text-blue-400 transition-colors hover:text-blue-300"
              >
                {isSignup ? "Login here" : "Create one"}
              </button>
            </p>
          </div>

          {/* =================================================
              TRUST FOOTER
          ================================================= */}

          <div className="relative z-10 mt-7 flex items-center justify-center gap-2 text-center">
            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400/70" />

            <p className="text-[9px] font-semibold uppercase tracking-[0.16em] text-slate-600">
              Secure authentication powered by Scholiqen
            </p>
          </div>
        </div>

        {/* Bottom brand */}
        <div className="mt-6 text-center">
          <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-700">
            Scholiqen • Learn Without Limits
          </p>
        </div>
      </div>
    </main>
  );
};

export default Login;