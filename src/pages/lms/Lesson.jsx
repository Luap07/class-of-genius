import React from "react";
import {
  ArrowLeft,
  ChevronRight,
  BookOpen,
  Clock3,
  FileText,
  Download,
  CheckCircle2,
  Brain,
  FlaskConical,
  ClipboardCheck,
} from "lucide-react";

import LessonCard from "../../components/lms/LessonCard";

const lessons = [
  {
    id: 1,
    title: "Introduction to Motion",
    description: "Understand displacement, distance, speed and velocity.",
    duration: "18 mins",
    completed: true,
    pdf: true,
  },
  {
    id: 2,
    title: "Newton's First Law",
    description: "Learn inertia and balanced forces.",
    duration: "24 mins",
    completed: true,
    pdf: true,
  },
  {
    id: 3,
    title: "Newton's Second Law",
    description: "Relationship between force, mass and acceleration.",
    duration: "30 mins",
    completed: false,
    pdf: true,
  },
  {
    id: 4,
    title: "Newton's Third Law",
    description: "Action and reaction forces.",
    duration: "25 mins",
    completed: false,
    pdf: false,
  },
  {
    id: 5,
    title: "Momentum",
    description: "Conservation of momentum and collisions.",
    duration: "28 mins",
    completed: false,
    locked: true,
    pdf: false,
  },
];

const Lesson = () => {
  return (
    <div className="space-y-8">

      {/* Breadcrumb */}
      <div className="flex items-center gap-3 text-slate-400">

        <button className="hover:text-white">
          <ArrowLeft size={20} />
        </button>

        <span>Courses</span>

        <ChevronRight size={16} />

        <span>Physics</span>

        <ChevronRight size={16} />

        <span className="text-white">
          Mechanics
        </span>

      </div>

      {/* Hero */}
      <div className="rounded-3xl bg-gradient-to-r from-blue-700 via-indigo-700 to-purple-700 p-10">

        <h1 className="text-4xl font-bold">
          Mechanics
        </h1>

        <p className="mt-4 text-blue-100 max-w-4xl">

          Learn the fundamentals of mechanics through
          interactive lessons, downloadable notes,
          practical activities and assessments.

        </p>

        <div className="flex flex-wrap gap-8 mt-8">

          <div className="flex items-center gap-2">

            <BookOpen size={18} />

            18 Lessons

          </div>

          <div className="flex items-center gap-2">

            <Clock3 size={18} />

            8 Hours

          </div>

          <div className="flex items-center gap-2">

            <CheckCircle2 size={18} />

            Beginner

          </div>

        </div>

      </div>

      {/* Learning Tools */}

      <div className="grid md:grid-cols-2 xl:grid-cols-4 gap-6">

        <button className="rounded-3xl bg-slate-900 border border-slate-800 p-8 hover:border-blue-500 transition">

          <Brain size={40} className="text-blue-500" />

          <h2 className="text-xl font-bold mt-5">
            AI Tutor
          </h2>

          <p className="mt-3 text-slate-400">
            Ask questions about this lesson.
          </p>

        </button>

        <button className="rounded-3xl bg-slate-900 border border-slate-800 p-8 hover:border-emerald-500 transition">

          <FlaskConical size={40} className="text-emerald-500" />

          <h2 className="text-xl font-bold mt-5">
            Virtual Lab
          </h2>

          <p className="mt-3 text-slate-400">
            Perform related experiments.
          </p>

        </button>

        <button className="rounded-3xl bg-slate-900 border border-slate-800 p-8 hover:border-orange-500 transition">

          <ClipboardCheck
            size={40}
            className="text-orange-500"
          />

          <h2 className="text-xl font-bold mt-5">
            CBT Practice
          </h2>

          <p className="mt-3 text-slate-400">
            Test your understanding.
          </p>

        </button>

        <button className="rounded-3xl bg-slate-900 border border-slate-800 p-8 hover:border-cyan-500 transition">

          <Download
            size={40}
            className="text-cyan-500"
          />

          <h2 className="text-xl font-bold mt-5">
            Download Notes
          </h2>

          <p className="mt-3 text-slate-400">
            Save lesson materials offline.
          </p>

        </button>

      </div>

      {/* Lessons */}

      <div>

        <h2 className="text-3xl font-bold mb-8">

          Lesson List

        </h2>

        <div className="space-y-6">

          {lessons.map((lesson) => (

            <LessonCard
              key={lesson.id}
              {...lesson}
            />

          ))}

        </div>

      </div>

      {/* PDF */}

      <div className="rounded-3xl bg-slate-900 border border-slate-800 p-8">

        <div className="flex items-center gap-3">

          <FileText className="text-blue-500" />

          <h2 className="text-2xl font-bold">

            Lesson Notes

          </h2>

        </div>

        <p className="mt-4 text-slate-400">

          PDF notes will be displayed using
          your PDFViewer component.

        </p>

      </div>

    </div>
  );
};

export default Lesson;