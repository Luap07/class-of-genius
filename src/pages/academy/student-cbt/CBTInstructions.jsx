
import React, { useState } from "react";

import {
  Monitor,
  Camera,
  UserRound,
  VolumeX,
  Eye,
  BookX,
  Smartphone,
  AppWindow,
  Share2,
  ShieldCheck,
  Check,
  ArrowRight,
  X,
} from "lucide-react";

const DEFAULT_RULES = [
  {
    icon: Monitor,
    title: "Only one (1) computer monitor allowed",
    description: "Use only one computer screen during the examination.",
  },
  {
    icon: Camera,
    title: "Remain in camera's view at all times",
    description: "Keep your face visible throughout the examination.",
  },
  {
    icon: Eye,
    title: "Do not leave your testing area",
    description: "Remain seated in your examination area.",
  },
  {
    icon: BookX,
    title: "No additional learning materials",
    description: "Books, notes and other study materials are prohibited.",
  },
  {
    icon: AppWindow,
    title: "Exit all applications, including all browsers",
    description: "Close unrelated applications before starting.",
  },
  {
    icon: ShieldCheck,
    title: "Use a private and quiet test area",
    description: "Choose a quiet location where you can concentrate.",
  },
  {
    icon: VolumeX,
    title: "No interruptions or talking with others",
    description: "Do not communicate with anyone during the exam.",
  },
  {
    icon: UserRound,
    title: "Dress appropriately for a public setting",
    description: "Maintain appropriate examination conduct.",
  },
  {
    icon: Smartphone,
    title: "No mobile phones or other devices",
    description: "Keep phones and unauthorized devices away.",
  },
  {
    icon: Share2,
    title: "Sharing exam content is prohibited",
    description: "Do not copy, record or distribute examination content.",
  },
];

export default function CBTInstructions({
  examInfo,
  student,
  onBack,
  onContinue,
}) {
  const [accepted, setAccepted] = useState(false);

  const details = examInfo || {};

  const rules =
    Array.isArray(details.rules) && details.rules.length
      ? details.rules.map((rule, index) => {
          const fallback = DEFAULT_RULES[index];

          return typeof rule === "string"
            ? {
                icon: fallback?.icon || ShieldCheck,
                title: rule,
                description: "",
              }
            : {
                icon: fallback?.icon || ShieldCheck,
                title:
                  rule?.title ||
                  rule?.label ||
                  rule?.text ||
                  `Examination rule ${index + 1}`,
                description: rule?.description || "",
              };
        })
      : DEFAULT_RULES;

  return (
    <main className="mx-auto w-full max-w-5xl px-4 py-6 sm:px-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-lg font-extrabold text-white sm:text-xl">
            Exam Rules & Policies
          </h1>
          <p className="mt-1 text-xs text-slate-500">
            Please read the following rules before proceeding.
          </p>
        </div>

        <ShieldCheck size={23} className="text-blue-400" />
      </div>

      <div className="grid grid-cols-1 gap-x-10 gap-y-6 sm:grid-cols-2">
        {rules.map((rule, index) => {
          const Icon = rule.icon || ShieldCheck;

          return (
            <div
              key={`${index}-${rule.title}`}
              className="flex items-start gap-3"
            >
              <Icon
                size={19}
                className="mt-0.5 shrink-0 text-slate-400"
              />

              <div>
                <h3 className="text-xs font-bold leading-5 text-slate-200">
                  {rule.title}
                </h3>

                {rule.description && (
                  <p className="mt-1 text-[11px] leading-5 text-slate-500">
                    {rule.description}
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-8">
        <label className="flex cursor-pointer items-start gap-3">
          <input
            type="checkbox"
            checked={accepted}
            onChange={(event) => setAccepted(event.target.checked)}
            className="mt-0.5 h-4 w-4 shrink-0 accent-blue-500"
          />

          <span className="text-xs leading-5 text-slate-300">
            I have read and agree with the examination rules and
            policies above. I understand that failure to follow
            these rules may affect my examination.
          </span>
        </label>
      </div>

      <div className="mt-6 flex flex-col-reverse items-center justify-between gap-4 sm:flex-row">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-2 px-3 py-2 text-xs font-semibold text-slate-400 transition hover:text-white"
        >
          <X size={14} />
          Cancel
        </button>

        <button
          type="button"
          disabled={!accepted}
          onClick={onContinue}
          className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-lg bg-blue-600 px-6 py-3 text-xs font-bold text-white transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-40 sm:w-auto"
        >
          View Registered Subjects
          <ArrowRight size={15} />
        </button>
      </div>
    </main>
  );
}
