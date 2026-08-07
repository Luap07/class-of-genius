import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Clock3,
  FileQuestion,
  BookOpen,
  ShieldCheck,
  CheckCircle2,
  ArrowRight,
} from "lucide-react";

import cogLogo from "../../assets/cog.png";

const CBTInstruction = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const exam = location.state?.exam;
  const subjects = location.state?.subjects || [];

  const questionCount = 40;
  const duration = 45;

  const handleStartExam = () => {
    navigate("/cbt/start", {
      state: {
        exam,
        subjects,
        startExam: true,
      },
    });
  };

  if (!exam || subjects.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#07111f] text-white px-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-blue-400">
            Exam information unavailable
          </h1>

          <p className="text-gray-400 mt-2">
            Please return to subject selection and choose your subjects.
          </p>

          <button
            onClick={() => navigate("/cbt")}
            className="mt-6 px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 transition font-semibold"
          >
            Return to CBT
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-[#07111f] text-white overflow-x-hidden">

      {/* =====================================================
          PREMIUM BACKGROUND (Fixed so it doesn't scroll)
      ===================================================== */}

      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(37,99,235,0.18),transparent_35%),radial-gradient(circle_at_bottom_right,rgba(124,58,237,0.16),transparent_35%)]" />

        {/* Subtle grid */}
        <div
          className="absolute inset-0 opacity-[0.035]"
          style={{
            backgroundImage: `
              linear-gradient(rgba(255,255,255,0.8) 1px, transparent 1px),
              linear-gradient(90deg, rgba(255,255,255,0.8) 1px, transparent 1px)
            `,
            backgroundSize: "45px 45px",
          }}
        />

        {/* Ambient glows */}
        <div className="absolute -top-48 left-1/2 -translate-x-1/2 w-[700px] h-[400px] rounded-full bg-blue-600/10 blur-[130px]" />
        <div className="absolute top-1/3 -left-48 w-[450px] h-[450px] rounded-full bg-indigo-600/10 blur-[130px]" />
        <div className="absolute bottom-[-180px] -right-32 w-[450px] h-[450px] rounded-full bg-purple-600/10 blur-[130px]" />

        {/* Floating particles */}
        <div className="absolute top-[18%] left-[10%] w-1 h-1 rounded-full bg-blue-400/70 animate-pulse" />
        <div className="absolute top-[28%] right-[15%] w-1.5 h-1.5 rounded-full bg-purple-400/60 animate-pulse" />
        <div className="absolute top-[62%] left-[18%] w-1 h-1 rounded-full bg-cyan-400/60 animate-pulse" />
        <div className="absolute bottom-[18%] right-[13%] w-1 h-1 rounded-full bg-blue-400/60 animate-pulse" />
      </div>

      {/* =====================================================
          MAIN CONTENT (Scrolls independently)
      ===================================================== */}

      <div className="relative z-10 min-h-screen px-4 py-8 md:py-12">

        <div className="max-w-4xl mx-auto">

          {/* =================================================
              LOGO
          ================================================= */}

          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center mb-8"
          >
            <div className="relative">

              <div className="absolute inset-0 rounded-full bg-blue-500/20 blur-2xl" />

              <img
                src={cogLogo}
                alt="Class Of Genius"
                className="relative w-20 h-20 md:w-24 md:h-24 object-contain"
              />
            </div>

            <h1 className="mt-4 text-xl md:text-2xl font-bold">
              Scholiqen CBT
            </h1>

            <p className="text-sm text-gray-400 mt-1">
              Computer Based Examination System
            </p>
          </motion.div>

          {/* =================================================
              MAIN CARD
          ================================================= */}

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="relative overflow-hidden rounded-3xl border border-white/10 bg-[#0b1a2d]/90 backdrop-blur-2xl shadow-2xl shadow-blue-950/30"
          >

            {/* Card top line */}
            <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-blue-400 to-transparent" />

            {/* Header */}
            <div className="p-6 md:p-8 border-b border-white/10">

              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-5">

                <div>
                  <p className="text-xs uppercase tracking-[0.25em] text-blue-400 font-semibold">
                    Examination Instructions
                  </p>

                  <h2 className="text-2xl md:text-3xl font-bold mt-2">
                    {exam.toUpperCase()} CBT Examination
                  </h2>

                  <p className="text-gray-400 mt-2 text-sm">
                    Read the instructions carefully before starting your
                    examination.
                  </p>
                </div>

                <div className="px-4 py-2 rounded-xl border border-blue-400/20 bg-blue-500/10 text-blue-300 text-sm font-semibold">
                  {subjects.length} Subjects
                </div>

              </div>
            </div>

            {/* =================================================
                EXAM STATS
            ================================================= */}

            <div className="grid grid-cols-1 sm:grid-cols-3 border-b border-white/10">

              <div className="p-5 flex items-center gap-4 border-b sm:border-b-0 sm:border-r border-white/10">
                <div className="w-11 h-11 rounded-xl bg-blue-500/10 flex items-center justify-center">
                  <FileQuestion className="w-5 h-5 text-blue-400" />
                </div>

                <div>
                  <p className="text-xs text-gray-500">
                    Questions
                  </p>

                  <p className="font-bold text-lg">
                    {questionCount}
                  </p>
                </div>
              </div>

              <div className="p-5 flex items-center gap-4 border-b sm:border-b-0 sm:border-r border-white/10">
                <div className="w-11 h-11 rounded-xl bg-purple-500/10 flex items-center justify-center">
                  <Clock3 className="w-5 h-5 text-purple-400" />
                </div>

                <div>
                  <p className="text-xs text-gray-500">
                    Duration
                  </p>

                  <p className="font-bold text-lg">
                    {duration} Minutes
                  </p>
                </div>
              </div>

              <div className="p-5 flex items-center gap-4">
                <div className="w-11 h-11 rounded-xl bg-cyan-500/10 flex items-center justify-center">
                  <BookOpen className="w-5 h-5 text-cyan-400" />
                </div>

                <div>
                  <p className="text-xs text-gray-500">
                    Subjects
                  </p>

                  <p className="font-bold text-lg">
                    {subjects.length}
                  </p>
                </div>
              </div>

            </div>

            {/* =================================================
                SELECTED SUBJECTS
            ================================================= */}

            <div className="p-6 md:p-8">

              <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-300">
                Selected Subjects
              </h3>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4">

                {subjects.map((subject, index) => (
                  <motion.div
                    key={subject}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.08 }}
                    className="rounded-xl border border-blue-400/20 bg-blue-500/10 px-4 py-3 text-center"
                  >
                    <span className="text-sm font-semibold text-blue-200">
                      {subject}
                    </span>
                  </motion.div>
                ))}

              </div>

              {/* =================================================
                  INSTRUCTIONS
              ================================================= */}

              <div className="mt-8">

                <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-300 mb-4">
                  Examination Rules
                </h3>

                <div className="space-y-3">

                  {[
                    "Read each question carefully before selecting your answer.",
                    "Only one answer can be selected for each question.",
                    "Use the Next button to move to the following question.",
                    "You can move between questions using the question navigation panel.",
                    "Your selected answers are saved while you move through the examination.",
                    "The examination will automatically end when the allotted time expires.",
                    "Review your answers before submitting the examination.",
                  ].map((instruction, index) => (
                    <div
                      key={index}
                      className="flex gap-3 items-start rounded-xl border border-white/5 bg-white/[0.025] p-4"
                    >
                      <CheckCircle2 className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />

                      <p className="text-sm text-gray-300 leading-relaxed">
                        {instruction}
                      </p>
                    </div>
                  ))}

                </div>

              </div>

              {/* =================================================
                  IMPORTANT NOTICE
              ================================================= */}

              <div className="mt-8 rounded-2xl border border-amber-400/20 bg-amber-400/[0.06] p-5">

                <div className="flex gap-4">

                  <div className="w-10 h-10 shrink-0 rounded-xl bg-amber-400/10 flex items-center justify-center">
                    <ShieldCheck className="w-5 h-5 text-amber-400" />
                  </div>

                  <div>
                    <h4 className="font-semibold text-amber-300">
                      Before You Begin
                    </h4>

                    <p className="text-sm text-gray-400 mt-1 leading-relaxed">
                      Make sure you are ready before starting. Once the
                      examination begins, the timer will start and your
                      questions will be presented one at a time.
                    </p>
                  </div>

                </div>

              </div>

              {/* =================================================
                  START BUTTON
              ================================================= */}

              <div className="mt-8 flex flex-col sm:flex-row gap-3">

                <button
                  onClick={() => navigate(`/cbt/exam/${exam}`)}
                  className="px-6 py-3 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 transition font-semibold text-gray-300"
                >
                  Back
                </button>

                <button
                  onClick={handleStartExam}
                  className="group flex-1 flex items-center justify-center gap-3 px-6 py-4 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 transition-all font-bold shadow-lg shadow-blue-900/30"
                >
                  Start Examination

                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </button>

              </div>

            </div>

          </motion.div>

          {/* Footer */}
          <p className="text-center text-xs text-gray-600 mt-6">
            Powered by Scholiqen CBT System © {new Date().getFullYear()}
          </p>

        </div>

      </div>
    </div>
  );
};

export default CBTInstruction;