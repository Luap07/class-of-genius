
import React from "react";
import {
  CheckCircle2,
  Circle,
  Clock3,
  X,
} from "lucide-react";

const getQuestionId = (question, index) =>
  String(
    question?.id ??
      question?.question_id ??
      question?.uuid ??
      index
  );

const hasAnswer = (value) =>
  value !== undefined &&
  value !== null &&
  String(value).trim() !== "";

export default function CBTNavigation({
  questions = [],
  answers = {},
  markedQuestions = [],
  currentQuestionIndex = 0,
  onGoToQuestion,
  answeredCount = 0,
  unansweredCount = 0,
  onSubmit,
  mobileOpen = false,
  onCloseMobile,
  submitting = false,
}) {
  const markedSet = new Set(
    (markedQuestions || []).map((id) => String(id))
  );

  const content = (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between border-b border-white/[0.08] p-5">
        <div>
          <h3 className="font-bold text-white">Question Navigator</h3>
          <p className="mt-1 text-xs text-slate-400">
            Select a question to jump to it.
          </p>
        </div>

        {mobileOpen && (
          <button
            type="button"
            onClick={onCloseMobile}
            className="rounded-lg p-2 text-slate-400 hover:bg-white/10 hover:text-white"
            aria-label="Close question navigator"
          >
            <X className="h-5 w-5" />
          </button>
        )}
      </div>

      <div className="grid grid-cols-3 gap-2 p-4">
        <div className="rounded-xl bg-emerald-400/[0.08] p-3">
          <CheckCircle2 className="mb-2 h-4 w-4 text-emerald-400" />
          <p className="text-lg font-black text-white">{answeredCount}</p>
          <p className="text-[10px] text-slate-400">Answered</p>
        </div>

        <div className="rounded-xl bg-slate-400/[0.08] p-3">
          <Circle className="mb-2 h-4 w-4 text-slate-400" />
          <p className="text-lg font-black text-white">{unansweredCount}</p>
          <p className="text-[10px] text-slate-400">Unanswered</p>
        </div>

        <div className="rounded-xl bg-amber-400/[0.08] p-3">
          <Clock3 className="mb-2 h-4 w-4 text-amber-400" />
          <p className="text-lg font-black text-white">
            {markedSet.size}
          </p>
          <p className="text-[10px] text-slate-400">Review</p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 pb-4">
        <div className="grid grid-cols-5 gap-2">
          {questions.map((question, index) => {
            const id = getQuestionId(question, index);
            const current = index === currentQuestionIndex;
            const answered = hasAnswer(answers?.[id]);
            const marked = markedSet.has(id);

            let className =
              "border-white/[0.08] bg-white/[0.04] text-slate-300";

            if (answered) {
              className =
                "border-emerald-400/30 bg-emerald-400/10 text-emerald-300";
            }

            if (marked) {
              className =
                "border-amber-400/40 bg-amber-400/10 text-amber-300";
            }

            if (current) {
              className =
                "border-blue-400 bg-blue-600 text-white shadow-lg shadow-blue-900/30";
            }

            return (
              <button
                key={id}
                type="button"
                onClick={() => {
                  onGoToQuestion(index);
                  if (mobileOpen) onCloseMobile?.();
                }}
                aria-label={`Go to question ${index + 1}`}
                aria-current={current ? "step" : undefined}
                className={`flex aspect-square items-center justify-center rounded-xl border text-sm font-black transition hover:brightness-125 ${className}`}
              >
                {index + 1}
              </button>
            );
          })}
        </div>

        <div className="mt-6 space-y-3 border-t border-white/[0.07] pt-5">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Question status
          </p>

          <div className="flex items-center gap-2 text-xs text-slate-400">
            <span className="h-3 w-3 rounded border border-blue-400 bg-blue-600" />
            Current question
          </div>

          <div className="flex items-center gap-2 text-xs text-slate-400">
            <span className="h-3 w-3 rounded border border-emerald-400/40 bg-emerald-400/20" />
            Answered
          </div>

          <div className="flex items-center gap-2 text-xs text-slate-400">
            <span className="h-3 w-3 rounded border border-amber-400/40 bg-amber-400/20" />
            Marked for review
          </div>

          <div className="flex items-center gap-2 text-xs text-slate-400">
            <span className="h-3 w-3 rounded border border-white/20 bg-white/[0.04]" />
            Not answered
          </div>
        </div>
      </div>

      <div className="border-t border-white/[0.08] p-4">
        <div className="mb-3 flex items-center justify-between text-xs">
          <span className="text-slate-400">Completion progress</span>
          <span className="font-bold text-white">
            {questions.length
              ? Math.round((answeredCount / questions.length) * 100)
              : 0}
            %
          </span>
        </div>

        <div className="mb-4 h-2 overflow-hidden rounded-full bg-white/[0.07]">
          <div
            className="h-full rounded-full bg-emerald-500 transition-all"
            style={{
              width: `${
                questions.length
                  ? (answeredCount / questions.length) * 100
                  : 0
              }%`,
            }}
          />
        </div>

        <button
          type="button"
          onClick={onSubmit}
          disabled={submitting || questions.length === 0}
          className="w-full rounded-xl bg-emerald-600 px-4 py-3 text-sm font-black text-white transition hover:bg-emerald-500 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {submitting ? "Submitting..." : "Submit Examination"}
        </button>

        {unansweredCount > 0 && (
          <p className="mt-3 text-center text-xs leading-5 text-amber-300">
            You still have {unansweredCount} unanswered question
            {unansweredCount === 1 ? "" : "s"}.
          </p>
        )}
      </div>
    </div>
  );

  if (mobileOpen) {
    return (
      <div className="fixed inset-0 z-[100] lg:hidden">
        <button
          type="button"
          aria-label="Close navigator"
          onClick={onCloseMobile}
          className="absolute inset-0 bg-black/70"
        />

        <aside className="absolute right-0 top-0 flex h-full w-[min(90%,380px)] flex-col border-l border-white/10 bg-[#071426] shadow-2xl">
          {content}
        </aside>
      </div>
    );
  }

  return (
    <aside className="hidden h-full min-h-[620px] flex-col overflow-hidden rounded-2xl border border-white/[0.08] bg-[#071426] lg:flex">
      {content}
    </aside>
  );
}
