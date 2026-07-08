import React, { useState } from "react";
import {
  BookOpen,
  PlayCircle,
  FileText,
  HelpCircle,
  Download,
  Search,
  Plus,
  Pencil,
  Trash2,
  Clock3,
} from "lucide-react";

const initialLessons = [
  {
    id: 1,
    title: "Introduction to HTML",
    module: "Frontend Development",
    type: "Video",
    duration: "12 min",
  },
  {
    id: 2,
    title: "HTML Notes",
    module: "Frontend Development",
    type: "PDF",
    duration: "-",
  },
  {
    id: 3,
    title: "CSS Quiz",
    module: "Frontend Development",
    type: "Quiz",
    duration: "15 min",
  },
  {
    id: 4,
    title: "JavaScript Assignment",
    module: "JavaScript",
    type: "Assignment",
    duration: "30 min",
  },
];

const getIcon = (type) => {
  switch (type) {
    case "Video":
      return <PlayCircle size={22} className="text-blue-400" />;
    case "PDF":
      return <FileText size={22} className="text-red-400" />;
    case "Quiz":
      return <HelpCircle size={22} className="text-yellow-400" />;
    case "Assignment":
      return <Download size={22} className="text-emerald-400" />;
    default:
      return <BookOpen size={22} />;
  }
};

const LessonsAdmin = () => {
  const [lessons] = useState(initialLessons);

  return (
    <div className="space-y-8">

      {/* Header */}

      <div className="flex items-center justify-between">

        <div>

          <h1 className="text-4xl font-bold">
            Lesson Manager
          </h1>

          <p className="mt-2 text-slate-400">
            Manage videos, PDFs, quizzes and assignments.
          </p>

        </div>

        <button className="flex items-center gap-2 rounded-2xl bg-blue-600 px-6 py-3 font-semibold hover:bg-blue-700">

          <Plus size={18} />

          Add Lesson

        </button>

      </div>

      {/* Search */}

      <div className="relative">

        <Search
          size={18}
          className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
        />

        <input
          placeholder="Search lessons..."
          className="w-full rounded-2xl border border-slate-700 bg-slate-900 py-3 pl-12 pr-4 outline-none focus:border-blue-500"
        />

      </div>

      {/* Lessons */}

      <div className="space-y-5">

        {lessons.map((lesson) => (

          <div
            key={lesson.id}
            className="rounded-3xl border border-slate-800 bg-slate-900 p-6"
          >

            <div className="flex items-center justify-between">

              <div className="flex items-center gap-4">

                {getIcon(lesson.type)}

                <div>

                  <h2 className="text-xl font-bold">
                    {lesson.title}
                  </h2>

                  <p className="text-slate-400">
                    {lesson.module}
                  </p>

                </div>

              </div>

              <div className="flex gap-2">

                <button className="rounded-xl bg-slate-800 p-3 hover:bg-blue-600">
                  <Pencil size={18} />
                </button>

                <button className="rounded-xl bg-slate-800 p-3 hover:bg-red-600">
                  <Trash2 size={18} />
                </button>

              </div>

            </div>

            <div className="mt-6 flex flex-wrap gap-6 text-slate-400">

              <div className="flex items-center gap-2">

                <BookOpen size={18} />

                {lesson.type}

              </div>

              <div className="flex items-center gap-2">

                <Clock3 size={18} />

                {lesson.duration}

              </div>

            </div>

          </div>

        ))}

      </div>

    </div>
  );
};

export default LessonsAdmin;