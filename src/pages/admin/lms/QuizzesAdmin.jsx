import React, { useState } from "react";
import { Plus, Edit, Trash2 } from "lucide-react";

import AdminButton from "../../../components/admin/ui/AdminButton";

const QuizzesAdmin = () => {
  const [quizzes] = useState([
    {
      id: 1,
      title: "Mechanics Quiz",
      course: "Physics Master Class",
      questions: 25,
      attempts: 560,
      status: "Published"
    },
    {
      id: 2,
      title: "Algebra Test",
      course: "Advanced Mathematics",
      questions: 20,
      attempts: 320,
      status: "Draft"
    }
  ]);

  return (
    <div className="space-y-6">

      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">
            Quizzes Management
          </h1>

          <p className="text-slate-400 mt-1">
            Create and manage course quizzes.
          </p>
        </div>

        <AdminButton>
          <span className="flex items-center gap-2">
            <Plus size={18} />
            Create Quiz
          </span>
        </AdminButton>
      </div>


      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">

        <table className="w-full text-left">

          <thead className="bg-slate-800 text-slate-300">
            <tr>
              <th className="px-6 py-4">
                Quiz
              </th>

              <th className="px-6 py-4">
                Course
              </th>

              <th className="px-6 py-4">
                Questions
              </th>

              <th className="px-6 py-4">
                Attempts
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
            {quizzes.map((quiz) => (
              <tr
                key={quiz.id}
                className="border-t border-slate-800 hover:bg-slate-800/50"
              >

                <td className="px-6 py-4 font-medium">
                  {quiz.title}
                </td>

                <td className="px-6 py-4 text-slate-400">
                  {quiz.course}
                </td>

                <td className="px-6 py-4">
                  {quiz.questions}
                </td>

                <td className="px-6 py-4">
                  {quiz.attempts}
                </td>

                <td className="px-6 py-4">
                  <span
                    className={`px-3 py-1 rounded-full text-xs ${
                      quiz.status === "Published"
                        ? "bg-green-500/10 text-green-400"
                        : "bg-yellow-500/10 text-yellow-400"
                    }`}
                  >
                    {quiz.status}
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

export default QuizzesAdmin;