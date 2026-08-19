import React, { useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowRight,
  Check,
  ChevronLeft,
  Sparkles,
} from "lucide-react";

import { cbtSubjects } from "../../data/cbtSubjects";
import Cog from "../../assets/cog.png";

const SubjectSelect = () => {
  const { exam } = useParams();
  const navigate = useNavigate();

  /* ============================================================
     EXAM
  ============================================================ */

  const examName = String(exam ?? "").trim();

  const normalizedExam = examName
    .toLowerCase()
    .trim();

  /* ============================================================
     AVAILABLE SUBJECTS
  ============================================================ */

  const subjects = useMemo(() => {
    const available = cbtSubjects?.[normalizedExam];

    if (!Array.isArray(available)) {
      return [];
    }

    const seen = new Set();

    return available.filter((subject) => {
      const clean = String(subject ?? "").trim();

      if (!clean) {
        return false;
      }

      const key = clean.toLowerCase();

      if (seen.has(key)) {
        return false;
      }

      seen.add(key);

      return true;
    });
  }, [normalizedExam]);

  /* ============================================================
     SELECTED SUBJECTS
  ============================================================ */

  const [selected, setSelected] = useState([]);

  /* ============================================================
     TOGGLE SUBJECT
  ============================================================ */

  const toggleSubject = (subject) => {
    const cleanSubject = String(subject ?? "").trim();

    if (!cleanSubject) {
      return;
    }

    const key = cleanSubject.toLowerCase();

    setSelected((previous) => {
      const exists = previous.some(
        (item) =>
          String(item).trim().toLowerCase() === key
      );

      /* REMOVE */
      if (exists) {
        return previous.filter(
          (item) =>
            String(item).trim().toLowerCase() !== key
        );
      }

      /* MAXIMUM 4 */
      if (previous.length >= 4) {
        return previous;
      }

      /* ADD */
      return [...previous, cleanSubject];
    });
  };

  /* ============================================================
     START EXAM
  ============================================================ */

  const startExam = () => {
    if (selected.length !== 4) {
      return;
    }

    /*
     * Build a clean unique array.
     */
    const uniqueSubjects = [];

    selected.forEach((subject) => {
      const clean = String(subject ?? "").trim();

      if (!clean) {
        return;
      }

      const alreadyExists = uniqueSubjects.some(
        (item) =>
          item.toLowerCase() === clean.toLowerCase()
      );

      if (!alreadyExists) {
        uniqueSubjects.push(clean);
      }
    });

    /*
     * Must have exactly four different subjects.
     */
    if (uniqueSubjects.length !== 4) {
      return;
    }

    /* ==========================================================
       SAVE EXAM INFORMATION
    ========================================================== */

    localStorage.setItem(
      "cbt_exam",
      examName
    );

    /*
     * MAIN SUBJECT STORAGE
     */
    localStorage.setItem(
      "cbt_subjects",
      JSON.stringify(uniqueSubjects)
    );

    /*
     * SESSION STORAGE
     */
    const sessionData = {
      exam: examName,
      normalizedExam,
      subjects: uniqueSubjects,
      questionCountPerSubject: 40,
      totalQuestions: uniqueSubjects.length * 40,
      createdAt: Date.now(),
    };

    localStorage.setItem(
      "cbt_selected_subjects",
      JSON.stringify(sessionData)
    );

    /*
     * ALSO SAVE A COPY UNDER A SESSION KEY.
     * This helps prevent another CBT session from
     * accidentally using old subjects.
     */
    localStorage.setItem(
      "cbt_current_session",
      JSON.stringify(sessionData)
    );

    console.log(
      "CBT SUBJECTS SELECTED:",
      uniqueSubjects
    );

    console.log(
      "CBT TOTAL QUESTIONS:",
      uniqueSubjects.length * 40
    );

    /* ==========================================================
       NAVIGATE
    ========================================================== */

    navigate("/cbt/instruction", {
      state: {
        exam: examName,
        subjects: [...uniqueSubjects],
      },
    });
  };

  /* ============================================================
     BACK
  ============================================================ */

  const goBack = () => {
    navigate(-1);
  };

  /* ============================================================
     PROGRESS
  ============================================================ */

  const progress =
    (selected.length / 4) * 100;

  const remaining =
    4 - selected.length;

  /* ============================================================
     RENDER
  ============================================================ */

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#030712] text-white">

      {/* ==========================================================
         BACKGROUND
      ========================================================== */}

      <div className="absolute inset-0 pointer-events-none overflow-hidden">

        <div className="absolute -top-40 -right-32 w-[520px] h-[520px] rounded-full bg-blue-600/20 blur-[120px]" />

        <div className="absolute top-[25%] -left-40 w-[480px] h-[480px] rounded-full bg-purple-600/15 blur-[120px]" />

        <div className="absolute -bottom-48 right-[15%] w-[520px] h-[520px] rounded-full bg-cyan-500/10 blur-[130px]" />

        <div
          className="absolute inset-0 opacity-[0.055]"
          style={{
            backgroundImage: `
              linear-gradient(
                rgba(255,255,255,0.12) 1px,
                transparent 1px
              ),
              linear-gradient(
                90deg,
                rgba(255,255,255,0.12) 1px,
                transparent 1px
              )
            `,
            backgroundSize: "45px 45px",
          }}
        />

        <div className="absolute top-[18%] left-[12%] w-1 h-1 rounded-full bg-blue-400/50" />
        <div className="absolute top-[34%] right-[17%] w-1 h-1 rounded-full bg-purple-400/50" />
        <div className="absolute bottom-[25%] left-[22%] w-1 h-1 rounded-full bg-cyan-400/40" />
        <div className="absolute bottom-[18%] right-[30%] w-1 h-1 rounded-full bg-blue-400/40" />

      </div>

      {/* ==========================================================
         HEADER
      ========================================================== */}

      <header className="relative z-20 border-b border-white/[0.08] bg-[#030712]/70 backdrop-blur-2xl">

        <div className="max-w-[1450px] mx-auto px-5 md:px-8">

          <div className="h-[76px] flex items-center justify-between">

            {/* LEFT */}

            <div className="flex items-center gap-3">

              <button
                onClick={goBack}
                type="button"
                className="w-10 h-10 rounded-xl border border-white/10 bg-white/[0.03] hover:bg-white/[0.07] flex items-center justify-center text-slate-400 hover:text-white transition"
              >
                <ChevronLeft size={19} />
              </button>

              <div className="flex items-center gap-3">

                <div className="w-10 h-10 rounded-xl bg-white/[0.05] border border-white/10 flex items-center justify-center overflow-hidden">

                  <img
                    src={Cog}
                    alt="Scholiqen"
                    className="w-8 h-8 object-contain"
                  />

                </div>

                <div className="hidden sm:block">

                  <p className="font-bold text-white">
                    Scholiqen
                  </p>

                  <p className="text-[9px] uppercase tracking-[0.2em] text-slate-500">
                    Learning Platform
                  </p>

                </div>

              </div>

            </div>

            {/* CENTER */}

            <div className="absolute left-1/2 -translate-x-1/2 text-center">

              <p className="text-xs md:text-sm font-bold text-white">
                {examName.toUpperCase()}
              </p>

              <p className="text-[9px] uppercase tracking-[0.2em] text-slate-500 mt-1">
                CBT Examination
              </p>

            </div>

            {/* RIGHT */}

            <div className="flex items-center gap-3">

              <div className="text-right">

                <p className="text-[9px] uppercase tracking-wider text-slate-500 font-semibold">
                  Subjects
                </p>

                <p className="text-sm font-bold text-blue-400">
                  {selected.length} / 4
                </p>

              </div>

              <div
                className={`w-10 h-10 rounded-xl border flex items-center justify-center ${
                  selected.length === 4
                    ? "bg-emerald-500/10 border-emerald-500/20"
                    : "bg-blue-500/10 border-blue-500/20"
                }`}
              >
                {selected.length === 4 ? (
                  <Check
                    size={19}
                    className="text-emerald-400"
                  />
                ) : (
                  <Sparkles
                    size={18}
                    className="text-blue-400"
                  />
                )}
              </div>

            </div>

          </div>

        </div>

      </header>

      {/* ==========================================================
         MAIN
      ========================================================== */}

      <main className="relative z-10 max-w-[1200px] mx-auto px-5 md:px-8 py-12 pb-40">

        <div className="text-center max-w-3xl mx-auto">

          <h1 className="text-3xl md:text-4xl font-bold text-transparent bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text">
            {examName.toUpperCase()} Subject Selection
          </h1>

          <p className="text-gray-400 mt-3 text-sm">
            Select exactly 4 subjects to start
            your CBT examination.
          </p>

          <p className="text-blue-400 text-xs mt-2">
            Selected: {selected.length} / 4
          </p>

        </div>

        {/* ========================================================
           PROGRESS
        ======================================================== */}

        <div className="max-w-2xl mx-auto mt-7">

          <div className="h-1.5 rounded-full bg-white/[0.06] overflow-hidden">

            <motion.div
              initial={{ width: 0 }}
              animate={{
                width: `${progress}%`,
              }}
              transition={{
                duration: 0.3,
              }}
              className={`h-full rounded-full ${
                selected.length === 4
                  ? "bg-emerald-500"
                  : "bg-gradient-to-r from-blue-500 to-purple-500"
              }`}
            />

          </div>

        </div>

        {/* ========================================================
           SUBJECT GRID
        ======================================================== */}

        <div className="relative z-10 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mt-10">

          {subjects.length > 0 ? (

            subjects.map((subject, index) => {

              const isSelected =
                selected.some(
                  (item) =>
                    item.toLowerCase() ===
                    subject.toLowerCase()
                );

              const disabled =
                !isSelected &&
                selected.length >= 4;

              return (
                <motion.button
                  key={`${subject}-${index}`}
                  type="button"
                  disabled={disabled}
                  whileHover={
                    disabled
                      ? {}
                      : { y: -4 }
                  }
                  whileTap={
                    disabled
                      ? {}
                      : { scale: 0.98 }
                  }
                  onClick={() =>
                    toggleSubject(subject)
                  }
                  className={`
                    relative cursor-pointer text-left
                    rounded-2xl p-5
                    border transition-all duration-300
                    ${
                      isSelected
                        ? "bg-blue-600/20 border-blue-400/60 shadow-lg shadow-blue-500/10"
                        : disabled
                        ? "bg-white/[0.02] border-white/[0.06] opacity-40 cursor-not-allowed"
                        : "bg-white/[0.035] border-white/10 hover:bg-white/[0.06] hover:border-blue-400/30"
                    }
                  `}
                >

                  {/* CHECK */}

                  <div
                    className={`
                      absolute top-4 right-4
                      w-6 h-6 rounded-full
                      flex items-center justify-center
                      border
                      ${
                        isSelected
                          ? "bg-blue-600 border-blue-400 text-white"
                          : "border-white/15 bg-white/[0.03] text-transparent"
                      }
                    `}
                  >
                    <Check
                      size={14}
                      strokeWidth={3}
                    />
                  </div>

                  {/* SUBJECT */}

                  <div className="pr-8">

                    <h2
                      className={`text-sm font-bold ${
                        isSelected
                          ? "text-blue-300"
                          : "text-white"
                      }`}
                    >
                      {subject}
                    </h2>

                    <p
                      className={`text-[10px] mt-2 ${
                        isSelected
                          ? "text-blue-200/70"
                          : "text-gray-500"
                      }`}
                    >
                      {isSelected
                        ? "Selected ✓"
                        : disabled
                        ? "Maximum reached"
                        : "Tap to select"}
                    </p>

                  </div>

                  {/* NUMBER */}

                  <div className="mt-5 pt-3 border-t border-white/[0.06]">

                    <span className="text-[9px] uppercase tracking-wider text-slate-600 font-semibold">
                      Subject {index + 1}
                    </span>

                  </div>

                </motion.button>
              );
            })

          ) : (

            <div className="col-span-full text-center text-gray-500 mt-10">

              <p className="text-lg font-semibold text-slate-400">
                No subjects found
              </p>

              <p className="text-sm text-slate-600 mt-2">
                No subjects are configured for
                this examination.
              </p>

            </div>

          )}

        </div>

      </main>

      {/* ==========================================================
         FIXED START BAR
      ========================================================== */}

      <div className="fixed bottom-5 left-1/2 -translate-x-1/2 z-40 w-[calc(100%-32px)] max-w-2xl">

        <div className="rounded-2xl border border-white/10 bg-[#07101f]/90 backdrop-blur-2xl shadow-2xl p-3">

          <div className="flex items-center gap-3">

            <div className="hidden sm:flex w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 items-center justify-center shrink-0">

              <span className="text-xs font-bold text-blue-400">
                {selected.length}/4
              </span>

            </div>

            <div className="flex-1 min-w-0">

              <p className="text-sm font-semibold text-white">

                {selected.length === 4
                  ? "Your subjects are ready"
                  : `Select ${remaining} more ${
                      remaining === 1
                        ? "subject"
                        : "subjects"
                    }`}

              </p>

              <p className="text-[10px] text-slate-500 mt-1 truncate">

                {selected.length > 0
                  ? selected.join(" • ")
                  : "Choose your subjects for this examination"}

              </p>

            </div>

            <button
              onClick={startExam}
              disabled={selected.length !== 4}
              type="button"
              className={`
                flex items-center gap-2
                px-5 py-3 rounded-xl
                text-sm font-bold
                transition-all
                ${
                  selected.length === 4
                    ? "bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-600/20"
                    : "bg-white/[0.06] text-slate-600 cursor-not-allowed"
                }
              `}
            >

              <span className="hidden sm:inline">
                Continue to Instructions
              </span>

              <span className="sm:hidden">
                Continue
              </span>

              <ArrowRight size={17} />

            </button>

          </div>

        </div>

      </div>

    </div>
  );
};

export default SubjectSelect;