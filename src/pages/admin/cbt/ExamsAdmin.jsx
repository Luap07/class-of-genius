import React, { useState } from "react";
import { Plus, Edit, Trash2 } from "lucide-react";

import AdminButton from "../../../components/admin/ui/AdminButton";

const ExamsAdmin = () => {
  const [exams] = useState([
    {
      id: 1,
      title: "WAEC Physics Mock Exam",
      subject: "Physics",
      questions: 60,
      duration: "1 Hour",
      status: "Published"
    },
    {
      id: 2,
      title: "JAMB Mathematics Practice",
      subject: "Mathematics",
      questions: 50,
      duration: "45 Minutes",
      status: "Draft"
    }
  ]);

  return (
    <div className="space-y-6">

      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">
            CBT Exams
          </h1>

          <p className="text-slate-400 mt-1">
            Create and manage online examinations.
          </p>
        </div>

        <AdminButton>
          <span className="flex items-center gap-2">
            <Plus size={18}/>
            Create Exam
          </span>
        </AdminButton>
      </div>


      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">

        <table className="w-full text-left">

          <thead className="bg-slate-800 text-slate-300">
            <tr>
              <th className="px-6 py-4">
                Exam
              </th>

              <th className="px-6 py-4">
                Subject
              </th>

              <th className="px-6 py-4">
                Questions
              </th>

              <th className="px-6 py-4">
                Duration
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
            {exams.map((exam) => (
              <tr
                key={exam.id}
                className="border-t border-slate-800 hover:bg-slate-800/50"
              >

                <td className="px-6 py-4 font-medium">
                  {exam.title}
                </td>

                <td className="px-6 py-4 text-slate-400">
                  {exam.subject}
                </td>

                <td className="px-6 py-4">
                  {exam.questions}
                </td>

                <td className="px-6 py-4">
                  {exam.duration}
                </td>

                <td className="px-6 py-4">
                  <span
                    className={`px-3 py-1 rounded-full text-xs ${
                      exam.status === "Published"
                        ? "bg-green-500/10 text-green-400"
                        : "bg-yellow-500/10 text-yellow-400"
                    }`}
                  >
                    {exam.status}
                  </span>
                </td>

                <td className="px-6 py-4">
                  <div className="flex gap-3">

                    <button className="text-blue-400">
                      <Edit size={18}/>
                    </button>

                    <button className="text-red-400">
                      <Trash2 size={18}/>
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

export default ExamsAdmin;