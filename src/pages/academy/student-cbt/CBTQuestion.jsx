
import React from "react";
import {
  ArrowLeft,
  ArrowRight,
  Bookmark,
  BookmarkCheck,
  Image as ImageIcon,
  Check,
} from "lucide-react";

/* =========================================================
   QUESTION HELPERS
========================================================= */

const clean = (value) =>
  value === undefined || value === null
    ? ""
    : String(value).trim();

const getQuestionText = (question) =>
  question?.question ??
  question?.question_text ??
  question?.text ??
  question?.content ??
  question?.title ??
  "Question text is unavailable.";

const OPTION_LABELS = [
  "A",
  "B",
  "C",
  "D",
  "E",
  "F",
  "G",
  "H",
];

const isOptionLetter = (value) =>
  /^[A-H]$/i.test(clean(value));

const normalizeAnswer = (value) =>
  clean(value).toLowerCase().replace(/\s+/g, " ");

/* =========================================================
   OPTION LABEL

   The label displayed inside the option circle.
========================================================= */

const getOptionLabel = (option, index) => {
  if (option && typeof option === "object") {
    const candidates = [
      option.key,
      option.option_key,
      option.optionKey,
      option.option_label,
      option.optionLabel,
      option.letter,
      option.label,
      option.value,
    ];

    for (const candidate of candidates) {
      const value = clean(candidate);

      if (isOptionLetter(value)) {
        return value.toUpperCase();
      }
    }
  }

  return OPTION_LABELS[index] || String(index + 1);
};

/* =========================================================
   OPTION TEXT

   IMPORTANT:
   Never use the option key as the visible answer text.

   Supports backend format:
   {
     value: "A",
     label: "Actual answer text"
   }

   Also supports:
   {
     label: "A",
     text: "Actual answer text"
   }

   And:
   {
     key: "A",
     content: "Actual answer text"
   }
========================================================= */

const getOptionText = (option) => {
  if (option === null || option === undefined) {
    return "";
  }

  if (
    typeof option === "string" ||
    typeof option === "number"
  ) {
    return String(option);
  }

  if (typeof option !== "object") {
    return "";
  }

  const candidates = [
    option.text,
    option.content,
    option.option_text,
    option.optionText,
    option.answer_text,
    option.answerText,
    option.description,
    option.name,
    option.option,
    option.label,
    option.value,
  ];

  for (const candidate of candidates) {
    const value = clean(candidate);

    if (!value) continue;

    // Ignore a standalone answer key such as A or B.
    if (isOptionLetter(value)) {
      continue;
    }

    return value;
  }

  return "";
};

/* =========================================================
   OPTION VALUE

   The value saved as the student's answer.

   Prefer A/B/C/D when available because the backend
   understands both answer keys and actual answer text.
========================================================= */

const getOptionValue = (option, index) => {
  if (option === null || option === undefined) {
    return "";
  }

  if (
    typeof option === "string" ||
    typeof option === "number"
  ) {
    return String(option);
  }

  if (typeof option !== "object") {
    return "";
  }

  const candidates = [
    option.value,
    option.key,
    option.option_key,
    option.optionKey,
    option.option_label,
    option.optionLabel,
    option.letter,
    option.label,
  ];

  // First preference: actual answer key.
  for (const candidate of candidates) {
    const value = clean(candidate);

    if (isOptionLetter(value)) {
      return value.toUpperCase();
    }
  }

  // Fallback: answer text.
  return (
    clean(option.text) ||
    clean(option.content) ||
    clean(option.option_text) ||
    clean(option.optionText) ||
    clean(option.answer_text) ||
    clean(option.answerText) ||
    clean(option.description) ||
    clean(option.option) ||
    clean(option.label) ||
    clean(option.value) ||
    clean(option.name) ||
    clean(option.id) ||
    OPTION_LABELS[index] ||
    String(index + 1)
  );
};

/* =========================================================
   SELECTED ANSWER CHECK
========================================================= */

const isOptionSelected = (
  currentAnswer,
  option,
  index
) => {
  const answer = normalizeAnswer(currentAnswer);

  if (!answer) return false;

  const values = [
    getOptionValue(option, index),
    getOptionText(option),
    getOptionLabel(option, index),
  ];

  return values.some(
    (value) =>
      normalizeAnswer(value) === answer
  );
};

/* =========================================================
   CBT QUESTION
========================================================= */

export default function CBTQuestion({
  question,
  questionIndex = 0,
  totalQuestions = 0,
  options = [],
  currentAnswer,
  marked = false,
  onToggleMarked,
  onSelectAnswer,
  onPrevious,
  onNext,
  canGoPrevious = false,
  canGoNext = false,
  saving = false,
  onSubmit,
}) {
  const passage =
    question?.passage ??
    question?.passage_text ??
    question?.comprehension ??
    question?.passage_content ??
    question?.comprehension_passage ??
    "";

  const image =
    question?.image_url ??
    question?.image ??
    question?.question_image ??
    question?.imageUrl ??
    question?.image_data ??
    "";

  const questionText = getQuestionText(question);

  const questionType = String(
    question?.question_type ??
    question?.type ??
    "objective"
  ).toLowerCase();

  const safeOptions = Array.isArray(options)
    ? options
    : [];

  /* =======================================================
     SELECT ANSWER
  ======================================================= */

  const handleSelectAnswer = (option, index) => {
    if (
      typeof onSelectAnswer !== "function" ||
      saving
    ) {
      return;
    }

    const value = getOptionValue(option, index);

    if (!value) return;

    onSelectAnswer(value);
  };

  /* =======================================================
     RENDER
  ======================================================= */

  return (
    <div className="min-w-0 space-y-5">

      {/* QUESTION HEADER */}

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-blue-300">
            Question {questionIndex + 1} of {totalQuestions}
          </p>

          <h2 className="mt-1 text-lg font-bold text-white sm:text-xl">
            Answer the question
          </h2>
        </div>

        <button
          type="button"
          onClick={onToggleMarked}
          disabled={
            typeof onToggleMarked !== "function"
          }
          className={`inline-flex items-center gap-2 rounded-xl border px-3 py-2 text-xs font-bold transition disabled:cursor-not-allowed disabled:opacity-50 ${
            marked
              ? "border-amber-400/30 bg-amber-400/10 text-amber-300"
              : "border-white/10 bg-white/[0.04] text-slate-300 hover:bg-white/[0.08]"
          }`}
        >
          {marked ? (
            <BookmarkCheck className="h-4 w-4" />
          ) : (
            <Bookmark className="h-4 w-4" />
          )}

          {marked
            ? "Marked for review"
            : "Mark for review"}
        </button>
      </div>

      {/* COMPREHENSION PASSAGE */}

      {passage && (
        <div className="rounded-2xl border border-blue-400/15 bg-blue-400/[0.05] p-5">
          <p className="mb-3 text-xs font-bold uppercase tracking-[0.15em] text-blue-300">
            Comprehension Passage
          </p>

          <div className="whitespace-pre-wrap text-sm leading-7 text-slate-300">
            {passage}
          </div>
        </div>
      )}

      {/* QUESTION BODY */}

      <div className="rounded-2xl border border-white/[0.08] bg-[#091a30] p-5 sm:p-7">
        <div className="mb-4 flex flex-wrap items-center gap-2">
          <span className="rounded-lg bg-blue-400/10 px-3 py-1.5 text-xs font-bold text-blue-300">
            Q{questionIndex + 1}
          </span>

          <span className="rounded-lg border border-white/[0.08] px-3 py-1.5 text-xs capitalize text-slate-400">
            {questionType.replace(/[_-]/g, " ")}
          </span>
        </div>

        <div className="whitespace-pre-wrap text-base font-medium leading-8 text-white sm:text-lg">
          {questionText}
        </div>

        {image && (
          <div className="mt-5 overflow-hidden rounded-xl border border-white/10 bg-[#071426]">
            <div className="flex items-center gap-2 border-b border-white/[0.07] px-4 py-2 text-xs text-slate-400">
              <ImageIcon className="h-4 w-4" />
              Question image
            </div>

            <img
              src={image}
              alt={`Question ${questionIndex + 1}`}
              className="mx-auto max-h-[420px] w-full object-contain p-3"
              loading="lazy"
            />
          </div>
        )}
      </div>

      {/* ANSWER OPTIONS */}

      <div className="space-y-3">
        <div className="flex items-center justify-between gap-3">
          <h3 className="text-sm font-bold text-white">
            Choose your answer
          </h3>

          <span className="text-xs text-slate-500">
            {safeOptions.length} options
          </span>
        </div>

        {safeOptions.length > 0 ? (
          safeOptions.map((option, index) => {
            const value = getOptionValue(
              option,
              index
            );

            const text = getOptionText(option);

            const label = getOptionLabel(
              option,
              index
            );

            const selected = isOptionSelected(
              currentAnswer,
              option,
              index
            );

            return (
              <button
                key={`${label}-${index}`}
                type="button"
                onClick={() =>
                  handleSelectAnswer(option, index)
                }
                aria-pressed={selected}
                disabled={saving || !value}
                className={`group flex w-full cursor-pointer items-start gap-4 rounded-2xl border p-4 text-left transition-all duration-200 sm:p-5 disabled:cursor-wait disabled:opacity-70 ${
                  selected
                    ? "border-blue-400/60 bg-blue-500/[0.14] shadow-[0_0_0_1px_rgba(96,165,250,0.12)]"
                    : "border-white/[0.08] bg-[#071426] hover:border-blue-400/30 hover:bg-blue-500/[0.06]"
                }`}
              >
                {/* OPTION LETTER */}

                <span
                  className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-sm font-black transition ${
                    selected
                      ? "bg-blue-500 text-white"
                      : "bg-white/[0.06] text-slate-300 group-hover:bg-blue-500/20 group-hover:text-blue-200"
                  }`}
                >
                  {label}
                </span>

                {/* ACTUAL ANSWER TEXT */}

                <span className="flex-1 whitespace-pre-wrap pt-1 text-sm leading-6 text-slate-200">
                  {text || "Answer text unavailable"}
                </span>

                {/* SELECTION INDICATOR */}

                <span
                  className={`mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border transition ${
                    selected
                      ? "border-blue-400 bg-blue-500 text-white"
                      : "border-slate-600 text-transparent group-hover:border-blue-400/50"
                  }`}
                >
                  {selected ? (
                    <Check
                      size={14}
                      strokeWidth={3}
                    />
                  ) : null}
                </span>
              </button>
            );
          })
        ) : (
          <div className="rounded-2xl border border-amber-400/20 bg-amber-400/[0.05] p-5 text-sm text-amber-200">
            No answer options were provided for this question.
          </div>
        )}
      </div>

      {/* ANSWER STATUS */}

      <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
        <span className="text-slate-500">
          {clean(currentAnswer)
            ? "Your answer has been selected."
            : "You have not selected an answer yet."}
        </span>

        {saving && (
          <span className="text-blue-300">
            Saving answer...
          </span>
        )}
      </div>

      {/* QUESTION NAVIGATION */}

      <div className="flex items-center justify-between gap-3 border-t border-white/[0.07] pt-5">
        <button
          type="button"
          onClick={onPrevious}
          disabled={
            !canGoPrevious ||
            typeof onPrevious !== "function"
          }
          className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm font-bold text-slate-300 transition hover:bg-white/[0.08] disabled:cursor-not-allowed disabled:opacity-30"
        >
          <ArrowLeft className="h-4 w-4" />
          Previous
        </button>

        <button
          type="button"
          onClick={onNext}
          disabled={
            !canGoNext ||
            typeof onNext !== "function"
          }
          className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-30"
        >
          Next Question
          <ArrowRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
