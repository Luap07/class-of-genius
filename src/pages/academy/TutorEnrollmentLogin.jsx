import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  ArrowRight,
  Eye,
  EyeOff,
  GraduationCap,
  LockKeyhole,
  LogIn,
  ShieldCheck,
  Sparkles,
  User,
  AlertCircle,
  CheckCircle2,
  Loader2,
  BookOpen,
} from "lucide-react";

/* =========================================================
   API
========================================================= */

const API_URL = (
  import.meta.env.VITE_API_URL || "http://localhost:5000"
).replace(/\/$/, "");

const TUTOR_LOGIN_URL = `${API_URL}/api/academy/tutor-login`;

/* =========================================================
   STORAGE KEYS
========================================================= */

const ACADEMY_TOKEN_KEY = "scholiqen_academy_token";
const ACADEMY_USER_KEY = "scholiqen_academy_user";

/* =========================================================
   SMALL COMPONENTS
========================================================= */

function InputField({
  label,
  icon: Icon,
  type = "text",
  value,
  onChange,
  placeholder,
  error,
  disabled = false,
  autoComplete,
}) {
  const [showPassword, setShowPassword] = useState(false);

  const isPassword = type === "password";

  const inputType =
    isPassword && showPassword ? "text" : type;

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-slate-300">
        {label}
      </label>

      <div className="relative">
        <div
          className="
            pointer-events-none
            absolute
            left-4
            top-1/2
            -translate-y-1/2
            text-slate-500
          "
        >
          <Icon size={19} />
        </div>

        <input
          type={inputType}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          disabled={disabled}
          autoComplete={autoComplete}
          className={`
            w-full
            rounded-2xl
            border
            bg-slate-950/70
            py-4
            pl-12
            ${isPassword ? "pr-12" : "pr-4"}
            text-white
            placeholder:text-slate-600
            outline-none
            transition-all
            ${
              error
                ? "border-red-500/60 focus:border-red-400"
                : "border-white/10 focus:border-cyan-400/50"
            }
            focus:bg-slate-950
            disabled:cursor-not-allowed
            disabled:opacity-60
          `}
        />

        {isPassword && (
          <button
            type="button"
            onClick={() =>
              setShowPassword((current) => !current)
            }
            disabled={disabled}
            className="
              absolute
              right-4
              top-1/2
              -translate-y-1/2
              text-slate-500
              transition
              hover:text-cyan-400
              disabled:opacity-40
            "
            aria-label={
              showPassword
                ? "Hide reference ID"
                : "Show reference ID"
            }
          >
            {showPassword ? (
              <EyeOff size={19} />
            ) : (
              <Eye size={19} />
            )}
          </button>
        )}
      </div>

      {error && (
        <div className="flex items-center gap-2 text-xs text-red-400">
          <AlertCircle size={14} />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
}

/* =========================================================
   MAIN COMPONENT
========================================================= */

export default function TutorEnrollmentLogin() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    referenceId: "",
  });

  const [errors, setErrors] = useState({});
  const [submitError, setSubmitError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [tutor, setTutor] = useState(null);

  /* =======================================================
     HANDLE INPUT
  ======================================================= */

  const handleChange = (field, value) => {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));

    setErrors((current) => ({
      ...current,
      [field]: "",
    }));

    setSubmitError("");
  };

  /* =======================================================
     VALIDATION
  ======================================================= */

  const validate = () => {
    const nextErrors = {};

    const name = form.name.trim();
    const referenceId = form.referenceId.trim();

    if (!name) {
      nextErrors.name =
        "Please enter your registered full name.";
    }

    if (!referenceId) {
      nextErrors.referenceId =
        "Please enter your reference ID.";
    }

    setErrors(nextErrors);

    return Object.keys(nextErrors).length === 0;
  };

  /* =======================================================
     LOGIN
  ======================================================= */

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!validate()) {
      return;
    }

    setSubmitting(true);
    setSubmitError("");

    try {
      const response = await fetch(TUTOR_LOGIN_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: form.name.trim(),
          referenceId: form.referenceId.trim(),
        }),
      });

      let data = {};

      try {
        data = await response.json();
      } catch {
        data = {};
      }

      /* ===================================================
         LOGIN FAILED
      =================================================== */

      if (!response.ok || !data.success) {
        setSubmitError(
          data.message ||
            "Unable to sign in. Please check your name and reference ID."
        );

        setSubmitting(false);
        return;
      }

      /* ===================================================
         LOGIN SUCCESS
      =================================================== */

      const tutorData = data.tutor || {};

      /*
        IMPORTANT:

        The TutorProtectedRoute in App.jsx expects:

        scholiqen_academy_token
        scholiqen_academy_user

        So we save the tutor session using those exact keys.
      */

      const tutorSession = {
        ...tutorData,
        userType: "tutor",
        user_type: "tutor",
      };

      localStorage.setItem(
        ACADEMY_USER_KEY,
        JSON.stringify(tutorSession)
      );

      if (data.token) {
        localStorage.setItem(
          ACADEMY_TOKEN_KEY,
          data.token
        );
      }

      /*
        Remove old tutor session keys if they exist.
        This prevents an old session from causing conflicts.
      */

      localStorage.removeItem("scholiqen-tutor");
      localStorage.removeItem("scholiqen-tutor-token");

      setTutor(tutorData);
      setSuccess(true);

      /* ===================================================
         REDIRECT TO TUTOR DASHBOARD
      =================================================== */

      setTimeout(() => {
        navigate("/academy/tutor", {
          replace: true,
        });
      }, 1200);
    } catch (error) {
      console.error("TUTOR LOGIN ERROR:", error);

      setSubmitError(
        "Unable to connect to the Academy server. Please try again."
      );

      setSubmitting(false);
    }
  };

  /* =======================================================
     SUCCESS SCREEN
  ======================================================= */

  if (success) {
    const firstName =
      tutor?.first_name ||
      tutor?.firstName ||
      "";

    return (
      <div
        className="
          relative
          flex
          min-h-screen
          items-center
          justify-center
          overflow-hidden
          bg-[#020617]
          px-6
          text-white
        "
      >
        {/* Background glow */}

        <div
          className="
            absolute
            -left-40
            -top-40
            h-96
            w-96
            rounded-full
            bg-cyan-500/10
            blur-3xl
          "
        />

        <div
          className="
            absolute
            -bottom-40
            -right-40
            h-96
            w-96
            rounded-full
            bg-violet-500/10
            blur-3xl
          "
        />

        {/* Dotted background */}

        <div
          className="
            pointer-events-none
            absolute
            inset-0
            opacity-[0.08]
          "
          style={{
            backgroundImage:
              "radial-gradient(circle, #38bdf8 1px, transparent 1px)",
            backgroundSize: "24px 24px",
          }}
        />

        {/* Success Card */}

        <motion.div
          initial={{
            opacity: 0,
            scale: 0.9,
            y: 30,
          }}
          animate={{
            opacity: 1,
            scale: 1,
            y: 0,
          }}
          className="
            relative
            z-10
            w-full
            max-w-md
            rounded-3xl
            border
            border-white/10
            bg-slate-900/80
            p-8
            text-center
            shadow-2xl
            shadow-cyan-950/30
            backdrop-blur-xl
          "
        >
          {/* Success Icon */}

          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{
              delay: 0.15,
              type: "spring",
              stiffness: 180,
            }}
            className="
              mx-auto
              mb-6
              flex
              h-20
              w-20
              items-center
              justify-center
              rounded-full
              border
              border-emerald-400/30
              bg-emerald-400/10
            "
          >
            <CheckCircle2
              size={42}
              className="text-emerald-400"
            />
          </motion.div>

          <h1 className="text-2xl font-bold">
            Welcome Back!
          </h1>

          <p className="mt-3 text-slate-400">
            {firstName
              ? `Welcome, ${firstName}.`
              : "Tutor login successful."}
          </p>

          {/* Loading */}

          <div
            className="
              mt-6
              flex
              items-center
              justify-center
              gap-2
              text-sm
              text-cyan-400
            "
          >
            <Loader2
              size={16}
              className="animate-spin"
            />

            Opening your tutor dashboard...
          </div>
        </motion.div>
      </div>
    );
  }

  /* =======================================================
     LOGIN PAGE
  ======================================================= */

  return (
    <div
      className="
        relative
        min-h-screen
        overflow-hidden
        bg-[#020617]
        text-white
      "
    >
      {/* ===================================================
          BACKGROUND
      =================================================== */}

      <div
        className="
          pointer-events-none
          absolute
          inset-0
        "
      >
        <div
          className="
            absolute
            -left-40
            -top-52
            h-[500px]
            w-[500px]
            rounded-full
            bg-cyan-500/10
            blur-[120px]
          "
        />

        <div
          className="
            absolute
            -right-52
            top-1/3
            h-[550px]
            w-[550px]
            rounded-full
            bg-violet-500/10
            blur-[130px]
          "
        />

        <div
          className="
            absolute
            bottom-[-250px]
            left-1/3
            h-[450px]
            w-[450px]
            rounded-full
            bg-blue-500/10
            blur-[120px]
          "
        />

        {/* Dotted background */}

        <div
          className="
            absolute
            inset-0
            opacity-[0.07]
          "
          style={{
            backgroundImage:
              "radial-gradient(circle, #38bdf8 1px, transparent 1px)",
            backgroundSize: "26px 26px",
          }}
        />
      </div>

      {/* ===================================================
          TOP NAV
      =================================================== */}

      <div
        className="
          relative
          z-20
          mx-auto
          flex
          max-w-7xl
          items-center
          justify-between
          px-6
          py-5
          lg:px-10
        "
      >
        {/* Back */}

        <button
          type="button"
          onClick={() => navigate("/academy")}
          className="
            group
            flex
            items-center
            gap-2
            text-sm
            text-slate-400
            transition
            hover:text-white
          "
        >
          <ArrowLeft
            size={17}
            className="
              transition-transform
              group-hover:-translate-x-1
            "
          />

          Back to Academy
        </button>

        {/* Logo */}

        <Link
          to="/"
          className="
            flex
            items-center
            gap-2
            text-sm
            font-semibold
            text-slate-300
            transition
            hover:text-cyan-400
          "
        >
          <GraduationCap
            size={20}
            className="text-cyan-400"
          />

          Scholiqen
        </Link>
      </div>

      {/* ===================================================
          CONTENT
      =================================================== */}

      <main
        className="
          relative
          z-10
          flex
          min-h-[calc(100vh-80px)]
          items-center
          justify-center
          px-5
          pb-12
        "
      >
        <div
          className="
            grid
            w-full
            max-w-6xl
            items-center
            gap-10
            lg:grid-cols-2
            lg:gap-20
          "
        >
          {/* =================================================
              LEFT SIDE
          ================================================= */}

          <motion.div
            initial={{
              opacity: 0,
              x: -35,
            }}
            animate={{
              opacity: 1,
              x: 0,
            }}
            transition={{
              duration: 0.6,
            }}
            className="hidden lg:block"
          >
            {/* Badge */}

            <div
              className="
                mb-6
                inline-flex
                items-center
                gap-2
                rounded-full
                border
                border-cyan-400/20
                bg-cyan-400/5
                px-4
                py-2
                text-xs
                font-medium
                text-cyan-300
              "
            >
              <Sparkles size={14} />

              SCHOLIQEN ACADEMY
            </div>

            {/* Heading */}

            <h1
              className="
                max-w-xl
                text-5xl
                font-black
                leading-[1.05]
                tracking-tight
                xl:text-6xl
              "
            >
              Welcome back,

              <span
                className="
                  block
                  bg-gradient-to-r
                  from-cyan-400
                  via-blue-400
                  to-violet-400
                  bg-clip-text
                  text-transparent
                "
              >
                Tutor.
              </span>
            </h1>

            {/* Description */}

            <p
              className="
                mt-6
                max-w-lg
                text-lg
                leading-8
                text-slate-400
              "
            >
              Sign in to your Scholiqen Academy
              tutor account and continue managing
              your teaching activities.
            </p>

            {/* Features */}

            <div className="mt-9 space-y-4">
              {/* Feature 1 */}

              <div className="flex items-center gap-4">
                <div
                  className="
                    flex
                    h-11
                    w-11
                    shrink-0
                    items-center
                    justify-center
                    rounded-xl
                    border
                    border-cyan-400/20
                    bg-cyan-400/10
                  "
                >
                  <ShieldCheck
                    size={20}
                    className="text-cyan-400"
                  />
                </div>

                <div>
                  <p className="font-semibold text-white">
                    Verified Tutor Access
                  </p>

                  <p className="text-sm text-slate-500">
                    Access your approved tutor account.
                  </p>
                </div>
              </div>

              {/* Feature 2 */}

              <div className="flex items-center gap-4">
                <div
                  className="
                    flex
                    h-11
                    w-11
                    shrink-0
                    items-center
                    justify-center
                    rounded-xl
                    border
                    border-violet-400/20
                    bg-violet-400/10
                  "
                >
                  <BookOpen
                    size={20}
                    className="text-violet-400"
                  />
                </div>

                <div>
                  <p className="font-semibold text-white">
                    Teaching Dashboard
                  </p>

                  <p className="text-sm text-slate-500">
                    Manage your Academy activities.
                  </p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* =================================================
              LOGIN CARD
          ================================================= */}

          <motion.div
            initial={{
              opacity: 0,
              y: 35,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            transition={{
              duration: 0.6,
              delay: 0.1,
            }}
            className="w-full"
          >
            <div
              className="
                mx-auto
                w-full
                max-w-md
                rounded-[28px]
                border
                border-white/10
                bg-slate-900/75
                p-6
                shadow-2xl
                shadow-cyan-950/20
                backdrop-blur-2xl
                sm:p-8
              "
            >
              {/* Card Header */}

              <div className="mb-8">
                <div
                  className="
                    mb-5
                    flex
                    h-14
                    w-14
                    items-center
                    justify-center
                    rounded-2xl
                    border
                    border-cyan-400/20
                    bg-cyan-400/10
                  "
                >
                  <LogIn
                    size={26}
                    className="text-cyan-400"
                  />
                </div>

                <h2
                  className="
                    text-2xl
                    font-bold
                    tracking-tight
                  "
                >
                  Tutor Account Login
                </h2>

                <p
                  className="
                    mt-2
                    text-sm
                    leading-6
                    text-slate-500
                  "
                >
                  Use the same name you registered with
                  and your reference ID to access your
                  tutor account.
                </p>
              </div>

              {/* =================================================
                  ERROR
              ================================================= */}

              <AnimatePresence>
                {submitError && (
                  <motion.div
                    initial={{
                      opacity: 0,
                      height: 0,
                      y: -8,
                    }}
                    animate={{
                      opacity: 1,
                      height: "auto",
                      y: 0,
                    }}
                    exit={{
                      opacity: 0,
                      height: 0,
                      y: -8,
                    }}
                    className="
                      mb-5
                      overflow-hidden
                    "
                  >
                    <div
                      className="
                        flex
                        gap-3
                        rounded-2xl
                        border
                        border-red-500/20
                        bg-red-500/5
                        p-4
                        text-sm
                        text-red-300
                      "
                    >
                      <AlertCircle
                        size={18}
                        className="
                          mt-0.5
                          shrink-0
                        "
                      />

                      <span>
                        {submitError}
                      </span>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* =================================================
                  FORM
              ================================================= */}

              <form
                onSubmit={handleSubmit}
                className="space-y-5"
              >
                {/* Full Name */}

                <InputField
                  label="Registered Full Name"
                  icon={User}
                  value={form.name}
                  onChange={(event) =>
                    handleChange(
                      "name",
                      event.target.value
                    )
                  }
                  placeholder="Enter your registered name"
                  error={errors.name}
                  disabled={submitting}
                  autoComplete="name"
                />

                {/* Reference ID */}

                <InputField
                  label="Reference ID"
                  icon={LockKeyhole}
                  type="password"
                  value={form.referenceId}
                  onChange={(event) =>
                    handleChange(
                      "referenceId",
                      event.target.value
                    )
                  }
                  placeholder="Enter your reference ID"
                  error={errors.referenceId}
                  disabled={submitting}
                  autoComplete="current-password"
                />

                {/* Info */}

                <div
                  className="
                    flex
                    gap-3
                    rounded-2xl
                    border
                    border-cyan-400/10
                    bg-cyan-400/5
                    p-4
                  "
                >
                  <LockKeyhole
                    size={17}
                    className="
                      mt-0.5
                      shrink-0
                      text-cyan-400
                    "
                  />

                  <p
                    className="
                      text-xs
                      leading-5
                      text-slate-400
                    "
                  >
                    Your{" "}
                    <span className="font-semibold text-cyan-300">
                      reference ID
                    </span>{" "}
                    is your login password. Use the
                    reference ID given to you after
                    your tutor application.
                  </p>
                </div>

                {/* Submit */}

                <motion.button
                  type="submit"
                  disabled={submitting}
                  whileHover={
                    !submitting
                      ? {
                          scale: 1.01,
                        }
                      : {}
                  }
                  whileTap={
                    !submitting
                      ? {
                          scale: 0.98,
                        }
                      : {}
                  }
                  className="
                    group
                    flex
                    w-full
                    items-center
                    justify-center
                    gap-3
                    rounded-2xl
                    bg-gradient-to-r
                    from-cyan-500
                    to-blue-600
                    px-5
                    py-4
                    font-bold
                    text-white
                    shadow-lg
                    shadow-cyan-950/30
                    transition-all
                    hover:from-cyan-400
                    hover:to-blue-500
                    disabled:cursor-not-allowed
                    disabled:opacity-60
                  "
                >
                  {submitting ? (
                    <>
                      <Loader2
                        size={19}
                        className="animate-spin"
                      />

                      Signing in...
                    </>
                  ) : (
                    <>
                      Sign In

                      <ArrowRight
                        size={19}
                        className="
                          transition-transform
                          group-hover:translate-x-1
                        "
                      />
                    </>
                  )}
                </motion.button>
              </form>

              {/* =================================================
                  DIVIDER
              ================================================= */}

              <div className="my-7 flex items-center gap-4">
                <div className="h-px flex-1 bg-white/5" />

                <span className="text-xs text-slate-600">
                  OR
                </span>

                <div className="h-px flex-1 bg-white/5" />
              </div>

              {/* =================================================
                  REGISTER
              ================================================= */}

              <div className="text-center">
                <p className="text-sm text-slate-500">
                  Don't have a tutor account?
                </p>

                <button
                  type="button"
                  onClick={() =>
                    navigate(
                      "/academy/tutor-enrollment"
                    )
                  }
                  className="
                    mt-2
                    inline-flex
                    items-center
                    gap-2
                    text-sm
                    font-semibold
                    text-cyan-400
                    transition
                    hover:text-cyan-300
                  "
                >
                  Register as a Tutor

                  <ArrowRight size={15} />
                </button>
              </div>

              {/* =================================================
                  FOOTER
              ================================================= */}

              <div
                className="
                  mt-7
                  flex
                  items-center
                  justify-center
                  gap-2
                  text-[11px]
                  text-slate-600
                "
              >
                <ShieldCheck size={13} />

                Scholiqen Academy secure tutor access
              </div>
            </div>
          </motion.div>
        </div>
      </main>
    </div>
  );
}