import React, { useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Clock3,
  FileQuestion,
  BookOpen,
  ShieldCheck,
  CheckCircle2,
  ArrowRight,
  Sparkles,
  Timer,
  Layers3,
  Award,
  ChevronRight,
} from "lucide-react";

import cogLogo from "../../assets/cog.png";

const CBTInstruction = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const exam = location.state?.exam;
  const subjects = location.state?.subjects || [];

  /* ============================================================
     CBT CONFIGURATION
  ============================================================ */

  const QUESTIONS_PER_SUBJECT = 40;

  // 2 HOURS = 120 MINUTES
  const DURATION_MINUTES = 120;

  const questionCount = useMemo(
    () => subjects.length * QUESTIONS_PER_SUBJECT,
    [subjects.length]
  );

  const durationHours = DURATION_MINUTES / 60;

  /* ============================================================
     START EXAM
  ============================================================ */

  const handleStartExam = () => {
    navigate("/cbt/start", {
      state: {
        exam,
        subjects,
        startExam: true,

        // Pass the actual duration to the examination page
        durationMinutes: DURATION_MINUTES,
      },
    });
  };

  /* ============================================================
     INVALID EXAM DATA
  ============================================================ */

  if (!exam || subjects.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#030712] text-white px-6">
        <div className="relative w-full max-w-md text-center rounded-3xl border border-white/10 bg-white/[0.04] backdrop-blur-2xl p-8 shadow-2xl">
          <div className="absolute inset-x-10 -top-20 h-32 bg-blue-600/20 blur-[80px] pointer-events-none" />

          <div className="relative">
            <div className="mx-auto w-16 h-16 rounded-2xl bg-blue-500/10 border border-blue-400/20 flex items-center justify-center">
              <FileQuestion className="w-7 h-7 text-blue-400" />
            </div>

            <h1 className="text-2xl font-bold text-white mt-6">
              Exam Information Unavailable
            </h1>

            <p className="text-gray-400 mt-3 leading-relaxed">
              Please return to subject selection and choose your subjects
              before continuing.
            </p>

            <button
              onClick={() => navigate("/cbt")}
              className="mt-7 w-full px-6 py-3.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 transition-all font-semibold shadow-lg shadow-blue-900/30"
            >
              Return to CBT
            </button>
          </div>
        </div>
      </div>
    );
  }

  /* ============================================================
     STAT CARD
  ============================================================ */

  const StatCard = ({
    icon: Icon,
    label,
    value,
    description,
    iconClass,
    borderClass,
  }) => (
    <motion.div
      whileHover={{ y: -3 }}
      className={`relative overflow-hidden p-5 border-b sm:border-b-0 sm:border-r border-white/10 last:border-0 group`}
    >
      <div
        className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity ${borderClass}`}
      />

      <div className="relative flex items-center gap-4">
        <div
          className={`w-12 h-12 rounded-2xl flex items-center justify-center border border-white/10 ${iconClass}`}
        >
          <Icon className="w-5 h-5" />
        </div>

        <div>
          <p className="text-[11px] uppercase tracking-[0.16em] text-gray-500 font-medium">
            {label}
          </p>

          <p className="font-bold text-xl text-white mt-0.5">
            {value}
          </p>

          {description && (
            <p className="text-[11px] text-gray-500 mt-1">
              {description}
            </p>
          )}
        </div>
      </div>
    </motion.div>
  );

  /* ============================================================
     PAGE
  ============================================================ */

  return (
    <div className="relative min-h-screen bg-[#030712] text-white overflow-x-hidden">
      {/* =====================================================
          PREMIUM BACKGROUND
      ===================================================== */}

      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        {/* Main radial gradients */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_15%_0%,rgba(37,99,235,0.20),transparent_30%),radial-gradient(circle_at_85%_10%,rgba(99,102,241,0.15),transparent_28%),radial-gradient(circle_at_50%_100%,rgba(14,165,233,0.08),transparent_35%)]" />

        {/* Premium grid */}
        <div
          className="absolute inset-0 opacity-[0.025]"
          style={{
            backgroundImage: `
              linear-gradient(rgba(255,255,255,0.8) 1px, transparent 1px),
              linear-gradient(90deg, rgba(255,255,255,0.8) 1px, transparent 1px)
            `,
            backgroundSize: "50px 50px",
          }}
        />

        {/* Glow 1 */}
        <motion.div
          animate={{
            x: [0, 50, 0],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute -top-48 left-1/2 -translate-x-1/2 w-[800px] h-[450px] rounded-full bg-blue-600/10 blur-[150px]"
        />

        {/* Glow 2 */}
        <motion.div
          animate={{
            y: [0, -40, 0],
            opacity: [0.2, 0.4, 0.2],
          }}
          transition={{
            duration: 9,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute top-[35%] -left-64 w-[500px] h-[500px] rounded-full bg-indigo-600/10 blur-[150px]"
        />

        {/* Glow 3 */}
        <motion.div
          animate={{
            y: [0, 40, 0],
            opacity: [0.15, 0.3, 0.15],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute bottom-[-250px] -right-32 w-[550px] h-[550px] rounded-full bg-purple-600/10 blur-[150px]"
        />

        {/* Particles */}
        <div className="absolute top-[18%] left-[8%] w-1 h-1 rounded-full bg-blue-400/70 animate-pulse" />
        <div className="absolute top-[26%] right-[12%] w-1.5 h-1.5 rounded-full bg-indigo-400/60 animate-pulse" />
        <div className="absolute top-[62%] left-[15%] w-1 h-1 rounded-full bg-cyan-400/60 animate-pulse" />
        <div className="absolute bottom-[20%] right-[15%] w-1 h-1 rounded-full bg-blue-400/60 animate-pulse" />
        <div className="absolute top-[45%] right-[7%] w-1 h-1 rounded-full bg-purple-400/50 animate-pulse" />
      </div>

      {/* =====================================================
          MAIN
      ===================================================== */}

      <div className="relative z-10 min-h-screen px-4 py-8 md:py-12">
        <div className="max-w-5xl mx-auto">

          {/* =================================================
              BRAND
          ================================================= */}

          <motion.div
            initial={{ opacity: 0, y: -25 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="flex flex-col items-center mb-8"
          >
            <div className="relative">
              <div className="absolute inset-0 rounded-full bg-blue-500/30 blur-3xl scale-125" />

              <div className="relative w-24 h-24 md:w-28 md:h-28 rounded-3xl border border-white/10 bg-white/[0.04] backdrop-blur-xl flex items-center justify-center shadow-2xl">
                <img
                  src={cogLogo}
                  alt="Class Of Genius"
                  className="w-20 h-20 md:w-24 md:h-24 object-contain"
                />
              </div>

              <div className="absolute -right-2 -top-2 w-7 h-7 rounded-full bg-blue-500 border-4 border-[#030712] flex items-center justify-center">
                <Sparkles className="w-3 h-3 text-white" />
              </div>
            </div>

            <h1 className="mt-5 text-xl md:text-2xl font-bold tracking-tight">
              Scholiqen CBT
            </h1>

            <p className="text-sm text-gray-500 mt-1">
              Premium Computer Based Examination System
            </p>
          </motion.div>

          {/* =================================================
              MAIN CARD
          ================================================= */}

          <motion.div
            initial={{ opacity: 0, y: 35 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: 0.6,
              delay: 0.1,
            }}
            className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-[#08111f]/90 backdrop-blur-2xl shadow-[0_30px_100px_rgba(0,0,0,0.45)]"
          >
            {/* Premium top border */}
            <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-blue-500 to-transparent" />

            {/* =================================================
                HEADER
            ================================================= */}

            <div className="relative p-6 md:p-9 border-b border-white/10">
              <div className="absolute right-0 top-0 w-72 h-72 bg-blue-600/10 blur-[100px] pointer-events-none" />

              <div className="relative flex flex-col md:flex-row md:items-center md:justify-between gap-6">
                <div>
                  <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-blue-400/20 bg-blue-500/10 text-blue-300 text-[10px] uppercase tracking-[0.18em] font-bold">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
                    Examination Instructions
                  </div>

                  <h2 className="text-2xl md:text-4xl font-black tracking-tight mt-4">
                    {String(exam).toUpperCase()}{" "}
                    <span className="text-blue-400">
                      CBT Examination
                    </span>
                  </h2>

                  <p className="text-gray-400 mt-3 text-sm md:text-base max-w-2xl leading-relaxed">
                    Review your examination details and rules carefully
                    before starting your assessment.
                  </p>
                </div>

                <div className="shrink-0">
                  <div className="px-5 py-3 rounded-2xl border border-blue-400/20 bg-blue-500/10 shadow-lg shadow-blue-950/20">
                    <div className="flex items-center gap-2">
                      <Layers3 className="w-4 h-4 text-blue-400" />

                      <span className="text-blue-200 text-sm font-bold">
                        {subjects.length}{" "}
                        {subjects.length === 1
                          ? "Subject"
                          : "Subjects"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* =================================================
                EXAM STATS
            ================================================= */}

            <div className="grid grid-cols-1 sm:grid-cols-3 border-b border-white/10">
              <StatCard
                icon={FileQuestion}
                label="Questions"
                value={questionCount}
                description={`${QUESTIONS_PER_SUBJECT} questions per subject`}
                iconClass="bg-blue-500/10 text-blue-400"
                borderClass="bg-blue-500/[0.03]"
              />

              <StatCard
                icon={Timer}
                label="Duration"
                value="2 Hours"
                description="120 minutes total"
                iconClass="bg-purple-500/10 text-purple-400"
                borderClass="bg-purple-500/[0.03]"
              />

              <StatCard
                icon={BookOpen}
                label="Subjects"
                value={subjects.length}
                description="Selected for examination"
                iconClass="bg-cyan-500/10 text-cyan-400"
                borderClass="bg-cyan-500/[0.03]"
              />
            </div>

            {/* =================================================
                CONTENT
            ================================================= */}

            <div className="p-6 md:p-9">

              {/* =================================================
                  SELECTED SUBJECTS
              ================================================= */}

              <div>
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-[10px] uppercase tracking-[0.2em] text-blue-400 font-bold">
                      Examination Structure
                    </p>

                    <h3 className="text-lg md:text-xl font-bold mt-1">
                      Selected Subjects
                    </h3>
                  </div>

                  <div className="hidden sm:flex items-center gap-2 text-xs text-gray-500">
                    <Award className="w-4 h-4 text-blue-400" />
                    {questionCount} total questions
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mt-5">
                  {subjects.map((subject, index) => (
                    <motion.div
                      key={`${subject}-${index}`}
                      initial={{
                        opacity: 0,
                        y: 15,
                      }}
                      animate={{
                        opacity: 1,
                        y: 0,
                      }}
                      transition={{
                        delay: 0.15 + index * 0.07,
                      }}
                      whileHover={{
                        y: -4,
                        scale: 1.01,
                      }}
                      className="group relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.035] hover:bg-blue-500/[0.06] hover:border-blue-400/20 transition-all p-4"
                    >
                      <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-blue-500/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

                      <div className="flex items-center justify-between">
                        <div className="w-9 h-9 rounded-xl bg-blue-500/10 border border-blue-400/10 flex items-center justify-center">
                          <BookOpen className="w-4 h-4 text-blue-400" />
                        </div>

                        <ChevronRight className="w-4 h-4 text-gray-700 group-hover:text-blue-400 transition-colors" />
                      </div>

                      <p className="text-sm font-semibold text-white mt-4 line-clamp-2">
                        {subject}
                      </p>

                      <div className="flex items-center gap-2 mt-2">
                        <span className="text-[10px] text-blue-400 font-semibold">
                          {QUESTIONS_PER_SUBJECT} Questions
                        </span>

                        <span className="w-1 h-1 rounded-full bg-gray-700" />

                        <span className="text-[10px] text-gray-500">
                          Included
                        </span>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* =================================================
                  TOTAL SUMMARY
              ================================================= */}

              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.35 }}
                className="relative overflow-hidden mt-7 rounded-2xl border border-blue-400/15 bg-gradient-to-r from-blue-500/[0.08] via-indigo-500/[0.05] to-transparent p-5 md:p-6"
              >
                <div className="absolute right-0 top-0 w-40 h-40 bg-blue-500/10 blur-[70px]" />

                <div className="relative flex flex-col sm:flex-row sm:items-center sm:justify-between gap-5">
                  <div>
                    <div className="flex items-center gap-2">
                      <Award className="w-4 h-4 text-blue-400" />

                      <p className="text-[10px] uppercase tracking-[0.2em] text-blue-400 font-bold">
                        Total Examination
                      </p>
                    </div>

                    <p className="text-2xl md:text-3xl font-black mt-2">
                      {questionCount} Questions
                    </p>

                    <p className="text-xs text-gray-500 mt-1">
                      {subjects.length}{" "}
                      {subjects.length === 1
                        ? "subject"
                        : "subjects"}{" "}
                      × {QUESTIONS_PER_SUBJECT} questions
                    </p>
                  </div>

                  <div className="sm:text-right">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-purple-500/10 border border-purple-400/15">
                      <Clock3 className="w-4 h-4 text-purple-400" />

                      <span className="text-sm font-bold text-purple-300">
                        2 Hours
                      </span>
                    </div>

                    <p className="text-[10px] text-gray-600 mt-2">
                      120 minutes examination time
                    </p>
                  </div>
                </div>
              </motion.div>

              {/* =================================================
                  EXAMINATION RULES
              ================================================= */}

              <div className="mt-9">
                <div className="mb-4">
                  <p className="text-[10px] uppercase tracking-[0.2em] text-blue-400 font-bold">
                    Important
                  </p>

                  <h3 className="text-lg font-bold mt-1">
                    Examination Rules
                  </h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {[
                    "Read each question carefully before selecting your answer.",
                    "Only one answer can be selected for each question.",
                    "Use the Next button to move to the following question.",
                    "You can move between questions using the question navigation panel.",
                    "Your selected answers are automatically saved while you progress.",
                    "The examination will automatically end when the 2-hour time limit expires.",
                    "Review your answers carefully before submitting the examination.",
                    "Ensure your device remains connected and has sufficient battery power.",
                  ].map((instruction, index) => (
                    <motion.div
                      key={index}
                      initial={{
                        opacity: 0,
                        x: index % 2 === 0 ? -10 : 10,
                      }}
                      animate={{
                        opacity: 1,
                        x: 0,
                      }}
                      transition={{
                        delay: 0.4 + index * 0.04,
                      }}
                      className="flex gap-3 items-start rounded-xl border border-white/[0.07] bg-white/[0.025] hover:bg-white/[0.04] p-4 transition-colors"
                    >
                      <div className="w-6 h-6 shrink-0 rounded-lg bg-blue-500/10 flex items-center justify-center">
                        <CheckCircle2 className="w-4 h-4 text-blue-400" />
                      </div>

                      <p className="text-sm text-gray-300 leading-relaxed">
                        {instruction}
                      </p>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* =================================================
                  IMPORTANT NOTICE
              ================================================= */}

              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 }}
                className="relative overflow-hidden mt-8 rounded-2xl border border-amber-400/15 bg-amber-400/[0.045] p-5"
              >
                <div className="absolute right-0 top-0 w-48 h-48 bg-amber-400/5 blur-[80px]" />

                <div className="relative flex gap-4">
                  <div className="w-11 h-11 shrink-0 rounded-xl bg-amber-400/10 border border-amber-400/10 flex items-center justify-center">
                    <ShieldCheck className="w-5 h-5 text-amber-400" />
                  </div>

                  <div>
                    <h4 className="font-bold text-amber-300">
                      Before You Begin
                    </h4>

                    <p className="text-sm text-gray-400 mt-1.5 leading-relaxed">
                      Make sure you are fully ready before starting. Once
                      you click <strong className="text-gray-300">Start Examination</strong>,
                      the 2-hour countdown will begin and your examination
                      session will be active.
                    </p>
                  </div>
                </div>
              </motion.div>

              {/* =================================================
                  START SECTION
              ================================================= */}

              <div className="mt-9">
                <div className="flex flex-col sm:flex-row gap-3">
                  <button
                    onClick={() => navigate(`/cbt/exam/${exam}`)}
                    className="px-6 py-4 rounded-xl border border-white/10 bg-white/[0.03] hover:bg-white/[0.07] transition-all font-semibold text-gray-300"
                  >
                    Back
                  </button>

                  <motion.button
                    whileHover={{
                      scale: 1.01,
                    }}
                    whileTap={{
                      scale: 0.98,
                    }}
                    onClick={handleStartExam}
                    className="group relative overflow-hidden flex-1 flex items-center justify-center gap-3 px-6 py-4 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 hover:from-blue-500 hover:via-indigo-500 hover:to-violet-500 transition-all font-bold shadow-xl shadow-blue-950/40"
                  >
                    <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />

                    <span className="relative">
                      Start Examination
                    </span>

                    <ArrowRight className="relative w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </motion.button>
                </div>

                <div className="flex items-center justify-center gap-2 mt-4 text-[11px] text-gray-600">
                  <Clock3 className="w-3.5 h-3.5" />
                  <span>
                    2 hours • {questionCount} questions •{" "}
                    {subjects.length}{" "}
                    {subjects.length === 1
                      ? "subject"
                      : "subjects"}
                  </span>
                </div>
              </div>
            </div>
          </motion.div>

          {/* =================================================
              FOOTER
          ================================================= */}

          <div className="text-center mt-7 pb-4">
            <div className="inline-flex items-center gap-2 text-[11px] text-gray-600">
              <Sparkles className="w-3 h-3 text-blue-500/60" />

              <span>
                Powered by Scholiqen CBT System ©{" "}
                {new Date().getFullYear()}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CBTInstruction;