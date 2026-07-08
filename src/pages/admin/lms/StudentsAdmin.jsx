import React, { useState } from "react";
import {
  Users,
  Search,
  Eye,
  Ban,
  Award,
  BookOpen,
  TrendingUp,
} from "lucide-react";

const initialStudents = [
  {
    id: 1,
    name: "John Doe",
    email: "john@example.com",
    enrolled: 6,
    completed: 4,
    certificates: 3,
    progress: 78,
    status: "Active",
  },
  {
    id: 2,
    name: "Mary Johnson",
    email: "mary@example.com",
    enrolled: 2,
    completed: 1,
    certificates: 1,
    progress: 52,
    status: "Active",
  },
  {
    id: 3,
    name: "David Smith",
    email: "david@example.com",
    enrolled: 9,
    completed: 8,
    certificates: 7,
    progress: 96,
    status: "Suspended",
  },
];

const StudentsAdmin = () => {
  const [students] = useState(initialStudents);

  return (
    <div className="space-y-8">

      {/* Header */}

      <div className="flex items-center justify-between">

        <div>

          <h1 className="text-4xl font-bold">
            Students
          </h1>

          <p className="mt-2 text-slate-400">
            Manage all enrolled learners.
          </p>

        </div>

      </div>

      {/* Search */}

      <div className="relative">

        <Search
          size={18}
          className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
        />

        <input
          placeholder="Search students..."
          className="w-full rounded-2xl border border-slate-700 bg-slate-900 py-3 pl-12 pr-4 outline-none focus:border-blue-500"
        />

      </div>

      {/* Table */}

      <div className="overflow-hidden rounded-3xl border border-slate-800 bg-slate-900">

        <table className="w-full">

          <thead className="bg-slate-800">

            <tr>

              <th className="p-4 text-left">Student</th>

              <th className="p-4 text-left">Courses</th>

              <th className="p-4 text-left">Completed</th>

              <th className="p-4 text-left">Certificates</th>

              <th className="p-4 text-left">Progress</th>

              <th className="p-4 text-left">Status</th>

              <th className="p-4 text-right">Actions</th>

            </tr>

          </thead>

          <tbody>

            {students.map((student) => (

              <tr
                key={student.id}
                className="border-t border-slate-800"
              >

                <td className="p-4">

                  <h3 className="font-semibold">
                    {student.name}
                  </h3>

                  <p className="text-sm text-slate-400">
                    {student.email}
                  </p>

                </td>

                <td className="p-4">

                  <div className="flex items-center gap-2">

                    <BookOpen size={16} />

                    {student.enrolled}

                  </div>

                </td>

                <td className="p-4">
                  {student.completed}
                </td>

                <td className="p-4">

                  <div className="flex items-center gap-2">

                    <Award size={16} />

                    {student.certificates}

                  </div>

                </td>

                <td className="p-4">

                  <div className="flex items-center gap-2">

                    <TrendingUp size={16} />

                    {student.progress}%

                  </div>

                </td>

                <td className="p-4">

                  <span
                    className={`rounded-full px-3 py-1 text-xs font-semibold ${
                      student.status === "Active"
                        ? "bg-emerald-500/20 text-emerald-400"
                        : "bg-red-500/20 text-red-400"
                    }`}
                  >
                    {student.status}
                  </span>

                </td>

                <td className="p-4">

                  <div className="flex justify-end gap-2">

                    <button className="rounded-xl bg-slate-800 p-2 hover:bg-blue-600">

                      <Eye size={18} />

                    </button>

                    <button className="rounded-xl bg-slate-800 p-2 hover:bg-red-600">

                      <Ban size={18} />

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

export default StudentsAdmin;