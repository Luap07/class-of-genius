import React from "react";
import {
  PlayCircle,
  Volume2,
  FileText,
  BookOpen,
  CheckCircle,
  ArrowRight,
} from "lucide-react";

export default function LanguageLesson() {
  return (
    <div className="space-y-8">

      {/* Header */}
      <div className="rounded-3xl border border-blue-500/20 bg-gradient-to-r from-blue-600/10 to-cyan-500/10 p-8">

        <h1 className="text-4xl font-black text-white">
          Lesson 1: Greetings
        </h1>

        <p className="mt-3 text-slate-300">
          Learn how to greet people in this language.
        </p>

      </div>

      {/* Video */}
      <div className="rounded-3xl border border-white/10 bg-slate-900 p-8">

        <div className="mb-5 flex items-center gap-3">
          <PlayCircle className="text-blue-400" />
          <h2 className="text-2xl font-bold text-white">
            Lesson Video
          </h2>
        </div>

        <div className="flex h-72 items-center justify-center rounded-2xl bg-slate-800 text-slate-500">
          Video Placeholder
        </div>

      </div>

      {/* Audio */}
      <div className="rounded-3xl border border-white/10 bg-slate-900 p-8">

        <div className="mb-5 flex items-center gap-3">
          <Volume2 className="text-green-400" />
          <h2 className="text-2xl font-bold text-white">
            Pronunciation Audio
          </h2>
        </div>

        <audio controls className="w-full" />

      </div>

      {/* Notes */}
      <div className="rounded-3xl border border-white/10 bg-slate-900 p-8">

        <div className="mb-5 flex items-center gap-3">
          <FileText className="text-yellow-400" />
          <h2 className="text-2xl font-bold text-white">
            Lesson Notes
          </h2>
        </div>

        <p className="leading-8 text-slate-300">
          This is a sample lesson note. Replace it later with content from your
          CMS.
        </p>

      </div>

      {/* Vocabulary */}
      <div className="rounded-3xl border border-white/10 bg-slate-900 p-8">

        <div className="mb-5 flex items-center gap-3">
          <BookOpen className="text-cyan-400" />
          <h2 className="text-2xl font-bold text-white">
            Vocabulary
          </h2>
        </div>

        <div className="space-y-3">

          <div className="rounded-xl bg-slate-800 p-4 text-white">
            Hello — Bonjour
          </div>

          <div className="rounded-xl bg-slate-800 p-4 text-white">
            Goodbye — Au revoir
          </div>

          <div className="rounded-xl bg-slate-800 p-4 text-white">
            Thank you — Merci
          </div>

        </div>

      </div>

      {/* Quiz */}
      <div className="rounded-3xl border border-white/10 bg-slate-900 p-8">

        <h2 className="mb-5 text-2xl font-bold text-white">
          Quick Quiz
        </h2>

        <p className="mb-6 text-slate-300">
          What does "Bonjour" mean?
        </p>

        <div className="space-y-3">

          <button className="w-full rounded-xl bg-slate-800 p-4 text-left text-white hover:bg-slate-700">
            Goodbye
          </button>

          <button className="w-full rounded-xl bg-slate-800 p-4 text-left text-white hover:bg-slate-700">
            Hello
          </button>

          <button className="w-full rounded-xl bg-slate-800 p-4 text-left text-white hover:bg-slate-700">
            Thank you
          </button>

        </div>

      </div>

      {/* Footer */}
      <div className="flex justify-between">

        <button className="flex items-center gap-2 rounded-2xl bg-green-600 px-8 py-4 font-bold text-white hover:bg-green-500">
          <CheckCircle size={20} />
          Mark Complete
        </button>

        <button className="flex items-center gap-2 rounded-2xl bg-blue-600 px-8 py-4 font-bold text-white hover:bg-blue-500">
          Next Lesson
          <ArrowRight size={20} />
        </button>

      </div>

    </div>
  );
}