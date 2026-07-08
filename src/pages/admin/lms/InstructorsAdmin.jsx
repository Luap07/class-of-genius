import React, { useState } from "react";
import {
  UserRound,
  Search,
  Plus,
  Pencil,
  Trash2,
  BookOpen,
  Star,
  Mail,
  Phone,
} from "lucide-react";

const initialInstructors = [
  {
    id: 1,
    name: "Dr. Sarah Johnson",
    email: "sarah@scholiqen.com",
    phone: "+1 555-1234",
    courses: 12,
    students: 5421,
    rating: 4.9,
    status: "Active",
  },
  {
    id: 2,
    name: "Michael Brown",
    email: "michael@scholiqen.com",
    phone: "+1 555-3456",
    courses: 7,
    students: 3210,
    rating: 4.8,
    status: "Active",
  },
  {
    id: 3,
    name: "Prof. David Wilson",
    email: "david@scholiqen.com",
    phone: "+1 555-9876",
    courses: 15,
    students: 8750,
    rating: 5.0,
    status: "Inactive",
  },
];

const InstructorsAdmin = () => {
  const [instructors] = useState(initialInstructors);

  return (
    <div className="space-y-8">

      {/* Header */}

      <div className="flex items-center justify-between">

        <div>

          <h1 className="text-4xl font-bold">
            Instructors
          </h1>

          <p className="mt-2 text-slate-400">
            Manage instructors and assign courses.
          </p>

        </div>

        <button
          className="flex items-center gap-2 rounded-2xl bg-blue-600 px-6 py-3 font-semibold hover:bg-blue-700"
        >
          <Plus size={18} />
          Add Instructor
        </button>

      </div>

      {/* Search */}

      <div className="relative">

        <Search
          size={18}
          className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
        />

        <input
          placeholder="Search instructors..."
          className="w-full rounded-2xl border border-slate-700 bg-slate-900 py-3 pl-12 pr-4 outline-none focus:border-blue-500"
        />

      </div>

      {/* Cards */}

      <div className="grid gap-6 lg:grid-cols-2">

        {instructors.map((instructor) => (

          <div
            key={instructor.id}
            className="rounded-3xl border border-slate-800 bg-slate-900 p-6"
          >

            <div className="flex justify-between">

              <div className="flex gap-4">

                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-blue-600">

                  <UserRound size={30} />

                </div>

                <div>

                  <h2 className="text-2xl font-bold">
                    {instructor.name}
                  </h2>

                  <div className="mt-2 flex items-center gap-2 text-slate-400">

                    <Mail size={16} />

                    {instructor.email}

                  </div>

                  <div className="mt-1 flex items-center gap-2 text-slate-400">

                    <Phone size={16} />

                    {instructor.phone}

                  </div>

                </div>

              </div>

              <div>

                <span
                  className={`rounded-full px-3 py-1 text-xs font-semibold ${
                    instructor.status === "Active"
                      ? "bg-emerald-500/20 text-emerald-400"
                      : "bg-red-500/20 text-red-400"
                  }`}
                >
                  {instructor.status}
                </span>

              </div>

            </div>

            <div className="mt-8 grid grid-cols-3 gap-4">

              <div className="rounded-xl bg-slate-800 p-4 text-center">

                <BookOpen className="mx-auto mb-2" />

                <h3 className="text-xl font-bold">
                  {instructor.courses}
                </h3>

                <p className="text-sm text-slate-400">
                  Courses
                </p>

              </div>

              <div className="rounded-xl bg-slate-800 p-4 text-center">

                <UserRound className="mx-auto mb-2" />

                <h3 className="text-xl font-bold">
                  {instructor.students.toLocaleString()}
                </h3>

                <p className="text-sm text-slate-400">
                  Students
                </p>

              </div>

              <div className="rounded-xl bg-slate-800 p-4 text-center">

                <Star className="mx-auto mb-2 fill-yellow-400 text-yellow-400" />

                <h3 className="text-xl font-bold">
                  {instructor.rating}
                </h3>

                <p className="text-sm text-slate-400">
                  Rating
                </p>

              </div>

            </div>

            <div className="mt-8 flex justify-end gap-3">

              <button className="rounded-xl bg-slate-800 p-3 hover:bg-blue-600">

                <Pencil size={18} />

              </button>

              <button className="rounded-xl bg-slate-800 p-3 hover:bg-red-600">

                <Trash2 size={18} />

              </button>

            </div>

          </div>

        ))}

      </div>

    </div>
  );
};

export default InstructorsAdmin;