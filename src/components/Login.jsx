import React, { useState, useEffect, useContext } from "react";
import Cog from "../assets/cog.png";
import { supabase } from "../lib/supabaseClient";

import { useNavigate } from "react-router-dom";
import { ConnectContext } from "../context/ConnectContext";
import { FaEye, FaEyeSlash } from "react-icons/fa";

const Login = () => {
  const navigate = useNavigate();
  const { darkMode } = useContext(ConnectContext);

  const [isSignup, setIsSignup] = useState(false);

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);
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
  }, [isSignup]);

  /* =========================================================
     CLEANUP ON LOGIN
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
     SIGN UP WITH EMAIL + PASSWORD
  ========================================================= */

  const handleSignup = async (e) => {
    e.preventDefault();

    setError("");

    if (!username.trim()) {
      setError("Please enter a username.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    setLoading(true);

    try {
      const { error } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: {
          data: {
            username: username.trim(),
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
     LOGIN WITH EMAIL + PASSWORD
  ========================================================= */

  const handleLogin = async (e) => {
    e.preventDefault();

    setError("");
    setLoading(true);

    try {
      // Clear old user's local progress
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

      // Force fresh application state
      window.location.reload();
    } catch (err) {
      console.error("Login error:", err);
      setError("Something went wrong while logging in.");
    } finally {
      setLoading(false);
    }
  };

  /* =========================================================
     LOGIN / SIGN UP WITH GOOGLE
  ========================================================= */

  const handleGoogleAuth = async () => {
    setError("");
    setGoogleLoading(true);

    try {
      // Clear any previous user's local progress
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
      const { error } =
        await supabase.auth.resetPasswordForEmail(
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

  return (
    <div className="min-h-screen w-full bg-slate-950 flex items-center justify-center px-4 py-10">

      {/* BACKGROUND */}

      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -left-40 -top-40 h-96 w-96 rounded-full bg-blue-600/10 blur-3xl" />

        <div className="absolute -right-40 bottom-0 h-96 w-96 rounded-full bg-indigo-600/10 blur-3xl" />

        <div className="absolute left-1/2 top-1/2 h-72 w-72 -translate-x-1/2 -translate-y-1/2 rounded-full bg-cyan-500/5 blur-3xl" />
      </div>

      {/* =====================================================
          LOGIN CARD
      ===================================================== */}

      <div className="relative z-10 w-full max-w-md">

        <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-slate-900/80 p-8 shadow-2xl backdrop-blur-2xl sm:p-9">

          {/* TOP GLOW */}

          <div className="pointer-events-none absolute -right-20 -top-20 h-48 w-48 rounded-full bg-blue-500/10 blur-3xl" />

          {/* =================================================
              LOGO
          ================================================= */}

          <div className="relative z-10 mb-7 flex flex-col items-center">

            <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-2xl border border-white/10 bg-white/5 shadow-xl">
              <img
                src={Cog}
                alt="Scholiqen"
                className="h-16 w-16 object-contain"
              />
            </div>

            <h2 className="text-2xl font-black tracking-tight text-white">
              {isSignup ? "Create Account" : "Welcome Back"}
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Scholiqen Learning Platform
            </p>
          </div>

          {/* =================================================
              ERROR
          ================================================= */}

          {error && (
            <div className="relative z-10 mb-5 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-center text-sm leading-6 text-red-400">
              {error}
            </div>
          )}

          {/* =================================================
              GOOGLE AUTH
          ================================================= */}

          <button
            type="button"
            onClick={handleGoogleAuth}
            disabled={googleLoading || loading}
            className="relative z-10 flex w-full items-center justify-center gap-3 rounded-xl border border-white/10 bg-white py-3.5 text-sm font-bold text-slate-900 shadow-lg transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {googleLoading ? (
              <>
                <span className="h-5 w-5 animate-spin rounded-full border-2 border-slate-300 border-t-slate-900" />

                <span>
                  Connecting to Google...
                </span>
              </>
            ) : (
              <>
                <GoogleIcon />

                <span>
                  Continue with Google
                </span>
              </>
            )}
          </button>

          {/* =================================================
              DIVIDER
          ================================================= */}

          <div className="relative z-10 my-6 flex items-center gap-4">

            <div className="h-px flex-1 bg-white/10" />

            <span className="text-[11px] font-bold uppercase tracking-[0.15em] text-slate-600">
              Or continue with email
            </span>

            <div className="h-px flex-1 bg-white/10" />

          </div>

          {/* =================================================
              EMAIL FORM
          ================================================= */}

          <form
            onSubmit={
              isSignup
                ? handleSignup
                : handleLogin
            }
            className="relative z-10 space-y-4"
          >

            {/* USERNAME */}

            {isSignup && (
              <div>
                <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-500">
                  Username
                </label>

                <input
                  type="text"
                  placeholder="Enter your username"
                  value={username}
                  onChange={(e) =>
                    setUsername(e.target.value)
                  }
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3.5 text-white outline-none transition placeholder:text-slate-600 focus:border-blue-500/50 focus:bg-white/[0.07] focus:ring-2 focus:ring-blue-500/10"
                  required
                />
              </div>
            )}

            {/* EMAIL */}

            <div>
              <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-500">
                Email
              </label>

              <input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) =>
                  setEmail(e.target.value)
                }
                className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3.5 text-white outline-none transition placeholder:text-slate-600 focus:border-blue-500/50 focus:bg-white/[0.07] focus:ring-2 focus:ring-blue-500/10"
                required
              />
            </div>

            {/* PASSWORD */}

            <div>
              <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-500">
                Password
              </label>

              <div className="relative">

                <input
                  type={
                    showPassword
                      ? "text"
                      : "password"
                  }
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) =>
                    setPassword(e.target.value)
                  }
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3.5 pr-12 text-white outline-none transition placeholder:text-slate-600 focus:border-blue-500/50 focus:bg-white/[0.07] focus:ring-2 focus:ring-blue-500/10"
                  required
                />

                <button
                  type="button"
                  onClick={() =>
                    setShowPassword(
                      !showPassword
                    )
                  }
                  className="absolute right-4 top-1/2 -translate-y-1/2 cursor-pointer text-slate-500 transition hover:text-white"
                  aria-label={
                    showPassword
                      ? "Hide password"
                      : "Show password"
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
                <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-500">
                  Confirm Password
                </label>

                <input
                  type={
                    showPassword
                      ? "text"
                      : "password"
                  }
                  placeholder="Confirm your password"
                  value={confirmPassword}
                  onChange={(e) =>
                    setConfirmPassword(
                      e.target.value
                    )
                  }
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3.5 text-white outline-none transition placeholder:text-slate-600 focus:border-blue-500/50 focus:bg-white/[0.07] focus:ring-2 focus:ring-blue-500/10"
                  required
                />
              </div>
            )}

            {/* SUBMIT */}

            <button
              type="submit"
              disabled={loading || googleLoading}
              className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 py-3.5 text-sm font-bold text-white shadow-lg shadow-blue-900/20 transition hover:from-blue-500 hover:to-indigo-500 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? (
                <>
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />

                  <span>
                    Please wait...
                  </span>
                </>
              ) : isSignup ? (
                "Create Account"
              ) : (
                "Login"
              )}
            </button>

          </form>

          {/* =================================================
              FORGOT PASSWORD
          ================================================= */}

          {!isSignup && (
            <button
              type="button"
              onClick={handleForgotPassword}
              disabled={loading || googleLoading}
              className="relative z-10 mt-4 w-full cursor-pointer text-center text-sm font-semibold text-blue-400 transition hover:text-blue-300 disabled:opacity-50"
            >
              Forgot Password?
            </button>
          )}

          {/* =================================================
              SWITCH LOGIN / SIGNUP
          ================================================= */}

          <div className="relative z-10 mt-7 border-t border-white/10 pt-6 text-center">

            <p className="flex items-center justify-center gap-1.5 text-sm text-slate-500">

              {isSignup
                ? "Already have an account?"
                : "Don't have an account?"}

              <button
                type="button"
                onClick={() =>
                  setIsSignup(!isSignup)
                }
                className="cursor-pointer font-bold text-blue-400 transition hover:text-blue-300"
              >
                {isSignup
                  ? "Login here"
                  : "Create one"}
              </button>

            </p>
          </div>

          {/* =================================================
              SECURITY FOOTER
          ================================================= */}

          <div className="relative z-10 mt-6 text-center">

            <div className="mx-auto mb-2 h-px w-12 bg-white/10" />

            <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-slate-700">
              Secure authentication powered by Scholiqen
            </p>

          </div>

        </div>
      </div>
    </div>
  );
};

export default Login;