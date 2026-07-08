import React, { useState } from "react";
import {
  Route,
  Search,
  Plus,
  Pencil,
  Trash2,
  BookOpen,
  GraduationCap,
  Users,
} from "lucide-react";

const initialPaths = [
  {
    id: 1,
    title: "Frontend Developer",
    courses: 8,
    students: 5420,
    level: "Beginner → Advanced",
  },
  {
    id: 2,
    title: "Artificial Intelligence Engineer",
    courses: 12,
    students: 3841,
    level: "Intermediate",
  },
  {
    id: 3,
    title: "Medical Sciences",
    courses: 26,
    students: 2156,
    level: "University",
  },
  {
    id: 4,
    title: "Business Management",
    courses: 10,
    students: 1784,
    level: "Professional",
  },
];

const LearningPathsAdmin = () => {
  const [paths] = useState(initialPaths);

  return (
    <div className="space-y-8">

      {/* Header */}

      <div className="flex items-center justify-between">

        <div>

          <h1 className="text-4xl font-bold">
            Learning Paths
          </h1>

          <p className="mt-2 text-slate-400">
            Create guided roadmaps made up of multiple courses.
          </p>

        </div>

        <button className="flex items-center gap-2 rounded-2xl bg-blue-600 px-6 py-3 font-semibold hover:bg-blue-700">

          <Plus size={18} />

          New Learning Path

        </button>

      </div>

      {/* Search */}

      <div className="relative">

        <Search
          size={18}
          className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
        />

        <input
          placeholder="Search learning paths..."
          className="w-full rounded-2xl border border-slate-700 bg-slate-900 py-3 pl-12 pr-4 outline-none focus:border-blue-500"
        />

      </div>

      {/* Cards */}

      <div className="grid gap-6 lg:grid-cols-2">

        {paths.map((path) => (

          <div
            key={path.id}
            className="rounded-3xl border border-slate-800 bg-slate-900 p-6"
          >

            <div className="flex justify-between">

              <div className="flex items-center gap-4">

                <div className="rounded-2xl bg-indigo-600 p-4">

                  <Route size={28} />

                </div>

                <div>

                  <h2 className="text-2xl font-bold">
                    {path.title}
                  </h2>

                  <p className="text-slate-400">
                    {path.level}
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

            <div className="mt-8 flex flex-wrap gap-6 text-slate-400">

              <div className="flex items-center gap-2">

                <BookOpen size={18} />

                {path.courses} Courses

              </div>

              <div className="flex items-center gap-2">

                <Users size={18} />

                {path.students.toLocaleString()} Students

              </div>

              <div className="flex items-center gap-2">

                <GraduationCap size={18} />

                Guided Path

              </div>

            </div>

          </div>

        ))}

      </div>

    </div>
  );
};

export default LearningPathsAdmin;