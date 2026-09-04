import React from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  ArrowRight,
  BookOpen,
  GraduationCap,
  Users,
  Sparkles,
  ShieldCheck,
  PlayCircle,
  CheckCircle2,
  UserRound,
  BriefcaseBusiness,
  ChevronLeft,
  LogIn,
} from "lucide-react";

const Academy = () => {
  const navigate = useNavigate();

  const features = [
    {
      icon: BookOpen,
      title: "Structured Learning",
      text: "Learn through organized lessons, learning materials, assessments and school-focused programmes.",
    },
    {
      icon: Users,
      title: "Students & Tutors",
      text: "Students learn while qualified tutors help guide them through their academic journey.",
    },
    {
      icon: PlayCircle,
      title: "Learn Online",
      text: "Access your learning experience wherever you are, whenever you are ready.",
    },
  ];

  const studentBenefits = [
    "Enroll into Scholiqen Academy",
    "Get your own student portal",
    "Access class-specific subjects",
    "Track your academic progress",
  ];

  const tutorBenefits = [
    "Create a teaching profile",
    "Teach subjects you specialize in",
    "Create courses and learning materials",
    "Connect with students through Scholiqen",
  ];

  const goToStudentEnrollment = () => {
    navigate("/academy/student-enrollment");
  };

  const goToTutorEnrollment = () => {
    navigate("/academy/tutor-register");
  };

  const goToStudentLogin = () => {
    navigate("/academy/student-enrollment-login");
  };

  return (
    <div className="min-h-screen overflow-hidden bg-[#050816] text-white">
      {/* =========================================================
          BACKGROUND
      ========================================================= */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -left-40 -top-40 h-[500px] w-[500px] rounded-full bg-cyan-500/10 blur-[130px]" />

        <div className="absolute -right-40 top-[20%] h-[550px] w-[550px] rounded-full bg-violet-600/10 blur-[150px]" />

        <div className="absolute -bottom-60 left-[35%] h-[500px] w-[500px] rounded-full bg-blue-600/10 blur-[140px]" />

        <div
          className="absolute inset-0 opacity-[0.16]"
          style={{
            backgroundImage:
              "radial-gradient(circle, rgba(148,163,184,0.35) 1px, transparent 1px)",
            backgroundSize: "28px 28px",
          }}
        />

        <div
          className="absolute inset-0 opacity-[0.035]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)",
            backgroundSize: "80px 80px",
          }}
        />
      </div>

      {/* =========================================================
          PAGE
      ========================================================= */}
      <div className="relative z-10">
        {/* =======================================================
            NAVBAR
        ======================================================= */}
        <header className="sticky top-0 z-50 border-b border-white/[0.06] bg-[#050816]/80 backdrop-blur-2xl">
          <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-5 sm:px-8 lg:px-10">
            {/* BRAND */}
            <button
              type="button"
              onClick={() => navigate("/")}
              className="group flex items-center gap-3"
            >
              <div className="relative flex h-11 w-11 items-center justify-center rounded-2xl border border-cyan-400/20 bg-cyan-400/10 shadow-[0_0_30px_rgba(34,211,238,0.08)]">
                <GraduationCap className="h-6 w-6 text-cyan-300 transition-transform duration-300 group-hover:scale-110" />

                <span className="absolute inset-0 rounded-2xl border border-cyan-300/0 transition-all duration-300 group-hover:border-cyan-300/30" />
              </div>

              <div className="text-left">
                <p className="text-[15px] font-black tracking-wide text-white">
                  SCHOLIQEN
                </p>

                <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-cyan-300/70">
                  Academy
                </p>
              </div>
            </button>

            {/* NAV ACTIONS */}
            <div className="flex items-center gap-2 sm:gap-3">
              <button
                type="button"
                onClick={goToStudentLogin}
                className="group inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.035] px-3.5 py-2.5 text-sm font-semibold text-slate-300 transition-all duration-300 hover:border-cyan-400/30 hover:bg-cyan-400/[0.06] hover:text-white sm:px-4"
              >
                <LogIn className="h-4 w-4 text-cyan-300" />
                <span className="hidden sm:inline">
                  Student Login
                </span>
                <span className="sm:hidden">
                  Login
                </span>
              </button>

              <button
                type="button"
                onClick={() => navigate("/dashboard")}
                className="group inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.035] px-3.5 py-2.5 text-sm font-semibold text-slate-300 transition-all duration-300 hover:border-cyan-400/30 hover:bg-cyan-400/[0.06] hover:text-white sm:px-4"
              >
                <ChevronLeft className="h-4 w-4 transition-transform group-hover:-translate-x-0.5" />

                <span className="hidden sm:inline">
                  Dashboard
                </span>

                <span className="sm:hidden">
                  Back
                </span>
              </button>
            </div>
          </div>
        </header>

        {/* =======================================================
            HERO
        ======================================================= */}
        <main>
          <section className="relative mx-auto max-w-7xl px-5 pb-20 pt-16 sm:px-8 sm:pt-24 lg:px-10 lg:pb-28">
            <div className="grid items-center gap-14 lg:grid-cols-[1.05fr_0.95fr] lg:gap-20">
              {/* LEFT */}
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
                  duration: 0.7,
                }}
              >
                <motion.div
                  initial={{
                    opacity: 0,
                    y: 10,
                  }}
                  animate={{
                    opacity: 1,
                    y: 0,
                  }}
                  transition={{
                    delay: 0.1,
                    duration: 0.5,
                  }}
                  className="mb-7 inline-flex items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-400/[0.07] px-4 py-2 text-xs font-bold uppercase tracking-[0.18em] text-cyan-300"
                >
                  <Sparkles className="h-4 w-4" />
                  Scholiqen Academy
                </motion.div>

                <h1 className="max-w-3xl text-4xl font-black leading-[1.04] tracking-tight text-white sm:text-5xl lg:text-7xl">
                  Learn.
                  <span className="bg-gradient-to-r from-cyan-300 via-blue-400 to-violet-400 bg-clip-text text-transparent">
                    {" "}
                    Teach.
                  </span>
                  <br />
                  Grow.
                </h1>

                <p className="mt-7 max-w-2xl text-base leading-8 text-slate-400 sm:text-lg">
                  Welcome to Scholiqen Academy — a modern school learning
                  environment built for primary and secondary students,
                  qualified tutors and academic growth.
                </p>

                {/* Quick points */}
                <div className="mt-8 flex flex-wrap gap-3">
                  {[
                    "Primary & Secondary",
                    "Qualified Tutors",
                    "Online Learning",
                  ].map((item) => (
                    <div
                      key={item}
                      className="inline-flex items-center gap-2 rounded-full border border-white/[0.08] bg-white/[0.035] px-3.5 py-2 text-xs font-medium text-slate-300 backdrop-blur-xl"
                    >
                      <CheckCircle2 className="h-3.5 w-3.5 text-cyan-300" />
                      {item}
                    </div>
                  ))}
                </div>

                <div className="mt-9 flex items-center gap-3 text-sm text-slate-500">
                  <ShieldCheck className="h-5 w-5 text-cyan-400/80" />

                  <span>
                    A dedicated digital school environment for learners and
                    educators
                  </span>
                </div>

                {/* HERO BUTTONS */}
                <div className="mt-9 flex flex-col gap-3 sm:flex-row">
                  <button
                    type="button"
                    onClick={goToStudentEnrollment}
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-cyan-400 px-6 py-3.5 text-sm font-black text-[#041018] transition-all duration-300 hover:bg-cyan-300 hover:shadow-[0_0_35px_rgba(34,211,238,0.2)]"
                  >
                    <GraduationCap className="h-4 w-4" />
                    Enroll as Student
                    <ArrowRight className="h-4 w-4" />
                  </button>

                  <button
                    type="button"
                    onClick={goToTutorEnrollment}
                    className="inline-flex items-center justify-center gap-2 rounded-xl border border-violet-300/20 bg-violet-300/10 px-6 py-3.5 text-sm font-black text-violet-200 transition-all duration-300 hover:border-violet-300/40 hover:bg-violet-300/15"
                  >
                    <BriefcaseBusiness className="h-4 w-4" />
                    Apply as Tutor
                  </button>
                </div>
              </motion.div>

              {/* RIGHT */}
              <motion.div
                initial={{
                  opacity: 0,
                  x: 35,
                }}
                animate={{
                  opacity: 1,
                  x: 0,
                }}
                transition={{
                  duration: 0.7,
                  delay: 0.15,
                }}
                className="relative"
              >
                <div className="absolute inset-8 rounded-[40px] bg-cyan-500/10 blur-[70px]" />

                <div className="relative space-y-5">
                  {/* STUDENT CARD */}
                  <motion.button
                    type="button"
                    whileHover={{
                      y: -5,
                    }}
                    whileTap={{
                      scale: 0.99,
                    }}
                    onClick={goToStudentEnrollment}
                    className="group relative w-full overflow-hidden rounded-[28px] border border-cyan-400/20 bg-[#0a1225]/90 p-6 text-left shadow-2xl shadow-cyan-950/20 backdrop-blur-2xl transition-all duration-300 hover:border-cyan-300/40 hover:bg-[#0c1730]"
                  >
                    <div className="absolute -right-16 -top-16 h-48 w-48 rounded-full bg-cyan-400/10 blur-[70px] transition-all duration-500 group-hover:bg-cyan-400/20" />

                    <div className="relative flex items-start gap-5">
                      <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-cyan-300/20 bg-cyan-300/10">
                        <GraduationCap className="h-7 w-7 text-cyan-300" />
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <p className="text-xs font-bold uppercase tracking-[0.2em] text-cyan-300/70">
                              For Students
                            </p>

                            <h2 className="mt-1 text-xl font-black text-white sm:text-2xl">
                              Enroll as a Student
                            </h2>
                          </div>

                          <div className="hidden h-10 w-10 shrink-0 items-center justify-center rounded-full border border-white/10 bg-white/[0.04] transition-all duration-300 group-hover:border-cyan-300/30 group-hover:bg-cyan-300/10 sm:flex">
                            <ArrowRight className="h-4 w-4 text-slate-400 transition-transform duration-300 group-hover:translate-x-1 group-hover:text-cyan-300" />
                          </div>
                        </div>

                        <p className="mt-3 text-sm leading-6 text-slate-400">
                          Complete your Academy enrollment and receive your
                          student credentials for your personal school portal.
                        </p>

                        <div className="mt-4 flex flex-wrap gap-2">
                          {studentBenefits.slice(0, 2).map(
                            (benefit) => (
                              <span
                                key={benefit}
                                className="rounded-lg border border-white/[0.06] bg-white/[0.03] px-2.5 py-1.5 text-[11px] text-slate-400"
                              >
                                {benefit}
                              </span>
                            )
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="relative mt-5 flex items-center justify-between border-t border-white/[0.06] pt-4">
                      <span className="text-xs font-semibold text-cyan-300">
                        Start enrollment
                      </span>

                      <ArrowRight className="h-4 w-4 text-cyan-300 transition-transform group-hover:translate-x-1" />
                    </div>
                  </motion.button>

                  {/* TUTOR CARD */}
                  <motion.button
                    type="button"
                    whileHover={{
                      y: -5,
                    }}
                    whileTap={{
                      scale: 0.99,
                    }}
                    onClick={goToTutorEnrollment}
                    className="group relative w-full overflow-hidden rounded-[28px] border border-violet-400/20 bg-[#0a1225]/90 p-6 text-left shadow-2xl shadow-violet-950/20 backdrop-blur-2xl transition-all duration-300 hover:border-violet-300/40 hover:bg-[#0c1730]"
                  >
                    <div className="absolute -bottom-20 -right-12 h-52 w-52 rounded-full bg-violet-500/10 blur-[75px] transition-all duration-500 group-hover:bg-violet-500/20" />

                    <div className="relative flex items-start gap-5">
                      <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-violet-300/20 bg-violet-300/10">
                        <BriefcaseBusiness className="h-7 w-7 text-violet-300" />
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <p className="text-xs font-bold uppercase tracking-[0.2em] text-violet-300/70">
                              For Educators
                            </p>

                            <h2 className="mt-1 text-xl font-black text-white sm:text-2xl">
                              Apply as a Tutor
                            </h2>
                          </div>

                          <div className="hidden h-10 w-10 shrink-0 items-center justify-center rounded-full border border-white/10 bg-white/[0.04] transition-all duration-300 group-hover:border-violet-300/30 group-hover:bg-violet-300/10 sm:flex">
                            <ArrowRight className="h-4 w-4 text-slate-400 transition-transform duration-300 group-hover:translate-x-1 group-hover:text-violet-300" />
                          </div>
                        </div>

                        <p className="mt-3 text-sm leading-6 text-slate-400">
                          Submit your teaching application and become part of
                          the Scholiqen Academy tutor community.
                        </p>

                        <div className="mt-4 flex flex-wrap gap-2">
                          {tutorBenefits.slice(0, 2).map(
                            (benefit) => (
                              <span
                                key={benefit}
                                className="rounded-lg border border-white/[0.06] bg-white/[0.03] px-2.5 py-1.5 text-[11px] text-slate-400"
                              >
                                {benefit}
                              </span>
                            )
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="relative mt-5 flex items-center justify-between border-t border-white/[0.06] pt-4">
                      <span className="text-xs font-semibold text-violet-300">
                        Start tutor application
                      </span>

                      <ArrowRight className="h-4 w-4 text-violet-300 transition-transform group-hover:translate-x-1" />
                    </div>
                  </motion.button>

                  {/* EXISTING STUDENT */}
                  <div className="relative rounded-2xl border border-white/[0.06] bg-white/[0.025] px-5 py-4 text-center backdrop-blur-xl">
                    <p className="text-sm text-slate-500">
                      Already enrolled as a student?
                    </p>

                    <button
                      type="button"
                      onClick={goToStudentLogin}
                      className="mt-2 inline-flex items-center gap-2 font-bold text-cyan-300 transition-colors hover:text-cyan-200"
                    >
                      <LogIn className="h-4 w-4" />
                      Enter Student Portal
                    </button>
                  </div>
                </div>
              </motion.div>
            </div>
          </section>

          {/* =====================================================
              FEATURES
          ===================================================== */}
          <section className="border-y border-white/[0.05] bg-black/10">
            <div className="mx-auto max-w-7xl px-5 py-16 sm:px-8 lg:px-10">
              <div className="mb-10 max-w-2xl">
                <p className="text-xs font-bold uppercase tracking-[0.22em] text-cyan-300/70">
                  The Academy Experience
                </p>

                <h2 className="mt-3 text-3xl font-black tracking-tight text-white sm:text-4xl">
                  A digital school built around students.
                </h2>

                <p className="mt-4 text-sm leading-7 text-slate-500 sm:text-base">
                  Scholiqen Academy brings enrollment, learning, assessment
                  and student progress together in one focused environment.
                </p>
              </div>

              <div className="grid gap-5 md:grid-cols-3">
                {features.map(
                  (feature, index) => {
                    const Icon =
                      feature.icon;

                    return (
                      <motion.div
                        key={feature.title}
                        initial={{
                          opacity: 0,
                          y: 20,
                        }}
                        whileInView={{
                          opacity: 1,
                          y: 0,
                        }}
                        viewport={{
                          once: true,
                          amount: 0.2,
                        }}
                        transition={{
                          duration: 0.5,
                          delay:
                            index * 0.08,
                        }}
                        whileHover={{
                          y: -4,
                        }}
                        className="group rounded-3xl border border-white/[0.07] bg-white/[0.025] p-6 backdrop-blur-xl transition-all duration-300 hover:border-cyan-400/20 hover:bg-white/[0.04]"
                      >
                        <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-cyan-300/15 bg-cyan-300/[0.07]">
                          <Icon className="h-5 w-5 text-cyan-300 transition-transform duration-300 group-hover:scale-110" />
                        </div>

                        <h3 className="mt-5 text-lg font-bold text-white">
                          {feature.title}
                        </h3>

                        <p className="mt-2 text-sm leading-6 text-slate-500">
                          {feature.text}
                        </p>
                      </motion.div>
                    );
                  }
                )}
              </div>
            </div>
          </section>

          {/* =====================================================
              STUDENT / TUTOR
          ===================================================== */}
          <section className="mx-auto max-w-7xl px-5 py-20 sm:px-8 lg:px-10 lg:py-28">
            <div className="grid gap-6 lg:grid-cols-2">
              {/* STUDENT */}
              <motion.div
                initial={{
                  opacity: 0,
                  x: -25,
                }}
                whileInView={{
                  opacity: 1,
                  x: 0,
                }}
                viewport={{
                  once: true,
                  amount: 0.2,
                }}
                className="relative overflow-hidden rounded-[32px] border border-cyan-400/15 bg-gradient-to-br from-cyan-400/[0.07] via-white/[0.025] to-transparent p-7 sm:p-9"
              >
                <div className="absolute -right-20 -top-20 h-48 w-48 rounded-full bg-cyan-400/10 blur-[80px]" />

                <div className="relative">
                  <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-cyan-300/10">
                      <UserRound className="h-5 w-5 text-cyan-300" />
                    </div>

                    <span className="text-xs font-bold uppercase tracking-[0.2em] text-cyan-300/70">
                      Students
                    </span>
                  </div>

                  <h3 className="mt-6 text-2xl font-black text-white sm:text-3xl">
                    Your school journey starts here.
                  </h3>

                  <p className="mt-4 text-sm leading-7 text-slate-400">
                    Enroll into Scholiqen Academy, receive your student
                    credentials and access a dedicated portal designed around
                    your class and academic journey.
                  </p>

                  <div className="mt-6 space-y-3">
                    {studentBenefits.map(
                      (item) => (
                        <div
                          key={item}
                          className="flex items-center gap-3 text-sm text-slate-400"
                        >
                          <CheckCircle2 className="h-4 w-4 shrink-0 text-cyan-300" />
                          {item}
                        </div>
                      )
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={goToStudentEnrollment}
                    className="mt-8 inline-flex items-center gap-2 rounded-xl bg-cyan-400 px-5 py-3 text-sm font-black text-[#041018] transition-all duration-300 hover:bg-cyan-300 hover:shadow-[0_0_30px_rgba(34,211,238,0.18)]"
                  >
                    Start Student Enrollment
                    <ArrowRight className="h-4 w-4" />
                  </button>
                </div>
              </motion.div>

              {/* TUTOR */}
              <motion.div
                initial={{
                  opacity: 0,
                  x: 25,
                }}
                whileInView={{
                  opacity: 1,
                  x: 0,
                }}
                viewport={{
                  once: true,
                  amount: 0.2,
                }}
                className="relative overflow-hidden rounded-[32px] border border-violet-400/15 bg-gradient-to-br from-violet-400/[0.07] via-white/[0.025] to-transparent p-7 sm:p-9"
              >
                <div className="absolute -bottom-20 -right-20 h-52 w-52 rounded-full bg-violet-500/10 blur-[85px]" />

                <div className="relative">
                  <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-violet-300/10">
                      <BriefcaseBusiness className="h-5 w-5 text-violet-300" />
                    </div>

                    <span className="text-xs font-bold uppercase tracking-[0.2em] text-violet-300/70">
                      Tutors
                    </span>
                  </div>

                  <h3 className="mt-6 text-2xl font-black text-white sm:text-3xl">
                    Share your knowledge.
                  </h3>

                  <p className="mt-4 text-sm leading-7 text-slate-400">
                    Apply to become part of the Scholiqen teaching community
                    and help primary and secondary students learn through
                    quality digital education.
                  </p>

                  <div className="mt-6 space-y-3">
                    {tutorBenefits.map(
                      (item) => (
                        <div
                          key={item}
                          className="flex items-center gap-3 text-sm text-slate-400"
                        >
                          <CheckCircle2 className="h-4 w-4 shrink-0 text-violet-300" />
                          {item}
                        </div>
                      )
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={goToTutorEnrollment}
                    className="mt-8 inline-flex items-center gap-2 rounded-xl border border-violet-300/20 bg-violet-300/10 px-5 py-3 text-sm font-black text-violet-200 transition-all duration-300 hover:border-violet-300/40 hover:bg-violet-300/15 hover:shadow-[0_0_30px_rgba(139,92,246,0.14)]"
                  >
                    Apply as Tutor
                    <ArrowRight className="h-4 w-4" />
                  </button>
                </div>
              </motion.div>
            </div>
          </section>

          {/* =====================================================
              CTA
          ===================================================== */}
          <section className="mx-auto max-w-7xl px-5 pb-20 sm:px-8 lg:px-10 lg:pb-28">
            <motion.div
              initial={{
                opacity: 0,
                y: 20,
              }}
              whileInView={{
                opacity: 1,
                y: 0,
              }}
              viewport={{
                once: true,
                amount: 0.25,
              }}
              className="relative overflow-hidden rounded-[36px] border border-cyan-400/15 bg-gradient-to-r from-cyan-400/[0.08] via-blue-500/[0.05] to-violet-500/[0.08] p-8 text-center sm:p-12"
            >
              <div className="absolute left-1/2 top-1/2 h-64 w-64 -translate-x-1/2 -translate-y-1/2 rounded-full bg-cyan-400/10 blur-[100px]" />

              <div className="relative">
                <Sparkles className="mx-auto h-7 w-7 text-cyan-300" />

                <h2 className="mx-auto mt-5 max-w-2xl text-3xl font-black text-white sm:text-4xl">
                  Ready to join Scholiqen Academy?
                </h2>

                <p className="mx-auto mt-4 max-w-xl text-sm leading-7 text-slate-500">
                  Students can enroll directly. Tutors can submit an
                  application for review. No existing Scholiqen account is
                  required to begin.
                </p>

                <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
                  <button
                    type="button"
                    onClick={goToStudentEnrollment}
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-cyan-400 px-6 py-3.5 text-sm font-black text-[#041018] transition-all duration-300 hover:bg-cyan-300 hover:shadow-[0_0_35px_rgba(34,211,238,0.2)]"
                  >
                    <GraduationCap className="h-4 w-4" />
                    Enroll as Student
                  </button>

                  <button
                    type="button"
                    onClick={goToTutorEnrollment}
                    className="inline-flex items-center justify-center gap-2 rounded-xl border border-violet-300/20 bg-violet-300/10 px-6 py-3.5 text-sm font-black text-violet-200 transition-all duration-300 hover:border-violet-300/40 hover:bg-violet-300/[0.15]"
                  >
                    <BriefcaseBusiness className="h-4 w-4" />
                    Apply as Tutor
                  </button>
                </div>

                <button
                  type="button"
                  onClick={goToStudentLogin}
                  className="mt-6 inline-flex items-center gap-2 text-sm font-bold text-slate-500 transition-colors hover:text-cyan-300"
                >
                  <LogIn className="h-4 w-4" />
                  Already enrolled? Enter your Student Portal
                </button>
              </div>
            </motion.div>
          </section>
        </main>

        {/* =======================================================
            FOOTER
        ======================================================= */}
        <footer className="border-t border-white/[0.05] bg-black/10">
          <div className="mx-auto flex max-w-7xl flex-col gap-4 px-5 py-8 sm:px-8 md:flex-row md:items-center md:justify-between lg:px-10">
            <div>
              <p className="text-sm font-black text-white">
                SCHOLIQEN ACADEMY
              </p>

              <p className="mt-1 text-xs text-slate-600">
                Learn. Teach. Grow.
              </p>
            </div>

            <div className="flex items-center gap-2 text-xs text-slate-600">
              <ShieldCheck className="h-4 w-4" />
              Digital School Platform
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default Academy;
