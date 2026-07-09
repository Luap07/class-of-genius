import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  Layers3,
  Plus,
  Search,
  Edit,
  Trash2,
  BookOpen,
  Clock3,
  GraduationCap,
} from "lucide-react";

const sampleModules = [
  {
    id: 1,
    title: "HTML Fundamentals",
    course: "Frontend Development",
    lessons: 12,
    duration: "5 hrs",
    level: "Beginner",
  },
  {
    id: 2,
    title: "CSS Masterclass",
    course: "Frontend Development",
    lessons: 18,
    duration: "8 hrs",
    level: "Beginner",
  },
  {
    id: 3,
    title: "JavaScript ES6",
    course: "Frontend Development",
    lessons: 25,
    duration: "12 hrs",
    level: "Intermediate",
  },
  {
    id: 4,
    title: "React Fundamentals",
    course: "Frontend Development",
    lessons: 30,
    duration: "18 hrs",
    level: "Intermediate",
  },
];

const ModulesAdmin = () => {
  const [modules] = useState(sampleModules);
  const [search, setSearch] = useState("");

  const filtered = modules.filter(
    (module) =>
      module.title
        .toLowerCase()
        .includes(search.toLowerCase()) ||
      module.course
        .toLowerCase()
        .includes(search.toLowerCase())
  );

  return (
    <div className="space-y-8">

      {/* Header */}

      <div className="flex items-center justify-between">

        <div>

          <h1 className="text-4xl font-extrabold">
            Course Modules
          </h1>

          <p className="mt-2 text-slate-400">
            Organize lessons into structured modules.
          </p>

        </div>

        <button className="flex items-center gap-2 rounded-2xl bg-blue-600 px-6 py-4 font-semibold hover:bg-blue-700">

          <Plus size={20} />

          Add Module

        </button>

      </div>

      {/* Search */}

      <div className="relative max-w-md">

        <Search
          size={18}
          className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500"
        />

        <input
          value={search}
          onChange={(e) =>
            setSearch(e.target.value)
          }
          placeholder="Search module..."
          className="w-full rounded-2xl border border-slate-700 bg-slate-900 py-4 pl-12 pr-5"
        />

      </div>

      {/* Cards */}

      <div className="grid gap-6 lg:grid-cols-2">

        {filtered.map((module) => (

          <motion.div
            key={module.id}
            whileHover={{ y: -6 }}
            className="rounded-3xl border border-slate-800 bg-slate-900 p-7"
          >

            <div className="flex items-center justify-between">

              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-600">

                <Layers3 size={30} />

              </div>

              <div className="flex gap-2">

                <button className="rounded-xl bg-slate-800 p-3 hover:bg-slate-700">

                  <Edit size={18} />

                </button>

                <button className="rounded-xl bg-red-600 p-3 hover:bg-red-700">

                  <Trash2 size={18} />

                </button>

              </div>

            </div>

            <h2 className="mt-6 text-2xl font-bold">
              {module.title}
            </h2>

            <p className="mt-2 text-slate-400">
              {module.course}
            </p>

            <div className="mt-6 grid grid-cols-3 gap-4">

              <div className="rounded-xl bg-slate-950 p-4">

                <BookOpen
                  className="mb-2 text-blue-400"
                  size={18}
                />

                <p className="text-sm text-slate-400">
                  Lessons
                </p>

                <h3 className="text-xl font-bold">
                  {module.lessons}
                </h3>

              </div>

              <div className="rounded-xl bg-slate-950 p-4">

                <Clock3
                  className="mb-2 text-emerald-400"
                  size={18}
                />

                <p className="text-sm text-slate-400">
                  Duration
                </p>

                <h3 className="text-xl font-bold">
                  {module.duration}
                </h3>

              </div>

              <div className="rounded-xl bg-slate-950 p-4">

                <GraduationCap
                  className="mb-2 text-purple-400"
                  size={18}
                />

                <p className="text-sm text-slate-400">
                  Level
                </p>

                <h3 className="text-lg font-bold">
                  {module.level}
                </h3>

              </div>

            </div>

          </motion.div>

        ))}

      </div>

      {/* Table */}

      <div className="overflow-hidden rounded-3xl border border-slate-800 bg-slate-900">

        <table className="w-full">

          <thead className="bg-slate-950">

            <tr>

              <th className="p-5 text-left">
                Module
              </th>

              <th className="p-5 text-left">
                Course
              </th>

              <th className="p-5 text-left">
                Lessons
              </th>

              <th className="p-5 text-left">
                Duration
              </th>

              <th className="p-5 text-right">
                Actions
              </th>

            </tr>

          </thead>

          <tbody>

            {filtered.map((module) => (

              <tr
                key={module.id}
                className="border-t border-slate-800"
              >

                <td className="p-5 font-semibold">
                  {module.title}
                </td>

                <td className="p-5 text-slate-400">
                  {module.course}
                </td>

                <td className="p-5">
                  {module.lessons}
                </td>

                <td className="p-5">
                  {module.duration}
                </td>

                <td className="p-5">

                  <div className="flex justify-end gap-3">

                    <button className="rounded-lg bg-blue-600 px-4 py-2">

                      Edit

                    </button>

                    <button className="rounded-lg bg-red-600 px-4 py-2">

                      Delete

                    </button>

                  </div>

                </td>

              </tr>

            ))}

          </tbody>

        </table>

      </div>

    </div>
  );
};

export default ModulesAdmin;