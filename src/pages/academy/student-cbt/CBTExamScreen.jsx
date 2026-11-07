import React from "react";
import { AnimatePresence, motion } from "framer-motion";

import {
  CheckCircle2,
  Clock3,
  Info,
  Menu,
  ShieldCheck,
  X,
} from "lucide-react";

import CBTQuestion from "./CBTQuestion";
import CBTNavigation from "./CBTNavigation";

/* =========================================================
   SCHOLIQEN CBT EXAM SCREEN

   Props are supplied by StudentCBT.jsx.
========================================================= */

const clean = (value) =>
  value === undefined || value === null ? "" : String(value).trim();

const formatClock = (seconds) => {
  const safe = Math.max(0, Number(seconds) || 0);

  const hours = Math.floor(safe / 3600);
  const minutes = Math.floor((safe % 3600) / 60);
  const secs = safe % 60;

  return [hours, minutes, secs]
    .map((part) => String(part).padStart(2, "0"))
    .join(":");
};

export default function CBTExamScreen({
  selectedExam,
  questions,
  answers,
  currentQuestionIndex,
  currentQuestion,
  currentQuestionId,
  currentOptions,
  currentAnswer,
  markedQuestions,
  remainingSeconds,
  answeredCount,
  unansweredCount,
  saving,
  submitting,
  error,
  mobileQuestionNav,
  showSubmitConfirm,
  onSelectAnswer,
  onToggleMarked,
  onGoToQuestion,
  onToggleMobileNav,
  onCloseMobileNav,
  onShowSubmitConfirm,
  onCloseSubmitConfirm,
  onSubmit,
  onReturnToSubjects,
}) {
  const totalQuestions = questions.length;

  const questionNumber = currentQuestionIndex + 1;

  const progress = totalQuestions
    ? Math.round((answeredCount / totalQuestions) * 100)
    : 0;

  if (!currentQuestion) {
    return (
      <main className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
        <div className="rounded-2xl border border-white/[0.08] bg-[#071426]/90 p-8 text-center shadow-[0_18px_60px_rgba(0,0,0,0.22)]">
          <Info
            className="mx-auto text-amber-300"
            size={32}
          />

          <h2 className="mt-4 text-xl font-bold text-white">
            No examination question is available
          </h2>

          <p className="mt-2 text-sm leading-6 text-slate-400">
            Please return to your subjects or contact the
            Academy administrator.
          </p>

          <button
            type="button"
            onClick={onReturnToSubjects}
            className="mt-6 inline-flex min-h-12 items-center justify-center rounded-xl bg-blue-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-blue-500"
          >
            Return to Subjects
          </button>
        </div>
      </main>
    );
  }

  return (
    <>
      {/* Compact examination timer and progress area.
          The Academy's global header remains untouched. */}
      <div className="sticky top-0 z-30 border-b border-white/[0.07] bg-[#020617]/95 backdrop-blur-xl">
        <div className="mx-auto flex w-full max-w-7xl items-center justify-between gap-3 px-4 py-3 sm:px-6 lg:px-8">
          <div className="min-w-0">
            <p className="truncate text-sm font-bold text-white">
              {clean(selectedExam?.subject) || "Subject"} Examination
            </p>

            <p className="text-[11px] text-slate-500">
              Question {questionNumber} of {totalQuestions}
            </p>
          </div>

          <div className="flex items-center gap-2 sm:gap-4">
            <div className="hidden text-right sm:block">
              <p className="text-[10px] uppercase tracking-wider text-slate-500">
                Answered
              </p>

              <p className="text-sm font-bold text-slate-200">
                {answeredCount}/{totalQuestions}
              </p>
            </div>

            <div
              className={`flex items-center gap-2 rounded-xl border px-3 py-2 font-mono text-sm font-bold ${
                remainingSeconds <= 300
                  ? "border-rose-400/30 bg-rose-400/10 text-rose-200"
                  : "border-blue-400/20 bg-blue-400/[0.07] text-blue-200"
              }`}
            >
              <Clock3 size={15} />
              {formatClock(remainingSeconds)}
            </div>

            <button
              type="button"
              onClick={onToggleMobileNav}
              className="rounded-lg border border-white/10 p-2 text-slate-300 transition hover:bg-white/[0.06] lg:hidden"
              aria-label="Toggle question navigator"
            >
              <Menu size={18} />
            </button>
          </div>
        </div>

        <div className="h-1 bg-white/[0.05]">
          <div
            className="h-full bg-blue-500 transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      <main className="mx-auto grid w-full max-w-7xl gap-5 px-4 py-6 sm:px-6 lg:grid-cols-[minmax(0,1fr)_300px] lg:px-8">
        <section className="min-w-0">
          {error && (
            <div className="mb-4 flex items-start gap-2 rounded-xl border border-rose-400/20 bg-rose-400/[0.07] p-3 text-sm text-rose-200">
              <Info size={16} className="mt-0.5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <CBTQuestion
            question={currentQuestion}
            questionIndex={currentQuestionIndex}
            totalQuestions={totalQuestions}
            questionId={currentQuestionId}
            options={currentOptions}
            currentAnswer={currentAnswer}
            marked={markedQuestions.includes(currentQuestionId)}
            onToggleMarked={() => onToggleMarked(currentQuestionId)}
            onSelectAnswer={onSelectAnswer}
            onPrevious={() =>
              onGoToQuestion(currentQuestionIndex - 1)
            }
            onNext={() =>
              onGoToQuestion(currentQuestionIndex + 1)
            }
            canGoPrevious={currentQuestionIndex > 0}
            canGoNext={currentQuestionIndex < totalQuestions - 1}
            saving={saving}
            onSubmit={onShowSubmitConfirm}
          />
        </section>

        {/* Desktop question navigator */}
        <aside className="hidden lg:block">
          <div className="sticky top-24 space-y-4">
            <CBTNavigation
              questions={questions}
              answers={answers}
              markedQuestions={markedQuestions}
              currentQuestionIndex={currentQuestionIndex}
              onGoToQuestion={onGoToQuestion}
              answeredCount={answeredCount}
              unansweredCount={unansweredCount}
              onSubmit={onShowSubmitConfirm}
            />

            <div className="rounded-2xl border border-white/[0.08] bg-[#071426]/90 p-4">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400">Answered</span>

                <span className="font-bold text-emerald-300">
                  {answeredCount}
                </span>
              </div>

              <div className="mt-2 flex items-center justify-between text-xs">
                <span className="text-slate-400">Unanswered</span>

                <span className="font-bold text-amber-300">
                  {unansweredCount}
                </span>
              </div>

              <div className="mt-4 h-2 overflow-hidden rounded-full bg-white/[0.06]">
                <div
                  className="h-full rounded-full bg-emerald-400 transition-all"
                  style={{ width: `${progress}%` }}
                />
              </div>

              <button
                type="button"
                onClick={onShowSubmitConfirm}
                className="mt-5 w-full rounded-xl border border-emerald-400/20 bg-emerald-400/[0.08] px-4 py-3 text-sm font-bold text-emerald-200 transition hover:bg-emerald-400/[0.13]"
              >
                Submit Examination
              </button>
            </div>
          </div>
        </aside>

        {/* Mobile question navigator */}
        <AnimatePresence>
          {mobileQuestionNav && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-black/70 p-4 lg:hidden"
              onClick={onCloseMobileNav}
            >
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: 20, opacity: 0 }}
                onClick={(event) => event.stopPropagation()}
                className="mx-auto mt-16 max-h-[75vh] max-w-md overflow-y-auto"
              >
                <div className="mb-3 flex justify-end">
                  <button
                    type="button"
                    onClick={onCloseMobileNav}
                    className="rounded-full border border-white/10 bg-[#071426] p-2 text-white"
                    aria-label="Close question navigator"
                  >
                    <X size={18} />
                  </button>
                </div>

                <CBTNavigation
                  questions={questions}
                  answers={answers}
                  markedQuestions={markedQuestions}
                  currentQuestionIndex={currentQuestionIndex}
                  onGoToQuestion={onGoToQuestion}
                  answeredCount={answeredCount}
                  unansweredCount={unansweredCount}
                  onSubmit={() => {
                    onCloseMobileNav();
                    onShowSubmitConfirm();
                  }}
                />
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Submission confirmation */}
      <AnimatePresence>
        {showSubmitConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm"
            onClick={onCloseSubmitConfirm}
          >
            <motion.div
              initial={{ opacity: 0, y: 16, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 12 }}
              onClick={(event) => event.stopPropagation()}
              className="w-full max-w-md rounded-2xl border border-white/10 bg-[#071426] p-6 shadow-2xl"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-amber-400/20 bg-amber-400/10 text-amber-300">
                <ShieldCheck size={23} />
              </div>

              <h2 className="mt-5 text-xl font-bold text-white">
                Submit this examination?
              </h2>

              <p className="mt-2 text-sm leading-6 text-slate-400">
                You have answered {answeredCount} out of{" "}
                {totalQuestions} questions.{" "}
                {unansweredCount > 0
                  ? `${unansweredCount} question(s) are still unanswered.`
                  : "All questions have an answer."}{" "}
                Once submitted, this attempt will be completed.
              </p>

              <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={onCloseSubmitConfirm}
                  disabled={submitting}
                  className="inline-flex min-h-11 items-center justify-center rounded-xl border border-white/10 bg-white/[0.045] px-4 py-2.5 text-sm font-semibold text-slate-200 transition hover:bg-white/[0.08] disabled:opacity-40"
                >
                  Continue Exam
                </button>

                <button
                  type="button"
                  onClick={onSubmit}
                  disabled={submitting}
                  className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-emerald-500 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {submitting ? (
                    <>
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                      Submitting...
                    </>
                  ) : (
                    <>
                      Confirm Submission
                      <CheckCircle2 size={16} />
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}