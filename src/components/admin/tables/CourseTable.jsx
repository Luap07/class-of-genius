import React, { useState } from "react";
import {
  Eye,
  Edit,
  Trash2,
  MoreVertical,
  Star,
  Users,
  BookOpen,
  CheckCircle2,
} from "lucide-react";

const badgeStyles = {
  Published:
    "bg-green-500/20 text-green-400 border border-green-500/30",

  Draft:
    "bg-yellow-500/20 text-yellow-400 border border-yellow-500/30",

  Archived:
    "bg-red-500/20 text-red-400 border border-red-500/30",
};

const CourseTable = ({
  courses = [],
  selectedCourses = [],
  onSelect,
  onSelectAll,
  onView,
  onEdit,
  onDelete,
}) => {
  const [activeMenu, setActiveMenu] = useState(null);

  return (
    <div className="overflow-hidden rounded-3xl border border-slate-800 bg-slate-900">

      <div className="overflow-x-auto">

        <table className="min-w-full">

          {/* ================= HEADER ================= */}

          <thead className="bg-slate-950 border-b border-slate-800">

            <tr>

              <th className="px-5 py-4">

                <input
                  type="checkbox"
                  checked={
                    courses.length > 0 &&
                    selectedCourses.length === courses.length
                  }
                  onChange={onSelectAll}
                  className="h-4 w-4 rounded"
                />

              </th>

              <th className="px-5 py-4 text-left text-sm font-semibold text-slate-300">
                Course
              </th>

              <th className="px-5 py-4 text-left text-sm font-semibold text-slate-300">
                Instructor
              </th>

              <th className="px-5 py-4 text-left text-sm font-semibold text-slate-300">
                Category
              </th>

              <th className="px-5 py-4 text-center text-sm font-semibold text-slate-300">
                Students
              </th>

              <th className="px-5 py-4 text-center text-sm font-semibold text-slate-300">
                Lessons
              </th>

              <th className="px-5 py-4 text-center text-sm font-semibold text-slate-300">
                Rating
              </th>

              <th className="px-5 py-4 text-center text-sm font-semibold text-slate-300">
                Price
              </th>

              <th className="px-5 py-4 text-center text-sm font-semibold text-slate-300">
                Status
              </th>

              <th className="px-5 py-4 text-center text-sm font-semibold text-slate-300">
                Featured
              </th>

              <th className="px-5 py-4 text-right text-sm font-semibold text-slate-300">
                Actions
              </th>

            </tr>

          </thead>

          {/* ================= BODY ================= */}

          <tbody>

            {courses.map((course) => (

              <tr
                key={course.id}
                className="border-b border-slate-800 hover:bg-slate-800/30 transition"
              >

                {/* Checkbox */}

                <td className="px-5 py-5">

                  <input
                    type="checkbox"
                    checked={selectedCourses.includes(course.id)}
                    onChange={() => onSelect(course.id)}
                    className="h-4 w-4 rounded"
                  />

                </td>

                {/* Course */}

                <td className="px-5 py-5">

                  <div className="flex items-center gap-4">

                    <img
                      src={course.thumbnail}
                      alt={course.title}
                      className="h-16 w-24 rounded-xl object-cover"
                    />

                    <div>

                      <h3 className="font-semibold text-white">

                        {course.title}

                      </h3>

                      <p className="mt-1 text-xs text-slate-400">

                        {course.level}

                      </p>

                    </div>

                  </div>

                </td>

                {/* Instructor */}

                <td className="px-5 py-5">

                  <p className="font-medium">

                    {course.instructor}

                  </p>

                </td>

                {/* Category */}

                <td className="px-5 py-5">

                  <span className="rounded-full bg-blue-500/20 px-3 py-1 text-xs text-blue-300">

                    {course.category}

                  </span>

                </td>
                                {/* ================= Students ================= */}

                <td className="px-5 py-5 text-center">

                  <div className="inline-flex items-center gap-2 rounded-xl bg-slate-800 px-3 py-2">

                    <Users
                      size={16}
                      className="text-blue-400"
                    />

                    <span className="font-medium">
                      {course.students.toLocaleString()}
                    </span>

                  </div>

                </td>

                {/* ================= Lessons ================= */}

                <td className="px-5 py-5 text-center">

                  <div className="inline-flex items-center gap-2 rounded-xl bg-slate-800 px-3 py-2">

                    <BookOpen
                      size={16}
                      className="text-violet-400"
                    />

                    <span className="font-medium">
                      {course.lessons}
                    </span>

                  </div>

                </td>

                {/* ================= Rating ================= */}

                <td className="px-5 py-5 text-center">

                  <div className="inline-flex items-center gap-2 rounded-xl bg-yellow-500/10 px-3 py-2">

                    <Star
                      size={16}
                      className="fill-yellow-400 text-yellow-400"
                    />

                    <span className="font-semibold">

                      {course.rating}

                    </span>

                  </div>

                </td>

                {/* ================= Price ================= */}

                <td className="px-5 py-5 text-center">

                  <span className="font-bold text-emerald-400">

                    ${course.price}

                  </span>

                </td>

                {/* ================= Status ================= */}

                <td className="px-5 py-5 text-center">

                  <span
                    className={`rounded-full px-4 py-2 text-xs font-semibold ${badgeStyles[course.status]}`}
                  >

                    {course.status}

                  </span>

                </td>

                {/* ================= Featured ================= */}

                <td className="px-5 py-5 text-center">

                  {course.featured ? (

                    <CheckCircle2
                      size={20}
                      className="mx-auto text-green-400"
                    />

                  ) : (

                    <span className="text-slate-500">

                      —

                    </span>

                  )}

                </td>

                {/* ================= Actions ================= */}

                <td className="relative px-5 py-5 text-right">

                  <button
                    onClick={() =>
                      setActiveMenu(
                        activeMenu === course.id
                          ? null
                          : course.id
                      )
                    }
                    className="rounded-lg p-2 hover:bg-slate-800 transition"
                  >

                    <MoreVertical size={18} />

                  </button>

                  {activeMenu === course.id && (

                    <div className="absolute right-5 top-14 z-20 w-48 overflow-hidden rounded-2xl border border-slate-700 bg-slate-900 shadow-2xl">

                      <button
                        onClick={() => {
                          onView(course);
                          setActiveMenu(null);
                        }}
                        className="flex w-full items-center gap-3 px-5 py-3 hover:bg-slate-800 transition"
                      >

                        <Eye size={18} />

                        View

                      </button>

                      <button
                        onClick={() => {
                          onEdit(course);
                          setActiveMenu(null);
                        }}
                        className="flex w-full items-center gap-3 px-5 py-3 hover:bg-slate-800 transition"
                      >

                        <Edit size={18} />

                        Edit

                      </button>

                      <button
                        onClick={() => {
                          onDelete(course);
                          setActiveMenu(null);
                        }}
                        className="flex w-full items-center gap-3 px-5 py-3 text-red-400 hover:bg-red-500/10 transition"
                      >

                        <Trash2 size={18} />

                        Delete

                      </button>

                    </div>

                  )}

                </td>

              </tr>

            ))}
                        {/* ================= EMPTY STATE ================= */}

            {courses.length === 0 && (

              <tr>

                <td
                  colSpan={11}
                  className="px-6 py-16 text-center"
                >

                  <div className="flex flex-col items-center">

                    <BookOpen
                      size={60}
                      className="text-slate-600"
                    />

                    <h2 className="mt-5 text-2xl font-bold text-white">
                      No Courses Found
                    </h2>

                    <p className="mt-2 max-w-md text-slate-400">
                      There are currently no courses available.
                      Create your first course to get started.
                    </p>

                  </div>

                </td>

              </tr>

            )}

          </tbody>

        </table>

      </div>

    </div>

  );
};

export default CourseTable;