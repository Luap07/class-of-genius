import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";
import Cog from "../assets/cog.png";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import {
  LockKeyhole,
  CheckCircle2,
  AlertCircle,
  ArrowLeft,
  Loader2,
} from "lucide-react";

const ResetPassword = () => {
  const navigate = useNavigate();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] =
    useState(false);

  const [loading, setLoading] = useState(false);
  const [checkingSession, setCheckingSession] = useState(true);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  /* =========================================================
     CHECK RECOVERY SESSION
  ========================================================= */

  useEffect(() => {
    let mounted = true;

    const checkRecoverySession = async () => {
      try {
        const { data } = await supabase.auth.getSession();

        if (!mounted) return;

        if (!data?.session) {
          setError(
            "This password reset link is invalid or has expired. Please request a new one."
          );
        }
      } catch (err) {
        console.error("Recovery session error:", err);

        if (mounted) {
          setError(
            "Unable to verify your password reset session."
          );
        }
      } finally {
        if (mounted) {
          setCheckingSession(false);
        }
      }
    };

    checkRecoverySession();

    /*
      Supabase can establish the recovery session after
      the page initially loads, so listen for auth changes.
    */

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (!mounted) return;

        if (event === "PASSWORD_RECOVERY" && session) {
          setError("");
          setCheckingSession(false);
        }

        if (session && event === "SIGNED_IN") {
          setCheckingSession(false);
        }
      }
    );

    return () => {
      mounted = false;
      subscription?.unsubscribe();
    };
  }, []);

  /* =========================================================
     UPDATE PASSWORD
  ========================================================= */

  const handleUpdatePassword = async (event) => {
    event.preventDefault();

    setError("");

    if (!password) {
      setError("Please enter your new password.");
      return;
    }

    if (password.length < 6) {
      setError(
        "Your new password must be at least 6 characters."
      );
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);

    try {
      const { data: sessionData } =
        await supabase.auth.getSession();

      if (!sessionData?.session) {
        setError(
          "Your password reset session has expired. Please request a new reset link."
        );
        return;
      }

      const { error: updateError } =
        await supabase.auth.updateUser({
          password,
        });

      if (updateError) {
        console.error(
          "Password update error:",
          updateError
        );

        setError(updateError.message);
        return;
      }

      setSuccess(true);

      setPassword("");
      setConfirmPassword("");

      /*
        Give the user a moment to see the success message,
        then return them to login.
      */

      setTimeout(async () => {
        await supabase.auth.signOut();
        navigate("/");
      }, 2500);
    } catch (err) {
      console.error("Password reset error:", err);

      setError(
        "Something went wrong while changing your password."
      );
    } finally {
      setLoading(false);
    }
  };

  /* =========================================================
     LOADING SCREEN
  ========================================================= */

  if (checkingSession) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center px-4">
        <div className="text-center">
          <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl border border-white/10 bg-white/5">
            <Loader2
              size={25}
              className="animate-spin text-blue-400"
            />
          </div>

          <p className="text-sm font-semibold text-slate-300">
            Verifying reset link...
          </p>

          <p className="mt-1 text-xs text-slate-600">
            Please wait a moment.
          </p>
        </div>
      </div>
    );
  }

  /* =========================================================
     PAGE
  ========================================================= */

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-slate-950 px-4 py-10 text-white">

      {/* =====================================================
          BACKGROUND
      ===================================================== */}

      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -left-40 -top-40 h-96 w-96 rounded-full bg-blue-600/10 blur-3xl" />

        <div className="absolute -right-40 bottom-0 h-96 w-96 rounded-full bg-indigo-600/10 blur-3xl" />

        <div className="absolute left-1/2 top-1/2 h-72 w-72 -translate-x-1/2 -translate-y-1/2 rounded-full bg-cyan-500/5 blur-3xl" />
      </div>

      {/* =====================================================
          CARD
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

            <h1 className="text-2xl font-black tracking-tight text-white">
              Create New Password
            </h1>

            <p className="mt-2 text-center text-sm leading-6 text-slate-500">
              Choose a new password for your
              Scholiqen account.
            </p>
          </div>

          {/* =================================================
              ERROR
          ================================================= */}

          {error && (
            <div className="relative z-10 mb-5 flex items-start gap-3 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm leading-6 text-red-400">
              <AlertCircle
                size={18}
                className="mt-0.5 shrink-0"
              />

              <span>{error}</span>
            </div>
          )}

          {/* =================================================
              SUCCESS
          ================================================= */}

          {success ? (
            <div className="relative z-10 py-5 text-center">

              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-400">
                <CheckCircle2 size={32} />
              </div>

              <h2 className="mt-5 text-xl font-black text-white">
                Password Updated
              </h2>

              <p className="mt-2 text-sm leading-6 text-slate-500">
                Your old password is no longer valid.
                Your new password has been saved successfully.
              </p>

              <p className="mt-4 text-xs font-semibold text-slate-600">
                Returning you to login...
              </p>
            </div>
          ) : error &&
            error.includes("invalid or has expired") ? (
            /* =================================================
               INVALID / EXPIRED LINK
            ================================================= */

            <div className="relative z-10">

              <button
                type="button"
                onClick={() => navigate("/")}
                className="flex w-full items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 py-3.5 text-sm font-bold text-slate-300 transition hover:bg-white/10 hover:text-white"
              >
                <ArrowLeft size={17} />
                Back to Login
              </button>

            </div>
          ) : (
            /* =================================================
               PASSWORD FORM
            ================================================= */

            <form
              onSubmit={handleUpdatePassword}
              className="relative z-10 space-y-5"
            >

              {/* NEW PASSWORD */}

              <div>
                <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-500">
                  New Password
                </label>

                <div className="relative">

                  <div className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-600">
                    <LockKeyhole size={17} />
                  </div>

                  <input
                    type={
                      showPassword
                        ? "text"
                        : "password"
                    }
                    placeholder="Enter your new password"
                    value={password}
                    onChange={(event) =>
                      setPassword(event.target.value)
                    }
                    className="w-full rounded-xl border border-white/10 bg-white/5 py-3.5 pl-11 pr-12 text-white outline-none transition placeholder:text-slate-600 focus:border-blue-500/50 focus:bg-white/[0.07] focus:ring-2 focus:ring-blue-500/10"
                    required
                    minLength={6}
                  />

                  <button
                    type="button"
                    onClick={() =>
                      setShowPassword(
                        (previous) => !previous
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
                      <FaEyeSlash size={17} />
                    ) : (
                      <FaEye size={17} />
                    )}
                  </button>

                </div>

                <p className="mt-2 text-xs text-slate-600">
                  Use at least 6 characters.
                </p>
              </div>

              {/* CONFIRM PASSWORD */}

              <div>
                <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-500">
                  Confirm New Password
                </label>

                <div className="relative">

                  <div className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-600">
                    <LockKeyhole size={17} />
                  </div>

                  <input
                    type={
                      showConfirmPassword
                        ? "text"
                        : "password"
                    }
                    placeholder="Confirm your new password"
                    value={confirmPassword}
                    onChange={(event) =>
                      setConfirmPassword(
                        event.target.value
                      )
                    }
                    className="w-full rounded-xl border border-white/10 bg-white/5 py-3.5 pl-11 pr-12 text-white outline-none transition placeholder:text-slate-600 focus:border-blue-500/50 focus:bg-white/[0.07] focus:ring-2 focus:ring-blue-500/10"
                    required
                    minLength={6}
                  />

                  <button
                    type="button"
                    onClick={() =>
                      setShowConfirmPassword(
                        (previous) => !previous
                      )
                    }
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 transition hover:text-white"
                    aria-label={
                      showConfirmPassword
                        ? "Hide password"
                        : "Show password"
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

              {/* PASSWORD MATCH */}

              {confirmPassword && (
                <div
                  className={`rounded-xl border px-4 py-3 text-xs font-semibold ${
                    password === confirmPassword
                      ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-400"
                      : "border-red-500/20 bg-red-500/10 text-red-400"
                  }`}
                >
                  {password === confirmPassword
                    ? "✓ Passwords match"
                    : "Passwords do not match"}
                </div>
              )}

              {/* UPDATE BUTTON */}

              <button
                type="submit"
                disabled={loading}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 py-3.5 text-sm font-bold text-white shadow-lg shadow-blue-900/20 transition hover:from-blue-500 hover:to-indigo-500 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? (
                  <>
                    <Loader2
                      size={17}
                      className="animate-spin"
                    />
                    Updating Password...
                  </>
                ) : (
                  <>
                    <LockKeyhole size={17} />
                    Update Password
                  </>
                )}
              </button>

              {/* BACK */}

              <button
                type="button"
                onClick={() => navigate("/")}
                className="flex w-full items-center justify-center gap-2 py-2 text-sm font-semibold text-slate-500 transition hover:text-white"
              >
                <ArrowLeft size={15} />
                Back to Login
              </button>

            </form>
          )}

          {/* =================================================
              SECURITY FOOTER
          ================================================= */}

          <div className="relative z-10 mt-7 text-center">

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

export default ResetPassword;
