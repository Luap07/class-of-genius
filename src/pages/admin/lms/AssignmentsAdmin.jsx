import React, { useState } from "react";
import { Plus, Edit, Trash2 } from "lucide-react";

import AdminButton from "../../../components/admin/ui/AdminButton";

const AssignmentsAdmin = () => {
  const [assignments] = useState([
    {
      id: 1,
      title: "Physics Lab Report",
      course: "Physics Master Class",
      submissions: 340,
      status: "Active"
    },
    {
      id: 2,
      title: "Algebra Practice",
      course: "Advanced Mathematics",
      submissions: 210,
      status: "Closed"
    }
  ]);

  return (
    <div className="space-y-6">

      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">
            Assignments
          </h1>

          <p className="text-slate-400 mt-1">
            Manage student assignments and submissions.
          </p>
        </div>

        <AdminButton>
          <span className="flex items-center gap-2">
            <Plus size={18} />
            Create Assignment
          </span>
        </AdminButton>
      </div>


      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">

        <table className="w-full text-left">

          <thead className="bg-slate-800 text-slate-300">
            <tr>
              <th className="px-6 py-4">
                Assignment
              </th>

              <th className="px-6 py-4">
                Course
              </th>

              <th className="px-6 py-4">
                Submissions
              </th>

              <th className="px-6 py-4">
                Status
              </th>

              <th className="px-6 py-4">
                Actions
              </th>
            </tr>
          </thead>


          <tbody>
            {assignments.map((item) => (
              <tr
                key={item.id}
                className="border-t border-slate-800 hover:bg-slate-800/50"
              >

                <td className="px-6 py-4 font-medium">
                  {item.title}
                </td>

                <td className="px-6 py-4 text-slate-400">
                  {item.course}
                </td>

                <td className="px-6 py-4">
                  {item.submissions}
                </td>

                <td className="px-6 py-4">
                  <span
                    className={`px-3 py-1 rounded-full text-xs ${
                      item.status === "Active"
                        ? "bg-green-500/10 text-green-400"
                        : "bg-red-500/10 text-red-400"
                    }`}
                  >
                    {item.status}
                  </span>
                </td>

                <td className="px-6 py-4">
                  <div className="flex gap-3">

                    <button className="text-blue-400">
                      <Edit size={18} />
                    </button>

                    <button className="text-red-400">
                      <Trash2 size={18} />
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

export default AssignmentsAdmin;