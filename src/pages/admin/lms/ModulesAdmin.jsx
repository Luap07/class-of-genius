import React, { useState } from "react";
import {
  Layers3,
  Plus,
  Pencil,
  Trash2,
  Search,
  BookOpen,
  Clock3,
} from "lucide-react";

const initialModules = [
  {
    id: 1,
    title: "Introduction to React",
    lessons: 8,
    duration: "1h 20m",
    course: "Frontend Development",
  },
  {
    id: 2,
    title: "JavaScript Fundamentals",
    lessons: 15,
    duration: "3h 40m",
    course: "Frontend Development",
  },
  {
    id: 3,
    title: "Machine Learning Basics",
    lessons: 12,
    duration: "4h 10m",
    course: "Artificial Intelligence",
  },
  {
    id: 4,
    title: "Human Anatomy",
    lessons: 18,
    duration: "6h 15m",
    course: "Medical Sciences",
  },
];

const ModulesAdmin = () => {
  const [modules] = useState(initialModules);

  return (
    <div className="space-y-8">

      {/* Header */}

      <div className="flex items-center justify-between">

        <div>

          <h1 className="text-4xl font-bold">
            Course Modules
          </h1>

          <p className="mt-2 text-slate-400">
            Organize lessons into reusable course modules.
          </p>

        </div>

        <button
          className="flex items-center gap-2 rounded-2xl bg-blue-600 px-6 py-3 font-semibold hover:bg-blue-700"
        >
          <Plus size={18} />
          Add Module
        </button>

      </div>

      {/* Search */}

      <div className="relative">

        <Search
          size={18}
          className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
        />

        <input
          type="text"
          placeholder="Search modules..."
          className="w-full rounded-2xl border border-slate-700 bg-slate-900 py-3 pl-12 pr-4 outline-none focus:border-blue-500"
        />

      </div>

      {/* Modules */}

      <div className="grid gap-6 lg:grid-cols-2">

        {modules.map((module) => (

          <div
            key={module.id}
            className="rounded-3xl border border-slate-800 bg-slate-900 p-6"
          >

            <div className="flex items-center justify-between">

              <div className="flex items-center gap-4">

                <div className="rounded-2xl bg-blue-600 p-4">
                  <Layers3 size={28} />
                </div>

                <div>

                  <h2 className="text-xl font-bold">
                    {module.title}
                  </h2>

                  <p className="text-slate-400">
                    {module.course}
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

            <div className="mt-6 flex gap-6">

              <div className="flex items-center gap-2 text-slate-400">

                <BookOpen size={18} />

                {module.lessons} Lessons

              </div>

              <div className="flex items-center gap-2 text-slate-400">

                <Clock3 size={18} />

                {module.duration}

              </div>

            </div>

          </div>

        ))}

      </div>

    </div>
  );
};

export default ModulesAdmin;